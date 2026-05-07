import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_who_parameters_sensor_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stationreading',
            name='timestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
