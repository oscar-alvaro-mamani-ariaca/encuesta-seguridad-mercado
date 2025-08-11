import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const Alert = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Give time for exit animation
      }
    }, 6000); // Auto-hide after 6 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const alertClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const iconComponents = {
    success: CheckCircle,
    danger: XCircle,
    warning: AlertTriangle,
  };

  const Icon = iconComponents[type] || AlertTriangle;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`p-4 rounded-xl mb-4 flex items-center gap-3 shadow-md border ${alertClasses[type]}`}
          role="alert"
        >
          <Icon className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1 text-sm font-medium" dangerouslySetInnerHTML={{ __html: message }} />
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto p-1 rounded-full hover:bg-opacity-20 transition-colors"
            aria-label="Cerrar alerta"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;