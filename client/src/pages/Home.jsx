import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

// Lista de categorías para mostrar en tarjetas
const categorias = [
  {
    nombre: "Útiles",
    imagen: "/colores.jpg",
    descripcion:
      "Artículos escolares en excelente estado: cuadernos, lápices, colores y más.",
    ruta: "/articulos",
  },
  {
    nombre: "Herramientas",
    imagen: "/calculate.jpg",
    descripcion:
      "Herramientas tecnológicas y de aprendizaje para diferentes niveles educativos.",
    ruta: "/articulos",
  },
  {
    nombre: "Libros",
    imagen: "/libro.jpg",
    descripcion:
      "Libros de texto, literatura y consulta para todas las edades.",
    ruta: "/articulos",
  },
  {
    nombre: "Prendas",
    imagen: "/prenda.jpg",
    descripcion:
      "Uniformes y prendas escolares listas para reutilizar con amor.",
    ruta: "/articulos",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white" }}>
      <Navbar />

      {/* Hero section con imagen de fondo responsive */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "70vh", md: "90vh" },
          width: "100%",
          backgroundImage: "url(/school.jpg)", // Asegúrate de que la imagen esté en /public
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* Overlay oscuro para mejor contraste */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            bgcolor: "rgba(0, 0, 0, 0.35)", // Oscurece la imagen
            zIndex: 1,
          }}
        />

        {/* Contenido del encabezado sobre la imagen */}
        <Box sx={{ position: "relative", zIndex: 2, px: 2 }}>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: { xs: "1.8rem", md: "3rem" },
              mb: 2,
            }}
          >
            DALE UNA SEGUNDA OPORTUNIDAD
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "white",
              maxWidth: "800px",
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.2rem" },
            }}
          >
            En EduNey creemos en darle una nueva vida a las prendas y elementos
            institucionales. Ofrecemos artículos educativos de calidad a precios
            asequibles mientras cuidamos el medio ambiente.
          </Typography>
        </Box>
      </Box>

      {/* Sección de categorías */}
      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {categorias.map((cat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  boxShadow: 4,
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={cat.imagen}
                  alt={`Imagen de ${cat.nombre}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {cat.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.descripcion}
                  </Typography>
                </CardContent>
                <Box textAlign="center" pb={2}>
                  <Box textAlign="center" pb={2}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(cat.ruta)}
                      sx={{
                        backgroundColor: "#8B8C69",
                        "&:hover": {
                          backgroundColor: "#BBBF4E", // Un poco más oscuro para el hover
                        },
                      }}
                    >
                      Ver {cat.nombre}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Sección final de llamado a la acción */}
      <Box textAlign="center" px={2} py={6} bgcolor="#BBBF4E">
        <Typography variant="h5" fontWeight="bold" mb={2}>
          ¿Estás listo para contribuir con la educación?
        </Typography>
        <Typography variant="body1" maxWidth={600} mx="auto">
          Cada donación hace una gran diferencia. Con tu ayuda, podemos
          garantizar que todos los estudiantes tengan acceso a los recursos que
          necesitan para triunfar.
        </Typography>
      </Box>

      <Pie />
    </Box>
  );
};

export default Home;
