from rest_framework import viewsets, permissions
from ..models import Envio
from ..serializers import EnvioSerializer

class EnvioViewSet(viewsets.ModelViewSet):
    queryset = Envio.objects.all()
    serializer_class = EnvioSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Envio.objects.all()
        return Envio.objects.filter(pedido__usuario_id=getattr(user, 'usuario_id', None))