from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from django.views.generic import TemplateView
from .views import RegisterView, MeView, PasswordResetView, LoginView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('me/', MeView.as_view(), name='me'),
]
