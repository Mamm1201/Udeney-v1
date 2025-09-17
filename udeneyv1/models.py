# ====================================
# IMPORTACIONES NECESARIAS
# ====================================
from django.contrib.auth.hashers import check_password, make_password
from django.db import models

# ====================================
# MODELO USUARIOS
# ====================================


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
    is_active = models.BooleanField(default=True, null=True)

    class Meta:
        db_table = "usuarios"
        managed = True

    def __str__(self):
        return f"{self.nombres_usuario} {self.apellidos_usuario}"

    def set_password(self, raw_password):
        self.password_usuario = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_usuario)


# ====================================
# MODELO ROLES
# ====================================
class Roles(models.Model):
    id_rol = models.AutoField(primary_key=True)
    tipo_rol = models.CharField(
        max_length=20,
        choices=[
            ("vendedor", "Vendedor"),
            ("comprador", "Comprador"),
        ],
    )

    class Meta:
        db_table = "roles"
        managed = True

    def __str__(self):
        return self.tipo_rol


# ====================================
# MODELO USUARIO-ROL (Relaciona usuarios con sus roles)
# ====================================
class UsuarioRol(models.Model):
    ROL_CHOICES = [
        ("vendedor", "Vendedor"),
        ("comprador", "Comprador"),
    ]

    id_usuario_rol = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(
        "usuarios", on_delete=models.CASCADE, db_column="id_usuario"
    )
    id_rol = models.CharField(max_length=10, choices=ROL_CHOICES, db_column="id_rol")

    class Meta:
        db_table = "usuario_rol"
        unique_together = ("id_usuario", "id_rol")
        managed = True


# ====================================
# MODELO CATEGORIAS
# ====================================
class Categorias(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(
        max_length=20,
        choices=[
            ("prenda", "Prenda"),
            ("utiles", "Útiles"),
            ("libros", "Libros"),
            ("herramientas", "Herramientas"),
        ],
    )

    class Meta:
        db_table = "categorias"
        managed = True


# ====================================
# MODELO ARTÍCULOS
# ====================================
class Articulos(models.Model):
    id_articulo = models.AutoField(primary_key=True)
    titulo_articulo = models.CharField(max_length=255)
    descripcion_articulo = models.TextField()
    institucion_articulo = models.CharField(max_length=255, null=True, blank=True)
    precio_articulo = models.DecimalField(max_digits=10, decimal_places=2)
    id_usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, db_column="id_usuario"
    )
    id_categoria = models.ForeignKey(
        Categorias, on_delete=models.CASCADE, db_column="id_categoria"
    )
    imagen = models.ImageField(upload_to="articulos/", null=True, blank=True)
    disponible = models.BooleanField(default=True)

    class Meta:
        db_table = "articulos"
        managed = True


# ====================================
# MODELO DETALLE TRANSACCIÓN
# ====================================
class DetalleTransaccion(models.Model):
    id_detalle_transaccion = models.AutoField(primary_key=True)
    tipo_transaccion = models.CharField(
        max_length=20, choices=[("venta", "Venta"), ("compra", "Compra")]
    )
    tipo_entrega = models.CharField(
        max_length=20,
        choices=[
            ("domicilio", "Domicilio"),
            ("retiro_punto_fisico", "Retiro Punto Físico"),
        ],
    )
    cantidad_articulos = models.IntegerField(null=True, blank=True)
    id_transaccion = models.ForeignKey(
        "Transacciones", on_delete=models.CASCADE, db_column="id_transaccion", null=True
    )

    class Meta:
        db_table = "detalle_transaccion"
        managed = True


# ====================================
# MODELO ARTICULO - DETALLE TRANSACCIÓN (relación muchos a muchos)
# ====================================
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
        managed = True


# ====================================
# MODELO TRANSACCIONES
# ====================================
class Transacciones(models.Model):
    id_transaccion = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, db_column="id_usuario"
    )
    fecha_transaccion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "transacciones"
        managed = True


# ====================================
# MODELO CALIFICACIONES
# ====================================
class Calificaciones(models.Model):
    id_calificacion = models.AutoField(primary_key=True)
    tipo_calificacion = models.CharField(
        max_length=20,
        choices=[
            ("excelente", "Excelente"),
            ("buena", "Buena"),
            ("mala", "Mala"),
        ],
    )
    comentario = models.TextField(null=True, blank=True)
    id_transaccion = models.ForeignKey(
        Transacciones, on_delete=models.CASCADE, db_column="id_transaccion"
    )

    class Meta:
        db_table = "calificaciones"
        managed = True


# ====================================
# MODELO PAGOS
# ====================================
class Pagos(models.Model):
    id_pago = models.AutoField(primary_key=True)
    id_detalle_transaccion = models.ForeignKey(
        DetalleTransaccion, on_delete=models.CASCADE, db_column="id_detalle_transaccion"
    )
    fecha_pago = models.DateTimeField(auto_now_add=True)
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2)
    estado_pago = models.CharField(
        max_length=20, choices=[("aprobado", "Aprobado"), ("pendiente", "Pendiente")]
    )

    class Meta:
        db_table = "pagos"
        managed = True


# ====================================
# MODELO PQRS (Peticiones, Quejas, Reclamos)
# ====================================
class Pqrs(models.Model):
    id_pqr = models.AutoField(primary_key=True)
    tipo_pqr = models.CharField(
        max_length=20,
        choices=[
            ("peticion", "Petición"),
            ("queja", "Queja"),
            ("reclamo", "Reclamo"),
        ],
    )
    descripcion_pqr = models.TextField()
    fecha_pqr = models.DateTimeField(auto_now_add=True)
    # Removido id_usuario - la relación va através de transacciones
    id_transaccion = models.ForeignKey(
        Transacciones, on_delete=models.CASCADE, db_column="id_transaccion"
    )

    # Método para obtener el usuario a través de la transacción
    @property
    def usuario(self):
        return self.id_transaccion.usuario if self.id_transaccion else None

    class Meta:
        db_table = "pqrs"
        managed = True


# ====================================
# MODELO REPORTES (Sistema de moderación)
# ====================================
class Reportes(models.Model):
    id_reporte = models.AutoField(primary_key=True)
    tipo_contenido = models.CharField(
        max_length=20,
        choices=[
            ("articulo", "Artículo"),
            ("usuario", "Usuario"),
            ("comentario", "Comentario"),
        ],
    )
    id_contenido = models.IntegerField()  # ID del contenido reportado
    titulo_reporte = models.CharField(max_length=200)
    razon_reporte = models.TextField()
    descripcion_adicional = models.TextField(blank=True, null=True)
    reportado_por = models.ForeignKey(
        Usuarios, on_delete=models.CASCADE, db_column="reportado_por",
        related_name="reportes_enviados"
    )
    estado_reporte = models.CharField(
        max_length=20,
        choices=[
            ("pendiente", "Pendiente"),
            ("revisando", "Revisando"),
            ("resuelto", "Resuelto"),
            ("rechazado", "Rechazado"),
        ],
        default="pendiente"
    )
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    resuelto_por = models.ForeignKey(
        Usuarios, on_delete=models.SET_NULL, null=True, blank=True,
        db_column="resuelto_por", related_name="reportes_resueltos"
    )
    notas_moderador = models.TextField(blank=True, null=True)

    # Método para obtener el objeto reportado
    def get_contenido_reportado(self):
        if self.tipo_contenido == "articulo":
            try:
                return Articulos.objects.get(id_articulo=self.id_contenido)
            except Articulos.DoesNotExist:
                return None
        elif self.tipo_contenido == "usuario":
            try:
                return Usuarios.objects.get(id_usuario=self.id_contenido)
            except Usuarios.DoesNotExist:
                return None
        return None

    class Meta:
        db_table = "reportes"
        managed = True
