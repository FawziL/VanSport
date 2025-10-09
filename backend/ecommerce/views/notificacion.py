from rest_framework import viewsets, permissions
from ..models import Notificacion
from ..serializers import NotificacionSerializer

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Notificacion.objects.filter(usuario_id=getattr(self.request.user, 'usuario_id', None))