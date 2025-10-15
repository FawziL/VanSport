from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.conf import settings
import os
from ecommerce.models import Producto
from ecommerce.serializers import ProductoSerializer

class ProductoViewSetAdmin(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        """Crear producto (solo admin), guardando imagen manualmente"""
        imagen = request.FILES.get('imagen')
        # Evitar deepcopy de archivos: construir dict plano y excluir 'imagen'
        data = {k: v for k, v in request.data.items() if k != 'imagen'}
        if imagen:
            ruta = self.handle_uploaded_file(imagen)
            data['imagen_url'] = ruta
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Actualizar producto (solo admin), guardando imagen manualmente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        imagen = request.FILES.get('imagen')
        # Evitar deepcopy de archivos: construir dict plano y excluir 'imagen'
        data = {k: v for k, v in request.data.items() if k != 'imagen'}
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
        # Guarda el archivo en MEDIA_ROOT/productos/ y retorna la URL relativa bajo MEDIA_URL
        folder = os.path.join(settings.MEDIA_ROOT, 'productos')
        os.makedirs(folder, exist_ok=True)
        # Evitar colisiones simples: si existe, agregar sufijo numérico
        base, ext = os.path.splitext(f.name)
        filename = f.name
        path = os.path.join(folder, filename)
        i = 1
        while os.path.exists(path):
            filename = f"{base}_{i}{ext}"
            path = os.path.join(folder, filename)
            i += 1
        with open(path, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)
        # Construye ruta accesible: /media/productos/<filename>
        return os.path.join('media', 'productos', filename).replace('\\', '/')