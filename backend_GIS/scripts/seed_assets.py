import json
import os
import django
from django.contrib.gis.geos import GEOSGeometry

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aquawise_gis.settings.development")
django.setup()

from apps.networks.models import Asset, WaterNetwork

assets_file = "/home/tomlee/Desktop/dev/Aquawise2/Aquawise/GIS/public/data/kisumu-assets.geojson"
if not os.path.exists(assets_file):
    print(f"Assets file not found at {assets_file}")
    exit(1)

with open(assets_file, "r") as f:
    data = json.load(f)

networks = WaterNetwork.objects.all()
for net in networks:
    print(f"Seeding assets for network: {net.name} ({net.id})")
    # Clear existing assets to avoid duplicates
    Asset.objects.filter(network=net).delete()
    
    asset_objs = []
    for feat in data["features"]:
        geom = GEOSGeometry(json.dumps(feat["geometry"]))
        props = feat["properties"]
        
        # Map asset type to backend models
        asset_type = props["asset"]
        if asset_type == "tank":
            asset_type = "storage_tank"
        elif asset_type == "pressure_valve" or asset_type == "meter_valve":
            asset_type = "valve"
        elif asset_type == "sensor":
            asset_type = "meter"
            
        # Extract remaining props as attributes
        attrs = {k: v for k, v in props.items() if k not in ("name", "asset", "status")}
        # Add the original properties needed by the frontend
        attrs["asset"] = props["asset"]
        attrs["id"] = props["id"]
        
        asset_objs.append(Asset(
            network=net,
            asset_type=asset_type,
            name=props["name"],
            geometry=geom,
            status=props["status"],
            attributes=attrs
        ))
        
    Asset.objects.bulk_create(asset_objs)
    print(f"Successfully seeded {len(asset_objs)} assets for {net.name}")
