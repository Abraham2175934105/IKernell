import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Mail, ArrowLeft, ShieldCheck, Cpu,
  AlertCircle, Eye, EyeOff, Loader2, LogIn, Shield,
  KeyRound, Users, CheckCircle2, Sparkles, UserCheck, X,
  HelpCircle, MessageSquare, ArrowRight, ShieldAlert, FileText
} from 'lucide-react';
import PasswordResetFlow from '../../components/auth/PasswordResetFlow';

const springTransition = { type: "spring", stiffness: 380, damping: 26 };

/* ────────────────────────────────────────────────────────────────────────
   Fondo Dinámico Ultra-Avanzado de Ciberseguridad para el Login
──────────────────────────────────────────────────────────────────────── */
const AdvancedLoginBackground = () => {
  // Nodos de Red Neuronal & Constelación de Criptografía
  const nodes = [
    { x: 12, y: 18, size: 4, dur: 6, delay: 0 },
    { x: 28, y: 75, size: 5, dur: 8, delay: 1.2 },
    { x: 82, y: 22, size: 4.5, dur: 7, delay: 0.5 },
    { x: 88, y: 80, size: 6, dur: 9, delay: 2 },
    { x: 20, y: 45, size: 3.5, dur: 6.5, delay: 1.8 },
    { x: 78, y: 55, size: 5, dur: 8.5, delay: 0.8 },
    { x: 48, y: 12, size: 4, dur: 7.5, delay: 2.2 },
    { x: 52, y: 88, size: 4, dur: 6.8, delay: 1.5 },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Malla Blueprint & Matrix Cuadriculada de Alta Precisión */}
      <div 
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3b82f6 1px, transparent 1px),
            linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Gradientes Radiales de Resplandor Neón Líquido (Optimizado con GPU acceleration) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 via-indigo-600/15 to-transparent dark:from-blue-600/25 dark:via-cyan-500/20 rounded-full blur-3xl transform-gpu"
      />

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute -bottom-32 -right-20 w-[480px] h-[480px] bg-gradient-to-tl from-cyan-400/20 via-blue-600/15 to-transparent dark:from-indigo-600/20 dark:via-blue-600/15 rounded-full blur-3xl transform-gpu"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/15 via-blue-500/10 to-transparent dark:from-cyan-400/15 dark:via-blue-600/10 rounded-full blur-3xl transform-gpu"
      />

      {/* 3. Rayos de Escaneo de Datos Láser */}
      <motion.div
        animate={{
          y: ['-100%', '200%'],
          opacity: [0, 0.7, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/4 w-[1px] h-48 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent transform-gpu"
      />
      <motion.div
        animate={{
          y: ['-100%', '200%'],
          opacity: [0, 0.7, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3.5 }}
        className="absolute right-1/3 w-[1px] h-56 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent transform-gpu"
      />

      {/* 4. Nodos de Criptografía con Ondas de Pulso */}
      {nodes.map((node, i) => (
        <div 
          key={i} 
          className="absolute"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          {/* Anillo de pulso exterior */}
          <motion.div
            animate={{
              scale: [1, 2.4, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: node.dur,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut"
            }}
            className="absolute -inset-2 rounded-full border border-blue-500/30 dark:border-cyan-400/40"
          />

          {/* Núcleo brillante */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{
              duration: node.dur * 0.8,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut"
            }}
            className="rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
            style={{ width: node.size, height: node.size }}
          />
        </div>
      ))}

      {/* 5. Emblema de Escudo Holográfico Gigante de Fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.015] dark:opacity-[0.035] flex items-center justify-center pointer-events-none">
        <Shield size={650} strokeWidth={0.6} className="text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  );
};

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Redirección automática si el usuario ya cuenta con sesión activa
  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      if (user.rol === 'COORDINADOR') navigate(ROUTES.COORDINADOR, { replace: true });
      else if (user.rol === 'LIDER') navigate(ROUTES.LIDER, { replace: true });
      else navigate(ROUTES.DESARROLLADOR, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor, ingrese su correo electrónico corporativo y contraseña.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authService.login(trimmedEmail, trimmedPassword);

      login(data);

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

      if (data.rol === 'COORDINADOR') {
        navigate(ROUTES.COORDINADOR, { replace: true });
      } else if (data.rol === 'LIDER') {
        navigate(ROUTES.LIDER, { replace: true });
      } else {
        navigate(ROUTES.DESARROLLADOR, { replace: true });
      }

    } catch (err) {
      console.error('[IKernell Auth Error]:', err);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setError(err.message || 'Error de autenticación. Verifique sus credenciales o la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-32 pb-20 min-h-[95vh] flex flex-col items-center justify-center px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-hidden">
      
      {/* ── Fondo Ultra-Avanzado con Ciber-Malla, Orbes y Nodos ── */}
      <AdvancedLoginBackground />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Glow ambient accent envolvente */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-cyan-500/25 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

        {/* Tarjeta Principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl transition-all duration-300"
        >

          {/* Top navigation */}
          <div className="mb-6 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={14} /> Volver al Inicio
            </Link>
            <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ShieldCheck size={11} /> Acceso Seguro
            </span>
          </div>

          {isResetMode ? (
            <PasswordResetFlow
              onBackToLogin={() => setIsResetMode(false)}
              onSuccessNotify={(msg) => toast.success(msg)}
            />
          ) : (
            <>
              {/* Logo & Header */}
              <div className="text-center mb-8">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={springTransition}
                  className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10"
                >
                  <Cpu size={28} />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight mb-1.5">
                  Acceso al Portal
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-medium">
                  Autenticación corporativa para Coordinadores, Líderes y Desarrolladores
                </p>
              </div>

              {/* Alerta de Error con Sacudida y Botón de Descarte */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 mb-5 font-medium border border-red-200 dark:border-red-800 shadow-sm"
                  >
                    <AlertCircle size={17} className="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1 text-left">
                      <strong className="block mb-0.5">Error de Autenticación</strong>
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError('')}
                      className="text-red-400 hover:text-red-700 transition-colors p-0.5 cursor-pointer"
                      title="Cerrar alerta"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario Principal */}
              <motion.form 
                onSubmit={handleLogin} 
                className="flex flex-col gap-4 text-left"
                animate={isShaking ? { x: [-4, 4, -4, 4, -2, 2, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                    Correo Electrónico Corporativo
                  </label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="nombre@ikernell.com"
                      className="input-field pl-11 py-3 text-xs sm:text-sm"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••••••"
                      className="input-field pl-11 pr-11 py-3 text-xs sm:text-sm"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-button w-full py-3.5 mt-2 font-bold text-sm shadow-lg shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2.5">
                      <Loader2 size={18} className="animate-spin text-white" />
                      <span>Validando credenciales...</span>
                    </span>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <LogIn size={18} />
                    </>
                  )}
                </button>
              </motion.form>

              {/* Footer Limpio y Organizado */}
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <p className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1.5">
                  <Shield size={13} className="text-blue-600 dark:text-blue-400" /> Sesión protegida con cifrado y validación de token JWT
                </p>
              </div>
            </>
          )}

        </motion.div>
      </div>
    </div>
  );
};
