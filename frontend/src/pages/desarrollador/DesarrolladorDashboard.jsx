import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  CheckSquare, Bug, AlertTriangle, X, CheckCircle2, 
  ChevronRight, ChevronDown, Clock, Plus, Activity, Layers, Sparkles,
  Loader2, Inbox, RefreshCw, Eye, RotateCcw, Info, ArrowRight,
  FileText, Calendar, User, ShieldAlert, Play, Check,
  Filter, SlidersHorizontal, Search, FolderGit2, ArrowUpDown,
  LayoutGrid, List, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { SnippetInjectionCard } from '../../components/dashboard/SnippetInjectionCard';
import { Skeleton, SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';

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
  
  // Estados para Filtros, Buscador y Ordenamiento en Cliente (HU-16 / RF-21)
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

  const [submittingError, setSubmittingError] = useState(false);
  const [submittingInterrupcion, setSubmittingInterrupcion] = useState(false);

  const [errorForm, setErrorForm] = useState({
    idEtapa: '',
    tipoError: '',
    severidad: '',
    descripcion: ''
  });
  const [errorFormErrors, setErrorFormErrors] = useState({});
  const [sugerenciasSnippets, setSugerenciasSnippets] = useState([]);
  const [loadingSnippets, setLoadingSnippets] = useState(false);

  const [interrupcionForm, setInterrupcionForm] = useState({
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
      const data = await api.get('/desarrollador/mis-actividades');
      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando actividades:', err);
      toast.error(err.message || 'Error al cargar actividades desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const cargarEtapas = useCallback(async () => {
    try {
      setLoadingEtapas(true);
      const data = await api.get('/desarrollador/etapas');
      setEtapas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando etapas:', err);
      toast.error('Error al cargar las etapas WBS.');
    } finally {
      setLoadingEtapas(false);
    }
  }, [api]);

  const cargarMisReportes = useCallback(async () => {
    try {
      setLoadingReportes(true);
      const data = await api.get('/desarrollador/mis-reportes');
      setMisReportes(data || { errores: [], interrupciones: [], totalErrores: 0, totalInterrupciones: 0 });
    } catch (err) {
      console.error('Error cargando reportes:', err);
      toast.error('Error al cargar historial de reportes.');
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
    setErrorForm({
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
    setInterrupcionForm({
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
    if (!errorForm.idEtapa) errors.idEtapa = 'Seleccione la etapa afectada';
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
      setErrorForm({ idEtapa: '', tipoError: '', severidad: '', descripcion: '' });
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
    if (!interrupcionForm.idEtapa) errors.idEtapa = 'Seleccione la etapa afectada';
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
      setInterrupcionForm({ idEtapa: '', tipoInterrupcion: '', duracionMinutos: '', comentarios: '' });
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
  const actividadesEnProgreso = useMemo(() => actividades.filter(a => a.estado === 'EN_PROGRESO').length, [actividades]);
  const actividadesFinalizadas = useMemo(() => actividades.filter(a => a.estado === 'FINALIZADA').length, [actividades]);

  // Proyectos extraídos dinámicamente de las tareas asignadas
  const proyectosDisponibles = useMemo(() => {
    const projMap = new Map();
    (actividades || []).forEach(a => {
      const pNom = a.etapa?.proyecto?.nombre || 'Proyecto General';
      const pId = a.etapa?.proyecto?.idProyecto?.toString() || pNom;
      if (!projMap.has(pId)) {
        projMap.set(pId, pNom);
      }
    });
    return Array.from(projMap.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [actividades]);

  // Lista de actividades filtradas y ordenadas en cliente (HU-16 / RF-21)
  const actividadesFiltradasYOrdenadas = useMemo(() => {
    let result = [...actividades];

    // 1. Buscador reactivo por texto (descripción, etapa o proyecto)
    if (searchTaskQuery.trim()) {
      const q = searchTaskQuery.trim().toLowerCase();
      result = result.filter(a => {
        const desc = (a.descripcion || '').toLowerCase();
        const etapa = (a.etapa?.nombreEtapa || a.etapa?.nombre || '').toLowerCase();
        const proy = (a.etapa?.proyecto?.nombre || '').toLowerCase();
        return desc.includes(q) || etapa.includes(q) || proy.includes(q);
      });
    }

    // 2. Filtro por proyecto
    if (proyectoFilter !== 'TODOS') {
      result = result.filter(a => {
        const pId = a.etapa?.proyecto?.idProyecto?.toString();
        const pNom = a.etapa?.proyecto?.nombre;
        return pId === proyectoFilter || pNom === proyectoFilter;
      });
    }

    // 3. Filtro por estado operativo
    if (estadoFilter !== 'TODAS') {
      result = result.filter(a => a.estado === estadoFilter);
    }

    // 4. Ordenamiento dinámico
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
      if (ordenarPor === 'ETAPA') {
        const eA = a.etapa?.nombreEtapa || a.etapa?.nombre || '';
        const eB = b.etapa?.nombreEtapa || b.etapa?.nombre || '';
        return eA.localeCompare(eB);
      }
      return 0;
    });

    return result;
  }, [actividades, searchTaskQuery, proyectoFilter, estadoFilter, ordenarPor]);

  const activeTaskFiltersCount = (searchTaskQuery ? 1 : 0) + (proyectoFilter !== 'TODOS' ? 1 : 0) + (estadoFilter !== 'TODAS' ? 1 : 0) + (ordenarPor !== 'RECIENTES' ? 1 : 0);

  const handleClearTaskFilters = () => {
    setSearchTaskQuery('');
    setProyectoFilter('TODOS');
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

  // Filtros avanzados y ordenamiento sobre la lista unificada de reportes (HU-17 / RF-22 a RF-24)
  const listaReportesFiltradaYOrdenada = useMemo(() => {
    let list = [...listaReportesUnificada];

    // 1. Buscador reactivo por texto (descripción, comentarios, etapa o nota de respuesta)
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

    // 2. Filtro por Severidad / Impacto (para Errores)
    if (filtroSeveridad !== 'TODAS') {
      list = list.filter(item => item?.severidad === filtroSeveridad);
    }

    // 2b. Filtro por Duración de Bloqueo (para Interrupciones)
    if (filtroHistorial === 'INTERRUPCIONES' && filtroDuracion !== 'TODAS') {
      list = list.filter(item => {
        const mins = parseInt(item?.duracionMinutos || 0);
        if (filtroDuracion === 'CORTA') return mins <= 30;
        if (filtroDuracion === 'MEDIA') return mins > 30 && mins <= 60;
        if (filtroDuracion === 'LARGA') return mins > 60;
        return true;
      });
    }

    // 3. Filtro por Estado de Atención
    if (filtroEstadoAtencion !== 'TODOS') {
      list = list.filter(item => (item?.estadoAtencion || 'REGISTRADO') === filtroEstadoAtencion);
    }

    // 4. Ordenamiento dinámico
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
  }, [listaReportesUnificada, searchReportQuery, filtroSeveridad, filtroDuracion, filtroEstadoAtencion, ordenarReportesPor, filtroHistorial]);

  const activeReportFiltersCount = (searchReportQuery ? 1 : 0) + (filtroHistorial !== 'TODOS' ? 1 : 0) + (filtroSeveridad !== 'TODAS' ? 1 : 0) + (filtroDuracion !== 'TODAS' ? 1 : 0) + (filtroEstadoAtencion !== 'TODOS' ? 1 : 0) + (ordenarReportesPor !== 'RECIENTES' ? 1 : 0);

  const handleClearReportFilters = () => {
    setSearchReportQuery('');
    setFiltroHistorial('TODOS');
    setFiltroSeveridad('TODAS');
    setFiltroDuracion('TODAS');
    setFiltroEstadoAtencion('TODOS');
    setOrdenarReportesPor('RECIENTES');
  };

  const FieldError = ({ message }) => message ? (
    <p className="text-[0.65rem] text-red-500 font-bold mt-1 flex items-center gap-1">
      <AlertTriangle size={10} /> {message}
    </p>
  ) : null;

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
                Seguimiento en tiempo real de tareas WBS, especificaciones técnicas y trazabilidad de reasignación
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

          {/* Métricas KPI y Barra de Progreso Lineal (Estilo Corporativo Jira / GitHub Metrics) */}
          <motion.div variants={itemVariants} className="space-y-4">
            
            {/* Barra de Progreso General */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Layers size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      Avance General de Asignaciones WBS
                    </span>
                    <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 font-medium">
                      {actividadesFinalizadas} de {actividades.length} actividades concluidas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {actividades.length > 0 ? Math.round((actividadesFinalizadas / actividades.length) * 100) : 0}%
                  </span>
                  <span className="text-[0.65rem] font-bold text-zinc-400 uppercase">Completado</span>
                </div>
              </div>

              {/* Pista de la Barra de Progreso */}
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${actividades.length > 0 ? (actividadesFinalizadas / actividades.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-blue-600"
                  title="Tareas Finalizadas"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${actividades.length > 0 ? (actividadesEnProgreso / actividades.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className="h-full bg-blue-400 dark:bg-blue-500"
                  title="Tareas En Progreso"
                />
              </div>
            </div>

            {/* Grid de 3 Tarjetas Métricas KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              
              {/* 1. Tarjeta: Pendientes */}
              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm transition-colors flex items-center justify-between group h-full"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[0.65rem] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Por Iniciar
                    </span>
                    <span className="text-[0.6rem] font-mono font-bold text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800">
                      {actividades.length > 0 ? Math.round((actividadesPendientes / actividades.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {actividadesPendientes}
                  </div>
                  <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 font-medium">Asignaciones en espera</span>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <Clock size={20} />
                </div>
              </motion.div>

              {/* 2. Tarjeta: En Progreso */}
              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm transition-colors flex items-center justify-between group h-full"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      En Desarrollo
                    </span>
                    <span className="text-[0.6rem] font-mono font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40">
                      {actividades.length > 0 ? Math.round((actividadesEnProgreso / actividades.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {actividadesEnProgreso}
                  </div>
                  <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 font-medium">Trabajo activo en curso</span>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <Activity size={20} />
                </div>
              </motion.div>

              {/* 3. Tarjeta: Finalizadas */}
              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm transition-colors flex items-center justify-between group h-full"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Completadas
                    </span>
                    <span className="text-[0.6rem] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40">
                      {actividades.length > 0 ? Math.round((actividadesFinalizadas / actividades.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {actividadesFinalizadas}
                  </div>
                  <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 font-medium">Verificadas y cerradas</span>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <CheckCircle2 size={20} />
                </div>
              </motion.div>

            </div>

          </motion.div>

          {/* Barra de Herramientas de Filtros, Búsqueda y Ordenamiento en Cliente (HU-16 / RF-21) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4"
          >
            {/* Fila Superior: Buscador, Selector de Proyecto y Selector de Ordenamiento */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Buscador Rápido Reactivo */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={searchTaskQuery}
                  onChange={(e) => setSearchTaskQuery(e.target.value)}
                  placeholder="Buscar actividad por descripción, etapa WBS o proyecto..."
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

              {/* Controles Dropdown: Filtro por Proyecto y Ordenamiento */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                
                {/* Selector de Proyecto */}
                <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <FolderGit2 size={14} />
                  </div>
                  <select
                    value={proyectoFilter}
                    onChange={(e) => setProyectoFilter(e.target.value)}
                    className="input-field pl-9 py-2 text-xs font-bold appearance-none cursor-pointer"
                  >
                    <option value="TODOS">Todos los Proyectos</option>
                    {proyectosDisponibles.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Selector de Ordenamiento */}
                <div className="relative flex-1 sm:flex-initial min-w-[170px]">
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
                    <option value="ETAPA">Ordenar por Etapa WBS</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Fila Inferior: Pestañas Rápidas de Estado Operativo & Contador de Resultados */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              
              {/* Pestañas Rápidas de Estado Operativo */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
                  <Filter size={11} /> Estado:
                </span>

                {[
                  { key: 'TODAS', label: 'Todas', count: actividades.length },
                  { key: 'PENDIENTE', label: 'Pendientes', count: actividadesPendientes },
                  { key: 'EN_PROGRESO', label: 'En Progreso', count: actividadesEnProgreso },
                  { key: 'FINALIZADA', label: 'Finalizadas', count: actividadesFinalizadas }
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
                        isActive 
                          ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900' 
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contador de Resultados y Restablecer */}
              <div className="flex items-center gap-2 self-end sm:self-auto font-medium text-zinc-500 dark:text-zinc-400 text-xs">
                <span>
                  Mostrando <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{actividadesFiltradasYOrdenadas.length}</strong> de <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{actividades.length}</strong> actividades
                </span>

                {activeTaskFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearTaskFilters}
                    className="text-[0.7rem] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer ml-2"
                  >
                    <RotateCcw size={11} /> Limpiar Filtros
                  </button>
                )}
              </div>

            </div>

          </motion.div>

          {/* Grid de Actividades */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            
            {/* Loading Skeleton */}
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {/* Empty State General (Sin actividades asignadas) */}
            {!loading && actividades.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="Sin actividades asignadas"
                description="Aún no tiene actividades asignadas en ninguna etapa WBS. Su Líder de Proyecto o Coordinador se encargará de crearlas y asignarlas a su perfil."
                action={
                  <button
                    type="button"
                    onClick={cargarActividades}
                    className="outline-button text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RefreshCw size={14} /> Verificar nuevamente
                  </button>
                }
              />
            )}

            {/* Empty State por Filtros (Hay actividades pero ninguna coincide con la búsqueda) */}
            {!loading && actividades.length > 0 && actividadesFiltradasYOrdenadas.length === 0 && (
              <EmptyState
                icon={Search}
                title="No se encontraron actividades"
                description="Ninguna actividad asignada coincide con los criterios de búsqueda, proyecto o estado operativo seleccionados."
                action={
                  <button
                    type="button"
                    onClick={handleClearTaskFilters}
                    className="outline-button text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RotateCcw size={14} /> Restablecer Todos los Filtros
                  </button>
                }
              />
            )}

            {/* Tarjetas de Actividades Reales Filtradas y Ordenadas */}
            {!loading && actividadesFiltradasYOrdenadas.map(act => {
              const { isReassigned, motivo, cleanDescripcion } = parseReasignacion(act.descripcion);

              return (
                <div 
                  key={act.idActividad}
                  className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 space-y-4 h-full ${
                    changingEstado === act.idActividad 
                      ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/30' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <div>
                    {/* Header de la Tarjeta */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="text-[0.65rem] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                          {act.etapa?.nombreEtapa || act.etapa?.nombre || 'Etapa WBS'}
                        </span>
                        {act.etapa?.proyecto?.nombre && (
                          <span className="text-[0.6rem] font-bold text-zinc-500 dark:text-zinc-400">
                            {act.etapa.proyecto.nombre}
                          </span>
                        )}
                      </div>
                      <EstadoBadge estado={act.estado} />
                    </div>

                    {/* Alerta de Proyecto en Pausa / Inhabilitado */}
                    {(act.etapa?.proyecto?.estado === 'PAUSADO' || act.proyectoObj?.estado === 'PAUSADO') && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 mb-3 text-[0.7rem] flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                        <span>Proyecto en Pausa (Asignación Congelada)</span>
                      </div>
                    )}
                    {(act.etapa?.proyecto?.estado === 'INHABILITADO' || act.proyectoObj?.estado === 'INHABILITADO') && (
                      <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 mb-3 text-[0.7rem] flex items-center gap-1.5 font-bold text-red-800 dark:text-red-300">
                        <Lock size={14} className="text-red-600 dark:text-red-400 shrink-0" />
                        <span>Proyecto Inhabilitado / Suspendido</span>
                      </div>
                    )}

                    {/* Alerta de Reasignación en la Tarjeta */}
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

                    {/* Descripción de la Tarea */}
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-snug">
                      {cleanDescripcion}
                    </h3>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    
                    {/* Botón Ver Detalles y Accesos Directos a Reportes */}
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
                        className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Reportar error en esta etapa WBS"
                      >
                        <Bug size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAbrirInterrupcionDesdeTarea(act)}
                        className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        title="Registrar interrupción en esta etapa WBS"
                      >
                        <Clock size={14} />
                      </button>
                    </div>

                    {/* Control de Transición de Estados */}
                    <div>
                      <label className="text-[0.65rem] font-bold text-zinc-400 block mb-1">Estado de Avance:</label>
                      <div className="relative">
                        <select
                          value={act.estado}
                          disabled={changingEstado === act.idActividad || ['RESUELTO', 'SOLUCIONADO', 'FINALIZADA', 'CERRADO'].includes(act.estado)}
                          onChange={(e) => handleCambiarEstado(act.idActividad, e.target.value)}
                          className="input-field py-1.5 text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                          title={['RESUELTO', 'SOLUCIONADO', 'FINALIZADA', 'CERRADO'].includes(act.estado) ? 'Actividad concluida. Estado no modificable.' : 'Seleccione el nuevo estado de avance de la actividad'}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROGRESO">En Progreso</option>
                          <option value="FINALIZADA">Finalizada</option>
                        </select>
                        {changingEstado === act.idActividad && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 size={14} className="animate-spin text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </motion.div>

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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-3xl">
                
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
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[0.65rem] text-zinc-400 font-medium">
                        <span className="truncate max-w-[180px]">
                          {item?.etapa?.proyecto?.nombre ? `${item.etapa.proyecto.nombre} • ` : ''}{item?.etapa?.nombreEtapa || item?.etapa?.nombre || 'Etapa WBS'}
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
                            {item?.etapa?.nombreEtapa || item?.etapa?.nombre || 'Etapa WBS'}
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

      {/* Modal: Detalle completo de la tarea y acciones rápidas */}
      <AnimatePresence>
        {detalleModalDoc && (() => {
          const { isReassigned, motivo, cleanDescripcion } = parseReasignacion(detalleModalDoc.descripcion);

          return (
            <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-xl shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto"
              >
                {/* Header del Modal */}
                <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        Especificación de la Tarea #{detalleModalDoc.idActividad}
                      </h3>
                      <span className="text-xs text-zinc-500 font-medium">
                        {detalleModalDoc.etapa?.proyecto?.nombre || 'Proyecto IKernell'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDetalleModalDoc(null)} 
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Trazabilidad: Reasignación */}
                {isReassigned && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs text-blue-800 dark:text-blue-300">
                      <RotateCcw size={14} /> Tarea Reasignada por el Líder de Proyecto
                    </div>
                    {motivo && (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                        <strong>Motivo de la reasignación:</strong> "{motivo}"
                      </p>
                    )}
                  </div>
                )}

                {/* Metadatos en Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-zinc-500 font-semibold block text-[0.65rem]">Fase / Etapa WBS:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {detalleModalDoc.etapa?.nombreEtapa || '#Etapa ' + detalleModalDoc.etapa?.idEtapa}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex flex-col justify-between">
                    <span className="text-zinc-500 font-semibold block text-[0.65rem]">Estado Actual:</span>
                    <div><EstadoBadge estado={detalleModalDoc.estado} /></div>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 col-span-2">
                    <span className="text-zinc-500 font-semibold block text-[0.65rem]">Desarrollador Responsable:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {user?.nombre} {user?.apellido} ({user?.especialidad || 'Desarrollador'})
                    </span>
                  </div>
                </div>

                {/* Requerimiento Técnico Completo */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                    Descripción Completa del Requerimiento:
                  </label>
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    {cleanDescripcion}
                  </div>
                </div>

                {/* Accesos Directos de Acción Rápida */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const act = detalleModalDoc;
                        setDetalleModalDoc(null);
                        handleAbrirReporteErrorDesdeTarea(act);
                      }}
                      className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Bug size={13} /> Reportar Error
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const act = detalleModalDoc;
                        setDetalleModalDoc(null);
                        handleAbrirInterrupcionDesdeTarea(act);
                      }}
                      className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    >
                      <Clock size={13} /> Interrupción
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
                    {detalleModalDoc.estado === 'EN_PROGRESO' && (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(detalleModalDoc.idActividad, 'FINALIZADA')}
                        className="gradient-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check size={13} /> Finalizar Tarea
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDetalleModalDoc(null)}
                      className="outline-button text-xs py-2 px-4 font-bold cursor-pointer"
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

      {/* Modal: Registro de error técnico */}
      <AnimatePresence>
        {showErrorModal && (
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
                  <Bug size={20} /> Reportar Error Técnico
                </h3>
                <button onClick={() => { setShowErrorModal(false); setErrorFormErrors({}); setEtapaPreseleccionada(null); }} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {etapaPreseleccionada && (
                <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[0.7rem] text-blue-800 dark:text-blue-300 font-medium mb-4 flex items-center gap-2">
                  <Info size={14} className="flex-shrink-0" />
                  <span>Fase WBS vinculada automáticamente: <strong>{etapaPreseleccionada.nombreEtapa}</strong></span>
                </div>
              )}

              <form onSubmit={handleReportarError} className="space-y-4 text-xs" noValidate>
                {/* Etapa WBS */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Etapa / Fase WBS Afectada *</label>
                  {loadingEtapas ? (
                    <div className="input-field py-2 flex items-center gap-2 text-zinc-400">
                      <Loader2 size={14} className="animate-spin" /> Cargando etapas...
                    </div>
                  ) : (
                    <select
                      value={errorForm.idEtapa}
                      onChange={(e) => { setErrorForm({ ...errorForm, idEtapa: e.target.value }); setErrorFormErrors(prev => ({ ...prev, idEtapa: undefined })); }}
                      className={`input-field py-2 font-bold ${errorFormErrors.idEtapa ? 'border-red-400 dark:border-red-600' : ''}`}
                    >
                      <option value="">— Seleccione una etapa —</option>
                      {etapas.map(et => (
                        <option key={et.idEtapa} value={et.idEtapa}>
                          {et.proyecto?.nombre ? `${et.proyecto.nombre} → ` : ''}{et.nombreEtapa}
                        </option>
                      ))}
                    </select>
                  )}
                  <FieldError message={errorFormErrors.idEtapa} />
                </div>

                {/* Tipo de Error */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Tipo de Error *</label>
                  <select
                    value={errorForm.tipoError}
                    onChange={(e) => { setErrorForm({ ...errorForm, tipoError: e.target.value }); setErrorFormErrors(prev => ({ ...prev, tipoError: undefined })); }}
                    className={`input-field py-2 font-bold ${errorFormErrors.tipoError ? 'border-red-400 dark:border-red-600' : ''}`}
                  >
                    <option value="">— Seleccione el tipo —</option>
                    <option value="LOGICO">Lógico</option>
                    <option value="SINTAXIS">Sintaxis</option>
                    <option value="CONCURRENCIA">Concurrencia</option>
                    <option value="VALIDACION">Validación</option>
                    <option value="INTEGRACION_REST">Integración REST / CORS</option>
                    <option value="RENDIMIENTO">Rendimiento / Performance</option>
                  </select>
                  <FieldError message={errorFormErrors.tipoError} />
                </div>

                {/* Severidad */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Severidad del Error *</label>
                  <select
                    value={errorForm.severidad}
                    onChange={(e) => { setErrorForm({ ...errorForm, severidad: e.target.value }); setErrorFormErrors(prev => ({ ...prev, severidad: undefined })); }}
                    className={`input-field py-2 font-bold uppercase ${errorFormErrors.severidad ? 'border-red-400 dark:border-red-600' : ''}`}
                  >
                    <option value="">— Seleccione severidad —</option>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica (Impacto directo en Semáforo)</option>
                  </select>
                  <FieldError message={errorFormErrors.severidad} />
                </div>

                {/* Descripción */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Descripción del Hallazgo *</label>
                  <textarea
                    rows={3}
                    value={errorForm.descripcion}
                    onChange={(e) => { setErrorForm({ ...errorForm, descripcion: e.target.value }); setErrorFormErrors(prev => ({ ...prev, descripcion: undefined })); }}
                    placeholder="Detalle el comportamiento anómalo detectado, pasos para reproducir y módulo afectado..."
                    className={`input-field py-2 ${errorFormErrors.descripcion ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                  <FieldError message={errorFormErrors.descripcion} />

                  {/* Sugerencias de Micro-Snippets inyectadas en caliente (RF-36) */}
                  {loadingSnippets && (
                    <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1.5 animate-pulse">
                      <Sparkles size={12} className="text-amber-400" /> Buscando soluciones en el Playbook de Snippets...
                    </div>
                  )}

                  {Array.isArray(sugerenciasSnippets) && sugerenciasSnippets.length > 0 && (
                    <div className="mt-2 space-y-2">
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

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => { setShowErrorModal(false); setErrorFormErrors({}); setEtapaPreseleccionada(null); }}
                    disabled={submittingError}
                    className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingError}
                    className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingError ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Registrar Error'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Registro de interrupción o contingencia */}
      <AnimatePresence>
        {showInterrupcionModal && (
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
                  <AlertTriangle size={20} /> Registrar Interrupción Operativa
                </h3>
                <button onClick={() => { setShowInterrupcionModal(false); setInterrupcionFormErrors({}); setEtapaPreseleccionada(null); }} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {etapaPreseleccionada && (
                <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[0.7rem] text-amber-800 dark:text-amber-300 font-medium mb-4 flex items-center gap-2">
                  <Info size={14} className="flex-shrink-0" />
                  <span>Fase WBS vinculada automáticamente: <strong>{etapaPreseleccionada.nombreEtapa}</strong></span>
                </div>
              )}

              <form onSubmit={handleReportarInterrupcion} className="space-y-4 text-xs" noValidate>
                {/* Etapa WBS */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Etapa / Fase WBS Afectada *</label>
                  {loadingEtapas ? (
                    <div className="input-field py-2 flex items-center gap-2 text-zinc-400">
                      <Loader2 size={14} className="animate-spin" /> Cargando etapas...
                    </div>
                  ) : (
                    <select
                      value={interrupcionForm.idEtapa}
                      onChange={(e) => { setInterrupcionForm({ ...interrupcionForm, idEtapa: e.target.value }); setInterrupcionFormErrors(prev => ({ ...prev, idEtapa: undefined })); }}
                      className={`input-field py-2 font-bold ${interrupcionFormErrors.idEtapa ? 'border-red-400 dark:border-red-600' : ''}`}
                    >
                      <option value="">— Seleccione una etapa —</option>
                      {etapas.map(et => (
                        <option key={et.idEtapa} value={et.idEtapa}>
                          {et.proyecto?.nombre ? `${et.proyecto.nombre} → ` : ''}{et.nombreEtapa}
                        </option>
                      ))}
                    </select>
                  )}
                  <FieldError message={interrupcionFormErrors.idEtapa} />
                </div>

                {/* Tipo de Contingencia */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Tipo de Contingencia *</label>
                  <select
                    value={interrupcionForm.tipoInterrupcion}
                    onChange={(e) => { setInterrupcionForm({ ...interrupcionForm, tipoInterrupcion: e.target.value }); setInterrupcionFormErrors(prev => ({ ...prev, tipoInterrupcion: undefined })); }}
                    className={`input-field py-2 font-bold ${interrupcionFormErrors.tipoInterrupcion ? 'border-red-400 dark:border-red-600' : ''}`}
                  >
                    <option value="">— Seleccione el tipo —</option>
                    <option value="CORTE_ENERGIA">Corte Eléctrico / Energía</option>
                    <option value="CAIDA_SERVIDOR">Caída de Servidor / Base de Datos</option>
                    <option value="FALLA_RED">Corte de Fibra Óptica / Red ISP</option>
                    <option value="MANTENIMIENTO">Mantenimiento de Infraestructura</option>
                    <option value="DEPENDENCIA_EXTERNA">Indisponibilidad de Dependencia Externa</option>
                    <option value="REUNION_NO_PROGRAMADA">Reunión No Programada</option>
                    <option value="BLOQUEO_HERRAMIENTA">Bloqueo de Herramienta / Licencia</option>
                  </select>
                  <FieldError message={interrupcionFormErrors.tipoInterrupcion} />
                </div>

                {/* Duración */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Duración en Minutos *</label>
                  <input
                    type="number"
                    min={1}
                    value={interrupcionForm.duracionMinutos}
                    onChange={(e) => { setInterrupcionForm({ ...interrupcionForm, duracionMinutos: e.target.value }); setInterrupcionFormErrors(prev => ({ ...prev, duracionMinutos: undefined })); }}
                    placeholder="Ej: 45"
                    className={`input-field py-2 font-mono font-bold ${interrupcionFormErrors.duracionMinutos ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                  <FieldError message={interrupcionFormErrors.duracionMinutos} />
                </div>

                {/* Justificación */}
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Justificación Técnica *</label>
                  <textarea
                    rows={3}
                    value={interrupcionForm.comentarios}
                    onChange={(e) => { setInterrupcionForm({ ...interrupcionForm, comentarios: e.target.value }); setInterrupcionFormErrors(prev => ({ ...prev, comentarios: undefined })); }}
                    placeholder="Explique el motivo, impacto y acciones de mitigación tomadas..."
                    className={`input-field py-2 ${interrupcionFormErrors.comentarios ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                  <FieldError message={interrupcionFormErrors.comentarios} />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => { setShowInterrupcionModal(false); setInterrupcionFormErrors({}); setEtapaPreseleccionada(null); }}
                    disabled={submittingInterrupcion}
                    className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInterrupcion}
                    className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingInterrupcion ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Registrar Contingencia'}
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
