from rest_framework import viewsets, permissions
from ..models import Transaccion
from ..serializers import TransaccionSerializer

class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all()
    serializer_class = TransaccionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Transaccion.objects.all()
        return Transaccion.objects.filter(pedido__usuario_id=getattr(user, 'usuario_id', None))