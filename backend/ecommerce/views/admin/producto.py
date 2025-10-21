from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.conf import settings
import os
import json
from ecommerce.models import Producto
from ecommerce.serializers import ProductoSerializer

class ProductoViewSetAdmin(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _parse_urls_list(self, raw):
        # Acepta JSON ["u1","u2"] o CSV "u1,u2"
        if raw is None:
            return []
        if isinstance(raw, (list, tuple)):
            return [str(x) for x in raw if x]
        s = str(raw).strip()
        if not s:
            return []
        try:
            parsed = json.loads(s)
            if isinstance(parsed, list):
                return [str(x) for x in parsed if x]
        except Exception:
            pass
        return [p.strip() for p in s.split(',') if p.strip()]

    def _save_extra_images(self, files):
        urls = []
        for f in files or []:
            ruta = self.handle_uploaded_file(f)
            urls.append(ruta)
        return urls

    def _coerce_imagenes_extra_text(self, data_dict):
        # Mantiene compatibilidad con tu helper anterior (si te llega como texto)
        val = data_dict.get('imagenes_adicionales')
        if val is None:
            return []
        if isinstance(val, str):
            s = val.strip()
            try:
                return json.loads(s) if s else []
            except Exception:
                return [p.strip() for p in s.split(',') if p.strip()]
        if isinstance(val, (list, tuple)):
            return [str(x) for x in val if x]
        return []

    def create(self, request, *args, **kwargs):
        """Crear producto (solo admin), incluyendo imágenes adicionales"""
        imagen = request.FILES.get('imagen')
        extra_files = request.FILES.getlist('imagenes_adicionales')  # múltiples
        # Construir dict plano sin archivos
        data = {k: v for k, v in request.data.items() if k != 'imagen'}

        # Extra desde texto opcional (JSON/CSV), ya sea en imagenes_adicionales o imagenes_adicionales_urls
        extra_from_text = self._coerce_imagenes_extra_text(data)
        extra_from_text_urls = self._parse_urls_list(request.data.get('imagenes_adicionales_urls'))
        # Extra desde archivos subidos
        extra_from_uploads = self._save_extra_images(extra_files)

        extras = [*extra_from_text, *extra_from_text_urls, *extra_from_uploads]
        if extras:
            # Quita duplicados manteniendo orden
            data['imagenes_adicionales'] = list(dict.fromkeys(x for x in extras if x))

        if imagen:
            ruta = self.handle_uploaded_file(imagen)
            data['imagen_url'] = ruta

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Actualizar producto (solo admin), fusionando imágenes adicionales"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        imagen = request.FILES.get('imagen')
        extra_files = request.FILES.getlist('imagenes_adicionales')
        data = {k: v for k, v in request.data.items() if k != 'imagen'}

        existing = instance.imagenes_adicionales or []
        extra_from_text = self._coerce_imagenes_extra_text(data)
        extra_from_text_urls = self._parse_urls_list(request.data.get('imagenes_adicionales_urls'))
        extra_from_uploads = self._save_extra_images(extra_files)
        combined = [*existing, *extra_from_text, *extra_from_text_urls, *extra_from_uploads]
        if combined:
            data['imagenes_adicionales'] = list(dict.fromkeys(x for x in combined if x))

        if imagen:
            ruta = self.handle_uploaded_file(imagen)
            data['imagen_url'] = ruta

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def handle_uploaded_file(self, f):
        # Guarda el archivo en MEDIA_ROOT/productos/ y retorna la URL relativa bajo MEDIA_URL
        folder = os.path.join(settings.MEDIA_ROOT, 'productos')
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
        return os.path.join('media', 'productos', filename).replace('\\', '/')