import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ArrowLeft, RotateCcw, ShieldAlert } from 'lucide-react';

export function ModalConfirmacionSalirWBS({
  isOpen,
  onConfirm,
  onCancel,
  titulo = "¿Cancelar Asignación WBS?",
  mensaje = "Los datos ingresados y no guardados de la tarea se perderán y la operación será cancelada."
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 relative space-y-5"
        >
          {/* Botón de cierre discreto */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-2xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>

          {/* Contenido Visual Interactivo */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-md animate-bounce">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1.5 min-w-0 flex-1 pt-0.5">
              <span className="text-[0.65rem] font-mono font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                Confirmación de Salida
              </span>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                {titulo}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed pt-1">
                {mensaje}
              </p>
            </div>
          </div>

          {/* Botones de Acción Interactivos */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-2xs"
            >
              Continuar Editando
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-600/20 hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Sí, Cancelar y Salir</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
