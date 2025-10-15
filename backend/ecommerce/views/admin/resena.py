from rest_framework import viewsets, permissions
from ecommerce.models import Reseña
from ecommerce.serializers import ReseñaSerializer

class ReseñaViewSetAdmin(viewsets.ModelViewSet):
    queryset = Reseña.objects.select_related('usuario', 'producto')
    serializer_class = ReseñaSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = Reseña.objects.select_related('usuario', 'producto')
        producto_id = self.request.query_params.get('producto_id')
        if producto_id:
            qs = qs.filter(producto_id=producto_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario_id=self.request.user.usuario_id)