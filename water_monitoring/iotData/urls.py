from django.urls import path
from . import views

urlpatterns = [
    
    path('', views.index, name='index'),
    path('Login', views.Login, name='Login'),
    path('Logout', views.Logout, name='Logout'),
    path('result/<str:username>/', views.result, name='result'),
    path('home', views.home, name='home'),
]
