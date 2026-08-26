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
  Crown, ArrowRight, ArrowLeft, ClipboardList, RotateCw, Pause, Play, Zap, CheckCircle, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { PredictorBurnout } from '../../components/dashboard/PredictorBurnout';
import { CustomSelect } from '../../components/ui/CustomSelect';

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
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('TODOS'); // 'TODOS' | 'ACTIVO' | 'INHABILITADO'
  const [filtroSolicitudes, setFiltroSolicitudes] = useState('TODAS'); // 'TODAS' | 'PENDIENTE' | 'ATENDIDA' | 'REABIERTA' | 'EN_PROCESO'
  const [searchSolicitudQuery, setSearchSolicitudQuery] = useState('');
  const [fechaInicioSolicitud, setFechaInicioSolicitud] = useState('');
  const [fechaFinSolicitud, setFechaFinSolicitud] = useState('');

  // Estados para la pestaña 'proyectos' (Gestión de Proyectos - Vista Global del Coordinador)
  const [searchProyectoQuery, setSearchProyectoQuery] = useState('');
  const [filtroProyectoEstado, setFiltroProyectoEstado] = useState('TODOS'); // 'TODOS' | 'EN_PROGRESO' | 'COMPLETADO' | 'PAUSADO' | 'INHABILITADO'
  const [filtroProyectoLider, setFiltroProyectoLider] = useState('TODOS'); // 'TODOS' | idLider
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
  const [actividadAReasignarCoord, setActividadAReasignarCoord] = useState(null);
  const [targetDevIdReasignarCoord, setTargetDevIdReasignarCoord] = useState('');
  const [motivoReasignarCoord, setMotivoReasignarCoord] = useState('');
  const [submittingReasignarActividadCoord, setSubmittingReasignarActividadCoord] = useState(false);

  const [submittingPausaFinalizarCoord, setSubmittingPausaFinalizarCoord] = useState(false);

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
    } catch (e) {
      console.error('Error generando PDF:', e);
      toast.error('Error al generar reporte PDF.');
    }
  };

  // Pausar / Reanudar Proyecto con Auditoría Directiva
  const handlePausarReanudarProyectoCoord = async () => {
    if (!selectedProyectoModal) return;
    const isPausado = selectedProyectoModal.estado === 'EN_PAUSA' || selectedProyectoModal.estado === 'PAUSADO';
    const endpoint = isPausado ? `/lider/proyectos/${selectedProyectoModal.idProyecto}/reactivar` : `/lider/proyectos/${selectedProyectoModal.idProyecto}/pausar`;
    const nuevoEstado = isPausado ? 'EN_PROGRESO' : 'EN_PAUSA';
    const accion = isPausado ? 'REANUDACION_PROYECTO' : 'PAUSA_PROYECTO';
    const detalles = isPausado ? 'El Coordinador reanudó el proyecto en la plataforma.' : 'El Coordinador pausó temporalmente el proyecto.';

    try {
      setSubmittingPausaFinalizarCoord(true);
      await api.patch(endpoint);
      setSelectedProyectoModal(prev => ({ ...prev, estado: nuevoEstado }));
      setProyectos(prev => prev.map(p => p.idProyecto === selectedProyectoModal.idProyecto ? { ...p, estado: nuevoEstado } : p));
      
      await registrarAccionCoordinador(selectedProyectoModal.idProyecto, accion, detalles);
      toast.success(`Proyecto ${isPausado ? 'reactivado' : 'puesto en pausa'} exitosamente.`);
    } catch (err) {
      console.error('Error alternando estado del proyecto:', err);
      toast.error(err.message || 'Error al cambiar estado del proyecto.');
    } finally {
      setSubmittingPausaFinalizarCoord(false);
    }
  };

  // Finalizar Proyecto con Auditoría Directiva
  const handleFinalizarProyectoCoord = async () => {
    if (!selectedProyectoModal) return;
    try {
      setSubmittingPausaFinalizarCoord(true);
      await api.patch(`/lider/proyectos/${selectedProyectoModal.idProyecto}/finalizar`);
      setSelectedProyectoModal(prev => ({ ...prev, estado: 'FINALIZADO' }));
      setProyectos(prev => prev.map(p => p.idProyecto === selectedProyectoModal.idProyecto ? { ...p, estado: 'FINALIZADO' } : p));
      
      await registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'FINALIZACION_PROYECTO', 'El Coordinador dio por FINALIZADO el proyecto formalmente.');
      toast.success('El proyecto ha sido marcado como FINALIZADO.');
    } catch (err) {
      console.error('Error al finalizar el proyecto:', err);
      toast.error(err.message || 'Error al finalizar el proyecto.');
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

  // Asignar Nueva Actividad
  const handleRegistrarActividadCoord = async (e) => {
    e.preventDefault();
    if (!selectedProyectoModal || !nuevaActividadCoord.nombreActividad.trim() || !nuevaActividadCoord.idEtapa || !nuevaActividadCoord.idDesarrollador) {
      toast.error('Complete todos los campos del formulario de asignación.');
      return;
    }

    try {
      setSubmittingActividadCoord(true);
      const dev = trabajadores.find(t => String(t.idTrabajador) === String(nuevaActividadCoord.idDesarrollador));
      const devNombre = dev ? `${dev.nombre} ${dev.apellido}` : `ID #${nuevaActividadCoord.idDesarrollador}`;

      const body = {
        nombreActividad: nuevaActividadCoord.nombreActividad.trim(),
        descripcion: nuevaActividadCoord.nombreActividad.trim(),
        estado: 'PENDIENTE',
        idEtapa: Number(nuevaActividadCoord.idEtapa)
      };

      await api.post(`/lider/etapas/${nuevaActividadCoord.idEtapa}/desarrolladores/${nuevaActividadCoord.idDesarrollador}/actividades`, body);

      const etapasRes = await api.get(`/lider/proyectos/${selectedProyectoModal.idProyecto}/etapas`).catch(() => []);
      setProyectoEtapasModal(Array.isArray(etapasRes) ? etapasRes : []);

      registrarAccionCoordinador(selectedProyectoModal.idProyecto, 'ASIGNACION_ACTIVIDAD', `Actividad "${nuevaActividadCoord.nombreActividad.trim()}" asignada a ${devNombre}`);
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
        .catch(() => {});

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
      } catch (e) {}
      return next;
    });
  };

  // Notificaciones unificadas de auditoría directiva (Reasignaciones y Nuevas Asignaciones)
  const listNotificacionesCoordinador = useMemo(() => {
    if (!proyectos || !Array.isArray(proyectos)) return [];
    const notifs = [];

    proyectos.forEach(p => {
      // Reasignación reciente (Vigencia 72h)
      if (p.reasignado && getHoursSinceReassignment(p.fechaReasignacion) <= 72 && !dismissedNotifsCoord.includes(`coord_reasig_${p.idProyecto}`)) {
        notifs.push({
          tipo: 'REASIGNACION',
          idNotif: `coord_reasig_${p.idProyecto}`,
          proyecto: p,
          titulo: 'AUDITORÍA DIRECTIVA: PROYECTO REASIGNADO',
          subtitulo: 'Reasignación de dirección técnica registrada por la Coordinación General.',
          motivo: p.motivoReasignacion || 'Reorganización de dirección técnica.',
          liderNombre: p.lider ? `${p.lider.nombre} ${p.lider.apellido}` : 'Líder Asignado',
          vigencia: 'Vigencia de Auditoría (72h)'
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

  // 2. Filtrado final aplicando Estado Operativo
  const proyectosFiltradosCoordinador = useMemo(() => {
    return proyectosBaseCoordinador.filter(prj => {
      if (filtroProyectoEstado !== 'TODOS') {
        if (filtroProyectoEstado === 'EN_PROGRESO' && prj.estado !== 'EN_PROGRESO' && prj.estado !== 'ACTIVO') return false;
        if (filtroProyectoEstado === 'COMPLETADO' && prj.estado !== 'COMPLETADO' && prj.estado !== 'FINALIZADO') return false;
        if (filtroProyectoEstado === 'PAUSADO' && prj.estado !== 'PAUSADO') return false;
        if (filtroProyectoEstado === 'INHABILITADO' && prj.estado !== 'INHABILITADO') return false;
      }
      return true;
    });
  }, [proyectosBaseCoordinador, filtroProyectoEstado]);

  // Contadores dinámicos para las pestañas de estado según el Líder seleccionado
  const countsEstadoDinamicos = useMemo(() => {
    const todos = proyectosBaseCoordinador.length;
    const enProgreso = proyectosBaseCoordinador.filter(p => p.estado === 'EN_PROGRESO' || p.estado === 'ACTIVO' || !p.estado).length;
    const completados = proyectosBaseCoordinador.filter(p => p.estado === 'COMPLETADO' || p.estado === 'FINALIZADO').length;
    const pausados = proyectosBaseCoordinador.filter(p => p.estado === 'PAUSADO').length;
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

      toast.success(`Entrando al WBS de "${prjTarget.nombre}"`, { icon: '🎯' });
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

    toast.info(`Regresando a la inspección de ${workerToRestore.nombre} ${workerToRestore.apellido}`, { icon: '↩️' });
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
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw size={13} /> Ver Todo el Personal ({activeFiltersCount} activo)
                  </button>
                </div>
              )}

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              
              {/* A. Selección Única de Rol (Paso 1) - Rediseñado sin enlace azul redundante */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
                    <Users size={14} className="text-blue-600 dark:text-blue-400 shrink-0" /> Paso 1: Selecciona 1 solo Rol a consultar:
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'TODOS', label: `Todos los Roles (${totalCount})`, icon: Sparkles, color: 'text-amber-500' },
                    { key: 'DESARROLLADOR', label: `Desarrolladores (${devsCount})`, icon: Code2, color: 'text-emerald-500' },
                    { key: 'LIDER', label: `Líderes (${lideresCount})`, icon: Crown, color: 'text-purple-500' },
                    { key: 'COORDINADOR', label: `Coordinadores (${coordCount})`, icon: ShieldCheck, color: 'text-blue-500' }
                  ].map(r => {
                    const isSelected = rolSeleccionado === r.key;
                    const IconComponent = r.icon;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => handleSelectRole(r.key)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
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
                        <IconComponent size={14} className={`shrink-0 ${isSelected ? 'text-white' : r.color}`} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B. Estado Lógico del Acceso (Paso 2) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Paso 2: Estado de Permiso de Acceso:
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'TODOS', label: `Todos los Estados (${totalCount})`, icon: BadgeCheck, iconColor: 'text-blue-500' },
                    { key: 'ACTIVO', label: `Solo Habilitados (${activosCount})`, icon: CheckCircle2, iconColor: 'text-emerald-500' },
                    { key: 'INHABILITADO', label: `Solo Inhabilitados (${inactivosCount})`, icon: UserX, iconColor: 'text-red-500' }
                  ].map(s => {
                    const isSelected = estadoSeleccionado === s.key;
                    const StatusIcon = s.icon;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setEstadoSeleccionado(s.key)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs ring-2 ring-zinc-500/20 font-bold'
                            : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <StatusIcon size={14} className={`shrink-0 ${isSelected ? 'text-white dark:text-zinc-900' : s.iconColor}`} />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 4. Paso 3: Habilidades Adaptativas */}
            {rolSeleccionado !== 'TODOS' && topSkills.length > 0 && (
              <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
                    <Sparkles size={14} className="text-amber-500 shrink-0" />
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
                    }}
                    className="outline-button text-xs py-2.5 px-4 font-extrabold inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-2xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl"
                  >
                    <ArrowLeft size={16} />
                    <span>Volver al Catálogo de Proyectos</span>
                  </button>

                  {navHistory && navHistory.worker && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={handleRegresarAInspeccionTrabajador}
                      className="gradient-button text-xs py-2.5 px-4 font-extrabold inline-flex items-center gap-2 text-white cursor-pointer shadow-md rounded-2xl"
                    >
                      <RotateCcw size={15} />
                      <span>Volver a Ficha de {navHistory.worker.nombre} {navHistory.worker.apellido}</span>
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3.5 py-1.5 rounded-2xl text-xs font-black inline-flex items-center gap-2 border ${
                    modoEdicionCoordinador
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
                    className={`text-xs py-2.5 px-5 rounded-2xl font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm ${
                      modoEdicionCoordinador
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-black uppercase border ${
                          selectedProyectoModal.estado === 'FINALIZADO' || selectedProyectoModal.estado === 'COMPLETADO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' :
                          selectedProyectoModal.estado === 'EN_PAUSA' || selectedProyectoModal.estado === 'PAUSADO'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {selectedProyectoModal.estado === 'EN_PAUSA' ? '⏸️ EN PAUSA' : (selectedProyectoModal.estado || 'ACTIVO')}
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
                      <span>Cambios de Coordinación</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerarReportePdfCoord}
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
                          className={`text-xs py-2 px-3.5 font-extrabold inline-flex items-center gap-2 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                            selectedProyectoModal.estado === 'EN_PAUSA' || selectedProyectoModal.estado === 'PAUSADO'
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
                          onClick={handleFinalizarProyectoCoord}
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
                    {proyectoEtapasModal.map((etapa, idx) => (
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
                            <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-extrabold uppercase border ${
                              etapa.estado === 'FINALIZADA' || etapa.estado === 'COMPLETADO'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                            }`}>
                              {etapa.estado || 'EN_PROGRESO'}
                            </span>

                            {modoEdicionCoordinador && (
                              <button
                                type="button"
                                onClick={() => handleAbrirEditarEtapaCoord(etapa)}
                                className="outline-button text-xs py-1 px-3 font-bold inline-flex items-center gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                              >
                                <Edit3 size={13} className="text-blue-600" />
                                <span>Editar Etapa</span>
                              </button>
                            )}
                          </div>
                        </div>

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
                                  className={`p-3.5 rounded-2xl transition-all ${
                                    isHighlighted
                                      ? 'bg-amber-100/90 dark:bg-amber-950/80 border-2 border-amber-500 dark:border-amber-400 ring-4 ring-amber-400/30 shadow-lg scale-[1.01]'
                                      : 'bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800'
                                  } flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs`}
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isHighlighted && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[0.62rem] animate-pulse shrink-0">
                                        🎯 TAREA SELECCIONADA
                                      </span>
                                    )}
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
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
                                    <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                                      {act.estado || 'FINALIZADA'}
                                    </span>

                                    {modoEdicionCoordinador && (
                                      <button
                                        type="button"
                                        onClick={() => handleAbrirReasignarActividadCoord(act, etapa)}
                                        className="outline-button text-xs py-1 px-3 font-bold inline-flex items-center gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                                      >
                                        <RotateCw size={13} className="text-purple-600" />
                                        <span>Reasignar</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[0.7rem] text-zinc-400 italic pl-1">Sin tareas asignadas en esta fase.</p>
                          )}
                        </div>
                      </div>
                    ))}
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

          {/* Panel Integrado de Búsqueda y Filtros Avanzados */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
              {/* Caja de Búsqueda */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchProyectoQuery}
                  onChange={(e) => {
                    setSearchProyectoQuery(e.target.value);
                    setCurrentProyectoPage(1);
                  }}
                  placeholder="Buscar por código (PRJ-001), nombre de proyecto, cliente o líder..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-blue-500"
                />
                {searchProyectoQuery && (
                  <button onClick={() => setSearchProyectoQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtro por Líder de Proyecto Embellecido */}
              <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-800/80 p-2 px-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <Crown size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-[0.68rem] font-mono font-extrabold uppercase text-zinc-500 dark:text-zinc-400 shrink-0">
                  Filtrar por Líder:
                </span>
                <select
                  value={filtroProyectoLider}
                  onChange={(e) => {
                    setFiltroProyectoLider(e.target.value);
                    setCurrentProyectoPage(1);
                  }}
                  className="bg-transparent text-xs font-extrabold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="TODOS">Todos los Líderes ({lideresActivos.length})</option>
                  {lideresActivos.map(lider => (
                    <option key={lider.idTrabajador} value={lider.idTrabajador}>
                      {lider.nombre} {lider.apellido} &bull; [{lider.email}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pestañas de Filtro por Estado Operativo (Dinámicas según el Líder seleccionado) */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => { setFiltroProyectoEstado('TODOS'); setCurrentProyectoPage(1); }}
                className={`text-xs py-1.5 px-3 rounded-xl font-extrabold transition-all cursor-pointer ${
                  filtroProyectoEstado === 'TODOS'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                Todos los Estados ({countsEstadoDinamicos.todos})
              </button>

              <button
                type="button"
                onClick={() => { setFiltroProyectoEstado('EN_PROGRESO'); setCurrentProyectoPage(1); }}
                className={`text-xs py-1.5 px-3 rounded-xl font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  filtroProyectoEstado === 'EN_PROGRESO'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                En Ejecución ({countsEstadoDinamicos.enProgreso})
              </button>

              <button
                type="button"
                onClick={() => { setFiltroProyectoEstado('COMPLETADO'); setCurrentProyectoPage(1); }}
                className={`text-xs py-1.5 px-3 rounded-xl font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  filtroProyectoEstado === 'COMPLETADO'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                }`}
              >
                <CheckCircle2 size={12} />
                Completados ({countsEstadoDinamicos.completados})
              </button>

              <button
                type="button"
                onClick={() => { setFiltroProyectoEstado('PAUSADO'); setCurrentProyectoPage(1); }}
                className={`text-xs py-1.5 px-3 rounded-xl font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  filtroProyectoEstado === 'PAUSADO'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                }`}
              >
                <Clock size={12} />
                En Pausa ({countsEstadoDinamicos.pausados})
              </button>
            </div>
          </motion.div>

          {/* Grilla Corporativa de Proyectos Rediseñada (Nivel Superior) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
              <div className="h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
              <div className="h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
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
                const presupuestoFmt = Number(prj.presupuesto || 0).toLocaleString('es-CO');
                const isCompletado = prj.estado === 'COMPLETADO' || prj.estado === 'FINALIZADO';
                const isPausado = prj.estado === 'PAUSADO';
                const isHighlighted = Number(prj.idProyecto) === Number(highlightedProyectoId);

                const isPastLiderPending = filtroProyectoLider !== 'TODOS'
                  && String(prj.idLiderAnterior) === String(filtroProyectoLider)
                  && prj.reasignado
                  && !prj.leidoPorLiderAnterior
                  && getHoursSinceReassignment(prj.fechaReasignacion) <= 24;

                const isReasig = prj.reasignado && getHoursSinceReassignment(prj.fechaReasignacion) <= 72;
                const isNuevo = !prj.reasignado && (prj.fechaInicio || prj.createdAt) && getHoursSinceReassignment(prj.fechaInicio || prj.createdAt) <= 72;

                return (
                  <motion.div
                    key={prj.idProyecto}
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => {
                      if (isHighlighted) {
                        setHighlightedProyectoId(null);
                      }
                      handleAbrirDetalleProyecto(prj);
                    }}
                    className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between gap-5 transition-all duration-300 cursor-pointer ${
                      isHighlighted
                        ? 'ring-4 ring-blue-500 animate-pulse border-blue-600 bg-blue-50/50 dark:bg-blue-950/50 shadow-2xl scale-[1.02]'
                        : isReasig || isPastLiderPending
                        ? 'border-amber-400 dark:border-amber-700/80 bg-gradient-to-b from-amber-50/40 via-amber-50/10 to-white dark:from-amber-950/20 dark:to-zinc-900 shadow-md shadow-amber-500/5 hover:border-amber-500'
                        : isNuevo
                        ? 'border-emerald-400 dark:border-emerald-700/80 bg-gradient-to-b from-emerald-50/40 via-emerald-50/10 to-white dark:from-emerald-950/20 dark:to-zinc-900 shadow-md shadow-emerald-500/5 hover:border-emerald-500'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-4">
                      {isHighlighted && (
                        <div className="bg-blue-600 text-white text-[0.68rem] font-black px-3 py-1.5 rounded-2xl flex items-center justify-between gap-1 -mx-2 -mt-2 mb-2 shadow-md">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={13} className="animate-spin text-amber-300" />
                            <span>PROYECTO SELECCIONADO (Haga clic para abrir)</span>
                          </span>
                          <span className="text-[0.6rem] underline">Ver Detalle</span>
                        </div>
                      )}

                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-[0.68rem] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          PRJ-00{prj.idProyecto}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isReasig || isPastLiderPending ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 animate-pulse flex items-center gap-1 shadow-2xs">
                              <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                              PROCESO REASIGNADO (1D)
                            </span>
                          ) : isNuevo ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700 animate-pulse flex items-center gap-1 shadow-2xs">
                              <Sparkles size={11} className="text-emerald-600 animate-bounce shrink-0" />
                              NUEVA ASIGNACIÓN (3D)
                            </span>
                          ) : null}

                          <span className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-black uppercase border ${
                            isCompletado ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                            isPausado ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse' :
                            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                          }`}>
                            {prj.estado || 'ACTIVO'}
                          </span>
                        </div>
                      </div>

                      {/* Título y Cliente */}
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {prj.nombre}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          <Building2 size={13} className="shrink-0 text-blue-500" />
                          <span className="truncate">{prj.cliente || 'Cliente Corporativo'}</span>
                        </div>
                      </div>

                      {/* Líder Asignado */}
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {prj.lider ? getInitials(prj.lider.nombre, prj.lider.apellido) : 'SD'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[0.6rem] font-extrabold text-zinc-400 block uppercase font-mono tracking-wider">Líder Asignado:</span>
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate block">
                              {prj.lider ? `${prj.lider.nombre} ${prj.lider.apellido}` : 'Sin Líder Asignado'}
                            </span>
                          </div>
                        </div>

                        {isReasig || isPastLiderPending ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 text-[0.62rem] font-extrabold shrink-0 shadow-2xs">
                            Reasignado
                          </span>
                        ) : isNuevo ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 text-[0.62rem] font-extrabold shrink-0 shadow-2xs">
                            Nuevo
                          </span>
                        ) : null}
                      </div>

                      {/* Fechas e Inversión */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                          <span className="text-[0.6rem] font-bold text-zinc-400 block uppercase font-mono">Presupuesto:</span>
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">${presupuestoFmt}</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                          <span className="text-[0.6rem] font-bold text-zinc-400 block uppercase font-mono">Fin Estimado:</span>
                          <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300 text-xs">{prj.fechaFinEstimada || '2027-12-31'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción Claros & Explicitos (Reasignar Líder Rediseñado) */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAbrirDetalleProyecto(prj)}
                        className="gradient-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 shadow-xs flex-1 justify-center rounded-xl cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Revisar Proyecto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAbrirReasignarLiderPrj(prj)}
                        className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50/50 hover:bg-purple-100 dark:bg-purple-950/40 cursor-pointer rounded-xl shrink-0"
                        title="Reasignar la dirección de este proyecto a otro Líder con registro de auditoría"
                      >
                        <RotateCcw size={14} />
                        <span>Reasignar Líder</span>
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
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>Página {safeProyectoPage} de {totalProyectoPages}</span>
                <button
                  type="button"
                  disabled={safeProyectoPage >= totalProyectoPages}
                  onClick={() => setCurrentProyectoPage(prev => Math.min(prev + 1, totalProyectoPages))}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 cursor-pointer"
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
                                ? (docValidationResult.valid ? 'border-blue-500 ring-2 ring-blue-500/10 dark:border-blue-500' : 'border-red-400 dark:border-red-600 ring-2 ring-red-500/10') 
                                : ''
                            }`}
                          />
                          {newTrabajador.identificacion && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {docValidationResult.valid ? (
                                <CheckCircle2 size={16} className="text-blue-500" />
                              ) : (
                                <AlertTriangle size={16} className="text-red-500 animate-bounce" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Mensaje de Validación de Algoritmo de País */}
                        {newTrabajador.identificacion && (
                          <p className={`text-[0.65rem] font-bold mt-1 flex items-center gap-1.5 ${
                            docValidationResult.valid ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'
                          }`}>
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
                              newTrabajador.nombre ? (nombreValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                            }`}
                          />
                          {newTrabajador.nombre && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {nombreValidationResult.valid ? <CheckCircle2 size={14} className="text-blue-500" /> : <AlertTriangle size={14} className="text-red-500" />}
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
                              newTrabajador.apellido ? (apellidoValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                            }`}
                          />
                          {newTrabajador.apellido && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {apellidoValidationResult.valid ? <CheckCircle2 size={14} className="text-blue-500" /> : <AlertTriangle size={14} className="text-red-500" />}
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
                            newTrabajador.email ? (emailValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                          }`}
                        />
                        {newTrabajador.email && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {emailValidationResult.valid ? <CheckCircle2 size={16} className="text-blue-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                          </div>
                        )}
                      </div>
                      {newTrabajador.email && (
                        <p className={`text-[0.65rem] font-bold mt-1 ${emailValidationResult.valid ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>
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
                              ⚠️ Líder a Inhabilitar
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

                    {/* Tarjeta Destacada de Asignación Masiva Rápida (Zap Atajo) */}
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/90 dark:border-blue-800/80 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={18} className="text-amber-500 shrink-0 animate-pulse" />
                        <div>
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs block">
                            ⚡ Asignación Masiva Rápida (Atajo para todo el portafolio)
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
                          ⚠️ Ningún proyecto se puede quedar sin asignar
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
                              className={`p-5 rounded-3xl bg-white dark:bg-zinc-800/80 border space-y-3.5 text-xs shadow-2xs transition-all ${
                                estaAsignado 
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
                                        ⚠️ Selecciona un Líder
                                      </span>
                                    )}
                                  </div>
                                  <select
                                    required
                                    value={reasignacionesMap[p.idProyecto] || ''}
                                    onChange={(e) => handleCambiarLiderDeProyecto(p.idProyecto, e.target.value)}
                                    className={`input-field w-full py-2.5 px-3.5 text-xs font-bold appearance-none cursor-pointer rounded-xl border-2 ${
                                      estaAsignado 
                                        ? 'border-zinc-200 dark:border-zinc-700 focus:border-blue-500' 
                                        : 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                                    }`}
                                  >
                                    <option value="">— ⚠️ Seleccionar Líder Receptor Obligatorio —</option>
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



      {/* Modal: Ficha Técnica, Datos Sensibles & Dual Panel de Proyectos del Trabajador */}
      <AnimatePresence>
        {selectedTrabajadorModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 w-full transition-all duration-300 shadow-2xl max-h-[92dvh] overflow-y-auto space-y-7 ${
                showTrabajosSubpanel && !selectedTrabajadorModal.rol?.toUpperCase().includes('DESARROLLADOR')
                  ? 'max-w-6xl' 
                  : 'max-w-2xl'
              }`}
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
                      <span>Tipo Contrato: <strong className="text-zinc-800 dark:text-zinc-200">{selectedTrabajadorModal.tipoTrabajador || 'PLANTA'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Dual Responsive: 5 cols (Ficha) + 7 cols (Subpanel Proyectos) */}
              <div className={`grid gap-8 ${showTrabajosSubpanel && !selectedTrabajadorModal.rol?.toUpperCase().includes('DESARROLLADOR') ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
                
                {/* Panel Izquierdo: Ficha Personal, Credenciales & Stack (5 de 12 columnas en Pantalla Ancha) */}
                <div className={`space-y-5 ${showTrabajosSubpanel && !selectedTrabajadorModal.rol?.toUpperCase().includes('DESARROLLADOR') ? 'lg:col-span-5' : ''}`}>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Ficha Personal, Credenciales & Stack Técnico
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 text-xs">
                    {/* Correo Corporativo */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <span className="text-[0.62rem] font-extrabold uppercase text-zinc-400 block font-mono">Correo Corporativo Principal:</span>
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <Mail size={15} className="text-blue-600 shrink-0" />
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-sm truncate">
                          {selectedTrabajadorModal.email}
                        </span>
                        <Lock size={13} className="text-zinc-400 ml-auto shrink-0" title="Correo Corporativo Protegido" />
                      </div>
                    </div>

                    {/* Correo Personal Alternativo */}
                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                      <span className="text-[0.62rem] font-extrabold uppercase text-purple-700 dark:text-purple-300 block font-mono">
                        Correo Personal Alternativo (Credenciales Temporales):
                      </span>
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <Mail size={15} className="text-purple-600 shrink-0" />
                        <span className="font-mono font-bold text-purple-900 dark:text-purple-200 text-xs truncate">
                          {selectedTrabajadorModal.correoPersonal || selectedTrabajadorModal.emailPersonal || 'No registrado / Asignado al crear'}
                        </span>
                      </div>
                    </div>

                    {/* Profesión & Especialidad Desglosada en Tech Pills */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2.5">
                      <span className="text-[0.62rem] font-extrabold uppercase text-zinc-400 block font-mono">Profesión & Competencias Técnicas:</span>
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm block">
                        {selectedTrabajadorModal.profesion || 'Ingeniero de Software'}
                      </span>
                      
                      {/* Tech Pills Parser */}
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
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs block mt-1">
                          {selectedTrabajadorModal.primerLoginRealizado ? 'Sí (Validado)' : 'Pendiente primera sesión'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón Inferior de Despliegue de Proyectos (SOLO PARA LÍDERES O COORDINADORES) */}
                  {!selectedTrabajadorModal.rol?.toUpperCase().includes('DESARROLLADOR') && (
                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setShowTrabajosSubpanel(prev => !prev)}
                        className="gradient-button text-xs py-3 px-5 font-bold inline-flex items-center gap-2.5 cursor-pointer shadow-md w-full justify-center rounded-2xl"
                      >
                        <FolderGit2 size={18} />
                        <span>
                          {showTrabajosSubpanel 
                            ? '◄ Ocultar Proyectos Asociados' 
                            : `Desplegar Proyectos Asociados (${workerProyectos.length}) ►`}
                        </span>
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Panel Derecho: Subpanel Lateral de Proyectos (7 de 12 columnas en Pantalla Ancha con Holgura) */}
                {showTrabajosSubpanel && !selectedTrabajadorModal.rol?.toUpperCase().includes('DESARROLLADOR') && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-8 pt-6 lg:pt-0 lg:col-span-7"
                  >
                    {/* Encabezado del Subpanel */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <FolderGit2 size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          Proyectos Asociados & Historial
                        </h4>
                      </div>
                      <span className="text-[0.68rem] font-black px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {workerProyectos.length} Asignado(s)
                      </span>
                    </div>

                    {workerProyectos.length === 0 ? (
                      <div className="p-10 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-700 space-y-3 text-xs text-zinc-500">
                        <FolderGit2 size={36} className="mx-auto text-zinc-400" />
                        <p className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">Sin proyectos asociados actualmente.</p>
                        <p className="text-xs">Este Líder no posee proyectos bajo su dirección en este momento.</p>
                      </div>
                    ) : (
                      /* Área desplazable con holgura para que el scrollbar no toque las tarjetas */
                      <div className="space-y-4 max-h-[62dvh] overflow-y-auto pr-3.5 pl-1 py-1">
                        {workerProyectos.map((prj, index) => {
                          const isLider = prj.lider && (
                            String(prj.lider.idTrabajador) === String(selectedTrabajadorModal.idTrabajador) ||
                            (prj.lider.email && prj.lider.email.toLowerCase() === selectedTrabajadorModal.email?.toLowerCase())
                          );

                          return (
                            <motion.div 
                              key={prj.idProyecto}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: index * 0.05 }}
                              whileHover={{ y: -3, scale: 1.01 }}
                              className="p-5 sm:p-6 rounded-3xl bg-zinc-50/90 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/90 shadow-sm space-y-3.5 text-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md"
                            >
                              {/* Header Tarjeta Proyecto */}
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <span className="font-mono font-extrabold text-[0.7rem] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                                  PRJ-00{prj.idProyecto}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[0.63rem] font-black uppercase inline-flex items-center gap-1.5 ${
                                  isLider 
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300' 
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {isLider ? <Crown size={13} className="text-amber-500 shrink-0" /> : <Code2 size={13} className="shrink-0" />}
                                  <span>{isLider ? 'Líder Directivo' : 'Desarrollador'}</span>
                                </span>
                              </div>

                              {/* Título de Proyecto */}
                              <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base leading-snug">
                                {prj.nombre}
                              </h5>

                              {/* Grid Informativo del Proyecto con sangría e iconos separados de texto */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-3 border-t border-zinc-200/70 dark:border-zinc-700/70">
                                <div className="space-y-1">
                                  <span className="text-zinc-400 font-bold flex items-center gap-1.5 text-[0.65rem] uppercase font-mono tracking-wider">
                                    <Building2 size={14} className="text-blue-500 shrink-0" />
                                    <span>Cliente:</span>
                                  </span>
                                  <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block pl-5 text-xs truncate">
                                    {prj.cliente || 'Corporativo'}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-zinc-400 font-bold flex items-center gap-1.5 text-[0.65rem] uppercase font-mono tracking-wider">
                                    <DollarSign size={14} className="text-emerald-500 shrink-0" />
                                    <span>Presupuesto:</span>
                                  </span>
                                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 block pl-5 text-xs">
                                    ${Number(prj.presupuesto || 0).toLocaleString('es-CO')} COP
                                  </span>
                                </div>
                              </div>

                              {/* Botón de Navegación con Holgura y Hover animado */}
                              <div className="pt-1">
                                <motion.button
                                  whileHover={{ x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                  type="button"
                                  onClick={() => handleIrAWbsProyectoDesdeTrabajador(prj.idProyecto)}
                                  className="gradient-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 text-white cursor-pointer shadow-sm w-full justify-center rounded-xl group"
                                >
                                  <span>Ir al WBS del Proyecto</span>
                                  <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform shrink-0" />
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
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
                      Historial de Cambios de Coordinación
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Auditoría acumulada de modificaciones directivas registradas
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

              <div className="overflow-y-auto flex-1 space-y-3.5 pr-1">
                {loadingHistorial ? (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
                    Cargando historial de auditoría...
                  </div>
                ) : historialCambiosModal.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs space-y-1">
                    <ShieldCheck size={28} className="mx-auto text-zinc-300" />
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">Sin cambios de Coordinación registrados</p>
                    <p>No se han registrado modificaciones directivas previas en este proyecto.</p>
                  </div>
                ) : (
                  historialCambiosModal.map((reg, idx) => (
                    <div key={reg.idHistorial || idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-mono text-[0.65rem] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {reg.accion || 'MODIFICACIÓN'}
                        </span>
                        <span className="text-[0.62rem] font-mono text-zinc-400 font-bold">
                          {new Date(reg.fechaCambio).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">
                        {reg.detalles}
                      </p>
                      <div className="flex items-center gap-1.5 text-[0.65rem] text-zinc-500 font-medium pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                        <User size={12} className="text-blue-500" />
                        <span>Realizado por: <strong>{reg.nombreCoordinador}</strong> ({reg.emailCoordinador})</span>
                      </div>
                    </div>
                  ))
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
                <button type="button" onClick={() => setShowNuevaEtapaModalCoord(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                  <X size={18} />
                </button>
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

      {/* Modal: Asignar Nueva Actividad WBS (Modo Edición Coordinador) */}
      <AnimatePresence>
        {showNuevaActividadModalCoord && (
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
                  <Zap size={20} className="text-blue-600" />
                  <span>Asignar Actividad a Desarrollador</span>
                </h3>
                <button type="button" onClick={() => setShowNuevaActividadModalCoord(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegistrarActividadCoord} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Descripción / Nombre de la Tarea *</label>
                  <input
                    type="text"
                    required
                    value={nuevaActividadCoord.nombreActividad}
                    onChange={(e) => setNuevaActividadCoord({ ...nuevaActividadCoord, nombreActividad: e.target.value })}
                    placeholder="Ej. Documentar contratos OpenAPI 3.0 para la API pública"
                    className="input-field py-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Seleccionar Fase / Etapa *</label>
                  <select
                    required
                    value={nuevaActividadCoord.idEtapa}
                    onChange={(e) => setNuevaActividadCoord({ ...nuevaActividadCoord, idEtapa: e.target.value })}
                    className="input-field py-2.5 font-bold"
                  >
                    <option value="">-- Seleccionar Etapa WBS --</option>
                    {proyectoEtapasModal.map((et) => (
                      <option key={et.idEtapa} value={et.idEtapa}>
                        Fase #{et.idEtapa}: {et.nombreEtapa}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Desarrollador Asignado *</label>
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
                          subtitle: dev?.profesion || dev?.especialidad || 'Desarrollador'
                        }))
                    ]}
                    maxWidth="w-full"
                    searchable={true}
                    icon={User}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setShowNuevaActividadModalCoord(false)} className="outline-button px-4 py-2 text-xs font-bold rounded-2xl">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submittingActividadCoord} className="gradient-button px-5 py-2 text-xs font-bold rounded-2xl">
                    {submittingActividadCoord ? 'Asignando...' : 'Asignar Tarea'}
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
                <button type="button" onClick={() => setShowEditarEtapaModalCoord(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                  <X size={18} />
                </button>
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
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Estado de la Etapa *</label>
                  <select
                    value={etapaAEditarCoord.estado}
                    onChange={(e) => setEtapaAEditarCoord({ ...etapaAEditarCoord, estado: e.target.value })}
                    className="input-field py-2.5 font-bold uppercase"
                  >
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="EN_PROGRESO">EN PROGRESO</option>
                    <option value="FINALIZADA">FINALIZADA</option>
                  </select>
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
                <button type="button" onClick={() => setShowReasignarActividadModalCoord(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                  <X size={18} />
                </button>
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
      </AnimatePresence>

    </DashboardLayout>
  );
};
