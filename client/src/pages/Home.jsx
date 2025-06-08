import React from "react";
import Navbar from "../components/Navbar";
import Boton1 from "../components/Boton1";
import Boton2 from "../components/Boton2";
import Pie from "../components/Pie";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";

const Home = () => {
  return (
    <Box sx={{ backgroundColor: "#f0fdf4", minHeight: "100vh" }}>
      <Navbar />

      <Box sx={{ backgroundColor: "#15803d", color: "#fff", py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h3" fontWeight="bold">
            DALE UNA SEGUNDA OPORTUNIDAD
          </Typography>
          <Typography variant="body1" mt={4}>
            En EduNey creemos en darle una nueva vida a las prendas y elementos
            institucionales. Somos una empresa apasionada por la sostenibilidad
            y reutilización. Nuestro objetivo es ofrecer artículos educativos de
            calidad a precios asequibles mientras reducimos el impacto
            ambiental.
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 10 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Boton1 />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Boton2 />
            </Paper>
          </Grid>
        </Grid>

        <Box mt={10} textAlign="center">
          <Typography variant="h5" fontWeight="bold" mb={2}>
            ¿Estás listo para contribuir con la educación donando útiles,
            artículos, uniformes, etc.?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            La educación es la clave para un futuro brillante. Con tu ayuda
            podemos asegurarnos de que cada estudiante tenga acceso a los
            recursos que necesita para triunfar. Cada bolígrafo, cada regla,
            cada mochila donada es una inversión en el futuro de nuestra
            comunidad.
          </Typography>
        </Box>
      </Container>

      <Pie />
    </Box>
  );
};

export default Home;
