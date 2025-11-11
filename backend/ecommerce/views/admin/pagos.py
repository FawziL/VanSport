from rest_framework import viewsets, permissions
from ecommerce.models import MetodoPago
from ecommerce.serializers import MetodoPagoSerializer

class MetodoPagoAdminVista(viewsets.ModelViewSet):
    queryset = MetodoPago.objects.all().order_by('orden', 'id')
    serializer_class = MetodoPagoSerializer
    permission_classes = [permissions.IsAdminUser]