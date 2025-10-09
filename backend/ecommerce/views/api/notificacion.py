from rest_framework import viewsets, permissions
from ecommerce.models import Notificacion
from ecommerce.serializers import NotificacionSerializer

class NotificacionViewSetApi(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Notificacion.objects.filter(usuario_id=getattr(self.request.user, 'usuario_id', None))