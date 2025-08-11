import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Alert from './Alert';
import axios from 'axios';

const SERVER_URL = 'http://localhost:3001/api'; // Corregido: Puerto del backend

export const LoginForm = ({ onLoginSuccess, onShowRegister }) => {
  const [formData, setFormData] = useState({ usuario: '', password: '' });
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);
    try {
      const response = await axios.post(`${SERVER_URL}/login`, formData);
      setAlert({ type: 'success', message: `✅ ¡Bienvenido de vuelta, ${formData.usuario}! 👋` });
      onLoginSuccess(response.data.user);
    } catch (error) {
      console.error('Login error:', error);
      setAlert({ type: 'danger', message: `❌ Credenciales incorrectas. <br/><small>${error.response?.data?.mensaje || error.message}</small>` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-3xl font-bold text-gray-800 text-center mb-6">🔐 Acceso de Administrador</h3>
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="usuario" className="block text-gray-700 font-semibold mb-2">👤 Usuario:</label>
          <input
            type="text"
            id="usuario"
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            required
            placeholder="Nombre de usuario"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">🔑 Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Contraseña"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <motion.button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Iniciando...</span>
              <div className="spinner border-white border-t-white"></div>
            </>
          ) : (
            <>
              <span className="mr-2">🚀</span> Iniciar Sesión
            </>
          )}
        </motion.button>
      </form>
      <hr className="my-8 border-gray-200" />
      <motion.button
        onClick={onShowRegister}
        className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-gray-300 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="mr-2">👥</span> Registrar Nuevo Administrador
      </motion.button>
    </motion.div>
  );
};

export const RegisterForm = ({ onRegisterSuccess, onShowLogin }) => {
  const [formData, setFormData] = useState({
    token: '',
    usuario: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    if (formData.password !== formData.confirm) {
      setAlert({ type: 'danger', message: '❌ Las contraseñas no coinciden.' });
      setIsSubmitting(false);
      return;
    }
    if (formData.password.length < 8) {
      setAlert({ type: 'danger', message: '❌ La contraseña debe tener al menos 8 caracteres.' });
      setIsSubmitting(false);
      return;
    }
    if (formData.usuario.length < 4) {
      setAlert({ type: 'danger', message: '❌ El nombre de usuario debe tener al menos 4 caracteres.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${SERVER_URL}/register`, {
        token: formData.token,
        usuario: formData.usuario,
        email: formData.email,
        password: formData.password,
      });
      setAlert({ type: 'success', message: `✅ ${response.data.mensaje || 'Administrador registrado exitosamente!'}` });
      setTimeout(() => onRegisterSuccess(), 2000); // Redirect after success message
    } catch (error) {
      console.error('Register error:', error);
      setAlert({ type: 'danger', message: `❌ Error al registrar administrador. <br/><small>${error.response?.data?.mensaje || error.message}</small>` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-3xl font-bold text-gray-800 text-center mb-6">📝 Registro de Administrador</h3>
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label htmlFor="token" className="block text-gray-700 font-semibold mb-2">🎫 Token de Autorización:</label>
          <input
            type="password"
            id="token"
            name="token"
            value={formData.token}
            onChange={handleChange}
            required
            placeholder="Ingrese el token de autorización"
            className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-10"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-2 text-xl">🔐</span>
          <small className="text-gray-500 mt-1 block">⚠️ Solo personal autorizado puede registrar administradores</small>
        </div>
        <div>
          <label htmlFor="usuario" className="block text-gray-700 font-semibold mb-2">👤 Nombre de Usuario:</label>
          <input
            type="text"
            id="usuario"
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            required
            placeholder="Mínimo 4 caracteres"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">📧 Email Corporativo:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="admin@mercado.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">🔑 Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Mínimo 8 caracteres"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-gray-700 font-semibold mb-2">🔐 Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirm"
            name="confirm"
            value={formData.confirm}
            onChange={handleChange}
            required
            placeholder="Repetir contraseña"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <motion.button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Registrando...</span>
              <div className="spinner border-white border-t-white"></div>
            </>
          ) : (
            <>
              <span className="mr-2">✅</span> Registrar Administrador
            </>
          )}
        </motion.button>
      </form>
      <hr className="my-8 border-gray-200" />
      <motion.button
        onClick={onShowLogin}
        className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-gray-300 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="mr-2">🔙</span> Volver al Login
      </motion.button>
    </motion.div>
  );
};