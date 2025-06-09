import { Box, Typography, IconButton, Link, Stack, Divider } from '@mui/material';
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
        color: '#111827', // negro sutil
        px: 4,
        py: 3,
        textAlign: 'center',
        mt: 'auto',
      }}
    >
      {/* Íconos de redes sociales */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 1 }}>
        <IconButton
          component={Link}
          href="https://facebook.com"
          target="_blank"
          rel="noopener"
          sx={{ color: '#111827' }}
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          component={Link}
          href="https://twitter.com"
          target="_blank"
          rel="noopener"
          sx={{ color: '#111827' }}
        >
          <TwitterIcon />
        </IconButton>
        <IconButton
          component={Link}
          href="https://instagram.com"
          target="_blank"
          rel="noopener"
          sx={{ color: '#111827' }}
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          component={Link}
          href="https://linkedin.com"
          target="_blank"
          rel="noopener"
          sx={{ color: '#111827' }}
        >
          <LinkedInIcon />
        </IconButton>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.2)', mb: 1 }} />

      {/* Enlaces legales */}
      <Typography variant="body2" sx={{ mb: 1 }}>
        &copy; Eduney {new Date().getFullYear()} &nbsp;|&nbsp;
        <Link href="#" underline="hover" color="inherit">
          Aviso legal
        </Link>{' '}
        |{' '}
        <Link href="#" underline="hover" color="inherit">
          Política de privacidad
        </Link>
      </Typography>

      {/* Firma */}
      <Typography variant="caption">
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
