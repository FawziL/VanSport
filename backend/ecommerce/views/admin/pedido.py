from rest_framework import viewsets, permissions
from ecommerce.models import Pedido
from ecommerce.serializers import PedidoSerializer

class PedidoViewSetAdmin(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def get_permissions(self):
        # Solo admin puede ver todos, usuarios normales solo sus pedidos
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Pedido.objects.all()
        return Pedido.objects.filter(usuario_id=getattr(user, 'usuario_id', None))