/**
 * Página de PQRs - Sistema de Peticiones, Quejas y Reclamos
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  Add,
  Support,
  Assignment,
  History,
  Send,
  CheckCircle,
  Schedule,
  Info,
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

const PQRs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  // Estados para datos
  const [userPqrs, setUserPqrs] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  // Estados para formulario
  const [formData, setFormData] = useState({
    tipo_pqr: '',
    descripcion_pqr: '',
    id_transaccion: '',
  });

  // Cargar datos del usuario
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [pqrsRes, transactionsRes] = await Promise.all([
        api.get('/user-pqrs/list/'),
        api.get('/user-pqrs/transactions/'),
      ]);

      setUserPqrs(pqrsRes.data.pqrs || []);
      setUserTransactions(transactionsRes.data.transactions || []);
      setUserInfo(transactionsRes.data.user_info || null);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Crear nueva PQR
  const handleCreatePQR = async () => {
    try {
      if (
        !formData.tipo_pqr ||
        !formData.descripcion_pqr ||
        !formData.id_transaccion
      ) {
        setError('Todos los campos son requeridos');
        return;
      }

      const response = await api.post('/user-pqrs/create/', formData);

      setSuccess('PQR creada exitosamente');
      setFormData({ tipo_pqr: '', descripcion_pqr: '', id_transaccion: '' });
      setOpenDialog(false);
      await fetchUserData(); // Recargar datos
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear PQR');
      console.error('Error:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = estado => {
    switch (estado?.toLowerCase()) {
      case 'resuelto':
        return 'success';
      case 'revisando':
        return 'warning';
      case 'pendiente de revisión':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeColor = tipo => {
    switch (tipo) {
      case 'peticion':
        return 'primary';
      case 'queja':
        return 'warning';
      case 'reclamo':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && userPqrs.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Navbar />
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Support sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Sistema de PQRs
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Peticiones, Quejas y Reclamos - Centro de Soporte
            </Typography>
          </Box>
        </Box>

        {userInfo && (
          <Card
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="primary">
                ¡Hola, {userInfo.nombre}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aquí puedes gestionar tus peticiones, quejas y reclamos
                relacionados con tus transacciones.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">{userPqrs.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total PQRs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">
                {
                  userPqrs.filter(pqr => pqr.estado === 'Pendiente de revisión')
                    .length
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle
                sx={{ fontSize: 40, color: 'success.main', mb: 1 }}
              />
              <Typography variant="h6">
                {userPqrs.filter(pqr => pqr.estado === 'Resuelto').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resueltas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <History sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">{userTransactions.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Transacciones Disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de contenido */}
      <Paper elevation={1}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Mis PQRs" icon={<History />} />
          <Tab label="Ayuda y Guías" icon={<Info />} />
        </Tabs>

        {/* Tab 0: Mis PQRs */}
        {tabValue === 0 && (
          <Box p={3}>
            {userPqrs.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Transacción</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userPqrs.map(pqr => (
                      <TableRow key={pqr.id_pqr}>
                        <TableCell>#{pqr.id_pqr}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              pqr.tipo_pqr.charAt(0).toUpperCase() +
                              pqr.tipo_pqr.slice(1)
                            }
                            color={getTypeColor(pqr.tipo_pqr)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            style={{ maxWidth: 200 }}
                          >
                            {pqr.descripcion_pqr.length > 50
                              ? `${pqr.descripcion_pqr.substring(0, 50)}...`
                              : pqr.descripcion_pqr}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            #{pqr.transaccion.id_transaccion}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(
                              pqr.transaccion.fecha_transaccion
                            ).toLocaleDateString('es-ES')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(pqr.fecha_pqr).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={pqr.estado}
                            color={getStatusColor(pqr.estado)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={5}>
                <Assignment
                  sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tienes PQRs registradas
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Crea tu primera PQR para reportar cualquier inconveniente o
                  solicitar ayuda
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenDialog(true)}
                  disabled={userTransactions.length === 0}
                >
                  Crear mi primera PQR
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Ayuda y Guías */}
        {tabValue === 1 && (
          <Box p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader
                    title="¿Qué es una Petición?"
                    titleTypographyProps={{ color: 'primary' }}
                  />
                  <CardContent>
                    <Typography variant="body2">
                      Una petición es una solicitud respetuosa para obtener
                      información, servicios o para que se realice una acción
                      específica.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader
                    title="¿Qué es una Queja?"
                    titleTypographyProps={{ color: 'warning.main' }}
                  />
                  <CardContent>
                    <Typography variant="body2">
                      Una queja es la manifestación de insatisfacción por la
                      prestación de un servicio o por el incumplimiento de las
                      normas establecidas.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader
                    title="¿Qué es un Reclamo?"
                    titleTypographyProps={{ color: 'error.main' }}
                  />
                  <CardContent>
                    <Typography variant="body2">
                      Un reclamo es la manifestación de insatisfacción por la
                      prestación deficiente de un servicio o por el cobro
                      indebido de una factura.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom color="primary">
              Proceso de atención PQR
            </Typography>
            <Stepper orientation="vertical">
              <Step active>
                <StepLabel>Crea tu PQR</StepLabel>
              </Step>
              <Step active>
                <StepLabel>Nuestro equipo la revisa</StepLabel>
              </Step>
              <Step active>
                <StepLabel>Te contactamos con la solución</StepLabel>
              </Step>
            </Stepper>
          </Box>
        )}
      </Paper>

      {/* Botón flotante para crear PQR */}
      {userTransactions.length > 0 && (
        <Tooltip title="Crear Nueva PQR">
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setOpenDialog(true)}
          >
            <Add />
          </Fab>
        </Tooltip>
      )}

      {/* Dialog para crear PQR */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Support color="primary" />
            Crear Nueva PQR
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de PQR</InputLabel>
              <Select
                value={formData.tipo_pqr}
                label="Tipo de PQR"
                onChange={e =>
                  setFormData({ ...formData, tipo_pqr: e.target.value })
                }
              >
                <MenuItem value="peticion">Petición</MenuItem>
                <MenuItem value="queja">Queja</MenuItem>
                <MenuItem value="reclamo">Reclamo</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Transacción relacionada</InputLabel>
              <Select
                value={formData.id_transaccion}
                label="Transacción relacionada"
                onChange={e =>
                  setFormData({ ...formData, id_transaccion: e.target.value })
                }
              >
                {userTransactions.map(transaction => (
                  <MenuItem
                    key={transaction.id_transaccion}
                    value={transaction.id_transaccion}
                  >
                    {transaction.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Descripción detallada"
              multiline
              rows={4}
              value={formData.descripcion_pqr}
              onChange={e =>
                setFormData({ ...formData, descripcion_pqr: e.target.value })
              }
              fullWidth
              required
              placeholder="Describe detalladamente tu petición, queja o reclamo..."
              helperText="Proporciona la mayor información posible para una mejor atención"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleCreatePQR}
            variant="contained"
            startIcon={<Send />}
            disabled={
              !formData.tipo_pqr ||
              !formData.descripcion_pqr ||
              !formData.id_transaccion
            }
          >
            Enviar PQR
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PQRs;
