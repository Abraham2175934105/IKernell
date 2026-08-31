import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, ShieldCheck, Key, Lock, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Loader2, Briefcase,
  GraduationCap, Building2, Calendar, MapPin, Check,
  RefreshCw, Sparkles, CheckCircle, Info, ArrowRight, ShieldAlert, Cpu
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.25, 0.1, 0.25, 1.0],
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export const PerfilPage = () => {
  const { user } = useAuth();
  const api = useApi();

  const [profileData, setProfileData] = useState(user || {});
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Estado para desplegar el menú de cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Estados del Formulario de Cambio de Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccessAlert, setPasswordSuccessAlert] = useState(false);
  const [hasSkipLogoutConfirm, setHasSkipLogoutConfirm] = useState(false);

  useEffect(() => {
    setHasSkipLogoutConfirm(localStorage.getItem('ikernell_skip_logout_confirm') === 'true');
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get('/api/auth/perfil');
      if (res.data) {
        setProfileData(res.data);
      }
    } catch (e) {
      if (user) setProfileData(user);
    } finally {
      setLoadingProfile(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setPasswordError('');
    setShowPasswordForm(false);
  };

  // Requisitos de seguridad de la nueva contraseña
  const passwordRequirements = {
    length: newPassword.length >= 8 && newPassword.length <= 20,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
    different: newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword
  };

  // Nivel de Seguridad de la Contraseña (Strength Meter)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Sin ingresar', color: 'bg-zinc-200 dark:bg-zinc-700', textColor: 'text-zinc-400', badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 15;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[a-z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 10;

    if (score <= 35) {
      return { score: Math.max(score, 15), label: 'Débil', color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400', badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800' };
    } else if (score <= 65) {
      return { score, label: 'Aceptable', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    } else if (score <= 85) {
      return { score, label: 'Segura', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    } else {
      return { score: 100, label: 'Muy Segura (Criptográfica)', color: 'bg-blue-600', textColor: 'text-blue-600 dark:text-blue-400', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    }
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Estado que determina si el usuario está realizando la edición de su clave y no ha guardado
  const isEditingPassword = showPasswordForm && (currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0);

  const isPasswordFormValid =
    currentPassword.trim().length > 0 &&
    passwordRequirements.length &&
    passwordRequirements.upper &&
    passwordRequirements.lower &&
    passwordRequirements.number &&
    passwordRequirements.match &&
    passwordRequirements.different;

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword.trim()) {
      setPasswordError('Debe ingresar su contraseña actual.');
      return;
    }

    if (!passwordRequirements.length || !passwordRequirements.upper || !passwordRequirements.lower || !passwordRequirements.number) {
      setPasswordError('La nueva contraseña no cumple con los requisitos mínimos de seguridad.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('La nueva contraseña no puede ser idéntica a la contraseña actual.');
      return;
    }

    setSubmittingPassword(true);

    try {
      const payload = {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      };

      const res = await api.post('/api/auth/cambiar-password', payload);

      if (res.status === 200 || res.data?.message) {
        toast.success('Contraseña actualizada exitosamente. Sus credenciales han sido renovadas.');
        setPasswordSuccessAlert(true);
        resetPasswordForm();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al actualizar la contraseña. Verifique que la contraseña actual sea la correcta.';
      setPasswordError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmittingPassword(false);
    }
  };

  const getInitials = (nombre, apellido) => {
    const n = (nombre || '').trim();
    const a = (apellido || '').trim();
    if (!n && !a) return 'IK';
    return `${n[0] || ''}${a[0] || ''}`.toUpperCase();
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'COORDINADOR':
        return {
          label: 'Coordinador General',
          badgeText: 'COORDINADOR',
          classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      case 'LIDER':
        return {
          label: 'Líder de Proyecto',
          badgeText: 'LÍDER DE PROYECTO',
          classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        };
      default:
        return {
          label: 'Desarrollador de Software',
          badgeText: 'DESARROLLADOR',
          classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
    }
  };

  const roleInfo = getRoleBadge(profileData?.rol || user?.rol);

  return (
    <DashboardLayout
      hasUnsavedChanges={isEditingPassword}
      onCancelUnsavedChanges={resetPasswordForm}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Cabecera Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              PANEL DE USUARIO • Credenciales & Gobernanza
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              Mi Perfil & Seguridad
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Gestión centralizada de identidad, especialidades técnicas y actualización de credenciales criptográficas
            </p>
          </div>

          <button
            type="button"
            onClick={cargarPerfil}
            className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 self-start sm:self-auto rounded-xl"
          >
            <RefreshCw size={14} className={loadingProfile ? 'animate-spin' : ''} />
            <span>Sincronizar Datos</span>
          </button>
        </div>

        {passwordSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 backdrop-blur-md text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-black uppercase tracking-wide">
                  Contraseña Actualizada Correctamente
                </strong>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  La nueva clave criptográfica ha sido validada y persistida en el servidor.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasswordSuccessAlert(false)}
              className="text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:underline cursor-pointer"
            >
              Entendido
            </button>
          </motion.div>
        )}

        {/* Grid de Contenido de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA (7 COLS): INFORMACIÓN DEL USUARIO       */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-5">

            {/* Tarjeta 1: Resumen de Identidad & Rol Corporativo */}
            <motion.div variants={cardVariants} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                    {getInitials(profileData?.nombre, profileData?.apellido)}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                      <span>{profileData?.nombre ? `${profileData.nombre} ${profileData.apellido || ''}` : 'Usuario Registrado'}</span>
                      <span className={`text-[0.62rem] font-black uppercase px-2.5 py-0.5 rounded-lg border ${roleInfo.classes}`}>
                        {roleInfo.badgeText}
                      </span>
                    </h3>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mt-0.5 flex items-center gap-1">
                      <Briefcase size={12} className="text-blue-500" />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cuenta Activa
                </span>
              </div>
            </motion.div>

            {/* Tarjeta 2: Identificación Oficial & Contacto */}
            <motion.div variants={cardVariants} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <User size={16} className="text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Identificación Oficial & Canales de Contacto
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Cédula */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                  <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <Shield size={12} className="text-blue-500" />
                    Cédula / Documento de Identidad
                  </span>
                  <div className="font-mono font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {profileData?.identificacion || 'No registrado'}
                  </div>
                  <span className="text-[0.62rem] text-zinc-500 dark:text-zinc-400">Documento oficial verificado en sistema</span>
                </div>

                {/* Profesión */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                  <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <Building2 size={12} className="text-blue-500" />
                    Profesión / Ocupación Registrada
                  </span>
                  <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200 truncate">
                    {profileData?.profesion || 'Ingeniero de Software'}
                  </div>
                  <span className="text-[0.62rem] text-zinc-500 dark:text-zinc-400">Cargo técnico asignado en plataforma</span>
                </div>

                {/* Correo Corporativo Oficial */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1 sm:col-span-2">
                  <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <Mail size={12} className="text-blue-500" />
                    Correo Corporativo Oficial (@IKernell)
                  </span>
                  <div className="font-mono font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {profileData?.email || 'Sin correo asignado'}
                  </div>
                  <span className="text-[0.62rem] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Lock size={10} /> Identidad corporativa inmutable de inicio de sesión
                  </span>
                </div>

                {/* Correo Personal de Respaldo */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1 sm:col-span-2">
                  <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Correo Personal de Respaldo
                  </span>
                  <div className="font-mono font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {profileData?.emailPersonal || (profileData?.email?.includes('@') ? `${profileData.email.split('@')[0]}.personal@gmail.com` : 'usuario.personal@gmail.com')}
                  </div>
                  <span className="text-[0.62rem] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check size={10} /> Canal secundario verificado para recuperación de acceso
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Tarjeta 3: Especialidad */}
            <motion.div variants={cardVariants} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Especialidad & Competencias
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                    Especialidad Principal
                  </span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {profileData?.especialidad || 'Desarrollo Frontend & Aplicaciones Móviles • [React.js, TypeScript, Tailwind CSS, REST APIs, Git & GitHub, UI/UX Design]'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA (5 COLS): DESPLEGABLE DE CAMBIO DE CLAVE  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5">
            <motion.div variants={cardVariants} className="sticky top-24 space-y-4">
              
              {!showPasswordForm ? (
                /* ACCESO DESPLEGABLE AL MENÚ DE CONTRASEÑA */
                <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
                      <Key size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Cambiar Contraseña
                      </h3>
                      <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-medium">
                        Actualice su clave de acceso validando su credencial actual
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-500" /> Estado de Credenciales:
                      </span>
                      <span className="text-[0.68rem] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        Cifradas JWT
                      </span>
                    </div>
                    <p className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      Haga clic en el botón inferior para desplegar el formulario seguro de actualización de clave.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Lock size={16} />
                    <span>Cambiar Contraseña</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                /* FORMULARIO DESPLEGADO DE CAMBIO DE CONTRASEÑA */
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 shadow-xl space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
                          <Key size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Cambiar Contraseña
                          </h3>
                          <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-medium">
                            Formulario activo de renovación de credenciales
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={resetPasswordForm}
                        className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Cancelar y Ocultar Formulario"
                      >
                        Ocultar ×
                      </button>
                    </div>

                    {passwordError && (
                      <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                        <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    <form onSubmit={handleCambiarPassword} className="space-y-4 text-xs" noValidate>
                      
                      {/* 1. Contraseña Actual */}
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
                          Contraseña Actual *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Ingrese su contraseña actual"
                            className="input-field w-full py-2.5 pl-3.5 pr-10 text-xs font-mono font-medium rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            title={showCurrentPass ? 'Ocultar' : 'Mostrar'}
                          >
                            {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* 2. Nueva Contraseña */}
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
                          Nueva Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nueva contraseña (8-20 caracteres)"
                            className="input-field w-full py-2.5 pl-3.5 pr-10 text-xs font-mono font-medium rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            title={showNewPass ? 'Ocultar' : 'Mostrar'}
                          >
                            {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Medidor del Nivel de Seguridad de la Contraseña (Strength Meter) */}
                      {newPassword.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2"
                        >
                          <div className="flex items-center justify-between text-[0.68rem] font-bold">
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Nivel de Seguridad de la Contraseña:
                            </span>
                            <span className={`px-2 py-0.5 rounded-md font-mono text-[0.65rem] ${passwordStrength.badgeClass}`}>
                              {passwordStrength.label} ({passwordStrength.score}%)
                            </span>
                          </div>

                          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength.score}%` }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className={`h-full rounded-full ${passwordStrength.color}`}
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* 3. Confirmar Nueva Contraseña */}
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
                          Confirmar Nueva Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPass ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita la nueva contraseña"
                            className="input-field w-full py-2.5 pl-3.5 pr-10 text-xs font-mono font-medium rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            title={showConfirmPass ? 'Ocultar' : 'Mostrar'}
                          >
                            {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Requisitos Dinámicos de Seguridad */}
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                        <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                          Validación de Seguridad en Tiempo Real
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[0.68rem]">
                          <div className={`flex items-center gap-1.5 font-medium ${passwordRequirements.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                            <Check size={12} className={passwordRequirements.length ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'} />
                            <span>8 a 20 caracteres</span>
                          </div>

                          <div className={`flex items-center gap-1.5 font-medium ${passwordRequirements.upper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                            <Check size={12} className={passwordRequirements.upper ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'} />
                            <span>Al menos 1 mayúscula</span>
                          </div>

                          <div className={`flex items-center gap-1.5 font-medium ${passwordRequirements.lower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                            <Check size={12} className={passwordRequirements.lower ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'} />
                            <span>Al menos 1 minúscula</span>
                          </div>

                          <div className={`flex items-center gap-1.5 font-medium ${passwordRequirements.number ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                            <Check size={12} className={passwordRequirements.number ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'} />
                            <span>Al menos 1 número</span>
                          </div>

                          <div className={`flex items-center gap-1.5 font-medium ${passwordRequirements.different ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                            <Check size={12} className={passwordRequirements.different ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'} />
                            <span>Diferente de actual</span>
                          </div>

                          <div className={`flex items-center gap-1.5 font-medium ${passwordRequirements.match ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                            <Check size={12} className={passwordRequirements.match ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'} />
                            <span>Coinciden exactamente</span>
                          </div>
                        </div>
                      </div>

                      {/* Botones del Formulario */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={resetPasswordForm}
                          disabled={submittingPassword}
                          className="w-1/3 py-3 px-3 rounded-2xl outline-button font-bold text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          disabled={submittingPassword || !isPasswordFormValid}
                          className="w-2/3 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                        >
                          {submittingPassword ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              <span>Guardando...</span>
                            </>
                          ) : (
                            <>
                              <Key size={15} />
                              <span>Actualizar Contraseña</span>
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </motion.div>
                </AnimatePresence>
              )}

            </motion.div>
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default PerfilPage;
