from django.forms import ValidationError
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.models import auth
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from django.views import View
from iotData.serializers import IotDataSerializer
from .models import IotData
from django.core.mail import send_mail
from .models import ContactFormSubmission
from .models import Room
from .models import Message
from .models import post

def index(request):
    return render(request, 'index.html')

def Login(request):
    if request.method == 'POST':
        Username = request.POST['username']
        Password = request.POST['password']
        user = auth.authenticate(username = Username, password = Password)
        if user is not None:
            auth.login(request, user)
            return redirect('/')
        else:
            messages.info(request,"Invalid credentials/ User does not exists")
            return redirect('Login')
    else :
        return render(request, 'Login.html')

def Logout(request):
    auth.logout(request)
    return redirect('/')

def result(request, username):
    return render(request, 'result.html',{'username':username})

def home(request):
    return redirect('/')

class iotDataView(APIView):
    def get(self, request):
        data = IotData.objects.all()
        serializer = IotDataSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')

        # Check if the username already exists
        if not User.objects.filter(username=username).exists():
            # Username is unique, create a new user
            user = User.objects.create_user(username=username, password=password)
            user.save()


        iotData = IotData.objects.create(
            temperature=data.get('temperature'),
            pHValue=data.get('pHValue'),
            turbidity=data.get('turbidity'),
            username=data.get('username'),  # New field: username
            password=data.get('password'),  # New field: password
            dissolved_oxygen=data.get('dissolved_oxygen'),  # New field: salinity
        )
        iotData.save()
        return Response(data, status=status.HTTP_200_OK)

    def options(self, request, *args, **kwargs):
        response = JsonResponse({'message': 'CORS allowed'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response


def SendEmail(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')

        # Save form submission to the database
        submission = ContactFormSubmission.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message
        )

        # Optionally, send confirmation email, process data, etc.

        return JsonResponse({'message': 'success'})
    else:
        return JsonResponse({'message': 'error'})

def room(request, room):
    username = request.GET.get('username')
    room_details = Room.objects.get(name = room)
    return render(request, 'room.html', {
        'username':username,
        'room':room,
        'room_details':room_details
    })

def checkview(request, username):
    room = 'Groupchat'
    return redirect('/'+room+'/?username='+username)

def send(request):
    username = request.POST['username']
    room_id = request.POST['room_id']
    message = request.POST['message']
    
    new_message = Message.objects.create(value = message, user=username, room=room_id)
    new_message.save()
    return HttpResponse('Message sent succesfully')

def getMessages(request, room):
    room_details = Room.objects.get(name=room)
    messages = Message.objects.filter(room=room_details.id)
    return JsonResponse({'messages': list(messages.values())})

def blogs(request):
    Post = post.objects.all()
    return render(request,'blogs.html',{'Post':Post})

def Posts(request, pk):
    Posts = post.objects.get(id=pk)
    return render(request, 'Posts.html', {'Posts' : Posts})