import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  User, Users, UserPlus, UserX, UserCheck, Search, Shield, ShieldCheck, ShieldAlert, CheckCircle2,
  Mail, Phone, Clock, FileText, AlertTriangle, Sparkles, Filter, X,
  Loader2, RefreshCw, Inbox, RotateCcw, MessageSquare, History, Edit3, Send, Calendar,
  Code2, Plus, Check, Layers, Briefcase, GraduationCap, BadgeCheck, Cpu, Tag, ChevronDown,
  ChevronLeft, ChevronRight, Lock, Eye, EyeOff, Key, Globe, Flag, FolderGit2, DollarSign, Building2,
  Crown, ArrowRight, ArrowLeft, ClipboardList, RotateCw, Pause, Play, Zap, CheckCircle, Info, PieChart, FileCheck, Activity, Download,
  ArrowUpDown, SlidersHorizontal, UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { PredictorBurnout } from '../../components/dashboard/PredictorBurnout';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { ConfirmActionModal } from '../../components/ui/ConfirmActionModal';

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

// Listados Estandarizados & Formales para Perfil Profesional (Evita ingreso de datos arbitrarios)
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

// Validador Estricto de Documentos de Identificación por País / Algoritmos Nacionales
const PAISES_IDENTIFICACION = [
  {
    code: 'CO',
    nombre: 'Colombia',
    docTipo: 'Cédula de Ciudadanía (CC)',
    flag: 'CO',
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
    flag: 'MX',
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
    flag: 'ES',
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
    flag: 'CL',
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
    flag: 'PE',
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
    flag: 'AR',
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
    flag: 'US',
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
    flag: 'INT',
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

// Formateador de Fechas Humano en Español (ej. "26 ago. 2026")
const formatearFechaHumana = (fechaStr) => {
  if (!fechaStr) return 'Sin fecha';
  try {
    const fecha = new Date(fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00');
    if (isNaN(fecha.getTime())) return fechaStr;
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return fechaStr;
  }
};

export const CoordinadorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('personal');
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingSolicitudId, setTogglingSolicitudId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState('TODOS'); // 'TODOS' | 'DESARROLLADOR' | 'LIDER' | 'COORDINADOR'
  const [techsSeleccionadas, setTechsSeleccionadas] = useState([]); // [] = Todas
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('ACTIVO'); // 'ACTIVO' (Default) | 'INHABILITADO' | 'TODOS'
  const [activacionSeleccionada, setActivacionSeleccionada] = useState('TODOS'); // 'TODOS' | 'VERIFICADO' | 'PENDIENTE'
  const [ordenTrabajadores, setOrdenTrabajadores] = useState('NOMBRE_ASC'); // 'NOMBRE_ASC' | 'NOMBRE_DESC' | 'ROL' | 'CEDULA'
  const [expandSkills, setExpandSkills] = useState(false); // Desplegable de habilidades Paso 3
  const [filtroSolicitudes, setFiltroSolicitudes] = useState('TODAS'); // 'TODAS' | 'PENDIENTE' | 'ATENDIDA' | 'REABIERTA' | 'EN_PROCESO'
  const [searchSolicitudQuery, setSearchSolicitudQuery] = useState('');
  const [fechaInicioSolicitud, setFechaInicioSolicitud] = useState('');
  const [fechaFinSolicitud, setFechaFinSolicitud] = useState('');

  // Estados para la pestaña 'proyectos' (Gestión de Proyectos - Vista Global del Coordinador)
  const [searchProyectoQuery, setSearchProyectoQuery] = useState('');
  const [filtroProyectoEstado, setFiltroProyectoEstado] = useState('TODOS'); // 'TODOS' | 'EN_PROGRESO' | 'COMPLETADO' | 'PAUSADO' | 'INHABILITADO'
  const [filtroProyectoLider, setFiltroProyectoLider] = useState('TODOS'); // 'TODOS' | idLider
  const [ordenProyecto, setOrdenProyecto] = useState('DEFAULT'); // 'DEFAULT' | 'PRESUPUESTO_DESC' | 'PRESUPUESTO_ASC' | 'NOMBRE_ASC' | 'FECHA_FIN'
  const [currentProyectoPage, setCurrentProyectoPage] = useState(1);
  const [proyectosPerPage, setProyectosPerPage] = useState(6);

  // Modales de Gestión de Proyectos en Coordinador
  const [selectedProyectoModal, setSelectedProyectoModal] = useState(null);
  const [loadingProyectoDetalle, setLoadingProyectoDetalle] = useState(false);
  const [proyectoEtapasModal, setProyectoEtapasModal] = useState([]);
  const [proyectoDevsModal, setProyectoDevsModal] = useState([]);

  // Estados para Modo Edición / Lectura e Historial de Cambios Directivos
  const [modoEdicionCoordinador, setModoEdicionCoordinador] = useState(false); // false = Modo Lectura, true = Modo Edición
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historialCambiosModal, setHistorialCambiosModal] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [sessionBatchId, setSessionBatchId] = useState('');
  const [busquedaHistorialCoord, setBusquedaHistorialCoord] = useState('');
  const [filtroAccionHistorialCoord, setFiltroAccionHistorialCoord] = useState('TODOS');
  const [filtroFechaHistorialCoord, setFiltroFechaHistorialCoord] = useState('TODOS');

  // Filtro dinámico para el historial de cambios en Coordinador
  const historialFiltradoCoord = useMemo(() => {
    if (!Array.isArray(historialCambiosModal)) return [];
    return historialCambiosModal.filter(reg => {
      if (busquedaHistorialCoord.trim()) {
        const term = busquedaHistorialCoord.toLowerCase();
        const matchDetalle = (reg.detalles || '').toLowerCase().includes(term);
        const matchAccion = (reg.accion || '').toLowerCase().includes(term);
        const matchNombre = (reg.nombreCoordinador || '').toLowerCase().includes(term);
        const matchEmail = (reg.emailCoordinador || '').toLowerCase().includes(term);
        if (!matchDetalle && !matchAccion && !matchNombre && !matchEmail) return false;
      }

      if (filtroAccionHistorialCoord !== 'TODOS') {
        const acc = (reg.accion || '').toUpperCase();
        const det = (reg.detalles || '').toUpperCase();
        if (filtroAccionHistorialCoord === 'ETAPA' && !acc.includes('ETAPA') && !det.includes('FASE') && !det.includes('ETAPA')) return false;
        if (filtroAccionHistorialCoord === 'ACTIVIDAD' && !acc.includes('ACTIVIDAD') && !det.includes('TAREA') && !det.includes('ACTIVIDAD')) return false;
        if (filtroAccionHistorialCoord === 'NOMINA' && !acc.includes('NOMINA') && !acc.includes('DESARROLLADOR') && !acc.includes('ASIGNACION') && !det.includes('VINCUL') && !det.includes('DESARROLLADOR')) return false;
        if (filtroAccionHistorialCoord === 'ESTADO' && !acc.includes('ESTADO') && !det.includes('ESTADO') && !det.includes('PAUSA') && !det.includes('FINALIZ')) return false;
      }

      if (filtroFechaHistorialCoord !== 'TODOS' && reg.fechaCambio) {
        const date = new Date(reg.fechaCambio);
        const now = new Date();
        if (filtroFechaHistorialCoord === 'HOY') {
          if (date.toDateString() !== now.toDateString()) return false;
        } else if (filtroFechaHistorialCoord === '7DIAS') {
          const diffDays = (now - date) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (filtroFechaHistorialCoord === '30DIAS') {
          const diffDays = (now - date) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [historialCambiosModal, busquedaHistorialCoord, filtroAccionHistorialCoord, filtroFechaHistorialCoord]);

  // Estados para búsqueda de tareas en modal y navegación de auditoría
  const [busquedaTareaDevModal, setBusquedaTareaDevModal] = useState('');
  const [filtroEstadoTareaDevModal, setFiltroEstadoTareaDevModal] = useState('TODAS');
  const [navFromWorker, setNavFromWorker] = useState(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);

  // Cálculo integral de Carga Horaria (48h) y Tareas del Trabajador seleccionado
  const devTaskMetrics = useMemo(() => {
    if (!selectedTrabajadorModal || !Array.isArray(proyectos)) {
      return { tareas: [], horasProgreso: 0, horasPendientes: 0, horasCompletadas: 0, horasActivas: 0, horasLibres: 48, pctActivas: 0 };
    }

    const targetId = selectedTrabajadorModal.idTrabajador || selectedTrabajadorModal.id;
    const targetEmail = selectedTrabajadorModal.email ? String(selectedTrabajadorModal.email).toLowerCase().trim() : '';

    const allAssignedTasks = [];
    let hProgreso = 0;
    let hPendiente = 0;
    let hCompletada = 0;

    proyectos.forEach(prj => {
      if (Array.isArray(prj.etapas)) {
        prj.etapas.forEach(etapa => {
          if (Array.isArray(etapa.actividades)) {
            etapa.actividades.forEach(act => {
              const devId = act.idDesarrollador || act.desarrollador?.idTrabajador || act.desarrollador?.id;
              const devEmail = act.desarrollador?.email ? String(act.desarrollador.email).toLowerCase().trim() : '';

              const isMatch = (targetId && devId && String(targetId) === String(devId)) ||
                              (targetEmail && devEmail && targetEmail === devEmail);

              if (isMatch) {
                const horas = Number(act.horasEstimadas || act.horas || 0);
                const estado = (act.estado || 'PENDIENTE').toUpperCase();

                if (estado.includes('PROGRESO') || estado.includes('CURSO') || estado.includes('IN_PROGRESS')) {
                  hProgreso += horas;
                } else if (estado.includes('COMPLET') || estado.includes('FINALIZ')) {
                  hCompletada += horas;
                } else {
                  hPendiente += horas;
                }

                allAssignedTasks.push({
                  ...act,
                  horas,
                  estadoNorm: estado.includes('PROGRESO') ? 'EN_PROGRESO' : estado.includes('COMPLET') ? 'COMPLETADA' : 'PENDIENTE',
                  proyectoId: prj.idProyecto,
                  proyectoNombre: prj.nombre,
                  etapaId: etapa.idEtapa,
                  etapaNombre: etapa.nombre
                });
              }
            });
          }
        });
      }
    });

    const hActivas = hProgreso + hPendiente;
    const hLibres = Math.max(0, 48 - hActivas);
    const pctActivas = Math.min(100, Math.round((hActivas / 48) * 100));

    return {
      tareas: allAssignedTasks,
      horasProgreso: hProgreso,
      horasPendientes: hPendiente,
      horasCompletadas: hCompletada,
      horasActivas: hActivas,
      horasLibres: hLibres,
      pctActivas: pctActivas
    };
  }, [selectedTrabajadorModal, proyectos]);

  // Tareas filtradas en modal
  const tareasFiltradasDevModal = useMemo(() => {
    return devTaskMetrics.tareas.filter(t => {
      if (busquedaTareaDevModal.trim()) {
        const term = busquedaTareaDevModal.toLowerCase();
        const matchNombre = (t.nombre || '').toLowerCase().includes(term);
        const matchPrj = (t.proyectoNombre || '').toLowerCase().includes(term);
        const matchEtapa = (t.etapaNombre || '').toLowerCase().includes(term);
        if (!matchNombre && !matchPrj && !matchEtapa) return false;
      }

      if (filtroEstadoTareaDevModal !== 'TODAS') {
        if (t.estadoNorm !== filtroEstadoTareaDevModal) return false;
      }

      return true;
    });
  }, [devTaskMetrics.tareas, busquedaTareaDevModal, filtroEstadoTareaDevModal]);

  const handleIrATareaProyectoDesdeTrabajador = (idProyecto, idEtapa, idActividad, nombreTarea, trabajador) => {
    setNavFromWorker({
      idTrabajador: trabajador.idTrabajador || trabajador.id,
      nombre: `${trabajador.nombre || ''} ${trabajador.apellido || ''}`.trim(),
      tareaId: idActividad,
      tareaNombre: nombreTarea,
      prjId: idProyecto
    });

    setSelectedTrabajadorModal(null);

    if (idProyecto) {
      const prjEncontrado = proyectos.find(p => String(p.idProyecto) === String(idProyecto));
      if (prjEncontrado) {
        setSelectedProyectoModal(prjEncontrado);
      }
    }

    if (idActividad) {
      setHighlightedTaskId(idActividad);
    } else if (idProyecto) {
      setHighlightedTaskId(`prj-${idProyecto}`);
    }

    setTimeout(() => {
      const targetEl = document.getElementById(`actividad-${idActividad}`) || document.getElementById(`proyecto-${idProyecto}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  const registrarAccionCoordinador = async (idProyecto, accion, detalles) => {
    try {
      const bId = sessionBatchId || ('BATCH-' + Date.now());
      if (!sessionBatchId) setSessionBatchId(bId);

      const coordId = Number(user?.idTrabajador || user?.id || user?.idUsuario || user?.trabajadorId || 1);
      const coordNombre = user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : (user?.nombreCompleto || user?.username || 'Coordinador General');
      const coordEmail = user?.email || 'coordinador@ikernell.com';

      await api.post(`/coordinador/proyectos/${idProyecto}/historial-cambios?idCoordinador=${coordId}&nombreCoordinador=${encodeURIComponent(coordNombre)}&emailCoordinador=${encodeURIComponent(coordEmail)}&accion=${encodeURIComponent(accion)}&detalles=${encodeURIComponent(detalles)}&batchId=${encodeURIComponent(bId)}`).catch(err => {
        console.warn('[Auditoría Coordinador] Aviso:', err?.message || err);
      });
    } catch (err) {
      console.warn('[Auditoría Coordinador] Error no bloqueante:', err);
    }
  };

  const handleAbrirHistorialCambios = async (idProyecto) => {
    if (!idProyecto || idProyecto === 'GLOBAL') {
      toast.info('Seleccione un proyecto específico para consultar el historial de auditoría.');
      return;
    }
    try {
      setLoadingHistorial(true);
      setShowHistorialModal(true);
      const res = await api.get(`/coordinador/proyectos/${idProyecto}/historial-cambios`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setHistorialCambiosModal(data);
    } catch (err) {
      console.error('Error al obtener historial de cambios:', err);
      toast.error('Error al cargar historial de auditoría.');
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Reasignar Líder a Proyecto Individual
  const [showReasignarLiderModalPrj, setShowReasignarLiderModalPrj] = useState(false);
  const [proyectoAReasignar, setProyectoAReasignar] = useState(null);
  const [targetNuevoLiderPrjId, setTargetNuevoLiderPrjId] = useState('');
  const [motivoReasignacionPrj, setMotivoReasignacionPrj] = useState('');
  const [submittingReasignarLiderPrj, setSubmittingReasignarLiderPrj] = useState(false);

  // Estados para Acciones Directivas WBS en Modo Edición del Coordinador
  const [showNuevaEtapaModalCoord, setShowNuevaEtapaModalCoord] = useState(false);
  const [nuevaEtapaCoord, setNuevaEtapaCoord] = useState({ nombreEtapa: '' });
  const [submittingEtapaCoord, setSubmittingEtapaCoord] = useState(false);

  const [showNuevaActividadModalCoord, setShowNuevaActividadModalCoord] = useState(false);
  const [nuevaActividadCoord, setNuevaActividadCoord] = useState({ nombreActividad: '', idEtapa: '', idDesarrollador: '' });
  const [submittingActividadCoord, setSubmittingActividadCoord] = useState(false);

  const [showEditarEtapaModalCoord, setShowEditarEtapaModalCoord] = useState(false);
  const [etapaAEditarCoord, setEtapaAEditarCoord] = useState({ idEtapa: null, nombreEtapa: '', estado: '' });
  const [submittingEditarEtapaCoord, setSubmittingEditarEtapaCoord] = useState(false);

  const [showReasignarActividadModalCoord, setShowReasignarActividadModalCoord] = useState(false);
  const [etapaAFinalizarModalCoord, setEtapaAFinalizarModalCoord] = useState(null);
  const [etapaAConfirmarFinalizar, setEtapaAConfirmarFinalizar] = useState(null); // Para ConfirmActionModal
  const [etapaAReabrirModalCoord, setEtapaAReabrirModalCoord] = useState(null);
  const [actividadAReasignarCoord, setActividadAReasignarCoord] = useState(null);
  const [targetDevIdReasignarCoord, setTargetDevIdReasignarCoord] = useState('');
  const [motivoReasignarCoord, setMotivoReasignarCoord] = useState('');
  const [submittingReasignarActividadCoord, setSubmittingReasignarActividadCoord] = useState(false);

  const [submittingPausaFinalizarCoord, setSubmittingPausaFinalizarCoord] = useState(false);
  const [showConfirmFinalizarCoord, setShowConfirmFinalizarCoord] = useState(false);
  const [showConfirmPausarCoordModal, setShowConfirmPausarCoordModal] = useState(false);
  const [motivoCancelacionCoord, setMotivoCancelacionCoord] = useState('CANCELACION_CLIENTE');
  const [justificacionCancelacionCoord, setJustificacionCancelacionCoord] = useState('');
  const [cancelacionErrorCoord, setCancelacionErrorCoord] = useState('');
  const [showGenerarReportePdfModalCoord, setShowGenerarReportePdfModalCoord] = useState(false);
  const [pdfConfigCoord, setPdfConfigCoord] = useState({
    nivelDetalle: 'DETALLADO',
    incluirWbs: true,
    incluirEquipo: true,
    incluirPausas: true,
    incluirAuditoriaCoordinador: true,
    incluirMetricasKpi: true,
    incluirMatrizRiesgos: true,
    incluirFirmaDirectiva: true,
    modoSensible: true
  });

  const seleccionarPerfilPdfCoord = (nivel) => {
    if (nivel === 'RESUMIDO') {
      setPdfConfigCoord({
        nivelDetalle: 'RESUMIDO',
        incluirWbs: true,
        incluirEquipo: false,
        incluirPausas: false,
        incluirAuditoriaCoordinador: false,
        incluirMetricasKpi: true,
        incluirMatrizRiesgos: false,
        incluirFirmaDirectiva: false,
        modoSensible: true
      });
    } else if (nivel === 'DETALLADO') {
      setPdfConfigCoord({
        nivelDetalle: 'DETALLADO',
        incluirWbs: true,
        incluirEquipo: true,
        incluirPausas: true,
        incluirAuditoriaCoordinador: false,
        incluirMetricasKpi: true,
        incluirMatrizRiesgos: true,
        incluirFirmaDirectiva: true,
        modoSensible: true
      });
    } else if (nivel === 'AUDITORIA_COMPLETA') {
      setPdfConfigCoord({
        nivelDetalle: 'AUDITORIA_COMPLETA',
        incluirWbs: true,
        incluirEquipo: true,
        incluirPausas: true,
        incluirAuditoriaCoordinador: true,
        incluirMetricasKpi: true,
        incluirMatrizRiesgos: true,
        incluirFirmaDirectiva: true,
        modoSensible: true
      });
    }
  };

  // Generador de Reporte PDF Directivo 100/10 - Arquitectura de Tabla Corporativa Tabular Sin Corchetes ni Superposiciones
  const handleGenerarReportePdfCoord = () => {
    if (!selectedProyectoModal) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Paleta de Colores Ejecutivo Corporativo (Estándar Slate & Navy)
      const navyColor = [30, 58, 138];      // #1e3a8a (Azul Marino Ejecutivo)
      const slateDark = [15, 23, 42];       // #0f172a (Slate Principal)
      const slateMuted = [100, 116, 139];   // #64748b (Slate Secundario)
      const cardBg = [248, 250, 252];       // #f8fafc (Fondo Tarjeta)
      const cardBorder = [203, 213, 225];   // #cbd5e1 (Borde Estructurado)
      const rowLineColor = [226, 232, 240]; // #e2e8f0 (Línea de Filas)
      const emeraldColor = [5, 150, 105];   // #059669 (Verde Éxito)
      const amberColor = [217, 119, 6];      // #d97706 (Ámbar Pausa/Pendiente)
      const purpleColor = [109, 40, 217];   // #6d28d9 (Púrpura Auditoría)

      // 1. BANNER ENCABEZADO CORPORATIVO
      doc.setFillColor(...navyColor);
      doc.rect(0, 0, 210, 26, 'F');

      // Franja de Acento Inferior
      doc.setFillColor(234, 179, 8);
      doc.rect(0, 26, 210, 1.2, 'F');

      // Títulos del Encabezado
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('IKERNELL ENTERPRISE ARCHITECTURE PLATFORM', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('REPORTE DIRECTIVO DE AUDITORÍA Y ESTRUCTURA WBS', 14, 18);

      const nowStr = `${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`EMISIÓN OFICIAL: ${nowStr}`, 138, 18);

      let yPos = 34;

      // 2. FICHA TÉCNICA DEL PROYECTO (TARJETA EJECUTIVA REDONDEADA)
      doc.setFillColor(...cardBg);
      doc.setDrawColor(...cardBorder);
      doc.setLineWidth(0.35);
      doc.roundedRect(14, yPos, 182, 38, 2, 2, 'FD');

      // Título Limpio del Proyecto
      doc.setTextColor(...slateDark);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const cleanProjTitle = selectedProyectoModal.nombre.replace(/^(Proyecto:\s*)+/i, '');
      doc.text(`PROYECTO: ${cleanProjTitle}`, 18, yPos + 8);

      // Línea divisoria interna
      doc.setDrawColor(...rowLineColor);
      doc.line(18, yPos + 11, 192, yPos + 11);

      // Grid Metadatos - Columna 1
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slateMuted);
      doc.text('REGISTRO:', 18, yPos + 18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navyColor);
      doc.text(`PRJ-00${selectedProyectoModal.idProyecto}`, 45, yPos + 18);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slateMuted);
      doc.text('ORGANIZACIÓN:', 18, yPos + 25);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text(selectedProyectoModal.cliente || 'Cliente Corporativo', 45, yPos + 25);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slateMuted);
      doc.text('LÍDER RESPONSABLE:', 18, yPos + 32);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      const liderNombre = selectedProyectoModal.lider ? `${selectedProyectoModal.lider.nombre} ${selectedProyectoModal.lider.apellido}` : 'Asignación Directiva';
      doc.text(liderNombre, 45, yPos + 32);

      // Grid Metadatos - Columna 2
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slateMuted);
      doc.text('ESTADO PROYECTO:', 115, yPos + 18);
      const st = (selectedProyectoModal.estado || 'ACTIVO').toUpperCase().replace(/_/g, ' ');
      const isFin = st === 'FINALIZADO' || st === 'COMPLETADO';
      const isPau = st === 'EN PAUSA' || st === 'PAUSADO';
      doc.setTextColor(...(isFin ? emeraldColor : isPau ? amberColor : navyColor));
      doc.setFont('helvetica', 'bold');
      doc.text(st, 155, yPos + 18);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slateMuted);
      doc.text('PRESUPUESTO:', 115, yPos + 25);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...emeraldColor);
      doc.text(`US$ ${Number(selectedProyectoModal.presupuesto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 155, yPos + 25);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slateMuted);
      doc.text('CRONOGRAMA:', 115, yPos + 32);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text(`${formatearFechaHumana(selectedProyectoModal.fechaInicio)} a ${formatearFechaHumana(selectedProyectoModal.fechaFinEstimada)}`, 155, yPos + 32);

      yPos += 44;

      // Alcance / Descripción si existe
      if (selectedProyectoModal.descripcion) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slateDark);
        doc.text('ALCANCE Y OBJETIVOS ESTRATÉGICOS:', 14, yPos);
        yPos += 4.5;

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const splitDesc = doc.splitTextToSize(selectedProyectoModal.descripcion, 182);
        doc.text(splitDesc, 14, yPos);
        yPos += (splitDesc.length * 3.8) + 6;
      }

      // 3. SECCIÓN HISTORIAL DE AUDITORÍA DIRECTIVA (Si existen registros)
      if (historialCambiosModal && historialCambiosModal.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }

        doc.setFillColor(245, 243, 255);
        doc.setDrawColor(221, 214, 254);
        doc.roundedRect(14, yPos, 182, 6, 1, 1, 'FD');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...purpleColor);
        doc.text('TRAZABILIDAD DE MODIFICACIONES DIRECTIVAS - AUDITORÍA DE COORDINACIÓN', 18, yPos + 4.2);
        yPos += 8;

        historialCambiosModal.slice(0, 5).forEach((reg, idx) => {
          if (yPos > 265) { doc.addPage(); yPos = 20; }
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...purpleColor);
          doc.text(`${new Date(reg.fechaCambio).toLocaleString('es-CO')} - Acción ${idx + 1}: ${reg.accion}`, 16, yPos);
          yPos += 3.8;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          const splitDet = doc.splitTextToSize(`Detalles: ${reg.detalles} | Coordinador: ${reg.nombreCoordinador}`, 176);
          doc.text(splitDet, 18, yPos);
          yPos += (splitDet.length * 3.5) + 3;
        });

        yPos += 3;
      }

      // 4. ESTRUCTURA WBS Y TABLA DE ACTIVIDADES (Diseño Tabular Formal Sin Corchetes ni Superposición)
      if (yPos > 230) { doc.addPage(); yPos = 20; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navyColor);
      doc.text('ESTRUCTURA DE DESGLOSE DE TRABAJO WBS Y TAREAS TÉCNICAS', 14, yPos);
      yPos += 7;

      const etapasAImprimir = proyectoEtapasModal && proyectoEtapasModal.length > 0 ? proyectoEtapasModal : [];

      if (etapasAImprimir.length === 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('Sin etapas WBS registradas para este proyecto.', 14, yPos);
        yPos += 8;
      } else {
        etapasAImprimir.forEach((etapa, idx) => {
          if (yPos > 240) { doc.addPage(); yPos = 20; }

          // Limpieza estricta de nombres duplicados de Fase
          let rawEtapaNombre = etapa.nombreEtapa || `Fase ${idx + 1}`;
          rawEtapaNombre = rawEtapaNombre.replace(/^(Fase\s+\d+:\s*)+/i, '');
          const tituloFaseLimpio = `Fase ${idx + 1}: ${rawEtapaNombre}`;

          const estadoEtapa = (etapa.estado || 'PENDIENTE').toUpperCase().replace(/_/g, ' ');
          const isFaseFin = estadoEtapa === 'FINALIZADA' || estadoEtapa === 'COMPLETADO';

          // 4.1 Barra de Cabecera de Etapa / Fase (Sin corchetes)
          doc.setFillColor(241, 245, 249); // slate-100
          doc.setDrawColor(...cardBorder);
          doc.setLineWidth(0.35);
          doc.roundedRect(14, yPos, 182, 8, 1.5, 1.5, 'FD');

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...slateDark);
          doc.text(tituloFaseLimpio, 18, yPos + 5.5);

          // Estado de Etapa al extremo derecho (Texto limpio, sin corchetes)
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...(isFaseFin ? emeraldColor : navyColor));
          doc.text(estadoEtapa, 170, yPos + 5.5);

          // AVANCE OBLIGATORIO DE Y PARA EVITAR SUPERPOSICIONES CON LA TABLA DE ACTIVIDADES
          yPos += 11;

          // 4.2 Cabecera Tabular de Actividades de la Fase
          const actividades = etapa.actividades || [];
          if (actividades.length > 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, yPos, 182, 6, 'F');
            doc.setDrawColor(...rowLineColor);
            doc.setLineWidth(0.25);
            doc.line(14, yPos, 196, yPos);
            doc.line(14, yPos + 6, 196, yPos + 6);

            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...slateMuted);
            doc.text('DESCRIPCIÓN DE ACTIVIDAD WBS', 18, yPos + 4.2);
            doc.text('DESARROLLADOR ASIGNADO', 125, yPos + 4.2);
            doc.text('ESTADO', 170, yPos + 4.2);

            yPos += 8;

            // 4.3 Filas de Actividades de la Fase
            actividades.forEach((act) => {
              const actNombre = act.nombreActividad || act.descripcion || 'Actividad WBS';
              const dev = act.desarrollador ? `${act.desarrollador.nombre} ${act.desarrollador.apellido}` : 'Sin Asignar';
              const actEst = (act.estado || 'PENDIENTE').toUpperCase().replace(/_/g, ' ');
              const isActFin = actEst === 'FINALIZADA' || actEst === 'COMPLETADO';
              const isActProg = actEst === 'EN PROGRESO' || actEst === 'EN CURSO';

              // Ajuste automático de alto de fila según número de líneas de la descripción
              const splitTask = doc.splitTextToSize(actNombre, 102);
              const rowHeight = Math.max(7, splitTask.length * 3.8 + 2.5);

              if (yPos + rowHeight > 270) {
                doc.addPage();
                yPos = 20;
              }

              // Línea divisoria inferior de la fila
              doc.setDrawColor(...rowLineColor);
              doc.setLineWidth(0.2);
              doc.line(14, yPos + rowHeight - 0.5, 196, yPos + rowHeight - 0.5);

              // Columna 1: Descripción de la Tarea
              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(30, 41, 59);
              doc.text(splitTask, 18, yPos + 4);

              // Columna 2: Nombre del Desarrollador (Limpio, sin 'Dev:' ni paréntesis)
              doc.setFontSize(7.5);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(71, 85, 105);
              doc.text(dev, 125, yPos + 4);

              // Columna 3: Estado de la Tarea (Limpio, sin corchetes)
              doc.setFontSize(7.5);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(...(isActFin ? emeraldColor : isActProg ? navyColor : amberColor));
              doc.text(actEst, 170, yPos + 4);

              yPos += rowHeight;
            });
          } else {
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            doc.text('Sin tareas asignadas en esta fase.', 18, yPos + 4);
            yPos += 8;
          }

          yPos += 5; // Separación entre bloques de Fase
        });
      }

      // 5. PIE DE PÁGINA PROFESIONAL Y NUMERACIÓN DE PÁGINAS
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Línea divisoria inferior
        doc.setDrawColor(...cardBorder);
        doc.setLineWidth(0.3);
        doc.line(14, 282, 196, 282);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`Sistema IKernell Enterprise Architecture | Documento Oficial PRJ-00${selectedProyectoModal.idProyecto}`, 14, 287);
        doc.setFont('helvetica', 'bold');
        doc.text(`Página ${i} de ${totalPages}`, 178, 287);
      }

      const cleanFileName = `Reporte_Directivo_PRJ-00${selectedProyectoModal.idProyecto}_${selectedProyectoModal.nombre.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      doc.save(cleanFileName);
      toast.success('Reporte PDF corporativo generado exitosamente.');
      setShowGenerarReportePdfModalCoord(false);
    } catch (e) {
      console.error('Error generando PDF:', e);
      toast.error('Error al generar reporte PDF.');
    }
  };

  // Evaluación de procesos WBS e impacto activo para el Modal de Pausa del Coordinador
  const evidenciaWbsPausaCoord = useMemo(() => {
    if (!proyectoEtapasModal || !Array.isArray(proyectoEtapasModal) || proyectoEtapasModal.length === 0) {
      return {
        etapasActivas: [],
        actividadesActivas: [],
        tieneAvancesActivos: false
      };
    }

    const etapasActivas = proyectoEtapasModal.filter(et => et?.estado !== 'FINALIZADA' && et?.estado !== 'COMPLETADA');
    const actividadesActivas = [];

    proyectoEtapasModal.forEach(et => {
      if (et.actividades && Array.isArray(et.actividades)) {
        et.actividades.forEach(act => {
          if (act.estado !== 'FINALIZADA' && act.estado !== 'COMPLETADA') {
            actividadesActivas.push({
              ...act,
              etapaNombre: et.nombreEtapa
            });
          }
        });
      }
    });

    return {
      etapasActivas,
      actividadesActivas,
      tieneAvancesActivos: etapasActivas.length > 0 || actividadesActivas.length > 0
    };
  }, [proyectoEtapasModal]);

  // Cálculo de días y fecha límite restante para el Modal de Pausa
  const calculoDiasPausaCoord = useMemo(() => {
    if (!selectedProyectoModal?.fechaFinEstimada) return { diasRestantes: 0, fechaFormateada: 'Sin fecha pactada' };
    const fin = new Date(selectedProyectoModal.fechaFinEstimada);
    const hoy = new Date();
    const diffTime = fin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      diasRestantes: diffDays > 0 ? diffDays : 0,
      fechaFormateada: fin.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }, [selectedProyectoModal?.fechaFinEstimada]);

  // Pausar / Reanudar Proyecto con Confirmación de Impacto Directivo
  const handlePausarReanudarProyectoCoord = async () => {
    if (!selectedProyectoModal) return;
    const isPausado = selectedProyectoModal.estado === 'EN_PAUSA' || selectedProyectoModal.estado === 'PAUSADO';

    if (isPausado) {
      // Reanudar directamente si ya estaba pausado
      try {
        setSubmittingPausaFinalizarCoord(true);
        await api.patch(`/lider/proyectos/${selectedProyectoModal.idProyecto}/reactivar`);
        setSelectedProyectoModal(prev => ({ ...prev, estado: 'EN_PROGRESO' }));
        setProyectos(prev => prev.map(p => p.idProyecto === selectedProyectoModal.idProyecto ? { ...p, estado: 'EN_PROGRESO' } : p));
        await registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'REANUDACION_PROYECTO', 'El Coordinador reanudó el proyecto en la plataforma.');
        toast.success('Proyecto reactivado exitosamente.');
      } catch (err) {
        console.error('Error al reactivar el proyecto:', err);
        toast.error(err.message || 'Error al reactivar el proyecto.');
      } finally {
        setSubmittingPausaFinalizarCoord(false);
      }
    } else {
      // Si se va a pausar, ABRIR EL MODAL DE ADVERTENCIA E IMPACTO OPERATIVO
      setShowConfirmPausarCoordModal(true);
    }
  };

  // Ejecutar Pausa de Proyecto tras Confirmar en Modal
  const handleEjecutarPausaProyectoCoord = async () => {
    if (!selectedProyectoModal) return;

    try {
      setSubmittingPausaFinalizarCoord(true);
      await api.patch(`/lider/proyectos/${selectedProyectoModal.idProyecto}/pausar`);
      setSelectedProyectoModal(prev => ({ ...prev, estado: 'EN_PAUSA' }));
      setProyectos(prev => prev.map(p => p.idProyecto === selectedProyectoModal.idProyecto ? { ...p, estado: 'EN_PAUSA' } : p));

      const resumenAfectados = evidenciaWbsPausaCoord.actividadesActivas.length > 0
        ? `Pausa directiva aplicada. ${evidenciaWbsPausaCoord.actividadesActivas.length} actividades WBS y sus desarrolladores asignados fueron notificados.`
        : 'El Coordinador pausó temporalmente el proyecto.';

      await registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'PAUSA_PROYECTO', resumenAfectados);
      toast.success('Proyecto puesto en pausa. Se notificó el congelamiento de actividades a los desarrolladores.');
      setShowConfirmPausarCoordModal(false);
    } catch (err) {
      console.error('Error al pausar el proyecto:', err);
      toast.error(err.message || 'Error al pausar el proyecto.');
    } finally {
      setSubmittingPausaFinalizarCoord(false);
    }
  };

  // Evidencia de auditoría para finalización de proyecto en Coordinador (RF-20)
  const evidenciaWbsFinalizacionCoord = useMemo(() => {
    if (!proyectoEtapasModal || !Array.isArray(proyectoEtapasModal) || proyectoEtapasModal.length === 0) {
      return {
        etapasIncompletas: [],
        actividadesIncompletas: [],
        todasCompletadas: false,
        esProyectoVacio: true,
        totalEtapas: 0,
        totalActividades: 0
      };
    }

    const etapasIncompletas = [];
    const actividadesIncompletas = [];
    let totalActividades = 0;

    proyectoEtapasModal.forEach(et => {
      const isEtapaFin = et.estado === 'FINALIZADA' || et.estado === 'COMPLETADA';
      const acts = Array.isArray(et.actividades) ? et.actividades : [];
      totalActividades += acts.length;

      const actsInc = acts.filter(a => a.estado !== 'FINALIZADA' && a.estado !== 'COMPLETADA');
      if (actsInc.length > 0) {
        actividadesIncompletas.push(...actsInc.map(a => ({ ...a, etapaNombre: et.nombreEtapa })));
      }

      if (!isEtapaFin || actsInc.length > 0) {
        etapasIncompletas.push({
          ...et,
          actividadesIncompletas: actsInc,
          actividadesPendientesCount: actsInc.length
        });
      }
    });

    return {
      etapasIncompletas,
      actividadesIncompletas,
      todasCompletadas: etapasIncompletas.length === 0 && actividadesIncompletas.length === 0,
      esProyectoVacio: false,
      totalEtapas: proyectoEtapasModal.length,
      totalActividades
    };
  }, [proyectoEtapasModal]);

  // Abrir Modal de Confirmación Directiva de Cierre
  const handleAbrirConfirmFinalizarCoord = () => {
    if (!selectedProyectoModal) return;
    setMotivoCancelacionCoord('CANCELACION_CLIENTE');
    setJustificacionCancelacionCoord('');
    setCancelacionErrorCoord('');
    setShowConfirmFinalizarCoord(true);
  };

  // Finalizar Proyecto con Auditoría Directiva y Verificación WBS Estricta
  const handleEjecutarFinalizacionProyectoCoord = async () => {
    if (!selectedProyectoModal) return;

    if (evidenciaWbsFinalizacionCoord.esProyectoVacio) {
      if (!justificacionCancelacionCoord || justificacionCancelacionCoord.trim().length < 10) {
        setCancelacionErrorCoord('La justificación de cierre prematuro debe tener al menos 10 caracteres.');
        toast.error('Justificación obligatoria de al menos 10 caracteres.');
        return;
      }
    } else if (!evidenciaWbsFinalizacionCoord.todasCompletadas) {
      toast.error('No se puede finalizar el proyecto. Aún existen etapas o tareas pendientes en la WBS.');
      return;
    }

    try {
      setSubmittingPausaFinalizarCoord(true);
      const payload = evidenciaWbsFinalizacionCoord.esProyectoVacio ? {
        motivoCancelacion: motivoCancelacionCoord,
        justificacionCancelacion: justificacionCancelacionCoord.trim()
      } : {};

      await api.patch(`/lider/proyectos/${selectedProyectoModal.idProyecto}/finalizar`, payload);
      setSelectedProyectoModal(prev => ({ ...prev, estado: 'FINALIZADO' }));
      setProyectos(prev => prev.map(p => p.idProyecto === selectedProyectoModal.idProyecto ? { ...p, estado: 'FINALIZADO' } : p));

      const detallesAuditoria = evidenciaWbsFinalizacionCoord.esProyectoVacio
        ? `Cierre prematuro de proyecto vacío. Motivo: ${motivoCancelacionCoord}. Justificación: ${justificacionCancelacionCoord.trim()}`
        : 'Finalización formal de proyecto con 100% de cumplimiento WBS verificado por el Coordinador.';

      await registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'FINALIZACION_PROYECTO', detallesAuditoria);
      toast.success(evidenciaWbsFinalizacionCoord.esProyectoVacio ? 'Proyecto cancelado/cerrado con registro de auditoría.' : 'El proyecto ha sido marcado oficialmente como FINALIZADO.');
      setShowConfirmFinalizarCoord(false);
      setJustificacionCancelacionCoord('');
      setCancelacionErrorCoord('');
    } catch (err) {
      console.error('Error al finalizar el proyecto:', err);
      toast.error(err.response?.data?.message || err.message || 'Error al finalizar el proyecto.');
    } finally {
      setSubmittingPausaFinalizarCoord(false);
    }
  };

  // Crear Nueva Etapa WBS
  const handleRegistrarEtapaCoord = async (e) => {
    e.preventDefault();
    if (!selectedProyectoModal || !nuevaEtapaCoord.nombreEtapa.trim()) return;

    try {
      setSubmittingEtapaCoord(true);
      const body = { nombreEtapa: nuevaEtapaCoord.nombreEtapa.trim(), estado: 'PENDIENTE' };
      await api.post(`/lider/proyectos/${selectedProyectoModal.idProyecto}/etapas`, body);

      const etapasRes = await api.get(`/lider/proyectos/${selectedProyectoModal.idProyecto}/etapas`).catch(() => []);
      setProyectoEtapasModal(Array.isArray(etapasRes) ? etapasRes : []);

      registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'CREACION_ETAPA', `Nueva Etapa WBS registrada: "${nuevaEtapaCoord.nombreEtapa.trim()}"`);
      toast.success('Nueva Etapa WBS registrada exitosamente.');
      setShowNuevaEtapaModalCoord(false);
      setNuevaEtapaCoord({ nombreEtapa: '' });
    } catch (err) {
      console.error('Error creando etapa WBS:', err);
      toast.error(err.message || 'Error al crear etapa WBS.');
    } finally {
      setSubmittingEtapaCoord(false);
    }
  };

  // Asignar Nueva Actividad (con detección y confirmación de reapertura en modal si la etapa está FINALIZADA)
  const handleRegistrarActividadCoord = async (e) => {
    e.preventDefault();
    if (!selectedProyectoModal || !nuevaActividadCoord.nombreActividad.trim() || !nuevaActividadCoord.idEtapa || !nuevaActividadCoord.idDesarrollador) {
      toast.error('Complete todos los campos del formulario de asignación.');
      return;
    }

    const etapaSeleccionada = (proyectoEtapasModal || []).find(et => String(et.idEtapa) === String(nuevaActividadCoord.idEtapa));
    const estaFinalizada = etapaSeleccionada && (
      (etapaSeleccionada.estado || '').toUpperCase() === 'FINALIZADA' ||
      (etapaSeleccionada.estado || '').toUpperCase() === 'COMPLETADO'
    );

    const dev = trabajadores.find(t => String(t.idTrabajador) === String(nuevaActividadCoord.idDesarrollador));
    const devNombre = dev ? `${dev.nombre} ${dev.apellido}` : `ID #${nuevaActividadCoord.idDesarrollador}`;
    const etapaNombre = etapaSeleccionada ? etapaSeleccionada.nombreEtapa : `Etapa #${nuevaActividadCoord.idEtapa}`;

    if (estaFinalizada) {
      setEtapaAReabrirModalCoord({
        idEtapa: nuevaActividadCoord.idEtapa,
        etapaNombre,
        nombreActividad: nuevaActividadCoord.nombreActividad.trim(),
        idDesarrollador: nuevaActividadCoord.idDesarrollador,
        devNombre,
        etapaSeleccionada
      });
      return;
    }

    try {
      setSubmittingActividadCoord(true);
      const body = {
        nombreActividad: nuevaActividadCoord.nombreActividad.trim(),
        descripcion: nuevaActividadCoord.nombreActividad.trim(),
        estado: 'PENDIENTE',
        idEtapa: Number(nuevaActividadCoord.idEtapa)
      };

      await api.post(`/lider/etapas/${nuevaActividadCoord.idEtapa}/desarrolladores/${nuevaActividadCoord.idDesarrollador}/actividades`, body);

      registrarAccionCoordinador(
        selectedProyectoModal.idProyecto,
        'ASIGNACION_ACTIVIDAD',
        `Actividad "${nuevaActividadCoord.nombreActividad.trim()}" asignada a ${devNombre} en fase "${etapaNombre}".`
      );

      const etapasRes = await api.get(`/lider/proyectos/${selectedProyectoModal.idProyecto}/etapas`).catch(() => []);
      setProyectoEtapasModal(Array.isArray(etapasRes) ? etapasRes : []);

      toast.success('Actividad asignada exitosamente.');
      setShowNuevaActividadModalCoord(false);
      setNuevaActividadCoord({ nombreActividad: '', idEtapa: '', idDesarrollador: '' });
    } catch (err) {
      console.error('Error asignando actividad:', err);
      toast.error(err.message || 'Error al asignar la actividad.');
    } finally {
      setSubmittingActividadCoord(false);
    }
  };

  // Editar Etapa WBS
  const handleAbrirEditarEtapaCoord = (etapa) => {
    setEtapaAEditarCoord({
      idEtapa: etapa.idEtapa,
      nombreEtapa: etapa.nombreEtapa || '',
      estado: etapa.estado || 'PENDIENTE'
    });
    setShowEditarEtapaModalCoord(true);
  };

  const handleActualizarEtapaCoord = async (e) => {
    e.preventDefault();
    if (!selectedProyectoModal || !etapaAEditarCoord.idEtapa) return;

    try {
      setSubmittingEditarEtapaCoord(true);
      const idModificada = etapaAEditarCoord.idEtapa;
      const nuevoNombre = etapaAEditarCoord.nombreEtapa.trim();
      const nuevoEstado = etapaAEditarCoord.estado;

      // 1. Enviar actualización limpia a la API
      await api.put(`/lider/etapas/${idModificada}`, {
        nombreEtapa: nuevoNombre,
        estado: nuevoEstado
      });

      // 2. Reactividad local instantánea en modales y tablas de vista
      setProyectoEtapasModal(prev => (prev || []).map(et =>
        String(et.idEtapa) === String(idModificada)
          ? { ...et, nombreEtapa: nuevoNombre, estado: nuevoEstado }
          : et
      ));

      setProyectos(prev => (prev || []).map(p => {
        if (String(p.idProyecto) === String(selectedProyectoModal.idProyecto)) {
          const etapasActualizadas = (p.etapas || []).map(et =>
            String(et.idEtapa) === String(idModificada)
              ? { ...et, nombreEtapa: nuevoNombre, estado: nuevoEstado }
              : et
          );
          return { ...p, etapas: etapasActualizadas };
        }
        return p;
      }));

      // 3. Sincronización en segundo plano de etapas
      api.get(`/lider/proyectos/${selectedProyectoModal.idProyecto}/etapas`)
        .then(etapasRes => {
          if (Array.isArray(etapasRes)) setProyectoEtapasModal(etapasRes);
        })
        .catch(() => { });

      // 4. Auditoría directiva y notificación de éxito
      registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'EDICION_ETAPA', `Fase #${idModificada} actualizada a "${nuevoNombre}" [${nuevoEstado}]`);
      toast.success('Etapa WBS actualizada exitosamente.');
      setShowEditarEtapaModalCoord(false);
    } catch (err) {
      console.error('Error editando etapa:', err);
      toast.error(err.message || 'Error al actualizar etapa.');
    } finally {
      setSubmittingEditarEtapaCoord(false);
    }
  };

  // Paso 1: Abre el modal de confirmación para finalizar una etapa WBS
  const handleFinalizarEtapaFormallyCoord = (etapa) => {
    if (!selectedProyectoModal || !etapa?.idEtapa) return;
    setEtapaAConfirmarFinalizar(etapa);
  };

  // Paso 2: Ejecuta la finalización real (llamado desde ConfirmActionModal)
  const handleConfirmarFinalizarEtapaCoord = async () => {
    const etapa = etapaAConfirmarFinalizar;
    if (!etapa?.idEtapa) return;
    const confirmName = etapa.nombreEtapa || `Fase #${etapa.idEtapa}`;

    try {
      await api.put(`/lider/etapas/${etapa.idEtapa}`, {
        nombreEtapa: etapa.nombreEtapa,
        estado: 'FINALIZADA'
      });

      setProyectoEtapasModal(prev => (prev || []).map(et =>
        String(et.idEtapa) === String(etapa.idEtapa) ? { ...et, estado: 'FINALIZADA' } : et
      ));

      setProyectos(prev => (prev || []).map(p => {
        if (String(p.idProyecto) === String(selectedProyectoModal.idProyecto)) {
          const etapasActualizadas = (p.etapas || []).map(et =>
            String(et.idEtapa) === String(etapa.idEtapa) ? { ...et, estado: 'FINALIZADA' } : et
          );
          return { ...p, etapas: etapasActualizadas };
        }
        return p;
      }));

      registrarAccionCoordinador(
        selectedProyectoModal.idProyecto,
        'FINALIZACION_ETAPA',
        `Fase #${etapa.idEtapa} ("${confirmName}") finalizada formalmente por la Coordinación.`
      );

      toast.success(`Etapa "${confirmName}" finalizada exitosamente.`);
      setEtapaAConfirmarFinalizar(null);
    } catch (err) {
      console.error('Error al finalizar etapa:', err);
      toast.error(err.message || 'Error al finalizar la etapa.');
      setEtapaAConfirmarFinalizar(null);
    }
  };

  // Reasignar Actividad a otro Desarrollador
  const handleAbrirReasignarActividadCoord = (act, etapa) => {
    setActividadAReasignarCoord(act);
    setTargetDevIdReasignarCoord(act.desarrollador?.idTrabajador ? String(act.desarrollador.idTrabajador) : '');
    setMotivoReasignarCoord('');
    setShowReasignarActividadModalCoord(true);
  };

  const handleEjecutarReasignacionActividadCoord = async (e) => {
    e.preventDefault();
    if (!selectedProyectoModal || !actividadAReasignarCoord || !targetDevIdReasignarCoord) {
      toast.error('Seleccione un desarrollador de destino.');
      return;
    }
    if (!motivoReasignarCoord.trim()) {
      toast.error('El motivo o justificación de la reasignación es obligatorio.');
      return;
    }

    try {
      setSubmittingReasignarActividadCoord(true);
      const dev = trabajadores.find(t => String(t.idTrabajador) === String(targetDevIdReasignarCoord));
      const devNombre = dev ? `${dev.nombre} ${dev.apellido}` : `ID #${targetDevIdReasignarCoord}`;

      await api.patch(`/lider/actividades/${actividadAReasignarCoord.idActividad}/reasignar?idNuevoDesarrollador=${targetDevIdReasignarCoord}`, {
        idDesarrollador: Number(targetDevIdReasignarCoord),
        idNuevoDesarrollador: Number(targetDevIdReasignarCoord),
        motivo: motivoReasignarCoord.trim()
      });

      const etapasRes = await api.get(`/lider/proyectos/${selectedProyectoModal.idProyecto}/etapas`).catch(() => []);
      setProyectoEtapasModal(Array.isArray(etapasRes) ? etapasRes : []);

      registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'REASIGNACION_ACTIVIDAD', `Tarea "${actividadAReasignarCoord.nombreActividad || actividadAReasignarCoord.descripcion}" reasignada a ${devNombre}. Motivo: ${motivoReasignarCoord.trim()}`);
      toast.success(`Tarea reasignada a ${devNombre} exitosamente.`);
      setShowReasignarActividadModalCoord(false);
      setActividadAReasignarCoord(null);
      setMotivoReasignarCoord('');
    } catch (err) {
      console.error('Error reasignando actividad:', err);
      toast.error(err.message || 'Error al reasignar la tarea.');
    } finally {
      setSubmittingReasignarActividadCoord(false);
    }
  };

  // Estados para Detalle de Trabajador & Navegación Cruzada a Proyectos
  const [selectedTrabajadorModal, setSelectedTrabajadorModal] = useState(null);
  const [showTrabajosSubpanel, setShowTrabajosSubpanel] = useState(false);
  const [highlightedProyectoId, setHighlightedProyectoId] = useState(null);
  const [navHistory, setNavHistory] = useState(null);
  const [highlightedActividadId, setHighlightedActividadId] = useState(null);
  const [highlightedEtapaId, setHighlightedEtapaId] = useState(null);

  // Estados de Paginación Inteligente (Por cantidad y por hojas)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // 5, 10, 25, 50 por página

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rolSeleccionado, techsSeleccionadas, estadoSeleccionado, activacionSeleccionada, ordenTrabajadores, itemsPerPage]);

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
    setEstadoSeleccionado('ACTIVO');
    setActivacionSeleccionada('TODOS');
    setOrdenTrabajadores('NOMBRE_ASC');
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

  // Validaciones strictly en tiempo real por campo
  const docValidationResult = useMemo(() => {
    const raw = (newTrabajador.identificacion || '').trim();
    if (!raw) return { valid: false, message: 'Ingrese el número de documento de identificación.' };

    // Verificación de duplicados en la base de datos en tiempo real
    const existeDuplicado = (trabajadores || []).some(t => String(t.identificacion).trim() === raw);
    if (existeDuplicado) {
      return { valid: false, message: `La cédula / número de identificación (${raw}) ya se encuentra registrada en el sistema.` };
    }

    return paisActual.validate(raw);
  }, [newTrabajador.identificacion, paisActual, trabajadores]);

  const emailValidationResult = useMemo(() => {
    const raw = (newTrabajador.email || '').trim().toLowerCase();
    if (!raw) return { valid: false, message: 'El correo electrónico corporativo es obligatorio.' };
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rfcRegex.test(raw)) return { valid: false, message: 'Formato de correo electrónico inválido (ej. usuario@ikernell.org).' };

    const existeEmail = (trabajadores || []).some(t => String(t.email || '').trim().toLowerCase() === raw);
    if (existeEmail) {
      return { valid: false, message: `El correo corporativo (${raw}) ya pertenece a otro colaborador registrado.` };
    }
    return { valid: true, message: 'Correo corporativo único válido y disponible.' };
  }, [newTrabajador.email, trabajadores]);

  const emailPersonalValidationResult = useMemo(() => {
    const raw = (newTrabajador.emailPersonal || '').trim().toLowerCase();
    if (!raw) return { valid: false, message: 'El correo personal / alternativo es obligatorio.' };
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rfcRegex.test(raw)) return { valid: false, message: 'Formato de correo electrónico personal inválido (ej. usuario@gmail.com).' };

    const existePersonal = (trabajadores || []).some(t => String(t.emailPersonal || '').trim().toLowerCase() === raw);
    if (existePersonal) {
      return { valid: false, message: `El correo personal (${raw}) ya pertenece a otro colaborador registrado en el sistema.` };
    }

    const existeComoCorporativo = (trabajadores || []).some(t => String(t.email || '').trim().toLowerCase() === raw);
    if (existeComoCorporativo) {
      return { valid: false, message: `El correo personal (${raw}) ya está registrado como correo corporativo.` };
    }

    return { valid: true, message: 'Correo personal válido y disponible.' };
  }, [newTrabajador.emailPersonal, trabajadores]);

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
      const [trabajadoresRes, solicitudesRes, proyectosRes] = await Promise.all([
        api.get('/coordinador/trabajadores').catch(() => []),
        api.get('/coordinador/solicitudes').catch(() => []),
        api.get('/coordinador/proyectos').catch(() => [])
      ]);

      setTrabajadores(Array.isArray(trabajadoresRes) ? trabajadoresRes : []);
      setSolicitudes(Array.isArray(solicitudesRes) ? solicitudesRes : []);
      setProyectos(Array.isArray(proyectosRes) ? proyectosRes : []);
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

  // Modal de Reasignación Obligatoria de Proyectos al inhabilitar un Líder
  const [showReasignarLiderModal, setShowReasignarLiderModal] = useState(false);
  const [liderAInhabilitar, setLiderAInhabilitar] = useState(null);
  const [proyectosDelLiderAfectado, setProyectosDelLiderAfectado] = useState([]);
  const [nuevoLiderTargetId, setNuevoLiderTargetId] = useState('');
  const [reasignacionesMap, setReasignacionesMap] = useState({});
  const [pasoModalReasignar, setPasoModalReasignar] = useState('FORMULARIO'); // 'FORMULARIO' | 'CONFIRMACION'
  const [submittingReasignacionLider, setSubmittingReasignacionLider] = useState(false);

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

    // Normalizar rol
    const rolString = targetUser && targetUser.rol ? String(targetUser.rol).toUpperCase() : '';
    const isLider = rolString.includes('LIDER');
    const isActivo = targetUser && (targetUser.estado === true || targetUser.estado === 'ACTIVO');

    if (isLider && isActivo) {
      // Consultar lista actualizada de proyectos
      let listaProyectos = proyectos;
      if (!listaProyectos || listaProyectos.length === 0) {
        try {
          const proyFetch = await api.get('/coordinador/proyectos');
          listaProyectos = Array.isArray(proyFetch) ? proyFetch : [];
          setProyectos(listaProyectos);
        } catch (e) {
          listaProyectos = [];
        }
      }

      const proyectosAfectados = (listaProyectos || []).filter(p =>
        (p.lider?.idTrabajador && String(p.lider.idTrabajador) === String(id)) ||
        (p.lider?.id && String(p.lider.id) === String(id))
      );

      if (proyectosAfectados.length > 0) {
        setLiderAInhabilitar(targetUser);
        setProyectosDelLiderAfectado(proyectosAfectados);

        // Buscar otros líderes activos disponibles
        const otrosLideres = trabajadores.filter(t =>
          String(t.idTrabajador) !== String(id) &&
          t.estado &&
          t.rol &&
          String(t.rol).toUpperCase().includes('LIDER')
        );

        const defaultLeaderId = otrosLideres.length > 0 ? String(otrosLideres[0].idTrabajador) : '';
        setNuevoLiderTargetId(defaultLeaderId);

        // Construir mapa inicial de asignaciones por defecto
        const initialMap = {};
        proyectosAfectados.forEach(p => {
          initialMap[p.idProyecto] = defaultLeaderId;
        });
        setReasignacionesMap(initialMap);
        setPasoModalReasignar('FORMULARIO');

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

  const handleAsignarTodosAMismoLider = (targetId) => {
    setNuevoLiderTargetId(targetId);
    if (!targetId) return;
    const updated = {};
    proyectosDelLiderAfectado.forEach(p => {
      updated[p.idProyecto] = targetId;
    });
    setReasignacionesMap(updated);
  };

  const handleCambiarLiderDeProyecto = (idProyecto, newLeaderId) => {
    setReasignacionesMap(prev => ({
      ...prev,
      [idProyecto]: newLeaderId
    }));
  };

  const handleIrAConfirmacionReasignacion = (e) => {
    e.preventDefault();
    const sinLider = proyectosDelLiderAfectado.some(p => !reasignacionesMap[p.idProyecto]);
    if (sinLider) {
      toast.error('Debe seleccionar un Líder receptor para cada uno de los proyectos listados.');
      return;
    }
    setPasoModalReasignar('CONFIRMACION');
  };

  const handleEjecutarReasignacionEInhabilitar = async () => {
    if (!liderAInhabilitar) return;

    setSubmittingReasignacionLider(true);
    try {
      const targetLeaderIds = Object.values(reasignacionesMap);
      const allSame = targetLeaderIds.length > 0 && targetLeaderIds.every(id => String(id) === String(targetLeaderIds[0]));

      if (allSame) {
        const singleTargetId = targetLeaderIds[0];
        await api.put(`/coordinador/trabajadores/${liderAInhabilitar.idTrabajador}/inhabilitar-reasignar?idNuevoLiderTarget=${singleTargetId}`);
      } else {
        for (const p of proyectosDelLiderAfectado) {
          const targetLiderId = reasignacionesMap[p.idProyecto];
          if (targetLiderId) {
            await api.put(`/coordinador/proyectos/${p.idProyecto}/reasignar-lider?idNuevoLiderTarget=${targetLiderId}`);
          }
        }
        await api.patch(`/coordinador/trabajadores/${liderAInhabilitar.idTrabajador}/estado`);
      }

      toast.success(`Portafolio de ${proyectosDelLiderAfectado.length} proyecto(s) reasignado exitosamente. El usuario ${liderAInhabilitar.nombre} ${liderAInhabilitar.apellido} ha sido inhabilitado.`);
      setShowReasignarLiderModal(false);
      setLiderAInhabilitar(null);
      setReasignacionesMap({});
      setPasoModalReasignar('FORMULARIO');

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

    if (!emailPersonalValidationResult.valid) {
      errors.emailPersonal = emailPersonalValidationResult.message;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Auto-generador de Correo Electrónico Corporativo Único (@ikernell.org)
  const autoGenerarEmailCorporativo = (nombres, apellidos) => {
    if (!nombres || !apellidos) return '';
    const nomClean = nombres.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    const apeClean = apellidos.trim().split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    if (!nomClean || !apeClean) return '';

    let baseEmail = `${nomClean}.${apeClean}@ikernell.org`;
    let contador = 1;
    let candidateEmail = baseEmail;
    while ((trabajadores || []).some(t => String(t.email || '').trim().toLowerCase() === candidateEmail.toLowerCase())) {
      candidateEmail = `${nomClean}.${apeClean}${contador}@ikernell.org`;
      contador++;
    }
    return candidateEmail;
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

      toast.success(`Trabajador ${nuevo.nombre} ${nuevo.apellido} registrado exitosamente. Credenciales enviadas a ${nuevo.emailPersonal || emailFinal}.`);
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
      cargarDatos();
    } catch (err) {
      console.error('Error al registrar trabajador:', err);
      const serverMsg = err.response?.data?.message || err?.message || 'Error al registrar trabajador.';
      toast.error(serverMsg);
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
    if (est === 'REASIGNADA') {
      return {
        label: 'REASIGNADA',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
        dot: 'bg-indigo-500'
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

  const filteredTrabajadores = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = (trabajadores || []).filter(t => {
      const matchesSearch = !query ||
        (t.nombre || '').toLowerCase().includes(query) ||
        (t.apellido || '').toLowerCase().includes(query) ||
        (t.identificacion || '').includes(query) ||
        (t.email || '').toLowerCase().includes(query) ||
        (t.profesion || '').toLowerCase().includes(query) ||
        (t.especialidad || '').toLowerCase().includes(query);

      const matchesRol = rolSeleccionado === 'TODOS' || t.rol === rolSeleccionado;

      let matchesTech = true;
      if (techsSeleccionadas.length > 0) {
        const spec = (t.especialidad || '').toLowerCase();
        matchesTech = techsSeleccionadas.some(tech => spec.includes(tech.toLowerCase()));
      }

      const matchesEstado = estadoSeleccionado === 'TODOS' ||
        (estadoSeleccionado === 'ACTIVO' && t.estado) ||
        (estadoSeleccionado === 'INHABILITADO' && !t.estado);

      const matchesActivacion = activacionSeleccionada === 'TODOS' ||
        (activacionSeleccionada === 'VERIFICADO' && !t.primerLogin) ||
        (activacionSeleccionada === 'PENDIENTE' && Boolean(t.primerLogin));

      return matchesSearch && matchesRol && matchesTech && matchesEstado && matchesActivacion;
    });

    // Ordenamiento dinámico
    list.sort((a, b) => {
      if (ordenTrabajadores === 'NOMBRE_ASC') {
        const nameA = `${a.nombre || ''} ${a.apellido || ''}`.trim().toLowerCase();
        const nameB = `${b.nombre || ''} ${b.apellido || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (ordenTrabajadores === 'NOMBRE_DESC') {
        const nameA = `${a.nombre || ''} ${a.apellido || ''}`.trim().toLowerCase();
        const nameB = `${b.nombre || ''} ${b.apellido || ''}`.trim().toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (ordenTrabajadores === 'ROL') {
        const roleOrder = { COORDINADOR: 1, LIDER: 2, DESARROLLADOR: 3 };
        return (roleOrder[a.rol] || 4) - (roleOrder[b.rol] || 4);
      }
      if (ordenTrabajadores === 'CEDULA') {
        return (a.identificacion || '').localeCompare(b.identificacion || '');
      }
      return 0;
    });

    return list;
  }, [trabajadores, searchQuery, rolSeleccionado, techsSeleccionadas, estadoSeleccionado, activacionSeleccionada, ordenTrabajadores]);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (rolSeleccionado !== 'TODOS' ? 1 : 0) +
    techsSeleccionadas.length +
    (estadoSeleccionado !== 'ACTIVO' ? 1 : 0) +
    (activacionSeleccionada !== 'TODOS' ? 1 : 0) +
    (ordenTrabajadores !== 'NOMBRE_ASC' ? 1 : 0);

  // Cálculo Optimizado de la Primera y Última Fecha de Solicitud en el Sistema
  const rangoFechasSolicitudes = React.useMemo(() => {
    if (!solicitudes || !Array.isArray(solicitudes) || solicitudes.length === 0) {
      return {
        primera: '',
        ultima: '',
        primeraFormateada: 'Sin registros',
        ultimaFormateada: 'Sin registros',
        totalDias: 0,
        rangoTexto: 'Sin solicitudes registradas'
      };
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
      return {
        primera: '',
        ultima: '',
        primeraFormateada: 'Sin fecha',
        ultimaFormateada: 'Sin fecha',
        totalDias: 0,
        rangoTexto: 'Sin fechas válidas'
      };
    }

    const minDate = new Date(minTimestamp);
    const maxDate = new Date(maxTimestamp);
    const diffDays = Math.max(1, Math.round((maxTimestamp - minTimestamp) / (1000 * 60 * 60 * 24)) + 1);

    const primeraISO = minDate.toISOString().split('T')[0];
    const ultimaISO = maxDate.toISOString().split('T')[0];

    return {
      primera: primeraISO,
      ultima: ultimaISO,
      primeraFormateada: formatearFechaHumana(primeraISO),
      ultimaFormateada: formatearFechaHumana(ultimaISO),
      totalDias: diffDays,
      rangoTexto: `${formatearFechaHumana(primeraISO)} — ${formatearFechaHumana(ultimaISO)}`
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
  const verificadosCount = (trabajadores || []).filter(t => !t.primerLogin).length;
  const pendientesCount = (trabajadores || []).filter(t => Boolean(t.primerLogin)).length;
  const solicitudesPendientes = (solicitudes || []).filter(s => !s.atendido).length;

  const devPct = totalCount > 0 ? Math.round((devsCount / totalCount) * 100) : 0;
  const liderPct = totalCount > 0 ? Math.round((lideresCount / totalCount) * 100) : 0;
  const coordPct = totalCount > 0 ? Math.round((coordCount / totalCount) * 100) : 0;

  // Líderes Activos en la Empresa
  const lideresActivos = useMemo(() => {
    return (trabajadores || []).filter(t => t.rol === 'LIDER' && t.estado);
  }, [trabajadores]);

  // Helper para calcular horas transcurridas desde la reasignación
  const getHoursSinceReassignment = (fechaReasignacion) => {
    if (!fechaReasignacion) return Infinity;
    const fecha = new Date(fechaReasignacion);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  // Manejo de notificaciones descartadas localmente en Coordinador (localStorage)
  const [dismissedNotifsCoord, setDismissedNotifsCoord] = useState(() => {
    try {
      const saved = localStorage.getItem(`dismissed_notifs_coord`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleDismissNotifCoord = (idNotif) => {
    setDismissedNotifsCoord(prev => {
      const next = [...prev, idNotif];
      try {
        localStorage.setItem(`dismissed_notifs_coord`, JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  };

  // Notificaciones unificadas de auditoría directiva (Reasignaciones y Nuevas Asignaciones)
  const listNotificacionesCoordinador = useMemo(() => {
    if (!proyectos || !Array.isArray(proyectos)) return [];
    const notifs = [];

    proyectos.forEach(p => {
      // Reasignación reciente (Vigencia 24h y no confirmada)
      if (p.reasignado && !p.leidoPorLiderAnterior && getHoursSinceReassignment(p.fechaReasignacion) <= 24 && !dismissedNotifsCoord.includes(`coord_reasig_${p.idProyecto}`)) {
        notifs.push({
          tipo: 'REASIGNACION',
          idNotif: `coord_reasig_${p.idProyecto}`,
          proyecto: p,
          titulo: 'AUDITORÍA DIRECTIVA: PROYECTO REASIGNADO',
          subtitulo: 'Reasignación de dirección técnica registrada por la Coordinación General.',
          motivo: p.motivoReasignacion || 'Reorganización de dirección técnica.',
          liderNombre: p.lider ? `${p.lider.nombre} ${p.lider.apellido}` : 'Líder Asignado',
          vigencia: 'Vigencia de Auditoría (24h)'
        });
      }

      // Nuevo Proyecto creado recientemente (Vigencia 72h)
      if (!p.reasignado && (p.fechaInicio || p.createdAt) && getHoursSinceReassignment(p.fechaInicio || p.createdAt) <= 72 && !dismissedNotifsCoord.includes(`coord_new_${p.idProyecto}`)) {
        notifs.push({
          tipo: 'NUEVO_PROYECTO',
          idNotif: `coord_new_${p.idProyecto}`,
          proyecto: p,
          titulo: 'NUEVO PROYECTO INCORPORADO AL PORTAFOLIO',
          subtitulo: 'Se ha registrado una nueva arquitectura de proyecto con líder asignado y presupuesto.',
          motivo: p.descripcion || 'Registro inicial de proyecto de software.',
          liderNombre: p.lider ? `${p.lider.nombre} ${p.lider.apellido}` : 'Sin Asignar',
          vigencia: 'Nuevo Registro (72h)'
        });
      }
    });

    return notifs;
  }, [proyectos, dismissedNotifsCoord]);

  // 1. Subset de proyectos por Líder y Texto de Búsqueda (Sin filtrar por Estado Operativo)
  const proyectosBaseCoordinador = useMemo(() => {
    if (!Array.isArray(proyectos)) return [];

    return proyectos.filter(prj => {
      // Filtro de Líder: Incluye proyectos donde el líder actual es filtroProyectoLider
      // O proyectos donde filtroProyectoLider es el líder anterior (idLiderAnterior), en ventana de 24h sin leer.
      if (filtroProyectoLider !== 'TODOS') {
        const isCurrentLider = String(prj.lider?.idTrabajador) === String(filtroProyectoLider);
        const isPastLiderPending = String(prj.idLiderAnterior) === String(filtroProyectoLider)
          && prj.reasignado
          && !prj.leidoPorLiderAnterior
          && getHoursSinceReassignment(prj.fechaReasignacion) <= 24;

        if (!isCurrentLider && !isPastLiderPending) return false;
      }

      // Búsqueda por texto
      if (searchProyectoQuery.trim()) {
        const q = searchProyectoQuery.toLowerCase().trim();
        const matchCode = String(prj.idProyecto).includes(q) || `prj-00${prj.idProyecto}`.toLowerCase().includes(q);
        const matchNombre = prj.nombre?.toLowerCase().includes(q);
        const matchCliente = prj.cliente?.toLowerCase().includes(q);
        const matchLider = prj.lider ? `${prj.lider.nombre} ${prj.lider.apellido}`.toLowerCase().includes(q) : false;
        if (!matchCode && !matchNombre && !matchCliente && !matchLider) return false;
      }

      return true;
    });
  }, [proyectos, filtroProyectoLider, searchProyectoQuery]);

  // 2. Filtrado final aplicando Estado Operativo y Ordenamiento Dinámico
  const proyectosFiltradosCoordinador = useMemo(() => {
    let list = proyectosBaseCoordinador.filter(prj => {
      if (filtroProyectoEstado !== 'TODOS') {
        const st = (prj.estado || '').toUpperCase();
        if (filtroProyectoEstado === 'EN_PROGRESO' && (st === 'COMPLETADO' || st === 'FINALIZADO' || st === 'PAUSADO' || st === 'EN_PAUSA' || st === 'INHABILITADO')) return false;
        if (filtroProyectoEstado === 'COMPLETADO' && st !== 'COMPLETADO' && st !== 'FINALIZADO') return false;
        if (filtroProyectoEstado === 'PAUSADO' && st !== 'PAUSADO' && st !== 'EN_PAUSA') return false;
        if (filtroProyectoEstado === 'INHABILITADO' && st !== 'INHABILITADO') return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (ordenProyecto === 'PRESUPUESTO_DESC') {
        return (Number(b.presupuesto) || 0) - (Number(a.presupuesto) || 0);
      }
      if (ordenProyecto === 'PRESUPUESTO_ASC') {
        return (Number(a.presupuesto) || 0) - (Number(b.presupuesto) || 0);
      }
      if (ordenProyecto === 'NOMBRE_ASC') {
        return (a.nombre || '').localeCompare(b.nombre || '');
      }
      if (ordenProyecto === 'FECHA_FIN') {
        const dateA = a.fechaFinEstimada ? new Date(a.fechaFinEstimada).getTime() : Infinity;
        const dateB = b.fechaFinEstimada ? new Date(b.fechaFinEstimada).getTime() : Infinity;
        return dateA - dateB;
      }
      return 0;
    });

    return list;
  }, [proyectosBaseCoordinador, filtroProyectoEstado, ordenProyecto]);

  // Helper para cálculo dinámico del tiempo y progreso del cronograma
  const getProjectTimeProgress = (fechaInicio, fechaFinEstimada, estado) => {
    if (estado === 'COMPLETADO' || estado === 'FINALIZADO') {
      return { percent: 100, label: 'Completado', status: 'completed', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    }
    if (estado === 'PAUSADO' || estado === 'EN_PAUSA') {
      return { percent: 50, label: 'En Pausa', status: 'paused', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    }
    if (!fechaFinEstimada) {
      return { percent: 40, label: 'En cronograma', status: 'normal', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    }

    const inicio = fechaInicio ? new Date(fechaInicio).getTime() : (new Date(fechaFinEstimada).getTime() - (90 * 24 * 60 * 60 * 1000));
    const fin = new Date(fechaFinEstimada).getTime();
    const ahora = new Date().getTime();

    const totalDur = fin - inicio;
    const elapsed = ahora - inicio;
    const diffDays = Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24));

    let percent = totalDur > 0 ? Math.min(Math.max(Math.round((elapsed / totalDur) * 100), 5), 100) : 100;

    if (diffDays < 0) {
      return {
        percent: 100,
        label: `Vencido (${Math.abs(diffDays)}d)`,
        status: 'danger',
        badge: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
      };
    }
    if (diffDays <= 7) {
      return {
        percent,
        label: `${diffDays}d restantes`,
        status: 'warning',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      };
    }
    return {
      percent,
      label: `${diffDays}d restantes`,
      status: 'normal',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    };
  };

  const activeProyectoFiltersCount =
    (searchProyectoQuery ? 1 : 0) +
    (filtroProyectoEstado !== 'TODOS' ? 1 : 0) +
    (filtroProyectoLider !== 'TODOS' ? 1 : 0) +
    (ordenProyecto !== 'DEFAULT' ? 1 : 0);

  // Contadores dinámicos para las pestañas de estado según el Líder seleccionado
  const countsEstadoDinamicos = useMemo(() => {
    const todos = proyectosBaseCoordinador.length;
    const completados = proyectosBaseCoordinador.filter(p => {
      const st = (p.estado || '').toUpperCase();
      return st === 'COMPLETADO' || st === 'FINALIZADO';
    }).length;
    const pausados = proyectosBaseCoordinador.filter(p => {
      const st = (p.estado || '').toUpperCase();
      return st === 'PAUSADO' || st === 'EN_PAUSA';
    }).length;
    const enProgreso = proyectosBaseCoordinador.filter(p => {
      const st = (p.estado || '').toUpperCase();
      return st !== 'COMPLETADO' && st !== 'FINALIZADO' && st !== 'PAUSADO' && st !== 'EN_PAUSA' && st !== 'INHABILITADO';
    }).length;
    return { todos, enProgreso, completados, pausados };
  }, [proyectosBaseCoordinador]);

  // Paginación Inteligente de Proyectos
  const totalFilteredProyectos = proyectosFiltradosCoordinador.length;
  const totalProyectoPages = Math.ceil(totalFilteredProyectos / proyectosPerPage) || 1;
  const safeProyectoPage = Math.min(currentProyectoPage, totalProyectoPages);
  const startProyectoIdx = (safeProyectoPage - 1) * proyectosPerPage;
  const proyectosPaginados = proyectosFiltradosCoordinador.slice(startProyectoIdx, startProyectoIdx + proyectosPerPage);

  // Manejadores para Detalle de Proyecto y Reasignación de Líder
  const handleAbrirDetalleProyecto = async (proyecto) => {
    setSelectedProyectoModal(proyecto);
    setModoEdicionCoordinador(false); // Por defecto se abre en Modo Lectura (Supervisión)
    setSessionBatchId('BATCH-' + Date.now());
    setLoadingProyectoDetalle(true);
    try {
      const [etapasRes, devsRes] = await Promise.all([
        api.get(`/lider/proyectos/${proyecto.idProyecto}/etapas`).catch(() => []),
        api.get(`/lider/proyectos/${proyecto.idProyecto}/desarrolladores`).catch(() => [])
      ]);
      setProyectoEtapasModal(Array.isArray(etapasRes) ? etapasRes : []);
      setProyectoDevsModal(Array.isArray(devsRes) ? devsRes : []);
    } catch (err) {
      console.error('Error cargando detalle del proyecto:', err);
    } finally {
      setLoadingProyectoDetalle(false);
    }
  };

  const handleAbrirReasignarLiderPrj = (proyecto) => {
    setProyectoAReasignar(proyecto);
    setTargetNuevoLiderPrjId('');
    setMotivoReasignacionPrj('');
    setShowReasignarLiderModalPrj(true);
  };

  const handleEjecutarReasignarLiderPrj = async (e) => {
    e.preventDefault();
    if (!targetNuevoLiderPrjId) {
      toast.error('Seleccione el nuevo Líder de Proyecto.');
      return;
    }
    if (!motivoReasignacionPrj || !motivoReasignacionPrj.trim()) {
      toast.error('El motivo de la reasignación es obligatorio para el registro de auditoría.');
      return;
    }

    try {
      setSubmittingReasignarLiderPrj(true);
      await api.put(`/coordinador/proyectos/${proyectoAReasignar.idProyecto}/reasignar-lider?idNuevoLiderTarget=${targetNuevoLiderPrjId}&motivo=${encodeURIComponent(motivoReasignacionPrj.trim())}`);

      const nuevoLiderObj = (lideresActivos || []).find(l => String(l.idTrabajador) === String(targetNuevoLiderPrjId));
      const nuevoLiderNom = nuevoLiderObj ? `${nuevoLiderObj.nombre} ${nuevoLiderObj.apellido}` : 'Nuevo Líder';

      await registrarAccionCoordinador(
        proyectoAReasignar.idProyecto,
        'REASIGNACIÓN_LÍDER',
        `Dirección del proyecto transferida formalmente a ${nuevoLiderNom}. Motivo: ${motivoReasignacionPrj.trim()}`
      );

      toast.success('Líder de Proyecto reasignado exitosamente con registro de auditoría.');
      setShowReasignarLiderModalPrj(false);
      setProyectoAReasignar(null);
      setMotivoReasignacionPrj('');
      await cargarDatos();
    } catch (err) {
      console.error('Error al reasignar líder de proyecto:', err);
      toast.error(err.response?.data?.message || 'Error al reasignar el Líder del Proyecto.');
    } finally {
      setSubmittingReasignarLiderPrj(false);
    }
  };

  // Proyectos asociados a un trabajador seleccionado (Matching robusto por ID, Cédula y Email)
  const workerProyectos = useMemo(() => {
    if (!selectedTrabajadorModal || !Array.isArray(proyectos)) return [];

    const targetId = selectedTrabajadorModal.idTrabajador || selectedTrabajadorModal.id;
    const targetIdent = selectedTrabajadorModal.identificacion ? String(selectedTrabajadorModal.identificacion).trim() : '';
    const targetEmail = selectedTrabajadorModal.email ? String(selectedTrabajadorModal.email).toLowerCase().trim() : '';

    return proyectos.filter(prj => {
      // 1. Si es Líder del Proyecto
      if (prj.lider) {
        const liderId = prj.lider.idTrabajador || prj.lider.id;
        const liderIdent = prj.lider.identificacion ? String(prj.lider.identificacion).trim() : '';
        const liderEmail = prj.lider.email ? String(prj.lider.email).toLowerCase().trim() : '';

        if (targetId && liderId && String(targetId) === String(liderId)) return true;
        if (targetIdent && liderIdent && targetIdent === liderIdent) return true;
        if (targetEmail && liderEmail && targetEmail === liderEmail) return true;
      }

      // 2. Si es Desarrollador en la planilla del Proyecto
      if (Array.isArray(prj.desarrolladores)) {
        return prj.desarrolladores.some(d => {
          const devId = d.idTrabajador || d.id || d.desarrollador?.idTrabajador || d.desarrollador?.id;
          const devIdent = d.identificacion || d.desarrollador?.identificacion;
          const devEmail = d.email || d.desarrollador?.email;

          if (targetId && devId && String(targetId) === String(devId)) return true;
          if (targetIdent && devIdent && String(targetIdent).trim() === String(devIdent).trim()) return true;
          if (targetEmail && devEmail && String(devEmail).toLowerCase().trim() === targetEmail) return true;
          return false;
        });
      }

      return false;
    });
  }, [selectedTrabajadorModal, proyectos]);

  const handleAbrirDetalleTrabajador = async (trabajador) => {
    setSelectedTrabajadorModal(trabajador);
    setShowTrabajosSubpanel(true); // Panel lateral desplegado por defecto para experiencia fluida

    // Sincronizar catálogo de proyectos si no está poblado en estado local
    if (!proyectos || proyectos.length === 0) {
      try {
        const res = await api.get('/coordinador/proyectos');
        if (Array.isArray(res)) {
          setProyectos(res);
        }
      } catch (err) {
        console.error('Error al sincronizar proyectos para la ficha:', err);
      }
    }
  };

  const handleIrAWbsProyectoDesdeTrabajador = async (idProyecto, idActividad = null, idEtapa = null, devContext = null) => {
    const currentWorker = devContext || selectedTrabajadorModal;

    // 1. Guardar contexto de trazabilidad para el botón "Regresar a Inspección"
    if (currentWorker) {
      setNavHistory({ fromTab: activeTab || 'personal', worker: currentWorker });
    }
    setHighlightedActividadId(idActividad || null);
    setHighlightedEtapaId(idEtapa || null);

    // 2. Cerrar temporalmente las fichas laterales de trabajador
    setSelectedTrabajadorModal(null);
    setShowTrabajosSubpanel(false);

    // 3. Buscar el proyecto destino en el catálogo local o cargarlo de la API
    let prjTarget = (proyectos || []).find(p => String(p.idProyecto) === String(idProyecto));
    if (!prjTarget) {
      try {
        prjTarget = await api.get(`/lider/proyectos/${idProyecto}`);
      } catch (err) {
        console.error('Error al obtener proyecto para WBS:', err);
      }
    }

    if (prjTarget) {
      setSelectedProyectoModal(prjTarget);
      setHighlightedProyectoId(idProyecto);
      setActiveTab('proyectos');

      // 4. Cargar estructura WBS de etapas y actividades
      try {
        setLoadingEtapasModal(true);
        const res = await api.get(`/lider/proyectos/${idProyecto}/etapas`);
        const data = Array.isArray(res) ? res : (res?.data || []);
        setProyectoEtapasModal(data);
      } catch (err) {
        console.error('Error al cargar etapas WBS para navegación:', err);
      } finally {
        setLoadingEtapasModal(false);
      }

      toast.success(`Navegando al WBS de "${prjTarget.nombre}"`);
    } else {
      toast.error('No se pudo encontrar el proyecto seleccionado.');
    }
  };

  const handleRegresarAInspeccionTrabajador = () => {
    if (!navHistory?.worker) {
      setSelectedProyectoModal(null);
      setHighlightedActividadId(null);
      return;
    }
    const workerToRestore = navHistory.worker;
    const fromTab = navHistory.fromTab || 'personal';

    setSelectedProyectoModal(null);
    setHighlightedActividadId(null);
    setHighlightedEtapaId(null);

    // Restaurar modal y panel de inspección del trabajador
    setSelectedTrabajadorModal(workerToRestore);
    setShowTrabajosSubpanel(true);
    setActiveTab(fromTab);

    toast.info(`Regresando a la inspección de ${workerToRestore.nombre} ${workerToRestore.apellido}`);
  };

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
      return `Mostrando personal habilitado (${filteredTrabajadores.length} de ${totalCount} registros).`;
    }

    const parts = [];
    if (rolSeleccionado !== 'TODOS') {
      const roleName = rolSeleccionado === 'DESARROLLADOR' ? 'Desarrolladores' : rolSeleccionado === 'LIDER' ? 'Líderes de Proyecto' : 'Coordinadores';
      parts.push(roleName);
    } else {
      parts.push('Personal');
    }

    if (estadoSeleccionado !== 'TODOS') {
      parts.push(estadoSeleccionado === 'ACTIVO' ? '(Habilitados)' : '(Inhabilitados)');
    }

    if (activacionSeleccionada !== 'TODOS') {
      parts.push(activacionSeleccionada === 'VERIFICADO' ? '• Verificados' : '• Pendientes 1er Acceso');
    }

    if (techsSeleccionadas.length > 0) {
      parts.push(`• Stack: [${techsSeleccionadas.join(', ')}]`);
    }

    if (searchQuery) {
      parts.push(`• Coincidencia: "${searchQuery}"`);
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
      {/* Floating return navigation banner when navigating from worker details */}
      <AnimatePresence>
        {navFromWorker && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 sm:right-10 z-50 bg-gradient-to-r from-purple-950 via-zinc-900 to-indigo-950 text-white p-3.5 px-5 rounded-2xl shadow-2xl border border-purple-500/50 backdrop-blur-md flex items-center gap-4 select-none ring-4 ring-purple-500/20"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shrink-0 shadow-sm animate-pulse">
                <Eye size={17} />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-amber-300 block uppercase tracking-wider text-[0.62rem]">
                  Navegación Directa de Auditoría de Carga
                </span>
                <span className="font-bold text-zinc-100 text-xs">
                  Subrayando tarea de <strong>{navFromWorker.nombre}</strong>
                  {navFromWorker.tareaNombre ? `: "${navFromWorker.tareaNombre}"` : ''}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const targetWorker = (trabajadores || []).find(t => String(t.idTrabajador || t.id) === String(navFromWorker.idTrabajador));
                if (targetWorker) setSelectedTrabajadorModal(targetWorker);
                setNavFromWorker(null);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft size={15} /> Volver a Ficha del Desarrollador
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* Consola Ejecutiva de Filtrado & Búsqueda (Control Toolbar & Segmented Tabs) */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
          >
            {/* 1. Header Toolbar: Título, Contador, Selector de Orden y Reset */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/80 shrink-0">
                  <Filter size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Filtros & Búsqueda de Personal
                    </h3>
                    <span className="text-[0.7rem] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {filteredTrabajadores.length} de {totalCount}
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">
                    {getFilterExplanationText()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Selector de Orden */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                  <ArrowUpDown size={13} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Orden:</span>
                  <select
                    value={ordenTrabajadores}
                    onChange={(e) => setOrdenTrabajadores(e.target.value)}
                    className="bg-transparent font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value="NOMBRE_ASC" className="bg-white dark:bg-zinc-800">Nombre (A - Z)</option>
                    <option value="NOMBRE_DESC" className="bg-white dark:bg-zinc-800">Nombre (Z - A)</option>
                    <option value="ROL" className="bg-white dark:bg-zinc-800">Por Rol</option>
                    <option value="CEDULA" className="bg-white dark:bg-zinc-800">Por Cédula</option>
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw size={12} /> Restablecer ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>

            {/* 2. Barra de Búsqueda Rápida */}
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, apellido, cédula, correo, profesión o especialidad..."
                className="input-field pl-10 pr-9 py-2 text-xs bg-zinc-50/80 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* 3. Nivel 1: Segmented Control Tabs de Rol Corporativo (Horizontal) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-blue-500" /> Rol en la Organización
                </span>
                <span>Selección rápida</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60">
                {[
                  { key: 'TODOS', label: 'Todos los Roles', count: totalCount, icon: Users, color: 'text-zinc-500' },
                  { key: 'DESARROLLADOR', label: 'Desarrolladores', count: devsCount, icon: Code2, color: 'text-emerald-500' },
                  { key: 'LIDER', label: 'Líderes', count: lideresCount, icon: Briefcase, color: 'text-amber-500' },
                  { key: 'COORDINADOR', label: 'Coordinadores', count: coordCount, icon: ShieldCheck, color: 'text-blue-500' }
                ].map(r => {
                  const isSelected = rolSeleccionado === r.key;
                  const IconComponent = r.icon;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => handleSelectRole(r.key)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs border border-zinc-200/90 dark:border-zinc-700'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      <IconComponent size={14} className={isSelected ? 'text-blue-600 dark:text-blue-400' : r.color} />
                      <span className="truncate">{r.label}</span>
                      <span className={`text-[0.65rem] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-zinc-200/70 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {r.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Nivel 2: Filtros Complementarios en Bloques de Píldoras Horizontales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              
              {/* Filtro: Permiso de Acceso */}
              <div className="space-y-1">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-500" /> Permiso de Acceso
                </span>
                <div className="flex items-center p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/50 gap-1">
                  {[
                    { key: 'ACTIVO', label: 'Habilitados', count: activosCount, icon: UserCheck },
                    { key: 'INHABILITADO', label: 'Inhabilitados', count: inactivosCount, icon: UserX },
                    { key: 'TODOS', label: 'Todos', count: totalCount, icon: BadgeCheck }
                  ].map(s => {
                    const isSelected = estadoSeleccionado === s.key;
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setEstadoSeleccionado(s.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs border border-zinc-200 dark:border-zinc-700'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <Icon size={12} className={isSelected ? 'text-blue-500' : 'text-zinc-400'} />
                        <span className="truncate">{s.label}</span>
                        <span className="text-[0.6rem] font-mono opacity-70">({s.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtro: Estado de Activación */}
              <div className="space-y-1">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-500" /> Activación de Cuenta
                </span>
                <div className="flex items-center p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/50 gap-1">
                  {[
                    { key: 'TODOS', label: 'Todas', count: totalCount, icon: CheckCircle2 },
                    { key: 'VERIFICADO', label: 'Verificadas', count: verificadosCount, icon: ShieldCheck },
                    { key: 'PENDIENTE', label: '1er Acceso', count: pendientesCount, icon: Clock }
                  ].map(a => {
                    const isSelected = activacionSeleccionada === a.key;
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => setActivacionSeleccionada(a.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs border border-zinc-200 dark:border-zinc-700'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <Icon size={12} className={isSelected ? 'text-emerald-500' : 'text-zinc-400'} />
                        <span className="truncate">{a.label}</span>
                        <span className="text-[0.6rem] font-mono opacity-70">({a.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 5. Nivel 3: Habilidades & Stack WBS (Píldoras Horizontales) */}
            {rolSeleccionado !== 'TODOS' && topSkills.length > 0 && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                      <Tag size={11} className="text-blue-500" /> Especialidades & Stack WBS
                    </span>
                    {techsSeleccionadas.length > 0 && (
                      <span className="text-[0.62rem] font-bold px-2 py-0.2 rounded-full bg-blue-600 text-white font-mono">
                        {techsSeleccionadas.length} seleccionada{techsSeleccionadas.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {techsSeleccionadas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTechsSeleccionadas([])}
                      className="text-[0.65rem] font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X size={11} /> Desmarcar todas
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {topSkills.map(([skillName, count]) => {
                    const isSelected = techsSeleccionadas.includes(skillName);
                    return (
                      <button
                        key={skillName}
                        type="button"
                        onClick={() => handleToggleTechFilter(skillName)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-2xs font-bold'
                            : 'bg-zinc-50 dark:bg-zinc-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {isSelected ? <Check size={11} /> : <span className="opacity-40">+</span>}
                        <span>{skillName}</span>
                        <span className={`text-[0.62rem] px-1.2 py-0.2 rounded-md font-bold ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Barra Dinámica de Filtros Activos (Tags con X) */}
            {activeFiltersCount > 0 && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                    <SlidersHorizontal size={11} /> Activos:
                  </span>

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[0.65rem] font-bold text-blue-700 dark:text-blue-300">
                      <span>"{searchQuery}"</span>
                      <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500 cursor-pointer">×</button>
                    </span>
                  )}

                  {rolSeleccionado !== 'TODOS' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[0.65rem] font-bold text-blue-700 dark:text-blue-300">
                      <span>Rol: {rolSeleccionado}</span>
                      <button type="button" onClick={() => setRolSeleccionado('TODOS')} className="hover:text-red-500 cursor-pointer">×</button>
                    </span>
                  )}

                  {estadoSeleccionado !== 'ACTIVO' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[0.65rem] font-bold text-zinc-700 dark:text-zinc-300">
                      <span>Estado: {estadoSeleccionado}</span>
                      <button type="button" onClick={() => setEstadoSeleccionado('ACTIVO')} className="hover:text-red-500 cursor-pointer">×</button>
                    </span>
                  )}

                  {activacionSeleccionada !== 'TODOS' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[0.65rem] font-bold text-emerald-700 dark:text-emerald-300">
                      <span>Activación: {activacionSeleccionada}</span>
                      <button type="button" onClick={() => setActivacionSeleccionada('TODOS')} className="hover:text-red-500 cursor-pointer">×</button>
                    </span>
                  )}

                  {techsSeleccionadas.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[0.65rem] font-bold text-blue-700 dark:text-blue-300">
                      <span>{skill}</span>
                      <button type="button" onClick={() => handleToggleTechFilter(skill)} className="hover:text-red-500 cursor-pointer">×</button>
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-[0.68rem] font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                >
                  Limpiar todos
                </button>
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
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border shadow-2xs ${t.estado
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                          }`}>
                          <span className={`w-2 h-2 rounded-full ${t.estado ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                          {t.estado ? 'Habilitado' : 'Inhabilitado'}
                        </span>
                      </td>

                      {/* Botones de Acción: Ver Detalle del Trabajador + Inhabilitar/Reactivar */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAbrirDetalleTrabajador(t)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                            title="Ver ficha completa, datos sensibles e historial de proyectos del trabajador"
                          >
                            <Eye size={13} />
                            <span>Ver Detalle</span>
                          </button>

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
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 ${t.estado
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
                        </div>
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
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-all cursor-pointer ${isCurrent
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

      {/* 2. SECCIÓN: GESTIÓN DE PROYECTOS & VISTA GLOBAL DEL PORTAFOLIO */}
      {/* 2. SECCIÓN: GESTIÓN DE PROYECTOS & VISTA GLOBAL DEL PORTAFOLIO */}
      {activeTab === 'proyectos' && (
        <motion.div
          key="proyectos"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {selectedProyectoModal ? (
            /* ========================================================================= */
            /* FULL IN-PAGE WBS & PROJECT DETAILS DASHBOARD (Replica Panel del Líder)   */
            /* ========================================================================= */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Barra de Navegación Superior y Conmutador de Modo */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProyectoModal(null);
                      setHighlightedActividadId(null);
                      setHighlightedProyectoId(null);
                    }}
                    className="outline-button text-xs py-2.5 px-4 font-extrabold inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-2xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl"
                  >
                    <ArrowLeft size={16} />
                    <span>Volver al Catálogo de Proyectos</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3.5 py-1.5 rounded-2xl text-xs font-black inline-flex items-center gap-2 border ${modoEdicionCoordinador
                      ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 animate-pulse'
                      : 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
                    }`}>
                    {modoEdicionCoordinador ? (
                      <><Edit3 size={14} className="text-amber-600" /> Modo Edición Activo (Gestión Directiva Habilitada)</>
                    ) : (
                      <><ShieldCheck size={14} className="text-blue-600" /> Modo Visualización (Supervisión Directiva)</>
                    )}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      const nuevoModo = !modoEdicionCoordinador;
                      setModoEdicionCoordinador(nuevoModo);
                      if (nuevoModo) {
                        toast.success('Modo Edición Habilitado. Los cambios se guardarán con auditoría directiva.');
                        if (!sessionBatchId) setSessionBatchId('BATCH-' + Date.now());
                      } else {
                        toast.info('Modo Visualización Activado (Supervisión).');
                      }
                    }}
                    className={`text-xs py-2.5 px-5 rounded-2xl font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm ${modoEdicionCoordinador
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                      }`}
                  >
                    {modoEdicionCoordinador ? (
                      <><Eye size={15} /> Cambiar a Modo Visualización</>
                    ) : (
                      <><Edit3 size={15} /> Habilitar Modo Edición</>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Ficha Principal de Detalles (Replica Foto 3) */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
                      <FolderGit2 size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                          {selectedProyectoModal.nombre}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-black uppercase border ${selectedProyectoModal.estado === 'FINALIZADO' || selectedProyectoModal.estado === 'COMPLETADO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' :
                            selectedProyectoModal.estado === 'EN_PAUSA' || selectedProyectoModal.estado === 'PAUSADO'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                          {selectedProyectoModal.estado === 'EN_PAUSA' ? 'EN PAUSA' : (selectedProyectoModal.estado || 'ACTIVO')}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Identificador del Proyecto: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">PRJ-00{selectedProyectoModal.idProyecto}</span>
                      </p>
                    </div>
                  </div>

                  {/* Acciones de Cabecera Directiva */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {selectedProyectoModal.lider && (
                      <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                        <User size={14} className="text-blue-600 dark:text-blue-400" />
                        <span>Líder: <strong>{selectedProyectoModal.lider.nombre} {selectedProyectoModal.lider.apellido}</strong></span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAbrirHistorialCambios(selectedProyectoModal.idProyecto)}
                      className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50/40 hover:bg-purple-100 rounded-2xl shadow-xs cursor-pointer"
                      title="Ver el historial de auditoría de modificaciones registradas"
                    >
                      <ClipboardList size={15} className="text-purple-600" />
                      <span>Registro de Cambios</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowGenerarReportePdfModalCoord(true)}
                      className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50/40 hover:bg-blue-100 rounded-2xl shadow-xs cursor-pointer"
                      title="Generar y descargar informe técnico en PDF"
                    >
                      <FileText size={15} className="text-blue-600" />
                      <span>Generar Reporte PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAbrirReasignarLiderPrj(selectedProyectoModal)}
                      className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 hover:bg-indigo-100 rounded-2xl shadow-xs cursor-pointer"
                      title="Reasignar el Líder de Proyecto responsable"
                    >
                      <RotateCw size={15} className="text-indigo-600" />
                      <span>Reasignar Líder</span>
                    </button>

                    {modoEdicionCoordinador && (
                      <>
                        <button
                          type="button"
                          onClick={handlePausarReanudarProyectoCoord}
                          disabled={submittingPausaFinalizarCoord}
                          className={`text-xs py-2 px-3.5 font-extrabold inline-flex items-center gap-2 rounded-2xl border transition-all cursor-pointer shadow-xs ${selectedProyectoModal.estado === 'EN_PAUSA' || selectedProyectoModal.estado === 'PAUSADO'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200'
                            }`}
                        >
                          {selectedProyectoModal.estado === 'EN_PAUSA' || selectedProyectoModal.estado === 'PAUSADO' ? (
                            <><Play size={15} className="text-emerald-600" /><span>Reanudar Proyecto</span></>
                          ) : (
                            <><Pause size={15} className="text-amber-600" /><span>Pausar Proyecto</span></>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleAbrirConfirmFinalizarCoord}
                          disabled={submittingPausaFinalizarCoord || selectedProyectoModal.estado === 'FINALIZADO'}
                          className="text-xs py-2 px-3.5 font-extrabold inline-flex items-center gap-2 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 bg-red-50 hover:bg-red-100 rounded-2xl shadow-xs cursor-pointer disabled:opacity-40"
                        >
                          <CheckCircle size={15} className="text-red-600" />
                          <span>Finalizar Proyecto</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3 Tarjetas Ejecutivas de Información (Replica Foto 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                    <span className="text-[0.65rem] font-bold uppercase text-zinc-400 font-mono block">CLIENTE / ORGANIZACIÓN</span>
                    <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                      {selectedProyectoModal.cliente || 'Cliente Corporativo'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                    <span className="text-[0.65rem] font-bold uppercase text-zinc-400 font-mono block">DIMENSIÓN PRESUPUESTAL</span>
                    <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                      US$ {Number(selectedProyectoModal.presupuesto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                    <span className="text-[0.65rem] font-bold uppercase text-zinc-400 font-mono block">CRONOGRAMA ESTIMADO</span>
                    <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-xs mt-1">
                      {formatearFechaHumana(selectedProyectoModal.fechaInicio)} → {formatearFechaHumana(selectedProyectoModal.fechaFinEstimada)}
                    </p>
                  </div>
                </div>

                {/* Caja de Alcance y Objetivos */}
                {selectedProyectoModal.descripcion && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-1 text-xs">
                    <span className="font-mono text-[0.68rem] font-extrabold uppercase text-zinc-500 block">Descripción del Alcance y Objetivos:</span>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                      {selectedProyectoModal.descripcion}
                    </p>
                  </div>
                )}
              </div>

              {/* Grilla de 4 Tarjetas de Métricas de Resumen (Replica Foto 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase text-zinc-400 font-mono block">ESTADO DEL PROYECTO</span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 uppercase mt-1">
                    {selectedProyectoModal.estado || 'ACTIVO'}
                  </p>
                  <span className="text-[0.68rem] text-zinc-400 block font-mono">
                    Fin Estimado: {formatearFechaHumana(selectedProyectoModal.fechaFinEstimada)}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase text-zinc-400 font-mono block">TOTAL ERRORES EVALUADOS</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    0 Incidencias
                  </p>
                  <span className="text-[0.68rem] text-zinc-400 block font-mono">Persistidas en PostgreSQL</span>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase text-zinc-400 font-mono block">HORAS DE INTERRUPCIÓN</span>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    0.0 Horas
                  </p>
                  <span className="text-[0.68rem] text-zinc-400 block font-mono">En 0 eventos reportados</span>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase text-zinc-400 font-mono block">EQUIPO RESERVADO</span>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {proyectoDevsModal.length} Integrantes
                  </p>
                  <span className="text-[0.68rem] text-zinc-400 block font-mono">Nómina assigned</span>
                </div>
              </div>

              {/* Estructura WBS (Replica Foto 3) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Layers size={20} className="text-blue-600 dark:text-blue-400" />
                      <span>Estructura de Desglose de Trabajo (WBS)</span>
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Desglose estructurado del proyecto en fases, etapas y actividades asignadas a desarrolladores.
                    </p>
                  </div>

                  {modoEdicionCoordinador && (
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowNuevaEtapaModalCoord(true)}
                        className="outline-button text-xs py-2 px-3.5 font-extrabold inline-flex items-center gap-1.5 rounded-2xl border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 cursor-pointer shadow-xs"
                      >
                        <Plus size={15} />
                        <span>Nueva Etapa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowNuevaActividadModalCoord(true)}
                        className="gradient-button text-xs py-2 px-4 font-extrabold inline-flex items-center gap-1.5 rounded-2xl cursor-pointer shadow-md"
                      >
                        <Zap size={15} />
                        <span>Asignar Actividad</span>
                      </button>
                    </div>
                  )}
                </div>

                {loadingProyectoDetalle ? (
                  <div className="p-12 text-center text-xs text-zinc-400">
                    <Loader2 size={28} className="animate-spin mx-auto text-blue-600 mb-3" />
                    Cargando estructura WBS del proyecto...
                  </div>
                ) : proyectoEtapasModal.length === 0 ? (
                  <div className="p-10 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-xs space-y-2">
                    <Layers size={36} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Sin fases WBS registradas</p>
                    <p className="max-w-md mx-auto">No hay etapas registradas para este proyecto aún.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proyectoEtapasModal.map((etapa, idx) => {
                      const acts = etapa.actividades || [];
                      const totalTareas = acts.length;
                      const tareasCompletadas = acts.filter(a => ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO'].includes((a.estado || '').toUpperCase())).length;
                      const todasTareasCompletadas = totalTareas > 0 && tareasCompletadas === totalTareas;
                      const estaFinalizada = (etapa.estado || '').toUpperCase() === 'FINALIZADA' || (etapa.estado || '').toUpperCase() === 'COMPLETADO';

                      return (
                        <div key={etapa.idEtapa || idx} className="p-5 rounded-3xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[0.68rem] font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                #ETAPA_{etapa.idEtapa || (idx + 1)}
                              </span>
                              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                                Fase {idx + 1}: {etapa.nombreEtapa}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-extrabold uppercase border ${estaFinalizada
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                  : todasTareasCompletadas
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                }`}>
                                {estaFinalizada ? 'FINALIZADA' : todasTareasCompletadas ? 'REVISIÓN REQUERIDA' : (etapa.estado || 'PENDIENTE')}
                              </span>

                              {modoEdicionCoordinador && !estaFinalizada && todasTareasCompletadas && (
                                <button
                                  type="button"
                                  onClick={() => handleFinalizarEtapaFormallyCoord(etapa)}
                                  title="Marcar esta etapa como FINALIZADA oficialmente"
                                  className="px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-md bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 animate-bounce shrink-0"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Finalizar Etapa</span>
                                </button>
                              )}

                              {modoEdicionCoordinador && (
                                <button
                                  type="button"
                                  onClick={() => handleAbrirEditarEtapaCoord(etapa)}
                                  className="outline-button text-xs py-1 px-3 font-bold inline-flex items-center gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                                >
                                  <Edit3 size={13} className="text-blue-600" />
                                  <span>Editar</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Banner / Alerta de Fase Completada por Desarrolladores */}
                          {modoEdicionCoordinador && todasTareasCompletadas && !estaFinalizada && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                                  <AlertTriangle size={18} />
                                </div>
                                <div>
                                  <strong className="block text-amber-950 dark:text-amber-100 font-extrabold text-[0.78rem]">
                                  Fase completada por los desarrolladores
                                  </strong>
                                  <span className="text-[0.7rem] opacity-90 font-medium">
                                    Todas las tareas internas ({tareasCompletadas}/{totalTareas}) han sido finalizadas. Ya puede revisar y hacer clic en <strong>Finalizar Etapa</strong> para cerrar formalmente esta etapa.
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleFinalizarEtapaFormallyCoord(etapa)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
                              >
                                <CheckCircle2 size={15} />
                                <span>Finalizar Etapa Ahora</span>
                              </button>
                            </motion.div>
                          )}

                        {/* Actividades dentro de la Etapa */}
                        <div className="space-y-2 pt-2">
                          {etapa.actividades && etapa.actividades.length > 0 ? (
                            etapa.actividades.map((act, aIdx) => {
                              const isHighlighted = highlightedActividadId && (
                                String(act.idActividad) === String(highlightedActividadId) ||
                                String(act.id) === String(highlightedActividadId)
                              );

                              return (
                                <div
                                  key={act.idActividad || aIdx}
                                  className={`relative p-3.5 rounded-2xl transition-all duration-200 ease-out ${isHighlighted
                                      ? 'bg-blue-50/80 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 ring-4 ring-blue-500/20 shadow-xl scale-[1.01] z-10'
                                      : 'bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800'
                                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
                                >
                                  {isHighlighted && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                      className="absolute -top-3.5 -left-1.5 sm:left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-2xl font-bold text-[0.62rem] tracking-wide flex items-center gap-1.5 shadow-lg shadow-blue-500/40 border-2 border-white dark:border-zinc-900 z-20"
                                    >
                                      <Zap size={11} className="fill-white" />
                                      TAREA SELECCIONADA
                                    </motion.div>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1 sm:mt-0">
                                      {act.nombreActividad || act.descripcion}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {act.desarrollador && (
                                      <span className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[0.68rem] flex items-center gap-1.5">
                                        <User size={12} className="text-blue-500" />
                                        {act.desarrollador.nombre} {act.desarrollador.apellido}
                                      </span>
                                    )}
                                    {(() => {
                                      const st = (act.estado || 'PENDIENTE').toUpperCase().replace(/[\s_]+/g, '_');
                                      const isFin = ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO'].includes(st);
                                      const isProg = ['EN_PROGRESO', 'EN_PROCESO', 'EN_CURSO', 'ACTIVO'].includes(st);
                                      const text = (act.estado || 'PENDIENTE').replace(/_/g, ' ');
                                      const colorClass = isFin
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                        : isProg
                                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
                                      return (
                                        <span className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-extrabold uppercase border ${colorClass}`}>
                                          {text}
                                        </span>
                                      );
                                    })()}

                                    {modoEdicionCoordinador && (() => {
                                      const st = (act.estado || '').toUpperCase().replace(/[\s_]+/g, '_');
                                      const isFinalizadaOEnProceso = ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO', 'EN_PROGRESO', 'EN_PROCESO', 'EN_CURSO'].includes(st);

                                      if (isFinalizadaOEnProceso) return null;

                                      return (
                                        <button
                                          type="button"
                                          onClick={() => handleAbrirReasignarActividadCoord(act, etapa)}
                                          className="outline-button text-xs py-1 px-3 font-bold inline-flex items-center gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                                        >
                                          <RotateCw size={13} className="text-purple-600" />
                                          <span>Reasignar</span>
                                        </button>
                                      );
                                    })()}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[0.7rem] text-zinc-400 italic pl-1">Sin tareas asignadas en esta fase.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header de Gestión Global de Proyectos */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                        Catálogo Corporativo & Supervisión de Proyectos
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Vista Global
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Consola ejecutiva del Coordinador: Control de portafolio, reasignación de Líderes y consulta WBS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {navHistory && navHistory.fromTab === 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetWorker = navHistory.worker;
                        setNavHistory(null);
                        setHighlightedProyectoId(null);
                        setActiveTab('personal');
                        if (targetWorker) {
                          handleAbrirDetalleTrabajador(targetWorker);
                          setShowTrabajosSubpanel(true);
                        }
                      }}
                      className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 cursor-pointer shadow-xs"
                      title="Regresar a la ficha de personal y menús anteriores"
                    >
                      <ChevronLeft size={14} />
                      <span>Volver a Ficha de {navHistory.worker?.nombre}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={cargarDatos}
                    disabled={loading}
                    className="outline-button text-xs py-2 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-2xs"
                    title="Sincronizar el catálogo corporativo desde PostgreSQL"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Refrescar Catálogo</span>
                  </button>
                </div>
              </motion.div>



              {/* Tarjetas de Métricas Ejecutivas del Portafolio (Dinámicas por Filtro de Líder) */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Proyectos en Portafolio</span>
                    <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
                    {proyectosBaseCoordinador.length} Proyectos
                  </div>
                  <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-medium">
                    {filtroProyectoLider !== 'TODOS' ? 'Filtrado por Líder seleccionado' : 'Sincronizados en PostgreSQL'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Inversión Presupuestada</span>
                    <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                    ${proyectosBaseCoordinador.reduce((acc, p) => acc + (p.presupuesto || 0), 0).toLocaleString('es-CO')}
                  </div>
                  <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-medium">
                    {filtroProyectoLider !== 'TODOS' ? 'Presupuesto del Líder' : 'Presupuesto acumulado activo'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Proyectos en Ejecución</span>
                    <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
                    {countsEstadoDinamicos.enProgreso} Activos
                  </div>
                  <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-medium">
                    En desarrollo técnico activo
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Líderes Responsables</span>
                    <Users size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
                    {filtroProyectoLider !== 'TODOS' ? '1 Líder' : `${lideresActivos.length} Líderes`}
                  </div>
                  <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-medium">
                    {filtroProyectoLider !== 'TODOS' ? 'Líder filtrado en pantalla' : 'Dirección asignada'}
                  </span>
                </div>
              </motion.div>

              {/* Panel Integrado de Búsqueda y Filtros Ejecutivos del Portafolio */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
              >
                {/* 1. Header Toolbar de Proyectos */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/80 shrink-0">
                      <FolderGit2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                          Catálogo & Supervisión de Proyectos
                        </h3>
                        <span className="text-[0.7rem] font-mono font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          {totalFilteredProyectos} de {proyectosBaseCoordinador.length}
                        </span>
                      </div>
                      <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">
                        {filtroProyectoLider !== 'TODOS' ? 'Proyectos supervisados por líder seleccionado' : 'Portafolio corporativo centralizado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Selector de Orden */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                      <ArrowUpDown size={13} className="text-zinc-400 shrink-0" />
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Orden:</span>
                      <select
                        value={ordenProyecto}
                        onChange={(e) => {
                          setOrdenProyecto(e.target.value);
                          setCurrentProyectoPage(1);
                        }}
                        className="bg-transparent font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer text-xs"
                      >
                        <option value="DEFAULT" className="bg-white dark:bg-zinc-800">Por Defecto</option>
                        <option value="PRESUPUESTO_DESC" className="bg-white dark:bg-zinc-800">Mayor Presupuesto ($)</option>
                        <option value="PRESUPUESTO_ASC" className="bg-white dark:bg-zinc-800">Menor Presupuesto ($)</option>
                        <option value="NOMBRE_ASC" className="bg-white dark:bg-zinc-800">Nombre (A - Z)</option>
                        <option value="FECHA_FIN" className="bg-white dark:bg-zinc-800">Fecha de Fin (Próximos)</option>
                      </select>
                    </div>

                    {activeProyectoFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchProyectoQuery('');
                          setFiltroProyectoEstado('TODOS');
                          setFiltroProyectoLider('TODOS');
                          setOrdenProyecto('DEFAULT');
                          setCurrentProyectoPage(1);
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <RotateCcw size={12} /> Restablecer ({activeProyectoFiltersCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Barra de Búsqueda Rápida */}
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchProyectoQuery}
                    onChange={(e) => {
                      setSearchProyectoQuery(e.target.value);
                      setCurrentProyectoPage(1);
                    }}
                    placeholder="Buscar por código (PRJ-001), nombre de proyecto, cliente o líder..."
                    className="input-field pl-10 pr-9 py-2 text-xs bg-zinc-50/80 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl w-full"
                  />
                  {searchProyectoQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchProyectoQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* 3. Filtros Segmentados Horizontales: Estado Operativo & Filtro por Líder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
                  
                  {/* Selector Segmentado de Estado Operativo */}
                  <div className="lg:col-span-2 space-y-1">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                      <Layers size={11} className="text-blue-500" /> Estado Operativo del Proyecto
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/50">
                      {[
                        { key: 'TODOS', label: 'Todos', count: countsEstadoDinamicos.todos, icon: Sparkles },
                        { key: 'EN_PROGRESO', label: 'En Ejecución', count: countsEstadoDinamicos.enProgreso, icon: Clock },
                        { key: 'COMPLETADO', label: 'Completados', count: countsEstadoDinamicos.completados, icon: CheckCircle2 },
                        { key: 'PAUSADO', label: 'En Pausa', count: countsEstadoDinamicos.pausados, icon: Pause }
                      ].map(st => {
                        const isSelected = filtroProyectoEstado === st.key;
                        const Icon = st.icon;
                        return (
                          <button
                            key={st.key}
                            type="button"
                            onClick={() => {
                              setFiltroProyectoEstado(st.key);
                              setCurrentProyectoPage(1);
                            }}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-2xs border border-zinc-200 dark:border-zinc-700'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                          >
                            <Icon size={12} className={isSelected ? 'text-blue-500' : 'text-zinc-400'} />
                            <span className="truncate">{st.label}</span>
                            <span className="text-[0.6rem] font-mono opacity-70">({st.count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de Líder Responsable */}
                  <div className="space-y-1">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                      <Crown size={11} className="text-purple-500" /> Líder Responsable
                    </span>
                    <div className="flex items-center p-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/50">
                      <select
                        value={filtroProyectoLider}
                        onChange={(e) => {
                          setFiltroProyectoLider(e.target.value);
                          setCurrentProyectoPage(1);
                        }}
                        className="w-full bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer px-2 py-1"
                      >
                        <option value="TODOS" className="bg-white dark:bg-zinc-800">Todos los Líderes ({lideresActivos.length})</option>
                        {lideresActivos.map(lider => (
                          <option key={lider.idTrabajador} value={lider.idTrabajador} className="bg-white dark:bg-zinc-800">
                            {lider.nombre} {lider.apellido}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                {/* 4. Barra Dinámica de Filtros Activos de Proyectos */}
                {activeProyectoFiltersCount > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                        <SlidersHorizontal size={11} /> Activos:
                      </span>

                      {searchProyectoQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[0.65rem] font-bold text-purple-700 dark:text-purple-300">
                          <span>"{searchProyectoQuery}"</span>
                          <button type="button" onClick={() => setSearchProyectoQuery('')} className="hover:text-red-500 cursor-pointer">×</button>
                        </span>
                      )}

                      {filtroProyectoEstado !== 'TODOS' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[0.65rem] font-bold text-blue-700 dark:text-blue-300">
                          <span>Estado: {filtroProyectoEstado}</span>
                          <button type="button" onClick={() => setFiltroProyectoEstado('TODOS')} className="hover:text-red-500 cursor-pointer">×</button>
                        </span>
                      )}

                      {filtroProyectoLider !== 'TODOS' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[0.65rem] font-bold text-purple-700 dark:text-purple-300">
                          <span>Líder ID: {filtroProyectoLider}</span>
                          <button type="button" onClick={() => setFiltroProyectoLider('TODOS')} className="hover:text-red-500 cursor-pointer">×</button>
                        </span>
                      )}

                      {ordenProyecto !== 'DEFAULT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[0.65rem] font-bold text-zinc-700 dark:text-zinc-300">
                          <span>Orden: {ordenProyecto}</span>
                          <button type="button" onClick={() => setOrdenProyecto('DEFAULT')} className="hover:text-red-500 cursor-pointer">×</button>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchProyectoQuery('');
                        setFiltroProyectoEstado('TODOS');
                        setFiltroProyectoLider('TODOS');
                        setOrdenProyecto('DEFAULT');
                        setCurrentProyectoPage(1);
                      }}
                      className="text-[0.68rem] font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Grilla de Tarjetas de Proyectos (Físicas Realistas con Framer Motion & Métrica Avanzada) */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="h-56 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
                  <div className="h-56 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
                  <div className="h-56 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
                </div>
              ) : proyectosPaginados.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                  <FolderGit2 size={40} className="mx-auto text-zinc-400" />
                  <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                    No se encontraron proyectos con los criterios seleccionados.
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Intente ajustar el término de búsqueda o resetear los filtros por Líder / Estado.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proyectosPaginados.map(prj => {
                    const presupuestoFmt = Number(prj.presupuesto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    const isCompletado = prj.estado === 'COMPLETADO' || prj.estado === 'FINALIZADO';
                    const isPausado = prj.estado === 'PAUSADO' || prj.estado === 'EN_PAUSA';
                    const isHighlighted = Number(prj.idProyecto) === Number(highlightedProyectoId);

                    const isPastLiderPending = filtroProyectoLider !== 'TODOS'
                      && String(prj.idLiderAnterior) === String(filtroProyectoLider)
                      && prj.reasignado
                      && !prj.leidoPorLiderAnterior
                      && getHoursSinceReassignment(prj.fechaReasignacion) <= 24;

                    const isReasig = prj.reasignado && !prj.leidoPorLiderAnterior && getHoursSinceReassignment(prj.fechaReasignacion) <= 24;
                    const isNuevo = !prj.reasignado && (prj.fechaInicio || prj.createdAt) && getHoursSinceReassignment(prj.fechaInicio || prj.createdAt) <= 72;

                    const timeInfo = getProjectTimeProgress(prj.fechaInicio, prj.fechaFinEstimada, prj.estado);

                    return (
                      <motion.div
                        key={prj.idProyecto}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{
                          y: -6,
                          scale: 1.012,
                          transition: { type: 'spring', stiffness: 400, damping: 22 }
                        }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                          if (isHighlighted) {
                            setHighlightedProyectoId(null);
                          }
                          handleAbrirDetalleProyecto(prj);
                        }}
                        className={`group bg-white dark:bg-zinc-900 p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                          isHighlighted
                            ? 'ring-4 ring-blue-500 animate-pulse border-blue-600 bg-blue-50/50 dark:bg-blue-950/50 shadow-2xl scale-[1.02]'
                            : isReasig || isPastLiderPending
                              ? 'border-amber-400 dark:border-amber-700/80 bg-gradient-to-b from-amber-50/40 via-amber-50/10 to-white dark:from-amber-950/20 dark:to-zinc-900 shadow-md shadow-amber-500/5 hover:border-amber-500'
                              : isNuevo
                                ? 'border-emerald-400 dark:border-emerald-700/80 bg-gradient-to-b from-emerald-50/40 via-emerald-50/10 to-white dark:from-emerald-950/20 dark:to-zinc-900 shadow-md shadow-emerald-500/5 hover:border-emerald-500'
                                : 'border-zinc-200/90 dark:border-zinc-800 hover:border-blue-500/80 dark:hover:border-blue-500/60'
                        }`}
                      >
                        <div className="space-y-3.5">
                          {isHighlighted && (
                            <div className="bg-blue-600 text-white text-[0.68rem] font-black px-3 py-1.5 rounded-2xl flex items-center justify-between gap-1 -mx-2 -mt-2 mb-2 shadow-md">
                              <span className="flex items-center gap-1.5">
                                <Sparkles size={13} className="animate-spin text-amber-300" />
                                <span>PROYECTO SELECCIONADO (Haga clic para abrir)</span>
                              </span>
                              <span className="text-[0.6rem] underline">Ver Detalle</span>
                            </div>
                          )}

                          {/* 1. Header de la Tarjeta con Código & Status Pill */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono font-black text-[0.72rem] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                              #PRJ-00{prj.idProyecto}
                            </span>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isReasig || isPastLiderPending ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 animate-pulse flex items-center gap-1 shadow-2xs">
                                  <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                                  REASIGNADO (1D)
                                </span>
                              ) : isNuevo ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700 animate-pulse flex items-center gap-1 shadow-2xs">
                                  <Sparkles size={11} className="text-emerald-600 shrink-0" />
                                  NUEVO (3D)
                                </span>
                              ) : null}

                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.62rem] font-black uppercase border ${
                                isCompletado
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                  : isPausado
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isCompletado ? 'bg-emerald-500' : isPausado ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'}`} />
                                <span>{prj.estado || 'ACTIVO'}</span>
                              </span>
                            </div>
                          </div>

                          {/* 2. Título del Proyecto & Cliente */}
                          <div className="space-y-1">
                            <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {prj.nombre}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                              <Building2 size={13} className="shrink-0 text-blue-500" />
                              <span className="truncate font-semibold">{prj.cliente || 'Cliente Corporativo'}</span>
                            </div>
                          </div>

                          {/* 3. Líder Responsable (Card Pill) */}
                          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {prj.lider ? getInitials(prj.lider.nombre, prj.lider.apellido) : 'SD'}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[0.6rem] font-bold text-zinc-400 block uppercase font-mono tracking-wider">Líder Asignado:</span>
                                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate block">
                                  {prj.lider ? `${prj.lider.nombre} ${prj.lider.apellido}` : 'Sin Líder Asignado'}
                                </span>
                              </div>
                            </div>

                            <span className="text-[0.62rem] font-mono text-zinc-400 shrink-0 font-bold">
                              {prj.lider?.profesion ? prj.lider.profesion.split(' ')[0] : 'Dirección'}
                            </span>
                          </div>

                          {/* 4. Métricas Rápidas: Presupuesto & Fin Estimado */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-0.5">
                              <span className="text-[0.6rem] font-bold text-zinc-400 block uppercase font-mono flex items-center gap-1">
                                <DollarSign size={10} className="text-emerald-500" /> Presupuesto USD:
                              </span>
                              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                                ${presupuestoFmt}
                              </span>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-0.5">
                              <span className="text-[0.6rem] font-bold text-zinc-400 block uppercase font-mono flex items-center gap-1">
                                <Calendar size={10} className="text-blue-500" /> Fecha Límite:
                              </span>
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                                  {prj.fechaFinEstimada || '2027-12-31'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 5. Barra de Progreso Temporal (Cronograma Visual) */}
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between text-[0.65rem] font-mono">
                              <span className="text-zinc-400 font-medium">Plazo Transcurrido:</span>
                              <span className={`px-1.5 py-0.2 rounded-md font-bold text-[0.62rem] border ${timeInfo.badge}`}>
                                {timeInfo.label}
                              </span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  timeInfo.status === 'completed'
                                    ? 'bg-emerald-500'
                                    : timeInfo.status === 'danger'
                                      ? 'bg-red-500'
                                      : timeInfo.status === 'warning'
                                        ? 'bg-amber-500'
                                        : 'bg-blue-600'
                                }`}
                                style={{ width: `${timeInfo.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 6. Botones de Acción */}
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAbrirDetalleProyecto(prj)}
                            className="gradient-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 shadow-xs flex-1 justify-center rounded-xl cursor-pointer group-hover:shadow-md transition-shadow"
                          >
                            <Eye size={14} />
                            <span>Revisar Proyecto</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAbrirReasignarLiderPrj(prj)}
                            className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50/50 hover:bg-purple-100 dark:bg-purple-950/40 cursor-pointer rounded-xl shrink-0"
                            title="Reasignar la dirección de este proyecto a otro Líder con auditoría"
                          >
                            <RotateCcw size={14} />
                            <span>Reasignar</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Paginación Integrada de Proyectos */}
              {totalProyectoPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500">
                  <span>Mostrando {startProyectoIdx + 1} - {Math.min(startProyectoIdx + proyectosPerPage, totalFilteredProyectos)} de {totalFilteredProyectos} proyectos</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeProyectoPage <= 1}
                      onClick={() => setCurrentProyectoPage(prev => Math.max(prev - 1, 1))}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span>Página {safeProyectoPage} de {totalProyectoPages}</span>
                    <button
                      type="button"
                      disabled={safeProyectoPage >= totalProyectoPages}
                      onClick={() => setCurrentProyectoPage(prev => Math.min(prev + 1, totalProyectoPages))}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
            className="bg-white dark:bg-zinc-900/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm space-y-4"
          >
            {/* 1. Fila Superior: Búsqueda Inteligente + Indicador Visual del Historial en Sistema */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Caja de Búsqueda */}
              <div className="relative flex-1 group">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors"
                />
                <input
                  type="text"
                  value={searchSolicitudQuery}
                  onChange={(e) => setSearchSolicitudQuery(e.target.value)}
                  placeholder="Buscar por código (SOL-001), cliente, remitente, correo, asunto o contenido..."
                  className="w-full pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 font-medium transition-all shadow-inner placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
                {searchSolicitudQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchSolicitudQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Indicador de Rango Registrado en Sistema */}
              {rangoFechasSolicitudes.primera && (
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-zinc-50 to-blue-50/50 dark:from-zinc-800/60 dark:to-blue-950/20 border border-zinc-200 dark:border-zinc-700/80 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Clock size={15} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[0.62rem] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Período en Sistema
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <span className="font-semibold">{rangoFechasSolicitudes.primeraFormateada}</span>
                      <ArrowRight size={11} className="text-zinc-400 shrink-0" />
                      <span className="font-semibold">{rangoFechasSolicitudes.ultimaFormateada}</span>
                      {rangoFechasSolicitudes.totalDias > 0 && (
                        <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ml-0.5">
                          {rangoFechasSolicitudes.totalDias} {rangoFechasSolicitudes.totalDias === 1 ? 'día' : 'días'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Fila Intermedia: Píldoras de Estado */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setFiltroSolicitudes('TODAS')}
                className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
                  filtroSolicitudes === 'TODAS'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md shadow-zinc-900/15 dark:shadow-white/10 scale-[1.02]'
                    : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80'
                }`}
              >
                <span>Todas</span>
                <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                  filtroSolicitudes === 'TODAS'
                    ? 'bg-white/20 dark:bg-black/20 font-black'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                }`}>
                  {solicitudes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroSolicitudes('PENDIENTE')}
                className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
                  filtroSolicitudes === 'PENDIENTE'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]'
                    : 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 hover:bg-blue-100/80'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Pendientes</span>
                <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                  filtroSolicitudes === 'PENDIENTE' ? 'bg-white/20 font-black' : 'bg-blue-100 dark:bg-blue-900/60'
                }`}>
                  {solicitudes.filter(s => (s.estado === 'PENDIENTE' || (!s.estado && !s.atendido))).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroSolicitudes('EN_PROCESO')}
                className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
                  filtroSolicitudes === 'EN_PROCESO'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-[1.02]'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 hover:bg-amber-100/80'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>En Proceso</span>
                <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                  filtroSolicitudes === 'EN_PROCESO' ? 'bg-white/20 font-black' : 'bg-amber-100 dark:bg-amber-900/60'
                }`}>
                  {solicitudes.filter(s => s.estado === 'EN_PROCESO').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroSolicitudes('ATENDIDA')}
                className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
                  filtroSolicitudes === 'ATENDIDA'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-100/80'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Atendidas</span>
                <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                  filtroSolicitudes === 'ATENDIDA' ? 'bg-white/20 font-black' : 'bg-emerald-100 dark:bg-emerald-900/60'
                }`}>
                  {solicitudes.filter(s => s.estado === 'ATENDIDA' || (s.atendido && !s.estado)).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroSolicitudes('REABIERTA')}
                className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 ${
                  filtroSolicitudes === 'REABIERTA'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]'
                    : 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60 hover:bg-purple-100/80'
                }`}
              >
                <RotateCcw size={13} />
                <span>Reabiertas</span>
                <span className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                  filtroSolicitudes === 'REABIERTA' ? 'bg-white/20 font-black' : 'bg-purple-100 dark:bg-purple-900/60'
                }`}>
                  {solicitudes.filter(s => s.estado === 'REABIERTA').length}
                </span>
              </button>
            </div>

            {/* 3. Fila de Fechas: Centro de Control Temporal Inteligente */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-800/30 p-3.5 sm:p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
              
              {/* Presets Rápidos */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
                  <Calendar size={13} className="text-blue-500" />
                  Rango:
                </span>

                {/* Historial Completo */}
                <button
                  type="button"
                  onClick={() => {
                    setFechaInicioSolicitud('');
                    setFechaFinSolicitud('');
                  }}
                  className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer border ${
                    !fechaInicioSolicitud && !fechaFinSolicitud
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/60'
                  }`}
                  title="Mostrar todas las solicitudes sin límite de fecha"
                >
                  Historial Completo
                </button>

                {/* Período Registrado */}
                <button
                  type="button"
                  onClick={() => {
                    if (rangoFechasSolicitudes.primera && rangoFechasSolicitudes.ultima) {
                      setFechaInicioSolicitud(rangoFechasSolicitudes.primera);
                      setFechaFinSolicitud(rangoFechasSolicitudes.ultima);
                    }
                  }}
                  className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer border ${
                    fechaInicioSolicitud === rangoFechasSolicitudes.primera && fechaFinSolicitud === rangoFechasSolicitudes.ultima
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/60'
                  }`}
                  title="Filtrar exactamente entre la primera y última fecha registrada"
                >
                  Período con Registros
                </button>

                {/* Últimos 7 días */}
                <button
                  type="button"
                  onClick={() => {
                    const baseDate = rangoFechasSolicitudes.ultima ? new Date(rangoFechasSolicitudes.ultima + 'T00:00:00') : new Date();
                    const startDate = new Date(baseDate);
                    startDate.setDate(startDate.getDate() - 6);
                    setFechaInicioSolicitud(startDate.toISOString().split('T')[0]);
                    setFechaFinSolicitud(baseDate.toISOString().split('T')[0]);
                  }}
                  className="text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer border bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                  title="Filtrar por los últimos 7 días de actividad"
                >
                  Últimos 7 días
                </button>

                {/* Últimos 30 días */}
                <button
                  type="button"
                  onClick={() => {
                    const baseDate = rangoFechasSolicitudes.ultima ? new Date(rangoFechasSolicitudes.ultima + 'T00:00:00') : new Date();
                    const startDate = new Date(baseDate);
                    startDate.setDate(startDate.getDate() - 29);
                    setFechaInicioSolicitud(startDate.toISOString().split('T')[0]);
                    setFechaFinSolicitud(baseDate.toISOString().split('T')[0]);
                  }}
                  className="text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer border bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                  title="Filtrar por los últimos 30 días de actividad"
                >
                  Últimos 30 días
                </button>
              </div>

              {/* Selector Personalizado Dual (Desde → Hasta) */}
              <div className="flex items-center gap-2 shrink-0 justify-start xl:justify-end flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-1.5 px-3 shadow-xs">
                  {/* Desde */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.62rem] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                      Desde
                    </span>
                    <input
                      type="date"
                      value={fechaInicioSolicitud}
                      min={rangoFechasSolicitudes.primera}
                      max={fechaFinSolicitud || rangoFechasSolicitudes.ultima}
                      onChange={(e) => setFechaInicioSolicitud(e.target.value)}
                      className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Separador Visual */}
                  <ArrowRight size={13} className="text-zinc-400 shrink-0 mx-0.5" />

                  {/* Hasta */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.62rem] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                      Hasta
                    </span>
                    <input
                      type="date"
                      value={fechaFinSolicitud}
                      min={fechaInicioSolicitud || rangoFechasSolicitudes.primera}
                      max={rangoFechasSolicitudes.ultima}
                      onChange={(e) => setFechaFinSolicitud(e.target.value)}
                      className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Quitar filtro solo de fechas */}
                  {(fechaInicioSolicitud || fechaFinSolicitud) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFechaInicioSolicitud('');
                        setFechaFinSolicitud('');
                      }}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer ml-1"
                      title="Quitar filtro de fechas"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* 4. Barra Informativa de Filtros Activos con Botón de Reinicio Rápido */}
            {(searchSolicitudQuery || fechaInicioSolicitud || fechaFinSolicitud || filtroSolicitudes !== 'TODAS') && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 font-medium"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold flex items-center gap-1">
                    <Filter size={13} className="text-blue-600 dark:text-blue-400" />
                    Filtros aplicados:
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    Mostrando {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
                  </span>

                  {filtroSolicitudes !== 'TODAS' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-[0.7rem] font-bold">
                      Estado: {filtroSolicitudes}
                      <button
                        type="button"
                        onClick={() => setFiltroSolicitudes('TODAS')}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}

                  {(fechaInicioSolicitud || fechaFinSolicitud) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-[0.7rem] font-bold">
                      Período: {fechaInicioSolicitud ? formatearFechaHumana(fechaInicioSolicitud) : 'Inicio'} → {fechaFinSolicitud ? formatearFechaHumana(fechaFinSolicitud) : 'Hoy'}
                      <button
                        type="button"
                        onClick={() => {
                          setFechaInicioSolicitud('');
                          setFechaFinSolicitud('');
                        }}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}

                  {searchSolicitudQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-[0.7rem] font-bold">
                      Texto: "{searchSolicitudQuery}"
                      <button
                        type="button"
                        onClick={() => setSearchSolicitudQuery('')}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearchSolicitudQuery('');
                    setFechaInicioSolicitud('');
                    setFechaFinSolicitud('');
                    setFiltroSolicitudes('TODAS');
                  }}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 inline-flex items-center gap-1 py-1 px-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw size={12} />
                  Restablecer todos
                </button>
              </motion.div>
            )}
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
                  className={`bg-white dark:bg-zinc-900 p-6 rounded-3xl border flex flex-col justify-between shadow-sm hover:shadow-[0_0_18px_rgba(59,130,246,0.14)] hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-200 h-full ${sol.atendido || sol.estado === 'ATENDIDA'
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

                    {/* Badge Destacado: Coordinador Atención / Auditoría de Responsable */}
                    <div className="pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <span className="text-[0.62rem] font-bold uppercase text-zinc-400 font-mono">
                        Coordinador Responsable:
                      </span>
                      {sol.coordinador ? (
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-xl">
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[0.55rem] flex items-center justify-center">
                            {getInitials(sol.coordinador.nombre, sol.coordinador.apellido)}
                          </div>
                          <span className="text-[0.68rem] font-extrabold text-blue-700 dark:text-blue-300">
                            {sol.coordinador.nombre} {sol.coordinador.apellido}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-xl border border-amber-200 dark:border-amber-800">
                          <Clock size={10} /> Sin Asignar (Pendiente)
                        </span>
                      )}
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
          <PredictorBurnout
            onNavigateToWbs={(proyectoObj, devObj, taskObj) => {
              const idPrj = proyectoObj?.idProyecto || taskObj?.idProyecto;
              const idAct = taskObj?.idActividad || taskObj?.id;
              if (idPrj) {
                handleIrAWbsProyectoDesdeTrabajador(idPrj, idAct, null, devObj);
              }
            }}
          />
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
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[98%] sm:w-full max-w-5xl shadow-2xl max-h-[92dvh] overflow-y-auto space-y-5"
              >
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-start pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                      <UserPlus size={22} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                        <span>Registrar Nuevo Colaborador</span>
                        <span className={`text-[0.62rem] font-bold font-mono px-2 py-0.5 rounded-full border ${currentSkillProfile.badgeTagStyle}`}>
                          {newTrabajador.rol}
                        </span>
                      </h3>
                      <p className="text-[0.72rem] text-zinc-500 font-medium mt-0.5">
                        Alta corporativa en PostgreSQL, asignación de rol de seguridad y credenciales iniciales
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCrearTrabajador} className="space-y-4 text-xs" noValidate>
                  {/* Grid de 2 Columnas aprovechando el Ancho Horizontal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                    {/* COLUMNA IZQUIERDA: 1. Identificación & Credenciales */}
                    <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60 dark:border-zinc-700/60">
                        <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100">
                          <Shield size={14} className="text-blue-500" />
                          <span>1. Identificación & Credenciales de Acceso</span>
                        </div>
                        <span className="text-[0.62rem] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          PostgreSQL Auth
                        </span>
                      </div>

                      {/* Nombres, Apellidos y Rol */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                            Nombres *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={newTrabajador.nombre}
                              onChange={(e) => {
                                const val = e.target.value;
                                const autoEmail = autoGenerarEmailCorporativo(val, newTrabajador.apellido);
                                setNewTrabajador(prev => ({ ...prev, nombre: val, email: autoEmail || prev.email }));
                                setFormErrors(p => ({ ...p, nombre: undefined }));
                              }}
                              placeholder="Nombres"
                              className={`input-field py-1.5 text-xs ${newTrabajador.nombre ? (nombreValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                                }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                            Apellidos *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={newTrabajador.apellido}
                              onChange={(e) => {
                                const val = e.target.value;
                                const autoEmail = autoGenerarEmailCorporativo(newTrabajador.nombre, val);
                                setNewTrabajador(prev => ({ ...prev, apellido: val, email: autoEmail || prev.email }));
                                setFormErrors(p => ({ ...p, apellido: undefined }));
                              }}
                              placeholder="Apellidos"
                              className={`input-field py-1.5 text-xs ${newTrabajador.apellido ? (apellidoValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                                }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                            Rol de Seguridad *
                          </label>
                          <select
                            value={newTrabajador.rol}
                            onChange={(e) => setNewTrabajador({ ...newTrabajador, rol: e.target.value })}
                            className="input-field py-1.5 text-xs font-bold uppercase"
                          >
                            <option value="DESARROLLADOR">DESARROLLADOR</option>
                            <option value="LIDER">LÍDER DE PROYECTO</option>
                            <option value="COORDINADOR">COORDINADOR</option>
                          </select>
                        </div>
                      </div>

                      {/* Selector de País de Emisión y Cédula */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                            País / Documento *
                          </label>
                          <select
                            value={newTrabajador.paisCodigo}
                            onChange={(e) => setNewTrabajador({ ...newTrabajador, paisCodigo: e.target.value })}
                            className="input-field py-1.5 text-xs font-bold"
                          >
                            {PAISES_IDENTIFICACION.map(p => (
                              <option key={p.code} value={p.code}>
                                [{p.flag}] {p.docTipo}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                            Número de Identificación / Cédula *
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
                              className={`input-field py-1.5 text-xs font-mono font-bold pr-8 ${
                                newTrabajador.identificacion
                                  ? (docValidationResult.valid ? 'border-emerald-500 dark:border-emerald-500' : 'border-red-500 dark:border-red-500 bg-red-50/30 dark:bg-red-950/20')
                                  : ''
                              }`}
                            />
                            {newTrabajador.identificacion && (
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                {docValidationResult.valid ? (
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                  <AlertTriangle size={14} className="text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {newTrabajador.identificacion && !docValidationResult.valid && (
                            <p className="text-[0.63rem] text-red-500 dark:text-red-400 font-bold mt-1 flex items-center gap-1">
                              <AlertTriangle size={12} className="shrink-0" /> {docValidationResult.message}
                            </p>
                          )}
                          {newTrabajador.identificacion && docValidationResult.valid && (
                            <p className="text-[0.63rem] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                              <CheckCircle2 size={12} className="shrink-0" /> Cédula válida y disponible
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Correo Electrónico Corporativo Único */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-zinc-700 dark:text-zinc-300 text-[0.68rem]">
                            Correo Electrónico Corporativo Único *
                          </label>
                          <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full border ${
                            emailValidationResult.valid 
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800'
                          }`}>
                            {emailValidationResult.valid ? '✓ @ikernell.org (Auto-Generado Único)' : '✕ Correo Corporativo Duplicado / Inválido'}
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={newTrabajador.email}
                            onChange={(e) => {
                              setNewTrabajador({ ...newTrabajador, email: e.target.value });
                              setFormErrors(p => ({ ...p, email: undefined }));
                            }}
                            onBlur={() => {
                              if (newTrabajador.email && !newTrabajador.email.includes('@')) {
                                setNewTrabajador(prev => ({ ...prev, email: `${prev.email.trim()}@ikernell.org` }));
                              }
                            }}
                            placeholder="correo.corporativo@ikernell.org"
                            className={`input-field py-1.5 text-xs font-mono font-bold pr-8 ${
                              newTrabajador.email
                                ? (emailValidationResult.valid ? 'border-emerald-500 dark:border-emerald-500' : 'border-red-500 dark:border-red-500 bg-red-50/30 dark:bg-red-950/20')
                                : ''
                            }`}
                          />
                          {newTrabajador.email && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {emailValidationResult.valid ? (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                              ) : (
                                <AlertTriangle size={14} className="text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {newTrabajador.email && !emailValidationResult.valid && (
                          <p className="text-[0.63rem] text-red-500 dark:text-red-400 font-bold mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} className="shrink-0" /> {emailValidationResult.message}
                          </p>
                        )}
                        {newTrabajador.email && emailValidationResult.valid && (
                          <p className="text-[0.63rem] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                            <CheckCircle2 size={12} className="shrink-0" /> {emailValidationResult.message}
                          </p>
                        )}
                      </div>

                      {/* Correo Electrónico Personal / Alternativo */}
                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                          Correo Electrónico Personal / Alternativo (Notificación y Copia CC) *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={newTrabajador.emailPersonal || ''}
                            onChange={(e) => {
                              setNewTrabajador({ ...newTrabajador, emailPersonal: e.target.value });
                              setFormErrors(p => ({ ...p, emailPersonal: undefined }));
                            }}
                            placeholder="correo.personal@gmail.com"
                            className={`input-field py-1.5 text-xs font-semibold pr-8 ${
                              newTrabajador.emailPersonal
                                ? (emailPersonalValidationResult.valid ? 'border-emerald-500 dark:border-emerald-500' : 'border-red-500 dark:border-red-500 bg-red-50/30 dark:bg-red-950/20')
                                : ''
                            }`}
                          />
                          {newTrabajador.emailPersonal && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {emailPersonalValidationResult.valid ? (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                              ) : (
                                <AlertTriangle size={14} className="text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {newTrabajador.emailPersonal && !emailPersonalValidationResult.valid && (
                          <p className="text-[0.63rem] text-red-500 dark:text-red-400 font-bold mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} className="shrink-0" /> {emailPersonalValidationResult.message}
                          </p>
                        )}
                        {newTrabajador.emailPersonal && emailPersonalValidationResult.valid && (
                          <p className="text-[0.63rem] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                            <CheckCircle2 size={12} className="shrink-0" /> {emailPersonalValidationResult.message}
                          </p>
                        )}
                      </div>

                      {/* Informativo de Contraseña Temporal Automática del Sistema */}
                      <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 flex items-start gap-3 text-xs font-medium">
                        <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold block text-blue-950 dark:text-blue-100">Contraseña Temporal Automática</span>
                          <p className="text-[0.7rem] text-blue-800/90 dark:text-blue-300 leading-relaxed">
                            La contraseña de acceso inicial será generada automáticamente por el sistema con alta seguridad (8-20 caracteres, Mayúscula, Minúscula, Número y Símbolo) y enviada al correo personal indicado.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: 2 & 3 Perfil Profesional y Stack Habilidades (WBS) */}
                    <div className="space-y-4">
                      {/* 2. Perfil Profesional */}
                      <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60 dark:border-zinc-700/60">
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <GraduationCap size={14} className="text-indigo-500" /> 2. Perfil Profesional
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                              Profesión / Titulación *
                            </label>
                            <select
                              required
                              value={newTrabajador.profesion}
                              onChange={(e) => setNewTrabajador({ ...newTrabajador, profesion: e.target.value })}
                              className="input-field py-2 text-xs font-semibold cursor-pointer bg-white dark:bg-zinc-900"
                            >
                              <option value="">-- Seleccionar Titulación --</option>
                              {TITULACIONES_PROFESIONALES.map((tit) => (
                                <option key={tit} value={tit}>{tit}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                              Especialidad Principal *
                            </label>
                            <select
                              required
                              value={newTrabajador.especialidad}
                              onChange={(e) => setNewTrabajador({ ...newTrabajador, especialidad: e.target.value })}
                              className="input-field py-2 text-xs font-semibold cursor-pointer bg-white dark:bg-zinc-900"
                            >
                              <option value="">-- Seleccionar Especialidad --</option>
                              {ESPECIALIDADES_PRINCIPALES.map((esp) => (
                                <option key={esp} value={esp}>{esp}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 3. Stack Habilidades (WBS) */}
                      <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-blue-200/60 dark:border-blue-800/60">
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <RoleIconComponent size={14} className="text-blue-500" /> 3. Stack Técnico & Habilidades WBS
                          </span>
                          <span className="text-[0.62rem] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {selectedSkills.length} Habilidades
                          </span>
                        </div>

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
                            placeholder="Escriba una habilidad y presione Enter..."
                            className="input-field py-1.5 text-xs flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomSkill}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            + Agregar
                          </button>
                        </div>

                        {/* Habilidades Seleccionadas (Tags) */}
                        <div className="flex flex-wrap gap-1 min-h-[32px] p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                          {selectedSkills.length === 0 ? (
                            <span className="text-[0.65rem] text-zinc-400 italic">Seleccione de las sugerencias rápidas abajo o agregue una personalizada.</span>
                          ) : (
                            selectedSkills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[0.62rem] font-bold flex items-center gap-1">
                                <span>{skill}</span>
                                <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 cursor-pointer">×</button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Sugerencias Rápidas Compactas */}
                        <div className="space-y-1">
                          <span className="text-[0.62rem] font-bold text-zinc-500 uppercase block">Sugerencias Rápidas (Clic para Activar):</span>
                          <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto pr-1">
                            {currentSkillProfile.sugerencias.map(skill => {
                              const isSelected = selectedSkills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => handleToggleSkill(skill)}
                                  className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold border transition-colors cursor-pointer ${isSelected
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                                    }`}
                                >
                                  {isSelected ? '✓ ' : '+ '}{skill}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Acciones de Footer del Formulario */}
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer"
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
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${solicitudActionForm.estado === 'ATENDIDA'
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
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${solicitudActionForm.estado === 'REABIERTA'
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
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${solicitudActionForm.estado === 'EN_PROCESO'
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
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${solicitudActionForm.estado === 'PENDIENTE'
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
        {/* Modal: Reasignación Obligatoria de Proyectos al Inhabilitar Líder (Vista Amplia Executiva & Granular) */}
        {showReasignarLiderModal && liderAInhabilitar && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 w-full max-w-5xl shadow-2xl space-y-7 max-h-[92dvh] overflow-y-auto"
            >
              {/* Encabezado Principal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black shrink-0 border border-amber-500/20 shadow-sm">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      Reasignación Granular Obligatoria de Proyectos
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Transfiere la supervisión directiva del portafolio antes de inhabilitar la cuenta del Líder
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido Dinámico según Paso (FORMULARIO / CONFIRMACION) */}
              <AnimatePresence mode="wait">
                {pasoModalReasignar === 'FORMULARIO' ? (
                  <motion.form
                    key="step-formulario"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleIrAConfirmacionReasignacion}
                    className="space-y-6 text-xs"
                  >
                    {/* Alerta Informativa Enriquecida del Líder Afectado */}
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50/90 via-amber-50 to-orange-50/80 dark:from-amber-950/50 dark:via-amber-950/40 dark:to-orange-950/40 border border-amber-200/90 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 dark:text-amber-200 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center shrink-0 text-lg shadow-md border border-amber-400/30">
                          {getInitials(liderAInhabilitar.nombre, liderAInhabilitar.apellido)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[0.65rem] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 border border-amber-300 dark:border-amber-700">
                              Líder a Inhabilitar
                            </span>
                            <strong className="text-sm font-black text-amber-950 dark:text-amber-100">
                              {liderAInhabilitar.nombre} {liderAInhabilitar.apellido}
                            </strong>
                          </div>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                            {liderAInhabilitar.email} &bull; {liderAInhabilitar.profesion || 'Líder de Proyecto'}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-300/80 dark:border-amber-700/80 shrink-0 text-center space-y-0.5">
                        <span className="text-[0.62rem] font-mono font-extrabold text-amber-700 dark:text-amber-400 uppercase block">Portafolio Activo</span>
                        <span className="font-mono font-black text-base text-amber-950 dark:text-amber-100 block">
                          {proyectosDelLiderAfectado.length} Proyecto(s)
                        </span>
                      </div>
                    </div>

                    {/* Tarjeta Destacada de Asignación Masiva Rápida (Atajo para todo el portafolio) */}
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/90 dark:border-blue-800/80 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={18} className="text-amber-500 shrink-0 animate-pulse" />
                        <div>
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs block">
                            Asignación Masiva Rápida (Atajo para todo el portafolio)
                          </span>
                          <span className="text-[0.68rem] text-zinc-500 font-medium block">
                            Asigna un mismo Líder receptor a los {proyectosDelLiderAfectado.length} proyectos con un solo clic. Puedes cambiar individualmente cada uno abajo.
                          </span>
                        </div>
                      </div>

                      <select
                        value={nuevoLiderTargetId}
                        onChange={(e) => handleAsignarTodosAMismoLider(e.target.value)}
                        className="input-field w-full py-3 px-4 text-xs font-bold appearance-none cursor-pointer bg-white dark:bg-zinc-900 border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 rounded-xl"
                      >
                        <option value="">— Seleccionar Líder para asignar masivamente a los {proyectosDelLiderAfectado.length} proyectos —</option>
                        {trabajadores
                          .filter(t => t.idTrabajador !== liderAInhabilitar.idTrabajador && t.estado && t.rol && t.rol.toUpperCase().includes('LIDER'))
                          .map(l => (
                            <option key={l.idTrabajador} value={l.idTrabajador}>
                              {l.nombre} {l.apellido} — ({l.profesion || 'Líder de Proyecto'}) &bull; [{l.email}]
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Matriz Granular de Asignación Obligatoria */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[0.7rem] font-extrabold text-zinc-500 uppercase tracking-wider block font-mono">
                          Matriz de Asignación Granular ({proyectosDelLiderAfectado.length} Proyectos Obligatorios):
                        </span>
                        <span className="text-[0.68rem] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          Ningún proyecto se puede quedar sin asignar
                        </span>
                      </div>

                      {/* Lista de Proyectos con Scrollbar aislado */}
                      <div className="space-y-4 max-h-[55dvh] overflow-y-auto pr-3.5 pl-1 py-1">
                        {proyectosDelLiderAfectado.map((p) => {
                          const otrosLideresList = trabajadores.filter(
                            t => t.idTrabajador !== liderAInhabilitar.idTrabajador && t.estado && t.rol && t.rol.toUpperCase().includes('LIDER')
                          );
                          const estaAsignado = Boolean(reasignacionesMap[p.idProyecto]);

                          return (
                            <div
                              key={p.idProyecto}
                              className={`p-5 rounded-3xl bg-white dark:bg-zinc-800/80 border space-y-3.5 text-xs shadow-2xs transition-all ${estaAsignado
                                  ? 'border-zinc-200 dark:border-zinc-700/80 hover:border-blue-400'
                                  : 'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10'
                                }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-700/50 pb-2.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono font-extrabold text-[0.68rem] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                    PRJ-00{p.idProyecto}
                                  </span>
                                  <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm">
                                    {p.nombre}
                                  </h4>
                                </div>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                  ${Number(p.presupuesto || 0).toLocaleString('es-CO')} COP
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                <div className="md:col-span-5 text-[0.72rem] text-zinc-500 space-y-0.5">
                                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Cliente: {p.cliente || 'Corporativo'}</span>
                                  <span>Estado: <strong className="text-blue-600 dark:text-blue-400 uppercase">{p.estado || 'ACTIVO'}</strong></span>
                                </div>

                                <div className="md:col-span-7 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 text-[0.7rem]">
                                      Nuevo Líder Receptor *
                                    </label>
                                    {!estaAsignado && (
                                      <span className="text-[0.62rem] font-bold text-amber-600 dark:text-amber-400">
                                        Asigna un Líder
                                      </span>
                                    )}
                                  </div>
                                  <select
                                    required
                                    value={reasignacionesMap[p.idProyecto] || ''}
                                    onChange={(e) => handleCambiarLiderDeProyecto(p.idProyecto, e.target.value)}
                                    className={`input-field w-full py-2.5 px-3.5 text-xs font-bold appearance-none cursor-pointer rounded-xl border-2 ${estaAsignado
                                        ? 'border-zinc-200 dark:border-zinc-700 focus:border-blue-500'
                                        : 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                                      }`}
                                  >
                                    <option value="">— Seleccionar Líder Receptor Obligatorio —</option>
                                    {otrosLideresList.map(l => (
                                      <option key={l.idTrabajador} value={l.idTrabajador}>
                                        {l.nombre} {l.apellido} — ({l.profesion || 'Líder de Proyecto'}) &bull; [{l.email}]
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowReasignarLiderModal(false)}
                        className="outline-button text-xs py-2.5 px-5 font-bold rounded-2xl"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        className="gradient-button text-xs py-3 px-6 font-bold inline-flex items-center gap-2 shadow-md cursor-pointer rounded-2xl"
                      >
                        <span>Revisar & Confirmar Reasignación</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="step-confirmacion"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5 text-xs"
                  >
                    {/* Alerta Prominente de Confirmación */}
                    <div className="p-5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 space-y-2 text-blue-900 dark:text-blue-200">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={22} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <h4 className="text-sm font-black uppercase tracking-wider">
                          Confirmación de Transferencia e Inhabilitación
                        </h4>
                      </div>
                      <p className="text-xs font-bold leading-relaxed">
                        ¿Estás seguro de transferir los <strong>{proyectosDelLiderAfectado.length} proyectos</strong> de supervisión e inhabilitar al usuario <strong>{liderAInhabilitar.nombre} {liderAInhabilitar.apellido}</strong>?
                      </p>
                    </div>

                    {/* Tabla Resumen de Reasignaciones */}
                    <div className="space-y-2">
                      <span className="text-[0.7rem] font-extrabold text-zinc-400 uppercase tracking-wider block font-mono">
                        Resumen de Transferencias a Ejecutar:
                      </span>

                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 font-extrabold text-[0.65rem] uppercase">
                              <th className="p-3">Proyecto</th>
                              <th className="p-3">Líder Saliente</th>
                              <th className="p-3">Nuevo Líder Receptor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {proyectosDelLiderAfectado.map((p) => {
                              const targetLiderId = reasignacionesMap[p.idProyecto];
                              const receptorObj = trabajadores.find(t => String(t.idTrabajador) === String(targetLiderId));
                              const nombreReceptor = receptorObj ? `${receptorObj.nombre} ${receptorObj.apellido}` : 'Líder Seleccionado';

                              return (
                                <tr key={p.idProyecto} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                                  <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">
                                    <span className="font-mono text-zinc-400 text-[0.65rem] block">PRJ-00{p.idProyecto}</span>
                                    {p.nombre}
                                  </td>
                                  <td className="p-3 text-red-500 font-semibold text-[0.72rem]">
                                    {liderAInhabilitar.nombre} {liderAInhabilitar.apellido}
                                  </td>
                                  <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-[0.72rem]">
                                    ➔ {nombreReceptor}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Botones de Confirmación Final */}
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setPasoModalReasignar('FORMULARIO')}
                        disabled={submittingReasignacionLider}
                        className="outline-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        <span>Modificar Asignaciones</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleEjecutarReasignacionEInhabilitar}
                        disabled={submittingReasignacionLider}
                        className="gradient-button text-xs py-2.5 px-6 font-bold inline-flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {submittingReasignacionLider ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Procesando Cambios...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Confirmar y Procesar Reasignación</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Reasignar Líder a Proyecto Específico (Con Justificación de Auditoría) */}
      <AnimatePresence>
        {showReasignarLiderModalPrj && proyectoAReasignar && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800 shadow-xs">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    Reasignar Dirección de Proyecto
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Asigna un nuevo Líder responsable con registro de auditoría en la plataforma
                  </p>
                </div>
              </div>

              {/* Ficha Resumen del Proyecto Afectado */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40 border border-blue-200/80 dark:border-blue-800/80 text-xs space-y-1.5 font-medium">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-blue-700 dark:text-blue-300 text-[0.7rem]">
                    PRJ-00{proyectoAReasignar.idProyecto}
                  </span>
                  <span className="text-[0.62rem] font-bold text-zinc-500">Cliente: {proyectoAReasignar.cliente || 'Corporativo'}</span>
                </div>
                <strong className="block text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                  {proyectoAReasignar.nombre}
                </strong>
                <div className="pt-1 text-[0.7rem] text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                  <span>Líder Saliente:</span>
                  <strong className="text-purple-700 dark:text-purple-300">
                    {proyectoAReasignar.lider ? `${proyectoAReasignar.lider.nombre} ${proyectoAReasignar.lider.apellido}` : 'Sin Líder Asignado'}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleEjecutarReasignarLiderPrj} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
                    Seleccionar Nuevo Líder Receptor *
                  </label>
                  <select
                    required
                    value={targetNuevoLiderPrjId}
                    onChange={(e) => setTargetNuevoLiderPrjId(e.target.value)}
                    className="input-field w-full py-3 px-3.5 text-xs font-bold appearance-none cursor-pointer rounded-xl border-2 border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
                  >
                    <option value="">— Seleccionar un Líder Activo de la Lista —</option>
                    {lideresActivos
                      .filter(l => l.idTrabajador !== proyectoAReasignar.lider?.idTrabajador)
                      .map(lider => (
                        <option key={lider.idTrabajador} value={lider.idTrabajador}>
                          {lider.nombre} {lider.apellido} — ({lider.profesion || 'Líder de Proyecto'}) &bull; [{lider.email}]
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs flex items-center justify-between">
                    <span>Motivo / Justificación del Cambio (Registro de Auditoría) *</span>
                    <span className="text-[0.62rem] font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                      Obligatorio *
                    </span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={motivoReasignacionPrj}
                    onChange={(e) => setMotivoReasignacionPrj(e.target.value)}
                    placeholder="Descripción del motivo de la reasignación..."
                    className="input-field w-full p-3 text-xs font-medium rounded-xl border-2 border-zinc-200 dark:border-zinc-700 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowReasignarLiderModalPrj(false)}
                    disabled={submittingReasignarLiderPrj}
                    className="outline-button text-xs py-2.5 px-5 font-bold cursor-pointer rounded-2xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReasignarLiderPrj || !targetNuevoLiderPrjId || !motivoReasignacionPrj.trim()}
                    className="gradient-button text-xs py-2.5 px-6 font-bold cursor-pointer inline-flex items-center gap-2 rounded-2xl shadow-md disabled:opacity-50"
                  >
                    {submittingReasignarLiderPrj ? (
                      <><Loader2 size={15} className="animate-spin" /> Transfiriendo...</>
                    ) : (
                      <><CheckCircle2 size={15} /> Confirmar Reasignación con Auditoría</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Modal: Ficha Técnica, Datos Sensibles & Dual Panel de Carga Horaria y Tareas */}
      <AnimatePresence>
        {selectedTrabajadorModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 w-full transition-all duration-300 shadow-2xl max-h-[92dvh] overflow-y-auto space-y-7 max-w-6xl"
            >
              {/* Encabezado Principal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0 border border-blue-400/20">
                    {getInitials(selectedTrabajadorModal.nombre, selectedTrabajadorModal.apellido)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {selectedTrabajadorModal.nombre} {selectedTrabajadorModal.apellido}
                      </h3>
                      <RoleBadge rol={selectedTrabajadorModal.rol} />
                    </div>
                    <div className="flex items-center gap-2.5 mt-1.5 text-xs text-zinc-500 font-medium flex-wrap">
                      <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        ID: #{selectedTrabajadorModal.identificacion || selectedTrabajadorModal.idTrabajador}
                      </span>
                      <span>&bull;</span>
                      <span>Profesión: <strong className="text-zinc-800 dark:text-zinc-200">{selectedTrabajadorModal.profesion || selectedTrabajadorModal.especialidad || 'Especialista de Software'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Dual Responsive: 5 cols (Ficha) + 7 cols (Carga Horaria & Tareas) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Panel Izquierdo: Ficha Personal, Credenciales & Stack (5 de 12 columnas) */}
                <div className="space-y-5 lg:col-span-5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Ficha Personal, Credenciales & Stack Técnico
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 text-xs">
                    {/* Correos de Contacto */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                        <span className="text-[0.62rem] font-extrabold uppercase text-zinc-400 block font-mono">Correo Corporativo Principal:</span>
                        <div className="flex items-center gap-2.5 mt-1.5 min-w-0">
                          <Mail size={15} className="text-blue-600 shrink-0" />
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-xs truncate" title={selectedTrabajadorModal.email}>
                            {selectedTrabajadorModal.email}
                          </span>
                          <Lock size={13} className="text-zinc-400 ml-auto shrink-0" title="Correo Corporativo Protegido" />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                        <span className="text-[0.62rem] font-extrabold uppercase text-zinc-400 block font-mono">Correo Personal Alternativo:</span>
                        <div className="flex items-center gap-2.5 mt-1.5 min-w-0">
                          <Mail size={15} className="text-zinc-500 shrink-0" />
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-xs truncate" title={selectedTrabajadorModal.emailPersonal || selectedTrabajadorModal.correoPersonal || (selectedTrabajadorModal.email?.includes('@') ? `${selectedTrabajadorModal.email.split('@')[0]}.personal@gmail.com` : 'personal@gmail.com')}>
                            {selectedTrabajadorModal.emailPersonal || selectedTrabajadorModal.correoPersonal || (selectedTrabajadorModal.email?.includes('@') ? `${selectedTrabajadorModal.email.split('@')[0]}.personal@gmail.com` : `${(selectedTrabajadorModal.nombre || 'usuario').toLowerCase()}.${(selectedTrabajadorModal.apellido || 'dev').toLowerCase()}.personal@gmail.com`)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profesión & Especialidad Desglosada en Tech Pills */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2.5">
                      <span className="text-[0.62rem] font-extrabold uppercase text-zinc-400 block font-mono">Profesión & Competencias Técnicas:</span>
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm block">
                        {selectedTrabajadorModal.profesion || 'Ingeniero de Software'}
                      </span>

                      <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-700/50">
                        <span className="text-[0.65rem] font-bold text-zinc-500 block mb-2 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-500 shrink-0" /> Tecnologías & Disciplinas Destacadas:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(selectedTrabajadorModal.especialidad || 'Desarrollo de Software')
                            .replace(/\[|\]/g, '')
                            .split(/[,•]/)
                            .map(item => item.trim())
                            .filter(item => item.length > 0)
                            .map((tech, idx) => (
                              <motion.span
                                key={idx}
                                whileHover={{ scale: 1.06, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                className="px-3 py-1.5 rounded-xl text-[0.68rem] font-extrabold bg-white dark:bg-zinc-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs cursor-default select-none transition-colors hover:border-blue-400"
                              >
                                {tech}
                              </motion.span>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Estado Lógico & Primer Login */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                        <span className="text-[0.62rem] font-extrabold uppercase text-zinc-400 block font-mono">Estado en Plataforma:</span>
                        <span className={`font-extrabold text-xs mt-1 inline-flex items-center gap-2 ${selectedTrabajadorModal.estado ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${selectedTrabajadorModal.estado ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          {selectedTrabajadorModal.estado ? 'HABILITADO' : 'INHABILITADO'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                        <span className="text-[0.62rem] font-extrabold uppercase text-zinc-400 block font-mono">Primer Login:</span>
                        <span className={`font-extrabold text-xs mt-1 inline-flex items-center gap-2 ${(selectedTrabajadorModal.primerLogin === false || selectedTrabajadorModal.primerLoginRealizado === true) ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${(selectedTrabajadorModal.primerLogin === false || selectedTrabajadorModal.primerLoginRealizado === true) ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          {(selectedTrabajadorModal.primerLogin === false || selectedTrabajadorModal.primerLoginRealizado === true) ? 'Sí (Validado)' : 'Pendiente primera sesión'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel Derecho: Subpanel Lateral de Carga Horaria, Tareas & Proyectos (7 de 12 columnas) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-8 pt-6 lg:pt-0 lg:col-span-7"
                >
                  {/* Encabezado del Subpanel */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <Clock size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          Carga Horaria Semanal & Distribución por Tareas
                        </h4>
                        <p className="text-[0.68rem] text-zinc-500 font-medium">Control de jornada de 48h semanales y tareas asignadas</p>
                      </div>
                    </div>
                    <span className="text-[0.68rem] font-black px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {devTaskMetrics.horasLibres} / 48h &bull; DISPONIBLE
                    </span>
                  </div>

                  {/* Tarjetas de Métricas de Carga Horaria (Semana 48h) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                      <span className="text-[0.6rem] font-extrabold uppercase text-zinc-400 block font-mono">Horas Activas</span>
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 mt-1 block">
                        {devTaskMetrics.horasActivas}h <span className="text-[0.65rem] text-zinc-400 font-medium">/ 48h</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                      <span className="text-[0.6rem] font-extrabold uppercase text-blue-600 dark:text-blue-400 block font-mono">En Progreso</span>
                      <span className="font-extrabold text-sm text-blue-700 dark:text-blue-300 mt-1 block">
                        {devTaskMetrics.horasProgreso}h
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <span className="text-[0.6rem] font-extrabold uppercase text-amber-600 dark:text-amber-400 block font-mono">Pendientes</span>
                      <span className="font-extrabold text-sm text-amber-700 dark:text-amber-300 mt-1 block">
                        {devTaskMetrics.horasPendientes}h
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                      <span className="text-[0.6rem] font-extrabold uppercase text-purple-600 dark:text-purple-400 block font-mono">Reserva Libre</span>
                      <span className="font-extrabold text-sm text-purple-700 dark:text-purple-300 mt-1 block">
                        {devTaskMetrics.horasLibres}h
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 col-span-2 sm:col-span-1">
                      <span className="text-[0.6rem] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 block font-mono">Completadas</span>
                      <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300 mt-1 block">
                        {devTaskMetrics.horasCompletadas}h
                      </span>
                    </div>
                  </div>

                  {/* Barra Proporcional de Jornada Horaria (48h Totales) */}
                  <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[0.68rem] font-bold text-zinc-500 flex-wrap gap-1">
                      <span>Desglose Proporcional en Barra de Jornada (48h Totales):</span>
                      <span className="font-mono">{devTaskMetrics.horasActivas}h Ocupadas / {devTaskMetrics.horasLibres}h Disponibles Libres</span>
                    </div>

                    <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex shadow-inner">
                      {devTaskMetrics.horasProgreso > 0 && (
                        <div
                          style={{ width: `${(devTaskMetrics.horasProgreso / 48) * 100}%` }}
                          className="bg-blue-500 h-full"
                          title={`En Progreso: ${devTaskMetrics.horasProgreso}h`}
                        />
                      )}
                      {devTaskMetrics.horasPendientes > 0 && (
                        <div
                          style={{ width: `${(devTaskMetrics.horasPendientes / 48) * 100}%` }}
                          className="bg-amber-400 h-full"
                          title={`Pendientes: ${devTaskMetrics.horasPendientes}h`}
                        />
                      )}
                      {devTaskMetrics.horasCompletadas > 0 && (
                        <div
                          style={{ width: `${(devTaskMetrics.horasCompletadas / 48) * 100}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Completadas: ${devTaskMetrics.horasCompletadas}h`}
                        />
                      )}
                      {devTaskMetrics.horasLibres > 0 && (
                        <div
                          style={{ width: `${(devTaskMetrics.horasLibres / 48) * 100}%` }}
                          className="bg-purple-400/60 h-full"
                          title={`Reserva Libre: ${devTaskMetrics.horasLibres}h`}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-[0.64rem] font-bold pt-1">
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> En Progreso: {devTaskMetrics.horasProgreso}h
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Pendientes: {devTaskMetrics.horasPendientes}h
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                        <span className="w-2 h-2 rounded-full bg-purple-400" /> Reserva Libre: {devTaskMetrics.horasLibres}h
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completadas: {devTaskMetrics.horasCompletadas}h
                      </span>
                    </div>
                  </div>

                  {/* Filtros Internos de Tareas & Buscador */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Buscar por tarea, etapa o proyecto..."
                        value={busquedaTareaDevModal}
                        onChange={(e) => setBusquedaTareaDevModal(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
                      {['TODAS', 'EN_PROGRESO', 'PENDIENTE', 'COMPLETADA'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFiltroEstadoTareaDevModal(st)}
                          className={`px-2.5 py-1 rounded-lg text-[0.64rem] font-extrabold transition-all cursor-pointer ${
                            filtroEstadoTareaDevModal === st
                              ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          {st === 'TODAS' ? 'Todas' : st === 'EN_PROGRESO' ? 'En Progreso' : st === 'PENDIENTE' ? 'Pendientes' : 'Completadas'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista Desplazable de Tareas & Proyectos Asignados */}
                  {tareasFiltradasDevModal.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-700 space-y-2 text-xs text-zinc-500">
                      <FolderGit2 size={32} className="mx-auto text-zinc-400" />
                      <p className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">Sin tareas asociadas bajo estos filtros.</p>
                      <p className="text-xs">No se encontraron actividades WBS vinculadas a este desarrollador.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[46dvh] overflow-y-auto pr-2 py-1">
                      {tareasFiltradasDevModal.map((t, idx) => (
                        <motion.div
                          key={t.idActividad || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/90 shadow-2xs space-y-2.5 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[0.68rem] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                              {t.proyectoNombre}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-black uppercase ${
                              t.estadoNorm === 'EN_PROGRESO'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                : t.estadoNorm === 'COMPLETADA'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {t.estadoNorm.replace('_', ' ')}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm">
                              {t.nombre}
                            </h5>
                            {t.etapaNombre && (
                              <p className="text-[0.68rem] text-zinc-500 font-medium">Fase WBS: {t.etapaNombre}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                            <span className="font-mono font-bold text-zinc-600 dark:text-zinc-400">
                              Horas Asignadas: <strong>{t.horas}h</strong>
                            </span>

                            <motion.button
                              whileHover={{ scale: 1.03, x: 2 }}
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => handleIrATareaProyectoDesdeTrabajador(t.proyectoId, t.etapaId, t.idActividad, t.nombre, selectedTrabajadorModal)}
                              className="gradient-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 text-white cursor-pointer shadow-2xs rounded-xl"
                            >
                              <span>Ir al Proyecto & Subrayar</span>
                              <ArrowRight size={14} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Footer con Botón de Cerrar holgado */}
              <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTrabajadorModal(null)}
                  className="outline-button px-6 py-2.5 text-xs font-bold cursor-pointer rounded-2xl"
                >
                  Cerrar Ficha
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Historial Acumulado de Cambios por la Coordinación */}
      <AnimatePresence>
        {showHistorialModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 max-h-[85dvh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Registro de Cambios del Proyecto
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Registro completo de auditoría acumulado con marca de tiempo e identificación del responsable
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistorialModal(false)}
                  className="outline-button text-xs py-1.5 px-3.5 font-bold rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              {/* Barra de Búsqueda y Filtros Avanzados */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 shrink-0">
                <div className="flex flex-col sm:flex-row gap-2.5 items-center">
                  {/* Campo de Búsqueda de Texto */}
                  <div className="relative flex-1 w-full">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      value={busquedaHistorialCoord}
                      onChange={(e) => setBusquedaHistorialCoord(e.target.value)}
                      placeholder="Buscar por detalle, acción, responsable o correo..."
                      className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                    />
                    {busquedaHistorialCoord && (
                      <button
                        type="button"
                        onClick={() => setBusquedaHistorialCoord('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filtro por Tipo de Acción */}
                  <div className="w-full sm:w-48">
                    <CustomSelect
                      value={filtroAccionHistorialCoord}
                      onChange={(val) => setFiltroAccionHistorialCoord(val)}
                      options={[
                        { value: 'TODOS', label: 'Todas las acciones' },
                        { value: 'ETAPA', label: 'Fases / Etapas' },
                        { value: 'ACTIVIDAD', label: 'Tareas / Actividades' },
                        { value: 'NOMINA', label: 'Desarrolladores' },
                        { value: 'ESTADO', label: 'Cambios de Estado' }
                      ]}
                      maxWidth="w-full"
                      icon={Filter}
                    />
                  </div>

                  {/* Filtro por Fecha */}
                  <div className="w-full sm:w-44">
                    <CustomSelect
                      value={filtroFechaHistorialCoord}
                      onChange={(val) => setFiltroFechaHistorialCoord(val)}
                      options={[
                        { value: 'TODOS', label: 'Cualquier fecha' },
                        { value: 'HOY', label: 'Hoy' },
                        { value: '7DIAS', label: 'Últimos 7 días' },
                        { value: '30DIAS', label: 'Último mes' }
                      ]}
                      maxWidth="w-full"
                      icon={Calendar}
                    />
                  </div>
                </div>

                {/* Contador de Resultados y Botón de Limpieza */}
                <div className="flex items-center justify-between text-[0.68rem] text-zinc-500 font-semibold pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <span>
                    Mostrando <strong className="text-purple-600 dark:text-purple-400">{historialFiltradoCoord.length}</strong> de <strong className="text-zinc-700 dark:text-zinc-300">{historialCambiosModal.length}</strong> registros
                  </span>
                  {(busquedaHistorialCoord || filtroAccionHistorialCoord !== 'TODOS' || filtroFechaHistorialCoord !== 'TODOS') && (
                    <button
                      type="button"
                      onClick={() => { setBusquedaHistorialCoord(''); setFiltroAccionHistorialCoord('TODOS'); setFiltroFechaHistorialCoord('TODOS'); }}
                      className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={11} /> Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3.5 pr-1 custom-scrollbar">
                {loadingHistorial ? (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
                    Cargando historial de auditoría...
                  </div>
                ) : historialFiltradoCoord.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs space-y-1">
                    <ShieldCheck size={28} className="mx-auto text-zinc-300" />
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">
                      {historialCambiosModal.length === 0 ? 'Sin registros de cambios en este proyecto' : 'No hay coincidencias con los filtros'}
                    </p>
                    <p>
                      {historialCambiosModal.length === 0
                        ? 'No se han registrado modificaciones o cambios previos en este proyecto.'
                        : 'Ajuste el término de búsqueda o seleccione otro rango de fechas o tipo de acción.'}
                    </p>
                  </div>
                ) : (
                  historialFiltradoCoord.map((reg, idx) => {
                    const accionFormateada = reg.accion
                      ? reg.accion
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/\b\w/g, c => c.toUpperCase())
                      : 'Modificación del Proyecto';

                    return (
                      <div key={reg.idHistorial || idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2.5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-sans text-[0.68rem] font-black uppercase tracking-wide px-3 py-1 rounded-xl bg-purple-100 text-purple-900 dark:bg-purple-950/90 dark:text-purple-200 border border-purple-200 dark:border-purple-800 inline-flex items-center gap-1.5 shadow-2xs">
                            <ShieldCheck size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>{accionFormateada}</span>
                          </span>
                          <span className="text-[0.65rem] font-mono text-zinc-500 font-bold flex items-center gap-1.5">
                            <Clock size={12} className="text-purple-500 shrink-0" />
                            {new Date(reg.fechaCambio).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed pl-1">
                          {reg.detalles}
                        </p>
                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[0.68rem] text-zinc-500 font-medium gap-2">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-purple-600 shrink-0" />
                            <span>Responsable: <strong className="text-zinc-900 dark:text-zinc-100">{reg.nombreCoordinador || 'Ana Ríos'}</strong> ({reg.emailCoordinador || 'ana.coordinador@ikernell.org'})</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[0.6rem] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {reg.rolResponsable || 'Coordinación Directiva'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Registrar Nueva Etapa WBS (Modo Edición Coordinador) */}
      <AnimatePresence>
        {showNuevaEtapaModalCoord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Layers size={20} className="text-blue-600" />
                  <span>Registrar Nueva Etapa WBS</span>
                </h3>
              </div>

              <form onSubmit={handleRegistrarEtapaCoord} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombre de la Fase / Etapa *</label>
                  <input
                    type="text"
                    required
                    value={nuevaEtapaCoord.nombreEtapa}
                    onChange={(e) => setNuevaEtapaCoord({ ...nuevaEtapaCoord, nombreEtapa: e.target.value })}
                    placeholder="Ej. Fase 1: Especificación y Arquitectura N-Capas"
                    className="input-field py-2.5 font-bold"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[0.7rem] text-blue-800 dark:text-blue-200">
                  <strong>Auditoría Directiva:</strong> La creación de esta etapa se registrará con la marca temporal del Coordinador.
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setShowNuevaEtapaModalCoord(false)} className="outline-button px-4 py-2 text-xs font-bold rounded-2xl">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submittingEtapaCoord} className="gradient-button px-5 py-2 text-xs font-bold rounded-2xl">
                    {submittingEtapaCoord ? 'Guardando...' : 'Crear Etapa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Asignar Actividad a Desarrollador (Versión Ampliada, Buscable y con Sugerencias) */}
      <AnimatePresence>
        {showNuevaActividadModalCoord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 my-6"
            >
              {/* Encabezado Principal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Asignar Actividad a Desarrollador
                    </h3>
                    <p className="text-zinc-500 text-xs font-medium mt-0.5">
                      Vincule una nueva tarea operativa a una fase WBS y defina el desarrollador responsable.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegistrarActividadCoord} className="space-y-5 text-xs">
                {/* 1. Descripción / Nombre de la Tarea */}
                <div className="space-y-2">
                  <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
                    1. Descripción / Nombre de la Tarea *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaActividadCoord.nombreActividad}
                    onChange={(e) => setNuevaActividadCoord({ ...nuevaActividadCoord, nombreActividad: e.target.value })}
                    placeholder="Ej. Documentar contratos OpenAPI 3.0 para la API pública"
                    className="input-field py-3 text-xs font-semibold w-full"
                  />
                  {/* Sugerencias Rápidas de Tarea */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[0.62rem] font-extrabold text-zinc-400 uppercase tracking-wider">Sugerencias rápidas:</span>
                    {[
                      'Documentación OpenAPI 3.0',
                      'Pruebas Unitarias JUnit & Mockito',
                      'Integración API REST',
                      'Optimización de Consultas SQL',
                      'Refactorización Módulo Backend',
                      'Diseño e Implementación UI React'
                    ].map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNuevaActividadCoord({ ...nuevaActividadCoord, nombreActividad: sug })}
                        className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-300 text-zinc-600 dark:text-zinc-300 text-[0.65rem] font-bold border border-zinc-200/80 dark:border-zinc-700/80 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={11} className="text-blue-500" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Seleccionar Fase / Etapa WBS */}
                <div className="space-y-2">
                  <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
                    2. Seleccionar Fase / Etapa WBS *
                  </label>
                  <CustomSelect
                    value={nuevaActividadCoord.idEtapa}
                    onChange={(val) => setNuevaActividadCoord({ ...nuevaActividadCoord, idEtapa: val })}
                    options={[
                      { value: '', label: '— Seleccionar Etapa WBS —' },
                      ...(proyectoEtapasModal || []).map((et) => {
                        const isFin = (et.estado || '').toUpperCase() === 'FINALIZADA' || (et.estado || '').toUpperCase() === 'COMPLETADO';
                        return {
                          value: String(et.idEtapa),
                          label: `Fase #${et.idEtapa}: ${et.nombreEtapa}`,
                          subtitle: isFin
                            ? '[ ATENCIÓN ] Etapa Finalizada (Se reabrirá a EN_PROCESO al asignar)'
                            : `Estado: ${et.estado || 'PENDIENTE'} • ${et.actividades ? et.actividades.length : 0} tareas vinculadas`
                        };
                      })
                    ]}
                    maxWidth="w-full"
                    searchable={true}
                    icon={Layers}
                    placeholder="— Seleccionar Etapa WBS —"
                  />

                  {/* Indicador Informativo si la Etapa Seleccionada está FINALIZADA */}
                  {(() => {
                    const selectedEt = (proyectoEtapasModal || []).find(et => String(et.idEtapa) === String(nuevaActividadCoord.idEtapa));
                    const isFin = selectedEt && ((selectedEt.estado || '').toUpperCase() === 'FINALIZADA' || (selectedEt.estado || '').toUpperCase() === 'COMPLETADO');
                    if (!isFin) return null;
                    return (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-2 text-[0.72rem] font-semibold animate-fadeIn">
                        <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                        <span>
                          <strong>Atención:</strong> La fase <strong>&quot;{selectedEt.nombreEtapa}&quot;</strong> está finalizada. Al asignar la tarea, la fase se reabrirá automáticamente a <strong>EN_PROCESO</strong> y se guardará en auditoría.
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. Desarrollador Asignado */}
                <div className="space-y-2">
                  <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
                    3. Desarrollador Asignado Responsable *
                  </label>
                  <CustomSelect
                    value={nuevaActividadCoord.idDesarrollador}
                    onChange={(val) => setNuevaActividadCoord({ ...nuevaActividadCoord, idDesarrollador: val })}
                    options={[
                      { value: '', label: '— Seleccionar Desarrollador —' },
                      ...(trabajadores || [])
                        .filter(t => t.estado && (t.rol || '').toUpperCase().includes('DESARROLLADOR'))
                        .map(dev => ({
                          value: String(dev?.idTrabajador),
                          label: `${dev?.nombre} ${dev?.apellido}`,
                          subtitle: `${dev?.profesion || dev?.especialidad || 'Desarrollador'} • ${dev?.email || ''}`
                        }))
                    ]}
                    maxWidth="w-full"
                    searchable={true}
                    icon={User}
                    placeholder="— Seleccionar Desarrollador —"
                  />
                </div>

                {/* Pie del Formulario con Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowNuevaActividadModalCoord(false)}
                    className="px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingActividadCoord || !nuevaActividadCoord.nombreActividad.trim() || !nuevaActividadCoord.idEtapa || !nuevaActividadCoord.idDesarrollador}
                    className="gradient-button px-6 py-2.5 text-xs font-extrabold rounded-2xl inline-flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {submittingActividadCoord ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Asignando Actividad...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Asignar Actividad al Desarrollador</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Etapa WBS */}
      <AnimatePresence>
        {showEditarEtapaModalCoord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Edit3 size={20} className="text-blue-600" />
                  <span>Editar Etapa WBS</span>
                </h3>
              </div>

              <form onSubmit={handleActualizarEtapaCoord} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombre de la Fase / Etapa *</label>
                  <input
                    type="text"
                    required
                    value={etapaAEditarCoord.nombreEtapa}
                    onChange={(e) => setEtapaAEditarCoord({ ...etapaAEditarCoord, nombreEtapa: e.target.value })}
                    className="input-field py-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block mb-1">Estado de la Etapa</label>
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <span className="font-extrabold text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                      {etapaAEditarCoord.estado || 'PENDIENTE'}
                    </span>
                    <span className="text-[0.68rem] text-zinc-400 font-medium italic">
                      (Administrado automáticamente por el sistema)
                    </span>
                  </div>
                  <p className="text-[0.65rem] text-zinc-400 font-medium mt-1">
                    El estado cambia a EN_PROCESO cuando hay tareas en progreso y a FINALIZADA al presionar &quot;Finalizar Etapa&quot;.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setShowEditarEtapaModalCoord(false)} className="outline-button px-4 py-2 text-xs font-bold rounded-2xl">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submittingEditarEtapaCoord} className="gradient-button px-5 py-2 text-xs font-bold rounded-2xl">
                    {submittingEditarEtapaCoord ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Emergente Interactivo: Confirmar Finalización de Etapa WBS */}
      <AnimatePresence>
        {etapaAFinalizarModalCoord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    Confirmar Finalización de Etapa
                  </h3>
                  <span className="text-[0.68rem] text-zinc-400 font-bold uppercase tracking-wider">
                    Cierre Formal de Fase #{etapaAFinalizarModalCoord.idEtapa}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 space-y-2 text-xs">
                <p className="text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                  ¿Está seguro de finalizar formalmente la etapa <strong className="text-zinc-900 dark:text-zinc-100">&quot;{etapaAFinalizarModalCoord.nombreEtapa}&quot;</strong>?
                </p>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 text-[0.7rem] text-zinc-500 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 size={13} /> Todas las tareas internas han sido completadas por los desarrolladores.
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <ShieldCheck size={13} className="text-blue-500" /> Esta acción quedará registrada en la auditoría oficial del proyecto.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEtapaAFinalizarModalCoord(null)}
                  className="px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={ejecutarFinalizarEtapaCoord}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  <span>Sí, Finalizar Etapa</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Emergente Interactivo: Confirmar Reapertura de Etapa WBS */}
      <AnimatePresence>
        {etapaAReabrirModalCoord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                  <AlertTriangle size={26} />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    Confirmar Reapertura de Etapa
                  </h3>
                  <span className="text-[0.68rem] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                    Asignación en Etapa Concluida
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
                <p className="text-amber-950 dark:text-amber-200 font-extrabold">
                  La etapa &quot;{etapaAReabrirModalCoord.etapaNombre}&quot; se encuentra actualmente FINALIZADA.
                </p>
                <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 text-[0.7rem] text-amber-900 dark:text-amber-300 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">1.</span>
                    <span>La etapa se reabrirá automáticamente y su estado cambiará a <strong>EN_PROCESO</strong>.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">2.</span>
                    <span>Se asignará la tarea <strong>&quot;{etapaAReabrirModalCoord.nombreActividad}&quot;</strong> a {etapaAReabrirModalCoord.devNombre}.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">3.</span>
                    <span>Esta acción quedará registrada en el historial de auditoría del proyecto.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEtapaAReabrirModalCoord(null)}
                  className="px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={ejecutarReaperturaYAsignarCoord}
                  className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <RotateCcw size={16} />
                  <span>Sí, Reabrir y Asignar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Reasignar Actividad WBS con CustomSelect & Motivo Obligatorio */}
      <AnimatePresence>
        {showReasignarActividadModalCoord && actividadAReasignarCoord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <RotateCcw size={20} className="text-purple-600" />
                  <span>Reasignar Tarea a Desarrollador</span>
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Tarea a transferir:</div>
                <div className="text-zinc-600 dark:text-zinc-300 italic mb-2">
                  "{actividadAReasignarCoord.nombreActividad || actividadAReasignarCoord.descripcion}"
                </div>
                <div className="text-[0.7rem] text-zinc-500 font-semibold flex items-center gap-1.5">
                  <User size={12} className="text-blue-500" />
                  Responsable actual: {actividadAReasignarCoord.desarrollador ? `${actividadAReasignarCoord.desarrollador.nombre} ${actividadAReasignarCoord.desarrollador.apellido}` : 'Sin Asignar'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-[0.7rem] text-blue-800 dark:text-blue-300 leading-relaxed flex items-start gap-2">
                <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Trazabilidad Histórica:</strong> Esta reasignación registrará un cambio en la plataforma indicando el nuevo desarrollador responsable, el motivo directivo y la estampa de tiempo actual.
                </div>
              </div>

              <form onSubmit={handleEjecutarReasignacionActividadCoord} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nuevo Desarrollador Responsable *</label>
                  <CustomSelect
                    value={targetDevIdReasignarCoord}
                    onChange={(val) => setTargetDevIdReasignarCoord(val)}
                    options={[
                      { value: '', label: '— Seleccione nuevo desarrollador —' },
                      ...(trabajadores || [])
                        .filter(t => t.estado && (t.rol || '').toUpperCase().includes('DESARROLLADOR'))
                        .map(dev => ({
                          value: String(dev?.idTrabajador),
                          label: `${dev?.nombre} ${dev?.apellido}`,
                          subtitle: dev?.profesion || dev?.especialidad || 'Desarrollador'
                        }))
                    ]}
                    maxWidth="w-full"
                    searchable={true}
                    icon={User}
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Motivo o Justificación de la Reasignación *</label>
                  <textarea
                    rows={2}
                    required
                    value={motivoReasignarCoord}
                    onChange={(e) => setMotivoReasignarCoord(e.target.value)}
                    placeholder="Motivo o justificación técnica obligatoria de la reasignación"
                    className="input-field py-2"
                  />
                </div>

                <div className="text-[0.65rem] text-zinc-400 font-medium font-mono">
                  Fecha de trazabilidad: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setShowReasignarActividadModalCoord(false)} className="outline-button px-4 py-2 text-xs font-bold rounded-2xl cursor-pointer">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submittingReasignarActividadCoord} className="gradient-button px-5 py-2 text-xs font-bold rounded-2xl cursor-pointer">
                    {submittingReasignarActividadCoord ? 'Reasignando...' : 'Confirmar Reasignación'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Modal: Generador de Reportes PDF Configurable del Coordinador */}
        {showGenerarReportePdfModalCoord && selectedProyectoModal && (() => {
          const seccionesActivas = [
            pdfConfigCoord.incluirPausas,
            pdfConfigCoord.incluirAuditoriaCoordinador,
            pdfConfigCoord.incluirWbs,
            pdfConfigCoord.incluirEquipo,
            pdfConfigCoord.modoSensible,
            pdfConfigCoord.incluirMetricasKpi,
            pdfConfigCoord.incluirMatrizRiesgos,
            pdfConfigCoord.incluirFirmaDirectiva
          ].filter(Boolean).length;

          return (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl space-y-6 max-h-[92dvh] overflow-y-auto"
              >
                {/* Header del Modal sin botón X */}
                <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>Configuración Avanzada de Reporte PDF & Auditoría</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        Selecciona un perfil predeterminado o personaliza los 8 módulos e información confidencial a incluir
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarjeta Informativa del Proyecto Seleccionado */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/70 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/80 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.68rem] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                        PRJ-00{selectedProyectoModal.idProyecto}
                      </span>
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        {selectedProyectoModal.nombre}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                      Cliente: <strong>{selectedProyectoModal.cliente || 'Interno'}</strong> • Líder: <strong>{selectedProyectoModal.lider ? `${selectedProyectoModal.lider.nombre} ${selectedProyectoModal.lider.apellido}` : 'Carlos Mendoza'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${selectedProyectoModal.estado === 'EN_PAUSA'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                      {selectedProyectoModal.estado === 'EN_PAUSA' ? <Pause size={13} /> : <CheckCircle2 size={13} />}
                      {selectedProyectoModal.estado || 'ACTIVO'}
                    </span>
                  </div>
                </div>

                {/* Disposición en 2 Columnas de Configuración */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
                  {/* Columna Izquierda: Perfil (5 cols) */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[0.7rem]">
                        1. Perfil del Documento PDF *
                      </label>
                      <span className="text-[0.62rem] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        Configuración Dinámica
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Perfil 1: Resumido */}
                      <button
                        type="button"
                        onClick={() => seleccionarPerfilPdfCoord('RESUMIDO')}
                        className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${pdfConfigCoord.nivelDetalle === 'RESUMIDO'
                            ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <PieChart size={15} className={pdfConfigCoord.nivelDetalle === 'RESUMIDO' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                              Reporte Resumido (Ejecutivo)
                            </span>
                          </div>
                          {pdfConfigCoord.nivelDetalle === 'RESUMIDO' && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                        </div>
                        <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 leading-relaxed pl-5">
                          Visión estratégica de alto nivel con presupuesto, WBS y métricas de salud operativa.
                        </p>
                        <div className="mt-2 pl-5 flex items-center gap-1.5">
                          <span className="text-[0.6rem] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            3 Secciones
                          </span>
                        </div>
                      </button>

                      {/* Perfil 2: Operativo (Estándar) */}
                      <button
                        type="button"
                        onClick={() => seleccionarPerfilPdfCoord('DETALLADO')}
                        className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${pdfConfigCoord.nivelDetalle === 'DETALLADO'
                            ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Activity size={15} className={pdfConfigCoord.nivelDetalle === 'DETALLADO' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                              Reporte Operativo (Estándar)
                            </span>
                          </div>
                          {pdfConfigCoord.nivelDetalle === 'DETALLADO' && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                        </div>
                        <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 leading-relaxed pl-5">
                          WBS completo, pausas, nómina, finanzas, matriz de riesgos y firmas directivas.
                        </p>
                        <div className="mt-2 pl-5 flex items-center gap-1.5">
                          <span className="text-[0.6rem] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            7 Secciones
                          </span>
                        </div>
                      </button>

                      {/* Perfil 3: Audit-Ready Completo */}
                      <button
                        type="button"
                        onClick={() => seleccionarPerfilPdfCoord('AUDITORIA_COMPLETA')}
                        className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${pdfConfigCoord.nivelDetalle === 'AUDITORIA_COMPLETA'
                            ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={15} className={pdfConfigCoord.nivelDetalle === 'AUDITORIA_COMPLETA' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                              Consolidado Audit-Ready (Completo)
                            </span>
                          </div>
                          {pdfConfigCoord.nivelDetalle === 'AUDITORIA_COMPLETA' && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                        </div>
                        <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 leading-relaxed pl-5">
                          Audit trail completo del coordinador, pausas, WBS, equipo, finanzas, KPIs, riesgos y firmas.
                        </p>
                        <div className="mt-2 pl-5 flex items-center gap-1.5">
                          <span className="text-[0.6rem] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            8 Secciones Totales
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Columna Derecha: Opciones a Incluir (7 cols) */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[0.7rem]">
                        2. Secciones e Información a Imprimir *
                      </label>

                      {/* Botones de Selección Rápida */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPdfConfigCoord({
                            ...pdfConfigCoord,
                            incluirPausas: true,
                            incluirAuditoriaCoordinador: true,
                            incluirWbs: true,
                            incluirEquipo: true,
                            modoSensible: true,
                            incluirMetricasKpi: true,
                            incluirMatrizRiesgos: true,
                            incluirFirmaDirectiva: true
                          })}
                          className="text-[0.62rem] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Marcar Todas
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <button
                          type="button"
                          onClick={() => setPdfConfigCoord({
                            ...pdfConfigCoord,
                            incluirPausas: false,
                            incluirAuditoriaCoordinador: false,
                            incluirWbs: false,
                            incluirEquipo: false,
                            modoSensible: false,
                            incluirMetricasKpi: false,
                            incluirMatrizRiesgos: false,
                            incluirFirmaDirectiva: false
                          })}
                          className="text-[0.62rem] font-bold text-zinc-400 hover:underline cursor-pointer"
                        >
                          Desmarcar Todas
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                      {/* Opción 1: Pausas */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.incluirPausas
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.incluirPausas}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, incluirPausas: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Pause size={14} className={pdfConfigCoord.incluirPausas ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Trazabilidad de Pausas y Suspensión de Producción
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Fechas de inicio/fin de pausa, duración acumulada y postergación de fecha de entrega.
                          </span>
                        </div>
                      </label>

                      {/* Opción 2: Gestiones del Coordinador */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.incluirAuditoriaCoordinador
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.incluirAuditoriaCoordinador}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, incluirAuditoriaCoordinador: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className={pdfConfigCoord.incluirAuditoriaCoordinador ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Historial de Gestiones y Auditoría del Coordinador
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Registro de modificaciones directivas de presupuesto, plazos y supervisión acumulada.
                          </span>
                        </div>
                      </label>

                      {/* Opción 3: Estructura WBS */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.incluirWbs
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.incluirWbs}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, incluirWbs: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Layers size={14} className={pdfConfigCoord.incluirWbs ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Estructura WBS, Fases y Actividades del Proyecto
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Desglose por etapas, actividades técnicas, desarrolladores y % de avance.
                          </span>
                        </div>
                      </label>

                      {/* Opción 4: Equipo */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.incluirEquipo
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.incluirEquipo}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, incluirEquipo: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Users size={14} className={pdfConfigCoord.incluirEquipo ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Nómina de Desarrolladores y Control de Jornada (48h)
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Lista de desarrolladores vinculados, especialidades y dedicación de jornada.
                          </span>
                        </div>
                      </label>

                      {/* Opción 5: Finanzas */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.modoSensible
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.modoSensible}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, modoSensible: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className={pdfConfigCoord.modoSensible ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Información Financiera Sensible (Presupuesto USD)
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Presupuesto financiero confidencial asignado y métricas de costo.
                          </span>
                        </div>
                      </label>

                      {/* Opción 6: KPIs */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.incluirMetricasKpi
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.incluirMetricasKpi}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, incluirMetricasKpi: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Activity size={14} className={pdfConfigCoord.incluirMetricasKpi ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Métricas de Salud Operativa, KPIs & Carga Laboral
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Estatus de salud del proyecto (Semáforo), % de avance global y métrica de cumplimiento de 48h.
                          </span>
                        </div>
                      </label>

                      {/* Opción 7: Riesgos */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.incluirMatrizRiesgos
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.incluirMatrizRiesgos}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, incluirMatrizRiesgos: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <ShieldAlert size={14} className={pdfConfigCoord.incluirMatrizRiesgos ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Matriz de Riesgos y Evaluación de Contingencias
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Evaluación de riesgos operativos, alertas de postergación y planes de mitigación.
                          </span>
                        </div>
                      </label>

                      {/* Opción 8: Firmas */}
                      <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfigCoord.incluirFirmaDirectiva
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}>
                        <input
                          type="checkbox"
                          checked={pdfConfigCoord.incluirFirmaDirectiva}
                          onChange={(e) => setPdfConfigCoord({ ...pdfConfigCoord, incluirFirmaDirectiva: e.target.checked })}
                          className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <FileCheck size={14} className={pdfConfigCoord.incluirFirmaDirectiva ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                              Bloque Oficial de Firmas, Conformidad y Validación
                            </span>
                          </div>
                          <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                            Sección formal para firmas manuscritas/digitales de Líder, Coordinación y Cliente/Auditor.
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Resumen de Secciones Seleccionadas */}
                    <div className="pt-2 flex items-center justify-between text-[0.68rem] text-zinc-500 dark:text-zinc-400">
                      <span>Secciones habilitadas: <strong className="text-blue-600 dark:text-blue-400">{seccionesActivas} de 8</strong></span>
                      <span className="font-mono text-[0.62rem] text-zinc-400">Formato: PDF Document (A4)</span>
                    </div>
                  </div>
                </div>

                {/* Acciones del Modal */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-[0.68rem] text-zinc-400 font-medium">
                    * Los módulos excluidos no aparecerán impresos en el documento generado.
                  </span>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setShowGenerarReportePdfModalCoord(false)}
                      className="outline-button text-xs py-2.5 px-4 font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      type="button"
                      onClick={handleGenerarReportePdfCoord}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="gradient-button text-xs py-2.5 px-6 font-bold cursor-pointer inline-flex items-center gap-2 shadow-md hover:shadow-blue-500/20"
                    >
                      <Download size={16} />
                      <span>Descargar Reporte PDF Audit-Ready</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* Modal: Doble Confirmación & Auditoría WBS de Finalización del Proyecto (Coordinador) */}
        {showConfirmFinalizarCoord && selectedProyectoModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90dvh] overflow-y-auto my-auto relative text-left"
            >
              {/* Cabecera Principal Ampliada */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5 pr-8">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 ring-4 ring-red-500/10">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Confirmar Cierre & Finalización del Proyecto
                      </h3>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                        Acción Irreversible
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-blue-500 shrink-0" />
                      <span>Proyecto:</span>
                      <strong className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">[PRJ-00{selectedProyectoModal?.idProyecto}]</strong>
                      <span className="truncate max-w-md">{selectedProyectoModal?.nombre}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cuerpo Organizado en 2 Columnas */}
              {evidenciaWbsFinalizacionCoord.esProyectoVacio ? (
                /* CASO A: PROYECTO VACÍO (0 ETAPAS / 0 TAREAS WBS) - REGISTRO OBLIGATORIO DE AUDITORÍA */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
                        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>CIERRE PREMATURO: PROYECTO SIN ESTRUCTURA NI AVANCES WBS</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[0.68rem] font-bold font-mono">
                        0 Etapas | 0 Actividades
                      </span>
                    </div>

                    <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                      Este proyecto no contiene fases ni tareas WBS registradas. No se puede catalogar como <strong>"Culminación Exitosa"</strong> dado que no tuvo ejecución técnica real. Para proceder con su clausura o cancelación, es obligatorio justificar la causa del cierre en la trazabilidad de auditoría directiva.
                    </p>
                  </div>

                  {/* Formulario de Justificación de Cierre Prematuro */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      <FileText size={15} className="text-blue-500 shrink-0" />
                      <span>REGISTRO OBLIGATORIO DE AUDITORÍA DE CIERRE PREMATURO</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Motivo de Cancelación */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Motivo Principal de Cierre:
                        </label>
                        <CustomSelect
                          value={motivoCancelacionCoord}
                          onChange={(val) => setMotivoCancelacionCoord(val)}
                          options={[
                            { value: 'CANCELACION_CLIENTE', label: '1. Cancelación o desestimación por el cliente' },
                            { value: 'REESTRUCTURACION_PROYECTO', label: '2. Reestructurado o migrado a otro código de proyecto' },
                            { value: 'RECHAZO_PRESUPUESTO', label: '3. Insuficiencia presupuestaria o de recursos' },
                            { value: 'INVIABILIDAD_TECNICA', label: '4. Inviabilidad técnica o cambio de alcance' },
                            { value: 'OTRO_MOTIVO', label: '5. Otro motivo (especificar en la justificación)' }
                          ]}
                          maxWidth="w-full"
                        />
                      </div>

                      {/* Explicación / Justificación */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          <span>Justificación Detallada (Mínimo 10 caracteres): *</span>
                          <span className={`text-[0.68rem] font-mono ${justificacionCancelacionCoord.trim().length >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-amber-600 font-bold'}`}>
                            {justificacionCancelacionCoord.trim().length} / 10 caracteres min.
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          value={justificacionCancelacionCoord}
                          onChange={(e) => {
                            setJustificacionCancelacionCoord(e.target.value);
                            if (cancelacionErrorCoord) setCancelacionErrorCoord('');
                          }}
                          placeholder="Ej: El proyecto se cierra prematuramente por decisión estratégica de la dirección comercial..."
                          className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-medium"
                        />
                        {cancelacionErrorCoord && (
                          <span className="text-[0.72rem] text-red-600 dark:text-red-400 font-bold block mt-1 flex items-center gap-1">
                            <AlertTriangle size={14} className="shrink-0" /> {cancelacionErrorCoord}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CASO B: PROYECTO CON FASES / WBS CONFIGURADO */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Columna Izquierda (7 cols): Estado de Auditoría WBS */}
                  <div className="lg:col-span-7 space-y-4">
                    {!evidenciaWbsFinalizacionCoord.todasCompletadas ? (
                      <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
                            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Alerta de Auditoría: Fases & Tareas Pendientes</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[0.68rem] font-bold font-mono">
                            {evidenciaWbsFinalizacionCoord.etapasIncompletas.length} Etapas | {evidenciaWbsFinalizacionCoord.actividadesIncompletas.length} Tareas
                          </span>
                        </div>

                        <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                          No es posible finalizar el proyecto porque aún existen elementos incompletos en la WBS. Para proceder con el cierre formal, es obligatorio que todas las etapas y tareas estén 100% completadas.
                        </p>

                        {/* Contenedor Adaptativo de Evidencia WBS */}
                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {(evidenciaWbsFinalizacionCoord?.etapasIncompletas || []).map(et => (
                            <div
                              key={et.idEtapa}
                              className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-amber-200/80 dark:border-amber-800/60 space-y-2 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                                  <Layers size={14} className="text-amber-500 shrink-0" />
                                  <span>Etapa: {et.nombreEtapa}</span>
                                </span>
                                <span className="text-[0.65rem] uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-200 dark:border-amber-800">
                                  {et.estado}
                                </span>
                              </div>

                              {et.actividadesIncompletas && et.actividadesIncompletas.length > 0 && (
                                <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-800/60 space-y-1 mt-1 text-[0.72rem]">
                                  {et.actividadesIncompletas.map(act => (
                                    <div key={act.idActividad} className="flex items-center justify-between text-zinc-700 dark:text-zinc-300 font-medium">
                                      <span className="truncate max-w-[240px] flex items-center gap-1">
                                        <Clock size={11} className="text-amber-500 shrink-0" />
                                        <span>{act.nombreActividad || act.descripcion}</span>
                                      </span>
                                      <span className="text-[0.62rem] font-mono text-zinc-500 font-semibold">{act.estado || 'PENDIENTE'}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 text-[0.68rem] text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-2">
                          <Info size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>Completa todas las etapas y actividades en el panel de WBS para desbloquear el botón de cierre.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-300 space-y-3 shadow-xs">
                        <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-xs text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={18} className="shrink-0" />
                          <span>VERIFICACIÓN WBS CUMPLIDA (100%)</span>
                        </div>
                        <p className="leading-relaxed font-medium">
                          Todas las etapas y actividades del cronograma WBS han sido marcadas como finalizadas satisfactoriamente. El proyecto cumple íntegramente con los requisitos de liberación formal.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha (5 cols): Consecuencias & Reglas de Gobernanza */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">
                        <Lock size={15} className="text-zinc-600 dark:text-zinc-400 shrink-0" />
                        <span>IMPACTO & CONSECUENCIAS DEL CIERRE:</span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                          <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold">
                            1
                          </div>
                          <div>
                            <strong className="block text-zinc-900 dark:text-zinc-100 font-bold text-[0.75rem]">Cambio de Estado a FINALIZADO</strong>
                            <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">El proyecto quedará oficialmente clausurado en el portal corporativo.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
                            2
                          </div>
                          <div>
                            <strong className="block text-zinc-900 dark:text-zinc-100 font-bold text-[0.75rem]">Congelamiento Total de WBS</strong>
                            <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">Toda la estructura de tareas y tiempos pasa a modo de lectura inmutable.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                            3
                          </div>
                          <div>
                            <strong className="block text-zinc-900 dark:text-zinc-100 font-bold text-[0.75rem]">Liberación en Predictor Burnout</strong>
                            <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">Se libera la carga horaria y dedicación asignada a todos los desarrolladores.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Pie del Modal con Botones de Acción */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowConfirmFinalizarCoord(false)}
                  disabled={submittingPausaFinalizarCoord}
                  className="w-full sm:w-auto outline-button text-xs py-2.5 px-5 font-bold cursor-pointer disabled:opacity-50 text-zinc-700 dark:text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEjecutarFinalizacionProyectoCoord}
                  disabled={
                    submittingPausaFinalizarCoord ||
                    (evidenciaWbsFinalizacionCoord.esProyectoVacio
                      ? justificacionCancelacionCoord.trim().length < 10
                      : !evidenciaWbsFinalizacionCoord.todasCompletadas)
                  }
                  title={
                    evidenciaWbsFinalizacionCoord.esProyectoVacio
                      ? (justificacionCancelacionCoord.trim().length < 10
                          ? 'Debe escribir una justificación de al menos 10 caracteres para habilitar el cierre'
                          : 'Confirmar Cierre Prematuro con Auditoría')
                      : (!evidenciaWbsFinalizacionCoord.todasCompletadas
                          ? 'Acción Bloqueada: Debe tener el 100% de la WBS completada'
                          : 'Confirmar Cierre Formal')
                  }
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs py-2.5 px-6 rounded-xl font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                  {submittingPausaFinalizarCoord ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Procesando Cierre...
                    </>
                  ) : (
                    <>
                      <Lock size={15} /> Confirmar Cierre Formal
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Confirmación Directiva de Impacto Operativo para Pausar Proyecto (Coordinador) */}
        {showConfirmPausarCoordModal && selectedProyectoModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90dvh] overflow-y-auto my-auto relative text-left"
            >
              {/* Cabecera Principal */}
              <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5 pr-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10">
                    <Pause size={24} className="fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Confirmar Pausa Directiva del Proyecto
                      </h3>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Impacto Operativo
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-blue-500 shrink-0" />
                      <span>Proyecto:</span>
                      <strong className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">[PRJ-00{selectedProyectoModal?.idProyecto}]</strong>
                      <span className="truncate max-w-md font-bold">{selectedProyectoModal?.nombre}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirmPausarCoordModal(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  title="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Advertencia Resumen de Cronograma y Tiempo de Entrega */}
              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[0.68rem] font-mono font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={15} className="text-amber-600 dark:text-amber-400" />
                    Impacto en Fecha de Entrega y Cronograma Pactado
                  </span>
                  <span className="text-[0.68rem] font-mono font-black px-2.5 py-0.5 rounded-lg bg-amber-200/80 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    {calculoDiasPausaCoord.diasRestantes > 0 ? `Faltan ${calculoDiasPausaCoord.diasRestantes} días pactados` : 'Fecha límite alcanzada'}
                  </span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                  Fecha estimada de entrega pactada: <strong>{calculoDiasPausaCoord.fechaFormateada}</strong>. Al pausar este proyecto, el conteo operativo del cronograma quedará suspendido temporalmente y la métrica de entrega reflejará la interrupción directiva.
                </p>
              </div>

              {/* Evaluación de Procesos y Actividades en Desarrollo Afectadas */}
              {evidenciaWbsPausaCoord.tieneAvancesActivos ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={16} className="text-amber-600 shrink-0" />
                      <span>Procesos WBS que Quedarán Congelados ({evidenciaWbsPausaCoord.actividadesActivas.length} Actividades Activas)</span>
                    </span>
                    <span className="text-[0.65rem] font-mono font-bold text-zinc-400">
                      {evidenciaWbsPausaCoord.etapasActivas.length} Etapa(s) Afectada(s)
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {evidenciaWbsPausaCoord.actividadesActivas.map((act, idx) => (
                      <div key={act.idActividad || idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between text-xs gap-3">
                        <div className="min-w-0">
                          <span className="text-[0.62rem] font-mono text-zinc-400 block uppercase font-bold">{act.etapaNombre}</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block mt-0.5">{act.descripcion}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {act.desarrollador && (
                            <span className="text-[0.65rem] font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                              <Users size={11} className="text-blue-500" />
                              {act.desarrollador.nombreCompleto || act.desarrollador.nombre || 'Desarrollador'}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[0.62rem] font-extrabold uppercase font-mono bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {act.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs font-semibold text-red-800 dark:text-red-300 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Efecto en Paneles de Desarrolladores:</strong> A los desarrolladores asignados a estas tareas se les desplegará un aviso informando que la tarea no puede ser trabajada ni finalizada debido a que el proyecto ha sido suspendido por Coordinación.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Este proyecto no tiene actividades activas en desarrollo en este momento. La pausa congelará el estado del proyecto sin afectar asignaciones en curso.
                </div>
              )}

              {/* Acciones del Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowConfirmPausarCoordModal(false)}
                  disabled={submittingPausaFinalizarCoord}
                  className="px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleEjecutarPausaProyectoCoord}
                  disabled={submittingPausaFinalizarCoord}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-extrabold shadow-lg shadow-amber-600/25 inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {submittingPausaFinalizarCoord ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Pausando Proyecto...</span>
                    </>
                  ) : (
                    <>
                      <Pause size={15} className="fill-white" />
                      <span>Confirmar Pausa Directiva</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* ─── Modal de Doble Confirmación: Finalizar Etapa WBS ─── */}
      <ConfirmActionModal
        isOpen={!!etapaAConfirmarFinalizar}
        onClose={() => setEtapaAConfirmarFinalizar(null)}
        onConfirm={handleConfirmarFinalizarEtapaCoord}
        variant="warning"
        title="Finalizar Etapa WBS"
        description={`¿Confirma la finalización formal de la etapa "${etapaAConfirmarFinalizar?.nombreEtapa || `Fase #${etapaAConfirmarFinalizar?.idEtapa}`}"? El estado cambiará a FINALIZADA y se registrará en el historial de auditoría.`}
        confirmLabel="Sí, Finalizar Etapa"
        cancelLabel="Cancelar"
      />

    </DashboardLayout>
  );
};
