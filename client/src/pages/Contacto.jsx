import React from 'react';
import Navbar from '../components/Navbar';
import Pie from '../components/Pie';
import Contact from '../components/Contact';

const Contacto = () => {
  return (
    <div className="bg-green-100 min-h-screen">
      <div>
        <Navbar />
      </div>
      <main>
        <Contact />
      </main>

      <div>
        <Pie />
      </div>
    </div>
  );
};

export default Contacto;
