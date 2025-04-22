import React from "react";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

const Productos = () => {
  const productos = [
    { id: 1, nombre: "Uniforme Sena", precio: "$37.900", imagen: "/images/uniforme1.jpg" },
    { id: 2, nombre: "Cuaderno Vintage", precio: "$89.508", imagen: "/images/cuaderno.jpg" },
    { id: 3, nombre: "Uniforme Mujer", precio: "$37.900", imagen: "/images/uniforme2.jpg" },
    { id: 4, nombre: "Overol Azul", precio: "$37.900", imagen: "/images/overol.jpg" }
  ];

  return (
    <div className="bg-green-100 min-h-screen">
      <Navbar />
      <header className="bg-green-600 text-white py-8">
        <div className="container mx-auto text-center">
          <img src="/logo.png" alt="EduNey Logo" className="mx-auto mb-4 w-16 h-16" />
          <h1 className="text-4xl font-bold">PRODUCTOS DISPONIBLES</h1>
          <p className="mt-4">
            Descubre nuestra selección de artículos educativos y uniformes a precios accesibles.
          </p>
        </div>
      </header>

      <main className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-lg shadow-md p-4 text-center">
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-40 object-cover rounded-md mb-4" />
              <h2 className="text-lg font-bold">{producto.nombre}</h2>
              <p className="text-green-700 font-semibold">{producto.precio}</p>
            </div>
          ))}
        </div>
      </main>
      
      <Pie />
    </div>
  );
};

export default Productos;
