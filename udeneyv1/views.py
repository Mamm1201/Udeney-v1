from rest_framework import viewsets
from .models import Usuarios, Articulos, Categorias, Roles, UsuarioRol, DetalleTransaccion, Transacciones, Calificaciones, Pagos, Pqrs
from .serializers import UsuariosSerializer, ArticulosSerializer, CategoriasSerializer, RolesSerializer, UsuarioRolSerializer, DetalleTransaccionSerializer, TransaccionesSerializer, CalificacionesSerializer, PagosSerializer, PqrsSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
# acabo de incluir
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages


#from rest_framework import generics


# 1. VISTAS PARA EL MODELO USUARIOS

class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer
    
# acabo de incluir
def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Cuenta creada para {username}!')
            return redirect('login')  # Cambiar 'login' por el nombre de la vista de login
    else:
        form = UserCreationForm()
    return render(request, 'client/src/pages/Registro', {'form': form})

# acabo de incluir 2 VISTAS PARA CREAR USUARIOS
#class UsuariosListCreateView(generics.ListCreateAPIView):
 #   queryset = Usuarios.objects.all()
 #   serializer_class = UsuariosSerializer    

# 1. VISTAS PARA EL MODELO LOGIN USUARIO
class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

# 2. VISTA PARA EL MODELO ARTICULOS
class ArticulosViewSet(viewsets.ModelViewSet):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer
       
# 2.1. LISTAR ARTICULOS
class ListarArticulosAPIView(APIView):
    def get(self, request):
        articulos = Articulos.objects.select_related('id_usuario', 'id_categoria')
        serializer = ArticulosSerializer(articulos, many=True)
        return Response(serializer.data)

# 3. VISTAS PARA EL MODELO CATEGORIAS
class CategoriasViewSet(viewsets.ModelViewSet):
    queryset = Categorias.objects.all()
    serializer_class = CategoriasSerializer

# 4. VISTAS PARA EL MODELO ROLES
class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer

# 5. VISTAS PARA EL MODELO USUARIO_ROL
class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer

# 6. VISTAS PARA EL MODELO DETALLE_TRANSACCION
class DetalleTransaccionViewSet(viewsets.ModelViewSet):
    queryset = DetalleTransaccion.objects.all()
    serializer_class = DetalleTransaccionSerializer

# 7. VISTAS PARA EL MODELO TRANSACCIONES
class TransaccionesViewSet(viewsets.ModelViewSet):
    queryset = Transacciones.objects.all()
    serializer_class = TransaccionesSerializer

# 8. VISTAS PARA EL MODELO CALIFICACIONES
class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer
    
# 8. VISTAS PARA EL MODELO PAGOS
class PagosViewSet(viewsets.ModelViewSet):
    queryset = Pagos.objects.all()
    serializer_class = PagosSerializer
       
# 8. VISTAS PARA EL MODELO PQRS
class PqrsViewSet(viewsets.ModelViewSet):
    queryset = Pqrs.objects.all()
    serializer_class = PqrsSerializer




