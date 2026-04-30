from django.db import models
from django.contrib.auth.models import User

RISK_CHOICES = [('safe', 'Safe'), ('warning', 'Warning'), ('danger', 'Danger')]


class Region(models.Model):
    region_id = models.CharField(max_length=10, unique=True)  # r1, r2, …
    name = models.CharField(max_length=100)
    water_body = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class WaterSource(models.Model):
    source_id = models.CharField(max_length=10, unique=True)  # ws1, ws2, …
    name = models.CharField(max_length=200)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='water_sources')
    risk = models.CharField(max_length=10, choices=RISK_CHOICES)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SensorParameter(models.Model):
    """Current live sensor reading for each measured parameter."""
    param_id = models.CharField(max_length=50, unique=True)  # temperature, turbidity, …
    name = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=20)
    safe_min = models.FloatField()
    safe_max = models.FloatField()
    is_real = models.BooleanField(default=False)
    description = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name}: {self.value} {self.unit}'


class TimeSeriesReading(models.Model):
    """One data point in the 24-hour parameter history."""
    timestamp = models.DateTimeField()
    temperature = models.FloatField()
    turbidity = models.FloatField()
    ph = models.FloatField()
    dissolved_oxygen = models.FloatField()
    conductivity = models.FloatField()
    nitrates = models.FloatField()

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return str(self.timestamp)


ALERT_STATUS_CHOICES = [
    ('active', 'Active'),
    ('acknowledged', 'Acknowledged'),
    ('resolved', 'Resolved'),
]


class Alert(models.Model):
    alert_id = models.CharField(max_length=10, unique=True)
    time_label = models.CharField(max_length=50)   # "08:42 AM", "Yesterday"
    source = models.CharField(max_length=200)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='alerts')
    parameter = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    risk = models.CharField(max_length=10, choices=RISK_CHOICES)
    action = models.TextField()
    status = models.CharField(max_length=15, choices=ALERT_STATUS_CHOICES, default='active')
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.alert_id}: {self.parameter} at {self.source}'


class RegionPrediction(models.Model):
    NEXT_RISK_CHOICES = [('rising', 'Rising'), ('falling', 'Falling'), ('stable', 'Stable')]

    region = models.OneToOneField(Region, on_delete=models.CASCADE, related_name='prediction')
    risk_score = models.IntegerField()
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES)
    prediction_text = models.TextField()
    next_risk = models.CharField(max_length=10, choices=NEXT_RISK_CHOICES)
    contamination_probability = models.IntegerField()
    top_concern = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.region.name} prediction'


class ForecastDay(models.Model):
    prediction = models.ForeignKey(
        RegionPrediction, on_delete=models.CASCADE, related_name='forecast_days'
    )
    day = models.CharField(max_length=10)
    score = models.IntegerField()
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']


class StationReading(models.Model):
    """Live reading posted by a physical station (e.g. Arduino over HTTP)."""
    station = models.ForeignKey(
        WaterSource, on_delete=models.SET_NULL, null=True, blank=True, related_name='readings'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField(null=True, blank=True)
    turbidity = models.FloatField(null=True, blank=True)
    ph = models.FloatField(null=True, blank=True)
    dissolved_oxygen = models.FloatField(null=True, blank=True)
    conductivity = models.FloatField(null=True, blank=True)
    nitrates = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.station} @ {self.timestamp:%Y-%m-%d %H:%M}'


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    avatar = models.CharField(max_length=500, blank=True)
    two_fa_enabled = models.BooleanField(default=False)
    two_fa_secret = models.CharField(max_length=64, blank=True)
    notification_email = models.BooleanField(default=True)
    notification_sms = models.BooleanField(default=False)
    notification_push = models.BooleanField(default=False)
    notification_critical = models.BooleanField(default=True)
    notification_warning = models.BooleanField(default=True)
    notification_daily_digest = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.email} profile'


class ApiKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — {self.name}'
