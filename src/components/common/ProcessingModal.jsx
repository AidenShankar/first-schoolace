import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProcessingModal({ isVisible, status, message }) {
  const icons = {
    processing: <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />,
    success: <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />,
    error: <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2, ease: "easeOut" }}
            className="text-center p-8 bg-white rounded-2xl shadow-2xl"
          >
            {icons[status]}
            <p className="text-xl font-semibold text-slate-800">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}