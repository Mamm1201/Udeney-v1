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
import axios from 'axios';

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
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Cargar artículos, PQRs y datos relacionados
      const [articlesRes, pqrsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/articulos/', config),
        axios.get('http://localhost:8000/api/v1/pqrs/', config),
        axios.get('http://localhost:8000/api/v1/usuarios/', config)
      ]);

      // Simular artículos pendientes de moderación
      const pendingArticles = articlesRes.data.slice(0, 5).map(article => ({
        ...article,
        reportReason: 'Contenido inapropiado',
        reportedBy: 'Usuario anónimo',
        status: 'pending'
      }));

      // Simular contenido reportado
      const reportedContent = [
        {
          id: 1,
          type: 'article',
          title: 'Producto sospechoso',
          reporter: 'user@example.com',
          reason: 'Precio sospechosamente bajo',
          date: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: 2,
          type: 'user',
          title: 'Comportamiento abusivo',
          reporter: 'user2@example.com',
          reason: 'Mensajes ofensivos',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'reviewing'
        }
      ];

      // Usuarios suspendidos
      const suspendedUsers = usersRes.data.filter(user => !user.is_active);

      setModerationData({
        pendingArticles,
        reportedContent,
        pqrs: pqrsRes.data,
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
      const token = localStorage.getItem('access_token');

      if (type === 'article') {
        await axios.patch(
          `http://localhost:8000/api/v1/articulos/${item.id_articulo}/`,
          { disponible: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchModerationData();
      setError(null);
    } catch (err) {
      setError('Error al aprobar contenido');
      console.error('Error:', err);
    }
  };

  // Rechazar/Eliminar contenido
  const handleReject = async (item, type) => {
    try {
      const token = localStorage.getItem('access_token');

      if (type === 'article') {
        await axios.delete(
          `http://localhost:8000/api/v1/articulos/${item.id_articulo}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchModerationData();
      setError(null);
    } catch (err) {
      setError('Error al rechazar contenido');
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
                    <Button size="small" variant="outlined" color="primary">
                      Revisar
                    </Button>
                    <Button size="small" variant="outlined" color="success">
                      Aprobar
                    </Button>
                    <Button size="small" variant="outlined" color="error">
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
                      <TableCell>{pqr.asunto_pqrs}</TableCell>
                      <TableCell>{pqr.id_usuario}</TableCell>
                      <TableCell>
                        <Chip
                          label={pqr.estado_pqrs}
                          color={pqr.estado_pqrs === 'abierto' ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Responder
                        </Button>
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
                        <Button size="small" variant="outlined" color="success">
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
              <Typography variant="h6" gutterBottom>
                {selectedItem.nombre_articulo || selectedItem.title}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedItem.descripcion_articulo || selectedItem.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Precio:</strong> ${selectedItem.precio_articulo?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Categoría:</strong> {selectedItem.id_categoria?.nombre_categoria}
              </Typography>
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