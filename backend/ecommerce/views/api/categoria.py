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

    def get_queryset(self):
        qs = Categoria.objects.all()
        destacado = self.request.query_params.get('destacado')
        if destacado is not None and destacado != '':
            truthy = str(destacado).lower() in ('1','true','t','yes','y')
            qs = qs.filter(destacado=truthy)
        return qs

    def retrieve(self, request, *args, **kwargs):
        """Obtener una categoría por ID"""
        return super().retrieve(request, *args, **kwargs)
