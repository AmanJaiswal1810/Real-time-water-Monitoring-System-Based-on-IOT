from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.models import auth
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from django.views import View

from django.http import JsonResponse
from django.views import View

from iotData.serializers import IotDataSerializer

from .models import IotData

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
            salinity=data.get('salinity'),  # New field: salinity
        )
        iotData.save()
        return Response(data, status=status.HTTP_200_OK)
    def options(self, request, *args, **kwargs):
        response = JsonResponse({'message': 'CORS allowed'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response


