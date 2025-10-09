from django.urls import path
from ecommerce.views.auth.auth import RegisterView, LoginView, MeView, PasswordResetView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('me/', MeView.as_view(), name='me'),
]