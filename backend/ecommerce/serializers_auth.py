from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Usuario

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message="Este email ya está registrado.")]
    )
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ('email', 'password', 'nombre', 'apellido', 'telefono')
        extra_kwargs = {
            'nombre': {'required': True},
            'apellido': {'required': True},
            'telefono': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        return value.strip().lower()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        # La vista seguirá hasheando la contraseña en perform_create
        return Usuario.objects.create(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('usuario_id', 'email', 'nombre', 'apellido', 'telefono', 'is_staff')

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)