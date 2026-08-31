import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShieldAlert, AlertTriangle, X, Check, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LogoutConfirmModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getInitials = (nombre, apellido) => {
    const n = (nombre || '').trim();
    const a = (apellido || '').trim();
    if (!n && !a) return 'US';
    return `${n[0] || ''}${a[0] || ''}`.toUpperCase();
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    
    // Si el usuario marcó "No volver a recordar", guardar en localStorage
    if (dontAskAgain) {
      try {
        localStorage.setItem('ikernell_skip_logout_confirm', 'true');
      } catch (e) {
        console.error('Error guardando preferencia de logout:', e);
      }
    }

    try {
      await logout();
      toast.success('Sesión finalizada correctamente. Acceso revocado.', {
        duration: 3500
      });
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 relative"
        >
          {/* Icono de Alerta de Seguridad & Cabecera */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10 shrink-0">
              <ShieldAlert size={26} />
            </div>
            <div className="space-y-1 pr-6">
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                ¿Está seguro de que desea cerrar sesión?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Se invalidará su token JWT en el servidor y se protegerán sus datos corporativos.
              </p>
            </div>
          </div>

          {/* Tarjeta de Sesión Activa del Usuario */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(user.nombre, user.apellido)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {user.nombre ? `${user.nombre} ${user.apellido || ''}` : user.email}
                </div>
                <div className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 truncate">
                  {user.email || 'Sesión activa'} • <span className="font-bold text-blue-600 dark:text-blue-400">{user.rol || 'USUARIO'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Información de Seguridad Adicional */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-[0.72rem] text-amber-800 dark:text-amber-300 font-medium">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              Para volver a ingresar, deberá digitar nuevamente sus credenciales autorizadas.
            </span>
          </div>

          {/* Checkbox "No volver a recordar" */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all ${
                    dontAskAgain
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500'
                  }`}
                >
                  {dontAskAgain && <Check size={13} strokeWidth={3} />}
                </div>
              </div>
              <div className="text-xs text-zinc-700 dark:text-zinc-300">
                <span className="font-bold block">No volver a mostrar esta confirmación</span>
                <span className="text-[0.68rem] text-zinc-500 dark:text-zinc-400">
                  Cerrar sesión directamente al presionar el botón en futuros accesos.
                </span>
              </div>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoggingOut}
              className="outline-button text-xs py-2.5 px-4 font-bold cursor-pointer transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="danger-button text-xs py-2.5 px-5 font-black inline-flex items-center gap-2 shadow-md hover:shadow-red-600/20 cursor-pointer disabled:opacity-50"
            >
              <LogOut size={14} />
              <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
