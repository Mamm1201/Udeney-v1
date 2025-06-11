import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del formulario:", formData);
    setOpenSnackbar(true);
    setFormData({ fullName: "", email: "", subject: "" });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        margin: "auto",
        padding: 3,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
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

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ paddingX: 5 }}
        >
          Enviar
        </Button>
      </Box>

      {/* Snackbar personalizado con logo en cuadro */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontSize: "1rem",
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo Eduney"
            sx={{ width: 32, height: 32, borderRadius: 1 }}
          />
          Gracias por contactarnos,juntos haremos un planeta mas sostenible
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
