from rest_framework import viewsets, permissions
from ..models import Reseña
from ..serializers import ReseñaSerializer

class ReseñaViewSet(viewsets.ModelViewSet):
    queryset = Reseña.objects.all()
    serializer_class = ReseñaSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Reseña.objects.all()
        producto_id = self.request.query_params.get('producto_id')
        if producto_id:
            qs = qs.filter(producto_id=producto_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario_id=self.request.user.usuario_id)