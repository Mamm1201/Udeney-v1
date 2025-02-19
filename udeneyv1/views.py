from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.models import User  # Importación necesaria para la autenticación

# Importaciones de modelos y serializers
from .models import (Usuarios, Articulos, Categorias, Roles, UsuarioRol, 
                     DetalleTransaccion, Transacciones, Calificaciones, Pagos, Pqrs)
from .serializers import (UsuariosSerializer, ArticulosSerializer, CategoriasSerializer, RolesSerializer, 
                          UsuarioRolSerializer, DetalleTransaccionSerializer, TransaccionesSerializer, 
                          CalificacionesSerializer, PagosSerializer, PqrsSerializer)

# VISTA PARA REGISTRO DE USUARIO
def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f'Cuenta creada para {user.username}!')
            return redirect('login')  # Asegúrate de que 'login' está definido en tus URLs
    else:
        form = UserCreationForm()
    return render(request, 'registro.html', {'form': form})  # Asegúrate de que tienes esta plantilla

# VISTA PARA LOGIN DE USUARIO
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'message': 'Inicio de sesión exitoso', 'token': token.key}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

# VISTA PARA CERRAR SESIÓN
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Cierre de sesión exitoso'}, status=status.HTTP_200_OK)

# CRUDs para los modelos
class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer

class ArticulosViewSet(viewsets.ModelViewSet):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer

class CategoriasViewSet(viewsets.ModelViewSet):
    queryset = Categorias.objects.all()
    serializer_class = CategoriasSerializer

class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer

class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer

class DetalleTransaccionViewSet(viewsets.ModelViewSet):
    queryset = DetalleTransaccion.objects.all()
    serializer_class = DetalleTransaccionSerializer

class TransaccionesViewSet(viewsets.ModelViewSet):
    queryset = Transacciones.objects.all()
    serializer_class = TransaccionesSerializer

class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer

class PagosViewSet(viewsets.ModelViewSet):
    queryset = Pagos.objects.all()
    serializer_class = PagosSerializer

class PqrsViewSet(viewsets.ModelViewSet):
    queryset = Pqrs.objects.all()
    serializer_class = PqrsSerializer





