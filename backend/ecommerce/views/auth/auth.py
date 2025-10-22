from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError  # <-- capturar errores de unicidad DB
from rest_framework_simplejwt.tokens import RefreshToken
from ecommerce.serializers_auth import RegisterSerializer, UserSerializer, LoginSerializer
from ecommerce.models import Usuario

# NUEVO: imports para reset token
from django.core import signing
import hashlib
from django.conf import settings                         # <-- nuevo
from django.core.mail import send_mail, EmailMultiAlternatives  # <-- nuevo
from django.template.loader import render_to_string  # <-- nuevo

RESET_SALT = 'pwd-reset-v1'
RESET_MAX_AGE = 2 * 60 * 60  # 2 horas

def _make_version(user):
    # Pequeña huella del hash actual de contraseña; si cambia, los tokens previos quedan inválidos
    try:
        return hashlib.sha256((user.password or '').encode('utf-8')).hexdigest()[:12]
    except Exception:
        return 'na'

def make_reset_token(user):
    payload = {'uid': str(user.usuario_id), 'v': _make_version(user)}
    return signing.dumps(payload, salt=RESET_SALT)

def read_reset_token(token, max_age=RESET_MAX_AGE):
    # Lanza BadSignature o SignatureExpired si no es válido
    return signing.loads(token, salt=RESET_SALT, max_age=max_age)

def build_reset_email(user, link):
    brand = getattr(settings, 'BRAND_NAME', 'VanSport')
    primary = getattr(settings, 'BRAND_PRIMARY_COLOR', '#1e88e5')
    text_color = getattr(settings, 'BRAND_TEXT_COLOR', '#111111')
    logo = getattr(settings, 'BRAND_LOGO_URL', '')

    subject = f"Recuperación de contraseña - {brand}"
    text_body = (
        f"Hola {user.nombre or ''},\n\n"
        "Recibimos una solicitud para restablecer tu contraseña.\n"
        "Haz clic en el siguiente enlace (válido por 2 horas):\n\n"
        f"{link}\n\n"
        "Si tú no solicitaste este cambio, ignora este correo.\n\n"
        f"Saludos,\n{brand}"
    )

    html_body = f"""\
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Recuperación de contraseña - {brand}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f7fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f5f7fb">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;box-shadow:0 4px 22px rgba(0,0,0,.06);overflow:hidden;">
          <tr>
            <td style="padding:18px 20px;background:{primary};color:#ffffff;">
              <table width="100%">
                <tr>
                  <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:18px;">
                    {brand}
                  </td>
                  <td align="right">
                    {f'<img src="{logo}" alt="{brand}" height="28" style="display:block;border:none;"/>' if logo else ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 20px 8px 20px;color:{text_color};font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:{text_color};">Restablecer tu contraseña</h1>
              <p style="margin:0 0 12px 0;line-height:1.6;color:#444;">
                Hola {user.nombre or ''}, recibimos una solicitud para restablecer tu contraseña.
              </p>
              <p style="margin:0 0 16px 0;line-height:1.6;color:#444;">
                Este enlace es válido por <strong>2 horas</strong>. Haz clic en el botón para continuar:
              </p>

              <div style="margin:18px 0;">
                <a href="{link}"
                   style="display:inline-block;background:{primary};color:#ffffff;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:10px;">
                   Restablecer contraseña
                </a>
              </div>

              <p style="margin:10px 0 0 0;font-size:13px;color:#666;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:6px 0 0 0;word-break:break-all;">
                <a href="{link}" style="color:{primary};text-decoration:none;">{link}</a>
              </p>

              <p style="margin:16px 0 0 0;line-height:1.6;color:#666;">
                Si no solicitaste este cambio, puedes ignorar este correo.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:14px 20px 18px 20px;border-top:1px solid #eee;color:#7b8591;font-family:Arial,Helvetica,sans-serif;font-size:12px;">
              © {brand}
            </td>
          </tr>
        </table>

        <div style="color:#8a94a6;font-size:12px;margin-top:10px;font-family:Arial,Helvetica,sans-serif;">
          Este mensaje fue enviado automáticamente, por favor no respondas a este correo.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>"""
    return subject, text_body, html_body

class RegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data.get('email', '')
        serializer.validated_data['email'] = email.strip().lower()

        password = serializer.validated_data.get('password')
        serializer.validated_data['password'] = make_password(password)

        try:
            user = serializer.save()
        except IntegrityError:
            return Response({'email': ['Este email ya está registrado.']}, status=status.HTTP_400_BAD_REQUEST)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response({'email': ['Este campo es requerido.']}, status=status.HTTP_400_BAD_REQUEST)

        # Respuesta neutra por seguridad
        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'message': 'Si el email existe, se enviará un enlace de recuperación.'}, status=status.HTTP_200_OK)

        token = make_reset_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        link = f"{frontend_url.rstrip('/')}/password-reset/confirm?token={token}"

        context = {
            'brand': getattr(settings, 'BRAND_NAME', 'VanSport'),
            'primary': getattr(settings, 'BRAND_PRIMARY_COLOR', '#1e88e5'),
            'text_color': getattr(settings, 'BRAND_TEXT_COLOR', '#111111'),
            'logo': getattr(settings, 'BRAND_LOGO_URL', ''),
            'user_name': (user.nombre or '').strip() or 'usuario',
            'link': link,
        }

        subject = f"Recuperación de contraseña - {context['brand']}"
        text_body = render_to_string('email/password_reset.txt', context)
        html_body = render_to_string('email/password_reset.html', context)

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@vansport.local')
        reply_to = [settings.EMAIL_REPLY_TO] if getattr(settings, 'EMAIL_REPLY_TO', '') else None

        try:
            msg = EmailMultiAlternatives(subject, text_body, from_email, [email], reply_to=reply_to)
            msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)
        except Exception:
            # log opcional
            pass

        return Response({'message': 'Si el email existe, se enviará un enlace de recuperación.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token') or ''
        password = request.data.get('password') or ''
        if not token or not password:
            return Response({'detail': 'token y password son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 8:
            return Response({'password': ['La contraseña debe tener al menos 8 caracteres.']}, status=status.HTTP_400_BAD_REQUEST)

        # Validar token
        try:
            data = read_reset_token(token)
        except signing.SignatureExpired:
            return Response({'detail': 'El enlace ha expirado.'}, status=status.HTTP_400_BAD_REQUEST)
        except signing.BadSignature:
            return Response({'detail': 'Token inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        uid = data.get('uid')
        ver = data.get('v')
        if not uid or not ver:
            return Response({'detail': 'Token inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener usuario y verificar versión
        try:
            user = Usuario.objects.get(usuario_id=uid)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_400_BAD_REQUEST)

        if _make_version(user) != ver:
            return Response({'detail': 'El enlace ya no es válido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Actualizar contraseña
        user.password = make_password(password)
        user.save()

        return Response({'message': 'Tu contraseña se actualizó correctamente.'}, status=status.HTTP_200_OK)

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password):
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })

    def get(self, request):
        return Response({'detail': 'Envía email y password usando POST.'}, status=status.HTTP_200_OK)