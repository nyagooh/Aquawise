import csv
import io
from datetime import datetime, timezone as dt_timezone

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from .models import HistoricalDataset, HistoricalReading


KNOWN_PARAMS = frozenset(
    ['temperature', 'turbidity', 'ph', 'dissolved_oxygen', 'conductivity', 'nitrates']
)
TEMPLATE_HEADERS = [
    'timestamp', 'location_id',
    'temperature', 'turbidity', 'ph', 'dissolved_oxygen', 'conductivity', 'nitrates',
]


def _dataset_data(ds, include_preview=False):
    out = {
        'id': ds.pk,
        'name': ds.name,
        'filename': ds.filename,
        'rowCount': ds.row_count,
        'parameters': ds.parameters,
        'status': ds.status,
        'errorMessage': ds.error_message or None,
        'uploadedAt': ds.created_at.isoformat(),
    }
    if include_preview:
        rows = ds.readings.all()[:100]
        out['preview'] = [
            {
                'timestamp': r.timestamp.isoformat(),
                'locationId': r.location_id,
                **r.data,
            }
            for r in rows
        ]
    return out


def _parse_ts(raw):
    """Parse ISO timestamp string; return aware datetime."""
    raw = raw.strip().replace('Z', '+00:00')
    dt = datetime.fromisoformat(raw)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=dt_timezone.utc)
    return dt


# ── GET /api/historical/templates/download ────────────────────────────────────

@api_view(['GET'])
def historical_template(request):
    lines = [
        ','.join(TEMPLATE_HEADERS),
        '2026-01-01T08:00:00Z,ws1,25.3,3.1,7.2,8.0,415.0,4.1',
        '2026-01-01T09:00:00Z,ws2,24.8,4.2,7.0,7.5,420.0,5.2',
    ]
    response = HttpResponse('\n'.join(lines), content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="aquawise_template.csv"'
    return response


# ── POST /api/historical/upload ───────────────────────────────────────────────

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def historical_upload(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response(
            {'error': 'No file provided. POST multipart/form-data with key "file".'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    filename = file_obj.name
    if not filename.lower().endswith('.csv'):
        return Response(
            {'error': 'Only CSV files are supported. Download the template to see the expected format.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        text = file_obj.read().decode('utf-8-sig')  # strip BOM if present
        reader = csv.DictReader(io.StringIO(text))
        headers = reader.fieldnames or []
    except Exception as exc:
        return Response(
            {'error': f'Could not read file: {exc}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if 'timestamp' not in headers:
        return Response(
            {'error': 'CSV must have a "timestamp" column.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    detected_params = [h for h in headers if h in KNOWN_PARAMS]
    if not detected_params:
        return Response(
            {
                'error': (
                    'No recognised parameter columns found. '
                    f'Expected at least one of: {", ".join(sorted(KNOWN_PARAMS))}'
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    rows = []
    parse_errors = []
    for line_num, row in enumerate(reader, start=2):
        ts_raw = row.get('timestamp', '').strip()
        if not ts_raw:
            parse_errors.append(f'Row {line_num}: missing timestamp')
            continue
        try:
            ts = _parse_ts(ts_raw)
        except ValueError:
            parse_errors.append(f'Row {line_num}: invalid timestamp "{ts_raw}"')
            continue

        data = {}
        for param in detected_params:
            raw_val = row.get(param, '').strip()
            if raw_val:
                try:
                    data[param] = float(raw_val)
                except ValueError:
                    parse_errors.append(
                        f'Row {line_num}: non-numeric value for {param}: "{raw_val}"'
                    )

        rows.append({
            'timestamp': ts,
            'location_id': row.get('location_id', '').strip(),
            'data': data,
        })

    if parse_errors:
        return Response(
            {'error': 'Validation errors in uploaded file', 'details': parse_errors[:20]},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not rows:
        return Response(
            {'error': 'File contained no data rows.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    name = request.data.get('name', filename)
    ds = HistoricalDataset.objects.create(
        name=name,
        filename=filename,
        row_count=len(rows),
        parameters=detected_params,
        status='ready',
        uploaded_by=request.user if request.user.is_authenticated else None,
    )
    HistoricalReading.objects.bulk_create([
        HistoricalReading(
            dataset=ds,
            timestamp=r['timestamp'],
            location_id=r['location_id'],
            data=r['data'],
        )
        for r in rows
    ])

    return Response(_dataset_data(ds), status=status.HTTP_201_CREATED)


# ── GET /api/historical/datasets ─────────────────────────────────────────────

@api_view(['GET'])
def historical_datasets(request):
    qs = HistoricalDataset.objects.all()
    return Response([_dataset_data(ds) for ds in qs])


# ── GET|DELETE /api/historical/datasets/{id} ─────────────────────────────────

@api_view(['GET', 'DELETE'])
def historical_dataset_detail(request, pk):
    ds = get_object_or_404(HistoricalDataset, pk=pk)

    if request.method == 'DELETE':
        ds.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(_dataset_data(ds, include_preview=True))
