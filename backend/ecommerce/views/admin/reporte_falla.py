from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.conf import settings
import os

from ecommerce.models import ReporteFalla, ReporteFallaFollowUp
from ecommerce.serializers import ReporteFallaSerializer, ReporteFallaFollowUpSerializer

class ReporteFallaViewSetAdmin(viewsets.ModelViewSet):
    queryset = ReporteFalla.objects.all().order_by('-fecha_creacion')
    serializer_class = ReporteFallaSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def update(self, request, *args, **kwargs):
        # Soporta multipart para actualizar imagen/video si lo cambian
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        imagen = request.FILES.get('imagen')
        video = request.FILES.get('video')
        data = {k: v for k, v in request.data.items() if k not in ('imagen', 'video')}

        if imagen:
            instance.imagen_url = self._save_file(imagen, sub='reportes')
        if video:
            instance.video_url = self._save_file(video, sub='reportes/videos')

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='followups', parser_classes=[MultiPartParser, FormParser, JSONParser])
    def add_followup_admin(self, request, pk=None):
        reporte = self.get_object()
        imagen = request.FILES.get('imagen')
        mensaje = request.data.get('mensaje', '')
        fu = ReporteFallaFollowUp(
            reporte=reporte,
            autor_tipo='soporte',
            mensaje=mensaje or ''
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