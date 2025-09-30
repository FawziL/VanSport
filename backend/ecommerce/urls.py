from rest_framework import routers
from .views import (
    CategoriaViewSet, ProductoViewSet, UsuarioViewSet, PedidoViewSet,
    DetallePedidoViewSet, CarritoViewSet, ReseñaViewSet, NotificacionViewSet,
    TransaccionViewSet, EnvioViewSet
)

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
