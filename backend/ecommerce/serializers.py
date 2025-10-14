from rest_framework import serializers
from django.utils import timezone
from .models import Categoria, Producto, Usuario, Pedido, DetallePedido, Carrito, Reseña, Notificacion, Transaccion, Envio

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['categoria_id', 'nombre', 'descripcion']

class ProductoSerializer(serializers.ModelSerializer):
    # Leer: objeto anidado de la categoría
    categoria = CategoriaSerializer(read_only=True)
    # Escribir: ID de la categoría
    categoria_id = serializers.PrimaryKeyRelatedField(
        source='categoria', queryset=Categoria.objects.all(), write_only=True, required=True
    )
    # No viene del cliente: usar por defecto ahora si falta
    fecha_creacion = serializers.DateTimeField(required=False, default=timezone.now)

    class Meta:
        model = Producto
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'

class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = '__all__'

class CarritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrito
        fields = '__all__'

class ReseñaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reseña
        fields = '__all__'

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = '__all__'

class EnvioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Envio
        fields = '__all__'
