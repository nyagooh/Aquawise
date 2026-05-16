import json
import os

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.contrib.gis.geos import Polygon
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Asset, NetworkUpload, Node, Pipe, WaterNetwork, Zone


class NetworkUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        ext = file.name.rsplit(".", 1)[-1].lower()
        if ext not in ("zip", "inp"):
            return Response(
                {"error": "Only .zip (shapefile) or .inp (EPANET) files accepted"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        upload = NetworkUpload.objects.create(
            organisation=request.user.organisation,
            file_name=file.name,
            file_path="",
            file_type="shapefile" if ext == "zip" else "epanet",
        )

        # Save file to media/uploads/<org_id>/<upload_id>.<ext>
        upload_dir = f"uploads/{request.user.organisation_id}"
        saved_path = default_storage.save(
            os.path.join(upload_dir, f"{upload.id}.{ext}"),
            ContentFile(file.read()),
        )
        upload.file_path = default_storage.path(saved_path)
        upload.save(update_fields=["file_path"])

        if ext == "zip":
            from .tasks import ingest_shapefile
            ingest_shapefile.delay(str(upload.id))
        # EPANET (.inp) ingestion task — TODO

        return Response({"upload_id": upload.id, "status": upload.status}, status=status.HTTP_202_ACCEPTED)


class WaterNetworkDetailView(APIView):
    def get(self, request, pk):
        try:
            network = WaterNetwork.objects.get(pk=pk, organisation=request.user.organisation)
        except WaterNetwork.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({
            "id": str(network.id),
            "name": network.name,
            "source_crs": network.source_crs,
            "total_pipes": network.total_pipes,
            "total_nodes": network.total_nodes,
            "total_length_km": network.total_length_km,
            "bbox": json.loads(network.bbox.geojson) if network.bbox else None,
            "created_at": network.created_at,
        })


class NetworkValidationReportView(APIView):
    def get(self, request, pk):
        try:
            upload = NetworkUpload.objects.get(pk=pk, organisation=request.user.organisation)
        except NetworkUpload.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(upload.validation_report)


def _bbox_filter(query_params):
    """Parse ?bbox=minx,miny,maxx,maxy and return a GEOSGeometry polygon, or None."""
    raw = query_params.get("bbox")
    if not raw:
        return None, None
    try:
        minx, miny, maxx, maxy = [float(v) for v in raw.split(",")]
    except (ValueError, TypeError):
        return None, "bbox must be four comma-separated numbers: minx,miny,maxx,maxy"
    bbox_geom = Polygon.from_bbox((minx, miny, maxx, maxy))
    bbox_geom.srid = 4326
    return bbox_geom, None


def _geojson_feature(geometry, properties):
    return {
        "type": "Feature",
        "geometry": json.loads(geometry.geojson),
        "properties": properties,
    }


class PipeListView(APIView):
    def get(self, request, pk):
        try:
            network = WaterNetwork.objects.get(pk=pk, organisation=request.user.organisation)
        except WaterNetwork.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        qs = Pipe.objects.filter(network=network)

        bbox_geom, err = _bbox_filter(request.query_params)
        if err:
            return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)
        if bbox_geom is not None:
            qs = qs.filter(geometry__intersects=bbox_geom)

        zone_id = request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)

        features = [
            _geojson_feature(pipe.geometry, {
                "id": str(pipe.id),
                "external_id": pipe.external_id,
                "material": pipe.material,
                "diameter_mm": pipe.diameter_mm,
                "length_m": pipe.length_m,
                "status": pipe.status,
                "installation_year": pipe.installation_year,
                "zone_id": str(pipe.zone_id) if pipe.zone_id else None,
            })
            for pipe in qs.only(
                "id", "geometry", "external_id", "material",
                "diameter_mm", "length_m", "status", "installation_year", "zone_id",
            ).iterator(chunk_size=500)
        ]
        return Response({"type": "FeatureCollection", "features": features})


class NodeListView(APIView):
    def get(self, request, pk):
        try:
            network = WaterNetwork.objects.get(pk=pk, organisation=request.user.organisation)
        except WaterNetwork.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        qs = Node.objects.filter(network=network)

        bbox_geom, err = _bbox_filter(request.query_params)
        if err:
            return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)
        if bbox_geom is not None:
            qs = qs.filter(geometry__intersects=bbox_geom)

        zone_id = request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)

        features = [
            _geojson_feature(node.geometry, {
                "id": str(node.id),
                "external_id": node.external_id,
                "node_type": node.node_type,
                "elevation_m": node.elevation_m,
                "demand_lps": node.demand_lps,
                "zone_id": str(node.zone_id) if node.zone_id else None,
            })
            for node in qs.only(
                "id", "geometry", "external_id", "node_type",
                "elevation_m", "demand_lps", "zone_id",
            ).iterator(chunk_size=500)
        ]
        return Response({"type": "FeatureCollection", "features": features})


class ZoneListView(APIView):
    def get(self, request, pk):
        try:
            network = WaterNetwork.objects.get(pk=pk, organisation=request.user.organisation)
        except WaterNetwork.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        features = [
            _geojson_feature(zone.geometry, {
                "id": str(zone.id),
                "name": zone.name,
                "code": zone.code,
                "population_estimate": zone.population_estimate,
            })
            for zone in Zone.objects.filter(network=network)
            .exclude(geometry__isnull=True)
            .only("id", "geometry", "name", "code", "population_estimate")
            .iterator(chunk_size=200)
        ]
        return Response({"type": "FeatureCollection", "features": features})


class AssetListView(APIView):
    def get(self, request, pk):
        try:
            network = WaterNetwork.objects.get(pk=pk, organisation=request.user.organisation)
        except WaterNetwork.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        bbox_geom, err = _bbox_filter(request.query_params)
        if err:
            return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)

        qs = Asset.objects.filter(network=network)
        if bbox_geom is not None:
            qs = qs.filter(geometry__intersects=bbox_geom)

        features = [
            _geojson_feature(asset.geometry, {
                "id": str(asset.id),
                "name": asset.name,
                "asset_type": asset.asset_type,
                "status": asset.status,
            })
            for asset in qs.only("id", "geometry", "name", "asset_type", "status").iterator(chunk_size=500)
        ]
        return Response({"type": "FeatureCollection", "features": features})


class NetworkStatsView(APIView):
    def get(self, request, pk):
        try:
            network = WaterNetwork.objects.get(pk=pk, organisation=request.user.organisation)
        except WaterNetwork.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({
            "total_pipes": network.total_pipes,
            "total_nodes": network.total_nodes,
            "total_length_km": network.total_length_km,
        })
