from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.db import models
from django.conf import settings
import os
from ..models import Producto
from ..serializers import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        # Solo admin puede crear, actualizar o borrar productos
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
            qs = qs.filter(activo=activo.lower() in ('1', 'true', 't', 'yes', 'y'))
        if categoria_id:
            qs = qs.filter(categoria_id=categoria_id)
        if min_price:
            qs = qs.filter(precio__gte=min_price)
        if max_price:
            qs = qs.filter(precio__lte=max_price)
        if q:
            qs = qs.filter(models.Q(nombre__icontains=q) | models.Q(descripcion__icontains=q))
        return qs

    def list(self, request, *args, **kwargs):
        """Listar productos (con filtros opcionales)"""
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """Crear producto (solo admin), guardando imagen manualmente"""
        imagen = request.FILES.get('imagen')
        data = request.data.copy()
        if imagen:
            ruta = self.handle_uploaded_file(imagen)
            data['imagen_url'] = ruta
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        """Obtener producto por ID"""
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Actualizar producto (solo admin), guardando imagen manualmente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        imagen = request.FILES.get('imagen')
        data = request.data.copy()
        if imagen:
            ruta = self.handle_uploaded_file(imagen)
            data['imagen_url'] = ruta
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Actualizar parcialmente producto (solo admin)"""
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Eliminar producto (solo admin)"""
        return super().destroy(request, *args, **kwargs)

    def handle_uploaded_file(self, f):
        # Guarda el archivo en MEDIA_ROOT/productos/ y retorna la ruta relativa
        folder = os.path.join(settings.MEDIA_ROOT, 'productos')
        os.makedirs(folder, exist_ok=True)
        filename = f.name
        path = os.path.join(folder, filename)
        with open(path, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)
        return f'productos/{filename}'