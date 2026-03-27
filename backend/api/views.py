from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Region, WaterSource, SensorParameter, TimeSeriesReading, Alert, RegionPrediction
from .serializers import (
    RegionSerializer, WaterSourceSerializer, SensorParameterSerializer,
    TimeSeriesReadingSerializer, AlertSerializer, RegionPredictionSerializer,
)


@api_view(['GET'])
def regions(request):
    qs = Region.objects.all()
    return Response(RegionSerializer(qs, many=True).data)


@api_view(['GET'])
def sensor_readings(request):
    qs = SensorParameter.objects.all()
    return Response(SensorParameterSerializer(qs, many=True).data)


@api_view(['GET'])
def timeseries(request):
    qs = TimeSeriesReading.objects.all().order_by('timestamp')
    return Response(TimeSeriesReadingSerializer(qs, many=True).data)


@api_view(['GET'])
def water_sources(request):
    qs = WaterSource.objects.select_related('region').all()
    region_id = request.query_params.get('region')
    if region_id:
        qs = qs.filter(region__region_id=region_id)
    return Response(WaterSourceSerializer(qs, many=True).data)


@api_view(['GET'])
def alerts(request):
    qs = Alert.objects.select_related('region').all()
    region_id = request.query_params.get('region')
    if region_id:
        qs = qs.filter(region__region_id=region_id)
    return Response(AlertSerializer(qs, many=True).data)


@api_view(['GET'])
def predictions(request):
    qs = RegionPrediction.objects.select_related('region').prefetch_related('forecast_days').all()
    region_id = request.query_params.get('region')
    if region_id:
        qs = qs.filter(region__region_id=region_id)
    return Response(RegionPredictionSerializer(qs, many=True).data)
