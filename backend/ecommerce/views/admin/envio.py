from rest_framework import viewsets, permissions
from ecommerce.models import Envio
from ecommerce.serializers import EnvioSerializer

class EnvioViewSetAdmin(viewsets.ModelViewSet):
    queryset = Envio.objects.select_related('pedido', 'pedido__usuario')
    serializer_class = EnvioSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]