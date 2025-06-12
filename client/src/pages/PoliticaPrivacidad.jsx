import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

const PoliticaPrivacidad = () => {
  return (
    <div className="bg-green-100 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Encabezado */}
      <header className="bg-green-600 text-white py-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">POLÍTICA DE PRIVACIDAD</h1>
          <p className="mt-2 text-sm">
            Conoce cómo protegemos tus datos personales en nuestra plataforma
            Eduney.
          </p>
        </div>
      </header>
      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 py-8 text-justify text-sm leading-relaxed flex-grow">
        <p>
          En Eduney nos comprometemos a proteger la privacidad de nuestros
          usuarios. Esta Política de Privacidad explica cómo recopilamos, usamos
          y protegemos la información personal que nos proporcionas.
        </p>

        <h2 className="text-lg font-semibold mt-6">
          1. Responsable del tratamiento
        </h2>
        <p>
          <strong>Titular:</strong> Mi Empresa
          <br />
          <strong>Correo electrónico:</strong> contacto@eduney.com
          <br />
          <strong>Finalidad:</strong> Gestión de la plataforma de compraventa de
          artículos escolares.
        </p>

        <h2 className="text-lg font-semibold mt-6">2. Datos que recopilamos</h2>
        <p>
          Recopilamos información personal como nombre, correo electrónico,
          número de teléfono, y datos de navegación para proporcionar nuestros
          servicios y mejorar la experiencia del usuario.
        </p>

        <h2 className="text-lg font-semibold mt-6">
          3. Finalidades del tratamiento
        </h2>
        <p>
          Utilizamos los datos para: gestionar cuentas de usuario, facilitar la
          compraventa de artículos, mejorar nuestros servicios, enviar
          comunicaciones importantes y cumplir con nuestras obligaciones
          legales.
        </p>

        <h2 className="text-lg font-semibold mt-6">
          4. Conservación de los datos
        </h2>
        <p>
          Los datos personales serán conservados mientras se mantenga la
          relación con el usuario o durante los plazos legalmente exigidos.
        </p>

        <h2 className="text-lg font-semibold mt-6">5. Derechos del usuario</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, cancelación,
          oposición, portabilidad y limitación enviando una solicitud al correo
          indicado arriba.
        </p>

        <h2 className="text-lg font-semibold mt-6">6. Medidas de seguridad</h2>
        <p>
          Implementamos medidas técnicas y organizativas para garantizar la
          seguridad y confidencialidad de los datos personales.
        </p>

        <h2 className="text-lg font-semibold mt-6">
          7. Cambios en la política
        </h2>
        <p>
          Nos reservamos el derecho a modificar esta Política de Privacidad. Las
          modificaciones serán publicadas en esta misma página.
        </p>

        <p className="mt-6 italic">Última actualización: 07 de junio de 2025</p>
      </main>

      {/* Pie */}
      <Pie />
    </div>
  );
};

export default PoliticaPrivacidad;
