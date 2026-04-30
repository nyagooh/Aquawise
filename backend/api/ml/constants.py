PARAMS = ['temperature', 'turbidity', 'ph', 'dissolved_oxygen', 'conductivity', 'nitrates']

# (label, unit, safe_min, safe_max)
PARAM_META = {
    'temperature':      ('Temperature',      '°C',     15.0,  30.0),
    'turbidity':        ('Turbidity',        'NTU',     0.0,   5.0),
    'ph':               ('pH Level',         'pH',      6.5,   8.5),
    'dissolved_oxygen': ('Dissolved Oxygen', 'mg/L',    6.0,  14.0),
    'conductivity':     ('Conductivity',     'µS/cm', 200.0, 800.0),
    'nitrates':         ('Nitrates',         'mg/L',    0.0,  10.0),
}
