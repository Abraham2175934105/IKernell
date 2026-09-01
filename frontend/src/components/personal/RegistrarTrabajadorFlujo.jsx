import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Shield, GraduationCap, Code2, Briefcase, ChevronRight, 
  CheckCircle2, AlertTriangle, ArrowLeft, Loader2, Plus, X, Sparkles, 
  Check, Laptop, Database, Cpu, Wrench, FileCode, Edit3, Compass,
  ArrowRight, ArrowUp, Lock, CheckCircle, RefreshCw, KeyRound, Mail,
  AlertOctagon, Trash2, Layers, Filter, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
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

function ServerIcon({ size = 18, className = "" }) { return <Cpu size={size} className={className} />; }
function Code2Icon({ size = 18, className = "" }) { return <Code2 size={size} className={className} />; }
function DesignIcon({ size = 18, className = "" }) { return <Laptop size={size} className={className} />; }
function DatabaseIcon({ size = 18, className = "" }) { return <Database size={size} className={className} />; }
function QaIcon({ size = 18, className = "" }) { return <Wrench size={size} className={className} />; }
function CloudIcon({ size = 18, className = "" }) { return <FileCode size={size} className={className} />; }
function ManagementIcon({ size = 18, className = "" }) { return <Briefcase size={size} className={className} />; }

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

// VALIDACIÓN ESTRICTA Y CAPACIDAD DE DÍGITOS SEGÚN PAÍS
const PAISES_IDENTIFICACION = [
  { 
    code: 'CO', 
    flag: '🇨🇴', 
    docTipo: 'Cédula de Ciudadanía', 
    placeholder: 'Ej. 1018459203 (6 a 10 dígitos numéricos)', 
    minLength: 6, 
    maxLength: 10, 
    numericOnly: true, 
    errText: '❌ La Cédula de Ciudadanía (Colombia) debe tener entre 6 y 10 dígitos numéricos.' 
  },
  { 
    code: 'MX', 
    flag: '🇲🇽', 
    docTipo: 'CURP / INE', 
    placeholder: 'Ej. GOMA800310HDFR12', 
    minLength: 10, 
    maxLength: 18, 
    numericOnly: false, 
    errText: '❌ El CURP/INE (México) debe tener entre 10 y 18 caracteres alfanuméricos.' 
  },
  { 
    code: 'PE', 
    flag: '🇵🇪', 
    docTipo: 'DNI Perú', 
    placeholder: 'Ej. 45892014 (8 dígitos)', 
    minLength: 8, 
    maxLength: 8, 
    numericOnly: true, 
    errText: '❌ El DNI de Perú debe tener exactamente 8 dígitos numéricos.' 
  },
  { 
    code: 'CL', 
    flag: '🇨🇱', 
    docTipo: 'RUT Chile', 
    placeholder: 'Ej. 18459203K', 
    minLength: 8, 
    maxLength: 10, 
    numericOnly: false, 
    errText: '❌ El RUT chileno debe tener entre 8 y 10 caracteres.' 
  },
  { 
    code: 'AR', 
    flag: '🇦🇷', 
    docTipo: 'DNI Argentina', 
    placeholder: 'Ej. 35892014 (7 a 8 dígitos)', 
    minLength: 7, 
    maxLength: 8, 
    numericOnly: true, 
    errText: '❌ El DNI argentino debe tener entre 7 y 8 dígitos numéricos.' 
  },
  { 
    code: 'EC', 
    flag: '🇪🇨', 
    docTipo: 'Cédula Ecuador', 
    placeholder: 'Ej. 1718459203 (10 dígitos)', 
    minLength: 10, 
    maxLength: 10, 
    numericOnly: true, 
    errText: '❌ La Cédula ecuatoriana debe tener exactamente 10 dígitos numéricos.' 
  }
];

export function RegistrarTrabajadorFlujo({ onVolver, onSuccess, lockRoleToDesarrollador = false }) {
  const api = useApi();

  const [activeStep, setActiveStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState('next');
  const [completedSteps, setCompletedSteps] = useState({ 1: false, 2: false, 3: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [userCreatedSuccessData, setUserCreatedSuccessData] = useState(null);
  const [showConfirmExitModal, setShowConfirmExitModal] = useState(false);
  const [existingTrabajadores, setExistingTrabajadores] = useState([]);

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

  // MULTI-DOMINIO TÉCNICO VINCULADO DINÁMICAMENTE
  const [selectedDominios, setSelectedDominios] = useState([]);

  const [customDirectivaInput, setCustomDirectivaInput] = useState('');
  const [customTecnicaInput, setCustomTecnicaInput] = useState('');
  const [activeTabTecnicas, setActiveTabTecnicas] = useState('TODAS');

  // Precargar colaboradores para validación de unicidad en tiempo real
  useEffect(() => {
    const fetchTrabajadores = async () => {
      try {
        const endpoint = lockRoleToDesarrollador ? '/lider/trabajadores' : '/coordinador/trabajadores';
        const res = await api.get(endpoint);
        if (Array.isArray(res.data)) {
          setExistingTrabajadores(res.data);
        }
      } catch (e) {
        console.warn("No se pudieron precargar los trabajadores para unicidad local:", e);
      }
    };
    fetchTrabajadores();
  }, []);

  // AUTO-GENERADOR DE CORREO CORPORATIVO CON GARANTÍA DE UNICIDAD INMEDIATA (JAMÁS SE REPITE)
  const autoGenerarEmail = (nom, ape) => {
    if (!nom || !ape) return '';
    const cleanNom = nom.trim().toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
    const cleanApe = ape.trim().toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
    if (!cleanNom || !cleanApe) return '';
    
    let baseEmail = `${cleanNom}.${cleanApe}@ikernell.org`;

    // Si ya existe un colaborador en PostgreSQL con ese correo, le añade sufijo numérico único
    if (existingTrabajadores.some(t => t.email?.trim().toLowerCase() === baseEmail.toLowerCase())) {
      let counter = 2;
      while (existingTrabajadores.some(t => t.email?.trim().toLowerCase() === `${cleanNom}.${cleanApe}${counter}@ikernell.org`.toLowerCase())) {
        counter++;
      }
      baseEmail = `${cleanNom}.${cleanApe}${counter}@ikernell.org`;
    }
    return baseEmail;
  };

  // Helper para buscar a qué categoría pertenece una técnica
  const findCategoryKeyForSkill = (skillName) => {
    for (const [catKey, catObj] of Object.entries(CATEGORIAS_HABILIDADES)) {
      if (catObj.skills.includes(skillName)) {
        return catKey;
      }
    }
    return null;
  };

  // Validations
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // VALIDACIONES ESTRUCTURADAS Y UNICIDAD ESTRICTA DE 3 CAMPOS (CÉDULA CON LONGITUD DE PAÍS, EMAIL CORP, EMAIL PERS)
  const validateStep1 = () => {
    const errors = {};
    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      errors.nombre = 'Ingrese los nombres del colaborador.';
    }
    if (!formData.apellido.trim() || formData.apellido.trim().length < 2) {
      errors.apellido = 'Ingrese los apellidos del colaborador.';
    }
    
    // UNICIDAD Y VALIDACIÓN DE CÉDULA/IDENTIFICACIÓN POR PAÍS
    const cleanId = formData.identificacion.trim();
    const currentPais = PAISES_IDENTIFICACION.find(p => p.code === formData.paisCodigo) || PAISES_IDENTIFICACION[0];

    if (!cleanId || cleanId.length < currentPais.minLength || cleanId.length > currentPais.maxLength) {
      errors.identificacion = currentPais.errText;
    } else if (currentPais.numericOnly && !/^\d+$/.test(cleanId)) {
      errors.identificacion = currentPais.errText;
    } else if (existingTrabajadores.some(t => t.identificacion?.trim().toLowerCase() === cleanId.toLowerCase())) {
      errors.identificacion = '❌ Esta cédula / identificación ya se encuentra registrada en PostgreSQL por otro colaborador.';
    }

    // UNICIDAD 2: CORREO CORPORATIVO ÚNICO (@ikernell.org)
    const cleanEmail = formData.email.trim();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      errors.email = 'Ingrese un correo corporativo válido con formato usuario@ikernell.org.';
    } else if (existingTrabajadores.some(t => t.email?.trim().toLowerCase() === cleanEmail.toLowerCase())) {
      errors.email = '❌ Este correo corporativo ya pertenece a otro colaborador registrado en el sistema. Modifique el nombre/apellido o agregue un sufijo.';
    }

    // UNICIDAD 3: CORREO PERSONAL / ALTERNATIVO (NUNCA PUEDE EXISTIR PREVIAMENTE EN LA BASE DE DATOS)
    const cleanPersonal = formData.emailPersonal.trim();
    if (!cleanPersonal || !isValidEmail(cleanPersonal)) {
      errors.emailPersonal = 'Ingrese un correo personal o alternativo válido para notificaciones.';
    } else if (existingTrabajadores.some(t => t.emailPersonal?.trim().toLowerCase() === cleanPersonal.toLowerCase())) {
      errors.emailPersonal = '❌ Este correo personal ya se encuentra registrado previamente por otro trabajador en el sistema. Utilice un correo personal único.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('🔒 Existen errores de formato, unicidad o datos incompletos. Revise los campos marcados en rojo.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.profesion) {
      errors.profesion = 'Seleccione la profesión o titulación académica del colaborador.';
    }
    if (!formData.especialidad) {
      errors.especialidad = 'Seleccione la especialidad técnica principal.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('🔒 Faltan campos obligatorios en el Perfil Profesional.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const validateStep3 = () => {
    const errors = {};
    if (habilidadesTecnicas.length === 0 && habilidadesDirectivas.length === 0) {
      errors.habilidades = 'Debe seleccionar al menos 1 habilidad o tecnología en el Stack WBS.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('🔒 Seleccione al menos una tecnología o competencia técnica para finalizar.');
      return false;
    }
    setFormError(null);
    return true;
  };

  // Solicitar confirmación al hacer clic en Salir / Volver si hay información ingresada
  const handleRequestExit = () => {
    const isFormDirty = formData.nombre.trim() || 
                        formData.apellido.trim() || 
                        formData.identificacion.trim() || 
                        formData.email.trim() || 
                        formData.emailPersonal.trim() || 
                        habilidadesDirectivas.length > 0 || 
                        habilidadesTecnicas.length > 0;

    if (isFormDirty && !userCreatedSuccessData) {
      setShowConfirmExitModal(true);
    } else {
      onVolver();
    }
  };

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

  // NAVEGACIÓN Y SALTO CON VALIDACIÓN OBLIGATORIA
  const handleJumpToStep = (targetStep) => {
    if (targetStep === activeStep) return;

    if (targetStep > activeStep) {
      if (activeStep === 1 && !validateStep1()) return;
      if (activeStep === 2 && !validateStep2()) return;
      if (targetStep === 3 && !validateStep1()) return;
      if (targetStep === 3 && !validateStep2()) return;
    }

    setSlideDirection(targetStep > activeStep ? 'next' : 'prev');
    setActiveStep(targetStep);
  };

  const handleNextStep = (nextStep) => {
    if (nextStep === 2) {
      if (!validateStep1()) return;
      setCompletedSteps(prev => ({ ...prev, 1: true }));
    } else if (nextStep === 3) {
      if (!validateStep2()) return;
      setCompletedSteps(prev => ({ ...prev, 2: true }));
    }

    setSlideDirection('next');
    setActiveStep(nextStep);
  };

  const handlePrevStep = (prevStep) => {
    setFormError(null);
    setFieldErrors({});
    setSlideDirection('prev');
    setActiveStep(prevStep);
  };

  const handleToggleDirectiva = (skill) => {
    if (habilidadesDirectivas.includes(skill)) {
      setHabilidadesDirectivas(habilidadesDirectivas.filter(s => s !== skill));
    } else {
      setHabilidadesDirectivas([...habilidadesDirectivas, skill]);
      if (fieldErrors.habilidades) setFieldErrors(prev => ({ ...prev, habilidades: null }));
    }
  };

  const handleAddCustomDirectiva = () => {
    if (customDirectivaInput.trim() && !habilidadesDirectivas.includes(customDirectivaInput.trim())) {
      setHabilidadesDirectivas([...habilidadesDirectivas, customDirectivaInput.trim()]);
      setCustomDirectivaInput('');
      if (fieldErrors.habilidades) setFieldErrors(prev => ({ ...prev, habilidades: null }));
    }
  };

  // TOGGLE DE DOMINIO MANUALMENTE (PERMITE ELEGIR MÚLTIPLES DOMINIOS AL TIEMPO)
  const handleToggleDominio = (catKey) => {
    if (catKey === 'TODAS') {
      setActiveTabTecnicas('TODAS');
      return;
    }

    setActiveTabTecnicas(catKey);

    if (selectedDominios.includes(catKey)) {
      setSelectedDominios(selectedDominios.filter(d => d !== catKey));
    } else {
      setSelectedDominios([...selectedDominios, catKey]);
    }
  };

  // TOGGLE DE TÉCNICA CON AUTO-VINCULACIÓN AL DOMINIO CORRESPONDIENTE
  const handleToggleTecnica = (skill) => {
    if (habilidadesTecnicas.includes(skill)) {
      setHabilidadesTecnicas(habilidadesTecnicas.filter(s => s !== skill));
    } else {
      setHabilidadesTecnicas([...habilidadesTecnicas, skill]);
      
      // AUTO-VINCULAR AUTOMÁTICAMENTE EL DOMINIO PADRE AL SELECCIONAR CUALQUIER TÉCNICA
      const parentCatKey = findCategoryKeyForSkill(skill);
      if (parentCatKey && !selectedDominios.includes(parentCatKey)) {
        setSelectedDominios(prev => [...prev, parentCatKey]);
      }

      if (fieldErrors.habilidades) setFieldErrors(prev => ({ ...prev, habilidades: null }));
    }
  };

  const handleAddCustomTecnica = () => {
    if (customTecnicaInput.trim() && !habilidadesTecnicas.includes(customTecnicaInput.trim())) {
      setHabilidadesTecnicas([...habilidadesTecnicas, customTecnicaInput.trim()]);
      setCustomTecnicaInput('');

      // Auto vincular a la pestaña activa si no es TODAS
      if (activeTabTecnicas !== 'TODAS' && !selectedDominios.includes(activeTabTecnicas)) {
        setSelectedDominios(prev => [...prev, activeTabTecnicas]);
      }

      if (fieldErrors.habilidades) setFieldErrors(prev => ({ ...prev, habilidades: null }));
    }
  };

  const handleResetForm = () => {
    setFormData({
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
    setHabilidadesDirectivas([]);
    setHabilidadesTecnicas([]);
    setSelectedDominios([]);
    setCompletedSteps({ 1: false, 2: false, 3: false });
    setActiveStep(1);
    setUserCreatedSuccessData(null);
    setFormError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormError(null);

    if (!validateStep1()) {
      handleJumpToStep(1);
      return;
    }
    if (!validateStep2()) {
      handleJumpToStep(2);
      return;
    }
    if (!validateStep3()) {
      return;
    }

    setSubmitting(true);
    try {
      // PRESERVAR DOMINIOS Y TÉCNICAS CONSOLIDADAS SIN PERDER INFORMACIÓN DE CATEGORÍA
      const dominiosLabels = selectedDominios.map(k => CATEGORIAS_HABILIDADES[k]?.label).filter(Boolean);
      
      const payloadTecnicasConsolidadas = [
        ...dominiosLabels.map(d => `[Dominio: ${d}]`),
        ...habilidadesTecnicas
      ].join(', ');

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
        habilidadesTecnicas: payloadTecnicasConsolidadas,
        estado: true
      };

      const endpoint = lockRoleToDesarrollador ? '/lider/trabajadores' : '/coordinador/trabajadores';
      await api.post(endpoint, payload);

      setCompletedSteps({ 1: true, 2: true, 3: true });
      
      const createdUser = {
        nombreCompleto: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
        email: formData.email.trim(),
        emailPersonal: formData.emailPersonal.trim(),
        rol: formData.rol,
        identificacion: formData.identificacion.trim()
      };

      setUserCreatedSuccessData(createdUser);
      toast.success(`Usuario ${createdUser.nombreCompleto} creado con éxito`, {
        duration: 5000,
        style: {
          background: '#065f46',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '16px'
        }
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error registrando trabajador:", err);
      const msg = err.response?.data?.message || err.message || 'Error al conectar con PostgreSQL.';
      setFormError(msg);
      toast.error(msg);

      // Resaltar en rojo el campo duplicado específico retornado por Spring Boot / PostgreSQL
      const newFieldErrors = {};
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('cédula') || msgLower.includes('identificación') || msgLower.includes('identificacion')) {
        newFieldErrors.identificacion = '❌ Esta cédula / identificación ya se encuentra registrada en el sistema.';
        handleJumpToStep(1);
      }
      if (msgLower.includes('correo electrónico corporativo') || msgLower.includes('correo corporativo') || msgLower.includes('@ikernell.org')) {
        newFieldErrors.email = '❌ Este correo corporativo ya pertenece a otro colaborador registrado.';
        handleJumpToStep(1);
      }
      if (msgLower.includes('correo electrónico personal') || msgLower.includes('correo personal')) {
        newFieldErrors.emailPersonal = '❌ Este correo personal ya pertenece a otro colaborador registrado en la base de datos.';
        handleJumpToStep(1);
      }
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // VARIANTES DE ANIMACIÓN VERTICAL SINCRONIZADA
  const verticalSlideVariants = {
    enter: (direction) => ({
      y: direction === 'next' ? 80 : -80,
      opacity: 0,
      scale: 0.97
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring', stiffness: 320, damping: 28 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (direction) => ({
      y: direction === 'next' ? -80 : 80,
      opacity: 0,
      scale: 0.97,
      transition: {
        y: { type: 'spring', stiffness: 320, damping: 28 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Componente de barra de filtros por categoría directamente integrado en la tarjeta del Stack Técnico
  const CategoryFilterBar = () => (
    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-4 shadow-inner">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Filter size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>FILTRAR SUGERENCIAS POR DOMINIO TÉCNICO / CATEGORÍA:</span>
        </span>
        
        {/* DOMINIO ACTUAL ACTIVO */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[0.65rem] font-bold text-zinc-400 uppercase">Enfoque:</span>
          <span className="text-[0.68rem] font-black text-emerald-700 dark:text-emerald-300 uppercase bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            {activeTabTecnicas === 'TODAS' ? 'TODAS LAS CATEGORÍAS' : CATEGORIAS_HABILIDADES[activeTabTecnicas]?.label}
          </span>
        </div>
      </div>

      {/* BOTONES DE DOMINIOS CON SELECCIÓN MÚLTIPLE INTELIGENTE */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setActiveTabTecnicas('TODAS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTabTecnicas === 'TODAS' 
              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/40 scale-105' 
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          🌐 Todas las Categorías
        </button>

        {Object.entries(CATEGORIAS_HABILIDADES).map(([key, cat]) => {
          const IconComp = cat.icon;
          const isFilterActive = activeTabTecnicas === key;
          const isDomainSelected = selectedDominios.includes(key);
          
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleToggleDominio(key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                isFilterActive
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/40 scale-105' 
                  : isDomainSelected
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <IconComp size={15} />
              <span>{cat.label}</span>
              {isDomainSelected && <span className="text-[0.65rem] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-extrabold">✓</span>}
            </button>
          );
        })}
      </div>

      {/* INSIGNIAS DE DOMINIOS SELECCIONADOS VINCULADOS */}
      {selectedDominios.length > 0 && (
        <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80 flex items-center gap-2 flex-wrap">
          <span className="text-[0.65rem] uppercase font-extrabold text-zinc-500 flex items-center gap-1">
            <Tag size={12} className="text-emerald-600" /> Dominios Seleccionados ({selectedDominios.length}):
          </span>
          {selectedDominios.map(dKey => (
            <span key={dKey} className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[0.68rem] flex items-center gap-1.5 shadow-xs">
              <span>{CATEGORIAS_HABILIDADES[dKey]?.label}</span>
              <button type="button" onClick={() => setSelectedDominios(selectedDominios.filter(k => k !== dKey))} className="hover:text-red-200 font-bold">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const currentPaisConfig = PAISES_IDENTIFICACION.find(p => p.code === formData.paisCodigo) || PAISES_IDENTIFICACION[0];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-16 relative">

      {/* MODAL INTERACTIVO DE CONFIRMACIÓN AL INTENTAR SALIR / ABANDONAR */}
      <AnimatePresence>
        {showConfirmExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-red-200 dark:border-red-900/60 shadow-2xl space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner border border-red-200 dark:border-red-800">
                <AlertOctagon size={32} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  ¿Está seguro que desea salir?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                  Si abandona este formulario en este momento, <strong className="text-red-600 dark:text-red-400">se perderá toda la información</strong> ingresada para este colaborador.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmExitModal(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-extrabold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                >
                  Continuar Registrando
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmExitModal(false);
                    onVolver();
                  }}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 transition-all"
                >
                  <Trash2 size={16} />
                  <span>Sí, Salir y Descartar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* 1. HEADER STICKY PERMANENTE CON ALTA VISIBILIDAD */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200/90 dark:border-zinc-800/90 px-4 sm:px-6 lg:px-10 py-4 shadow-sm transition-all">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* TÍTULO Y BOTÓN DE RETORNO CON ADVERTENCIA DE SALIDA */}
          <div className="flex items-center gap-3.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRequestExit}
              className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition-all cursor-pointer shadow-xs"
              title="Salir y descartar datos"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-0.5 rounded-full text-[0.7rem] font-black tracking-wider uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Alta Corporativa PostgreSQL
                </span>
                {lockRoleToDesarrollador && (
                  <span className="px-3.5 py-0.5 rounded-full text-[0.7rem] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Solo Desarrolladores
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 mt-0.5">
                <span>Registrar Nuevo Colaborador</span>
                <UserPlus size={22} className="text-blue-600" />
              </h1>
            </div>
          </div>

          {/* STEPPER SUPERIOR CON BOTONES INTERACTIVOS */}
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs self-stretch md:self-auto justify-around">
            {[
              { num: 1, label: 'Credenciales de Acceso' },
              { num: 2, label: 'Perfil Profesional' },
              { num: 3, label: 'Stack de Habilidades WBS' }
            ].map((st, idx) => (
              <React.Fragment key={st.num}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleJumpToStep(st.num)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    activeStep === st.num
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/40'
                      : completedSteps[st.num]
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[0.7rem] flex items-center justify-center font-mono font-bold ${
                    activeStep === st.num ? 'bg-white text-blue-700' : completedSteps[st.num] ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {completedSteps[st.num] ? '✓' : st.num}
                  </span>
                  <span className="hidden sm:inline font-extrabold">{st.label}</span>
                </motion.button>
                {idx < 2 && <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-700 shrink-0" />}
              </React.Fragment>
            ))}
          </div>

        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL CON ANCHO EXPANDIDO PARA MONITORES */}
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 space-y-8">
        
        {/* MODAL O BANNER INTERACTIVO DE ÉXITO TRAS CREAR TRABAJADOR */}
        <AnimatePresence>
          {userCreatedSuccessData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-2xl space-y-6 border border-emerald-400/40 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-400/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
                    🎉
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-full text-[0.65rem] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md text-emerald-100 border border-white/30">
                      Alta Exitosa PostgreSQL
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      Usuario {userCreatedSuccessData.nombreCompleto} creado con éxito
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/30"
                  >
                    <RefreshCw size={16} />
                    <span>Registrar Otro Colaborador</span>
                  </button>
                  <button
                    onClick={onVolver}
                    className="px-6 py-2.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 size={18} />
                    <span>Ir a Consola de Personal</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-[0.7rem] uppercase font-black text-emerald-200 block flex items-center gap-1.5">
                    <Shield size={14} /> Correo Corporativo Generado
                  </span>
                  <span className="font-mono font-black text-base text-white block">{userCreatedSuccessData.email}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[0.7rem] uppercase font-black text-emerald-200 block flex items-center gap-1.5">
                    <Mail size={14} /> Correo Personal Notificado
                  </span>
                  <span className="font-semibold text-white block">{userCreatedSuccessData.emailPersonal}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[0.7rem] uppercase font-black text-emerald-200 block flex items-center gap-1.5">
                    <KeyRound size={14} /> Contraseña Aleatoria Enviada
                  </span>
                  <span className="font-mono font-extrabold text-white block">Enviada a Correo Personal</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MENSAJE DE ERROR O ADVERTENCIA DE VALIDACIÓN OBLIGATORIA */}
        {formError && !userCreatedSuccessData && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/70 border-2 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs sm:text-sm font-extrabold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Lock size={18} />
              </div>
              <span>{formError}</span>
            </div>
            <button onClick={() => setFormError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg cursor-pointer">
              <X size={18} />
            </button>
          </motion.div>
        )}

        {/* LAYOUT DE 2 COLUMNAS EXPANDIDO CON ESPACIADO GENEROSO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* COLUMNA IZQUIERDA: LÍNEA DE TIEMPO LATERAL FUTURISTA Y LIMPIA (STICKY) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-xl space-y-6">
              
              {/* ENCABEZADO DEL TIMELINE CON PROGRESO */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Compass size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-wider">
                      Avance del Registro
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold">Validación Paso a Paso</p>
                  </div>
                </div>
                <span className="text-xs font-black font-mono px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
                  {progressPercentage}%
                </span>
              </div>

              {/* BARRA DE PROGRESO */}
              <div className="space-y-1">
                <div className="w-full h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              {/* LÍNEA DE TIEMPO CONECTADA FUTURISTA */}
              <div className="relative pl-3 space-y-6 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-emerald-500">
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
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleJumpToStep(st.num)}
                      className={`relative flex items-start gap-3.5 text-left w-full p-4 rounded-2xl transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-blue-50/90 dark:bg-blue-950/70 border-2 border-blue-500/80 shadow-md ring-2 ring-blue-500/20' 
                          : isCompleted 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-black z-10 shrink-0 shadow-sm transition-all ${
                        isActive 
                          ? `bg-gradient-to-br ${st.colorGradient} text-white ring-4 ring-blue-500/30 scale-110` 
                          : isCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                      }`}>
                        {isCompleted ? '✓' : <IconComp size={18} />}
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm font-black truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            Paso {st.num}: {st.titulo}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1 font-medium">
                          {st.sub}
                        </p>
                        {isActive && (
                          <div className="pt-1.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                            <span className="text-[0.62rem] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                              Enfoque Activo
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* COLUMNA DERECHA: DIAPOSITIVA SLIDE VERTICAL CON UNICIDAD DE 3 CAMPOS Y ALERTAS DE ERROR */}
          <div className="lg:col-span-8">
            <div className="min-h-[60vh] relative">
              <AnimatePresence custom={slideDirection} mode="wait">
                
                {/* SLIDE PASO 1: CREDENCIALES */}
                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    custom={slideDirection}
                    variants={verticalSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-blue-500/80 dark:border-blue-500/60 shadow-2xl space-y-8 ring-4 ring-blue-500/10"
                  >
                    <div className="flex justify-between items-start pb-5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-blue-500/20">
                          <Shield size={26} />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            Paso 1 de 3 • Autenticación & Unicidad Obligatoria
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                            1. Identificación & Credenciales de Acceso
                          </h2>
                        </div>
                      </div>

                      <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-black border border-blue-300 dark:border-blue-800 flex items-center gap-2">
                        <Edit3 size={14} className="animate-pulse" /> Editando Credenciales
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* NOMBRES */}
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">Nombres *</label>
                        <input
                          type="text"
                          required
                          value={formData.nombre}
                          onChange={(e) => {
                            const val = e.target.value;
                            const auto = autoGenerarEmail(val, formData.apellido);
                            setFormData(prev => ({ ...prev, nombre: val, email: auto || prev.email }));
                            if (fieldErrors.nombre) setFieldErrors(prev => ({ ...prev, nombre: null }));
                          }}
                          placeholder="Ej. Roberto"
                          className={`w-full px-4 py-3.5 rounded-xl border transition-all text-xs sm:text-sm font-semibold focus:outline-none ${
                            fieldErrors.nombre 
                              ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                        {fieldErrors.nombre && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 mt-1.5 animate-bounce">
                            <AlertTriangle size={13} /> {fieldErrors.nombre}
                          </p>
                        )}
                      </div>

                      {/* APELLIDOS */}
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">Apellidos *</label>
                        <input
                          type="text"
                          required
                          value={formData.apellido}
                          onChange={(e) => {
                            const val = e.target.value;
                            const auto = autoGenerarEmail(formData.nombre, val);
                            setFormData(prev => ({ ...prev, apellido: val, email: auto || prev.email }));
                            if (fieldErrors.apellido) setFieldErrors(prev => ({ ...prev, apellido: null }));
                          }}
                          placeholder="Ej. Gómez"
                          className={`w-full px-4 py-3.5 rounded-xl border transition-all text-xs sm:text-sm font-semibold focus:outline-none ${
                            fieldErrors.apellido 
                              ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                        {fieldErrors.apellido && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 mt-1.5 animate-bounce">
                            <AlertTriangle size={13} /> {fieldErrors.apellido}
                          </p>
                        )}
                      </div>

                      {/* ROL CORPORATIVO */}
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">Rol Corporativo *</label>
                        {lockRoleToDesarrollador ? (
                          <div className="w-full px-4 py-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-extrabold flex items-center justify-between">
                            <span>DESARROLLADOR</span>
                            <span className="text-[0.65rem] font-black uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2.5 py-0.5 rounded-md">Asignado por Líder</span>
                          </div>
                        ) : (
                          <select
                            value={formData.rol}
                            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 text-xs sm:text-sm font-extrabold uppercase focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="DESARROLLADOR">DESARROLLADOR (Operatividad WBS)</option>
                            <option value="LIDER">LÍDER DE PROYECTO (Perfil Híbrido Dual)</option>
                            <option value="COORDINADOR">COORDINADOR GENERAL</option>
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">País / Documento *</label>
                        <select
                          value={formData.paisCodigo}
                          onChange={(e) => {
                            const newPais = e.target.value;
                            const newPaisConfig = PAISES_IDENTIFICACION.find(p => p.code === newPais) || PAISES_IDENTIFICACION[0];
                            let currentId = formData.identificacion;
                            if (newPaisConfig.numericOnly) {
                              currentId = currentId.replace(/\D/g, '');
                            }
                            if (currentId.length > newPaisConfig.maxLength) {
                              currentId = currentId.slice(0, newPaisConfig.maxLength);
                            }
                            setFormData({ ...formData, paisCodigo: newPais, identificacion: currentId });
                            if (fieldErrors.identificacion) setFieldErrors(prev => ({ ...prev, identificacion: null }));
                          }}
                          className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 text-xs sm:text-sm font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {PAISES_IDENTIFICACION.map(p => (
                            <option key={p.code} value={p.code}>[{p.flag}] {p.docTipo}</option>
                          ))}
                        </select>
                      </div>

                      {/* UNICIDAD 1: IDENTIFICACIÓN / CÉDULA CON RESTRICCIÓN ESTRICTA DE DÍGITOS Y FORMATO */}
                      <div className="sm:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                            Número de Identificación / Cédula * ({currentPaisConfig.minLength === currentPaisConfig.maxLength ? `${currentPaisConfig.maxLength} dígitos` : `${currentPaisConfig.minLength} a ${currentPaisConfig.maxLength} dígitos`})
                          </label>
                          <span className="text-[0.68rem] text-red-600 dark:text-red-400 font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40">
                            Único e Irrepetible
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={currentPaisConfig.maxLength}
                          value={formData.identificacion}
                          onChange={(e) => {
                            let rawVal = e.target.value;
                            if (currentPaisConfig.numericOnly) {
                              rawVal = rawVal.replace(/\D/g, ''); // Filtrar inmediatamente cualquier letra o símbolo no numérico
                            }
                            if (rawVal.length > currentPaisConfig.maxLength) {
                              rawVal = rawVal.slice(0, currentPaisConfig.maxLength);
                            }
                            setFormData({ ...formData, identificacion: rawVal });
                            if (fieldErrors.identificacion) setFieldErrors(prev => ({ ...prev, identificacion: null }));
                          }}
                          placeholder={currentPaisConfig.placeholder}
                          className={`w-full px-4 py-3.5 rounded-xl border transition-all text-xs sm:text-sm font-mono font-bold focus:outline-none ${
                            fieldErrors.identificacion 
                              ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                        {fieldErrors.identificacion ? (
                          <p className="text-xs text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 mt-1.5 animate-bounce">
                            <AlertTriangle size={13} /> {fieldErrors.identificacion}
                          </p>
                        ) : (
                          <p className="text-[0.7rem] text-zinc-400 font-semibold mt-1">
                            {currentPaisConfig.numericOnly ? 'Solo se permiten dígitos numéricos (0-9).' : 'Permite caracteres alfanuméricos.'} máx {currentPaisConfig.maxLength} caracteres.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* UNICIDAD 2: CORREO CORPORATIVO AUTO-GENERADO CON BANNER EXPLICATIVO */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200">Correo Corporativo Único *</label>
                          <span className="text-[0.68rem] text-blue-700 dark:text-blue-300 font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-300 dark:border-blue-800">
                            Auto-Generado Sistema
                          </span>
                        </div>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                          }}
                          placeholder="nombre.apellido@ikernell.org"
                          className={`w-full px-4 py-3.5 rounded-xl border transition-all text-xs sm:text-sm font-mono font-bold focus:outline-none ${
                            fieldErrors.email 
                              ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                        {fieldErrors.email ? (
                          <p className="text-xs text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 mt-1.5 animate-bounce">
                            <AlertTriangle size={13} /> {fieldErrors.email}
                          </p>
                        ) : (
                          <div className="mt-2 p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-[0.72rem] text-blue-900 dark:text-blue-200 font-bold flex items-start gap-2 shadow-xs">
                            <Sparkles size={15} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <span>El correo corporativo es <strong>generado automáticamente por el sistema</strong> al ingresar nombre y apellido, garantizando que sea 100% único e irrepetible.</span>
                          </div>
                        )}
                      </div>

                      {/* UNICIDAD 3: CORREO PERSONAL CON NOTIFICACIÓN DE CONTRASEÑA ALEATORIA */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200">Correo Personal / Alternativo *</label>
                          <span className="text-[0.68rem] text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                            Envío de Contraseña
                          </span>
                        </div>
                        <input
                          type="email"
                          required
                          value={formData.emailPersonal}
                          onChange={(e) => {
                            setFormData({ ...formData, emailPersonal: e.target.value });
                            if (fieldErrors.emailPersonal) setFieldErrors(prev => ({ ...prev, emailPersonal: null }));
                          }}
                          placeholder="correo.personal@gmail.com"
                          className={`w-full px-4 py-3.5 rounded-xl border transition-all text-xs sm:text-sm font-semibold focus:outline-none ${
                            fieldErrors.emailPersonal 
                              ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                        {fieldErrors.emailPersonal ? (
                          <p className="text-xs text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 mt-1.5 animate-bounce">
                            <AlertTriangle size={13} /> {fieldErrors.emailPersonal}
                          </p>
                        ) : (
                          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-[0.72rem] text-emerald-900 dark:text-emerald-200 font-bold flex items-start gap-2 shadow-xs">
                            <KeyRound size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>A este correo personal se le enviará automáticamente la <strong>contraseña temporal aleatoria y única</strong> generada por el sistema para su primer ingreso. Tampoco puede estar registrado previamente.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BOTÓN SIGUIENTE PASO */}
                    <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNextStep(2)}
                        className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black flex items-center gap-3 cursor-pointer shadow-lg shadow-blue-500/25 transition-all"
                      >
                        <span>Continuar al Paso 2: Perfil Profesional</span>
                        <ArrowRight size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* SLIDE PASO 2: PERFIL PROFESIONAL */}
                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    custom={slideDirection}
                    variants={verticalSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-indigo-500/80 dark:border-indigo-500/60 shadow-2xl space-y-8 ring-4 ring-indigo-500/10"
                  >
                    <div className="flex justify-between items-start pb-5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-indigo-500/20">
                          <GraduationCap size={26} />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Paso 2 de 3 • Especialidad Profesional
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                            2. Perfil Profesional & Titulación Académica
                          </h2>
                        </div>
                      </div>

                      <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                        <Edit3 size={14} className="animate-pulse" /> Editando Perfil
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {/* PROFESIÓN */}
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">Profesión / Titulación Académica *</label>
                        <select
                          required
                          value={formData.profesion}
                          onChange={(e) => {
                            setFormData({ ...formData, profesion: e.target.value });
                            if (fieldErrors.profesion) setFieldErrors(prev => ({ ...prev, profesion: null }));
                          }}
                          className={`w-full px-4 py-3.5 rounded-xl border transition-all text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer ${
                            fieldErrors.profesion 
                              ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 focus:border-indigo-500'
                          }`}
                        >
                          <option value="">-- Seleccionar Titulación --</option>
                          {TITULACIONES_PROFESIONALES.map((tit) => (
                            <option key={tit} value={tit}>{tit}</option>
                          ))}
                        </select>
                        {fieldErrors.profesion && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 mt-1.5 animate-bounce">
                            <AlertTriangle size={13} /> {fieldErrors.profesion}
                          </p>
                        )}
                      </div>

                      {/* ESPECIALIDAD */}
                      <div>
                        <label className="block text-xs sm:text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">Especialidad Técnica Principal *</label>
                        <select
                          required
                          value={formData.especialidad}
                          onChange={(e) => {
                            setFormData({ ...formData, especialidad: e.target.value });
                            if (fieldErrors.especialidad) setFieldErrors(prev => ({ ...prev, especialidad: null }));
                          }}
                          className={`w-full px-4 py-3.5 rounded-xl border transition-all text-xs sm:text-sm font-bold focus:outline-none cursor-pointer ${
                            fieldErrors.especialidad 
                              ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 focus:border-indigo-500'
                          }`}
                        >
                          <option value="Backend Java & Spring Boot">Backend Java & Spring Boot</option>
                          <option value="Frontend React & TypeScript">Frontend React & TypeScript</option>
                          <option value="Diseño Figma & UI/UX">Diseño Figma & UI/UX</option>
                          <option value="Base de Datos PostgreSQL DBA">Base de Datos PostgreSQL DBA</option>
                          <option value="QA Automation & Testing">QA Automation & Testing</option>
                          <option value="DevOps & Infraestructura Cloud">DevOps & Infraestructura Cloud</option>
                          <option value="Gestión de Proyectos & Scrum Master">Gestión de Proyectos & Scrum Master</option>
                        </select>
                        {fieldErrors.especialidad && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1 mt-1.5 animate-bounce">
                            <AlertTriangle size={13} /> {fieldErrors.especialidad}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* NAVEGACIÓN TOTALMENTE SEPARADA CON FLEX RESPONSIVO */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handlePrevStep(1)}
                        className="px-6 py-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-extrabold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowUp size={16} className="-rotate-90" />
                        <span>Volver al Paso 1 (Credenciales)</span>
                      </button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNextStep(3)}
                        className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-indigo-500/25 transition-all"
                      >
                        <span>Continuar al Paso 3: Stack Habilidades WBS</span>
                        <ArrowRight size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* SLIDE PASO 3: HABILIDADES WBS CON MULTI-SELECCIÓN DE DOMINIOS Y AUTO-VINCULACIÓN AL ELEGIR TÉCNICAS */}
                {activeStep === 3 && (
                  <motion.div
                    key="step3"
                    custom={slideDirection}
                    variants={verticalSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 shadow-2xl space-y-8 ring-4 ring-emerald-500/10"
                  >
                    <div className="flex justify-between items-start pb-5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-emerald-500/20">
                          <Sparkles size={26} />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            Paso 3 de 3 • Habilidades Categorizadas & Dominios
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                            3. Stack Técnico & Habilidades WBS Categorizadas
                          </h2>
                        </div>
                      </div>

                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                        <Edit3 size={14} className="animate-pulse" /> Editando Habilidades
                      </span>
                    </div>

                    {/* ALERTA DE ERROR SI NO SELECCIONÓ NINGUNA HABILIDAD */}
                    {fieldErrors.habilidades && (
                      <p className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs sm:text-sm text-red-700 dark:text-red-300 font-extrabold flex items-center gap-2 animate-bounce">
                        <AlertTriangle size={16} /> {fieldErrors.habilidades}
                      </p>
                    )}

                    {/* SI ES LÍDER -> 2 CAMPOS DE HABILIDADES */}
                    {formData.rol === 'LIDER' ? (
                      <div className="space-y-6">
                        
                        {/* 3A: DIRECTIVAS AMBER */}
                        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-300 dark:border-amber-900/60 space-y-5">
                          <div className="flex justify-between items-center pb-2 border-b border-amber-200 dark:border-amber-800/60">
                            <span className="font-black text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-xs">
                                <Briefcase size={16} />
                              </div>
                              <span>3A. Habilidades Directivas & Gestión de Líder ({habilidadesDirectivas.length})</span>
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customDirectivaInput}
                              onChange={(e) => setCustomDirectivaInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomDirectiva(); } }}
                              placeholder="Escriba una habilidad de gestión y presione Enter..."
                              className="flex-1 px-4 py-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomDirectiva}
                              className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-sm"
                            >
                              + Agregar
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-800/60 min-h-[50px] items-center">
                            {habilidadesDirectivas.length === 0 ? (
                              <span className="text-xs text-zinc-400 italic">No hay habilidades directivas seleccionadas. Haga clic en las sugerencias abajo...</span>
                            ) : (
                              habilidadesDirectivas.map(skill => (
                                <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs">
                                  <span>{skill}</span>
                                  <button type="button" onClick={() => handleToggleDirectiva(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                                </span>
                              ))
                            )}
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200 uppercase block">
                              Sugerencias Rápidas de Gestión:
                            </span>
                            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
                              {CATEGORIAS_HABILIDADES.GESTION.skills.map(skill => {
                                const isSel = habilidadesDirectivas.includes(skill);
                                return (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleToggleDirectiva(skill)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
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

                        {/* 3B: TÉCNICAS BLUE CON BARRA DE FILTROS Y VINCULACIÓN AUTOMÁTICA DE DOMINIO */}
                        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-300 dark:border-blue-900/60 space-y-5">
                          <div className="flex justify-between items-center pb-2 border-b border-blue-200 dark:border-blue-800/60">
                            <span className="font-black text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                                <Code2 size={16} />
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
                              className="flex-1 px-4 py-3.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomTecnica}
                              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-sm"
                            >
                              + Agregar
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-blue-200 dark:border-blue-800/60 min-h-[50px] items-center">
                            {habilidadesTecnicas.length === 0 ? (
                              <span className="text-xs text-zinc-400 italic">No hay tecnologías seleccionadas aún. Haga clic en las sugerencias abajo...</span>
                            ) : (
                              habilidadesTecnicas.map(skill => (
                                <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs">
                                  <span>{skill}</span>
                                  <button type="button" onClick={() => handleToggleTecnica(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                                </span>
                              ))
                            )}
                          </div>

                          {/* BARRA DE FILTRADO POR CATEGORÍA DIRECTAMENTE DENTRO DEL 3B */}
                          <CategoryFilterBar />

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 uppercase block">
                                SUGERENCIAS TÉCNICAS ({activeTabTecnicas === 'TODAS' ? 'TODAS LAS CATEGORÍAS' : CATEGORIAS_HABILIDADES[activeTabTecnicas]?.label.toUpperCase()}):
                              </span>
                              <span className="text-xs font-bold text-blue-600">
                                Clic en una tecnología para seleccionarla y auto-vincular su Dominio
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-1">
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
                                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                                        isSel 
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30' 
                                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-950/40'
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
                      /* MÓDULO ÚNICO PARA DESARROLLADOR CON BARRA DE FILTROS INTEGRADA DIRECTAMENTE ADENTRO */
                      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-300 dark:border-emerald-900/60 space-y-5">
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customTecnicaInput}
                            onChange={(e) => setCustomTecnicaInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTecnica(); } }}
                            placeholder="Escriba tecnología / especialidad (ej. Java 17, Figma, PostgreSQL) y Enter..."
                            className="flex-1 px-4 py-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomTecnica}
                            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-sm"
                          >
                            + Agregar
                          </button>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 min-h-[56px] flex flex-wrap gap-2 items-center">
                          {habilidadesTecnicas.length === 0 ? (
                            <span className="text-xs sm:text-sm text-zinc-400 italic">No hay habilidades seleccionadas. Haga clic en las sugerencias abajo...</span>
                          ) : (
                            habilidadesTecnicas.map(skill => (
                              <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs">
                                <span>{skill}</span>
                                <button type="button" onClick={() => handleToggleTecnica(skill)} className="hover:text-red-600 cursor-pointer font-black text-sm">×</button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* BARRA DE FILTRADO POR CATEGORÍA DIRECTAMENTE DENTRO DEL MÓDULO DE DESARROLLADOR */}
                        <CategoryFilterBar />

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                              SUGERENCIAS TÉCNICAS ({activeTabTecnicas === 'TODAS' ? 'TODAS LAS CATEGORÍAS' : CATEGORIAS_HABILIDADES[activeTabTecnicas]?.label.toUpperCase()}):
                            </span>
                            <span className="text-xs font-bold text-zinc-500">
                              {habilidadesTecnicas.length} seleccionadas
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-1">
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
                                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer ${
                                      isSel 
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30' 
                                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
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

                    {/* BOTONES DE NAVEGACIÓN Y CREACIÓN DE TRABAJADOR */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handlePrevStep(2)}
                        className="px-6 py-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-extrabold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowUp size={16} className="-rotate-90" />
                        <span>Volver al Paso 2 (Perfil Profesional)</span>
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleRequestExit}
                          className="px-6 py-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={submitting}
                          className="px-9 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-50"
                        >
                          {submitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Guardando en PostgreSQL...</>
                          ) : (
                            <><CheckCircle2 size={18} /> Crear Trabajador</>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
