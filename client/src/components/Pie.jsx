import React from 'react';
import { Box, Typography, IconButton, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Pie = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#86C388',
        color: 'white',
        padding: 2,
        textAlign: 'center',
        position: 'relative',
        bottom: 0,
        width: '100%',
      }}
    >
      <Typography variant="body1">
        &copy; Eduney {new Date().getFullYear()} | Aviso legal | Política de
        privacidad | Política
      </Typography>
      <IconButton
        component={Link}
        href="https://facebook.com"
        target="_blank"
        rel="noopener"
        color="inherit"
        aria-label="Facebook"
      >
        <FacebookIcon />
      </IconButton>
      <IconButton
        component={Link}
        href="https://twitter.com"
        target="_blank"
        rel="noopener"
        color="inherit"
        aria-label="Twitter"
      >
        <TwitterIcon />
      </IconButton>
      <IconButton
        component={Link}
        href="https://instagram.com"
        target="_blank"
        rel="noopener"
        color="inherit"
        aria-label="Instagram"
      >
        <InstagramIcon />
      </IconButton>
      <IconButton
        component={Link}
        href="https://linkedin.com"
        target="_blank"
        rel="noopener"
        color="inherit"
        aria-label="LinkedIn"
      >
        <LinkedInIcon />
      </IconButton>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Desarrollado por{' '}
        <Link
          href="https://www.miempresa.com"
          color="inherit"
          underline="hover"
          target="_blank"
          rel="noopener"
        >
          Mi Empresa
        </Link>
      </Typography>
    </Box>
  );
};

export default Pie;
