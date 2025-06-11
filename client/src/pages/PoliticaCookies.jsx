import React from "react";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

const PoliticaCookies = () => {
  return (
    <div className="bg-green-100 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Encabezado */}
      <header className="bg-green-600 text-white py-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">POLÍTICA DE COOKIES</h1>
          <p className="mt-2 text-sm">
            Conoce cómo usamos cookies para mejorar tu experiencia en Eduney.
          </p>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 py-8 text-justify text-sm leading-relaxed flex-grow">
        <p>
          Esta Política de Cookies explica qué son las cookies, cómo las utilizamos en nuestra plataforma <strong>Eduney</strong>, y tus opciones para gestionarlas.
        </p>

        <h2 className="text-lg font-semibold mt-6">1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que los sitios web pueden colocar en tu dispositivo para almacenar información sobre tus preferencias o actividad.
        </p>

        <h2 className="text-lg font-semibold mt-6">2. Tipos de cookies que utilizamos</h2>
        <p>
          <strong>Cookies necesarias:</strong> Permiten el funcionamiento básico del sitio.<br />
          <strong>Cookies de análisis:</strong> Nos ayudan a entender cómo interactúan los usuarios con el sitio.<br />
          <strong>Cookies de personalización:</strong> Recuerdan tus preferencias para mejorar tu experiencia.
        </p>

        <h2 className="text-lg font-semibold mt-6">3. Finalidad del uso de cookies</h2>
        <p>
          Utilizamos cookies para garantizar el funcionamiento técnico del sitio, analizar el tráfico web y ofrecer contenido personalizado.
        </p>

        <h2 className="text-lg font-semibold mt-6">4. Gestión de cookies</h2>
        <p>
          Puedes configurar tu navegador para aceptar o rechazar el uso de cookies. Ten en cuenta que desactivar algunas cookies puede afectar el funcionamiento del sitio.
        </p>

        <h2 className="text-lg font-semibold mt-6">5. Cookies de terceros</h2>
        <p>
          Podemos usar servicios externos como Google Analytics, que también utilizan cookies para recopilar información anónima sobre el uso del sitio.
        </p>

        <h2 className="text-lg font-semibold mt-6">6. Actualizaciones</h2>
        <p>
          Esta Política de Cookies puede ser actualizada. Te recomendamos revisarla periódicamente para estar informado sobre cómo usamos las cookies.
        </p>

        <p className="mt-6 italic">
          Última actualización: 07 de junio de 2025
        </p>
      </main>

      {/* Pie */}
      <Pie />
    </div>
  );
};

export default PoliticaCookies;
