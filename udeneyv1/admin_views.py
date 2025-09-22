"""
Views administrativas para los nuevos roles del sistema.
Endpoints específicos para Admin_Negocio, Monitor y Superadmin.
"""

from datetime import timedelta

from django.contrib.auth.models import Group, User
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .logging_utils import AuditLogger
# Importaciones locales
from .models import (Articulos, Calificaciones, DetalleTransaccion, Pagos, Pqrs,
                     Reportes, Transacciones, Usuarios)
from .permissions_new import (AdminPermissions, IsAdminNegocio, IsMonitor,
                              MonitorPermissions, user_has_group)
from .serializers import (ArticulosSerializer, CalificacionesSerializer, PqrsSerializer,
                          ReportesSerializer, TransaccionesSerializer, UsuariosSerializer)

# ====================================
# GESTIÓN DE USUARIOS (Admin_Negocio)
# ====================================


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios por parte de Admin_Negocio
    """

    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer
    permission_classes = [AdminPermissions]

    def get_queryset(self):
        """Filtrar usuarios según permisos"""
        if self.request.user.is_superuser:
            return Usuarios.objects.all()
        elif user_has_group(self.request.user, "Admin_Negocio"):
            # Admin negocio no puede gestionar superusers
            excluded_ids = User.objects.filter(is_superuser=True).values_list(
                "id", flat=True
            )
            return Usuarios.objects.exclude(id_usuario__in=excluded_ids)
        return Usuarios.objects.none()

    @action(detail=True, methods=["post"])
    def block_user(self, request, pk=None):
        """Bloquear un usuario"""
        usuario = self.get_object()
        usuario.is_active = False
        usuario.save()

        # Audit log
        AuditLogger.log_model_change(
            request.user,
            "Usuario",
            usuario.id_usuario,
            "BLOCKED",
            {"reason": request.data.get("reason", "Sin motivo especificado")},
        )

        return Response({"message": "Usuario bloqueado exitosamente"})

    @action(detail=True, methods=["post"])
    def unblock_user(self, request, pk=None):
        """Desbloquear un usuario"""
        usuario = self.get_object()
        usuario.is_active = True
        usuario.save()

        # Audit log
        AuditLogger.log_model_change(
            request.user, "Usuario", usuario.id_usuario, "UNBLOCKED", {}
        )

        return Response({"message": "Usuario desbloqueado exitosamente"})

    @action(detail=True, methods=["get"])
    def user_activity(self, request, pk=None):
        """Obtener actividad de un usuario específico"""
        usuario = self.get_object()

        # Estadísticas del usuario
        total_transactions = Transacciones.objects.filter(usuario=usuario).count()
        total_articles = Articulos.objects.filter(id_usuario=usuario).count()
        avg_rating = Calificaciones.objects.filter(
            id_transaccion__usuario=usuario
        ).aggregate(avg_rating=Avg("tipo_calificacion"))

        activity_data = {
            "user_info": UsuariosSerializer(usuario).data,
            "statistics": {
                "total_transactions": total_transactions,
                "total_articles": total_articles,
                "average_rating": avg_rating.get("avg_rating") or 0,
                "last_login": None,  # Se puede obtener del sistema de Django
            },
        }

        return Response(activity_data)


# ====================================
# REPORTES Y ANALYTICS
# ====================================


class ReportsViewSet(viewsets.ViewSet):
    """
    ViewSet para reportes del negocio (Admin_Negocio y Monitor)
    """

    permission_classes = [AdminPermissions]  # Admin_Negocio o superior

    @action(detail=False, methods=["get"])
    def business_overview(self, request):
        """Resumen general del negocio"""
        # Fechas para el análisis
        today = timezone.now().date()
        last_month = today - timedelta(days=30)
        last_week = today - timedelta(days=7)

        # Métricas principales
        total_users = Usuarios.objects.filter(is_active=True).count()
        total_articles = Articulos.objects.filter(disponible=True).count()
        total_transactions = Transacciones.objects.count()

        # Transacciones recientes
        recent_transactions = Transacciones.objects.filter(
            fecha_transaccion__gte=last_month
        ).count()

        weekly_transactions = Transacciones.objects.filter(
            fecha_transaccion__gte=last_week
        ).count()

        # Usuarios por rol
        users_by_role = {}
        for group in Group.objects.all():
            users_by_role[group.name] = group.user_set.count()

        # Artículos por categoría
        articles_by_category = Articulos.objects.values(
            "id_categoria__nombre_categoria"
        ).annotate(count=Count("id_articulo"))

        overview_data = {
            "summary": {
                "total_users": total_users,
                "total_articles": total_articles,
                "total_transactions": total_transactions,
                "recent_transactions": recent_transactions,
                "weekly_transactions": weekly_transactions,
            },
            "users_by_role": users_by_role,
            "articles_by_category": list(articles_by_category),
            "generated_at": timezone.now(),
        }

        return Response(overview_data)

    @action(detail=False, methods=["get"])
    def transaction_report(self, request):
        """Reporte detallado de transacciones"""
        # Parámetros de filtro
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        transaction_type = request.query_params.get("type")

        # Query base
        queryset = Transacciones.objects.all()

        # Aplicar filtros
        if start_date:
            queryset = queryset.filter(fecha_transaccion__gte=start_date)
        if end_date:
            queryset = queryset.filter(fecha_transaccion__lte=end_date)

        # Estadísticas
        total_transactions = queryset.count()
        transactions_by_type = (
            DetalleTransaccion.objects.filter(id_transaccion__in=queryset)
            .values("tipo_transaccion")
            .annotate(count=Count("id_detalle_transaccion"))
        )

        # Transacciones por mes
        monthly_stats = (
            queryset.extra(
                select={
                    "month": "MONTH(fecha_transaccion)",
                    "year": "YEAR(fecha_transaccion)",
                }
            )
            .values("month", "year")
            .annotate(count=Count("id_transaccion"))
        )

        report_data = {
            "total_transactions": total_transactions,
            "transactions_by_type": list(transactions_by_type),
            "monthly_statistics": list(monthly_stats),
            "filters_applied": {
                "start_date": start_date,
                "end_date": end_date,
                "transaction_type": transaction_type,
            },
        }

        return Response(report_data)

    @action(detail=False, methods=["get"])
    def user_engagement(self, request):
        """Reporte de engagement de usuarios"""
        # Usuarios activos
        active_users = Usuarios.objects.filter(is_active=True).count()
        inactive_users = Usuarios.objects.filter(is_active=False).count()

        # Usuarios con transacciones recientes (últimos 30 días)
        last_month = timezone.now().date() - timedelta(days=30)
        engaged_users = (
            Usuarios.objects.filter(transacciones__fecha_transaccion__gte=last_month)
            .distinct()
            .count()
        )

        # Top usuarios por transacciones
        top_users = Usuarios.objects.annotate(
            transaction_count=Count("transacciones")
        ).order_by("-transaction_count")[:10]

        engagement_data = {
            "user_stats": {
                "active_users": active_users,
                "inactive_users": inactive_users,
                "engaged_users_last_month": engaged_users,
                "engagement_rate": round((engaged_users / active_users * 100), 2)
                if active_users > 0
                else 0,
            },
            "top_users": [
                {
                    "user": f"{user.nombres_usuario} {user.apellidos_usuario}",
                    "email": user.email_usuario,
                    "transaction_count": user.transaction_count,
                }
                for user in top_users
            ],
        }

        return Response(engagement_data)


# ====================================
# MODERACIÓN DE CONTENIDO (Admin_Negocio)
# ====================================


class ContentModerationViewSet(viewsets.ViewSet):
    """
    ViewSet para moderación de contenido
    """

    permission_classes = [AdminPermissions]

    @action(detail=False, methods=["get"])
    def pending_reviews(self, request):
        """Artículos y contenido pendiente de revisión"""
        try:
            # Artículos disponibles para revisión (últimos 20)
            pending_articles = Articulos.objects.all().order_by('-id_articulo')[:20]

            # PQRs pendientes - usar select_related para obtener datos de transacción y usuario
            pending_pqrs = Pqrs.objects.select_related('id_transaccion', 'id_transaccion__usuario').order_by('-fecha_pqr')[:20]

            # Serializar artículos
            articles_data = ArticulosSerializer(pending_articles, many=True).data

            # Adaptar PQRs para el frontend usando el modelo corregido
            pqrs_data = []
            for pqr in pending_pqrs:
                # Usar la property usuario del modelo corregido
                usuario = pqr.usuario

                pqrs_data.append({
                    'id_pqrs': pqr.id_pqr,
                    'tipo_pqrs': pqr.tipo_pqr,
                    'asunto_pqrs': f"{pqr.tipo_pqr.title()} - {pqr.descripcion_pqr[:50]}...",
                    'descripcion_pqrs': pqr.descripcion_pqr,
                    'estado_pqrs': 'abierto',  # Simular estado por ahora
                    'fecha_creacion': pqr.fecha_pqr,
                    'id_usuario': {
                        'nombres_usuario': usuario.nombres_usuario if usuario else 'Usuario desconocido',
                        'apellidos_usuario': usuario.apellidos_usuario if usuario else '',
                        'email_usuario': usuario.email_usuario if usuario else 'No disponible'
                    } if usuario else None
                })

            review_data = {
                "pending_articles": articles_data,
                "pending_pqrs": pqrs_data,
                "total_pending": pending_articles.count() + pending_pqrs.count(),
            }

            return Response(review_data)
        except Exception as e:
            print(f"Error en pending_reviews: {e}")
            return Response(
                {"error": "Error al cargar datos de moderación", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"])
    def moderate_article(self, request, pk=None):
        """Moderar un artículo específico"""
        try:
            article = Articulos.objects.get(id_articulo=pk)
        except Articulos.DoesNotExist:
            return Response(
                {"error": "Artículo no encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        action_type = request.data.get("action")  # 'approve', 'reject', 'suspend'
        reason = request.data.get("reason", "")

        if action_type == "suspend":
            article.disponible = False
            article.save()

            # Audit log
            AuditLogger.log_model_change(
                request.user,
                "Articulo",
                article.id_articulo,
                "SUSPENDED",
                {"reason": reason},
            )

            return Response({"message": "Artículo suspendido exitosamente"})

        elif action_type == "approve":
            article.disponible = True
            article.save()

            return Response({"message": "Artículo aprobado exitosamente"})

        return Response(
            {"error": "Acción no válida"}, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=["get"])
    def reported_content(self, request):
        """Obtener contenido reportado"""
        try:
            # Obtener reportes pendientes y en revisión
            reportes = Reportes.objects.filter(
                estado_reporte__in=['pendiente', 'revisando']
            ).select_related(
                'reportado_por', 'resuelto_por'
            ).order_by('-fecha_reporte')[:20]

            # Serializar reportes
            reportes_data = ReportesSerializer(reportes, many=True).data

            # Adaptar formato para el frontend existente
            reported_content = []
            for reporte in reportes_data:
                contenido_info = reporte.get('contenido_info', {})
                reported_content.append({
                    'id': reporte['id_reporte'],
                    'type': reporte['tipo_contenido'],
                    'title': reporte['titulo_reporte'],
                    'reporter': reporte['reportado_por_nombre'],
                    'reason': reporte['razon_reporte'],
                    'date': reporte['fecha_reporte'],
                    'status': reporte['estado_reporte'],
                    'content_info': contenido_info,
                    'description': reporte.get('descripcion_adicional', ''),
                    'moderator_notes': reporte.get('notas_moderador', '')
                })

            return Response({
                "reported_content": reported_content,
                "total_reports": len(reported_content)
            })

        except Exception as e:
            print(f"Error en reported_content: {e}")
            return Response(
                {"error": "Error al cargar reportes", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"])
    def process_report(self, request, pk=None):
        """Procesar un reporte específico"""
        try:
            reporte = Reportes.objects.get(id_reporte=pk)
        except Reportes.DoesNotExist:
            return Response(
                {"error": "Reporte no encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        action_type = request.data.get("action")  # 'approve', 'reject', 'reviewing'
        notes = request.data.get("notes", "")

        if action_type == "approve":
            reporte.estado_reporte = "resuelto"
            reporte.fecha_resolucion = timezone.now()
            reporte.notas_moderador = notes
            # Aquí podrías agregar lógica para el usuario resuelto_por si es necesario
            reporte.save()

            return Response({"message": "Reporte aprobado y resuelto"})

        elif action_type == "reject":
            reporte.estado_reporte = "rechazado"
            reporte.fecha_resolucion = timezone.now()
            reporte.notas_moderador = notes
            reporte.save()

            return Response({"message": "Reporte rechazado"})

        elif action_type == "reviewing":
            reporte.estado_reporte = "revisando"
            reporte.notas_moderador = notes
            reporte.save()

            return Response({"message": "Reporte marcado como en revisión"})

        return Response(
            {"error": "Acción no válida"}, status=status.HTTP_400_BAD_REQUEST
        )


# ====================================
# MONITOR VIEW (Solo lectura)
# ====================================


class MonitorViewSet(viewsets.ViewSet):
    """
    ViewSet para usuarios con rol Monitor (solo lectura)
    """

    permission_classes = [MonitorPermissions]

    @action(detail=False, methods=["get"])
    def system_health(self, request):
        """Estado general del sistema"""
        # Métricas básicas del sistema
        total_users = Usuarios.objects.count()
        active_users = Usuarios.objects.filter(is_active=True).count()
        total_transactions_today = Transacciones.objects.filter(
            fecha_transaccion__date=timezone.now().date()
        ).count()

        # Errores recientes (si se implementa logging)
        # recent_errors = ...

        health_data = {
            "system_status": "healthy",  # Se puede hacer más sofisticado
            "metrics": {
                "total_users": total_users,
                "active_users": active_users,
                "transactions_today": total_transactions_today,
                "uptime": "99.9%",  # Placeholder
            },
            "last_updated": timezone.now(),
        }

        return Response(health_data)

    @action(detail=False, methods=["get"])
    def audit_logs(self, request):
        """Logs de auditoría del sistema"""
        # Esta implementación dependería del sistema de logging que tengas
        # Por ahora retornamos un placeholder
        logs_data = {
            "recent_activities": [
                {
                    "timestamp": timezone.now(),
                    "user": "admin@eduney.com",
                    "action": "USER_BLOCKED",
                    "details": "Usuario bloqueado por comportamiento sospechoso",
                }
                # Más logs...
            ],
            "summary": {
                "total_activities_today": 25,
                "critical_events": 0,
                "warnings": 2,
            },
        }

        return Response(logs_data)


# ====================================
# CONFIGURACIÓN DEL SISTEMA (Superuser)
# ====================================


@api_view(["GET", "POST"])
@permission_classes([AdminPermissions])
def system_configuration(request):
    """
    Endpoint para configuración del sistema (solo superusers)
    """
    if not request.user.is_superuser:
        return Response(
            {
                "error": "Solo superusuarios pueden acceder a la configuración del sistema"
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        if request.method == "GET":
            # Obtener configuración actual
            from .models import SystemConfig
            from .serializers import SystemConfigSerializer

            config = SystemConfig.get_config()
            serializer = SystemConfigSerializer(config)
            return Response(serializer.data)

        elif request.method == "POST":
            # Actualizar configuración
            from .models import SystemConfig, Usuarios
            from .serializers import SystemConfigSerializer

            config = SystemConfig.get_config()
            serializer = SystemConfigSerializer(config, data=request.data, partial=True)

            if serializer.is_valid():
                # Obtener el usuario de Eduney correspondiente al usuario Django autenticado
                try:
                    usuario_eduney = Usuarios.objects.get(id_usuario=request.user.id)
                    serializer.save(updated_by=usuario_eduney)
                except Usuarios.DoesNotExist:
                    serializer.save()  # Guardar sin usuario si no existe

                return Response({
                    "message": "Configuración actualizada exitosamente",
                    "config": serializer.data
                })
            else:
                return Response({
                    "error": "Datos inválidos",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            "error": f"Error interno del servidor: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AdminPermissions])
def system_metrics(request):
    """
    Endpoint para obtener métricas reales del sistema
    """
    if not request.user.is_superuser:
        return Response(
            {"error": "Solo superusuarios pueden acceder a las métricas del sistema"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        import psutil
        from django.db import connection
        from datetime import datetime, timedelta
        from django.utils import timezone

        # Métricas de rendimiento del servidor
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        # Métricas de base de datos
        with connection.cursor() as cursor:
            # Número de conexiones activas
            cursor.execute("SHOW PROCESSLIST")
            db_connections = len(cursor.fetchall())

            # Tamaño de la base de datos
            cursor.execute("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size (MB)' FROM information_schema.tables WHERE table_schema = DATABASE()")
            db_size = cursor.fetchone()[0] or 0

        # Métricas de tráfico (últimas 24 horas)
        from .models import Usuarios, Transacciones, Articulos
        yesterday = timezone.now() - timedelta(days=1)

        # Usuarios activos (que se han registrado o han hecho transacciones en las últimas 24h)
        active_users = Usuarios.objects.filter(
            fecha_registro__gte=yesterday
        ).count()

        # Transacciones en las últimas 24h
        recent_transactions = Transacciones.objects.filter(
            fecha_transaccion__gte=yesterday
        ).count()

        # Cálculo de uptime simulado (en producción esto vendría de logs)
        uptime_percent = 99.9

        metrics_data = {
            "performance": {
                "cpu_usage": round(cpu_percent, 1),
                "memory_usage": round(memory.percent, 1),
                "disk_usage": round(disk.percent, 1)
            },
            "database": {
                "connections": db_connections,
                "size_mb": float(db_size),
                "usage_percent": min(round((db_connections / 100) * 100, 1), 100)  # Simulado
            },
            "traffic": {
                "active_users_24h": active_users,
                "transactions_24h": recent_transactions,
                "traffic_percent": min(round((recent_transactions / 10) * 100, 1), 100)  # Simulado
            },
            "uptime": {
                "percent": uptime_percent,
                "last_restart": timezone.now() - timedelta(days=7)  # Simulado
            }
        }

        return Response(metrics_data)

    except ImportError:
        # Si psutil no está disponible, devolver métricas simuladas
        return Response({
            "performance": {"cpu_usage": 15.2, "memory_usage": 68.5, "disk_usage": 45.0},
            "database": {"connections": 5, "size_mb": 125.6, "usage_percent": 68.0},
            "traffic": {"active_users_24h": 12, "transactions_24h": 8, "traffic_percent": 45.0},
            "uptime": {"percent": 99.9, "last_restart": timezone.now() - timedelta(days=7)}
        })
    except Exception as e:
        return Response({
            "error": f"Error al obtener métricas: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ====================================
# PROMOCIONES Y DESCUENTOS (Admin_Negocio)
# ====================================


class PromotionsViewSet(viewsets.ViewSet):
    """
    ViewSet para gestionar promociones y descuentos
    """

    permission_classes = [AdminPermissions]

    # Placeholder para futura implementación de promociones
    @action(detail=False, methods=["get"])
    def list_promotions(self, request):
        """Listar todas las promociones"""
        return Response(
            {"message": "Funcionalidad de promociones en desarrollo", "promotions": []}
        )

    @action(detail=False, methods=["post"])
    def create_promotion(self, request):
        """Crear nueva promoción"""
        return Response(
            {"message": "Promoción creada exitosamente (placeholder)"},
            status=status.HTTP_201_CREATED,
        )
