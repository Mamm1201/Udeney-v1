import { useEffect, useState } from "react";
import { getAllArticulos } from "../api/articulos.api";
import { Link } from "react-router-dom"; // Importamos Link
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
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
      <Navbar />
      <Container
        maxWidth="md"
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          marginTop: "24px",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
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
                  key={articulo.id_articulo}
                  component={Link} // Hacemos que sea un Link
                  to={`/articulos/${articulo.id_articulo}`} // Redirige al detalle del artículo
                  sx={{
                    borderBottom: "1px solid #ddd",
                    "&:last-child": { borderBottom: "none" },
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="bold">
                        {articulo.titulo_articulo}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textSecondary"
                        >
                          {articulo.descripcion_articulo}
                        </Typography>
                        {articulo.institucion_articulo && (
                          <Typography
                            component="span"
                            variant="body2"
                            color="textSecondary"
                          >
                            {" • Institución: " + articulo.institucion_articulo}
                          </Typography>
                        )}
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="primary"
                        >
                          ${articulo.precio_articulo}
                        </Typography>
                      </>
                    }
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
      <Pie />
    </>
  );
};

export default Articulos;
