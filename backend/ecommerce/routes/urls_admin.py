from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ecommerce.views.admin.producto import ProductoViewSetAdmin
from ecommerce.views.admin.categoria import CategoriaViewSetAdmin
from ecommerce.views.admin.usuario import UsuarioViewSetAdmin
from ecommerce.views.admin.pedido import PedidoViewSetAdmin
from ecommerce.views.admin.detalle_pedido import DetallePedidoViewSetAdmin
from ecommerce.views.admin.carrito import CarritoViewSetAdmin
from ecommerce.views.admin.resena import ReseñaViewSetAdmin
from ecommerce.views.admin.notificacion import NotificacionViewSetAdmin
from ecommerce.views.admin.transaccion import TransaccionViewSetAdmin
from ecommerce.views.admin.envio import EnvioViewSetAdmin
from ecommerce.views.admin.reporte_falla import ReporteFallaViewSetAdmin
from ecommerce.views.admin.pagos import MetodoPagoAdminVista

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSetAdmin)
router.register(r'productos', ProductoViewSetAdmin)
router.register(r'usuarios', UsuarioViewSetAdmin)
router.register(r'pedidos', PedidoViewSetAdmin)
router.register(r'detalles-pedido', DetallePedidoViewSetAdmin)
router.register(r'carrito', CarritoViewSetAdmin)
router.register(r'resenas', ReseñaViewSetAdmin)
router.register(r'notificaciones', NotificacionViewSetAdmin)
router.register(r'transacciones', TransaccionViewSetAdmin)
router.register(r'envios', EnvioViewSetAdmin)
router.register(r'reportes-fallas', ReporteFallaViewSetAdmin)
router.register(r'metodos-pago', MetodoPagoAdminVista, basename='metodos-pago')

urlpatterns = [
    path('', include(router.urls)),
]