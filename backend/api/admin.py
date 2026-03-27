from django.contrib import admin
from .models import Region, WaterSource, SensorParameter, TimeSeriesReading, Alert, RegionPrediction, ForecastDay

admin.site.register(Region)
admin.site.register(WaterSource)
admin.site.register(SensorParameter)
admin.site.register(TimeSeriesReading)
admin.site.register(Alert)
admin.site.register(RegionPrediction)
admin.site.register(ForecastDay)
