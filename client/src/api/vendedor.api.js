/**
 * API para el dashboard de vendedor
 * Maneja todas las peticiones relacionadas con métricas, artículos y transacciones del vendedor
 */

import axios from './axiosConfig';

export const vendedorAPI = {
  /**
   * Obtener métricas del dashboard del vendedor
   */
  getDashboardMetrics: async () => {
    try {
      const response = await axios.get('/vendedor/dashboard/metrics/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener métricas del vendedor:', error);
      throw error;
    }
  },

  /**
   * Obtener artículos recientes del vendedor
   */
  getArticulosRecientes: async () => {
    try {
      const response = await axios.get('/vendedor/articulos/recientes/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener artículos recientes:', error);
      throw error;
    }
  },

  /**
   * Obtener transacciones recientes donde se vendieron artículos del vendedor
   */
  getTransaccionesRecientes: async () => {
    try {
      const response = await axios.get('/vendedor/transacciones/recientes/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener transacciones recientes:', error);
      throw error;
    }
  },

  /**
   * Eliminar artículo del vendedor
   */
  deleteArticulo: async (articuloId) => {
    try {
      const response = await axios.delete(`/articulos/${articuloId}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los artículos del vendedor con paginación
   */
  getMisArticulos: async (idUsuario, page = 1, pageSize = 10) => {
    try {
      const response = await axios.get(`/articulos/mis-articulos/?id_usuario=${idUsuario}&page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis artículos:', error);
      throw error;
    }
  }
};

export default vendedorAPI;