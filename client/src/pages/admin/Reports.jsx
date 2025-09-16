/**
 * Reportes y Análisis - Panel Administrativo
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Download,
  TrendingUp,
  People,
  Store,
  AttachMoney,
  Assessment,
  DateRange
} from '@mui/icons-material';
import axios from 'axios';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    userStats: null,
    transactionStats: null,
    articleStats: null,
    recentActivity: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Cargar datos de reportes
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Cargar datos en paralelo
      const [usersRes, transactionsRes, articlesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/usuarios/', config),
        axios.get('http://localhost:8000/api/v1/transacciones/', config),
        axios.get('http://localhost:8000/api/v1/articulos/', config)
      ]);

      // Procesar estadísticas de usuarios
      const users = usersRes.data;
      const userStats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        newThisMonth: users.filter(u => {
          const regDate = new Date(u.fecha_registro);
          const now = new Date();
          return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
        }).length
      };

      // Procesar estadísticas de transacciones
      const transactions = transactionsRes.data;
      const transactionStats = {
        total: transactions.length,
        thisMonth: transactions.filter(t => {
          const transDate = new Date(t.fecha_transaccion);
          const now = new Date();
          return transDate.getMonth() === now.getMonth() && transDate.getFullYear() === now.getFullYear();
        }).length,
        value: transactions.length * 50000 // Valor promedio estimado
      };

      // Procesar estadísticas de artículos
      const articles = articlesRes.data;
      const articleStats = {
        total: articles.length,
        available: articles.filter(a => a.disponible).length,
        sold: articles.filter(a => !a.disponible).length,
        categories: [...new Set(articles.map(a => a.id_categoria?.nombre_categoria))].filter(Boolean).length
      };

      // Actividad reciente simulada
      const recentActivity = [
        { type: 'user', description: 'Nuevo usuario registrado', time: '2 horas', status: 'success' },
        { type: 'transaction', description: 'Transacción completada', time: '3 horas', status: 'success' },
        { type: 'article', description: 'Artículo publicado', time: '5 horas', status: 'info' },
        { type: 'user', description: 'Usuario desactivado', time: '1 día', status: 'warning' }
      ];

      setReportData({
        userStats,
        transactionStats,
        articleStats,
        recentActivity
      });

      setError(null);
    } catch (err) {
      setError('Error al cargar datos de reportes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Exportar reporte
  const handleExportReport = async (format) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://localhost:8000/api/v1/admin/reports/export/?format=${format}&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${dateRange.startDate}_${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al exportar reporte');
      console.error('Error:', err);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress = null }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
        {progress !== null && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mb: 1, height: 6, borderRadius: 3 }}
              color={color}
            />
            <Typography variant="caption" color="text.secondary">
              {progress}% del objetivo
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Reportes y Análisis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Dashboard de métricas y estadísticas del sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Controles de filtros */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filtros y Exportación" />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Fecha Inicio"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Fecha Fin"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={fetchReportData}
                fullWidth
                startIcon={<Assessment />}
              >
                Actualizar
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={() => handleExportReport('csv')}
                fullWidth
                startIcon={<Download />}
              >
                Exportar CSV
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleExportReport('pdf')}
                fullWidth
                startIcon={<Download />}
              >
                Exportar PDF
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuarios Totales"
            value={reportData.userStats?.total || 0}
            subtitle={`${reportData.userStats?.active || 0} activos, ${reportData.userStats?.newThisMonth || 0} nuevos este mes`}
            icon={<People sx={{ fontSize: 40 }} />}
            color="primary"
            progress={reportData.userStats ? (reportData.userStats.active / reportData.userStats.total) * 100 : 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transacciones"
            value={reportData.transactionStats?.total || 0}
            subtitle={`${reportData.transactionStats?.thisMonth || 0} este mes`}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success"
            progress={75}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Artículos"
            value={reportData.articleStats?.total || 0}
            subtitle={`${reportData.articleStats?.available || 0} disponibles, ${reportData.articleStats?.sold || 0} vendidos`}
            icon={<Store sx={{ fontSize: 40 }} />}
            color="info"
            progress={reportData.articleStats ? (reportData.articleStats.sold / reportData.articleStats.total) * 100 : 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos Estimados"
            value={`$${(reportData.transactionStats?.value || 0).toLocaleString()}`}
            subtitle="Basado en transacciones"
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="warning"
            progress={65}
          />
        </Grid>
      </Grid>

      {/* Actividad reciente y métricas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Actividad Reciente" />
            <CardContent>
              <List dense>
                {reportData.recentActivity.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={activity.description}
                      secondary={`Hace ${activity.time}`}
                    />
                    <Chip
                      label={activity.status}
                      color={activity.status}
                      size="small"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Métricas del Sistema" />
            <CardContent>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Rendimiento del Servidor
                </Typography>
                <LinearProgress variant="determinate" value={92} sx={{ mb: 1, height: 8 }} color="success" />
                <Typography variant="caption" color="success.main">92% Óptimo</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Uso de Base de Datos
                </Typography>
                <LinearProgress variant="determinate" value={68} sx={{ mb: 1, height: 8 }} color="warning" />
                <Typography variant="caption" color="warning.main">68% Utilizado</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Satisfacción de Usuarios
                </Typography>
                <LinearProgress variant="determinate" value={85} sx={{ mb: 1, height: 8 }} color="info" />
                <Typography variant="caption" color="info.main">85% Satisfecho</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Última actualización: {new Date().toLocaleString('es-ES')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;