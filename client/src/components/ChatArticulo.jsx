import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_URL } from '../api'; // Asegúrate de que la ruta sea correcta

const ChatArticulo = ({ remitenteId, destinatarioId }) => {
  const { articuloId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  const obtenerMensajes = async () => {
    try {
      const response = await axios.get(`${API_URL}/mensajes/`, {
        params: {
          remitente: remitenteId,
          destinatario: destinatarioId,
          articulo: articuloId,
        },
      });
      setMensajes(response.data);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  useEffect(() => {
    if (!articuloId || !remitenteId || !destinatarioId) {
      console.warn('Faltan datos necesarios para obtener mensajes');
      return;
    }
    obtenerMensajes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remitenteId, destinatarioId, articuloId]);

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() === '') return;

    try {
      await axios.post(`${API_URL}/mensajes/`, {
        remitente: remitenteId,
        destinatario: destinatarioId,
        articulo: articuloId,
        contenido: nuevoMensaje,
      });
      setNuevoMensaje('');
      obtenerMensajes();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  return (
    <div>
      <h2>Chat del Artículo #{articuloId}</h2>
      <div
        style={{
          border: '1px solid gray',
          padding: '1rem',
          height: '300px',
          overflowY: 'scroll',
        }}
      >
        {mensajes.map(mensaje => (
          <div key={mensaje.id}>
            <strong>{mensaje.remitente_nombre}:</strong> {mensaje.contenido}
          </div>
        ))}
      </div>
      <textarea
        value={nuevoMensaje}
        onChange={e => setNuevoMensaje(e.target.value)}
        placeholder="Escribe tu mensaje aquí"
        rows={3}
        style={{ width: '100%' }}
      />
      <button onClick={enviarMensaje}>Enviar</button>
    </div>
  );
};

ChatArticulo.propTypes = {
  remitenteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  destinatarioId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default ChatArticulo;
