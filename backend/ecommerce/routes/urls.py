from rest_framework import routers
from ecommerce.views.categoria import CategoriaViewSet
from ecommerce.views.producto import ProductoViewSet
from ecommerce.views.usuario import UsuarioViewSet
from ecommerce.views.pedido import PedidoViewSet
from ecommerce.views.detalle_pedido import DetallePedidoViewSet
from ecommerce.views.carrito import CarritoViewSet
from ecommerce.views.resena import ReseñaViewSet
from ecommerce.views.notificacion import NotificacionViewSet
from ecommerce.views.transaccion import TransaccionViewSet
from ecommerce.views.envio import EnvioViewSet

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