from rest_framework import viewsets, permissions
from django.db import models
from ecommerce.models import Producto
from ecommerce.serializers import ProductoSerializer

class ProductoViewSetApi(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Producto.objects.all()
        activo = self.request.query_params.get('activo')
        categoria_id = self.request.query_params.get('categoria_id')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        q = self.request.query_params.get('q')

        if activo is not None:
            qs = qs.filter(activo=activo.lower() in ('1','true','t','yes','y'))
        if categoria_id:
            qs = qs.filter(categoria_id=categoria_id)
        if min_price:
            qs = qs.filter(precio__gte=min_price)
        if max_price:
            qs = qs.filter(precio__lte=max_price)
        if q:
            qs = qs.filter(models.Q(nombre__icontains=q) | models.Q(descripcion__icontains=q))
        return qs