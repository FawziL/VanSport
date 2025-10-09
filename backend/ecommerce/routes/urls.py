from rest_framework import routers
from ecommerce.views.api.producto import ProductoViewSetApi
from ecommerce.views.api.categoria import CategoriaViewSetApi
from ecommerce.views.api.usuario import UsuarioViewSetApi
from ecommerce.views.api.pedido import PedidoViewSetApi
from ecommerce.views.api.detalle_pedido import DetallePedidoViewSetApi
from ecommerce.views.api.carrito import CarritoViewSetApi
from ecommerce.views.api.resena import ReseñaViewSetApi
from ecommerce.views.api.notificacion import NotificacionViewSetApi
from ecommerce.views.api.transaccion import TransaccionViewSetApi
from ecommerce.views.api.envio import EnvioViewSetApi

router = routers.DefaultRouter()
router.register(r'categorias', CategoriaViewSetApi)
router.register(r'productos', ProductoViewSetApi)
router.register(r'usuarios', UsuarioViewSetApi)
router.register(r'pedidos', PedidoViewSetApi)
router.register(r'detalles-pedido', DetallePedidoViewSetApi)
router.register(r'carrito', CarritoViewSetApi)
router.register(r'reseñas', ReseñaViewSetApi)
router.register(r'notificaciones', NotificacionViewSetApi)
router.register(r'transacciones', TransaccionViewSetApi)
router.register(r'envios', EnvioViewSetApi)

urlpatterns = router.urls