import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShieldAlert } from 'lucide-react';

export const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden"
        >
          {/* Top Decorative Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          {/* Icon Badge */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800 shadow-sm">
            <LogOut size={26} />
          </div>

          {/* Modal Header & Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              ¿Estás seguro de que deseas salir del sistema?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Tu sesión actual se cerrará de forma segura y se guardará el registro operativo de tus actividades.
            </p>
          </div>

          {/* Action Buttons (Footer - Single Close/Cancel + Confirm) */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldAlert size={15} />
              <span>Confirmar Salida</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
