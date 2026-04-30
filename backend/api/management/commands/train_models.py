"""Train and persist ML models from all available sensor readings."""
import numpy as np
from django.core.management.base import BaseCommand

from api.ml.constants import PARAM_META, PARAMS
from api.ml.registry import list_models, model_exists, save_model
from api.ml.trainer import train_anomaly_detector, train_random_forest, train_ts_forecast
from api.models import HistoricalReading, StationReading, TimeSeriesReading


class Command(BaseCommand):
    help = (
        'Train ML models (ExponentialSmoothing per parameter, RandomForest per parameter, '
        'IsolationForest anomaly detector) from stored sensor readings.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--min-samples', type=int, default=4,
            help='Minimum complete readings required before training (default: 4)',
        )
        parser.add_argument(
            '--force', action='store_true',
            help='Retrain even if models already exist',
        )

    def handle(self, *args, **options):
        min_samples = options['min_samples']
        force = options['force']

        self.stdout.write('Collecting training data from all sources…')
        rows = self._collect_data()
        n = len(rows)
        self.stdout.write(f'  {n} complete readings found.')

        if n < min_samples:
            self.stdout.write(
                self.style.WARNING(
                    f'Only {n} complete readings (min {min_samples}). '
                    'Seed the database first: python manage.py seed_data'
                )
            )
            if n == 0:
                return

        X_full = np.array([[r[p] for p in PARAMS] for r in rows], dtype=float)

        # ── Time-series forecast model per parameter ──────────────────────────
        self.stdout.write('\nTraining time-series forecast models (ExponentialSmoothing)…')
        for param in PARAMS:
            name = f'ts_forecast_{param}'
            if model_exists(name) and not force:
                self.stdout.write(f'  – {name}: already trained (use --force to retrain)')
                continue
            values = [r[param] for r in rows]
            model = train_ts_forecast(values)
            if model is not None:
                save_model(name, model)
                model_type = type(model.model).__name__
                self.stdout.write(self.style.SUCCESS(f'  ✓ {name} ({model_type}, {n} samples)'))
            else:
                self.stdout.write(self.style.WARNING(f'  ✗ {name} — need ≥4 samples (have {n})'))

        # ── Random Forest per parameter (others as features) ──────────────────
        self.stdout.write('\nTraining Random Forest feature-importance models…')
        for param in PARAMS:
            name = f'rf_{param}'
            if model_exists(name) and not force:
                self.stdout.write(f'  – {name}: already trained (use --force to retrain)')
                continue
            feature_cols = [p for p in PARAMS if p != param]
            X = np.array([[r[p] for p in feature_cols] for r in rows], dtype=float)
            y = np.array([r[param] for r in rows], dtype=float)
            model = train_random_forest(X, y)
            if model is not None:
                save_model(name, model)
                top = sorted(
                    zip(feature_cols, model.feature_importances_),
                    key=lambda t: t[1], reverse=True,
                )[0]
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ {name} ({n} samples, top feature: {top[0]} {top[1]:.2f})'
                    )
                )
            else:
                self.stdout.write(self.style.WARNING(f'  ✗ {name} — need ≥10 samples (have {n})'))

        # ── Anomaly detector (IsolationForest on all parameters) ──────────────
        self.stdout.write('\nTraining anomaly detector (IsolationForest)…')
        name = 'anomaly_detector'
        if model_exists(name) and not force:
            self.stdout.write(f'  – {name}: already trained (use --force to retrain)')
        else:
            model = train_anomaly_detector(X_full)
            if model is not None:
                save_model(name, model)
                self.stdout.write(self.style.SUCCESS(f'  ✓ {name} ({n} samples)'))
            else:
                self.stdout.write(self.style.WARNING(f'  ✗ {name} — need ≥10 samples (have {n})'))

        # ── Update RegionPrediction with ML-derived forecasts ─────────────────
        self.stdout.write('\nUpdating RegionPrediction from ML forecasts…')
        self._update_region_predictions(rows)

        trained = list_models()
        self.stdout.write(
            self.style.SUCCESS(f'\nDone. {len(trained)} model(s) on disk: {trained}')
        )

    # ── helpers ───────────────────────────────────────────────────────────────

    def _collect_data(self) -> list:
        """Return list of dicts with all PARAMS fields, from every data source."""
        rows = []

        # TimeSeriesReading — non-nullable fields
        for r in TimeSeriesReading.objects.order_by('timestamp').values(*PARAMS):
            if all(r[p] is not None for p in PARAMS):
                rows.append({p: float(r[p]) for p in PARAMS})

        # StationReading — nullable; skip incomplete rows
        for r in StationReading.objects.order_by('timestamp').values(*PARAMS):
            if all(r[p] is not None for p in PARAMS):
                rows.append({p: float(r[p]) for p in PARAMS})

        # HistoricalReading — data is a JSONField with arbitrary keys
        for r in HistoricalReading.objects.order_by('timestamp').values('data'):
            data = r['data']
            if isinstance(data, dict) and all(p in data for p in PARAMS):
                try:
                    rows.append({p: float(data[p]) for p in PARAMS})
                except (ValueError, TypeError):
                    pass

        return rows

    def _update_region_predictions(self, rows: list):
        """
        Recompute RegionPrediction risk_score and next_risk using ML forecasts.
        Only updates existing records; does not create new ones.
        """
        # Avoid circular import — models are only needed at runtime
        from api.ml.predictor import forecast_parameter
        from api.models import RegionPrediction

        preds = RegionPrediction.objects.select_related('region').all()
        if not preds.exists():
            self.stdout.write('  No RegionPrediction rows to update.')
            return

        # Use global timeseries values for each param
        param_values = {p: [r[p] for r in rows] for p in PARAMS}

        for pred in preds:
            # Forecast 7 days for nitrates and turbidity (top contamination indicators)
            risk_scores = []
            for param in ('nitrates', 'turbidity', 'ph'):
                _, _, safe_min, safe_max = PARAM_META[param]
                result = forecast_parameter(param, param_values[param], days=7)
                for pt in result['forecast']:
                    span = safe_max - safe_min or 1
                    score = max(0.0, min(1.0, (pt['value'] - safe_min) / span))
                    risk_scores.append(score)

            if not risk_scores:
                continue

            avg_score = sum(risk_scores) / len(risk_scores)
            new_risk_score = round(avg_score * 100)

            # Determine trend by comparing first-half vs second-half forecast scores
            mid = len(risk_scores) // 2
            first_half = sum(risk_scores[:mid]) / mid if mid else avg_score
            second_half = sum(risk_scores[mid:]) / (len(risk_scores) - mid) if mid else avg_score
            delta = second_half - first_half
            if delta > 0.03:
                next_risk = 'rising'
            elif delta < -0.03:
                next_risk = 'falling'
            else:
                next_risk = 'stable'

            if new_risk_score >= 60:
                risk_level = 'danger'
            elif new_risk_score >= 30:
                risk_level = 'warning'
            else:
                risk_level = 'safe'

            pred.risk_score = new_risk_score
            pred.risk_level = risk_level
            pred.next_risk = next_risk
            pred.save(update_fields=['risk_score', 'risk_level', 'next_risk'])
            self.stdout.write(
                f'  {pred.region.name}: score={new_risk_score} level={risk_level} trend={next_risk}'
            )
