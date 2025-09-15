/**
 * Componente que redirige automáticamente al dashboard específico según el rol del usuario
 */

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRoleAuth, useRoleRedirect } from '../../hooks/useRoleAuth';

const DashboardRedirect = () => {
  const { loading, isAuthenticated } = useRoleAuth();
  const { redirectToDashboard } = useRoleRedirect();

  useEffect(() => {
    if (!loading) {
      redirectToDashboard();
    }
  }, [loading, redirectToDashboard]);

  if (loading || !isAuthenticated()) {
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
          Redirigiendo al dashboard...
        </Typography>
      </Box>
    );
  }

  return null;
};

export default DashboardRedirect;