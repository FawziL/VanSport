from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.conf import settings
import os

from ecommerce.models import ReporteFalla, ReporteFallaFollowUp
from ecommerce.serializers import (
    ReporteFallaSerializer,
    ReporteFallaFollowUpSerializer,
)

class ReporteFallaViewSetApi(viewsets.ModelViewSet):
    queryset = ReporteFalla.objects.all()
    serializer_class = ReporteFallaSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # Solo los reportes del usuario autenticado
        return ReporteFalla.objects.filter(usuario_id=self.request.user.usuario_id).order_by('-fecha_creacion')

    def perform_create(self, serializer):
        serializer.save(usuario_id=self.request.user.usuario_id)

    def create(self, request, *args, **kwargs):
        # Manejar archivos manualmente
        imagen = request.FILES.get('imagen')
        video = request.FILES.get('video')
        data = {k: v for k, v in request.data.items() if k not in ('imagen', 'video')}
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(usuario_id=request.user.usuario_id)

        if imagen:
            instance.imagen_url = self._save_file(imagen, sub='reportes')
        if video:
            instance.video_url = self._save_file(video, sub='reportes/videos')
        instance.save()

        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.usuario_id != request.user.usuario_id:
            return Response({'detail': 'No autorizado'}, status=403)
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='followups', parser_classes=[MultiPartParser, FormParser, JSONParser])
    def add_followup(self, request, pk=None):
        reporte = self.get_object()
        if reporte.usuario_id != request.user.usuario_id:
            return Response({'detail': 'No autorizado'}, status=403)

        imagen = request.FILES.get('imagen')
        mensaje = request.data.get('mensaje', '') or ''
        fu = ReporteFallaFollowUp(
            reporte=reporte,
            autor_tipo='usuario',
            mensaje=mensaje
        )
        if imagen:
            fu.imagen_url = self._save_file(imagen, sub='reportes/adjuntos')
        fu.save()
        return Response(ReporteFallaFollowUpSerializer(fu).data, status=201)

    def _save_file(self, f, sub='reportes'):
        folder = os.path.join(settings.MEDIA_ROOT, sub)
        os.makedirs(folder, exist_ok=True)
        base, ext = os.path.splitext(f.name)
        filename = f.name
        path = os.path.join(folder, filename)
        i = 1
        while os.path.exists(path):
            filename = f"{base}_{i}{ext}"
            path = os.path.join(folder, filename)
            i += 1
        with open(path, 'wb+') as dest:
            for chunk in f.chunks():
                dest.write(chunk)
        return os.path.join('media', sub, filename).replace('\\', '/')