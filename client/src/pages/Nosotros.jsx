// import React from 'react';
import Navbar from '../components/Navbar';
import Pie from '../components/Pie';
import nosotrosImg from '../assets/nosotros.png'; // Importa la imagen desde src

const Nosotros = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section con imagen de fondo desde assets/ */}
      <header className="relative text-white min-h-[80vh] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${nosotrosImg})` }}
        >
          <div className="absolute inset-0 bg-black opacity-60"></div> {/* Capa oscura */}
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Transformando la educación con{' '}
            <span className="text-green-400">economía circular</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            En Udeney conectamos a estudiantes, docentes y familias para dar una segunda vida a los recursos académicos.
          </p>
        </div>
      </header>

      {/* Sección Misión */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Nuestra Misión</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Promover la reutilización de artículos escolares y tecnológicos a través de una plataforma accesible, 
              reduciendo costos para las familias y el impacto ambiental, mientras fomentamos una comunidad educativa 
              colaborativa.
            </p>
          </div>
        </div>
      </section>

      {/* Sección Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nuestros Valores</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-green-500 text-4xl mb-4">♻️</div>
              <h3 className="text-xl font-semibold mb-3">Sostenibilidad</h3>
              <p className="text-gray-600">
                Cada transacción en Udeney es un paso hacia un futuro con menos desperdicio.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-green-500 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3">Comunidad</h3>
              <p className="text-gray-600">
                Creemos en el poder de la colaboración para hacer la educación más accesible.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-green-500 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3">Innovación</h3>
              <p className="text-gray-600">
                Usamos tecnología para simplificar el intercambio de recursos académicos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">¡Únete a la revolución educativa!</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Comienza a comprar o vender artículos escolares hoy mismo.
          </p>
          <button className="bg-white text-green-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition">
            Regístrate Gratis
          </button>
        </div>
      </section>

      <Pie />
    </div>
  );
};

export default Nosotros;
