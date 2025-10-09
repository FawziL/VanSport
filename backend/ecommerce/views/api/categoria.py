from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from ecommerce.models import Categoria
from ecommerce.serializers import CategoriaSerializer

class CategoriaViewSetApi(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        # Solo lectura para todos, escritura solo para staff
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def list(self, request, *args, **kwargs):
        """Listar todas las categorías"""
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """Obtener una categoría por ID"""
        return super().retrieve(request, *args, **kwargs)
