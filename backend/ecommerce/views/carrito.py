from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import F
from ..models import Carrito, Producto
from ..serializers import CarritoSerializer

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo mostrar el carrito del usuario autenticado
        user = self.request.user
        return Carrito.objects.filter(usuario_id=getattr(user, 'usuario_id', None))

    def perform_create(self, serializer):
        # Forzar que el carrito sea del usuario autenticado
        serializer.save(usuario_id=self.request.user.usuario_id, fecha_agregado=timezone.now())

    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        """
        Agrega un producto al carrito o incrementa cantidad si ya existe.
        Campos requeridos: producto_id, cantidad
        """
        user = request.user
        producto_id = request.data.get('producto_id')
        cantidad = int(request.data.get('cantidad', 1))
        if not producto_id or cantidad <= 0:
            return Response({'error': 'producto_id y cantidad > 0 son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = Producto.objects.get(producto_id=producto_id, activo=True)
        except Producto.DoesNotExist:
            return Response({'error': 'Producto no encontrado o inactivo.'}, status=status.HTTP_404_NOT_FOUND)

        # Verificar stock disponible
        if producto.stock < cantidad:
            return Response({'error': 'Stock insuficiente.'}, status=status.HTTP_400_BAD_REQUEST)

        item, created = Carrito.objects.get_or_create(
            usuario_id=user.usuario_id,
            producto_id=producto_id,
            defaults={'cantidad': cantidad, 'fecha_agregado': timezone.now()}
        )
        if not created:
            item.cantidad += cantidad
            item.save()

        return Response(CarritoSerializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='update-quantity')
    def update_quantity(self, request):
        """
        Actualiza la cantidad de un ítem del carrito.
        Campos requeridos: producto_id, cantidad
        """
        user = request.user
        producto_id = request.data.get('producto_id')
        cantidad = int(request.data.get('cantidad', 1))

        try:
            item = Carrito.objects.get(usuario_id=user.usuario_id, producto_id=producto_id)
        except Carrito.DoesNotExist:
            return Response({'error': 'Ítem no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if cantidad <= 0:
            item.delete()
            return Response({'message': 'Ítem eliminado por cantidad <= 0.'}, status=status.HTTP_200_OK)

        # Verificar stock
        producto = Producto.objects.get(producto_id=producto_id)
        if producto.stock < cantidad:
            return Response({'error': 'Stock insuficiente.'}, status=status.HTTP_400_BAD_REQUEST)

        item.cantidad = cantidad
        item.save()
        return Response(CarritoSerializer(item).data)

    @action(detail=False, methods=['post'], url_path='remove')
    def remove_item(self, request):
        """
        Elimina un producto del carrito.
        Campos requeridos: producto_id
        """
        user = request.user
        producto_id = request.data.get('producto_id')
        deleted, _ = Carrito.objects.filter(usuario_id=user.usuario_id, producto_id=producto_id).delete()
        if deleted == 0:
            return Response({'error': 'Ítem no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Ítem eliminado.'})

    @action(detail=False, methods=['post'], url_path='clear')
    def clear_cart(self, request):
        """
        Limpia todo el carrito del usuario.
        """
        user = request.user
        Carrito.objects.filter(usuario_id=user.usuario_id).delete()
        return Response({'message': 'Carrito limpiado.'})