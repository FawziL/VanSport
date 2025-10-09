from rest_framework import viewsets, permissions
from ecommerce.models import Envio
from ecommerce.serializers import EnvioSerializer

class EnvioViewSetAdmin(viewsets.ModelViewSet):
    queryset = Envio.objects.all()
    serializer_class = EnvioSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]