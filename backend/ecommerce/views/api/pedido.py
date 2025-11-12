from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, connection
from django.utils import timezone
from decimal import Decimal
from ecommerce.models import Pedido
from ecommerce.serializers import PedidoSerializer
from ecommerce.models import Carrito, Producto, DetallePedido

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

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        """Crea un pedido a partir del carrito del usuario autenticado."""
        user = request.user
        usuario_id = getattr(user, 'usuario_id', None)
        if not usuario_id:
            return Response({'error': 'Usuario no autenticado.'}, status=status.HTTP_401_UNAUTHORIZED)

        direccion_envio = request.data.get('direccion_envio') or ''
        notas = request.data.get('notas') or ''

        items = list(Carrito.objects.filter(usuario_id=usuario_id))
        if not items:
            return Response({'error': 'El carrito está vacío.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            total = Decimal('0.00')
            detalles_payload = []

            # Consolidar cantidades por producto para evitar duplicados
            cantidades_por_producto = {}
            for it in items:
                cantidades_por_producto[it.producto_id] = cantidades_por_producto.get(it.producto_id, 0) + int(it.cantidad)

            # Validar stock y calcular totales por producto usando lock
            for producto_id, cantidad_total in cantidades_por_producto.items():
                prod = Producto.objects.select_for_update().get(producto_id=producto_id)
                if prod.stock < cantidad_total:
                    return Response({'error': f'Stock insuficiente para {prod.nombre}.'}, status=status.HTTP_400_BAD_REQUEST)
                precio_unit = prod.precio_oferta if getattr(prod, 'precio_oferta', None) not in (None, '') else prod.precio
                subtotal = (precio_unit * cantidad_total)
                total += subtotal
                detalles_payload.append({
                    'producto_id': prod.producto_id,
                    'precio_unitario': precio_unit,
                    'cantidad': cantidad_total,
                })

            # Crear pedido
            pedido = Pedido.objects.create(
                usuario_id=usuario_id,
                fecha_pedido=timezone.now(),
                estado='pendiente',
                total=total,
                direccion_envio=direccion_envio,
                notas=notas,
            )

            # Crear detalles y descontar stock
            for det in detalles_payload:
                # Insert explícito sin la columna generada 'subtotal'
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO detalles_pedido (pedido_id, producto_id, precio_unitario, cantidad)
                        VALUES (%s, %s, %s, %s)
                        """,
                        [pedido.pedido_id, det['producto_id'], det['precio_unitario'], det['cantidad']]
                    )
                # Descontar stock
                prod = Producto.objects.get(producto_id=det['producto_id'])
                prod.stock = prod.stock - det['cantidad']
                prod.save()

            # Limpiar carrito
            Carrito.objects.filter(usuario_id=usuario_id).delete()

        data = PedidoSerializer(pedido).data
        return Response({'message': 'Pedido creado', 'pedido': data}, status=status.HTTP_201_CREATED)