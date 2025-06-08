import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import Contact from "../components/Contact";
import { Box, Container } from "@mui/material";

const Contacto = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#f0fdf4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="md">
          <Contact />
        </Container>
      </Box>

      <Pie />
    </Box>
  );
};

export default Contacto;
