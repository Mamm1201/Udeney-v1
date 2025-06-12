import React from "react";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import { Box, Container, Typography } from "@mui/material";

const Nosotros = () => {
  return (
    <Box sx={{ backgroundColor: "#f0fdf4", minHeight: "100vh" }}>
      <Navbar />

      <Box sx={{ backgroundColor: "#15803d", color: "#fff", py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold">
            BIENVENIDOS A NUESTRA COMUNIDAD ESTUDIANTIL
          </Typography>
          <Typography variant="body1" mt={4}>
            En nuestra plataforma, ofrecemos un espacio único donde estudiantes,
            padres y educadores pueden comprar y vender una amplia variedad de
            artículos escolares, desde libros de texto hasta lápices. Nuestro
            objetivo es facilitar el acceso a los recursos necesarios para el
            éxito académico.
          </Typography>
        </Container>
      </Box>

      <Pie />
    </Box>
  );
};

export default Nosotros;
