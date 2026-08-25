import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Lock, Mail, User, Briefcase, Award, 
  Eye, EyeOff, Sparkles, CheckCircle2, AlertTriangle, Loader2 
} from 'lucide-react';

export const PrimerLoginModal = () => {
  const { user, login } = useAuth();
  const api = useApi();

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    identificacion: user?.identificacion || '',
    emailPersonal: user?.emailPersonal || '',
    profesion: user?.profesion || '',
    especialidad: user?.especialidad || '',
    nuevaPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Requisitos algorítmicos de la contraseña
  const passwordValidations = {
    length: form.nuevaPassword.length >= 8 && form.nuevaPassword.length <= 20,
    uppercase: /[A-Z]/.test(form.nuevaPassword),
    lowercase: /[a-z]/.test(form.nuevaPassword),
    number: /[0-9]/.test(form.nuevaPassword)
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  // Generador de clave segura aleatoria
  const handleGenerarPasswordDefinitiva = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';

    let pass = '';
    pass += uppers.charAt(Math.floor(Math.random() * uppers.length));
    pass += lowers.charAt(Math.floor(Math.random() * lowers.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += symbols.charAt(Math.floor(Math.random() * symbols.length));

    const all = uppers + lowers + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      pass += all.charAt(Math.floor(Math.random() * all.length));
    }

    // Mezclar aleatoriamente los caracteres
    const shuffled = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setForm(prev => ({ ...prev, nuevaPassword: shuffled }));
    toast.success('Contraseña definitiva generada automáticamente.', { duration: 2500 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.apellido.trim() || !form.identificacion.trim()) {
      toast.error('Nombres, Apellidos y Cédula son obligatorios.');
      return;
    }

    if (!isPasswordValid) {
      toast.error('La nueva contraseña debe cumplir con todos los criterios de seguridad.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        idTrabajador: user.idTrabajador || user.id,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        identificacion: form.identificacion.trim(),
        emailPersonal: form.emailPersonal.trim(),
        profesion: form.profesion.trim(),
        especialidad: form.especialidad.trim(),
        nuevaPassword: form.nuevaPassword.trim()
      };

      const res = await api.post('/auth/completar-primer-login', payload);

      toast.success('¡Verificación exitosa! Tu perfil y contraseña han sido actualizados.', { duration: 4000 });

      // Actualizar el estado de sesión global sin cerrar sesión
      login({
        ...user,
        ...res,
        primerLogin: false,
        token: user.token
      });
    } catch (err) {
      console.error('Error al completar primer login:', err);
      toast.error(err?.message || 'Error al guardar la verificación de datos.');
    } finally {
      setSubmitting(false);
    }
  };

  // Solo se renderiza si el usuario en sesión tiene primerLogin = true
  if (!user || !user.primerLogin) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 my-8"
      >
        {/* Cabecera del Modal de Primer Acceso */}
        <div className="flex items-center gap-3.5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Primer Inicio de Sesión
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
              Verificación de Datos y Configuración de Clave
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Es necesario corroborar tu información corporativa y definir tu contraseña definitiva para activar tu acceso.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Banner Informativo */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-1 text-blue-900 dark:text-blue-200">
            <strong className="block font-black text-xs">
              Paso Obligatorio de Seguridad Corporativa
            </strong>
            <p className="text-[0.72rem] leading-relaxed">
              Verifique que todos sus datos estén correctos. Su <strong>Correo Electrónico Corporativo</strong> es inalterable. Los demás campos pueden ser ajustados antes de establecer su contraseña definitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombres */}
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                Nombres del Colaborador *
              </label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="input-field w-full py-2.5 text-xs font-semibold"
              />
            </div>

            {/* Apellidos */}
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                Apellidos del Colaborador *
              </label>
              <input
                type="text"
                required
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                className="input-field w-full py-2.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cédula / Identificación */}
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                Cédula / Identificación *
              </label>
              <input
                type="text"
                required
                value={form.identificacion}
                onChange={(e) => setForm({ ...form, identificacion: e.target.value })}
                className="input-field w-full py-2.5 text-xs font-mono font-bold"
              />
            </div>

            {/* Correo Corporativo (INMUTABLE / READ ONLY) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                  Correo Electrónico Corporativo
                </label>
                <span className="text-[0.65rem] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Lock size={12} /> Inmutable
                </span>
              </div>
              <input
                type="email"
                disabled
                readOnly
                value={user?.email || ''}
                className="input-field w-full py-2.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 cursor-not-allowed border-dashed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Correo Personal / Alternativo */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                Correo Electrónico Personal / Alternativo
              </label>
              <input
                type="email"
                value={form.emailPersonal}
                onChange={(e) => setForm({ ...form, emailPersonal: e.target.value })}
                className="input-field w-full py-2.5 text-xs font-semibold"
                placeholder="Ej. usuario.personal@gmail.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profesión */}
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                Profesión / Titulación
              </label>
              <input
                type="text"
                value={form.profesion}
                onChange={(e) => setForm({ ...form, profesion: e.target.value })}
                className="input-field w-full py-2.5 text-xs font-semibold"
                placeholder="Ingeniero de Sistemas"
              />
            </div>

            {/* Especialidad */}
            <div className="space-y-1">
              <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                Especialidad Principal
              </label>
              <input
                type="text"
                value={form.especialidad}
                onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                className="input-field w-full py-2.5 text-xs font-semibold"
                placeholder="Full Stack Java & React"
              />
            </div>
          </div>

          {/* Sección: Configuración de Nueva Contraseña Definitiva */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                  Configuración de Nueva Contraseña Definitiva *
                </h4>
                <p className="text-[0.68rem] text-zinc-500 font-medium">
                  Reemplazará la clave temporal recibida por correo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerarPasswordDefinitiva}
                className="py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-[0.68rem] font-extrabold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles size={13} /> Generar Clave Segura
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.nuevaPassword}
                onChange={(e) => setForm({ ...form, nuevaPassword: e.target.value })}
                className="input-field w-full py-2.5 pr-10 text-xs font-mono font-bold"
                placeholder="Ingrese su nueva contraseña (8 a 20 caracteres)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Checklist de Criterios de Seguridad */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[0.68rem] font-bold">
              <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${passwordValidations.length ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-zinc-50 text-zinc-400 border-zinc-200 dark:bg-zinc-800/40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passwordValidations.length ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span>8 a 20 Caracteres</span>
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${passwordValidations.uppercase ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-zinc-50 text-zinc-400 border-zinc-200 dark:bg-zinc-800/40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passwordValidations.uppercase ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span>1 Mayúscula (A-Z)</span>
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${passwordValidations.lowercase ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-zinc-50 text-zinc-400 border-zinc-200 dark:bg-zinc-800/40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passwordValidations.lowercase ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span>1 Minúscula (a-z)</span>
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${passwordValidations.number ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-zinc-50 text-zinc-400 border-zinc-200 dark:bg-zinc-800/40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passwordValidations.number ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                <span>1 Número (0-9)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !isPasswordValid}
              className="gradient-button text-xs py-3 px-6 font-extrabold inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Guardando Verificación...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Confirmar Datos y Establecer Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
