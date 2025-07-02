import { useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api/transacciones.api'; // Asegúrate que esta ruta sea correcta

const DetalleTransaccion = ({ item, tipoEntrega, onDetalleCreado }) => {
  useEffect(() => {
    const crearDetalleTransaccion = async () => {
      try {
        const response = await api.post('/detalle_transaccion/', {
          tipo_transaccion: 'venta',
          tipo_entrega: tipoEntrega,
          cantidad_articulos: item.cantidad,
          id_articulo: item.id_articulo,
        });

        console.log('Respuesta del backend:', response.data);

        const idDetalle = response.data.id_detalle_transaccion;
        if (idDetalle) {
          onDetalleCreado(idDetalle); // Devolvemos el ID al componente padre
        } else {
          console.error("El campo 'id_detalle_transaccion' no está presente.");
        }
      } catch (error) {
        console.error('Error al crear detalle de transacción:', error);
      }
    };

    crearDetalleTransaccion();
  }, [item, tipoEntrega, onDetalleCreado]);

  return null; // Este componente no renderiza nada en pantalla
};

DetalleTransaccion.propTypes = {
  item: PropTypes.shape({
    cantidad: PropTypes.number.isRequired,
    id_articulo: PropTypes.number.isRequired,
  }).isRequired,
  tipoEntrega: PropTypes.string.isRequired,
  onDetalleCreado: PropTypes.func.isRequired,
};

export default DetalleTransaccion;
