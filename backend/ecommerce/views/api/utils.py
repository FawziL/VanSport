from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ecommerce.services.dolar import obtener_tasa_bcv

@api_view(['GET'])
@permission_classes([AllowAny])
def dolar_bcv_public(request):
    valor, fecha = obtener_tasa_bcv()
    return Response({"fuente": "oficial", "valor": str(valor), "fecha": fecha.isoformat(), "desactualizado": False})