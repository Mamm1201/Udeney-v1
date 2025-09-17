/**
 * Moderación de Contenido - Panel Administrativo
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List
} from '@mui/material';
import {
  Check,
  Close,
  Visibility,
  Block,
  Flag,
  Message,
  Store,
  Person,
  Report
} from '@mui/icons-material';
import api from '../../api/axiosConfig';

const Moderation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [moderationData, setModerationData] = useState({
    pendingArticles: [],
    reportedContent: [],
    pqrs: [],
    suspendedUsers: []
  });

  // Cargar datos de moderación
  const fetchModerationData = async () => {
    try {
      setLoading(true);

      // Cargar datos reales de moderación desde backend
      const [moderationRes, reportsRes, usersRes] = await Promise.all([
        api.get('/admin/moderation/pending_reviews/'),
        api.get('/admin/moderation/reported_content/'),
        api.get('/admin/complete-users/')
      ]);

      // Datos reales desde el backend
      const pendingArticles = moderationRes.data.pending_articles || [];
      const pqrsData = moderationRes.data.pending_pqrs || [];

      // Usuarios suspendidos (inactivos)
      const suspendedUsers = usersRes.data.users.filter(user => !user.is_active);

      // Contenido reportado REAL desde el backend
      const reportedContent = reportsRes.data.reported_content || [];

      setModerationData({
        pendingArticles,
        reportedContent,
        pqrs: pqrsData,
        suspendedUsers
      });

      setError(null);
    } catch (err) {
      setError('Error al cargar datos de moderación');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  // Aprobar contenido
  const handleApprove = async (item, type) => {
    try {
      if (type === 'article') {
        // Usar endpoint real de moderación
        await api.post(`/admin/moderation/${item.id_articulo}/moderate_article/`, {
          action: 'approve',
          reason: 'Contenido aprobado por moderador'
        });
      }

      await fetchModerationData();
      setError(null);
    } catch (err) {
      setError('Error al aprobar contenido');
      console.error('Error:', err);
    }
  };

  // Rechazar/Suspender contenido
  const handleReject = async (item, type) => {
    try {
      if (type === 'article') {
        // Usar endpoint real de moderación para suspender
        await api.post(`/admin/moderation/${item.id_articulo}/moderate_article/`, {
          action: 'suspend',
          reason: 'Contenido rechazado por moderador'
        });
      }

      await fetchModerationData();
      setError(null);
    } catch (err) {
      setError('Error al rechazar contenido');
      console.error('Error:', err);
    }
  };

  // Reactivar usuario suspendido
  const handleReactivateUser = async (user) => {
    try {
      if (user.id_usuario) {
        await api.patch(`/usuarios/${user.id_usuario}/`, {
          is_active: true
        });
      }
      await fetchModerationData();
      setError(null);
    } catch (err) {
      setError('Error al reactivar usuario');
      console.error('Error:', err);
    }
  };

  // Responder PQR
  const handleRespondPQR = async (pqr) => {
    try {
      await api.patch(`/pqrs/${pqr.id_pqrs}/`, {
        estado_pqrs: 'cerrado'
      });
      await fetchModerationData();
      setError(null);
    } catch (err) {
      setError('Error al responder PQR');
      console.error('Error:', err);
    }
  };

  // Procesar reportes reales
  const handleProcessReport = async (report, action) => {
    try {
      await api.post(`/admin/moderation/${report.id}/process_report/`, {
        action: action, // 'approve', 'reject', 'reviewing'
        notes: `Procesado por moderador - ${action}`
      });
      await fetchModerationData();
      setError(null);
    } catch (err) {
      setError('Error al procesar reporte');
      console.error('Error:', err);
    }
  };

  // Ver detalles
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
          Moderación de Contenido
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Revisa y modera contenido, PQRs y usuarios del sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Store sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">{moderationData.pendingArticles.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Artículos Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Flag sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6">{moderationData.reportedContent.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Contenido Reportado
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Message sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">{moderationData.pqrs.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                PQRs Activas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Block sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
              <Typography variant="h6">{moderationData.suspendedUsers.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios Suspendidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de contenido */}
      <Paper elevation={1}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Artículos Pendientes" />
          <Tab label="Contenido Reportado" />
          <Tab label="PQRs" />
          <Tab label="Usuarios Suspendidos" />
        </Tabs>

        {/* Tab 0: Artículos Pendientes */}
        {tabValue === 0 && (
          <Box p={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Artículo</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Razón</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moderationData.pendingArticles.map((article) => (
                    <TableRow key={article.id_articulo}>
                      <TableCell>{article.nombre_articulo}</TableCell>
                      <TableCell>
                        {article.id_usuario?.nombres_usuario} {article.id_usuario?.apellidos_usuario}
                      </TableCell>
                      <TableCell>{article.reportReason}</TableCell>
                      <TableCell>
                        {new Date(article.fecha_publicacion).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Chip label="Pendiente" color="warning" size="small" />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(article)}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(article, 'article')}
                          >
                            <Check />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(article, 'article')}
                          >
                            <Close />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 1: Contenido Reportado */}
        {tabValue === 1 && (
          <Box p={2}>
            <List>
              {moderationData.reportedContent.map((report) => (
                <ListItem key={report.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <Flag />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={report.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Reportado por: {report.reporter}
                        </Typography>
                        <Typography variant="body2">
                          Razón: {report.reason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(report.date).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleProcessReport(report, 'reviewing')}
                    >
                      Revisar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleProcessReport(report, 'approve')}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleProcessReport(report, 'reject')}
                    >
                      Rechazar
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Tab 2: PQRs */}
        {tabValue === 2 && (
          <Box p={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Asunto</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moderationData.pqrs.map((pqr) => (
                    <TableRow key={pqr.id_pqrs}>
                      <TableCell>{pqr.id_pqrs}</TableCell>
                      <TableCell>
                        <Chip label={pqr.tipo_pqrs} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {pqr.asunto_pqrs}
                        </Typography>
                        {pqr.descripcion_pqrs && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {pqr.descripcion_pqrs.substring(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {pqr.id_usuario?.nombres_usuario ? (
                          <Box>
                            <Typography variant="body2">
                              {pqr.id_usuario.nombres_usuario} {pqr.id_usuario.apellidos_usuario}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pqr.id_usuario.email_usuario}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Usuario #{pqr.id_usuario}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pqr.estado_pqrs}
                          color={pqr.estado_pqrs === 'abierto' ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewDetails(pqr)}
                          >
                            Ver
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleRespondPQR(pqr)}
                            disabled={pqr.estado_pqrs === 'cerrado'}
                          >
                            {pqr.estado_pqrs === 'cerrado' ? 'Cerrado' : 'Cerrar'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 3: Usuarios Suspendidos */}
        {tabValue === 3 && (
          <Box p={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Fecha Registro</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moderationData.suspendedUsers.map((user) => (
                    <TableRow key={user.id_usuario}>
                      <TableCell>
                        {user.nombres_usuario} {user.apellidos_usuario}
                      </TableCell>
                      <TableCell>{user.email_usuario}</TableCell>
                      <TableCell>
                        {new Date(user.fecha_registro).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Chip label="Suspendido" color="error" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleReactivateUser(user)}
                        >
                          Reactivar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Dialog para ver detalles */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Contenido</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              {/* Si es un artículo */}
              {selectedItem.nombre_articulo && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedItem.nombre_articulo}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedItem.descripcion_articulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Precio:</strong> ${selectedItem.precio_articulo?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Categoría:</strong> {selectedItem.id_categoria?.nombre_categoria}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Vendedor:</strong> {selectedItem.id_usuario?.nombres_usuario} {selectedItem.id_usuario?.apellidos_usuario}
                  </Typography>
                </>
              )}

              {/* Si es una PQR */}
              {selectedItem.asunto_pqrs && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedItem.tipo_pqrs}: {selectedItem.asunto_pqrs}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedItem.descripcion_pqrs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Usuario:</strong> {selectedItem.id_usuario?.nombres_usuario} {selectedItem.id_usuario?.apellidos_usuario}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {selectedItem.id_usuario?.email_usuario}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Estado:</strong> {selectedItem.estado_pqrs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Fecha:</strong> {new Date(selectedItem.fecha_creacion).toLocaleString('es-ES')}
                  </Typography>
                </>
              )}

              {/* Si es contenido reportado */}
              {selectedItem.title && !selectedItem.nombre_articulo && !selectedItem.asunto_pqrs && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedItem.title}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Reportado por:</strong> {selectedItem.reporter}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Razón:</strong> {selectedItem.reason}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Fecha:</strong> {new Date(selectedItem.date).toLocaleString('es-ES')}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
          <Button variant="contained" color="success">Aprobar</Button>
          <Button variant="contained" color="error">Rechazar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Moderation;