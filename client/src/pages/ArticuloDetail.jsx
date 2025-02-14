import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import ArticuloCard from "../components/Articulos/ArticuloCard";
import Navbar from "../components/Navbar"; // Importar el componente Navbar
import Pie from "../components/Pie"; // Importar el componente Footer
import { Box } from "@mui/material";

const ArticuloDetail = () => {
  const { id } = useParams(); // Obtener el ID desde la URL
  const [articulo, setArticulo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}${id}/`
        );
        setArticulo(response.data);
      } catch (error) {
        setError("No se pudo cargar el artículo.");
      }
    };
    fetchArticulo();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!articulo) return <div>Cargando artículo...</div>;

  return (
    <>
      <Navbar /> {/* Renderizar el Navbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          minHeight: "80vh", // Ajustar para que deje espacio para el footer
          backgroundColor: "#e0f7fa", // Fondo atractivo
          padding: "16px",
        }}
      >
        <ArticuloCard
          titulo_articulo={articulo.titulo_articulo}
          descripcion_articulo={articulo.descripcion_articulo}
          institucion_articulo={articulo.institucion_articulo}
          precio_articulo={articulo.precio_articulo}
          id_usuario={articulo.id_usuario}
          id_categoria={articulo.id_categoria}
          imagen={articulo.imagen} // Si el artículo tiene imagen, se utiliza
        />
      </Box>
      <Pie /> {/* Renderizar el Footer */}
    </>
  );
};

export default ArticuloDetail;
