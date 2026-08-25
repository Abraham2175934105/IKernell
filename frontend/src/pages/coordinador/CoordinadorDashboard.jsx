import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  Users, UserPlus, UserX, UserCheck, Search, Shield, CheckCircle2, 
  Mail, Phone, Clock, FileText, AlertTriangle, Sparkles, Filter, X,
  Loader2, RefreshCw, Inbox, RotateCcw, MessageSquare, History, Edit3, Send, Calendar,
  Code2, Plus, Check, Layers, Briefcase, GraduationCap, BadgeCheck, Cpu, Tag, ChevronDown,
  ChevronLeft, ChevronRight, Lock, Eye, EyeOff, Key, Globe, Flag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PredictorBurnout } from '../../components/dashboard/PredictorBurnout';

const ROLE_SKILL_PROFILES = {
  DESARROLLADOR: {
    label: 'Desarrollador (Operatividad WBS)',
    tituloModulo: '3. Habilidades Técnicas & Stack de Desarrollo (WBS)',
    subtitulo: 'Tecnologías y lenguajes clave para la asignación y ejecución de actividades WBS',
    sugerencias: [
      'Java 17', 'Spring Boot 3', 'React.js', 'PostgreSQL', 'Docker',
      'TypeScript', 'Tailwind CSS', 'AWS', 'Python', 'Git & GitHub',
      'REST APIs', 'Microservicios', 'Next.js', 'Linux', 'GraphQL',
      'CI/CD Pipelines', 'Redis', 'Kubernetes', 'Node.js', 'Jest / Testing'
    ],
    placeholderProfesion: 'Profesión o disciplina técnica (ej. Ingeniero de Software, Desarrollador Full Stack)',
    placeholderEspecialidad: 'Especialidad técnica principal (ej. Backend Java, Frontend React, Cloud DevOps)',
    badgeTag: 'Recomendado para asignación WBS',
    badgeTagStyle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconName: 'Code2'
  },
  LIDER: {
    label: 'Líder de Proyecto (Gestión & Asignación)',
    tituloModulo: '3. Competencias de Liderazgo, Gestión Ágil & Arquitectura',
    subtitulo: 'Habilidades de gestión de proyectos, metodologías ágiles y supervisión técnica de entregables',
    sugerencias: [
      'Gestión de Proyectos', 'Scrum Master', 'Metodologías Ágiles', 'Planificación WBS',
      'Liderazgo de Equipos', 'Gestión de Riesgos', 'Estimación de Esfuerzo', 'Arquitectura de Software',
      'Code Review', 'Jira / Confluence', 'Java / Spring Boot', 'React / Frontend',
      'CI/CD & DevOps', 'Negociación Técnica', 'Garantía de Calidad'
    ],
    placeholderProfesion: 'Profesión o disciplina académica (ej. Tech Lead, Scrum Master, Project Manager)',
    placeholderEspecialidad: 'Enfoque de liderazgo o arquitectura (ej. Gestión de Proyectos Ágiles, Arquitectura Distribuida)',
    badgeTag: 'Perfil de Liderazgo (Opcional)',
    badgeTagStyle: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconName: 'Briefcase'
  },
  COORDINADOR: {
    label: 'Coordinador (Administración Global)',
    tituloModulo: '3. Competencias de Coordinación, Operaciones & Talento',
    subtitulo: 'Habilidades en gestión de talento humano, administración operativa, presupuestos y gobernanza TI',
    sugerencias: [
      'Gestión de Talento Humano', 'Coordinación Operativa', 'Administración de Personal',
      'Atención de Casos Web', 'Presupuestos & Costos', 'Planificación Estratégica',
      'Métricas de Productividad', 'Gobernanza TI', 'Cumplimiento Normativo',
      'Resolución de Conflictos', 'Negociación con Clientes', 'Auditoría de Procesos'
    ],
    placeholderProfesion: 'Profesión o titulación directiva (ej. Director de Operaciones, MBA, Administrador)',
    placeholderEspecialidad: 'Área de coordinación (ej. Dirección de Operaciones & Talento, Gobernanza TI)',
    badgeTag: 'Perfil Administrativo (Opcional)',
    badgeTagStyle: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    iconName: 'Shield'
  }
};

// Validador Estricto de Documentos de Identificación por País / Algoritmos Nacionales
const PAISES_IDENTIFICACION = [
  { 
    code: 'CO', 
    nombre: 'Colombia', 
    docTipo: 'Cédula de Ciudadanía (CC)', 
    flag: '🇨🇴',
    placeholder: 'Ej. 1018459203 (6 a 10 dígitos numéricos)',
    validate: (val) => {
      const clean = val.trim();
      if (!clean) return { valid: false, message: 'Ingrese la cédula de ciudadanía.' };
      if (!/^\d+$/.test(clean)) return { valid: false, message: 'La cédula colombiana debe contener únicamente dígitos numéricos.' };
      if (clean.length < 6 || clean.length > 10) return { valid: false, message: 'La cédula debe contener entre 6 y 10 dígitos numéricos.' };
      return { valid: true, message: 'Cédula de Ciudadanía Válida [Colombia]' };
    }
  },
  { 
    code: 'MX', 
    nombre: 'México', 
    docTipo: 'CURP / INE', 
    flag: '🇲🇽',
    placeholder: 'Ej. VECJ880326HDFRRN09 (18 caracteres)',
    validate: (val) => {
      const clean = val.trim().toUpperCase();
      if (!clean) return { valid: false, message: 'Ingrese la clave CURP.' };
      const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
      if (!curpRegex.test(clean)) return { valid: false, message: 'Formato de CURP inválido (4 letras + 6 números + H/M + 5 letras + homoclave).' };
      return { valid: true, message: 'CURP Válido [México]' };
    }
  },
  { 
    code: 'ES', 
    nombre: 'España', 
    docTipo: 'DNI / NIE', 
    flag: '🇪🇸',
    placeholder: 'Ej. 12345678Z (8 números + 1 letra control)',
    validate: (val) => {
      const clean = val.trim().toUpperCase();
      if (!clean) return { valid: false, message: 'Ingrese el DNI / NIE.' };
      const dniRegex = /^\d{8}[A-Z]$/;
      if (!dniRegex.test(clean)) return { valid: false, message: 'Formato DNI inválido (debe tener 8 números y 1 letra final de control).' };
      const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const num = parseInt(clean.substring(0, 8), 10);
      const letraEsperada = letras[num % 23];
      if (clean.charAt(8) !== letraEsperada) {
        return { valid: false, message: `Letra de control incorrecta. Se esperaba '${letraEsperada}' para ese número DNI.` };
      }
      return { valid: true, message: 'DNI Válido [España]' };
    }
  },
  { 
    code: 'CL', 
    nombre: 'Chile', 
    docTipo: 'RUT / RUN', 
    flag: '🇨🇱',
    placeholder: 'Ej. 12345678-K (7-8 dígitos + dígito verificador)',
    validate: (val) => {
      const clean = val.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
      if (!clean) return { valid: false, message: 'Ingrese el RUT chileno.' };
      if (!/^\d{7,8}[0-9K]$/.test(clean)) return { valid: false, message: 'Formato RUT inválido (7 u 8 números más dígito verificador 0-9 o K).' };
      const body = clean.slice(0, -1);
      let dv = clean.slice(-1);
      let suma = 0;
      let multiplicador = 2;
      for (let i = body.length - 1; i >= 0; i--) {
        suma += parseInt(body.charAt(i), 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
      }
      const resto = 11 - (suma % 11);
      let dvEsperado = 'K';
      if (resto === 11) dvEsperado = '0';
      else if (resto === 10) dvEsperado = 'K';
      else dvEsperado = String(resto);

      if (dv !== dvEsperado) return { valid: false, message: `Dígito verificador RUT inválido. Se esperaba '${dvEsperado}'.` };
      return { valid: true, message: 'RUT Válido [Chile]' };
    }
  },
  { 
    code: 'PE', 
    nombre: 'Perú', 
    docTipo: 'DNI', 
    flag: '🇵🇪',
    placeholder: 'Ej. 72849102 (8 dígitos numéricos)',
    validate: (val) => {
      const clean = val.trim();
      if (!clean) return { valid: false, message: 'Ingrese el DNI peruano.' };
      if (!/^\d{8}$/.test(clean)) return { valid: false, message: 'El DNI peruano debe contener exactamente 8 dígitos numéricos.' };
      return { valid: true, message: 'DNI Válido [Perú]' };
    }
  },
  { 
    code: 'AR', 
    nombre: 'Argentina', 
    docTipo: 'DNI', 
    flag: '🇦🇷',
    placeholder: 'Ej. 40182938 (7 u 8 dígitos numéricos)',
    validate: (val) => {
      const clean = val.trim();
      if (!clean) return { valid: false, message: 'Ingrese el DNI argentino.' };
      if (!/^\d{7,8}$/.test(clean)) return { valid: false, message: 'El DNI argentino debe contener entre 7 y 8 dígitos numéricos.' };
      return { valid: true, message: 'DNI Válido [Argentina]' };
    }
  },
  { 
    code: 'US', 
    nombre: 'Estados Unidos', 
    docTipo: 'SSN / Tax ID', 
    flag: '🇺🇸',
    placeholder: 'Ej. 123-45-6789 (9 dígitos numéricos)',
    validate: (val) => {
      const clean = val.replace(/-/g, '').trim();
      if (!clean) return { valid: false, message: 'Ingrese el SSN.' };
      if (!/^\d{9}$/.test(clean)) return { valid: false, message: 'El SSN debe contener exactamente 9 dígitos numéricos.' };
      return { valid: true, message: 'SSN / Tax ID Válido [Estados Unidos]' };
    }
  },
  { 
    code: 'INT', 
    nombre: 'Internacional / Pasaporte', 
    docTipo: 'Pasaporte / ID Global', 
    flag: '🌐',
    placeholder: 'Ej. PA8492019 (6 a 15 caracteres alfanuméricos)',
    validate: (val) => {
      const clean = val.trim();
      if (!clean) return { valid: false, message: 'Ingrese el número de pasaporte.' };
      if (!/^[a-zA-Z0-9]{6,15}$/.test(clean)) return { valid: false, message: 'El pasaporte debe contener entre 6 y 15 caracteres alfanuméricos.' };
      return { valid: true, message: 'Pasaporte / ID Internacional Válido' };
    }
  }
];

// Variantes de animación de alto rendimiento y ultra rápidas (0.25s)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  }
};

/* ─── Skeleton Component ─── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6"><div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" /></td>
    <td className="py-4 px-6">
      <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
      <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
    </td>
    <td className="py-4 px-6">
      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-1" />
      <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
    </td>
    <td className="py-4 px-6"><div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
    <td className="py-4 px-6"><div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
    <td className="py-4 px-6 text-right"><div className="h-8 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl ml-auto" /></td>
  </tr>
);

// Estado vacío cuando no hay registros para mostrar
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center w-full">
    <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
      <Icon size={36} className="text-zinc-400 dark:text-zinc-500" />
    </div>
    <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-2">{title}</h3>
    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-4">{description}</p>
    {action && action}
  </div>
);

// Componente para Insignia de Rol con colores semánticos
const RoleBadge = ({ rol }) => {
  switch (rol) {
    case 'COORDINADOR':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
          <Shield size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
          Coordinador
        </span>
      );
    case 'LIDER':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
          <Sparkles size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
          Líder de Proyecto
        </span>
      );
    case 'DESARROLLADOR':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <Users size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          Desarrollador
        </span>
      );
  }
};

export const CoordinadorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('personal');
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingSolicitudId, setTogglingSolicitudId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState('TODOS'); // 'TODOS' | 'DESARROLLADOR' | 'LIDER' | 'COORDINADOR'
  const [techsSeleccionadas, setTechsSeleccionadas] = useState([]); // [] = Todas
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('TODOS'); // 'TODOS' | 'ACTIVO' | 'INHABILITADO'
  const [filtroSolicitudes, setFiltroSolicitudes] = useState('TODAS'); // 'TODAS' | 'PENDIENTE' | 'ATENDIDA' | 'REABIERTA' | 'EN_PROCESO'
  const [searchSolicitudQuery, setSearchSolicitudQuery] = useState('');
  const [fechaInicioSolicitud, setFechaInicioSolicitud] = useState('');
  const [fechaFinSolicitud, setFechaFinSolicitud] = useState('');

  // Estados de Paginación Inteligente (Por cantidad y por hojas)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5, 10, 25, 50 por página

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rolSeleccionado, techsSeleccionadas, estadoSeleccionado, itemsPerPage]);

  const handleSelectRole = (rolKey) => {
    // Selección Única Estricta de Rol
    const newRole = rolSeleccionado === rolKey ? 'TODOS' : rolKey;
    setRolSeleccionado(newRole);
    // Reiniciar habilidades al cambiar de rol para evitar incongruencias
    setTechsSeleccionadas([]);
  };

  const handleToggleTechFilter = (techName) => {
    setTechsSeleccionadas(prev =>
      prev.includes(techName) ? prev.filter(t => t !== techName) : [...prev, techName]
    );
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setRolSeleccionado('TODOS');
    setTechsSeleccionadas([]);
    setEstadoSeleccionado('TODOS');
  };
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSolicitudModal, setSelectedSolicitudModal] = useState(null);
  const [solicitudActionForm, setSolicitudActionForm] = useState({
    estado: 'ATENDIDA',
    notasAtencion: '',
    motivoReapertura: ''
  });
  const [submittingGestion, setSubmittingGestion] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const [newTrabajador, setNewTrabajador] = useState({
    identificacion: '',
    paisCodigo: 'CO',
    nombre: '',
    apellido: '',
    email: '',
    profesion: '',
    especialidad: '',
    rol: 'DESARROLLADOR',
    passwordHash: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Objeto de país seleccionado para validación de algoritmo de cédula/documento
  const paisActual = useMemo(() => {
    return PAISES_IDENTIFICACION.find(p => p.code === (newTrabajador.paisCodigo || 'CO')) || PAISES_IDENTIFICACION[0];
  }, [newTrabajador.paisCodigo]);

  // Validaciones estrictas en tiempo real por campo
  const docValidationResult = useMemo(() => {
    const raw = (newTrabajador.identificacion || '').trim();
    if (!raw) return { valid: false, message: 'Ingrese el número de documento de identificación.' };
    
    // Verificación de duplicados en la base de datos en tiempo real
    const existeDuplicado = (trabajadores || []).some(t => String(t.identificacion).trim() === raw);
    if (existeDuplicado) {
      return { valid: false, message: `La cédula / documento (${raw}) ya está registrado en PostgreSQL.` };
    }

    return paisActual.validate(raw);
  }, [newTrabajador.identificacion, paisActual, trabajadores]);

  const emailValidationResult = useMemo(() => {
    const raw = (newTrabajador.email || '').trim().toLowerCase();
    if (!raw) return { valid: false, message: 'El correo electrónico es obligatorio.' };
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rfcRegex.test(raw)) return { valid: false, message: 'Formato de correo electrónico inválido (ej. usuario@dominio.com).' };
    
    const existeEmail = (trabajadores || []).some(t => String(t.email || '').trim().toLowerCase() === raw);
    if (existeEmail) {
      return { valid: false, message: `El correo (${raw}) ya pertenece a otro colaborador registrado.` };
    }
    return { valid: true, message: 'Correo electrónico válido y disponible.' };
  }, [newTrabajador.email, trabajadores]);

  const nombreValidationResult = useMemo(() => {
    const raw = (newTrabajador.nombre || '').trim();
    if (!raw) return { valid: false, message: 'El nombre es obligatorio.' };
    if (raw.length < 2) return { valid: false, message: 'Debe contener al menos 2 caracteres.' };
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(raw)) return { valid: false, message: 'Solo se permiten letras, espacios y tildes.' };
    return { valid: true, message: 'Nombre válido.' };
  }, [newTrabajador.nombre]);

  const apellidoValidationResult = useMemo(() => {
    const raw = (newTrabajador.apellido || '').trim();
    if (!raw) return { valid: false, message: 'El apellido es obligatorio.' };
    if (raw.length < 2) return { valid: false, message: 'Debe contener al menos 2 caracteres.' };
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(raw)) return { valid: false, message: 'Solo se permiten letras, espacios y tildes.' };
    return { valid: true, message: 'Apellido válido.' };
  }, [newTrabajador.apellido]);

  // Cálculo memorizado de requisitos de contraseña
  const pwdValidity = useMemo(() => {
    const pwd = newTrabajador.passwordHash || '';
    return {
      minMax: pwd.length >= 8 && pwd.length <= 20,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      isValid: pwd.length >= 8 && pwd.length <= 20 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)
    };
  }, [newTrabajador.passwordHash]);

  // Generador de clave segura aleatoria (Cumple mín 1 Mayúscula, 1 Minúscula, 1 Número, 1 Símbolo)
  const generarPasswordAleatoria = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';

    let pass = '';
    pass += uppers.charAt(Math.floor(Math.random() * uppers.length));
    pass += lowers.charAt(Math.floor(Math.random() * lowers.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += symbols.charAt(Math.floor(Math.random() * symbols.length));

    const allChars = uppers + lowers + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    const shuffled = pass.split('').sort(() => 0.5 - Math.random()).join('');

    setNewTrabajador(prev => ({ ...prev, passwordHash: shuffled }));
    setShowPasswordInput(true);
    setFormErrors(p => ({ ...p, passwordHash: undefined }));
    toast.success(`Clave segura generada: ${shuffled}`);
  };

  // Peticiones API
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [trabajadoresRes, solicitudesRes] = await Promise.all([
        api.get('/coordinador/trabajadores'),
        api.get('/coordinador/solicitudes')
      ]);

      setTrabajadores(Array.isArray(trabajadoresRes) ? trabajadoresRes : []);
      setSolicitudes(Array.isArray(solicitudesRes) ? solicitudesRes : []);
    } catch (err) {
      console.error('Error cargando datos del coordinador:', err);
      toast.error('Error al sincronizar datos desde PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejadores de Habilidades Técnicas (Skills)
  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e) => {
    e?.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (!selectedSkills.includes(clean)) {
      setSelectedSkills(prev => [...prev, clean]);
    }
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  // Manejadores de eventos (Handlers) - Soft Delete / Toggle Estado Lógico
  const handleInhabilitar = async (id) => {
    // Regla de Negocio: Bloqueo de auto-inhabilitación del usuario autenticado
    const targetUser = trabajadores.find(t => t.idTrabajador === id);
    const isSelf = user && (
      user.idTrabajador === id || 
      user.id === id || 
      (user.email && targetUser?.email && user.email.toLowerCase() === targetUser.email.toLowerCase()) ||
      (user.identificacion && targetUser?.identificacion && String(user.identificacion) === String(targetUser.identificacion))
    );

    if (isSelf) {
      toast.error('Operación bloqueada por seguridad: No puedes inhabilitar tu propio usuario en sesión.');
      return;
    }

    // Si el usuario es un LÍDER activo, verificar si administra proyectos activos
    const isLider = targetUser && targetUser.rol && targetUser.rol.toUpperCase().includes('LIDER');
    const isActivo = targetUser && (targetUser.estado === true || targetUser.estado === 'ACTIVO');

    if (isLider && isActivo) {
      const proyectosAfectados = (proyectos || []).filter(p => p.lider?.idTrabajador === id || String(p.lider?.idTrabajador) === String(id));
      if (proyectosAfectados.length > 0) {
        setLiderAInhabilitar(targetUser);
        setProyectosDelLiderAfectado(proyectosAfectados);
        
        // Precargar con el primer otro líder activo disponible
        const otrosLideres = trabajadores.filter(t => t.idTrabajador !== id && t.estado && t.rol && t.rol.toUpperCase().includes('LIDER'));
        setNuevoLiderTargetId(otrosLideres.length > 0 ? String(otrosLideres[0].idTrabajador) : '');
        
        setShowReasignarLiderModal(true);
        return;
      }
    }

    // Ejecutar inhabilitación directa si no posee proyectos a su cargo
    try {
      setTogglingId(id);
      const updated = await api.patch(`/coordinador/trabajadores/${id}/estado`);
      
      setTrabajadores(prev => prev.map(t => t.idTrabajador === id ? updated : t));
      const estadoTexto = updated.estado ? 'Habilitado' : 'Inhabilitado';
      toast.success(`Trabajador marcado como ${estadoTexto} en la base de datos.`);
    } catch (err) {
      console.error('Error alternando estado del trabajador:', err);
      toast.error(err.message || 'Error al actualizar el estado del trabajador.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmarReasignacionEInhabilitar = async (e) => {
    e.preventDefault();
    if (!liderAInhabilitar || !nuevoLiderTargetId) {
      toast.error('Debe seleccionar a qué líder activo transferir los proyectos.');
      return;
    }

    setSubmittingReasignacionLider(true);
    try {
      await api.put(`/coordinador/trabajadores/${liderAInhabilitar.idTrabajador}/inhabilitar-reasignar?idNuevoLiderTarget=${nuevoLiderTargetId}`);

      const nuevoLiderObj = trabajadores.find(t => String(t.idTrabajador) === String(nuevoLiderTargetId));
      const nombreNuevoLider = nuevoLiderObj ? `${nuevoLiderObj.nombre} ${nuevoLiderObj.apellido}` : 'nuevo Líder';

      toast.success(`Portafolio de ${proyectosDelLiderAfectado.length} proyecto(s) reasignado a ${nombreNuevoLider} y líder ${liderAInhabilitar.nombre} inhabilitado.`);
      setShowReasignarLiderModal(false);
      setLiderAInhabilitar(null);

      // Recargar trabajadores y proyectos
      const [trabRes, proyRes] = await Promise.all([
        api.get('/coordinador/trabajadores').catch(() => []),
        api.get('/coordinador/proyectos').catch(() => [])
      ]);

      setTrabajadores(Array.isArray(trabRes) ? trabRes : []);
      setProyectos(Array.isArray(proyRes) ? proyRes : []);
    } catch (err) {
      console.error('Error al reasignar proyectos e inhabilitar:', err);
      toast.error(err?.message || 'Error al procesar la reasignación de proyectos.');
    } finally {
      setSubmittingReasignacionLider(false);
    }
  };

  const validarFormulario = (data) => {
    const errors = {};

    if (!docValidationResult.valid) {
      errors.identificacion = docValidationResult.message;
    }
    if (!nombreValidationResult.valid) {
      errors.nombre = nombreValidationResult.message;
    }
    if (!apellidoValidationResult.valid) {
      errors.apellido = apellidoValidationResult.message;
    }
    if (!emailValidationResult.valid) {
      errors.email = emailValidationResult.message;
    }

    const pwd = data.passwordHash || '';
    if (!pwd || pwd.length < 8 || pwd.length > 20) {
      errors.passwordHash = 'La contraseña debe tener entre 8 y 20 caracteres';
    } else if (!/[A-Z]/.test(pwd)) {
      errors.passwordHash = 'La contraseña debe incluir al menos 1 letra mayúscula (A-Z)';
    } else if (!/[a-z]/.test(pwd)) {
      errors.passwordHash = 'La contraseña debe incluir al menos 1 letra minúscula (a-z)';
    } else if (!/[0-9]/.test(pwd)) {
      errors.passwordHash = 'La contraseña debe incluir al menos 1 número (0-9)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrearTrabajador = async (e) => {
    e.preventDefault();
    if (!validarFormulario(newTrabajador)) return;

    try {
      setSubmitting(true);

      // Combinar especialidad técnica principal con las habilidades seleccionadas
      let especialidadFinal = newTrabajador.especialidad.trim();
      if (selectedSkills.length > 0) {
        const skillsFormatted = selectedSkills.join(', ');
        especialidadFinal = especialidadFinal 
          ? `${especialidadFinal} • [${skillsFormatted}]` 
          : `[${skillsFormatted}]`;
      }

      let emailFinal = newTrabajador.email.trim();
      if (!emailFinal.toLowerCase().endsWith('@ikernell.org')) {
        if (emailFinal.includes('@')) {
          emailFinal = emailFinal.substring(0, emailFinal.indexOf('@')) + '@ikernell.org';
        } else {
          emailFinal = emailFinal + '@ikernell.org';
        }
      }

      const nuevo = await api.post('/coordinador/trabajadores', {
        ...newTrabajador,
        identificacion: newTrabajador.identificacion.trim(),
        nombre: newTrabajador.nombre.trim(),
        apellido: newTrabajador.apellido.trim(),
        email: emailFinal,
        emailPersonal: newTrabajador.emailPersonal ? newTrabajador.emailPersonal.trim() : '',
        profesion: newTrabajador.profesion.trim() || 'Ingeniero de Software',
        especialidad: especialidadFinal || 'Desarrollador General',
        rol: newTrabajador.rol,
        passwordHash: newTrabajador.passwordHash
      });

      setTrabajadores([nuevo, ...trabajadores]);
      toast.success(`Colaborador ${nuevo.nombre} ${nuevo.apellido} registrado exitosamente. Credenciales temporales enviadas a ${nuevo.emailPersonal || emailFinal}.`);
      setShowCreateModal(false);
      setNewTrabajador({
        identificacion: '',
        nombre: '',
        apellido: '',
        email: '',
        emailPersonal: '',
        profesion: '',
        especialidad: '',
        rol: 'DESARROLLADOR',
        passwordHash: ''
      });
      setSelectedSkills([]);
      setCustomSkillInput('');
      setShowPasswordInput(false);
      setFormErrors({});
    } catch (err) {
      console.error('Error creando trabajador:', err);
      toast.error(err.message || 'Error al registrar el trabajador en el sistema.');
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoSolicitudInfo = (sol) => {
    const est = sol.estado || (sol.atendido ? 'ATENDIDA' : 'PENDIENTE');
    if (est === 'ATENDIDA') {
      return {
        label: 'ATENDIDA',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    }
    if (est === 'REABIERTA') {
      return {
        label: `REABIERTA${sol.contadorReaperturas > 0 ? ` (x${sol.contadorReaperturas})` : ''}`,
        badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
        dot: 'bg-purple-500'
      };
    }
    if (est === 'EN_PROCESO') {
      return {
        label: 'EN PROCESO',
        badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500'
      };
    }
    return {
      label: 'PENDIENTE',
      badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
      dot: 'bg-blue-500'
    };
  };

  /**
   * Determina dinámicamente el texto, estilo e icono del botón de acción según el estado del caso:
   * - ATENDIDA: 'Reabrir Caso' (morado suave)
   * - REABIERTA: 'Gestionar Reapertura / Solucionar' (gradiente morado)
   * - EN_PROCESO: 'Continuar Gestión / Finalizar Caso' (gradiente ámbar/naranja)
   * - PENDIENTE: 'Atender Caso / Registrar Novedad' (gradiente azul corporativo)
   */
  const getBotonAccionSolicitud = (sol) => {
    const est = sol.estado || (sol.atendido ? 'ATENDIDA' : 'PENDIENTE');

    switch (est) {
      case 'ATENDIDA':
        return {
          texto: 'Reabrir Caso',
          subtexto: 'El caso ya fue atendido y solucionado',
          icono: RotateCcw,
          className: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-2xs',
          targetEstadoDefault: 'REABIERTA'
        };
      case 'REABIERTA':
        return {
          texto: 'Gestionar Reapertura / Solucionar',
          subtexto: 'Caso reabierto pendiente de nueva resolución',
          icono: Edit3,
          className: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm border-transparent',
          targetEstadoDefault: 'ATENDIDA'
        };
      case 'EN_PROCESO':
        return {
          texto: 'Continuar Gestión / Finalizar Caso',
          subtexto: 'Caso en seguimiento y procesamiento comercial',
          icono: Clock,
          className: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-sm border-transparent',
          targetEstadoDefault: 'ATENDIDA'
        };
      case 'PENDIENTE':
      default:
        return {
          texto: 'Atender Caso / Registrar Novedad',
          subtexto: 'Nueva solicitud pendiente de atención',
          icono: CheckCircle2,
          className: 'gradient-button shadow-sm',
          targetEstadoDefault: 'ATENDIDA'
        };
    }
  };

  const handleOpenGestionModal = (sol) => {
    setSelectedSolicitudModal(sol);
    const botonInfo = getBotonAccionSolicitud(sol);
    setSolicitudActionForm({
      estado: botonInfo.targetEstadoDefault,
      notasAtencion: sol.notasAtencion || '',
      motivoReapertura: ''
    });
  };

  const handleSubmitGestionSolicitud = async (e) => {
    e?.preventDefault();
    if (!selectedSolicitudModal) return;

    if (solicitudActionForm.estado === 'REABIERTA' && !solicitudActionForm.motivoReapertura.trim()) {
      toast.error('Debes indicar obligatoriamente el motivo por el cual se reabre el caso.');
      return;
    }

    try {
      setSubmittingGestion(true);
      const updated = await api.patch(
        `/coordinador/solicitudes/${selectedSolicitudModal.idSolicitud}/gestionar`,
        solicitudActionForm
      );

      setSolicitudes(prev => prev.map(s => s.idSolicitud === selectedSolicitudModal.idSolicitud ? updated : s));
      toast.success(`Caso [SOL-00${selectedSolicitudModal.idSolicitud}] actualizado a ${updated.estado || (updated.atendido ? 'ATENDIDA' : 'PENDIENTE')}`);
      setSelectedSolicitudModal(null);
    } catch (err) {
      console.error('Error al gestionar caso:', err);
      toast.error(err.message || 'Error al guardar la gestión del caso.');
    } finally {
      setSubmittingGestion(false);
    }
  };

  const handleToggleEstadoSolicitud = async (idSolicitud) => {
    try {
      setTogglingSolicitudId(idSolicitud);
      const updated = await api.patch(`/coordinador/solicitudes/${idSolicitud}/atender`);
      
      setSolicitudes(prev => prev.map(s => s.idSolicitud === idSolicitud ? updated : s));
      const estadoTxt = updated.estado || (updated.atendido ? 'ATENDIDA' : 'PENDIENTE');
      toast.success(`Solicitud actualizada a ${estadoTxt}.`);
    } catch (err) {
      console.error('Error actualizando solicitud:', err);
      toast.error(err.message || 'Error al actualizar el estado de la solicitud.');
    } finally {
      setTogglingSolicitudId(null);
    }
  };

  const SkillsHoverDropdown = ({ skills, mainSpec }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="space-y-1">
        {mainSpec && (
          <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            {mainSpec}
          </div>
        )}

        {skills && skills.length > 0 && (
          <div 
            className="relative inline-block"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Botón Desplegable / Trigger */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70 text-[0.68rem] font-mono font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Code2 size={12} className="text-blue-500 shrink-0" />
              <span>{skills.length} Competencias</span>
              <ChevronDown size={11} className={`text-blue-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú Desplegable Flotante al pasar el cursor */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-full mt-1.5 w-72 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 text-[0.68rem] font-bold text-zinc-600 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Layers size={13} className="text-blue-500" /> Stack Técnico & Habilidades
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded text-[0.62rem] font-bold">
                      {skills.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-[0.65rem] font-mono font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  const renderEspecialidadYSkills = (especialidadRaw) => {
    if (!especialidadRaw || !especialidadRaw.trim()) {
      return <span className="text-zinc-400 dark:text-zinc-500 text-xs">General / Sin definir</span>;
    }

    if (especialidadRaw.includes('• [')) {
      const [mainSpec, skillsPart] = especialidadRaw.split('• [');
      const skills = skillsPart ? skillsPart.replace(']', '').split(',').map(s => s.trim()).filter(Boolean) : [];
      return <SkillsHoverDropdown skills={skills} mainSpec={mainSpec.trim()} />;
    }

    if (especialidadRaw.startsWith('[') && especialidadRaw.endsWith(']')) {
      const skills = especialidadRaw.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
      return <SkillsHoverDropdown skills={skills} mainSpec="" />;
    }

    return (
      <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
        {especialidadRaw}
      </div>
    );
  };

  const filteredTrabajadores = trabajadores.filter(t => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      (t.nombre || '').toLowerCase().includes(query) ||
      (t.apellido || '').toLowerCase().includes(query) ||
      (t.identificacion || '').includes(query) ||
      (t.email || '').toLowerCase().includes(query) ||
      (t.profesion || '').toLowerCase().includes(query);

    const matchesRol = rolSeleccionado === 'TODOS' || t.rol === rolSeleccionado;

    let matchesTech = true;
    if (techsSeleccionadas.length > 0) {
      const spec = (t.especialidad || '').toLowerCase();
      matchesTech = techsSeleccionadas.some(tech => spec.includes(tech.toLowerCase()));
    }

    const matchesEstado = estadoSeleccionado === 'TODOS' || 
      (estadoSeleccionado === 'ACTIVO' && t.estado) || 
      (estadoSeleccionado === 'INHABILITADO' && !t.estado);

    return matchesSearch && matchesRol && matchesTech && matchesEstado;
  });

  const activeFiltersCount = (searchQuery ? 1 : 0) + (rolSeleccionado !== 'TODOS' ? 1 : 0) + techsSeleccionadas.length + (estadoSeleccionado !== 'TODOS' ? 1 : 0);

  // Cálculo Exigente de la Primera y Última Fecha de Solicitud en el Sistema
  const rangoFechasSolicitudes = React.useMemo(() => {
    if (!solicitudes || !Array.isArray(solicitudes) || solicitudes.length === 0) {
      return { primera: '', ultima: '', primeraFormateada: 'Sin registros', ultimaFormateada: 'Sin registros' };
    }

    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;

    solicitudes.forEach(s => {
      const dateVal = s.fechaEnvio || s.fechaCreacion || s.createdAt;
      if (!dateVal) return;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return;

      if (d.getTime() < minTimestamp) minTimestamp = d.getTime();
      if (d.getTime() > maxTimestamp) maxTimestamp = d.getTime();
    });

    if (minTimestamp === Infinity || maxTimestamp === -Infinity) {
      return { primera: '', ultima: '', primeraFormateada: 'Sin fecha', ultimaFormateada: 'Sin fecha' };
    }

    const minDate = new Date(minTimestamp);
    const maxDate = new Date(maxTimestamp);

    return {
      primera: minDate.toISOString().split('T')[0],
      ultima: maxDate.toISOString().split('T')[0],
      primeraFormateada: minDate.toLocaleDateString(),
      ultimaFormateada: maxDate.toLocaleDateString()
    };
  }, [solicitudes]);

  // Filtrado Estricto por Estado, Búsqueda Avanzada y Rango de Fechas
  const solicitudesFiltradas = React.useMemo(() => {
    if (!Array.isArray(solicitudes)) return [];

    return solicitudes.filter(sol => {
      // 1. Estado
      const est = sol.estado || (sol.atendido ? 'ATENDIDA' : 'PENDIENTE');
      if (filtroSolicitudes !== 'TODAS' && est !== filtroSolicitudes) return false;

      // 2. Búsqueda Texto Completo
      if (searchSolicitudQuery.trim()) {
        const q = searchSolicitudQuery.toLowerCase().trim();
        const matchCode = String(sol.idSolicitud).includes(q) || `sol-00${sol.idSolicitud}`.toLowerCase().includes(q);
        const matchAsunto = sol.asunto?.toLowerCase().includes(q);
        const matchRemitente = sol.nombreRemitente?.toLowerCase().includes(q);
        const matchEmail = sol.emailRemitente?.toLowerCase().includes(q);
        const matchTel = sol.telefono?.toLowerCase().includes(q);
        const matchMsg = sol.mensaje?.toLowerCase().includes(q);
        const matchNotas = sol.notasAtencion?.toLowerCase().includes(q);
        if (!matchCode && !matchAsunto && !matchRemitente && !matchEmail && !matchTel && !matchMsg && !matchNotas) {
          return false;
        }
      }

      // 3. Rango de Fechas Estricto
      const dateVal = sol.fechaEnvio || sol.fechaCreacion || sol.createdAt;
      if (dateVal) {
        const fechaObj = new Date(dateVal);
        if (!isNaN(fechaObj.getTime())) {
          if (fechaInicioSolicitud) {
            const startObj = new Date(`${fechaInicioSolicitud}T00:00:00`);
            if (fechaObj < startObj) return false;
          }
          if (fechaFinSolicitud) {
            const endObj = new Date(`${fechaFinSolicitud}T23:59:59`);
            if (fechaObj > endObj) return false;
          }
        }
      }

      return true;
    });
  }, [solicitudes, filtroSolicitudes, searchSolicitudQuery, fechaInicioSolicitud, fechaFinSolicitud]);

  // Cálculos de Paginación Inteligente
  const totalFilteredCount = filteredTrabajadores.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredCount);
  const paginatedTrabajadores = filteredTrabajadores.slice(startIndex, endIndex);

  const totalCount = (trabajadores || []).length;
  const activosCount = (trabajadores || []).filter(t => t.estado).length;
  const inactivosCount = (trabajadores || []).filter(t => !t.estado).length;
  const devsCount = (trabajadores || []).filter(t => t.rol === 'DESARROLLADOR').length;
  const lideresCount = (trabajadores || []).filter(t => t.rol === 'LIDER').length;
  const coordCount = (trabajadores || []).filter(t => t.rol === 'COORDINADOR').length;
  const solicitudesPendientes = (solicitudes || []).filter(s => !s.atendido).length;

  const devPct = totalCount > 0 ? Math.round((devsCount / totalCount) * 100) : 0;
  const liderPct = totalCount > 0 ? Math.round((lideresCount / totalCount) * 100) : 0;
  const coordPct = totalCount > 0 ? Math.round((coordCount / totalCount) * 100) : 0;

  const getTopSkillsByRole = (list, selectedRole) => {
    const counts = {};
    (list || []).forEach(t => {
      if (selectedRole !== 'TODOS' && t.rol !== selectedRole) {
        return;
      }
      const spec = t.especialidad || '';
      let skills = [];
      if (spec.includes('• [')) {
        const parts = spec.split('• [')[1];
        if (parts) {
          skills = parts.replace(']', '').split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (spec.startsWith('[') && spec.endsWith(']')) {
        skills = spec.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
      } else if (spec && spec !== 'General / Sin definir') {
        skills = [spec.trim()];
      }
      skills.forEach(s => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const topSkills = getTopSkillsByRole(trabajadores, rolSeleccionado);

  const getFilterExplanationText = () => {
    if (activeFiltersCount === 0) {
      return `Mostrando todo el personal registrado (${totalCount} trabajadores en total).`;
    }

    const parts = [];
    if (rolSeleccionado !== 'TODOS') {
      const roleName = rolSeleccionado === 'DESARROLLADOR' ? 'Desarrolladores' : rolSeleccionado === 'LIDER' ? 'Líderes de Proyecto' : 'Coordinadores';
      parts.push(roleName);
    } else {
      parts.push('Personal general');
    }

    if (estadoSeleccionado !== 'TODOS') {
      parts.push(estadoSeleccionado === 'ACTIVO' ? 'Habilitados' : 'Inhabilitados');
    }

    if (techsSeleccionadas.length > 0) {
      parts.push(`con especialidad en [${techsSeleccionadas.join(', ')}]`);
    }

    if (searchQuery) {
      parts.push(`coincidiendo con "${searchQuery}"`);
    }

    return `Viendo ${filteredTrabajadores.length} ${parts.join(' ')}.`;
  };

  const getInitials = (nombre, apellido) => {
    const n = (nombre || '').trim().charAt(0);
    const a = (apellido || '').trim().charAt(0);
    return (n + a).toUpperCase() || 'U';
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: loading ? 'Cargando...' : `Personal Activo: ${activosCount}`,
        metric2: loading ? '...' : `Solicitudes: ${solicitudesPendientes} Pendientes`
      }}
    >
      {/* 1. SECCIÓN: GESTIÓN DE PERSONAL (Consola de Filtrado Organizada y Adaptativa) */}
      {activeTab === 'personal' && (
        <motion.div 
          key="personal"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          
          {/* Header de la Vista */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Administración y Talento Humano
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Gestión Centralizada de Personal
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Alta, control de acceso lógico y organización por roles para la nómina de desarrollo
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={cargarDatos}
                disabled={loading}
                className="outline-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refrescar
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="gradient-button text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <UserPlus size={16} /> Registrar Trabajador
              </button>
            </div>
          </motion.div>

          {/* Consola Única de Filtrado Didáctico & Adaptativo (Foolproof Control Console) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5"
          >
            {/* 1. Encabezado Didáctico & Banner Explicativo en Lenguaje Sencillo */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Filter size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    Panel de Búsqueda y Filtrado Inteligente
                    <span className="text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {filteredTrabajadores.length} / {totalCount} Encontrados
                    </span>
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Sparkles size={13} /> {getFilterExplanationText()}
                  </p>
                </div>
              </div>

              {/* Botón de Reseteo Rápido */}
              <div className="flex items-center gap-2 shrink-0">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw size={13} /> Ver Todo el Personal ({activeFiltersCount} activo)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="gradient-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <UserPlus size={15} />
                  <span>Nuevo Trabajador</span>
                </button>
              </div>

            </div>

            {/* 2. Buscador Directo por Nombre / Cédula */}
            <div className="space-y-1.5">
              <label className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Search size={13} className="text-blue-500" /> Búsqueda Directa por Texto Libre:
              </label>
              <div className="relative w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Escribe el nombre, apellido, cédula o correo del trabajador..."
                  className="input-field pl-11 pr-10 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 3. Paso 1 (Selección Única de Rol) y Paso 2 (Estado Lógico) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              
              {/* A. Selección Única de Rol (Paso 1) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Briefcase size={13} className="text-amber-500" /> Paso 1: Selecciona 1 solo Rol a consultar:
                  </span>
                  {rolSeleccionado !== 'TODOS' && (
                    <button 
                      onClick={() => handleSelectRole('TODOS')}
                      className="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Ver Todos los Roles
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'TODOS', label: `Todos los Roles (${totalCount})`, icon: Sparkles },
                    { key: 'DESARROLLADOR', label: `Desarrolladores (${devsCount})`, icon: Code2 },
                    { key: 'LIDER', label: `Líderes (${lideresCount})`, icon: Briefcase },
                    { key: 'COORDINADOR', label: `Coordinadores (${coordCount})`, icon: Shield }
                  ].map(r => {
                    const isSelected = rolSeleccionado === r.key;
                    const IconComponent = r.icon;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => handleSelectRole(r.key)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-500/30 font-bold'
                            : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.65rem] font-bold ${
                          isSelected ? 'bg-white text-blue-600' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                        }`}>
                          {isSelected ? <Check size={10} /> : <span className="w-1 h-1 rounded-full bg-current inline-block" />}
                        </div>
                        <IconComponent size={14} className="shrink-0" />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B. Estado Lógico del Acceso (Paso 2) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <BadgeCheck size={13} className="text-emerald-500" /> Paso 2: Estado de Permiso de Acceso:
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'TODOS', label: `Todos los Estados (${totalCount})` },
                    { key: 'ACTIVO', label: `Solo Habilitados (${activosCount})` },
                    { key: 'INHABILITADO', label: `Solo Inhabilitados (${inactivosCount})` }
                  ].map(s => {
                    const isSelected = estadoSeleccionado === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setEstadoSeleccionado(s.key)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs ring-2 ring-zinc-500/20 font-bold'
                            : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 4. Paso 3: Habilidades Adaptativas (Solo se muestran cuando se elige un Rol específico en el Paso 1) */}
            {rolSeleccionado !== 'TODOS' && topSkills.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Cpu size={13} className="text-blue-500" />
                    Paso 3: Habilidades Específicas de {
                      rolSeleccionado === 'DESARROLLADOR' ? 'Desarrollo WBS' : 
                      rolSeleccionado === 'LIDER' ? 'Gestión Ágil & Liderazgo' : 
                      'Administración Operativa'
                    }:
                  </span>
                  {techsSeleccionadas.length > 0 && (
                    <button 
                      onClick={() => setTechsSeleccionadas([])}
                      className="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Limpiar habilidades ({techsSeleccionadas.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {topSkills.map(([skillName, count]) => {
                    const isSelected = techsSeleccionadas.includes(skillName);
                    return (
                      <button
                        key={skillName}
                        type="button"
                        onClick={() => handleToggleTechFilter(skillName)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-500/30 font-bold'
                            : 'bg-zinc-50 hover:bg-blue-50/80 dark:bg-zinc-800/60 dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[0.6rem] font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'
                        }`}>
                          {isSelected ? <Check size={10} /> : '+'}
                        </div>
                        <span>{skillName}</span>
                        <span className={`text-[0.65rem] px-1.5 py-0.2 rounded-md font-bold ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>

          {/* Tabla de Personal Reorganizada (Vista Ejecutiva Elegante) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[850px]">
                {/* Encabezados de la Tabla */}
                <thead className="bg-zinc-50/90 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="py-4 px-6">Identificación</th>
                    <th className="py-4 px-6">Trabajador & Contacto</th>
                    <th className="py-4 px-6">Profesión / Stack Técnico</th>
                    <th className="py-4 px-6">Rol Asignado</th>
                    <th className="py-4 px-6">Estado Lógico</th>
                    <th className="py-4 px-6 text-right">Acción de Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 font-medium">
                  {loading && (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  )}

                  {!loading && filteredTrabajadores.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={Inbox}
                          title="No se encontraron trabajadores"
                          description={
                            activeFiltersCount > 0
                              ? "No hay personal que coincida exactamente con la combinación de filtros seleccionados."
                              : "Aún no hay personal registrado en la base de datos."
                          }
                          action={
                            <button
                              type="button"
                              onClick={handleClearAllFilters}
                              className="outline-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw size={14} /> Restablecer Todos los Filtros
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  )}

                  {!loading && paginatedTrabajadores.map(t => (
                    <tr 
                      key={t.idTrabajador} 
                      className="transition-colors duration-150 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 group"
                    >
                      {/* Identificación (Badge Monospaciado) */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[0.72rem] font-bold border border-zinc-200 dark:border-zinc-700">
                          #{t.identificacion}
                        </span>
                      </td>

                      {/* Trabajador con Avatar de Iniciales e Indicador Pulsante */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {/* Avatar Circular con Iniciales */}
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 text-zinc-800 dark:text-zinc-200 font-extrabold text-xs flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                              {getInitials(t.nombre, t.apellido)}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${t.estado ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          </div>

                          {/* Nombre y Correo */}
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {t.nombre} {t.apellido}
                            </div>
                            <div className="text-zinc-500 dark:text-zinc-400 text-xs flex items-center gap-1 mt-0.5">
                              <Mail size={11} className="text-zinc-400 shrink-0" />
                              <span>{t.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Profesión y Stack de Habilidades Técnicas */}
                      <td className="py-4 px-6 max-w-[280px]">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs mb-1 flex items-center gap-1">
                          <GraduationCap size={13} className="text-blue-500 shrink-0" />
                          <span>{t.profesion || 'Ingeniero de Software'}</span>
                        </div>
                        {renderEspecialidadYSkills(t.especialidad)}
                      </td>

                      {/* Insignia Dinámica del Rol */}
                      <td className="py-4 px-6">
                        <RoleBadge rol={t.rol} />
                      </td>

                      {/* Estado Lógico con Punto Animado */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border shadow-2xs ${
                          t.estado 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${t.estado ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                          {t.estado ? 'Habilitado' : 'Inhabilitado'}
                        </span>
                      </td>

                      {/* Botón de Acción Explicativo / Protegido contra Auto-Inhabilitación */}
                      <td className="py-4 px-6 text-right">
                        {user && (
                          user.idTrabajador === t.idTrabajador ||
                          user.id === t.idTrabajador ||
                          (user.email && t.email && user.email.toLowerCase() === t.email.toLowerCase()) ||
                          (user.identificacion && t.identificacion && String(user.identificacion) === String(t.identificacion))
                        ) ? (
                          <span 
                            title="Cuenta en sesión activa. No es posible auto-inhabilitarse por seguridad."
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold text-xs border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-80"
                          >
                            <Shield size={13} className="text-purple-500 shrink-0" />
                            Sesión Actual
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={togglingId === t.idTrabajador}
                            onClick={() => handleInhabilitar(t.idTrabajador)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 ${
                              t.estado
                                ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800'
                                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {togglingId === t.idTrabajador ? (
                              <>
                                <Loader2 size={13} className="animate-spin" /> Procesando...
                              </>
                            ) : t.estado ? (
                              <>
                                <UserX size={13} /> Inhabilitar
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} /> Reactivar
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Barra de Paginación Inteligente (Por Cantidad de Registros y Hojas) */}
            {!loading && totalFilteredCount > 0 && (
              <div className="bg-zinc-50/80 dark:bg-zinc-800/40 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
                
                {/* 1. Selector de Cantidad de Registros por Página */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Mostrar por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value={5}>5 personas</option>
                    <option value={10}>10 personas</option>
                    <option value={25}>25 personas</option>
                    <option value={50}>50 personas</option>
                  </select>

                  <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[0.72rem] ml-1">
                    ({startIndex + 1}–{endIndex} de {totalFilteredCount} en total)
                  </span>
                </div>

                {/* 2. Navegación por Hojas (Páginas Numeradas + Controles) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  
                  {/* Botón Primera Hoja */}
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
                    title="Primera hoja"
                  >
                    «
                  </button>

                  {/* Botón Hoja Anterior */}
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold inline-flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  {/* Hojas Numeradas */}
                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => {
                      const isCurrent = pageNumber === safeCurrentPage;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600 text-white border border-blue-700 shadow-2xs font-extrabold'
                              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón Hoja Siguiente */}
                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold inline-flex items-center gap-1"
                  >
                    Siguiente <ChevronRight size={14} />
                  </button>

                  {/* Botón Última Hoja */}
                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-bold"
                    title="Última hoja"
                  >
                    »
                  </button>

                </div>

              </div>
            )}
          </motion.div>

        </motion.div>
      )}

      {/* 2. SECCIÓN: SOLICITUDES DE CONTACTO WEB */}
      {activeTab === 'solicitudes' && (
        <motion.div 
          key="solicitudes"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Atención al Cliente & Leads Web
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Bandeja de Solicitudes de Contacto Web
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Gestión comercial, registro de notas de atención y trazabilidad con auditoría de reaperturas
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={cargarDatos}
                disabled={loading}
                className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refrescar
              </button>
            </div>
          </motion.div>

          {/* Consola Única y Optimizada de Búsqueda, Fechas y Filtros */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
          >
            {/* 1. Fila Superior: Búsqueda Global por Texto + Indicadores del Histórico Completo */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Caja de Búsqueda */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchSolicitudQuery}
                  onChange={(e) => setSearchSolicitudQuery(e.target.value)}
                  placeholder="Buscar por código (SOL-001), cliente, correo, asunto o contenido..."
                  className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                />
                {searchSolicitudQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchSolicitudQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Indicadores Píldora del Rango Exigente Base */}
              {rangoFechasSolicitudes.primera && (
                <div className="flex items-center gap-2 text-[0.68rem] font-extrabold text-zinc-500 dark:text-zinc-400 shrink-0 flex-wrap">
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-500" />
                    <span>Primera:</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{rangoFechasSolicitudes.primeraFormateada}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-500" />
                    <span>Última:</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{rangoFechasSolicitudes.ultimaFormateada}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* 2. Fila Inferior: Filtros de Estado a la Izquierda + Selector Estricto de Fechas a la Derecha */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
              
              {/* Píldoras de Estado (Izquierda) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFiltroSolicitudes('TODAS')}
                  className={`text-xs py-2 px-3.5 rounded-xl font-black transition-all cursor-pointer inline-flex items-center gap-2 ${
                    filtroSolicitudes === 'TODAS'
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-[1.02]'
                      : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>Todas</span>
                  <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                    filtroSolicitudes === 'TODAS' ? 'bg-white/20 dark:bg-black/20 font-extrabold' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}>
                    {solicitudes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroSolicitudes('PENDIENTE')}
                  className={`text-xs py-2 px-3.5 rounded-xl font-black transition-all cursor-pointer inline-flex items-center gap-2 ${
                    filtroSolicitudes === 'PENDIENTE'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>Pendientes</span>
                  <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                    filtroSolicitudes === 'PENDIENTE' ? 'bg-white/20 font-extrabold' : 'bg-blue-100 dark:bg-blue-900/60'
                  }`}>
                    {solicitudes.filter(s => (s.estado === 'PENDIENTE' || (!s.estado && !s.atendido))).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroSolicitudes('EN_PROCESO')}
                  className={`text-xs py-2 px-3.5 rounded-xl font-black transition-all cursor-pointer inline-flex items-center gap-2 ${
                    filtroSolicitudes === 'EN_PROCESO'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.02]'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>En Proceso</span>
                  <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                    filtroSolicitudes === 'EN_PROCESO' ? 'bg-white/20 font-extrabold' : 'bg-amber-100 dark:bg-amber-900/60'
                  }`}>
                    {solicitudes.filter(s => s.estado === 'EN_PROCESO').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroSolicitudes('ATENDIDA')}
                  className={`text-xs py-2 px-3.5 rounded-xl font-black transition-all cursor-pointer inline-flex items-center gap-2 ${
                    filtroSolicitudes === 'ATENDIDA'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Atendidas</span>
                  <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                    filtroSolicitudes === 'ATENDIDA' ? 'bg-white/20 font-extrabold' : 'bg-emerald-100 dark:bg-emerald-900/60'
                  }`}>
                    {solicitudes.filter(s => s.estado === 'ATENDIDA' || (s.atendido && !s.estado)).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroSolicitudes('REABIERTA')}
                  className={`text-xs py-2 px-3.5 rounded-xl font-black transition-all cursor-pointer inline-flex items-center gap-2 ${
                    filtroSolicitudes === 'REABIERTA'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-[1.02]'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-100'
                  }`}
                >
                  <RotateCcw size={13} />
                  <span>Reabiertas</span>
                  <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                    filtroSolicitudes === 'REABIERTA' ? 'bg-white/20 font-extrabold' : 'bg-purple-100 dark:bg-purple-900/60'
                  }`}>
                    {solicitudes.filter(s => s.estado === 'REABIERTA').length}
                  </span>
                </button>
              </div>

              {/* Control Integrado de Fechas Exigentes & Accesos Rápidos (Derecha) */}
              <div className="flex items-center gap-2 flex-wrap shrink-0 justify-start xl:justify-end">
                {/* Selector Fecha Desde */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.65rem] font-extrabold uppercase text-zinc-500 dark:text-zinc-400">Desde:</span>
                  <input
                    type="date"
                    value={fechaInicioSolicitud}
                    min={rangoFechasSolicitudes.primera}
                    max={rangoFechasSolicitudes.ultima}
                    onChange={(e) => setFechaInicioSolicitud(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Selector Fecha Hasta */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.65rem] font-extrabold uppercase text-zinc-500 dark:text-zinc-400">Hasta:</span>
                  <input
                    type="date"
                    value={fechaFinSolicitud}
                    min={rangoFechasSolicitudes.primera}
                    max={rangoFechasSolicitudes.ultima}
                    onChange={(e) => setFechaFinSolicitud(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Botón Acción Todo el Historial */}
                <button
                  type="button"
                  onClick={() => {
                    setFechaInicioSolicitud('');
                    setFechaFinSolicitud('');
                  }}
                  className={`text-xs py-1.5 px-3 rounded-xl font-extrabold transition-all cursor-pointer border ${
                    !fechaInicioSolicitud && !fechaFinSolicitud
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                  title="Mostrar todo el historial disponible"
                >
                  Todo
                </button>

                {/* Botón Acción Rango Exigente */}
                <button
                  type="button"
                  onClick={() => {
                    if (rangoFechasSolicitudes.primera && rangoFechasSolicitudes.ultima) {
                      setFechaInicioSolicitud(rangoFechasSolicitudes.primera);
                      setFechaFinSolicitud(rangoFechasSolicitudes.ultima);
                    }
                  }}
                  className="text-xs py-1.5 px-3 rounded-xl font-extrabold transition-all cursor-pointer border bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                  title="Filtra desde la fecha de la primera solicitud hasta la última"
                >
                  Rango Exigente
                </button>

                {/* Botón Limpiar Todo cuando hay filtros activos */}
                {(searchSolicitudQuery || fechaInicioSolicitud || fechaFinSolicitud || filtroSolicitudes !== 'TODAS') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchSolicitudQuery('');
                      setFechaInicioSolicitud('');
                      setFechaFinSolicitud('');
                      setFiltroSolicitudes('TODAS');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-black transition-all hover:bg-red-100 cursor-pointer inline-flex items-center gap-1"
                    title="Reiniciar todos los filtros activados"
                  >
                    <X size={13} />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading && (
              <>
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse h-56" />
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse h-56" />
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse h-56" />
              </>
            )}

            {!loading && solicitudesFiltradas.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={Inbox}
                  title="No se encontraron solicitudes"
                  description="No hay registros que coincidan con la búsqueda o el rango de fechas seleccionado."
                />
              </div>
            )}

            {!loading && solicitudesFiltradas.map(sol => {
                const estInfo = getEstadoSolicitudInfo(sol);
                const isReabierta = sol.estado === 'REABIERTA' || (sol.contadorReaperturas && sol.contadorReaperturas > 0);

                return (
                  <div 
                    key={sol.idSolicitud} 
                    className={`bg-white dark:bg-zinc-900 p-6 rounded-3xl border flex flex-col justify-between shadow-sm hover:shadow-[0_0_18px_rgba(59,130,246,0.14)] hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-200 h-full ${
                      sol.atendido || sol.estado === 'ATENDIDA'
                        ? 'border-zinc-200 dark:border-zinc-800/80' 
                        : sol.estado === 'REABIERTA'
                        ? 'border-purple-300 dark:border-purple-800 ring-1 ring-purple-100 dark:ring-purple-950/40'
                        : 'border-blue-300 dark:border-blue-700/80 ring-1 ring-blue-100 dark:ring-blue-950/30'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[0.68rem] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                            SOL-00{sol.idSolicitud}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[0.62rem] font-extrabold uppercase px-2 py-0.5 rounded-full border ${estInfo.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${estInfo.dot}`}></span>
                            <span>{estInfo.label}</span>
                          </span>
                        </div>
                        <span className="text-[0.65rem] text-zinc-400 flex items-center gap-1 font-semibold shrink-0">
                          <Clock size={11} /> {sol.fechaEnvio ? new Date(sol.fechaEnvio).toLocaleDateString() : 'Reciente'}
                        </span>
                      </div>

                      {/* Asunto y Remitente */}
                      <div>
                        <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mb-0.5 line-clamp-1" title={sol.asunto}>
                          {sol.asunto}
                        </h3>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{sol.nombreRemitente}</p>
                      </div>
                      
                      {/* Mensaje original */}
                      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic line-clamp-3">
                        "{sol.mensaje}"
                      </div>

                      {/* Datos de contacto */}
                      <div className="flex flex-col gap-1 text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">
                        <div className="flex items-center gap-1.5 truncate"><Mail size={12} className="shrink-0 text-zinc-400" /> <span className="truncate">{sol.emailRemitente}</span></div>
                        {sol.telefono && <div className="flex items-center gap-1.5"><Phone size={12} className="shrink-0 text-zinc-400" /> <span>{sol.telefono}</span></div>}
                      </div>

                      {/* Bloque Informativo: Notas de Atención Registradas */}
                      {sol.notasAtencion && (
                        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-extrabold text-[0.7rem]">
                            <FileText size={12} />
                            <span>Acciones Realizadas / Contexto:</span>
                          </div>
                          <p className="text-[0.72rem] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            {sol.notasAtencion}
                          </p>
                          {sol.fechaAtencion && (
                            <p className="text-[0.62rem] text-emerald-700 dark:text-emerald-400 font-mono pt-0.5">
                              Atendido {new Date(sol.fechaAtencion).toLocaleString()} {sol.coordinador ? `por ${sol.coordinador.nombre}` : ''}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bloque Informativo: Motivo de Reapertura */}
                      {sol.motivoReapertura && (
                        <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-extrabold text-[0.7rem]">
                            <RotateCcw size={12} />
                            <span>Motivo de Reapertura {sol.contadorReaperturas > 0 ? `(#${sol.contadorReaperturas})` : ''}:</span>
                          </div>
                          <p className="text-[0.72rem] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            {sol.motivoReapertura}
                          </p>
                          {sol.fechaReapertura && (
                            <p className="text-[0.62rem] text-purple-700 dark:text-purple-400 font-mono pt-0.5">
                              Reabierto el {new Date(sol.fechaReapertura).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción Adaptados al Estado */}
                    <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 mt-4">
                      {(() => {
                        const botonInfo = getBotonAccionSolicitud(sol);
                        const IconComponent = botonInfo.icono;

                        return (
                          <button
                            type="button"
                            onClick={() => handleOpenGestionModal(sol)}
                            className={`text-xs py-2 px-3 w-full font-bold cursor-pointer rounded-xl inline-flex items-center justify-center gap-2 transition-all ${botonInfo.className}`}
                            title={botonInfo.subtexto}
                          >
                            <IconComponent size={14} className="shrink-0" />
                            <span>{botonInfo.texto}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
          </motion.div>

        </motion.div>
      )}

      {/* 3. SECCIÓN: PREDICTOR DE BURNOUT HISTÓRICO */}
      {activeTab === 'burnout' && (
        <motion.div 
          key="burnout"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <PredictorBurnout />
        </motion.div>
      )}

      {/* Modal Registrar Trabajador Ampliado & Avanzado */}
      <AnimatePresence>
        {showCreateModal && (() => {
          const currentSkillProfile = ROLE_SKILL_PROFILES[newTrabajador.rol] || ROLE_SKILL_PROFILES.DESARROLLADOR;
          const RoleIconComponent = newTrabajador.rol === 'DESARROLLADOR' 
            ? Code2 
            : newTrabajador.rol === 'LIDER' 
              ? Briefcase 
              : Shield;

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-9 w-[96%] sm:w-full max-w-3xl shadow-2xl max-h-[90dvh] overflow-y-auto space-y-6"
              >
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-start pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                        <span>Registrar Nuevo Colaborador</span>
                        <span className={`text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-full border ${currentSkillProfile.badgeTagStyle}`}>
                          {newTrabajador.rol}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Alta corporativa en PostgreSQL, asignación de rol de seguridad y configuración de perfil profesional
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCrearTrabajador} className="space-y-4 text-xs" noValidate>
                  {/* 1. Información Personal & Identificación */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100">
                        <Shield size={14} className="text-blue-500" />
                        <span>1. Identificación & Credenciales de Acceso</span>
                      </div>
                      <span className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Validación Algorítmica Internacional
                      </span>
                    </div>

                    {/* Selector de País de Emisión / Nacionalidad y Número de Identificación Validado */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                          País de Emisión / Documento *
                        </label>
                        <select
                          value={newTrabajador.paisCodigo}
                          onChange={(e) => {
                            setNewTrabajador({ ...newTrabajador, paisCodigo: e.target.value });
                            setFormErrors(p => ({ ...p, identificacion: undefined }));
                          }}
                          className="input-field py-2 text-xs font-bold"
                        >
                          {PAISES_IDENTIFICACION.map(p => (
                            <option key={p.code} value={p.code}>
                              {p.flag} {p.nombre} ({p.docTipo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between text-xs mb-1">
                          <span>Número de Identificación / {paisActual.docTipo} *</span>
                          <span className="text-[0.62rem] font-mono text-blue-600 dark:text-blue-400 font-extrabold">
                            {paisActual.flag} {paisActual.nombre}
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={newTrabajador.identificacion}
                            onChange={(e) => { 
                              setNewTrabajador({ ...newTrabajador, identificacion: e.target.value }); 
                              setFormErrors(p => ({ ...p, identificacion: undefined })); 
                            }}
                            placeholder={paisActual.placeholder}
                            className={`input-field py-2 text-xs font-mono font-bold pr-9 ${
                              newTrabajador.identificacion 
                                ? (docValidationResult.valid ? 'border-emerald-500 ring-2 ring-emerald-500/10 dark:border-emerald-500' : 'border-red-400 dark:border-red-600 ring-2 ring-red-500/10') 
                                : ''
                            }`}
                          />
                          {newTrabajador.identificacion && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {docValidationResult.valid ? (
                                <CheckCircle2 size={16} className="text-emerald-500" />
                              ) : (
                                <AlertTriangle size={16} className="text-red-500 animate-bounce" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Mensaje de Validación de Algoritmo de País */}
                        {newTrabajador.identificacion && (
                          <p className={`text-[0.65rem] font-bold mt-1 flex items-center gap-1.5 ${
                            docValidationResult.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          }`}>
                            <span>{paisActual.flag}</span>
                            <span>{docValidationResult.message}</span>
                          </p>
                        )}
                        {formErrors.identificacion && !newTrabajador.identificacion && (
                          <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.identificacion}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                          Nombres del Colaborador *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={newTrabajador.nombre}
                            onChange={(e) => { setNewTrabajador({ ...newTrabajador, nombre: e.target.value }); setFormErrors(p => ({ ...p, nombre: undefined })); }}
                            placeholder="Nombres del colaborador"
                            className={`input-field py-2 text-xs ${
                              newTrabajador.nombre ? (nombreValidationResult.valid ? 'border-emerald-500' : 'border-red-400 dark:border-red-600') : ''
                            }`}
                          />
                          {newTrabajador.nombre && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {nombreValidationResult.valid ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                            </div>
                          )}
                        </div>
                        {newTrabajador.nombre && !nombreValidationResult.valid && (
                          <p className="text-[0.63rem] text-red-500 font-bold mt-0.5">{nombreValidationResult.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                          Apellidos del Colaborador *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={newTrabajador.apellido}
                            onChange={(e) => { setNewTrabajador({ ...newTrabajador, apellido: e.target.value }); setFormErrors(p => ({ ...p, apellido: undefined })); }}
                            placeholder="Apellidos del colaborador"
                            className={`input-field py-2 text-xs ${
                              newTrabajador.apellido ? (apellidoValidationResult.valid ? 'border-emerald-500' : 'border-red-400 dark:border-red-600') : ''
                            }`}
                          />
                          {newTrabajador.apellido && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {apellidoValidationResult.valid ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                            </div>
                          )}
                        </div>
                        {newTrabajador.apellido && !apellidoValidationResult.valid && (
                          <p className="text-[0.63rem] text-red-500 font-bold mt-0.5">{apellidoValidationResult.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                          Rol de Seguridad *
                        </label>
                        <select
                          value={newTrabajador.rol}
                          onChange={(e) => {
                            const selectedRol = e.target.value;
                            setNewTrabajador({ ...newTrabajador, rol: selectedRol });
                          }}
                          className="input-field py-2 text-xs font-bold uppercase"
                        >
                          <option value="DESARROLLADOR">DESARROLLADOR (WBS)</option>
                          <option value="LIDER">LÍDER DE PROYECTO</option>
                          <option value="COORDINADOR">COORDINADOR GLOBAL</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                        Correo Electrónico Corporativo *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={newTrabajador.email}
                          onChange={(e) => { setNewTrabajador({ ...newTrabajador, email: e.target.value }); setFormErrors(p => ({ ...p, email: undefined })); }}
                          onBlur={() => {
                            if (newTrabajador.email && !newTrabajador.email.includes('@')) {
                              setNewTrabajador(prev => ({ ...prev, email: `${prev.email.trim()}@ikernell.org` }));
                            }
                          }}
                          placeholder="correo.corporativo@ikernell.org"
                          className={`input-field py-2 text-xs font-mono pr-9 ${
                            newTrabajador.email ? (emailValidationResult.valid ? 'border-emerald-500' : 'border-red-400 dark:border-red-600') : ''
                          }`}
                        />
                        {newTrabajador.email && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {emailValidationResult.valid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                          </div>
                        )}
                      </div>
                      {newTrabajador.email && (
                        <p className={`text-[0.65rem] font-bold mt-1 ${emailValidationResult.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          {emailValidationResult.message}
                        </p>
                      )}
                    </div>

                    {/* Correo Electrónico Personal / Alternativo */}
                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                        Correo Electrónico Personal / Alternativo *
                      </label>
                      <input
                        type="email"
                        required
                        value={newTrabajador.emailPersonal || ''}
                        onChange={(e) => setNewTrabajador({ ...newTrabajador, emailPersonal: e.target.value })}
                        placeholder="correo.personal@gmail.com"
                        className="input-field py-2 text-xs font-semibold"
                      />
                      <p className="text-[0.65rem] text-zinc-500 font-medium mt-1">
                        Las credenciales temporales de acceso inicial se enviarán a este correo alternativo.
                      </p>
                    </div>

                    {/* Campo de Contraseña de Acceso Inicial y Generador de Clave Segura */}
                    <div className="space-y-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 text-xs">
                          <Lock size={13} className="text-blue-500" /> Contraseña de Acceso Inicial *
                        </label>
                        <button
                          type="button"
                          onClick={generarPasswordAleatoria}
                          className="text-[0.68rem] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Genera una clave aleatoria que cumple todos los requisitos de seguridad"
                        >
                          <Sparkles size={12} className="text-amber-500" />
                          <span>Generar Clave Segura</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPasswordInput ? "text" : "password"}
                          required
                          value={newTrabajador.passwordHash}
                          onChange={(e) => {
                            setNewTrabajador({ ...newTrabajador, passwordHash: e.target.value });
                            setFormErrors(p => ({ ...p, passwordHash: undefined }));
                          }}
                          placeholder="Mínimo 8 y máximo 20 caracteres (Ej. Ikernell2026*)"
                          className={`input-field py-2 pl-3.5 pr-10 text-xs font-mono font-bold ${formErrors.passwordHash ? 'border-red-400 dark:border-red-600' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordInput(!showPasswordInput)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors cursor-pointer"
                          title={showPasswordInput ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {showPasswordInput ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Checklist de Validación en Tiempo Real (Mín 1 Mayúscula, 1 Minúscula, 1 Número, 8-20 Caracteres) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                        <div className={`text-[0.63rem] font-extrabold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                          pwdValidity.minMax ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border-zinc-200/60 dark:border-zinc-800'
                        }`}>
                          {pwdValidity.minMax ? <Check size={11} className="stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />}
                          <span>8 a 20 Caracteres</span>
                        </div>

                        <div className={`text-[0.63rem] font-extrabold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                          pwdValidity.hasUpper ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border-zinc-200/60 dark:border-zinc-800'
                        }`}>
                          {pwdValidity.hasUpper ? <Check size={11} className="stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />}
                          <span>1 Mayúscula (A-Z)</span>
                        </div>

                        <div className={`text-[0.63rem] font-extrabold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                          pwdValidity.hasLower ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border-zinc-200/60 dark:border-zinc-800'
                        }`}>
                          {pwdValidity.hasLower ? <Check size={11} className="stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />}
                          <span>1 Minúscula (a-z)</span>
                        </div>

                        <div className={`text-[0.63rem] font-extrabold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                          pwdValidity.hasNumber ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border-zinc-200/60 dark:border-zinc-800'
                        }`}>
                          {pwdValidity.hasNumber ? <Check size={11} className="stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />}
                          <span>1 Número (0-9)</span>
                        </div>
                      </div>

                      {formErrors.passwordHash && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.passwordHash}</p>}
                    </div>
                  </div>

                  {/* 2. Perfil Profesional & Especialidad Principal (Adaptado al Rol) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100">
                        <GraduationCap size={14} className="text-indigo-500" />
                        <span>2. Perfil Profesional & Especialidad Principal</span>
                      </div>
                      <span className={`text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md border ${currentSkillProfile.badgeTagStyle}`}>
                        {currentSkillProfile.badgeTag}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                          Profesión / Titulación
                        </label>
                        <input
                          type="text"
                          value={newTrabajador.profesion}
                          onChange={(e) => setNewTrabajador({ ...newTrabajador, profesion: e.target.value })}
                          placeholder={currentSkillProfile.placeholderProfesion}
                          className="input-field py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                          Especialidad Principal
                        </label>
                        <input
                          type="text"
                          value={newTrabajador.especialidad}
                          onChange={(e) => setNewTrabajador({ ...newTrabajador, especialidad: e.target.value })}
                          placeholder={currentSkillProfile.placeholderEspecialidad}
                          className="input-field py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Habilidades Técnicas & Competencias por Rol */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-3.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs font-black text-blue-950 dark:text-blue-200">
                        <RoleIconComponent size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{currentSkillProfile.tituloModulo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-bold font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                          {selectedSkills.length} Habilidades
                        </span>
                      </div>
                    </div>
                    <p className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 font-medium">
                      {currentSkillProfile.subtitulo}
                    </p>

                    {/* Input para agregar habilidad personalizada */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                        placeholder="Escriba una habilidad o competencia y presione Enter o Agregar..."
                        className="input-field py-2 text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        disabled={!customSkillInput.trim()}
                        className="gradient-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1 shrink-0 disabled:opacity-40"
                      >
                        <Plus size={14} />
                        <span>Agregar</span>
                      </button>
                    </div>

                    {/* Chips de Habilidades Seleccionadas */}
                    <div className="min-h-[42px] p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/60 flex flex-wrap gap-1.5 items-center">
                      {selectedSkills.length === 0 ? (
                        <span className="text-[0.7rem] text-zinc-400 dark:text-zinc-500 italic">
                          {newTrabajador.rol === 'DESARROLLADOR' 
                            ? 'Ninguna habilidad agregada aún. Selecciona de las sugerencias recomendadas para desarrollo o escribe una personalizada.'
                            : 'Habilidades opcionales para este rol. Puedes seleccionar sugerencias de gestión o escribir competencias personalizadas.'}
                        </span>
                      ) : (
                        selectedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold shadow-2xs group"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Eliminar habilidad"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Píldoras Sugeridas Rápidas Adaptadas al Rol */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[0.68rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                        Sugerencias Rápidas para {currentSkillProfile.label} (clic para activar/desactivar):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {currentSkillProfile.sugerencias.map((skill) => {
                          const isSelected = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleToggleSkill(skill)}
                              className={`text-[0.68rem] px-2.5 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer inline-flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50'
                              }`}
                            >
                              {isSelected ? <Check size={11} className="stroke-[3]" /> : <Plus size={11} />}
                              <span>{skill}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => { 
                        setShowCreateModal(false); 
                        setFormErrors({}); 
                        setSelectedSkills([]); 
                        setCustomSkillInput(''); 
                      }}
                      disabled={submitting}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="gradient-button text-xs py-2 px-6 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 shadow-md"
                    >
                      {submitting ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Guardar Colaborador'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Modal: Gestión Integral de Caso / Solicitud Web */}
      <AnimatePresence>
        {selectedSolicitudModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto"
            >
              {/* Encabezado del Modal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                        SOL-00{selectedSolicitudModal.idSolicitud}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        Gestión Integral del Caso
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Remitente: <strong className="text-zinc-700 dark:text-zinc-300">{selectedSolicitudModal.nombreRemitente}</strong> ({selectedSolicitudModal.emailRemitente})
                    </p>
                  </div>
                </div>
              </div>

              {/* Consulta Original del Lead */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-zinc-500 font-semibold text-[0.7rem]">
                  <span>Asunto: <strong className="text-zinc-800 dark:text-zinc-200">{selectedSolicitudModal.asunto}</strong></span>
                  <span className="flex items-center gap-1 font-mono"><Clock size={11} /> {new Date(selectedSolicitudModal.fechaEnvio).toLocaleString()}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 italic bg-white dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  "{selectedSolicitudModal.mensaje}"
                </p>
                {selectedSolicitudModal.telefono && (
                  <p className="text-[0.7rem] text-zinc-500 flex items-center gap-1">
                    <Phone size={11} /> Teléfono de contacto: <strong className="text-zinc-700 dark:text-zinc-300">{selectedSolicitudModal.telefono}</strong>
                  </p>
                )}
              </div>

              {/* Formulario de Gestión del Caso */}
              <form onSubmit={handleSubmitGestionSolicitud} className="space-y-4 text-xs">
                {/* Selector de Nuevo Estado */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                    Actualizar Estado del Caso *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setSolicitudActionForm(prev => ({ ...prev, estado: 'ATENDIDA' }))}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        solicitudActionForm.estado === 'ATENDIDA'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      <span>Atendida</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSolicitudActionForm(prev => ({ ...prev, estado: 'REABIERTA' }))}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        solicitudActionForm.estado === 'REABIERTA'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-400 dark:border-purple-600 shadow-sm ring-2 ring-purple-500/20'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-purple-300'
                      }`}
                    >
                      <RotateCcw size={16} />
                      <span>Reabrir Caso</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSolicitudActionForm(prev => ({ ...prev, estado: 'EN_PROCESO' }))}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        solicitudActionForm.estado === 'EN_PROCESO'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-600 shadow-sm ring-2 ring-amber-500/20'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-amber-300'
                      }`}
                    >
                      <Clock size={16} />
                      <span>En Proceso</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSolicitudActionForm(prev => ({ ...prev, estado: 'PENDIENTE' }))}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        solicitudActionForm.estado === 'PENDIENTE'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-blue-300'
                      }`}
                    >
                      <Inbox size={16} />
                      <span>Pendiente</span>
                    </button>
                  </div>
                </div>

                {/* Campo: Notas de Atención / Acciones Realizadas */}
                {(solicitudActionForm.estado === 'ATENDIDA' || solicitudActionForm.estado === 'EN_PROCESO' || solicitudActionForm.estado === 'PENDIENTE') && (
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Notas de Atención y Acciones Realizadas {solicitudActionForm.estado === 'ATENDIDA' && <span className="text-emerald-600 font-extrabold">*</span>}
                    </label>
                    <textarea
                      rows={3}
                      value={solicitudActionForm.notasAtencion}
                      onChange={(e) => setSolicitudActionForm(prev => ({ ...prev, notasAtencion: e.target.value }))}
                      placeholder="Detalla las acciones ejecutadas: llamada realizada con el cliente, cotización formal enviada por correo, reunión técnica acordada, etc."
                      className="input-field py-2.5 leading-relaxed text-xs w-full"
                    />
                    <p className="text-[0.65rem] text-zinc-400 mt-1">
                      Estas notas quedarán registradas en la bitácora inmutable de auditoría del caso.
                    </p>
                  </div>
                )}

                {/* Campo Obligatorio: Motivo de Reapertura del Caso */}
                {solicitudActionForm.estado === 'REABIERTA' && (
                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200 font-extrabold">
                      <RotateCcw size={14} className="text-purple-600" />
                      <span>Justificación Obligatoria de Reapertura del Caso *</span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={solicitudActionForm.motivoReapertura}
                      onChange={(e) => setSolicitudActionForm(prev => ({ ...prev, motivoReapertura: e.target.value }))}
                      placeholder="Explica la razón por la cual se reabre el caso (ej. Cliente solicitó cotización adicional, nuevo requerimiento de alcance, reconsideración de propuesta)..."
                      className="input-field py-2.5 leading-relaxed text-xs w-full bg-white dark:bg-zinc-900 border-purple-300 dark:border-purple-700 focus:ring-purple-500/30"
                    />
                    <p className="text-[0.65rem] text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1">
                      <AlertTriangle size={13} className="shrink-0" /> Al reabrir, se incrementará el contador de reaperturas y se estampará la fecha y hora UTC de reapertura.
                    </p>
                  </div>
                )}

                {/* Trazabilidad Histórica y Auditoría */}
                <div className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200 text-[0.72rem]">
                    <History size={13} className="text-blue-500" />
                    <span>Línea de Tiempo y Trazabilidad del Caso:</span>
                  </div>

                  <div className="space-y-1.5 text-[0.68rem] text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div>
                        <strong>1. Solicitud Recibida:</strong> {new Date(selectedSolicitudModal.fechaEnvio).toLocaleString()}
                      </div>
                    </div>

                    {selectedSolicitudModal.fechaAtencion && (
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div>
                          <strong>2. Atención Formal:</strong> {new Date(selectedSolicitudModal.fechaAtencion).toLocaleString()} {selectedSolicitudModal.coordinador ? `por ${selectedSolicitudModal.coordinador.nombre} ${selectedSolicitudModal.coordinador.apellido}` : ''}
                          {selectedSolicitudModal.notasAtencion && <p className="italic text-zinc-500 dark:text-zinc-400">"{selectedSolicitudModal.notasAtencion}"</p>}
                        </div>
                      </div>
                    )}

                    {selectedSolicitudModal.fechaReapertura && (
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                        <div>
                          <strong>3. Última Reapertura (#{selectedSolicitudModal.contadorReaperturas}):</strong> {new Date(selectedSolicitudModal.fechaReapertura).toLocaleString()}
                          {selectedSolicitudModal.motivoReapertura && <p className="italic text-purple-600 dark:text-purple-400">"{selectedSolicitudModal.motivoReapertura}"</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSolicitudModal(null)}
                    disabled={submittingGestion}
                    className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGestion}
                    className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 shadow-md"
                  >
                    {submittingGestion ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Guardando Caso...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Guardar Gestión del Caso
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Modal: Reasignación Obligatoria de Proyectos al Inhabilitar Líder */}
        {showReasignarLiderModal && liderAInhabilitar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-extrabold text-base">
                  <AlertTriangle size={20} className="text-amber-500" />
                  <span>Reasignación Obligatoria de Proyectos</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReasignarLiderModal(false)}
                  className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2 text-amber-900 dark:text-amber-200">
                  <strong className="block text-xs font-black">
                    Líder Afectado: {liderAInhabilitar.nombre} {liderAInhabilitar.apellido} ({liderAInhabilitar.email})
                  </strong>
                  <p className="text-[0.7rem] leading-relaxed">
                    Este Líder administra actualmente <strong>{proyectosDelLiderAfectado.length} proyecto(s) activo(s)</strong>. Para inhabilitar su acceso, debes reasignar su portafolio a otro Líder activo disponible en la empresa.
                  </p>
                </div>

                {/* Lista de Proyectos que serán reasignados */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  <span className="text-[0.65rem] font-extrabold text-zinc-400 uppercase tracking-wider block">
                    Proyectos que cambiarán de supervisión:
                  </span>
                  {proyectosDelLiderAfectado.map((p) => (
                    <div key={p.idProyecto} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[0.7rem] flex items-center justify-between">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{p.nombre}</span>
                      <span className="font-mono text-zinc-500 shrink-0">PRJ-00{p.idProyecto}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleConfirmarReasignacionEInhabilitar} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block">
                      Seleccionar Nuevo Líder Receptor *
                    </label>
                    <select
                      required
                      value={nuevoLiderTargetId}
                      onChange={(e) => setNuevoLiderTargetId(e.target.value)}
                      className="input-field w-full py-2.5 text-xs font-bold appearance-none cursor-pointer"
                    >
                      <option value="">— Seleccione un Líder Activo —</option>
                      {trabajadores
                        .filter(t => t.idTrabajador !== liderAInhabilitar.idTrabajador && t.estado && t.rol && t.rol.toUpperCase().includes('LIDER'))
                        .map(l => (
                          <option key={l.idTrabajador} value={l.idTrabajador}>
                            {l.nombre} {l.apellido} ({l.profesion || 'Líder de Proyecto'}) &bull; {l.email}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowReasignarLiderModal(false)}
                      className="outline-button text-xs py-2 px-4 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReasignacionLider || !nuevoLiderTargetId}
                      className="gradient-button text-xs py-2 px-5 font-bold inline-flex items-center gap-1.5 shadow-md disabled:opacity-50"
                    >
                      {submittingReasignacionLider ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                      <span>Reasignar Proyectos e Inhabilitar</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};
