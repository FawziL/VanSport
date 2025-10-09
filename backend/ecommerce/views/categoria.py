from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from ..models import Categoria
from ..serializers import CategoriaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
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

    def create(self, request, *args, **kwargs):
        """Crear una nueva categoría (solo admin)"""
        return super().create(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """Obtener una categoría por ID"""
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Actualizar una categoría (solo admin)"""
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Actualizar parcialmente una categoría (solo admin)"""
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Eliminar una categoría (solo admin)"""
        return super().destroy(request, *args, **kwargs)