// src/components/DetalleTransaccion.jsx
import React, { useEffect } from "react";
// import api from "../api/transacciones.api"; // Asegúrate que la instancia esté bien configurada

const DetalleTransaccion = ({ item, tipoEntrega, onDetalleCreado }) => {
  useEffect(() => {
    const crearDetalleTransaccion = async () => {
      try {
        const response = await api.post("/detalle_transaccion/", {
          tipo_transaccion: "venta",
          tipo_entrega: tipoEntrega,
          cantidad_articulos: item.cantidad,
          id_articulo: item.id_articulo,
        });

        console.log("Respuesta del backend:", response.data);

        const idDetalle = response.data.id_detalle_transaccion;
        if (idDetalle) {
          onDetalleCreado(idDetalle); // Devolvemos el ID al componente padre
        } else {
          console.error("El campo 'id_detalle_transaccion' no está presente.");
        }
      } catch (error) {
        console.error("Error al crear detalle de transacción:", error);
      }
    };

    crearDetalleTransaccion();
  }, [item, tipoEntrega, onDetalleCreado]);

  return null; // Este componente no renderiza nada en pantalla
};

export default DetalleTransaccion;
