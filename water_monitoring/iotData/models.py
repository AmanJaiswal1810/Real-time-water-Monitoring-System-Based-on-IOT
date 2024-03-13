from django.utils import timezone
from django.db import models

class IotData(models.Model):
    temperature = models.FloatField()
    pHValue = models.FloatField()
    turbidity = models.FloatField()
    username = models.CharField(max_length=100)  # New field: username
    password = models.CharField(max_length=100,default=timezone.now)  # New field: password
    dissolved_oxygen = models.FloatField(default = 0.0)  # New field: salinity
