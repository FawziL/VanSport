from rest_framework import viewsets, permissions
from ecommerce.models import Pedido
from ecommerce.serializers import PedidoSerializer

class PedidoViewSetAdmin(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related('usuario')
    serializer_class = PedidoSerializer

    def get_permissions(self):
        # Solo admin puede ver todos, usuarios normales solo sus pedidos
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base = Pedido.objects.select_related('usuario')
        if user.is_staff:
            return base
        return base.filter(usuario_id=getattr(user, 'usuario_id', None))