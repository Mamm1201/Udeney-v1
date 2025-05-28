import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Grid } from '@mui/material';

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
    // Aquí puedes enviar los datos al backend o manejarlos según tu lógica
    alert('¡Gracias por contactarnos!');
    setFormData({ fullName: '', email: '', subject: '' });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        margin: 'auto',
        padding: 3,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
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
          color="primary"
          sx={{ paddingX: 5 }}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

export default Contact;
