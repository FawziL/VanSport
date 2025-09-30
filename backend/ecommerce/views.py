from rest_framework import viewsets
from .models import Categoria, Producto, Usuario, Pedido, DetallePedido, Carrito, Reseña, Notificacion, Transaccion, Envio
from .serializers import (
	CategoriaSerializer, ProductoSerializer, UsuarioSerializer, PedidoSerializer,
	DetallePedidoSerializer, CarritoSerializer, ReseñaSerializer, NotificacionSerializer,
	TransaccionSerializer, EnvioSerializer
)

class CategoriaViewSet(viewsets.ModelViewSet):
	queryset = Categoria.objects.all()
	serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
	queryset = Producto.objects.all()
	serializer_class = ProductoSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
	queryset = Usuario.objects.all()
	serializer_class = UsuarioSerializer

class PedidoViewSet(viewsets.ModelViewSet):
	queryset = Pedido.objects.all()
	serializer_class = PedidoSerializer

class DetallePedidoViewSet(viewsets.ModelViewSet):
	queryset = DetallePedido.objects.all()
	serializer_class = DetallePedidoSerializer

class CarritoViewSet(viewsets.ModelViewSet):
	queryset = Carrito.objects.all()
	serializer_class = CarritoSerializer

class ReseñaViewSet(viewsets.ModelViewSet):
	queryset = Reseña.objects.all()
	serializer_class = ReseñaSerializer

class NotificacionViewSet(viewsets.ModelViewSet):
	queryset = Notificacion.objects.all()
	serializer_class = NotificacionSerializer

class TransaccionViewSet(viewsets.ModelViewSet):
	queryset = Transaccion.objects.all()
	serializer_class = TransaccionSerializer

class EnvioViewSet(viewsets.ModelViewSet):
	queryset = Envio.objects.all()
	serializer_class = EnvioSerializer
