import React from "react";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

const AvisoLegal = () => {
  return (
    <div className="bg-green-100 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Encabezado */}
      <header className="bg-green-600 text-white py-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">AVISO LEGAL</h1>
          <p className="mt-2 text-sm">
            Conoce la información legal sobre el uso de nuestra plataforma
            Eduney.
          </p>
        </div>
      </header>
      {/* Contenido del Aviso Legal */}
      <main className="max-w-4xl mx-auto px-4 py-8 text-justify text-sm leading-relaxed flex-grow">
        <h2 className="text-xl font-bold mb-4">Aviso Legal</h2>

        <p>
          En cumplimiento con las obligaciones establecidas por las leyes
          aplicables en materia de servicios de la sociedad de la información y
          comercio electrónico, se informa que el sitio web{" "}
          <strong>Eduney</strong> (en adelante, "la Plataforma") es propiedad de
          Mi Empresa (en adelante, "el Titular").
        </p>

        <h3 className="text-lg font-semibold mt-6">
          1. Información del titular
        </h3>
        <p>
          <strong>Nombre comercial:</strong> Eduney
          <br />
          <strong>Titular:</strong> Mi Empresa
          <br />
          <strong>Correo electrónico de contacto:</strong> contacto@eduney.com
          <br />
          <strong>Actividad:</strong> Plataforma de compraventa de artículos
          escolares de segunda mano.
        </p>
        <h3 className="text-lg font-semibold mt-6">2. Usuarios</h3>
        <p>
          El acceso y/o uso de este sitio web atribuye la condición de Usuario,
          lo que implica la aceptación plena y sin reservas del presente Aviso
          Legal.
        </p>

        <h3 className="text-lg font-semibold mt-6">3. Objeto</h3>
        <p>
          A través de la Plataforma, el Titular facilita a los usuarios el
          acceso y uso de distintos servicios relacionados con la publicación,
          búsqueda y compraventa de artículos escolares de segunda mano.
        </p>

        <h3 className="text-lg font-semibold mt-6">4. Responsabilidad</h3>
        <p>
          El Titular no se hace responsable por el mal uso que se pueda hacer de
          los contenidos del sitio web, ni por los errores u omisiones en los
          mismos, ni por los daños derivados de su utilización.
        </p>

        <h3 className="text-lg font-semibold mt-6">5. Propiedad intelectual</h3>
        <p>
          Todos los contenidos del sitio (textos, imágenes, logos, diseño
          gráfico, etc.) son propiedad del Titular o de terceros con licencia, y
          están protegidos por la normativa de propiedad intelectual.
        </p>

        <h3 className="text-lg font-semibold mt-6">6. Enlaces externos</h3>
        <p>
          La Plataforma puede contener enlaces a otros sitios web. El Titular no
          se hace responsable del contenido, veracidad o disponibilidad de
          dichos sitios externos.
        </p>

        <h3 className="text-lg font-semibold mt-6">7. Modificaciones</h3>
        <p>
          El Titular se reserva el derecho a modificar en cualquier momento el
          presente Aviso Legal, así como cualquier otro contenido del sitio web.
        </p>

        <h3 className="text-lg font-semibold mt-6">8. Legislación aplicable</h3>
        <p>
          El presente Aviso Legal se rige por la legislación vigente del país en
          el que opera la empresa, quedando sometido a los tribunales
          correspondientes.
        </p>

        <p className="mt-6 italic">Última actualización: 07 de junio de 2025</p>
      </main>

      {/* Pie de página */}
      <Pie />
    </div>
  );
};

export default AvisoLegal;
