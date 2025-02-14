import React from "react";
import Navbar from "../components/Navbar";
import Boton1 from "../components/Boton1";
import Boton2 from "../components/Boton2";
import Pie from "../components/Pie";

const Home = () => {
  return (
    <div className="bg-green-100 min-h-screen">
      <div>
        <Navbar />
      </div>
      <header className="bg-green-600 text-white py-8">
        <div className="container mx-auto text-center">
          <img
            src="/logo.png"
            alt="EduNey Logo"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h1 className="text-4xl font-bold">DALE UNA SEGUNDA OPORTUNIDAD</h1>
          <p className="mt-4">
            En EduNey creemos en darle una nueva vida a las prendas y elementos
            institucionales. Somos una empresa apasionada por la sostenibilidad
            y reutilización. Nuestro objetivo es ofrecer artículos educativos de
            calidad a precios asequibles mientras reducimos el impacto
            ambiental.
          </p>
        </div>
      </header>

      <main className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md text-center p-6">
            <div>
              <Boton1 />
            </div>
            <img
              src="/images/vender.jpg"
              alt=""
              className="w-full h-40 object-cover rounded-md mb-4"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md text-center p-6">
            <div>
              <Boton2 />
            </div>
            <img
              src="/images/comprar.jpg"
              alt=""
              className="w-full h-40 object-cover rounded-md mb-4"
            />
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4">
            ¿Estás listo para contribuir con la educación donando útiles,
            artículos, uniformes, etc.?
          </h2>
          <p className="text-gray-700">
            La educación es la clave para un futuro brillante. Con tu ayuda
            podemos asegurarnos de que cada estudiante tenga acceso a los
            recursos que necesita para triunfar. Cada bolígrafo, cada regla,
            cada mochila donada es una inversión en el futuro de nuestra
            comunidad.
          </p>
        </div>
      </main>

      <div>
        <Pie />
      </div>
    </div>
  );
};

export default Home;
