from django.utils import timezone
from django.db import models
from datetime import datetime

class IotData(models.Model):
    temperature = models.FloatField()
    pHValue = models.FloatField()
    turbidity = models.FloatField()
    username = models.CharField(max_length=100)  # New field: username
    password = models.CharField(max_length=100,default=timezone.now)  # New field: password
    dissolved_oxygen = models.FloatField(default = 0.0)  # New field: salinity

class ContactFormSubmission(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject


class Room(models.Model):
    name = models.CharField(max_length=100)

class Message(models.Model):
    value = models.CharField(max_length=10000000)
    date = models.DateTimeField(default = datetime.now, blank = True)
    user = models.CharField(max_length=100000)
    room = models.CharField(max_length=1000000)
    
class post(models.Model):
    title = models.CharField(max_length=100)
    body = models.CharField(max_length=1000000)
    created_at = models.DateTimeField(default = datetime.now, blank=True)

