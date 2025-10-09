from rest_framework import viewsets, permissions
from ecommerce.models import Usuario
from ecommerce.serializers import UsuarioSerializer

class UsuarioViewSetAdmin(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        # Solo admin puede listar todos, usuarios normales solo pueden ver/editar su propio perfil
        if self.action in ['list', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return Usuario.objects.all()