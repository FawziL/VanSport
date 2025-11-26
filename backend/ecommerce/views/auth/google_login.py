import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.db import transaction
from ecommerce.models import Usuario # Importa tu modelo de usuario directamente

User = Usuario # Usa tu modelo de usuario específico

class GoogleLoginView(APIView):
    """
    Vista para manejar el inicio de sesión con Google.
    Recibe un ID Token de Google, lo valida, y crea o autentica un usuario,
    devolviendo tokens JWT de la aplicación.
    """
    permission_classes = [] # No requiere autenticación para usar este endpoint

    @transaction.atomic
    def post(self, request):
        # El frontend ahora envía el access_token de Google
        access_token = request.data.get('access_token')

        if not access_token:
            return Response({'error': 'No se proporcionó el access_token de Google.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Usar el access_token para obtener la información del usuario desde el endpoint 'userinfo' de Google
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(user_info_url, headers=headers)
            response.raise_for_status()
            
            user_info = response.json()

            # La validación de 'audience' se hace con ID Tokens, no es necesaria aquí.
            # La validación del token la hace Google al aceptar la petición al endpoint 'userinfo'.

            email = user_info.get('email')
            if not email:
                return Response({'error': 'No se pudo obtener el email desde el token de Google.'}, status=status.HTTP_400_BAD_REQUEST)

            # 3. Buscar o crear el usuario en Django
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,  # Usamos el email como username por defecto
                    'first_name': user_info.get('given_name', ''),
                    'last_name': user_info.get('family_name', ''),
                    'is_active': True,
                }
            )

            if created:
                user.set_unusable_password() # El usuario no tendrá contraseña local
                user.save()

            # 4. Generar tokens JWT para el usuario
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response({'error': f'Error al verificar el token de Google: {e}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Ocurrió un error inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)