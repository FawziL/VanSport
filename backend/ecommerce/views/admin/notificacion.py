from rest_framework import viewsets, permissions
from ecommerce.models import Notificacion
from ecommerce.serializers import NotificacionSerializer

class NotificacionViewSetAdmin(viewsets.ModelViewSet):
    queryset = Notificacion.objects.select_related('usuario')
    serializer_class = NotificacionSerializer

    def get_permissions(self):
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        return Notificacion.objects.select_related('usuario')