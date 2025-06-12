import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import Contact from "../components/Contact";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

const Contacto = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#E8F5E9", // Verde claro ecológico como fondo general
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar superior del sitio */}
      <Navbar />

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, py: 6 }}>
        <Container maxWidth="sm">
          {/* Card elegante para el formulario */}
          <Card elevation={4} sx={{ borderRadius: 4 }}>
            <CardContent>
              {/* Ícono central representativo */}
              <Avatar
                sx={{
                  bgcolor: "green.600",
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <ContactSupportIcon fontSize="large" />
              </Avatar>

              {/* Título del formulario */}
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                color="green.900"
                textAlign="center"
                gutterBottom
              >
                Contáctanos
              </Typography>

              {/* Subtítulo */}
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
                mb={3}
              >
                Estamos aquí para ayudarte. Llena el formulario y responderemos
                lo antes posible.
              </Typography>

              {/* Componente del formulario de contacto */}
              <Contact />
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Pie de página */}
      <Pie />
    </Box>
  );
};

export default Contacto;
