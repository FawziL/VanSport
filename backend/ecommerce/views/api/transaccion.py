from rest_framework import viewsets, permissions
from ecommerce.models import Transaccion
from ecommerce.serializers import TransaccionSerializer

class TransaccionViewSetApi(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all()
    serializer_class = TransaccionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return Transaccion.objects.filter(pedido__usuario_id=getattr(user, 'usuario_id', None))