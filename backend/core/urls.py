from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/', include('ecommerce.routes.urls')),
    path('auth/', include('ecommerce.routes.urls_auth')),
    path('admin/', include('ecommerce.routes.urls_admin')),
]