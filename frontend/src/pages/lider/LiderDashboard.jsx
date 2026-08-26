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
  Info, HelpCircle, FileText, Edit3, Filter, ShieldAlert, Check, Globe, FolderGit2, Building2,
  FolderPlus, DollarSign, CircleDollarSign, CalendarClock, AlignLeft, Lock, Search, Eye, EyeOff,
  ArrowRight, ArrowLeft, Users, UserX, Code2, GraduationCap, BadgeCheck, Shield, Pause, Play, ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonMetricCard } from '../../components/ui/Skeleton';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { CustomSelect } from '../../components/ui/CustomSelect';
import jsPDF from 'jspdf';

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
 * Selector de Desarrolladores de Nivel Enterprise con Buscador e Indicadores de Carga Horaria (HU-12)
 */
const DeveloperCombobox = ({ value, onChange, desarrolladores, getDevCargaInfo, getCleanEspecialidad, placeholder = "— Seleccione un desarrollador —", required = false, error = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedDev = useMemo(() => {
    if (!value) return null;
    return desarrolladores?.find(d => String(d.idTrabajador) === String(value));
  }, [value, desarrolladores]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDevs = useMemo(() => {
    if (!searchTerm.trim()) return desarrolladores || [];
    const term = searchTerm.toLowerCase();
    return (desarrolladores || []).filter(dev => {
      const nombreCompleto = `${dev.nombre || ''} ${dev.apellido || ''}`.toLowerCase();
      const esp = (dev.especialidad || dev.profesion || '').toLowerCase();
      return nombreCompleto.includes(term) || esp.includes(term);
    });
  }, [desarrolladores, searchTerm]);

  const selectedCarga = selectedDev ? getDevCargaInfo(selectedDev.idTrabajador) : null;

  return (
    <div ref={containerRef} className="w-full space-y-2">
      {/* Botón Trigger Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border text-xs font-semibold shadow-2xs transition-all cursor-pointer text-left ${
          error 
            ? 'border-red-400 dark:border-red-600 ring-2 ring-red-500/10' 
            : isOpen 
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
                {getCleanEspecialidad(selectedDev.especialidad, selectedDev.profesion)}
              </span>
            </div>
            {selectedCarga && (
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border shrink-0 ${
                selectedCarga.horasAsignadas >= 48
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                  : selectedCarga.horasAsignadas >= 36
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              }`}>
                {selectedCarga.horasAsignadas}/48h
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-zinc-400 font-medium text-xs">
            <UserCheck size={18} className="text-blue-500 shrink-0" />
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
          <span className="text-[0.68rem] font-bold text-blue-600 dark:text-blue-400">
            {isOpen ? 'Ocultar lista' : 'Desplegar lista'}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
        </div>
      </button>

      {/* Panel Desplegable Integrado Inline (Cero Recorte de Pantalla) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-3 space-y-3 shadow-inner"
          >
            {/* Buscador Rápido Interno */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por nombre, apellido o especialidad técnica..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Lista Amplia y Desplegada de Tarjetas de Desarrolladores */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {filteredDevs.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400 font-medium bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                  No se encontraron desarrolladores coincidentes con la búsqueda.
                </div>
              ) : (
                filteredDevs.map(dev => {
                  const isSelected = String(dev.idTrabajador) === String(value);
                  const carga = getDevCargaInfo(dev.idTrabajador);
                  const horas = carga?.horasAsignadas || 0;
                  const pct = Math.min(Math.round((horas / 48) * 100), 100);

                  const estColor = horas >= 48
                    ? { bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800', bar: 'bg-red-500', label: 'SATURADO' }
                    : horas >= 36
                    ? { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', bar: 'bg-amber-500', label: 'ALTA CARGA' }
                    : { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', bar: 'bg-emerald-500', label: 'DISPONIBLE' };

                  return (
                    <div
                      key={dev.idTrabajador}
                      onClick={() => {
                        onChange(String(dev.idTrabajador));
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-blue-50/40 dark:hover:bg-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {dev.nombre?.[0]}{dev.apellido?.[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {dev.nombre} {dev.apellido}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[0.62rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white">
                                <Check size={12} /> SELECCIONADO
                              </span>
                            )}
                          </div>
                          <span className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 block truncate font-medium mt-0.5">
                            {getCleanEspecialidad(dev.especialidad, dev.profesion)}
                          </span>
                        </div>
                      </div>

                      {/* Capacidad Horaria Visual Amplia */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                        <span className={`px-2.5 py-1 rounded-xl text-[0.65rem] font-black border ${estColor.bg}`}>
                          {horas}/48h • {estColor.label}
                        </span>
                        <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full ${estColor.bar} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
    incluirIncidencias: true,
    modoSensible: true
  });

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

  // Registro de Nuevo Colaborador por el Líder (solo LÍDER o DESARROLLADOR)
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
      return { valid: false, message: `La cédula / documento (${raw}) ya está registrado en PostgreSQL.` };
    }

    return paisActual.validate(raw);
  }, [nuevoColaboradorForm.identificacion, paisActual, desarrolladores]);

  const emailValidationResult = useMemo(() => {
    const raw = (nuevoColaboradorForm.email || '').trim().toLowerCase();
    if (!raw) return { valid: false, message: 'El correo electrónico es obligatorio.' };
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rfcRegex.test(raw)) return { valid: false, message: 'Formato de correo electrónico corporativo no válido.' };
    return { valid: true, message: 'Correo Corporativo Válido' };
  }, [nuevoColaboradorForm.email]);

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

  // Estados y Filtros memorizados para la pestaña "Nómina & Personal"
  const [searchQueryPersonal, setSearchQueryPersonal] = useState('');
  const [rolFiltroPersonal, setRolFiltroPersonal] = useState('TODOS');
  const [estadoFiltroPersonal, setEstadoFiltroPersonal] = useState('TODOS');

  const personalFiltrado = useMemo(() => {
    if (!Array.isArray(desarrolladores)) return [];
    return desarrolladores.filter(t => {
      // Filtro de Rol
      if (rolFiltroPersonal !== 'TODOS') {
        const r = t.rol ? String(t.rol).toUpperCase() : '';
        if (rolFiltroPersonal === 'DESARROLLADOR' && !r.includes('DESARROLLADOR')) return false;
        if (rolFiltroPersonal === 'LIDER' && !r.includes('LIDER')) return false;
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
  }, [desarrolladores, rolFiltroPersonal, estadoFiltroPersonal, searchQueryPersonal]);

  // Filtro de Propiedad de Proyectos (Mis Proyectos vs Otros Líderes vs Todos)
  const [filtroPropiedadLider, setFiltroPropiedadLider] = useState('MIS_PROYECTOS');

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

  const [showAtenderModal, setShowAtenderModal] = useState(false);
  const [showDetalleIncidenciaModal, setShowDetalleIncidenciaModal] = useState(false);
  const [incidenciaVerDetalle, setIncidenciaVerDetalle] = useState(null);

  // Auditoría acumulada de cambios directivos realizados por la Coordinación
  const [showHistorialCambiosModal, setShowHistorialCambiosModal] = useState(false);
  const [historialCambios, setHistorialCambios] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [unreadHistorialCount, setUnreadHistorialCount] = useState(0);

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
      toast.info('Seleccione un proyecto específico para consultar los cambios de coordinación.');
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

  const [nuevaActividad, setNuevaActividad] = useState({
    idEtapa: '',
    idDesarrollador: '',
    descripcion: ''
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

  // Confirmación de lectura de reasignación por parte del líder anterior
  const handleConfirmarLecturaReasignacion = async (idProyecto) => {
    try {
      await api.put(`/coordinador/proyectos/${idProyecto}/confirmar-lectura-reasignacion`);
      toast.success('Notificación de reasignación confirmada. El proyecto ya no aparecerá en tu panel individual.');
      const res = await api.get('/lider/proyectos');
      setProyectos(res.data);
    } catch (err) {
      console.error('Error al confirmar lectura:', err);
      toast.error('Error al confirmar la lectura.');
    }
  };

  // Filtrado reactivo para la grilla del catálogo de proyectos con segregación por propiedad de Líder
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

      // 2. Búsqueda por Texto
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
  }, [proyectos, busquedaCatalogoProyecto, filtroPropiedadLider, user]);

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

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmittingActividad(true);
      await api.post('/lider/actividades', {
        idEtapa: parseInt(nuevaActividad.idEtapa),
        idDesarrollador: parseInt(nuevaActividad.idDesarrollador),
        descripcion: nuevaActividad.descripcion.trim()
      });

      toast.success('Actividad asignada y guardada en PostgreSQL correctamente.');
      setShowAsignarModal(false);
      setNuevaActividad({ idEtapa: '', idDesarrollador: '', descripcion: '' });
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
    const asignacionActual = desarrolladoresAsignadosProyecto.find(a => Number(a.desarrollador?.idTrabajador) === Number(idDev));
    const horasActualesEnEsteProyecto = asignacionActual?.horasSemanales || 0;
    const horasEnOtrosProyectos = (devCarga?.horasAsignadas || 0) - horasActualesEnEsteProyecto;
    const totalProyectado = horasEnOtrosProyectos + valHoras;

    if (totalProyectado > 48) {
      toast.error(`Sobreasignación: ${devNombre} ya tiene ${horasEnOtrosProyectos}h en otros proyectos. Ajustar a ${valHoras}h sumaría ${totalProyectado}h (máximo legal: 48h).`);
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

    // Validación para proyectos vacíos sin estructura WBS
    if (evidenciaWbsFinalizacion.esProyectoVacio) {
      if (!justificacionCancelacion || justificacionCancelacion.trim().length < 10) {
        setCancelacionError('Debe ingresar un motivo o justificación detallada de al menos 10 caracteres explicando la causa del cierre sin ejecución.');
        toast.error('Justificación obligatoria para cerrar proyectos sin estructura WBS.');
        return;
      }
    }

    try {
      setSubmittingFinalizar(true);
      const payload = evidenciaWbsFinalizacion.esProyectoVacio ? {
        motivoCancelacion,
        justificacionCancelacion: justificacionCancelacion.trim()
      } : {};

      const res = await api.patch(`/lider/proyectos/${proyectoSeleccionado.idProyecto}/finalizar`, payload);
      
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
        ...(res || {}),
        estado: 'FINALIZADO'
      };
      setProyectoSeleccionado(proyectoActualizado);

      await cargarProyectos();
      await seleccionarProyecto(proyectoActualizado);
    } catch (err) {
      console.error('Error al finalizar el proyecto:', err);
      toast.error(err.message || 'Error al finalizar el proyecto.');
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

    if (!emailValidationResult.valid) {
      toast.error(emailValidationResult.message);
      setFormErrorsColaborador(p => ({ ...p, email: emailValidationResult.message }));
      return;
    }

    if (!pwdValidity.isValid) {
      toast.error('La contraseña inicial no cumple con los requisitos mínimos de seguridad.');
      setFormErrorsColaborador(p => ({ ...p, passwordHash: 'Mínimo 8-20 caracteres con 1 mayúscula, 1 minúscula y 1 número.' }));
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
      toast.error(err?.message || 'Error al guardar el nuevo colaborador.');
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

  // Generador de Reporte PDF del Proyecto
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

      const primaryColor = [37, 99, 235]; // #2563eb
      const darkColor = [24, 24, 27];     // #18181b
      const lightBg = [248, 250, 252];    // #f8fafc

      // 1. Banner Superior
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('IKERNELL ENTERPRISE ARCHITECTURE', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`REPORTE DE INGENIERÍA Y PROYECTO DE SOFTWARE | FECHA: ${new Date().toLocaleDateString('es-ES')}`, 14, 18);

      // 2. Título de Proyecto
      doc.setTextColor(...darkColor);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(`Proyecto: ${proyectoSeleccionado.nombre}`, 14, 34);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Código: PRJ-00${proyectoSeleccionado.idProyecto} | Estado: ${proyectoSeleccionado.estado || 'ACTIVO'} | Cliente: ${proyectoSeleccionado.cliente || 'Interno'}`, 14, 40);

      let yPos = 48;

      // 3. Tarjeta Resumen Operativo
      doc.setFillColor(...lightBg);
      doc.roundedRect(14, yPos, 182, pdfConfig.modoSensible ? 28 : 22, 3, 3, 'F');
      
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('RESUMEN Y DIMENSIÓN OPERATIVA', 18, yPos + 7);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkColor);
      doc.text(`• Fecha de Inicio: ${formatearFechaHumana(proyectoSeleccionado.fechaInicio)}`, 18, yPos + 13);
      doc.text(`• Entrega Estimada: ${formatearFechaHumana(proyectoSeleccionado.fechaFinEstimada)}`, 105, yPos + 13);
      doc.text(`• Líder a Cargo: ${proyectoSeleccionado.lider ? `${proyectoSeleccionado.lider.nombre} ${proyectoSeleccionado.lider.apellido}` : 'Carlos Mendoza'}`, 18, yPos + 18);
      doc.text(`• Duración Proyectada: ${calcularDuracionProyecto(proyectoSeleccionado.fechaInicio, proyectoSeleccionado.fechaFinEstimada)}`, 105, yPos + 18);

      if (pdfConfig.modoSensible) {
        const presForm = proyectoSeleccionado.presupuesto ? Number(proyectoSeleccionado.presupuesto).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
        doc.setFont('helvetica', 'bold');
        doc.text(`• Presupuesto Financiero Reservado (Confidencial): US$ ${presForm}`, 18, yPos + 24);
      }

      yPos += pdfConfig.modoSensible ? 36 : 30;

      // Alcance del proyecto
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

      // 4. Sección WBS
      if (pdfConfig.incluirWbs && etapas && etapas.length > 0) {
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('1. Estructura de Desglose de Trabajo (Fases WBS & Actividades)', 14, yPos);
        yPos += 6;

        etapas.forEach((etapa, index) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFillColor(240, 244, 255);
          doc.rect(14, yPos, 182, 7, 'F');
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...darkColor);
          doc.text(`Fase ${index + 1}: ${etapa.nombreEtapa} [Estado: ${etapa.estado || 'PENDIENTE'}]`, 16, yPos + 5);
          yPos += 9;

          if (etapa.actividades && etapa.actividades.length > 0) {
            etapa.actividades.forEach(act => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }

              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 41, 59);
              doc.text(`• ${act.nombreActividad}`, 18, yPos);
              
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(100, 116, 139);
              const devName = act.desarrollador ? `${act.desarrollador.nombre} ${act.desarrollador.apellido}` : 'Sin asignar';
              doc.text(`[${act.estado || 'PENDIENTE'}] - Asignado a: ${devName} (${act.horasEstimadas || 0}h estimadas)`, 18, yPos + 4);
              yPos += 8;
            });
          } else {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('  Sin actividades registradas en esta fase.', 18, yPos);
            yPos += 6;
          }
          yPos += 3;
        });
      }

      // 5. Sección Desarrolladores
      if (pdfConfig.incluirEquipo && desarrolladoresAsignadosProyecto && desarrolladoresAsignadosProyecto.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('2. Nómina de Desarrolladores y Capacidad Asignada (HU-12)', 14, yPos);
        yPos += 6;

        desarrolladoresAsignadosProyecto.forEach(dev => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

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
              <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-xl border shrink-0 ${
                getEstadoBadgeClasses(proyectoSeleccionado.estado).badge
              }`}>
                <span className={`w-2 h-2 rounded-full ${getEstadoBadgeClasses(proyectoSeleccionado.estado).dot}`} />
                <span>{proyectoSeleccionado.estado || 'ACTIVO'}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0 min-w-0 max-w-full">
          {/* Botón Trigger para Menú Emergente / Selector de Proyectos Enterprise */}
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
              ) : (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL') ? (
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Globe size={14} />
                  </div>
                  <div className="text-left truncate">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block truncate">
                      [Vista Global Corporativa]
                    </span>
                    <span className="text-[0.65rem] text-zinc-400 font-medium block truncate">
                      Todos los proyectos ({proyectos?.length || 0})
                    </span>
                  </div>
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

          {/* Botón Destacado: Ver Todos los Proyectos / Vista Global Corporativa */}
          <button
            type="button"
            onClick={() => seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' })}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer border ${
              proyectoSeleccionado?.idProyecto === 'GLOBAL'
                ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title="Ver el portafolio completo y métricas consolidadas de todos los proyectos de la compañía"
          >
            <Globe size={14} className={proyectoSeleccionado?.idProyecto === 'GLOBAL' ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-zinc-500'} />
            <span className="hidden md:inline">
              {proyectoSeleccionado?.idProyecto === 'GLOBAL' ? 'Vista Global Activa' : 'Ver Todos los Proyectos'}
            </span>
          </button>

          <button
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
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Crear un nuevo proyecto de software con presupuesto y fechas (HU-11)"
          >
            <FolderPlus size={14} />
            <span>Nuevo Proyecto</span>
          </button>

          {/* Botón: Nuevo Colaborador (Líder o Desarrollador) */}
          <button
            type="button"
            onClick={() => {
              setNuevoColaboradorForm({
                nombre: '',
                apellido: '',
                identificacion: '',
                email: '',
                rol: 'ROLE_DESARROLLADOR',
                passwordHash: '',
                profesion: 'Ingeniero de Software',
                especialidad: 'Full Stack Web & Cloud'
              });
              setShowNuevoColaboradorModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Registrar un nuevo colaborador (Líder o Desarrollador) en la plataforma"
          >
            <UserPlus size={14} />
            <span>Nuevo Colaborador</span>
          </button>

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

      {/* Notificaciones Especiales de Reasignación (Vigencia 1d para Líder Anterior / 3d para Nuevo Líder) */}
      {proyectoSeleccionado && proyectoSeleccionado.idProyecto !== 'GLOBAL' && proyectoSeleccionado.reasignado && (() => {
        const userDevId = user?.idTrabajador || user?.id;
        const isPastLiderPending = !proyectoSeleccionado.leidoPorLiderAnterior
          && userDevId
          && String(proyectoSeleccionado.idLiderAnterior) === String(userDevId)
          && getHoursSinceReassignment(proyectoSeleccionado.fechaReasignacion) <= 24;

        const isNewReassignment = getHoursSinceReassignment(proyectoSeleccionado.fechaReasignacion) <= 72;

        if (isPastLiderPending) {
          return (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-700 p-5 rounded-3xl shadow-md space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs font-mono uppercase tracking-wider">
                  <AlertTriangle size={18} className="text-amber-600 animate-pulse shrink-0" />
                  <span>NOTIFICACIÓN DIRECTIVA: PROCESO REASIGNADO A OTRO LÍDER</span>
                </div>
                <span className="text-[0.62rem] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  Disponible por 1 Día Hábil (24h)
                </span>
              </div>

              <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                La dirección técnica y administrativa de este proyecto fue transferida por la Coordinación General a{' '}
                <strong>{proyectoSeleccionado.lider ? `${proyectoSeleccionado.lider.nombre} ${proyectoSeleccionado.lider.apellido}` : 'Nuevo Líder'}</strong>.
              </p>

              <div className="p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-amber-200 dark:border-amber-800 text-xs">
                <span className="font-mono font-extrabold text-amber-800 dark:text-amber-300 uppercase text-[0.62rem] block mb-0.5">Motivo / Justificación Registrada:</span>
                <p className="text-zinc-800 dark:text-zinc-200 font-semibold">{proyectoSeleccionado.motivoReasignacion || 'Reorganización de portafolio.'}</p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleConfirmarLecturaReasignacion(proyectoSeleccionado.idProyecto)}
                  className="gradient-button text-xs py-2.5 px-5 font-extrabold inline-flex items-center gap-2 rounded-2xl cursor-pointer shadow-md"
                >
                  <CheckCircle2 size={15} />
                  <span>Entendido / Confirmar Lectura</span>
                </button>
              </div>
            </motion.div>
          );
        }

        if (isNewReassignment) {
          return (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-blue-50 dark:bg-blue-950/70 border-2 border-blue-300 dark:border-blue-700 p-5 rounded-3xl shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-extrabold text-xs font-mono uppercase tracking-wider">
                  <Sparkles size={18} className="text-amber-500 animate-pulse shrink-0" />
                  <span>NUEVO PROYECTO REASIGNADO A TU PORTAFOLIO</span>
                </div>
                <span className="text-[0.62rem] font-bold font-mono px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                  Notificación Activa (Válida por 3 Días)
                </span>
              </div>

              <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                Te ha sido asignada la dirección ejecutiva y supervisión CMMI de este proyecto por parte de la Coordinación General.
              </p>

              <div className="p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-blue-200 dark:border-blue-800 text-xs">
                <span className="font-mono font-extrabold text-blue-800 dark:text-blue-300 uppercase text-[0.62rem] block mb-0.5">Motivo / Justificación Registrada:</span>
                <p className="text-zinc-800 dark:text-zinc-200 font-semibold">{proyectoSeleccionado.motivoReasignacion || 'Asignación de liderazgo de proyecto.'}</p>
              </div>
            </motion.div>
          );
        }

        return null;
      })()}

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
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4 min-w-0"
          >
            {/* Banner de Proyecto Reasignado por Coordinación */}
            {proyectoSeleccionado?.reasignado && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-black flex items-center justify-between shadow-md animate-pulse">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-300 shrink-0" />
                  <span>PROYECTO NUEVO ASIGNADO / REASIGNADO POR COORDINACIÓN CORPORATIVA</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-[0.65rem] uppercase tracking-wider font-mono">
                  Asignación Reciente
                </span>
              </div>
            )}

            {/* Banner de Modo Lectura Exclusivo para Proyectos de Otros Líderes */}
            {!isMiProyecto && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                <Lock size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Modo Lectura Exclusivo: Este proyecto es supervisado por {proyectoSeleccionado.lider ? `${proyectoSeleccionado.lider.nombre} ${proyectoSeleccionado.lider.apellido}` : 'otro Líder'}. Solo su Líder responsable posee permisos de edición y gestión.</span>
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-extrabold tracking-wide uppercase border shrink-0 ${
                      proyectoSeleccionado?.estado === 'FINALIZADO' || proyectoSeleccionado?.estado === 'COMPLETADO'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800' :
                      proyectoSeleccionado?.estado === 'PAUSADO'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse' :
                      proyectoSeleccionado?.estado === 'INHABILITADO'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800'
                    }`}>
                      {proyectoSeleccionado?.estado === 'PAUSADO' ? '⏸️ PROYECTO EN PAUSA' :
                       proyectoSeleccionado?.estado === 'INHABILITADO' ? '🚫 INHABILITADO' :
                       isProyectoFinalizado ? '✅ FINALIZADO (Solo Lectura)' : (proyectoSeleccionado?.estado || 'ACTIVO')}
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

                {/* Botón: Cambios de Coordinación (Auditoría Directiva con Contador de Novedades) */}
                <button
                  type="button"
                  onClick={() => handleAbrirHistorialCambiosLider(proyectoSeleccionado.idProyecto)}
                  className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer shadow-2xs transition-all"
                  title="Ver el historial acumulado de modificaciones registradas por la Coordinación General"
                >
                  <ClipboardList size={14} className="text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Cambios de Coordinación</span>
                  {unreadHistorialCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-extrabold text-[0.62rem] animate-pulse shadow-xs">
                      {unreadHistorialCount} nuevo{unreadHistorialCount > 1 ? 's' : ''}
                    </span>
                  )}
                </button>

                {/* Botón: Generar Reporte PDF (Disponible para todos) */}
                <button
                  type="button"
                  onClick={() => setShowGenerarReportePdfModal(true)}
                  className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer shadow-2xs"
                  title="Generar e imprimir reporte técnico/ejecutivo del proyecto en formato PDF"
                >
                  <FileText size={13} className="text-blue-600 dark:text-blue-400" />
                  <span>Generar Reporte PDF</span>
                </button>

                {/* Acción Exclusiva del Líder Directivo: Pausar o Reactivar Proyecto */}
                {isMiProyecto && !isProyectoFinalizado && (
                  proyectoSeleccionado?.estado === 'EN_PAUSA' || proyectoSeleccionado?.estado === 'PAUSADO' ? (
                    <button
                      type="button"
                      onClick={handleReactivarProyecto}
                      disabled={submittingPausa}
                      className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/40 cursor-pointer shadow-2xs"
                      title="Reactivar la ejecución del proyecto y reanudar actividades WBS"
                    >
                      {submittingPausa ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="text-emerald-600 fill-emerald-600" />}
                      <span>Reactivar Proyecto</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePausarProyecto}
                      disabled={submittingPausa}
                      className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 bg-amber-50/60 hover:bg-amber-100 dark:bg-amber-950/40 cursor-pointer shadow-2xs"
                      title="Pausar temporalmente el proyecto y detener el avance de actividades"
                    >
                      {submittingPausa ? <Loader2 size={13} className="animate-spin" /> : <Pause size={13} className="text-amber-600 fill-amber-600" />}
                      <span>Pausar Proyecto</span>
                    </button>
                  )
                )}

                {/* Acciones Exclusivas de la Coordinación General (Edición Directiva de Parámetros) */}
                {user?.rol === 'ROLE_COORDINADOR' && (
                  <>
                    <button
                      type="button"
                      onClick={handleAbrirEditarProyecto}
                      className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
                      title="Editar nombre, presupuesto, cliente, fechas y cambiar estado operativo"
                    >
                      <Edit3 size={13} className="text-zinc-600 dark:text-zinc-400" />
                      <span>Editar Proyecto</span>
                    </button>

                    {!isProyectoFinalizado && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmFinalizar(true)}
                        className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer shadow-2xs"
                        title="Cerrar formalmente el ciclo de vida del proyecto"
                      >
                        <CheckCircle2 size={13} className="text-red-500" />
                        <span>Finalizar Proyecto</span>
                      </button>
                    )}
                  </>
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
              {/* Catálogo Corporativo de Selección Directa de Proyectos */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <FolderGit2 size={18} className="text-blue-600 dark:text-blue-400" />
                    Catálogo Corporativo de Proyectos
                    <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                      {proyectos?.length || 0} proyectos en sistema
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    Haga clic en cualquiera de las tarjetas a continuación para ingresar al desglose WBS y supervisar sus métricas.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={busquedaCatalogoProyecto}
                      onChange={(e) => setBusquedaCatalogoProyecto(e.target.value)}
                      placeholder="Buscar por nombre o cliente..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-medium"
                    />
                    {busquedaCatalogoProyecto && (
                      <button
                        type="button"
                        onClick={() => setBusquedaCatalogoProyecto('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <button
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
                    className="gradient-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    <FolderPlus size={14} />
                    <span>Nuevo Proyecto</span>
                  </button>
                </div>
              </div>

              {/* Selector Destacado de Filtro: Mis Proyectos vs Otros Líderes vs Todos */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.68rem] font-extrabold uppercase text-zinc-400 font-mono tracking-wider mr-1">
                    Visualizar:
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiltroPropiedadLider('MIS_PROYECTOS')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 border ${
                      filtroPropiedadLider === 'MIS_PROYECTOS'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <Briefcase size={14} />
                    <span>Mis Proyectos Asignados</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroPropiedadLider('OTROS_LIDERES')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 border ${
                      filtroPropiedadLider === 'OTROS_LIDERES'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <Globe size={14} />
                    <span>Otros Proyectos (Vista Global - Solo Lectura)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroPropiedadLider('TODOS')}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                      filtroPropiedadLider === 'TODOS'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>Todos ({proyectos?.length || 0})</span>
                  </button>
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

                    return (
                      <div
                        key={p.idProyecto}
                        onClick={() => seleccionarProyecto(p)}
                        className="group bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
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
                            <span>Gestionar WBS</span>
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
                {etapas.map((etapa, i) => (
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
                        <span className={`text-[0.65rem] font-extrabold px-3 py-1 rounded-full border ${
                          etapa?.estado === 'FINALIZADA' || etapa?.estado === 'COMPLETADA'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
                          etapa?.estado === 'EN_PROGRESO' || etapa?.estado === 'EN_CURSO'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        }`}>
                          {etapa?.estado || 'PENDIENTE'}
                        </span>

                        {isMiProyecto && !isProyectoFinalizado && (
                          <button
                            type="button"
                            onClick={() => handleAbrirEditarEtapa(etapa)}
                            className="p-1.5 px-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 transition-all cursor-pointer inline-flex items-center gap-1 text-[0.68rem] font-extrabold shadow-2xs"
                            title="Editar nombre y estado operativo de esta etapa WBS"
                          >
                            <Edit3 size={13} className="text-blue-600 dark:text-blue-400" />
                            <span>Editar Etapa</span>
                          </button>
                        )}
                      </div>
                    </div>

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
                              <span className={`text-[0.65rem] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                                act.estado === 'FINALIZADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' :
                                act.estado === 'EN_PROGRESO' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' :
                                'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                              }`}>
                                {act.estado}
                              </span>

                              {/* Botón Reasignar Actividad (HU-25: Solo permitido para el Líder propietario y en tareas en progreso o pendientes) */}
                              {isMiProyecto && proyectoSeleccionado?.estado !== 'FINALIZADO' && proyectoSeleccionado?.estado !== 'COMPLETADO' && (
                                (act.estado === 'FINALIZADA' || act.estado === 'COMPLETADA') ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="outline-button text-[0.7rem] py-1 px-2.5 font-bold inline-flex items-center gap-1 opacity-50 cursor-not-allowed text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800"
                                    title="Las tareas finalizadas no pueden ser reasignadas por motivos de auditoría."
                                  >
                                    <RotateCcw size={12} /> Reasignar
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAbrirReasignar(act)}
                                    className="outline-button text-[0.7rem] py-1 px-2.5 font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    title="Transferir esta tarea a otro desarrollador con justificación histórica (HU-25)"
                                  >
                                    <RotateCcw size={12} /> Reasignar
                                  </button>
                                )
                              )}
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
                ))}
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
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                Administración de Talento Humano & Accesos
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <Users size={22} className="text-emerald-600 dark:text-emerald-400" />
                Nómina & Personal Corporativo
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs mt-1">
                Visualización y alta de Líderes de Proyecto y Desarrolladores de Software en la plataforma
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
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
                setShowNuevoColaboradorModal(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
              title="Dar de alta un nuevo Líder de Proyecto o Desarrollador de Software"
            >
              <UserPlus size={16} />
              <span>Registrar Nuevo Colaborador</span>
            </button>
          </motion.div>

          {/* Barra de Filtros & Búsqueda Avanzada */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Buscador */}
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQueryPersonal}
                  onChange={(e) => setSearchQueryPersonal(e.target.value)}
                  placeholder="Buscar por nombre, cédula, correo o stack..."
                  className="input-field py-2 pl-9 pr-8 text-xs w-full"
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

              {/* Filtros Rápido de Rol */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <span className="text-[0.68rem] font-bold text-zinc-400 uppercase mr-1 hidden sm:inline">Rol:</span>
                {[
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'DESARROLLADOR', label: 'Desarrolladores' },
                  { id: 'LIDER', label: 'Líderes' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRolFiltroPersonal(r.id)}
                    className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                      rolFiltroPersonal === r.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Filtro de Estado */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-[0.68rem] font-bold text-zinc-400 uppercase mr-1 hidden sm:inline">Estado:</span>
                {[
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'ACTIVO', label: 'Habilitados' },
                  { id: 'INHABILITADO', label: 'Inhabilitados' }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setEstadoFiltroPersonal(st.id)}
                    className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                      estadoFiltroPersonal === st.id
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
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

                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <p className="font-bold text-zinc-800 dark:text-zinc-200">
                                {t.profesion || 'Ingeniero de Software'}
                              </p>
                              {t.especialidad && (
                                <p className="text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {t.especialidad}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {isLider ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                                <Briefcase size={12} className="text-amber-600 dark:text-amber-400" />
                                Líder de Proyecto
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                                <Code2 size={12} className="text-emerald-600 dark:text-emerald-400" />
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
              className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                filtroTipoInc === 'TODOS' && filtroEstadoInc === 'TODOS' && filtroSeveridadInc === 'TODAS'
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
              className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                filtroTipoInc === 'ERRORES' && filtroSeveridadInc === 'TODAS'
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
              className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                filtroTipoInc === 'INTERRUPCIONES'
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
              className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-sm h-full flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                filtroEstadoInc === 'SOLUCIONADO'
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
                className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                  filtroTipoInc === 'TODOS'
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
                className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  filtroTipoInc === 'ERRORES'
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
                className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  filtroTipoInc === 'INTERRUPCIONES'
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
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isError ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
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
                              className={`text-[0.62rem] font-extrabold uppercase px-2 py-0.5 rounded-md border font-mono inline-block ${
                                item.severidad === 'CRITICA' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800' :
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

      {/* Modal: Asignar Actividad a Desarrollador (RF-17) */}
      <AnimatePresence>
        {showAsignarModal && (
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
                  <UserCheck size={20} /> Asignar Tarea a Desarrollador
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[0.7rem] text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 flex items-start gap-2">
                <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Nota Informativa:</strong> La actividad se creará en estado <strong>PENDIENTE</strong> y se vinculará directamente a la cuenta del desarrollador en PostgreSQL, apareciendo de inmediato en su tablero de trabajo.
                </div>
              </div>

              <form onSubmit={handleAsignarActividad} className="space-y-4 text-xs" noValidate>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Etapa / Fase WBS *</label>
                  <CustomSelect
                    value={nuevaActividad.idEtapa}
                    onChange={(val) => { setNuevaActividad({ ...nuevaActividad, idEtapa: val }); setFormErrors(p => ({ ...p, idEtapa: undefined })); }}
                    options={[
                      { value: '', label: '— Seleccione una etapa —' },
                      ...(etapas || []).map(et => ({ value: et?.idEtapa, label: et?.nombreEtapa }))
                    ]}
                    maxWidth="w-full"
                  />
                  {formErrors.idEtapa && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.idEtapa}</p>}
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Desarrollador Responsable *</label>
                  <DeveloperCombobox
                    value={nuevaActividad.idDesarrollador}
                    onChange={(idDev) => {
                      setNuevaActividad({ ...nuevaActividad, idDesarrollador: idDev });
                      setFormErrors(p => ({ ...p, idDesarrollador: undefined }));
                    }}
                    desarrolladores={desarrolladores}
                    getDevCargaInfo={getDevCargaInfo}
                    getCleanEspecialidad={getCleanEspecialidad}
                    placeholder="— Seleccione un desarrollador responsable —"
                    error={!!formErrors.idDesarrollador}
                  />
                  {formErrors.idDesarrollador && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.idDesarrollador}</p>}

                  {nuevaActividad.idDesarrollador && (() => {
                    const c = getDevCargaInfo(nuevaActividad.idDesarrollador);
                    if (!c) return null;
                    return (
                      <div className="mt-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                        <span className="text-[0.7rem] font-bold text-zinc-700 dark:text-zinc-300">
                          Balance de Carga Semanal:
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${
                          c.horasAsignadas >= 48 
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                            : c.horasAsignadas >= 36
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        }`}>
                          Carga: {c.horasAsignadas}/48h ({c.horasDisponibles}h disponibles)
                        </span>
                      </div>
                    );
                  })()}
                </div>

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
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => { setShowAsignarModal(false); setFormErrors({}); }}
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
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-xl sm:max-w-2xl shadow-2xl max-h-[90dvh] overflow-y-auto space-y-4"
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
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${
                          carga.horasAsignadas >= 48 
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
                    onClick={() => { setShowAsignarDevModal(false); setAsignarDevError(null); }}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Nómina del Equipo Asignado al Proyecto con Liberación de Horas (HU-12 / RF-16) */}
      <AnimatePresence>
        {showNominaDevsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-3xl shadow-2xl max-h-[90dvh] overflow-y-auto space-y-5"
            >
              {/* Cabecera del Modal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm shrink-0">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                      Nómina del Equipo — {proyectoSeleccionado?.nombre}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Desarrolladores vinculados, dedicación horaria semanal y liberación de personal
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

              {/* Resumen de Capacidad del Equipo */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 flex flex-wrap justify-between items-center text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-600 dark:text-zinc-400">Total Desarrolladores:</span>
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
              <div className="space-y-3">
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

                    // Tareas WBS asignadas a este dev en este proyecto
                    const tareasDevCount = etapas.reduce((acc, et) => {
                      const acts = Array.isArray(et.actividades) ? et.actividades : [];
                      return acc + acts.filter(a => Number(a.desarrollador?.idTrabajador || a.idDesarrollador) === Number(dev.idTrabajador)).length;
                    }, 0);

                    return (
                      <div 
                        key={item.idAsignacion || dev.idTrabajador}
                        className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                            {dev.nombre?.[0]}{dev.apellido?.[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                {dev.nombre} {dev.apellido}
                              </span>
                              <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
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

                                <div className="flex items-center gap-0.5 px-2 font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                                  <span>{horasPrj}</span>
                                  <span className="text-[0.65rem] text-zinc-400 font-normal">h/sem</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleCambiarHorasDev(dev.idTrabajador, `${dev.nombre} ${dev.apellido}`, horasPrj + 1)}
                                  disabled={updatingDevId === dev.idTrabajador || (horasGlobales + 1 > 48)}
                                  className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center font-black text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                                  title={horasGlobales + 1 > 48 ? `Límite legal excedido (Acumula ${horasGlobales}/48h en la empresa)` : 'Aumentar 1 hora semanal'}
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
                              Carga Total Empresa: <strong className={horasGlobales >= 48 ? 'text-red-600 dark:text-red-400 font-black' : 'text-zinc-700 dark:text-zinc-300 font-bold'}>{horasGlobales}/48h</strong>
                            </span>
                          </div>

                          {isMiProyecto && (
                            <button
                              type="button"
                              onClick={() => handleDesasignarDev(dev.idTrabajador, `${dev.nombre} ${dev.apellido}`)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                              title="Desvincular del proyecto y liberar dedicación horaria"
                            >
                              <UserX size={14} />
                              <span className="hidden sm:inline">Desvincular</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer del Modal */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNominaDevsModal(false)}
                  className="outline-button px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Cerrar Nómina
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
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    incidenciaAAtender._tipo === 'ERROR' 
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
                  <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                    incidenciaAAtender.estadoAtencion === 'REGISTRADO' 
                      ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 shadow-2xs' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}>
                    <Clock size={11} /> 1. Registrado
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                    incidenciaAAtender.estadoAtencion === 'EN_REVISION' 
                      ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700 shadow-2xs' 
                      : (incidenciaAAtender.estadoAtencion === 'SOLUCIONADO' || incidenciaAAtender.estadoAtencion === 'RESUELTO')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800'
                  }`}>
                    <Activity size={11} /> 2. En Revisión
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                    (incidenciaAAtender.estadoAtencion === 'SOLUCIONADO' || incidenciaAAtender.estadoAtencion === 'RESUELTO')
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
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ring-4 ${
                    incidenciaVerDetalle._tipo === 'ERROR'
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
                  <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                    incidenciaVerDetalle.estadoAtencion === 'REGISTRADO' 
                      ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 shadow-2xs' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}>
                    <Clock size={11} /> 1. Registrado
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                    incidenciaVerDetalle.estadoAtencion === 'EN_REVISION' 
                      ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700 shadow-2xs' 
                      : (incidenciaVerDetalle.estadoAtencion === 'SOLUCIONADO' || incidenciaVerDetalle.estadoAtencion === 'RESUELTO')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800'
                  }`}>
                    <Activity size={11} /> 2. En Revisión
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                    (incidenciaVerDetalle.estadoAtencion === 'SOLUCIONADO' || incidenciaVerDetalle.estadoAtencion === 'RESUELTO')
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
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-mono font-extrabold uppercase border shadow-2xs ${
                        incidenciaVerDetalle.severidad === 'CRITICA' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400' :
                        incidenciaVerDetalle.severidad === 'ALTA' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400' :
                        incidenciaVerDetalle.severidad === 'MEDIA' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}>
                        Severidad: {incidenciaVerDetalle.severidad || 'BAJA'}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-mono font-extrabold shadow-2xs">
                        {incidenciaVerDetalle.duracionMinutos || 0} Minutos ({( (incidenciaVerDetalle.duracionMinutos || 0)/60 ).toFixed(1)} Horas)
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
                /* CASO A: PROYECTO VACÍO (0 ETAPAS / 0 TAREAS WBS) */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
                        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Cierre Prematuro: Proyecto Sin Estructura Ni Avances WBS</span>
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
                      <span>Registro Obligatorio de Auditoría de Cierre Prematuro</span>
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
                          <span className="text-[0.68rem] text-zinc-400 font-mono">
                            {justificacionCancelacion.length} caracteres
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
                            <span>Alerta de Auditoría: Fases Pendientes</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[0.68rem] font-bold font-mono">
                            {evidenciaWbsFinalizacion.etapasIncompletas.length} Etapas | {evidenciaWbsFinalizacion.actividadesIncompletas.length} Tareas
                          </span>
                        </div>

                        <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                          Se detectaron elementos sin marcar como completados en el cronograma WBS. Al confirmar, el sistema forzará automáticamente la finalización histórica de todas estas fases para cumplir con la norma de auditoría.
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

                        <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 text-[0.68rem] text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-2">
                          <Info size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>Todas las actividades incompletas serán archivadas con estado de auditoría forzada.</span>
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
                        {/* Item 1 */}
                        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                          <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold">
                            1
                          </div>
                          <div>
                            <strong className="block text-zinc-900 dark:text-zinc-100 font-bold text-[0.75rem]">Cambio de Estado a FINALIZADO</strong>
                            <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">El proyecto quedará oficialmente clausurado en el portal corporativo.</span>
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
                            2
                          </div>
                          <div>
                            <strong className="block text-zinc-900 dark:text-zinc-100 font-bold text-[0.75rem]">Congelamiento Total de WBS</strong>
                            <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">Toda la estructura de tareas y tiempos pasa a modo de lectura inmutable.</span>
                          </div>
                        </div>

                        {/* Item 3 */}
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
                  disabled={submittingFinalizar}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs py-2.5 px-6 rounded-xl font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all transform active:scale-95"
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
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      filtroPropiedadLider === 'MIS_PROYECTOS'
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
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      filtroPropiedadLider === 'OTROS_LIDERES'
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
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      filtroPropiedadLider === 'TODOS'
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
                    className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                      filtroEstadoProyectoModal === 'TODOS'
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
                    className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                      filtroEstadoProyectoModal === 'ACTIVO'
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
                    className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                      filtroEstadoProyectoModal === 'FINALIZADO'
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
                    className={`text-xs py-2 px-3.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                      filtroEstadoProyectoModal === 'GLOBAL'
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
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      (!proyectoSeleccionado || proyectoSeleccionado.idProyecto === 'GLOBAL')
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
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                            isSelected
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
                <button
                  type="button"
                  onClick={() => setShowEditarEtapaModal(false)}
                  className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
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
                  <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                    Estado Lógico de la Etapa *
                  </label>
                  <select
                    value={editingEtapaForm.estado}
                    onChange={(e) => setEditingEtapaForm({ ...editingEtapaForm, estado: e.target.value })}
                    className="input-field w-full py-2.5 text-xs font-bold appearance-none cursor-pointer"
                  >
                    <option value="PENDIENTE">PENDIENTE (Planificada)</option>
                    <option value="EN_PROGRESO">EN_PROGRESO (En Ejecución)</option>
                    <option value="FINALIZADA">FINALIZADA (Concluida)</option>
                  </select>
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
                <button
                  type="button"
                  onClick={() => setShowEditarProyectoModal(false)}
                  className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
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
                    <option value="ACTIVO">⚡ ACTIVO (En Ejecución Normal)</option>
                    <option value="PAUSADO">⏸️ PAUSADO (En Pausa Temporaria)</option>
                    <option value="INHABILITADO">🚫 INHABILITADO (Suspendido u Operación Detenida)</option>
                    <option value="FINALIZADO">✅ FINALIZADO (Cerrado Formalmente)</option>
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

        {/* 3. Modal: Generador de Reportes PDF Configurable */}
        {showGenerarReportePdfModal && proyectoSeleccionado && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-extrabold text-base">
                  <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                  <span>Configurar Reporte PDF del Proyecto</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGenerarReportePdfModal(false)}
                  className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 space-y-1">
                  <span className="font-extrabold text-blue-900 dark:text-blue-200 block text-xs">
                    Proyecto Seleccionado: {proyectoSeleccionado.nombre}
                  </span>
                  <p className="text-blue-700 dark:text-blue-300 text-[0.68rem] font-medium">
                    Selecciona el nivel de detalle e información sensible a incluir en el documento ejecutivo PDF.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block">
                    Nivel de Detalle del Reporte *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfConfig({ ...pdfConfig, nivelDetalle: 'RESUMIDO' })}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        pdfConfig.nivelDetalle === 'RESUMIDO'
                          ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600'
                      }`}
                    >
                      <div className="font-extrabold text-xs">Reporte Resumido</div>
                      <div className="text-[0.65rem] text-zinc-500 mt-0.5">Visión ejecutiva de alto nivel</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPdfConfig({ ...pdfConfig, nivelDetalle: 'DETALLADO' })}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        pdfConfig.nivelDetalle === 'DETALLADO'
                          ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600'
                      }`}
                    >
                      <div className="font-extrabold text-xs">Reporte Detallado</div>
                      <div className="text-[0.65rem] text-zinc-500 mt-0.5">Incluye Fases WBS, Horas y Equipo</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="font-extrabold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Contenido a Incluir en el Documento:
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={pdfConfig.incluirWbs}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, incluirWbs: e.target.checked })}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Incluir Estructura WBS y Fases del Proyecto</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={pdfConfig.incluirEquipo}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, incluirEquipo: e.target.checked })}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Incluir Desarrolladores Asignados y Carga Horaria</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-amber-800 dark:text-amber-300">
                    <input
                      type="checkbox"
                      checked={pdfConfig.modoSensible}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, modoSensible: e.target.checked })}
                      className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Incluir Información Sensible (Presupuesto Financiero USD)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowGenerarReportePdfModal(false)}
                    className="outline-button text-xs py-2 px-4 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerarReportePdf}
                    className="gradient-button text-xs py-2 px-5 font-bold inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Download size={14} />
                    <span>Descargar Reporte PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
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
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-9 w-[96%] sm:w-full max-w-3xl shadow-2xl max-h-[90dvh] overflow-y-auto space-y-6"
              >
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-start pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                        <span>Registrar Nuevo Colaborador</span>
                        <span className={`text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-full border ${currentSkillProfile.badgeTagStyle}`}>
                          {nuevoColaboradorForm.rol}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Alta corporativa en PostgreSQL, asignación de rol de seguridad y configuración de perfil profesional
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowNuevoColaboradorModal(false)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCrearColaboradorPorLider} className="space-y-4 text-xs" noValidate>
                  {/* 1. Información Personal & Identificación */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100">
                        <Shield size={14} className="text-emerald-500" />
                        <span>1. Identificación & Credenciales de Acceso</span>
                      </div>
                      <span className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
                              {p.flag} {p.nombre} ({p.docTipo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between text-xs mb-1">
                          <span>Número de Identificación / {paisActual.docTipo} *</span>
                          <span className="text-[0.62rem] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                            {paisActual.flag} {paisActual.nombre}
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
                            className={`input-field py-2 text-xs font-mono font-bold pr-9 ${
                              nuevoColaboradorForm.identificacion 
                                ? (docValidationResult.valid ? 'border-emerald-500 ring-2 ring-emerald-500/10 dark:border-emerald-500' : 'border-red-400 dark:border-red-600 ring-2 ring-red-500/10') 
                                : ''
                            }`}
                          />
                          {nuevoColaboradorForm.identificacion && (
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
                        {nuevoColaboradorForm.identificacion && (
                          <p className={`text-[0.65rem] font-bold mt-1 flex items-center gap-1.5 ${
                            docValidationResult.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          }`}>
                            <span>{paisActual.flag}</span>
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
                            onChange={(e) => { setNewColaboradorForm({ ...nuevoColaboradorForm, nombre: e.target.value }); setFormErrorsColaborador(p => ({ ...p, nombre: undefined })); }}
                            placeholder="Nombres del colaborador"
                            className={`input-field py-2 text-xs ${
                              nuevoColaboradorForm.nombre ? (nombreValidationResult.valid ? 'border-emerald-500' : 'border-red-400 dark:border-red-600') : ''
                            }`}
                          />
                          {nuevoColaboradorForm.nombre && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {nombreValidationResult.valid ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-red-500" />}
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
                            onChange={(e) => { setNewColaboradorForm({ ...nuevoColaboradorForm, apellido: e.target.value }); setFormErrorsColaborador(p => ({ ...p, apellido: undefined })); }}
                            placeholder="Apellidos del colaborador"
                            className={`input-field py-2 text-xs ${
                              nuevoColaboradorForm.apellido ? (apellidoValidationResult.valid ? 'border-emerald-500' : 'border-red-400 dark:border-red-600') : ''
                            }`}
                          />
                          {nuevoColaboradorForm.apellido && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {apellidoValidationResult.valid ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                            </div>
                          )}
                        </div>
                        {nuevoColaboradorForm.apellido && !apellidoValidationResult.valid && (
                          <p className="text-[0.63rem] text-red-500 font-bold mt-0.5">{apellidoValidationResult.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">
                          Rol de Seguridad *
                        </label>
                        <select
                          value={nuevoColaboradorForm.rol}
                          onChange={(e) => {
                            const selectedRol = e.target.value;
                            setNuevoColaboradorForm({ ...nuevoColaboradorForm, rol: selectedRol });
                          }}
                          className="input-field py-2 text-xs font-bold uppercase"
                        >
                          <option value="DESARROLLADOR">DESARROLLADOR (WBS)</option>
                          <option value="LIDER">LÍDER DE PROYECTO</option>
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
                          value={nuevoColaboradorForm.email}
                          onChange={(e) => { setNewColaboradorForm({ ...nuevoColaboradorForm, email: e.target.value }); setFormErrorsColaborador(p => ({ ...p, email: undefined })); }}
                          onBlur={() => {
                            if (nuevoColaboradorForm.email && !nuevoColaboradorForm.email.includes('@')) {
                              setNuevoColaboradorForm(prev => ({ ...prev, email: `${prev.email.trim()}@ikernell.org` }));
                            }
                          }}
                          placeholder="correo.corporativo@ikernell.org"
                          className={`input-field py-2 text-xs font-mono pr-9 ${
                            nuevoColaboradorForm.email ? (emailValidationResult.valid ? 'border-emerald-500' : 'border-red-400 dark:border-red-600') : ''
                          }`}
                        />
                        {nuevoColaboradorForm.email && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {emailValidationResult.valid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                          </div>
                        )}
                      </div>
                      {nuevoColaboradorForm.email && (
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
                        value={nuevoColaboradorForm.emailPersonal || ''}
                        onChange={(e) => setNewColaboradorForm({ ...nuevoColaboradorForm, emailPersonal: e.target.value })}
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
                          <Lock size={13} className="text-emerald-500" /> Contraseña de Acceso Inicial *
                        </label>
                        <button
                          type="button"
                          onClick={generarPasswordAleatoriaColaborador}
                          className="text-[0.68rem] font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
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
                          value={nuevoColaboradorForm.passwordHash}
                          onChange={(e) => {
                            setNuevoColaboradorForm({ ...nuevoColaboradorForm, passwordHash: e.target.value });
                            setFormErrorsColaborador(p => ({ ...p, passwordHash: undefined }));
                          }}
                          placeholder="Mínimo 8 y máximo 20 caracteres (Ej. Ikernell2026*)"
                          className={`input-field py-2 pl-3.5 pr-10 text-xs font-mono font-bold ${formErrorsColaborador.passwordHash ? 'border-red-400 dark:border-red-600' : ''}`}
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

                      {/* Checklist de Validación en Tiempo Real */}
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

                      {formErrorsColaborador.passwordHash && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrorsColaborador.passwordHash}</p>}
                    </div>
                  </div>

                  {/* 2. Perfil Profesional & Especialidad Principal */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100">
                        <GraduationCap size={14} className="text-emerald-500" />
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
                          value={nuevoColaboradorForm.profesion}
                          onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, profesion: e.target.value })}
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
                          value={nuevoColaboradorForm.especialidad}
                          onChange={(e) => setNuevoColaboradorForm({ ...nuevoColaboradorForm, especialidad: e.target.value })}
                          placeholder={currentSkillProfile.placeholderEspecialidad}
                          className="input-field py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Habilidades Técnicas & Competencias por Rol */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-950 dark:text-emerald-200">
                        <RoleIconComponent size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{currentSkillProfile.tituloModulo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                          {selectedSkills.length} Habilidades
                        </span>
                      </div>
                    </div>

                    {/* Chip Tag List de Selección Dinámica */}
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200/60 dark:border-emerald-800/40 min-h-[48px] items-center">
                      {selectedSkills.length === 0 ? (
                        <span className="text-[0.7rem] text-zinc-400 italic px-1">
                          Ninguna habilidad agregada aún. Selecciona de las sugerencias recomendadas o escribe una personalizada.
                        </span>
                      ) : (
                        selectedSkills.map(skill => (
                          <span 
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.68rem] font-extrabold bg-emerald-600 text-white shadow-2xs animate-fadeIn"
                          >
                            <span>{skill}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:bg-emerald-700 p-0.5 rounded-full transition-colors cursor-pointer"
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
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Agregar</span>
                      </button>
                    </div>

                    {/* Sugerencias Rápidas Reutilizables */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[0.62rem] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Sugerencias Rápidas para {nuevoColaboradorForm.rol} (Clic para activar/desactivar):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentSkillProfile.sugerencias.map(skill => {
                          const isSelected = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleToggleSkill(skill)}
                              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold border transition-all cursor-pointer inline-flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400'
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
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg shadow-emerald-600/20 transition-all text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submittingNuevoColaborador ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Guardando en PostgreSQL...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Registrar Colaborador</span>
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

      {/* Modal: Historial Acumulado de Cambios por la Coordinación */}
      <AnimatePresence>
        {showHistorialCambiosModal && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 max-h-[88dvh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Historial de Cambios Realizados por Coordinación
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Registro de auditoría acumulado con marca de tiempo e identificación directiva
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistorialCambiosModal(false)}
                  className="outline-button text-xs py-2 px-4 font-bold rounded-2xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                {loadingHistorial ? (
                  <div className="p-12 text-center text-xs text-zinc-400">
                    <Loader2 size={28} className="animate-spin mx-auto text-purple-600 mb-3" />
                    Cargando historial de auditoría...
                  </div>
                ) : historialCambios.length === 0 ? (
                  <div className="p-10 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-xs space-y-2">
                    <ShieldCheck size={36} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                    <p className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">Sin modificaciones directivas</p>
                    <p className="max-w-md mx-auto leading-relaxed">La Coordinación General no ha registrado ediciones de parámetros o etapas en este proyecto. Todo se encuentra según el plan inicial.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {historialCambios.map((reg, idx) => (
                      <div key={reg.idHistorial || idx} className="p-5 rounded-3xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3 shadow-2xs hover:border-purple-300 transition-colors">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[0.68rem] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {reg.accion || 'MODIFICACIÓN'}
                            </span>
                            {reg.batchId && (
                              <span className="text-[0.62rem] font-mono text-zinc-400 bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md font-bold">
                                Session #{reg.batchId.split('-')[1] || reg.batchId}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-zinc-500 font-bold flex items-center gap-1">
                            <Clock size={12} className="text-purple-500" />
                            {new Date(reg.fechaCambio).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed pl-1">
                          {reg.detalles}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-500 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-[0.6rem] flex items-center justify-center shrink-0">
                              {getInitials(reg.nombreCoordinador || 'Coordinador', '')}
                            </div>
                            <span>
                              Coordinador responsable: <strong className="text-zinc-900 dark:text-zinc-100">{reg.nombreCoordinador}</strong> ({reg.emailCoordinador})
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </ErrorBoundary>
    </DashboardLayout>
  );
};
