import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.div
      className="bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-800 text-white p-10 text-center relative overflow-hidden rounded-t-3xl"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h1
        className="text-5xl font-extrabold mb-4 drop-shadow-lg"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 120 }}
      >
        🏪 Encuesta de Seguridad
      </motion.h1>
      <motion.p
        className="text-xl opacity-90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Sistema Avanzado de Evaluación de Seguridad del Mercado
      </motion.p>
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl"
          animate={{
            x: ['-50%', '50%', '-50%'],
            y: ['-50%', '50%', '-50%'],
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

export default Header;