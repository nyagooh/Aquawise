from django.urls import path
from . import views
from . import auth_views
from . import stats_views

urlpatterns = [
    # ── Existing data endpoints ────────────────────────────────────────────────
    path('regions/', views.regions),
    path('sensor-readings/', views.sensor_readings),
    path('timeseries/', views.timeseries),
    path('water-sources/', views.water_sources),
    path('water-sources/<str:source_id>/', views.water_source_detail),
    path('water-sources/<str:source_id>/readings/', views.water_source_readings),
    path('alerts/', views.alerts),
    path('alerts/<str:alert_id>/', views.alert_detail),
    path('alerts/<str:alert_id>/acknowledge/', views.alert_acknowledge),
    path('alerts/<str:alert_id>/resolve/', views.alert_resolve),
    path('predictions/', views.predictions),
    path('ingest/', views.ingest),

    # ── Statistics ────────────────────────────────────────────────────────────
    path('statistics/summary/', stats_views.statistics_summary),
    path('statistics/distribution/', stats_views.statistics_distribution),
    path('statistics/compliance/', stats_views.statistics_compliance),
    path('readings/aggregate/', stats_views.readings_aggregate),

    # ── Auth ──────────────────────────────────────────────────────────────────
    path('auth/register/', auth_views.register),
    path('auth/login/', auth_views.login),
    path('auth/logout/', auth_views.logout),

    # ── User profile ──────────────────────────────────────────────────────────
    path('users/me/', auth_views.me),
    path('users/me/change-password/', auth_views.change_password),
    path('users/me/api-keys/', auth_views.api_keys),
    path('users/me/notifications/', auth_views.notifications),
    path('users/me/2fa/enable/', auth_views.enable_2fa),
]
