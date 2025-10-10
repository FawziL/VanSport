from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.reverse import reverse

class AuthRootView(APIView):
    def get(self, request, format=None):
        return Response({
            'register': reverse('register', request=request, format=format),
            'login': reverse('login', request=request, format=format),
            'password_reset': reverse('password_reset', request=request, format=format),
            'me': reverse('me', request=request, format=format),
        })