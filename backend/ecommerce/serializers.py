from rest_framework import serializers
from django.utils import timezone
from .models import Categoria, Producto, Usuario, Pedido, DetallePedido, Carrito, Reseña, Notificacion, Transaccion, Envio, ReporteFalla, ReporteFallaFollowUp

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['categoria_id', 'nombre', 'descripcion', 'imagen_url', 'destacado']

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
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='usuario.apellido', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    transaccion_id = serializers.SerializerMethodField(read_only=True)
    detalles = serializers.SerializerMethodField(read_only=True)
    ultima_transaccion = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Pedido
        fields = '__all__'

    def get_transaccion_id(self, obj):
        try:
            from .models import Transaccion
            tid = (
                Transaccion.objects
                .filter(pedido_id=obj.pedido_id)
                .order_by('-transaccion_id')
                .values_list('transaccion_id', flat=True)
                .first()
            )
            return tid
        except Exception:
            return None

    def get_detalles(self, obj):
        try:
            dets = (
                DetallePedido.objects
                .filter(pedido_id=obj.pedido_id)
                .order_by('detalle_id')
            )
            return DetallePedidoSerializer(dets, many=True).data
        except Exception:
            return []

    def get_ultima_transaccion(self, obj):
        try:
            tx = (
                Transaccion.objects
                .filter(pedido_id=obj.pedido_id)
                .order_by('-transaccion_id')
                .values('transaccion_id', 'estado', 'metodo_pago', 'codigo_transaccion', 'fecha_transaccion', 'monto')
                .first()
            )
            return tx
        except Exception:
            return None

class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    class Meta:
        model = DetallePedido
        fields = '__all__'

class CarritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrito
        fields = '__all__'

class ReseñaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='usuario.apellido', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    class Meta:
        model = Reseña
        fields = '__all__'

class NotificacionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='usuario.apellido', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    class Meta:
        model = Notificacion
        fields = '__all__'

class TransaccionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='pedido.usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='pedido.usuario.apellido', read_only=True)
    usuario_email = serializers.CharField(source='pedido.usuario.email', read_only=True)
    usuario_id = serializers.IntegerField(source='pedido.usuario_id', read_only=True)
    class Meta:
        model = Transaccion
        fields = '__all__'

class EnvioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='pedido.usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='pedido.usuario.apellido', read_only=True)
    usuario_email = serializers.CharField(source='pedido.usuario.email', read_only=True)
    usuario_id = serializers.IntegerField(source='pedido.usuario_id', read_only=True)
    class Meta:
        model = Envio
        fields = '__all__'

class ReporteFallaFollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteFallaFollowUp
        fields = '__all__'
        read_only_fields = ['followup_id', 'fecha_creacion', 'autor_tipo', 'reporte']

class ReporteFallaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='usuario.apellido', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    followups = ReporteFallaFollowUpSerializer(many=True, read_only=True)

    class Meta:
        model = ReporteFalla
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 'usuario', 'imagen_url', 'video_url']
