import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Alert from './Alert';
import axios from 'axios';

const SERVER_URL = 'http://localhost:3001/api'; // Corregido: Puerto del backend

const SurveyForm = ({ onSurveySubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    puesto: '',
    telefono: '',
    seguridadGeneral: '',
    presenciaSerenazgo: '',
    frecuenciaSerenazgo: '',
    iluminacionGeneral: '',
    zonasOscuras: [],
    camarasFuncionando: '',
    ubicacionCamaras: '',
    problemasEspecificos: [],
    incidentesReportados: '',
    tiempoRespuesta: '',
    capacitacionSeguridad: '',
    sugerenciaMejora: '',
    calificacionGeneral: '',
    confianzaAdministracion: '',
    participacionComerciantes: '',
    comentariosAdicionales: '',
  });
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((p) => p !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    const now = new Date();
    const surveyData = {
      ...formData,
      fecha: now.toLocaleDateString('es-ES'),
      hora: now.toLocaleTimeString('es-ES'),
    };

    try {
      const response = await axios.post(`${SERVER_URL}/respuestas`, surveyData);
      setAlert({ type: 'success', message: `✅ ${response.data.mensaje || 'Encuesta enviada al servidor exitosamente!'} <br/><small>Gracias por su participación, ${formData.nombre}</small>` });
      setFormData({
        nombre: '',
        puesto: '',
        telefono: '',
        seguridadGeneral: '',
        presenciaSerenazgo: '',
        frecuenciaSerenazgo: '',
        iluminacionGeneral: '',
        zonasOscuras: [],
        camarasFuncionando: '',
        ubicacionCamaras: '',
        problemasEspecificos: [],
        incidentesReportados: '',
        tiempoRespuesta: '',
        capacitacionSeguridad: '',
        sugerenciaMejora: '',
        calificacionGeneral: '',
        confianzaAdministracion: '',
        participacionComerciantes: '',
        comentariosAdicionales: '',
      });
      onSurveySubmit(surveyData); // Notify parent component
    } catch (error) {
      console.error('Error al enviar la encuesta:', error);
      setAlert({ type: 'danger', message: `❌ Error al enviar la encuesta. Inténtelo de nuevo. <br/><small>${error.response?.data?.error || error.message}</small>` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="nombre" className="block text-gray-700 font-semibold mb-2">👤 Nombre del Comerciante:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ingrese su nombre completo"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="form-group">
            <label htmlFor="puesto" className="block text-gray-700 font-semibold mb-2">🏪 Número de Puesto:</label>
            <input
              type="text"
              id="puesto"
              name="puesto"
              value={formData.puesto}
              onChange={handleChange}
              required
              placeholder="Ej: A-15, B-23, C-07"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="form-group md:col-span-2">
            <label htmlFor="telefono" className="block text-gray-700 font-semibold mb-2">📱 Teléfono (opcional):</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Número de contacto"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Nueva pregunta: Seguridad General */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">🛡️ ¿Cómo calificaría la seguridad general en el mercado?</label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['muy inseguro', 'inseguro', 'regular', 'seguro', 'muy seguro'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="seguridadGeneral"
                  value={option}
                  checked={formData.seguridadGeneral === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Presencia de Serenazgo */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">👮 ¿Con qué frecuencia observa la presencia de serenazgo o personal de seguridad?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['siempre', 'a menudo', 'a veces', 'rara vez', 'nunca'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="presenciaSerenazgo"
                  value={option}
                  checked={formData.presenciaSerenazgo === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Frecuencia de Serenazgo */}
        <div className="form-group">
          <label htmlFor="frecuenciaSerenazgo" className="block text-gray-700 font-semibold mb-2">⏰ Si observa serenazgo, ¿cuántas veces al día/semana los ve en su zona?</label>
          <input
            type="text"
            id="frecuenciaSerenazgo"
            name="frecuenciaSerenazgo"
            value={formData.frecuenciaSerenazgo}
            onChange={handleChange}
            placeholder="Ej: 3 veces al día, 5 veces a la semana"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Nueva pregunta: Iluminación General */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">💡 ¿Cómo calificaría la iluminación general del mercado, especialmente por la noche?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['excelente', 'buena', 'regular', 'mala', 'muy mala'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="iluminacionGeneral"
                  value={option}
                  checked={formData.iluminacionGeneral === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Zonas Oscuras */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">🌑 ¿Existen zonas específicas del mercado que considera peligrosamente oscuras?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'pasillos_internos', label: 'Pasillos internos' },
              { value: 'zonas_carga_descarga', label: 'Zonas de carga y descarga' },
              { value: 'exteriores_perimetro', label: 'Exteriores/Perímetro del mercado' },
              { value: 'baños', label: 'Baños' },
              { value: 'estacionamiento', label: 'Estacionamiento' },
              { value: 'otras_zonas_oscuras', label: 'Otras (especifique en sugerencias)' },
            ].map((option) => (
              <label key={option.value} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="checkbox"
                  name="zonasOscuras"
                  value={option.value}
                  checked={formData.zonasOscuras.includes(option.value)}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Cámaras Funcionando */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">📹 ¿Cree que las cámaras de seguridad existentes funcionan correctamente?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['sí', 'no', 'no estoy seguro'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="camarasFuncionando"
                  value={option}
                  checked={formData.camarasFuncionando === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Ubicación de Cámaras */}
        <div className="form-group">
          <label htmlFor="ubicacionCamaras" className="block text-gray-700 font-semibold mb-2">📍 ¿Considera que las cámaras están ubicadas en lugares estratégicos?</label>
          <input
            type="text"
            id="ubicacionCamaras"
            name="ubicacionCamaras"
            value={formData.ubicacionCamaras}
            onChange={handleChange}
            placeholder="Ej: Sí, cubren bien; No, faltan en pasillos"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Problemas Específicos (actualizado) */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">🚨 ¿Qué problemas de seguridad específicos ha observado o experimentado? (Marque todos los que apliquen)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'robo', label: '🔓 Robos o hurtos frecuentes' },
              { value: 'iluminacion', label: '💡 Mala iluminación nocturna' },
              { value: 'vigilancia', label: '👮 Falta de vigilancia adecuada' },
              { value: 'acceso', label: '🚪 Control de acceso deficiente' },
              { value: 'emergencia', label: '🚨 Falta plan de emergencias' },
              { value: 'infraestructura', label: '🏗️ Infraestructura deficiente (ej. cercos, puertas)' },
              { value: 'personal', label: '👥 Personal de seguridad insuficiente o poco visible' },
              { value: 'otros', label: '📝 Otros problemas de seguridad' },
            ].map((option) => (
              <label key={option.value} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="checkbox"
                  name="problemasEspecificos"
                  value={option.value}
                  checked={formData.problemasEspecificos.includes(option.value)}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Incidentes Reportados */}
        <div className="form-group">
          <label htmlFor="incidentesReportados" className="block text-gray-700 font-semibold mb-2">📢 ¿Ha reportado algún incidente de seguridad a la administración o serenazgo? ¿Cuál fue el resultado?</label>
          <textarea
            id="incidentesReportados"
            name="incidentesReportados"
            value={formData.incidentesReportados}
            onChange={handleChange}
            rows="3"
            placeholder="Describa brevemente el incidente y la respuesta recibida..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          ></textarea>
        </div>

        {/* Nueva pregunta: Tiempo de Respuesta */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">⏱️ ¿Cómo calificaría el tiempo de respuesta del personal de seguridad ante una emergencia?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['muy rápido', 'rápido', 'aceptable', 'lento', 'muy lento'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="tiempoRespuesta"
                  value={option}
                  checked={formData.tiempoRespuesta === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Capacitación en Seguridad */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">📚 ¿Ha recibido alguna capacitación o información sobre protocolos de seguridad en el mercado?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['sí', 'no', 'no estoy seguro'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="capacitacionSeguridad"
                  value={option}
                  checked={formData.capacitacionSeguridad === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sugerencia de Mejora (actualizado) */}
        <div className="form-group">
          <label htmlFor="sugerenciaMejora" className="block text-gray-700 font-semibold mb-2">💡 ¿Qué medidas de seguridad adicionales o mejoras le gustaría que se implementen?</label>
          <textarea
            id="sugerenciaMejora"
            name="sugerenciaMejora"
            value={formData.sugerenciaMejora}
            onChange={handleChange}
            rows="4"
            placeholder="Describa detalladamente sus sugerencias para mejorar la seguridad del mercado..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          ></textarea>
        </div>

        {/* Calificación General (actualizado) */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">⭐ Califique la seguridad actual del mercado en una escala del 1 al 5 (siendo 5 la máxima seguridad):</label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="calificacionGeneral"
                  value={rating}
                  checked={formData.calificacionGeneral === String(rating)}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium">{'⭐'.repeat(rating)} {rating}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Confianza en la Administración */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">🤝 ¿Qué tan confiado se siente en que la administración del mercado tomará medidas para mejorar la seguridad?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['muy confiado', 'confiado', 'neutral', 'poco confiado', 'nada confiado'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="confianzaAdministracion"
                  value={option}
                  checked={formData.confianzaAdministracion === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Participación de Comerciantes */}
        <div className="form-group">
          <label className="block text-gray-700 font-semibold mb-3">🗣️ ¿Estaría dispuesto a participar en reuniones o iniciativas para mejorar la seguridad del mercado?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['sí', 'no', 'tal vez'].map((option) => (
              <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                <input
                  type="radio"
                  name="participacionComerciantes"
                  value={option}
                  checked={formData.participacionComerciantes === option}
                  onChange={handleChange}
                  required
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-gray-700 font-medium capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nueva pregunta: Comentarios Adicionales */}
        <div className="form-group">
          <label htmlFor="comentariosAdicionales" className="block text-gray-700 font-semibold mb-2">📝 ¿Tiene algún otro comentario o sugerencia no cubierta en las preguntas anteriores?</label>
          <textarea
            id="comentariosAdicionales"
            name="comentariosAdicionales"
            value={formData.comentariosAdicionales}
            onChange={handleChange}
            rows="3"
            placeholder="Escriba aquí cualquier otra observación..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          ></textarea>
        </div>

        <div className="text-center mt-8">
          <motion.button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Enviando...</span>
                <div className="spinner border-white border-t-white"></div>
              </>
            ) : (
              <>
                <span className="mr-2">📤</span> Enviar Encuesta
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default SurveyForm;