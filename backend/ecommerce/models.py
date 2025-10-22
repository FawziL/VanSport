from django.db import models
from django.contrib.auth.models import BaseUserManager, PermissionsMixin, AbstractBaseUser
from uuid import uuid4

class Categoria(models.Model):
	categoria_id = models.AutoField(primary_key=True, db_column='categoria_id')
	nombre = models.CharField(max_length=100)
	descripcion = models.TextField(blank=True)
	imagen_url = models.CharField(max_length=255, blank=True)
	destacado = models.BooleanField(default=False, db_column='destacado')

	class Meta:
		db_table = 'categorias'
		managed = False

class Usuario(models.Model):
	usuario_id = models.AutoField(primary_key=True, db_column='usuario_id')
	nombre = models.CharField(max_length=100)
	apellido = models.CharField(max_length=100)
	email = models.CharField(max_length=255, unique=True)
	password = models.CharField(max_length=128, db_column='contraseña_hash')
	direccion = models.TextField(blank=True)
	telefono = models.CharField(max_length=20, blank=True)
	fecha_registro = models.DateTimeField(auto_now_add=True)
	is_active = models.BooleanField(default=True, db_column='activo')
	is_staff = models.BooleanField(default=False, db_column='is_staff')

	# Agrega estas propiedades para que DRF te reconozca como usuario válido autenticado
	@property
	def is_authenticated(self):
		# Esta propiedad debe devolver True para instancias de usuarios reales
		return True

	@property
	def is_anonymous(self):
		return False

	class Meta:
		db_table = 'usuarios'
		managed = False

class Producto(models.Model):
    producto_id = models.AutoField(primary_key=True, db_column='producto_id')
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    precio_oferta = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, db_column='precio_oferta')
    stock = models.IntegerField()
    categoria = models.ForeignKey(Categoria, on_delete=models.DO_NOTHING, db_column='categoria_id')
    imagen_url = models.CharField(max_length=255, blank=True)
    fecha_creacion = models.DateTimeField(db_column='fecha_creacion', auto_now_add=False)
    activo = models.BooleanField(default=True)
    destacado = models.BooleanField(default=False, db_column='destacado')
    imagenes_adicionales = models.JSONField(null=True, blank=True, db_column='imagenes_adicionales')  # <-- nuevo

    class Meta:
        db_table = 'productos'
        managed = False

class Pedido(models.Model):
	pedido_id = models.AutoField(primary_key=True, db_column='pedido_id')
	usuario = models.ForeignKey(Usuario, on_delete=models.DO_NOTHING, db_column='usuario_id')
	fecha_pedido = models.DateTimeField(db_column='fecha_pedido')
	estado = models.CharField(max_length=50)
	total = models.DecimalField(max_digits=10, decimal_places=2)
	direccion_envio = models.TextField(blank=True, db_column='direccion_envio')
	notas = models.TextField(blank=True)

	class Meta:
		db_table = 'pedidos'
		managed = False

class DetallePedido(models.Model):
	detalle_id = models.AutoField(primary_key=True, db_column='detalle_id')
	pedido = models.ForeignKey(Pedido, on_delete=models.DO_NOTHING, db_column='pedido_id')
	producto = models.ForeignKey(Producto, on_delete=models.DO_NOTHING, db_column='producto_id')
	precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
	cantidad = models.IntegerField()
	subtotal = models.DecimalField(max_digits=10, decimal_places=2)

	class Meta:
		db_table = 'detalles_pedido'
		managed = False

class Carrito(models.Model):
	carrito_id = models.AutoField(primary_key=True, db_column='carrito_id')
	usuario = models.ForeignKey(Usuario, on_delete=models.DO_NOTHING, db_column='usuario_id')
	producto = models.ForeignKey(Producto, on_delete=models.DO_NOTHING, db_column='producto_id')
	cantidad = models.IntegerField()
	fecha_agregado = models.DateTimeField(db_column='fecha_agregado')

	class Meta:
		db_table = 'carrito'
		managed = False


class Reseña(models.Model):
	resena_id = models.AutoField(primary_key=True, db_column='reseña_id')
	producto = models.ForeignKey(Producto, on_delete=models.DO_NOTHING, db_column='producto_id')
	usuario = models.ForeignKey(Usuario, on_delete=models.DO_NOTHING, db_column='usuario_id')
	calificacion = models.IntegerField()
	comentario = models.TextField(blank=True)
	fecha_creacion = models.DateTimeField(db_column='fecha_creacion')

	class Meta:
		db_table = 'reseñas'
		managed = False

class Notificacion(models.Model):
	notificacion_id = models.AutoField(primary_key=True, db_column='notificacion_id')
	usuario = models.ForeignKey(Usuario, on_delete=models.DO_NOTHING, db_column='usuario_id', null=True, blank=True)
	titulo = models.CharField(max_length=255)
	mensaje = models.TextField()
	tipo = models.CharField(max_length=50)
	fecha_creacion = models.DateTimeField(db_column='fecha_creacion', auto_now_add=False)
	leida = models.BooleanField(default=False)
	relacion_id = models.IntegerField(blank=True, null=True)
	relacion_tipo = models.CharField(max_length=50, blank=True)
	expira = models.DateTimeField(db_column='expira', null=True, blank=True)  # <-- nuevo nombre

	class Meta:
		db_table = 'notificaciones'
		managed = False

class Transaccion(models.Model):
	transaccion_id = models.AutoField(primary_key=True, db_column='transaccion_id')
	pedido = models.ForeignKey(Pedido, on_delete=models.DO_NOTHING, db_column='pedido_id')
	monto = models.DecimalField(max_digits=10, decimal_places=2)
	metodo_pago = models.CharField(max_length=50)
	estado = models.CharField(max_length=50)
	fecha_transaccion = models.DateTimeField(db_column='fecha_transaccion')
	codigo_transaccion = models.CharField(max_length=100)

	class Meta:
		db_table = 'transacciones'
		managed = False

class Envio(models.Model):
	envio_id = models.AutoField(primary_key=True, db_column='envio_id')
	pedido = models.ForeignKey(Pedido, on_delete=models.DO_NOTHING, db_column='pedido_id')
	metodo_envio = models.CharField(max_length=100)
	direccion_envio = models.TextField(blank=True)
	fecha_envio = models.DateTimeField(blank=True, null=True)
	fecha_entrega_estimada = models.DateTimeField(blank=True, null=True)
	estado = models.CharField(max_length=50)
	codigo_seguimiento = models.CharField(max_length=100, blank=True)
	costo_envio = models.DecimalField(max_digits=10, decimal_places=2)

	class Meta:
		db_table = 'envios'
		managed = False

class ReporteFalla(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False, db_column='reporte_id')
    usuario = models.ForeignKey(Usuario, on_delete=models.DO_NOTHING, db_column='usuario_id')
    categoria = models.CharField(max_length=50)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    seccion = models.CharField(max_length=120)
    imagen_url = models.CharField(max_length=255, blank=True)
    video_url = models.CharField(max_length=255, blank=True)
    estado = models.CharField(max_length=20, default='pendiente')  # pendiente | en_revision | finalizado
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reportes_falla'
        managed = True

class ReporteFallaFollowUp(models.Model):
    followup_id = models.AutoField(primary_key=True, db_column='followup_id')
    reporte = models.ForeignKey(ReporteFalla, on_delete=models.CASCADE, db_column='reporte_id', related_name='followups')
    autor_tipo = models.CharField(max_length=20)  # usuario | soporte
    mensaje = models.TextField(blank=True)
    imagen_url = models.CharField(max_length=255, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reportes_falla_followups'
        managed = True
