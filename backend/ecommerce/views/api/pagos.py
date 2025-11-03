from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ecommerce.models import MetodoPago
from ecommerce.serializers import MetodoPagoPublicSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def metodos_pago_publico(request):
    qs = MetodoPago.objects.filter(activo=True).order_by('orden', 'id')
    data = MetodoPagoPublicSerializer(qs, many=True).data
    return Response(data)