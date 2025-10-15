from rest_framework import viewsets, permissions, status
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.response import Response
from django.conf import settings
import os
from ecommerce.models import Categoria
from ecommerce.serializers import CategoriaSerializer

class CategoriaViewSetAdmin(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def list(self, request, *args, **kwargs):
        """Listar todas las categorías"""
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """Crear una nueva categoría (solo admin) guardando imagen si viene"""
        imagen = request.FILES.get('imagen')
        data = {k: v for k, v in request.data.items() if k != 'imagen'}
        if imagen:
            ruta = self.handle_uploaded_file(imagen)
            data['imagen_url'] = ruta
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        """Obtener una categoría por ID"""
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Actualizar una categoría (solo admin) guardando imagen si viene"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        imagen = request.FILES.get('imagen')
        data = {k: v for k, v in request.data.items() if k != 'imagen'}
        if imagen:
            ruta = self.handle_uploaded_file(imagen)
            data['imagen_url'] = ruta
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Actualizar parcialmente una categoría (solo admin)"""
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Eliminar una categoría (solo admin)"""
        return super().destroy(request, *args, **kwargs)

    def handle_uploaded_file(self, f):
        """Guarda el archivo en MEDIA_ROOT/categorias y retorna la ruta relativa bajo MEDIA_URL"""
        folder = os.path.join(settings.MEDIA_ROOT, 'categorias')
        os.makedirs(folder, exist_ok=True)
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
        return os.path.join('media', 'categorias', filename).replace('\\', '/')