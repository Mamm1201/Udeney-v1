/**
 * Gestión de Usuarios - Panel Administrativo
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
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
  Fab,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Visibility,
  Block,
  CheckCircle,
  Person,
  AdminPanelSettings
} from '@mui/icons-material';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombres_usuario: '',
    apellidos_usuario: '',
    email_usuario: '',
    telefono_usuario: '',
    direccion_usuario: '',
    is_active: true
  });

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/v1/usuarios/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Abrir dialog para editar usuario
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      nombres_usuario: user.nombres_usuario || '',
      apellidos_usuario: user.apellidos_usuario || '',
      email_usuario: user.email_usuario || '',
      telefono_usuario: user.telefono_usuario || '',
      direccion_usuario: user.direccion_usuario || '',
      is_active: user.is_active
    });
    setOpenDialog(true);
  };

  // Crear nuevo usuario
  const handleNewUser = () => {
    setSelectedUser(null);
    setFormData({
      nombres_usuario: '',
      apellidos_usuario: '',
      email_usuario: '',
      telefono_usuario: '',
      direccion_usuario: '',
      is_active: true
    });
    setOpenDialog(true);
  };

  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (selectedUser) {
        // Actualizar usuario existente
        await axios.put(
          `http://localhost:8000/api/v1/usuarios/${selectedUser.id_usuario}/`,
          formData,
          config
        );
      } else {
        // Crear nuevo usuario
        await axios.post(
          'http://localhost:8000/api/v1/usuarios/',
          formData,
          config
        );
      }

      await fetchUsers();
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Error al guardar usuario');
      console.error('Error:', err);
    }
  };

  // Alternar estado activo/inactivo
  const handleToggleActive = async (user) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `http://localhost:8000/api/v1/usuarios/${user.id_usuario}/`,
        { is_active: !user.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUsers();
    } catch (err) {
      setError('Error al cambiar estado del usuario');
      console.error('Error:', err);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (user) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.nombres_usuario}?`)) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(
          `http://localhost:8000/api/v1/usuarios/${user.id_usuario}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchUsers();
        setError(null);
      } catch (err) {
        setError('Error al eliminar usuario');
        console.error('Error:', err);
      }
    }
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
          Gestión de Usuarios
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Administra todos los usuarios del sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id_usuario}>
                  <TableCell>{user.id_usuario}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="primary" />
                      {user.nombres_usuario} {user.apellidos_usuario}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email_usuario}</TableCell>
                  <TableCell>{user.telefono_usuario || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Activo' : 'Inactivo'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.fecha_registro).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.is_active ? 'Desactivar' : 'Activar'}>
                        <IconButton
                          size="small"
                          color={user.is_active ? 'warning' : 'success'}
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.is_active ? <Block /> : <CheckCircle />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Botón flotante para agregar usuario */}
      <Tooltip title="Agregar Usuario">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleNewUser}
        >
          <Add />
        </Fab>
      </Tooltip>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombres"
              value={formData.nombres_usuario}
              onChange={(e) => setFormData({ ...formData, nombres_usuario: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Apellidos"
              value={formData.apellidos_usuario}
              onChange={(e) => setFormData({ ...formData, apellidos_usuario: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email_usuario}
              onChange={(e) => setFormData({ ...formData, email_usuario: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Teléfono"
              value={formData.telefono_usuario}
              onChange={(e) => setFormData({ ...formData, telefono_usuario: e.target.value })}
              fullWidth
            />
            <TextField
              label="Dirección"
              value={formData.direccion_usuario}
              onChange={(e) => setFormData({ ...formData, direccion_usuario: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Usuario Activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {selectedUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;