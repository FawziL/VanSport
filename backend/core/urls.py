from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('ecommerce.routes.urls')),
    path('auth/', include('ecommerce.routes.urls_auth')),
    path('admin/', include('ecommerce.routes.urls_admin')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)