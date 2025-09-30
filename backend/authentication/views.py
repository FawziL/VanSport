from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import RegisterSerializer, UserSerializer, LoginSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password, make_password
from ecommerce.models import Usuario

User = get_user_model()

class RegisterView(generics.CreateAPIView):
	queryset = Usuario.objects.all()
	serializer_class = RegisterSerializer
	permission_classes = [permissions.AllowAny]

	def perform_create(self, serializer):
		# Ensure password is hashed into contrasena_hash column
		password = serializer.validated_data.get('password')
		serializer.validated_data['password'] = make_password(password)
		serializer.save()

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
			return Response({'error': 'Credenciales inválidas1'}, status=status.HTTP_401_UNAUTHORIZED)

		if not check_password(password, user.password):
			return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

		refresh = RefreshToken.for_user(user)
		return Response({
			'access': str(refresh.access_token),
			'refresh': str(refresh),
			'user': UserSerializer(user).data,
		})

	def get(self, request):
		# Render a 200 response so the Browsable API can display the POST form
		return Response({'detail': 'Envía email y password usando POST.'}, status=status.HTTP_200_OK)

# Create your views here.
