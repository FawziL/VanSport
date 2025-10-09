from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed
from ecommerce.models import Usuario

class UsuarioJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get(api_settings.USER_ID_CLAIM)
        if user_id is None:
            raise InvalidToken("Token missing user_id claim")

        user_id_field = api_settings.USER_ID_FIELD

        try:
            user = Usuario.objects.get(**{user_id_field: user_id})
        except Usuario.DoesNotExist:
            raise InvalidToken("User not found")

        if not getattr(user, 'is_active', True):
            raise AuthenticationFailed("User is inactive", code="user_inactive")

        return user