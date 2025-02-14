import React from "react";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

const Nosotros = () => {
  return (
    <div className="bg-green-100 min-h-screen">
      <div>
        <Navbar />
      </div>
      <header className="bg-green-600 text-white py-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">
            BIENVENIDOS A NUESTRA COMUNIDAD ESTUDIANTIL
          </h1>
          <p className="mt-4">
            En nuestra plataforma, ofrecemos un espacio único donde estudiantes,
            padres y educadores pueden comprar y vender una amplia variedad de
            árticulos escolares, desde libros de texto hasta lapices. Nuestro
            objetivo es facilitar el acceso a los recursos necesarios para el
            exito académico.
          </p>
        </div>
      </header>
      <div>
        <Pie />
      </div>
    </div>
  );
};

export default Nosotros;
