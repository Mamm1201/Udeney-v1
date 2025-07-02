import PropTypes from 'prop-types';

function Boton({ texto, esBotonDeClic, manejarClic }) {
  return (
    <button
      className={esBotonDeClic ? 'boton-clic' : 'boton-reiniciar'}
      onClick={manejarClic}
    >
      {texto}
    </button>
  );
}

Boton.propTypes = {
  texto: PropTypes.string.isRequired,
  esBotonDeClic: PropTypes.bool.isRequired,
  manejarClic: PropTypes.func.isRequired,
};

export default Boton;
