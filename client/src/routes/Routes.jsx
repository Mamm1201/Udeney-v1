import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ArticulosList from "./pages/ArticulosList";
import ArticuloDetail from "./pages/ArticuloDetail";

import Login from "./pages/Login";
import Rol from "./pages/Rol";
import CrearArticulo from "./pages/CrearArticulo";
import Registro from "./pages/Registro";
import Comprar from "./pages/Comprar";
import App from "./pages/App"; // esta debemos quitarla
import Home from "../pages/Home";
import Login from "../pages/Login";

const Routes = () => {
  return (
    <Router>
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home />} />
        {/* Páginas de artículos */}
        <Route path="/articulos" element={<ArticulosList />} />
        <Route path="/articulos/:id" element={<ArticuloDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rol" element={<Rol />} />
        <Route path="/crear-articulo" element={<CrearArticulo />} />
        {/* Páginas de usuario */}
        <Route path="/registro" element={<Registro />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="/app" element={<App />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default Routes;
