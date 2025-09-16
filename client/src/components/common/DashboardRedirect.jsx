/**
 * Componente que redirige automáticamente al dashboard específico según el rol del usuario
 */

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth, useRoleRedirect } from '../../hooks/useRoleAuth';

const DashboardRedirect = () => {
  const { loading, isAuthenticated } = useRoleAuth();
  const { redirectToDashboard } = useRoleRedirect();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated()) {
        redirectToDashboard();
      } else {
        // Si no está autenticado, ir a login
        navigate('/login');
      }
    }
  }, [loading, isAuthenticated, redirectToDashboard, navigate]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexDirection="column"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        {loading ? 'Verificando autenticación...' : 'Redirigiendo...'}
      </Typography>
    </Box>
  );
};

export default DashboardRedirect;