from rest_framework import viewsets, permissions
from ecommerce.models import DetallePedido
from ecommerce.serializers import DetallePedidoSerializer

class DetallePedidoViewSetApi(viewsets.ModelViewSet):
    queryset = DetallePedido.objects.all()
    serializer_class = DetallePedidoSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        usuario_id = getattr(user, 'usuario_id', None)
        qs = DetallePedido.objects.filter(pedido__usuario_id=usuario_id)
        pedido_id = self.request.query_params.get('pedido_id')
        if pedido_id:
            qs = qs.filter(pedido_id=pedido_id)
        return qs