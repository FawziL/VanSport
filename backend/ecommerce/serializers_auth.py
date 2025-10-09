from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Usuario

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ('email', 'password', 'nombre', 'apellido', 'telefono')
        extra_kwargs = {
            'nombre': {'required': True},
            'apellido': {'required': True},
        }

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        # perform_create in view will hash the password
        return Usuario.objects.create(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('usuario_id', 'email', 'nombre', 'apellido', 'telefono')

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)