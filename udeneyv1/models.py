from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombres_usuario = models.CharField(max_length=255)
    apellidos_usuario = models.CharField(max_length=255)
    email_usuario = models.EmailField(unique=True)
    password_usuario = models.CharField(max_length=255)
    fecha_registro = models.DateField(auto_now_add=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    telefono_usuario = models.CharField(max_length=20)
    direccion_usuario = models.CharField(max_length=255)

    # Campo necesario para login
    is_active = models.BooleanField(default=True, null=True)

    class Meta:
        db_table = "usuarios"
        managed = False  # o True si controlas migraciones desde Django

    def __str__(self):
        return f"{self.nombres_usuario} {self.apellidos_usuario}"

    def set_password(self, raw_password):
        self.password_usuario = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_usuario)


# MODELO ROLES
class Roles(models.Model):
    id_rol = models.AutoField(primary_key=True)

    # Puedes dejarlo como CharField y manejar la validación manual
    tipo_rol = models.CharField(
        max_length=20,
        choices=[
            ("vendedor", "Vendedor"),
            ("comprador", "Comprador"),
        ],
    )

    class Meta:
        db_table = "roles"
        managed = False  # Para evitar que Django cree/modifique esta tabla

    def __str__(self):
        return self.tipo_rol


# MODELO PARA TABLA USUARIO_ROL
class UsuarioRol(models.Model):
    ROL_CHOICES = [
        ("vendedor", "Vendedor"),
        ("comprador", "Comprador"),
    ]

    id_usuario_rol = models.AutoField(primary_key=True)  # Nuevo campo clave primaria
    id_usuario = models.ForeignKey(
        "usuarios", on_delete=models.CASCADE, db_column="id_usuario"
    )
    id_rol = models.CharField(
        max_length=10, choices=ROL_CHOICES, db_column="id_rol"
    )  # ENUM en Django

    class Meta:
        db_table = "usuario_rol"
        unique_together = ("id_usuario", "id_rol")
        managed = False  # Django no intentará crear esta tabla


# MODELO TABLA CATEGORIAS
class Categorias(models.Model):
    id_categoria = models.AutoField(
        primary_key=True
    )  # Este campo se autoincrementará automáticamente
    nombre_categoria = models.CharField(
        max_length=20,
        choices=[
            ("prenda", "Prenda"),
            ("utiles", "Utiles"),
            ("libros", "Libros"),
            ("herramientas", "Herramientas"),
        ],
    )

    class Meta:
        db_table = "categorias"  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla


# MODELO TABLA ARTICULOS
class Articulos(models.Model):
    id_articulo = models.AutoField(
        primary_key=True
    )  # Este campo se autoincrementará automáticamente
    titulo_articulo = models.CharField(max_length=255)
    descripcion_articulo = models.TextField()
    institucion_articulo = models.CharField(max_length=255, null=True, blank=True)
    precio_articulo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    id_usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, db_column="id_usuario"
    )  # Nombre exacto de la columna en la base de datos
    id_categoria = models.ForeignKey(
        Categorias, on_delete=models.CASCADE, db_column="id_categoria"
    )  # Nombre exacto de la columna en la base de datos
    imagen = models.ImageField(upload_to="articulos/", null=True, blank=True)

    class Meta:
        db_table = "articulos"  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla


# MODELO TABLA DETALLE_TRANSACCION        
class DetalleTransaccion(models.Model):
    id_detalle_transaccion = models.AutoField(primary_key=True)
    tipo_transaccion = models.CharField(
        max_length=20, choices=[("venta", "Venta"), ("compra", "Compra")]
    )
    tipo_entrega = models.CharField(
        max_length=20,
        choices=[
            ("domicilio", "Domicilio"),
            ("retiro_punto_fisico", "Retiro_Punto_Fisico"),
        ],
    )
    cantidad_articulos = models.IntegerField(null=True, blank=True)
    id_transaccion = models.ForeignKey(
        'Transacciones', on_delete=models.CASCADE, db_column="id_transaccion", null=True
    )

    class Meta:
        db_table = "detalle_transaccion"
        managed = False

        
class ArticuloDetalleTransaccion(models.Model):
    id = models.AutoField(primary_key=True)
    id_detalle_transaccion = models.ForeignKey(
        DetalleTransaccion, on_delete=models.CASCADE, db_column="id_detalle_transaccion"
    )
    id_articulo = models.ForeignKey(
        Articulos, on_delete=models.CASCADE, db_column="id_articulo"
    )
    cantidad = models.IntegerField()

    class Meta:
        db_table = "articulo_detalle_transaccion"
        managed = False


# MODELO TABLA TRANSACCIONES
class Transacciones(models.Model):
    id_transaccion = models.AutoField(
        primary_key=True
    )  # Este campo se autoincrementará automáticamente
    id_usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, db_column="id_usuario"
    )  # Nombre exacto de la columna en la base de datos
    fecha_transaccion = models.DateTimeField()

    class Meta:
        db_table = "transacciones"  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla


# MODELO TABLA CALIFICACIONES
class Calificaciones(models.Model):
    id_calificacion = models.AutoField(
        primary_key=True
    )  # Este campo se autoincrementará automáticamente
    tipo_calificacion = models.CharField(
        max_length=20,
        choices=[("excelente", "Excelente"), ("buena", "Buena"), ("mala", "Mala")],
    )
    comentario = models.TextField()
    id_transaccion = models.ForeignKey(
        Transacciones, on_delete=models.CASCADE, db_column="id_transaccion"
    )  # Nombre exacto de la columna en la base de datos

    class Meta:
        db_table = "calificaciones"  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla


# # MODELO TABLA PAGOS
# class Pagos(models.Model):
#     id_pago = models.AutoField(
#         primary_key=True
#     )  # Este campo se autoincrementará automáticamente
#     id_detalle_transaccion = models.ForeignKey(
#         Transacciones, on_delete=models.CASCADE, db_column="id_detalle_transaccion"
#     )  # Nombre exacto de la columna en la base de datos
#     fecha_pago = models.DateTimeField(auto_now_add=True)
#     valor_pago = models.DecimalField(max_digits=10, decimal_places=2)
#     estado_pago = models.CharField(
#         max_length=20, choices=[("aprobado", "Aprobado"), ("pendiente", "Pendiente")]
#     )

#     class Meta:
#         db_table = "pagos"  # Nombre correcto de la tabla en la base de datos
#         managed = False  # Django no intentará crear esta tabla
        
# MODELO TABLA PAGOS
class Pagos(models.Model):
    id_pago = models.AutoField(primary_key=True)
    
    id_detalle_transaccion = models.ForeignKey(
        DetalleTransaccion,  # ✅ Modelo correcto
        on_delete=models.CASCADE,
        db_column="id_detalle_transaccion"
    )
    
    fecha_pago = models.DateTimeField(auto_now_add=True)
    
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2)
    
    estado_pago = models.CharField(
        max_length=20,
        choices=[("aprobado", "Aprobado"), ("pendiente", "Pendiente")]
    )

    class Meta:
        db_table = "pagos"
        managed = False



# MODELO TABLA PQRS
class Pqrs(models.Model):
    id_pqr = models.AutoField(
        primary_key=True
    )  # Este campo se autoincrementará automáticamente
    tipo_pqr = models.CharField(
        max_length=20,
        choices=[("peticion", "Peticion"), ("queja", "Queja"), ("reclamo", "Reclamo")],
    )
    descripcion_pqr = models.TextField()
    fecha_pqr = models.DateTimeField(auto_now_add=True)
    id_usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, db_column="id_usuario"
    )  # Nombre exacto de la columna en la base de datos
    id_transaccion = models.ForeignKey(
        Transacciones, on_delete=models.CASCADE, db_column="id_transaccion"
    )  # Nombre exacto de la columna en la base de datos

    class Meta:
        db_table = "pqrs"  # Asegúrate de usar el nombre correcto de la tabla
        managed = False  # Django no intentará crear esta tabla
