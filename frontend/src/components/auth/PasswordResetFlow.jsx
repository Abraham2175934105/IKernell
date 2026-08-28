import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, 
  Eye, EyeOff, Loader2, ShieldCheck, RefreshCw, Send, Lock,
  Check, Sparkles, UserCheck
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8080/api/auth/password-reset';

export default function PasswordResetFlow({ onBackToLogin, onSuccessNotify }) {
  const [step, setStep] = useState(1); // 1: Búsqueda, 2: OTP, 3: Nueva Contraseña
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso 2: OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef([]);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

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

  // Evaluador de Fuerza de Contraseña
  const evaluatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'No ingresada', color: 'bg-zinc-200 dark:bg-zinc-700', textColor: 'text-zinc-400', percent: 0 };
    let score = 0;
    if (pwd.length >= 8 && pwd.length <= 20) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { score, label: 'Débil', color: 'bg-red-500', textColor: 'text-red-500', percent: 25 };
    if (score <= 50) return { score, label: 'Aceptable', color: 'bg-amber-500', textColor: 'text-amber-500', percent: 50 };
    if (score <= 75) return { score, label: 'Fuerte', color: 'bg-blue-500', textColor: 'text-blue-500', percent: 75 };
    return { score, label: 'Excelente (Alta Seguridad)', color: 'bg-emerald-500', textColor: 'text-emerald-500', percent: 100 };
  };

  const strength = evaluatePasswordStrength(newPassword);

  // PASO 1: Solicitar Código
  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setError('Por favor, ingrese su Cédula, Correo Corporativo o Correo Personal.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/request`, { query: cleanQuery });
      setMaskedEmail(res.data.emailDestinoEnmascarado || 'su correo registrado');
      setTargetEmail(res.data.emailTarget || cleanQuery);
      setStep(2);
      setResendCountdown(60);
      toast.success('Código de verificación de 6 dígitos enviado exitosamente.', {
        duration: 4000,
        icon: '📩'
      });
    } catch (err) {
      console.error('Error al solicitar código:', err);
      const msg = err.response?.data?.message || err?.message || 'No se encontró ninguna cuenta asociada a este parámetro.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Manejo de OTP
  const handleOtpChange = (index, value) => {
    if (/[^0-9]/.test(value) && value !== '') return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Por favor, ingrese el código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE}/verify`, { email: targetEmail, code });
      setStep(3);
      toast.success('Código validado correctamente. Proceda a actualizar su contraseña.', {
        duration: 3500,
        icon: '✅'
      });
    } catch (err) {
      console.error('Error al verificar código:', err);
      const msg = err.response?.data?.message || 'El código de verificación es inválido o ha expirado.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/request`, { query: targetEmail });
      setResendCountdown(60);
      toast.success('Un nuevo código de 6 dígitos ha sido enviado.', { icon: '🔄' });
    } catch (err) {
      setError('Error al re-enviar el código. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Restablecer Contraseña
  const handleConfirmReset = async (e) => {
    if (e) e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifique los campos.');
      return;
    }

    if (strength.score < 100) {
      setError('La contraseña debe cumplir con todos los requisitos de seguridad (Mín. 8 caracteres, Mayúscula, Minúscula y Número).');
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

      const successMsg = '¡Contraseña actualizada de forma correcta! Ya puede iniciar sesión con su nueva clave.';
      if (onSuccessNotify) {
        onSuccessNotify(successMsg);
      } else {
        toast.success(successMsg, { duration: 4000 });
      }
      onBackToLogin();
    } catch (err) {
      console.error('Error al actualizar contraseña:', err);
      const msg = err.response?.data?.message || 'Error al actualizar la contraseña. Intente nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Botón Volver al Login */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={14} /> Volver al Inicio de Sesión
      </button>

      {/* Stepper Wizard Interactivo de 3 Pasos */}
      <div className="flex items-center justify-between mb-6 px-2">
        {[
          { num: 1, label: 'Búsqueda' },
          { num: 2, label: 'Código OTP' },
          { num: 3, label: 'Nueva Clave' }
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.num
                  ? 'bg-emerald-600 text-white shadow-md'
                  : step === s.num
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md scale-105'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
              }`}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-[0.72rem] font-extrabold hidden sm:inline ${
                step === s.num ? 'text-blue-600 dark:text-blue-400 font-black' : step > s.num ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
              }`}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                step > i + 1 ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Título & Cabecera Dinámica */}
      <div className="text-center mb-5">
        <motion.div
          key={step}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25"
        >
          {step === 1 && <UserCheck size={28} />}
          {step === 2 && <Mail size={28} />}
          {step === 3 && <ShieldCheck size={28} />}
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {step === 1 && 'Recuperación de Contraseña'}
          {step === 2 && 'Verificación de Código (OTP)'}
          {step === 3 && 'Restablecer Contraseña Definitiva'}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-medium leading-relaxed max-w-sm mx-auto">
          {step === 1 && 'Ingrese su Cédula, Correo Corporativo (@ikernell.org) o Correo Personal para solicitar un código seguro.'}
          {step === 2 && `Enviamos un código de 6 dígitos a ${maskedEmail}.`}
          {step === 3 && 'Cree una nueva contraseña con los parámetros de seguridad exigidos.'}
        </p>
      </div>

      {/* Alerta de Error Dinámica */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-5 font-medium border border-red-200 dark:border-red-800 shadow-sm"
          >
            <AlertCircle size={18} className="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Atención:</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PASO 1: Búsqueda Multi-Parámetro */}
      {step === 1 && (
        <motion.form
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 15 }}
          onSubmit={handleRequestCode}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
              Cédula, Correo Corporativo o Personal *
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ej. 1030405060 o nombre@ikernell.org"
                className="input-field pl-12 py-3 text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="gradient-button w-full py-3.5 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Buscando colaborador...</span>
              </>
            ) : (
              <>
                <span>Enviar Código de Verificación OTP</span>
                <Send size={16} />
              </>
            )}
          </button>
        </motion.form>
      )}

      {/* PASO 2: OTP 6 Dígitos */}
      {step === 2 && (
        <motion.form
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 15 }}
          onSubmit={handleVerifyOtp}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider text-center mb-3">
              Ingrese el Código OTP de 6 Dígitos
            </label>
            <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-mono font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 outline-none transition-all shadow-sm"
                />
              ))}
            </div>
            <p className="text-[0.68rem] text-center text-zinc-400 font-medium mt-2">
              Puede pegar directamente el código de 6 dígitos copiado (`Ctrl+V`).
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCountdown > 0 || loading}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={14} className={resendCountdown > 0 ? 'animate-spin' : ''} />
              {resendCountdown > 0 ? `Reenviar código en ${resendCountdown}s` : 'Reenviar código OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer font-bold"
            >
              Cambiar parámetro
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="gradient-button w-full py-3.5 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verificando código...</span>
              </>
            ) : (
              <>
                <span>Validar Código OTP</span>
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </motion.form>
      )}

      {/* PASO 3: Nueva Contraseña con Barrita de Fortaleza e Indicadores */}
      {step === 3 && (
        <motion.form
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 15 }}
          onSubmit={handleConfirmReset}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
              Nueva Contraseña Definitiva *
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••••••"
                className="input-field pl-12 pr-11 py-2.5 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Barrita Animada de Fortaleza de Contraseña */}
          {newPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-zinc-600 dark:text-zinc-400 uppercase text-[0.65rem] tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-blue-500" /> Nivel de Fortaleza
                </span>
                <span className={`${strength.textColor} text-[0.7rem]`}>{strength.label}</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.percent}%` }}
                  transition={{ duration: 0.35 }}
                  className={`h-full ${strength.color}`}
                />
              </div>

              {/* Checklist de Criterios Exigidos */}
              <div className="grid grid-cols-2 gap-1.5 text-[0.68rem] font-bold">
                <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 && newPassword.length <= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                  <CheckCircle2 size={13} className={newPassword.length >= 8 && newPassword.length <= 20 ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'} />
                  <span>8-20 Caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                  <CheckCircle2 size={13} className={/[A-Z]/.test(newPassword) ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'} />
                  <span>1 Mayúscula (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                  <CheckCircle2 size={13} className={/[a-z]/.test(newPassword) ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'} />
                  <span>1 Minúscula (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                  <CheckCircle2 size={13} className={/[0-9]/.test(newPassword) ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'} />
                  <span>1 Número (0-9)</span>
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••••••"
                className="input-field pl-12 pr-11 py-2.5 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[0.65rem] text-red-500 font-bold mt-1">
                Las contraseñas no coinciden.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || strength.score < 100 || newPassword !== confirmPassword}
            className="gradient-button w-full py-3.5 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Actualizando contraseña...</span>
              </>
            ) : (
              <>
                <span>Actualizar Contraseña Definitiva</span>
                <ShieldCheck size={18} />
              </>
            )}
          </button>
        </motion.form>
      )}
    </div>
  );
}
