from rest_framework import viewsets, permissions
from django.db import models
from ecommerce.models import Producto
from ecommerce.serializers import ProductoSerializer

class ProductoViewSetApi(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    def get_permissions(self):
        # Solo operaciones de escritura requieren admin; lectura es pública
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Producto.objects.filter(activo=True)

        categoria_id = self.request.query_params.get('categoria_id')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        oferta = self.request.query_params.get('oferta')  # true/1 para solo con precio_oferta
        destacado = self.request.query_params.get('destacado')  # true/1 para solo destacados
        q = self.request.query_params.get('q')

        if categoria_id:
            qs = qs.filter(categoria_id=categoria_id)
        if min_price and str(min_price).lower() != 'undefined':
            qs = qs.filter(precio__gte=min_price)
        if max_price and str(max_price).lower() != 'undefined':
            qs = qs.filter(precio__lte=max_price)
        if oferta is not None and oferta != '':
            truthy = str(oferta).lower() in ('1','true','t','yes','y')
            if truthy:
                qs = qs.filter(precio_oferta__isnull=False)
            else:
                qs = qs.filter(precio_oferta__isnull=True)
        if destacado is not None and destacado != '':
            if str(destacado).lower() in ('1','true','t','yes','y'):
                qs = qs.filter(destacado=True)
            else:
                qs = qs.filter(destacado=False)
        if q:
            qs = qs.filter(models.Q(nombre__icontains=q) | models.Q(descripcion__icontains=q))

        return qs