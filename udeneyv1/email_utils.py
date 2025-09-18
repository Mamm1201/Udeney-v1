# ====================================
# UTILIDADES PARA VERIFICACIÓN DE EMAIL
# ====================================

import uuid
from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from .models import Usuarios
import logging

logger = logging.getLogger(__name__)


class EmailVerificationUtils:
    """Utilidades para manejo de verificación de email"""

    @staticmethod
    def generate_verification_token():
        """Genera un token único para verificación"""
        return str(uuid.uuid4())

    @staticmethod
    def get_token_expiry():
        """Retorna la fecha de expiración del token (24 horas)"""
        return timezone.now() + timedelta(hours=24)

    @staticmethod
    def create_verification_token(usuario):
        """Crea un token de verificación para un usuario"""
        token = EmailVerificationUtils.generate_verification_token()
        expiry = EmailVerificationUtils.get_token_expiry()

        usuario.verification_token = token
        usuario.verification_token_expires = expiry
        usuario.save()

        return token

    @staticmethod
    def verify_email_token(token):
        """Verifica si un token es válido y no ha expirado"""
        try:
            usuario = Usuarios.objects.get(
                verification_token=token,
                verification_token_expires__gt=timezone.now()
            )
            return usuario
        except Usuarios.DoesNotExist:
            return None

    @staticmethod
    def send_verification_email(usuario, frontend_url="http://localhost:5173"):
        """Envía email de verificación"""
        try:
            token = EmailVerificationUtils.create_verification_token(usuario)
            verification_url = f"{frontend_url}/verify-email/{token}"

            # Contexto para el template
            context = {
                'usuario': usuario,
                'verification_url': verification_url,
                'token': token,
                'expiry_hours': 24
            }

            # Renderizar template HTML
            html_message = render_to_string('emails/email_verification.html', context)
            plain_message = strip_tags(html_message)

            # Enviar email
            result = send_mail(
                subject='Verifica tu cuenta en Udeney',
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[usuario.email_usuario],
                html_message=html_message,
                fail_silently=False,
            )

            if result:
                logger.info(f"Email de verificación enviado a {usuario.email_usuario}")
                return True
            else:
                logger.error(f"Error al enviar email a {usuario.email_usuario}")
                return False

        except Exception as e:
            logger.error(f"Error al enviar email de verificación: {str(e)}")
            return False

    @staticmethod
    def can_resend_verification(usuario, cooldown_minutes=5):
        """Verifica si se puede reenviar el email (rate limiting)"""
        if not usuario.verification_token_expires:
            return True

        # Permitir reenvío si han pasado X minutos desde el último envío
        time_since_last = timezone.now() - (
            usuario.verification_token_expires - timedelta(hours=24)
        )
        return time_since_last.total_seconds() > (cooldown_minutes * 60)

    @staticmethod
    def mark_email_verified(usuario):
        """Marca el email como verificado y limpia el token"""
        from django.contrib.auth.models import User

        usuario.email_verified = True
        usuario.verification_token = None
        usuario.verification_token_expires = None
        usuario.is_active = True  # Activar la cuenta
        usuario.save()

        # También activar el usuario Django
        try:
            django_user = User.objects.get(id=usuario.id_usuario)
            django_user.is_active = True
            django_user.save()
        except User.DoesNotExist:
            logger.error(f"Usuario Django no encontrado para {usuario.email_usuario}")

        logger.info(f"Email verificado para usuario {usuario.email_usuario}")
        return True

    @staticmethod
    def cleanup_expired_tokens():
        """Limpia tokens expirados (para ejecutar como tarea periódica)"""
        expired_count = Usuarios.objects.filter(
            verification_token_expires__lt=timezone.now()
        ).update(
            verification_token=None,
            verification_token_expires=None
        )

        logger.info(f"Limpiados {expired_count} tokens expirados")
        return expired_count


class EmailTemplateUtils:
    """Utilidades para templates de email"""

    @staticmethod
    def get_base_context():
        """Contexto base para todos los emails"""
        return {
            'site_name': 'Udeney',
            'site_url': 'http://localhost:5173',
            'support_email': 'soporte@udeney.com',
            'year': datetime.now().year
        }