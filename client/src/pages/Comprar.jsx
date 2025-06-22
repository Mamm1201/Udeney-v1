import Boton from "../components/Boton";

function compra() {
  const manejarClic = () => {
    console.log("clic");
  };

  const reiniciarContador = () => {
    console.log("reiniciar");
  };
  return (
    <div className="venta- principal">
      <Boton text="clic" esBotonDeClic={true} manejarClic={manejarClic} />
      clic
      <Boton
        text="reiniciar"
        esBotonDeClic={false}
        manejarClic={reiniciarContador}
      />
      reiniciar
    </div>
  );
}

export default compra;
