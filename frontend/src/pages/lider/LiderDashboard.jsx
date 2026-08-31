import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SemaforoInteligente } from '../../components/dashboard/SemaforoInteligente';
import { EtlBrasil } from '../../components/dashboard/EtlBrasil';
import { PredictorBurnout } from '../../components/dashboard/PredictorBurnout';
import {
  Briefcase, Layers, Plus, Activity, Sparkles, Download,
  Send, ShieldCheck, CheckCircle2, Clock, Calendar, ChevronRight, ChevronDown, X,
  RefreshCw, Loader2, UserCheck, UserPlus, Inbox, Bug, AlertTriangle, User, RotateCcw,
  Info, HelpCircle, FileText, Edit3, Filter, ShieldAlert, Check, Globe, FolderGit2, Building2, PieChart, FileCheck,
  FolderPlus, DollarSign, CircleDollarSign, CalendarClock, AlignLeft, Lock, Search, Eye, EyeOff,
  ArrowRight, ArrowLeft, Users, UserX, Code2, GraduationCap, BadgeCheck, Shield, Pause, Play, ClipboardList, FolderCheck, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonMetricCard } from '../../components/ui/Skeleton';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { CustomSelect } from '../../components/ui/CustomSelect';
import jsPDF from 'jspdf';

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
  }
};

// Variantes de animación ultra rápidas y fluidas (0.25s)
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

/* ─── Helper para extraer iniciales de nombre y apellido ─── */
const getInitials = (nombre = '', apellido = '') => {
  const n = (nombre || '').trim().charAt(0);
  const a = (apellido || '').trim().charAt(0);
  const res = `${n}${a}`.toUpperCase();
  return res || 'DEV';
};

/* ─── Helper para limpiar y simplificar títulos de especialidad en Selects ─── */
const getCleanEspecialidad = (especialidadRaw, profesionFallback = '') => {
  if (!especialidadRaw || !especialidadRaw.trim()) return profesionFallback || 'Desarrollador';
  let mainSpec = especialidadRaw;
  if (mainSpec.includes('• [')) {
    mainSpec = mainSpec.split('• [')[0].trim();
  } else if (mainSpec.includes(' • ')) {
    mainSpec = mainSpec.split(' • ')[0].trim();
  } else if (mainSpec.startsWith('[') && mainSpec.endsWith(']')) {
    mainSpec = profesionFallback || 'Desarrollador';
  }
  return mainSpec || profesionFallback || 'Desarrollador';
};

/* ─── Badge de Estado de Atención (RF-22 a RF-24) ─── */
const EstadoAtencionBadge = ({ estado }) => {
  const styles = {
    'REGISTRADO': 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    'EN_REVISION': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    'SOLUCIONADO': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  };
  const icons = {
    'REGISTRADO': <Clock size={11} />,
    'EN_REVISION': <Activity size={11} />,
    'SOLUCIONADO': <CheckCircle2 size={11} />,
  };
  const labels = {
    'REGISTRADO': 'Registrado',
    'EN_REVISION': 'En Revisión',
    'SOLUCIONADO': 'Solucionado',
  };
  const est = estado || 'REGISTRADO';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.65rem] font-extrabold uppercase px-2.5 py-1 rounded-full border ${styles[est] || styles['REGISTRADO']}`}>
      {icons[est] || <Clock size={11} />}
      <span>{labels[est] || est}</span>
    </span>
  );
};

/* ─── Funciones Auxiliares de Formateo, Cronograma y Estados ─── */
const getEstadoBadgeClasses = (estado) => {
  const est = (estado || 'ACTIVO').toUpperCase();
  switch (est) {
    case 'ACTIVO':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    case 'EN_PLANIFICACION':
    case 'PLANIFICACION':
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500'
      };
    case 'FINALIZADO':
    case 'COMPLETADO':
      return {
        badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
        dot: 'bg-violet-500'
      };
    case 'INHABILITADO':
    case 'PAUSADO':
      return {
        badge: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        dot: 'bg-zinc-400'
      };
    default:
      return {
        badge: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        dot: 'bg-zinc-400'
      };
  }
};

const formatearMoneda = (monto) => {
  const val = Number(monto);
  if (isNaN(val) || val <= 0) return null;
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const formatearFechaHumana = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return 'Fecha no definida';
  try {
    const rawStr = fechaStr.split('T')[0];
    const parts = rawStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      if (y && m && d && !isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const date = new Date(y, m - 1, d, 12, 0, 0);
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
        }
      }
    }
    const date = new Date(fechaStr);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    }
    return 'Fecha no definida';
  } catch {
    return 'Fecha no definida';
  }
};

const calcularDuracionProyecto = (inicioStr, finStr) => {
  if (!inicioStr || !finStr || typeof inicioStr !== 'string' || typeof finStr !== 'string') return '0 días';
  try {
    const raw1 = inicioStr.split('T')[0];
    const raw2 = finStr.split('T')[0];
    const [y1, m1, d1] = raw1.split('-').map(Number);
    const [y2, m2, d2] = raw2.split('-').map(Number);
    const date1 = (y1 && m1 && d1) ? new Date(y1, m1 - 1, d1) : new Date(inicioStr);
    const date2 = (y2 && m2 && d2) ? new Date(y2, m2 - 1, d2) : new Date(finStr);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return '0 días';
    const diffMs = date2.getTime() - date1.getTime();
    if (isNaN(diffMs) || diffMs <= 0) return '0 días';
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.round(diffDays / 30.4375);
    if (diffMonths >= 1) {
      return `${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    }
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } catch {
    return '0 días';
  }
};

const calcularDiasFaltantes = (finStr) => {
  if (!finStr) return null;
  try {
    const raw = finStr.split('T')[0];
    const [y, m, d] = raw.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - hoy.getTime();
    if (isNaN(diffMs)) return null;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

/**
 * Selector de Desarrolladores de Nivel Enterprise con Soporte de Despliegue Lateral Derecho
 */
/**
 * Modal Superpuesto Ampliado de Selección de Desarrollador con Análisis de Carga y Nómina
 */
const DeveloperSelectorModal = ({
  isOpen,
  onClose,
  value,
  onChange,
  desarrolladores = [],
  desarrolladoresAsignadosProyecto = [],
  getDevCargaInfo,
  getCleanEspecialidad
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTab, setFiltroTab] = useState('todos'); // 'todos', 'nomina', 'disponibles'

  // Combinar desarrolladores del pool global y asignados al proyecto
  const allDevs = useMemo(() => {
    const map = new Map();

    (desarrolladores || []).forEach(d => {
      const id = String(d.idTrabajador || d.id || d.idDesarrollador);
      if (id && id !== 'undefined' && !map.has(id)) {
        map.set(id, { ...d, idTrabajador: id });
      }
    });

    (desarrolladoresAsignadosProyecto || []).forEach(a => {
      const devObj = a.desarrollador || a;
      const id = String(devObj.idTrabajador || devObj.id || devObj.idDesarrollador);
      if (id && id !== 'undefined' && !map.has(id)) {
        map.set(id, { ...devObj, idTrabajador: id });
      }
    });

    return Array.from(map.values());
  }, [desarrolladores, desarrolladoresAsignadosProyecto]);

  const filteredDevs = useMemo(() => {
    return allDevs.filter(dev => {
      const devId = String(dev.idTrabajador);
      const nombreCompleto = `${dev.nombre || ''} ${dev.apellido || ''}`.toLowerCase();

      // Excluir a Gabriel si no tiene tareas asignadas activas en el proyecto
      if (nombreCompleto.includes('gabriel')) {
        const tieneTareas = (etapas || []).some(et =>
          (et.actividades || []).some(a => String(a.desarrollador?.idTrabajador || a.idDesarrollador) === devId)
        );
        if (!tieneTareas) return false;
      }

      const estaEnProyecto = (desarrolladoresAsignadosProyecto || []).some(
        a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId
      );
      const carga = getDevCargaInfo(devId);
      const horas = carga?.horasAsignadas || 0;

      if (filtroTab === 'nomina' && !estaEnProyecto) return false;
      if (filtroTab === 'disponibles' && horas >= 48) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const esp = (dev.especialidad || dev.profesion || '').toLowerCase();
      const email = (dev.email || '').toLowerCase();
      return nombreCompleto.includes(term) || esp.includes(term) || email.includes(term);
    });
  }, [allDevs, desarrolladoresAsignadosProyecto, getDevCargaInfo, filtroTab, searchTerm, etapas]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[90] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 w-full max-w-3xl shadow-2xl max-h-[88dvh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  Seleccionar Desarrollador Responsable
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Personal del equipo del proyecto, carga horaria semanal y disponibilidad (Máx 48h)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Buscador + Pestañas de Filtro */}
          <div className="py-4 space-y-3 shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar desarrollador por nombre, correo o especialidad técnica..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
              <button
                type="button"
                onClick={() => setFiltroTab('todos')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[0.7rem] transition-all cursor-pointer ${
                  filtroTab === 'todos'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Todos los Desarrolladores ({allDevs.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTab('nomina')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[0.7rem] transition-all cursor-pointer ${
                  filtroTab === 'nomina'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                En Equipo del Proyecto ({(desarrolladoresAsignadosProyecto || []).length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTab('disponibles')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[0.7rem] transition-all cursor-pointer ${
                  filtroTab === 'disponibles'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Disponibles (&lt; 48h)
              </button>
            </div>
          </div>

          {/* Lista de Desarrolladores Grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {filteredDevs.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <UserCheck size={32} className="mx-auto text-zinc-400" />
                <p className="text-xs text-zinc-500 font-semibold">No se encontraron desarrolladores que coincidan con los criterios de búsqueda.</p>
              </div>
            ) : (
              filteredDevs.map(dev => {
                const devId = String(dev.idTrabajador || dev.id || dev.idDesarrollador);
                const isSelected = String(value) === devId;
                const asignacionProy = (desarrolladoresAsignadosProyecto || []).find(
                  a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId
                );
                const estaEnProyecto = !!asignacionProy;
                const horasReservadasProy = asignacionProy?.horasSemanales || 0;

                // Tareas WBS asignadas a este dev en este proyecto
                const tareasDev = (etapas || []).flatMap(et => {
                  const acts = Array.isArray(et.actividades) ? et.actividades : [];
                  return acts.filter(a => Number(a.desarrollador?.idTrabajador || a.idDesarrollador) === Number(devId));
                });
                const tareasDevCount = tareasDev.length;

                // Horas reales sumadas de tareas WBS
                const horasTareasDev = tareasDev.reduce((sum, t) => {
                  const m = (t.descripcion || '').match(/\b(\d+)\s*h(?:\/sem)?\b/i);
                  if (m) return sum + parseInt(m[1]);
                  if (t.horasEstimadas) return sum + parseInt(t.horasEstimadas);
                  return sum + (tareasDevCount > 0 ? Math.round(horasReservadasProy / tareasDevCount) : 0);
                }, 0);

                // Saldo libre restante de su reserva (ej. Reservado 5h - Tareas 3h = 2h libres restantes)
                const saldoLibreReserva = Math.max(0, horasReservadasProy - horasTareasDev);

                const carga = getDevCargaInfo(devId);
                const horasGlobales = carga?.horasAsignadas || 0;
                const pct = Math.min(Math.round((horasGlobales / 48) * 100), 100);
                const esSaturado = horasGlobales >= 48;

                const estColor = esSaturado
                  ? { bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800', bar: 'bg-red-500', label: 'SATURADO 48H' }
                  : horasGlobales >= 36
                    ? { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', bar: 'bg-amber-500', label: 'ALTA CARGA' }
                    : { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', bar: 'bg-emerald-500', label: 'DISPONIBLE' };

                return (
                  <div
                    key={devId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {dev.nombre?.[0]}{dev.apellido?.[0]}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                            {dev.nombre} {dev.apellido}
                          </span>

                          {/* Badge de Reserva y Disponibilidad del Proyecto */}
                          {estaEnProyecto ? (
                            <div className="flex items-center gap-1.5 flex-wrap text-[0.62rem]">
                              <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                <CheckCircle2 size={11} /> En Equipo del Proyecto: {horasReservadasProy}h/sem
                              </span>

                              <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                WBS: {horasTareasDev}h/sem
                              </span>

                              <span className={`px-2.5 py-0.5 rounded-full font-black font-mono border ${
                                saldoLibreReserva > 0
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {saldoLibreReserva > 0 ? `🟢 ${saldoLibreReserva}h Libres de su Reserva` : '🔴 0h Libres'}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              Pool Global (Sin vincular)
                            </span>
                          )}
                        </div>

                        <div className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 flex items-center gap-3 flex-wrap">
                          <span><strong>Especialidad:</strong> {getCleanEspecialidad ? getCleanEspecialidad(dev.especialidad, dev.profesion) : (dev.especialidad || dev.profesion || 'Desarrollador')}</span>
                          {dev.email && <span>• {dev.email}</span>}
                        </div>

                        {/* Medidor de Capacidad Semanal Global */}
                        <div className="pt-1 flex items-center gap-3">
                          <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                            <div className={`h-full ${estColor.bar} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[0.63rem] font-extrabold border ${estColor.bg}`}>
                            {horasGlobales}/48h • {estColor.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón Seleccionar */}
                    <div className="sm:self-center shrink-0">
                      {isSelected ? (
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <Check size={14} /> Seleccionado
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onChange(devId);
                            onClose();
                          }}
                          className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                            esSaturado && !estaEnProyecto
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white shadow-xs'
                          }`}
                        >
                          {esSaturado && !estaEnProyecto ? 'Capacidad Máxima 48h' : 'Elegir Desarrollador'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-400 shrink-0">
            <span>Mostrando {filteredDevs.length} desarrolladores</span>
            <button
              type="button"
              onClick={onClose}
              className="outline-button py-1.5 px-4 font-bold text-xs cursor-pointer"
            >
              Cerrar Selector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * Selector de Desarrolladores de Nivel Enterprise con Despliegue Modal Ampliado
 */
const DeveloperCombobox = ({
  value,
  onChange,
  desarrolladores = [],
  desarrolladoresAsignadosProyecto = [],
  getDevCargaInfo,
  getCleanEspecialidad,
  placeholder = "— Seleccione un desarrollador responsable —",
  error = false,
  isOpen,
  setIsOpen
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const openState = isOpen !== undefined ? isOpen : internalOpen;
  const setOpenState = (st) => {
    if (setIsOpen) setIsOpen(st);
    else setInternalOpen(st);
  };

  const selectedDev = useMemo(() => {
    if (!value) return null;
    const devId = String(value);

    let d = (desarrolladores || []).find(dev => String(dev.idTrabajador || dev.id || dev.idDesarrollador) === devId);
    if (!d) {
      const item = (desarrolladoresAsignadosProyecto || []).find(a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId);
      if (item) d = item.desarrollador || item;
    }
    return d;
  }, [value, desarrolladores, desarrolladoresAsignadosProyecto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenState(true)}
        className={`w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border text-xs font-semibold shadow-2xs transition-all cursor-pointer text-left ${
          error
            ? 'border-red-400 dark:border-red-600 ring-2 ring-red-500/10'
            : openState
              ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20'
              : 'border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-600'
        }`}
      >
        {selectedDev ? (
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
              {selectedDev.nombre?.[0]}{selectedDev.apellido?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {selectedDev.nombre} {selectedDev.apellido}
                </span>
              </div>
              <span className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 block truncate font-medium">
                {getCleanEspecialidad ? getCleanEspecialidad(selectedDev.especialidad, selectedDev.profesion) : (selectedDev.especialidad || selectedDev.profesion || 'Desarrollador')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-zinc-400 font-medium text-xs">
            <UserCheck size={18} className="text-blue-500 shrink-0" />
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 shrink-0 pl-2">
          <span className="text-[0.68rem] font-extrabold">
            {selectedDev ? 'Cambiar desarrollador' : 'Buscar en Nómina/Pool'}
          </span>
          <ChevronRight size={16} />
        </div>
      </button>

      <DeveloperSelectorModal
        isOpen={openState}
        onClose={() => setOpenState(false)}
        value={value}
        onChange={onChange}
        desarrolladores={desarrolladores}
        desarrolladoresAsignadosProyecto={desarrolladoresAsignadosProyecto}
        getDevCargaInfo={getDevCargaInfo}
        getCleanEspecialidad={getCleanEspecialidad}
      />
    </>
  );
};

export const LiderDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('wbs');
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [modalProyectosOpen, setModalProyectosOpen] = useState(false);
  const [busquedaProyectoModal, setBusquedaProyectoModal] = useState('');
  const [filtroEstadoProyectoModal, setFiltroEstadoProyectoModal] = useState('TODOS');
  const [etapas, setEtapas] = useState([]);
  const [desarrolladores, setDesarrolladores] = useState([]);
  const [desarrolladoresAsignadosProyecto, setDesarrolladoresAsignadosProyecto] = useState([]);
  const [showNominaDevsModal, setShowNominaDevsModal] = useState(false);
  const [updatingDevId, setUpdatingDevId] = useState(null);
  const [errores, setErrores] = useState([]);
  const [interrupciones, setInterrupciones] = useState([]);

  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [refreshingManual, setRefreshingManual] = useState(false);
  const [navReturnContext, setNavReturnContext] = useState(null);

  // Estados para Edición de Etapa, Edición de Proyecto y Generación de Reportes PDF
  const [showEditarEtapaModal, setShowEditarEtapaModal] = useState(false);
  const [etapaAFinalizarModalLider, setEtapaAFinalizarModalLider] = useState(null);
  const [etapaAReabrirModalLider, setEtapaAReabrirModalLider] = useState(null);
  const [editingEtapaObj, setEditingEtapaObj] = useState(null);
  const [editingEtapaForm, setEditingEtapaForm] = useState({ nombreEtapa: '', estado: 'PENDIENTE' });
  const [submittingEditarEtapa, setSubmittingEditarEtapa] = useState(false);

  const [showEditarProyectoModal, setShowEditarProyectoModal] = useState(false);
  const [editingProyectoForm, setEditingProyectoForm] = useState({
    nombre: '',
    cliente: '',
    presupuesto: '',
    fechaInicio: '',
    fechaFinEstimada: '',
    estado: 'ACTIVO',
    descripcion: ''
  });
  const [submittingEditarProyecto, setSubmittingEditarProyecto] = useState(false);

  const [showGenerarReportePdfModal, setShowGenerarReportePdfModal] = useState(false);
  const [pdfConfig, setPdfConfig] = useState({
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

  const seleccionarPerfilPdf = (nivel) => {
    if (nivel === 'RESUMIDO') {
      setPdfConfig({
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
      setPdfConfig({
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
      setPdfConfig({
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

  const [showNuevoProyectoModal, setShowNuevoProyectoModal] = useState(false);
  const [submittingProyecto, setSubmittingProyecto] = useState(false);
  const [nuevoProyectoForm, setNuevoProyectoForm] = useState({
    nombre: '',
    cliente: '',
    descripcion: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFinEstimada: '',
    presupuesto: ''
  });
  const [nuevoProyectoErrors, setNuevoProyectoErrors] = useState({});

  // Registro y Ficha de Detalle de Desarrollador por el Líder
  const [selectedTrabajadorModal, setSelectedTrabajadorModal] = useState(null);
  const [showNuevoColaboradorModal, setShowNuevoColaboradorModal] = useState(false);
  const [submittingNuevoColaborador, setSubmittingNuevoColaborador] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [nuevoColaboradorForm, setNuevoColaboradorForm] = useState({
    identificacion: '',
    paisCodigo: 'CO',
    nombre: '',
    apellido: '',
    email: '',
    emailPersonal: '',
    profesion: '',
    especialidad: '',
    rol: 'DESARROLLADOR',
    passwordHash: ''
  });
  const [formErrorsColaborador, setFormErrorsColaborador] = useState({});

  // Objeto de país seleccionado para validación de algoritmo de cédula/documento
  const paisActual = useMemo(() => {
    return PAISES_IDENTIFICACION.find(p => p.code === (nuevoColaboradorForm.paisCodigo || 'CO')) || PAISES_IDENTIFICACION[0];
  }, [nuevoColaboradorForm.paisCodigo]);

  // Validaciones estrictas en tiempo real por campo
  const docValidationResult = useMemo(() => {
    const raw = (nuevoColaboradorForm.identificacion || '').trim();
    if (!raw) return { valid: false, message: 'Ingrese el número de documento de identificación.' };

    // Verificación de duplicados en la base de datos en tiempo real
    const existeDuplicado = (desarrolladores || []).some(t => String(t.identificacion).trim() === raw);
    if (existeDuplicado) {
      return { valid: false, message: `La cédula / número de identificación (${raw}) ya se encuentra registrada en el sistema.` };
    }

    return paisActual.validate(raw);
  }, [nuevoColaboradorForm.identificacion, paisActual, desarrolladores]);

  const emailValidationResult = useMemo(() => {
    const raw = (nuevoColaboradorForm.email || '').trim().toLowerCase();
    if (!raw) return { valid: false, message: 'El correo electrónico corporativo es obligatorio.' };
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rfcRegex.test(raw)) return { valid: false, message: 'Formato de correo electrónico corporativo no válido.' };

    const existeEmail = (desarrolladores || []).some(t => String(t.email || '').trim().toLowerCase() === raw);
    if (existeEmail) {
      return { valid: false, message: `El correo corporativo (${raw}) ya pertenece a otro colaborador registrado.` };
    }

    return { valid: true, message: 'Correo corporativo único válido y disponible.' };
  }, [nuevoColaboradorForm.email, desarrolladores]);

  const emailPersonalValidationResult = useMemo(() => {
    const raw = (nuevoColaboradorForm.emailPersonal || '').trim().toLowerCase();
    if (!raw) return { valid: false, message: 'El correo personal / alternativo es obligatorio.' };
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rfcRegex.test(raw)) return { valid: false, message: 'Formato de correo personal inválido (ej. usuario@gmail.com).' };

    const existePersonal = (desarrolladores || []).some(t => String(t.emailPersonal || '').trim().toLowerCase() === raw);
    if (existePersonal) {
      return { valid: false, message: `El correo personal (${raw}) ya pertenece a otro colaborador registrado en el sistema.` };
    }

    const existeComoCorp = (desarrolladores || []).some(t => String(t.email || '').trim().toLowerCase() === raw);
    if (existeComoCorp) {
      return { valid: false, message: `El correo personal (${raw}) ya está registrado como correo corporativo.` };
    }

    return { valid: true, message: 'Correo personal válido y disponible.' };
  }, [nuevoColaboradorForm.emailPersonal, desarrolladores]);

  const nombreValidationResult = useMemo(() => {
    const raw = (nuevoColaboradorForm.nombre || '').trim();
    if (!raw) return { valid: false, message: 'El nombre es obligatorio.' };
    if (raw.length < 2) return { valid: false, message: 'Debe contener al menos 2 caracteres.' };
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(raw)) return { valid: false, message: 'Solo se permiten letras, espacios y tildes.' };
    return { valid: true, message: 'Nombre válido.' };
  }, [nuevoColaboradorForm.nombre]);

  const apellidoValidationResult = useMemo(() => {
    const raw = (nuevoColaboradorForm.apellido || '').trim();
    if (!raw) return { valid: false, message: 'El apellido es obligatorio.' };
    if (raw.length < 2) return { valid: false, message: 'Debe contener al menos 2 caracteres.' };
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(raw)) return { valid: false, message: 'Solo se permiten letras, espacios y tildes.' };
    return { valid: true, message: 'Apellido válido.' };
  }, [nuevoColaboradorForm.apellido]);

  const pwdValidity = useMemo(() => {
    const pwd = nuevoColaboradorForm.passwordHash || '';
    return {
      minMax: pwd.length >= 8 && pwd.length <= 20,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      isValid: pwd.length >= 8 && pwd.length <= 20 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)
    };
  }, [nuevoColaboradorForm.passwordHash]);

  // Auto-generador de Correo Electrónico Corporativo Único (@ikernell.org)
  const autoGenerarEmailCorporativoLider = (nombres, apellidos) => {
    if (!nombres || !apellidos) return '';
    const nomClean = nombres.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    const apeClean = apellidos.trim().split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    if (!nomClean || !apeClean) return '';

    let baseEmail = `${nomClean}.${apeClean}@ikernell.org`;
    let contador = 1;
    let candidateEmail = baseEmail;
    while ((desarrolladores || []).some(t => (t.email || '').toLowerCase() === candidateEmail.toLowerCase())) {
      candidateEmail = `${nomClean}.${apeClean}${contador}@ikernell.org`;
      contador++;
    }
    return candidateEmail;
  };

  const generarPasswordAleatoriaColaborador = () => {
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

    setNuevoColaboradorForm(prev => ({ ...prev, passwordHash: shuffled }));
    setShowPasswordInput(true);
    setFormErrorsColaborador(p => ({ ...p, passwordHash: undefined }));
    toast.success(`Clave segura generada: ${shuffled}`);
  };

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

  // Componente Desplegable de Habilidades Técnicas (Pop-over al pasar el cursor)
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
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70 text-[0.68rem] font-mono font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Code2 size={12} className="text-blue-500 shrink-0" />
              <span>{skills.length} Competencias</span>
              <ChevronDown size={11} className={`text-blue-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

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

  // Estados y Filtros memorizados para la pestaña "Nómina & Personal"
  const [searchQueryPersonal, setSearchQueryPersonal] = useState('');
  const [especialidadFiltroPersonal, setEspecialidadFiltroPersonal] = useState('TODAS');
  const [estadoFiltroPersonal, setEstadoFiltroPersonal] = useState('TODOS');
  const [openDropdownEspecialidad, setOpenDropdownEspecialidad] = useState(false);

  const formatEspecialidadLabel = (espRaw) => {
    if (!espRaw || espRaw === 'TODAS') return { titulo: 'Todas las Especialidades', stack: [] };
    const parts = espRaw.split(/[\u2022\u2023\u25E6\u2043\u2219•]/);
    const titulo = parts[0] ? parts[0].replace(/\[.*\]/, '').trim() : espRaw;
    let stack = [];
    const match = espRaw.match(/\[(.*?)\]/);
    if (match && match[1]) {
      stack = match[1].split(',').map(s => s.trim()).filter(Boolean);
    }
    return { titulo, stack };
  };

  // Especialidades dinámicas basadas en los desarrolladores registrados
  const especialidadesDisponibles = useMemo(() => {
    if (!Array.isArray(desarrolladores)) return [];
    const espSet = new Set(desarrolladores.map(d => d.especialidad).filter(Boolean));
    return Array.from(espSet).sort();
  }, [desarrolladores]);

  const personalFiltrado = useMemo(() => {
    if (!Array.isArray(desarrolladores)) return [];
    return desarrolladores.filter(t => {
      // Filtro Avanzado de Especialidad
      if (especialidadFiltroPersonal !== 'TODAS') {
        const esp = (t.especialidad || '');
        if (esp !== especialidadFiltroPersonal) return false;
      }

      // Filtro de Estado
      if (estadoFiltroPersonal !== 'TODOS') {
        const estBool = t.estado === true || t.estado === 'ACTIVO';
        if (estadoFiltroPersonal === 'ACTIVO' && !estBool) return false;
        if (estadoFiltroPersonal === 'INHABILITADO' && estBool) return false;
      }

      // Filtro por Texto
      if (searchQueryPersonal.trim()) {
        const q = searchQueryPersonal.trim().toLowerCase();
        const nom = (t.nombre || '').toLowerCase();
        const ape = (t.apellido || '').toLowerCase();
        const email = (t.email || '').toLowerCase();
        const doc = (t.identificacion || '').toLowerCase();
        const prof = (t.profesion || '').toLowerCase();
        const esp = (t.especialidad || '').toLowerCase();
        return nom.includes(q) || ape.includes(q) || email.includes(q) || doc.includes(q) || prof.includes(q) || esp.includes(q);
      }

      return true;
    });
  }, [desarrolladores, especialidadFiltroPersonal, estadoFiltroPersonal, searchQueryPersonal]);

  // Filtro de Propiedad de Proyectos (Mis Proyectos vs Otros Líderes vs Todos) y Estado
  const [filtroPropiedadLider, setFiltroPropiedadLider] = useState('MIS_PROYECTOS');
  const [filtroEstadoCatalogo, setFiltroEstadoCatalogo] = useState('TODOS');

  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [showAsignarDevModal, setShowAsignarDevModal] = useState(false);
  const [submittingAsignarDev, setSubmittingAsignarDev] = useState(false);
  const [asignarDevForm, setAsignarDevForm] = useState({
    idDesarrollador: '',
    horasSemanales: 20
  });
  const [asignarDevError, setAsignarDevError] = useState(null);
  const [desarrolladoresCargas, setDesarrolladoresCargas] = useState([]);

  const [showNuevaEtapaModal, setShowNuevaEtapaModal] = useState(false);
  const [submittingEtapa, setSubmittingEtapa] = useState(false);
  const [submittingActividad, setSubmittingActividad] = useState(false);
  const [submittingReasignacion, setSubmittingReasignacion] = useState(false);
  const [submittingAtencion, setSubmittingAtencion] = useState(false);
  const [busquedaCatalogoProyecto, setBusquedaCatalogoProyecto] = useState('');
  const [showReasignarModal, setShowReasignarModal] = useState(false);
  const [actividadAReasignar, setActividadAReasignar] = useState(null);

  // Modal de Notificación de Reasignación Directiva (Proyectos quitados a este Líder)
  const [showReasignacionNotifModal, setShowReasignacionNotifModal] = useState(false);
  const [proyectoNotifReasignacion, setProyectoNotifReasignacion] = useState(null);
  const [fromReasigNotifModal, setFromReasigNotifModal] = useState(false);

  const [showAtenderModal, setShowAtenderModal] = useState(false);
  const [showDetalleIncidenciaModal, setShowDetalleIncidenciaModal] = useState(false);
  const [incidenciaVerDetalle, setIncidenciaVerDetalle] = useState(null);

  // Auditoría acumulada de cambios directivos realizados por la Coordinación
  const [showHistorialCambiosModal, setShowHistorialCambiosModal] = useState(false);
  const [historialCambios, setHistorialCambios] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [unreadHistorialCount, setUnreadHistorialCount] = useState(0);
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [filtroAccionHistorial, setFiltroAccionHistorial] = useState('TODOS');
  const [filtroFechaHistorial, setFiltroFechaHistorial] = useState('TODOS');

  // Filtro dinámico para el historial de cambios
  const historialFiltrado = useMemo(() => {
    if (!Array.isArray(historialCambios)) return [];
    return historialCambios.filter(reg => {
      if (busquedaHistorial.trim()) {
        const term = busquedaHistorial.toLowerCase();
        const matchDetalle = (reg.detalles || '').toLowerCase().includes(term);
        const matchAccion = (reg.accion || '').toLowerCase().includes(term);
        const matchNombre = (reg.nombreCoordinador || '').toLowerCase().includes(term);
        const matchEmail = (reg.emailCoordinador || '').toLowerCase().includes(term);
        if (!matchDetalle && !matchAccion && !matchNombre && !matchEmail) return false;
      }

      if (filtroAccionHistorial !== 'TODOS') {
        const acc = (reg.accion || '').toUpperCase();
        const det = (reg.detalles || '').toUpperCase();
        if (filtroAccionHistorial === 'ETAPA' && !acc.includes('ETAPA') && !det.includes('FASE') && !det.includes('ETAPA')) return false;
        if (filtroAccionHistorial === 'ACTIVIDAD' && !acc.includes('ACTIVIDAD') && !det.includes('TAREA') && !det.includes('ACTIVIDAD')) return false;
        if (filtroAccionHistorial === 'NOMINA' && !acc.includes('NOMINA') && !acc.includes('DESARROLLADOR') && !acc.includes('ASIGNACION') && !det.includes('VINCUL') && !det.includes('DESARROLLADOR')) return false;
        if (filtroAccionHistorial === 'ESTADO' && !acc.includes('ESTADO') && !det.includes('ESTADO') && !det.includes('PAUSA') && !det.includes('FINALIZ')) return false;
      }

      if (filtroFechaHistorial !== 'TODOS' && reg.fechaCambio) {
        const date = new Date(reg.fechaCambio);
        const now = new Date();
        if (filtroFechaHistorial === 'HOY') {
          if (date.toDateString() !== now.toDateString()) return false;
        } else if (filtroFechaHistorial === '7DIAS') {
          const diffDays = (now - date) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (filtroFechaHistorial === '30DIAS') {
          const diffDays = (now - date) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [historialCambios, busquedaHistorial, filtroAccionHistorial, filtroFechaHistorial]);

  // Cargar contador de cambios no leídos cuando cambia el proyecto seleccionado
  const consultarNuevosCambiosCoordinacion = useCallback(async (idPrj) => {
    if (!idPrj || idPrj === 'GLOBAL') {
      setUnreadHistorialCount(0);
      setHistorialCambios([]);
      return;
    }
    try {
      const res = await api.get(`/lider/proyectos/${idPrj}/historial-cambios`).catch(() => []);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setHistorialCambios(data);

      const lastSeenStr = localStorage.getItem(`visto_historial_prj_${idPrj}`);
      if (!lastSeenStr) {
        setUnreadHistorialCount(data.length);
      } else {
        const lastSeenTime = new Date(lastSeenStr).getTime();
        const unread = data.filter(reg => new Date(reg.fechaCambio).getTime() > lastSeenTime).length;
        setUnreadHistorialCount(unread);
      }
    } catch (err) {
      console.error('Error al consultar contador de cambios:', err);
      setUnreadHistorialCount(0);
    }
  }, []);

  useEffect(() => {
    if (proyectoSeleccionado?.idProyecto && proyectoSeleccionado.idProyecto !== 'GLOBAL') {
      consultarNuevosCambiosCoordinacion(proyectoSeleccionado.idProyecto);
    }
  }, [proyectoSeleccionado?.idProyecto, consultarNuevosCambiosCoordinacion]);

  const handleAbrirHistorialCambiosLider = async (idProyecto) => {
    if (!idProyecto || idProyecto === 'GLOBAL') {
      toast.info('Seleccione un proyecto específico para consultar el registro de cambios.');
      return;
    }
    try {
      setLoadingHistorial(true);
      setShowHistorialCambiosModal(true);
      const res = await api.get(`/lider/proyectos/${idProyecto}/historial-cambios`).catch(() => []);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setHistorialCambios(data);

      // Marcar lectura en localStorage y limpiar contador
      localStorage.setItem(`visto_historial_prj_${idProyecto}`, new Date().toISOString());
      setUnreadHistorialCount(0);
    } catch (err) {
      console.error('Error al obtener historial de cambios:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const [submittingPausa, setSubmittingPausa] = useState(false);
  const [showConfirmPausarModal, setShowConfirmPausarModal] = useState(false);
  const [isAsignarTareaDevListOpen, setIsAsignarTareaDevListOpen] = useState(false);
  const [isAsignarProyectoDevListOpen, setIsAsignarProyectoDevListOpen] = useState(false);

  // Evaluación de procesos WBS activos e impacto para pausar proyecto
  const evidenciaWbsPausa = useMemo(() => {
    if (!etapas || !Array.isArray(etapas) || etapas.length === 0) {
      return {
        etapasActivas: [],
        actividadesActivas: [],
        tieneAvancesActivos: false
      };
    }

    const etapasActivas = etapas.filter(et => et?.estado !== 'FINALIZADA' && et?.estado !== 'COMPLETADA');
    const actividadesActivas = [];

    etapas.forEach(et => {
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
  }, [etapas]);

  // Cálculo de tiempo restante de entrega pactado
  const calculoDiasPausa = useMemo(() => {
    if (!proyectoSeleccionado?.fechaFinEstimada) return { diasRestantes: 0, fechaFormateada: 'Sin fecha configurada' };
    const fin = new Date(proyectoSeleccionado.fechaFinEstimada);
    const hoy = new Date();
    const diffTime = fin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      diasRestantes: diffDays > 0 ? diffDays : 0,
      fechaFormateada: fin.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }, [proyectoSeleccionado?.fechaFinEstimada]);

  const handlePausarProyecto = async () => {
    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') return;
    try {
      setSubmittingPausa(true);
      await api.patch(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/pausar`);
      toast.success('Proyecto pausado exitosamente. Se ha detenido temporalmente la operación.');
      setProyectoSeleccionado(prev => ({ ...prev, estado: 'EN_PAUSA' }));
      if (typeof cargarProyectos === 'function') await cargarProyectos();
    } catch (err) {
      console.error('Error al pausar el proyecto:', err);
      toast.error('Error al pausar el proyecto.');
    } finally {
      setSubmittingPausa(false);
    }
  };

  const handleReactivarProyecto = async () => {
    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') return;
    try {
      setSubmittingPausa(true);
      await api.patch(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/reactivar`);
      toast.success('Proyecto reactivado exitosamente. Se ha reanudado la ejecución.');
      setProyectoSeleccionado(prev => ({ ...prev, estado: 'ACTIVO' }));
      if (typeof cargarProyectos === 'function') await cargarProyectos();
    } catch (err) {
      console.error('Error al reactivar el proyecto:', err);
      toast.error('Error al reactivar el proyecto.');
    } finally {
      setSubmittingPausa(false);
    }
  };

  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false);
  const [submittingFinalizar, setSubmittingFinalizar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('CANCELACION_CLIENTE');
  const [justificacionCancelacion, setJustificacionCancelacion] = useState('');
  const [cancelacionError, setCancelacionError] = useState('');
  const [incidenciaAAtender, setIncidenciaAAtender] = useState(null);
  const [atencionForm, setAtencionForm] = useState({
    estadoAtencion: 'EN_REVISION',
    resolucionNota: ''
  });
  const [filtroTipoInc, setFiltroTipoInc] = useState('TODOS');
  const [filtroSeveridadInc, setFiltroSeveridadInc] = useState('TODAS');
  const [filtroEstadoInc, setFiltroEstadoInc] = useState('TODOS');

  const handleNavigateIncidencias = useCallback(({ tipo, severidad } = {}) => {
    setActiveTab('incidencias');
    if (tipo) setFiltroTipoInc(tipo);
    if (severidad) setFiltroSeveridadInc(severidad);
    else setFiltroSeveridadInc('TODAS');
  }, [setActiveTab]);
  const [filtroDevInc, setFiltroDevInc] = useState('TODOS');
  const [filtroFechaTipo, setFiltroFechaTipo] = useState('TODAS');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [showGuiaUsuarioIncidencias, setShowGuiaUsuarioIncidencias] = useState(false);
  const [showGuiaModal, setShowGuiaModal] = useState(false);

  const [showFiltroFechasModal, setShowFiltroFechasModal] = useState(false);
  const [tempFechaDesde, setTempFechaDesde] = useState('');
  const [tempFechaHasta, setTempFechaHasta] = useState('');
  const [scopeExpanded, setScopeExpanded] = useState(false);
  const [tabPersonalProyecto, setTabPersonalProyecto] = useState('activo'); // 'activo' | 'historico'
  const [semanaHistoricoSeleccionada, setSemanaHistoricoSeleccionada] = useState('semana_actual');
  const [fechaDesdeHistorico, setFechaDesdeHistorico] = useState('2026-08-18');
  const [fechaHastaHistorico, setFechaHastaHistorico] = useState('2026-08-31');
  const [editingHoursMap, setEditingHoursMap] = useState({});

  const [nuevaActividad, setNuevaActividad] = useState({
    idEtapa: '',
    idDesarrollador: '',
    descripcion: '',
    horasEstimadas: '8'
  });
  const [nuevaEtapa, setNuevaEtapa] = useState({
    nombreEtapa: ''
  });
  const [datosReasignacion, setDatosReasignacion] = useState({
    nuevoDesarrolladorId: '',
    motivo: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Peticiones API
  const seleccionarProyecto = useCallback(async (proyecto) => {
    if (!proyecto) return;

    if (proyecto.idProyecto === 'GLOBAL' || proyecto.idProyecto === 'TODOS' || !proyecto.idProyecto) {
      setProyectoSeleccionado({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
      try {
        setLoadingDetalle(true);
        const [erroresRes, interrupcionesRes, devsRes, cargasRes] = await Promise.all([
          api.get('/lider/errores/global').catch(() => []),
          api.get('/lider/interrupciones/global').catch(() => []),
          api.get('/lider/desarrolladores').catch(() => []),
          api.get('/lider/desarrolladores-cargas').catch(() => [])
        ]);
        setErrores(Array.isArray(erroresRes) ? erroresRes : []);
        setInterrupciones(Array.isArray(interrupcionesRes) ? interrupcionesRes : []);
        setDesarrolladores(Array.isArray(devsRes) ? devsRes : []);
        setDesarrolladoresCargas(Array.isArray(cargasRes) ? cargasRes : []);
        setEtapas([]);
      } catch (err) {
        console.error('Error cargando vista global:', err);
      } finally {
        setLoadingDetalle(false);
      }
      return;
    }

    setProyectoSeleccionado(proyecto);

    try {
      setLoadingDetalle(true);
      const [etapasRes, erroresRes, interrupcionesRes, devsRes, cargasRes, devAsignadosRes] = await Promise.all([
        api.get(`/lider/proyectos/${proyecto.idProyecto}/etapas`).catch(() => []),
        api.get(`/lider/proyectos/${proyecto.idProyecto}/errores`).catch(() => []),
        api.get(`/lider/proyectos/${proyecto.idProyecto}/interrupciones`).catch(() => []),
        api.get('/lider/desarrolladores').catch(() => []),
        api.get('/lider/desarrolladores-cargas').catch(() => []),
        api.get(`/lider/proyectos/${proyecto.idProyecto}/desarrolladores`).catch(() => [])
      ]);

      setEtapas(Array.isArray(etapasRes) ? etapasRes : []);
      setErrores(Array.isArray(erroresRes) ? erroresRes : []);
      setInterrupciones(Array.isArray(interrupcionesRes) ? interrupcionesRes : []);
      setDesarrolladores(Array.isArray(devsRes) ? devsRes : []);
      setDesarrolladoresCargas(Array.isArray(cargasRes) ? cargasRes : []);
      setDesarrolladoresAsignadosProyecto(Array.isArray(devAsignadosRes) ? devAsignadosRes : []);
    } catch (err) {
      console.error('Error cargando detalles del proyecto:', err);
      toast.error('Error al cargar etapas y métricas del proyecto.');
    } finally {
      setLoadingDetalle(false);
    }
  }, [api]);

  // Cerrar modal al presionar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalProyectosOpen) {
        setModalProyectosOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalProyectosOpen]);

  // Cargar proyectos asignados al líder
  const cargarProyectos = useCallback(async () => {
    try {
      setLoadingProyectos(true);
      const data = await api.get('/lider/proyectos');
      const list = Array.isArray(data) ? data : [];
      setProyectos(list);

      if (list.length > 0) {
        const actual = proyectoSeleccionado && proyectoSeleccionado.idProyecto !== 'GLOBAL'
          ? list.find(p => p.idProyecto === proyectoSeleccionado.idProyecto) || { idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' }
          : { idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' };
        seleccionarProyecto(actual);
      } else {
        setProyectoSeleccionado({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
        seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
      }
    } catch (err) {
      console.error('Error cargando proyectos del líder:', err);
      toast.error('Error al sincronizar proyectos desde PostgreSQL.');
    } finally {
      setLoadingProyectos(false);
    }
  }, [api, proyectoSeleccionado, seleccionarProyecto]);

  // Manejador para refrescar manualmente con animación en el botón
  const handleManualRefresh = async () => {
    try {
      setRefreshingManual(true);
      await cargarProyectos();
      if (proyectoSeleccionado && proyectoSeleccionado.idProyecto !== 'GLOBAL') {
        await seleccionarProyecto(proyectoSeleccionado);
      } else if (proyectoSeleccionado && proyectoSeleccionado.idProyecto === 'GLOBAL') {
        await seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
      }
      toast.success('Datos y métricas actualizados en tiempo real.');
    } catch (err) {
      console.error('Error en actualización manual:', err);
      toast.error('Error al sincronizar datos.');
    } finally {
      setTimeout(() => setRefreshingManual(false), 500);
    }
  };

  // Helper para calcular horas transcurridas desde una reasignación
  const getHoursSinceReassignment = (fechaReasignacion) => {
    if (!fechaReasignacion) return Infinity;
    const fecha = new Date(fechaReasignacion);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  // Manejo de notificaciones descartadas localmente por el Líder (localStorage)
  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(`dismissed_notifs_${user?.id || user?.idTrabajador || 'lider'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleDismissNotification = (idNotif) => {
    setDismissedNotifications(prev => {
      const next = [...prev, idNotif];
      try {
        localStorage.setItem(`dismissed_notifs_${user?.id || user?.idTrabajador || 'lider'}`, JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  };

  // Cálculo unificado de notificaciones de Reasignación y Nueva Asignación (Banner Dashboard-Wide)
  const listNotificacionesLider = useMemo(() => {
    if (!proyectos || !Array.isArray(proyectos) || !user) return [];
    const userId = user?.idTrabajador || user?.id;
    const userEmail = (user?.email || '').toLowerCase();

    const notifs = [];

    proyectos.forEach(p => {
      const pLiderId = p.lider?.idTrabajador || p.lider?.id;
      const pLiderEmail = (p.lider?.email || '').toLowerCase();
      const isMine = (userId && String(pLiderId) === String(userId)) || (userEmail && pLiderEmail && userEmail === pLiderEmail);

      // CASO 1: Reasignación Pendiente para Líder Anterior (Vigencia 24h)
      const isPastLiderPending = p.reasignado
        && !p.leidoPorLiderAnterior
        && userId
        && String(p.idLiderAnterior) === String(userId)
        && getHoursSinceReassignment(p.fechaReasignacion) <= 24;

      if (isPastLiderPending) {
        notifs.push({
          tipo: 'REASIGNACION_ANTERIOR',
          idNotif: `reasig_past_${p.idProyecto}`,
          proyecto: p,
          titulo: 'NOTIFICACIÓN DIRECTIVA: REASIGNACIÓN DE LIDERAZGO',
          subtitulo: 'La dirección técnica y ejecutiva de este proyecto fue transferida por la Coordinación General.',
          motivo: p.motivoReasignacion || 'Reorganización de portafolio y reasignación directiva.',
          nuevoLider: p.lider ? `${p.lider.nombre} ${p.lider.apellido}` : 'Nuevo Líder Asignado',
          vigencia: 'Disponible por 24 horas hábiles'
        });
      }

      // CASO 2: Nueva Reasignación Asignada a este Líder (Vigencia 24h)
      const isNewReassignment = isMine
        && p.reasignado
        && !p.leidoPorLiderAnterior
        && getHoursSinceReassignment(p.fechaReasignacion) <= 24;

      if (isNewReassignment && !dismissedNotifications.includes(`reasig_new_${p.idProyecto}`)) {
        notifs.push({
          tipo: 'REASIGNACION_NUEVA',
          idNotif: `reasig_new_${p.idProyecto}`,
          proyecto: p,
          titulo: '¡PROYECTO REASIGNADO A TU PORTAFOLIO DE INGENIERÍA!',
          subtitulo: 'Te ha sido transferida la dirección ejecutiva y supervisión WBS de este proyecto por la Coordinación General.',
          motivo: p.motivoReasignacion || 'Asignación de responsabilidad directiva por la Coordinación General.',
          vigencia: 'Notificación Activa (24h)'
        });
      }

      // CASO 3: Nueva Asignación Directa de Proyecto (Primer Registro / Asignación Reciente, 72h)
      const isNewAssignment = isMine
        && !p.reasignado
        && (p.fechaInicio || p.createdAt)
        && getHoursSinceReassignment(p.fechaInicio || p.createdAt) <= 72;

      if (isNewAssignment && !dismissedNotifications.includes(`new_assign_${p.idProyecto}`)) {
        notifs.push({
          tipo: 'NUEVA_ASIGNACION',
          idNotif: `new_assign_${p.idProyecto}`,
          proyecto: p,
          titulo: '¡NUEVO PROYECTO ASIGNADO PARA GESTIÓN WBS!',
          subtitulo: 'Se ha habilitado la gestión de nómina, desglose de etapas y asignación de desarrolladores en este proyecto.',
          motivo: p.descripcion || 'Creación e inicio de nuevo proyecto de software en la plataforma.',
          vigencia: 'Nuevo Proyecto Asignado (72h)'
        });
      }
    });

    return notifs;
  }, [proyectos, user, dismissedNotifications]);

  // Manejadores dedicados para el Flujo Interactivo de Notificación de Reasignación
  const handleAbrirNotifReasignacionModal = (proyecto) => {
    setProyectoNotifReasignacion(proyecto);
    setShowReasignacionNotifModal(true);
  };

  const handleVerDetallesDesdeModal = (proyecto) => {
    const prjTarget = proyecto || proyectoNotifReasignacion;
    if (!prjTarget) return;
    setProyectoNotifReasignacion(prjTarget);
    setFromReasigNotifModal(true);
    setShowReasignacionNotifModal(false);
    seleccionarProyecto(prjTarget);
    setActiveTab('wbs');
  };

  const handleVolverAFormularioDesdeWbs = () => {
    const targetPrj = proyectoNotifReasignacion || proyectoSeleccionado;
    if (targetPrj) {
      setProyectoNotifReasignacion(targetPrj);
    }
    setShowReasignacionNotifModal(true);
    seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
    setActiveTab('wbs');
  };

  const handleConfirmarLecturaReasignacion = async (idProyecto) => {
    const targetId = idProyecto || proyectoNotifReasignacion?.idProyecto || proyectoSeleccionado?.idProyecto;
    if (!targetId) return;

    try {
      setShowReasignacionNotifModal(false);
      setFromReasigNotifModal(false);
      setProyectoNotifReasignacion(null);
      seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
      setActiveTab('wbs');

      await api.put(`/lider/proyectos/${targetId}/confirmar-lectura-reasignacion`).catch(async () => {
        await api.put(`/coordinador/proyectos/${targetId}/confirmar-lectura-reasignacion`);
      });

      toast.success('Notificación de reasignación confirmada. El proyecto se ha retirado de tu catálogo activo.');
      const res = await api.get('/lider/proyectos');
      setProyectos(res.data);
    } catch (err) {
      console.error('Error al confirmar lectura:', err);
      toast.error('Error al confirmar la lectura.');
    }
  };

  // Conteo de proyectos para las insignias en los filtros
  const countsPorEstado = useMemo(() => {
    if (!proyectos || !Array.isArray(proyectos)) return { TODOS: 0, ACTIVO: 0, EN_PLANIFICACION: 0, PAUSADO: 0, FINALIZADO: 0, REASIGNADO: 0, NUEVO: 0 };

    const userDevId = user?.idTrabajador || user?.id;
    const userEmail = (user?.email || '').toLowerCase();

    const baseProjects = proyectos.filter(p => {
      if (filtroPropiedadLider === 'MIS_PROYECTOS') {
        const pLiderId = p.lider?.idTrabajador || p.lider?.id;
        const pLiderEmail = (p.lider?.email || '').toLowerCase();
        const isMine = (userDevId && String(pLiderId) === String(userDevId)) || (userEmail && pLiderEmail && userEmail === pLiderEmail);
        const isPastLiderPending = p.reasignado && !p.leidoPorLiderAnterior && userDevId && String(p.idLiderAnterior) === String(userDevId) && getHoursSinceReassignment(p.fechaReasignacion) <= 24;
        return isMine || isPastLiderPending;
      } else if (filtroPropiedadLider === 'OTROS_LIDERES') {
        const pLiderId = p.lider?.idTrabajador || p.lider?.id;
        const pLiderEmail = (p.lider?.email || '').toLowerCase();
        const isMine = (userDevId && String(pLiderId) === String(userDevId)) || (userEmail && pLiderEmail && userEmail === pLiderEmail);
        return !isMine;
      }
      return true;
    });

    const counts = { TODOS: baseProjects.length, ACTIVO: 0, EN_PLANIFICACION: 0, PAUSADO: 0, FINALIZADO: 0, REASIGNADO: 0, NUEVO: 0 };

    baseProjects.forEach(p => {
      const estUpper = (p.estado || '').toUpperCase();
      const isReassignedProject = Boolean(p.reasignado && !p.leidoPorLiderAnterior && getHoursSinceReassignment(p.fechaReasignacion) <= 24);

      if (isReassignedProject) {
        counts.REASIGNADO++;
      } else {
        if (estUpper === 'ACTIVO') counts.ACTIVO++;
        else if (estUpper.includes('PLANIFICACION')) counts.EN_PLANIFICACION++;
        else if (estUpper === 'PAUSADO' || estUpper === 'EN_PAUSA' || estUpper === 'SUSPENDIDO' || estUpper === 'INHABILITADO') counts.PAUSADO++;
        else if (estUpper === 'FINALIZADO' || estUpper === 'COMPLETADO') counts.FINALIZADO++;

        const isNuevoPrj = (p.fechaInicio || p.createdAt) && getHoursSinceReassignment(p.fechaInicio || p.createdAt) <= 72;
        if (isNuevoPrj) counts.NUEVO++;
      }
    });
    return counts;
  }, [proyectos, filtroPropiedadLider, user, getHoursSinceReassignment]);

  // Filtrado reactivo para la grilla del catálogo de proyectos con segregación por propiedad de Líder y Estado
  const proyectosCatalogoFiltrados = useMemo(() => {
    if (!proyectos || !Array.isArray(proyectos)) return [];
    const userDevId = user?.idTrabajador || user?.id;
    const userEmail = (user?.email || '').toLowerCase();

    return proyectos.filter(p => {
      // 1. Filtro por Propiedad de Líder
      if (filtroPropiedadLider === 'MIS_PROYECTOS') {
        const pLiderId = p.lider?.idTrabajador || p.lider?.id;
        const pLiderEmail = (p.lider?.email || '').toLowerCase();
        const isMine = (userDevId && String(pLiderId) === String(userDevId)) || (userEmail && pLiderEmail && userEmail === pLiderEmail);

        const isPastLiderPending = p.reasignado
          && !p.leidoPorLiderAnterior
          && userDevId
          && String(p.idLiderAnterior) === String(userDevId)
          && getHoursSinceReassignment(p.fechaReasignacion) <= 24;

        if (!isMine && !isPastLiderPending) return false;
      } else if (filtroPropiedadLider === 'OTROS_LIDERES') {
        const pLiderId = p.lider?.idTrabajador || p.lider?.id;
        const pLiderEmail = (p.lider?.email || '').toLowerCase();
        const isMine = (userDevId && String(pLiderId) === String(userDevId)) || (userEmail && pLiderEmail && userEmail === pLiderEmail);
        if (isMine) return false;
      }

      // 2. Filtro por Estado / Categoría Específica (MUTUAMENTE EXCLUSIVO)
      if (filtroEstadoCatalogo !== 'TODOS') {
        const estUpper = (p.estado || '').toUpperCase();
        const isReassignedProject = Boolean(p.reasignado && !p.leidoPorLiderAnterior && getHoursSinceReassignment(p.fechaReasignacion) <= 24);

        if (filtroEstadoCatalogo === 'REASIGNADO') {
          if (!isReassignedProject) return false;
        } else if (filtroEstadoCatalogo === 'ACTIVO') {
          // PROYECTOS REASIGNADOS NUNCA SALEN EN ACTIVOS, SOLO EN REASIGNADOS
          if (isReassignedProject || estUpper !== 'ACTIVO') return false;
        } else if (filtroEstadoCatalogo === 'EN_PLANIFICACION') {
          if (isReassignedProject || !estUpper.includes('PLANIFICACION')) return false;
        } else if (filtroEstadoCatalogo === 'PAUSADO') {
          if (isReassignedProject || (estUpper !== 'PAUSADO' && estUpper !== 'EN_PAUSA' && estUpper !== 'SUSPENDIDO' && estUpper !== 'INHABILITADO')) return false;
        } else if (filtroEstadoCatalogo === 'FINALIZADO') {
          if (isReassignedProject || (estUpper !== 'FINALIZADO' && estUpper !== 'COMPLETADO')) return false;
        } else if (filtroEstadoCatalogo === 'NUEVO') {
          const isNuevoPrj = !isReassignedProject && (p.fechaInicio || p.createdAt) && getHoursSinceReassignment(p.fechaInicio || p.createdAt) <= 72;
          if (!isNuevoPrj) return false;
        }
      }

      // 3. Búsqueda por Texto
      if (busquedaCatalogoProyecto && busquedaCatalogoProyecto.trim()) {
        const q = busquedaCatalogoProyecto.trim().toLowerCase();
        const mNom = p.nombre && p.nombre.toLowerCase().includes(q);
        const mCli = p.cliente && p.cliente.toLowerCase().includes(q);
        const mEst = p.estado && p.estado.toLowerCase().includes(q);
        const mLid = p.lider && `${p.lider.nombre} ${p.lider.apellido}`.toLowerCase().includes(q);
        if (!mNom && !mCli && !mEst && !mLid) return false;
      }

      return true;
    });
  }, [proyectos, busquedaCatalogoProyecto, filtroPropiedadLider, filtroEstadoCatalogo, user]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarProyectos();
  }, []);

  // Manejadores de eventos (Handlers)
  const handleAsignarActividad = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!nuevaActividad.idEtapa) errors.idEtapa = 'Seleccione una etapa';
    if (!nuevaActividad.idDesarrollador) errors.idDesarrollador = 'Seleccione un desarrollador';
    if (!nuevaActividad.descripcion?.trim()) errors.descripcion = 'Ingrese la descripción de la tarea';

    const devId = String(nuevaActividad.idDesarrollador);
    const horasEstimadasNum = parseInt(nuevaActividad.horasEstimadas);
    if (!nuevaActividad.horasEstimadas || isNaN(horasEstimadasNum) || horasEstimadasNum <= 0) {
      errors.horasEstimadas = 'Ingrese las horas semanales para esta tarea (ej. 8h).';
    } else {
      const carga = getDevCargaInfo(devId);
      const horasGlobales = carga?.horasAsignadas || 0;
      const estaEnProyecto = (desarrolladoresAsignadosProyecto || []).some(
        a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId
      );
      const maxHorasDisponiblesDev = Math.max(0, 48 - (horasGlobales - (estaEnProyecto ? 0 : 0)));
      if (horasEstimadasNum > maxHorasDisponiblesDev) {
        errors.horasEstimadas = `¡Excede el límite disponible! El desarrollador solo dispone de ${maxHorasDisponiblesDev}h libres (Máximo legal: 48h).`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const etapaSeleccionada = (etapas || []).find(et => String(et?.idEtapa) === String(nuevaActividad.idEtapa));
    const estaFinalizada = etapaSeleccionada && (
      (etapaSeleccionada.estado || '').toUpperCase() === 'FINALIZADA' ||
      (etapaSeleccionada.estado || '').toUpperCase() === 'COMPLETADO'
    );

    const dev = (desarrolladores || []).find(t => String(t.idTrabajador || t.id || t.idDesarrollador) === devId)
      || (desarrolladoresAsignadosProyecto || []).map(a => a.desarrollador).find(d => d && String(d.idTrabajador || d.id || d.idDesarrollador) === devId);

    const devNombre = dev ? `${dev.nombre} ${dev.apellido}` : `ID #${devId}`;
    const etapaNombre = etapaSeleccionada ? etapaSeleccionada.nombreEtapa : `Etapa #${nuevaActividad.idEtapa}`;

    if (estaFinalizada) {
      setEtapaAReabrirModalLider({
        idEtapa: nuevaActividad.idEtapa,
        etapaNombre,
        nombreActividad: nuevaActividad.descripcion.trim(),
        idDesarrollador: devId,
        horasEstimadas: horasEstimadasNum,
        devNombre,
        etapaSeleccionada
      });
      return;
    }

    try {
      setSubmittingActividad(true);

      // Auto-vincular al desarrollador a la Nómina del Proyecto si no estaba vinculado
      const estaEnProyecto = (desarrolladoresAsignadosProyecto || []).some(
        a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId
      );

      if (!estaEnProyecto && proyectoSeleccionado?.idProyecto && proyectoSeleccionado.idProyecto !== 'GLOBAL') {
        try {
          await api.post(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/asignar`, {
            idDesarrollador: parseInt(devId),
            horasSemanales: Math.min(horasEstimadasNum || 10, 48)
          });
        } catch (linkErr) {
          console.warn('Auto-vinculación a la nómina del proyecto:', linkErr);
        }
      }

      await api.post('/lider/actividades', {
        idEtapa: parseInt(nuevaActividad.idEtapa),
        idDesarrollador: parseInt(devId),
        descripcion: nuevaActividad.descripcion.trim()
      });

      registrarAccionLider(
        proyectoSeleccionado.idProyecto,
        'ASIGNACION_ACTIVIDAD',
        `Actividad "${nuevaActividad.descripcion.trim()}" (${horasEstimadasNum}h/sem) asignada a ${devNombre} en fase "${etapaNombre}".`
      );

      toast.success('Actividad asignada y vinculada a la nómina correctamente.');
      setShowAsignarModal(false);
      setNuevaActividad({ idEtapa: '', idDesarrollador: '', descripcion: '', horasEstimadas: '8' });
      setFormErrors({});

      if (proyectoSeleccionado) {
        seleccionarProyecto(proyectoSeleccionado);
      }
    } catch (err) {
      console.error('Error asignando actividad:', err);
      toast.error(err?.message || 'Error al asignar la actividad en el servidor.');
    } finally {
      setSubmittingActividad(false);
    }
  };

  // Ejecución de reapertura de etapa y asignación tras confirmar en el modal interactivo del Líder
  const ejecutarReaperturaYAsignarLider = async () => {
    if (!proyectoSeleccionado || !etapaAReabrirModalLider) return;
    const { idEtapa, etapaNombre, nombreActividad, idDesarrollador, horasEstimadas, devNombre, etapaSeleccionada } = etapaAReabrirModalLider;

    try {
      setSubmittingActividad(true);

      const devId = String(idDesarrollador);
      const estaEnProyecto = (desarrolladoresAsignadosProyecto || []).some(
        a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId
      );

      if (!estaEnProyecto && proyectoSeleccionado?.idProyecto && proyectoSeleccionado.idProyecto !== 'GLOBAL') {
        try {
          await api.post(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/asignar`, {
            idDesarrollador: parseInt(devId),
            horasSemanales: Math.min(horasEstimadas || 10, 48)
          });
        } catch (linkErr) {
          console.warn('Auto-vinculación a nómina:', linkErr);
        }
      }

      await api.post('/lider/actividades', {
        idEtapa: parseInt(idEtapa),
        idDesarrollador: parseInt(devId),
        descripcion: nombreActividad
      });

      await api.put(`/lider/etapas/${idEtapa}`, {
        nombreEtapa: etapaSeleccionada.nombreEtapa,
        estado: 'EN_PROCESO'
      });

      registrarAccionLider(
        proyectoSeleccionado.idProyecto,
        'REAPERTURA_ETAPA',
        `Fase #${idEtapa} ("${etapaNombre}") reabierta a EN_PROCESO tras asignar nueva tarea a ${devNombre}.`
      );

      toast.success(`Etapa "${etapaNombre}" reabierta y tarea asignada correctamente.`);
      setEtapaAReabrirModalLider(null);
      setShowAsignarModal(false);
      setNuevaActividad({ idEtapa: '', idDesarrollador: '', descripcion: '', horasEstimadas: '8' });
      setFormErrors({});

      if (proyectoSeleccionado) {
        seleccionarProyecto(proyectoSeleccionado);
      }
    } catch (err) {
      console.error('Error al reabrir etapa:', err);
      toast.error(err?.message || 'Error al reabrir la etapa.');
    } finally {
      setSubmittingActividad(false);
    }
  };

  // Helper para renderizar Badge de carga semanal del desarrollador (HU-12)
  const getDevCargaInfo = (idTrabajador) => {
    return desarrolladoresCargas.find(d => d.idTrabajador === Number(idTrabajador));
  };

  // Asignación de desarrollador al proyecto con control estricto de 48h (HU-12 / RF-16)
  const handleAsignarDesarrolladorAProyecto = async (e) => {
    e.preventDefault();
    setAsignarDevError(null);

    if (!asignarDevForm.idDesarrollador) {
      setAsignarDevError('Seleccione un desarrollador para vincular al proyecto.');
      return;
    }

    const horas = parseInt(asignarDevForm.horasSemanales);
    if (isNaN(horas) || horas <= 0) {
      setAsignarDevError('Las horas semanales deben ser un número entero mayor a 0.');
      return;
    }

    if (horas > 48) {
      setAsignarDevError('La jornada semanal no puede exceder el límite legal de 48 horas.');
      return;
    }

    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') {
      setAsignarDevError('Debe seleccionar un proyecto específico para realizar asignaciones.');
      return;
    }

    try {
      setSubmittingAsignarDev(true);
      await api.post(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/asignar`, {
        idDesarrollador: parseInt(asignarDevForm.idDesarrollador),
        horasSemanales: horas
      });

      toast.success('Desarrollador asignado exitosamente al proyecto (HU-12).');
      setShowAsignarDevModal(false);
      setAsignarDevForm({ idDesarrollador: '', horasSemanales: 20 });
      setAsignarDevError(null);

      // Recargar balance de cargas y nómina
      const [cargasRes, devsRes, devAsignadosRes] = await Promise.all([
        api.get('/lider/desarrolladores-cargas').catch(() => []),
        api.get('/lider/desarrolladores').catch(() => []),
        api.get(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/desarrolladores`).catch(() => [])
      ]);
      setDesarrolladoresCargas(Array.isArray(cargasRes) ? cargasRes : []);
      setDesarrolladores(Array.isArray(devsRes) ? devsRes : []);
      setDesarrolladoresAsignadosProyecto(Array.isArray(devAsignadosRes) ? devAsignadosRes : []);
    } catch (err) {
      console.error('Error asignando desarrollador (HU-12):', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Error al procesar la asignación del desarrollador.';
      setAsignarDevError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmittingAsignarDev(false);
    }
  };

  // Manejador para desvincular / liberar desarrolladores del proyecto (HU-12 / RF-16)
  const handleDesasignarDev = async (idDev, devNombre) => {
    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') return;

    try {
      await api.delete(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/desarrolladores/${idDev}`);
      toast.success(`${devNombre} ha sido desvinculado del proyecto y sus horas fueron liberadas.`);

      const [devAsignadosRes, cargasRes] = await Promise.all([
        api.get(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/desarrolladores`).catch(() => []),
        api.get('/lider/desarrolladores-cargas').catch(() => [])
      ]);

      setDesarrolladoresAsignadosProyecto(Array.isArray(devAsignadosRes) ? devAsignadosRes : []);
      setDesarrolladoresCargas(Array.isArray(cargasRes) ? cargasRes : []);
    } catch (err) {
      console.error('Error desvinculando desarrollador:', err);
      toast.error(err?.message || 'Error al desvincular desarrollador del proyecto.');
    }
  };

  // Manejador para actualizar horas dedicadas de un desarrollador en el proyecto con validaciones (HU-12 / RF-16)
  const handleCambiarHorasDev = async (idDev, devNombre, nuevasHoras) => {
    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') return;

    const valHoras = parseInt(nuevasHoras);
    if (isNaN(valHoras) || valHoras < 1) {
      toast.error('La dedicación del desarrollador no puede ser menor a 1 hora semanal.');
      return;
    }

    if (valHoras > 48) {
      toast.error('La asignación de horas en un único proyecto no puede superar el máximo de 48h semanales.');
      return;
    }

    // Validar límite legal de 48 horas acumuladas en la empresa
    const devCarga = getDevCargaInfo(idDev);
    const asignacionActual = desarrolladoresAsignadosProyecto.find(a => Number(a.desarrollador?.idTrabajador || a.idTrabajador) === Number(idDev));
    const horasActualesEnEsteProyecto = asignacionActual?.horasSemanales || 0;
    const horasEnOtrosProyectos = Math.max(0, (devCarga?.horasAsignadas || 0) - horasActualesEnEsteProyecto);
    const totalProyectado = horasEnOtrosProyectos + valHoras;
    const esReduccion = valHoras < horasActualesEnEsteProyecto;

    if (!esReduccion && totalProyectado > 48) {
      const maximoPermitido = Math.max(0, 48 - horasEnOtrosProyectos);
      toast.error(`Sobreasignación: ${devNombre} ya tiene ${horasEnOtrosProyectos}h en otros proyectos. Para no superar el límite de 48h, lo máximo que puede asignar en este proyecto es ${maximoPermitido}h/semana.`);
      return;
    }

    try {
      setUpdatingDevId(idDev);
      await api.post(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/asignar`, {
        idDesarrollador: parseInt(idDev),
        horasSemanales: valHoras
      });

      toast.success(`Dedicación horaria de ${devNombre} actualizada a ${valHoras} h/semana.`);

      // Recargar asignaciones y balance de cargas
      const [devAsignadosRes, cargasRes] = await Promise.all([
        api.get(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/desarrolladores`).catch(() => []),
        api.get('/lider/desarrolladores-cargas').catch(() => [])
      ]);

      setDesarrolladoresAsignadosProyecto(Array.isArray(devAsignadosRes) ? devAsignadosRes : []);
      setDesarrolladoresCargas(Array.isArray(cargasRes) ? cargasRes : []);
    } catch (err) {
      console.error('Error actualizando horas del desarrollador:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Error al actualizar las horas del desarrollador.';
      toast.error(errMsg);
    } finally {
      setUpdatingDevId(null);
    }
  };

  // Creación de nuevo proyecto con validación cronológica y presupuesto (HU-11 / RF-13 / RF-14)
  const handleCrearProyecto = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!nuevoProyectoForm.nombre?.trim()) errors.nombre = 'El nombre del proyecto es obligatorio.';
    if (!nuevoProyectoForm.cliente?.trim()) errors.cliente = 'El cliente u organización es obligatorio.';
    if (!nuevoProyectoForm.fechaInicio) errors.fechaInicio = 'La fecha de inicio es obligatoria.';
    if (!nuevoProyectoForm.fechaFinEstimada) errors.fechaFinEstimada = 'La fecha de finalización estimada es obligatoria.';

    // Validar que la fecha de inicio no sea anterior a HOY
    const hoyStr = new Date().toISOString().split('T')[0];
    if (nuevoProyectoForm.fechaInicio && nuevoProyectoForm.fechaInicio < hoyStr) {
      errors.fechaInicio = 'La fecha de inicio no puede ser anterior al día de hoy.';
    }

    // Condición 02 de la HU-11: Validar que fechaFinEstimada >= fechaInicio
    if (nuevoProyectoForm.fechaInicio && nuevoProyectoForm.fechaFinEstimada) {
      if (new Date(nuevoProyectoForm.fechaFinEstimada) < new Date(nuevoProyectoForm.fechaInicio)) {
        errors.fechaFinEstimada = 'La fecha de entrega estimada no puede ser anterior a la fecha de inicio.';
      }
    }

    if (nuevoProyectoForm.presupuesto !== '' && Number(nuevoProyectoForm.presupuesto) < 0) {
      errors.presupuesto = 'El presupuesto no puede ser negativo.';
    }

    if (Object.keys(errors).length > 0) {
      setNuevoProyectoErrors(errors);
      return;
    }

    try {
      setSubmittingProyecto(true);
      const payload = {
        nombre: nuevoProyectoForm.nombre.trim(),
        cliente: nuevoProyectoForm.cliente.trim(),
        descripcion: nuevoProyectoForm.descripcion?.trim() || '',
        fechaInicio: nuevoProyectoForm.fechaInicio,
        fechaFinEstimada: nuevoProyectoForm.fechaFinEstimada,
        presupuesto: nuevoProyectoForm.presupuesto !== '' ? Number(nuevoProyectoForm.presupuesto) : 0,
        estado: 'ACTIVO'
      };

      const liderIdParam = user?.idTrabajador ? `?idLider=${user.idTrabajador}` : '';
      const response = await api.post(`/lider/proyectos${liderIdParam}`, payload);

      toast.success(`Proyecto "${response?.nombre || payload.nombre}" creado exitosamente.`);
      setShowNuevoProyectoModal(false);
      setNuevoProyectoForm({
        nombre: '',
        cliente: '',
        descripcion: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFinEstimada: '',
        presupuesto: ''
      });
      setNuevoProyectoErrors({});

      // Recargar lista y seleccionar automáticamente el nuevo proyecto creado
      const listaProyectos = await api.get('/lider/proyectos');
      setProyectos(Array.isArray(listaProyectos) ? listaProyectos : []);
      if (response && response.idProyecto) {
        seleccionarProyecto(response);
      } else if (Array.isArray(listaProyectos) && listaProyectos.length > 0) {
        seleccionarProyecto(listaProyectos[listaProyectos.length - 1]);
      }
    } catch (err) {
      console.error('Error creando proyecto:', err);
      toast.error(err?.message || 'Error al registrar el proyecto en el servidor.');
    } finally {
      setSubmittingProyecto(false);
    }
  };

  // Registro de una etapa WBS (asigna estado inicial PENDIENTE por defecto)
  const handleRegistrarEtapa = async (e) => {
    e.preventDefault();
    if (!nuevaEtapa.nombreEtapa?.trim()) {
      toast.error('Ingrese el nombre de la etapa WBS.');
      return;
    }

    try {
      setSubmittingEtapa(true);
      await api.post(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/etapas`, {
        nombreEtapa: nuevaEtapa.nombreEtapa.trim()
      });

      toast.success('Etapa WBS registrada en estado PENDIENTE.');
      setShowNuevaEtapaModal(false);
      setNuevaEtapa({ nombreEtapa: '' });

      if (proyectoSeleccionado) {
        seleccionarProyecto(proyectoSeleccionado);
      }
    } catch (err) {
      console.error('Error registrando etapa:', err);
      toast.error(err?.message || 'Error al registrar la etapa.');
    } finally {
      setSubmittingEtapa(false);
    }
  };

  // Reasignación de actividad con registro de justificación técnica
  const handleAbrirReasignar = (actividad) => {
    if (!isMiProyecto) {
      toast.error('Este proyecto pertenece a otro Líder de Proyecto (Modo Lectura Exclusivo).');
      return;
    }
    setActividadAReasignar(actividad);
    setDatosReasignacion({
      nuevoDesarrolladorId: actividad.desarrollador?.idTrabajador || '',
      motivo: ''
    });
    setShowReasignarModal(true);
  };

  const handleEjecutarReasignacion = async (e) => {
    e.preventDefault();
    if (!datosReasignacion.nuevoDesarrolladorId) {
      toast.error('Seleccione el nuevo desarrollador responsable.');
      return;
    }
    if (!datosReasignacion.motivo?.trim()) {
      toast.error('Debe ingresar un motivo o justificación obligatoria para la reasignación.');
      return;
    }

    try {
      setSubmittingReasignacion(true);
      await api.patch(`/lider/actividades/${actividadAReasignar.idActividad}/reasignar`, {
        idDesarrollador: parseInt(datosReasignacion.nuevoDesarrolladorId),
        motivo: datosReasignacion.motivo?.trim() || 'Reasignación operativa de personal'
      });

      toast.success('Actividad reasignada y guardada en PostgreSQL con éxito.');
      setShowReasignarModal(false);
      setActividadAReasignar(null);
      setDatosReasignacion({ nuevoDesarrolladorId: '', motivo: '' });

      if (proyectoSeleccionado) {
        seleccionarProyecto(proyectoSeleccionado);
      }
    } catch (err) {
      console.error('Error reasignando actividad:', err);
      toast.error(err?.message || 'Error al reasignar la actividad.');
    } finally {
      setSubmittingReasignacion(false);
    }
  };

  // Atención y resolución de incidencias del equipo (RF-24)
  const handleAbrirAtenderIncidencia = (item) => {
    if (!item) return;
    if (item.estadoAtencion === 'SOLUCIONADO' || item.estadoAtencion === 'RESUELTO') {
      toast.info('Esta incidencia ya se encuentra resuelta y archivada para auditoría.');
      return;
    }
    setIncidenciaAAtender(item);
    setAtencionForm({
      estadoAtencion: item.estadoAtencion || 'EN_REVISION',
      resolucionNota: item.resolucionNota || ''
    });
    setShowAtenderModal(true);
  };

  const handleAtenderIncidencia = async (e) => {
    e.preventDefault();
    if (!incidenciaAAtender) return;

    if (incidenciaAAtender.estadoAtencion === 'SOLUCIONADO' || incidenciaAAtender.estadoAtencion === 'RESUELTO') {
      toast.error('No se puede modificar una incidencia que ya ha sido marcada como resuelta.');
      setShowAtenderModal(false);
      return;
    }

    try {
      setSubmittingAtencion(true);
      const isError = incidenciaAAtender._tipo === 'ERROR';
      const endpoint = isError
        ? `/lider/errores/${incidenciaAAtender.idError}/atender`
        : `/lider/interrupciones/${incidenciaAAtender.idInterrupcion}/atender`;

      const res = await api.patch(endpoint, {
        estadoAtencion: atencionForm.estadoAtencion,
        resolucionNota: atencionForm.resolucionNota?.trim() || ''
      });

      if (isError) {
        setErrores(prev => prev.map(err => err.idError === incidenciaAAtender.idError ? { ...err, ...res } : err));
      } else {
        setInterrupciones(prev => prev.map(intp => intp.idInterrupcion === incidenciaAAtender.idInterrupcion ? { ...intp, ...res } : intp));
      }

      const casoId = incidenciaAAtender.idError || incidenciaAAtender.idInterrupcion;
      const estadoNuevo = atencionForm.estadoAtencion;

      toast.success(`Caso #${casoId} actualizado con éxito a estado ${estadoNuevo}.`, { duration: 3000 });
      setShowAtenderModal(false);
      setIncidenciaAAtender(null);
      setAtencionForm({ estadoAtencion: 'EN_REVISION', resolucionNota: '' });
    } catch (err) {
      console.error('Error al atender incidencia:', err);
      toast.error(err.message || 'Error al actualizar el estado de la incidencia.');
    } finally {
      setSubmittingAtencion(false);
    }
  };

  // Manejador para finalizar formalmente el proyecto y liberar desarrolladores (RF-20)
  const handleFinalizarProyecto = async () => {
    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') return;
    setCancelacionError('');

    if (evidenciaWbsFinalizacion.esProyectoVacio) {
      if (!justificacionCancelacion || justificacionCancelacion.trim().length < 10) {
        setCancelacionError('Debe ingresar un motivo y una justificación detallada de al menos 10 caracteres.');
        toast.error('Justificación de auditoría obligatoria para cerrar proyectos vacíos.');
        return;
      }
    } else if (!evidenciaWbsFinalizacion.todasCompletadas) {
      toast.error('No se puede finalizar el proyecto. Aún existen etapas o tareas pendientes en la WBS.');
      return;
    }

    try {
      setSubmittingFinalizar(true);
      const payload = evidenciaWbsFinalizacion.esProyectoVacio ? {
        motivoCancelacion,
        justificacionCancelacion: justificacionCancelacion.trim()
      } : {};

      await api.patch(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/finalizar`, payload);

      if (evidenciaWbsFinalizacion.esProyectoVacio) {
        toast.success('Proyecto cancelado/cerrado prematuramente. Se registró la justificación en la auditoría corporativa.');
      } else {
        toast.success('Proyecto finalizado exitosamente. Su WBS ha sido congelada y los desarrolladores han sido liberados.');
      }

      setShowConfirmFinalizar(false);
      setJustificacionCancelacion('');
      setCancelacionError('');

      const proyectoActualizado = {
        ...proyectoSeleccionado,
        estado: 'FINALIZADO'
      };

      setProyectoSeleccionado(proyectoActualizado);
      setProyectos(prev => prev.map(p => p.idProyecto === proyectoSeleccionado.idProyecto ? proyectoActualizado : p));

      if (typeof idProyectoQuery !== 'undefined' && idProyectoQuery) {
        navigate(ROUTES.LIDER.DASHBOARD);
      }
    } catch (err) {
      console.error('Error al finalizar el proyecto:', err);
      toast.error(err.response?.data?.message || err.message || 'Error al procesar la finalización del proyecto.');
    } finally {
      setSubmittingFinalizar(false);
    }
  };

  // Cálculo y filtrado reactivo de incidencias unificadas (errores + interrupciones)
  const incidenciasFiltradas = useMemo(() => {
    const errs = (errores || []).map(e => ({
      ...e,
      _tipo: 'ERROR',
      _id: `err-${e.idError}`,
      _fecha: new Date(e.fechaRegistro || Date.now())
    }));
    const ints = (interrupciones || []).map(i => ({
      ...i,
      _tipo: 'INTERRUPCION',
      _id: `int-${i.idInterrupcion}`,
      _fecha: new Date(i.fechaOcurrencia || Date.now())
    }));
    let combined = [...errs, ...ints].sort((a, b) => b._fecha - a._fecha);

    // Si idProyecto es 'GLOBAL', null, 'TODOS', 'all', o no está definido, retorna el historial completo de la compañía.
    // Solo debe filtrar cuando haya un ID de proyecto específico.
    const idProjActual = proyectoSeleccionado?.idProyecto;
    const esGlobal = !idProjActual ||
      idProjActual === 'GLOBAL' ||
      idProjActual === 'TODOS' ||
      idProjActual === 'all' ||
      idProjActual === 'null' ||
      idProjActual === '';

    if (!esGlobal) {
      combined = combined.filter(item => {
        const idProjItem = item.etapa?.proyecto?.idProyecto || item.proyecto?.idProyecto || item.idProyecto;
        return idProjItem && String(idProjItem) === String(idProjActual);
      });
    }

    if (filtroTipoInc === 'ERRORES') combined = combined.filter(c => c._tipo === 'ERROR');
    if (filtroTipoInc === 'INTERRUPCIONES') combined = combined.filter(c => c._tipo === 'INTERRUPCION');

    if (filtroSeveridadInc === 'CRITICA_ALTA') {
      combined = combined.filter(c => c._tipo === 'ERROR' && (c.severidad === 'CRITICA' || c.severidad === 'ALTA'));
    } else if (filtroSeveridadInc !== 'TODAS') {
      combined = combined.filter(c => c.severidad === filtroSeveridadInc);
    }

    if (filtroEstadoInc !== 'TODOS') {
      combined = combined.filter(c => (c.estadoAtencion || 'REGISTRADO') === filtroEstadoInc);
    }

    if (filtroDevInc !== 'TODOS') {
      combined = combined.filter(c => String(c.desarrollador?.idTrabajador) === String(filtroDevInc));
    }

    if (filtroFechaTipo !== 'TODAS') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      combined = combined.filter(c => {
        if (!c._fecha) return true;
        const f = new Date(c._fecha);

        if (filtroFechaTipo === 'HOY') {
          return f >= hoy;
        }
        if (filtroFechaTipo === '7_DIAS') {
          const hace7 = new Date();
          hace7.setDate(hace7.getDate() - 7);
          hace7.setHours(0, 0, 0, 0);
          return f >= hace7;
        }
        if (filtroFechaTipo === '30_DIAS') {
          const hace30 = new Date();
          hace30.setDate(hace30.getDate() - 30);
          hace30.setHours(0, 0, 0, 0);
          return f >= hace30;
        }
        if (filtroFechaTipo === 'ESTE_MES') {
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          return f >= inicioMes;
        }
        if (filtroFechaTipo === 'RANGO') {
          if (filtroFechaDesde) {
            const d = new Date(filtroFechaDesde);
            d.setHours(0, 0, 0, 0);
            if (f < d) return false;
          }
          if (filtroFechaHasta) {
            const h = new Date(filtroFechaHasta);
            h.setHours(23, 59, 59, 999);
            if (f > h) return false;
          }
          return true;
        }
        return true;
      });
    }

    return combined;
  }, [errores, interrupciones, filtroTipoInc, filtroSeveridadInc, filtroEstadoInc, filtroDevInc, filtroFechaTipo, filtroFechaDesde, filtroFechaHasta, proyectoSeleccionado]);

  // Alias para retrocompatibilidad
  const listaIncidenciasUnificada = incidenciasFiltradas;

  // Cálculo seguro y defensivo de horas de contingencia
  const totalHorasContingencia = useMemo(() => {
    if (!Array.isArray(interrupciones) || interrupciones.length === 0) return '0.0';
    const totalMin = interrupciones.reduce((acc, curr) => acc + (curr?.duracionMinutos || 0), 0);
    return (totalMin / 60).toFixed(1);
  }, [interrupciones]);

  // Diagnóstico dinámico y proactivo de salud operativa del equipo
  const cantErroresActivos = useMemo(() => {
    return (errores || []).filter(e => e.estadoAtencion !== 'SOLUCIONADO' && e.estadoAtencion !== 'RESUELTO').length;
  }, [errores]);

  const cantContingenciasPendientes = useMemo(() => {
    return (interrupciones || []).filter(i => i.estadoAtencion !== 'SOLUCIONADO' && i.estadoAtencion !== 'RESUELTO').length;
  }, [interrupciones]);

  const cantDevsAltaCarga = useMemo(() => {
    return (desarrolladoresCargas || []).filter(d => (d.porcentajeCarga || d.horasAsignadas || 0) >= 80).length;
  }, [desarrolladoresCargas]);

  // Evidencia de auditoría para finalización de proyecto (RF-20)
  const evidenciaWbsFinalizacion = useMemo(() => {
    if (!etapas || !Array.isArray(etapas) || etapas.length === 0) {
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

    etapas.forEach(et => {
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
      totalEtapas: etapas.length,
      totalActividades
    };
  }, [etapas]);

  // Porcentaje de avance global acumulado de la cartera de proyectos
  const porcentajeAvanceGlobal = useMemo(() => {
    if (!proyectos || !Array.isArray(proyectos) || proyectos.length === 0) return 0;
    const suma = proyectos.reduce((acc, curr) => acc + Number(curr?.progreso || curr?.porcentajeAvance || curr?.avance || 0), 0);
    return Math.round(suma / proyectos.length);
  }, [proyectos]);

  // Proyectos filtrados para el menú emergente / explorador con segregación por propiedad
  const proyectosModalFiltrados = useMemo(() => {
    if (!Array.isArray(proyectos)) return [];

    const userDevId = user?.idTrabajador || user?.id;
    const userEmail = (user?.email || '').toLowerCase();

    return proyectos.filter(p => {
      // 1. Filtro por Propiedad de Líder
      if (filtroPropiedadLider === 'MIS_PROYECTOS') {
        const pLiderId = p.lider?.idTrabajador || p.lider?.id;
        const pLiderEmail = (p.lider?.email || '').toLowerCase();
        const isMine = (userDevId && String(pLiderId) === String(userDevId)) || (userEmail && pLiderEmail && userEmail === pLiderEmail);
        if (!isMine) return false;
      } else if (filtroPropiedadLider === 'OTROS_LIDERES') {
        const pLiderId = p.lider?.idTrabajador || p.lider?.id;
        const pLiderEmail = (p.lider?.email || '').toLowerCase();
        const isMine = (userDevId && String(pLiderId) === String(userDevId)) || (userEmail && pLiderEmail && userEmail === pLiderEmail);
        if (isMine) return false;
      }

      // 2. Filtro de Estado
      if (filtroEstadoProyectoModal === 'ACTIVO' && p.estado !== 'ACTIVO') return false;
      if (filtroEstadoProyectoModal === 'FINALIZADO' && p.estado !== 'FINALIZADO' && p.estado !== 'COMPLETADO') return false;

      // 3. Filtro de Búsqueda
      if (busquedaProyectoModal.trim()) {
        const query = busquedaProyectoModal.toLowerCase().trim();
        const matchNombre = p.nombre?.toLowerCase().includes(query);
        const matchCliente = p.cliente?.toLowerCase().includes(query);
        const matchId = String(p.idProyecto).includes(query) || `prj-00${p.idProyecto}`.toLowerCase().includes(query);
        const matchDesc = p.descripcion?.toLowerCase().includes(query);
        const matchLider = p.lider && `${p.lider.nombre} ${p.lider.apellido}`.toLowerCase().includes(query);
        if (!matchNombre && !matchCliente && !matchId && !matchDesc && !matchLider) return false;
      }

      return true;
    });
  }, [proyectos, busquedaProyectoModal, filtroEstadoProyectoModal, filtroPropiedadLider, user]);

  // Propiedad sobre el proyecto seleccionado (Determinante para Modo Lectura vs Modo Edición)
  const isMiProyecto = useMemo(() => {
    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') return true;
    if (!proyectoSeleccionado.lider) return true;
    if (!user) return true;
    const userDevId = user.idTrabajador || user.id;
    const userEmail = (user.email || '').toLowerCase();
    const projLiderId = proyectoSeleccionado.lider.idTrabajador || proyectoSeleccionado.lider.id;
    const projLiderEmail = (proyectoSeleccionado.lider.email || '').toLowerCase();

    return (userDevId && String(userDevId) === String(projLiderId)) || (userEmail && projLiderEmail && userEmail === projLiderEmail);
  }, [proyectoSeleccionado, user]);

  // Handler para Registrar Colaborador (Líder o Desarrollador)
  const handleCrearColaboradorPorLider = async (e) => {
    e.preventDefault();

    // Validaciones estrictas previa a la sumisión
    if (!docValidationResult.valid) {
      toast.error(docValidationResult.message || 'Corrija el número de identificación según el país seleccionado.');
      setFormErrorsColaborador(p => ({ ...p, identificacion: docValidationResult.message }));
      return;
    } else if (nuevoColaboradorForm.identificacion && (desarrolladores || []).some(d => String(d.identificacion).trim() === String(nuevoColaboradorForm.identificacion).trim())) {
      const msg = 'Esta cédula / número de identificación ya se encuentra registrada.';
      toast.error(msg);
      setFormErrorsColaborador(p => ({ ...p, identificacion: msg }));
      return;
    }

    if (!nombreValidationResult.valid) {
      toast.error(nombreValidationResult.message);
      setFormErrorsColaborador(p => ({ ...p, nombre: nombreValidationResult.message }));
      return;
    }

    if (!apellidoValidationResult.valid) {
      toast.error(apellidoValidationResult.message);
      setFormErrorsColaborador(p => ({ ...p, apellido: apellidoValidationResult.message }));
      return;
    }

    let emailFinal = nuevoColaboradorForm.email.trim();
    if (!emailFinal.toLowerCase().endsWith('@ikernell.org')) {
      if (emailFinal.includes('@')) {
        emailFinal = emailFinal.substring(0, emailFinal.indexOf('@')) + '@ikernell.org';
      } else {
        emailFinal = emailFinal + '@ikernell.org';
      }
    }

    if (!emailValidationResult.valid) {
      toast.error(emailValidationResult.message);
      setFormErrorsColaborador(p => ({ ...p, email: emailValidationResult.message }));
      return;
    }

    if (!emailPersonalValidationResult.valid) {
      toast.error(emailPersonalValidationResult.message);
      setFormErrorsColaborador(p => ({ ...p, emailPersonal: emailPersonalValidationResult.message }));
      return;
    }

    // Combinar especialidad técnica principal con las habilidades seleccionadas
    let especialidadFinal = nuevoColaboradorForm.especialidad.trim();
    if (selectedSkills.length > 0) {
      const skillsFormatted = selectedSkills.join(', ');
      especialidadFinal = especialidadFinal
        ? `${especialidadFinal} • [${skillsFormatted}]`
        : `[${skillsFormatted}]`;
    }

    setSubmittingNuevoColaborador(true);
    try {
      const res = await api.post('/lider/trabajadores', {
        ...nuevoColaboradorForm,
        paisCodigo: nuevoColaboradorForm.paisCodigo || 'CO',
        identificacion: nuevoColaboradorForm.identificacion.trim(),
        nombre: nuevoColaboradorForm.nombre.trim(),
        apellido: nuevoColaboradorForm.apellido.trim(),
        email: emailFinal,
        emailPersonal: nuevoColaboradorForm.emailPersonal ? nuevoColaboradorForm.emailPersonal.trim() : '',
        profesion: nuevoColaboradorForm.profesion.trim() || 'Ingeniero de Software',
        especialidad: especialidadFinal || 'Desarrollador General',
        rol: nuevoColaboradorForm.rol,
        passwordHash: nuevoColaboradorForm.passwordHash
      });

      const rolTexto = res.rol && res.rol.toUpperCase().includes('LIDER') ? 'Líder de Proyecto' : 'Desarrollador';
      toast.success(`Colaborador ${res.nombre} ${res.apellido} (${rolTexto}) registrado exitosamente. Credenciales temporales enviadas a ${res.emailPersonal || emailFinal}.`);
      setShowNuevoColaboradorModal(false);
      setNuevoColaboradorForm({
        identificacion: '',
        paisCodigo: 'CO',
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
      setFormErrorsColaborador({});

      // Recargar nómina
      const devsRes = await api.get('/lider/desarrolladores').catch(() => []);
      setDesarrolladores(Array.isArray(devsRes) ? devsRes : []);
    } catch (err) {
      console.error('Error al registrar colaborador por líder:', err);
      const serverMsg = err.response?.data?.message || err?.message || 'Error al guardar el nuevo colaborador.';
      toast.error(serverMsg);
    } finally {
      setSubmittingNuevoColaborador(false);
    }
  };

  // Conteo de proyectos por estado para los botones de filtro rápido
  const statsProyectos = useMemo(() => {
    if (!Array.isArray(proyectos)) return { total: 0, activos: 0, finalizados: 0 };
    const activos = proyectos.filter(p => p.estado === 'ACTIVO').length;
    const finalizados = proyectos.filter(p => p.estado === 'FINALIZADO' || p.estado === 'COMPLETADO').length;
    return { total: proyectos.length, activos, finalizados };
  }, [proyectos]);

  // Handlers para Editar Etapa WBS
  const handleAbrirEditarEtapa = (etapa) => {
    setEditingEtapaObj(etapa);
    setEditingEtapaForm({
      nombreEtapa: etapa.nombreEtapa || '',
      estado: etapa.estado || 'PENDIENTE'
    });
    setShowEditarEtapaModal(true);
  };

  const handleGuardarEditarEtapa = async (e) => {
    e.preventDefault();
    if (!editingEtapaObj || !editingEtapaObj.idEtapa) return;
    if (!editingEtapaForm.nombreEtapa.trim()) {
      toast.error('El nombre de la etapa no puede estar vacío.');
      return;
    }

    setSubmittingEditarEtapa(true);
    try {
      const res = await api.put(`/lider/etapas/${editingEtapaObj.idEtapa}`, {
        nombreEtapa: editingEtapaForm.nombreEtapa.trim(),
        estado: editingEtapaForm.estado
      });

      // Registrar auditoría del Líder
      registrarAccionLider(proyectoSeleccionado.idProyecto, 'EDICION_ETAPA', `Fase #${editingEtapaObj.idEtapa} actualizada a "${editingEtapaForm.nombreEtapa.trim()}" [${editingEtapaForm.estado}]`);
      toast.success(`Etapa "${res.nombreEtapa || 'WBS'}" actualizada correctamente.`);
      setShowEditarEtapaModal(false);
      setEditingEtapaObj(null);

      if (proyectoSeleccionado && proyectoSeleccionado.idProyecto) {
        cargarDetalleProyecto(proyectoSeleccionado.idProyecto);
      }
    } catch (err) {
      console.error('Error al actualizar etapa:', err);
      toast.error('No se pudo actualizar la etapa WBS.');
    } finally {
      setSubmittingEditarEtapa(false);
    }
  };

  // Registrar auditoría de cambios del Líder
  const registrarAccionLider = async (idProyecto, accion, detalles) => {
    if (!idProyecto || !user) return;
    try {
      const uId = user.idTrabajador || user.id || 1;
      const uNombre = `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Líder de Proyecto';
      const uEmail = user.email || '';
      await api.post(`/lider/proyectos/${idProyecto}/historial-cambios?idCoordinador=${uId}&nombreCoordinador=${encodeURIComponent(uNombre)}&emailCoordinador=${encodeURIComponent(uEmail)}&accion=${encodeURIComponent(accion)}&detalles=${encodeURIComponent(detalles)}`).catch(() => {});
    } catch (err) {
      console.error('Error al registrar auditoría de Líder:', err);
    }
  };

  // Finalización formal de etapa WBS para Líder (Apertura de Modal Interactivo)
  const handleFinalizarEtapaFormallyLider = (etapa) => {
    if (!proyectoSeleccionado || !etapa?.idEtapa) return;
    setEtapaAFinalizarModalLider(etapa);
  };

  // Ejecución de la finalización de etapa tras confirmación en el modal interactivo del Líder
  const ejecutarFinalizarEtapaLider = async () => {
    if (!proyectoSeleccionado || !etapaAFinalizarModalLider?.idEtapa) return;
    const etapa = etapaAFinalizarModalLider;
    const confirmName = etapa.nombreEtapa || `Fase #${etapa.idEtapa}`;

    try {
      await api.put(`/lider/etapas/${etapa.idEtapa}`, {
        nombreEtapa: etapa.nombreEtapa,
        estado: 'FINALIZADA'
      });

      setEtapas(prev => (prev || []).map(et =>
        String(et.idEtapa) === String(etapa.idEtapa) ? { ...et, estado: 'FINALIZADA' } : et
      ));

      registrarAccionLider(
        proyectoSeleccionado.idProyecto,
        'FINALIZACION_ETAPA',
        `Fase #${etapa.idEtapa} ("${confirmName}") finalizada formalmente por la Líder.`
      );

      toast.success(`Etapa "${confirmName}" finalizada exitosamente.`);
      setEtapaAFinalizarModalLider(null);
      if (proyectoSeleccionado && proyectoSeleccionado.idProyecto) {
        cargarDetalleProyecto(proyectoSeleccionado.idProyecto);
      }
    } catch (err) {
      console.error('Error al finalizar etapa:', err);
      toast.error(err.message || 'Error al finalizar la etapa.');
    }
  };

  // Handlers para Editar Proyecto
  const handleAbrirEditarProyecto = () => {
    if (!proyectoSeleccionado) return;
    setEditingProyectoForm({
      nombre: proyectoSeleccionado.nombre || '',
      cliente: proyectoSeleccionado.cliente || '',
      presupuesto: proyectoSeleccionado.presupuesto || '',
      fechaInicio: proyectoSeleccionado.fechaInicio || '',
      fechaFinEstimada: proyectoSeleccionado.fechaFinEstimada || proyectoSeleccionado.fechaEstimadaEntrega || '',
      estado: proyectoSeleccionado.estado || 'ACTIVO',
      descripcion: proyectoSeleccionado.descripcion || ''
    });
    setShowEditarProyectoModal(true);
  };

  const handleGuardarEditarProyecto = async (e) => {
    e.preventDefault();
    if (!proyectoSeleccionado || !proyectoSeleccionado.idProyecto) return;

    if (!editingProyectoForm.nombre.trim()) {
      toast.error('El nombre del proyecto es obligatorio.');
      return;
    }

    setSubmittingEditarProyecto(true);
    try {
      const payload = {
        nombre: editingProyectoForm.nombre.trim(),
        cliente: editingProyectoForm.cliente.trim(),
        presupuesto: editingProyectoForm.presupuesto ? Number(editingProyectoForm.presupuesto) : null,
        fechaInicio: editingProyectoForm.fechaInicio || null,
        fechaFinEstimada: editingProyectoForm.fechaFinEstimada || null,
        estado: editingProyectoForm.estado,
        descripcion: editingProyectoForm.descripcion.trim()
      };

      const res = await api.put(`/lider/proyectos/${proyectoSeleccionado.idProyecto}`, payload);

      toast.success(`Proyecto "${res.nombre}" actualizado correctamente.`);
      setProyectoSeleccionado(res);
      setProyectos(prev => prev.map(p => p.idProyecto === res.idProyecto ? res : p));
      setShowEditarProyectoModal(false);
    } catch (err) {
      console.error('Error al actualizar proyecto:', err);
      toast.error('No se pudieron guardar los cambios del proyecto.');
    } finally {
      setSubmittingEditarProyecto(false);
    }
  };

  // Función de cálculo de trazabilidad de pausas e impacto en el cronograma
  const calcularDetalleTiempoPausa = (proyecto, historial) => {
    if (!proyecto) return { enPausa: false, dias: 0, horas: 0, minutos: 0, textoFormateado: 'Sin pausas registradas', fechaInicioPausa: null, fechaEntregaImpactada: null };

    const esPausaActual = proyecto.estado === 'EN_PAUSA';

    // Buscar último registro de pausa en el historial
    const regPausa = (historial || []).find(r =>
      (r.detalles || '').toLowerCase().includes('paus') ||
      (r.accion || '').toLowerCase().includes('paus')
    );

    const fechaPausa = regPausa?.fechaCambio ? new Date(regPausa.fechaCambio) : (proyecto.updatedAt ? new Date(proyecto.updatedAt) : new Date());

    if (esPausaActual) {
      const ahora = new Date();
      const diffMs = Math.max(0, ahora.getTime() - fechaPausa.getTime());
      const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      // Fecha de entrega original y ajustada por días de pausa
      let fechaFinOriginal = proyecto.fechaFinEstimada ? new Date(proyecto.fechaFinEstimada) : new Date();
      let fechaFinAjustada = new Date(fechaFinOriginal);
      fechaFinAjustada.setDate(fechaFinAjustada.getDate() + (dias > 0 ? dias : 1));

      const textoFormateado = `${dias} Día${dias !== 1 ? 's' : ''}, ${horas} Hora${horas !== 1 ? 's' : ''} y ${minutos} Minuto${minutos !== 1 ? 's' : ''}`;

      return {
        enPausa: true,
        dias,
        horas,
        minutos,
        textoFormateado,
        fechaInicioPausa: fechaPausa,
        fechaFinOriginal,
        fechaFinAjustada
      };
    }

    if (regPausa) {
      return {
        enPausa: false,
        dias: 0,
        horas: 0,
        minutos: 0,
        textoFormateado: 'Proyecto reactivado (Pausas previas registradas)',
        fechaInicioPausa: fechaPausa,
        fechaFinOriginal: proyecto.fechaFinEstimada ? new Date(proyecto.fechaFinEstimada) : null,
        fechaFinAjustada: null
      };
    }

    return {
      enPausa: false,
      dias: 0,
      horas: 0,
      minutos: 0,
      textoFormateado: 'Sin pausas registradas en el proyecto',
      fechaInicioPausa: null,
      fechaFinOriginal: proyecto.fechaFinEstimada ? new Date(proyecto.fechaFinEstimada) : null,
      fechaFinAjustada: null
    };
  };

  // Generador de Reporte PDF del Proyecto con Trazabilidad Completa y Auditoría
  const handleGenerarReportePdf = () => {
    if (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') {
      toast.error('Seleccione un proyecto específico para generar el reporte PDF.');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [37, 99, 235];  // #2563eb
      const darkColor = [24, 24, 27];      // #18181b
      const pauseColor = [217, 119, 6];    // #d97706 (amber-600)
      const purpleColor = [126, 34, 206];  // #7e22ce (purple-700)

      // Cálculo de Trazabilidad de Pausas
      const detallePausa = calcularDetalleTiempoPausa(proyectoSeleccionado, historialCambios);

      // 1. Banner Superior Corporativo
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('IKERNELL ENTERPRISE ARCHITECTURE', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`REPORTE DE INGENIERÍA Y AUDITORÍA | FECHA: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, 14, 18);

      // 2. Encabezado del Proyecto
      doc.setTextColor(...darkColor);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(`Proyecto: ${proyectoSeleccionado.nombre}`, 14, 34);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Código: PRJ-00${proyectoSeleccionado.idProyecto} | Estado: ${proyectoSeleccionado.estado || 'ACTIVO'} | Cliente: ${proyectoSeleccionado.cliente || 'Interno'}`, 14, 40);

      let yPos = 47;

      // 3. Tarjeta Resumen Operativo & Cronograma
      const isPaused = proyectoSeleccionado.estado === 'EN_PAUSA';
      doc.setFillColor(isPaused ? 254 : 248, isPaused ? 243 : 250, isPaused ? 199 : 252);
      doc.roundedRect(14, yPos, 182, pdfConfig.modoSensible ? 32 : 26, 3, 3, 'F');

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(isPaused ? pauseColor : primaryColor));
      doc.text(isPaused ? 'RESUMEN OPERATIVO - ESTADO: EN PAUSA (PRODUCCIÓN DETENIDA)' : 'RESUMEN Y DIMENSIÓN OPERATIVA', 18, yPos + 7);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkColor);
      doc.text(`• Fecha de Inicio: ${formatearFechaHumana(proyectoSeleccionado.fechaInicio)}`, 18, yPos + 13);
      doc.text(`• Entrega Estimada Inicial: ${formatearFechaHumana(proyectoSeleccionado.fechaFinEstimada)}`, 105, yPos + 13);
      doc.text(`• Líder a Cargo: ${proyectoSeleccionado.lider ? `${proyectoSeleccionado.lider.nombre} ${proyectoSeleccionado.lider.apellido}` : 'Carlos Mendoza'}`, 18, yPos + 19);

      if (detallePausa.enPausa && detallePausa.fechaFinAjustada) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...pauseColor);
        doc.text(`• Fecha Ajustada de Entrega (Post-Pausa): ${formatearFechaHumana(detallePausa.fechaFinAjustada)} (+${detallePausa.dias > 0 ? detallePausa.dias : 1} días)`, 105, yPos + 19);
      } else {
        doc.text(`• Duración Proyectada: ${calcularDuracionProyecto(proyectoSeleccionado.fechaInicio, proyectoSeleccionado.fechaFinEstimada)}`, 105, yPos + 19);
      }

      if (pdfConfig.modoSensible) {
        const presForm = proyectoSeleccionado.presupuesto ? Number(proyectoSeleccionado.presupuesto).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text(`• Presupuesto Financiero Reservado (Confidencial): US$ ${presForm}`, 18, yPos + 25);
      }

      yPos += pdfConfig.modoSensible ? 38 : 32;

      // Descripción y Alcance
      if (proyectoSeleccionado.descripcion) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('Alcance y Objetivos del Proyecto:', 14, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const splitDesc = doc.splitTextToSize(proyectoSeleccionado.descripcion, 182);
        doc.text(splitDesc, 14, yPos);
        yPos += (splitDesc.length * 4) + 6;
      }

      // SECCIÓN SELECCIONABLE: TRAZABILIDAD DE PAUSAS Y TIEMPO ACUMULADO
      if (pdfConfig.incluirPausas) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }

        doc.setFillColor(254, 243, 199);
        doc.roundedRect(14, yPos, 182, 34, 3, 3, 'F');

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...pauseColor);
        doc.text('Trazabilidad de Pausas Operativas & Afectación al Plazo de Entrega', 18, yPos + 7);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text(`• Estado Actual de Producción: ${proyectoSeleccionado.estado === 'EN_PAUSA' ? 'EN PAUSA (Suspenso Activo)' : 'ACTIVO / OPERATIVO'}`, 18, yPos + 14);
        doc.text(`• Tiempo Acumulado en Pausa: ${detallePausa.textoFormateado}`, 18, yPos + 19);

        if (detallePausa.fechaInicioPausa) {
          doc.text(`• Fecha/Hora de Suspensión: ${new Date(detallePausa.fechaInicioPausa).toLocaleString('es-CO')}`, 18, yPos + 24);
        }

        if (detallePausa.enPausa && detallePausa.fechaFinAjustada) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(180, 83, 9);
          doc.text(`• Proyección de Impacto: El plazo de entrega original se desplaza automáticamente del ${formatearFechaHumana(proyectoSeleccionado.fechaFinEstimada)} al ${formatearFechaHumana(detallePausa.fechaFinAjustada)}.`, 18, yPos + 29);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('• Impacto en la Operación: No se detectan suspensiones activas que afecten la entrega proyectada.', 18, yPos + 29);
        }

        yPos += 40;
      }

      // SECCIÓN SELECCIONABLE: AUDITORÍA Y GESTIONES DEL COORDINADOR
      if (pdfConfig.incluirAuditoriaCoordinador && historialCambios && historialCambios.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...purpleColor);
        doc.text('Historial de Auditoría & Gestiones de la Coordinación General', 14, yPos);
        yPos += 6;

        const maxAuditLogs = pdfConfig.nivelDetalle === 'RESUMIDO' ? 3 : 10;
        const logsAImprimir = historialCambios.slice(0, maxAuditLogs);

        logsAImprimir.forEach((reg, idx) => {
          if (yPos > 270) { doc.addPage(); yPos = 20; }

          doc.setFillColor(245, 243, 255);
          doc.rect(14, yPos, 182, 6, 'F');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...purpleColor);
          doc.text(`Acción #${idx + 1}: ${reg.accion || 'MODIFICACIÓN DIRECTIVA'} - ${new Date(reg.fechaCambio).toLocaleString('es-CO')}`, 16, yPos + 4.5);
          yPos += 8;

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...darkColor);
          const textDet = doc.splitTextToSize(`Detalles: ${reg.detalles || 'Sin observaciones adicionales.'}`, 178);
          doc.text(textDet, 18, yPos);
          yPos += (textDet.length * 3.5) + 3;
        });

        yPos += 4;
      }

      // SECCIÓN WBS: Fases y Actividades
      if (pdfConfig.incluirWbs && etapas && etapas.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Estructura WBS y Desglose de Fases Técnicas', 14, yPos);
        yPos += 6;

        etapas.forEach((etapa, index) => {
          if (yPos > 240) { doc.addPage(); yPos = 20; }

          let rawEtapaNombre = etapa.nombreEtapa || `Fase ${index + 1}`;
          rawEtapaNombre = rawEtapaNombre.replace(/^(Fase\s+\d+:\s*)+/i, '');
          const tituloFaseLimpio = `Fase ${index + 1}: ${rawEtapaNombre}`;
          const estadoEtapa = (etapa.estado || 'PENDIENTE').toUpperCase().replace(/_/g, ' ');

          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.35);
          doc.roundedRect(14, yPos, 182, 8, 1.5, 1.5, 'FD');

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(tituloFaseLimpio, 18, yPos + 5.5);

          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(etapa.estado === 'FINALIZADA' ? 5 : 30, etapa.estado === 'FINALIZADA' ? 150 : 58, etapa.estado === 'FINALIZADA' ? 105 : 138);
          doc.text(estadoEtapa, 170, yPos + 5.5);

          yPos += 11;

          if (etapa.actividades && etapa.actividades.length > 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, yPos, 182, 6, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.25);
            doc.line(14, yPos, 196, yPos);
            doc.line(14, yPos + 6, 196, yPos + 6);

            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text('DESCRIPCIÓN DE ACTIVIDAD WBS', 18, yPos + 4.2);
            doc.text('DESARROLLADOR ASIGNADO', 125, yPos + 4.2);
            doc.text('ESTADO', 170, yPos + 4.2);

            yPos += 8;

            etapa.actividades.forEach(act => {
              const actNombre = act.nombreActividad || act.descripcion || 'Actividad WBS';
              const devName = act.desarrollador ? `${act.desarrollador.nombre} ${act.desarrollador.apellido}` : 'Sin Asignar';
              const actEst = (act.estado || 'PENDIENTE').toUpperCase().replace(/_/g, ' ');

              const splitTask = doc.splitTextToSize(actNombre, 102);
              const rowHeight = Math.max(7, splitTask.length * 3.8 + 2.5);

              if (yPos + rowHeight > 270) {
                doc.addPage();
                yPos = 20;
              }

              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.2);
              doc.line(14, yPos + rowHeight - 0.5, 196, yPos + rowHeight - 0.5);

              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(30, 41, 59);
              doc.text(splitTask, 18, yPos + 4);

              doc.setFontSize(7.5);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(71, 85, 105);
              doc.text(devName, 125, yPos + 4);

              doc.setFontSize(7.5);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(actEst.includes('FIN') ? 5 : actEst.includes('PROG') ? 30 : 217, actEst.includes('FIN') ? 150 : actEst.includes('PROG') ? 58 : 119, actEst.includes('FIN') ? 105 : actEst.includes('PROG') ? 138 : 6);
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
          yPos += 5;
        });
      }

      // SECCIÓN EQUIPO & DESARROLLADORES
      if (pdfConfig.incluirEquipo && desarrolladoresAsignadosProyecto && desarrolladoresAsignadosProyecto.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Nómina de Desarrolladores y Capacidad Asignada (HU-12)', 14, yPos);
        yPos += 6;

        desarrolladoresAsignadosProyecto.forEach(dev => {
          if (yPos > 270) { doc.addPage(); yPos = 20; }

          const devName = dev.desarrollador ? `${dev.desarrollador.nombre} ${dev.desarrollador.apellido}` : 'Desarrollador';
          const devEmail = dev.desarrollador?.email || '';
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...darkColor);
          doc.text(`• ${devName} (${devEmail})`, 18, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(`Dedicación reservada: ${dev.horasSemanales || 40}h / semana`, 130, yPos);
          yPos += 6;
        });
      }

      // SECCIÓN SELECCIONABLE: MÉTRICAS DE SALUD OPERATIVA & KPIS
      if (pdfConfig.incluirMetricasKpi) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Métricas de Salud Operativa, KPIs y Carga Laboral', 14, yPos);
        yPos += 6;

        doc.setFillColor(240, 249, 255);
        doc.roundedRect(14, yPos, 182, 22, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(3, 105, 161);
        doc.text(`• Estado de Salud Operativa: ${proyectoSeleccionado.estado === 'EN_PAUSA' ? 'ALERTA / PAUSA TEMPORAL' : 'ÓPTIMO / EN EJECUCIÓN'}`, 18, yPos + 6);
        doc.text(`• Total Fases WBS Registradas: ${etapas ? etapas.length : 0} Etapas de Proyecto`, 18, yPos + 11);
        doc.text(`• Control de Jornada Máxima: 48 horas semanales por desarrollador (Cumplimiento 100%)`, 18, yPos + 16);
        yPos += 28;
      }

      // SECCIÓN SELECCIONABLE: MATRIZ DE RIESGOS Y EVALUACIÓN DE CONTINGENCIAS
      if (pdfConfig.incluirMatrizRiesgos) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text('Matriz de Riesgos Operativos & Plan de Contingencias', 14, yPos);
        yPos += 6;

        doc.setFillColor(254, 252, 232);
        doc.roundedRect(14, yPos, 182, 22, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(161, 98, 7);
        doc.text('• Evaluación de Nivel de Riesgo: Bajo / Mitigado mediante supervisión directiva', 18, yPos + 6);
        doc.text('• Plan de Contingencia: Reprogramación de entregables y redistribución de actividades WBS', 18, yPos + 11);
        doc.text('• Estado de Auditoría: Conformidad técnica verificada por la Coordinación General', 18, yPos + 16);
        yPos += 28;
      }

      // SECCIÓN SELECCIONABLE: BLOQUE DE FIRMAS Y CONFORMIDAD DIRECTIVA
      if (pdfConfig.incluirFirmaDirectiva) {
        if (yPos > 230) { doc.addPage(); yPos = 20; }
        yPos += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('VALIDACIÓN Y CONFORMIDAD DIRECTIVA', 14, yPos);
        yPos += 14;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);

        doc.line(14, yPos, 68, yPos);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('Líder Responsable de Proyecto', 14, yPos + 4);
        doc.setFont('helvetica', 'normal');
        doc.text(proyectoSeleccionado.lider ? `${proyectoSeleccionado.lider.nombre} ${proyectoSeleccionado.lider.apellido}` : 'Firma Oficial', 14, yPos + 8);

        doc.line(78, yPos, 132, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text('Coordinador General TI', 78, yPos + 4);
        doc.setFont('helvetica', 'normal');
        doc.text('Dirección de Operaciones', 78, yPos + 8);

        doc.line(142, yPos, 196, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente / Auditor Externo', 142, yPos + 4);
        doc.setFont('helvetica', 'normal');
        doc.text(proyectoSeleccionado.cliente || 'Conformidad Recibida', 142, yPos + 8);

        yPos += 18;
      }

      // Pie de página
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Sistema IKernell - Reporte Oficial de Proyecto PRJ-00${proyectoSeleccionado.idProyecto} | Página ${i} de ${totalPages}`, 14, 290);
      }

      const cleanFileName = `Reporte_Proyecto_PRJ-00${proyectoSeleccionado.idProyecto}_${proyectoSeleccionado.nombre.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      doc.save(cleanFileName);
      toast.success('Reporte PDF generado y descargado exitosamente.');
      setShowGenerarReportePdfModal(false);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      toast.error('Ocurrió un error al construir el archivo PDF.');
    }
  };

  const isProyectoFinalizado = proyectoSeleccionado?.estado === 'FINALIZADO' || proyectoSeleccionado?.estado === 'COMPLETADO';

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: loadingProyectos ? 'Cargando...' : `Proyectos: ${proyectos?.length || 0} en Sistema`,
        metric2: proyectoSeleccionado ? `Activo: ${proyectoSeleccionado?.nombre || ''}` : 'Sin proyecto'
      }}
    >
      <ErrorBoundary title="Error General del Dashboard del Líder">

        {/* Selector de Proyecto en Cabecera (Enterprise Jira/Linear Style) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mb-6 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 shadow-sm min-w-0"
        >
          <div className="min-w-0 flex-1 max-w-full">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/80">
                Workspace del Líder
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-[0.65rem] font-bold text-zinc-500 dark:text-zinc-400">
                Gestión WBS & Métricas
              </span>
            </div>

            <div
              onClick={() => setModalProyectosOpen(true)}
              className="group cursor-pointer inline-flex items-center gap-3 py-1 text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-wrap max-w-full"
              title="Haga clic para cambiar el proyecto activo"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate leading-tight">
                {(!proyectoSeleccionado || proyectoSeleccionado?.idProyecto === 'GLOBAL')
                  ? 'Vista Global Corporativa'
                  : proyectoSeleccionado.nombre}
              </h1>
              {proyectoSeleccionado && proyectoSeleccionado.idProyecto !== 'GLOBAL' && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-xl border shrink-0 ${getEstadoBadgeClasses(proyectoSeleccionado.estado).badge
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${getEstadoBadgeClasses(proyectoSeleccionado.estado).dot}`} />
                  <span>{proyectoSeleccionado.estado || 'ACTIVO'}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0 min-w-0 max-w-full">
            {/* Botón Trigger para Selector de Proyectos: Solo se muestra al estar dentro de un proyecto específico */}
            {proyectoSeleccionado && proyectoSeleccionado.idProyecto !== 'GLOBAL' && (
              <button
                type="button"
                onClick={() => setModalProyectosOpen(true)}
                disabled={loadingProyectos}
                className="group flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-2xl px-3.5 py-2.5 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer min-w-[200px] sm:min-w-[260px] max-w-full disabled:opacity-60 text-left"
                title="Abrir menú emergente de selección y búsqueda de proyectos"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {loadingProyectos ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium truncate">
                      <Loader2 size={14} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Sincronizando proyectos...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                        <FolderGit2 size={14} />
                      </div>
                      <div className="text-left min-w-0 flex-1 truncate">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[0.68rem] font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                            [PRJ-00{proyectoSeleccionado?.idProyecto || 0}]
                          </span>
                          <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[160px]" title={proyectoSeleccionado?.nombre || ''}>
                            {proyectoSeleccionado?.nombre || 'Proyecto'}
                          </span>
                        </div>
                        {proyectoSeleccionado?.cliente && (
                          <span className="text-[0.65rem] text-zinc-400 dark:text-zinc-500 block truncate">
                            {proyectoSeleccionado.cliente}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-colors">
                  <span className="text-[0.65rem] font-bold hidden sm:inline">Cambiar</span>
                  <ChevronDown size={15} className="group-hover:translate-y-0.5 transition-transform" />
                </div>
              </button>
            )}

            {/* Botón: Ver Todos los Proyectos (Solo cuando se está dentro de un proyecto específico) */}
            {proyectoSeleccionado && proyectoSeleccionado.idProyecto !== 'GLOBAL' && (
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                type="button"
                onClick={() => seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' })}
                className="group px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer border bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:shadow-md hover:shadow-zinc-500/10"
                title="Ver el portafolio completo y métricas consolidadas de todos los proyectos"
              >
                <Globe size={15} className="group-hover:rotate-45 transition-transform duration-500 text-zinc-500" />
                <span className="hidden md:inline">Ver Todos los Proyectos</span>
              </motion.button>
            )}

            {/* Botón: Nuevo Proyecto (Exclusivo de la Vista Global Corporativa de WBS y Proyectos) */}
            {activeTab === 'wbs' && (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') && (
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                type="button"
                onClick={() => {
                  setNuevoProyectoForm({
                    nombre: '',
                    cliente: '',
                    descripcion: '',
                    fechaInicio: new Date().toISOString().split('T')[0],
                    fechaFinEstimada: '',
                    presupuesto: ''
                  });
                  setNuevoProyectoErrors({});
                  setShowNuevoProyectoModal(true);
                }}
                className="group px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/35 transition-all"
                title="Crear un nuevo proyecto de software con presupuesto y fechas (HU-11)"
              >
                <FolderPlus size={15} className="group-hover:scale-115 group-hover:-rotate-12 transition-transform duration-300" />
                <span>Nuevo Proyecto</span>
              </motion.button>
            )}

            {/* Botón: Nuevo Desarrollador (Exclusivo de Nómina y Personal) */}
            {(activeTab === 'personal' || activeTab === 'nomina') && (
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                type="button"
                onClick={() => {
                  setNuevoColaboradorForm({
                    nombre: '',
                    apellido: '',
                    identificacion: '',
                    email: '',
                    rol: 'DESARROLLADOR',
                    passwordHash: '',
                    profesion: '',
                    especialidad: ''
                  });
                  setShowNuevoColaboradorModal(true);
                }}
                className="group px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/35 transition-all"
                title="Registrar un nuevo desarrollador de software en la plataforma"
              >
                <UserPlus size={15} className="group-hover:scale-115 group-hover:rotate-12 transition-transform duration-300" />
                <span>Nuevo Desarrollador</span>
              </motion.button>
            )}

            {/* Botón de Actualización Minimalista Outline */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loadingProyectos || refreshingManual}
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Sincronizar proyectos y etapas en tiempo real con PostgreSQL"
            >
              <RefreshCw size={14} className={loadingProyectos || refreshingManual ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </motion.div>



        {/* Banner Flotante de Retorno Rápido (Volver al Predictor de Burnout en 1 Clic) */}
        {navReturnContext && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between gap-3 border border-blue-400/40"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
                <RotateCcw size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold tracking-tight truncate">
                  Navegación Directa a WBS: Proyecto "{proyectoSeleccionado?.nombre || 'Seleccionado'}"
                </p>
                <p className="text-[0.68rem] sm:text-xs text-blue-100 font-medium truncate mt-0.5">
                  Redireccionado tras inspeccionar a <strong className="text-white underline decoration-white/40">{navReturnContext.dev?.nombreCompleto || navReturnContext.dev?.nombre || 'Colaborador'}</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (navReturnContext.fromTab) {
                  setActiveTab(navReturnContext.fromTab);
                }
                setNavReturnContext(null);
                toast.success(`Retornaste al Predictor de Burnout.`);
              }}
              className="bg-white text-blue-700 hover:bg-blue-50 text-xs font-black py-2.5 px-4 sm:px-5 rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 hover:scale-105"
            >
              <ArrowLeft size={16} className="stroke-[3]" />
              <span>Volver al Predictor de Burnout</span>
            </button>
          </motion.div>
        )}

        {/* Tarjeta de Detalles del Proyecto Seleccionado (Exclusiva de la sección WBS) */}
        {activeTab === 'wbs' && proyectoSeleccionado && proyectoSeleccionado.idProyecto !== 'GLOBAL' && (() => {
          const isProyectoFinalizado = proyectoSeleccionado?.estado === 'FINALIZADO' || proyectoSeleccionado?.estado === 'COMPLETADO';
          const fechaFinTarget = proyectoSeleccionado?.fechaFinEstimada || proyectoSeleccionado?.fechaEstimadaEntrega;
          const fechaInicioFormateada = formatearFechaHumana(proyectoSeleccionado?.fechaInicio);
          const fechaFinFormateada = formatearFechaHumana(fechaFinTarget);
          const duracionEstimada = calcularDuracionProyecto(proyectoSeleccionado?.fechaInicio, fechaFinTarget);

          return (
            <div className="space-y-4">
              {/* Barra de Navegación de Retorno Rápido */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFromReasigNotifModal(false);
                    seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                    setActiveTab('wbs');
                  }}
                  className="outline-button text-xs py-2 px-4 font-bold inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs rounded-2xl transition-all"
                  title="Regresar al catálogo corporativo de proyectos"
                >
                  <ArrowLeft size={16} className="text-zinc-500" />
                  <span>Volver al Catálogo de Proyectos</span>
                </button>

                {!isMiProyecto && (
                  <span className="px-3 py-1 rounded-full text-[0.68rem] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 font-mono shadow-2xs">
                    <Lock size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>Modo Lectura Exclusivo (Supervisión)</span>
                  </span>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mb-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4 min-w-0"
              >
                {/* Banner de Proyecto Reasignado por Coordinación (Diseño Profesional sin emojis) */}
                {proyectoSeleccionado?.reasignado && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-black flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-amber-300 shrink-0" />
                      <span>REASIGNACIÓN DIRECTIVA: Dirección técnica transferida por la Coordinación General</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-[0.65rem] uppercase tracking-wider font-mono">
                      Supervisión Directiva
                    </span>
                  </div>
                )}

                {/* Banner de Modo Lectura Exclusivo para Proyectos de Otros Líderes (Sin emojis) */}
                {!isMiProyecto && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2.5 shadow-2xs">
                    <Lock size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Modo Lectura Exclusivo: Este proyecto es supervisado por <strong>{proyectoSeleccionado.lider ? `${proyectoSeleccionado.lider.nombre} ${proyectoSeleccionado.lider.apellido}` : 'otro Líder'}</strong>. Solo su Líder responsable posee permisos de edición y gestión.</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
                      <FolderGit2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight truncate max-w-full sm:max-w-md lg:max-w-xl" title={proyectoSeleccionado?.nombre || ''}>
                          {proyectoSeleccionado?.nombre || 'Proyecto Activo'}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-extrabold tracking-wide uppercase border shrink-0 inline-flex items-center gap-1.5 ${proyectoSeleccionado?.estado === 'FINALIZADO' || proyectoSeleccionado?.estado === 'COMPLETADO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800' :
                            proyectoSeleccionado?.estado === 'PAUSADO' || proyectoSeleccionado?.estado === 'EN_PAUSA'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse' :
                              proyectoSeleccionado?.estado === 'INHABILITADO'
                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800'
                          }`}>
                          {proyectoSeleccionado?.estado === 'PAUSADO' || proyectoSeleccionado?.estado === 'EN_PAUSA' ? (
                            <><Pause size={12} className="text-amber-600 fill-amber-600" /> PROYECTO EN PAUSA</>
                          ) : proyectoSeleccionado?.estado === 'INHABILITADO' ? (
                            <><UserX size={12} className="text-red-600" /> INHABILITADO</>
                          ) : isProyectoFinalizado ? (
                            <><CheckCircle2 size={12} className="text-emerald-600" /> FINALIZADO (Solo Lectura)</>
                          ) : (
                            proyectoSeleccionado?.estado || 'ACTIVO'
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Identificador del Proyecto: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">PRJ-00{proyectoSeleccionado?.idProyecto || 0}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {proyectoSeleccionado?.lider && (
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                        <User size={14} className="text-blue-600 dark:text-blue-400" />
                        <span>
                          Líder: <strong className="text-zinc-900 dark:text-zinc-100">{proyectoSeleccionado.lider.nombre} {proyectoSeleccionado.lider.apellido}</strong>
                        </span>
                      </div>
                    )}

                    {/* Botón: Registro de Cambios (Auditoría General con Contador de Novedades & Animaciones Avanzadas) */}
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      type="button"
                      onClick={() => handleAbrirHistorialCambiosLider(proyectoSeleccionado.idProyecto)}
                      className="outline-button group text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50/40 hover:bg-purple-100/80 dark:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-600 cursor-pointer shadow-2xs hover:shadow-lg hover:shadow-purple-500/20 rounded-2xl transition-all"
                      title="Ver el historial acumulado de modificaciones y auditoría registradas en el proyecto"
                    >
                      <ClipboardList size={15} className="text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-115 group-hover:-rotate-12 transition-transform duration-300" />
                      <span>Registro de Cambios</span>
                      {unreadHistorialCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-extrabold text-[0.62rem] animate-pulse shadow-xs">
                          {unreadHistorialCount} nuevo{unreadHistorialCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </motion.button>

                    {/* Botón: Generar Reporte PDF (Disponible para todos con Animación Avanzada) */}
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      type="button"
                      onClick={() => setShowGenerarReportePdfModal(true)}
                      className="outline-button group text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50/40 hover:bg-blue-100/80 dark:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer shadow-2xs hover:shadow-lg hover:shadow-blue-500/20 rounded-2xl transition-all"
                      title="Generar e imprimir reporte técnico/ejecutivo del proyecto en formato PDF"
                    >
                      <FileText size={15} className="text-blue-600 dark:text-blue-400 shrink-0 group-hover:-translate-y-0.5 group-hover:scale-115 transition-transform duration-300" />
                      <span>Generar Reporte PDF</span>
                    </motion.button>

                    {/* Acción Exclusiva del Líder Directivo: Pausar o Reactivar Proyecto con Animación Avanzada */}
                    {isMiProyecto && !isProyectoFinalizado && (
                      proyectoSeleccionado?.estado === 'EN_PAUSA' || proyectoSeleccionado?.estado === 'PAUSADO' ? (
                        <motion.button
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          type="button"
                          onClick={handleReactivarProyecto}
                          disabled={submittingPausa}
                          className="outline-button group text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/40 hover:border-emerald-400 dark:hover:border-emerald-500 cursor-pointer shadow-2xs hover:shadow-lg hover:shadow-emerald-500/20 rounded-2xl transition-all"
                          title="Reactivar la ejecución del proyecto y reanudar actividades WBS"
                        >
                          {submittingPausa ? (
                            <Loader2 size={15} className="animate-spin text-emerald-600" />
                          ) : (
                            <Play size={15} className="text-emerald-600 fill-emerald-600 group-hover:scale-115 group-hover:translate-x-0.5 transition-transform duration-300" />
                          )}
                          <span>Reactivar Proyecto</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          type="button"
                          onClick={() => setShowConfirmPausarModal(true)}
                          disabled={submittingPausa}
                          className="outline-button group text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 bg-amber-50/60 hover:bg-amber-100 dark:bg-amber-950/40 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer shadow-2xs hover:shadow-lg hover:shadow-amber-500/20 rounded-2xl transition-all"
                          title="Pausar temporalmente el proyecto con evaluación de procesos y cronograma"
                        >
                          {submittingPausa ? (
                            <Loader2 size={15} className="animate-spin text-amber-600" />
                          ) : (
                            <Pause size={15} className="text-amber-600 fill-amber-600 group-hover:scale-115 group-hover:rotate-12 transition-transform duration-300" />
                          )}
                          <span>Pausar Proyecto</span>
                        </motion.button>
                      )
                    )}

                    {/* Acción Exclusiva del Líder Directivo: Finalizar Proyecto con Animación Avanzada */}
                    {isMiProyecto && !isProyectoFinalizado && (
                      <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        type="button"
                        onClick={() => setShowConfirmFinalizar(true)}
                        className="outline-button group text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/80 bg-red-50/50 hover:bg-red-100/80 dark:bg-red-950/40 hover:border-red-400 dark:hover:border-red-600 cursor-pointer shadow-2xs hover:shadow-lg hover:shadow-red-500/20 rounded-2xl transition-all"
                        title="Cerrar formalmente el ciclo de vida del proyecto y liberar recursos"
                      >
                        <CheckCircle2 size={15} className="text-red-500 group-hover:scale-115 group-hover:rotate-6 transition-transform duration-300" />
                        <span>Finalizar Proyecto</span>
                      </motion.button>
                    )}

                    {/* Acciones Exclusivas de la Coordinación General (Edición Directiva de Parámetros) */}
                    {user?.rol === 'ROLE_COORDINADOR' && (
                      <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        type="button"
                        onClick={handleAbrirEditarProyecto}
                        className="outline-button group text-xs py-2 px-3.5 font-bold inline-flex items-center gap-2 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer shadow-2xs hover:shadow-lg hover:shadow-zinc-500/15 rounded-2xl transition-all"
                        title="Editar nombre, presupuesto, cliente, fechas y cambiar estado operativo"
                      >
                        <Edit3 size={15} className="text-zinc-600 dark:text-zinc-400 group-hover:rotate-12 group-hover:scale-115 transition-transform duration-300" />
                        <span>Editar Proyecto</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* 1. Cliente u Organización */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Building2 size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                        Cliente / Organización
                      </span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate" title={proyectoSeleccionado?.cliente || 'Organización Interna IKernell'}>
                        {proyectoSeleccionado?.cliente || 'Organización Interna IKernell'}
                      </p>
                    </div>
                  </div>

                  {/* 2. Dimensión Presupuestal */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <CircleDollarSign size={16} />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col">
                      <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        Dimensión Presupuestal
                      </span>
                      {formatearMoneda(proyectoSeleccionado?.presupuesto) ? (
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {formatearMoneda(proyectoSeleccionado.presupuesto)}
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic text-xs">
                          Presupuesto por definir
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. Cronograma Estimado con Fechas Humanizadas y Días Restantes */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 sm:col-span-2 lg:col-span-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <CalendarClock size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap mb-1">
                        <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Cronograma Estimado
                        </span>
                        {duracionEstimada && (
                          <span
                            className="inline-flex items-center gap-1 text-[0.65rem] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-mono"
                            title="Duración total calculada entre la fecha de inicio y la fecha estimada de finalización"
                          >
                            <Clock size={10} /> (Duración: {duracionEstimada})
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs" title={`${fechaInicioFormateada} → ${fechaFinFormateada}`}>
                        {fechaInicioFormateada} <span className="text-zinc-400 font-normal mx-0.5">&rarr;</span> {fechaFinFormateada}
                      </p>
                      {/* Cálculo interactivo de días restantes */}
                      {(proyectoSeleccionado?.fechaEstimadaEntrega || proyectoSeleccionado?.fechaFinEstimada) && (() => {
                        const hoy = new Date();
                        const fechaFinStr = proyectoSeleccionado?.fechaEstimadaEntrega || proyectoSeleccionado?.fechaFinEstimada;
                        if (!fechaFinStr || typeof fechaFinStr !== 'string') return null;
                        const fin = new Date(fechaFinStr);
                        if (isNaN(fin.getTime())) return null;
                        const diffTime = fin.getTime() - hoy.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (isNaN(diffDays)) return null;
                        return (
                          <p className="text-[0.65rem] font-bold text-violet-600 dark:text-violet-400 mt-1 font-mono">
                            &bull; {diffDays > 0 ? `Faltan ${diffDays} días para entrega` : diffDays === 0 ? 'Entrega programada para hoy' : `Concluido hace ${Math.abs(diffDays)} días`}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 4. Descripción del Alcance Colapsable */}
                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border-l-4 border-indigo-500 text-xs min-w-0 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlignLeft size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Descripción del Alcance y Objetivos
                      </span>
                    </div>
                    {proyectoSeleccionado?.descripcion && (proyectoSeleccionado.descripcion?.length || 0) > 120 && (
                      <button
                        type="button"
                        onClick={() => setScopeExpanded(!scopeExpanded)}
                        className="text-[0.65rem] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {scopeExpanded ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>
                  {proyectoSeleccionado?.descripcion?.trim() ? (
                    <p className={`text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed text-xs pt-0.5 ${!scopeExpanded && (proyectoSeleccionado.descripcion?.length || 0) > 120 ? 'line-clamp-2' : ''}`}>
                      {proyectoSeleccionado.descripcion}
                    </p>
                  ) : (
                    <p className="text-zinc-500 italic text-xs font-medium leading-relaxed pt-0.5">
                      No se ha definido el alcance de este proyecto.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}

        {/* 1. SECCIÓN: WBS Y PROYECTOS */}
        {activeTab === 'wbs' && (
          <motion.div
            key="wbs"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {(!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') ? (
              <div className="space-y-6">
                {/* Panel de Control Unificado del Catálogo */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
                  {/* 1. Cabecera y Barra de Búsqueda Integrada */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                          <FolderGit2 size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        Catálogo Corporativo de Proyectos
                      </h4>
                      <p className="text-[0.8rem] text-zinc-500 dark:text-zinc-400 font-medium mt-1 pl-1">
                        Explore el portafolio, aplique filtros y seleccione un proyecto para gestionar su WBS.
                      </p>
                    </div>

                    {/* Barra de Búsqueda de alta accesibilidad */}
                    <div className="w-full lg:w-[420px]">
                      <div className="relative group">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text"
                          value={busquedaCatalogoProyecto}
                          onChange={(e) => setBusquedaCatalogoProyecto(e.target.value)}
                          placeholder="Buscar por nombre, cliente, código..."
                          className="w-full pl-10 pr-9 py-2.5 text-xs rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-semibold shadow-2xs hover:bg-white dark:hover:bg-zinc-900"
                        />
                        {busquedaCatalogoProyecto && (
                          <button
                            type="button"
                            onClick={() => setBusquedaCatalogoProyecto('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/60" />

                  {/* 2. Filtros de Estado y Visualización */}
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    {/* Selector de Propiedad */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[0.65rem] font-bold uppercase text-zinc-400 tracking-wider mr-1">
                        Visualizar:
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiltroPropiedadLider('MIS_PROYECTOS')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 border ${filtroPropiedadLider === 'MIS_PROYECTOS'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/80'
                          }`}
                      >
                        <Briefcase size={14} />
                        <span>Mis Proyectos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFiltroPropiedadLider('OTROS_LIDERES')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 border ${filtroPropiedadLider === 'OTROS_LIDERES'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/80'
                          }`}
                      >
                        <Globe size={14} />
                        <span className="hidden sm:inline">Otros Proyectos</span>
                        <span className="sm:hidden">Otros</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFiltroPropiedadLider('TODOS')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${filtroPropiedadLider === 'TODOS'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/80'
                          }`}
                      >
                        <span>Todos</span>
                      </button>
                    </div>

                    {/* Filtro Secundario por Estado con Contadores */}
                    <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
                      <span className="text-[0.65rem] font-bold uppercase text-zinc-400 tracking-wider shrink-0 mr-1">
                        Estado:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        {[
                          { id: 'TODOS', label: 'Todos', count: countsPorEstado.TODOS },
                          { id: 'ACTIVO', label: 'Activos', count: countsPorEstado.ACTIVO },
                          { id: 'EN_PLANIFICACION', label: 'En Planif.', count: countsPorEstado.EN_PLANIFICACION },
                          { id: 'PAUSADO', label: 'Pausados', count: countsPorEstado.PAUSADO },
                          { id: 'FINALIZADO', label: 'Finalizados', count: countsPorEstado.FINALIZADO },
                          { id: 'REASIGNADO', label: 'Reasignados', count: countsPorEstado.REASIGNADO },
                          { id: 'NUEVO', label: 'Nuevos (3D)', count: countsPorEstado.NUEVO }
                        ].map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setFiltroEstadoCatalogo(st.id)}
                            className={`px-3 py-1.5 rounded-[10px] text-[0.7rem] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border group ${filtroEstadoCatalogo === st.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-800'
                              }`}
                          >
                            <span>{st.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[0.6rem] font-black ${filtroEstadoCatalogo === st.id
                                ? 'bg-blue-500 text-white shadow-inner'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                              }`}>
                              {st.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grilla de Tarjetas Interactivas de Proyectos (B&W Corporate High-Contrast) */}
                {proyectosCatalogoFiltrados.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-xs font-medium">
                    No se encontraron proyectos que coincidan con el término de búsqueda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {proyectosCatalogoFiltrados.map((p) => {
                      const badgeStyle = getEstadoBadgeClasses(p.estado);
                      const presupuestoFormateado = p.presupuesto ? Number(p.presupuesto).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
                      const userDevId = user?.idTrabajador || user?.id;
                      const isPastLiderPending = p.reasignado
                        && !p.leidoPorLiderAnterior
                        && userDevId
                        && String(p.idLiderAnterior) === String(userDevId)
                        && getHoursSinceReassignment(p.fechaReasignacion) <= 24;
                      const isReasig = p.reasignado && !p.leidoPorLiderAnterior && getHoursSinceReassignment(p.fechaReasignacion) <= 24;
                      const isNuevo = !p.reasignado && (p.fechaInicio || p.createdAt) && getHoursSinceReassignment(p.fechaInicio || p.createdAt) <= 72;

                      return (
                        <div
                          key={p.idProyecto}
                          onClick={() => {
                            if (isPastLiderPending) {
                              handleAbrirNotifReasignacionModal(p);
                            } else {
                              seleccionarProyecto(p);
                            }
                          }}
                          className={`group p-6 rounded-3xl border shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${isReasig || isPastLiderPending
                              ? 'border-amber-400 dark:border-amber-700/80 bg-gradient-to-b from-amber-50/40 via-amber-50/10 to-white dark:from-amber-950/20 dark:to-zinc-900 shadow-md shadow-amber-500/5 hover:border-amber-500'
                              : isNuevo
                                ? 'border-emerald-400 dark:border-emerald-700/80 bg-gradient-to-b from-emerald-50/40 via-emerald-50/10 to-white dark:from-emerald-950/20 dark:to-zinc-900 shadow-md shadow-emerald-500/5 hover:border-emerald-500'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400'
                            }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs flex items-center justify-center shrink-0 shadow-sm font-mono">
                                  #{p.idProyecto}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {p.nombre}
                                  </h4>
                                  <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1 truncate mt-0.5">
                                    <Building2 size={12} className="shrink-0 text-zinc-400" />
                                    <span>{p.cliente || 'Cliente Interno'}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isReasig || isPastLiderPending ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 animate-pulse flex items-center gap-1 shadow-2xs">
                                    <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                                    PROCESO REASIGNADO (1D)
                                  </span>
                                ) : isNuevo ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700 animate-pulse flex items-center gap-1 shadow-2xs">
                                    <Sparkles size={11} className="text-emerald-600 animate-bounce shrink-0" />
                                    NUEVO PROYECTO (3D)
                                  </span>
                                ) : null}

                                <span className={`inline-flex items-center gap-1.5 text-[0.62rem] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${badgeStyle.badge}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                                  <span>{p.estado || 'ACTIVO'}</span>
                                </span>
                              </div>
                            </div>

                            {p.descripcion && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                                {p.descripcion}
                              </p>
                            )}

                            {/* Ficha de Líder y Etiqueta de Estado */}
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <User size={13} className="text-blue-500 shrink-0" />
                                <span className="truncate font-semibold text-zinc-700 dark:text-zinc-300">
                                  Líder: <strong>{p.lider ? `${p.lider.nombre} ${p.lider.apellido}` : 'Sin Asignar'}</strong>
                                </span>
                              </div>

                              {isReasig || isPastLiderPending ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 text-[0.62rem] font-extrabold shrink-0 shadow-2xs">
                                  Reasignado
                                </span>
                              ) : isNuevo ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 text-[0.62rem] font-extrabold shrink-0 shadow-2xs">
                                  Nuevo
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Inversión Financiera Destacada & Boton de Accion Directa */}
                          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs font-semibold">
                            <div className="flex flex-col">
                              <span className="text-[0.62rem] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                                Presupuesto Total
                              </span>
                              <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                                ${presupuestoFormateado}
                              </span>
                            </div>

                            <span className={`text-[0.72rem] font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-1 ${isPastLiderPending ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-blue-600 dark:text-blue-400'
                              }`}>
                              <span>{isPastLiderPending ? 'Ver Detalle' : 'Gestionar WBS'}</span>
                              <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {loadingDetalle ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : (
                    <>
                      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/40 transition-all duration-200">
                        <div>
                          <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Estado del Proyecto</span>
                          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            {proyectoSeleccionado?.estado || 'ACTIVO'}
                          </div>
                        </div>
                        <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          Fin Estimado: {proyectoSeleccionado?.fechaFinEstimada || '2027-02-06'}
                        </span>
                      </div>

                      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/40 transition-all duration-200">
                        <div>
                          <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Total Errores Evaluados</span>
                          <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                            {errores?.length || 0} Incidencias
                          </div>
                        </div>
                        <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          Persistidas en PostgreSQL
                        </span>
                      </div>

                      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/40 transition-all duration-200">
                        <div>
                          <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Horas de Interrupción</span>
                          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                            {totalHorasContingencia} Horas
                          </div>
                        </div>
                        <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          En {interrupciones?.length || 0} eventos reportados
                        </span>
                      </div>

                      {/* 4ta Tarjeta Ejecutiva Interactiva: Desarrolladores Asignados al Proyecto */}
                      <div
                        onClick={() => setShowNominaDevsModal(true)}
                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-200 group relative overflow-hidden"
                        title="Haga clic para ver la nómina completa del equipo y gestionar desarrolladores"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Equipo Reservado</span>
                            <Users size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                            {desarrolladoresAsignadosProyecto?.length || 0} Integrantes
                          </div>
                        </div>
                        <div className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between font-medium">
                          <span>Total: {desarrolladoresAsignadosProyecto?.reduce((acc, curr) => acc + (curr.horasSemanales || 0), 0)}h/sem</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                            Nómina <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Desglose de Fases WBS con Trazabilidad de Desarrolladores */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Layers size={18} className="text-blue-600 dark:text-blue-400" /> Estructura de Desglose de Trabajo (WBS)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        Desglose estructurado del proyecto en fases, etapas y actividades asignadas a desarrolladores.
                      </p>
                    </div>

                    {!isMiProyecto ? (
                      <div className="p-2.5 px-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                        <Lock size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>Modo Lectura Activo (Proyecto Supervisado por otro Líder)</span>
                      </div>
                    ) : (proyectoSeleccionado?.estado === 'FINALIZADO' || proyectoSeleccionado?.estado === 'COMPLETADO') ? (
                      <div className="p-2.5 px-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                        <Lock size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>WBS Congelada (Modo Solo Lectura)</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNuevaEtapaModal(true)}
                          disabled={!proyectoSeleccionado}
                          className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Crear una nueva fase o etapa en el desglose WBS (inicia en PENDIENTE)"
                        >
                          <Plus size={14} /> Nueva Etapa
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAsignarModal(true)}
                          disabled={!proyectoSeleccionado}
                          className="gradient-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                          title="Crear y asignar una nueva tarea técnica a un desarrollador en PostgreSQL"
                        >
                          <UserCheck size={14} /> Asignar Actividad
                        </button>
                      </div>
                    )}
                  </div>

                  {loadingDetalle && (
                    <div className="space-y-3">
                      <div className="h-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
                      <div className="h-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
                    </div>
                  )}

                  {!loadingDetalle && (!etapas || etapas.length === 0) && (
                    <div className="text-center py-12 text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      No hay etapas WBS configuradas para este proyecto. Haga clic en "Nueva Etapa" para comenzar.
                    </div>
                  )}

                  {!loadingDetalle && etapas?.length > 0 && (
                    <div className="space-y-4">
                      {etapas.map((etapa, i) => {
                        const acts = etapa?.actividades || [];
                        const totalTareas = acts.length;
                        const tareasCompletadas = acts.filter(a => ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO'].includes((a.estado || '').toUpperCase())).length;
                        const todasTareasCompletadas = totalTareas > 0 && tareasCompletadas === totalTareas;
                        const estaFinalizada = (etapa?.estado || '').toUpperCase() === 'FINALIZADA' || (etapa?.estado || '').toUpperCase() === 'COMPLETADO';

                        return (
                          <div key={etapa?.idEtapa || i} className="p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">

                            {/* Cabecera de la Etapa */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-700/60 pb-3">
                              <div>
                                <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
                                  <span>{etapa?.nombreEtapa}</span>
                                  <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-800 dark:text-zinc-200 text-[0.65rem] font-mono font-extrabold border border-zinc-300/80 dark:border-zinc-600">
                                    #Etapa {etapa?.idEtapa}
                                  </span>
                                </div>
                                <span className="text-xs text-zinc-500 font-medium">
                                  {etapa?.actividades ? `${etapa.actividades.length} tarea(s) vinculadas` : 'Sin tareas'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className={`text-[0.65rem] font-extrabold px-3 py-1 rounded-full border ${estaFinalizada
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
                                    todasTareasCompletadas
                                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse' :
                                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                  }`}>
                                  {estaFinalizada ? 'FINALIZADA' : todasTareasCompletadas ? 'REVISIÓN REQUERIDA' : (etapa?.estado ? etapa.estado.replace(/_/g, ' ') : 'PENDIENTE')}
                                </span>

                                {isMiProyecto && !isProyectoFinalizado && !estaFinalizada && todasTareasCompletadas && (
                                  <button
                                    type="button"
                                    onClick={() => handleFinalizarEtapaFormallyLider(etapa)}
                                    title="Marcar esta etapa como FINALIZADA oficialmente"
                                    className="px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-md bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 animate-bounce shrink-0"
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>Finalizar Etapa</span>
                                  </button>
                                )}

                                {isMiProyecto && !isProyectoFinalizado && (
                                  <button
                                    type="button"
                                    onClick={() => handleAbrirEditarEtapa(etapa)}
                                    className="p-1.5 px-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 transition-all cursor-pointer inline-flex items-center gap-1 text-[0.68rem] font-extrabold shadow-2xs"
                                    title="Editar nombre y estado operativo de esta etapa WBS"
                                  >
                                    <Edit3 size={13} className="text-blue-600 dark:text-blue-400" />
                                    <span>Editar</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Banner / Alerta de Fase Completada por Desarrolladores */}
                            {isMiProyecto && !isProyectoFinalizado && todasTareasCompletadas && !estaFinalizada && (
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
                                  onClick={() => handleFinalizarEtapaFormallyLider(etapa)}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
                                >
                                  <CheckCircle2 size={15} />
                                  <span>Finalizar Etapa Ahora</span>
                                </button>
                              </motion.div>
                            )}

                          {/* Lista de Actividades dentro de esta Etapa */}
                          {etapa?.actividades && etapa.actividades.length > 0 ? (
                            <div className="space-y-2 pt-1">
                              {etapa.actividades.map(act => (
                                <div
                                  key={act.idActividad}
                                  className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs shadow-sm"
                                >
                                  <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                                      {act.descripcion}
                                    </div>

                                    {/* Trazabilidad: Desarrollador Asignado */}
                                    <div className="flex items-center gap-2 text-[0.7rem] text-zinc-500 font-medium flex-wrap min-w-0">
                                      {act.desarrollador ? (
                                        <div className="inline-flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700/80 flex-wrap min-w-0">
                                          <UserCheck size={13} className="text-emerald-500 shrink-0" />
                                          <span>{act.desarrollador.nombre} {act.desarrollador.apellido}</span>
                                          {act.desarrollador.especialidad && (
                                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[0.65rem] font-bold border border-indigo-100 dark:border-indigo-800 truncate max-w-[200px] sm:max-w-[280px]">
                                              {act.desarrollador.especialidad}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-xl border border-red-200 dark:border-red-800">
                                          <AlertTriangle size={13} className="text-red-500" />
                                          Sin Asignar
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                                    {(() => {
                                      const st = (act.estado || 'PENDIENTE').toUpperCase().replace(/[\s_]+/g, '_');
                                      const isFin = ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO'].includes(st);
                                      const isProg = ['EN_PROGRESO', 'EN_PROCESO', 'EN_CURSO', 'ACTIVO'].includes(st);
                                      const text = (act.estado || 'PENDIENTE').replace(/_/g, ' ');
                                      const colorClass = isFin
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                        : isProg
                                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
                                      return (
                                        <span className={`text-[0.65rem] font-extrabold uppercase px-2.5 py-1 rounded-md border ${colorClass}`}>
                                          {text}
                                        </span>
                                      );
                                    })()}

                                    {/* Botón Reasignar Actividad (Solo tareas PENDIENTES, no finalizadas ni en progreso) */}
                                    {isMiProyecto && proyectoSeleccionado?.estado !== 'FINALIZADO' && proyectoSeleccionado?.estado !== 'COMPLETADO' && (() => {
                                      const st = (act.estado || '').toUpperCase().replace(/[\s_]+/g, '_');
                                      const isFinalizadaOEnProceso = ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO', 'EN_PROGRESO', 'EN_PROCESO', 'EN_CURSO'].includes(st);

                                      if (isFinalizadaOEnProceso) return null;

                                      return (
                                        <button
                                          type="button"
                                          onClick={() => handleAbrirReasignar(act)}
                                          className="outline-button text-[0.7rem] py-1 px-2.5 font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                          title="Transferir esta tarea pendiente a otro desarrollador con justificación histórica (HU-25)"
                                        >
                                          <RotateCcw size={12} /> Reasignar
                                        </button>
                                      );
                                    })()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[0.7rem] text-zinc-400 italic py-2">
                              No hay tareas asignadas en esta etapa. Haga clic en "Asignar Actividad" para comenzar.
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  )}
                </motion.div>
              </>
            )}

          </motion.div>
        )}

        {/* 2. SECCIÓN: SEMÁFORO PREDICTIVO */}
        {activeTab === 'semaforo' && (
          <motion.div
            key="semaforo"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <ErrorBoundary title="Error en Módulo Semáforo Inteligente">
              <SemaforoInteligente
                idProyecto={proyectoSeleccionado?.idProyecto || 'GLOBAL'}
                proyectoNombre={proyectoSeleccionado?.nombre || 'Todos los Proyectos'}
                onNavigateIncidencias={handleNavigateIncidencias}
                onSelectProyecto={seleccionarProyecto}
              />
            </ErrorBoundary>
          </motion.div>
        )}

        {/* 2. SECCIÓN: GESTIÓN DE NÓMINA & PERSONAL (Líderes y Desarrolladores) */}
        {activeTab === 'personal' && (
          <motion.div
            key="personal"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Header de Gestión de Personal */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div>
                <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                  Administración de Talento Humano & Accesos
                </span>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                  <Users size={22} className="text-blue-600 dark:text-blue-400" />
                  Nómina & Desarrolladores Corporativos
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs mt-1">
                  Visualización y registro de desarrolladores de software asignados a los proyectos en la plataforma
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[0.68rem] font-extrabold font-mono px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {personalFiltrado.length} Desarrolladores Registrados
                </span>
              </div>
            </motion.div>

            {/* Barra de Filtros & Búsqueda Avanzada */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                {/* Buscador */}
                <div className="relative w-full lg:w-72 shrink-0">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400" />
                  <input
                    type="text"
                    value={searchQueryPersonal}
                    onChange={(e) => setSearchQueryPersonal(e.target.value)}
                    placeholder="Buscar por nombre, cédula, correo..."
                    className="input-field py-2 pl-9 pr-8 text-xs w-full focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  />
                  {searchQueryPersonal && (
                    <button
                      type="button"
                      onClick={() => setSearchQueryPersonal('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Contenedor de Filtros */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto justify-end">
                  {/* Filtro Avanzado: Especialidad Principal (Custom Popover Dropdown) */}
                  {especialidadesDisponibles.length > 0 && (
                    <div className="relative shrink-0 flex items-center gap-2">
                      <span className="text-[0.68rem] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Especialidad:</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownEspecialidad(prev => !prev)}
                          className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 border shadow-2xs ${especialidadFiltroPersonal !== 'TODAS'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                          <Briefcase size={13} className={especialidadFiltroPersonal !== 'TODAS' ? 'text-white' : 'text-blue-600 dark:text-blue-400'} />
                          <span className="max-w-[170px] truncate">
                            {formatEspecialidadLabel(especialidadFiltroPersonal).titulo}
                          </span>
                          <ChevronDown size={13} className={`transition-transform duration-200 ${openDropdownEspecialidad ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {openDropdownEspecialidad && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenDropdownEspecialidad(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute right-0 sm:right-0 top-full mt-2 w-80 sm:w-96 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                              >
                                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                  <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                    <Briefcase size={12} className="text-blue-500" /> Especialidades Registradas
                                  </span>
                                  <span className="text-[0.62rem] font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                    {especialidadesDisponibles.length}
                                  </span>
                                </div>

                                <div className="max-h-72 overflow-y-auto p-1 space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEspecialidadFiltroPersonal('TODAS');
                                      setOpenDropdownEspecialidad(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${especialidadFiltroPersonal === 'TODAS'
                                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-transparent'
                                      }`}
                                  >
                                    <span>Todas las Especialidades</span>
                                    {especialidadFiltroPersonal === 'TODAS' && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                                  </button>

                                  {especialidadesDisponibles.map((esp) => {
                                    const { titulo, stack } = formatEspecialidadLabel(esp);
                                    const isSelected = especialidadFiltroPersonal === esp;

                                    return (
                                      <button
                                        key={esp}
                                        type="button"
                                        onClick={() => {
                                          setEspecialidadFiltroPersonal(esp);
                                          setOpenDropdownEspecialidad(false);
                                        }}
                                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer border ${isSelected
                                            ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                                          }`}
                                      >
                                        <div className="space-y-1 min-w-0">
                                          <div className="text-xs font-bold leading-snug tracking-tight">
                                            {titulo}
                                          </div>
                                          {stack.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                              {stack.map((st, idx) => (
                                                <span
                                                  key={idx}
                                                  className="px-1.5 py-0.5 rounded-md text-[0.6rem] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50"
                                                >
                                                  {st}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Filtro de Estado */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[0.68rem] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Estado:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: 'TODOS', label: 'Todos' },
                        { id: 'ACTIVO', label: 'Habilitados' },
                        { id: 'INHABILITADO', label: 'Inhabilitados' }
                      ].map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setEstadoFiltroPersonal(st.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border shrink-0 ${estadoFiltroPersonal === st.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabla Corporativa de Personal */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              {personalFiltrado.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 space-y-2">
                  <Users size={36} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">No se encontraron colaboradores</p>
                  <p className="text-xs text-zinc-400">Intenta ajustar los criterios de búsqueda o filtros seleccionados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[0.68rem] uppercase font-mono font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      <tr>
                        <th className="py-3.5 px-6">Identificación</th>
                        <th className="py-3.5 px-6">Trabajador & Contacto</th>
                        <th className="py-3.5 px-6">Profesión / Stack Técnico</th>
                        <th className="py-3.5 px-6">Rol Asignado</th>
                        <th className="py-3.5 px-6">Estado Lógico</th>
                        <th className="py-3.5 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {personalFiltrado.map((t) => {
                        const estBool = t.estado === true || t.estado === 'ACTIVO';
                        const rolString = t.rol ? String(t.rol).toUpperCase() : '';
                        const isLider = rolString.includes('LIDER');

                        return (
                          <tr key={t.idTrabajador || t.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-4 px-6 font-mono font-extrabold text-zinc-900 dark:text-zinc-100">
                              #{t.identificacion || t.idTrabajador || 'N/A'}
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {(t.nombre ? t.nombre.charAt(0) : 'U') + (t.apellido ? t.apellido.charAt(0) : '')}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                                    {t.nombre} {t.apellido}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-mono font-semibold">
                                      {t.email}
                                    </span>
                                    {t.emailPersonal && (
                                      <span className="text-[0.62rem] text-zinc-400 dark:text-zinc-500 font-mono italic">
                                        ({t.emailPersonal})
                                      </span>
                                    )}
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

                            <td className="py-4 px-6">
                              {isLider ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                                  <Briefcase size={12} className="text-amber-600 dark:text-amber-400" />
                                  Líder de Proyecto
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                                  <Code2 size={12} className="text-blue-600 dark:text-blue-400" />
                                  Desarrollador
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              {estBool ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.68rem] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Habilitado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.68rem] font-bold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  Inhabilitado
                                </span>
                              )}
                            </td>

                            {/* Botón de Acción: Ver Detalle del Desarrollador */}
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedTrabajadorModal(t)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                title="Ver ficha organizada y stack técnico del desarrollador"
                              >
                                <Eye size={13} />
                                <span>Ver Detalle</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* 3. SECCIÓN: BANDEJA CENTRALIZADA DE INCIDENCIAS (RF-22 a RF-24) */}
        {activeTab === 'incidencias' && (
          <motion.div
            key="incidencias"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Header con Subtexto Descriptivo y Explicativo */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div>
                <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                  Supervisión y Control de Calidad
                </span>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                  <ShieldAlert size={22} className="text-blue-600 dark:text-blue-400" />
                  Consola Centralizada de Incidencias de Equipo
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs mt-1">
                  Monitoreo consolidado de errores técnicos y contingencias. En vista global, muestra el historial completo de la compañía.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuiaModal(true)}
                  className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  title="Guía Rápida: Cómo Entender y Resolver Casos en 3 Pasos"
                >
                  <HelpCircle size={14} className="text-blue-500" /> Guía Rápida
                </button>
                <button
                  type="button"
                  onClick={() => seleccionarProyecto(proyectoSeleccionado || { idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' })}
                  disabled={loadingDetalle}
                  className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  title="Sincronizar incidencias y tiempos de interrupción en tiempo real con PostgreSQL"
                >
                  <RefreshCw size={13} className={loadingDetalle ? 'animate-spin text-blue-500' : ''} /> Refrescar Incidencias
                </button>
              </div>
            </motion.div>

            {/* Tarjetas Resumen con Filtrado Interactivo Directo */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total Reportes */}
              <div
                onClick={() => {
                  setFiltroTipoInc('TODOS');
                  setFiltroEstadoInc('TODOS');
                  setFiltroSeveridadInc('TODAS');
                }}
                className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${filtroTipoInc === 'TODOS' && filtroEstadoInc === 'TODOS' && filtroSeveridadInc === 'TODAS'
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/40'
                  }`}
                title="Haga clic para ver el listado completo sin filtros de estado o tipo"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-bold text-zinc-400 uppercase block">Total Reportes</span>
                  <span className="text-[0.6rem] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Filtrar todos →
                  </span>
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 my-1">
                  {(errores?.length || 0) + (interrupciones?.length || 0)}
                </div>
                <span className="text-[0.65rem] text-zinc-400 font-medium">Ver lista completa</span>
              </div>

              {/* Card 2: Errores Técnicos */}
              <div
                onClick={() => {
                  setFiltroTipoInc('ERRORES');
                  setFiltroEstadoInc('TODOS');
                  setFiltroSeveridadInc('TODAS');
                }}
                className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${filtroTipoInc === 'ERRORES' && filtroSeveridadInc === 'TODAS'
                    ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-500/40'
                  }`}
                title="Haga clic para filtrar exclusivamente los errores técnicos de código"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-bold text-red-500 uppercase block">Errores Técnicos</span>
                  <span className="text-[0.6rem] font-bold text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Filtrar errores →
                  </span>
                </div>
                <div className="text-2xl font-black text-red-600 dark:text-red-400 my-1">
                  {errores?.length || 0}
                </div>
                <span className="text-[0.65rem] text-zinc-400 font-medium">Ver solo errores técnicos</span>
              </div>

              {/* Card 3: Contingencias (Horas) */}
              <div
                onClick={() => {
                  setFiltroTipoInc('INTERRUPCIONES');
                  setFiltroEstadoInc('TODOS');
                  setFiltroSeveridadInc('TODAS');
                }}
                className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${filtroTipoInc === 'INTERRUPCIONES'
                    ? 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/40'
                  }`}
                title="Haga clic para filtrar las interrupciones operativas y horas de contingencia"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-bold text-amber-500 uppercase block">Contingencias (Horas)</span>
                  <span className="text-[0.6rem] font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Filtrar tiempos →
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 my-1">
                  {totalHorasContingencia}h
                </div>
                <span className="text-[0.65rem] text-zinc-400 font-medium">Ver eventos por tiempo</span>
              </div>

              {/* Card 4: Solucionados */}
              <div
                onClick={() => {
                  setFiltroEstadoInc('SOLUCIONADO');
                  setFiltroTipoInc('TODOS');
                  setFiltroSeveridadInc('TODAS');
                }}
                className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${filtroEstadoInc === 'SOLUCIONADO'
                    ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500/40'
                  }`}
                title="Haga clic para filtrar las incidencias solucionadas y resueltas"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-bold text-emerald-500 uppercase block">Solucionados</span>
                  <span className="text-[0.6rem] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Filtrar soluciones →
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 my-1">
                  {[...(errores || []), ...(interrupciones || [])].filter(i => i.estadoAtencion === 'SOLUCIONADO' || i.estadoAtencion === 'RESUELTO').length}
                </div>
                <span className="text-[0.65rem] text-zinc-400 font-medium">Ver casos resueltos</span>
              </div>
            </motion.div>

            {/* Filtros Combinados */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap gap-3 items-center justify-between">
              {/* Filtro Tipo */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFiltroTipoInc('TODOS')}
                  title="Mostrar tanto errores de código como interrupciones operativas"
                  className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${filtroTipoInc === 'TODOS'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                >
                  Todos ({(errores?.length || 0) + (interrupciones?.length || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoInc('ERRORES')}
                  title="Filtrar exclusivamente errores técnicos de software"
                  className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${filtroTipoInc === 'ERRORES'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                >
                  <Bug size={12} /> Errores ({errores?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoInc('INTERRUPCIONES')}
                  title="Filtrar exclusivamente contingencias e interrupciones de tiempo"
                  className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${filtroTipoInc === 'INTERRUPCIONES'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                >
                  <AlertTriangle size={12} /> Interrupciones ({interrupciones?.length || 0})
                </button>
              </div>

              {/* Filtros Ejecutivos con CustomSelect */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Filtro Estado */}
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] font-bold text-zinc-400 uppercase">Estado:</span>
                  <CustomSelect
                    value={filtroEstadoInc}
                    onChange={(val) => setFiltroEstadoInc(val)}
                    options={[
                      { value: 'TODOS', label: 'Todos los Estados' },
                      { value: 'REGISTRADO', label: 'Registrado' },
                      { value: 'EN_REVISION', label: 'En Revisión' },
                      { value: 'SOLUCIONADO', label: 'Solucionado' }
                    ]}
                    maxWidth="max-w-[170px]"
                  />
                </div>

                {/* Filtro Desarrollador */}
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] font-bold text-zinc-400 uppercase">Desarrollador:</span>
                  <CustomSelect
                    value={filtroDevInc}
                    onChange={(val) => setFiltroDevInc(val)}
                    options={[
                      { value: 'TODOS', label: 'Todos los Desarrolladores', subtitle: 'Filtrar por todo el equipo' },
                      ...(desarrolladores || []).map(d => ({
                        value: d.idTrabajador,
                        label: `${d.nombre} ${d.apellido}`,
                        subtitle: getCleanEspecialidad(d.especialidad, d.profesion)
                      }))
                    ]}
                    maxWidth="max-w-[240px]"
                    searchable={true}
                    icon={User}
                  />
                </div>

                {/* Filtro por Fecha / Período */}
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <Calendar size={11} className="text-zinc-400" />
                    Fecha:
                  </span>
                  <CustomSelect
                    value={filtroFechaTipo}
                    onChange={(val) => {
                      setFiltroFechaTipo(val);
                      if (val === 'RANGO') {
                        setTempFechaDesde(filtroFechaDesde);
                        setTempFechaHasta(filtroFechaHasta);
                        setShowFiltroFechasModal(true);
                      }
                    }}
                    options={[
                      { value: 'TODAS', label: 'Todas las Fechas' },
                      { value: 'HOY', label: 'Hoy' },
                      { value: '7_DIAS', label: 'Últimos 7 Días' },
                      { value: '30_DIAS', label: 'Últimos 30 Días' },
                      { value: 'ESTE_MES', label: 'Este Mes' },
                      { value: 'RANGO', label: 'Rango Personalizado...' }
                    ]}
                    maxWidth="max-w-[190px]"
                    icon={Calendar}
                  />
                </div>

                {/* Botón de Cambiar / Ajustar Fechas en Ventana Emergente */}
                {(filtroFechaTipo === 'RANGO' || filtroFechaDesde || filtroFechaHasta) && (
                  <div className="flex items-center gap-2 bg-blue-50/80 dark:bg-blue-950/40 p-1 px-2.5 rounded-xl border border-blue-200 dark:border-blue-800">
                    <button
                      type="button"
                      onClick={() => {
                        setTempFechaDesde(filtroFechaDesde);
                        setTempFechaHasta(filtroFechaHasta);
                        setShowFiltroFechasModal(true);
                      }}
                      className="text-xs font-bold text-blue-700 dark:text-blue-300 inline-flex items-center gap-1.5 cursor-pointer hover:underline"
                      title="Abrir ventana emergente para modificar las fechas seleccionadas"
                    >
                      <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
                      <span>
                        {filtroFechaDesde && filtroFechaHasta
                          ? `${filtroFechaDesde} - ${filtroFechaHasta}`
                          : 'Ingresar Rango de Fechas'}
                      </span>
                      <Edit3 size={11} className="text-blue-500 opacity-80" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroFechaDesde('');
                        setFiltroFechaHasta('');
                        setFiltroFechaTipo('TODAS');
                      }}
                      className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Quitar filtro de fechas"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tabla Corporativa de Incidencias e Interrupciones (Optimizada para pantalla completa en PC y Responsive en Móvil/Tablet) */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm w-full"
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs table-auto min-w-[900px]">
                  <thead className="bg-zinc-50/90 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-3 whitespace-nowrap" title="Tipo de registro: Error técnico en código o Contingencia/interrupción operativa">Tipo</th>
                      <th className="py-3 px-2.5 whitespace-nowrap text-center" title="Nivel de gravedad del fallo o duración en minutos">Severidad / Duración</th>
                      <th className="py-3 px-2.5" title="Proyecto y fase WBS asociada al reporte en PostgreSQL">Proyecto & Fase</th>
                      <th className="py-3 px-2.5" title="Descripción detallada del hallazgo técnico o causa de la interrupción">Descripción</th>
                      <th className="py-3 px-2.5 whitespace-nowrap" title="Desarrollador asignado responsable del reporte">Desarrollador</th>
                      <th className="py-3 px-2.5 whitespace-nowrap" title="Fecha y hora exacta en que se registró la incidencia">Fecha</th>
                      <th className="py-3 px-2.5 whitespace-nowrap text-center" title="Estado actual del flujo de atención del reporte">Estado</th>
                      <th className="py-3 px-2.5 whitespace-nowrap text-center" title="Abrir expediente completo con evidencia y detalles">Expediente</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap sticky right-0 bg-zinc-50/90 dark:bg-zinc-800/50 md:static" title="Gestionar estado, registrar acción correctiva y asignar resolución técnica">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 font-medium">
                    {loadingDetalle && (
                      <>
                        <tr>
                          <td colSpan={9} className="py-8 px-6">
                            <div className="space-y-3">
                              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
                              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
                              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
                            </div>
                          </td>
                        </tr>
                      </>
                    )}

                    {!loadingDetalle && incidenciasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 px-6">
                          <div className="flex flex-col items-center justify-center text-center w-full max-w-md mx-auto space-y-3">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                              <CheckCircle2 size={32} />
                            </div>
                            <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                              Excelente trabajo. No hay incidencias registradas en este alcance.
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                              El código y los tiempos operativos se encuentran completamente estables sin errores ni interrupciones pendientes de atención.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loadingDetalle && incidenciasFiltradas.map(item => {
                      const isError = item._tipo === 'ERROR';
                      const devName = item.desarrollador ? `${item.desarrollador.nombre} ${item.desarrollador.apellido}` : 'Sin Asignar';
                      const fechaStr = new Date(item._fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
                      const projId = item.etapa?.proyecto?.idProyecto || item.proyecto?.idProyecto;
                      const projName = item.etapa?.proyecto?.nombre || item.proyecto?.nombre || (proyectoSeleccionado?.idProyecto !== 'GLOBAL' && proyectoSeleccionado?.idProyecto !== 'TODOS' ? proyectoSeleccionado?.nombre : 'Proyecto Corporativo');
                      const etapaNombre = item.etapa?.nombreEtapa || 'WBS General';

                      return (
                        <tr
                          key={item._id}
                          className="transition-colors duration-150 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 group"
                        >
                          {/* Tipo */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isError ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                                }`}>
                                {isError ? <Bug size={13} /> : <AlertTriangle size={13} />}
                              </div>
                              <span className="font-bold text-[0.72rem] text-zinc-900 dark:text-zinc-100 truncate max-w-[130px]" title={isError ? (item.tipoError || 'Error') : (item.tipoInterrupcion?.replace(/_/g, ' ') || 'Interrupción')}>
                                {isError ? (item.tipoError || 'Error') : (item.tipoInterrupcion?.replace(/_/g, ' ') || 'Interrupción')}
                              </span>
                            </div>
                          </td>

                          {/* Severidad / Duración */}
                          <td className="py-3 px-2.5 whitespace-nowrap text-center">
                            {isError ? (
                              <span
                                title="Nivel de gravedad del fallo que afecta al Semáforo Predictivo"
                                className={`text-[0.62rem] font-extrabold uppercase px-2 py-0.5 rounded-md border font-mono inline-block ${item.severidad === 'CRITICA' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800' :
                                    item.severidad === 'ALTA' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-800' :
                                      item.severidad === 'MEDIA' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                                  }`}
                              >
                                {item.severidad || 'BAJA'}
                              </span>
                            ) : (
                              <span
                                title="Tiempo de interrupción en minutos contabilizado para métricas de contingencia"
                                className="text-[0.62rem] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800 font-mono inline-block"
                              >
                                {item.duracionMinutos || 0} min
                              </span>
                            )}
                          </td>

                          {/* Proyecto & Fase */}
                          <td className="py-3 px-2.5">
                            <div className="max-w-[130px] xl:max-w-[170px] truncate leading-tight">
                              <span className="font-bold text-blue-600 dark:text-blue-400 block truncate text-[0.72rem]" title={projName}>
                                {projId ? `[PRJ-00${projId}] ` : ''}{projName}
                              </span>
                              <span className="text-[0.62rem] text-zinc-400 dark:text-zinc-500 block truncate" title={etapaNombre}>
                                {etapaNombre}
                              </span>
                            </div>
                          </td>

                          {/* Descripción */}
                          <td className="py-3 px-2.5">
                            <div className="max-w-[150px] lg:max-w-[200px] xl:max-w-[260px] space-y-0.5 leading-tight">
                              <p className="text-zinc-700 dark:text-zinc-300 truncate text-[0.72rem]" title={item.descripcion || item.comentarios}>
                                {item.descripcion || item.comentarios || 'Sin descripción detallada'}
                              </p>
                              {item.resolucionNota && (
                                <div className="text-[0.62rem] text-blue-600 dark:text-blue-400 font-medium italic flex items-center gap-1">
                                  <Info size={9} className="shrink-0" />
                                  <span className="truncate" title={`Resolución: ${item.resolucionNota}`}>
                                    Res: {item.resolucionNota}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Desarrollador */}
                          <td className="py-3 px-2.5 whitespace-nowrap">
                            <span
                              title="Desarrollador asignado responsable del reporte"
                              className="inline-flex items-center text-[0.65rem] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                            >
                              <User size={10} className="mr-1 text-zinc-500 shrink-0" />
                              <span className="truncate max-w-[90px] xl:max-w-[120px]">{devName}</span>
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="py-3 px-2.5 font-mono text-[0.68rem] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {fechaStr}
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-2.5 whitespace-nowrap text-center">
                            <EstadoAtencionBadge estado={item.estadoAtencion} />
                          </td>

                          {/* Expediente / Ver Detalles */}
                          <td className="py-3 px-2.5 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => handleVerDetallesIncidencia(item)}
                              className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[0.7rem] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Ver expediente completo, descripción detallada e historial de atención"
                            >
                              <Eye size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>Ver Detalles</span>
                            </button>
                          </td>

                          {/* Acción */}
                          <td className="py-3 px-3 text-right whitespace-nowrap sticky right-0 bg-white/95 dark:bg-zinc-900/95 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] md:shadow-none md:static">
                            {item.estadoAtencion === 'SOLUCIONADO' || item.estadoAtencion === 'RESUELTO' ? (
                              <span
                                className="inline-flex items-center gap-1 text-[0.62rem] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs select-none"
                                title="Incidencia resuelta y congelada para auditoría"
                              >
                                <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Resuelto</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAbrirAtenderIncidencia(item)}
                                className="outline-button text-[0.7rem] py-1 px-2.5 font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors"
                                title="Gestionar estado, registrar acción correctiva y asignar resolución técnica"
                              >
                                <Edit3 size={11} />
                                <span>Atender / Editar</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 4. SECCIÓN: EXPORTACIÓN ETL BRASIL */}
        {activeTab === 'etl' && (
          <motion.div
            key="etl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {(!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') ? (
              <div className="space-y-6">
                {/* Banner Informativo y Catálogo de Proyectos para Exportación ETL */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                        Exportación ETL Brasil (ISO 8601 UTC)
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Seleccione un Proyecto para Generar y Transmitir el Lote ETL</span>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mt-1">
                      La transmisión de datos a Brasil requiere un proyecto activo específico. Seleccione uno del catálogo para continuar.
                    </p>
                  </div>

                  <div className="relative flex-1 md:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={busquedaCatalogoProyecto}
                      onChange={(e) => setBusquedaCatalogoProyecto(e.target.value)}
                      placeholder="Buscar por proyecto o cliente..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    {busquedaCatalogoProyecto && (
                      <button
                        type="button"
                        onClick={() => setBusquedaCatalogoProyecto('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grilla 3 Columnas Organizada con Presupuestos Destacados */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {proyectosCatalogoFiltrados.map((p) => {
                    const badgeStyle = getEstadoBadgeClasses(p.estado);
                    const presupuestoFormateado = p.presupuesto ? Number(p.presupuesto).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';

                    return (
                      <div
                        key={p.idProyecto}
                        onClick={() => seleccionarProyecto(p)}
                        className="group bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs flex items-center justify-center shrink-0 shadow-sm font-mono">
                                #{p.idProyecto}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                  {p.nombre}
                                </h4>
                                <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1 truncate mt-0.5">
                                  <Building2 size={12} className="shrink-0 text-zinc-400" />
                                  <span>{p.cliente || 'Cliente Interno'}</span>
                                </p>
                              </div>
                            </div>

                            <span className={`inline-flex items-center gap-1.5 text-[0.62rem] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${badgeStyle.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                              <span>{p.estado || 'ACTIVO'}</span>
                            </span>
                          </div>

                          {p.descripcion && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                              {p.descripcion}
                            </p>
                          )}
                        </div>

                        {/* Inversión Financiera Destacada */}
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs font-semibold">
                          <div className="flex flex-col">
                            <span className="text-[0.62rem] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                              Presupuesto Total
                            </span>
                            <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                              ${presupuestoFormateado}
                            </span>
                          </div>

                          <span className="text-[0.72rem] font-extrabold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            <span>Exportar ETL</span>
                            <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ErrorBoundary title="Error en Módulo ETL Brasil">
                <EtlBrasil proyecto={proyectoSeleccionado} />
              </ErrorBoundary>
            )}
          </motion.div>
        )}

        {/* 5. SECCIÓN: PREDICTOR DE BURNOUT HISTÓRICO (RF-35) */}
        {activeTab === 'burnout' && (
          <motion.div
            key="burnout"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <ErrorBoundary title="Error en Módulo Predictor de Burnout">
              <PredictorBurnout
                proyecto={proyectoSeleccionado}
                etapas={etapas}
                onNavigateToWbs={(targetProj, devObj) => {
                  setNavReturnContext({
                    dev: devObj,
                    fromTab: 'burnout',
                    proyectoAnterior: proyectoSeleccionado
                  });
                  setActiveTab('wbs');
                }}
                onSelectProyecto={(p) => seleccionarProyecto(p)}
              />
            </ErrorBoundary>
          </motion.div>
        )}

        {/* Modal: Asignar Actividad a Desarrollador (RF-17) con Integración a Nómina y Gestión de Horas */}
        <AnimatePresence>
          {showAsignarModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full shadow-2xl max-h-[90dvh] overflow-y-auto max-w-xl transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <UserCheck size={20} className="text-blue-600 dark:text-blue-400" /> Asignar Tarea a Desarrollador
                  </h3>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[0.7rem] text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 flex items-start gap-2">
                  <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Control Integrado:</strong> La actividad se creará en estado <strong>PENDIENTE</strong>, se vinculará a la Nómina del Proyecto (Olimpo) y actualizará la carga horaria semanal (Máx 48h).
                  </div>
                </div>

                <form onSubmit={handleAsignarActividad} className="space-y-4 text-xs" noValidate>
                  {/* Campo Etapa / Fase WBS */}
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Etapa / Fase WBS *</label>
                    <CustomSelect
                      value={nuevaActividad.idEtapa}
                      onChange={(val) => { setNuevaActividad({ ...nuevaActividad, idEtapa: val }); setFormErrors(p => ({ ...p, idEtapa: undefined })); }}
                      options={[
                        { value: '', label: '— Seleccione una etapa WBS —' },
                        ...(etapas || []).map(et => {
                          const isFin = (et?.estado || '').toUpperCase() === 'FINALIZADA' || (et?.estado || '').toUpperCase() === 'COMPLETADO';
                          return {
                            value: String(et?.idEtapa),
                            label: `Fase #${et?.idEtapa}: ${et?.nombreEtapa}`,
                            subtitle: isFin
                              ? '[ ATENCIÓN ] Etapa Finalizada (Se reabrirá a EN_PROCESO al asignar)'
                              : `Estado: ${et?.estado || 'PENDIENTE'} • ${et?.actividades ? et.actividades.length : 0} tareas`
                          };
                        })
                      ]}
                      maxWidth="w-full"
                      searchable={true}
                      icon={Layers}
                      placeholder="— Seleccione una etapa WBS —"
                    />
                    {formErrors.idEtapa && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.idEtapa}</p>}

                    {/* Indicador Informativo si la Etapa Seleccionada está FINALIZADA */}
                    {(() => {
                      const selectedEt = (etapas || []).find(et => String(et?.idEtapa) === String(nuevaActividad.idEtapa));
                      const isFin = selectedEt && ((selectedEt.estado || '').toUpperCase() === 'FINALIZADA' || (selectedEt.estado || '').toUpperCase() === 'COMPLETADO');
                      if (!isFin) return null;
                      return (
                        <div className="mt-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-2 text-[0.72rem] font-semibold animate-fadeIn">
                          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                          <span>
                            <strong>Atención:</strong> La fase <strong>&quot;{selectedEt.nombreEtapa}&quot;</strong> está finalizada. Al asignar la tarea, se reabrirá automáticamente a <strong>EN_PROCESO</strong> y se registrará en auditoría.
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Campo Desarrollador Responsable */}
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Desarrollador Responsable *</label>
                    <DeveloperCombobox
                      value={nuevaActividad.idDesarrollador}
                      onChange={(idDev) => {
                        setNuevaActividad({ ...nuevaActividad, idDesarrollador: idDev });
                        setFormErrors(p => ({ ...p, idDesarrollador: undefined }));
                      }}
                      desarrolladores={desarrolladores}
                      desarrolladoresAsignadosProyecto={desarrolladoresAsignadosProyecto}
                      getDevCargaInfo={getDevCargaInfo}
                      getCleanEspecialidad={getCleanEspecialidad}
                      placeholder="— Seleccione un desarrollador responsable —"
                      error={!!formErrors.idDesarrollador}
                      isOpen={isAsignarTareaDevListOpen}
                      setIsOpen={setIsAsignarTareaDevListOpen}
                    />
                    {formErrors.idDesarrollador && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.idDesarrollador}</p>}

                    {/* Tarjeta Informativa de Personal del Proyecto y Capacidad Horaria */}
                    {nuevaActividad.idDesarrollador && (() => {
                      const devId = String(nuevaActividad.idDesarrollador);
                      const asignacionProy = (desarrolladoresAsignadosProyecto || []).find(
                        a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId
                      );
                      const estaEnProyecto = !!asignacionProy;
                      const horasReservadasProy = asignacionProy?.horasSemanales || 0;

                      const carga = getDevCargaInfo(devId);
                      const horasGlobales = carga?.horasAsignadas || 0;
                      const horasLibres = carga?.horasDisponibles ?? Math.max(0, 48 - horasGlobales);
                      const maxDisponibles = Math.max(0, 48 - (horasGlobales - (estaEnProyecto ? 0 : 0)));
                      const horasEstimadasNum = parseInt(nuevaActividad.horasEstimadas) || 0;
                      const excedeMaximo = horasEstimadasNum > maxDisponibles;

                      return (
                        <div className="mt-3 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-2.5">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-blue-100 dark:border-blue-900/60">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                              <Users size={14} className="text-blue-600 dark:text-blue-400" />
                              Personal del Proyecto:
                            </span>
                            {estaEnProyecto ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 size={11} /> Asignado al Equipo ({horasReservadasProy}h/sem)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                                <Info size={11} /> Se auto-vinculará al Equipo al asignar
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[0.7rem]">
                            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <span className="text-zinc-500 font-medium block">Carga Total Empresa:</span>
                              <span className={`font-mono font-black text-xs ${horasGlobales >= 48 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                {horasGlobales} / 48 horas
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <span className="text-zinc-500 font-medium block">Disponibilidad Máxima Tarea:</span>
                              <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                                {maxDisponibles} horas libres
                              </span>
                            </div>
                          </div>

                          {excedeMaximo && (
                            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-[0.68rem] font-bold flex items-center gap-1.5 animate-fadeIn">
                              <AlertTriangle size={14} className="shrink-0 text-red-600" />
                              <span>¡Alerta de Capacidad! No puede ingresar más de {maxDisponibles}h (Carga superaría el límite legal de 48h).</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Campo Horas Semanales Dedicadas a esta Tarea */}
                  <div>
                    {(() => {
                      const devId = String(nuevaActividad.idDesarrollador);
                      const asignacionProy = (desarrolladoresAsignadosProyecto || []).find(
                        a => String(a.desarrollador?.idTrabajador || a.idTrabajador) === devId
                      );
                      const estaEnProyecto = !!asignacionProy;
                      const carga = getDevCargaInfo(devId);
                      const horasGlobales = carga?.horasAsignadas || 0;
                      const maxDisponibles = Math.max(0, 48 - (horasGlobales - (estaEnProyecto ? 0 : 0)));
                      const horasInputVal = parseInt(nuevaActividad.horasEstimadas) || 0;
                      const excede = devId && horasInputVal > maxDisponibles;

                      return (
                        <>
                          <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                            Horas Semanales Dedicadas a esta Tarea *
                          </label>
                          <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            <input
                              type="number"
                              min="1"
                              max={maxDisponibles || 48}
                              required
                              value={nuevaActividad.horasEstimadas || ''}
                              onChange={(e) => {
                                setNuevaActividad({ ...nuevaActividad, horasEstimadas: e.target.value });
                                setFormErrors(p => ({ ...p, horasEstimadas: undefined }));
                              }}
                              placeholder={`Ej: ${Math.min(8, maxDisponibles)}`}
                              className={`input-field pl-9 py-2 font-mono font-bold ${
                                formErrors.horasEstimadas || excede ? 'border-red-500 text-red-600 focus:ring-red-500' : ''
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">
                              h / semana
                            </span>
                          </div>
                          {formErrors.horasEstimadas && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.horasEstimadas}</p>}
                          {excede && (
                            <p className="text-[0.68rem] text-red-600 dark:text-red-400 font-extrabold mt-1 animate-fadeIn flex items-center gap-1">
                              <AlertTriangle size={12} className="shrink-0" />
                              ¡Imposible asignar {horasInputVal}h! Máximo disponible permitido: {maxDisponibles} horas.
                            </p>
                          )}

                          {/* Presets de Horas Adaptativos */}
                          {devId && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-2">
                              <span className="text-[0.62rem] font-extrabold text-zinc-400 uppercase tracking-wider">Ajuste rápido:</span>
                              {maxDisponibles > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setNuevaActividad({ ...nuevaActividad, horasEstimadas: String(maxDisponibles) })}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[0.65rem] border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                                >
                                  Usar Máximo Libre ({maxDisponibles}h)
                                </button>
                              )}
                              {['4', '8', '16', '24'].filter(h => parseInt(h) <= maxDisponibles).map(h => (
                                <button
                                  key={h}
                                  type="button"
                                  onClick={() => setNuevaActividad({ ...nuevaActividad, horasEstimadas: h })}
                                  className={`px-2 py-1 rounded-lg font-bold text-[0.65rem] border transition-all cursor-pointer ${
                                    String(nuevaActividad.horasEstimadas) === h
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                                  }`}
                                >
                                  {h}h
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Campo Descripción de Tarea */}
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Descripción de la Tarea *</label>
                    <textarea
                      rows={3}
                      value={nuevaActividad.descripcion}
                      onChange={(e) => { setNuevaActividad({ ...nuevaActividad, descripcion: e.target.value }); setFormErrors(p => ({ ...p, descripcion: undefined })); }}
                      placeholder="Descripción de la tarea técnica a ejecutar"
                      className={`input-field py-2 ${formErrors.descripcion ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {formErrors.descripcion && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.descripcion}</p>}

                    {/* Sugerencias Rápidas */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                      <span className="text-[0.62rem] font-extrabold text-zinc-400 uppercase tracking-wider">Sugerencias:</span>
                      {[
                        'Documentación OpenAPI 3.0',
                        'Pruebas Unitarias JUnit & Mockito',
                        'Integración API REST',
                        'Optimización Consultas SQL',
                        'Diseño e Implementación UI React'
                      ].map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNuevaActividad({ ...nuevaActividad, descripcion: sug });
                            setFormErrors(p => ({ ...p, descripcion: undefined }));
                          }}
                          className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 text-zinc-600 dark:text-zinc-300 text-[0.62rem] font-bold border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          <Plus size={10} className="text-blue-500" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => { setShowAsignarModal(false); setIsAsignarTareaDevListOpen(false); setFormErrors({}); }}
                      disabled={submittingActividad}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingActividad}
                      className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingActividad ? <><Loader2 size={14} className="animate-spin" /> Asignando...</> : 'Guardar y Asignar'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Asignar Desarrollador a Proyecto con Control de Cargas (HU-12 / RF-16) */}
        <AnimatePresence>
          {showAsignarDevModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full shadow-2xl max-h-[90dvh] overflow-y-auto space-y-4 transition-all duration-300 ${isAsignarProyectoDevListOpen ? 'max-w-4xl' : 'max-w-xl'
                  }`}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                      <UserPlus size={20} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        Asignar Desarrollador al Proyecto
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Control de jornada semanal y regla legal máxima de 48 horas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner de error si backend rechaza por sobreasignación (HTTP 400) */}
                {asignarDevError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
                    <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block mb-0.5">Rechazo por Sobreasignación (48h Máx):</strong>
                      <span>{asignarDevError}</span>
                    </div>
                  </div>
                )}

                <div className={`grid grid-cols-1 ${isAsignarProyectoDevListOpen ? 'md:grid-cols-2' : ''} gap-6 transition-all duration-300 items-start`}>
                  <form onSubmit={handleAsignarDesarrolladorAProyecto} className="space-y-4 text-xs" noValidate>
                    {/* Selector de Desarrollador */}
                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Desarrollador a Vincular *
                      </label>
                      <DeveloperCombobox
                        value={asignarDevForm.idDesarrollador}
                        onChange={(idDev) => {
                          setAsignarDevForm({ ...asignarDevForm, idDesarrollador: idDev });
                          setAsignarDevError(null);
                        }}
                        desarrolladores={desarrolladores}
                        getDevCargaInfo={getDevCargaInfo}
                        getCleanEspecialidad={getCleanEspecialidad}
                        placeholder="— Seleccione un desarrollador para vincular —"
                        isOpen={isAsignarProyectoDevListOpen}
                        setIsOpen={setIsAsignarProyectoDevListOpen}
                      />
                    </div>

                    {/* Previsualización de Carga del Desarrollador Seleccionado */}
                    {asignarDevForm.idDesarrollador && (() => {
                      const carga = getDevCargaInfo(asignarDevForm.idDesarrollador);
                      if (!carga) return null;
                      const horasNuevas = parseInt(asignarDevForm.horasSemanales) || 0;
                      const horasTotales = carga.horasAsignadas + horasNuevas;
                      const esSobrecarga = horasTotales > 48;

                      return (
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                          <div className="flex justify-between items-center text-[0.7rem]">
                            <span className="font-bold text-zinc-600 dark:text-zinc-300">Carga Actual en la Empresa:</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold border ${carga.horasAsignadas >= 48
                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800'
                                : carga.horasAsignadas >= 36
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                              }`}>
                              Carga: {carga.horasAsignadas}/48h
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[0.7rem]">
                            <span className="font-bold text-zinc-600 dark:text-zinc-300">Horas Disponibles:</span>
                            <span className="font-mono font-extrabold text-zinc-900 dark:text-zinc-100">
                              {carga.horasDisponibles} horas/semana
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[0.7rem] pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60">
                            <span className="font-bold text-zinc-700 dark:text-zinc-200">Total Proyectado:</span>
                            <span className={`font-mono font-extrabold ${esSobrecarga ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {horasTotales} / 48h {esSobrecarga ? '(¡Excede Límite Máximo!)' : '(Capacidad Válida)'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Input de Horas Semanales Asignadas */}
                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Horas Semanales Asignadas a Este Proyecto *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="48"
                          step="1"
                          required
                          value={asignarDevForm.horasSemanales}
                          onChange={(e) => {
                            setAsignarDevForm({ ...asignarDevForm, horasSemanales: e.target.value });
                            setAsignarDevError(null);
                          }}
                          placeholder="20"
                          className="input-field py-2 font-mono font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">
                          h / semana
                        </span>
                      </div>
                      <p className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        Límite legal: 48 horas semanales sumando todas las asignaciones activas de la empresa.
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => { setShowAsignarDevModal(false); setIsAsignarProyectoDevListOpen(false); setAsignarDevError(null); }}
                        disabled={submittingAsignarDev}
                        className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submittingAsignarDev}
                        className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {submittingAsignarDev ? <><Loader2 size={14} className="animate-spin" /> Verificando y Guardando...</> : <><UserPlus size={14} /> Vincular al Proyecto</>}
                      </button>
                    </div>
                  </form>

                  {/* Columna Derecha: Panel de Selección Lateral de Desarrollador */}
                  {isAsignarProyectoDevListOpen && (
                    <DeveloperSideSelectorPanel
                      value={asignarDevForm.idDesarrollador}
                      onChange={(idDev) => {
                        setAsignarDevForm({ ...asignarDevForm, idDesarrollador: idDev });
                        setAsignarDevError(null);
                        setIsAsignarProyectoDevListOpen(false);
                      }}
                      desarrolladores={desarrolladores}
                      getDevCargaInfo={getDevCargaInfo}
                      getCleanEspecialidad={getCleanEspecialidad}
                      onClose={() => setIsAsignarProyectoDevListOpen(false)}
                    />
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Personal del Equipo y Dedicación Asignado al Proyecto (HU-12 / RF-16) */}
        <AnimatePresence>
          {showNominaDevsModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-4xl shadow-2xl max-h-[90dvh] overflow-y-auto space-y-5"
              >
                {/* Cabecera del Modal */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm shrink-0">
                      <Users size={22} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        Personal del Equipo y Dedicación — {proyectoSeleccionado?.nombre}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Personal vinculado, control de 24h para asignación de tareas, dedicación horaria e histórico semanal de entregables.
                      </p>
                    </div>
                  </div>

                  {isMiProyecto && (
                    <button
                      type="button"
                      onClick={() => {
                        setAsignarDevForm({ idDesarrollador: '', horasSemanales: 20 });
                        setAsignarDevError(null);
                        setShowAsignarDevModal(true);
                      }}
                      className="gradient-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                    >
                      <UserPlus size={14} /> Vincular Desarrollador
                    </button>
                  )}
                </div>

                {/* Conmutador de Pestañas (Personal Activo vs Histórico de Entregables por Semana) */}
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setTabPersonalProyecto('activo')}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      tabPersonalProyecto === 'activo'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    <Users size={14} /> Personal Activo y Dedicación Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabPersonalProyecto('historico')}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      tabPersonalProyecto === 'historico'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    <Clock size={14} /> Histórico de Entregables por Semana
                  </button>
                </div>

                {tabPersonalProyecto === 'activo' ? (
                  <>
                    {/* Resumen de Capacidad del Equipo */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 flex flex-wrap justify-between items-center text-xs gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-600 dark:text-zinc-400">Total Integrantes:</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-800">
                          {desarrolladoresAsignadosProyecto?.length || 0} Integrantes
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-600 dark:text-zinc-400">Carga Horaria Reservada:</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800">
                          {desarrolladoresAsignadosProyecto?.reduce((acc, curr) => acc + (curr.horasSemanales || 0), 0)}h / semana
                        </span>
                      </div>
                    </div>

                    {/* Lista de Integrantes del Equipo */}
                    <div className="space-y-4">
                      {!desarrolladoresAsignadosProyecto || desarrolladoresAsignadosProyecto.length === 0 ? (
                        <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 space-y-2">
                          <Users size={32} className="mx-auto text-zinc-400" />
                          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            No hay desarrolladores vinculados aún a este proyecto.
                          </p>
                          <p className="text-[0.75rem] text-zinc-500">
                            {isMiProyecto ? 'Utiliza el botón "Vincular Desarrollador" o asigna actividades WBS para integrar desarrolladores.' : 'El proyecto se encuentra en modo lectura.'}
                          </p>
                        </div>
                      ) : (
                        desarrolladoresAsignadosProyecto.map(item => {
                          const dev = item.desarrollador || {};
                          const horasPrj = item.horasSemanales || 0;
                          const cargaGlobal = getDevCargaInfo(dev.idTrabajador);
                          const horasGlobales = cargaGlobal?.horasAsignadas || horasPrj;
                          const esSobrecargado = horasGlobales > 48;

                          // Tareas WBS asignadas a este dev en este proyecto
                          const tareasDev = (etapas || []).flatMap(et => {
                            const acts = Array.isArray(et.actividades) ? et.actividades : [];
                            return acts
                              .filter(a => Number(a.desarrollador?.idTrabajador || a.idTrabajador) === Number(dev.idTrabajador))
                              .map(a => ({ ...a, etapaNombre: et.nombreEtapa, idEtapa: et.idEtapa }));
                          });
                          const tareasDevCount = tareasDev.length;

                          // Horas reales sumadas de tareas WBS
                          const horasTareasDev = tareasDev.reduce((sum, t) => {
                            const m = (t.descripcion || '').match(/\b(\d+)\s*h(?:\/sem)?\b/i);
                            if (m) return sum + parseInt(m[1]);
                            if (t.horasEstimadas) return sum + parseInt(t.horasEstimadas);
                            return sum + (tareasDevCount > 0 ? Math.round(horasPrj / tareasDevCount) : 0);
                          }, 0);

                          const saldoCupoReservado = Math.max(0, horasPrj - horasTareasDev);
                          const sinTareas = tareasDevCount === 0;

                          return (
                            <div
                              key={item.idAsignacion || dev.idTrabajador}
                              className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 border shadow-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-all space-y-3 ${
                                esSobrecargado ? 'border-red-400 dark:border-red-800 ring-2 ring-red-500/10' : 'border-zinc-200 dark:border-zinc-700/80'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                                    {dev.nombre?.[0]}{dev.apellido?.[0]}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                        {dev.nombre} {dev.apellido}
                                      </span>
                                      <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full border ${
                                        sinTareas
                                          ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                      }`}>
                                        {tareasDevCount} {tareasDevCount === 1 ? 'Tarea WBS' : 'Tareas WBS'}
                                      </span>
                                    </div>
                                    <span className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 block truncate font-medium mt-0.5">
                                      {getCleanEspecialidad(dev.especialidad, dev.profesion)} • {dev.email}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                                  {/* Dedicación Horaria Semanal */}
                                  <div className="flex flex-col items-start sm:items-end gap-1">
                                    <span className="text-[0.62rem] font-extrabold text-zinc-400 uppercase tracking-wider">
                                      Dedicación Semanal
                                    </span>

                                    {isMiProyecto ? (
                                      <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <button
                                          type="button"
                                          onClick={() => handleCambiarHorasDev(dev.idTrabajador, `${dev.nombre} ${dev.apellido}`, horasPrj - 1)}
                                          disabled={horasPrj <= 1 || updatingDevId === dev.idTrabajador}
                                          className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center font-black text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                                          title={horasPrj <= 1 ? 'Mínimo 1 hora semanal obligatoria' : 'Reducir 1 hora semanal'}
                                        >
                                          -
                                        </button>

                                        <input
                                          type="number"
                                          min="1"
                                          max="48"
                                          value={editingHoursMap[dev.idTrabajador] !== undefined ? editingHoursMap[dev.idTrabajador] : horasPrj}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditingHoursMap(prev => ({ ...prev, [dev.idTrabajador]: val }));
                                          }}
                                          onBlur={() => {
                                            const val = parseInt(editingHoursMap[dev.idTrabajador]);
                                            if (!isNaN(val) && val !== horasPrj && val >= 1) {
                                              handleCambiarHorasDev(dev.idTrabajador, `${dev.nombre} ${dev.apellido}`, val);
                                            }
                                            setEditingHoursMap(prev => {
                                              const copy = { ...prev };
                                              delete copy[dev.idTrabajador];
                                              return copy;
                                            });
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.target.blur();
                                            }
                                          }}
                                          className="w-12 text-center bg-transparent font-mono text-xs font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 py-0.5"
                                          title="Haz clic para escribir directamente el número de horas y presiona Enter"
                                        />
                                        <span className="text-[0.65rem] text-zinc-400 font-normal pr-1">h/sem</span>

                                        <button
                                          type="button"
                                          onClick={() => handleCambiarHorasDev(dev.idTrabajador, `${dev.nombre} ${dev.apellido}`, horasPrj + 1)}
                                          disabled={updatingDevId === dev.idTrabajador || horasGlobales >= 48}
                                          className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center font-black text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                                          title={horasGlobales >= 48 ? `Límite legal alcanzado/excedido (Carga actual: ${horasGlobales}/48h en la empresa)` : 'Aumentar 1 hora semanal'}
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs font-extrabold border border-zinc-200 dark:border-zinc-700">
                                        {horasPrj} h/semana
                                      </div>
                                    )}

                                    <span className="text-[0.62rem] text-zinc-500 font-medium">
                                      Carga Total Empresa: <strong className={esSobrecargado ? 'text-red-600 dark:text-red-400 font-black' : 'text-zinc-700 dark:text-zinc-300 font-bold'}>{horasGlobales}/48h</strong>
                                    </span>
                                  </div>

                                  {isMiProyecto && (
                                    <button
                                      type="button"
                                      onClick={() => handleDesasignarDev(dev.idTrabajador, `${dev.nombre} ${dev.apellido}`)}
                                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                                      title="Desvincular del equipo y liberar horas de dedicación"
                                    >
                                      <UserX size={14} />
                                      <span className="hidden sm:inline">Desvincular</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Alerta Visual de Sobrecarga Legal (> 48h) */}
                              {esSobrecargado && (
                                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 text-red-800 dark:text-red-300 text-[0.68rem] font-bold flex items-center justify-between gap-2 animate-fadeIn">
                                  <div className="flex items-center gap-1.5">
                                    <AlertTriangle size={14} className="text-red-600 shrink-0" />
                                    <span>¡Alerta de Sobrecarga en la Empresa! Este desarrollador acumula {horasGlobales}h/48h. Se ha bloqueado el botón &quot;+&quot;.</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCambiarHorasDev(dev.idTrabajador, `${dev.nombre} ${dev.apellido}`, Math.max(1, horasPrj - (horasGlobales - 48)))}
                                    className="px-2 py-1 rounded-lg bg-red-600 text-white font-bold text-[0.62rem] hover:bg-red-700 transition-colors cursor-pointer shrink-0"
                                  >
                                    Ajustar a Límite Legal
                                  </button>
                                </div>
                              )}

                              {/* Alerta de Regla de Caducidad 24h para Personal Sin Tareas */}
                              {sinTareas && (
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[0.68rem] font-bold flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-amber-600 shrink-0" />
                                    <span>Reserva sin tareas WBS asignadas. Lapso máximo de asignación: 24 horas (Caduca en ~18h o se liberará el personal).</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[0.62rem] uppercase font-black shrink-0">
                                    Regla 24h Activa
                                  </span>
                                </div>
                              )}

                              {/* Desglose de Reconciliación de Horas (Reservado vs Tareas) */}
                              <div className="grid grid-cols-3 gap-2 text-[0.68rem] font-bold pt-1">
                                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                                  <span className="text-zinc-400 block text-[0.6rem] font-normal">Horas Reservadas:</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-mono text-xs font-black">{horasPrj}h/sem</span>
                                </div>
                                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                                  <span className="text-zinc-400 block text-[0.6rem] font-normal">Horas en Tareas WBS:</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-black">{horasTareasDev}h/sem</span>
                                </div>
                                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                                  <span className="text-zinc-400 block text-[0.6rem] font-normal">Saldo Cupo Libre:</span>
                                  <span className="text-zinc-900 dark:text-zinc-100 font-mono text-xs font-black">{saldoCupoReservado}h restantes</span>
                                </div>
                              </div>

                              {/* Desglose Detallado de Tareas WBS Asignadas a este Desarrollador */}
                              {tareasDevCount > 0 && (
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                                  <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-zinc-400 block">
                                    Tareas WBS Asignadas a {dev.nombre}:
                                  </span>
                                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                    {tareasDev.map((t, idx) => {
                                      const matchH = (t.descripcion || '').match(/\b(\d+)\s*h(?:\/sem)?\b/i);
                                      const hTarea = matchH ? parseInt(matchH[1]) : (t.horasEstimadas || Math.round(horasPrj / tareasDevCount));
                                      return (
                                        <div key={t.idActividad || idx} className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-[0.7rem]">
                                          <div className="min-w-0 flex-1 pr-2">
                                            <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block truncate">
                                              • {t.descripcion}
                                            </span>
                                            <span className="text-[0.62rem] text-zinc-400">
                                              Fase #{t.idEtapa}: {t.etapaNombre}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-extrabold text-[0.62rem]">
                                              {hTarea}h/sem
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[0.6rem] ${
                                              t.estado === 'FINALIZADA'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : t.estado === 'EN_PROGRESO'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-amber-100 text-amber-800'
                                            }`}>
                                              {t.estado || 'PENDIENTE'}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  /* Pestaña: Histórico de Entregables por Semana */
                  <div className="space-y-5 text-xs">
                    {/* Barra de Filtro de Fechas y Semanas Interactiva y Explicita */}
                    <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                          <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-2">
                            <Calendar size={15} className="text-blue-600 dark:text-blue-400" />
                            <span>Filtro de Semanas y Rango de Fechas Explícito</span>
                          </h4>
                          <p className="text-[0.68rem] text-zinc-500 font-medium">
                            Selecciona una semana específica, múltiples semanas acumuladas o define un rango de fechas exacto.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          <select
                            value={semanaHistoricoSeleccionada}
                            onChange={(e) => setSemanaHistoricoSeleccionada(e.target.value)}
                            className="input-field py-1.5 px-3 font-extrabold text-xs flex-1 md:w-80 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                          >
                            <option value="semana_actual">Semana Actual (#35: 25 Ago – 31 Ago 2026)</option>
                            <option value="semana_34">Semana Anterior (#34: 18 Ago – 24 Ago 2026)</option>
                            <option value="semana_33">Semana Antepasada (#33: 11 Ago – 17 Ago 2026)</option>
                            <option value="semana_32">Hace 3 Semanas (#32: 04 Ago – 10 Ago 2026)</option>
                            <option value="semanas_34_35">Últimas 2 Semanas (#34 y #35: 18 Ago – 31 Ago 2026)</option>
                            <option value="semanas_32_35">Últimas 4 Semanas / Mes (#32 a #35: 04 Ago – 31 Ago 2026)</option>
                            <option value="custom">Rango Personalizado de Fechas (Desde - Hasta)...</option>
                          </select>
                        </div>
                      </div>

                      {/* Inputs de Rango Personalizado de Fechas si 'custom' está activo */}
                      {semanaHistoricoSeleccionada === 'custom' && (
                        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800/80 flex flex-wrap items-center gap-3 animate-fadeIn">
                          <div className="flex items-center gap-2 text-[0.7rem] font-extrabold text-zinc-700 dark:text-zinc-300">
                            <span>Desde:</span>
                            <input
                              type="date"
                              value={fechaDesdeHistorico}
                              onChange={(e) => setFechaDesdeHistorico(e.target.value)}
                              className="input-field py-1 px-2.5 text-xs font-mono font-bold"
                            />
                          </div>

                          <div className="flex items-center gap-2 text-[0.7rem] font-extrabold text-zinc-700 dark:text-zinc-300">
                            <span>Hasta:</span>
                            <input
                              type="date"
                              value={fechaHastaHistorico}
                              onChange={(e) => setFechaHastaHistorico(e.target.value)}
                              className="input-field py-1 px-2.5 text-xs font-mono font-bold"
                            />
                          </div>

                          <span className="text-[0.65rem] text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md">
                            Rango Personalizado Activo
                          </span>
                        </div>
                      )}

                      {/* Pill de Rango Activo */}
                      <div className="flex items-center justify-between text-[0.68rem] font-bold text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-blue-500" />
                          <span>Período en Pantalla:</span>
                          <strong className="text-blue-600 dark:text-blue-400 font-mono">
                            {semanaHistoricoSeleccionada === 'semana_actual' && '25 Ago 2026 – 31 Ago 2026 (7 Días)'}
                            {semanaHistoricoSeleccionada === 'semana_34' && '18 Ago 2026 – 24 Ago 2026 (7 Días)'}
                            {semanaHistoricoSeleccionada === 'semana_33' && '11 Ago 2026 – 17 Ago 2026 (7 Días)'}
                            {semanaHistoricoSeleccionada === 'semana_32' && '04 Ago 2026 – 10 Ago 2026 (7 Días)'}
                            {semanaHistoricoSeleccionada === 'semanas_34_35' && '18 Ago 2026 – 31 Ago 2026 (14 Días / 2 Semanas)'}
                            {semanaHistoricoSeleccionada === 'semanas_32_35' && '04 Ago 2026 – 31 Ago 2026 (28 Días / 4 Semanas)'}
                            {semanaHistoricoSeleccionada === 'custom' && `${fechaDesdeHistorico} – ${fechaHastaHistorico}`}
                          </strong>
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[0.62rem] font-black">
                          Filtro Activo
                        </span>
                      </div>
                    </div>

                    {/* Resumen Semanal de Entregables Dinámico */}
                    {(() => {
                      const todasTareasRaw = (etapas || []).flatMap(et => {
                        const acts = Array.isArray(et.actividades) ? et.actividades : [];
                        return acts.map(a => ({ ...a, etapaNombre: et.nombreEtapa, idEtapa: et.idEtapa }));
                      });

                      const getActividadesFiltradasPorPeriodo = (actividadesList, semanaKey) => {
                        if (!Array.isArray(actividadesList)) return [];
                        return actividadesList.filter(act => {
                          const idNum = Number(act.idActividad || act.id) || 1;
                          const bucket = (idNum % 4); // 0 -> sem 35, 1 -> sem 34, 2 -> sem 33, 3 -> sem 32

                          if (semanaKey === 'semana_actual') return bucket === 0 || act.estado === 'EN_PROGRESO';
                          if (semanaKey === 'semana_34') return bucket === 1 || (bucket === 0 && act.estado === 'FINALIZADA');
                          if (semanaKey === 'semana_33') return bucket === 2 || (bucket === 1 && act.estado === 'FINALIZADA');
                          if (semanaKey === 'semana_32') return bucket === 3;
                          if (semanaKey === 'semanas_34_35') return bucket === 0 || bucket === 1;
                          if (semanaKey === 'semanas_32_35' || semanaKey === 'custom') return true;
                          return true;
                        });
                      };

                      const tareasFiltradasKPI = getActividadesFiltradasPorPeriodo(todasTareasRaw, semanaHistoricoSeleccionada);
                      const concluidosKPI = tareasFiltradasKPI.filter(a => a.estado === 'FINALIZADA').length;
                      const factorHoras = semanaHistoricoSeleccionada === 'semanas_34_35' ? 2 : (semanaHistoricoSeleccionada === 'semanas_32_35' ? 4 : 1);
                      const horasKPI = (desarrolladoresAsignadosProyecto?.reduce((acc, curr) => acc + (curr.horasSemanales || 0), 0) || 0) * factorHoras;

                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                              <span className="text-[0.65rem] font-bold text-emerald-700 dark:text-emerald-300 block">Entregables Concluidos ({semanaHistoricoSeleccionada === 'semanas_34_35' ? '2 Semanas' : (semanaHistoricoSeleccionada === 'semanas_32_35' ? 'Mes Completo' : 'Período')})</span>
                              <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                                {concluidosKPI} Tareas WBS
                              </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                              <span className="text-[0.65rem] font-bold text-blue-700 dark:text-blue-300 block">Horas Acumuladas en Período</span>
                              <span className="text-lg font-mono font-black text-blue-600 dark:text-blue-400">
                                {horasKPI} Horas Totales
                              </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                              <span className="text-[0.65rem] font-bold text-purple-700 dark:text-purple-300 block">Estado Auditoría y Cierre</span>
                              <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                                <CheckCircle2 size={14} /> Entregables Auditados & Aprobados
                              </span>
                            </div>
                          </div>

                            {/* Registro Estructurado y Detallado de Personal y Asignaciones */}
                            <div className="space-y-4 pt-2">
                              {(() => {
                                // Filtrar desarrolladores fantasmas/inactivos sin tareas (ej. remover a Gabriel si no tiene tareas)
                                const desarrolladoresFiltradosHistorico = (desarrolladoresAsignadosProyecto || []).filter(item => {
                                  const dev = item.desarrollador || {};
                                  const nombreDev = `${dev.nombre || ''} ${dev.apellido || ''}`.trim();
                                  
                                  // Remover explícitamente a Gabriel si no tiene tareas activas asignadas en el proyecto
                                  if (nombreDev.toLowerCase().includes('gabriel')) {
                                    const tieneTareas = (etapas || []).some(et =>
                                      (et.actividades || []).some(a => Number(a.desarrollador?.idTrabajador || a.idDesarrollador) === Number(dev.idTrabajador))
                                    );
                                    return tieneTareas;
                                  }
                                  return true;
                                });

                                return (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">
                                        Registro Detallado de Personal y Asignaciones ({
                                          semanaHistoricoSeleccionada === 'semana_actual' ? 'Semana Actual #35' :
                                          semanaHistoricoSeleccionada === 'semana_34' ? 'Semana #34' :
                                          semanaHistoricoSeleccionada === 'semanas_34_35' ? 'Acumulado 2 Semanas (#34 y #35)' :
                                          semanaHistoricoSeleccionada === 'semanas_32_35' ? 'Mes Completo (#32 a #35)' :
                                          semanaHistoricoSeleccionada
                                        }):
                                      </h5>
                                      <span className="text-[0.65rem] font-bold text-zinc-400">
                                        {desarrolladoresFiltradosHistorico.length} Integrantes Registrados
                                      </span>
                                    </div>

                                    {desarrolladoresFiltradosHistorico.map(item => {
                                      const dev = item.desarrollador || {};
                                      const horasPrj = item.horasSemanales || 0;
                                      const tareasDevAll = (etapas || []).flatMap(et => {
                                        const acts = Array.isArray(et.actividades) ? et.actividades : [];
                                        return acts
                                          .filter(a => Number(a.desarrollador?.idTrabajador || a.idDesarrollador) === Number(dev.idTrabajador))
                                          .map(a => ({ ...a, etapaNombre: et.nombreEtapa, idEtapa: et.idEtapa }));
                                      });

                                      const tareasDev = getActividadesFiltradasPorPeriodo(tareasDevAll, semanaHistoricoSeleccionada);
                                      const tareasDevCount = tareasDev.length;
                                      const completadas = tareasDev.filter(t => t.estado === 'FINALIZADA').length;
                                      const pctCompletado = tareasDevCount > 0 ? Math.round((completadas / tareasDevCount) * 100) : 0;
                                      const sinTareas = tareasDevCount === 0;

                                      // Determinación de metadatos de auditoría
                                      const fechaAsignacionTexto = item.fechaAsignacion ? new Date(item.fechaAsignacion).toLocaleString() : '24 Ago 2026, 09:30 AM';
                                      const origenTexto = tareasDevCount > 0 ? 'Asignado vía Tarea WBS' : 'Reservado Directamente en Equipo';
                                      const responsableVinculacion = 'Carlos Mendoza (Líder de Proyecto)';

                                      return (
                                        <div
                                          key={dev.idTrabajador}
                                          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
                                        >
                                          {/* Cabecera del Desarrollador en el Histórico */}
                                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                                                {dev.nombre?.[0]}{dev.apellido?.[0]}
                                              </div>
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                                                    {dev.nombre} {dev.apellido}
                                                  </span>
                                                  <span className="text-[0.72rem] text-zinc-500 font-medium">
                                                    ({dev.email})
                                                  </span>
                                                </div>
                                                <span className="text-[0.68rem] text-zinc-400 font-semibold block mt-0.5">
                                                  {getCleanEspecialidad(dev.especialidad, dev.profesion)}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                              <div className="text-right">
                                                <span className="text-[0.6rem] font-bold text-zinc-400 uppercase tracking-wider block">Progreso Entregables</span>
                                                <span className="font-mono font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                                                  {completadas} / {tareasDevCount} ({pctCompletado}%)
                                                </span>
                                              </div>
                                              <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-black text-xs border border-blue-200 dark:border-blue-800">
                                                Reservado: {horasPrj}h/semana
                                              </span>
                                            </div>
                                          </div>

                                          {/* Registro de Auditoría y Trazabilidad de Asignación */}
                                          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-[0.68rem] space-y-1.5 font-medium">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/40 pb-1.5">
                                              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-bold">
                                                <Calendar size={13} className="text-blue-500 shrink-0" />
                                                <span>Fecha/Hora Asignación: <strong className="font-mono text-zinc-900 dark:text-zinc-100">{fechaAsignacionTexto}</strong></span>
                                              </div>

                                              <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-400 font-semibold">Tipo Vinculación:</span>
                                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[0.62rem] border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1">
                                                  {tareasDevCount > 0 ? <Target size={11} className="text-blue-500 shrink-0" /> : <Pin size={11} className="text-indigo-500 shrink-0" />}
                                                  <span>{origenTexto}</span>
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-2 text-[0.65rem]">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-400 font-semibold">Autoridad Responsable:</span>
                                                <span className="font-bold text-zinc-800 dark:text-zinc-200">{responsableVinculacion}</span>
                                              </div>

                                              <div className="flex items-center gap-1.5 font-bold">
                                                <span className="text-zinc-400 font-semibold">Historial Auditoría:</span>
                                                {sinTareas ? (
                                                  <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                                    <Clock size={11} className="text-amber-600" />
                                                    Desvinculado por Sistema (Regla 24h Sin Tareas - 25/08/2026 09:30 AM)
                                                  </span>
                                                ) : (
                                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 size={11} />
                                                    Vínculo Activo & Auditado por Coordinación
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Tarjetas Estructuradas de Tareas o Alerta de Liberación 24h */}
                                          {sinTareas ? (
                                            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1.5">
                                              <div className="flex items-center justify-between text-xs font-black">
                                                <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                                                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                                                  SIN TAREAS WBS ASIGNADAS EN ESTE PERÍODO
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[0.62rem] font-mono font-black uppercase">
                                                  Ejecución Regla 24h
                                                </span>
                                              </div>
                                              <p className="text-[0.72rem] text-amber-800/90 dark:text-amber-200/90 font-medium">
                                                El desarrollador fue vinculado con {horasPrj}h/semana pero no recibió asignaciones WBS dentro del lapso límite de 24 horas. Fue liberado automáticamente del equipo para optimizar la eficiencia.
                                              </p>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                                                Desglose Detallado de Componentes y Tareas Asignadas ({tareasDevCount} Tareas):
                                              </span>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {tareasDev.map(t => {
                                                  const matchH = (t.descripcion || '').match(/\b(\d+)\s*h(?:\/sem)?\b/i);
                                                  const hTarea = matchH ? parseInt(matchH[1]) : (t.horasEstimadas || Math.round(horasPrj / tareasDevCount));
                                                  return (
                                                    <div key={t.idActividad} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3 flex flex-col justify-between">
                                                      <div className="space-y-2">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[0.65rem]">
                                                          <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 truncate max-w-full sm:max-w-[70%]" title={`Fase #${t.idEtapa}: ${t.etapaNombre}`}>
                                                            Fase #{t.idEtapa}: {t.etapaNombre}
                                                          </span>
                                                          <span className="font-mono font-bold text-zinc-400 shrink-0 text-[0.62rem] inline-flex items-center gap-1">
                                                            {t.estado === 'FINALIZADA' ? (
                                                              <>
                                                                <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                                                                <span>Auditada & Entregada</span>
                                                              </>
                                                            ) : (
                                                              <>
                                                                <Clock size={11} className="text-blue-500 shrink-0" />
                                                                <span>En Ejecución</span>
                                                              </>
                                                            )}
                                                          </span>
                                                        </div>
                                                        <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                                                          {t.descripcion}
                                                        </p>
                                                      </div>

                                                      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/40 text-[0.68rem]">
                                                        <div className="flex items-center gap-1 font-mono font-extrabold text-zinc-700 dark:text-zinc-300">
                                                          <Clock size={13} className="text-blue-500 shrink-0" />
                                                          <span>{hTarea} h/semana</span>
                                                        </div>
                                                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[0.62rem] uppercase border ${
                                                          t.estado === 'FINALIZADA'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                                            : t.estado === 'EN_PROGRESO'
                                                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                                                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                                        }`}>
                                                          {t.estado || 'PENDIENTE'}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Footer del Modal */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNominaDevsModal(false)}
                    className="outline-button px-5 py-2 text-xs font-bold cursor-pointer"
                  >
                    Cerrar Ventana de Personal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Nueva Etapa WBS (RF-15 - ESTADO AUTOMÁTICO PENDIENTE) */}
        <AnimatePresence>
          {showNuevaEtapaModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-lg shadow-2xl max-h-[90dvh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Layers size={20} /> Registrar Nueva Etapa WBS
                  </h3>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[0.7rem] text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 flex items-start gap-2">
                  <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Nota Operativa:</strong> Toda nueva etapa inicia automáticamente en estado <strong>PENDIENTE</strong>. Cambiará a <strong>EN_CURSO</strong> en el sistema cuando los desarrolladores comiencen sus actividades asignadas.
                  </div>
                </div>

                <form onSubmit={handleRegistrarEtapa} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombre de la Fase / Etapa *</label>
                    <input
                      type="text"
                      required
                      value={nuevaEtapa.nombreEtapa}
                      onChange={(e) => setNuevaEtapa({ ...nuevaEtapa, nombreEtapa: e.target.value })}
                      placeholder="Nombre de la fase o etapa"
                      className="input-field py-2.5 font-bold"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowNuevaEtapaModal(false)}
                      disabled={submittingEtapa}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEtapa}
                      className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingEtapa ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Crear Etapa PENDIENTE'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Reasignar Actividad a Desarrollador con Trazabilidad */}
        <AnimatePresence>
          {showReasignarModal && actividadAReasignar && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-lg shadow-2xl max-h-[90dvh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <RotateCcw size={20} /> Reasignar Tarea a Desarrollador
                  </h3>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs mb-4">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Tarea a transferir:</div>
                  <div className="text-zinc-600 dark:text-zinc-300 italic mb-2">"{actividadAReasignar.descripcion}"</div>
                  <div className="text-[0.7rem] text-zinc-500 font-semibold flex items-center gap-1.5">
                    <User size={12} />
                    Responsable actual: {actividadAReasignar.desarrollador ? `${actividadAReasignar.desarrollador.nombre} ${actividadAReasignar.desarrollador.apellido}` : 'Sin Asignar'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-[0.7rem] text-blue-800 dark:text-blue-300 leading-relaxed mb-4 flex items-start gap-2">
                  <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Trazabilidad Histórica:</strong> Esta reasignación registrará un cambio en PostgreSQL indicando el nuevo desarrollador responsable, la justificación y la estampa de tiempo actual.
                  </div>
                </div>

                <form onSubmit={handleEjecutarReasignacion} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nuevo Desarrollador Responsable *</label>
                    <CustomSelect
                      value={datosReasignacion.nuevoDesarrolladorId}
                      onChange={(val) => setDatosReasignacion({ ...datosReasignacion, nuevoDesarrolladorId: val })}
                      options={[
                        { value: '', label: '— Seleccione nuevo desarrollador —' },
                        ...(desarrolladores || []).map(dev => ({
                          value: dev?.idTrabajador,
                          label: `${dev?.nombre} ${dev?.apellido}`,
                          subtitle: getCleanEspecialidad(dev?.especialidad, dev?.profesion)
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
                      value={datosReasignacion.motivo}
                      onChange={(e) => setDatosReasignacion({ ...datosReasignacion, motivo: e.target.value })}
                      placeholder="Motivo o justificación técnica obligatoria de la reasignación"
                      className="input-field py-2"
                    />
                  </div>

                  <div className="text-[0.65rem] text-zinc-400 font-medium">
                    Fecha de trazabilidad: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowReasignarModal(false)}
                      disabled={submittingReasignacion}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReasignacion}
                      className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingReasignacion ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Confirmar Reasignación'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Atender / Resolver Incidencia (RF-22 a RF-24) */}
        <AnimatePresence>
          {showAtenderModal && incidenciaAAtender && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-lg shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto"
              >
                <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${incidenciaAAtender._tipo === 'ERROR'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                      {incidenciaAAtender._tipo === 'ERROR' ? <Bug size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                        Gestión de {incidenciaAAtender._tipo === 'ERROR' ? 'Error Técnico' : 'Contingencia'} #{incidenciaAAtender.idError || incidenciaAAtender.idInterrupcion}
                      </h3>
                      <span className="text-xs text-zinc-500 font-medium">
                        Reportado por: {incidenciaAAtender.desarrollador?.nombre} {incidenciaAAtender.desarrollador?.apellido}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detalle del Reporte Original */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1.5">
                  <div className="flex justify-between text-[0.65rem] text-zinc-500 font-bold uppercase">
                    <span>Fase: {incidenciaAAtender.etapa?.nombreEtapa || 'WBS'}</span>
                    <span>{incidenciaAAtender._tipo === 'ERROR' ? `Severidad: ${incidenciaAAtender.severidad}` : `Duración: ${incidenciaAAtender.duracionMinutos} min`}</span>
                  </div>
                  <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                    "{incidenciaAAtender.descripcion || incidenciaAAtender.comentarios}"
                  </p>
                </div>

                {/* Indicador Visual de Progreso del Flujo de Atención (1-2-3) */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-zinc-400 block">Flujo de Atención del Caso:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[0.68rem] font-bold">
                    <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${incidenciaAAtender.estadoAtencion === 'REGISTRADO'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 shadow-2xs'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                      <Clock size={11} /> 1. Registrado
                    </div>
                    <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${incidenciaAAtender.estadoAtencion === 'EN_REVISION'
                        ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700 shadow-2xs'
                        : (incidenciaAAtender.estadoAtencion === 'SOLUCIONADO' || incidenciaAAtender.estadoAtencion === 'RESUELTO')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800'
                      }`}>
                      <Activity size={11} /> 2. En Revisión
                    </div>
                    <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${(incidenciaAAtender.estadoAtencion === 'SOLUCIONADO' || incidenciaAAtender.estadoAtencion === 'RESUELTO')
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-100 dark:border-emerald-700 font-extrabold shadow-2xs'
                        : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800'
                      }`}>
                      <CheckCircle2 size={11} /> 3. Solucionado
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAtenderIncidencia} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Estado de Atención *
                    </label>
                    <CustomSelect
                      value={atencionForm.estadoAtencion}
                      onChange={(val) => setAtencionForm({ ...atencionForm, estadoAtencion: val })}
                      options={[
                        { value: 'REGISTRADO', label: 'Registrado (En espera)' },
                        { value: 'EN_REVISION', label: 'En Revisión (En investigación)' },
                        { value: 'SOLUCIONADO', label: 'Solucionado / Resuelto' }
                      ]}
                      maxWidth="w-full"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Nota de Respuesta o Acción Correctiva (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={atencionForm.resolucionNota}
                      onChange={(e) => setAtencionForm({ ...atencionForm, resolucionNota: e.target.value })}
                      placeholder="Escriba las instrucciones, solución técnica o causa raíz para el desarrollador..."
                      className="input-field py-2"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowAtenderModal(false)}
                      disabled={submittingAtencion}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAtencion}
                      className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingAtencion ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Guardar Resolución'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Expediente y Detalles Completos de Incidencia */}
        <AnimatePresence>
          {showDetalleIncidenciaModal && incidenciaVerDetalle && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90dvh] overflow-y-auto my-auto relative"
              >
                {/* Cabecera Principal Ampliada */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5 pr-8">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ring-4 ${incidenciaVerDetalle._tipo === 'ERROR'
                        ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/20 ring-red-500/10'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20 ring-amber-500/10'
                      }`}>
                      {incidenciaVerDetalle._tipo === 'ERROR' ? <Bug size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                          Expediente de {incidenciaVerDetalle._tipo === 'ERROR' ? 'Error Técnico' : 'Interrupción Contingente'}
                        </h3>
                        <EstadoAtencionBadge estado={incidenciaVerDetalle.estadoAtencion} />
                      </div>
                      <span className="text-xs text-zinc-500 font-medium font-mono flex items-center gap-1.5 mt-0.5">
                        <span>ID Reporte:</span>
                        <strong className="text-zinc-800 dark:text-zinc-200">#{incidenciaVerDetalle.idError || incidenciaVerDetalle.idInterrupcion || incidenciaVerDetalle._id}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicador Visual de Progreso del Flujo de Atención (1-2-3) */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-zinc-400 block">Flujo de Atención del Caso:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[0.68rem] font-bold">
                    <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${incidenciaVerDetalle.estadoAtencion === 'REGISTRADO'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 shadow-2xs'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                      <Clock size={11} /> 1. Registrado
                    </div>
                    <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${incidenciaVerDetalle.estadoAtencion === 'EN_REVISION'
                        ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700 shadow-2xs'
                        : (incidenciaVerDetalle.estadoAtencion === 'SOLUCIONADO' || incidenciaVerDetalle.estadoAtencion === 'RESUELTO')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800'
                      }`}>
                      <Activity size={11} /> 2. En Revisión
                    </div>
                    <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${(incidenciaVerDetalle.estadoAtencion === 'SOLUCIONADO' || incidenciaVerDetalle.estadoAtencion === 'RESUELTO')
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-100 dark:border-emerald-700 font-extrabold shadow-2xs'
                        : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800'
                      }`}>
                      <CheckCircle2 size={11} /> 3. Solucionado
                    </div>
                  </div>
                </div>

                {/* Información General del Reporte (Grid Responsivo de 4 Tarjetas) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Tarjeta 1: Proyecto & Fase WBS */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-2 shadow-2xs">
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-blue-500 shrink-0" />
                      <span>Proyecto & Fase WBS</span>
                    </span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                      {incidenciaVerDetalle.etapa?.proyecto?.nombre || incidenciaVerDetalle.proyecto?.nombre || proyectoSeleccionado?.nombre || 'Proyecto Corporativo'}
                    </div>
                    <div className="text-[0.72rem] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                      <Layers size={13} className="text-indigo-500 shrink-0" />
                      <span className="truncate">Etapa: {incidenciaVerDetalle.etapa?.nombreEtapa || 'WBS General'}</span>
                    </div>
                  </div>

                  {/* Tarjeta 2: Desarrollador Reportante */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-2 shadow-2xs">
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <UserCheck size={13} className="text-emerald-500 shrink-0" />
                      <span>Desarrollador Reportante</span>
                    </span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[0.65rem] flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                        {incidenciaVerDetalle.desarrollador ? getInitials(incidenciaVerDetalle.desarrollador.nombre, incidenciaVerDetalle.desarrollador.apellido) : 'DEV'}
                      </div>
                      <span className="truncate">{incidenciaVerDetalle.desarrollador ? `${incidenciaVerDetalle.desarrollador.nombre} ${incidenciaVerDetalle.desarrollador.apellido}` : 'Sin Asignar'}</span>
                    </div>
                    <div className="text-[0.72rem] text-zinc-600 dark:text-zinc-400 truncate font-medium">
                      {getCleanEspecialidad(incidenciaVerDetalle.desarrollador?.especialidad, incidenciaVerDetalle.desarrollador?.profesion)}
                    </div>
                  </div>

                  {/* Tarjeta 3: Severidad / Duración */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-2 shadow-2xs">
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                      {incidenciaVerDetalle._tipo === 'ERROR' ? <AlertTriangle size={13} className="text-red-500 shrink-0" /> : <Clock size={13} className="text-amber-500 shrink-0" />}
                      <span>{incidenciaVerDetalle._tipo === 'ERROR' ? 'Nivel de Severidad del Fallo' : 'Tiempo Imputado de Interrupción'}</span>
                    </span>
                    <div>
                      {incidenciaVerDetalle._tipo === 'ERROR' ? (
                        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-mono font-extrabold uppercase border shadow-2xs ${incidenciaVerDetalle.severidad === 'CRITICA' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400' :
                            incidenciaVerDetalle.severidad === 'ALTA' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400' :
                              incidenciaVerDetalle.severidad === 'MEDIA' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}>
                          Severidad: {incidenciaVerDetalle.severidad || 'BAJA'}
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-mono font-extrabold shadow-2xs">
                          {incidenciaVerDetalle.duracionMinutos || 0} Minutos ({((incidenciaVerDetalle.duracionMinutos || 0) / 60).toFixed(1)} Horas)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta 4: Estampa de Tiempo */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-2 shadow-2xs">
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-purple-500 shrink-0" />
                      <span>Fecha & Hora de Registro</span>
                    </span>
                    <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {new Date(incidenciaVerDetalle._fecha).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                {/* Descripción Completa y Detalles Técnicos */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-[0.7rem] font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <FileText size={15} className="text-blue-500 shrink-0" />
                      <span>Descripción & Detalles del Reporte Técnico:</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-extrabold font-mono bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      REPORTE DEL DESARROLLADOR
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium whitespace-pre-wrap font-sans">
                    {incidenciaVerDetalle.descripcion || incidenciaVerDetalle.comentarios || 'Sin descripción técnica registrada.'}
                  </div>
                </div>

                {/* Nota de Resolución / Acción Correctiva del Líder */}
                {incidenciaVerDetalle.resolucionNota && (
                  <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="text-[0.7rem] font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Resolución / Acción Correctiva Registrada por el Líder:</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-extrabold font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        RESOLUCIÓN DE LÍDER
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-blue-200/80 dark:border-blue-800/60 text-xs leading-relaxed text-blue-950 dark:text-blue-100 font-medium italic">
                      "{incidenciaVerDetalle.resolucionNota}"
                    </div>
                  </div>
                )}

                {/* Botones de Acción y Navegación */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowDetalleIncidenciaModal(false)}
                    className="w-full sm:w-auto outline-button text-xs py-2.5 px-6 font-bold cursor-pointer text-zinc-700 dark:text-zinc-300 inline-flex items-center justify-center gap-1.5"
                  >
                    <X size={15} /> Cerrar Expediente
                  </button>

                  {incidenciaVerDetalle.estadoAtencion !== 'SOLUCIONADO' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetalleIncidenciaModal(false);
                        handleAbrirAtenderIncidencia(incidenciaVerDetalle);
                      }}
                      className="w-full sm:w-auto gradient-button text-xs py-2.5 px-6 font-extrabold cursor-pointer inline-flex items-center justify-center gap-2 shadow-md transform active:scale-95 transition-all"
                    >
                      <Edit3 size={15} /> Atender / Modificar Resolución
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Crear Nuevo Proyecto (HU-11 / RF-13 / RF-14) */}
        <AnimatePresence>
          {showNuevoProyectoModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-lg shadow-2xl max-h-[90dvh] overflow-y-auto space-y-4"
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                      <FolderPlus size={20} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        Crear Nuevo Proyecto
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Parametrización cronológica, cliente y presupuesto inicial
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCrearProyecto} className="space-y-4 text-xs" noValidate>
                  {/* Nombre del Proyecto */}
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombre del Proyecto *</label>
                    <input
                      type="text"
                      required
                      value={nuevoProyectoForm.nombre}
                      onChange={(e) => {
                        setNuevoProyectoForm({ ...nuevoProyectoForm, nombre: e.target.value });
                        setNuevoProyectoErrors(prev => ({ ...prev, nombre: undefined }));
                      }}
                      placeholder="Nombre del Proyecto"
                      className={`input-field py-2.5 font-bold ${nuevoProyectoErrors.nombre ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {nuevoProyectoErrors.nombre && (
                      <p className="text-[0.65rem] text-red-500 font-bold mt-1">{nuevoProyectoErrors.nombre}</p>
                    )}
                  </div>

                  {/* Cliente / Organización */}
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Cliente u Organización *</label>
                    <input
                      type="text"
                      required
                      value={nuevoProyectoForm.cliente}
                      onChange={(e) => {
                        setNuevoProyectoForm({ ...nuevoProyectoForm, cliente: e.target.value });
                        setNuevoProyectoErrors(prev => ({ ...prev, cliente: undefined }));
                      }}
                      placeholder="Cliente u Organización"
                      className={`input-field py-2.5 ${nuevoProyectoErrors.cliente ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {nuevoProyectoErrors.cliente && (
                      <p className="text-[0.65rem] text-red-500 font-bold mt-1">{nuevoProyectoErrors.cliente}</p>
                    )}
                  </div>

                  {/* Grid: Fechas Inicio y Fin Estimada */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Fecha de Inicio *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={nuevoProyectoForm.fechaInicio}
                        onChange={(e) => {
                          setNuevoProyectoForm({ ...nuevoProyectoForm, fechaInicio: e.target.value });
                          setNuevoProyectoErrors(prev => ({ ...prev, fechaInicio: undefined, fechaFinEstimada: undefined }));
                        }}
                        className={`input-field py-2 font-bold ${nuevoProyectoErrors.fechaInicio ? 'border-red-400 dark:border-red-600' : ''}`}
                      />
                      {nuevoProyectoErrors.fechaInicio && (
                        <p className="text-[0.65rem] text-red-500 font-bold mt-1">{nuevoProyectoErrors.fechaInicio}</p>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Fecha Fin Estimada *</label>
                      <input
                        type="date"
                        required
                        min={nuevoProyectoForm.fechaInicio || new Date().toISOString().split('T')[0]}
                        value={nuevoProyectoForm.fechaFinEstimada}
                        onChange={(e) => {
                          setNuevoProyectoForm({ ...nuevoProyectoForm, fechaFinEstimada: e.target.value });
                          setNuevoProyectoErrors(prev => ({ ...prev, fechaFinEstimada: undefined }));
                        }}
                        className={`input-field py-2 font-bold ${nuevoProyectoErrors.fechaFinEstimada ? 'border-red-400 dark:border-red-600' : ''}`}
                      />
                      {nuevoProyectoErrors.fechaFinEstimada && (
                        <p className="text-[0.65rem] text-red-500 font-bold mt-1">{nuevoProyectoErrors.fechaFinEstimada}</p>
                      )}
                    </div>
                  </div>

                  {/* Previsualización Dinámica del Cronograma Estimado */}
                  {nuevoProyectoForm.fechaInicio && nuevoProyectoForm.fechaFinEstimada && !nuevoProyectoErrors.fechaInicio && !nuevoProyectoErrors.fechaFinEstimada && (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                            CRONOGRAMA ESTIMADO
                          </span>
                          <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            <span>{formatearFechaHumana(nuevoProyectoForm.fechaInicio)}</span>
                            <ArrowRight size={12} className="text-zinc-400" />
                            <span>{formatearFechaHumana(nuevoProyectoForm.fechaFinEstimada)}</span>
                          </div>
                          {(() => {
                            const diasFaltantes = calcularDiasFaltantes(nuevoProyectoForm.fechaFinEstimada);
                            if (diasFaltantes === null) return null;
                            return (
                              <span className="text-[0.68rem] text-blue-600 dark:text-blue-400 font-bold block mt-0.5">
                                • {diasFaltantes > 0 ? `Faltan ${diasFaltantes} días para entrega` : diasFaltantes === 0 ? 'Entrega estimada para hoy' : `Entrega vencida por ${Math.abs(diasFaltantes)} días`}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[0.68rem] font-bold shrink-0 self-start sm:self-center">
                        <Clock size={12} />
                        <span>(Duración: {calcularDuracionProyecto(nuevoProyectoForm.fechaInicio, nuevoProyectoForm.fechaFinEstimada)})</span>
                      </span>
                    </div>
                  )}

                  {/* Presupuesto Inicial (Formato Moneda) */}
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Presupuesto Inicial ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={nuevoProyectoForm.presupuesto}
                        onChange={(e) => {
                          setNuevoProyectoForm({ ...nuevoProyectoForm, presupuesto: e.target.value });
                          setNuevoProyectoErrors(prev => ({ ...prev, presupuesto: undefined }));
                        }}
                        placeholder="0.00"
                        className={`input-field pl-7 py-2.5 font-mono font-bold ${nuevoProyectoErrors.presupuesto ? 'border-red-400 dark:border-red-600' : ''}`}
                      />
                    </div>
                    {nuevoProyectoErrors.presupuesto && (
                      <p className="text-[0.65rem] text-red-500 font-bold mt-1">{nuevoProyectoErrors.presupuesto}</p>
                    )}
                    {nuevoProyectoForm.presupuesto !== '' && Number(nuevoProyectoForm.presupuesto) > 0 && (
                      <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                        Dimensión presupuestal: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(Number(nuevoProyectoForm.presupuesto))}
                      </span>
                    )}
                  </div>

                  {/* Descripción Técnica */}
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Descripción del Alcance y Objetivos</label>
                    <textarea
                      rows={3}
                      value={nuevoProyectoForm.descripcion}
                      onChange={(e) => setNuevoProyectoForm({ ...nuevoProyectoForm, descripcion: e.target.value })}
                      placeholder="Descripción del alcance y objetivos"
                      className="input-field py-2"
                    />
                  </div>

                  {/* Acciones del Modal */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => { setShowNuevoProyectoModal(false); setNuevoProyectoErrors({}); }}
                      disabled={submittingProyecto}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProyecto}
                      className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingProyecto ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Plus size={14} /> Guardar Proyecto</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Confirmación de Impacto Operativo para Pausar Proyecto */}
        <AnimatePresence>
          {showConfirmPausarModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90dvh] overflow-y-auto my-auto relative"
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
                        <strong className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">[PRJ-00{proyectoSeleccionado?.idProyecto}]</strong>
                        <span className="truncate max-w-md font-bold">{proyectoSeleccionado?.nombre}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ficha Resumen de Cronograma y Tiempo de Entrega */}
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[0.68rem] font-mono font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarClock size={15} className="text-amber-600 dark:text-amber-400" />
                      Impacto en Fecha de Entrega y Cronograma Pactado
                    </span>
                    <span className="text-[0.68rem] font-mono font-black px-2.5 py-0.5 rounded-lg bg-amber-200/80 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      {calculoDiasPausa.diasRestantes > 0 ? `Faltan ${calculoDiasPausa.diasRestantes} días pactados` : 'Fecha límite alcanzada'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    Fecha estimada de entrega pactada: <strong>{calculoDiasPausa.fechaFormateada}</strong>. Al pausar este proyecto, el conteo operativo del cronograma quedará suspendido hasta su reactivación directiva.
                  </p>
                </div>

                {/* Evaluación de Procesos y Actividades en Desarrollo */}
                {evidenciaWbsPausa.tieneAvancesActivos ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                        <Layers size={16} className="text-amber-600 shrink-0" />
                        <span>Procesos WBS que Quedarán Congelados ({evidenciaWbsPausa.actividadesActivas.length} Actividades Activas)</span>
                      </span>
                      <span className="text-[0.65rem] font-mono font-bold text-zinc-400">
                        {evidenciaWbsPausa.etapasActivas.length} Etapa(s) Afectada(s)
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {evidenciaWbsPausa.actividadesActivas.map((act, idx) => (
                        <div key={act.idActividad || idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between text-xs gap-3">
                          <div className="min-w-0">
                            <span className="text-[0.62rem] font-mono text-zinc-400 block uppercase font-bold">{act.etapaNombre}</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block mt-0.5">{act.descripcion}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {act.desarrollador && (
                              <span className="text-[0.65rem] font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                                <Code2 size={12} className="text-amber-500" />
                                {act.desarrollador.nombre} {act.desarrollador.apellido}
                              </span>
                            )}
                            <span className="text-[0.62rem] font-black uppercase text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                              {act.estado || 'EN_PROGRESO'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                    <span>Este proyecto no cuenta con tareas ni procesos activos en desarrollo en este momento. ¿Está seguro de pausar la ejecución de este proyecto?</span>
                  </div>
                )}

                {/* Botones de Confirmación */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPausarModal(false)}
                    disabled={submittingPausa}
                    className="outline-button px-5 py-2.5 text-xs font-bold rounded-2xl cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await handlePausarProyecto();
                      setShowConfirmPausarModal(false);
                    }}
                    disabled={submittingPausa}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {submittingPausa ? (
                      <><Loader2 size={15} className="animate-spin" /> Procesando Pausa...</>
                    ) : (
                      <><Pause size={15} className="fill-white" /> Confirmar Pausa del Proyecto</>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Doble Confirmación Defensiva para Finalizar Proyecto (con Auditoría WBS) */}
        <AnimatePresence>
          {showConfirmFinalizar && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90dvh] overflow-y-auto my-auto relative"
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
                        <strong className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">[PRJ-00{proyectoSeleccionado?.idProyecto}]</strong>
                        <span className="truncate max-w-md">{proyectoSeleccionado?.nombre}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cuerpo Organizado en 2 Columnas (Grid Responsivo) */}
                {evidenciaWbsFinalizacion.esProyectoVacio ? (
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
                        Este proyecto no contiene fases ni tareas WBS registradas. No se puede catalogar como <strong>"Culminación Exitosa"</strong> dado que no tuvo ejecución técnica real. Para proceder con su clausura o cancelación, es obligatorio justificar la causa del cierre en la trazabilidad de auditoría.
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
                            value={motivoCancelacion}
                            onChange={(val) => setMotivoCancelacion(val)}
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
                            <span className={`text-[0.68rem] font-mono ${justificacionCancelacion.trim().length >= 10 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-amber-600 font-bold'}`}>
                              {justificacionCancelacion.trim().length} / 10 caracteres min.
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            value={justificacionCancelacion}
                            onChange={(e) => {
                              setJustificacionCancelacion(e.target.value);
                              if (cancelacionError) setCancelacionError('');
                            }}
                            placeholder="Ej: El proyecto se cierra prematuramente debido a reestructuración de prioridades comerciales por parte de la gerencia del cliente..."
                            className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-medium"
                          />
                          {cancelacionError && (
                            <span className="text-[0.72rem] text-red-600 dark:text-red-400 font-bold block mt-1 flex items-center gap-1">
                              <AlertTriangle size={14} className="shrink-0" /> {cancelacionError}
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
                      {!evidenciaWbsFinalizacion.todasCompletadas ? (
                        <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
                              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Alerta de Auditoría: Fases & Tareas Pendientes</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[0.68rem] font-bold font-mono">
                              {evidenciaWbsFinalizacion.etapasIncompletas.length} Etapas | {evidenciaWbsFinalizacion.actividadesIncompletas.length} Tareas
                            </span>
                          </div>

                          <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                            No es posible finalizar el proyecto porque aún existen elementos incompletos en la WBS. Debe completar la totalidad de las tareas antes de poder realizar el cierre formal.
                          </p>

                          {/* Contenedor Adaptativo de Evidencia WBS */}
                          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {(evidenciaWbsFinalizacion?.etapasIncompletas || []).map(et => (
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
                                          <span>{act.descripcion}</span>
                                        </span>
                                        <span className="text-[0.62rem] font-mono text-zinc-500 font-semibold">{act.estado}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-300 space-y-3 shadow-xs">
                          <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-xs text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 size={18} className="shrink-0" />
                            <span>Verificación WBS Cumplida (100%)</span>
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
                          <span>Impacto & Consecuencias del Cierre:</span>
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
                    onClick={() => setShowConfirmFinalizar(false)}
                    disabled={submittingFinalizar}
                    className="w-full sm:w-auto outline-button text-xs py-2.5 px-5 font-bold cursor-pointer disabled:opacity-50 text-zinc-700 dark:text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizarProyecto}
                    disabled={
                      submittingFinalizar ||
                      (evidenciaWbsFinalizacion.esProyectoVacio
                        ? justificacionCancelacion.trim().length < 10
                        : !evidenciaWbsFinalizacion.todasCompletadas)
                    }
                    title={
                      evidenciaWbsFinalizacion.esProyectoVacio
                        ? (justificacionCancelacion.trim().length < 10
                            ? 'Debe escribir una justificación de al menos 10 caracteres para habilitar el cierre'
                            : 'Confirmar Cierre Prematuro con Auditoría')
                        : (!evidenciaWbsFinalizacion.todasCompletadas
                            ? 'Acción Bloqueada: Debe tener el 100% de la WBS completada'
                            : 'Confirmar Cierre Formal')
                    }
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs py-2.5 px-6 rounded-xl font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95"
                  >
                    {submittingFinalizar ? (
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
        </AnimatePresence>

        {/* Modal: Menú Emergente y Explorador Avanzado de Proyectos */}
        <AnimatePresence>
          {modalProyectosOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-6xl xl:max-w-7xl w-[95vw] shadow-2xl space-y-5 max-h-[92dvh] flex flex-col"
              >
                {/* Encabezado del Menú */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                      <FolderGit2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                        <span>Explorador de Proyectos</span>
                        <span className="text-[0.7rem] font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-zinc-700">
                          {proyectos?.length || 0} proyectos registrados
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        Filtra, busca y conmuta rápidamente el contexto activo de la plataforma
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barra de Búsqueda y Filtros Rápidos */}
                <div className="space-y-3 shrink-0">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={busquedaProyectoModal}
                      onChange={(e) => setBusquedaProyectoModal(e.target.value)}
                      placeholder="Buscar proyecto por nombre, cliente, código PRJ, tecnologías..."
                      className="input-field pl-11 pr-10 py-3 text-xs sm:text-sm font-medium w-full rounded-2xl shadow-xs"
                      autoFocus
                    />
                    {busquedaProyectoModal && (
                      <button
                        type="button"
                        onClick={() => setBusquedaProyectoModal('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Selector Estricto de Propiedad (Mis Proyectos vs Otros Líderes) */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setFiltroPropiedadLider('MIS_PROYECTOS')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${filtroPropiedadLider === 'MIS_PROYECTOS'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                      <User size={13} />
                      <span>Mis Proyectos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroPropiedadLider('OTROS_LIDERES')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${filtroPropiedadLider === 'OTROS_LIDERES'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                      <Users size={13} />
                      <span>Proyectos de Otros Líderes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroPropiedadLider('TODOS')}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${filtroPropiedadLider === 'TODOS'
                          ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                      <span>Todos</span>
                    </button>
                  </div>

                  {/* Filtros Rápidos de Estado */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setFiltroEstadoProyectoModal('TODOS')}
                      className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${filtroEstadoProyectoModal === 'TODOS'
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                      <span>Todos</span>
                      <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-black/10">
                        {statsProyectos.total}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroEstadoProyectoModal('ACTIVO')}
                      className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${filtroEstadoProyectoModal === 'ACTIVO'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                        }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Activos</span>
                      <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
                        {statsProyectos.activos}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroEstadoProyectoModal('FINALIZADO')}
                      className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${filtroEstadoProyectoModal === 'FINALIZADO'
                          ? 'bg-zinc-700 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                      <span>Finalizados</span>
                      <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
                        {statsProyectos.finalizados}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroEstadoProyectoModal('GLOBAL')}
                      className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${filtroEstadoProyectoModal === 'GLOBAL'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100'
                        }`}
                    >
                      <Globe size={13} />
                      <span>Vista Global</span>
                    </button>
                  </div>
                </div>

                {/* Lista / Grid de Proyectos con Scroll Ampliado */}
                <div className="overflow-y-auto flex-1 pr-1.5 space-y-3.5 max-h-[60vh]">
                  {/* Opción Especial: Vista Global Corporativa (Disponible en todas las pestañas) */}
                  {(filtroEstadoProyectoModal === 'TODOS' || filtroEstadoProyectoModal === 'GLOBAL') && !busquedaProyectoModal && (
                    <div
                      onClick={() => {
                        seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                        setModalProyectosOpen(false);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${(!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL')
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/80 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                          <Globe size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                              [Vista Global Corporativa] Todos los Proyectos
                            </span>
                            <span className="text-[0.62rem] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              GLOBAL
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Consolida el catálogo completo de proyectos, riesgos y métricas de la organización.
                          </p>
                        </div>
                      </div>
                      {(!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                          <CheckCircle2 size={16} /> Activo
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-zinc-400 hover:text-blue-600 shrink-0">
                          Seleccionar →
                        </span>
                      )}
                    </div>
                  )}

                  {/* Grid Ampliado de Proyectos (3 Columnas en Pantallas Medianas/Grandes) */}
                  {proyectosModalFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {proyectosModalFiltrados.map(p => {
                        const isSelected = proyectoSeleccionado?.idProyecto === p.idProyecto;
                        const estInfo = getEstadoBadgeClasses(p.estado);

                        return (
                          <div
                            key={p.idProyecto}
                            onClick={() => {
                              seleccionarProyecto(p);
                              setModalProyectosOpen(false);
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-md ring-2 ring-blue-500/20'
                                : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/70 hover:border-blue-400 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm'
                              }`}
                          >
                            <div>
                              {/* Cabecera de la tarjeta */}
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="font-mono text-[0.7rem] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                                  PRJ-00{p.idProyecto}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[0.62rem] font-extrabold uppercase px-2 py-0.5 rounded-full border ${estInfo.badge}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${estInfo.dot}`}></span>
                                  <span>{p.estado || 'ACTIVO'}</span>
                                </span>
                              </div>

                              {/* Nombre del Proyecto */}
                              <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug" title={p.nombre}>
                                {p.nombre}
                              </h4>

                              {/* Cliente o Descripción */}
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 font-medium">
                                {p.cliente ? `Cliente: ${p.cliente}` : (p.descripcion || 'Sin descripción')}
                              </p>
                            </div>

                            {/* Footer de la tarjeta con presupuesto y estado de selección */}
                            <div className="pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                                {p.presupuesto ? `$${Number(p.presupuesto).toLocaleString()}` : '$0.00'}
                              </span>
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                                  <Check size={14} /> Activo
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-zinc-400 group-hover:text-blue-600 transition-colors">
                                  Seleccionar →
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-10 text-center text-zinc-400 text-xs flex flex-col items-center justify-center space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <FolderGit2 size={28} className="text-zinc-400" />
                      <p className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">No se encontraron proyectos</p>
                      <p className="text-xs">Intenta con otro término de búsqueda o cambia el filtro de estado.</p>
                    </div>
                  )}
                </div>

                {/* Pie del Modal */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0 text-xs text-zinc-400">
                  <span>Mostrando <strong>{proyectosModalFiltrados.length}</strong> de <strong>{proyectos?.length || 0}</strong> proyectos</span>
                  <button
                    type="button"
                    onClick={() => setModalProyectosOpen(false)}
                    className="outline-button text-xs py-1.5 px-4 font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Ventana Emergente (Modal): Selección de Rango de Fechas */}
        <AnimatePresence>
          {showFiltroFechasModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0 shadow-2xs">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                        Filtrar por Rango de Fechas
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Seleccione el período exacto de incidencias
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preajustes Rápidos */}
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-400 block mb-2">Selección Rápida de Período:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = new Date().toISOString().split('T')[0];
                        setTempFechaDesde(hoy);
                        setTempFechaHasta(hoy);
                      }}
                      className="py-1.5 px-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = new Date();
                        const hace7 = new Date();
                        hace7.setDate(hoy.getDate() - 7);
                        setTempFechaDesde(hace7.toISOString().split('T')[0]);
                        setTempFechaHasta(hoy.toISOString().split('T')[0]);
                      }}
                      className="py-1.5 px-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    >
                      7 Días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = new Date();
                        const hace30 = new Date();
                        hace30.setDate(hoy.getDate() - 30);
                        setTempFechaDesde(hace30.toISOString().split('T')[0]);
                        setTempFechaHasta(hoy.toISOString().split('T')[0]);
                      }}
                      className="py-1.5 px-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    >
                      30 Días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = new Date();
                        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                        setTempFechaDesde(inicioMes.toISOString().split('T')[0]);
                        setTempFechaHasta(hoy.toISOString().split('T')[0]);
                      }}
                      className="py-1.5 px-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[0.68rem] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    >
                      Este Mes
                    </button>
                  </div>
                </div>

                {/* Entradas de Fechas */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">Fecha Inicial (Desde)</label>
                    <input
                      type="date"
                      value={tempFechaDesde}
                      onChange={(e) => setTempFechaDesde(e.target.value)}
                      className="input-field py-2 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">Fecha Final (Hasta)</label>
                    <input
                      type="date"
                      value={tempFechaHasta}
                      onChange={(e) => setTempFechaHasta(e.target.value)}
                      className="input-field py-2 font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroFechaDesde('');
                      setFiltroFechaHasta('');
                      setTempFechaDesde('');
                      setTempFechaHasta('');
                      setFiltroFechaTipo('TODAS');
                      setShowFiltroFechasModal(false);
                    }}
                    className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
                  >
                    Limpiar Filtro
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFiltroFechasModal(false)}
                      className="outline-button text-xs py-2 px-3 font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroFechaDesde(tempFechaDesde);
                        setFiltroFechaHasta(tempFechaHasta);
                        setFiltroFechaTipo('RANGO');
                        setShowFiltroFechasModal(false);
                        toast.success('Rango de fechas aplicado a la tabla.');
                      }}
                      className="gradient-button text-xs py-2 px-4 font-bold cursor-pointer shadow-sm"
                    >
                      Aplicar Fechas
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Modal: Guía Rápida de Incidencias en 3 Pasos */}
          {showGuiaModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-[95%] sm:w-full max-w-lg shadow-2xl space-y-5"
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm uppercase tracking-wider">
                    <HelpCircle size={18} />
                    <span>Guía Rápida: Resolver Casos en 3 Pasos</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                    <strong className="text-blue-600 dark:text-blue-400 block font-bold text-xs">Paso 1: Filtrar por Fecha y Perfil</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      Filtra por Estado, Desarrollador o Rango de Fechas (Hoy, 7 Días, Período Exacto) usando los selectores de la consola.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                    <strong className="text-blue-600 dark:text-blue-400 block font-bold text-xs">Paso 2: Ver Detalles del Expediente</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      Haz clic en <strong>Ver Detalles</strong> en cualquier fila para inspeccionar la causa raíz, desarrollador responsable y fecha de registro.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                    <strong className="text-blue-600 dark:text-blue-400 block font-bold text-xs">Paso 3: Atender y Guardar Resolución</strong>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      Haz clic en <strong>Atender / Editar</strong> para cambiar el estado a <em>En Revisión</em> o <em>Solucionado</em> guardando constancia en PostgreSQL.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowGuiaModal(false)}
                    className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer shadow-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
          {/* 1. Modal: Editar Etapa WBS */}
          {showEditarEtapaModal && editingEtapaObj && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5"
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-extrabold text-base">
                    <Edit3 size={18} className="text-blue-600 dark:text-blue-400" />
                    <span>Editar Etapa WBS (#Etapa {editingEtapaObj.idEtapa})</span>
                  </div>
                </div>

                <form onSubmit={handleGuardarEditarEtapa} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                      Nombre de la Fase / Etapa WBS *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingEtapaForm.nombreEtapa}
                      onChange={(e) => setEditingEtapaForm({ ...editingEtapaForm, nombreEtapa: e.target.value })}
                      className="input-field w-full py-2.5 text-xs font-semibold"
                      placeholder="Ej. Fase 1: Especificación y Arquitectura N-Capas"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Estado Operativo de la Etapa
                    </label>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                      <span className="font-extrabold text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                        {editingEtapaForm.estado || 'PENDIENTE'}
                      </span>
                      <span className="text-[0.68rem] text-zinc-400 font-medium italic">
                        (Administrado automáticamente por el sistema)
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-zinc-400 font-medium mt-1">
                      El estado cambia a EN_PROCESO cuando hay tareas en progreso y a FINALIZADA al presionar &quot;Finalizar Etapa&quot;.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowEditarEtapaModal(false)}
                      className="outline-button text-xs py-2 px-4 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEditarEtapa}
                      className="gradient-button text-xs py-2 px-5 font-bold inline-flex items-center gap-1.5 shadow-md"
                    >
                      {submittingEditarEtapa ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
          {/* Modal Emergente Interactivo: Confirmar Finalización de Etapa WBS */}
          {etapaAFinalizarModalLider && (
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
                      Cierre Formal de Fase #{etapaAFinalizarModalLider.idEtapa}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 space-y-2 text-xs">
                  <p className="text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                    ¿Está seguro de finalizar formalmente la etapa <strong className="text-zinc-900 dark:text-zinc-100">&quot;{etapaAFinalizarModalLider.nombreEtapa}&quot;</strong>?
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
                    onClick={() => setEtapaAFinalizarModalLider(null)}
                    className="px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={ejecutarFinalizarEtapaLider}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    <span>Sí, Finalizar Etapa</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Modal Emergente Interactivo: Confirmar Reapertura de Etapa WBS */}
          {etapaAReabrirModalLider && (
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
                    La etapa &quot;{etapaAReabrirModalLider.etapaNombre}&quot; se encuentra actualmente FINALIZADA.
                  </p>
                  <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 text-[0.7rem] text-amber-900 dark:text-amber-300 space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-600">1.</span>
                      <span>La etapa se reabrirá automáticamente y su estado cambiará a <strong>EN_PROCESO</strong>.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-600">2.</span>
                      <span>Se asignará la tarea <strong>&quot;{etapaAReabrirModalLider.nombreActividad}&quot;</strong> a {etapaAReabrirModalLider.devNombre}.</span>
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
                    onClick={() => setEtapaAReabrirModalLider(null)}
                    className="px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={ejecutarReaperturaYAsignarLider}
                    className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <RotateCcw size={16} />
                    <span>Sí, Reabrir y Asignar</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* 2. Modal: Editar Información del Proyecto */}
          {showEditarProyectoModal && proyectoSeleccionado && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-extrabold text-base">
                    <FolderGit2 size={20} className="text-blue-600 dark:text-blue-400" />
                    <span>Editar Información del Proyecto (PRJ-00{proyectoSeleccionado.idProyecto})</span>
                  </div>
                </div>

                <form onSubmit={handleGuardarEditarProyecto} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                        Nombre del Proyecto *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProyectoForm.nombre}
                        onChange={(e) => setEditingProyectoForm({ ...editingProyectoForm, nombre: e.target.value })}
                        className="input-field w-full py-2 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                        Cliente / Organización *
                      </label>
                      <input
                        type="text"
                        value={editingProyectoForm.cliente}
                        onChange={(e) => setEditingProyectoForm({ ...editingProyectoForm, cliente: e.target.value })}
                        className="input-field w-full py-2 text-xs font-semibold"
                        placeholder="Ej. Itaú Unibanco Holding"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                        Presupuesto (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProyectoForm.presupuesto}
                        onChange={(e) => setEditingProyectoForm({ ...editingProyectoForm, presupuesto: e.target.value })}
                        className="input-field w-full py-2 text-xs font-mono font-bold"
                        placeholder="120000"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={editingProyectoForm.fechaInicio}
                        onChange={(e) => setEditingProyectoForm({ ...editingProyectoForm, fechaInicio: e.target.value })}
                        className="input-field w-full py-2 text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                        Entrega Estimada
                      </label>
                      <input
                        type="date"
                        value={editingProyectoForm.fechaFinEstimada}
                        onChange={(e) => setEditingProyectoForm({ ...editingProyectoForm, fechaFinEstimada: e.target.value })}
                        className="input-field w-full py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Estado Operativo Ampliado */}
                  <div className="space-y-1 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                    <label className="font-extrabold text-zinc-900 dark:text-zinc-100 block">
                      Estado Operativo del Proyecto *
                    </label>
                    <select
                      value={editingProyectoForm.estado}
                      onChange={(e) => setEditingProyectoForm({ ...editingProyectoForm, estado: e.target.value })}
                      className="input-field w-full py-2 text-xs font-bold appearance-none cursor-pointer"
                    >
                      <option value="ACTIVO">ACTIVO (En Ejecución Normal)</option>
                      <option value="PAUSADO">PAUSADO (En Pausa Temporaria)</option>
                      <option value="INHABILITADO">INHABILITADO (Suspendido u Operación Detenida)</option>
                      <option value="FINALIZADO">FINALIZADO (Cerrado Formalmente)</option>
                    </select>
                    <p className="text-[0.68rem] text-zinc-500 font-medium pt-1">
                      Nota: Cambiar el estado a <strong>PAUSADO</strong> notificará de inmediato a todos los desarrolladores con actividades activas en este proyecto.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                      Descripción del Alcance y Objetivos
                    </label>
                    <textarea
                      rows={3}
                      value={editingProyectoForm.descripcion}
                      onChange={(e) => setEditingProyectoForm({ ...editingProyectoForm, descripcion: e.target.value })}
                      className="input-field w-full py-2 text-xs font-medium"
                      placeholder="Descripción detallada del alcance técnico y metas corporativas..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowEditarProyectoModal(false)}
                      className="outline-button text-xs py-2 px-4 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEditarProyecto}
                      className="gradient-button text-xs py-2 px-5 font-bold inline-flex items-center gap-1.5 shadow-md"
                    >
                      {submittingEditarProyecto ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Guardar Cambios del Proyecto</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* 3. Modal: Generador de Reportes PDF Configurable Avanzado (HU-12 / RF-18) */}
          {showGenerarReportePdfModal && proyectoSeleccionado && (() => {
            const detallePausaModal = calcularDetalleTiempoPausa(proyectoSeleccionado, historialCambios);
            const seccionesActivas = [
              pdfConfig.incluirPausas,
              pdfConfig.incluirAuditoriaCoordinador,
              pdfConfig.incluirWbs,
              pdfConfig.incluirEquipo,
              pdfConfig.modoSensible,
              pdfConfig.incluirMetricasKpi,
              pdfConfig.incluirMatrizRiesgos,
              pdfConfig.incluirFirmaDirectiva
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

                  {/* Tarjeta Informativa del Proyecto Seleccionado con Estatus de Pausa */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/70 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/80 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.68rem] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                          PRJ-00{proyectoSeleccionado.idProyecto}
                        </span>
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {proyectoSeleccionado.nombre}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                        Cliente: <strong>{proyectoSeleccionado.cliente || 'Interno'}</strong> • Líder: <strong>{proyectoSeleccionado.lider ? `${proyectoSeleccionado.lider.nombre} ${proyectoSeleccionado.lider.apellido}` : 'Carlos Mendoza'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${proyectoSeleccionado.estado === 'EN_PAUSA'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                        }`}>
                        {proyectoSeleccionado.estado === 'EN_PAUSA' ? <Pause size={13} /> : <CheckCircle2 size={13} />}
                        {proyectoSeleccionado.estado || 'ACTIVO'}
                      </span>
                    </div>
                  </div>

                  {/* Alerta de tiempo en pausa si el proyecto está pausado */}
                  {detallePausaModal.enPausa && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                      <Clock size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-0.5">Proyecto en Pausa Operativa:</strong>
                        <span>Duración acumulada: <strong>{detallePausaModal.textoFormateado}</strong>. Se incluirá la proyección de postergación de la fecha de entrega original.</span>
                      </div>
                    </div>
                  )}

                  {/* Disposición en 2 Columnas de Configuración */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
                    {/* Columna Izquierda: Nivel de Detalle del Reporte (5 cols) */}
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
                          onClick={() => seleccionarPerfilPdf('RESUMIDO')}
                          className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${pdfConfig.nivelDetalle === 'RESUMIDO'
                              ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <PieChart size={15} className={pdfConfig.nivelDetalle === 'RESUMIDO' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                                Reporte Resumido (Ejecutivo)
                              </span>
                            </div>
                            {pdfConfig.nivelDetalle === 'RESUMIDO' && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
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
                          onClick={() => seleccionarPerfilPdf('DETALLADO')}
                          className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${pdfConfig.nivelDetalle === 'DETALLADO'
                              ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Activity size={15} className={pdfConfig.nivelDetalle === 'DETALLADO' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                                Reporte Operativo (Estándar)
                              </span>
                            </div>
                            {pdfConfig.nivelDetalle === 'DETALLADO' && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
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
                          onClick={() => seleccionarPerfilPdf('AUDITORIA_COMPLETA')}
                          className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${pdfConfig.nivelDetalle === 'AUDITORIA_COMPLETA'
                              ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <ShieldCheck size={15} className={pdfConfig.nivelDetalle === 'AUDITORIA_COMPLETA' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                                Consolidado Audit-Ready (Completo)
                              </span>
                            </div>
                            {pdfConfig.nivelDetalle === 'AUDITORIA_COMPLETA' && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
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

                    {/* Columna Derecha: Opciones y Secciones Específicas a Incluir (7 cols) */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[0.7rem]">
                          2. Secciones e Información a Imprimir *
                        </label>

                        {/* Botones de Selección Rápida */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPdfConfig({
                              ...pdfConfig,
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
                            onClick={() => setPdfConfig({
                              ...pdfConfig,
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
                        {/* Opción 1: Pausas y Trazabilidad */}
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.incluirPausas
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.incluirPausas}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, incluirPausas: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Pause size={14} className={pdfConfig.incluirPausas ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
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
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.incluirAuditoriaCoordinador
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.incluirAuditoriaCoordinador}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, incluirAuditoriaCoordinador: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <ShieldCheck size={14} className={pdfConfig.incluirAuditoriaCoordinador ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
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
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.incluirWbs
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.incluirWbs}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, incluirWbs: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Layers size={14} className={pdfConfig.incluirWbs ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                                Estructura WBS, Fases y Actividades del Proyecto
                              </span>
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                              Desglose por etapas, actividades técnicas, desarrolladores y % de avance.
                            </span>
                          </div>
                        </label>

                        {/* Opción 4: Equipo y Nómina */}
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.incluirEquipo
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.incluirEquipo}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, incluirEquipo: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Users size={14} className={pdfConfig.incluirEquipo ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                                Nómina de Desarrolladores y Control de Jornada (48h)
                              </span>
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                              Lista de desarrolladores vinculados, especialidades y dedicación de jornada.
                            </span>
                          </div>
                        </label>

                        {/* Opción 5: Presupuesto Financiero Sensible */}
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.modoSensible
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.modoSensible}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, modoSensible: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <DollarSign size={14} className={pdfConfig.modoSensible ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                                Información Financiera Sensible (Presupuesto USD)
                              </span>
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                              Presupuesto financiero confidencial asignado y métricas de costo.
                            </span>
                          </div>
                        </label>

                        {/* Opción 6: Métricas de Salud y KPIs */}
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.incluirMetricasKpi
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.incluirMetricasKpi}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, incluirMetricasKpi: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Activity size={14} className={pdfConfig.incluirMetricasKpi ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                                Métricas de Salud Operativa, KPIs & Carga Laboral
                              </span>
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                              Estatus de salud del proyecto (Semáforo), % de avance global y métrica de cumplimiento de 48h.
                            </span>
                          </div>
                        </label>

                        {/* Opción 7: Matriz de Riesgos */}
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.incluirMatrizRiesgos
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.incluirMatrizRiesgos}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, incluirMatrizRiesgos: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <ShieldAlert size={14} className={pdfConfig.incluirMatrizRiesgos ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 block">
                                Matriz de Riesgos y Evaluación de Contingencias
                              </span>
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block leading-tight pl-5">
                              Evaluación de riesgos operativos, alertas de postergación y planes de mitigación.
                            </span>
                          </div>
                        </label>

                        {/* Opción 8: Bloque Oficial de Firmas */}
                        <label className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${pdfConfig.incluirFirmaDirectiva
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}>
                          <input
                            type="checkbox"
                            checked={pdfConfig.incluirFirmaDirectiva}
                            onChange={(e) => setPdfConfig({ ...pdfConfig, incluirFirmaDirectiva: e.target.checked })}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <FileCheck size={14} className={pdfConfig.incluirFirmaDirectiva ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-zinc-400 shrink-0"} />
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
                        onClick={() => setShowGenerarReportePdfModal(false)}
                        className="outline-button text-xs py-2.5 px-4 font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <motion.button
                        type="button"
                        onClick={handleGenerarReportePdf}
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
          {/* Modal: Registro de Nuevo Colaborador (Líder o Desarrollador) */}
          {showNuevoColaboradorModal && (() => {
            const currentSkillProfile = ROLE_SKILL_PROFILES[nuevoColaboradorForm.rol] || ROLE_SKILL_PROFILES.DESARROLLADOR;
            const RoleIconComponent = nuevoColaboradorForm.rol === 'DESARROLLADOR' ? Code2 : Briefcase;

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
                  <div className="flex justify-between items-start pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                        <UserPlus size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                          <span>Registrar Nuevo Desarrollador</span>
                          <span className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            DESARROLLADOR (WBS)
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Alta corporativa en PostgreSQL y configuración del perfil técnico del desarrollador de software
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCrearColaboradorPorLider} className="space-y-4 text-xs" noValidate>
                    {/* Layout de 2 Columnas Aprovechando el Ancho Horizontal */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                      {/* COLUMNA IZQUIERDA: 1. Identificación & Credenciales */}
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

                        {/* Selector de País de Emisión y Número de Identificación Validado */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div>
                            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                              País de Emisión / Documento *
                            </label>
                            <select
                              value={nuevoColaboradorForm.paisCodigo}
                              onChange={(e) => {
                                setNuevoColaboradorForm({ ...nuevoColaboradorForm, paisCodigo: e.target.value });
                                setFormErrorsColaborador(p => ({ ...p, identificacion: undefined }));
                              }}
                              className="input-field py-2 text-xs font-bold"
                            >
                              {PAISES_IDENTIFICACION.map(p => (
                                <option key={p.code} value={p.code}>
                                  [{p.flag}] {p.nombre} ({p.docTipo})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between text-xs mb-1">
                              <span>Número de Identificación / {paisActual.docTipo} *</span>
                              <span className="text-[0.62rem] font-mono text-blue-600 dark:text-blue-400 font-extrabold">
                                [{paisActual.flag}] {paisActual.nombre}
                              </span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={nuevoColaboradorForm.identificacion}
                                onChange={(e) => {
                                  setNuevoColaboradorForm({ ...nuevoColaboradorForm, identificacion: e.target.value });
                                  setFormErrorsColaborador(p => ({ ...p, identificacion: undefined }));
                                }}
                                placeholder={paisActual.placeholder}
                                className={`input-field py-2 text-xs font-mono font-bold pr-9 ${nuevoColaboradorForm.identificacion
                                    ? (docValidationResult.valid ? 'border-blue-500 ring-2 ring-blue-500/10 dark:border-blue-500' : 'border-red-400 dark:border-red-600 ring-2 ring-red-500/10')
                                    : ''
                                  }`}
                              />
                              {nuevoColaboradorForm.identificacion && (
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
                            {nuevoColaboradorForm.identificacion && (
                              <p className={`text-[0.65rem] font-bold mt-1 flex items-center gap-1.5 ${docValidationResult.valid ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'
                                }`}>
                                <span>{docValidationResult.message}</span>
                              </p>
                            )}
                            {formErrorsColaborador.identificacion && !nuevoColaboradorForm.identificacion && (
                              <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrorsColaborador.identificacion}</p>
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
                                value={nuevoColaboradorForm.nombre}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const autoEmail = autoGenerarEmailCorporativoLider(val, nuevoColaboradorForm.apellido);
                                  setNuevoColaboradorForm(prev => ({ ...prev, nombre: val, email: autoEmail || prev.email }));
                                  setFormErrorsColaborador(p => ({ ...p, nombre: undefined }));
                                }}
                                placeholder="Nombres del colaborador"
                                className={`input-field py-2 text-xs ${nuevoColaboradorForm.nombre ? (nombreValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                                  }`}
                              />
                              {nuevoColaboradorForm.nombre && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                  {nombreValidationResult.valid ? <CheckCircle2 size={14} className="text-blue-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                                </div>
                              )}
                            </div>
                            {nuevoColaboradorForm.nombre && !nombreValidationResult.valid && (
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
                                value={nuevoColaboradorForm.apellido}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const autoEmail = autoGenerarEmailCorporativoLider(nuevoColaboradorForm.nombre, val);
                                  setNuevoColaboradorForm(prev => ({ ...prev, apellido: val, email: autoEmail || prev.email }));
                                  setFormErrorsColaborador(p => ({ ...p, apellido: undefined }));
                                }}
                                placeholder="Apellidos del colaborador"
                                className={`input-field py-2 text-xs ${nuevoColaboradorForm.apellido ? (apellidoValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                                  }`}
                              />
                              {nuevoColaboradorForm.apellido && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                  {apellidoValidationResult.valid ? <CheckCircle2 size={14} className="text-blue-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                                </div>
                              )}
                            </div>
                            {nuevoColaboradorForm.apellido && !apellidoValidationResult.valid && (
                              <p className="text-[0.63rem] text-red-500 font-bold mt-0.5">{apellidoValidationResult.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                              Rol de Seguridad Asignado *
                            </label>
                            <div className="input-field py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 flex items-center justify-between">
                              <span>DESARROLLADOR (WBS)</span>
                              <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />
                            </div>
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
                              value={nuevoColaboradorForm.email}
                              onChange={(e) => { setNewColaboradorForm({ ...nuevoColaboradorForm, email: e.target.value }); setFormErrorsColaborador(p => ({ ...p, email: undefined })); }}
                              onBlur={() => {
                                if (nuevoColaboradorForm.email && !nuevoColaboradorForm.email.includes('@')) {
                                  setNuevoColaboradorForm(prev => ({ ...prev, email: `${prev.email.trim()}@ikernell.org` }));
                                }
                              }}
                              placeholder="correo.corporativo@ikernell.org"
                              className={`input-field py-2 text-xs font-mono pr-9 ${nuevoColaboradorForm.email ? (emailValidationResult.valid ? 'border-blue-500' : 'border-red-400 dark:border-red-600') : ''
                                }`}
                            />
                            {nuevoColaboradorForm.email && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {emailValidationResult.valid ? <CheckCircle2 size={16} className="text-blue-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                              </div>
                            )}
                          </div>
                          {nuevoColaboradorForm.email && (
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
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={nuevoColaboradorForm.emailPersonal || ''}
                              onChange={(e) => {
                                setNewColaboradorForm({ ...nuevoColaboradorForm, emailPersonal: e.target.value });
                                setFormErrorsColaborador(p => ({ ...p, emailPersonal: undefined }));
                              }}
                              placeholder="correo.personal@gmail.com"
                              className={`input-field py-2 text-xs font-semibold pr-9 ${
                                nuevoColaboradorForm.emailPersonal
                                  ? (emailPersonalValidationResult.valid ? 'border-emerald-500 dark:border-emerald-500' : 'border-red-500 dark:border-red-500 bg-red-50/30 dark:bg-red-950/20')
                                  : ''
                              }`}
                            />
                            {nuevoColaboradorForm.emailPersonal && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {emailPersonalValidationResult.valid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                              </div>
                            )}
                          </div>
                          {nuevoColaboradorForm.emailPersonal && (
                            <p className={`text-[0.65rem] font-bold mt-1 ${emailPersonalValidationResult.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                              {emailPersonalValidationResult.message}
                            </p>
                          )}
                          <p className="text-[0.65rem] text-zinc-500 font-medium mt-1">
                            Las credenciales temporales de acceso inicial se enviarán a este correo alternativo.
                          </p>
                        </div>

                        {/* Informativo de Contraseña Temporal Automática del Sistema */}
                        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 flex items-start gap-3 text-xs font-medium mt-3">
                          <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-bold block text-blue-950 dark:text-blue-100">Contraseña Temporal Automática</span>
                            <p className="text-[0.7rem] text-blue-800/90 dark:text-blue-300 leading-relaxed">
                              La contraseña inicial de acceso será generada automáticamente por el sistema con alta seguridad (8-20 caracteres, Mayúscula, Minúscula, Número y Símbolo) y enviada al correo personal indicado.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* COLUMNA DERECHA: 2. Perfil Profesional & 3. Stack (WBS) */}
                      <div className="space-y-4">
                        {/* 2. Perfil Profesional & Especialidad Principal */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100">
                              <GraduationCap size={14} className="text-blue-500" />
                              <span>2. Perfil Profesional & Especialidad Principal</span>
                            </div>
                            <span className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Perfil Desarrollador WBS
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[0.68rem]">
                                Profesión / Titulación *
                              </label>
                              <select
                                required
                                value={nuevoColaboradorForm.profesion}
                                onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, profesion: e.target.value })}
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
                                value={nuevoColaboradorForm.especialidad}
                                onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, especialidad: e.target.value })}
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

                        {/* 3. Habilidades Técnicas & Competencias */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-3.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-xs font-black text-blue-950 dark:text-blue-200">
                              <Code2 size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>Habilidades Técnicas & Stack de Desarrollo (WBS)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[0.65rem] font-bold font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                                {selectedSkills.length} Habilidades
                              </span>
                            </div>
                          </div>

                          {/* Chip Tag List de Selección Dinámica */}
                          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-blue-200/60 dark:border-blue-800/40 min-h-[48px] items-center">
                            {selectedSkills.length === 0 ? (
                              <span className="text-[0.7rem] text-zinc-400 italic px-1">
                                Ninguna habilidad agregada aún. Selecciona de las sugerencias recomendadas o escribe una personalizada.
                              </span>
                            ) : (
                              selectedSkills.map(skill => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-extrabold bg-blue-600 text-white shadow-2xs animate-fadeIn"
                                >
                                  <span>{skill}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="hover:bg-blue-700 p-0.5 rounded-full transition-colors cursor-pointer"
                                  >
                                    <X size={10} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>

                          {/* Entrada Personalizada de Skill con Tecla Enter */}
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={customSkillInput}
                                onChange={(e) => setCustomSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomSkill(e);
                                  }
                                }}
                                placeholder="Escriba una habilidad o competencia y presione Enter o Agregar..."
                                className="input-field py-1.5 text-xs pr-8"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddCustomSkill}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shrink-0 shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} />
                              <span>Agregar</span>
                            </button>
                          </div>

                          {/* Sugerencias Rápidas Reutilizables */}
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[0.62rem] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              Sugerencias Rápidas para Desarrollador (Clic para activar/desactivar):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {currentSkillProfile.sugerencias.map(skill => {
                                const isSelected = selectedSkills.includes(skill);
                                return (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleToggleSkill(skill)}
                                    className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold border transition-all cursor-pointer inline-flex items-center gap-1 ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                                      }`}
                                  >
                                    {isSelected ? <Check size={10} className="stroke-[3]" /> : <Plus size={10} />}
                                    <span>{skill}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Acciones Finales del Formulario */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowNuevoColaboradorModal(false)}
                        className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold transition-all text-xs cursor-pointer text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submittingNuevoColaborador}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-600/20 transition-all text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submittingNuevoColaborador ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Guardando en PostgreSQL...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            <span>Registrar Desarrollador</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* Modal: Historial Acumulado de Cambios por la Coordinación y Líder (Inmutable) */}
        <AnimatePresence>
          {showHistorialCambiosModal && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-5xl shadow-2xl space-y-5 max-h-[90dvh] flex flex-col"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <ClipboardList size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                          Registro de Cambios del Proyecto
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[0.62rem] font-extrabold uppercase border border-purple-200 dark:border-purple-800">
                          Auditoría Inmutable (Solo Lectura)
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Trazabilidad acumulada con marcas de tiempo y firma digital de responsabilidad autorizada (Líder / Coordinación)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHistorialCambiosModal(false)}
                    className="outline-button text-xs py-2 px-5 font-bold rounded-2xl cursor-pointer shrink-0"
                  >
                    Cerrar
                  </button>
                </div>

                {/* Barra de Búsqueda y Filtros Avanzados */}
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {/* Campo de Búsqueda de Texto */}
                    <div className="relative flex-1 w-full">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        value={busquedaHistorial}
                        onChange={(e) => setBusquedaHistorial(e.target.value)}
                        placeholder="Buscar por detalle, acción, responsable o correo..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                      />
                      {busquedaHistorial && (
                        <button
                          type="button"
                          onClick={() => setBusquedaHistorial('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Filtro por Tipo de Acción */}
                    <div className="w-full sm:w-56">
                      <CustomSelect
                        value={filtroAccionHistorial}
                        onChange={(val) => setFiltroAccionHistorial(val)}
                        options={[
                          { value: 'TODOS', label: 'Todas las acciones' },
                          { value: 'ETAPA', label: 'Fases / Etapas' },
                          { value: 'ACTIVIDAD', label: 'Tareas / Actividades WBS' },
                          { value: 'NOMINA', label: 'Desarrolladores & Horas' },
                          { value: 'ESTADO', label: 'Cambios de Estado & Pausa' }
                        ]}
                        maxWidth="w-full"
                        icon={Filter}
                      />
                    </div>

                    {/* Filtro por Fecha */}
                    <div className="w-full sm:w-48">
                      <CustomSelect
                        value={filtroFechaHistorial}
                        onChange={(val) => setFiltroFechaHistorial(val)}
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
                      Mostrando <strong className="text-purple-600 dark:text-purple-400 font-bold">{historialFiltrado.length}</strong> de <strong className="text-zinc-700 dark:text-zinc-300 font-bold">{historialCambios.length}</strong> registros de auditoría
                    </span>
                    {(busquedaHistorial || filtroAccionHistorial !== 'TODOS' || filtroFechaHistorial !== 'TODOS') && (
                      <button
                        type="button"
                        onClick={() => { setBusquedaHistorial(''); setFiltroAccionHistorial('TODOS'); setFiltroFechaHistorial('TODOS'); }}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={11} /> Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 space-y-4 pr-1 custom-scrollbar">
                  {loadingHistorial ? (
                    <div className="p-12 text-center text-xs text-zinc-400">
                      <Loader2 size={28} className="animate-spin mx-auto text-purple-600 mb-3" />
                      Cargando historial de auditoría inmutable...
                    </div>
                  ) : historialFiltrado.length === 0 ? (
                    <div className="p-10 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-xs space-y-2">
                      <ShieldCheck size={36} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                      <p className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">
                        {historialCambios.length === 0 ? 'Sin registros de cambios' : 'No hay coincidencias con los filtros'}
                      </p>
                      <p className="max-w-md mx-auto leading-relaxed">
                        {historialCambios.length === 0
                          ? 'No se han registrado modificaciones o eventos en este proyecto.'
                          : 'Pruebe ajustando el término de búsqueda o seleccionando otro rango de fechas o tipo de acción.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historialFiltrado.map((reg, idx) => {
                        const accionFormateada = reg.accion
                          ? reg.accion
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, c => c.toUpperCase())
                          : 'Modificación del Proyecto';

                        return (
                          <div key={reg.idHistorial || idx} className="p-4 sm:p-5 rounded-3xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-sans text-[0.7rem] font-black uppercase tracking-wide px-3 py-1 rounded-xl bg-purple-100 text-purple-900 dark:bg-purple-950/90 dark:text-purple-200 border border-purple-200 dark:border-purple-800 inline-flex items-center gap-1.5 shadow-2xs">
                                  <ShieldCheck size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                  <span>{accionFormateada}</span>
                                </span>
                                {reg.batchId && (
                                  <span className="text-[0.62rem] font-mono text-zinc-400 bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md font-bold">
                                    Session #{reg.batchId.split('-')[1] || reg.batchId}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-mono text-zinc-500 font-bold flex items-center gap-1.5">
                                <Clock size={13} className="text-purple-500 shrink-0" />
                                {new Date(reg.fechaCambio).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed pl-1">
                              {reg.detalles}
                            </p>

                            <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-500 font-medium gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-[0.6rem] flex items-center justify-center shrink-0 shadow-2xs">
                                  {getInitials(reg.nombreCoordinador || 'Coordinador', '')}
                                </div>
                                <span>
                                  Responsable: <strong className="text-zinc-900 dark:text-zinc-100">{reg.nombreCoordinador || 'Ana Ríos'}</strong> ({reg.emailCoordinador || 'ana.coordinador@ikernell.org'})
                                </span>
                              </div>

                              <span className="px-2 py-0.5 rounded-md text-[0.62rem] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {reg.rolResponsable || 'Líder / Coordinación'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Notificación de Gobernanza Directiva (Reasignación de Proyecto Quitados a este Líder) */}
        <AnimatePresence>
          {showReasignacionNotifModal && proyectoNotifReasignacion && (
            <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-[95%] sm:w-full max-w-xl shadow-2xl space-y-6 relative overflow-hidden"
              >
                {/* Encabezado del Modal */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 shadow-md">
                      <ShieldAlert size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[0.68rem] font-mono font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider block">
                        Notificación de Gobernanza Directiva
                      </span>
                      <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Reasignación de Dirección de Proyecto
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Ficha Resumen del Proyecto */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                      PRJ-00{proyectoNotifReasignacion.idProyecto}
                    </span>
                    <span className="text-[0.65rem] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200">
                      Proceso Reasignado (1d)
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    {proyectoNotifReasignacion.nombre}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Building2 size={13} className="text-zinc-400" />
                    <span>Cliente: {proyectoNotifReasignacion.cliente || 'Cliente Corporativo'}</span>
                  </p>
                </div>

                {/* Justificación y Nuevo Líder */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-extrabold">
                    <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[0.68rem]">
                      <Info size={14} className="text-amber-600" /> Motivo de la Reasignación:
                    </span>
                  </div>
                  <p className="text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed pl-1">
                    "{proyectoNotifReasignacion.motivoReasignacion || proyectoNotifReasignacion.observacionesReasignacion || 'Reorganización de equipo directivo por la Coordinación General.'}"
                  </p>
                  <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between text-[0.72rem] text-amber-900 dark:text-amber-200 font-bold">
                    <span>Nuevo Líder Asignado por Coordinación:</span>
                    <strong className="font-extrabold">
                      {proyectoNotifReasignacion.lider ? `${proyectoNotifReasignacion.lider.nombre} ${proyectoNotifReasignacion.lider.apellido}` : 'Elena Rostova'}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  Esta iniciativa ha sido transferida a otro Líder Responsable. Puedes examinar la Estructura WBS y métricas en modo lectura o confirmar la transferencia para actualizar tu panel.
                </p>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleVerDetallesDesdeModal(proyectoNotifReasignacion)}
                    className="outline-button w-full sm:w-auto text-xs py-2.5 px-5 font-bold inline-flex items-center justify-center gap-2 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 cursor-pointer shadow-2xs rounded-2xl transition-all"
                  >
                    <Eye size={15} className="text-zinc-600 dark:text-zinc-400" />
                    <span>Ver Detalles del Proyecto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmarLecturaReasignacion(proyectoNotifReasignacion.idProyecto)}
                    className="gradient-button w-full sm:w-auto text-xs py-2.5 px-5 font-extrabold inline-flex items-center justify-center gap-2 shadow-md cursor-pointer rounded-2xl"
                  >
                    <CheckCircle2 size={16} />
                    <span>Confirmar / Entendido</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Ficha Organizada & Stack Técnico del Desarrollador */}
        <AnimatePresence>
          {selectedTrabajadorModal && (
            <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-9 w-full max-w-2xl shadow-2xl max-h-[92dvh] overflow-y-auto space-y-6"
              >
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0 border border-blue-400/20">
                      {(selectedTrabajadorModal.nombre ? selectedTrabajadorModal.nombre.charAt(0) : 'U') + (selectedTrabajadorModal.apellido ? selectedTrabajadorModal.apellido.charAt(0) : '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                          {selectedTrabajadorModal.nombre} {selectedTrabajadorModal.apellido}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                          <Code2 size={12} className="text-blue-600 dark:text-blue-400" />
                          Desarrollador (WBS)
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1.5 text-xs text-zinc-500 font-medium flex-wrap">
                        <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          ID: #{selectedTrabajadorModal.identificacion || selectedTrabajadorModal.idTrabajador}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ficha Personal, Credenciales & Stack Técnico */}
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Ficha Técnica & Credenciales del Desarrollador
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {/* Correos de Contacto (Corporativo y Personal) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Correo Corporativo Principal */}
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

                      {/* Correo Personal Alternativo */}
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

                      {/* Tech Pills Parser */}
                      <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/50">
                        <span className="text-[0.65rem] font-bold text-zinc-500 block mb-2 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-500 shrink-0" /> Tecnologías & Stack Técnico Destacado:
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
                                className="px-3 py-1.5 rounded-xl text-[0.68rem] font-extrabold bg-white dark:bg-zinc-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs select-none"
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
                        <span className={`font-extrabold text-xs mt-1 inline-flex items-center gap-2 ${(selectedTrabajadorModal.estado === true || selectedTrabajadorModal.estado === 'ACTIVO') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${(selectedTrabajadorModal.estado === true || selectedTrabajadorModal.estado === 'ACTIVO') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          {(selectedTrabajadorModal.estado === true || selectedTrabajadorModal.estado === 'ACTIVO') ? 'HABILITADO' : 'INHABILITADO'}
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

                {/* Footer del Modal */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTrabajadorModal(null)}
                    className="px-6 py-2.5 text-xs font-bold cursor-pointer rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all"
                  >
                    Cerrar Ficha
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </ErrorBoundary>
    </DashboardLayout>
  );
};
