import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, 
  Eye, EyeOff, Loader2, ShieldCheck, RefreshCw, Send, Lock,
  Check, UserCheck, Shield, CheckCircle, X, Sparkles,
  CreditCard, AtSign, Smartphone, HelpCircle, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8080/api/auth/password-reset';

const stepVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.2 } }
};


export default function PasswordResetFlow({ onBackToLogin, onSuccessNotify }) {
  const [step, setStep] = useState(1); // 1: Búsqueda, 2: OTP, 3: Nueva Contraseña
  const [searchMethod, setSearchMethod] = useState('email'); // 'email' | 'cedula'
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso 2: OTP & Animación Morphing Settigation
  // Estados de animación: 'idle' | 'swirling' | 'imploding' | 'success' | 'error_shake'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef([]);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [animStage, setAnimStage] = useState('idle');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Paso 3: Nueva Contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Contador de reenvío de OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Enfocar primera casilla al entrar al Paso 2
  useEffect(() => {
    if (step === 2 && animStage === 'idle') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Criterios de Contraseña en Tiempo Real
  const criteria = {
    length: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
  };

  const criteriaMetCount = Object.values(criteria).filter(Boolean).length;

  const strengthConfig = [
    { label: 'Muy Débil', color: 'bg-zinc-300 dark:bg-zinc-700', text: 'text-zinc-400' },
    { label: 'Débil', color: 'bg-red-500', text: 'text-red-500' },
    { label: 'Aceptable', color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Fuerte', color: 'bg-blue-500', text: 'text-blue-500' },
    { label: 'Excelente (Alta Seguridad)', color: 'bg-emerald-500', text: 'text-emerald-500' },
  ];

  const currentStrength = !newPassword ? strengthConfig[0] : strengthConfig[criteriaMetCount];

  // ── PASO 1: Solicitar Código ──────────────────────────────────────────
  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setError(searchMethod === 'email' 
        ? 'Por favor, ingrese su correo electrónico corporativo registrado.' 
        : 'Por favor, ingrese su número de cédula de ciudadanía.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/request`, { query: cleanQuery });
      setMaskedEmail(res.data.emailDestinoEnmascarado || 'su correo registrado');
      setTargetEmail(res.data.emailTarget || cleanQuery);
      if (res.data.otpCode) {
        setServerOtp(res.data.otpCode);
      }
      setOtp(['', '', '', '', '', '']);
      setStep(2);
      setResendCountdown(60);
      setAnimStage('idle');
      if (res.data.otpCode) {
        toast.success(`Código de verificación generado: ${res.data.otpCode}`, { duration: 8000 });
      } else {
        toast.success('Código de verificación de 6 dígitos enviado exitosamente.');
      }
    } catch (err) {
      console.error('Error al solicitar código:', err);
      const msg = err.response?.data?.message || err?.message || 'No se encontró ninguna cuenta asociada a estos datos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 2: Manejo de OTP y Pegado Inteligente ────────────────────────
  const processDigits = (rawText) => {
    if (!rawText) return;
    const cleanDigits = rawText.replace(/\D/g, '').slice(0, 6);
    if (cleanDigits.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      cleanDigits.split('').forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      setError('');
      const targetFocus = Math.min(cleanDigits.length, 5);
      setFocusedIndex(targetFocus);
      setTimeout(() => {
        otpInputsRef.current[targetFocus]?.focus();
      }, 50);
    }
  };

  const handlePasteData = (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    processDigits(pasteData);
  };

  const handleOtpChange = (index, value) => {
    const cleanDigits = value.replace(/\D/g, '');
    
    // Si se pegó una cadena larga directamente en una casilla
    if (cleanDigits.length > 1) {
      processDigits(cleanDigits);
      return;
    }

    if (/[^0-9]/.test(value) && value !== '') return;
    
    const newOtp = [...otp];
    newOtp[index] = cleanDigits;
    setOtp(newOtp);
    setError('');

    if (cleanDigits && index < 5) {
      setFocusedIndex(index + 1);
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        setFocusedIndex(index - 1);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setFocusedIndex(index + 1);
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // ── Coreografía de Validación Settigation (Swirl -> Implosion -> Check) ──
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Por favor, ingrese el código de verificación completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Iniciamos la fase de remolino orbital con duración coreografiada
      setAnimStage('swirling');

      // Promesa de tiempo mínimo de animación (1.5s) para que el vórtice sea visualmente impactante
      const minAnimPromise = new Promise(resolve => setTimeout(resolve, 1500));
      const apiPromise = axios.post(`${API_BASE}/verify`, { email: targetEmail, code });

      // Ejecutar verificación y animación en paralelo
      await Promise.all([minAnimPromise, apiPromise]);

      // 2. Fase de Implosión hacia el centro (0.25s)
      setAnimStage('imploding');
      await new Promise(resolve => setTimeout(resolve, 250));

      // 3. Fase de Explosión de Éxito y Checkmark SVG con resorte (1.3s)
      setAnimStage('success');
      await new Promise(resolve => setTimeout(resolve, 1300));

      // 4. Transición fluida al Paso 3 (Nueva Contraseña)
      setStep(3);
      setAnimStage('idle');
      setLoading(false);

    } catch (err) {
      console.error('Error al validar código:', err);
      // Animación de fallo: sacudida en rojo y reversión a inputs
      setAnimStage('error_shake');
      setTimeout(() => {
        setAnimStage('idle');
        setLoading(false);
        const msg = err.response?.data?.message || err?.message || 'Código de verificación incorrecto o expirado.';
        setError(msg);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      }, 550);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/request`, { query: targetEmail });
      setResendCountdown(60);
      toast.success('Nuevo código de seguridad enviado.');
    } catch (err) {
      setError('Error al reenviar el código. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 3: Restablecer Contraseña ────────────────────────────────────
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (criteriaMetCount < 3) {
      setError('La contraseña debe cumplir con los requisitos mínimos de seguridad.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifique nuevamente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE}/confirm`, {
        email: targetEmail,
        code: otp.join(''),
        newPassword
      });

      if (onSuccessNotify) {
        onSuccessNotify('¡Contraseña actualizada exitosamente! Ya puede ingresar con su nueva clave.');
      }
      onBackToLogin();
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      const msg = err.response?.data?.message || err?.message || 'Error al actualizar la contraseña.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-left">
      
      {/* Header Vibrante */}
      <div className="text-center mb-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10"
        >
          <KeyRound size={26} />
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight">
          Recuperar Contraseña
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
          Proceso guiado de seguridad y validación de identidad
        </p>
      </div>

      {/* Stepper Visual con Indicadores Numerados */}
      <div className="mb-6 px-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
          
          {/* Paso 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step >= 1 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-blue-500/20' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
            }`}>
              {step > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-600 dark:text-zinc-400 mt-1">Búsqueda</span>
          </div>

          {/* Paso 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step >= 2 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-blue-500/20' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
            }`}>
              {step > 2 ? <Check size={14} strokeWidth={3} /> : '2'}
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-600 dark:text-zinc-400 mt-1">Código OTP</span>
          </div>

          {/* Paso 3 */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 3 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-blue-500/20' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
            }`}>
              3
            </div>
            <span className="text-[0.65rem] font-bold text-zinc-600 dark:text-zinc-400 mt-1">Nueva Clave</span>
          </div>
        </div>
      </div>

      {/* Alerta de Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 mb-5 border border-red-200 dark:border-red-800 shadow-sm"
          >
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium leading-snug">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-700 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {/* ── PASO 1: Búsqueda de Cuenta ──────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Selector de Método de Búsqueda */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80">
              <button
                type="button"
                onClick={() => { setSearchMethod('email'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  searchMethod === 'email'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <AtSign size={13} /> Correo Corporativo
              </button>
              <button
                type="button"
                onClick={() => { setSearchMethod('cedula'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  searchMethod === 'cedula'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <CreditCard size={13} /> Cédula
              </button>
            </div>

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                  {searchMethod === 'email' ? 'Correo Electrónico Registrado' : 'Número de Cédula de Ciudadanía'}
                </label>
                <div className="relative">
                  {searchMethod === 'email' ? (
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  ) : (
                    <CreditCard size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  )}
                  <input
                    type={searchMethod === 'email' ? 'email' : 'text'}
                    required
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={searchMethod === 'email' ? 'nombre@ikernell.com' : 'Ej. 1020304050'}
                    className="input-field pl-11 py-3 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gradient-button w-full py-3.5 font-bold text-sm shadow-lg shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={17} className="animate-spin" /> Buscando cuenta...</>
                ) : (
                  <><Send size={16} /> Enviar Código de Verificación</>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-center text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 py-2 cursor-pointer transition-colors"
              >
                Cancelar y volver al inicio de sesión
              </button>
            </form>
          </motion.div>
        )}

        {/* ── PASO 2: Verificación OTP con Animación Settigation ───── */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Tarjeta de Destinatario */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  Código enviado a:
                </span>
                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                  {maskedEmail}
                </span>
              </div>
            </div>

            {/* Tarjeta Informativa de Código Generado (Autocompletar Directo) */}
            {serverOtp && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <KeyRound size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                      Código generado para este acceso:
                    </span>
                    <span className="font-mono text-base font-black text-amber-900 dark:text-amber-100 tracking-widest block">
                      {serverOtp}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => processDigits(serverOtp)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer shrink-0"
                >
                  Usar Código
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2 text-center">
                  Ingrese el código de 6 dígitos
                </label>
                
                {/* ── Zona de Animación Morphing Settigation ── */}
                <div 
                  className="relative min-h-[100px] flex items-center justify-center my-3 select-none"
                  onPaste={handlePasteData}
                >
                  <AnimatePresence mode="wait">
                    
                    {/* ESTADO 1: Entrada Normal / Shake de Error */}
                    {(animStage === 'idle' || animStage === 'error_shake') && (
                      <motion.div
                        key="otp-normal-inputs"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={
                          animStage === 'error_shake'
                            ? { x: [-12, 12, -8, 8, -4, 4, 0], scale: 1, opacity: 1 }
                            : { x: 0, scale: 1, opacity: 1 }
                        }
                        exit={{ opacity: 0, scale: 0.4, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center gap-2 sm:gap-2.5"
                      >
                        {otp.map((digit, idx) => {
                          const isFilled = Boolean(digit);
                          const isCurrent = focusedIndex === idx;
                          return (
                            <motion.div
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              animate={isFilled ? { scale: [1, 1.12, 1] } : {}}
                              transition={{ duration: 0.2 }}
                              className="relative"
                            >
                              <input
                                ref={(el) => (otpInputsRef.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="one-time-code"
                                maxLength={1}
                                value={digit}
                                onFocus={() => setFocusedIndex(idx)}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                onPaste={handlePasteData}
                                disabled={loading}
                                className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-black text-xl rounded-2xl border transition-all shadow-sm focus:outline-none ${
                                  isFilled
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-blue-500/10'
                                    : isCurrent
                                    ? 'border-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ring-4 ring-blue-500/15'
                                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600'
                                }`}
                              />
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* ESTADO 2: Remolino de Carga (Loader en el centro) */}
                    {animStage === 'swirling' && (
                      <motion.div
                        key="otp-loader"
                        initial={{ opacity: 0, scale: 0.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.2 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-14 h-14 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500/50 border-b-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                      </motion.div>
                    )}

                    {/* ESTADO 3: Checkmark Animado (Éxito) */}
                    {animStage === 'success' && (
                      <motion.div
                        key="otp-success"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                          <Check strokeWidth={3} size={32} />
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>

              {/* Botón Validar (Texto exacto y estado de carga pulido) */}
              <button
                type="submit"
                disabled={loading || otp.join('').length < 6 || animStage !== 'idle'}
                className={`gradient-button w-full py-3.5 font-bold text-sm shadow-lg shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 ${
                  otp.join('').length === 6 && animStage === 'idle'
                    ? 'ring-4 ring-blue-500/30 animate-pulse'
                    : ''
                }`}
              >
                {loading ? (
                  <><Loader2 size={17} className="animate-spin" /> Validando...</>
                ) : (
                  <><ShieldCheck size={16} /> Validar</>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold cursor-pointer disabled:opacity-50"
                >
                  Modificar datos
                </button>
                <button
                  type="button"
                  disabled={resendCountdown > 0 || loading}
                  onClick={handleResendOtp}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  {resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : 'Reenviar código'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── PASO 3: Definir Nueva Contraseña ────────────────────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field pl-11 pr-11 py-3 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Medidor de Fuerza Multidimensional */}
                <div className="mt-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-bold">Nivel de Seguridad:</span>
                    <span className={`font-bold ${currentStrength.text}`}>{currentStrength.label}</span>
                  </div>

                  {/* 4 Barras de Color */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((barIdx) => (
                      <div
                        key={barIdx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          criteriaMetCount >= barIdx 
                            ? currentStrength.color 
                            : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Checklist en Vivo */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[0.68rem]">
                    <span className={`flex items-center gap-1 font-medium ${criteria.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                      <CheckCircle2 size={12} className={criteria.length ? 'text-emerald-600' : 'text-zinc-300 dark:text-zinc-600'} />
                      8+ caracteres
                    </span>
                    <span className={`flex items-center gap-1 font-medium ${criteria.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                      <CheckCircle2 size={12} className={criteria.hasUpper ? 'text-emerald-600' : 'text-zinc-300 dark:text-zinc-600'} />
                      Mayúscula (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 font-medium ${criteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                      <CheckCircle2 size={12} className={criteria.hasLower ? 'text-emerald-600' : 'text-zinc-300 dark:text-zinc-600'} />
                      Minúscula (a-z)
                    </span>
                    <span className={`flex items-center gap-1 font-medium ${criteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                      <CheckCircle2 size={12} className={criteria.hasNumber ? 'text-emerald-600' : 'text-zinc-300 dark:text-zinc-600'} />
                      Número (0-9)
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Repita la nueva contraseña"
                    className={`input-field pl-11 pr-11 py-3 text-xs sm:text-sm ${
                      confirmPassword && confirmPassword === newPassword
                        ? '!border-emerald-500 !ring-2 !ring-emerald-500/20'
                        : confirmPassword && confirmPassword !== newPassword
                        ? '!border-red-500 !ring-2 !ring-red-500/20'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {confirmPassword && (
                  <p className={`text-[0.7rem] font-bold mt-1.5 flex items-center gap-1 ${
                    confirmPassword === newPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}>
                    {confirmPassword === newPassword ? (
                      <><CheckCircle2 size={12} /> Las contraseñas coinciden correctamente</>
                    ) : (
                      <><AlertCircle size={12} /> Las contraseñas no coinciden</>
                    )}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || criteriaMetCount < 3 || newPassword !== confirmPassword}
                className="gradient-button w-full py-3.5 font-bold text-sm shadow-lg shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={17} className="animate-spin" /> Actualizando contraseña...</>
                ) : (
                  <><ShieldCheck size={16} /> Confirmar y Guardar Nueva Contraseña</>
                )}
              </button>

            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
