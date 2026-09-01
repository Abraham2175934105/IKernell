import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Shield, GraduationCap, Code2, Briefcase, ChevronRight, 
  CheckCircle2, AlertTriangle, ArrowLeft, Loader2, Plus, X, Sparkles, 
  Check, Laptop, Database, Cpu, Wrench, FileCode, Edit3, Circle,
  ChevronDown, Layers, Target, Compass
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
  const [activeTabDirectivas, setActiveTabDirectivas] = useState('TODAS');
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

  // Cálculo del porcentaje dinámico de avance
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

  // Handler para saltar suavemente a un paso al hacer clic en el Stepper / Timeline
  const handleJumpToStep = (stepNum) => {
    setActiveStep(stepNum);
    const targetRef = stepNum === 1 ? step1Ref : stepNum === 2 ? step2Ref : step3Ref;
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNextStep = (nextStep, targetRef) => {
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
    setActiveStep(nextStep);
    setTimeout(() => {
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* BARRA SUPERIOR DE NAVEGACIÓN Y ENCABEZADO REFORZADO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onVolver}
            className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer shadow-sm"
            title="Volver a la vista anterior"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[0.65rem] font-extrabold tracking-wider uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Alta Corporativa PostgreSQL
              </span>
              {lockRoleToDesarrollador && (
                <span className="px-3 py-0.5 rounded-full text-[0.65rem] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Exclusivo Desarrolladores
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-1 flex items-center gap-2">
              <span>Registrar Nuevo Colaborador</span>
              <UserPlus size={24} className="text-blue-600" />
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Flujo secuencial avanzado con indicador dinámico de progreso y perfil dual para Líderes
            </p>
          </div>
        </div>

        {/* STEPPER SUPERIOR CON ACCESO DIRECTO INTERACTIVO A CADA PASO */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm self-stretch lg:self-auto justify-around">
          {[
            { num: 1, label: 'Credenciales', ref: step1Ref },
            { num: 2, label: 'Perfil', ref: step2Ref },
            { num: 3, label: 'Habilidades WBS', ref: step3Ref }
          ].map((st, idx) => (
            <React.Fragment key={st.num}>
              <button
                type="button"
                onClick={() => handleJumpToStep(st.num)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeStep === st.num
                    ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-500/30'
                    : completedSteps[st.num]
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[0.68rem] flex items-center justify-center font-mono font-bold ${
                  activeStep === st.num ? 'bg-white text-blue-700' : completedSteps[st.num] ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {completedSteps[st.num] ? '✓' : st.num}
                </span>
                <span>{st.label}</span>
              </button>
              {idx < 2 && <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-700 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

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

      {/* GRID DE 2 COLUMNAS: TIMELINE DE PROGRESO LATERAL IZQUIERDO Y FORMULARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: LÍNEA DE TIEMPO LATERAL & CONTADOR DE AVANCE (STICKY) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-5">
            
            {/* ENCABEZADO DEL TIMELINE */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-blue-600" />
                <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-wider">
                  Avance del Registro
                </h3>
              </div>
              <span className="text-xs font-black font-mono px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {progressPercentage}% Completado
              </span>
            </div>

            {/* BARRA DE PROGRESO VISUAL */}
            <div className="space-y-1">
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm"
                />
              </div>
            </div>

            {/* LÍNEA DE TIEMPO CONECTADA */}
            <div className="relative pl-3 space-y-6 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {[
                { 
                  num: 1, 
                  titulo: 'Identificación & Credenciales', 
                  sub: 'Datos de cédula y correo corporativo',
                  ref: step1Ref
                },
                { 
                  num: 2, 
                  titulo: 'Perfil Profesional & Titulación', 
                  sub: 'Especialidad y titulación académica',
                  ref: step2Ref
                },
                { 
                  num: 3, 
                  titulo: 'Stack de Habilidades WBS', 
                  sub: formData.rol === 'LIDER' ? 'Perfil Dual: Gestión + Desarrollo' : 'Competencias técnicas categorizadas',
                  ref: step3Ref
                }
              ].map(st => {
                const isActive = activeStep === st.num;
                const isCompleted = completedSteps[st.num];

                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => handleJumpToStep(st.num)}
                    className={`relative flex items-start gap-3 text-left w-full p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 ring-2 ring-blue-500/20' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* NODO DEL TIMELINE */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-extrabold z-10 shrink-0 shadow-sm ${
                      isActive 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' 
                        : isCompleted 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                    }`}>
                      {isCompleted ? '✓' : st.num}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-black truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          Paso {st.num}: {st.titulo}
                        </span>
                        {isActive && (
                          <span className="text-[0.58rem] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0 animate-pulse">
                            Editando
                          </span>
                        )}
                        {isCompleted && !isActive && (
                          <span className="text-[0.58rem] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                            Listo
                          </span>
                        )}
                      </div>
                      <p className="text-[0.68rem] text-zinc-500 line-clamp-1">
                        {st.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* BOTÓN RÁPIDO DE REGISTRO EN BARRA LATERAL */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Guardando en PostgreSQL...</>
                ) : (
                  <><CheckCircle2 size={16} /> Guardar & Enrolar Colaborador</>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO SECUENCIAL CON RESALTADO DINÁMICO */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* PASO 1: IDENTIFICACIÓN Y CREDENCIALES */}
            <div 
              ref={step1Ref} 
              onClick={() => setActiveStep(1)}
              className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-md space-y-5 cursor-pointer ${
                activeStep === 1 
                  ? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/30 shadow-xl' 
                  : 'border-zinc-200 dark:border-zinc-800 opacity-95 hover:border-zinc-300'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm border ${
                    activeStep === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  }`}>
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Shield size={18} className="text-blue-500" /> 1. Identificación & Credenciales de Acceso
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">Datos personales, número de cédula y generación automática de correo corporativo</p>
                  </div>
                </div>

                {activeStep === 1 ? (
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[0.68rem] font-black border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
                    <Edit3 size={12} className="animate-pulse" /> Editando este Paso
                  </span>
                ) : completedSteps[1] ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[0.68rem] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Paso Completado
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="md:col-span-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleNextStep(2, step2Ref)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <span>Continuar al Paso 2: Perfil Profesional</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* PASO 2: PERFIL PROFESIONAL */}
            <div 
              ref={step2Ref} 
              onClick={() => setActiveStep(2)}
              className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-md space-y-5 cursor-pointer ${
                activeStep === 2 
                  ? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/30 shadow-xl' 
                  : 'border-zinc-200 dark:border-zinc-800 opacity-95 hover:border-zinc-300'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm border ${
                    activeStep === 2 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                  }`}>
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <GraduationCap size={18} className="text-indigo-500" /> 2. Perfil Profesional & Titulación
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">Titulación académica y categorización técnica principal</p>
                  </div>
                </div>

                {activeStep === 2 ? (
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[0.68rem] font-black border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
                    <Edit3 size={12} className="animate-pulse" /> Editando este Paso
                  </span>
                ) : completedSteps[2] ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[0.68rem] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Paso Completado
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Profesión / Titulación Académica *</label>
                  <select
                    required
                    value={formData.profesion}
                    onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
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

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleJumpToStep(1)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                >
                  ← Volver al Paso 1
                </button>
                <button
                  type="button"
                  onClick={() => handleNextStep(3, step3Ref)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <span>Continuar al Paso 3: Stack de Habilidades WBS</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* PASO 3: STACK TÉCNICO & HABILIDADES WBS (0 PRESELECCIONADAS DE INICIO) */}
            <div 
              ref={step3Ref} 
              onClick={() => setActiveStep(3)}
              className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-md space-y-6 cursor-pointer ${
                activeStep === 3 
                  ? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/30 shadow-xl' 
                  : 'border-zinc-200 dark:border-zinc-800 opacity-95 hover:border-zinc-300'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm border ${
                    activeStep === 3 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  }`}>
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-500" /> 3. Stack Técnico & Habilidades WBS Categorizadas
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">
                      {formData.rol === 'LIDER' 
                        ? 'Perfil Híbrido Activo: Seleccione competencias directivas de gestión y competencias técnicas de desarrollo'
                        : 'Seleccione de las sugerencias rápidas por categoría o agregue habilidades personalizadas'}
                    </p>
                  </div>
                </div>

                {activeStep === 3 ? (
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[0.68rem] font-black border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
                    <Edit3 size={12} className="animate-pulse" /> Editando este Paso
                  </span>
                ) : completedSteps[3] ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[0.68rem] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Paso Completado
                  </span>
                ) : null}
              </div>

              {/* SI EL ROL ES LÍDER -> MOSTRAR DOS CAMPOS SEPARADOS (DIRECTIVAS Y TÉCNICAS) SIN HABILIDADES SELECCIONADAS DE ENTRADA */}
              {formData.rol === 'LIDER' ? (
                <div className="space-y-6">
                  
                  {/* CAMPO 1: HABILIDADES DIRECTIVAS & GESTIÓN */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-amber-200/60 dark:border-amber-800/60">
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-2">
                        <Briefcase size={16} className="text-amber-600" /> 3A. Habilidades Directivas & Gestión de Líder ({habilidadesDirectivas.length})
                      </span>
                      <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Gestión & Agilidad
                      </span>
                    </div>

                    {/* Input personalizado */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDirectivaInput}
                        onChange={(e) => setCustomDirectivaInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomDirectiva(); } }}
                        placeholder="Agregar habilidad directiva personalizada (ej. Gestión de Riesgos) y Enter..."
                        className="flex-1 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomDirectiva}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                      >
                        + Agregar
                      </button>
                    </div>

                    {/* Badges seleccionados (VACÍO POR DEFECTO HASTA QUE EL USUARIO HAGA CLIC) */}
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200/60 dark:border-amber-800/60 min-h-[42px] items-center">
                      {habilidadesDirectivas.length === 0 ? (
                        <span className="text-[0.7rem] text-zinc-400 italic">No hay habilidades directivas seleccionadas. Haga clic en las sugerencias abajo...</span>
                      ) : (
                        habilidadesDirectivas.map(skill => (
                          <span key={skill} className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5">
                            <span>{skill}</span>
                            <button type="button" onClick={() => handleToggleDirectiva(skill)} className="hover:text-red-600 cursor-pointer font-black">×</button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Sugerencias Rápidas Directivas */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[0.65rem] font-bold text-amber-800 dark:text-amber-300 uppercase block">
                        Sugerencias Rápidas de Gestión (Clic para Activar/Desactivar):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {CATEGORIAS_HABILIDADES.GESTION.skills.map(skill => {
                          const isSel = habilidadesDirectivas.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleToggleDirectiva(skill)}
                              className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold border transition-all cursor-pointer ${
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

                  {/* CAMPO 2: STACK TÉCNICO & DESARROLLO */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200/60 dark:border-blue-800/60">
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-2">
                        <Code2 size={16} className="text-blue-600" /> 3B. Stack Técnico & Habilidades WBS / Desarrollo ({habilidadesTecnicas.length})
                      </span>
                      <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Desarrollo Técnico
                      </span>
                    </div>

                    {/* Filtro de Categoría de Sugerencias */}
                    <div className="flex flex-wrap gap-1 pb-1">
                      <button
                        type="button"
                        onClick={() => setActiveTabTecnicas('TODAS')}
                        className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold transition-all cursor-pointer ${activeTabTecnicas === 'TODAS' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                      >
                        Todas las Categorías
                      </button>
                      {Object.entries(CATEGORIAS_HABILIDADES).filter(([k]) => k !== 'GESTION').map(([key, cat]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveTabTecnicas(key)}
                          className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold transition-all cursor-pointer ${activeTabTecnicas === key ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Input personalizado */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTecnicaInput}
                        onChange={(e) => setCustomTecnicaInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTecnica(); } }}
                        placeholder="Escriba tecnología (ej. Figma, Java 17, React) y presione Enter..."
                        className="flex-1 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTecnica}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                      >
                        + Agregar
                      </button>
                    </div>

                    {/* Badges seleccionados (VACÍO POR DEFECTO) */}
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200/60 dark:border-blue-800/60 min-h-[42px] items-center">
                      {habilidadesTecnicas.length === 0 ? (
                        <span className="text-[0.7rem] text-zinc-400 italic">No hay tecnologías seleccionadas aún. Haga clic en las sugerencias abajo...</span>
                      ) : (
                        habilidadesTecnicas.map(skill => (
                          <span key={skill} className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5">
                            <span>{skill}</span>
                            <button type="button" onClick={() => handleToggleTecnica(skill)} className="hover:text-red-600 cursor-pointer font-black">×</button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Sugerencias Rápidas Técnicas por Categoría */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[0.65rem] font-bold text-blue-800 dark:text-blue-300 uppercase block">
                        Sugerencias Rápidas Técnicas (Clic para Activar/Desactivar):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {Object.entries(CATEGORIAS_HABILIDADES)
                          .filter(([key]) => key !== 'GESTION' && (activeTabTecnicas === 'TODAS' || activeTabTecnicas === key))
                          .flatMap(([, cat]) => cat.skills)
                          .map(skill => {
                            const isSel = habilidadesTecnicas.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleToggleTecnica(skill)}
                                className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-bold border transition-all cursor-pointer ${
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
                /* SI EL ROL ES DESARROLLADOR O COORDINADOR -> MÓDULO ÚNICO CATEGORIZADO (0 PRESELECCIONADAS DE DEFECTO) */
                <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-4">
                  
                  {/* Selector de Categoría de Especialidad */}
                  <div className="flex flex-wrap gap-1.5 pb-1 border-b border-blue-200/60 dark:border-blue-800/60">
                    <button
                      type="button"
                      onClick={() => setActiveTabTecnicas('TODAS')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTabTecnicas === 'TODAS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'}`}
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
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeTabTecnicas === key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-blue-50'}`}
                        >
                          <IconComp size={14} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input personalizado */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTecnicaInput}
                      onChange={(e) => setCustomTecnicaInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTecnica(); } }}
                      placeholder="Escriba una tecnología / habilidad especial y presione Enter..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTecnica}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* Badges seleccionados (VACÍO POR DEFECTO) */}
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 min-h-[48px] flex flex-wrap gap-1.5 items-center">
                    {habilidadesTecnicas.length === 0 ? (
                      <span className="text-xs text-zinc-400 italic">No hay habilidades preseleccionadas. Seleccione sugerencias abajo o escriba personalizadas...</span>
                    ) : (
                      habilidadesTecnicas.map(skill => (
                        <span key={skill} className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 text-xs font-extrabold flex items-center gap-2 shadow-xs">
                          <span>{skill}</span>
                          <button type="button" onClick={() => handleToggleTecnica(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Sugerencias Rápidas por Categoría Activa */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                        Sugerencias Rápidas Disponibles (Clic para Activar/Desactivar):
                      </span>
                      <span className="text-[0.65rem] font-bold text-zinc-500">
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
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
              )}

              {/* BOTÓN FINAL DE GUARDAR */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleJumpToStep(2)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                >
                  ← Volver al Paso 2
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onVolver}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Guardando en PostgreSQL...</>
                    ) : (
                      <><CheckCircle2 size={16} /> Guardar & Registrar Colaborador</>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
