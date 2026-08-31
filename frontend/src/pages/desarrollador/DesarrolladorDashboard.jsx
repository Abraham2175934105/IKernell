import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  CheckSquare, Bug, AlertTriangle, AlertCircle, X, CheckCircle2, 
  ChevronRight, ChevronDown, Clock, Plus, Activity, Layers, Sparkles,
  Loader2, Inbox, RefreshCw, Eye, RotateCcw, Info, ArrowRight,
  FileText, Calendar, User, ShieldAlert, Play, Check,
  Filter, SlidersHorizontal, Search, FolderGit2, ArrowUpDown, Briefcase, Zap, ArrowLeft,
  LayoutGrid, List, Lock, Server, WifiOff, Database, Wrench, Users, Code2, ShieldCheck, AlertOctagon, Cpu, Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { SnippetInjectionCard } from '../../components/dashboard/SnippetInjectionCard';
import { Skeleton, SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { CustomSelect } from '../../components/ui/CustomSelect';

// Variantes de animación de alto rendimiento y ultra rápidas (0.25s)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  }
};

// Extrae el motivo de reasignación si viene adjunto en la descripción
const parseReasignacion = (descripcion) => {
  if (!descripcion) return { isReassigned: false, motivo: null, cleanDescripcion: '' };
  const match = descripcion.match(/\[Reasignad[ao]:?\s*([^\]]+)\]/i);
  if (match) {
    return {
      isReassigned: true,
      motivo: match[1].trim(),
      cleanDescripcion: descripcion.replace(/\[Reasignad[ao]:?\s*[^\]]+\]/i, '').trim()
    };
  }
  return { isReassigned: false, motivo: null, cleanDescripcion: descripcion };
};


// Estado vacío cuando no hay registros para mostrar
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-inner">
      <Icon size={36} className="text-zinc-400 dark:text-zinc-500" />
    </div>
    <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-2">{title}</h3>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-4">{description}</p>
    {action && action}
  </div>
);

// Componente Auxiliar para Errores de Validación en Formularios
const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <span className="text-[0.7rem] text-red-600 dark:text-red-400 font-bold block mt-1 flex items-center gap-1 animate-fadeIn">
      <AlertCircle size={12} className="shrink-0 text-red-500" />
      <span>{message}</span>
    </span>
  );
};

// Componente Dropdown Personalizado Enterprise con Iconos, Micro-Badges y Click-Outside
const CustomDropdown = ({ 
  icon: Icon, 
  iconColor = 'text-zinc-500', 
  label, 
  value, 
  options = [], 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];
  const SelectedIcon = selectedOption?.icon || Icon;

  return (
    <div className="relative flex-1 min-w-[180px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="flex items-center gap-2 truncate">
          {SelectedIcon && <SelectedIcon size={14} className={selectedOption?.iconColor || iconColor} />}
          {selectedOption?.badgeColor && (
            <span className={`w-2 h-2 rounded-full ${selectedOption.badgeColor} flex-shrink-0`} />
          )}
          <span className="truncate text-zinc-900 dark:text-zinc-100 font-bold">
            {selectedOption?.label || label}
          </span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-zinc-400 dark:text-zinc-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 sm:left-auto sm:right-0 z-30 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 min-w-[210px] space-y-0.5"
          >
            {label && (
              <div className="px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                {label}
              </div>
            )}
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.badgeColor ? (
                      <span className={`w-2 h-2 rounded-full ${opt.badgeColor} flex-shrink-0`} />
                    ) : OptIcon ? (
                      <OptIcon size={14} className={opt.iconColor || 'text-zinc-400'} />
                    ) : null}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check size={13} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Indicador visual del estado de una actividad
const EstadoBadge = ({ estado }) => {
  const styles = {
    'PENDIENTE': 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    'EN_PROGRESO': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    'FINALIZADA': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  };
  const labels = {
    'PENDIENTE': 'Pendiente',
    'EN_PROGRESO': 'En Progreso',
    'FINALIZADA': 'Finalizada',
  };
  return (
    <span className={`text-[0.65rem] font-extrabold uppercase px-2.5 py-1 rounded-full border ${styles[estado] || styles['PENDIENTE']}`}>
      {labels[estado] || estado}
    </span>
  );
};

// Indicador del estado de atención de reportes técnicos
const EstadoAtencionBadge = ({ estado }) => {
  const styles = {
    'REGISTRADO': 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    'EN_REVISION': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    'EN_ANALISIS': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    'SOLUCIONADO': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  };
  const icons = {
    'REGISTRADO': <Clock size={11} />,
    'EN_REVISION': <Eye size={11} />,
    'EN_ANALISIS': <Eye size={11} />,
    'SOLUCIONADO': <CheckCircle2 size={11} />,
  };
  const labels = {
    'REGISTRADO': 'Registrado',
    'EN_REVISION': 'En Revisión',
    'EN_ANALISIS': 'En Análisis',
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

export const DesarrolladorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('actividades');
const [actividades, setActividades] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [misReportes, setMisReportes] = useState({ errores: [], interrupciones: [], totalErrores: 0, totalInterrupciones: 0 });
  const [filtroHistorial, setFiltroHistorial] = useState('TODOS');
  
  // Evaluador universal de Proyectos Finalizados / Archivados
  const esProyectoFinalizado = useCallback((p) => {
    if (!p) return false;
    const st = String(p.estado || p.estadoProyecto || p.estado_proyecto || '').toUpperCase().trim();
    return st === 'FINALIZADO' || st === 'COMPLETADO' || st === 'ARCHIVADO' || st === 'CANCELADO' || st === 'INACTIVO';
  }, []);

  // Filtros de Estado de Proyecto (Proyectos Activos por defecto vs Archivados)
  const [filtroEstadoProyectoActividades, setFiltroEstadoProyectoActividades] = useState('ACTIVOS'); // 'ACTIVOS' (por defecto) | 'FINALIZADOS' | 'TODOS'
  const [filtroEstadoProyectoReportes, setFiltroEstadoProyectoReportes] = useState('ACTIVOS'); // 'ACTIVOS' (por defecto) | 'FINALIZADOS' | 'TODOS'

  // Estados para Filtros, Buscador y Ordenamiento en Cliente (HU-16 / RF-21)
  const [proyectoSeleccionadoDev, setProyectoSeleccionadoDev] = useState(null);
  const [searchProjectQuery, setSearchProjectQuery] = useState('');
  const [searchTaskQuery, setSearchTaskQuery] = useState('');
  const [proyectoFilter, setProyectoFilter] = useState('TODOS');
  const [estadoFilter, setEstadoFilter] = useState('TODAS');
  const [ordenarPor, setOrdenarPor] = useState('RECIENTES');

  // Estados para Filtros y Conmutador de Vistas del Historial (HU-17 / RF-22 a RF-24)
  const [searchReportQuery, setSearchReportQuery] = useState('');
  const [filtroSeveridad, setFiltroSeveridad] = useState('TODAS');
  const [filtroDuracion, setFiltroDuracion] = useState('TODAS');
  const [filtroEstadoAtencion, setFiltroEstadoAtencion] = useState('TODOS');
  const [ordenarReportesPor, setOrdenarReportesPor] = useState('RECIENTES');
  const [reportViewMode, setReportViewMode] = useState('grid'); // 'grid' | 'list'

  const [loading, setLoading] = useState(true);
  const [loadingEtapas, setLoadingEtapas] = useState(true);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [changingEstado, setChangingEstado] = useState(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInterrupcionModal, setShowInterrupcionModal] = useState(false);
  const [detalleModalDoc, setDetalleModalDoc] = useState(null);
  const [etapaPreseleccionada, setEtapaPreseleccionada] = useState(null);
  const [expandAvanceDetalle, setExpandAvanceDetalle] = useState(false);
  const [kpiModalStatus, setKpiModalStatus] = useState(null); // null | 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADA'

  const [submittingError, setSubmittingError] = useState(false);
  const [submittingInterrupcion, setSubmittingInterrupcion] = useState(false);

  const [errorForm, setErrorForm] = useState({
    idProyecto: '',
    idEtapa: '',
    tipoError: '',
    severidad: '',
    descripcion: ''
  });
  const [errorFormErrors, setErrorFormErrors] = useState({});
  const [sugerenciasSnippets, setSugerenciasSnippets] = useState([]);
  const [loadingSnippets, setLoadingSnippets] = useState(false);

  const [interrupcionForm, setInterrupcionForm] = useState({
    idProyecto: '',
    idEtapa: '',
    tipoInterrupcion: '',
    duracionMinutos: '',
    comentarios: ''
  });
  const [interrupcionFormErrors, setInterrupcionFormErrors] = useState({});

  // Peticiones API
  const cargarActividades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/desarrollador/mis-actividades').catch(() => []);
      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando actividades:', err);
      setActividades([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const cargarEtapas = useCallback(async () => {
    try {
      setLoadingEtapas(true);
      const data = await api.get('/desarrollador/etapas').catch(() => []);
      setEtapas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando etapas:', err);
      setEtapas([]);
    } finally {
      setLoadingEtapas(false);
    }
  }, [api]);

  // Consolidación inteligente de Etapas WBS (Combina API de Etapas + Actividades Asignadas para NUNCA quedar vacías)
  const etapasConsolidadas = useMemo(() => {
    const map = new Map();

    // 1. Etapas de la API
    (etapas || []).forEach(et => {
      if (et && et.idEtapa) {
        const idEtStr = et.idEtapa.toString();
        const p = et.proyecto;
        const idPrjStr = p?.idProyecto?.toString() || p?.id?.toString() || '0';
        const nomPrj = p?.nombre || 'Proyecto General';
        map.set(idEtStr, {
          idEtapa: idEtStr,
          nombreEtapa: et.nombreEtapa || `Etapa #${idEtStr}`,
          idProyecto: idPrjStr,
          nombreProyecto: nomPrj,
          etapaObj: et
        });
      }
    });

    // 2. Etapas extraídas de las actividades asignadas al desarrollador
    (actividades || []).forEach(act => {
      const et = act.etapa;
      if (et && et.idEtapa) {
        const idEtStr = et.idEtapa.toString();
        const p = et.proyecto || act.proyecto;
        const idPrjStr = p?.idProyecto?.toString() || p?.id?.toString() || '0';
        const nomPrj = p?.nombre || 'Proyecto General';
        if (!map.has(idEtStr)) {
          map.set(idEtStr, {
            idEtapa: idEtStr,
            nombreEtapa: et.nombreEtapa || `Etapa #${idEtStr}`,
            idProyecto: idPrjStr,
            nombreProyecto: nomPrj,
            etapaObj: et
          });
        }
      }
    });

    return Array.from(map.values());
  }, [etapas, actividades]);

  // Lista única de Proyectos asociados para el selector Nivel 1 del modal
  const proyectosDisponiblesModal = useMemo(() => {
    const map = new Map();
    etapasConsolidadas.forEach(et => {
      if (et.idProyecto && !map.has(et.idProyecto)) {
        map.set(et.idProyecto, {
          idProyecto: et.idProyecto,
          nombreProyecto: et.nombreProyecto
        });
      }
    });
    return Array.from(map.values());
  }, [etapasConsolidadas]);

  // Filtros de etapas por proyecto seleccionado para cada modal
  const etapasFiltradasError = useMemo(() => {
    if (!errorForm.idProyecto) return etapasConsolidadas;
    return etapasConsolidadas.filter(et => et.idProyecto === errorForm.idProyecto);
  }, [etapasConsolidadas, errorForm.idProyecto]);

  const etapasFiltradasInterrupcion = useMemo(() => {
    if (!interrupcionForm.idProyecto) return etapasConsolidadas;
    return etapasConsolidadas.filter(et => et.idProyecto === interrupcionForm.idProyecto);
  }, [etapasConsolidadas, interrupcionForm.idProyecto]);

  const cargarMisReportes = useCallback(async () => {
    try {
      setLoadingReportes(true);
      const data = await api.get('/desarrollador/mis-reportes').catch(() => null);
      setMisReportes(data || { errores: [], interrupciones: [], totalErrores: 0, totalInterrupciones: 0 });
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setMisReportes({ errores: [], interrupciones: [], totalErrores: 0, totalInterrupciones: 0 });
    } finally {
      setLoadingReportes(false);
    }
  }, [api]);

  // Efecto: Búsqueda difusa de Micro-Snippets en tiempo real (RF-36)
  useEffect(() => {
    if (!showErrorModal || !errorForm?.descripcion || errorForm.descripcion.trim().length < 4) {
      setSugerenciasSnippets([]);
      setLoadingSnippets(false);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setLoadingSnippets(true);
        const tipo = errorForm?.tipoError || '';
        const desc = errorForm?.descripcion || '';
        const queryTerm = `${tipo} ${desc}`.trim();
        const data = await api.get(`/snippets/sugerencias?termino=${encodeURIComponent(queryTerm)}&limite=2`);
        if (isMounted) {
          setSugerenciasSnippets(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error buscando micro-snippets sugeridos:', err);
        if (isMounted) {
          setSugerenciasSnippets([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSnippets(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [errorForm?.descripcion, errorForm?.tipoError, showErrorModal, api]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarActividades();
    cargarEtapas();
    cargarMisReportes();
  }, []);

  // Manejadores de eventos (Handlers)
  const handleCambiarEstado = async (idActividad, nuevoEstado) => {
    try {
      setChangingEstado(idActividad);
      const actividadActualizada = await api.patch(`/desarrollador/actividades/${idActividad}/estado`, { estado: nuevoEstado });
      
      setActividades(prev => prev.map(a => 
        a.idActividad === idActividad ? { ...a, ...actividadActualizada } : a
      ));

      if (detalleModalDoc && detalleModalDoc.idActividad === idActividad) {
        setDetalleModalDoc(prev => ({ ...prev, ...actividadActualizada }));
      }

      const labels = { 'PENDIENTE': 'Pendiente', 'EN_PROGRESO': 'En Progreso', 'FINALIZADA': 'Finalizada' };
      toast.success(`Caso / Tarea #${idActividad} actualizada con éxito a estado "${labels[nuevoEstado] || nuevoEstado}".`, { duration: 3000 });
    } catch (err) {
      console.error('Error cambiando estado:', err);
      toast.error(err.message || 'Error al actualizar el estado de la actividad.');
    } finally {
      setChangingEstado(null);
    }
  };

  // Accesos directos para precargar datos de la tarea en los modales
  const handleAbrirReporteErrorDesdeTarea = (actividad) => {
    const idEt = actividad.etapa?.idEtapa?.toString() || '';
    const p = actividad.etapa?.proyecto || actividad.proyecto;
    const idPrj = p?.idProyecto?.toString() || p?.id?.toString() || '';
    setErrorForm({
      idProyecto: idPrj,
      idEtapa: idEt,
      tipoError: '',
      severidad: 'MEDIA',
      descripcion: `[Ref Tarea #${actividad.idActividad}: ${actividad.etapa?.nombreEtapa || 'Etapa'}] `
    });
    setEtapaPreseleccionada(actividad.etapa);
    setErrorFormErrors({});
    setShowErrorModal(true);
  };

  const handleAbrirInterrupcionDesdeTarea = (actividad) => {
    const idEt = actividad.etapa?.idEtapa?.toString() || '';
    const p = actividad.etapa?.proyecto || actividad.proyecto;
    const idPrj = p?.idProyecto?.toString() || p?.id?.toString() || '';
    setInterrupcionForm({
      idProyecto: idPrj,
      idEtapa: idEt,
      tipoInterrupcion: 'CORTE_ENERGIA',
      duracionMinutos: '30',
      comentarios: `[Fase: ${actividad.etapa?.nombreEtapa || 'Etapa'}] `
    });
    setEtapaPreseleccionada(actividad.etapa);
    setInterrupcionFormErrors({});
    setShowInterrupcionModal(true);
  };

  // Envío y validación del formulario de errores técnicos
  const validarErrorForm = () => {
    const errors = {};
    if (!errorForm.idProyecto) errors.idProyecto = 'Seleccione el proyecto afectado';
    if (!errorForm.idEtapa) errors.idEtapa = 'Seleccione la etapa WBS afectada';
    if (!errorForm.tipoError) errors.tipoError = 'Seleccione el tipo de error';
    if (!errorForm.severidad) errors.severidad = 'Seleccione la severidad';
    if (!errorForm.descripcion || errorForm.descripcion.trim().length < 8) {
      errors.descripcion = 'Ingrese una descripción de al menos 8 caracteres';
    }
    setErrorFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReportarError = async (e) => {
    e.preventDefault();
    if (!validarErrorForm()) return;

    try {
      setSubmittingError(true);
      await api.post('/desarrollador/errores', {
        idEtapa: parseInt(errorForm.idEtapa),
        tipoError: errorForm.tipoError,
        severidad: errorForm.severidad,
        descripcion: errorForm.descripcion.trim()
      });
      
      toast.success('Caso de Error Técnico registrado con éxito. Guardado en PostgreSQL.', { duration: 3000 });
      setShowErrorModal(false);
      setErrorForm({ idProyecto: '', idEtapa: '', tipoError: '', severidad: '', descripcion: '' });
      setEtapaPreseleccionada(null);
      setErrorFormErrors({});
    } catch (err) {
      console.error('Error registrando error:', err);
      toast.error(err.message || 'Error al registrar el reporte de error.');
    } finally {
      setSubmittingError(false);
    }
  };

  // Envío y validación del formulario de interrupciones operativas
  const validarInterrupcionForm = () => {
    const errors = {};
    if (!interrupcionForm.idProyecto) errors.idProyecto = 'Seleccione el proyecto afectado';
    if (!interrupcionForm.idEtapa) errors.idEtapa = 'Seleccione la etapa WBS afectada';
    if (!interrupcionForm.tipoInterrupcion) errors.tipoInterrupcion = 'Seleccione el tipo de contingencia';
    const mins = parseInt(interrupcionForm.duracionMinutos);
    if (!interrupcionForm.duracionMinutos || isNaN(mins) || mins < 1) {
      errors.duracionMinutos = 'Ingrese una duración válida (mínimo 1 minuto)';
    }
    if (!interrupcionForm.comentarios || interrupcionForm.comentarios.trim().length < 5) {
      errors.comentarios = 'Ingrese una justificación técnica de al menos 5 caracteres';
    }
    setInterrupcionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReportarInterrupcion = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validarInterrupcionForm()) return;

    try {
      setSubmittingInterrupcion(true);
      await api.post('/desarrollador/interrupciones', {
        idEtapa: parseInt(interrupcionForm.idEtapa),
        tipoInterrupcion: interrupcionForm.tipoInterrupcion,
        duracionMinutos: parseInt(interrupcionForm.duracionMinutos),
        comentarios: (interrupcionForm.comentarios || '').trim()
      });
      
      toast.success(`Caso de Contingencia (${interrupcionForm.duracionMinutos} min) registrado con éxito. Guardado en PostgreSQL.`, { duration: 3000 });
      setShowInterrupcionModal(false);
      setInterrupcionForm({ idProyecto: '', idEtapa: '', tipoInterrupcion: '', duracionMinutos: '', comentarios: '' });
      setEtapaPreseleccionada(null);
      setInterrupcionFormErrors({});
      cargarMisReportes();
    } catch (err) {
      console.error('Error registrando interrupción:', err);
      toast.error(err?.message || 'Error al registrar la contingencia.');
    } finally {
      setSubmittingInterrupcion(false);
    }
  };

  // Métricas calculadas para contadores y consolidación del historial
  const actividadesPendientes = useMemo(() => actividades.filter(a => a.estado === 'PENDIENTE').length, [actividades]);
  const actividadesEnProgreso = useMemo(() => actividades.filter(a => a.estado === 'EN_PROGRESO' || a.estado === 'EN_CURSO').length, [actividades]);
  const actividadesFinalizadas = useMemo(() => actividades.filter(a => a.estado === 'FINALIZADA' || a.estado === 'COMPLETADA').length, [actividades]);

  // Lista de Actividades para el Modal Interactivo de KPI
  const actividadesKpiModal = useMemo(() => {
    if (!kpiModalStatus) return [];
    if (kpiModalStatus === 'PENDIENTE') {
      return actividades.filter(a => a.estado === 'PENDIENTE');
    }
    if (kpiModalStatus === 'EN_PROGRESO') {
      return actividades.filter(a => a.estado === 'EN_PROGRESO' || a.estado === 'EN_CURSO');
    }
    if (kpiModalStatus === 'FINALIZADA') {
      return actividades.filter(a => a.estado === 'FINALIZADA' || a.estado === 'COMPLETADA');
    }
    return [];
  }, [actividades, kpiModalStatus]);

  // Agrupar actividades por Proyecto para la Vista Nivel 1 (Tarjetas de Proyectos)
  const proyectosAgrupados = useMemo(() => {
    const map = new Map();
    (actividades || []).forEach(act => {
      const prj = act.etapa?.proyecto || act.proyectoObj || {};
      const pId = prj.idProyecto || prj.id || 'GENERICO';
      const pNombre = prj.nombre || 'Proyecto General';
      const pCliente = prj.cliente || 'Cliente Corporativo';
      const pEstado = prj.estado || 'ACTIVO';

      if (!map.has(pId)) {
        map.set(pId, {
          idProyecto: pId,
          nombre: pNombre,
          cliente: pCliente,
          estado: pEstado,
          proyectoObj: prj,
          actividades: [],
          pendientes: 0,
          enProgreso: 0,
          finalizadas: 0
        });
      }

      const item = map.get(pId);
      item.actividades.push(act);
      if (act.estado === 'PENDIENTE') item.pendientes++;
      else if (act.estado === 'EN_PROGRESO' || act.estado === 'EN_CURSO') item.enProgreso++;
      else if (act.estado === 'FINALIZADA' || act.estado === 'COMPLETADA') item.finalizadas++;
    });

    return Array.from(map.values());
  }, [actividades]);

  // Contadores de Proyectos Activos vs Archivados / Concluidos
  const conteoProyectosActivos = useMemo(() => {
    return proyectosAgrupados.filter(p => !esProyectoFinalizado(p.proyectoObj || p)).length;
  }, [proyectosAgrupados, esProyectoFinalizado]);

  const conteoProyectosFinalizados = useMemo(() => {
    return proyectosAgrupados.filter(p => esProyectoFinalizado(p.proyectoObj || p)).length;
  }, [proyectosAgrupados, esProyectoFinalizado]);

  const proyectosFiltrados = useMemo(() => {
    let result = [...proyectosAgrupados];

    // 1. Filtro por Estado del Proyecto (Proyectos Activos por defecto vs Archivados)
    if (filtroEstadoProyectoActividades === 'ACTIVOS') {
      result = result.filter(p => !esProyectoFinalizado(p.proyectoObj || p));
    } else if (filtroEstadoProyectoActividades === 'FINALIZADOS') {
      result = result.filter(p => esProyectoFinalizado(p.proyectoObj || p));
    }

    // 2. Buscador por texto
    if (searchProjectQuery.trim()) {
      const q = searchProjectQuery.trim().toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(q) || 
        p.cliente.toLowerCase().includes(q) ||
        `prj-00${p.idProyecto}`.toLowerCase().includes(q)
      );
    }

    return result;
  }, [proyectosAgrupados, searchProjectQuery, filtroEstadoProyectoActividades, esProyectoFinalizado]);

  // Actividades del proyecto seleccionado para Nivel 2
  const actividadesDelProyectoSeleccionado = useMemo(() => {
    if (!proyectoSeleccionadoDev) return [];
    return (actividades || []).filter(act => {
      const prj = act.etapa?.proyecto || act.proyectoObj || {};
      const pId = prj.idProyecto || prj.id || 'GENERICO';
      return String(pId) === String(proyectoSeleccionadoDev.idProyecto);
    });
  }, [actividades, proyectoSeleccionadoDev]);

  // Lista de actividades filtradas y ordenadas del proyecto seleccionado
  const actividadesFiltradasYOrdenadas = useMemo(() => {
    let result = [...actividadesDelProyectoSeleccionado];

    // 1. Buscador reactivo dentro del proyecto
    if (searchTaskQuery.trim()) {
      const q = searchTaskQuery.trim().toLowerCase();
      result = result.filter(a => {
        const desc = (a.descripcion || '').toLowerCase();
        const etapa = (a.etapa?.nombreEtapa || a.etapa?.nombre || '').toLowerCase();
        return desc.includes(q) || etapa.includes(q);
      });
    }

    // 2. Filtro por estado operativo
    if (estadoFilter !== 'TODAS') {
      result = result.filter(a => {
        if (estadoFilter === 'PENDIENTE') return a.estado === 'PENDIENTE';
        if (estadoFilter === 'EN_PROGRESO') return a.estado === 'EN_PROGRESO' || a.estado === 'EN_CURSO';
        if (estadoFilter === 'FINALIZADA') return a.estado === 'FINALIZADA' || a.estado === 'COMPLETADA';
        return true;
      });
    }

    // 3. Ordenamiento dinámico
    result.sort((a, b) => {
      if (ordenarPor === 'RECIENTES') {
        return (b.idActividad || 0) - (a.idActividad || 0);
      }
      if (ordenarPor === 'ANTIGUAS') {
        return (a.idActividad || 0) - (b.idActividad || 0);
      }
      if (ordenarPor === 'DESCRIPCION') {
        return (a.descripcion || '').localeCompare(b.descripcion || '');
      }
      return 0;
    });

    return result;
  }, [actividadesDelProyectoSeleccionado, searchTaskQuery, estadoFilter, ordenarPor]);

  const activeTaskFiltersCount = (searchTaskQuery ? 1 : 0) + (estadoFilter !== 'TODAS' ? 1 : 0) + (ordenarPor !== 'RECIENTES' ? 1 : 0);

  // Evaluador estricto de asignación reciente (< 24h)
  const evaluarSiEsNuevaAsignacion24h = useCallback((act) => {
    if (!act) return false;
    
    // 1. Tareas finalizadas o completadas NUNCA muestran la alerta
    const st = (act.estado || '').toUpperCase();
    if (st === 'FINALIZADA' || st === 'COMPLETADA' || st === 'FINALIZADO' || st === 'COMPLETADO') {
      return false;
    }

    // 2. Si la actividad tiene la propiedad fechaAsignacion desde el backend
    if (act.fechaAsignacion) {
      const fechaAsig = new Date(act.fechaAsignacion).getTime();
      if (!isNaN(fechaAsig)) {
        const horasTranscurridas = (Date.now() - fechaAsig) / (1000 * 60 * 60);
        return horasTranscurridas >= 0 && horasTranscurridas <= 24;
      }
    }

    // 3. Si la actividad fue reasignada con timestamp en la descripción
    if (act.descripcion && /reasignad/i.test(act.descripcion)) {
      const match = act.descripcion.match(/\[Reasignad[ao]:?\s*([^\]]+)\]/i);
      if (match) {
        const strVal = match[1];
        const matchFecha = strVal.match(/\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/);
        if (matchFecha) {
          const fechaParsed = new Date(matchFecha[1]).getTime();
          if (!isNaN(fechaParsed)) {
            const horasDiff = (Date.now() - fechaParsed) / (1000 * 60 * 60);
            return horasDiff >= 0 && horasDiff <= 24;
          }
        }
      }
    }

    // 4. Si la tarea es antigua (hace más de 24h o datos semilla), NO es nueva asignación
    return false;
  }, []);

  const totalNuevasGlobales = useMemo(() => {
    return (actividades || []).filter(a => evaluarSiEsNuevaAsignacion24h(a)).length;
  }, [actividades, evaluarSiEsNuevaAsignacion24h]);

  const handleClearTaskFilters = () => {
    setSearchTaskQuery('');
    setEstadoFilter('TODAS');
    setOrdenarPor('RECIENTES');
  };

  const listaReportesUnificada = useMemo(() => {
    const errs = (misReportes?.errores || []).map(e => ({
      ...e,
      _tipo: 'ERROR',
      _id: `err-${e?.idError || e?.id || Math.random()}`,
      _fecha: new Date(e?.fechaRegistro || Date.now())
    }));
    const ints = (misReportes?.interrupciones || []).map(i => ({
      ...i,
      _tipo: 'INTERRUPCION',
      _id: `int-${i?.idInterrupcion || i?.id || Math.random()}`,
      _fecha: new Date(i?.fechaOcurrencia || i?.fechaRegistro || Date.now())
    }));
    const combined = [...errs, ...ints].sort((a, b) => b._fecha - a._fecha);
    if (filtroHistorial === 'ERRORES') return combined.filter(c => c._tipo === 'ERROR');
    if (filtroHistorial === 'INTERRUPCIONES') return combined.filter(c => c._tipo === 'INTERRUPCION');
    return combined;
  }, [misReportes, filtroHistorial]);

  const listaReportesFiltradaYOrdenada = useMemo(() => {
    let list = [...listaReportesUnificada];

    // 1. Filtro por Estado de Proyecto (Proyectos Activos por defecto vs Archivados / Concluidos)
    if (filtroEstadoProyectoReportes === 'ACTIVOS') {
      list = list.filter(item => {
        const prj = item?.etapa?.proyecto || item?.proyectoObj;
        return !esProyectoFinalizado(prj);
      });
    } else if (filtroEstadoProyectoReportes === 'FINALIZADOS') {
      list = list.filter(item => {
        const prj = item?.etapa?.proyecto || item?.proyectoObj;
        return esProyectoFinalizado(prj);
      });
    }

    // 2. Buscador por texto
    if (searchReportQuery.trim()) {
      const q = searchReportQuery.trim().toLowerCase();
      list = list.filter(item => {
        const desc = (item?.descripcion || item?.comentarios || '').toLowerCase();
        const etapa = (item?.etapa?.nombreEtapa || item?.etapa?.nombre || '').toLowerCase();
        const proy = (item?.etapa?.proyecto?.nombre || '').toLowerCase();
        const resNota = (item?.resolucionNota || '').toLowerCase();
        const tipoStr = (item?.tipoError || item?.tipoInterrupcion || '').toLowerCase();
        return desc.includes(q) || etapa.includes(q) || proy.includes(q) || resNota.includes(q) || tipoStr.includes(q);
      });
    }

    if (filtroSeveridad !== 'TODAS') {
      list = list.filter(item => item?.severidad === filtroSeveridad);
    }

    if (filtroHistorial === 'INTERRUPCIONES' && filtroDuracion !== 'TODAS') {
      list = list.filter(item => {
        const mins = parseInt(item?.duracionMinutos || 0);
        if (filtroDuracion === 'CORTA') return mins <= 30;
        if (filtroDuracion === 'MEDIA') return mins > 30 && mins <= 60;
        if (filtroDuracion === 'LARGA') return mins > 60;
        return true;
      });
    }

    if (filtroEstadoAtencion !== 'TODOS') {
      list = list.filter(item => (item?.estadoAtencion || 'REGISTRADO') === filtroEstadoAtencion);
    }

    list.sort((a, b) => {
      if (ordenarReportesPor === 'RECIENTES') {
        return b._fecha - a._fecha;
      }
      if (ordenarReportesPor === 'ANTIGUOS') {
        return a._fecha - b._fecha;
      }
      if (ordenarReportesPor === 'SEVERIDAD') {
        const sevOrder = { 'CRITICA': 4, 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
        const sA = sevOrder[a?.severidad] || 0;
        const sB = sevOrder[b?.severidad] || 0;
        return sB - sA;
      }
      if (ordenarReportesPor === 'DURACION') {
        const dA = parseInt(a?.duracionMinutos || 0);
        const dB = parseInt(b?.duracionMinutos || 0);
        return dB - dA;
      }
      return 0;
    });

    return list;
  }, [listaReportesUnificada, searchReportQuery, filtroSeveridad, filtroDuracion, filtroEstadoAtencion, ordenarReportesPor, filtroEstadoProyectoReportes, esProyectoFinalizado]);

  const activeReportFiltersCount = (searchReportQuery ? 1 : 0) + (filtroHistorial !== 'TODOS' ? 1 : 0) + (filtroSeveridad !== 'TODAS' ? 1 : 0) + (filtroDuracion !== 'TODAS' ? 1 : 0) + (filtroEstadoAtencion !== 'TODOS' ? 1 : 0) + (ordenarReportesPor !== 'RECIENTES' ? 1 : 0) + (filtroEstadoProyectoReportes !== 'ACTIVOS' ? 1 : 0);

  const handleClearReportFilters = () => {
    setSearchReportQuery('');
    setFiltroHistorial('TODOS');
    setFiltroSeveridad('TODAS');
    setFiltroDuracion('TODAS');
    setFiltroEstadoAtencion('TODOS');
    setFiltroEstadoProyectoReportes('ACTIVOS');
    setOrdenarReportesPor('RECIENTES');
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: loading ? 'Cargando...' : `Tareas: ${actividades.length} Asignadas`,
        metric2: loading ? '...' : `${actividadesEnProgreso} En Progreso • ${actividadesFinalizadas} Finalizadas`
      }}
    >
      
      {/* Pestaña: Tablero de actividades asignadas */}
      {activeTab === 'actividades' && (
        <motion.div 
          key="actividades"
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
                Operaciones del Desarrollador
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Tablero Personal de Actividades
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Seleccione un proyecto asignado para visualizar sus tareas WBS y dar seguimiento operativo
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={cargarActividades}
                disabled={loading}
                className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                title="Sincronizar actividades con PostgreSQL"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refrescar
              </button>
              <button
                type="button"
                onClick={() => { setEtapaPreseleccionada(null); setShowErrorModal(true); }}
                className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Reportar un fallo técnico detectado"
              >
                <Bug size={14} /> Reportar Error
              </button>
              <button
                type="button"
                onClick={() => { setEtapaPreseleccionada(null); setShowInterrupcionModal(true); }}
                className="gradient-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Registrar tiempo muerto o interrupción no planificada"
              >
                <AlertTriangle size={14} /> Registrar Contingencia
              </button>
            </div>
          </motion.div>

          {/* Métricas KPI General */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Tarjeta de Avance WBS Desplegable e Interactivo */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 transition-all hover:border-blue-300 dark:hover:border-blue-800/80">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandAvanceDetalle(!expandAvanceDetalle)}>
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 block">
                        Avance General de Asignaciones WBS
                      </span>
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {expandAvanceDetalle ? 'Ocultar Desglose' : 'Desplegar Proyectos'}
                      </span>
                    </div>
                    <span className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-medium">
                      {actividadesFinalizadas} de {actividades.length} actividades concluidas en plataforma
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                      {actividades.length > 0 ? Math.round((actividadesFinalizadas / actividades.length) * 100) : 0}%
                    </span>
                    <span className="text-[0.62rem] font-black text-zinc-400 uppercase">Completado</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandAvanceDetalle(!expandAvanceDetalle)}
                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-transform cursor-pointer"
                    title={expandAvanceDetalle ? 'Contraer desglose' : 'Expandir desglose por proyecto'}
                  >
                    <ChevronDown size={16} className={`transition-transform duration-300 ${expandAvanceDetalle ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Barra de Progreso Global */}
              <div 
                className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex cursor-pointer"
                onClick={() => setExpandAvanceDetalle(!expandAvanceDetalle)}
                title="Haz clic para ver el estado individual de cada proyecto"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${actividades.length > 0 ? (actividadesFinalizadas / actividades.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-emerald-500 shadow-2xs"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${actividades.length > 0 ? (actividadesEnProgreso / actividades.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className="h-full bg-blue-500"
                />
              </div>

              {/* Panel Desplegable Extendido por Proyecto */}
              <AnimatePresence>
                {expandAvanceDetalle && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Estado y Avance por Proyecto Asignado
                      </span>
                      <span className="text-[0.65rem] font-bold text-zinc-500">
                        {proyectosAgrupados.length} Proyectos Activos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {proyectosAgrupados.map((prj) => {
                        const totalAct = prj.actividades.length;
                        const pct = totalAct > 0 ? Math.round((prj.finalizadas / totalAct) * 100) : 0;
                        return (
                          <div 
                            key={prj.idProyecto}
                            className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-blue-400 transition-all flex flex-col justify-between space-y-2.5"
                          >
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[0.62rem] font-extrabold">
                                  PRJ-00{prj.idProyecto}
                                </span>
                                <span className="font-mono font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                                  {pct}%
                                </span>
                              </div>
                              <h5 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 truncate" title={prj.nombre}>
                                {prj.nombre}
                              </h5>
                              <p className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 truncate">
                                {prj.cliente}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex">
                                <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[0.62rem] text-zinc-500 font-mono font-bold">
                                <span>{prj.finalizadas}/{totalAct} cerradas</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProyectoSeleccionadoDev(prj.proyectoObj);
                                    setExpandAvanceDetalle(false);
                                  }}
                                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  Ver Tareas <ArrowRight size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tarjetas KPI Interactivas y Filtrables */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Botón KPI 1: Por Iniciar */}
              <button
                type="button"
                onClick={() => setKpiModalStatus('PENDIENTE')}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer text-left group relative overflow-hidden flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[0.65rem] font-extrabold text-zinc-400 uppercase tracking-wider block">Por Iniciar</span>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">{actividadesPendientes}</div>
                  <div className="flex items-center gap-1 text-[0.65rem] font-bold text-zinc-600 dark:text-zinc-300">
                    <span>Asignaciones en espera</span>
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors shadow-2xs">
                  <Clock size={20} />
                </div>
              </button>

              {/* Botón KPI 2: En Desarrollo */}
              <button
                type="button"
                onClick={() => setKpiModalStatus('EN_PROGRESO')}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800/60 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer text-left group relative overflow-hidden flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[0.65rem] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">En Desarrollo</span>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">{actividadesEnProgreso}</div>
                  <div className="flex items-center gap-1 text-[0.65rem] font-bold text-blue-600 dark:text-blue-400">
                    <span>Trabajo activo en curso</span>
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors shadow-2xs">
                  <Activity size={20} />
                </div>
              </button>

              {/* Botón KPI 3: Completadas */}
              <button
                type="button"
                onClick={() => setKpiModalStatus('FINALIZADA')}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/60 shadow-xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer text-left group relative overflow-hidden flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[0.65rem] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Completadas</span>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">{actividadesFinalizadas}</div>
                  <div className="flex items-center gap-1 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Verificadas y cerradas</span>
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors shadow-2xs">
                  <CheckCircle2 size={20} />
                </div>
              </button>
            </div>
          </motion.div>

          {/* VISTA NIVEL 1: CATÁLOGO DE PROYECTOS ASIGNADOS AL DESARROLLADOR */}
          {!proyectoSeleccionadoDev && (
            <div className="space-y-6">
              
              {/* Notificación Destacada de Nuevas Asignaciones (< 24h) */}
              {totalNuevasGlobales > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                      Tiene <strong className="font-extrabold underline">{totalNuevasGlobales} nueva(s) tarea(s)</strong> asignada(s) en las últimas 24 horas.
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[0.62rem] font-black tracking-wider uppercase shadow-2xs">
                    Notificación Reciente
                  </span>
                </div>
              )}

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 flex-wrap">
                
                {/* Segmented Filter Control: Activos vs Finalizados/Archivados */}
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoActividades('ACTIVOS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      filtroEstadoProyectoActividades === 'ACTIVOS'
                        ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Proyectos Activos</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[0.65rem] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {conteoProyectosActivos}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoActividades('FINALIZADOS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      filtroEstadoProyectoActividades === 'FINALIZADOS'
                        ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-amber-500/30'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <FolderGit2 size={13} className="text-amber-500" />
                    <span>Finalizados / Archivados</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[0.65rem] font-mono bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {conteoProyectosFinalizados}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoActividades('TODOS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      filtroEstadoProyectoActividades === 'TODOS'
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-500/30'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <span>Todos</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[0.65rem] font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {proyectosAgrupados.length}
                    </span>
                  </button>
                </div>

                <div className="relative flex-1 min-w-[240px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={searchProjectQuery}
                    onChange={(e) => setSearchProjectQuery(e.target.value)}
                    placeholder="Buscar por proyecto o cliente asignado..."
                    className="input-field pl-10 pr-9 py-2 text-xs font-medium"
                  />
                  {searchProjectQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchProjectQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="text-xs text-zinc-500 font-medium">
                  Proyectos Mostrados: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{proyectosFiltrados.length}</strong>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : proyectosFiltrados.length === 0 ? (
                <EmptyState
                  icon={FolderGit2}
                  title={filtroEstadoProyectoActividades === 'FINALIZADOS' ? 'No hay proyectos archivados' : 'No hay proyectos asignados'}
                  description={
                    filtroEstadoProyectoActividades === 'FINALIZADOS'
                      ? 'No tiene proyectos concluidos o archivados en su historial.'
                      : 'No tiene actividades vinculadas a proyectos en este filtro.'
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proyectosFiltrados.map(prj => {
                    const totalTasks = prj.actividades.length;
                    const percentComplete = totalTasks > 0 ? Math.round((prj.finalizadas / totalTasks) * 100) : 0;
                    const nuevasCount = prj.actividades.filter(a => evaluarSiEsNuevaAsignacion24h(a)).length;
                    const hasActiveNew = nuevasCount > 0;

                    return (
                      <motion.div
                        key={prj.idProyecto}
                        whileHover={{ y: -3, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          setProyectoSeleccionadoDev(prj);
                          setEstadoFilter('TODAS');
                          setSearchTaskQuery('');
                        }}
                        className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-200 space-y-5 relative ${
                          hasActiveNew
                            ? 'border-2 border-emerald-500/80 dark:border-emerald-400 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/10'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400'
                        }`}
                      >
                        <div className="space-y-3">
                          {hasActiveNew && (
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-[0.68rem] flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-extrabold">
                              <span className="flex items-center gap-1.5 font-mono">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                {nuevasCount} NUEVA(S) ASIGNACIÓN(ES)
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[0.58rem]">
                                Alerta 24h
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="font-mono text-[0.65rem] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                                PRJ-00{prj.idProyecto}
                              </span>
                              <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 mt-2 leading-snug">
                                {prj.nombre}
                              </h3>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold border uppercase flex items-center gap-1 ${
                              esProyectoFinalizado(prj.proyectoObj || prj)
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40'
                                : prj.estado === 'EN_PAUSA'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {esProyectoFinalizado(prj.proyectoObj || prj) && <FolderGit2 size={10} />}
                              {esProyectoFinalizado(prj.proyectoObj || prj) ? 'Archivado' : prj.estado || 'ACTIVO'}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            Cliente: <strong className="text-zinc-700 dark:text-zinc-300">{prj.cliente}</strong>
                          </p>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[0.68rem] font-bold">
                              <span className="text-zinc-500 dark:text-zinc-400">Progreso del Proyecto</span>
                              <span className="text-blue-600 dark:text-blue-400 font-mono">{percentComplete}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500"
                                style={{ width: `${percentComplete}%` }}
                              />
                            </div>
                          </div>

                          {/* Métricas de 4 Cuadros: Total, Activas, Nuevas 24h, Hechas */}
                          <div className="grid grid-cols-4 gap-1.5 pt-2 text-center text-[0.65rem]">
                            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                              <span className="text-zinc-400 block text-[0.58rem] uppercase font-bold">Total</span>
                              <strong className="text-zinc-900 dark:text-zinc-100 font-mono text-xs">{totalTasks}</strong>
                            </div>
                            <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
                              <span className="text-amber-700 dark:text-amber-300 block text-[0.58rem] uppercase font-bold">Activas</span>
                              <strong className="text-amber-800 dark:text-amber-300 font-mono text-xs">{prj.pendientes + prj.enProgreso}</strong>
                            </div>
                            <div className={`p-2 rounded-xl border ${
                              nuevasCount > 0 
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 font-bold' 
                                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-700/60'
                            }`}>
                              <span className={`${nuevasCount > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-400'} block text-[0.58rem] uppercase font-bold`}>
                                Nuevas
                              </span>
                              <strong className={`${nuevasCount > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-900 dark:text-zinc-100'} font-mono text-xs`}>
                                {nuevasCount}
                              </strong>
                            </div>
                            <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60">
                              <span className="text-blue-700 dark:text-blue-300 block text-[0.58rem] uppercase font-bold">Hechas</span>
                              <strong className="text-blue-800 dark:text-blue-300 font-mono text-xs">{prj.finalizadas}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            type="button"
                            className="w-full gradient-button text-xs py-2.5 px-4 font-bold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <span>Ver Actividades del Proyecto</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VISTA NIVEL 2: DETALLE DE TAREAS DEL PROYECTO SELECCIONADO */}
          {proyectoSeleccionadoDev && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setProyectoSeleccionadoDev(null)}
                    className="outline-button text-xs py-2 px-3.5 font-extrabold inline-flex items-center gap-1.5 rounded-2xl cursor-pointer"
                  >
                    <ArrowLeft size={15} />
                    <span>Volver a Mis Proyectos</span>
                  </button>
                  <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.68rem] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                        PRJ-00{proyectoSeleccionadoDev.idProyecto}
                      </span>
                      <h2 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                        {proyectoSeleccionadoDev.nombre}
                      </h2>
                    </div>
                    <span className="text-xs text-zinc-500 font-medium">
                      Cliente: {proyectoSeleccionadoDev.cliente}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-bold text-zinc-500">
                    Tareas en este proyecto: <strong className="text-blue-600 dark:text-blue-400">{actividadesDelProyectoSeleccionado.length}</strong>
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={searchTaskQuery}
                      onChange={(e) => setSearchTaskQuery(e.target.value)}
                      placeholder="Buscar actividad en este proyecto..."
                      className="input-field pl-10 pr-9 py-2 text-xs font-medium"
                    />
                    {searchTaskQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchTaskQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="relative flex-1 sm:flex-initial min-w-[180px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                      <SlidersHorizontal size={14} />
                    </div>
                    <select
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                      className="input-field pl-9 py-2 text-xs font-bold appearance-none cursor-pointer"
                    >
                      <option value="RECIENTES">Más Recientes primero</option>
                      <option value="ANTIGUAS">Más Antiguas primero</option>
                      <option value="DESCRIPCION">Ordenar por Descripción</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
                      <Filter size={11} /> Estado Tarea:
                    </span>

                    {[
                      { key: 'TODAS', label: 'Todas', count: actividadesDelProyectoSeleccionado.length },
                      { key: 'PENDIENTE', label: 'Pendientes', count: actividadesDelProyectoSeleccionado.filter(a => a.estado === 'PENDIENTE').length },
                      { key: 'EN_PROGRESO', label: 'En Progreso', count: actividadesDelProyectoSeleccionado.filter(a => a.estado === 'EN_PROGRESO' || a.estado === 'EN_CURSO').length },
                      { key: 'FINALIZADA', label: 'Finalizadas', count: actividadesDelProyectoSeleccionado.filter(a => a.estado === 'FINALIZADA' || a.estado === 'COMPLETADA').length }
                    ].map(tab => {
                      const isActive = estadoFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setEstadoFilter(tab.key)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                            isActive
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-md font-mono text-[0.65rem] font-bold ${
                            isActive ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-zinc-500 font-medium text-xs">
                    Mostrando <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{actividadesFiltradasYOrdenadas.length}</strong> de <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{actividadesDelProyectoSeleccionado.length}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {actividadesFiltradasYOrdenadas.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="Sin tareas encontradas"
                    description="No hay actividades asignadas que coincidan con los filtros dentro de este proyecto."
                  />
                ) : (
                  actividadesFiltradasYOrdenadas.map(act => {
                    const { isReassigned, motivo, cleanDescripcion } = parseReasignacion(act.descripcion);
                    const isNuevaAsignacion = evaluarSiEsNuevaAsignacion24h(act);
                    const isProyectoPausado = act.etapa?.proyecto?.estado === 'EN_PAUSA' || act.etapa?.proyecto?.estado === 'PAUSADO' || act.proyectoObj?.estado === 'EN_PAUSA' || act.proyectoObj?.estado === 'PAUSADO' || act.proyectoEstado === 'EN_PAUSA' || act.proyectoEstado === 'PAUSADO';

                    return (
                      <div 
                        key={act.idActividad}
                        className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 space-y-4 h-full relative ${
                          changingEstado === act.idActividad 
                            ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30' 
                            : isNuevaAsignacion
                            ? 'border-2 border-emerald-500/90 dark:border-emerald-400 ring-4 ring-emerald-500/15 shadow-lg shadow-emerald-500/10'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div>
                          {isNuevaAsignacion && (
                            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 dark:border-emerald-400 mb-3 text-[0.7rem] flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
                                <span className="relative flex h-2.5 w-2.5 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="tracking-wide uppercase font-mono text-[0.65rem] flex items-center gap-1">
                                  <Sparkles size={11} className="text-emerald-600 dark:text-emerald-400" />
                                  NUEVA ASIGNACIÓN ACTIVA
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[0.6rem] font-black shadow-2xs">
                                Alerta 24h
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <span className="text-[0.65rem] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                                {act.etapa?.nombreEtapa || act.etapa?.nombre || 'Etapa WBS'}
                              </span>
                            </div>
                            <EstadoBadge estado={act.estado} />
                          </div>

                          {isProyectoPausado && (
                            <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 mb-3 text-xs space-y-1 font-medium text-amber-900 dark:text-amber-200 shadow-2xs">
                              <div className="flex items-center gap-1.5 font-extrabold text-amber-800 dark:text-amber-300">
                                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
                                <span>PROYECTO PAUSADO POR COORDINACIÓN</span>
                              </div>
                              <p className="text-[0.68rem] leading-snug text-amber-800/90 dark:text-amber-200/90 font-medium">
                                Esta tarea no se puede avanzar ni finalizar porque el proyecto principal se encuentra pausado temporalmente.
                              </p>
                            </div>
                          )}

                          {isReassigned && (
                            <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 mb-3 text-[0.7rem]">
                              <div className="flex items-center gap-1.5 font-extrabold text-blue-700 dark:text-blue-300">
                                <RotateCcw size={12} /> Tarea Reasignada por el Líder
                              </div>
                              {motivo && (
                                <div className="text-zinc-600 dark:text-zinc-300 mt-1 italic leading-snug">
                                  "{motivo}"
                                </div>
                              )}
                            </div>
                          )}

                          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-snug">
                            {cleanDescripcion}
                          </h3>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetalleModalDoc(act)}
                              className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex-1 justify-center"
                              title="Ver especificación completa y detalles"
                            >
                              <Eye size={13} />
                              <span>Ver Detalles</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAbrirReporteErrorDesdeTarea(act)}
                              disabled={isProyectoPausado}
                              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title={isProyectoPausado ? 'Proyecto Pausado' : 'Reportar error en esta etapa WBS'}
                            >
                              <Bug size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAbrirInterrupcionDesdeTarea(act)}
                              disabled={isProyectoPausado}
                              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              title={isProyectoPausado ? 'Proyecto Pausado' : 'Registrar interrupción en esta etapa WBS'}
                            >
                              <Clock size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {act.estado === 'PENDIENTE' && (
                              <button
                                type="button"
                                onClick={() => handleCambiarEstado(act.idActividad, 'EN_PROGRESO')}
                                disabled={changingEstado === act.idActividad || isProyectoPausado}
                                className="gradient-button text-xs py-2 px-3 font-bold w-full justify-center inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isProyectoPausado ? 'El proyecto se encuentra pausado por Coordinación' : 'Iniciar trabajo'}
                              >
                                {changingEstado === act.idActividad ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                                <span>{isProyectoPausado ? 'Proyecto Pausado' : 'Iniciar Trabajo'}</span>
                              </button>
                            )}

                            {(act.estado === 'EN_PROGRESO' || act.estado === 'EN_CURSO') && (
                              <button
                                type="button"
                                onClick={() => handleCambiarEstado(act.idActividad, 'FINALIZADA')}
                                disabled={changingEstado === act.idActividad || isProyectoPausado}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3 font-bold rounded-2xl transition-all shadow-md inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isProyectoPausado ? 'El proyecto se encuentra pausado por Coordinación' : 'Marcar como completada'}
                              >
                                {changingEstado === act.idActividad ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                <span>{isProyectoPausado ? 'Proyecto Pausado' : 'Marcar Completada'}</span>
                              </button>
                            )}

                            {(act.estado === 'FINALIZADA' || act.estado === 'COMPLETADA') && (
                              <div className="w-full p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[0.7rem] font-extrabold text-emerald-800 dark:text-emerald-300 text-center flex items-center justify-center gap-1.5">
                                <CheckCircle2 size={14} />
                                <span>Actividad Finalizada</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </motion.div>
      )}



      {/* Pestaña: Módulo para registrar incidencias e interrupciones */}
      {(activeTab === 'reportar' || activeTab === 'interrupciones' || activeTab === 'contingencias') && (
        <motion.div 
          key="reportar"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              Control de Calidad y Rendimiento
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Módulo de Reportes de Incidencias e Interrupciones
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Alimente el motor predictivo de riesgos reportando hallazgos técnicos y contingencias — Persistencia directa en PostgreSQL
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta Reportar Error */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white mb-4">
                  <Bug size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Reportar Error Técnico</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Registre cualquier fallo de lógica, sintaxis, concurrencia o validación. Clasifique la severidad (Baja, Media, Alta, Crítica) para recalibrar el Semáforo de Riesgos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setEtapaPreseleccionada(null); setShowErrorModal(true); }}
                className="outline-button w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus size={16} /> Abrir Formulario de Errores
              </button>
            </div>

            {/* Tarjeta Reportar Contingencia */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Registrar Interrupción / Tiempos Muertos</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Notifique fallas de suministro eléctrico, caídas de servidores, problemas de ISP o indisponibilidad de dependencias indicando los minutos de inactividad.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setEtapaPreseleccionada(null); setShowInterrupcionModal(true); }}
                className="gradient-button w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Plus size={16} /> Abrir Formulario de Contingencias
              </button>
            </div>

            {/* Panel Informativo — Métricas Rápidas y Accesos (llena el espacio vacío) */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-blue-200/60 dark:border-blue-800/40 shadow-sm flex flex-col justify-between h-full hover:border-blue-400/60 dark:hover:border-blue-600/50 transition-all duration-200">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Activity size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Estado de tu Capacidad</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Resumen operativo de tu productividad y contribución al motor predictivo del proyecto.
                </p>

                {/* Mini-métricas con acento azul */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50">
                    <span className="text-[0.65rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tareas Activas</span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                      {(actividades || []).filter(a => a?.estado === 'EN_PROGRESO').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50">
                    <span className="text-[0.65rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Errores Reportados</span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                      {(misReportes?.errores || []).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50">
                    <span className="text-[0.65rem] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Interrupciones</span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                      {(misReportes?.interrupciones || []).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => { if (setActiveTab) setActiveTab('historial'); }}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 uppercase tracking-wider transition-colors cursor-pointer py-2"
                >
                  <FileText size={14} /> Ver Historial Completo <ArrowRight size={13} />
                </button>
              </div>
            </div>

          </motion.div>

        </motion.div>
      )}

      {/* Pestaña: Historial y trazabilidad de reportes del desarrollador */}
      {activeTab === 'historial' && (
        <motion.div 
          key="historial"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header del Historial */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Trazabilidad Bidireccional
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Historial de Mis Reportes
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Consulte la trazabilidad de errores, contingencias y la resolución de su Líder de Proyecto
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cargarMisReportes}
                disabled={loadingReportes}
                className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingReportes ? 'animate-spin' : ''} /> Actualizar
              </button>
            </div>
          </motion.div>

          {/* Barra de Herramientas Interactiva y Colorida (HU-17 / RF-22 a RF-24) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4"
          >
            {/* Fila 1: Pestañas de Tipo de Evento (Vibrantes con Color) + Buscador + Conmutador Grid/List */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Pestañas de Tipo de Evento Coloridas e Interactivas */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFiltroHistorial('TODOS')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    filtroHistorial === 'TODOS'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <Layers size={14} />
                  <span>Todos los Reportes</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-mono font-black ${
                    filtroHistorial === 'TODOS'
                      ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {(misReportes?.errores?.length || 0) + (misReportes?.interrupciones?.length || 0)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroHistorial('ERRORES')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    filtroHistorial === 'ERRORES'
                      ? 'bg-red-600 text-white border-red-600 dark:bg-red-600 dark:text-white shadow-sm'
                      : 'bg-red-50/70 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60 border-red-200 dark:border-red-800/60'
                  }`}
                >
                  <Bug size={14} />
                  <span>Errores Técnicos</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-mono font-black ${
                    filtroHistorial === 'ERRORES'
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                  }`}>
                    {misReportes.errores?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroHistorial('INTERRUPCIONES')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    filtroHistorial === 'INTERRUPCIONES'
                      ? 'bg-amber-600 text-white border-amber-600 dark:bg-amber-600 dark:text-white shadow-sm'
                      : 'bg-amber-50/70 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60 border-amber-200 dark:border-amber-800/60'
                  }`}
                >
                  <AlertTriangle size={14} />
                  <span>Interrupciones</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-mono font-black ${
                    filtroHistorial === 'INTERRUPCIONES'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
                  }`}>
                    {misReportes.interrupciones?.length || 0}
                  </span>
                </button>
              </div>

              {/* Buscador y Conmutador Grid/List en el extremo derecho */}
              <div className="flex items-center gap-2 flex-1 lg:flex-initial">
                
                {/* Buscador Rápido */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={searchReportQuery}
                    onChange={(e) => setSearchReportQuery(e.target.value)}
                    placeholder="Buscar por descripción, etapa o nota..."
                    className="input-field pl-9 pr-8 py-2 text-xs font-medium"
                  />
                  {searchReportQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchReportQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Conmutador de Vistas Grid/List Integrado */}
                <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setReportViewMode('grid')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      reportViewMode === 'grid'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                    title="Vista en Tarjetas (Grid)"
                  >
                    <LayoutGrid size={14} />
                    <span className="hidden sm:inline">Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportViewMode('list')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      reportViewMode === 'list'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                    title="Vista en Tabla (List)"
                  >
                    <List size={14} />
                    <span className="hidden sm:inline">Tabla</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Fila 2: Selectores Desplegables Enterprise con Íconos Vectoriales y Micro-Badges (SIN SELECT NATIVOS) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              
              {/* Selectores Desplegables Enterprise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1 w-full">
                
                {/* Selector 0: Estado de Proyectos (Activos por defecto vs Archivados) */}
                <CustomDropdown
                  icon={Briefcase}
                  iconColor="text-blue-500"
                  label="Estado del Proyecto"
                  value={filtroEstadoProyectoReportes}
                  onChange={setFiltroEstadoProyectoReportes}
                  options={[
                    { value: 'ACTIVOS', label: 'Proyectos Activos (Por defecto)', badgeColor: 'bg-emerald-500' },
                    { value: 'FINALIZADOS', label: 'Finalizados / Archivados', badgeColor: 'bg-amber-500' },
                    { value: 'TODOS', label: 'Todos los Proyectos', badgeColor: 'bg-blue-500' }
                  ]}
                />

                {/* Selector 1: Severidad (Errores/Todos) o Duración (Interrupciones) */}
                {filtroHistorial === 'INTERRUPCIONES' ? (
                  <CustomDropdown
                    icon={Clock}
                    iconColor="text-amber-500"
                    label="Duración de Bloqueo"
                    value={filtroDuracion}
                    onChange={setFiltroDuracion}
                    options={[
                      { value: 'TODAS', label: 'Cualquier Duración', badgeColor: 'bg-zinc-400' },
                      { value: 'CORTA', label: 'Corta (Hasta 30 min)', badgeColor: 'bg-emerald-500' },
                      { value: 'MEDIA', label: 'Media (30 a 60 min)', badgeColor: 'bg-amber-500' },
                      { value: 'LARGA', label: 'Larga (Más de 60 min)', badgeColor: 'bg-red-500' }
                    ]}
                  />
                ) : (
                  <CustomDropdown
                    icon={ShieldAlert}
                    iconColor="text-red-500"
                    label="Grado de Severidad"
                    value={filtroSeveridad}
                    onChange={setFiltroSeveridad}
                    options={[
                      { value: 'TODAS', label: 'Todas las Severidades', badgeColor: 'bg-zinc-400' },
                      { value: 'CRITICA', label: 'Crítica (Prioridad Máxima)', badgeColor: 'bg-red-500' },
                      { value: 'ALTA', label: 'Alta (Atención Requerida)', badgeColor: 'bg-orange-500' },
                      { value: 'MEDIA', label: 'Media (Impacto Moderado)', badgeColor: 'bg-amber-500' },
                      { value: 'BAJA', label: 'Baja (Menor Severidad)', badgeColor: 'bg-blue-500' }
                    ]}
                  />
                )}

                {/* Selector 2: Estado de Atención */}
                <CustomDropdown
                  icon={Activity}
                  iconColor="text-blue-500"
                  label="Estado de Flujo"
                  value={filtroEstadoAtencion}
                  onChange={setFiltroEstadoAtencion}
                  options={[
                    { value: 'TODOS', label: 'Todos los Estados', badgeColor: 'bg-zinc-400' },
                    { value: 'REGISTRADO', label: 'Registrado', badgeColor: 'bg-zinc-500', icon: Clock },
                    { value: 'EN_REVISION', label: 'En Revisión / Análisis', badgeColor: 'bg-blue-500', icon: Eye },
                    { value: 'SOLUCIONADO', label: 'Solucionado', badgeColor: 'bg-emerald-500', icon: CheckCircle2 }
                  ]}
                />

                {/* Selector 3: Ordenamiento Dinámico */}
                <CustomDropdown
                  icon={SlidersHorizontal}
                  iconColor="text-zinc-400"
                  label="Criterio de Orden"
                  value={ordenarReportesPor}
                  onChange={setOrdenarReportesPor}
                  options={[
                    { value: 'RECIENTES', label: 'Más Recientes primero', icon: Clock },
                    { value: 'ANTIGUOS', label: 'Más Antiguos primero', icon: RotateCcw },
                    filtroHistorial === 'INTERRUPCIONES'
                      ? { value: 'DURACION', label: 'Mayor Duración primero', icon: Clock, badgeColor: 'bg-amber-500' }
                      : { value: 'SEVERIDAD', label: 'Por Mayor Severidad', icon: ShieldAlert, badgeColor: 'bg-red-500' }
                  ]}
                />

              </div>

              {/* Contador de Resultados y Restablecer */}
              <div className="flex items-center gap-2 self-end sm:self-auto font-medium text-zinc-500 dark:text-zinc-400 text-xs shrink-0">
                <span>
                  Mostrando <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{listaReportesFiltradaYOrdenada.length}</strong> de <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{listaReportesUnificada.length}</strong> reportes
                </span>

                {activeReportFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearReportFilters}
                    className="text-[0.7rem] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer ml-2"
                  >
                    <RotateCcw size={11} /> Limpiar Filtros
                  </button>
                )}
              </div>

            </div>

          </motion.div>


          {/* Renderizado de Reportes (Vista Grid vs Vista Tabla List) */}
          <motion.div variants={itemVariants}>
            {loadingReportes && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <SkeletonCard rows={2} />
                <SkeletonCard rows={2} />
                <SkeletonCard rows={2} />
              </div>
            )}

            {/* Empty State General */}
            {!loadingReportes && listaReportesUnificada.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="Sin reportes registrados"
                description="Aún no ha registrado hallazgos técnicos o contingencias operativas. Cuando reporte un fallo, aparecerá en esta sección junto con la resolución del Líder de Proyecto."
              />
            )}

            {/* Empty State por Filtros */}
            {!loadingReportes && listaReportesUnificada.length > 0 && listaReportesFiltradaYOrdenada.length === 0 && (
              <EmptyState
                icon={Search}
                title="No se encontraron reportes"
                description="Ningún reporte coincide con los criterios de búsqueda, severidad o estado de atención seleccionados."
                action={
                  <button
                    type="button"
                    onClick={handleClearReportFilters}
                    className="outline-button text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RotateCcw size={14} /> Restablecer Filtros
                  </button>
                }
              />
            )}

            {/* OPCIÓN 1: VISTA EN TARJETAS RESPONSIVAS (GRID) */}
            {!loadingReportes && reportViewMode === 'grid' && listaReportesFiltradaYOrdenada.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {(listaReportesFiltradaYOrdenada || []).map(item => {
                  const isError = item?._tipo === 'ERROR';
                  const fechaStr = item?._fecha 
                    ? new Date(item._fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Fecha N/A';

                  return (
                    <div 
                      key={item?._id || item?.idInterrupcion || item?.idError || Math.random()}
                      className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between space-y-4 h-full"
                    >
                      <div>
                        {/* Header de la Tarjeta de Reporte */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isError ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                            }`}>
                              {isError ? <Bug size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                                {isError 
                                  ? `Error: ${item?.tipoError || 'N/A'}` 
                                  : `Interrupción: ${(item?.tipoInterrupcion || 'GENERAL').replace(/_/g, ' ')}`
                                }
                              </h4>
                              {isError ? (
                                <span className="text-[0.6rem] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                                  {item?.severidad || 'MEDIA'}
                                </span>
                              ) : (
                                <span className="text-[0.6rem] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                                  {item?.duracionMinutos || 0} min
                                </span>
                              )}
                            </div>
                          </div>

                          <EstadoAtencionBadge estado={item?.estadoAtencion} />
                        </div>

                        {/* Descripción / Comentarios */}
                        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans mb-3">
                          {item?.descripcion || item?.comentarios || 'Sin detalles registrados.'}
                        </div>

                        {/* Respuesta / Acción Correctiva del Líder */}
                        {item?.resolucionNota && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-extrabold text-blue-800 dark:text-blue-300 text-[0.7rem]">
                              <Info size={13} /> Acción Correctiva del Líder:
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 italic">
                              "{item.resolucionNota}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pie de la Tarjeta: Metadatos de Fecha y Etapa WBS */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[0.65rem] text-zinc-400 font-medium gap-2">
                        <span className="truncate max-w-[200px] flex items-center gap-1">
                          {esProyectoFinalizado(item?.etapa?.proyecto || item?.proyectoObj) && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20 text-[0.58rem] shrink-0">
                                            Archivado
                            </span>
                          )}
                          <span className="truncate">
                            {item?.etapa?.proyecto?.nombre ? `${item.etapa.proyecto.nombre} • ` : ''}{item?.etapa?.nombreEtapa || item?.etapa?.nombre || 'Etapa WBS'}
                          </span>
                        </span>
                        <span>{fechaStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* OPCIÓN 2: VISTA EN TABLA COMPACTA (LIST) */}
            {!loadingReportes && reportViewMode === 'list' && listaReportesFiltradaYOrdenada.length > 0 && (
              <div className="overflow-x-auto w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <table className="w-full text-left text-xs min-w-[800px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-extrabold uppercase text-[0.65rem] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">Tipo / Clasificación</th>
                      <th className="py-3.5 px-4">Severidad / Duración</th>
                      <th className="py-3.5 px-4">Descripción & Respuesta</th>
                      <th className="py-3.5 px-4">Etapa WBS</th>
                      <th className="py-3.5 px-4">Fecha UTC / Registro</th>
                      <th className="py-3.5 px-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    {(listaReportesFiltradaYOrdenada || []).map(item => {
                      const isError = item?._tipo === 'ERROR';
                      const fechaStr = item?._fecha 
                        ? new Date(item._fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'Fecha N/A';

                      return (
                        <tr key={item?._id || item?.idInterrupcion || item?.idError || Math.random()} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                              {isError ? <Bug size={14} className="text-red-500" /> : <AlertTriangle size={14} className="text-amber-500" />}
                              <span>
                                {isError 
                                  ? `Error: ${item?.tipoError || 'N/A'}` 
                                  : `Interrupción: ${(item?.tipoInterrupcion || 'GENERAL').replace(/_/g, ' ')}`
                                }
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isError ? (
                              <span className="font-mono text-[0.65rem] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                {item?.severidad || 'MEDIA'}
                              </span>
                            ) : (
                              <span className="font-mono text-[0.65rem] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                {item?.duracionMinutos || 0} min
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-zinc-700 dark:text-zinc-300 truncate" title={item?.descripcion || item?.comentarios || 'N/A'}>
                              {item?.descripcion || item?.comentarios || 'Sin detalles'}
                            </p>
                            {item?.resolucionNota && (
                              <span className="text-[0.65rem] text-blue-600 dark:text-blue-400 font-bold block truncate" title={`Líder: "${item.resolucionNota}"`}>
                                Líder: "{item.resolucionNota}"
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-bold">
                            <div className="flex items-center gap-1.5">
                              {esProyectoFinalizado(item?.etapa?.proyecto || item?.proyectoObj) && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[0.6rem] font-mono font-black border border-amber-500/20 shrink-0">
                                                Archivado
                                </span>
                              )}
                              <span>{item?.etapa?.nombreEtapa || item?.etapa?.nombre || 'Etapa WBS'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 text-[0.7rem] font-mono">
                            {fechaStr}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <EstadoAtencionBadge estado={item?.estadoAtencion} />
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

      {/* Modal: Explorador y Gestor Rápido de Actividades por Estado (KPI Interactivo) */}
      <AnimatePresence>
        {kpiModalStatus && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 w-[95%] sm:w-full max-w-4xl shadow-2xl space-y-5 max-h-[90dvh] flex flex-col"
            >
              {/* Header Modal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs ${
                    kpiModalStatus === 'PENDIENTE' 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' 
                      : kpiModalStatus === 'EN_PROGRESO' 
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' 
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {kpiModalStatus === 'PENDIENTE' && <Clock size={20} />}
                    {kpiModalStatus === 'EN_PROGRESO' && <Activity size={20} />}
                    {kpiModalStatus === 'FINALIZADA' && <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      {kpiModalStatus === 'PENDIENTE' && 'Asignaciones Por Iniciar'}
                      {kpiModalStatus === 'EN_PROGRESO' && 'Trabajo Activo En Desarrollo'}
                      {kpiModalStatus === 'FINALIZADA' && 'Actividades Concluidas y Verificadas'}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Listado directo de {actividadesKpiModal.length} tarea(s) en estado{' '}
                      <strong className="font-bold text-zinc-700 dark:text-zinc-300">
                        {kpiModalStatus === 'PENDIENTE' ? 'PENDIENTE' : kpiModalStatus === 'EN_PROGRESO' ? 'EN PROGRESO' : 'FINALIZADA'}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setKpiModalStatus(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Lista de Actividades en Scrollable Container */}
              <div className="overflow-y-auto flex-1 pr-1 space-y-3.5">
                {actividadesKpiModal.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <CheckCircle size={32} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                      No hay actividades registradas en este estado.
                    </p>
                  </div>
                ) : (
                  actividadesKpiModal.map((act) => {
                    const prj = act.etapa?.proyecto || act.proyectoObj || {};
                    const { isReassigned, motivo, cleanDescripcion } = parseReasignacion(act.descripcion);
                    return (
                      <div
                        key={act.idActividad}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-blue-400 dark:hover:border-blue-700 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                              #{act.idActividad}
                            </span>
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                              {act.nombreActividad || cleanDescripcion || 'Tarea WBS'}
                            </span>
                            <EstadoBadge estado={act.estado} />
                          </div>

                          <div className="flex items-center gap-2 text-[0.68rem] text-zinc-500 font-medium">
                            <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
                              PRJ-00{prj.idProyecto || '1'}
                            </span>
                            <span>•</span>
                            <span>{prj.nombre || 'Proyecto General'}</span>
                          </div>
                        </div>

                        {cleanDescripcion && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            {cleanDescripcion}
                          </p>
                        )}

                        {/* Barra de Acciones Directas en la Tarea */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-[0.65rem] text-zinc-400 font-mono font-bold">
                            Etapa: {act.etapa?.nombreEtapa || '#Etapa 1'}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setKpiModalStatus(null);
                                setDetalleModalDoc(act);
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <FileText size={13} /> Especificación
                            </button>

                            {act.estado === 'PENDIENTE' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await handleCambiarEstado(act.idActividad, 'EN_PROGRESO');
                                  setKpiModalStatus(null);
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                              >
                                <Activity size={13} /> Iniciar Trabajo
                              </button>
                            )}

                            {(act.estado === 'EN_PROGRESO' || act.estado === 'EN_CURSO') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setKpiModalStatus(null);
                                    handleAbrirErrorDesdeTarea(act);
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Bug size={13} /> Reportar Error
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await handleCambiarEstado(act.idActividad, 'FINALIZADA');
                                    setKpiModalStatus(null);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                                >
                                  <CheckCircle2 size={13} /> Finalizar Tarea
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Modal */}
              <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setKpiModalStatus(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Detalle completo de la tarea y especificación técnica extendida */}
      <AnimatePresence>
        {detalleModalDoc && (() => {
          const { isReassigned, motivo, cleanDescripcion } = parseReasignacion(detalleModalDoc.descripcion);
          const prj = detalleModalDoc.etapa?.proyecto || detalleModalDoc.proyectoObj || {};

          return (
            <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-[95%] sm:w-full max-w-3xl shadow-2xl space-y-6 max-h-[92dvh] overflow-y-auto"
              >
                {/* Header del Modal (Sin botón X) */}
                <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.68rem] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                          PRJ-00{prj.idProyecto || prj.id || '1'}
                        </span>
                        <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                          Especificación Técnica de la Tarea #{detalleModalDoc.idActividad}
                        </h3>
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Proyecto: <strong className="text-zinc-700 dark:text-zinc-300">{prj.nombre || 'Sistema IKernell Software'}</strong> • Cliente: <strong>{prj.cliente || 'Empresa Corporativa'}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <EstadoBadge estado={detalleModalDoc.estado} />
                  </div>
                </div>

                {/* Banner Trazabilidad: Reasignación */}
                {isReassigned && (
                  <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 font-black text-xs text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      <RotateCcw size={14} /> Tarea Reasignada por la Dirección / Líder de Proyecto
                    </div>
                    {motivo && (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                        <strong>Motivo de Reasignación:</strong> "{motivo}"
                      </p>
                    )}
                  </div>
                )}

                {/* Grid de 4 Bloques con Información Detallada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Bloque 1: Etapa WBS y Contexto del Proyecto */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-[0.68rem] uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <Layers size={13} /> Etapa WBS & Contexto
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[0.62rem]">Fase Operativa:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 text-xs block">
                        {detalleModalDoc.etapa?.nombreEtapa || '#Etapa WBS ' + (detalleModalDoc.etapa?.idEtapa || '1')}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/50 text-[0.68rem]">
                      <span className="text-zinc-500 font-medium">Estado del Proyecto:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase">{prj.estado || 'ACTIVO'}</span>
                    </div>
                  </div>

                  {/* Bloque 2: Desarrollador Responsable & Stack */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-[0.68rem] uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <User size={13} /> Asignación & Perfil Técnico
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[0.62rem]">Desarrollador Responsable:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 text-xs block">
                        {user?.nombre || 'Desarrollador'} {user?.apellido || 'Senior'}
                      </strong>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {['React.js', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'PostgreSQL', 'UI/UX'].map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 text-[0.58rem] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bloque 3: Indicadores de Salud Operativa */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-[0.68rem] uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <Activity size={13} /> SLA & Control de Calidad
                    </div>
                    <div className="flex items-center justify-between text-[0.68rem]">
                      <span className="text-zinc-500 font-medium">Criterio de Calidad:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Zero Critical Bugs</span>
                    </div>
                    <div className="flex items-center justify-between text-[0.68rem]">
                      <span className="text-zinc-500 font-medium">Trazabilidad WBS:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">RF-21 • AUDITABLE</span>
                    </div>
                  </div>

                  {/* Bloque 4: Tiempos de Registro & Estado */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-[0.68rem] uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <Clock size={13} /> Registro & Timestamp
                    </div>
                    <div className="flex items-center justify-between text-[0.68rem]">
                      <span className="text-zinc-500 font-medium">Fecha de Asignación:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">
                        {detalleModalDoc.fechaAsignacion ? new Date(detalleModalDoc.fechaAsignacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[0.68rem]">
                      <span className="text-zinc-500 font-medium">Prioridad Estimada:</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[0.6rem]">
                        ALTA
                      </span>
                    </div>
                  </div>

                </div>

                {/* Especificación Extendida del Requerimiento */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600 dark:text-blue-400" /> Descripción Completa del Requerimiento Técnico:
                  </label>
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans font-medium">
                    {cleanDescripcion}
                  </div>
                </div>

                {/* Estándares de Entrega y Calidad */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[0.68rem] text-zinc-600 dark:text-zinc-400 space-y-1">
                  <span className="font-extrabold text-blue-700 dark:text-blue-300 block uppercase tracking-wider">
                    Estándares de Entrega Requeridos:
                  </span>
                  <p className="leading-snug">
                    Asegúrese de realizar pruebas unitarias antes de cambiar el estado a <strong>FINALIZADA</strong>. Si surgen impedimentos de infraestructura o fallas de terceros, utilice el botón de <strong>Registrar Interrupción</strong> o <strong>Reportar Error</strong>.
                  </p>
                </div>

                {/* Acciones Rápidas en la parte inferior */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const act = detalleModalDoc;
                        setDetalleModalDoc(null);
                        handleAbrirReporteErrorDesdeTarea(act);
                      }}
                      className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Bug size={14} /> Reportar Error
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const act = detalleModalDoc;
                        setDetalleModalDoc(null);
                        handleAbrirInterrupcionDesdeTarea(act);
                      }}
                      className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    >
                      <Clock size={14} /> Interrupción
                    </button>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    {detalleModalDoc.estado === 'PENDIENTE' && (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(detalleModalDoc.idActividad, 'EN_PROGRESO')}
                        className="gradient-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Play size={13} /> Iniciar Tarea
                      </button>
                    )}
                    {(detalleModalDoc.estado === 'EN_PROGRESO' || detalleModalDoc.estado === 'EN_CURSO') && (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(detalleModalDoc.idActividad, 'FINALIZADA')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 font-bold rounded-2xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check size={13} /> Finalizar Tarea
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDetalleModalDoc(null)}
                      className="outline-button text-xs py-2 px-5 font-bold cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Modal: Registro de error técnico (Edición Visión Elegante y Desplegables CustomSelect) */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 w-[95%] sm:w-full max-w-2xl sm:max-w-3xl shadow-2xl shadow-rose-950/15 max-h-[92dvh] overflow-y-auto"
            >
              {/* Header con Acento Sutil */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-xs">
                      <Bug size={20} />
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Reportar Error Técnico
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium ml-1">
                    Registra la anomalía técnica para alimentar la telemetría del Semáforo Predictivo.
                  </p>
                </div>
              </div>

              {/* Banner de Etapa Vinculada */}
              {etapaPreseleccionada && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-800 dark:text-blue-300 font-semibold mb-5 flex items-center gap-2.5 shadow-xs">
                  <Info size={16} className="text-blue-500 flex-shrink-0" />
                  <span>Fase WBS vinculada automáticamente: <strong>{etapaPreseleccionada.nombreEtapa}</strong></span>
                </div>
              )}

              <form onSubmit={handleReportarError} className="space-y-4 text-xs" noValidate>
                
                {/* SECCIÓN 1: SELECCIÓN EN CASCADA DE PROYECTO Y ETAPA WBS */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* Proyecto Afectado */}
                    <div>
                      <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                        <Briefcase size={14} className="text-blue-500" /> Proyecto Asociado *
                      </label>
                      <CustomSelect
                        value={errorForm.idProyecto}
                        onChange={(newIdPrj) => {
                          const etapasDelNuevoPrj = newIdPrj ? etapasConsolidadas.filter(et => et.idProyecto === newIdPrj) : etapasConsolidadas;
                          const sigueValida = etapasDelNuevoPrj.some(et => et.idEtapa === errorForm.idEtapa);
                          setErrorForm(prev => ({
                            ...prev,
                            idProyecto: newIdPrj,
                            idEtapa: sigueValida ? prev.idEtapa : ''
                          }));
                          setErrorFormErrors(prev => ({ ...prev, idProyecto: undefined, idEtapa: undefined }));
                        }}
                        options={[
                          { value: '', label: '— Seleccione el proyecto —' },
                          ...proyectosDisponiblesModal.map(prj => ({
                            value: prj.idProyecto,
                            label: prj.nombreProyecto
                          }))
                        ]}
                        placeholder="— Seleccione el proyecto —"
                        icon={Briefcase}
                        maxWidth="w-full"
                        searchable={true}
                      />
                      <FieldError message={errorFormErrors.idProyecto} />
                    </div>

                    {/* Etapa WBS Afectada */}
                    <div>
                      <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                        <Layers size={14} className="text-blue-500" /> Etapa / Fase WBS Afectada *
                      </label>
                      {loadingEtapas && etapasConsolidadas.length === 0 ? (
                        <div className="input-field py-2.5 flex items-center gap-2 text-zinc-400">
                          <Loader2 size={14} className="animate-spin text-blue-500" /> Cargando etapas WBS...
                        </div>
                      ) : (
                        <CustomSelect
                          value={errorForm.idEtapa}
                          onChange={(selectedIdEtapa) => {
                            const targetEtapa = etapasConsolidadas.find(et => et.idEtapa === selectedIdEtapa);
                            setErrorForm(prev => ({
                              ...prev,
                              idEtapa: selectedIdEtapa,
                              idProyecto: targetEtapa ? targetEtapa.idProyecto : prev.idProyecto
                            }));
                            setErrorFormErrors(prev => ({ ...prev, idEtapa: undefined, idProyecto: undefined }));
                          }}
                          options={[
                            { value: '', label: errorForm.idProyecto ? '— Seleccione la etapa de este proyecto —' : '— Seleccione una etapa —' },
                            ...etapasFiltradasError.map(et => ({
                              value: et.idEtapa,
                              label: errorForm.idProyecto ? et.nombreEtapa : `${et.nombreProyecto} → ${et.nombreEtapa}`
                            }))
                          ]}
                          placeholder="— Seleccione una etapa —"
                          icon={Layers}
                          maxWidth="w-full"
                          searchable={true}
                        />
                      )}
                      <FieldError message={errorFormErrors.idEtapa} />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: TIPO DE ERROR Y SEVERIDAD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-2xs">
                  {/* Tipo de Error */}
                  <div>
                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                      <Filter size={14} className="text-blue-500" /> Tipo / Categoría de Error *
                    </label>
                    <CustomSelect
                      value={errorForm.tipoError}
                      onChange={(val) => { setErrorForm(prev => ({ ...prev, tipoError: val })); setErrorFormErrors(prev => ({ ...prev, tipoError: undefined })); }}
                      options={[
                        { value: '', label: '— Seleccione el tipo —' },
                        { value: 'LOGICO', label: 'Error Lógico' },
                        { value: 'SINTAXIS', label: 'Error de Sintaxis / Transpilador' },
                        { value: 'CONCURRENCIA', label: 'Concurrencia / Race Condition' },
                        { value: 'VALIDACION', label: 'Fallo de Validación' },
                        { value: 'INTEGRACION_REST', label: 'Integración REST / CORS' },
                        { value: 'RENDIMIENTO', label: 'Rendimiento / Performance' }
                      ]}
                      placeholder="— Seleccione el tipo —"
                      icon={Filter}
                      maxWidth="w-full"
                    />
                    <FieldError message={errorFormErrors.tipoError} />
                  </div>

                  {/* TARJETAS INTERACTIVAS DE SEVERIDAD DE COLOR */}
                  <div>
                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                      <ShieldAlert size={14} className="text-rose-500" /> Severidad del Error *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { value: 'BAJA', label: 'BAJA', icon: <ShieldCheck size={18} className="text-emerald-500" />, style: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                        { value: 'MEDIA', label: 'MEDIA', icon: <AlertTriangle size={18} className="text-amber-500" />, style: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                        { value: 'ALTA', label: 'ALTA', icon: <ShieldAlert size={18} className="text-orange-500" />, style: 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400' },
                        { value: 'CRITICA', label: 'CRÍTICA', icon: <AlertOctagon size={18} className="text-rose-500" />, style: 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400' }
                      ].map((sev) => {
                        const isSelected = errorForm.severidad === sev.value;
                        return (
                          <button
                            key={sev.value}
                            type="button"
                            onClick={() => {
                              setErrorForm(prev => ({ ...prev, severidad: sev.value }));
                              setErrorFormErrors(prev => ({ ...prev, severidad: undefined }));
                            }}
                            className={`p-3 rounded-2xl border text-center font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                              isSelected 
                                ? `${sev.style} shadow-sm ring-2 ring-blue-500/40 scale-[1.02]` 
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div>{sev.icon}</div>
                            <span className="text-[0.72rem] tracking-wide uppercase">{sev.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError message={errorFormErrors.severidad} />
                  </div>
                </div>

                {/* SECCIÓN 3: DESCRIPCIÓN */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-[0.78rem]">
                      <FileText size={14} className="text-blue-500" /> Descripción del Hallazgo *
                    </label>
                    <span className={`text-[0.68rem] font-mono ${
                      (errorForm.descripcion || '').length < 8 ? 'text-rose-500 font-bold' : 'text-zinc-400'
                    }`}>
                      {(errorForm.descripcion || '').length} / 500 caract.
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={errorForm.descripcion}
                    onChange={(e) => { setErrorForm({ ...errorForm, descripcion: e.target.value }); setErrorFormErrors(prev => ({ ...prev, descripcion: undefined })); }}
                    placeholder="Detalle el comportamiento anómalo detectado, pasos para reproducir y módulo afectado..."
                    className={`input-field py-3 leading-relaxed ${errorFormErrors.descripcion ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                  <FieldError message={errorFormErrors.descripcion} />

                  {/* Sugerencias de Micro-Snippets inyectadas en caliente (RF-36) */}
                  {loadingSnippets && (
                    <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1.5 animate-pulse">
                      <Sparkles size={12} className="text-amber-400" /> Buscando soluciones en el Playbook de Snippets...
                    </div>
                  )}

                  {Array.isArray(sugerenciasSnippets) && sugerenciasSnippets.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-400" /> Soluciones Técnicas Sugeridas (Snippet.inject)
                        </span>
                        <span className="text-[10px] text-zinc-500">{sugerenciasSnippets.length} resultado(s)</span>
                      </div>
                      {sugerenciasSnippets.map((snippet, idx) => (
                        <SnippetInjectionCard key={snippet?.idSnippet || `snippet-${idx}`} snippet={snippet} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => { setShowErrorModal(false); setErrorFormErrors({}); setEtapaPreseleccionada(null); }}
                    disabled={submittingError}
                    className="outline-button text-xs py-2.5 px-5 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingError}
                    className="gradient-button text-xs py-2.5 px-6 font-bold cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50"
                  >
                    {submittingError ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Bug size={15} /> Registrar Error</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Registro de interrupción o contingencia (Edición Visión Elegante y Desplegables CustomSelect) */}
      <AnimatePresence>
        {showInterrupcionModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 w-[95%] sm:w-full max-w-2xl sm:max-w-3xl shadow-2xl shadow-amber-950/15 max-h-[92dvh] overflow-y-auto"
            >
              {/* Header con Acento Sutil */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
                      <AlertTriangle size={20} />
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Registrar Interrupción Operativa
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium ml-1">
                    Notifica indisponibilidad técnica o imprevistos de tiempo para recalibrar estimaciones.
                  </p>
                </div>
              </div>

              {/* Banner de Etapa Vinculada */}
              {etapaPreseleccionada && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 font-semibold mb-5 flex items-center gap-2.5 shadow-xs">
                  <Info size={16} className="text-amber-500 flex-shrink-0" />
                  <span>Fase WBS vinculada automáticamente: <strong>{etapaPreseleccionada.nombreEtapa}</strong></span>
                </div>
              )}

              <form onSubmit={handleReportarInterrupcion} className="space-y-4 text-xs" noValidate>
                
                {/* SECCIÓN 1: SELECCIÓN EN CASCADA DE PROYECTO Y ETAPA WBS */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* Proyecto Afectado */}
                    <div>
                      <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                        <Briefcase size={14} className="text-amber-500" /> Proyecto Asociado *
                      </label>
                      <CustomSelect
                        value={interrupcionForm.idProyecto}
                        onChange={(newIdPrj) => {
                          const etapasDelNuevoPrj = newIdPrj ? etapasConsolidadas.filter(et => et.idProyecto === newIdPrj) : etapasConsolidadas;
                          const sigueValida = etapasDelNuevoPrj.some(et => et.idEtapa === interrupcionForm.idEtapa);
                          setInterrupcionForm(prev => ({
                            ...prev,
                            idProyecto: newIdPrj,
                            idEtapa: sigueValida ? prev.idEtapa : ''
                          }));
                          setInterrupcionFormErrors(prev => ({ ...prev, idProyecto: undefined, idEtapa: undefined }));
                        }}
                        options={[
                          { value: '', label: '— Seleccione el proyecto —' },
                          ...proyectosDisponiblesModal.map(prj => ({
                            value: prj.idProyecto,
                            label: prj.nombreProyecto
                          }))
                        ]}
                        placeholder="— Seleccione el proyecto —"
                        icon={Briefcase}
                        maxWidth="w-full"
                        searchable={true}
                      />
                      <FieldError message={interrupcionFormErrors.idProyecto} />
                    </div>

                    {/* Etapa WBS Afectada */}
                    <div>
                      <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                        <Layers size={14} className="text-amber-500" /> Etapa / Fase WBS Afectada *
                      </label>
                      {loadingEtapas && etapasConsolidadas.length === 0 ? (
                        <div className="input-field py-2.5 flex items-center gap-2 text-zinc-400">
                          <Loader2 size={14} className="animate-spin text-amber-500" /> Cargando etapas WBS...
                        </div>
                      ) : (
                        <CustomSelect
                          value={interrupcionForm.idEtapa}
                          onChange={(selectedIdEtapa) => {
                            const targetEtapa = etapasConsolidadas.find(et => et.idEtapa === selectedIdEtapa);
                            setInterrupcionForm(prev => ({
                              ...prev,
                              idEtapa: selectedIdEtapa,
                              idProyecto: targetEtapa ? targetEtapa.idProyecto : prev.idProyecto
                            }));
                            setInterrupcionFormErrors(prev => ({ ...prev, idEtapa: undefined, idProyecto: undefined }));
                          }}
                          options={[
                            { value: '', label: interrupcionForm.idProyecto ? '— Seleccione la etapa de este proyecto —' : '— Seleccione una etapa —' },
                            ...etapasFiltradasInterrupcion.map(et => ({
                              value: et.idEtapa,
                              label: interrupcionForm.idProyecto ? et.nombreEtapa : `${et.nombreProyecto} → ${et.nombreEtapa}`
                            }))
                          ]}
                          placeholder="— Seleccione una etapa —"
                          icon={Layers}
                          maxWidth="w-full"
                          searchable={true}
                        />
                      )}
                      <FieldError message={interrupcionFormErrors.idEtapa} />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: TIPO DE CONTINGENCIA Y DURACIÓN */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-2xs">
                  {/* Tipo de Contingencia */}
                  <div>
                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                      <Activity size={14} className="text-amber-500" /> Tipo de Contingencia *
                    </label>
                    <CustomSelect
                      value={interrupcionForm.tipoInterrupcion}
                      onChange={(val) => { setInterrupcionForm(prev => ({ ...prev, tipoInterrupcion: val })); setInterrupcionFormErrors(prev => ({ ...prev, tipoInterrupcion: undefined })); }}
                      options={[
                        { value: '', label: '— Seleccione el tipo —' },
                        { value: 'CORTE_ENERGIA', label: 'Corte Eléctrico / Energía' },
                        { value: 'CAIDA_SERVIDOR', label: 'Caída de Servidor / Base de Datos' },
                        { value: 'FALLA_RED', label: 'Corte de Fibra Óptica / Red ISP' },
                        { value: 'MANTENIMIENTO', label: 'Mantenimiento de Infraestructura' },
                        { value: 'DEPENDENCIA_EXTERNA', label: 'Indisponibilidad de Dependencia Externa' },
                        { value: 'REUNION_NO_PROGRAMADA', label: 'Reunión No Programada' },
                        { value: 'BLOQUEO_HERRAMIENTA', label: 'Bloqueo de Herramienta / Licencia' }
                      ]}
                      placeholder="— Seleccione el tipo —"
                      icon={Activity}
                      maxWidth="w-full"
                    />
                    <FieldError message={interrupcionFormErrors.tipoInterrupcion} />
                  </div>

                  {/* DURACIÓN EN MINUTOS + CHIPS DE SELECCIÓN RÁPIDA */}
                  <div>
                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2 flex items-center gap-1.5 text-[0.78rem]">
                      <Clock size={14} className="text-amber-500" /> Duración en Minutos *
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={interrupcionForm.duracionMinutos}
                        onChange={(e) => { setInterrupcionForm({ ...interrupcionForm, duracionMinutos: e.target.value }); setInterrupcionFormErrors(prev => ({ ...prev, duracionMinutos: undefined })); }}
                        placeholder="Ej: 45"
                        className={`input-field py-2.5 font-mono font-bold text-sm w-full sm:w-36 text-center ${interrupcionFormErrors.duracionMinutos ? 'border-red-400 dark:border-red-600' : ''}`}
                      />
                      
                      {/* Pills de minutos rápidos */}
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {['15', '30', '45', '60', '90', '120'].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              setInterrupcionForm(prev => ({ ...prev, duracionMinutos: mins }));
                              setInterrupcionFormErrors(prev => ({ ...prev, duracionMinutos: undefined }));
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-[0.7rem] font-mono font-bold transition-all duration-200 cursor-pointer ${
                              interrupcionForm.duracionMinutos === mins
                                ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/40'
                            }`}
                          >
                            +{mins}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <FieldError message={interrupcionFormErrors.duracionMinutos} />
                  </div>
                </div>

                {/* SECCIÓN 3: JUSTIFICACIÓN */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-[0.78rem]">
                      <FileText size={14} className="text-amber-500" /> Justificación Técnica *
                    </label>
                    <span className={`text-[0.68rem] font-mono ${
                      (interrupcionForm.comentarios || '').length < 5 ? 'text-rose-500 font-bold' : 'text-zinc-400'
                    }`}>
                      {(interrupcionForm.comentarios || '').length} / 500 caract.
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={interrupcionForm.comentarios}
                    onChange={(e) => { setInterrupcionForm({ ...interrupcionForm, comentarios: e.target.value }); setInterrupcionFormErrors(prev => ({ ...prev, comentarios: undefined })); }}
                    placeholder="Explique el motivo, impacto y acciones de mitigación tomadas..."
                    className={`input-field py-3 leading-relaxed ${interrupcionFormErrors.comentarios ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                  <FieldError message={interrupcionFormErrors.comentarios} />
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => { setShowInterrupcionModal(false); setInterrupcionFormErrors({}); setEtapaPreseleccionada(null); }}
                    disabled={submittingInterrupcion}
                    className="outline-button text-xs py-2.5 px-5 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInterrupcion}
                    className="gradient-button text-xs py-2.5 px-6 font-bold cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50"
                  >
                    {submittingInterrupcion ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><AlertTriangle size={15} /> Registrar Contingencia</>}
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

export default DesarrolladorDashboard;
