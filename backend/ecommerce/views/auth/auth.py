from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError  # <-- capturar errores de unicidad DB
from rest_framework_simplejwt.tokens import RefreshToken
from ecommerce.serializers_auth import RegisterSerializer, UserSerializer, LoginSerializer
from ecommerce.models import Usuario

class RegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        # Validación manual para devolver el cuerpo de errores exactamente
        if not serializer.is_valid():
            # Devuelve errores por campo, ej: {"email": ["Este email ya está registrado."]}
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Normaliza email por redundancia (ya sucede en validate_email)
        email = serializer.validated_data.get('email', '')
        serializer.validated_data['email'] = email.strip().lower()

        # Hash de contraseña
        password = serializer.validated_data.get('password')
        serializer.validated_data['password'] = make_password(password)

        try:
            user = serializer.save()
        except IntegrityError:
            # Si tu modelo aún no tiene unique=True en email, este bloque da un error claro
            return Response({'email': ['Este email ya está registrado.']}, status=status.HTTP_400_BAD_REQUEST)

        # Devuelve el usuario serializado en 201
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
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        # Aquí iría la lógica para enviar el correo de recuperación
        return Response({'message': 'Si el email existe, se enviará un enlace de recuperación.'}, status=status.HTTP_200_OK)

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