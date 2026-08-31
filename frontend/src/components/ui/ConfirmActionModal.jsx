import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Loader2, X, Check } from 'lucide-react';

/**
 * ConfirmActionModal — Modal de Doble Confirmación Corporativo
 *
 * Props:
 *  isOpen       {boolean}  — Controla visibilidad
 *  onClose      {function} — Callback para cerrar/cancelar
 *  onConfirm    {function} — Callback al confirmar la acción
 *  title        {string}   — Título principal del modal
 *  description  {string|ReactNode} — Descripción detallada del impacto
 *  confirmLabel {string}   — Texto del botón de confirmación (default: "Confirmar")
 *  cancelLabel  {string}   — Texto del botón de cancelar (default: "Cancelar")
 *  variant      {"danger"|"warning"} — Estilo visual del modal (default: "danger")
 *  isLoading    {boolean}  — Muestra spinner en botón de confirmación
 *  icon         {ReactNode|null} — Icono personalizado (opcional)
 */
export const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Acción',
  description = '¿Está seguro de continuar? Esta acción quedará registrada en la auditoría del sistema.',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  icon: CustomIcon = null,
}) => {
  const isDanger = variant === 'danger';

  const colorConfig = isDanger
    ? {
        iconWrapper: 'bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40',
        iconColor: 'text-red-600 dark:text-red-400',
        confirmBtn:
          'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-500/20 dark:shadow-red-900/30',
        confirmBtnDisabled: 'bg-red-400 dark:bg-red-700 cursor-not-allowed',
        accentBorder: 'border-t-2 border-t-red-500/40 dark:border-t-red-700/40',
      }
    : {
        iconWrapper: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        confirmBtn:
          'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-lg shadow-amber-500/20 dark:shadow-amber-900/30',
        confirmBtnDisabled: 'bg-amber-300 dark:bg-amber-700 cursor-not-allowed',
        accentBorder: 'border-t-2 border-t-amber-500/40 dark:border-t-amber-700/40',
      };

  const IconComponent = CustomIcon || (isDanger ? ShieldAlert : AlertTriangle);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        >
          <motion.div
            key="confirm-modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.22, ease: [0.34, 1.26, 0.64, 1] }}
            className={`
              relative w-full max-w-md
              bg-white dark:bg-zinc-900
              border border-zinc-200/80 dark:border-zinc-800/80
              rounded-3xl shadow-2xl shadow-black/25 dark:shadow-black/60
              overflow-hidden
              ${colorConfig.accentBorder}
            `}
          >
            {/* Content */}
            <div className="p-7 space-y-5">
              {/* Icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.28, ease: [0.34, 1.26, 0.64, 1] }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorConfig.iconWrapper}`}
                >
                  <IconComponent size={30} className={colorConfig.iconColor} />
                </motion.div>
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  {description}
                </p>
              </div>

              {/* Audit note */}
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/70 dark:border-zinc-700/50">
                <ShieldAlert size={13} className="text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Esta acción quedará registrada en el historial de auditoría del sistema y no puede deshacerse automáticamente.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-7 pb-7 flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/60 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-150 ${
                  isLoading ? colorConfig.confirmBtnDisabled : colorConfig.confirmBtn
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>{confirmLabel}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmActionModal;
