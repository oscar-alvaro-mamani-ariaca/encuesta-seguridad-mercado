import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from './Alert';
import axios from 'axios';
import { BarChart, PieChart, LineChart } from 'lucide-react'; // Placeholder for actual chart components

const SERVER_URL = 'http://localhost:3001/api'; // Corregido: Puerto del backend

const AdminPanel = ({ onLogout }) => {
  const [surveys, setSurveys] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await axios.get(`${SERVER_URL}/respuestas`);
      const fetchedSurveys = response.data.map(item => ({
        id: item._id, // MongoDB's default ID
        fecha: item.fecha || new Date(item.createdAt).toLocaleDateString('es-ES'),
        hora: item.hora || new Date(item.createdAt).toLocaleTimeString('es-ES'),
        nombre: item.nombre,
        puesto: item.puesto || 'No especificado',
        telefono: item.telefono || 'No proporcionado',
        seguridadGeneral: item.seguridadGeneral, // Corregido: Nombre del campo
        problemasEspecificos: item.problemasEspecificos || [], // Corregido: Nombre del campo
        sugerenciaMejora: item.sugerenciaMejora || 'Ninguna sugerencia', // Corregido: Nombre del campo
        calificacionGeneral: item.calificacionGeneral || '3', // Corregido: Nombre del campo
        synced: true, // All fetched from server are synced
      }));
      setSurveys(fetchedSurveys);
      setAlert({ type: 'success', message: `✅ Datos del servidor cargados correctamente. <br/><small>${fetchedSurveys.length} encuestas encontradas.</small>` });
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setAlert({ type: 'danger', message: `❌ Error al cargar datos del servidor. <br/><small>${error.message}</small>` });
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (surveys.length === 0) {
      setAlert({ type: 'warning', message: '❌ No hay datos para exportar.' });
      return;
    }

    setAlert({ type: 'warning', message: '💾 Preparando archivo de exportación...' });

    setTimeout(() => {
      let csv = 'ID,Fecha,Hora,Nombre,Puesto,Teléfono,Seguridad General,Calificación General,Problemas Específicos,Sugerencia de Mejora\n';
      surveys.forEach(e => {
        const problemas = e.problemasEspecificos && e.problemasEspecificos.length > 0 ? e.problemasEspecificos.join('; ') : 'Ninguno';
        const sugerencia = (e.sugerenciaMejora || 'Ninguna').replace(/"/g, '""'); // Escape quotes
        csv += `"${e.id}","${e.fecha}","${e.hora}","${e.nombre}","${e.puesto}","${e.telefono}","${e.seguridadGeneral}","${e.calificacionGeneral}","${problemas}","${sugerencia}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `encuestas-seguridad-mercado-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setAlert({ type: 'success', message: `💾 ¡Archivo exportado correctamente! <br/><small>${surveys.length} encuestas exportadas en formato CSV.</small>` });
    }, 1000);
  };

  const clearResults = async () => { // Añadido async
    if (window.confirm('⚠️ ¿Está seguro de que desea eliminar TODAS las encuestas? Esta acción no se puede deshacer y eliminará los datos del servidor.')) {
      setAlert({ type: 'warning', message: '🗑️ Eliminando datos del servidor...' });
      try {
        // Aquí deberías enviar una solicitud DELETE a tu backend para eliminar los datos
        // Por ejemplo: await axios.delete(`${SERVER_URL}/respuestas`);
        // Como no hay una ruta DELETE en el backend, solo lo simulamos localmente
        setSurveys([]);
        setAlert({ type: 'success', message: '✅ Todas las encuestas han sido eliminadas localmente. (En un proyecto real, esto también las borraría del servidor).' });
      } catch (error) {
        console.error('Error clearing surveys:', error);
        setAlert({ type: 'danger', message: `❌ Error al eliminar datos del servidor. <br/><small>${error.message}</small>` });
      }
    }
  };

  // --- Statistics Calculation ---
  const seguridadStats = {};
  const calificacionStats = {};
  const problemasStats = {};

  surveys.forEach(e => {
    seguridadStats[e.seguridadGeneral] = (seguridadStats[e.seguridadGeneral] || 0) + 1;
    calificacionStats[e.calificacionGeneral] = (calificacionStats[e.calificacionGeneral] || 0) + 1;

    if (e.problemasEspecificos && Array.isArray(e.problemasEspecificos)) {
      e.problemasEspecificos.forEach(problema => {
        problemasStats[problema] = (problemasStats[problema] || 0) + 1;
      });
    }
  });

  const totalCalificaciones = Object.entries(calificacionStats).reduce((sum, [cal, count]) =>
    sum + (parseInt(cal) * count), 0);
  const promedioCalificacion = surveys.length > 0 ? (totalCalificaciones / surveys.length).toFixed(1) : 0;

  const problemasMap = {
    'robo': '🔓 Robos/hurtos',
    'iluminacion': '💡 Mala iluminación',
    'vigilancia': '👮 Falta vigilancia',
    'acceso': '🚪 Control acceso',
    'emergencia': '🚨 Plan emergencias',
    'infraestructura': '🏗️ Infraestructura deficiente',
    'personal': '👥 Personal de seguridad insuficiente',
    'otros': '📝 Otros'
  };

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h3 className="text-3xl font-bold text-gray-800">📊 Panel de Administración</h3>
        <div className="flex gap-3 flex-wrap">
          <motion.button
            onClick={fetchSurveys}
            className="bg-blue-600 text-white py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="mr-2">Cargando...</span>
                <div className="spinner border-white border-t-white"></div>
              </>
            ) : (
              <>
                <span className="text-xl">🔄</span> Actualizar
              </>
            )}
          </motion.button>
          <motion.button
            onClick={onLogout}
            className="bg-gray-600 text-white py-2 px-5 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">🚪</span> Cerrar Sesión
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h4 className="text-xl font-semibold text-blue-800 mb-3">Total Encuestas</h4>
          <p className="text-5xl font-bold text-blue-600">{surveys.length}</p>
        </motion.div>
        <motion.div
          className="bg-green-50 p-6 rounded-xl shadow-md border border-green-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className="text-xl font-semibold text-green-800 mb-3">Calificación Promedio</h4>
          <p className="text-5xl font-bold text-green-600">{promedioCalificacion} <span className="text-3xl">/ 5</span></p>
        </motion.div>
        <motion.div
          className="bg-yellow-50 p-6 rounded-xl shadow-md border border-yellow-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h4 className="text-xl font-semibold text-yellow-800 mb-3">Problemas Reportados</h4>
          <p className="text-5xl font-bold text-yellow-600">{Object.keys(problemasStats).length}</p>
        </motion.div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 mb-8">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas Detalladas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-bold text-lg text-gray-700 mb-2 flex items-center"><PieChart className="w-5 h-5 mr-2 text-blue-500" /> Sensación de Seguridad</h5>
            {Object.entries(seguridadStats).map(([key, value]) => {
              const percentage = surveys.length > 0 ? ((value / surveys.length) * 100).toFixed(1) : 0;
              const emoji = key === 'muy seguro' || key === 'seguro' ? '✅' : key === 'muy inseguro' || key === 'inseguro' ? '❌' : '⚠️';
              const color = key === 'muy seguro' || key === 'seguro' ? 'text-green-600' : key === 'muy inseguro' || key === 'inseguro' ? 'text-red-600' : 'text-yellow-600';
              return (
                <p key={key} className="text-gray-600 mb-1">
                  {emoji} <span className="font-medium capitalize">{key}:</span> <span className={`font-bold ${color}`}>{value} ({percentage}%)</span>
                </p>
              );
            })}
          </div>
          <div>
            <h5 className="font-bold text-lg text-gray-700 mb-2 flex items-center"><BarChart className="w-5 h-5 mr-2 text-purple-500" /> Problemas Más Frecuentes</h5>
            {Object.entries(problemasStats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([problema, count]) => (
              <p key={problema} className="text-gray-600 mb-1">
                {problemasMap[problema] || problema}: <span className="font-bold text-red-600">{count} reportes</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-8">
        <motion.button
          onClick={exportResults}
          className="bg-green-500 text-white py-2 px-5 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl">💾</span> Exportar Resultados
        </motion.button>
        <motion.button
          onClick={clearResults}
          className="bg-red-500 text-white py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl">🗑️</span> Limpiar Datos
        </motion.button>
      </div>

      <h4 className="text-2xl font-bold text-gray-800 mb-4">📋 Detalle de Encuestas</h4>
      {surveys.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No hay encuestas registradas. ¡Anima a los comerciantes a participar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {surveys.map((encuesta) => (
              <motion.div
                key={encuesta.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-4 right-4">
                  <span className="badge badge-success">🌐 Sincronizado</span>
                </div>
                <h5 className="text-xl font-semibold text-gray-800 mb-2">👤 {encuesta.nombre} <span className="text-gray-500 text-sm font-normal">({encuesta.puesto})</span></h5>
                <p className="text-gray-600 mb-1">📅 {encuesta.fecha} 🕒 {encuesta.hora}</p>
                <p className="text-gray-600 mb-1">📱 {encuesta.telefono}</p>
                <p className="text-gray-600 mb-1">🛡️ Seguridad: <span className={`font-bold ${encuesta.seguridadGeneral === 'muy seguro' || encuesta.seguridadGeneral === 'seguro' ? 'text-green-600' : encuesta.seguridadGeneral === 'muy inseguro' || encuesta.seguridadGeneral === 'inseguro' ? 'text-red-600' : 'text-yellow-600'}`}>{encuesta.seguridadGeneral}</span></p>
                <p className="text-gray-600 mb-1">⭐ Calificación: {'⭐'.repeat(parseInt(encuesta.calificacionGeneral))} ({encuesta.calificacionGeneral}/5)</p>
                <p className="text-gray-600 mb-1">🚨 Problemas: {encuesta.problemasEspecificos.length > 0 ? encuesta.problemasEspecificos.join(', ') : 'Ninguno'}</p>
                <p className="text-gray-600 italic mt-2">💡 Sugerencia: "{encuesta.sugerenciaMejora}"</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;