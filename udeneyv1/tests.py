from django.test import TestCase
from django.urls import reverse
# Usa el modelo de usuario de Django
from django.contrib.auth.models import User
from .models import Transacciones,DetalleTransaccion
from django.utils.timezone import now, timedelta


class HistorialTransaccionesTest(TestCase):
    def setUp(self):
        """Configura los datos de prueba antes de cada test"""
        self.usuario = User.objects.create_user(
            username="testuser", password="testpass")

        # Crear un detalle de transacción de tipo compra
        self.detalle_compra = DetalleTransaccion.objects.create(
            tipo_transaccion="compra")

        # Crear una transacción de prueba
        self.transaccion = Transacciones.objects.create(
            id_usuario=self.usuario,
            fecha_transaccion=now() - timedelta(days=5),
            id_detalle_transaccion=self.detalle_compra
        )

    def test_filtro_por_fecha(self):
        """Prueba que la vista de historial filtra por fecha correctamente"""
        self.client.login(username="testuser", password="testpass")

        # Construir la URL con parámetros de fecha
        url = reverse("historial_transacciones") + \
            "?fecha_inicio=2024-03-01&fecha_fin=2024-03-31"
        response = self.client.get(url)

        # Verificar que la respuesta sea exitosa (código 200)
        self.assertEqual(response.status_code, 200)

        # Verificar que la transacción está en la respuesta
        self.assertContains(
            response, str(
                self.transaccion.fecha_transaccion.date()))
