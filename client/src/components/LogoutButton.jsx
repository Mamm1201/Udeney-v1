import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({
  variant = 'text',
  size = 'medium',
  label = 'Cerrar sesión',
}) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setOpenSnackbar(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <>
      <Button
        onClick={handleLogout}
        color="inherit"
        startIcon={<LogoutIcon />}
        variant={variant}
        size={size}
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            opacity: 0.75,
            backgroundColor: 'rgba(255, 255, 255, 0.08)', // fondo sutil (ajustable)
            boxShadow: '0 0 8px rgba(0,0,0,0.2)', // sombra suave
          },
        }}
      >
        Cerrar sesión
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
          onClose={() => setOpenSnackbar(false)}
        >
          ¡Sesión cerrada correctamente!
        </Alert>
      </Snackbar>
    </>
  );
};

export default LogoutButton;
