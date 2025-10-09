from rest_framework import viewsets, permissions
from ..models import DetallePedido
from ..serializers import DetallePedidoSerializer

class DetallePedidoViewSet(viewsets.ModelViewSet):
    queryset = DetallePedido.objects.all()
    serializer_class = DetallePedidoSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return DetallePedido.objects.all()
        return DetallePedido.objects.filter(pedido__usuario_id=getattr(user, 'usuario_id', None))