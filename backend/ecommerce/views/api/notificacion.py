from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ecommerce.models import Notificacion
from ecommerce.serializers import NotificacionSerializer
from django.db import models
from django.utils import timezone

class NotificacionViewSetApi(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all().order_by('-fecha_creacion')
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.AllowAny]  # listar/obtener puede ser público si filtras

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'mark_read']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='latest-banner')
    def latest_banner(self, request):
        obj = (
            Notificacion.objects
            .filter(usuario_id__isnull=True)
            .filter(models.Q(tipo__in=['banner', 'oferta']))
            .filter(models.Q(expira__isnull=True) | models.Q(expira__gt=timezone.now()))
            .order_by('-fecha_creacion')
            .values(
                'notificacion_id', 'titulo', 'mensaje', 'tipo',
                'relacion_id', 'relacion_tipo', 'fecha_creacion',
                'expira',
            )
            .first()
        )
        if not obj:
            return Response({})
        return Response(obj)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        # Solo marca como leída si es del usuario
        try:
            notif = Notificacion.objects.get(pk=pk)
        except Notificacion.DoesNotExist:
            return Response({'detail': 'No encontrada'}, status=404)
        if notif.usuario_id and request.user.usuario_id != notif.usuario_id:
            return Response({'detail': 'No autorizado'}, status=403)
        notif.leida = True
        notif.save(update_fields=['leida'])
        return Response({'ok': True})