from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from ecommerce.models import Notificacion
from ecommerce.serializers import NotificacionSerializer

class NotificacionViewSetAdmin(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all().order_by('-fecha_creacion')
    serializer_class = NotificacionSerializer

    def get_permissions(self):
        return [permissions.IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print('NOTIF ERRORS =>', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)