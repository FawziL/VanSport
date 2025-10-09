from rest_framework import viewsets, permissions
from ecommerce.models import Envio
from ecommerce.serializers import EnvioSerializer

class EnvioViewSetApi(viewsets.ModelViewSet):
    queryset = Envio.objects.all()
    serializer_class = EnvioSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return Envio.objects.filter(pedido__usuario_id=getattr(user, 'usuario_id', None))