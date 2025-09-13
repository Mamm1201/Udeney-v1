// ============================================================================
// COMPONENTE DE EJEMPLO: ACTUALIZACIÓN DE PERFIL SIN RE-LOGIN
// ============================================================================

import React, { useState, useEffect } from 'react';
import { perfilAPI, authAPI } from './enhanced-axios-config';

const PerfilUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const response = await perfilAPI.obtenerPerfil();
      setUsuario(response.data);
      console.log('✅ Perfil cargado:', response.data);
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error);
      if (error.response?.status === 401) {
        setMensaje('Sesión expirada. Redirigiendo...');
        // El interceptor ya manejó la renovación automática
        // Si llegamos aquí es porque falló completamente
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const actualizarCampo = async (campo, valor) => {
    try {
      setUpdating(true);
      console.log(`🔄 Actualizando ${campo}:`, valor);
      
      const response = await perfilAPI.actualizarCampo(campo, valor);
      
      setUsuario(response.data);
      setMensaje(`✅ ${campo} actualizado correctamente`);
      
      console.log('✅ Campo actualizado:', response.data);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(''), 3000);
      
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      setMensaje('❌ Error al actualizar. Intenta nuevamente.');
      
      // Si es error 401, el interceptor ya intentó renovar el token
      if (error.response?.status === 401) {
        setMensaje('❌ Error de autenticación. Revisa tu conexión.');
      }
      
      setTimeout(() => setMensaje(''), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const actualizarPerfilCompleto = async (formData) => {
    try {
      setUpdating(true);
      console.log('🔄 Actualizando perfil completo:', formData);
      
      const response = await perfilAPI.actualizarPerfilCompleto(formData);
      
      setUsuario(response.data);
      setMensaje('✅ Perfil actualizado completamente');
      
      console.log('✅ Perfil actualizado:', response.data);
      
      setTimeout(() => setMensaje(''), 3000);
      
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      setMensaje('❌ Error al actualizar perfil');
      setTimeout(() => setMensaje(''), 5000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3">Cargando perfil...</span>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error al cargar los datos del usuario</p>
        <button 
          onClick={cargarPerfil}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Actualizar Perfil
      </h2>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-4 mb-6 rounded-lg ${
          mensaje.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {mensaje}
        </div>
      )}

      <div className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre
          </label>
          <input
            type="text"
            value={usuario.nombres_usuario || ''}
            onChange={(e) => setUsuario({...usuario, nombres_usuario: e.target.value})}
            onBlur={(e) => {
              if (e.target.value !== usuario.nombres_usuario) {
                actualizarCampo('nombres_usuario', e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={updating}
          />
        </div>

        {/* Apellidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos
          </label>
          <input
            type="text"
            value={usuario.apellidos_usuario || ''}
            onChange={(e) => setUsuario({...usuario, apellidos_usuario: e.target.value})}
            onBlur={(e) => {
              if (e.target.value !== usuario.apellidos_usuario) {
                actualizarCampo('apellidos_usuario', e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={updating}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={usuario.telefono_usuario || ''}
            onChange={(e) => setUsuario({...usuario, telefono_usuario: e.target.value})}
            onBlur={(e) => {
              if (e.target.value !== usuario.telefono_usuario) {
                actualizarCampo('telefono_usuario', e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={updating}
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <textarea
            value={usuario.direccion_usuario || ''}
            onChange={(e) => setUsuario({...usuario, direccion_usuario: e.target.value})}
            onBlur={(e) => {
              if (e.target.value !== usuario.direccion_usuario) {
                actualizarCampo('direccion_usuario', e.target.value);
              }
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={updating}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-4 pt-6">
          <button
            onClick={() => actualizarPerfilCompleto(usuario)}
            disabled={updating}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </span>
            ) : (
              'Guardar Cambios'
            )}
          </button>
          
          <button
            onClick={cargarPerfil}
            disabled={updating}
            className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Recargar
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          💡 Funcionalidades Avanzadas
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Los cambios se guardan automáticamente al salir de cada campo</li>
          <li>• El token se renueva automáticamente si expira</li>
          <li>• No necesitas hacer login nuevamente</li>
          <li>• Los cambios se sincronizan en tiempo real</li>
        </ul>
      </div>
    </div>
  );
};

export default PerfilUsuario;