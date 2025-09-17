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
  FormControlLabel,
  Grid,
  Autocomplete,
  Card,
  CardContent,
  Divider
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
import api from '../../api/axiosConfig';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [availableGroups, setAvailableGroups] = useState([]);
  const [formData, setFormData] = useState({
    nombres_usuario: '',
    apellidos_usuario: '',
    email_usuario: '',
    telefono_usuario: '',
    direccion_usuario: '',
    is_active: true,
    groups: [],
    password: ''
  });

  // Cargar usuarios con información completa
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/complete-users/');
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar grupos disponibles
  const fetchGroups = async () => {
    try {
      const response = await api.get('/admin/groups/');
      setAvailableGroups(response.data.groups);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  // Abrir dialog para editar usuario
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      nombres_usuario: user.nombres_usuario || '',
      apellidos_usuario: user.apellidos_usuario || '',
      email_usuario: user.email || user.email_usuario || '',
      telefono_usuario: user.telefono_usuario || '',
      direccion_usuario: user.direccion_usuario || '',
      is_active: user.is_active,
      groups: user.groups || [],
      password: ''
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
      is_active: true,
      groups: [],
      password: ''
    });
    setOpenDialog(true);
  };

  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Actualizar usuario existente
        // Primero actualizamos los datos básicos
        if (selectedUser.id_usuario) {
          await api.put(`/usuarios/${selectedUser.id_usuario}/`, {
            nombres_usuario: formData.nombres_usuario,
            apellidos_usuario: formData.apellidos_usuario,
            email_usuario: formData.email_usuario,
            telefono_usuario: formData.telefono_usuario,
            direccion_usuario: formData.direccion_usuario,
            is_active: formData.is_active
          });
        }

        // Luego actualizamos los grupos
        await api.post(`/admin/users/${selectedUser.id}/groups/`, {
          groups: formData.groups
        });

      } else {
        // Crear nuevo usuario - usar endpoint de registro
        await api.post('/register/', {
          nombres_usuario: formData.nombres_usuario,
          apellidos_usuario: formData.apellidos_usuario,
          email_usuario: formData.email_usuario,
          telefono_usuario: formData.telefono_usuario,
          direccion_usuario: formData.direccion_usuario,
          password_usuario: formData.password || 'temporal123',
          fecha_nacimiento: new Date().toISOString().split('T')[0]
        });

        // Si se creó exitosamente, actualizar grupos
        if (formData.groups.length > 0) {
          // Buscar el usuario recién creado para obtener su ID de Django
          const usersResponse = await api.get('/admin/complete-users/');
          const newUser = usersResponse.data.users.find(u => u.email === formData.email_usuario);

          if (newUser) {
            await api.post(`/admin/users/${newUser.id}/groups/`, {
              groups: formData.groups
            });
          }
        }
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
      if (user.id_usuario) {
        await api.patch(`/usuarios/${user.id_usuario}/`, {
          is_active: !user.is_active
        });
      }
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
        if (user.id_usuario) {
          await api.delete(`/usuarios/${user.id_usuario}/`);
        }
        await fetchUsers();
        setError(null);
      } catch (err) {
        setError('Error al eliminar usuario');
        console.error('Error:', err);
      }
    }
  };

  // Función para filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.nombres_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === '' || user.groups?.includes(filterRole);

    const matchesStatus = filterStatus === '' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Función para obtener el color del chip según el grupo
  const getGroupChipColor = (group) => {
    switch (group) {
      case 'Admin_Negocio': return 'error';
      case 'Monitor': return 'warning';
      case 'Vendedor': return 'info';
      case 'Comprador': return 'success';
      default: return 'default';
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

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros de búsqueda
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar usuario"
                placeholder="Nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por rol</InputLabel>
                <Select
                  value={filterRole}
                  label="Filtrar por rol"
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <MenuItem value="">Todos los roles</MenuItem>
                  <MenuItem value="Admin_Negocio">Admin Negocio</MenuItem>
                  <MenuItem value="Monitor">Monitor</MenuItem>
                  <MenuItem value="Vendedor">Vendedor</MenuItem>
                  <MenuItem value="Comprador">Comprador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterStatus}
                  label="Estado"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="active">Activos</MenuItem>
                  <MenuItem value="inactive">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('');
                  setFilterStatus('');
                }}
                sx={{ height: '56px' }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles/Grupos</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Último acceso</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id || user.id_usuario}>
                  <TableCell>{user.id || user.id_usuario}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {user.is_superuser ? (
                        <AdminPanelSettings fontSize="small" color="error" />
                      ) : (
                        <Person fontSize="small" color="primary" />
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.nombres_usuario} {user.apellidos_usuario}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {user.groups && user.groups.length > 0 ? (
                        user.groups.map((group) => (
                          <Chip
                            key={group}
                            label={group}
                            size="small"
                            color={getGroupChipColor(group)}
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin roles
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Activo' : 'Inactivo'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      {user.is_superuser && (
                        <Chip label="Superuser" size="small" color="error" sx={{ mb: 0.5 }} />
                      )}
                      {user.is_staff && (
                        <Chip label="Staff" size="small" color="warning" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.last_login ?
                        new Date(user.last_login).toLocaleDateString('es-ES') :
                        'Nunca'
                      }
                    </Typography>
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
            {!selectedUser && (
              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                placeholder="Dejar vacío para contraseña temporal"
                helperText="Si se deja vacío, se asignará la contraseña: temporal123"
              />
            )}

            <Divider />

            <Typography variant="h6" color="primary">
              Roles y Permisos
            </Typography>

            <Autocomplete
              multiple
              options={availableGroups.map(group => group.name)}
              value={formData.groups}
              onChange={(event, newValue) => setFormData({ ...formData, groups: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Grupos/Roles"
                  placeholder="Seleccionar roles"
                  helperText="Selecciona los roles que tendrá el usuario en el sistema"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    color={getGroupChipColor(option)}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
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