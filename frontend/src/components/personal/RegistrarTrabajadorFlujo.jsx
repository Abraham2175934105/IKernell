import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Shield, GraduationCap, Code2, Briefcase, ChevronRight, 
  CheckCircle2, AlertTriangle, ArrowLeft, Loader2, Plus, X, Sparkles, 
  Check, Laptop, Database, Cpu, Wrench, FileCode, Edit3, Compass,
  Sliders, Maximize2, Minimize2, ArrowRight, CheckCircle, ShieldCheck
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';

// Categorías masivas de habilidades para filtrado rápido y sugerencias dinámicas
const CATEGORIAS_HABILIDADES = {
  BACKEND: {
    label: 'Backend & APIs',
    icon: ServerIcon,
    skills: [
      'Java 17', 'Spring Boot 3', 'Microservicios', 'Spring Security', 'JPA / Hibernate', 
      'REST APIs', 'GraphQL', 'Go', 'Node.js', 'Express', 'Kafka Events', 'Redis Cache'
    ]
  },
  FRONTEND: {
    label: 'Frontend & Mobile',
    icon: Code2Icon,
    skills: [
      'React 18', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux Toolkit', 
      'Vite', 'React Native', 'Vue.js', 'Framer Motion', 'WebSockets'
    ]
  },
  DESIGN: {
    label: 'Figma & UI/UX',
    icon: DesignIcon,
    skills: [
      'Figma Prototyping', 'Design Systems', 'Wireframing Figma', 'UI/UX Design', 
      'System Design', 'User Research', 'Usabilidad', 'Prototipado Interactivo'
    ]
  },
  DATABASE: {
    label: 'Base de Datos & SQL',
    icon: DatabaseIcon,
    skills: [
      'PostgreSQL DBA', 'SQL Tuning', 'Consultas Optimizadas', 'Índices B-Tree', 
      'Pipelines ETL', 'Airflow', 'Database Migration', 'Modelado ER'
    ]
  },
  QA: {
    label: 'QA & Testing',
    icon: QaIcon,
    skills: [
      'QA Automation', 'JUnit', 'Mockito', 'Cypress', 'Postman API Testing', 
      'OWASP Testing', 'Selenium', 'Test Case Design', 'Pruebas de Carga'
    ]
  },
  DEVOPS: {
    label: 'DevOps & Cloud',
    icon: CloudIcon,
    skills: [
      'Docker', 'Kubernetes', 'GitHub Actions', 'CI/CD Pipelines', 'AWS Cloud', 
      'Terraform', 'Linux SysAdmin', 'Nginx', 'Helm Charts'
    ]
  },
  GESTION: {
    label: 'Gestión & Agilidad',
    icon: ManagementIcon,
    skills: [
      'Gestión de Proyectos', 'Scrum Master', 'Metodologías Ágiles', 'Planificación WBS', 
      'Liderazgo de Equipos', 'Gestión de Riesgos', 'Estimación de Esfuerzo', 
      'Arquitectura de Software', 'Code Review', 'Jira / Confluence', 'Auditoría CMMI'
    ]
  }
};

function ServerIcon({ size = 16, className = "" }) { return <Cpu size={size} className={className} />; }
function Code2Icon({ size = 16, className = "" }) { return <Code2 size={size} className={className} />; }
function DesignIcon({ size = 16, className = "" }) { return <Laptop size={size} className={className} />; }
function DatabaseIcon({ size = 16, className = "" }) { return <Database size={size} className={className} />; }
function QaIcon({ size = 16, className = "" }) { return <Wrench size={size} className={className} />; }
function CloudIcon({ size = 16, className = "" }) { return <FileCode size={size} className={className} />; }
function ManagementIcon({ size = 16, className = "" }) { return <Briefcase size={size} className={className} />; }

const TITULACIONES_PROFESIONALES = [
  'Ingeniero de Sistemas y Computación',
  'Ingeniero de Software',
  'Licenciado en Ciencias de la Computación',
  'Diseñador de Interacción & UI/UX',
  'Administrador de Tecnologías de Información',
  'Tecnólogo en Análisis y Desarrollo de Software',
  'Ingeniero Electrónico & IoT',
  'Especialista en Ciberseguridad & DevOps'
];

const PAISES_IDENTIFICACION = [
  { code: 'CO', flag: '🇨🇴', docTipo: 'Cédula de Ciudadanía', placeholder: 'Ej. 1018459203' },
  { code: 'MX', flag: '🇲🇽', docTipo: 'CURP / INE', placeholder: 'Ej. GOMA800310HDFR' },
  { code: 'PE', flag: '🇵🇪', docTipo: 'DNI Perú', placeholder: 'Ej. 45892014' },
  { code: 'CL', flag: '🇨🇱', docTipo: 'RUT Chile', placeholder: 'Ej. 18.459.203-K' },
  { code: 'AR', flag: '🇦🇷', docTipo: 'DNI Argentina', placeholder: 'Ej. 35.892.014' },
  { code: 'EC', flag: '🇪🇨', docTipo: 'Cédula Ecuador', placeholder: 'Ej. 1718459203' }
];

export function RegistrarTrabajadorFlujo({ onVolver, onSuccess, lockRoleToDesarrollador = false }) {
  const api = useApi();
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const [activeStep, setActiveStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState('next');
  const [viewMode, setViewMode] = useState('FOCUS'); // 'FOCUS' (Diapositivas) o 'CONTINUOUS' (Lista Completa)
  const [completedSteps, setCompletedSteps] = useState({ 1: false, 2: false, 3: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rol: lockRoleToDesarrollador ? 'DESARROLLADOR' : 'DESARROLLADOR',
    paisCodigo: 'CO',
    identificacion: '',
    email: '',
    emailPersonal: '',
    profesion: '',
    especialidad: 'Backend Java & Spring Boot'
  });

  // Dual Skill states - INICIALIZADAS TOTALMENTE VACÍAS (0 HABILIDADES PRESELECCIONADAS)
  const [habilidadesDirectivas, setHabilidadesDirectivas] = useState([]);
  const [habilidadesTecnicas, setHabilidadesTecnicas] = useState([]);

  const [customDirectivaInput, setCustomDirectivaInput] = useState('');
  const [customTecnicaInput, setCustomTecnicaInput] = useState('');
  const [activeTabTecnicas, setActiveTabTecnicas] = useState('TODAS');

  // Helper auto-generate corporate email
  const autoGenerarEmail = (nom, ape) => {
    if (!nom || !ape) return '';
    const cleanNom = nom.trim().toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
    const cleanApe = ape.trim().toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
    return `${cleanNom}.${cleanApe}@ikernell.org`;
  };

  // Validations
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Porcentaje dinámico de avance
  const progressPercentage = useMemo(() => {
    let score = 0;
    if (formData.nombre.trim() && formData.apellido.trim() && formData.identificacion.trim() && isValidEmail(formData.email) && isValidEmail(formData.emailPersonal)) {
      score += 35;
    }
    if (formData.profesion && formData.especialidad) {
      score += 30;
    }
    if (habilidadesTecnicas.length > 0 || habilidadesDirectivas.length > 0) {
      score += 35;
    }
    return score;
  }, [formData, habilidadesDirectivas, habilidadesTecnicas]);

  // Handler para saltar suavemente a un paso con animación de diapositiva
  const handleJumpToStep = (targetStep) => {
    if (targetStep === activeStep) return;
    setSlideDirection(targetStep > activeStep ? 'next' : 'prev');
    setActiveStep(targetStep);

    if (viewMode === 'CONTINUOUS') {
      const targetRef = targetStep === 1 ? step1Ref : targetStep === 2 ? step2Ref : step3Ref;
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextStep = (nextStep) => {
    if (nextStep === 2) {
      if (!formData.nombre.trim() || !formData.apellido.trim()) {
        setFormError('Por favor complete los nombres y apellidos del colaborador.');
        return;
      }
      if (!formData.identificacion.trim()) {
        setFormError('Por favor ingrese el número de identificación / cédula.');
        return;
      }
      if (!formData.email.trim() || !isValidEmail(formData.email)) {
        setFormError('Por favor ingrese un correo corporativo válido con dominio @ikernell.org.');
        return;
      }
      if (!formData.emailPersonal.trim() || !isValidEmail(formData.emailPersonal)) {
        setFormError('Por favor ingrese un correo personal válido para notificaciones.');
        return;
      }
      setCompletedSteps(prev => ({ ...prev, 1: true }));
    } else if (nextStep === 3) {
      if (!formData.profesion) {
        setFormError('Por favor seleccione la profesión / titulación profesional.');
        return;
      }
      setCompletedSteps(prev => ({ ...prev, 2: true }));
    }

    setFormError(null);
    setSlideDirection('next');
    setActiveStep(nextStep);

    if (viewMode === 'CONTINUOUS') {
      const targetRef = nextStep === 2 ? step2Ref : step3Ref;
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleDirectiva = (skill) => {
    if (habilidadesDirectivas.includes(skill)) {
      setHabilidadesDirectivas(habilidadesDirectivas.filter(s => s !== skill));
    } else {
      setHabilidadesDirectivas([...habilidadesDirectivas, skill]);
    }
  };

  const handleAddCustomDirectiva = () => {
    if (customDirectivaInput.trim() && !habilidadesDirectivas.includes(customDirectivaInput.trim())) {
      setHabilidadesDirectivas([...habilidadesDirectivas, customDirectivaInput.trim()]);
      setCustomDirectivaInput('');
    }
  };

  const handleToggleTecnica = (skill) => {
    if (habilidadesTecnicas.includes(skill)) {
      setHabilidadesTecnicas(habilidadesTecnicas.filter(s => s !== skill));
    } else {
      setHabilidadesTecnicas([...habilidadesTecnicas, skill]);
    }
  };

  const handleAddCustomTecnica = () => {
    if (customTecnicaInput.trim() && !habilidadesTecnicas.includes(customTecnicaInput.trim())) {
      setHabilidadesTecnicas([...habilidadesTecnicas, customTecnicaInput.trim()]);
      setCustomTecnicaInput('');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormError(null);

    if (habilidadesTecnicas.length === 0 && habilidadesDirectivas.length === 0) {
      setFormError('Debe seleccionar al menos una habilidad o competencia en el Paso 3.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        identificacion: formData.identificacion.trim(),
        email: formData.email.trim(),
        emailPersonal: formData.emailPersonal.trim(),
        rol: formData.rol,
        profesion: formData.profesion,
        especialidad: formData.especialidad,
        habilidadesDirectivas: habilidadesDirectivas.join(', '),
        habilidadesTecnicas: habilidadesTecnicas.join(', '),
        estado: true
      };

      const endpoint = lockRoleToDesarrollador ? '/lider/trabajadores' : '/coordinador/trabajadores';
      await api.post(endpoint, payload);

      setCompletedSteps({ 1: true, 2: true, 3: true });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error registrando trabajador:", err);
      const msg = err.response?.data?.message || err.message || 'Error al conectar con PostgreSQL.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Variantes de animación para transición fluida tipo diapositiva (Slide Transition)
  const slideVariants = {
    enter: (direction) => ({
      x: direction === 'next' ? 60 : -60,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (direction) => ({
      x: direction === 'next' ? -60 : 60,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      
      {/* 1. HEADER STICKY PERMANENTE CON EFECTO GLASSMORPHISM BLUR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          
          {/* TÍTULO Y BOTÓN DE RETORNO */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onVolver}
              className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer shadow-xs"
              title="Volver a Gestión de Personal"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-black tracking-wider uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Alta Corporativa PostgreSQL
                </span>
                {lockRoleToDesarrollador && (
                  <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Solo Desarrolladores
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mt-0.5">
                <span>Registrar Nuevo Colaborador</span>
                <UserPlus size={20} className="text-blue-600" />
              </h1>
            </div>
          </div>

          {/* CONTROLES DEL STEPPER SUPERIOR CON MODOS DE VISTA */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
            
            {/* CONMUTADOR DE MODO DE VISTA (DIAPOSITIVAS VS LISTA CONTINUA) */}
            <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('FOCUS')}
                className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'FOCUS' 
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-black' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Modo Diapositivas: Enfoca un paso a la vez con transiciones animadas"
              >
                <Maximize2 size={12} />
                <span>Diapositivas</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CONTINUOUS')}
                className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'CONTINUOUS' 
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-black' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Modo Lista Completa: Muestra todos los pasos verticalmente"
              >
                <Minimize2 size={12} />
                <span>Lista Completa</span>
              </button>
            </div>

            {/* BOTONES INTERACTIVOS DE PASOS */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              {[
                { num: 1, label: 'Credenciales' },
                { num: 2, label: 'Perfil' },
                { num: 3, label: 'Habilidades' }
              ].map((st, idx) => (
                <React.Fragment key={st.num}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleJumpToStep(st.num)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeStep === st.num
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/40'
                        : completedSteps[st.num]
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full text-[0.62rem] flex items-center justify-center font-mono font-bold ${
                      activeStep === st.num ? 'bg-white text-blue-700' : completedSteps[st.num] ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {completedSteps[st.num] ? '✓' : st.num}
                    </span>
                    <span className="hidden sm:inline">{st.label}</span>
                  </motion.button>
                  {idx < 2 && <ChevronRight size={13} className="text-zinc-300 dark:text-zinc-700 shrink-0" />}
                </React.Fragment>
              ))}
            </div>

          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* MENSAJE DE ERROR GLOBAL */}
        {formError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{formError}</span>
            </div>
            <button onClick={() => setFormError(null)} className="hover:text-red-900 cursor-pointer">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* LAYOUT DE 2 COLUMNAS: SIDEBAR TIMELINE INTERACTIVO Y CONTENEDOR DE FORMULARIO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: LÍNEA DE TIEMPO LATERAL & CONTADOR DE AVANCE ANIMADO */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md space-y-5">
              
              {/* ENCABEZADO DEL TIMELINE CON ICONOS MEJORADOS */}
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-wider">
                      Avance del Registro
                    </h3>
                    <p className="text-[0.65rem] text-zinc-500 font-medium">Indicador en tiempo real</p>
                  </div>
                </div>
                <span className="text-xs font-black font-mono px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {progressPercentage}%
                </span>
              </div>

              {/* BARRA DE PROGRESO CON ANIMACIÓN SPRING DE DEGRADE */}
              <div className="space-y-1">
                <div className="w-full h-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              {/* LÍNEA DE TIEMPO LATERAL CONECTADA Y RESALTADA */}
              <div className="relative pl-3 space-y-5 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-emerald-500">
                {[
                  { 
                    num: 1, 
                    titulo: 'Identificación & Credenciales', 
                    sub: 'Cédula y correo corporativo @ikernell.org',
                    icon: Shield,
                    colorGradient: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    num: 2, 
                    titulo: 'Perfil Profesional & Titulación', 
                    sub: 'Especialidad y titulación académica',
                    icon: GraduationCap,
                    colorGradient: 'from-indigo-500 to-purple-500'
                  },
                  { 
                    num: 3, 
                    titulo: 'Stack de Habilidades WBS', 
                    sub: formData.rol === 'LIDER' ? 'Perfil Dual: Gestión + Desarrollo' : 'Competencias técnicas categorizadas',
                    icon: Sparkles,
                    colorGradient: 'from-emerald-500 to-teal-500'
                  }
                ].map(st => {
                  const isActive = activeStep === st.num;
                  const isCompleted = completedSteps[st.num];
                  const IconComp = st.icon;

                  return (
                    <motion.button
                      key={st.num}
                      type="button"
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleJumpToStep(st.num)}
                      className={`relative flex items-start gap-3 text-left w-full p-3 rounded-2xl transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-blue-50/90 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-800 shadow-md ring-2 ring-blue-500/20' 
                          : isCompleted 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent'
                      }`}
                    >
                      {/* NODO CON GRADIENTES VIBRANTES */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-black z-10 shrink-0 shadow-sm transition-all ${
                        isActive 
                          ? `bg-gradient-to-br ${st.colorGradient} text-white ring-4 ring-blue-500/30 scale-110` 
                          : isCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                      }`}>
                        {isCompleted ? '✓' : <IconComp size={15} />}
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-black truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            Paso {st.num}: {st.titulo}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-zinc-500 line-clamp-1 font-medium">
                          {st.sub}
                        </p>
                        {isActive && (
                          <div className="pt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                            <span className="text-[0.6rem] font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                              Enfoque Activo
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* ACCIÓN RÁPIDA DE GUARDADO EN SIDEBAR */}
              <div className="pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Guardando en PostgreSQL...</>
                  ) : (
                    <><CheckCircle2 size={16} /> Enrolar Colaborador Ahora</>
                  )}
                </motion.button>
              </div>

            </div>
          </div>

          {/* COLUMNA DERECHA: PASOS A PASOS EN MODO DIAPOSITIVA (FOCUS) O MODO CONTINUO */}
          <div className="lg:col-span-8">
            
            {viewMode === 'FOCUS' ? (
              /* MODO DIAPOSITIVAS (SLIDE FOCUS MODE) - MUESTRA UN PASO ENFOCADO A LA VEZ CON TRANSICIONES ANIMADAS */
              <div className="min-h-[65vh] relative">
                <AnimatePresence custom={slideDirection} mode="wait">
                  
                  {/* SLIDE PASO 1: CREDENCIALES */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      custom={slideDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-2xl space-y-6 ring-4 ring-blue-500/10"
                    >
                      <div className="flex justify-between items-start pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-500/20">
                            <Shield size={22} />
                          </div>
                          <div>
                            <span className="text-[0.62rem] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                              Paso 1 de 3 • Autenticación
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                              1. Identificación & Credenciales de Acceso
                            </h2>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-black border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                          <Edit3 size={14} className="animate-pulse" /> Editando Credenciales
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombres *</label>
                          <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => {
                              const val = e.target.value;
                              const auto = autoGenerarEmail(val, formData.apellido);
                              setFormData(prev => ({ ...prev, nombre: val, email: auto || prev.email }));
                            }}
                            placeholder="Ej. Roberto"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Apellidos *</label>
                          <input
                            type="text"
                            required
                            value={formData.apellido}
                            onChange={(e) => {
                              const val = e.target.value;
                              const auto = autoGenerarEmail(formData.nombre, val);
                              setFormData(prev => ({ ...prev, apellido: val, email: auto || prev.email }));
                            }}
                            placeholder="Ej. Gómez"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Rol de Seguridad Corporativa *</label>
                          {lockRoleToDesarrollador ? (
                            <div className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-extrabold flex items-center justify-between">
                              <span>DESARROLLADOR</span>
                              <span className="text-[0.6rem] font-bold uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-md">Bloqueado por Líder</span>
                            </div>
                          ) : (
                            <select
                              value={formData.rol}
                              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-extrabold uppercase focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="DESARROLLADOR">DESARROLLADOR (Operatividad WBS)</option>
                              <option value="LIDER">LÍDER DE PROYECTO (Perfil Híbrido Dual)</option>
                              <option value="COORDINADOR">COORDINADOR GENERAL</option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">País / Documento *</label>
                          <select
                            value={formData.paisCodigo}
                            onChange={(e) => setFormData({ ...formData, paisCodigo: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {PAISES_IDENTIFICACION.map(p => (
                              <option key={p.code} value={p.code}>[{p.flag}] {p.docTipo}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Número de Identificación / Cédula *</label>
                          <input
                            type="text"
                            required
                            value={formData.identificacion}
                            onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                            placeholder={PAISES_IDENTIFICACION.find(p => p.code === formData.paisCodigo)?.placeholder || 'Número de cédula'}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Correo Corporativo Único *</label>
                            <span className="text-[0.62rem] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              @ikernell.org
                            </span>
                          </div>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="nombre.apellido@ikernell.org"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Correo Personal / Alternativo *</label>
                          <input
                            type="email"
                            required
                            value={formData.emailPersonal}
                            onChange={(e) => setFormData({ ...formData, emailPersonal: e.target.value })}
                            placeholder="correo.personal@gmail.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNextStep(2)}
                          className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
                        >
                          <span>Siguiente Diapositiva: Perfil Profesional</span>
                          <ArrowRight size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* SLIDE PASO 2: PERFIL PROFESIONAL */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      custom={slideDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-indigo-500/80 dark:border-indigo-500/60 shadow-2xl space-y-6 ring-4 ring-indigo-500/10"
                    >
                      <div className="flex justify-between items-start pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-500/20">
                            <GraduationCap size={22} />
                          </div>
                          <div>
                            <span className="text-[0.62rem] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                              Paso 2 de 3 • Especialidad
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                              2. Perfil Profesional & Titulación Académica
                            </h2>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                          <Edit3 size={14} className="animate-pulse" /> Editando Perfil
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Profesión / Titulación Académica *</label>
                          <select
                            required
                            value={formData.profesion}
                            onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="">-- Seleccionar Titulación --</option>
                            {TITULACIONES_PROFESIONALES.map((tit) => (
                              <option key={tit} value={tit}>{tit}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Especialidad Técnica Principal *</label>
                          <select
                            required
                            value={formData.especialidad}
                            onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Backend Java & Spring Boot">Backend Java & Spring Boot</option>
                            <option value="Frontend React & TypeScript">Frontend React & TypeScript</option>
                            <option value="Diseño Figma & UI/UX">Diseño Figma & UI/UX</option>
                            <option value="Base de Datos PostgreSQL DBA">Base de Datos PostgreSQL DBA</option>
                            <option value="QA Automation & Testing">QA Automation & Testing</option>
                            <option value="DevOps & Infraestructura Cloud">DevOps & Infraestructura Cloud</option>
                            <option value="Gestión de Proyectos & Scrum Master">Gestión de Proyectos & Scrum Master</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleJumpToStep(1)}
                          className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                        >
                          ← Diapositiva Anterior (Paso 1)
                        </button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNextStep(3)}
                          className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition-all"
                        >
                          <span>Siguiente Diapositiva: Habilidades WBS</span>
                          <ArrowRight size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* SLIDE PASO 3: HABILIDADES WBS (0 PRESELECCIONADAS DE DEFECTO) */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      custom={slideDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 shadow-2xl space-y-6 ring-4 ring-emerald-500/10"
                    >
                      <div className="flex justify-between items-start pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-emerald-500/20">
                            <Sparkles size={22} />
                          </div>
                          <div>
                            <span className="text-[0.62rem] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                              Paso 3 de 3 • Habilidades Categorizadas
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                              3. Stack Técnico & Habilidades WBS Categorizadas
                            </h2>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                          <Edit3 size={14} className="animate-pulse" /> Editando Habilidades
                        </span>
                      </div>

                      {/* SI ES LÍDER -> 2 MÓDULOS CON GRADIENTES VIBRANTES */}
                      {formData.rol === 'LIDER' ? (
                        <div className="space-y-6">
                          
                          {/* CAMPO 3A: DIRECTIVAS CON GRADIENTE AMBER */}
                          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-300 dark:border-amber-900/60 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-amber-200 dark:border-amber-800/60">
                              <span className="font-black text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-xs">
                                  <Briefcase size={14} />
                                </div>
                                <span>3A. Habilidades Directivas & Gestión de Líder ({habilidadesDirectivas.length})</span>
                              </span>
                              <span className="text-[0.62rem] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                Competencias de Gestión
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customDirectivaInput}
                                onChange={(e) => setCustomDirectivaInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomDirectiva(); } }}
                                placeholder="Escriba una habilidad de gestión y presione Enter..."
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomDirectiva}
                                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs cursor-pointer shadow-sm"
                              >
                                + Agregar
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-800/60 min-h-[46px] items-center">
                              {habilidadesDirectivas.length === 0 ? (
                                <span className="text-xs text-zinc-400 italic">No hay habilidades directivas seleccionadas. Haga clic abajo...</span>
                              ) : (
                                habilidadesDirectivas.map(skill => (
                                  <span key={skill} className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-black flex items-center gap-2">
                                    <span>{skill}</span>
                                    <button type="button" onClick={() => handleToggleDirectiva(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                                  </span>
                                ))
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[0.65rem] font-extrabold text-amber-900 dark:text-amber-200 uppercase block">
                                Sugerencias Rápidas de Gestión:
                              </span>
                              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {CATEGORIAS_HABILIDADES.GESTION.skills.map(skill => {
                                  const isSel = habilidadesDirectivas.includes(skill);
                                  return (
                                    <button
                                      key={skill}
                                      type="button"
                                      onClick={() => handleToggleDirectiva(skill)}
                                      className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                        isSel 
                                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-amber-50'
                                      }`}
                                    >
                                      {isSel ? '✓ ' : '+ '}{skill}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* CAMPO 3B: TÉCNICAS CON GRADIENTE BLUE */}
                          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-300 dark:border-blue-900/60 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-blue-200 dark:border-blue-800/60">
                              <span className="font-black text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                                  <Code2 size={14} />
                                </div>
                                <span>3B. Stack Técnico & Habilidades WBS / Desarrollo ({habilidadesTecnicas.length})</span>
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customTecnicaInput}
                                onChange={(e) => setCustomTecnicaInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTecnica(); } }}
                                placeholder="Escriba tecnología (ej. Figma, Java 17, React) y Enter..."
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomTecnica}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs cursor-pointer shadow-sm"
                              >
                                + Agregar
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-blue-200 dark:border-blue-800/60 min-h-[46px] items-center">
                              {habilidadesTecnicas.length === 0 ? (
                                <span className="text-xs text-zinc-400 italic">No hay tecnologías seleccionadas aún. Haga clic abajo...</span>
                              ) : (
                                habilidadesTecnicas.map(skill => (
                                  <span key={skill} className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 text-xs font-black flex items-center gap-2">
                                    <span>{skill}</span>
                                    <button type="button" onClick={() => handleToggleTecnica(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                                  </span>
                                ))
                              )}
                            </div>

                            <div className="space-y-2">
                              <span className="text-[0.65rem] font-extrabold text-blue-900 dark:text-blue-200 uppercase block">
                                Sugerencias Rápidas Técnicas (Clic para Activar/Desactivar):
                              </span>
                              <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                                {Object.entries(CATEGORIAS_HABILIDADES)
                                  .filter(([key]) => key !== 'GESTION')
                                  .flatMap(([, cat]) => cat.skills)
                                  .map(skill => {
                                    const isSel = habilidadesTecnicas.includes(skill);
                                    return (
                                      <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleToggleTecnica(skill)}
                                        className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                          isSel 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-blue-50'
                                        }`}
                                      >
                                        {isSel ? '✓ ' : '+ '}{skill}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        /* MÓDULO ÚNICO PARA DESARROLLADOR */
                        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-300 dark:border-emerald-900/60 space-y-4">
                          
                          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-emerald-200 dark:border-emerald-800/60">
                            <button
                              type="button"
                              onClick={() => setActiveTabTecnicas('TODAS')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTabTecnicas === 'TODAS' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'}`}
                            >
                              Todas las Categorías
                            </button>
                            {Object.entries(CATEGORIAS_HABILIDADES).map(([key, cat]) => {
                              const IconComp = cat.icon;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setActiveTabTecnicas(key)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeTabTecnicas === key ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50'}`}
                                >
                                  <IconComp size={14} />
                                  <span>{cat.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customTecnicaInput}
                              onChange={(e) => setCustomTecnicaInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTecnica(); } }}
                              placeholder="Escriba tecnología / especialidad y presione Enter..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomTecnica}
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer shadow-sm"
                            >
                              + Agregar
                            </button>
                          </div>

                          <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 min-h-[48px] flex flex-wrap gap-2 items-center">
                            {habilidadesTecnicas.length === 0 ? (
                              <span className="text-xs text-zinc-400 italic">No hay habilidades seleccionadas. Haga clic en las sugerencias abajo...</span>
                            ) : (
                              habilidadesTecnicas.map(skill => (
                                <span key={skill} className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-black flex items-center gap-2 shadow-xs">
                                  <span>{skill}</span>
                                  <button type="button" onClick={() => handleToggleTecnica(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                                </span>
                              ))
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                                Sugerencias Rápidas Disponibles (Clic para Activar/Desactivar):
                              </span>
                              <span className="text-xs font-bold text-zinc-500">
                                {habilidadesTecnicas.length} seleccionadas
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                              {Object.entries(CATEGORIAS_HABILIDADES)
                                .filter(([key]) => activeTabTecnicas === 'TODAS' || activeTabTecnicas === key)
                                .flatMap(([, cat]) => cat.skills)
                                .map(skill => {
                                  const isSel = habilidadesTecnicas.includes(skill);
                                  return (
                                    <button
                                      key={skill}
                                      type="button"
                                      onClick={() => handleToggleTecnica(skill)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                        isSel 
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50'
                                      }`}
                                    >
                                      {isSel ? '✓ ' : '+ '}{skill}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>

                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleJumpToStep(2)}
                          className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                        >
                          ← Diapositiva Anterior (Paso 2)
                        </button>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={onVolver}
                            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={submitting}
                            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                          >
                            {submitting ? (
                              <><Loader2 size={16} className="animate-spin" /> Guardando en PostgreSQL...</>
                            ) : (
                              <><CheckCircle2 size={16} /> Finalizar & Enrolar Colaborador</>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            ) : (
              /* MODO LISTA CONTINUA (CONTINUOUS MODE) - MUESTRA TODOS LOS PASOS VERTICALMENTE CON ESPACIADO DE ESPACIO LIBRE */
              <div className="space-y-12">
                
                {/* SECCIÓN PASO 1 */}
                <div 
                  ref={step1Ref}
                  onClick={() => setActiveStep(1)}
                  className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-md space-y-6 cursor-pointer ${
                    activeStep === 1 
                      ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-2xl' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg">
                        <Shield size={22} />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                          1. Identificación & Credenciales de Acceso
                        </h2>
                        <p className="text-xs text-zinc-500 font-medium">Datos personales, número de cédula y correo corporativo</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombres *</label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => {
                          const val = e.target.value;
                          const auto = autoGenerarEmail(val, formData.apellido);
                          setFormData(prev => ({ ...prev, nombre: val, email: auto || prev.email }));
                        }}
                        placeholder="Ej. Roberto"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Apellidos *</label>
                      <input
                        type="text"
                        required
                        value={formData.apellido}
                        onChange={(e) => {
                          const val = e.target.value;
                          const auto = autoGenerarEmail(formData.nombre, val);
                          setFormData(prev => ({ ...prev, apellido: val, email: auto || prev.email }));
                        }}
                        placeholder="Ej. Gómez"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Rol de Seguridad *</label>
                      <select
                        value={formData.rol}
                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        disabled={lockRoleToDesarrollador}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-extrabold uppercase focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="DESARROLLADOR">DESARROLLADOR</option>
                        <option value="LIDER">LÍDER DE PROYECTO</option>
                        <option value="COORDINADOR">COORDINADOR</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">País *</label>
                      <select
                        value={formData.paisCodigo}
                        onChange={(e) => setFormData({ ...formData, paisCodigo: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-bold"
                      >
                        {PAISES_IDENTIFICACION.map(p => (
                          <option key={p.code} value={p.code}>[{p.flag}] {p.docTipo}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Identificación / Cédula *</label>
                      <input
                        type="text"
                        required
                        value={formData.identificacion}
                        onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                        placeholder="Número de cédula"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Correo Corporativo *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Correo Personal *</label>
                      <input
                        type="email"
                        required
                        value={formData.emailPersonal}
                        onChange={(e) => setFormData({ ...formData, emailPersonal: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN PASO 2 */}
                <div 
                  ref={step2Ref}
                  onClick={() => setActiveStep(2)}
                  className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-md space-y-6 cursor-pointer ${
                    activeStep === 2 
                      ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-2xl' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg">
                        <GraduationCap size={22} />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                          2. Perfil Profesional & Titulación
                        </h2>
                        <p className="text-xs text-zinc-500 font-medium">Titulación académica y categorización técnica principal</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Profesión / Titulación *</label>
                      <select
                        required
                        value={formData.profesion}
                        onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold cursor-pointer"
                      >
                        <option value="">-- Seleccionar Titulación --</option>
                        {TITULACIONES_PROFESIONALES.map((tit) => (
                          <option key={tit} value={tit}>{tit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Especialidad Principal *</label>
                      <select
                        required
                        value={formData.especialidad}
                        onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-bold cursor-pointer"
                      >
                        <option value="Backend Java & Spring Boot">Backend Java & Spring Boot</option>
                        <option value="Frontend React & TypeScript">Frontend React & TypeScript</option>
                        <option value="Diseño Figma & UI/UX">Diseño Figma & UI/UX</option>
                        <option value="Base de Datos PostgreSQL DBA">Base de Datos PostgreSQL DBA</option>
                        <option value="QA Automation & Testing">QA Automation & Testing</option>
                        <option value="DevOps & Infraestructura Cloud">DevOps & Infraestructura Cloud</option>
                        <option value="Gestión de Proyectos & Scrum Master">Gestión de Proyectos & Scrum Master</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN PASO 3 */}
                <div 
                  ref={step3Ref}
                  onClick={() => setActiveStep(3)}
                  className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-md space-y-6 cursor-pointer ${
                    activeStep === 3 
                      ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-2xl' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg">
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                          3. Stack Técnico & Habilidades WBS Categorizadas
                        </h2>
                        <p className="text-xs text-zinc-500 font-medium">Habilidades seleccionadas interactivamente</p>
                      </div>
                    </div>
                  </div>

                  {/* VISTA DE HABILIDADES */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 items-center">
                      {habilidadesTecnicas.length === 0 ? (
                        <span className="text-xs text-zinc-400 italic">No hay habilidades seleccionadas. Seleccione sugerencias del catálogo abajo...</span>
                      ) : (
                        habilidadesTecnicas.map(skill => (
                          <span key={skill} className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-black flex items-center gap-2">
                            <span>{skill}</span>
                            <button type="button" onClick={() => handleToggleTecnica(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 uppercase">
                        Sugerencias Rápidas Disponibles:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                        {Object.entries(CATEGORIAS_HABILIDADES).flatMap(([, cat]) => cat.skills).map(skill => {
                          const isSel = habilidadesTecnicas.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleToggleTecnica(skill)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                isSel ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50'
                              }`}
                            >
                              {isSel ? '✓ ' : '+ '}{skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      <span>Finalizar & Enrolar Colaborador</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}
