import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, Lock, Mail, LogIn, AlertCircle, Shield, ArrowLeft, KeyRound, CheckCircle2, Loader2, UserCheck, Briefcase, Code } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState('');
  
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Redirección automática si el usuario ya cuenta con sesión activa
  React.useEffect(() => {
    if (isAuthenticated && user?.rol) {
      if (user.rol === 'COORDINADOR') navigate('/coordinador', { replace: true });
      else if (user.rol === 'LIDER') navigate('/lider', { replace: true });
      else navigate('/desarrollador', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor, ingrese su correo electrónico corporativo y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Llamada al endpoint absoluto de autenticación en Spring Boot
      const data = await authService.login(trimmedEmail, trimmedPassword);

      // 2. Actualizar el estado global en AuthContext (RNF-08 a RNF-10)
      login(data);

      // 3. Alerta de Bienvenida rápida y elegante (Toast)
      toast.success(`Bienvenido de nuevo, ${data.nombre || 'Usuario'}`, {
        duration: 3500,
        style: {
          borderRadius: '16px',
          background: '#18181b',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontWeight: '600',
          fontSize: '0.85rem'
        }
      });

      // 4. Redirección basada en el rol del usuario autenticado (RBAC)
      if (data.rol === 'COORDINADOR') {
        navigate('/coordinador', { replace: true });
      } else if (data.rol === 'LIDER') {
        navigate('/lider', { replace: true });
      } else {
        navigate('/desarrollador', { replace: true });
      }

    } catch (err) {
      console.error('[IKernell Auth Error]:', err);
      // Feedback visual obligatorio en pantalla
      setError(err.message || 'Error de autenticación. Verifique sus credenciales o la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (rolEmail, rolName) => {
    setEmail(rolEmail);
    setPassword('password123');
    setError('');
    setActiveDemo(rolName);
  };

  return (
    <div className="pt-32 pb-20 min-h-[90vh] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-lg relative animate-slide-up">
        
        {/* Glow ambient accent */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-50 pointer-events-none" />

        {/* Card: Radiant Pure White in Light Mode, Elegant Dark Zinc in Dark Mode */}
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl shadow-zinc-300/60 dark:shadow-2xl dark:shadow-black/50 transition-all duration-300">
          
          {/* Top back link */}
          <div className="mb-6 flex justify-between items-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft size={14} /> Volver al Inicio
            </Link>
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              Seguridad JWT Stateless
            </span>
          </div>

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-transform hover:scale-105">
              <Cpu size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
              Acceso al Portal
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-medium">
              Autenticación corporativa para Coordinadores, Líderes y Desarrolladores
            </p>
          </div>

          {/* Feedback Visual de Error Obligatorio */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 mb-6 font-medium border border-red-200 dark:border-red-800 shadow-sm"
              >
                <AlertCircle size={20} className="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block mb-0.5">Error de Autenticación:</span>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ingrese su correo electrónico corporativo"
                  className="input-field pl-12 py-3"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••••••"
                  className="input-field pl-12 py-3"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="gradient-button w-full py-3.5 mt-2 font-bold text-sm shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2.5">
                  <Loader2 size={18} className="animate-spin text-white dark:text-zinc-950" />
                  <span>Validando credenciales...</span>
                </span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1.5">
              <Shield size={12} /> Cifrado unidireccional BCrypt (RNF-10) • Acceso Restringido
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
