import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import ServerStatus from './components/ServerStatus';
import SurveyForm from './components/SurveyForm';
import AdminPanel from './components/AdminPanel';
import { LoginForm, RegisterForm } from './components/AuthForms';

const App = () => {
  const [activeTab, setActiveTab] = useState('encuesta'); // 'encuesta' or 'admin'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const handleLoginSuccess = (user) => {
    setIsAdminLoggedIn(true);
    setShowRegisterForm(false);
    console.log('Admin logged in:', user);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('encuesta'); // Redirect to survey tab after logout
  };

  const handleSurveySubmit = (surveyData) => {
    console.log('Survey submitted:', surveyData);
    // In a real app, you might want to refresh admin panel data here
    // if it's open, or just rely on its own refresh mechanism.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8 animate-backgroundShift bg-[length:200%_200%]">
      <div className="container mx-auto max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
        <Header />

        <div className="p-6 sm:p-8">
          <ServerStatus />

          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-full p-1 flex shadow-inner">
              <motion.button
                onClick={() => setActiveTab('encuesta')}
                className={`py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300 ${
                  activeTab === 'encuesta'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📝 Encuesta de Seguridad
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('admin')}
                className={`py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                👤 Panel Administrativo
              </motion.button>
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'encuesta' && <SurveyForm onSurveySubmit={handleSurveySubmit} />}
            {activeTab === 'admin' && (
              isAdminLoggedIn ? (
                <AdminPanel onLogout={handleLogout} />
              ) : (
                showRegisterForm ? (
                  <RegisterForm onRegisterSuccess={() => setShowRegisterForm(false)} onShowLogin={() => setShowRegisterForm(false)} />
                ) : (
                  <LoginForm onLoginSuccess={handleLoginSuccess} onShowRegister={() => setShowRegisterForm(true)} />
                )
              )
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default App;