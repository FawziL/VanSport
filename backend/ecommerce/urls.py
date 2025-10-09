from rest_framework import routers
from .views.categoria import CategoriaViewSet
from .views.producto import ProductoViewSet
from .views.usuario import UsuarioViewSet
from .views.pedido import PedidoViewSet
from .views.detalle_pedido import DetallePedidoViewSet
from .views.carrito import CarritoViewSet
from .views.resena import ReseñaViewSet
from .views.notificacion import NotificacionViewSet
from .views.transaccion import TransaccionViewSet
from .views.envio import EnvioViewSet

router = routers.DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'detalles-pedido', DetallePedidoViewSet)
router.register(r'carrito', CarritoViewSet)
router.register(r'reseñas', ReseñaViewSet)
router.register(r'notificaciones', NotificacionViewSet)
router.register(r'transacciones', TransaccionViewSet)
router.register(r'envios', EnvioViewSet)

urlpatterns = router.urls
