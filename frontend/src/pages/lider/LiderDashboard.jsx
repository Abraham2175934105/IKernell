import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SemaforoInteligente } from '../../components/dashboard/SemaforoInteligente';
import { EtlBrasil } from '../../components/dashboard/EtlBrasil';
import { PredictorBurnout } from '../../components/dashboard/PredictorBurnout';
import { 
  Briefcase, Layers, Plus, Activity, Sparkles, Download, 
  Send, ShieldCheck, CheckCircle2, Clock, Calendar, ChevronRight, X,
  RefreshCw, Loader2, UserCheck, UserPlus, Inbox, Bug, AlertTriangle, User, RotateCcw,
  Info, HelpCircle, FileText, Edit3, Filter, ShieldAlert, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonMetricCard } from '../../components/ui/Skeleton';

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


export const LiderDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('wbs');
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [desarrolladores, setDesarrolladores] = useState([]);
  const [errores, setErrores] = useState([]);
  const [interrupciones, setInterrupciones] = useState([]);
  
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [showNuevaEtapaModal, setShowNuevaEtapaModal] = useState(false);
  const [showReasignarModal, setShowReasignarModal] = useState(false);
  const [actividadAReasignar, setActividadAReasignar] = useState(null);

  const [showAtenderModal, setShowAtenderModal] = useState(false);
  const [incidenciaAAtender, setIncidenciaAAtender] = useState(null);
  const [atencionForm, setAtencionForm] = useState({
    estadoAtencion: 'EN_REVISION',
    resolucionNota: ''
  });
  const [filtroTipoInc, setFiltroTipoInc] = useState('TODOS');
  const [filtroEstadoInc, setFiltroEstadoInc] = useState('TODOS');
  const [filtroDevInc, setFiltroDevInc] = useState('TODOS');

  const [submittingActividad, setSubmittingActividad] = useState(false);
  const [submittingEtapa, setSubmittingEtapa] = useState(false);
  const [submittingReasignacion, setSubmittingReasignacion] = useState(false);
  const [submittingAtencion, setSubmittingAtencion] = useState(false);

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

    if (proyecto.idProyecto === 'GLOBAL') {
      setProyectoSeleccionado({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
      try {
        setLoadingDetalle(true);
        const devsRes = await api.get('/lider/desarrolladores').catch(() => []);
        setDesarrolladores(Array.isArray(devsRes) ? devsRes : []);
        setEtapas([]);
        setErrores([]);
        setInterrupciones([]);
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
      const [etapasRes, erroresRes, interrupcionesRes, devsRes] = await Promise.all([
        api.get(`/lider/proyectos/${proyecto.idProyecto}/etapas`).catch(() => []),
        api.get(`/lider/proyectos/${proyecto.idProyecto}/errores`).catch(() => []),
        api.get(`/lider/proyectos/${proyecto.idProyecto}/interrupciones`).catch(() => []),
        api.get('/lider/desarrolladores').catch(() => [])
      ]);

      setEtapas(Array.isArray(etapasRes) ? etapasRes : []);
      setErrores(Array.isArray(erroresRes) ? erroresRes : []);
      setInterrupciones(Array.isArray(interrupcionesRes) ? interrupcionesRes : []);
      setDesarrolladores(Array.isArray(devsRes) ? devsRes : []);
    } catch (err) {
      console.error('Error cargando detalles del proyecto:', err);
      toast.error('Error al cargar etapas y métricas del proyecto.');
    } finally {
      setLoadingDetalle(false);
    }
  }, [api]);

  // Consulta la lista de proyectos asignados al líder
  const cargarProyectos = useCallback(async () => {
    try {
      setLoadingProyectos(true);
      const data = await api.get('/lider/proyectos');
      const list = Array.isArray(data) ? data : [];
      setProyectos(list);

      if (list.length > 0) {
        const actual = proyectoSeleccionado 
          ? list.find(p => p.idProyecto === proyectoSeleccionado.idProyecto) || list[0]
          : list[0];
        seleccionarProyecto(actual);
      } else {
        setProyectoSeleccionado(null);
      }
    } catch (err) {
      console.error('Error cargando proyectos del líder:', err);
      toast.error('Error al sincronizar proyectos desde PostgreSQL.');
    } finally {
      setLoadingProyectos(false);
    }
  }, [api, proyectoSeleccionado, seleccionarProyecto]);

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

  // Atención y resolución de incidencias del equipo
  const handleAbrirAtenderIncidencia = (item) => {
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

      toast.success('Estado del reporte y acción correctiva actualizados en PostgreSQL.');
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

  const listaIncidenciasUnificada = useMemo(() => {
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

    if (filtroTipoInc === 'ERRORES') combined = combined.filter(c => c._tipo === 'ERROR');
    if (filtroTipoInc === 'INTERRUPCIONES') combined = combined.filter(c => c._tipo === 'INTERRUPCION');

    if (filtroEstadoInc !== 'TODOS') {
      combined = combined.filter(c => (c.estadoAtencion || 'REGISTRADO') === filtroEstadoInc);
    }

    if (filtroDevInc !== 'TODOS') {
      combined = combined.filter(c => String(c.desarrollador?.idTrabajador) === String(filtroDevInc));
    }

    return combined;
  }, [errores, interrupciones, filtroTipoInc, filtroEstadoInc, filtroDevInc]);

  // Cálculo seguro y defensivo de horas de contingencia
  const totalHorasContingencia = useMemo(() => {
    if (!Array.isArray(interrupciones) || interrupciones.length === 0) return '0.0';
    const totalMin = interrupciones.reduce((acc, curr) => acc + (curr?.duracionMinutos || 0), 0);
    return (totalMin / 60).toFixed(1);
  }, [interrupciones]);

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: loadingProyectos ? 'Cargando...' : `Proyectos: ${proyectos?.length || 0} en Sistema`,
        metric2: proyectoSeleccionado ? `Activo: ${proyectoSeleccionado.nombre}` : 'Sin proyecto'
      }}
    >
      
      {/* Selector de Proyecto en Cabecera */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mb-6 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
      >
        <div>
          <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
            Gestión y Control de Proyectos WBS
          </span>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {proyectoSeleccionado?.nombre || (loadingProyectos ? 'Cargando proyectos...' : 'Panel del Líder')}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Proyecto Activo:</span>
          {loadingProyectos ? (
            <div className="input-field py-2 text-xs flex items-center gap-2 text-zinc-400">
              <Loader2 size={12} className="animate-spin" /> Sincronizando...
            </div>
          ) : (
            <select
              value={proyectoSeleccionado?.idProyecto || 'GLOBAL'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'GLOBAL') {
                  seleccionarProyecto({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                } else {
                  const proj = proyectos?.find(p => p?.idProyecto === parseInt(val));
                  if (proj) seleccionarProyecto(proj);
                }
              }}
              className="input-field py-2 text-xs font-bold"
              title="Selecciona el proyecto activo o la vista global corporativa"
            >
              <option value="GLOBAL">🌐 [Todos los Proyectos / Vista Global Corporativa]</option>
              {proyectos?.map(p => (
                <option key={p?.idProyecto} value={p?.idProyecto}>📁 {p?.nombre}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={cargarProyectos}
            disabled={loadingProyectos}
            className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sincronizar proyectos y etapas en tiempo real con PostgreSQL"
          >
            <RefreshCw size={12} className={loadingProyectos ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* 1. SECCIÓN: WBS Y PROYECTOS */}
      {activeTab === 'wbs' && (
        <motion.div 
          key="wbs"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loadingDetalle ? (
              <>
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

                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between sm:col-span-2 lg:col-span-1 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all duration-200">
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
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers size={18} /> Estructura de Desglose de Trabajo (WBS)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Fases, tareas asignadas, desarrolladores responsables y trazabilidad de reasignación
                </p>
              </div>

              <div className="flex gap-2">
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
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>{etapa?.nombreEtapa}</span>
                          <span className="text-[0.65rem] font-mono text-zinc-400">#Etapa {etapa?.idEtapa}</span>
                        </div>
                        <span className="text-xs text-zinc-500 font-medium">
                          {etapa?.actividades ? `${etapa.actividades.length} tarea(s) vinculadas` : 'Sin tareas'}
                        </span>
                      </div>

                      <span className={`text-[0.65rem] font-extrabold px-3 py-1 rounded-full border self-start sm:self-auto ${
                        etapa?.estado === 'COMPLETADA'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
                        etapa?.estado === 'EN_CURSO'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      }`}>
                        {etapa?.estado || 'PENDIENTE'}
                      </span>
                    </div>

                    {/* Lista de Actividades dentro de esta Etapa */}
                    {etapa?.actividades && etapa.actividades.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {etapa.actividades.map(act => (
                          <div 
                            key={act.idActividad}
                            className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs shadow-sm"
                          >
                            <div className="space-y-1.5">
                              <div className="font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                                {act.descripcion}
                              </div>
                              
                              {/* Trazabilidad: Desarrollador Asignado */}
                              <div className="flex items-center gap-2 text-[0.7rem] text-zinc-500 font-medium flex-wrap">
                                {act.desarrollador ? (
                                  <span className="inline-flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    <UserCheck size={13} className="text-emerald-500" />
                                    {act.desarrollador.nombre} {act.desarrollador.apellido}
                                    {act.desarrollador.especialidad && (
                                      <span className="text-zinc-400 font-normal">({act.desarrollador.especialidad})</span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-xl border border-red-200 dark:border-red-800">
                                    <AlertTriangle size={13} className="text-red-500" />
                                    Sin Asignar
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                              <span className={`text-[0.6rem] font-bold uppercase px-2.5 py-1 rounded-md border ${
                                act.estado === 'FINALIZADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                act.estado === 'EN_PROGRESO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-zinc-100 text-zinc-600 border-zinc-200'
                              }`}>
                                {act.estado}
                              </span>

                              {/* Botón Reasignar Actividad */}
                              <button
                                type="button"
                                onClick={() => handleAbrirReasignar(act)}
                                className="outline-button text-[0.7rem] py-1 px-2.5 font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                title="Transferir esta tarea a otro desarrollador con justificación histórica"
                              >
                                <RotateCcw size={12} /> Reasignar
                              </button>
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
          <SemaforoInteligente 
            idProyecto={proyectoSeleccionado?.idProyecto === 'GLOBAL' ? null : proyectoSeleccionado?.idProyecto} 
            proyectoNombre={proyectoSeleccionado?.idProyecto === 'GLOBAL' ? 'Alcance Global' : proyectoSeleccionado?.nombre}
          />
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
          {/* Header */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Supervisión y Control de Calidad (RF-22 a RF-24)
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Consola Centralizada de Incidencias de Equipo
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Gestión, seguimiento y resolución de errores técnicos y contingencias reportadas por los desarrolladores
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => seleccionarProyecto(proyectoSeleccionado)}
                disabled={loadingDetalle}
                className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingDetalle ? 'animate-spin' : ''} /> Refrescar Incidencias
              </button>
            </div>
          </motion.div>

          {/* Tarjetas Resumen */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500/40 transition-all duration-200">
              <span className="text-[0.65rem] font-bold text-zinc-400 uppercase block mb-1">Total Reportes</span>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {(errores?.length || 0) + (interrupciones?.length || 0)}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-red-400 dark:hover:border-red-500/40 transition-all duration-200">
              <span className="text-[0.65rem] font-bold text-red-500 uppercase block mb-1">Errores Técnicos</span>
              <div className="text-2xl font-black text-red-600 dark:text-red-400">
                {errores?.length || 0}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/40 transition-all duration-200">
              <span className="text-[0.65rem] font-bold text-amber-500 uppercase block mb-1">Contingencias (Horas)</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {totalHorasContingencia}h
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all duration-200">
              <span className="text-[0.65rem] font-bold text-emerald-500 uppercase block mb-1">Solucionados</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {[...(errores || []), ...(interrupciones || [])].filter(i => i.estadoAtencion === 'SOLUCIONADO').length}
              </div>
            </div>
          </motion.div>

          {/* Filtros Combinados */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap gap-3 items-center justify-between">
            {/* Filtro Tipo */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setFiltroTipoInc('TODOS')}
                className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                  filtroTipoInc === 'TODOS'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Todos ({(errores?.length || 0) + (interrupciones?.length || 0)})
              </button>
              <button
                onClick={() => setFiltroTipoInc('ERRORES')}
                className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  filtroTipoInc === 'ERRORES'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Bug size={12} /> Errores ({errores?.length || 0})
              </button>
              <button
                onClick={() => setFiltroTipoInc('INTERRUPCIONES')}
                className={`text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  filtroTipoInc === 'INTERRUPCIONES'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <AlertTriangle size={12} /> Interrupciones ({interrupciones?.length || 0})
              </button>
            </div>

            {/* Filtros Selectores */}
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-bold text-[0.65rem] uppercase">Estado:</span>
                <select
                  value={filtroEstadoInc}
                  onChange={(e) => setFiltroEstadoInc(e.target.value)}
                  className="input-field py-1 px-2.5 text-xs font-bold"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="REGISTRADO">Registrado</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="SOLUCIONADO">Solucionado</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-bold text-[0.65rem] uppercase">Desarrollador:</span>
                <select
                  value={filtroDevInc}
                  onChange={(e) => setFiltroDevInc(e.target.value)}
                  className="input-field py-1 px-2.5 text-xs font-bold"
                >
                  <option value="TODOS">Todos los Desarrolladores</option>
                  {desarrolladores?.map(dev => (
                    <option key={dev.idTrabajador} value={dev.idTrabajador}>
                      {dev.nombre} {dev.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Listado de Tarjetas */}
          <motion.div variants={itemVariants} className="space-y-3">
            {loadingDetalle && (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-zinc-500" />
                <span className="text-xs font-bold text-zinc-500">Cargando incidencias de equipo...</span>
              </div>
            )}

            {!loadingDetalle && listaIncidenciasUnificada.length === 0 && (
              <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <Inbox size={36} className="mx-auto text-zinc-400 mb-3" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">Sin incidencias registradas</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">No hay reportes de equipo que coincidan con los filtros seleccionados.</p>
              </div>
            )}

            {!loadingDetalle && listaIncidenciasUnificada.map(item => {
              const isError = item._tipo === 'ERROR';
              const devName = item.desarrollador ? `${item.desarrollador.nombre} ${item.desarrollador.apellido}` : 'Desarrollador';
              const fechaStr = new Date(item._fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

              return (
                <div
                  key={item._id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isError ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}>
                        {isError ? <Bug size={18} /> : <AlertTriangle size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
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
                          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            👤 {devName}
                          </span>
                        </div>
                        <span className="text-[0.65rem] text-zinc-400 font-medium block mt-0.5">
                          {item.etapa?.nombreEtapa || 'Etapa WBS'} • {fechaStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <EstadoAtencionBadge estado={item.estadoAtencion} />
                      <button
                        type="button"
                        onClick={() => handleAbrirAtenderIncidencia(item)}
                        className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Gestionar estado o ingresar acción correctiva"
                      >
                        <Edit3 size={12} /> Atender
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {item.descripcion || item.comentarios}
                  </div>

                  {item.resolucionNota && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-blue-800 dark:text-blue-300 text-[0.7rem]">
                        <Info size={13} /> Acción Correctiva / Respuesta del Líder:
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

      {/* 4. SECCIÓN: EXPORTACIÓN ETL BRASIL */}
      {activeTab === 'etl' && (
        <motion.div 
          key="etl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <EtlBrasil proyecto={proyectoSeleccionado} />
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
          <PredictorBurnout 
            proyecto={proyectoSeleccionado} 
            etapas={etapas} 
            onNavigateToWbs={() => setActiveTab('wbs')} 
          />
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
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserCheck size={20} /> Asignar Tarea a Desarrollador (RF-17)
                </h3>
                <button onClick={() => { setShowAsignarModal(false); setFormErrors({}); }} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[0.7rem] text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                ℹ️ <strong>Nota Informativa:</strong> La actividad se creará en estado <strong>PENDIENTE</strong> y se vinculará directamente a la cuenta del desarrollador en PostgreSQL, apareciendo de inmediato en su tablero de trabajo.
              </div>

              <form onSubmit={handleAsignarActividad} className="space-y-4 text-xs" noValidate>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Etapa / Fase WBS *</label>
                  <select
                    value={nuevaActividad.idEtapa}
                    onChange={(e) => { setNuevaActividad({ ...nuevaActividad, idEtapa: e.target.value }); setFormErrors(p => ({ ...p, idEtapa: undefined })); }}
                    className={`input-field py-2 font-bold ${formErrors.idEtapa ? 'border-red-400 dark:border-red-600' : ''}`}
                  >
                    <option value="">— Seleccione una etapa —</option>
                    {etapas?.map(et => (
                      <option key={et?.idEtapa} value={et?.idEtapa}>{et?.nombreEtapa}</option>
                    ))}
                  </select>
                  {formErrors.idEtapa && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.idEtapa}</p>}
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Desarrollador Responsable *</label>
                  <select
                    value={nuevaActividad.idDesarrollador}
                    onChange={(e) => { setNuevaActividad({ ...nuevaActividad, idDesarrollador: e.target.value }); setFormErrors(p => ({ ...p, idDesarrollador: undefined })); }}
                    className={`input-field py-2 font-bold ${formErrors.idDesarrollador ? 'border-red-400 dark:border-red-600' : ''}`}
                  >
                    <option value="">— Seleccione un desarrollador —</option>
                    {desarrolladores?.map(dev => (
                      <option key={dev?.idTrabajador} value={dev?.idTrabajador}>
                        {dev?.nombre} {dev?.apellido} ({dev?.especialidad || dev?.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.idDesarrollador && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.idDesarrollador}</p>}
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Descripción de la Tarea *</label>
                  <textarea
                    rows={3}
                    value={nuevaActividad.descripcion}
                    onChange={(e) => { setNuevaActividad({ ...nuevaActividad, descripcion: e.target.value }); setFormErrors(p => ({ ...p, descripcion: undefined })); }}
                    placeholder="Ej. Construir controladores REST y pruebas de estrés para módulo de facturación..."
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

      {/* Modal: Nueva Etapa WBS (RF-15 - ESTADO AUTOMÁTICO PENDIENTE) */}
      <AnimatePresence>
        {showNuevaEtapaModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers size={20} /> Registrar Nueva Etapa WBS (RF-15)
                </h3>
                <button onClick={() => setShowNuevaEtapaModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
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
                    placeholder="Ej. Fase 3: Pruebas de Estrés y Despliegue Cloud"
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
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <RotateCcw size={20} /> Reasignar Tarea a Desarrollador
                </h3>
                <button onClick={() => setShowReasignarModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs mb-4">
                <div className="font-bold text-zinc-900 dark:text-white mb-1">Tarea a transferir:</div>
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
                  <select
                    required
                    value={datosReasignacion.nuevoDesarrolladorId}
                    onChange={(e) => setDatosReasignacion({ ...datosReasignacion, nuevoDesarrolladorId: e.target.value })}
                    className="input-field py-2 font-bold"
                  >
                    <option value="">— Seleccione nuevo desarrollador —</option>
                    {desarrolladores?.map(dev => (
                      <option key={dev?.idTrabajador} value={dev?.idTrabajador}>
                        {dev?.nombre} {dev?.apellido} ({dev?.especialidad || dev?.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Motivo o Justificación de la Reasignación</label>
                  <textarea
                    rows={2}
                    value={datosReasignacion.motivo}
                    onChange={(e) => setDatosReasignacion({ ...datosReasignacion, motivo: e.target.value })}
                    placeholder="Ej. Ajuste de carga de trabajo / Cambio por especialidad en backend..."
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
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4"
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
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      Gestión de {incidenciaAAtender._tipo === 'ERROR' ? 'Error Técnico' : 'Contingencia'} #{incidenciaAAtender.idError || incidenciaAAtender.idInterrupcion}
                    </h3>
                    <span className="text-xs text-zinc-500 font-medium">
                      Reportado por: {incidenciaAAtender.desarrollador?.nombre} {incidenciaAAtender.desarrollador?.apellido}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowAtenderModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
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

              <form onSubmit={handleAtenderIncidencia} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Estado de Atención *
                  </label>
                  <select
                    value={atencionForm.estadoAtencion}
                    onChange={(e) => setAtencionForm({ ...atencionForm, estadoAtencion: e.target.value })}
                    className="input-field py-2 font-bold"
                  >
                    <option value="REGISTRADO">Registrado (En espera)</option>
                    <option value="EN_REVISION">En Revisión (En investigación)</option>
                    <option value="SOLUCIONADO">Solucionado / Resuelto</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Nota de Respuesta o Acción Correctiva *
                  </label>
                  <textarea
                    rows={3}
                    required
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

    </DashboardLayout>
  );
};
