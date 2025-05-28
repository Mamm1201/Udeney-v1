from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Roles(models.Model):
    """Modelo que representa los roles disponibles en el sistema."""

    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=255)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.nombre_rol


class Usuarios(models.Model):
    """
    Modelo que representa los usuarios registrados.
    Incluye métodos para establecer y verificar contraseñas encriptadas.
    """

    id_usuario = models.AutoField(primary_key=True)
    nombres_usuario = models.CharField(max_length=255)
    apellidos_usuario = models.CharField(max_length=255)
    email_usuario = models.EmailField(unique=True)
    password_usuario = models.CharField(max_length=255)
    fecha_registro = models.DateField(auto_now_add=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    telefono_usuario = models.CharField(max_length=20)
    direccion_usuario = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    # Campo necesario para login
    is_active = models.BooleanField(default=True)
    id_rol = models.ForeignKey(Roles, on_delete=models.CASCADE)

    class Meta:
        db_table = "usuarios"

    def __str__(self):
        return f"{self.nombres_usuario} {self.apellidos_usuario}"

    def set_password(self, raw_password):
        """Hashea y asigna la contraseña del usuario."""
        self.password_usuario = make_password(raw_password)

    def check_password(self, raw_password):
        """Verifica si la contraseña ingresada coincide con la almacenada."""
        return check_password(raw_password, self.password_usuario)


class TipoReportes(models.Model):
    """Modelo que representa los tipos de reportes disponibles."""

    id_tipo_reporte = models.AutoField(primary_key=True)
    nombre_tipo_reporte = models.CharField(max_length=255)

    class Meta:
        db_table = "tipo_reportes"

    def __str__(self):
        return self.nombre_tipo_reporte


class Estados(models.Model):
    """Modelo que representa los estados posibles de un reporte."""

    id_estado = models.AutoField(primary_key=True)
    nombre_estado = models.CharField(max_length=255)

    class Meta:
        db_table = "estados"

    def __str__(self):
        return self.nombre_estado


class Reportes(models.Model):
    """
    Modelo que representa un reporte realizado por un usuario.
    Incluye relaciones con tipo de reporte, estado actual y usuario asociado.
    """

    id_reporte = models.AutoField(primary_key=True)
    fecha_reporte = models.DateField(auto_now_add=True)
    descripcion_reporte = models.TextField()
    ubicacion_reporte = models.CharField(max_length=255)
    id_tipo_reporte = models.ForeignKey(TipoReportes, on_delete=models.CASCADE)
    id_estado = models.ForeignKey(Estados, on_delete=models.CASCADE)
    id_usuario = models.ForeignKey(Usuarios, on_delete=models.CASCADE)

    class Meta:
        db_table = "reportes"

    def __str__(self):
        return f"Reporte {self.id_reporte} - {self.id_tipo_reporte}"


class ImagenesReportes(models.Model):
    """Modelo que almacena las imágenes asociadas a un reporte."""

    id_imagen = models.AutoField(primary_key=True)
    imagen = models.ImageField(upload_to="imagenes_reportes/")
    id_reporte = models.ForeignKey(Reportes, on_delete=models.CASCADE)

    class Meta:
        db_table = "imagenes_reportes"

    def __str__(self):
        return f"Imagen {self.id_imagen} - Reporte {self.id_reporte.id_reporte}"
