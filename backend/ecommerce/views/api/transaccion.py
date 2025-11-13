from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from ecommerce.models import Transaccion, Pedido
from ecommerce.serializers import TransaccionSerializer

class TransaccionViewSetApi(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all()
    serializer_class = TransaccionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return Transaccion.objects.filter(pedido__usuario_id=getattr(user, 'usuario_id', None))

    @action(detail=False, methods=['post'], url_path='pay')
    def pay(self, request):
        """Crea una transacción de pago con comprobante para revisión (no marca el pedido como pagado)."""
        user = request.user
        usuario_id = getattr(user, 'usuario_id', None)
        pedido_id = request.data.get('pedido_id')
        monto = request.data.get('monto')
        metodo_pago = request.data.get('metodo_pago', 'transferencia')
        codigo_transaccion = request.data.get('codigo_transaccion', '')
        referencia = request.data.get('referencia', '')

        if not pedido_id:
            return Response({'error': 'pedido_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pedido = Pedido.objects.get(pedido_id=pedido_id, usuario_id=usuario_id)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Usar el total del pedido si no se envía monto
        try:
            monto_decimal = Decimal(str(monto)) if monto is not None else pedido.total
        except Exception:
            return Response({'error': 'monto inválido'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            tx = Transaccion.objects.create(
                pedido_id=pedido.pedido_id,
                monto=monto_decimal,
                metodo_pago=metodo_pago,
                estado='pendiente',  # queda pendiente para revisión del admin
                fecha_transaccion=timezone.now(),
                codigo_transaccion=codigo_transaccion or '',
                referencia=referencia or '',
            )
            # No cambiar estado del pedido aquí; el admin lo actualizará tras revisión

        return Response(TransaccionSerializer(tx).data, status=status.HTTP_201_CREATED)