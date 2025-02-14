import { useEffect, useState } from "react";
import { getAllArticulos } from "../api/articulos.api";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie"; // Cambiamos "Pie" por "Footer"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Container,
} from "@mui/material";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);

  useEffect(() => {
    getAllArticulos()
      .then((response) => setArticulos(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <>
      <Navbar /> {/* Renderizar el Navbar */}
      <Container
        maxWidth="md"
        sx={{
          minHeight: "80vh", // Espacio suficiente para dejar margen para el footer
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#f5f5f5", // Fondo claro
          borderRadius: "8px",
          marginTop: "24px",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#1976d2", // Azul de Material-UI
            textAlign: "center",
          }}
        >
          LISTA DE ARTÍCULOS
        </Typography>
        <Box
          sx={{
            width: "100%",
            backgroundColor: "white",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <List>
            {articulos.length > 0 ? (
              articulos.map((articulo) => (
                <ListItem
                  key={articulo.id}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <ListItemText
                    primary={articulo.titulo_articulo}
                    secondary={`ID: ${articulo.id}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography
                variant="body1"
                color="textSecondary"
                textAlign="center"
              >
                No hay artículos disponibles.
              </Typography>
            )}
          </List>
        </Box>
      </Container>
      <Pie /> {/* Renderizar el Footer */}
    </>
  );
};

export default Articulos;
