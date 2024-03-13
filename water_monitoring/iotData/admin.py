from django.contrib import admin
from .models import IotData
from .models import ContactFormSubmission
from .models import Room
from .models import Message

admin.site.register(IotData)
admin.site.register(ContactFormSubmission)
admin.site.register(Room)
admin.site.register(Message)
# Register your models here.
