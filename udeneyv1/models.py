from django.db import models
from django.shortcuts import render


   
# MODELO TABLA USUARIOS  
class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True) 
    nombres_usuario = models.CharField(max_length=255)
    apellidos_usuario = models.CharField(max_length=255)
    email_usuario = models.EmailField(unique=True)
    contraseña_usuario = models.CharField(max_length=255)
    fecha_registro = models.DateField(auto_now_add=True)
   
    class Meta:
        db_table = 'usuarios'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla  
        
# MODELO AUTENTICAR USUARIOS         
#def listar_articulos_con_detalles(request):
   # articulos = Articulos.objects.prefetch_related('id_usuario__grupos', 'id_categoria')
   # return render(request, 'articulos/listar_detalles.html', {'articulos': articulos})
         
             
# MODELO PARA TABLA ROLES        
class Roles(models.Model):
    id_rol = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    tipo_rol = models.CharField(max_length=20, choices=[("vendedor", "Vendedor"), ("comprador", "Comprador")])
   
    class Meta:
        db_table = 'roles'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla 
        
# MODELO PARA TABLA USUARIO_ROL
class UsuarioRol(models.Model):
    #usuario_rol_id  = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    id_usuario = models.ForeignKey('usuarios', on_delete=models.CASCADE,db_column='id_usuario')
    id_rol = models.ForeignKey('roles', on_delete=models.CASCADE,db_column='id_rol')

    class Meta:
        db_table = 'usuario_rol'
        unique_together = ('id_usuario', 'id_rol')  # Evita duplicados     
        managed = False  # Django no intentará crear esta tabla    


# MODELO TABLA CATEGORIAS
       
class Categorias(models.Model):
    id_categoria = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    nombre_categoria = models.CharField(max_length=20, choices=[("prenda", "Prenda"), ("utiles", "Utiles"), ("libros", "Libros"), ("herramientas", "Herramientas"),])
    
    class Meta:
        db_table = 'categorias'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla         
   


# MODELO TABLA ARTICULOS
class Articulos(models.Model):
    id_articulo = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    titulo_articulo = models.CharField(max_length=255)
    descripcion_articulo = models.TextField()
    institucion_articulo = models.CharField(max_length=255, null=True, blank=True)
    precio_articulo = models.DecimalField(max_digits=10, decimal_places=2,)
    id_usuario = models.ForeignKey( Usuarios,on_delete=models.CASCADE,db_column='id_usuario') # Nombre exacto de la columna en la base de datos
    id_categoria = models.ForeignKey(Categorias,on_delete=models.CASCADE,db_column='id_categoria') # Nombre exacto de la columna en la base de datos
    
    class Meta:
        db_table = 'articulos'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla  
        
          
# MODELO TABLA DETALLE_TRANSACCION       
class DetalleTransaccion(models.Model):
    id_detalle_transaccion = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    tipo_transaccion = models.CharField(max_length=20, choices=[("venta", "Venta"), ("compra", "Compra")])
    tipo_entrega = models.CharField(max_length=20, choices=[("domicilio", "Domicilio"), ("retiro_punto_fisico", "Retiro_Punto_Fisico")])
    cantidad_articulos = models.IntegerField()  # Se utiliza IntegerField para que sea de tipo entero
    id_articulo = models.ForeignKey( Articulos,on_delete=models.CASCADE,db_column='id_articulo') # Nombre exacto de la columna en la base de datos
    
    class Meta:
        db_table = 'detalle_transaccion'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla  
        
# MODELO TABLA TRANSACCIONES
class Transacciones(models.Model):
    id_transaccion = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    fecha_transaccion = models.DateField(auto_now_add=True)
    id_usuario = models.ForeignKey( Usuarios,on_delete=models.CASCADE,db_column='id_usuario') # Nombre exacto de la columna en la base de datos
    id_detalle_transaccion = models.ForeignKey(DetalleTransaccion,on_delete=models.CASCADE,db_column='id_detalle_transaccion')  # Nombre exacto de la columna en la base de datos
    
    class Meta:
        db_table = 'transacciones'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla    
        
        
# MODELO TABLA TRANSACCIONES
class Calificaciones(models.Model):
    id_calificacion = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    tipo_calificacion = models.CharField(max_length=20, choices=[("excelente", "Excelente"), ("buena", "Buena"),("mala", "Mala")])
    comentario = models.TextField()
    id_transaccion = models.ForeignKey(Transacciones,on_delete=models.CASCADE,db_column='id_transaccion' )  # Nombre exacto de la columna en la base de datos
   
    class Meta:
        db_table = 'calificaciones'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla   
        
        
# MODELO TABLA TRANSACCIONES
class Pagos(models.Model):
    id_pago = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    id_detalle_transaccion = models.ForeignKey(Transacciones,on_delete=models.CASCADE,db_column='id_detalle_transaccion')  # Nombre exacto de la columna en la base de datos
    
    fecha_pago = models.DateTimeField(auto_now_add=True)
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2)
    estado_pago = models.CharField(max_length=20, choices=[("aprobado", "Aprobado"), ("pendiente", "Pendiente")])
    
    class Meta:
        db_table = 'pagos'  # Nombre correcto de la tabla en la base de datos
        managed = False  # Django no intentará crear esta tabla   


# MODELO TABLA PQRS
class Pqrs(models.Model):
    id_pqr = models.AutoField(primary_key=True)  # Este campo se autoincrementará automáticamente
    tipo_pqr = models.CharField(max_length=20, choices=[("peticion", "Peticion"), ("queja", "Queja"),("reclamo", "Reclamo")])
    descripcion_pqr = models.TextField()
    fecha_pqr = models.DateTimeField(auto_now_add=True)
    id_usuario = models.ForeignKey( Usuarios,on_delete=models.CASCADE,db_column='id_usuario') # Nombre exacto de la columna en la base de datos
    id_transaccion = models.ForeignKey(Transacciones,on_delete=models.CASCADE,db_column='id_transaccion')  # Nombre exacto de la columna en la base de datos
    
    class Meta:
        db_table = 'pqrs'  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla     


