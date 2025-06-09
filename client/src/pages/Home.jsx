import Navbar from "../components/Navbar";
// import Boton1 from "../components/Boton1";
import Boton2 from "../components/Boton2";
import Pie from "../components/Pie";
import uniformeImg from '../assets/uniforme.png';
import utilesImg from '../assets/utiles.png';
import librosImg from '../assets/libros.png';
import electronicoImg from '../assets/electronico.png';


const Home = () => {
  return (
    <div className="bg-[#E6F2E5] min-h-screen">
      <div>
        <Navbar />
      </div>
      <header className="bg-[#16a34a] text-white py-8">
        <div className="container mx-auto text-center">
          <img
            src="/logo.png"
            alt="EduNey Logo"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h1 className="text-4xl font-bold tracking-widest">
            DALE UNA SEGUNDA OPORTUNIDAD
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm tracking-wide">
            En EduNey creemos en darle una nueva vida a las prendas y elementos
            institucionales. Somos una empresa apasionada por la sostenibilidad
            y reutilización.
          </p>
        </div>
      </header>

      <main className="container mx-auto py-10">
        {/* Grid de 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-md text-center p-6 flex flex-col">
            <div className="mb-4">
              <Boton2 />
            </div>
            <img
              src={uniformeImg}
              alt="Uniformes escolares"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <p className="text-[#4B5563] mt-auto">Uniformes</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-md text-center p-6 flex flex-col">
            <div className="mb-4">
              <Boton2 />
            </div>
            <img
              src={utilesImg}
              alt="Útiles escolares"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <p className="text-[#4B5563] mt-auto">Útiles</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-md text-center p-6 flex flex-col">
            <div className="mb-4">
              <Boton2 />
            </div>
            <img
              src={librosImg}
              alt="Libros educativos"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <p className="text-[#4B5563] mt-auto">Libros</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow-md text-center p-6 flex flex-col">
            <div className="mb-4">
              <Boton2 />
            </div>
            <img
              src={electronicoImg}
              alt="Mochilas escolares"
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <p className="text-[#4B5563] mt-auto">Electronicos</p>
          </div>
        </div>

        {/* Sección de texto */}
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#1E4D2B]">
            ¿Estás listo para contribuir con la educación donando útiles,
            artículos, uniformes, etc.?
          </h2>
          <p className="text-[#4B5563] max-w-2xl mx-auto">
            La educación es la clave para un futuro brillante. Con tu ayuda
            podemos asegurarnos de que cada estudiante tenga acceso a los
            recursos que necesita para triunfar.
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
