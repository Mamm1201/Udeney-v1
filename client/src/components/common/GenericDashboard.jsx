/**
 * Dashboard genérico para usuarios sin rol específico
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '../../hooks/useRoleAuth';

const GenericDashboard = () => {
  const { user, logout } = useRoleAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenido, {user?.nombres_usuario || user?.first_name} {user?.apellidos_usuario || user?.last_name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dashboard Genérico
            </Typography>
            <Typography>
              Este es un dashboard básico. Tu cuenta no tiene un rol específico asignado.
              Contacta al administrador para obtener los permisos adecuados.
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de Usuario
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Email:</strong> {user?.email || user?.email_usuario}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Estado:</strong> {user?.is_superuser ? 'Superusuario' : 'Usuario regular'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Grupos:</strong> {user?.groups?.length > 0 ? user.groups.join(', ') : 'Sin grupos asignados'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Disponibles
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/user')}
                  fullWidth
                >
                  Ver Perfil
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/articulos')}
                  fullWidth
                >
                  Ver Artículos
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleLogout}
                  fullWidth
                >
                  Cerrar Sesión
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GenericDashboard;