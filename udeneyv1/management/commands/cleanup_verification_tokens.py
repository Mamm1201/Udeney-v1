"""
Comando para limpiar tokens de verificación expirados
Ejecutar con: python manage.py cleanup_verification_tokens
"""

from django.core.management.base import BaseCommand
from udeneyv1.email_utils import EmailVerificationUtils


class Command(BaseCommand):
    help = 'Limpia tokens de verificación de email expirados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mostrar cuántos tokens se limpiarían sin eliminarlos',
        )

    def handle(self, *args, **options):
        if options['dry_run']:
            from django.utils import timezone
            from udeneyv1.models import Usuarios

            expired_count = Usuarios.objects.filter(
                verification_token_expires__lt=timezone.now()
            ).count()

            self.stdout.write(
                self.style.WARNING(
                    f'Se limpiarían {expired_count} tokens expirados (modo dry-run)'
                )
            )
        else:
            cleaned_count = EmailVerificationUtils.cleanup_expired_tokens()

            if cleaned_count > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Se limpiaron {cleaned_count} tokens expirados exitosamente'
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS('No se encontraron tokens expirados para limpiar')
                )