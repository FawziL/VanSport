from django.urls import path
from ecommerce.views.auth.auth import RegisterView, LoginView, MeView, PasswordResetView, PasswordResetConfirmView
from ecommerce.views.auth.root import AuthRootView

urlpatterns = [
    path('', AuthRootView.as_view(), name='auth-root'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),  # <-- nuevo
    path('me/', MeView.as_view(), name='me'),
]