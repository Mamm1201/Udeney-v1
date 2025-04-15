import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Articulos from "./pages/Articulos";
import ArticuloDetail from "./pages/ArticuloDetail";
import Login from "./pages/Login";
import Rol from "./pages/Rol";
import CrearArticulo from "./pages/CrearArticulo";
import Registro from "./pages/Registro";
import Comprar from "./pages/Comprar";
import App from "./pages/App";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import UserProfile from "./pages/UserProfile";
import ActualizarDatos from "./pages/ActualizarDatos";
import HistorialTransacciones from "./pages/HistorialTransacciones";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Páginas Navegación */}
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        {/* Páginas de artículos */}
        <Route path="/articulos" element={<Articulos />} />
        <Route path="/articulos/:id" element={<ArticuloDetail />} />
        <Route path="/crear-articulo" element={<CrearArticulo />} />
        {/* Páginas de usuario */}
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/actualizar-datos" element={<ActualizarDatos />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/rol" element={<Rol />} />
        <Route
          path="/historial-transacciones"
          element={<HistorialTransacciones />}
        />

        <Route path="/comprar" element={<Comprar />} />
        {/* Componente Principal */}
        <Route path="/app" element={<App />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
