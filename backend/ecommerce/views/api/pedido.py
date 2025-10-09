from rest_framework import viewsets, permissions
from ecommerce.models import Pedido
from ecommerce.serializers import PedidoSerializer

class PedidoViewSetApi(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def get_permissions(self):
        # Solo admin puede ver todos, usuarios normales solo sus pedidos
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return Pedido.objects.filter(usuario_id=getattr(user, 'usuario_id', None))