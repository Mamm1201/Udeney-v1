import { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, Paper } from '@mui/material';
import backgroundImage from '../assets/contactanos.png'; // ajusta la ruta si es necesario

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
    alert('¡Gracias por contactarnos!');
    setFormData({ fullName: '', email: '', subject: '' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={8}
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.85)', // transparencia suave
          backdropFilter: 'blur(6px)',
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: '#166534', mb: 3 }}>
          Contáctanos
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre Completo"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Asunto"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              variant="outlined"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#16a34a',
              color: 'white',
              px: 5,
              '&:hover': {
                backgroundColor: '#15803d',
              },
            }}
          >
            Enviar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Contact;
