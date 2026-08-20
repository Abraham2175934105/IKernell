import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  CheckSquare, Bug, AlertTriangle, X, CheckCircle2, 
  ChevronRight, Clock, Plus, Activity, Layers, Sparkles,
  Loader2, Inbox, RefreshCw, Eye, RotateCcw, Info, ArrowRight,
  FileText, Calendar, User, ShieldAlert, Play, Check
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
    'SOLUCIONADO': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  };
  const icons = {
    'REGISTRADO': <Clock size={11} />,
    'EN_REVISION': <Eye size={11} />,
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

export const DesarrolladorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('actividades');
  const [actividades, setActividades] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [misReportes, setMisReportes] = useState({ errores: [], interrupciones: [], totalErrores: 0, totalInterrupciones: 0 });
  const [filtroHistorial, setFiltroHistorial] = useState('TODOS');
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
      toast.success(`Caso / Tarea #${idActividad} actualizada con éxito a estado "${labels[nuevoEstado] || nuevoEstado}".`, { duration: 5000 });
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
      
      toast.success('Caso de Error Técnico registrado con éxito. Guardado en PostgreSQL.', { duration: 5000 });
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
    e.preventDefault();
    if (!validarInterrupcionForm()) return;

    try {
      setSubmittingInterrupcion(true);
      await api.post('/desarrollador/interrupciones', {
        idEtapa: parseInt(interrupcionForm.idEtapa),
        tipoInterrupcion: interrupcionForm.tipoInterrupcion,
        duracionMinutos: parseInt(interrupcionForm.duracionMinutos),
        comentarios: interrupcionForm.comentarios.trim()
      });
      
      toast.success(`Caso de Contingencia (${interrupcionForm.duracionMinutos} min) registrado con éxito. Guardado en PostgreSQL.`, { duration: 5000 });
      setShowInterrupcionModal(false);
      setInterrupcionForm({ idEtapa: '', tipoInterrupcion: '', duracionMinutos: '', comentarios: '' });
      setEtapaPreseleccionada(null);
      setInterrupcionFormErrors({});
    } catch (err) {
      console.error('Error registrando interrupción:', err);
      toast.error(err.message || 'Error al registrar la contingencia.');
    } finally {
      setSubmittingInterrupcion(false);
    }
  };

  // Métricas calculadas para contadores y consolidación del historial
  const actividadesPendientes = useMemo(() => actividades.filter(a => a.estado === 'PENDIENTE').length, [actividades]);
  const actividadesEnProgreso = useMemo(() => actividades.filter(a => a.estado === 'EN_PROGRESO').length, [actividades]);
  const actividadesFinalizadas = useMemo(() => actividades.filter(a => a.estado === 'FINALIZADA').length, [actividades]);

  const listaReportesUnificada = useMemo(() => {
    const errs = (misReportes.errores || []).map(e => ({
      ...e,
      _tipo: 'ERROR',
      _id: `err-${e.idError}`,
      _fecha: new Date(e.fechaRegistro || Date.now())
    }));
    const ints = (misReportes.interrupciones || []).map(i => ({
      ...i,
      _tipo: 'INTERRUPCION',
      _id: `int-${i.idInterrupcion}`,
      _fecha: new Date(i.fechaOcurrencia || Date.now())
    }));
    const combined = [...errs, ...ints].sort((a, b) => b._fecha - a._fecha);
    if (filtroHistorial === 'ERRORES') return combined.filter(c => c._tipo === 'ERROR');
    if (filtroHistorial === 'INTERRUPCIONES') return combined.filter(c => c._tipo === 'INTERRUPCION');
    return combined;
  }, [misReportes, filtroHistorial]);

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

            {/* Empty State */}
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

            {/* Tarjetas de Actividades Reales */}
            {!loading && actividades.map(act => {
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
                          disabled={changingEstado === act.idActividad}
                          onChange={(e) => handleCambiarEstado(act.idActividad, e.target.value)}
                          className="input-field py-1.5 text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
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
      {activeTab === 'reportar' && (
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
          {/* Header */}
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
                Consulte el estado de atención, respuestas del Líder y acciones correctivas aplicadas a sus reportes
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={cargarMisReportes}
                disabled={loadingReportes}
                className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingReportes ? 'animate-spin' : ''} /> Actualizar Historial
              </button>
            </div>
          </motion.div>

          {/* Filtros de Pestaña */}
          <motion.div variants={itemVariants} className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setFiltroHistorial('TODOS')}
              className={`text-xs py-2 px-4 rounded-2xl font-bold transition-all cursor-pointer ${
                filtroHistorial === 'TODOS'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Todos ({((misReportes.errores?.length || 0) + (misReportes.interrupciones?.length || 0))})
            </button>
            <button
              onClick={() => setFiltroHistorial('ERRORES')}
              className={`text-xs py-2 px-4 rounded-2xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                filtroHistorial === 'ERRORES'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bug size={13} /> Errores Técnicos ({misReportes.errores?.length || 0})
            </button>
            <button
              onClick={() => setFiltroHistorial('INTERRUPCIONES')}
              className={`text-xs py-2 px-4 rounded-2xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                filtroHistorial === 'INTERRUPCIONES'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <AlertTriangle size={13} /> Interrupciones ({misReportes.interrupciones?.length || 0})
            </button>
          </motion.div>

          {/* Listado de Tarjetas */}
          <motion.div variants={itemVariants} className="space-y-3">
            {loadingReportes && (
              <div className="space-y-3">
                <SkeletonCard rows={2} />
                <SkeletonCard rows={2} />
              </div>
            )}

            {!loadingReportes && listaReportesUnificada.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="Sin reportes en esta categoría"
                description="No registra incidencias técnicas o interrupciones en la vista seleccionada. Cuando reporte un hallazgo, aparecerá aquí junto con la resolución del Líder."
              />
            )}

            {!loadingReportes && listaReportesUnificada.map(item => {
              const isError = item._tipo === 'ERROR';
              const fechaStr = new Date(item._fecha).toLocaleString('es-ES', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div 
                  key={item._id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isError ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}>
                        {isError ? <Bug size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                            {isError ? `Error: ${item.tipoError}` : `Interrupción: ${item.tipoInterrupcion?.replace(/_/g, ' ')}`}
                          </h4>
                          {isError ? (
                            <span className="text-[0.6rem] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                              {item.severidad}
                            </span>
                          ) : (
                            <span className="text-[0.6rem] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                              {item.duracionMinutos} min
                            </span>
                          )}
                        </div>
                        <span className="text-[0.65rem] text-zinc-400 font-medium">
                          {item.etapa?.proyecto?.nombre ? `${item.etapa.proyecto.nombre} • ` : ''}{item.etapa?.nombreEtapa || 'Etapa WBS'} • {fechaStr}
                        </span>
                      </div>
                    </div>

                    <EstadoAtencionBadge estado={item.estadoAtencion} />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {item.descripcion || item.comentarios}
                  </div>

                  {item.resolucionNota && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-blue-800 dark:text-blue-300 text-[0.7rem]">
                        <Info size={13} /> Nota de Respuesta / Acción Correctiva del Líder:
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 italic">
                        "{item.resolucionNota}"
                      </p>
                      {item.fechaResolucion && (
                        <span className="text-[0.6rem] text-zinc-400 block pt-0.5">
                          Atendido el: {new Date(item.fechaResolucion).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
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
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
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
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-[95%] sm:w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
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
