"""Populate the database with initial data matching the frontend mock data."""
import math
import random
from datetime import datetime, timedelta, timezone

from django.core.management.base import BaseCommand
from django.utils import timezone as dj_timezone

from api.models import (
    Alert, ForecastDay, Region, RegionPrediction,
    SensorParameter, StationReading, TimeSeriesReading, WaterSource,
)


class Command(BaseCommand):
    help = 'Seed the database with initial Aquawise data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data…')

        # ── Regions ────────────────────────────────────────────────────────
        regions_data = [
            ('r1', 'Dunga',    'Lake Victoria — Dunga Beach'),
            ('r2', 'Ahero',    'Nyando River & Irrigation Canals'),
            ('r3', 'Nyalenda', 'Nyalenda Wetland & Streams'),
            ('r4', 'Kibos',    'Kibos River'),
            ('r5', 'Kondele',  'Kondele Municipal Water Points'),
        ]
        regions = {}
        for rid, name, water_body in regions_data:
            r, _ = Region.objects.update_or_create(
                region_id=rid, defaults={'name': name, 'water_body': water_body}
            )
            regions[rid] = r

        # ── Water sources ──────────────────────────────────────────────────
        # (source_id, name, region_id, risk, lat, lng, battery, sensor_id, installed)
        sources_data = [
            ('ws1', 'Dunga Beach Station',    'r1', 'safe',    -0.1139, 34.7484, 87, 'SN-D001', '2023-03-15'),
            ('ws2', 'Ahero Irrigation Canal', 'r2', 'warning', -0.1667, 34.9167, 62, 'SN-A002', '2023-06-20'),
            ('ws3', 'Nyalenda Wetland',       'r3', 'danger',  -0.1208, 34.7625, 41, 'SN-N003', '2023-09-10'),
            ('ws4', 'Kibos River Point',      'r4', 'safe',    -0.0483, 34.8317, 95, 'SN-K004', '2023-01-05'),
            ('ws5', 'Kondele Water Point',    'r5', 'safe',    -0.1017, 34.7403, 78, 'SN-C005', '2024-02-28'),
        ]
        sources = {}
        for sid, name, rid, risk, lat, lng, battery, sensor_id, installed in sources_data:
            ws, _ = WaterSource.objects.update_or_create(
                source_id=sid,
                defaults={
                    'name': name, 'region': regions[rid], 'risk': risk,
                    'lat': lat, 'lng': lng,
                    'battery': battery, 'sensor_id': sensor_id,
                    'installed': installed,
                },
            )
            sources[sid] = ws

        # ── 30-day time series (hourly) ────────────────────────────────────
        TimeSeriesReading.objects.all().delete()
        now = datetime.now(tz=timezone.utc)
        random.seed(42)
        total_hours = 30 * 24
        ts_rows = []
        for i in range(total_hours - 1, -1, -1):
            t = now - timedelta(hours=i)
            hour = t.hour
            day_offset = i / total_hours  # 1.0 → oldest, 0.0 → newest
            temp_base = 24 + 4 * math.sin((hour - 6) * math.pi / 12)
            turb_base = 3.2 + (2.5 if 6 <= hour <= 10 else 0) + random.random() * 0.8
            ts_rows.append(TimeSeriesReading(
                timestamp=t,
                temperature=round(temp_base + (random.random() - 0.5) * 0.6, 1),
                turbidity=round(turb_base + (random.random() - 0.5) * 0.5, 2),
                ph=round(7.2 + (random.random() - 0.5) * 0.4, 2),
                dissolved_oxygen=round(7.8 + (random.random() - 0.5) * 0.6, 2),
                conductivity=round(410 + (random.random() - 0.5) * 30),
                nitrates=round(4.2 + (random.random() - 0.5) * 1.2, 2),
            ))
        TimeSeriesReading.objects.bulk_create(ts_rows)

        # ── Full WHO parameter catalogue ───────────────────────────────────
        # (param_id, name, unit, safe_min, safe_max, category, is_real, description)
        latest = TimeSeriesReading.objects.last()

        def _live(attr):
            return round(getattr(latest, attr, None) or 0, 3)

        who_params = [
            # Microbiological
            ('ecoli',               'E. coli / Thermotolerant Coliforms', 'CFU/100 mL', 0,      0,      'micro',       False, 'WHO: 0 CFU/100 mL in treated water.'),
            ('total_coliforms',     'Total Coliforms',                    'CFU/100 mL', 0,      0,      'micro',       False, 'WHO: 0 CFU/100 mL in treated water.'),
            ('faecal_streptococci', 'Faecal Streptococci',                'CFU/100 mL', 0,      0,      'micro',       False, 'Indicator of faecal contamination.'),
            ('hpc',                 'Heterotrophic Plate Count',          'CFU/mL',     0,      500,    'micro',       False, 'WHO: ≤ 500 CFU/mL.'),
            # Physical / Aesthetic
            ('turbidity',           'Turbidity',                          'NTU',        0,      1,      'physical',    True,  'WHO: ≤ 1 NTU treated, ≤ 5 NTU source water.'),
            ('colour',              'Colour',                             'TCU',        0,      15,     'physical',    False, 'WHO: ≤ 15 True Colour Units.'),
            ('temperature',         'Temperature',                        '°C',         0,      25,     'physical',    True,  'WHO preferred: < 25°C.'),
            ('tds',                 'Total Dissolved Solids',             'mg/L',       0,      1000,   'physical',    True,  'WHO: ≤ 1,000 mg/L.'),
            # Chemical — General
            ('ph',                  'pH',                                 '',           6.5,    8.5,    'chemical',    True,  'WHO: 6.5 – 8.5.'),
            ('conductivity',        'Conductivity',                       'µS/cm',      0,      2500,   'chemical',    True,  'WHO: ≤ 2,500 µS/cm.'),
            ('hardness',            'Hardness (as CaCO₃)',                'mg/L',       0,      500,    'chemical',    False, 'WHO: ≤ 500 mg/L.'),
            ('alkalinity',          'Alkalinity',                         'mg/L',       None,   None,   'chemical',    False, 'Monitoring only — no WHO health guideline.'),
            ('aluminium',           'Aluminium (Al)',                     'mg/L',       0,      0.2,    'chemical',    False, 'WHO: ≤ 0.2 mg/L.'),
            ('ammonia',             'Ammonia (NH₃)',                      'mg/L',       0,      1.5,    'chemical',    False, 'WHO: ≤ 1.5 mg/L.'),
            ('arsenic',             'Arsenic (As)',                       'mg/L',       0,      0.01,   'chemical',    False, 'WHO: ≤ 0.01 mg/L (10 µg/L).'),
            ('barium',              'Barium (Ba)',                        'mg/L',       0,      1.3,    'chemical',    False, 'WHO: ≤ 1.3 mg/L.'),
            ('boron',               'Boron (B)',                          'mg/L',       0,      2.4,    'chemical',    False, 'WHO: ≤ 2.4 mg/L.'),
            ('cadmium',             'Cadmium (Cd)',                       'mg/L',       0,      0.003,  'chemical',    False, 'WHO: ≤ 0.003 mg/L (3 µg/L).'),
            ('chloride',            'Chloride (Cl⁻)',                     'mg/L',       0,      250,    'chemical',    False, 'WHO: ≤ 250 mg/L.'),
            ('chromium',            'Chromium (Cr)',                      'mg/L',       0,      0.05,   'chemical',    False, 'WHO: ≤ 0.05 mg/L (50 µg/L).'),
            ('copper',              'Copper (Cu)',                        'mg/L',       0,      2.0,    'chemical',    False, 'WHO: ≤ 2.0 mg/L.'),
            ('cyanide',             'Cyanide (CN⁻)',                      'mg/L',       0,      0.07,   'chemical',    False, 'WHO: ≤ 0.07 mg/L (70 µg/L).'),
            ('fluoride',            'Fluoride (F⁻)',                      'mg/L',       0,      1.5,    'chemical',    False, 'WHO: ≤ 1.5 mg/L.'),
            ('iron',                'Iron (Fe)',                          'mg/L',       0,      0.3,    'chemical',    False, 'WHO: ≤ 0.3 mg/L.'),
            ('lead',                'Lead (Pb)',                          'mg/L',       0,      0.01,   'chemical',    False, 'WHO: ≤ 0.01 mg/L (10 µg/L).'),
            ('magnesium',           'Magnesium (Mg)',                     'mg/L',       0,      50,     'chemical',    False, 'WHO: ≤ 50 mg/L (aesthetic).'),
            ('manganese',           'Manganese (Mn)',                     'mg/L',       0,      0.08,   'chemical',    False, 'WHO: ≤ 0.08 mg/L (80 µg/L).'),
            ('mercury',             'Mercury (Hg)',                       'mg/L',       0,      0.006,  'chemical',    False, 'WHO: ≤ 0.006 mg/L (6 µg/L).'),
            ('nickel',              'Nickel (Ni)',                        'mg/L',       0,      0.07,   'chemical',    False, 'WHO: ≤ 0.07 mg/L (70 µg/L).'),
            ('nitrates',            'Nitrate (NO₃⁻)',                     'mg/L',       0,      50,     'chemical',    True,  'WHO: ≤ 50 mg/L as NO₃.'),
            ('nitrite',             'Nitrite (NO₂⁻)',                     'mg/L',       0,      3.0,    'chemical',    False, 'WHO: ≤ 3 mg/L short-term, ≤ 0.2 mg/L long-term.'),
            ('phosphate',           'Phosphate (PO₄³⁻)',                  'mg/L',       None,   None,   'chemical',    False, 'Monitoring only — no WHO health guideline.'),
            ('selenium',            'Selenium (Se)',                      'mg/L',       0,      0.04,   'chemical',    False, 'WHO: ≤ 0.04 mg/L (40 µg/L).'),
            ('sodium',              'Sodium (Na)',                        'mg/L',       0,      200,    'chemical',    False, 'WHO: ≤ 200 mg/L.'),
            ('sulphate',            'Sulphate (SO₄²⁻)',                   'mg/L',       0,      500,    'chemical',    False, 'WHO: ≤ 500 mg/L.'),
            ('uranium',             'Uranium (U)',                        'mg/L',       0,      0.03,   'chemical',    False, 'WHO: ≤ 0.03 mg/L (30 µg/L).'),
            ('zinc',                'Zinc (Zn)',                          'mg/L',       0,      3.0,    'chemical',    False, 'WHO: ≤ 3.0 mg/L.'),
            # Operational
            ('dissolved_oxygen',    'Dissolved Oxygen',                   'mg/L',       5.0,    None,   'operational', True,  'Recommended > 5 mg/L. Low DO signals pollution.'),
            ('free_chlorine',       'Free Chlorine (Residual)',           'mg/L',       0.2,    1.0,    'operational', True,  'Residual 0.2 – 1.0 mg/L in distribution system.'),
        ]

        # Live sensor values for the IoT-measurable params
        live_values = {
            'turbidity':        _live('turbidity'),
            'temperature':      _live('temperature'),
            'tds':              0,
            'ph':               _live('ph'),
            'conductivity':     _live('conductivity'),
            'nitrates':         _live('nitrates'),
            'dissolved_oxygen': _live('dissolved_oxygen'),
            'free_chlorine':    0,
        }

        for pid, name, unit, smin, smax, category, is_real, desc in who_params:
            SensorParameter.objects.update_or_create(
                param_id=pid,
                defaults={
                    'name': name, 'unit': unit,
                    'safe_min': smin, 'safe_max': smax,
                    'category': category, 'is_real': is_real,
                    'description': desc,
                    'value': live_values.get(pid, 0),
                },
            )

        # ── Set measured_parameters per station ────────────────────────────
        # Each tuple: (source_id, [list of param_ids this sensor measures])
        # These represent what the physical IoT sensor at each location tests.
        iot_base = ['ph', 'turbidity', 'temperature', 'dissolved_oxygen', 'conductivity', 'nitrates']
        station_params = {
            'ws1': iot_base + ['free_chlorine', 'tds'],       # Dunga — full IoT suite
            'ws2': iot_base + ['free_chlorine'],               # Ahero — adds Cl residual
            'ws3': iot_base,                                   # Nyalenda — base IoT
            'ws4': iot_base + ['tds'],                         # Kibos — adds TDS
            'ws5': ['ph', 'turbidity', 'temperature', 'conductivity'],  # Kondele — basic 4
        }
        for sid, params_list in station_params.items():
            WaterSource.objects.filter(source_id=sid).update(measured_parameters=params_list)

        # ── Alerts ─────────────────────────────────────────────────────────
        # (id, time_label, source_name, region_id, water_source_id,
        #  parameter, value, threshold, risk, title, action)
        alerts_data = [
            ('a1', '08:42 AM',  'Nyalenda Wetland',       'r3', 'ws3',
             'Turbidity',     '8.7 NTU',    5.0,  'danger',
             'High Turbidity Alert',
             'Boil water advisory issued for Nyalenda'),
            ('a2', '07:15 AM',  'Ahero Irrigation Canal', 'r2', 'ws2',
             'Nitrates',      '11.2 mg/L',  10.0, 'warning',
             'Nitrates Above Safe Limit',
             'Increased monitoring at Ahero canal'),
            ('a3', '06:30 AM',  'Kibos River Point',      'r4', 'ws4',
             'pH Level',      '8.8 pH',     8.5,  'warning',
             'pH Level Anomaly',
             'Treatment chemicals adjusted at Kibos'),
            ('a4', 'Yesterday', 'Dunga Beach Station',    'r1', 'ws1',
             'Temperature',   '31.2 °C',    30.0, 'warning',
             'Elevated Water Temperature',
             'Resolved — temperature normalised at Dunga'),
            ('a5', 'Yesterday', 'Nyalenda Wetland',       'r3', 'ws3',
             'E. coli (Sim)', 'Detected',   None, 'danger',
             'E. coli Contamination Detected',
             'Source isolated, samples sent to KIWASCO lab'),
        ]
        for (aid, time_label, source_name, rid, wsid,
             param, value, threshold, risk, title, action) in alerts_data:
            Alert.objects.update_or_create(
                alert_id=aid,
                defaults={
                    'time_label': time_label,
                    'source': source_name,
                    'water_source': sources.get(wsid),
                    'region': regions[rid],
                    'parameter': param,
                    'value': value,
                    'threshold': threshold,
                    'title': title,
                    'risk': risk,
                    'action': action,
                },
            )

        # ── Regional predictions ───────────────────────────────────────────
        preds_data = [
            ('r1', 18, 'safe',    'stable',  8,  'None',
             'Lake water quality at Dunga Beach expected to remain stable. No significant contamination risk over the next 7 days.',
             [('Mon',15),('Tue',18),('Wed',14),('Thu',20),('Fri',16),('Sat',19),('Sun',17)]),
            ('r2', 42, 'warning', 'rising',  35, 'Turbidity',
             'Rising turbidity expected from agricultural runoff through Ahero irrigation channels during the current planting season.',
             [('Mon',38),('Tue',42),('Wed',48),('Thu',52),('Fri',45),('Sat',40),('Sun',38)]),
            ('r3', 61, 'danger',  'rising',  72, 'E. coli & Nitrates',
             'High contamination risk from informal settlement waste entering wetland streams. E. coli levels above safe thresholds.',
             [('Mon',55),('Tue',61),('Wed',68),('Thu',70),('Fri',65),('Sat',58),('Sun',54)]),
            ('r4', 22, 'safe',    'falling', 5,  'None',
             'Kibos River conditions are favourable. Industrial discharge from sugar factories within acceptable limits.',
             [('Mon',25),('Tue',22),('Wed',20),('Thu',18),('Fri',15),('Sat',16),('Sun',14)]),
            ('r5', 31, 'warning', 'stable',  22, 'pH Level',
             'Moderate pH fluctuations detected at Kondele water points. Pipe corrosion under investigation by KIWASCO.',
             [('Mon',28),('Tue',31),('Wed',33),('Thu',30),('Fri',29),('Sat',32),('Sun',30)]),
        ]
        for rid, score, level, next_risk, prob, concern, text, forecast in preds_data:
            pred, _ = RegionPrediction.objects.update_or_create(
                region=regions[rid],
                defaults={
                    'risk_score': score, 'risk_level': level,
                    'prediction_text': text, 'next_risk': next_risk,
                    'contamination_probability': prob, 'top_concern': concern,
                },
            )
            pred.forecast_days.all().delete()
            for order, (day, score_val) in enumerate(forecast):
                ForecastDay.objects.create(prediction=pred, day=day, score=score_val, order=order)

        # ── Station readings (3 days, hourly, per source) ──────────────────
        # Values are tuned to each station's risk level so charts look realistic.
        # (source_id, ph_base, turb_base, temp_base, do_base, cond_base, nit_base,
        #  free_cl_base, tds_base)  — None means the sensor doesn't measure it.
        station_profiles = {
            'ws1': dict(ph=7.2,  turb=2.1,  temp=24.0, do_=8.0,  cond=415, nit=4.2,  cl=0.50, tds=280),
            'ws2': dict(ph=7.4,  turb=3.8,  temp=26.0, do_=7.2,  cond=520, nit=11.5, cl=0.30, tds=None),
            'ws3': dict(ph=7.8,  turb=8.5,  temp=27.0, do_=6.5,  cond=480, nit=9.8,  cl=None, tds=None),
            'ws4': dict(ph=7.3,  turb=1.8,  temp=23.0, do_=8.5,  cond=390, nit=3.5,  cl=None, tds=250),
            'ws5': dict(ph=8.2,  turb=2.5,  temp=25.0, do_=None, cond=445, nit=None, cl=None, tds=None),
        }

        StationReading.objects.all().delete()
        sr_rows = []
        random.seed(99)
        hours_back = 3 * 24  # 72 hourly readings per source
        for sid, p in station_profiles.items():
            ws = sources[sid]
            for i in range(hours_back - 1, -1, -1):
                t = now - timedelta(hours=i)
                hour = t.hour
                diurnal = math.sin((hour - 6) * math.pi / 12)

                def _v(base, spread):
                    return round(base + diurnal * spread * 0.3 + (random.random() - 0.5) * spread, 2) if base is not None else None

                sr_rows.append(StationReading(
                    station=ws,
                    timestamp=t,
                    ph=_v(p['ph'], 0.35),
                    turbidity=_v(p['turb'], 1.2),
                    temperature=_v(p['temp'], 1.5),
                    dissolved_oxygen=_v(p['do_'], 0.7) if p['do_'] is not None else None,
                    conductivity=_v(p['cond'], 40),
                    nitrates=_v(p['nit'], 1.5) if p['nit'] is not None else None,
                    free_chlorine=_v(p['cl'], 0.12) if p['cl'] is not None else None,
                    tds=_v(p['tds'], 25) if p['tds'] is not None else None,
                ))
        StationReading.objects.bulk_create(sr_rows)

        self.stdout.write(self.style.SUCCESS('Done. Database seeded successfully.'))
