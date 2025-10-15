from rest_framework import viewsets, permissions
from ecommerce.models import Transaccion
from ecommerce.serializers import TransaccionSerializer

class TransaccionViewSetAdmin(viewsets.ModelViewSet):
    queryset = Transaccion.objects.select_related('pedido', 'pedido__usuario')
    serializer_class = TransaccionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base = Transaccion.objects.select_related('pedido', 'pedido__usuario')
        if user.is_staff:
            return base
        return base.filter(pedido__usuario_id=getattr(user, 'usuario_id', None))