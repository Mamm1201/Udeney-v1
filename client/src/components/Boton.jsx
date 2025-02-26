function Boton({ texto, esBotonDeClic, manejarClic }) {
  return (
    <button
      className={esBotonDeClic ? "boton-clic" : "boton-reiniciar"} // esto es un operador terneario
      onClick={manejarClic} // esto es un eventListener
    >
      {texto}
    </button>
  );
}

export default Boton;
