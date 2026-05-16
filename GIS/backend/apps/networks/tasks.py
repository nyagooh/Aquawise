import json
import logging
import os
import tempfile
import zipfile

import fiona
from celery import shared_task
from django.contrib.gis.geos import GEOSGeometry, MultiLineString, MultiPolygon
from django.db import connection
from django.utils import timezone
from pyproj import CRS as ProjCRS
from pyproj import Transformer
from shapely import from_geojson, to_geojson
from shapely.ops import transform

from .models import NetworkUpload, Node, Pipe, WaterNetwork, Zone

logger = logging.getLogger(__name__)

ROUGHNESS_DEFAULTS = {
    "PVC": 150.0,
    "GI": 100.0,
    "STEEL": 95.0,
    "HDPE": 140.0,
    "PPR": 140.0,
    "CI": 130.0,
    "AC": 120.0,
}

_MATERIAL_MAP = {
    "PVC": "PVC", "GI": "GI", "GALVANIZED": "GI", "GALVANISED": "GI",
    "HDPE": "HDPE", "STEEL": "Steel", "PPR": "PPR",
    "CI": "CI", "CAST IRON": "CI", "AC": "AC", "ASBESTOS": "AC",
}

_MATERIAL_FIELDS = ["material", "mat", "pipe_mat", "matl", "material_t"]
_DIAMETER_FIELDS = ["diameter", "diam", "dia", "diameter_mm", "pipe_diam", "width"]
_STATUS_FIELDS = ["status", "stat", "pipe_stat", "condition"]
_EXT_ID_FIELDS = ["id", "fid", "pipe_id", "node_id", "external_id", "objectid", "gid", "pipeid"]
_NODE_TYPE_FIELDS = ["node_type", "type", "feature_ty", "node_t", "feature"]
_ELEVATION_FIELDS = ["elevation", "elev", "z", "altitude", "elevation_m"]
_YEAR_FIELDS = ["year", "install_yr", "installation_year", "year_inst"]
_ZONE_NAME_FIELDS = ["name", "zone_name", "dma_name", "zone", "district", "label"]
_ZONE_CODE_FIELDS = ["code", "zone_code", "dma_code", "dma_id"]


def _find_field(props, candidates):
    keys_lower = {k.lower(): k for k in props}
    for c in candidates:
        if c.lower() in keys_lower:
            return keys_lower[c.lower()]
    return None


def _is_wgs84(crs):
    try:
        return ProjCRS.from_user_input(crs).equals("EPSG:4326")
    except Exception:
        return False


def _make_transformer(crs_wkt):
    return Transformer.from_crs(crs_wkt, "EPSG:4326", always_xy=True)


def _reproject(geom_dict, transformer):
    shape = from_geojson(json.dumps(geom_dict))
    reprojected = transform(transformer.transform, shape)
    return json.loads(to_geojson(reprojected))


def _to_float(val):
    try:
        return float(val) if val is not None else None
    except (ValueError, TypeError):
        return None


def _to_int(val):
    try:
        return int(val) if val is not None else None
    except (ValueError, TypeError):
        return None


def _normalize_material(val):
    v = str(val or "").strip().upper()
    return _MATERIAL_MAP.get(v, Pipe.Material.UNKNOWN)


def _normalize_pipe_status(val):
    v = str(val or "").strip().lower()
    if v in ("closed",):
        return Pipe.Status.CLOSED
    if v in ("out_of_service", "decommissioned", "abandoned"):
        return Pipe.Status.OUT_OF_SERVICE
    return Pipe.Status.OPEN


def _normalize_node_type(val):
    v = str(val or "").strip().lower()
    if "reservoir" in v:
        return Node.NodeType.RESERVOIR
    if "tank" in v:
        return Node.NodeType.TANK
    if "meter" in v:
        return Node.NodeType.METER
    return Node.NodeType.JUNCTION


@shared_task(bind=True)
def ingest_shapefile(self, upload_id: str):
    try:
        upload = NetworkUpload.objects.get(id=upload_id)
    except NetworkUpload.DoesNotExist:
        logger.error("NetworkUpload %s not found", upload_id)
        return

    upload.status = NetworkUpload.Status.PROCESSING
    upload.save(update_fields=["status"])

    network = None
    warnings = []

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            with zipfile.ZipFile(upload.file_path) as zf:
                zf.extractall(tmpdir)

            shp_files = [
                os.path.join(root, f)
                for root, _, files in os.walk(tmpdir)
                for f in files
                if f.lower().endswith(".shp")
            ]
            if not shp_files:
                raise ValueError("No .shp files found in ZIP archive")

            line_layers, point_layers, polygon_layers = [], [], []
            for shp_path in shp_files:
                with fiona.open(shp_path) as src:
                    gt = (src.schema.get("geometry") or "").lower()
                    if "line" in gt:
                        line_layers.append(shp_path)
                    elif "point" in gt:
                        point_layers.append(shp_path)
                    elif "polygon" in gt:
                        polygon_layers.append(shp_path)

            network_name = upload.file_name.rsplit(".", 1)[0].replace("_", " ").title()
            network = WaterNetwork.objects.create(
                organisation=upload.organisation,
                project=upload.project,
                upload=upload,
                name=network_name,
                source_crs="",
            )

            # --- Zones (polygons) ---
            for shp_path in polygon_layers:
                with fiona.open(shp_path) as src:
                    needs_reproject = not _is_wgs84(src.crs)
                    transformer = _make_transformer(src.crs_wkt) if needs_reproject else None
                    if not network.source_crs:
                        network.source_crs = src.crs_wkt[:50]

                    zones = []
                    for feat in src:
                        if not feat["geometry"]:
                            continue
                        geom_dict = feat["geometry"]
                        if needs_reproject:
                            geom_dict = _reproject(geom_dict, transformer)
                        geos = GEOSGeometry(json.dumps(geom_dict))
                        if geos.geom_type == "Polygon":
                            geos = MultiPolygon(geos)
                        props = feat["properties"] or {}
                        name_f = _find_field(props, _ZONE_NAME_FIELDS)
                        code_f = _find_field(props, _ZONE_CODE_FIELDS)
                        zones.append(Zone(
                            network=network,
                            name=str(props.get(name_f) if name_f else f"Zone {feat['id']}"),
                            code=str(props.get(code_f, "") if code_f else "")[:20],
                            geometry=geos,
                        ))
                    Zone.objects.bulk_create(zones, batch_size=500)
                    if not zones:
                        warnings.append(f"{os.path.basename(shp_path)}: no valid polygon features")

            # --- Pipes (lines) ---
            total_pipes = 0
            _pipe_known = {f for group in [
                _MATERIAL_FIELDS, _DIAMETER_FIELDS, _STATUS_FIELDS,
                _EXT_ID_FIELDS, _YEAR_FIELDS,
            ] for f in group}

            for shp_path in line_layers:
                with fiona.open(shp_path) as src:
                    needs_reproject = not _is_wgs84(src.crs)
                    transformer = _make_transformer(src.crs_wkt) if needs_reproject else None
                    if not network.source_crs:
                        network.source_crs = src.crs_wkt[:50]

                    pipes = []
                    for feat in src:
                        if not feat["geometry"]:
                            continue
                        geom_dict = feat["geometry"]
                        if needs_reproject:
                            geom_dict = _reproject(geom_dict, transformer)
                        geos = GEOSGeometry(json.dumps(geom_dict))
                        if geos.geom_type == "LineString":
                            geos = MultiLineString(geos)
                        props = feat["properties"] or {}
                        material = _normalize_material(
                            props.get(_find_field(props, _MATERIAL_FIELDS) or "") or ""
                        )
                        diam = _to_float(props.get(_find_field(props, _DIAMETER_FIELDS) or ""))
                        ext_id_f = _find_field(props, _EXT_ID_FIELDS)
                        ext_id = str(props.get(ext_id_f, "") if ext_id_f else "")[:100]
                        pipe_status = _normalize_pipe_status(
                            props.get(_find_field(props, _STATUS_FIELDS) or "") or ""
                        )
                        year = _to_int(props.get(_find_field(props, _YEAR_FIELDS) or ""))
                        roughness = ROUGHNESS_DEFAULTS.get(material.upper())
                        extras = {k: v for k, v in props.items() if k.lower() not in _pipe_known and v is not None}
                        pipes.append(Pipe(
                            network=network,
                            external_id=ext_id,
                            geometry=geos,
                            material=material,
                            diameter_mm=diam,
                            roughness=roughness,
                            status=pipe_status,
                            installation_year=year,
                            attributes=extras,
                        ))
                    Pipe.objects.bulk_create(pipes, batch_size=500)
                    total_pipes += len(pipes)
                    if not pipes:
                        warnings.append(f"{os.path.basename(shp_path)}: no valid line features")

            # --- Nodes (points) ---
            total_nodes = 0
            _node_known = {f for group in [
                _NODE_TYPE_FIELDS, _ELEVATION_FIELDS, _EXT_ID_FIELDS,
            ] for f in group}

            for shp_path in point_layers:
                with fiona.open(shp_path) as src:
                    needs_reproject = not _is_wgs84(src.crs)
                    transformer = _make_transformer(src.crs_wkt) if needs_reproject else None
                    if not network.source_crs:
                        network.source_crs = src.crs_wkt[:50]

                    nodes = []
                    for feat in src:
                        if not feat["geometry"]:
                            continue
                        geom_dict = feat["geometry"]
                        if needs_reproject:
                            geom_dict = _reproject(geom_dict, transformer)
                        geos = GEOSGeometry(json.dumps(geom_dict))
                        if geos.geom_type == "MultiPoint":
                            geos = geos[0]
                        props = feat["properties"] or {}
                        node_type = _normalize_node_type(
                            props.get(_find_field(props, _NODE_TYPE_FIELDS) or "") or ""
                        )
                        elev = _to_float(props.get(_find_field(props, _ELEVATION_FIELDS) or ""))
                        ext_id_f = _find_field(props, _EXT_ID_FIELDS)
                        ext_id = str(props.get(ext_id_f, "") if ext_id_f else "")[:100]
                        extras = {k: v for k, v in props.items() if k.lower() not in _node_known and v is not None}
                        nodes.append(Node(
                            network=network,
                            external_id=ext_id,
                            node_type=node_type,
                            geometry=geos,
                            elevation_m=elev,
                            attributes=extras,
                        ))
                    Node.objects.bulk_create(nodes, batch_size=500)
                    total_nodes += len(nodes)
                    if not nodes:
                        warnings.append(f"{os.path.basename(shp_path)}: no valid point features")

            # Assign zones via PostGIS spatial JOIN — much faster than Python loops
            if Zone.objects.filter(network=network).exists():
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        UPDATE networks_pipe p
                           SET zone_id = z.id
                          FROM networks_zone z
                         WHERE p.network_id = %s
                           AND z.network_id = %s
                           AND ST_Intersects(p.geometry, z.geometry)
                           AND p.zone_id IS NULL
                        """,
                        [str(network.id), str(network.id)],
                    )
                    cursor.execute(
                        """
                        UPDATE networks_node n
                           SET zone_id = z.id
                          FROM networks_zone z
                         WHERE n.network_id = %s
                           AND z.network_id = %s
                           AND ST_Within(n.geometry, z.geometry)
                           AND n.zone_id IS NULL
                        """,
                        [str(network.id), str(network.id)],
                    )

            # Network stats + bbox
            network.total_pipes = total_pipes
            network.total_nodes = total_nodes
            network.source_crs = network.source_crs or "EPSG:4326"

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT ST_Extent(geometry::geometry)
                      FROM (
                        SELECT geometry FROM networks_pipe WHERE network_id = %s
                        UNION ALL
                        SELECT geometry FROM networks_node WHERE network_id = %s
                      ) geoms
                    """,
                    [str(network.id), str(network.id)],
                )
                row = cursor.fetchone()
                if row and row[0]:
                    from django.contrib.gis.geos import GEOSGeometry as _G
                    network.bbox = _G(row[0]).envelope

                cursor.execute(
                    "SELECT COALESCE(SUM(ST_Length(geometry::geography)), 0) / 1000.0 FROM networks_pipe WHERE network_id = %s",
                    [str(network.id)],
                )
                network.total_length_km = cursor.fetchone()[0]

            network.save()

            upload.status = (
                NetworkUpload.Status.COMPLETE_WITH_WARNINGS if warnings else NetworkUpload.Status.COMPLETE
            )
            upload.validation_report = {
                "pipes": total_pipes,
                "nodes": total_nodes,
                "warnings": warnings,
            }
            upload.completed_at = timezone.now()
            upload.save()
            logger.info("Ingestion complete for upload %s: %d pipes, %d nodes", upload_id, total_pipes, total_nodes)

    except Exception as exc:
        logger.exception("Shapefile ingestion failed for upload %s", upload_id)
        if network:
            network.delete()
        upload.status = NetworkUpload.Status.FAILED
        upload.validation_report = {"error": str(exc), "warnings": warnings}
        upload.completed_at = timezone.now()
        upload.save()
