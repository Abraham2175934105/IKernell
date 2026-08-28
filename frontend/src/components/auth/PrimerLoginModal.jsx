import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, Mail, User, Briefcase, Award, 
  Eye, EyeOff, Sparkles, CheckCircle2, AlertTriangle, Loader2, Edit3, ArrowRight, ArrowLeft, Check, Shield, Save, Code2, Plus, X, Cloud, LogOut
} from 'lucide-react';

// Listados Estandarizados & Formales para Perfil Profesional
const TITULACIONES_PROFESIONALES = [
  'Ingeniero(a) de Software',
  'Ingeniero(a) de Sistemas',
  'Ingeniero(a) Informático(a)',
  'Ingeniero(a) de Computación',
  'Tecnólogo(a) en Desarrollo de Software',
  'Tecnólogo(a) en Análisis y Desarrollo de Sistemas (ADSI/ADSO)',
  'Licenciado(a) en Ciencias de la Computación',
  'Arquitecto(a) de Software & Soluciones',
  'Ingeniero(a) de Telecomunicaciones & Redes',
  'Ingeniero(a) de Datos & Inteligencia Artificial',
  'Especialista en Ciberseguridad & Seguridad de la Información',
  'Diseñador(a) UX/UI & Experiencia de Usuario',
  'Magíster / Especialista en TI'
];

const ESPECIALIDADES_PRINCIPALES = [
  'Desarrollo Backend & Java / Spring Boot',
  'Desarrollo Frontend & React.js / TypeScript',
  'Desarrollo Full Stack Web (Java & React)',
  'Arquitectura Cloud & DevOps (AWS / Docker / K8s)',
  'Ingeniería de Datos & PostgreSQL / SQL',
  'QA, Testing & Automatización de Pruebas',
  'Ciberseguridad & Auditoría de Código',
  'Desarrollo Mobile (React Native / iOS / Android)',
  'Inteligencia Artificial & Machine Learning',
  'Gestión de Proyectos WBS & Scrum Master',
  'UI/UX Design & Design Systems',
  'Microservicios & Arquitectura Distribuida'
];

export const PrimerLoginModal = () => {
  const { user, login, logout } = useAuth();
  const api = useApi();

  // Función para cancelar operación y salir / cerrar sesión
  const handleCancelarOperacion = () => {
    if (window.confirm('¿Está seguro de que desea cancelar la verificación? Se cerrará la sesión actual.')) {
      logout();
      toast.success('Operación cancelada. Sesión cerrada.');
    }
  };

  // Estado de flujo de 2 Pasos (Paso 1: Verificación de Datos | Paso 2: Cambio de Clave)
  const [paso, setPaso] = useState(1);

  // Estados de edición independiente por cuadro en Paso 1
  const [editPersonal, setEditPersonal] = useState(false);
  const [editProfesional, setEditProfesional] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    identificacion: '',
    emailPersonal: '',
    profesion: '',
    especialidad: '',
    habilidades: [],
    nuevaPassword: '',
    confirmarPassword: ''
  });

  // Estado de alerta en nube flotante para la contraseña generada
  const [showCloudAlert, setShowCloudAlert] = useState(false);

  // Estados de validación en tiempo real de duplicados
  const [validatingUniqueness, setValidatingUniqueness] = useState(false);
  const [cedulaDuplicada, setCedulaDuplicada] = useState(false);
  const [emailPersonalDuplicado, setEmailPersonalDuplicado] = useState(false);

  // Parsear especialidad al recibir datos del usuario
  useEffect(() => {
    if (user) {
      let profesionVal = user.profesion || '';
      let especialidadVal = user.especialidad || '';
      let skillsParsed = [];

      if (especialidadVal.includes('• [')) {
        const parts = especialidadVal.split('• [');
        especialidadVal = parts[0].trim();
        const skillsStr = parts[1].replace(']', '').trim();
        if (skillsStr) {
          skillsParsed = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (especialidadVal.includes('[')) {
        const parts = especialidadVal.split('[');
        especialidadVal = parts[0].trim();
        const skillsStr = parts[1].replace(']', '').trim();
        if (skillsStr) {
          skillsParsed = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      setForm(prev => ({
        ...prev,
        nombre: user.nombre || prev.nombre || '',
        apellido: user.apellido || prev.apellido || '',
        identificacion: user.identificacion || prev.identificacion || '',
        emailPersonal: user.emailPersonal || prev.emailPersonal || '',
        profesion: profesionVal || 'Líder de Proyectos & Tech Lead',
        especialidad: especialidadVal || 'Gestión de Proyectos WBS & Arquitectura',
        habilidades: skillsParsed.length > 0 ? skillsParsed : ['Scrum Master', 'Gestión de Proyectos', 'Planificación WBS']
      }));
    }
  }, [user]);

  // Validación de Unicidad en Tiempo Real contra el Servidor Backend
  useEffect(() => {
    let active = true;
    const checkUniqueness = async () => {
      if (!form.identificacion.trim() && !form.emailPersonal.trim()) return;
      setValidatingUniqueness(true);
      try {
        const queryParams = new URLSearchParams();
        if (form.identificacion.trim()) queryParams.append('cedula', form.identificacion.trim());
        if (form.emailPersonal.trim()) queryParams.append('emailPersonal', form.emailPersonal.trim());
        if (user?.idTrabajador || user?.id) queryParams.append('idExcluir', user.idTrabajador || user.id);

        const res = await api.get(`/auth/validar-unicidad?${queryParams.toString()}`);
        if (active && res) {
          setCedulaDuplicada(Boolean(res.cedulaDuplicada));
          setEmailPersonalDuplicado(Boolean(res.emailPersonalDuplicado));
        }
      } catch (err) {
        console.error('Error al validar unicidad:', err);
      } finally {
        if (active) setValidatingUniqueness(false);
      }
    };

    const timer = setTimeout(checkUniqueness, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.identificacion, form.emailPersonal, user]);

  // Validación de formato de correo personal RFC 5322
  const isEmailPersonalFormatValid = useMemo(() => {
    if (!form.emailPersonal.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailPersonal.trim());
  }, [form.emailPersonal]);

  // Validaciones del Cuadro 1
  const isCuadroPersonalValid = useMemo(() => {
    const hasNombre = Boolean(form.nombre.trim());
    const hasApellido = Boolean(form.apellido.trim());
    const hasCedula = Boolean(form.identificacion.trim()) && !cedulaDuplicada;
    const hasEmail = Boolean(form.emailPersonal.trim()) && isEmailPersonalFormatValid && !emailPersonalDuplicado;
    return hasNombre && hasApellido && hasCedula && hasEmail;
  }, [form.nombre, form.apellido, form.identificacion, cedulaDuplicada, form.emailPersonal, isEmailPersonalFormatValid, emailPersonalDuplicado]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Requisitos algorítmicos de la contraseña
  const passwordValidations = {
    length: form.nuevaPassword.length >= 8 && form.nuevaPassword.length <= 20,
    uppercase: /[A-Z]/.test(form.nuevaPassword),
    lowercase: /[a-z]/.test(form.nuevaPassword),
    number: /[0-9]/.test(form.nuevaPassword),
    match: form.nuevaPassword !== '' && form.nuevaPassword === form.confirmarPassword
  };

  const validCount = Object.values(passwordValidations).filter(Boolean).length;
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const getSecurityStrength = () => {
    if (validCount <= 1) return { percent: 20, label: 'Muy Débil', color: 'bg-red-500', text: 'text-red-500' };
    if (validCount <= 3) return { percent: 50, label: 'Aceptable', color: 'bg-amber-500', text: 'text-amber-500' };
    if (validCount === 4) return { percent: 80, label: 'Buena', color: 'bg-blue-500', text: 'text-blue-500' };
    return { percent: 100, label: 'Excelente / Segura', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const securityInfo = getSecurityStrength();

  // Guardar y confirmar Cuadro 1
  const handleGuardarCuadroPersonal = () => {
    if (!form.nombre.trim() || !form.apellido.trim()) {
      toast.error('Nombres y Apellidos son obligatorios.');
      return;
    }
    if (cedulaDuplicada) {
      toast.error('La cédula ingresada ya está registrada por otro usuario.');
      return;
    }
    if (!isEmailPersonalFormatValid) {
      toast.error('Ingrese un correo personal con formato válido.');
      return;
    }
    if (emailPersonalDuplicado) {
      toast.error('El correo personal ya se encuentra registrado.');
      return;
    }

    setEditPersonal(false);
    toast.success('Información Personal confirmada y lista.', { icon: '✅' });
  };

  // Guardar y confirmar Cuadro 2
  const handleGuardarCuadroProfesional = () => {
    setEditProfesional(false);
    toast.success('Perfil Profesional & Especialidad confirmados.', { icon: '✅' });
  };

  // Agregar habilidad al perfil profesional
  const handleAgregarHabilidad = (skill) => {
    if (!skill || !skill.trim()) return;
    const cleanSkill = skill.trim();
    if (form.habilidades.includes(cleanSkill)) return;
    setForm(prev => ({ ...prev, habilidades: [...prev.habilidades, cleanSkill] }));
  };

  // Remover habilidad
  const handleRemoverHabilidad = (skillToRemove) => {
    setForm(prev => ({ ...prev, habilidades: prev.habilidades.filter(s => s !== skillToRemove) }));
  };

  // Generador de clave segura aleatoria con alerta en nube animada
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

    const shuffled = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setForm(prev => ({ ...prev, nuevaPassword: shuffled, confirmarPassword: shuffled }));
    
    // Activar la alerta flotante en nube
    setShowCloudAlert(true);
    setTimeout(() => setShowCloudAlert(false), 5500);

    toast.success('Contraseña aleatoria 100% segura generada automáticamente.', { icon: '☁️' });
  };

  const handleAvanzarPaso2 = (e) => {
    e.preventDefault();

    if (editPersonal || editProfesional) {
      toast.error('Por favor guarde y confirme los cambios en las secciones editadas antes de avanzar.', {
        duration: 4000,
        icon: '⚠️'
      });
      return;
    }

    if (!isCuadroPersonalValid) {
      toast.error('Corrija las alertas del Cuadro 1 (Cédula o Correo) antes de avanzar.');
      return;
    }

    setPaso(2);
    toast.success('Datos confirmados. Por favor establece tu contraseña definitiva.', { duration: 3000 });
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('La nueva contraseña debe cumplir con todos los parámetros de seguridad y coincidir.');
      return;
    }

    let especialidadFormateada = form.especialidad.trim();
    if (form.habilidades.length > 0) {
      especialidadFormateada = `${especialidadFormateada} • [${form.habilidades.join(', ')}]`;
    }

    setSubmitting(true);
    try {
      const payload = {
        idTrabajador: user?.idTrabajador || user?.id || null,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        identificacion: form.identificacion.trim(),
        emailPersonal: form.emailPersonal ? form.emailPersonal.trim() : '',
        profesion: form.profesion ? form.profesion.trim() : 'Líder de Proyectos & Tech Lead',
        especialidad: especialidadFormateada,
        nuevaPassword: form.nuevaPassword.trim()
      };

      const res = await api.post('/auth/completar-primer-login', payload);

      toast.success('¡Verificación exitosa! Se actualizó su información y contraseña definitiva.', { duration: 4000 });

      login({
        ...user,
        ...res,
        primerLogin: false,
        token: res?.token || user?.token
      });
    } catch (err) {
      console.error('Error al completar primer login:', err);
      toast.error(err?.message || 'Error al procesar el cambio de contraseña inicial.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !user.primerLogin) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 my-6"
      >
        {/* Encabezado Principal del Asistente */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Primer Inicio de Sesión • Paso {paso} de 2
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                {paso === 1 ? 'Verificación de Datos Personales' : 'Establecer Nueva Contraseña Definitiva'}
              </h3>
              <p className="text-zinc-500 text-xs font-medium mt-0.5">
                {paso === 1
                  ? 'Corrobore sus datos registrados. Para editar información, use la opción correspondiente y guarde los cambios antes de avanzar.'
                  : 'Defina su contraseña de acceso manteniendo los parámetros obligatorios de seguridad.'}
              </p>
            </div>
          </div>

          {/* Botón de Cancelar Operación / Cerrar Sesión */}
          <button
            type="button"
            onClick={handleCancelarOperacion}
            title="Cancelar operación y salir"
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold shrink-0 shadow-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Cancelar y Salir</span>
          </button>
        </div>

        {/* Indicador Visual de Pasos (Wizard Stepper Bar Interactivo Avanzado) */}
        <div className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-inner">
          <div
            onClick={() => setPaso(1)}
            className={`flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
              paso === 1
                ? 'bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 shadow-md text-blue-600 dark:text-blue-400 font-extrabold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
              paso === 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}>
              1
            </div>
            <div className="text-left">
              <span className="block text-[0.68rem] font-black uppercase tracking-wider">Paso 1: Verificación</span>
              <span className="block text-[0.62rem] opacity-80 font-medium">Revisión de Perfil & Datos</span>
            </div>
            {paso > 1 && <CheckCircle2 size={16} className="text-emerald-500 ml-auto shrink-0" />}
          </div>

          <div className="text-zinc-300 dark:text-zinc-700 font-extrabold px-1">➔</div>

          <div
            onClick={() => {
              if (isCuadroPersonalValid && !editPersonal && !editProfesional) setPaso(2);
            }}
            className={`flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              paso === 2
                ? 'bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 shadow-md text-emerald-600 dark:text-emerald-400 font-extrabold'
                : 'text-zinc-400 font-semibold'
            } ${isCuadroPersonalValid && !editPersonal && !editProfesional ? 'cursor-pointer hover:text-zinc-800' : 'cursor-not-allowed opacity-60'}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
              paso === 2 ? 'bg-emerald-500 text-white shadow-sm' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
            }`}>
              2
            </div>
            <div className="text-left">
              <span className="block text-[0.68rem] font-black uppercase tracking-wider">Paso 2: Seguridad</span>
              <span className="block text-[0.62rem] opacity-80 font-medium">Establecer Nueva Clave</span>
            </div>
          </div>
        </div>

        {/* PASO 1: REVISIÓN DE DATOS EN 3 CUADROS */}
        {paso === 1 && (
          <form onSubmit={handleAvanzarPaso2} className="space-y-4">
            {/* Cuadro 1: Información Personal & Identificación */}
            <div className={`p-4 sm:p-5 rounded-2xl transition-all border ${
              editPersonal
                ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-md ring-2 ring-blue-500/10'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60'
            } space-y-3 relative`}>
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2.5">
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <User size={15} className="text-blue-500" /> 1. Información Personal & Identificación
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (editPersonal) handleGuardarCuadroPersonal();
                    else setEditPersonal(true);
                  }}
                  className={`text-[0.7rem] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    editPersonal
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:scale-95'
                      : 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950'
                  }`}
                >
                  {editPersonal ? (
                    <>
                      <Save size={13} /> Guardar Cambios
                    </>
                  ) : (
                    <>
                      <Edit3 size={13} /> Editar Cuadro
                    </>
                  )}
                </button>
              </div>

              {editPersonal ? (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1"
                >
                  <div>
                    <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="input-field py-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={form.apellido}
                      onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                      className="input-field py-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Cédula / Identificación *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={form.identificacion}
                        onChange={(e) => setForm({ ...form, identificacion: e.target.value })}
                        className={`input-field py-2 text-xs font-mono font-bold transition-all ${
                          cedulaDuplicada
                            ? 'border-red-500 focus:ring-red-500 bg-red-50/20'
                            : form.identificacion.trim()
                            ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/10'
                            : ''
                        }`}
                      />
                      {validatingUniqueness && (
                        <Loader2 size={14} className="animate-spin text-blue-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    {form.identificacion.trim() && !validatingUniqueness && (
                      <p className={`text-[0.65rem] font-bold mt-1 flex items-center gap-1 ${
                        cedulaDuplicada ? 'text-red-500' : 'text-emerald-600'
                      }`}>
                        {cedulaDuplicada ? (
                          <>
                            <AlertTriangle size={12} /> Cédula duplicada en el sistema
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} /> Cédula válida y disponible
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Correo Personal / Alternativo *</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={form.emailPersonal}
                        onChange={(e) => setForm({ ...form, emailPersonal: e.target.value })}
                        className={`input-field py-2 text-xs font-semibold transition-all ${
                          emailPersonalDuplicado || (form.emailPersonal.trim() && !isEmailPersonalFormatValid)
                            ? 'border-red-500 focus:ring-red-500 bg-red-50/20'
                            : isEmailPersonalFormatValid
                            ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/10'
                            : ''
                        }`}
                        placeholder="usuario@gmail.com"
                      />
                    </div>
                    {form.emailPersonal.trim() && (
                      <p className={`text-[0.65rem] font-bold mt-1 flex items-center gap-1 ${
                        !isEmailPersonalFormatValid || emailPersonalDuplicado ? 'text-red-500' : 'text-emerald-600'
                      }`}>
                        {!isEmailPersonalFormatValid ? (
                          <>
                            <AlertTriangle size={12} /> Formato de correo inválido
                          </>
                        ) : emailPersonalDuplicado ? (
                          <>
                            <AlertTriangle size={12} /> Correo personal ya registrado
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} /> Correo personal disponible
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-zinc-400 block text-[0.62rem] uppercase font-bold mb-0.5">Nombres</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">{form.nombre || 'No especificado'}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[0.62rem] uppercase font-bold mb-0.5">Apellidos</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">{form.apellido || 'No especificado'}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[0.62rem] uppercase font-bold mb-0.5">Identificación</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-1">
                      {form.identificacion || 'No especificado'}
                      {form.identificacion && !cedulaDuplicada && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[0.62rem] uppercase font-bold mb-0.5">Correo Personal</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1">
                      {form.emailPersonal || 'No especificado'}
                      {isEmailPersonalFormatValid && !emailPersonalDuplicado && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Cuadro 2: Perfil Profesional & Especialidad (Rediseñado y Organizado) */}
            <div className={`p-4 sm:p-5 rounded-2xl transition-all border ${
              editProfesional
                ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-md ring-2 ring-blue-500/10'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60'
            } space-y-3 relative`}>
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2.5">
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Briefcase size={15} className="text-blue-500" /> 2. Perfil Profesional & Especialidad
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (editProfesional) handleGuardarCuadroProfesional();
                    else setEditProfesional(true);
                  }}
                  className={`text-[0.7rem] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    editProfesional
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:scale-95'
                      : 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950'
                  }`}
                >
                  {editProfesional ? (
                    <>
                      <Save size={13} /> Guardar Cambios
                    </>
                  ) : (
                    <>
                      <Edit3 size={13} /> Editar Cuadro
                    </>
                  )}
                </button>
              </div>

              {editProfesional ? (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-1"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Profesión / Titulación *</label>
                      <select
                        required
                        value={form.profesion}
                        onChange={(e) => setForm({ ...form, profesion: e.target.value })}
                        className="input-field py-2 text-xs font-semibold cursor-pointer bg-white dark:bg-zinc-900"
                      >
                        <option value="">-- Seleccionar Titulación --</option>
                        {TITULACIONES_PROFESIONALES.map((tit) => (
                          <option key={tit} value={tit}>{tit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Especialidad Principal *</label>
                      <select
                        required
                        value={form.especialidad}
                        onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                        className="input-field py-2 text-xs font-semibold cursor-pointer bg-white dark:bg-zinc-900"
                      >
                        <option value="">-- Seleccionar Especialidad --</option>
                        {ESPECIALIDADES_PRINCIPALES.map((esp) => (
                          <option key={esp} value={esp}>{esp}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Stack Técnico & Habilidades WBS (Etiquetas Visuales)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 min-h-[42px] items-center">
                      {form.habilidades.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[0.68rem] font-bold flex items-center gap-1 animate-fadeIn"
                        >
                          <Code2 size={11} className="text-blue-500" />
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoverHabilidad(skill)}
                            className="hover:text-red-500 ml-0.5 cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[0.62rem] font-bold text-zinc-400">Sugerencias:</span>
                      {['Scrum Master', 'Planificación WBS', 'Spring Boot 3', 'React.js', 'PostgreSQL', 'Microservicios', 'AWS'].map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAgregarHabilidad(sug)}
                          className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/60 hover:bg-blue-100 text-zinc-600 dark:text-zinc-300 text-[0.62rem] font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                        >
                          <Plus size={10} /> {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[0.62rem] uppercase font-bold mb-0.5">Profesión</span>
                      <strong className="text-zinc-800 dark:text-zinc-200">{form.profesion || 'Líder de Proyectos & Tech Lead'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[0.62rem] uppercase font-bold mb-0.5">Especialidad Principal</span>
                      <strong className="text-zinc-800 dark:text-zinc-200">{form.especialidad || 'Gestión de Proyectos WBS & Arquitectura'}</strong>
                    </div>
                  </div>

                  {form.habilidades.length > 0 && (
                    <div>
                      <span className="text-zinc-400 block text-[0.62rem] uppercase font-bold mb-1.5">
                        Stack Técnico & Habilidades WBS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {form.habilidades.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/70 dark:to-indigo-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-[0.68rem] font-extrabold flex items-center gap-1.5 shadow-sm"
                          >
                            <Code2 size={12} className="text-blue-600 dark:text-blue-400" />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cuadro 3: Credenciales Corporativas (Solo Lectura / Inmutable) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Mail size={14} className="text-blue-600" /> 3. Credenciales Corporativas Asignadas
                </span>
                <span className="text-[0.65rem] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  <Lock size={12} /> Correo Corporativo Inmutable
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-zinc-500 block text-[0.62rem] font-medium">Correo Electrónico Corporativo (@ikernell.org):</span>
                  <strong className="text-blue-700 dark:text-blue-300 font-mono text-sm block">{user?.email}</strong>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[0.62rem] font-bold uppercase shadow-sm">
                  ROL: {user?.rol}
                </span>
              </div>
            </div>

            {/* Botón de Confirmación para Avanzar al Paso 2 */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCancelarOperacion}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-95 shrink-0"
              >
                <LogOut size={14} /> Cancelar y Salir
              </button>

              <div className="flex items-center gap-3">
                {(editPersonal || editProfesional || !isCuadroPersonalValid) ? (
                  <span className="text-[0.68rem] text-amber-600 dark:text-amber-400 font-bold hidden sm:flex items-center gap-1">
                    <AlertTriangle size={13} /> {editPersonal || editProfesional ? 'Guarde los cambios' : 'Corrija campos'}
                  </span>
                ) : (
                  <span className="text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-bold hidden sm:flex items-center gap-1">
                    <CheckCircle2 size={13} /> Verificado
                  </span>
                )}

                <button
                  type="submit"
                  disabled={editPersonal || editProfesional || !isCuadroPersonalValid}
                  className={`gradient-button text-xs py-3 px-6 font-extrabold inline-flex items-center gap-2 shadow-lg cursor-pointer transition-all ${
                    (editPersonal || editProfesional || !isCuadroPersonalValid) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                >
                  <span>Confirmar Mis Datos y Continuar</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* PASO 2: FORMULARIO DE NUEVA CONTRASEÑA */}
        {paso === 2 && (
          <form onSubmit={handleSubmitFinal} className="space-y-5 text-xs">
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-4 relative">
              
              {/* Alerta Flotante Nube para la Contraseña Generada */}
              <AnimatePresence>
                {showCloudAlert && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    className="absolute -top-14 right-2 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3 rounded-2xl shadow-2xl border border-blue-300/40 flex items-center gap-2.5 max-w-sm text-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                      <Cloud size={18} className="text-blue-100 animate-bounce" />
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-[0.72rem] leading-tight flex items-center gap-1">
                        <span>¡Contraseña Nube Generada!</span>
                        <Sparkles size={12} className="text-amber-300" />
                      </p>
                      <p className="text-[0.62rem] text-blue-100 font-medium leading-tight">
                        Clave 100% segura que cumple con todos los parámetros de seguridad exigidos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCloudAlert(false)}
                      className="text-white/70 hover:text-white ml-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                    {/* Flecha apuntando hacia abajo */}
                    <div className="absolute -bottom-1.5 right-12 w-3 h-3 bg-blue-700 rotate-45 border-r border-b border-blue-300/40" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-1.5">
                    <Lock size={15} className="text-blue-500" /> Configuración de Nueva Contraseña Definitiva
                  </h4>
                  <p className="text-[0.68rem] text-zinc-500 font-medium mt-0.5">
                    Reemplazará la contraseña temporal entregada por correo electrónico.
                  </p>
                </div>

                {/* Botón de Generar Clave con Estilo Nube y Brillo */}
                <button
                  type="button"
                  onClick={handleGenerarPasswordDefinitiva}
                  className="relative px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-[0.7rem] font-extrabold flex items-center gap-1.5 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/30 shadow-md"
                >
                  <Cloud size={15} className="text-blue-200 animate-pulse" />
                  <span>Generar Clave Segura</span>
                  <Sparkles size={13} className="text-amber-300" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.nuevaPassword}
                      onChange={(e) => setForm({ ...form, nuevaPassword: e.target.value })}
                      className="input-field py-2.5 text-xs font-mono pr-9 shadow-inner"
                      placeholder="Nueva contraseña segura"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={form.confirmarPassword}
                      onChange={(e) => setForm({ ...form, confirmarPassword: e.target.value })}
                      className="input-field py-2.5 text-xs font-mono pr-9 shadow-inner"
                      placeholder="Confirme la contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Barrita de Fortaleza */}
              {form.nuevaPassword && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-[0.68rem] font-extrabold">
                    <span className="text-zinc-500">Nivel de Seguridad de la Contraseña:</span>
                    <span className={securityInfo.text}>{securityInfo.label} ({securityInfo.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${securityInfo.percent}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full ${securityInfo.color}`}
                    />
                  </div>
                </div>
              )}

              {/* Indicadores de Validación Animados */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { key: 'length', text: '8 a 20 Caracteres' },
                  { key: 'uppercase', text: '1 Mayúscula (A-Z)' },
                  { key: 'lowercase', text: '1 Minúscula (a-z)' },
                  { key: 'number', text: '1 Número (0-9)' },
                  { key: 'match', text: 'Contraseñas Coinciden' }
                ].map(req => {
                  const isOk = passwordValidations[req.key];
                  return (
                    <motion.div
                      key={req.key}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[0.68rem] font-bold transition-all ${
                        isOk
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {isOk ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> : <AlertTriangle size={13} className="text-zinc-300 shrink-0" />}
                      <span>{req.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Acciones Finales del Paso 2 */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-95"
                >
                  <ArrowLeft size={14} /> Regresar a Mis Datos
                </button>

                <button
                  type="button"
                  onClick={handleCancelarOperacion}
                  className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-95"
                >
                  <LogOut size={14} /> Cancelar y Salir
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || !isPasswordValid}
                className="gradient-button py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Estableciendo Contraseña...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Establecer Contraseña y Entrar al Sistema</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
