from rest_framework import viewsets, permissions
from ecommerce.models import Transaccion
from ecommerce.serializers import TransaccionSerializer
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status

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

    def update(self, request, *args, **kwargs):
        """Al actualizar una transacción, sincroniza el estado del pedido."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            self.perform_update(serializer)
            # Mapear estado de transacción a estado de pedido
            tx = serializer.instance
            pedido = tx.pedido
            estado_tx = (tx.estado or '').lower()
            if estado_tx in ('aprobado', 'aprobada', 'approved'):
                pedido.estado = 'pagado'
            elif estado_tx in ('rechazado', 'rechazada', 'rejected'):
                pedido.estado = 'rechazado'
            elif estado_tx in ('pendiente', 'pending'):
                # no cambiar
                pass
            elif estado_tx in ('completado', 'completed'):
                pedido.estado = 'completado'
            pedido.save()
        return Response(serializer.data, status=status.HTTP_200_OK)