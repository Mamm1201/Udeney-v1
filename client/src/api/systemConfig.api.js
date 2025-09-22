/**
 * API para la configuración del sistema
 * Maneja todas las peticiones relacionadas con la configuración administrativa
 */

import axios from './axiosConfig';

export const systemConfigAPI = {
  /**
   * Obtener configuración actual del sistema
   */
  getConfig: async () => {
    try {
      const response = await axios.get('/admin/system/config/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración del sistema:', error);
      throw error;
    }
  },

  /**
   * Actualizar configuración del sistema
   */
  updateConfig: async (configData) => {
    try {
      const response = await axios.post('/admin/system/config/', configData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      throw error;
    }
  },

  /**
   * Obtener métricas reales del sistema
   */
  getSystemMetrics: async () => {
    try {
      const response = await axios.get('/admin/system/metrics/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener métricas del sistema:', error);
      throw error;
    }
  },

  /**
   * Limpiar cache del sistema
   */
  clearCache: async () => {
    try {
      const response = await axios.delete('/cache/stats/');
      return response.data;
    } catch (error) {
      console.error('Error al limpiar cache:', error);
      throw error;
    }
  },

  /**
   * Precalentar cache del sistema
   */
  warmupCache: async () => {
    try {
      const response = await axios.post('/cache/warmup/');
      return response.data;
    } catch (error) {
      console.error('Error al precalentar cache:', error);
      throw error;
    }
  }
};

export default systemConfigAPI;