import React from "react";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import { MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const seleccionarRol = (rol) => {
    const isLoggedIn = !!localStorage.getItem("access_token");

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    localStorage.setItem("rol_usuario", rol);

    if (rol === "vendedor") {
      navigate("/crear-articulo");
    } else {
      navigate("/articulos");
    }
  };

  return (
    <div className="bg-green-100 min-h-screen flex flex-col">
      <Navbar />

      <header className="bg-green-600 text-white py-12 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            DALE UNA SEGUNDA OPORTUNIDAD
          </h1>
          <p className="max-w-3xl mx-auto text-lg">
            En EduNey creemos en darle una nueva vida a las prendas y elementos
            institucionales. Somos una empresa apasionada por la sostenibilidad
            y reutilización. Nuestro objetivo es ofrecer artículos educativos
            de calidad a precios asequibles mientras reducimos el impacto
            ambiental.
          </p>
        </div>
      </header>

      <main className="container mx-auto py-14 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* VENDER */}
          <div className="bg-white rounded-2xl shadow-lg text-center p-8 hover:shadow-xl transition-shadow">
            <MenuItem
              onClick={() => seleccionarRol("vendedor")}
              className="text-xl px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition cursor-pointer justify-center"
            >
              📦 Vender artículos
            </MenuItem>
          </div>

          {/* COMPRAR */}
          <div className="bg-white rounded-2xl shadow-lg text-center p-8 hover:shadow-xl transition-shadow">
            <MenuItem
              onClick={() => seleccionarRol("comprador")}
              className="text-xl px-8 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition cursor-pointer justify-center"
            >
              🛒 Comprar artículos
            </MenuItem>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            ¿Estás listo para contribuir con la educación donando útiles,
            artículos, uniformes, etc.?
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            La educación es la clave para un futuro brillante. Con tu ayuda
            podemos asegurarnos de que cada estudiante tenga acceso a los
            recursos que necesita para triunfar. Cada bolígrafo, cada regla,
            cada mochila donada es una inversión en el futuro de nuestra
            comunidad.
          </p>
        </div>
      </main>

      <Pie />
    </div>
  );
};

export default Home;
