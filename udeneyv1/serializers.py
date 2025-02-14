from rest_framework import serializers
from .models import Usuarios, Articulos, Categorias, Roles, UsuarioRol, DetalleTransaccion, Transacciones, Calificaciones, Pagos, Pqrs

# SERIALIZADOR DE USUARIOS
class UsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = '__all__' # o especifica los campos que quieras 
        #extra_kwargs = {
          #  'contraseña': {'write_only': True}, # protegemos el campo contraseña para que solo sea escribible, pero no visible en las respuestas.
        #}
        
#AUTH_USER_MODEL = 'udeneyv1.Usuario'  # Reemplaza 'tu_app' con el nombre de tu aplicación autenticar contraseña


 # SERIALIZADOR DE ROLES        
class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'  # o especifica los campos que quieras   
        
         
# SERIALIZADOR DE USUARIO_ROL        
class UsuarioRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRol
        fields =  '__all__' #['id_usuario', 'id_rol']  # Especifica los campos a incluir        
        
                   
 # SERIALIZADOR DE CATEGORIAS        
class CategoriasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorias
        fields = '__all__'  # o especifica los campos que quieras 
        
          

# SERIALIZADOR DE ARTICULOS
class ArticulosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Articulos
        fields = '__all__'  
        

# SERIALIZADOR DETALLE_TRANSACCION
class DetalleTransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleTransaccion
        fields = '__all__'  
        
# SERIALIZADOR TRANSACCIONES
class TransaccionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transacciones
        fields = '__all__'  
        
# SERIALIZADOR CALIFICACIONES
class CalificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificaciones
        fields = '__all__'  
        
# SERIALIZADOR PAGOS
class PagosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagos
        fields = '__all__'  
        
        
# SERIALIZADOR PQRS
class PqrsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pqrs
        fields = '__all__'  

