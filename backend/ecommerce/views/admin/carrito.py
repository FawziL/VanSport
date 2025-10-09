from rest_framework import viewsets, permissions
from ecommerce.models import Carrito
from ecommerce.serializers import CarritoSerializer

class CarritoViewSetAdmin(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer

    def get_permissions(self):
        return [permissions.IsAdminUser()]