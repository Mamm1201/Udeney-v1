import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import { Box, Container, Typography, Grid, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const Nosotros = () => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Barra de navegación */}
      <Navbar />

      {/* Sección de portada con imagen de fondo */}
      <Box
        position="relative"
        width="100%"
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundImage: "url(/nosotros.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "#fff",
        }}
      >
        {/* Overlay oscuro para legibilidad del texto */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0, 0, 0, 0.2)"
          zIndex={1}
        />

        {/* Texto centrado sobre la imagen */}
        <Container
          sx={{ position: "relative", zIndex: 2, textAlign: "center" }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            mb={3}
            sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
          >
            Transformando la educación con{" "}
            <Box component="span" color="secondary.main">
              economía circular
            </Box>
          </Typography>
          <Typography
            variant="h6"
            maxWidth="700px"
            margin="0 auto"
            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            En Eduney conectamos a estudiantes, docentes y familias para dar una
            segunda vida a los recursos académicos.
          </Typography>
        </Container>
      </Box>

      {/* Misión */}
      <Box py={10} bgcolor="#fff">
        <Container maxWidth="md">
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            color="text.primary"
          >
            Nuestra Misión
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Promover la reutilización de artículos escolares y tecnológicos a
            través de una plataforma accesible, reduciendo costos para las
            familias y el impacto ambiental, mientras fomentamos una comunidad
            educativa colaborativa.
          </Typography>
        </Container>
      </Box>

      {/* Valores */}
      <Box py={10} bgcolor="#f9fafb">
        <Container>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            color="text.primary"
          >
            Nuestros Valores
          </Typography>

          <Grid container spacing={4} mt={4}>
            {[
              {
                icon: "♻️",
                title: "Sostenibilidad",
                text: "Cada transacción en Eduney es un paso hacia un futuro con menos desperdicio.",
              },
              {
                icon: "👥",
                title: "Comunidad",
                text: "Creemos en el poder de la colaboración para hacer la educación más accesible.",
              },
              {
                icon: "📚",
                title: "Innovación",
                text: "Usamos tecnología para simplificar el intercambio de recursos académicos.",
              },
            ].map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Paper
                  elevation={3}
                  sx={{ p: 4, textAlign: "center", borderRadius: 3 }}
                >
                  <Typography variant="h3" color="success.main" mb={2}>
                    {item.icon}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{item.text}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Llamado a la acción (CTA) */}
      <Box py={10} bgcolor="success.main" color="#fff">
        <Container sx={{ textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ¡Únete a la revolución educativa!
          </Typography>
          <Typography variant="h6" mb={4} maxWidth="600px" mx="auto">
            Comienza a comprar o vender artículos escolares hoy mismo.
          </Typography>

          {/* Botón que lleva a la página de registro */}
          <Link to="/registro" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#BBBF4E",
                color: "#374151",
                fontWeight: "bold",
                px: 5,
                py: 1.5,
                borderRadius: "50px",
                "&:hover": {
                  bgcolor: "#a8aa3d",
                },
              }}
            >
              Regístrate Gratis
            </Button>
          </Link>
        </Container>
      </Box>

      {/* Pie de página */}
      <Pie />
    </Box>
  );
};

export default Nosotros;
