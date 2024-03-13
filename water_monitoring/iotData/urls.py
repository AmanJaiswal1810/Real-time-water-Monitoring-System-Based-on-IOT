from django.urls import path
from . import views

urlpatterns = [
    
    path('', views.index, name='index'),
    path('Login', views.Login, name='Login'),
    path('Logout', views.Logout, name='Logout'),
    path('result/<str:username>/', views.result, name='result'),
    path('home', views.home, name='home'),
    path('SendEmail', views.SendEmail, name='SendEmail'),
    path('checkview/<str:username>/', views.checkview, name='checkview'),
    path('<str:room>/', views.room, name='room'),
    path('send', views.send, name='send'),
    path('getMessages/<str:room>/', views.getMessages, name='getMessages'),
    path('blogs',views.blogs, name='blogs'),
    path('Posts/<str:pk>', views.Posts, name='Posts'),
]
