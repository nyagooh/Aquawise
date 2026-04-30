from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Region, SensorParameter, SystemSetting, WaterSource


# ── Setting helpers ───────────────────────────────────────────────────────────

_DEFAULTS = {
    'alerts': {
        'emailEnabled': True,
        'smsEnabled': False,
        'pushEnabled': False,
        'criticalThresholdMultiplier': 1.5,
        'warningThresholdMultiplier': 1.2,
        'alertCooldownMinutes': 30,
        'autoResolveAfterHours': 72,
    },
    'export': {
        'format': 'csv',
        'includeHeaders': True,
        'dateFormat': 'ISO8601',
        'timezone': 'Africa/Nairobi',
        'delimiter': ',',
        'scheduledExports': False,
        'scheduledFrequency': 'daily',
    },
    'display': {
        'theme': 'light',
        'language': 'en',
        'defaultPeriod': '30d',
        'mapDefaultZoom': 12,
        'showLegend': True,
        'decimalPlaces': 2,
        'dateFormat': 'DD/MM/YYYY',
    },
}


def _get_setting(key):
    obj = SystemSetting.objects.filter(key=key).first()
    stored = obj.value if obj else {}
    return {**_DEFAULTS.get(key, {}), **stored}


def _save_setting(key, value):
    SystemSetting.objects.update_or_create(key=key, defaults={'value': value})


# ── GET/PUT /api/settings/thresholds ─────────────────────────────────────────

@api_view(['GET', 'PUT'])
def settings_thresholds(request):
    if request.method == 'GET':
        params = SensorParameter.objects.all()
        return Response({
            'thresholds': [
                {
                    'param': p.param_id,
                    'label': p.name,
                    'unit': p.unit,
                    'safeMin': p.safe_min,
                    'safeMax': p.safe_max,
                }
                for p in params
            ]
        })

    updates = request.data.get('thresholds', [])
    if not isinstance(updates, list):
        return Response(
            {'error': '"thresholds" must be a list of {param, safeMin?, safeMax?} objects.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    updated = []
    skipped = []
    for item in updates:
        param_id = item.get('param', '')
        try:
            sp = SensorParameter.objects.get(param_id=param_id)
        except SensorParameter.DoesNotExist:
            skipped.append(param_id)
            continue
        changed = []
        if 'safeMin' in item:
            sp.safe_min = float(item['safeMin'])
            changed.append('safe_min')
        if 'safeMax' in item:
            sp.safe_max = float(item['safeMax'])
            changed.append('safe_max')
        if changed:
            sp.save(update_fields=changed)
            updated.append(param_id)

    return Response({'updated': updated, 'skipped': skipped})


# ── GET/PUT /api/settings/alerts ─────────────────────────────────────────────

@api_view(['GET', 'PUT'])
def settings_alerts(request):
    current = _get_setting('alerts')
    if request.method == 'GET':
        return Response(current)
    merged = {**current, **request.data}
    _save_setting('alerts', merged)
    return Response(merged)


# ── GET/PUT /api/settings/export ─────────────────────────────────────────────

@api_view(['GET', 'PUT'])
def settings_export(request):
    current = _get_setting('export')
    if request.method == 'GET':
        return Response(current)
    merged = {**current, **request.data}
    _save_setting('export', merged)
    return Response(merged)


# ── GET/PUT /api/settings/display ────────────────────────────────────────────

@api_view(['GET', 'PUT'])
def settings_display(request):
    current = _get_setting('display')
    if request.method == 'GET':
        return Response(current)
    merged = {**current, **request.data}
    _save_setting('display', merged)
    return Response(merged)


# ── Sensors ───────────────────────────────────────────────────────────────────

def _sensor_data(ws):
    latest = ws.readings.first()  # StationReading ordered by -timestamp
    return {
        'id': ws.source_id,
        'name': ws.name,
        'regionId': ws.region.region_id,
        'regionName': ws.region.name,
        'risk': ws.risk,
        'lastUpdated': ws.last_updated.isoformat(),
        'latestReading': (
            {
                'timestamp': latest.timestamp.isoformat(),
                'temperature': latest.temperature,
                'turbidity': latest.turbidity,
                'ph': latest.ph,
                'dissolvedOxygen': latest.dissolved_oxygen,
                'conductivity': latest.conductivity,
                'nitrates': latest.nitrates,
            }
            if latest else None
        ),
    }


@api_view(['GET', 'POST'])
def sensors(request):
    if request.method == 'GET':
        qs = WaterSource.objects.select_related('region').prefetch_related('readings').all()
        return Response([_sensor_data(ws) for ws in qs])

    # POST — create a new sensor / water source
    data = request.data
    source_id = data.get('id', '').strip()
    name = data.get('name', '').strip()
    region_id = data.get('regionId', '').strip()

    if not all([source_id, name, region_id]):
        return Response(
            {'error': 'id, name, and regionId are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    region = get_object_or_404(Region, region_id=region_id)
    if WaterSource.objects.filter(source_id=source_id).exists():
        return Response(
            {'error': f'Sensor "{source_id}" already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    WaterSource.objects.create(
        source_id=source_id,
        name=name,
        region=region,
        risk=data.get('risk', 'safe'),
    )
    # Re-fetch with select/prefetch so _sensor_data can access region + readings
    ws = WaterSource.objects.select_related('region').prefetch_related('readings').get(
        source_id=source_id
    )
    return Response(_sensor_data(ws), status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
def sensor_detail(request, source_id):
    ws = get_object_or_404(
        WaterSource.objects.select_related('region').prefetch_related('readings'),
        source_id=source_id,
    )

    if request.method == 'GET':
        return Response(_sensor_data(ws))

    # PUT — update name / risk
    data = request.data
    fields_changed = []
    if 'name' in data:
        ws.name = data['name'].strip()
        fields_changed.append('name')
    if 'risk' in data and data['risk'] in ('safe', 'warning', 'danger'):
        ws.risk = data['risk']
        fields_changed.append('risk')
    if fields_changed:
        ws.save(update_fields=fields_changed)
    return Response(_sensor_data(ws))
