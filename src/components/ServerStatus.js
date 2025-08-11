import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const SERVER_URL = 'http://localhost:3001/api'; // Corregido: Puerto del backend

const ServerStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [message, setMessage] = useState('Verificando conexión...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await axios.get(`${SERVER_URL}/respuestas`);
        setIsOnline(true);
        setMessage('🟢 Servidor conectado');
      } catch (error) {
        setIsOnline(false);
        setMessage('🔴 Modo offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`text-center py-3 px-6 rounded-full font-semibold text-sm shadow-lg mx-auto mb-8 ${
        isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {message}
    </motion.div>
  );
};

export default ServerStatus;