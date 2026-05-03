from rest_framework import serializers
from .models import Region, WaterSource, SensorParameter, TimeSeriesReading, Alert, RegionPrediction, ForecastDay, StationReading


class RegionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='region_id')

    class Meta:
        model = Region
        fields = ['id', 'name', 'water_body']


class WaterSourceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='source_id')
    # Frontend-expected aliases
    county = serializers.CharField(source='region.name')
    status = serializers.CharField(source='risk')
    sensorId = serializers.CharField(source='sensor_id')
    lastUpdate = serializers.SerializerMethodField()
    readings = serializers.SerializerMethodField()
    measuredParameters = serializers.JSONField(source='measured_parameters')
    # Backward-compatible fields kept alongside
    regionId = serializers.CharField(source='region.region_id')
    risk = serializers.CharField()

    class Meta:
        model = WaterSource
        fields = [
            'id', 'name',
            'county', 'regionId',
            'status', 'risk',
            'lat', 'lng',
            'sensorId', 'battery', 'installed',
            'lastUpdate',
            'readings',
            'measuredParameters',
        ]

    def get_lastUpdate(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.last_updated
        minutes = int(delta.total_seconds() / 60)
        if minutes < 60:
            return f'{minutes} min ago'
        hours = minutes // 60
        if hours < 24:
            return f'{hours} hr ago'
        return f'{hours // 24} day(s) ago'

    def get_readings(self, obj):
        # Works with prefetch_related('readings'); safe without it too.
        reading = next(iter(obj.readings.all()), None)
        if reading is None:
            return None
        return {
            'ph':             reading.ph,
            'turbidity':      reading.turbidity,
            'temperature':    reading.temperature,
            'dissolvedOxygen': reading.dissolved_oxygen,
            'conductivity':   reading.conductivity,
            'nitrates':       reading.nitrates,
            'freeChlorine':   reading.free_chlorine,
            'tds':            reading.tds,
        }


class StationReadingSerializer(serializers.ModelSerializer):
    dissolvedOxygen = serializers.FloatField(source='dissolved_oxygen', allow_null=True)
    freeChlorine = serializers.FloatField(source='free_chlorine', allow_null=True)

    class Meta:
        model = StationReading
        fields = [
            'timestamp', 'temperature', 'turbidity', 'ph',
            'dissolvedOxygen', 'conductivity', 'nitrates',
            'freeChlorine', 'tds',
        ]


class WaterSourceDetailSerializer(WaterSourceSerializer):
    """Detail view — identical fields for now; extend here for future detail-only data."""
    class Meta(WaterSourceSerializer.Meta):
        pass


class SensorParameterSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='param_id')
    safeMin = serializers.FloatField(source='safe_min', allow_null=True)
    safeMax = serializers.FloatField(source='safe_max', allow_null=True)
    isReal = serializers.BooleanField(source='is_real')

    class Meta:
        model = SensorParameter
        fields = ['id', 'name', 'value', 'unit', 'safeMin', 'safeMax', 'isReal', 'category', 'description']


class TimeSeriesReadingSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    dissolvedOxygen = serializers.FloatField(source='dissolved_oxygen')

    class Meta:
        model = TimeSeriesReading
        fields = ['time', 'temperature', 'turbidity', 'ph', 'dissolvedOxygen', 'conductivity', 'nitrates']

    def get_time(self, obj):
        return obj.timestamp.strftime('%I:%M %p')


class AlertSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='alert_id')
    # Frontend-expected fields
    utilityId = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    severity = serializers.CharField(source='risk')
    description = serializers.CharField(source='action')
    triggered = serializers.DateTimeField(source='created_at')
    # Backward-compatible fields
    time = serializers.CharField(source='time_label')
    regionId = serializers.CharField(source='region.region_id')
    acknowledgedAt = serializers.DateTimeField(source='acknowledged_at', allow_null=True)
    resolvedAt = serializers.DateTimeField(source='resolved_at', allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at')

    class Meta:
        model = Alert
        fields = [
            'id',
            'utilityId', 'title', 'parameter', 'value', 'threshold',
            'severity', 'description', 'triggered',
            'status', 'acknowledgedAt', 'resolvedAt',
            # legacy / backward-compat
            'time', 'source', 'regionId', 'risk', 'action', 'createdAt',
        ]

    def get_utilityId(self, obj):
        return obj.water_source.source_id if obj.water_source_id else None

    def get_title(self, obj):
        if obj.title:
            return obj.title
        severity_prefix = {'danger': 'Critical', 'warning': 'Warning'}.get(obj.risk, 'Alert')
        return f'{severity_prefix}: {obj.parameter}'


class ForecastDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastDay
        fields = ['day', 'score']


class RegionPredictionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='region.region_id')
    region = serializers.CharField(source='region.name')
    waterBody = serializers.CharField(source='region.water_body')
    riskScore = serializers.IntegerField(source='risk_score')
    riskLevel = serializers.CharField(source='risk_level')
    prediction = serializers.CharField(source='prediction_text')
    nextRisk = serializers.CharField(source='next_risk')
    contaminationProbability = serializers.IntegerField(source='contamination_probability')
    topConcern = serializers.CharField(source='top_concern')
    forecastDays = ForecastDaySerializer(source='forecast_days', many=True)

    class Meta:
        model = RegionPrediction
        fields = [
            'id', 'region', 'waterBody', 'riskScore', 'riskLevel',
            'prediction', 'nextRisk', 'contaminationProbability',
            'topConcern', 'forecastDays',
        ]
