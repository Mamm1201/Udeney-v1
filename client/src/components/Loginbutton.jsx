import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';

const LoginButton = ({
  variant = 'text',
  size = 'medium',
  label = 'Iniciar sesión',
}) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/login')}
      color="inherit"
      startIcon={<LoginIcon />}
      variant={variant}
      size={size}
    >
      {label}
    </Button>
  );
};

LoginButton.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string,
  label: PropTypes.string,
};

export default LoginButton;
