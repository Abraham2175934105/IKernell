import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ShieldAlert, Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  User, RefreshCw, Sparkles, Lock, Layers, Users,
  Briefcase, Check, Info, Search, X, HelpCircle, Download,
  TrendingDown, Minus, Clock, Globe, FolderGit2, ChevronDown,
  ShieldCheck, FileText, Filter, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../ui/Skeleton';

/**
 * Normaliza de forma robusta cualquier estado a los 4 niveles homologados:
 * - CRITICA (Nivel Crítico / Sobrecarga Extrema)
 * - ALTA    (Nivel Alto / Sobrecarga)
 * - MEDIA   (Nivel Medio / En Alerta)
 * - BAJA    (Nivel Bajo / Estable)
 */
const normalizarEstado = (estado) => {
  if (!estado) return 'BAJA';
  const est = estado.toString().toUpperCase().trim();
  if (est.includes('CRITIC') || est.includes('BURNOUT') || est === 'ROJO') return 'CRITICA';
  if (est.includes('ALT') || est.includes('SOBRECARGA') || est === 'NARANJA') return 'ALTA';
  if (est.includes('MED') || est.includes('ESTRES') || est.includes('ALZA') || est.includes('ALERTA') || est === 'AMARILLO') return 'MEDIA';
  return 'BAJA';
};

const getEstadoBadgeClasses = (estado) => {
  const est = estado ? estado.toUpperCase() : 'ACTIVO';
  if (est === 'FINALIZADO' || est === 'COMPLETADO') {
    return {
      badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
      dot: 'bg-zinc-400'
    };
  }
  if (est === 'PAUSADO' || est === 'EN_ESPERA') {
    return {
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500'
    };
  }
  return {
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500 animate-pulse'
  };
};

/**
 * Predictor de Desgaste y Burnout Histórico (RF-35).
 * Analítica basada en Series Temporales de 21 días (S1, S2, S3) bajo norma ISO/IEC 25010.
 * Layout Split-View Master-Detail con los 4 niveles homologados del semáforo.
 */
export const PredictorBurnout = ({ proyecto, etapas, onNavigateToWbs }) => {
  const api = useApi();

  // Estados principales
  const [metricas, setMetricas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDev, setSelectedDev] = useState(null);

  // Estados para selector interactivo de proyecto (Modal Explorador Completo)
  const [proyectosList, setProyectosList] = useState([]);
  const [proyectoSeleccionadoLocal, setProyectoSeleccionadoLocal] = useState(
    proyecto && proyecto.idProyecto ? proyecto : { idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' }
  );
  const [etapasLocal, setEtapasLocal] = useState(etapas || []);
  const [modalProyectosOpen, setModalProyectosOpen] = useState(false);
  const [busquedaProyectoModal, setBusquedaProyectoModal] = useState('');
  const [filtroEstadoProyectoModal, setFiltroEstadoProyectoModal] = useState('TODOS');

  // Estados de filtrado y búsqueda interactiva (Panel único y limpio)
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSemaforo, setFiltroSemaforo] = useState('TODOS'); // 'TODOS' | 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA'
  const [orden, setOrden] = useState('RIESGO_DESC'); // 'RIESGO_DESC' | 'RIESGO_ASC' | 'TAREAS_DESC' | 'NOMBRE_ASC'
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Carga lista de proyectos disponibles para el selector interactivo
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await api.get('/lider/proyectos');
        if (Array.isArray(res)) {
          setProyectosList(res);
        }
      } catch (e) {
        console.error('Error cargando proyectos para predictor:', e);
      }
    };
    fetchProyectos();
  }, [api]);

  // Si llega una prop proyecto actualizada desde el componente padre, sincronizar
  useEffect(() => {
    if (proyecto && proyecto.idProyecto) {
      setProyectoSeleccionadoLocal(proyecto);
    }
  }, [proyecto]);

  // Si llega una prop etapas actualizada, sincronizar
  useEffect(() => {
    if (etapas && Array.isArray(etapas)) {
      setEtapasLocal(etapas);
    }
  }, [etapas]);

  // Si se selecciona un proyecto específico que no tiene etapas cargadas, obtenerlas
  useEffect(() => {
    if (proyectoSeleccionadoLocal && proyectoSeleccionadoLocal.idProyecto && proyectoSeleccionadoLocal.idProyecto !== 'GLOBAL') {
      if (!etapas || etapas.length === 0 || proyectoSeleccionadoLocal.idProyecto !== proyecto?.idProyecto) {
        const fetchEtapas = async () => {
          try {
            const data = await api.get(`/lider/proyectos/${proyectoSeleccionadoLocal.idProyecto}/etapas`);
            setEtapasLocal(Array.isArray(data) ? data : []);
          } catch (e) {
            console.error('Error cargando etapas para proyecto seleccionado:', e);
          }
        };
        fetchEtapas();
      }
    }
  }, [proyectoSeleccionadoLocal, etapas, proyecto, api]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalProyectosOpen) setModalProyectosOpen(false);
        if (showHelpModal) setShowHelpModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalProyectosOpen, showHelpModal]);

  // Proyectos filtrados para el menú emergente / explorador
  const proyectosModalFiltrados = useMemo(() => {
    if (!Array.isArray(proyectosList)) return [];
    
    return proyectosList.filter(p => {
      if (filtroEstadoProyectoModal === 'ACTIVO' && p.estado !== 'ACTIVO') return false;
      if (filtroEstadoProyectoModal === 'FINALIZADO' && p.estado !== 'FINALIZADO' && p.estado !== 'COMPLETADO') return false;

      if (busquedaProyectoModal.trim()) {
        const query = busquedaProyectoModal.toLowerCase().trim();
        const matchNombre = p.nombre?.toLowerCase().includes(query);
        const matchCliente = p.cliente?.toLowerCase().includes(query);
        const matchId = String(p.idProyecto).includes(query) || `prj-00${p.idProyecto}`.toLowerCase().includes(query);
        const matchDesc = p.descripcion?.toLowerCase().includes(query);
        if (!matchNombre && !matchCliente && !matchId && !matchDesc) return false;
      }

      return true;
    });
  }, [proyectosList, busquedaProyectoModal, filtroEstadoProyectoModal]);

  // Conteo de proyectos por estado para los botones de filtro rápido
  const statsProyectos = useMemo(() => {
    if (!Array.isArray(proyectosList)) return { total: 0, activos: 0, finalizados: 0 };
    const activos = proyectosList.filter(p => p.estado === 'ACTIVO').length;
    const finalizados = proyectosList.filter(p => p.estado === 'FINALIZADO' || p.estado === 'COMPLETADO').length;
    return { total: proyectosList.length, activos, finalizados };
  }, [proyectosList]);

  // Determina si estamos en alcance de un proyecto específico o en vista global
  const isProyectoEspecifico = Boolean(
    proyectoSeleccionadoLocal && 
    proyectoSeleccionadoLocal.idProyecto && 
    proyectoSeleccionadoLocal.idProyecto !== 'GLOBAL'
  );

  // Obtiene los IDs de los desarrolladores asignados al proyecto activo
  const devIdsEnProyecto = useMemo(() => {
    if (!isProyectoEspecifico || !etapasLocal || !Array.isArray(etapasLocal)) return null;
    const ids = new Set();
    etapasLocal.forEach(etapa => {
      if (Array.isArray(etapa?.actividades)) {
        etapa.actividades.forEach(act => {
          if (act?.desarrollador?.idTrabajador) {
            ids.add(act.desarrollador.idTrabajador);
          }
        });
      }
    });
    return ids;
  }, [isProyectoEspecifico, etapasLocal]);

  // Carga la matriz de burnout desde el backend
  const fetchBurnoutMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/analitica/burnout');
      const list = Array.isArray(data) ? data : [];
      setMetricas(list);
    } catch (err) {
      console.error('Error fetching burnout metrics:', err);
      setError('No se pudieron cargar las métricas históricas de desgaste desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBurnoutMetrics();
  }, [fetchBurnoutMetrics]);

  // 1. Filtrado por Proyecto Activo (si aplica)
  const metricasPorProyecto = useMemo(() => {
    if (!isProyectoEspecifico || devIdsEnProyecto === null) {
      return metricas;
    }
    return metricas.filter(m => devIdsEnProyecto.has(m.idTrabajador));
  }, [metricas, isProyectoEspecifico, devIdsEnProyecto]);

  // 2. Conteo reactivo e insensible de métricas para las píldoras de semáforo
  const conteosSemaforo = useMemo(() => {
    const counts = {
      TODOS: metricasPorProyecto.length,
      CRITICA: 0,
      ALTA: 0,
      MEDIA: 0,
      BAJA: 0,
    };
    metricasPorProyecto.forEach(m => {
      const nivel = normalizarEstado(m.estadoAlerta);
      if (counts[nivel] !== undefined) {
        counts[nivel]++;
      } else {
        counts.BAJA++;
      }
    });
    return counts;
  }, [metricasPorProyecto]);

  // 3. Filtrado por Búsqueda, Semáforo y Ordenamiento
  const metricasFiltradas = useMemo(() => {
    let result = [...metricasPorProyecto];

    // Búsqueda por texto (nombre, especialidad, email)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(m => 
        (m.nombreCompleto && m.nombreCompleto.toLowerCase().includes(q)) ||
        (m.especialidad && m.especialidad.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
      );
    }

    // Filtro de semáforo homologado
    if (filtroSemaforo !== 'TODOS') {
      result = result.filter(m => normalizarEstado(m.estadoAlerta) === filtroSemaforo);
    }

    // Ordenamiento
    result.sort((a, b) => {
      if (orden === 'RIESGO_DESC') return (b.promedioCarga || 0) - (a.promedioCarga || 0);
      if (orden === 'RIESGO_ASC') return (a.promedioCarga || 0) - (b.promedioCarga || 0);
      if (orden === 'TAREAS_DESC') return (b.tareasActivas || 0) - (a.tareasActivas || 0);
      if (orden === 'NOMBRE_ASC') return (a.nombreCompleto || '').localeCompare(b.nombreCompleto || '');
      return 0;
    });

    return result;
  }, [metricasPorProyecto, searchQuery, filtroSemaforo, orden]);

  // Mapeo reactivo de tareas asignadas por desarrollador en el proyecto activo
  const tareasPorDevEnEsteProyecto = useMemo(() => {
    const map = new Map();
    if (!etapas || !Array.isArray(etapas)) return map;
    etapas.forEach(etapa => {
      if (Array.isArray(etapa?.actividades)) {
        etapa.actividades.forEach(act => {
          const devId = act?.desarrollador?.idTrabajador;
          if (devId && (act.estado === 'PENDIENTE' || act.estado === 'EN_PROGRESO')) {
            map.set(devId, (map.get(devId) || 0) + 1);
          }
        });
      }
    });
    return map;
  }, [etapas]);

  // Sincroniza la selección de desarrollador al cambiar filtros o proyecto
  useEffect(() => {
    if (metricasFiltradas.length > 0) {
      const stillVisible = metricasFiltradas.find(m => m.idTrabajador === selectedDev?.idTrabajador);
      setSelectedDev(stillVisible || metricasFiltradas[0]);
    } else {
      setSelectedDev(null);
    }
  }, [metricasFiltradas]);

  // Genera un diagnóstico claro y profesional libre de emojis
  const getDiagnosticoClaro = (dev) => {
    if (!dev) return '';
    const score = Math.round(dev.promedioCarga || 0);
    const nivel = normalizarEstado(dev.estadoAlerta);
    switch (nivel) {
      case 'CRITICA':
        return `Nivel Crítico (Sobrecarga Extrema): Registra una carga promedio de ${score}% (> 80%) con desgaste acumulado en el ciclo de 21 días y ${dev.tareasActivas} tareas asignadas. Se requiere rebalanceo urgente de su carga WBS y restricción preventiva de nuevas asignaciones.`;
      case 'ALTA':
        return `Nivel Alto (Sobrecarga): Presenta una carga de ${score}% (rango 65% - 79%) o tendencia acelerada en los últimos 7 días con ${dev.tareasActivas} tareas activas. Se recomienda redistribuir actividades complejas.`;
      case 'MEDIA':
        return `Nivel Medio (En Alerta): Mantiene una carga de ${score}% (rango 45% - 64%) con contingencias e interrupciones recurrentes. Se aconseja monitorear las entregas del sprint para evitar sobrecarga.`;
      default:
        return `Nivel Bajo / Estable (Óptimo): Mantiene un flujo balanceado con una carga de ${score}% (< 45%) y ritmo de trabajo sostenible dentro de los parámetros de rendimiento óptimo.`;
    }
  };

  // Cálculo de tendencia temporal (S1 vs S2 vs S3)
  const getTendenciaTemporal = (dev) => {
    if (!dev) return { label: 'Constante', icon: Minus, color: 'text-zinc-500' };
    const s1 = dev.scoreSemana1 || 0;
    const s2 = dev.scoreSemana2 || 0;
    const s3 = dev.scoreSemana3 || 0;

    if (s3 > s2 && s2 > s1) {
      return { label: 'Tendencia Acelerada (En Aumento)', icon: TrendingUp, color: 'text-red-500' };
    } else if (s3 < s2 && s2 <= s1) {
      return { label: 'Tendencia en Descenso (Recuperación)', icon: TrendingDown, color: 'text-emerald-500' };
    } else if (s3 > s1) {
      return { label: 'Tendencia Moderada en Alza', icon: TrendingUp, color: 'text-amber-500' };
    }
    return { label: 'Carga Homogénea / Estable', icon: Minus, color: 'text-blue-500' };
  };

  // Exporta el informe diagnóstico en archivo de texto estructurado
  const handleExportarDiagnostico = (dev) => {
    if (!dev) return;
    const fecha = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
    const nivel = normalizarEstado(dev.estadoAlerta);
    const contenido = `===============================================================
IKERNELL SOLUCIONES SOFTWARE - DICTAMEN DE ANALÍTICA PREDICTIVA
MÓDULO: PREDICTOR DE DESGASTE Y BURNOUT HISTÓRICO (RF-35)
NORMATIVA: ISO/IEC 25010 (Mantenibilidad & Fiabilidad de Software)
===============================================================

Fecha de Emisión: ${fecha}
Desarrollador Evaluado: ${dev.nombreCompleto} (ID: ${dev.idTrabajador})
Especialidad: ${dev.especialidad || 'Desarrollo de Software'}
Correo Electrónico: ${dev.email}
Nivel Semafórico Homologado: ${nivel}
Capacidad Bloqueada en Sistema: ${dev.capacidadBloqueada ? 'SÍ (Bloqueo Preventivo)' : 'NO'}

---------------------------------------------------------------
1. MÉTRICAS CLAVE Y SERIES TEMPORALES DE 21 DÍAS
---------------------------------------------------------------
- Tareas WBS Asignadas Activas: ${dev.tareasActivas}
- Score de Carga Cognitiva Global: ${Math.round(dev.promedioCarga)} / 100
- Semana 1 (Días 15 a 21): ${Math.round(dev.scoreSemana1)}%
- Semana 2 (Días 8 a 14): ${Math.round(dev.scoreSemana2)}%
- Semana 3 (Últimos 7 días): ${Math.round(dev.scoreSemana3)}%

---------------------------------------------------------------
2. DIAGNÓSTICO CLÍNICO-OPERATIVO
---------------------------------------------------------------
${getDiagnosticoClaro(dev)}

---------------------------------------------------------------
3. RECOMENDACIÓN FORMULADA POR EL MOTOR PREDICTIVO
---------------------------------------------------------------
${dev.recomendacion || 'Mantener monitoreo continuo en cada sprint.'}

===============================================================
Generado automáticamente por el motor analítico IKernell v2.0
===============================================================`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DIAGNOSTICO_BURNOUT_${dev.nombreCompleto.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Diagnóstico de ${dev.nombreCompleto} exportado con éxito.`);
  };

  // Badge estilizado con indicadores SVG limpios (sin emojis)
  const getBadgeEstado = (estado) => {
    const nivel = normalizarEstado(estado);
    switch (nivel) {
      case 'CRITICA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-black bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            CRÍTICA
          </span>
        );
      case 'ALTA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            ALTA
          </span>
        );
      case 'MEDIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            MEDIA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            BAJA / ESTABLE
          </span>
        );
    }
  };

  // Color de barra de progreso según carga
  const getProgressColor = (score, estado) => {
    const nivel = normalizarEstado(estado);
    if (nivel === 'CRITICA' || score >= 80) return 'bg-red-500';
    if (nivel === 'ALTA' || score >= 65) return 'bg-orange-500';
    if (nivel === 'MEDIA' || score >= 45) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
      
      {/* ─── Encabezado Principal & Contexto ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800/60">
              <Sparkles size={13} className="text-blue-600 dark:text-blue-400" /> Analítica Predictiva • RF-35
            </span>
            
            {/* Botón Ampliado: Selector de Proyectos y Alcance Global */}
            <button
              type="button"
              onClick={() => {
                setBusquedaProyectoModal('');
                setFiltroEstadoProyectoModal('TODOS');
                setModalProyectosOpen(true);
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-blue-50/80 dark:hover:bg-blue-950/50 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-200 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-xs cursor-pointer group"
              title="Abrir menú y explorador interactivo de proyectos"
            >
              {isProyectoEspecifico ? (
                <>
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <FolderGit2 size={13} />
                  </div>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-black text-xs">
                    [PRJ-00{proyectoSeleccionadoLocal.idProyecto}]
                  </span>
                  <span className="truncate max-w-[180px] sm:max-w-[280px] text-zinc-900 dark:text-zinc-100 font-extrabold">
                    {proyectoSeleccionadoLocal.nombre}
                  </span>
                  <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    {proyectoSeleccionadoLocal.estado || 'ACTIVO'}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Globe size={13} />
                  </div>
                  <span className="text-blue-700 dark:text-blue-300 font-black">
                    Alcance Corporativo Global (Todos los Proyectos)
                  </span>
                  <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    VISTA EMPRESARIAL
                  </span>
                </>
              )}
              <ChevronDown size={14} className="text-zinc-400 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all ml-1 shrink-0" />
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Predictor de Desgaste & Burnout Histórico
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
            Monitor de riesgo cognitivo y series temporales de 21 días (S1, S2, S3) bajo la norma ISO/IEC 25010. Detección temprana clasificada en 4 niveles homologados: Crítica, Alta, Media y Baja/Estable.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="¿Cómo funciona la clasificación de 4 niveles de riesgo?"
          >
            <HelpCircle size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Guía de 4 Niveles</span>
          </button>

          <button
            type="button"
            onClick={fetchBurnoutMetrics}
            disabled={loading}
            className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Sincronizar métricas con PostgreSQL en tiempo real"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-500' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* ─── Estados de Carga o Error ─── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          <div className="lg:col-span-5 space-y-3">
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
          <div className="lg:col-span-7">
            <SkeletonCard rows={5} />
          </div>
        </div>
      ) : error ? (
        <div className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchBurnoutMetrics} className="gradient-button text-xs py-1 px-3">
            Reintentar
          </button>
        </div>
      ) : isProyectoEspecifico && metricasPorProyecto.length === 0 ? (
        /* Empty state cuando el proyecto específico no tiene desarrolladores con tareas */
        <div className="py-16 px-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-4 shadow-inner">
            <Users size={30} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Sin desarrolladores con tareas en "{proyectoSeleccionadoLocal.nombre}"
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
            Actualmente no hay actividades WBS asignadas a desarrolladores en este proyecto para calcular la carga cognitiva y temporal.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setProyectoSeleccionadoLocal({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                setSelectedDev(null);
              }}
              className="outline-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Globe size={13} /> Ver Alcance Global
            </button>
            {onNavigateToWbs && (
              <button
                type="button"
                onClick={onNavigateToWbs}
                className="gradient-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md"
              >
                <Layers size={13} /> Asignar Tareas en WBS
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ─── Layout Split-View Master-Detail (2 Columnas Responsivas) ─── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA (~40%): Panel Único de Búsqueda, Filtros y Selección
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-4 bg-zinc-50/60 dark:bg-zinc-800/30 p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80">
            
            {/* 1. Buscador Rápido */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar desarrollador o especialidad..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl pl-9 pr-9 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* 2. Píldoras de Filtro Semafórico Homologadas (Sin emojis, con dots SVG) */}
            <div className="space-y-1.5">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Filtrar por Nivel de Riesgo:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('TODOS')}
                  className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'TODOS'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Todos ({conteosSemaforo.TODOS})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('CRITICA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'CRITICA'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 inline-block" />
                  Crítica ({conteosSemaforo.CRITICA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('ALTA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'ALTA'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5 inline-block" />
                  Alta ({conteosSemaforo.ALTA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('MEDIA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'MEDIA'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block" />
                  Media ({conteosSemaforo.MEDIA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('BAJA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'BAJA'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                  Baja / Estable ({conteosSemaforo.BAJA})
                </button>
              </div>
            </div>

            {/* 3. Selector de Ordenamiento */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Ordenar por:
              </span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1 text-[0.68rem] font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="RIESGO_DESC">Mayor Riesgo / Desgaste</option>
                <option value="RIESGO_ASC">Menor Riesgo (Saludable)</option>
                <option value="TAREAS_DESC">Más Tareas WBS</option>
                <option value="NOMBRE_ASC">Nombre (A - Z)</option>
              </select>
            </div>

            {/* 4. Listado de Tarjetas Interactivas de Desarrolladores */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {metricasFiltradas.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <User size={24} className="mx-auto text-zinc-400 mb-2 opacity-60" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    No se encontraron coincidencias
                  </p>
                  <p className="text-[0.68rem] text-zinc-400 mt-1">
                    Prueba ajustando el término de búsqueda o cambiando el filtro de semáforo.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setFiltroSemaforo('TODOS'); }}
                    className="mt-3 text-[0.68rem] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                metricasFiltradas.map((dev) => {
                  const isSelected = selectedDev?.idTrabajador === dev.idTrabajador;
                  const score = Math.round(dev.promedioCarga || 0);

                  return (
                    <motion.div
                      key={dev.idTrabajador}
                      onClick={() => setSelectedDev(dev)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/25 ring-2 ring-blue-400/40'
                          : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm'
                      }`}
                    >
                      {/* Cabecera de la tarjeta */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar con Iniciales */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}>
                            {dev.nombreCompleto ? dev.nombreCompleto.substring(0, 2).toUpperCase() : 'DEV'}
                          </div>

                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm leading-snug">
                              {dev.nombreCompleto}
                            </h4>
                            <p className={`text-[0.68rem] truncate max-w-[170px] ${
                              isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'
                            }`}>
                              {dev.especialidad || 'Desarrollador'}
                            </p>
                          </div>
                        </div>

                        {/* Badge de Estado */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="text-[0.62rem] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                              {normalizarEstado(dev.estadoAlerta)}
                            </span>
                          ) : (
                            getBadgeEstado(dev.estadoAlerta)
                          )}
                        </div>
                      </div>

                      {/* Barra de Progreso de Carga Cognitiva */}
                      <div className="space-y-1 mt-3">
                        <div className="flex justify-between text-[0.65rem] font-bold">
                          <span className={isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}>
                            {isProyectoEspecifico ? (
                              <>
                                <strong className={isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}>
                                  {tareasPorDevEnEsteProyecto.get(dev.idTrabajador) || 0}
                                </strong> en este proyecto • {dev.tareasActivas} globales
                              </>
                            ) : (
                              <>{dev.tareasActivas} tareas globales</>
                            )}
                          </span>
                          <span className="font-mono font-bold">
                            {score}% Burnout
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isSelected ? 'bg-blue-900/40' : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelected ? 'bg-white' : getProgressColor(score, dev.estadoAlerta)
                            }`}
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              COLUMNA DERECHA (~60%): Radiografía Profunda, Series y Dictamen
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-5">
            {selectedDev ? (
              <motion.div
                key={selectedDev.idTrabajador}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
              >
                
                {/* 1. Banner Superior del Desarrollador */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-base font-black shadow-md shadow-blue-500/20 shrink-0">
                      {selectedDev.nombreCompleto ? selectedDev.nombreCompleto.substring(0, 2).toUpperCase() : 'DV'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                          {selectedDev.nombreCompleto}
                        </h3>
                        {getBadgeEstado(selectedDev.estadoAlerta)}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {selectedDev.especialidad} • <span className="font-mono">{selectedDev.email}</span>
                      </p>
                    </div>
                  </div>

                  {selectedDev.capacidadBloqueada && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 animate-pulse">
                      <Lock size={13} /> Bloqueo Preventivo
                    </span>
                  )}
                </div>

                {/* 2. Diagnóstico Directo en Lenguaje Claro */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                  {getDiagnosticoClaro(selectedDev)}
                </div>

                {/* ── Desglose de Carga: Proyecto Actual vs Global Corporativa ── */}
                {(() => {
                  const tareasEsteProyecto = tareasPorDevEnEsteProyecto.get(selectedDev.idTrabajador) || 0;
                  const totalTareas = selectedDev.tareasActivas || 0;
                  const tareasOtrosProyectos = Math.max(0, totalTareas - tareasEsteProyecto);

                  return (
                    <div className="p-4.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <Layers size={14} className="text-blue-600 dark:text-blue-400" />
                          Desglose de Carga: Proyecto Actual vs Global Corporativa
                        </span>
                        <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Métrica Multidisciplinaria
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <span className="text-[0.62rem] text-zinc-400 font-bold uppercase block mb-0.5">
                            En este proyecto
                          </span>
                          <div className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                            {tareasEsteProyecto} tareas activas
                          </div>
                          <span className="text-[0.6rem] text-zinc-500 dark:text-zinc-400 block mt-0.5 truncate">
                            {isProyectoEspecifico ? proyecto.nombre : 'Todas las iniciativas'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <span className="text-[0.62rem] text-zinc-400 font-bold uppercase block mb-0.5">
                            En otros proyectos
                          </span>
                          <div className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">
                            {tareasOtrosProyectos} tareas activas
                          </div>
                          <span className="text-[0.6rem] text-zinc-500 dark:text-zinc-400 block mt-0.5 truncate">
                            Otras iniciativas corporativas
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <span className="text-[0.62rem] text-zinc-400 font-bold uppercase block mb-0.5">
                            Carga Global Acumulada
                          </span>
                          <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                            {Math.round(selectedDev.promedioCarga)}% Total
                          </div>
                          <span className="text-[0.6rem] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                            Fatiga acumulada (21 días)
                          </span>
                        </div>
                      </div>

                      <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 leading-relaxed italic bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                        Nota: El índice de Burnout (RF-35) evalúa la fatiga acumulada del desarrollador en todos sus proyectos asignados. Al cambiar de proyecto en el dashboard, este porcentaje se mantiene constante porque el estrés cognitivo y la capacidad humana son globales.
                      </p>
                    </div>
                  );
                })()}

                {/* 3. Grid de 4 Métricas Clave */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Tareas Asignadas
                    </span>
                    <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                      {selectedDev.tareasActivas} <span className="text-[0.65rem] font-normal text-zinc-500">WBS</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Carga Promedio
                    </span>
                    <div className={`text-xl font-black ${
                      normalizarEstado(selectedDev.estadoAlerta) === 'CRITICA' ? 'text-red-600 dark:text-red-400' :
                      normalizarEstado(selectedDev.estadoAlerta) === 'ALTA' ? 'text-orange-600 dark:text-orange-400' :
                      normalizarEstado(selectedDev.estadoAlerta) === 'MEDIA' ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {Math.round(selectedDev.promedioCarga)}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Pico Máximo
                    </span>
                    <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                      {Math.max(
                        Math.round(selectedDev.scoreSemana1 || 0),
                        Math.round(selectedDev.scoreSemana2 || 0),
                        Math.round(selectedDev.scoreSemana3 || 0)
                      )}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Comportamiento
                    </span>
                    {(() => {
                      const tend = getTendenciaTemporal(selectedDev);
                      const Icon = tend.icon;
                      return (
                        <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${tend.color}`}>
                          <Icon size={14} />
                          <span className="truncate">{tend.label.split(' ')[0]}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 4. Visualizador de Series Temporales (21 Días - S1, S2, S3) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-blue-600 dark:text-blue-400" />
                      Series Temporales de Carga Cognitiva (21 Días)
                    </h4>
                    <span className="text-[0.65rem] text-zinc-400 font-mono">
                      Algoritmo Deslizante ISO/IEC 25010
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Semana 1 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                      <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                        S1 • Días 15-21
                      </span>
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {Math.round(selectedDev.scoreSemana1 || 0)}%
                      </span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-blue-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(Math.round(selectedDev.scoreSemana1 || 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Semana 2 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                      <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                        S2 • Días 8-14
                      </span>
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {Math.round(selectedDev.scoreSemana2 || 0)}%
                      </span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(Math.round(selectedDev.scoreSemana2 || 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Semana 3 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                      <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                        S3 • Últimos 7d
                      </span>
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {Math.round(selectedDev.scoreSemana3 || 0)}%
                      </span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            normalizarEstado(selectedDev.estadoAlerta) === 'CRITICA' ? 'bg-red-500' :
                            normalizarEstado(selectedDev.estadoAlerta) === 'ALTA' ? 'bg-orange-500' :
                            normalizarEstado(selectedDev.estadoAlerta) === 'MEDIA' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(Math.round(selectedDev.scoreSemana3 || 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Dictamen y Recomendación del Motor Predictivo */}
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-300">
                    <ShieldAlert size={15} className="text-blue-600 dark:text-blue-400" />
                    <span>Dictamen del Motor Predictivo (RF-35):</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {selectedDev.recomendacion || 'Sin observaciones críticas. Mantener ritmo de entregas.'}
                  </p>
                </div>

                {/* 6. Panel de Acciones Rápidas del Líder */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-[0.68rem] text-zinc-400 font-medium">
                    IKernell Predictive Analytics Engine • PostgreSQL Live
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleExportarDiagnostico(selectedDev)}
                      className="outline-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm flex-1 sm:flex-initial"
                      title="Descargar informe técnico en formato plano"
                    >
                      <Download size={13} /> Exportar Diagnóstico
                    </button>

                    {onNavigateToWbs && (
                      <button
                        type="button"
                        onClick={onNavigateToWbs}
                        className="gradient-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md flex-1 sm:flex-initial"
                        title="Ir a la estructura WBS para reasignar tareas y equilibrar la carga"
                      >
                        <Layers size={13} /> Rebalancear en WBS
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400">
                <User size={36} className="mx-auto mb-3 opacity-40" />
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  Seleccione un desarrollador
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Haga clic en una tarjeta de la columna izquierda para desplegar la radiografía completa de 21 días.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─── Modal 1: Explorador y Menú Emergente de Proyectos (Ampliación Avanzada) ─── */}
      <AnimatePresence>
        {modalProyectosOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 w-full max-w-3xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            >
              {/* Encabezado del Modal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3.5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                    <FolderGit2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                      Explorador de Proyectos & Alcance
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Seleccione un proyecto específico o visualice la carga cognitiva global de toda la compañía
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalProyectosOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Buscador en tiempo real y Filtros Rápidos */}
              <div className="space-y-2.5 shrink-0">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={busquedaProyectoModal}
                    onChange={(e) => setBusquedaProyectoModal(e.target.value)}
                    placeholder="Buscar por código (ej. PRJ-001), título, cliente o descripción..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-9 pr-9 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                    autoFocus
                  />
                  {busquedaProyectoModal && (
                    <button
                      type="button"
                      onClick={() => setBusquedaProyectoModal('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filtros de Estado */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoModal('TODOS')}
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
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
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      filtroEstadoProyectoModal === 'ACTIVO'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Activos</span>
                    <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
                      {statsProyectos.activos}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoModal('FINALIZADO')}
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
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
                    onClick={() => {
                      setProyectoSeleccionadoLocal({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                      setSelectedDev(null);
                      setModalProyectosOpen(false);
                    }}
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer ml-auto inline-flex items-center gap-1.5 ${
                      !isProyectoEspecifico
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    <Globe size={12} />
                    <span>Vista Global</span>
                  </button>
                </div>
              </div>

              {/* Lista Scrollable de Proyectos */}
              <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 min-h-[220px] max-h-[380px]">
                {/* Opción 1: Vista Global Corporativa Destacada */}
                <button
                  type="button"
                  onClick={() => {
                    setProyectoSeleccionadoLocal({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                    setSelectedDev(null);
                    setModalProyectosOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    !isProyectoEspecifico
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-400/40'
                      : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/70 hover:bg-blue-50/30 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Globe size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                          Alcance Corporativo Global (Todos los Proyectos)
                        </span>
                        <span className="text-[0.6rem] font-bold px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 uppercase">
                          Vista Empresarial
                        </span>
                      </div>
                      <p className="text-[0.7rem] text-zinc-500 font-medium truncate mt-0.5">
                        Monitorea todos los desarrolladores asignados a través de todos los proyectos activos de la compañía.
                      </p>
                    </div>
                  </div>
                  {!isProyectoEspecifico && (
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      <Check size={16} /> <span>Activo</span>
                    </div>
                  )}
                </button>

                {/* Separador de Proyectos Individuales */}
                <div className="flex items-center gap-2 pt-1 pb-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-400">
                  <FolderGit2 size={12} />
                  <span>Proyectos Registrados ({proyectosModalFiltrados.length})</span>
                </div>

                {/* Grid 2 Columnas de Proyectos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {proyectosModalFiltrados.map((p) => {
                    const isSelected = isProyectoEspecifico && proyectoSeleccionadoLocal.idProyecto === p.idProyecto;
                    const estadoClasses = getEstadoBadgeClasses(p.estado);

                    return (
                      <button
                        key={p.idProyecto}
                        type="button"
                        onClick={() => {
                          setProyectoSeleccionadoLocal(p);
                          setSelectedDev(null);
                          setModalProyectosOpen(false);
                        }}
                        className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative group ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/40'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-1.5 w-full">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[0.68rem] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                              PRJ-00{p.idProyecto}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[0.6rem] font-extrabold uppercase px-2 py-0.5 rounded-full border ${estadoClasses.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${estadoClasses.dot}`} />
                              <span>{p.estado || 'ACTIVO'}</span>
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {p.nombre}
                          </h4>

                          {p.cliente && (
                            <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                              <Briefcase size={11} className="shrink-0 text-zinc-400" />
                              <span className="truncate">{p.cliente}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[0.68rem] w-full font-medium">
                          <span className="text-zinc-500 truncate">
                            {p.presupuesto ? `$${Number(p.presupuesto).toLocaleString('es-CO')}` : 'Sin presupuesto'}
                          </span>
                          {isSelected ? (
                            <span className="font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 shrink-0">
                              <Check size={13} /> Seleccionado
                            </span>
                          ) : (
                            <span className="text-zinc-400 group-hover:text-blue-500 inline-flex items-center gap-0.5 shrink-0 transition-colors">
                              Seleccionar &rarr;
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {proyectosModalFiltrados.length === 0 && (
                  <div className="py-10 text-center text-xs text-zinc-400 space-y-2">
                    <p>No se encontraron proyectos que coincidan con los filtros.</p>
                    <button
                      type="button"
                      onClick={() => { setBusquedaProyectoModal(''); setFiltroEstadoProyectoModal('TODOS'); }}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                )}
              </div>

              {/* Pie del Modal */}
              <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs shrink-0">
                <span className="text-[0.7rem] text-zinc-400 font-medium">
                  {statsProyectos.total} proyectos en el sistema
                </span>
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

      {/* ─── Modal 2: Guía de 4 Pasos & Niveles de Riesgo de Burnout (RF-35 / ISO/IEC 25010) ─── */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 md:p-8 w-full max-w-3xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Encabezado del Modal */}
              <div className="flex justify-between items-start pb-3.5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                        RF-35 • ISO/IEC 25010
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                        Guía de 4 Pasos: Niveles de Riesgo & Algoritmo Predictivo
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Protocolo homologado de evaluación de carga cognitiva y mitigación de desgaste en series temporales de 21 días
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grid de 4 Pasos Homologados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Paso 1: Nivel Crítico */}
                <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/70 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-[0.68rem] text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/80 px-2 py-0.5 rounded-md">
                        PASO 1
                      </span>
                      <span className="text-[0.65rem] font-black uppercase text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full bg-white/80 dark:bg-red-900/40 border border-red-200 dark:border-red-800">
                        Score &gt; 80% • CRÍTICA
                      </span>
                    </div>
                    <h4 className="font-extrabold text-red-950 dark:text-red-200 text-sm">
                      Nivel Crítico (Sobrecarga Extrema)
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300 text-[0.72rem] leading-relaxed">
                      <strong>Diagnóstico:</strong> Carga sostenida extrema en las series S1, S2 y S3, concurrencia de más de 6 tareas críticas o acumulación severa de errores técnicos e interrupciones.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-red-200/80 dark:border-red-800/60 text-[0.7rem] text-red-800 dark:text-red-300 font-bold bg-white/60 dark:bg-red-950/40 p-2 rounded-xl">
                    🚨 <strong>Protocolo Mandatorio:</strong> Bloqueo preventivo en WBS para nuevas asignaciones. Rebalanceo urgente de tareas hacia integrantes estables.
                  </div>
                </div>

                {/* Paso 2: Nivel Alto */}
                <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/70 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-[0.68rem] text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/80 px-2 py-0.5 rounded-md">
                        PASO 2
                      </span>
                      <span className="text-[0.65rem] font-black uppercase text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full bg-white/80 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800">
                        Score 65% - 79% • ALTA
                      </span>
                    </div>
                    <h4 className="font-extrabold text-orange-950 dark:text-orange-200 text-sm">
                      Nivel Alto (Sobrecarga en Curso)
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300 text-[0.72rem] leading-relaxed">
                      <strong>Diagnóstico:</strong> Aceleración de tensión operacional en los últimos 7 días (S3 &ge; 75%) o promedio sostenido entre 65% y 79% con tareas complejas simultáneas.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-orange-200/80 dark:border-orange-800/60 text-[0.7rem] text-orange-800 dark:text-orange-300 font-bold bg-white/60 dark:bg-orange-950/40 p-2 rounded-xl">
                    ⚠️ <strong>Protocolo Mandatorio:</strong> Rebalanceo proactivo de subtareas complejas antes del cierre del sprint para prevenir la entrada a estado crítico.
                  </div>
                </div>

                {/* Paso 3: Nivel Medio */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-[0.68rem] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/80 px-2 py-0.5 rounded-md">
                        PASO 3
                      </span>
                      <span className="text-[0.65rem] font-black uppercase text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full bg-white/80 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800">
                        Score 45% - 64% • MEDIA
                      </span>
                    </div>
                    <h4 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">
                      Nivel Medio (En Alerta Preventiva)
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300 text-[0.72rem] leading-relaxed">
                      <strong>Diagnóstico:</strong> Desgaste asociado a contingencias imprevistas, bloqueos de ambiente, reuniones urgentes o soporte imprevisto de producción.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 text-[0.7rem] text-amber-800 dark:text-amber-300 font-bold bg-white/60 dark:bg-amber-950/40 p-2 rounded-xl">
                    ⏱️ <strong>Protocolo Mandatorio:</strong> Monitoreo continuo de cadencia en dailies y contención de interrupciones externas no planificadas.
                  </div>
                </div>

                {/* Paso 4: Nivel Bajo / Estable */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-[0.68rem] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-md">
                        PASO 4
                      </span>
                      <span className="text-[0.65rem] font-black uppercase text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-white/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800">
                        Score &lt; 45% • BAJA / ESTABLE
                      </span>
                    </div>
                    <h4 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">
                      Nivel Bajo / Estable (Rendimiento Óptimo)
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300 text-[0.72rem] leading-relaxed">
                      <strong>Diagnóstico:</strong> Flujo de trabajo balanceado, cadencia sostenible y alta fiabilidad bajo la norma ISO/IEC 25010 sin fatiga acumulada.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[0.7rem] text-emerald-800 dark:text-emerald-300 font-bold bg-white/60 dark:bg-emerald-950/40 p-2 rounded-xl">
                    ✅ <strong>Protocolo Mandatorio:</strong> Capacidad disponible para asumir nuevas actividades WBS o liderar iniciativas de arquitectura y mentoría.
                  </div>
                </div>
              </div>

              {/* Cuadro Técnico: Fundamentación Matemática y Ventana de 21 Días */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-[0.75rem]">
                  <Sparkles size={14} className="text-blue-500" />
                  <span>Fundamentación del Motor Analítico (Series Temporales de 21 Días)</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[0.72rem] leading-relaxed">
                  El algoritmo divide el histórico en 3 series ponderadas: <strong>Semana 1</strong> (Días 15 a 21), <strong>Semana 2</strong> (Días 8 a 14) y <strong>Semana 3</strong> (Últimos 7 días). La ponderación multidimensional combina:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[0.7rem] pt-1">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <strong className="text-blue-600 dark:text-blue-400 block font-mono">45% Ponderación</strong>
                    <span>Tareas activas en WBS y horas estimadas vs consumidas</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <strong className="text-red-600 dark:text-red-400 block font-mono">35% Ponderación</strong>
                    <span>Errores técnicos no resueltos y fallos de integración</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <strong className="text-amber-600 dark:text-amber-400 block font-mono">20% Ponderación</strong>
                    <span>Minutos acumulados en interrupciones y contingencias</span>
                  </div>
                </div>
              </div>

              {/* Botón de Cierre */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="gradient-button text-xs py-2 px-6 font-bold cursor-pointer shadow-md"
                >
                  Entendido / Cerrar Guía
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
