import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldAlert, Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  User, RefreshCw, Sparkles, Lock, Filter, Layers, Users, ArrowRight,
  Briefcase, Check, Info, Search, X, HelpCircle, Download, Copy,
  TrendingDown, Minus, Clock, FileText, ChevronRight, Award, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { Skeleton, SkeletonCard } from '../ui/Skeleton';

/**
 * Predictor de Desgaste y Burnout Histórico (RF-35).
 * Analítica basada en Series Temporales de 21 días (S1, S2, S3) bajo norma ISO/IEC 25010.
 * Layout Split-View Master-Detail de ancho completo, ultra-reactivo y con filtros multinivel.
 */
export const PredictorBurnout = ({ proyecto, etapas, onNavigateToWbs }) => {
  const api = useApi();

  // Estados principales
  const [metricas, setMetricas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDev, setSelectedDev] = useState(null);

  // Estados de filtrado y búsqueda interactiva
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSemaforo, setFiltroSemaforo] = useState('TODOS'); // 'TODOS' | 'CRITICO' | 'SOBRECARGA' | 'ALERTA' | 'ESTABLE'
  const [orden, setOrden] = useState('RIESGO_DESC'); // 'RIESGO_DESC' | 'RIESGO_ASC' | 'TAREAS_DESC' | 'NOMBRE_ASC'
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiando, setCopiando] = useState(false);

  // Determina si estamos en alcance de un proyecto específico o en vista global
  const isProyectoEspecifico = Boolean(proyecto && proyecto.idProyecto && proyecto.idProyecto !== 'GLOBAL');

  // Obtiene los IDs de los desarrolladores asignados al proyecto activo
  const devIdsEnProyecto = useMemo(() => {
    if (!isProyectoEspecifico || !etapas || !Array.isArray(etapas)) return null;
    const ids = new Set();
    etapas.forEach(etapa => {
      if (Array.isArray(etapa?.actividades)) {
        etapa.actividades.forEach(act => {
          if (act?.desarrollador?.idTrabajador) {
            ids.add(act.desarrollador.idTrabajador);
          }
        });
      }
    });
    return ids;
  }, [isProyectoEspecifico, etapas]);

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

  // 2. Conteo de métricas para las píldoras de semáforo
  const conteosSemaforo = useMemo(() => {
    const counts = {
      TODOS: metricasPorProyecto.length,
      CRITICO: 0,
      SOBRECARGA: 0,
      ALERTA: 0,
      ESTABLE: 0,
    };
    metricasPorProyecto.forEach(m => {
      if (m.estadoAlerta === 'RIESGO_BURNOUT_INMINENTE') counts.CRITICO++;
      else if (m.estadoAlerta === 'SOBRECARGA_AGUDA') counts.SOBRECARGA++;
      else if (m.estadoAlerta === 'TENDENCIA_DE_ESTRES_ACELERADA') counts.ALERTA++;
      else counts.ESTABLE++;
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

    // Filtro de semáforo
    if (filtroSemaforo === 'CRITICO') {
      result = result.filter(m => m.estadoAlerta === 'RIESGO_BURNOUT_INMINENTE');
    } else if (filtroSemaforo === 'SOBRECARGA') {
      result = result.filter(m => m.estadoAlerta === 'SOBRECARGA_AGUDA');
    } else if (filtroSemaforo === 'ALERTA') {
      result = result.filter(m => m.estadoAlerta === 'TENDENCIA_DE_ESTRES_ACELERADA');
    } else if (filtroSemaforo === 'ESTABLE') {
      result = result.filter(m => m.estadoAlerta === 'ESTABLE');
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

  // Sincroniza la selección de desarrollador al cambiar filtros o proyecto
  useEffect(() => {
    if (metricasFiltradas.length > 0) {
      const stillVisible = metricasFiltradas.find(m => m.idTrabajador === selectedDev?.idTrabajador);
      setSelectedDev(stillVisible || metricasFiltradas[0]);
    } else {
      setSelectedDev(null);
    }
  }, [metricasFiltradas]);

  // Genera un diagnóstico claro y libre de tecnicismos
  const getDiagnosticoClaro = (dev) => {
    if (!dev) return '';
    const score = Math.round(dev.promedioCarga || 0);
    switch (dev.estadoAlerta) {
      case 'RIESGO_BURNOUT_INMINENTE':
        return `⚠️ Riesgo Crítico de Agotamiento: Acumula 3 semanas consecutivas con sobrecarga superior al 65% (${score}% global). Presenta ${dev.tareasActivas} tareas asignadas. Se requiere rebalanceo urgente para evitar bloqueos operativos o deserción.`;
      case 'SOBRECARGA_AGUDA':
        return `🟠 Sobrecarga Elevada: Registra un pico de esfuerzo de ${Math.round(dev.scoreSemana3 || 0)}% en los últimos 7 días con ${dev.tareasActivas} tareas activas. Se recomienda redistribuir actividades de alta complejidad.`;
      case 'TENDENCIA_DE_ESTRES_ACELERADA':
        return `🟡 Tendencia de Estrés en Aumento: La curva de carga muestra un incremento semanal constante (${Math.round(dev.scoreSemana1 || 0)}% → ${Math.round(dev.scoreSemana2 || 0)}% → ${Math.round(dev.scoreSemana3 || 0)}%). Conviene monitorear entregas para evitar sobrecarga.`;
      default:
        return `🟢 Carga y Desempeño Estable: El desarrollador mantiene un nivel operativo óptimo (${score}% de carga media) con ritmo de trabajo balanceado y sostenible.`;
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

  // Exporta o descarga el informe diagnóstico del desarrollador
  const handleExportarDiagnostico = (dev) => {
    if (!dev) return;
    const fecha = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
    const contenido = `===============================================================
IKERNELL SOLUCIONES SOFTWARE - DICTAMEN DE ANALÍTICA PREDICTIVA
MÓDULO: PREDICTOR DE DESGASTE Y BURNOUT HISTÓRICO (RF-35)
NORMATIVA: ISO/IEC 25010 (Mantenibilidad & Fiabilidad de Software)
===============================================================

Fecha de Emisión: ${fecha}
Desarrollador Evaluado: ${dev.nombreCompleto} (ID: ${dev.idTrabajador})
Especialidad: ${dev.especialidad || 'Desarrollo de Software'}
Correo Electrónico: ${dev.email}
Estado de Alerta Predictiva: ${dev.estadoAlerta}
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

  // Badge estilizado de estado
  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'RIESGO_BURNOUT_INMINENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-black bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            CRÍTICO
          </span>
        );
      case 'SOBRECARGA_AGUDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            SOBRECARGA
          </span>
        );
      case 'TENDENCIA_DE_ESTRES_ACELERADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            EN ALZA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ESTABLE
          </span>
        );
    }
  };

  // Color de barra de progreso según carga
  const getProgressColor = (score) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 35) return 'bg-blue-500';
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
            
            {/* Contexto del Proyecto o Alcance Global */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
              <Briefcase size={12} className="text-blue-600 dark:text-blue-400" />
              {isProyectoEspecifico ? (
                <>Proyecto: <strong className="text-zinc-900 dark:text-white truncate max-w-[220px]">{proyecto.nombre}</strong></>
              ) : (
                <span className="text-blue-600 dark:text-blue-400">🌐 Alcance Corporativo Global (Todos los Proyectos)</span>
              )}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Predictor de Desgaste & Burnout Histórico
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
            Monitor de riesgo cognitivo y series temporales de 21 días (S1, S2, S3) bajo la norma ISO/IEC 25010. Detecta sobrecarga antes de que impacte en la calidad del software.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="¿Cómo funciona el algoritmo de predicción de Burnout?"
          >
            <HelpCircle size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Guía & Criterios</span>
          </button>

          <button
            type="button"
            onClick={fetchBurnoutMetrics}
            disabled={loading}
            className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Sincronizar métricas con PostgreSQL en tiempo real"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sincronizar Matriz</span>
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
            Sin desarrolladores con tareas en "{proyecto.nombre}"
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
            Actualmente no hay actividades WBS asignadas a desarrolladores en este proyecto para calcular la carga cognitiva y temporal.
          </p>
          {onNavigateToWbs && (
            <button
              type="button"
              onClick={onNavigateToWbs}
              className="gradient-button text-xs py-2.5 px-5 font-bold cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              <Layers size={14} /> Asignar Tareas en WBS
            </button>
          )}
        </div>
      ) : (
        /* ─── Layout Split-View Master-Detail (2 Columnas Responsivas) ─── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA (~40%): Panel de Selección, Búsqueda y Filtros
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-4 bg-zinc-50/60 dark:bg-zinc-800/30 p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80">
            
            {/* Buscador Rápido */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, especialidad..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl pl-9 pr-9 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
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

            {/* Píldoras de Filtro Semafórico */}
            <div className="space-y-1.5">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Filtrar por Semáforo de Riesgo:
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
                  onClick={() => setFiltroSemaforo('CRITICO')}
                  className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'CRITICO'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  🔴 Crítico ({conteosSemaforo.CRITICO})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('SOBRECARGA')}
                  className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'SOBRECARGA'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  🟠 Sobrecarga ({conteosSemaforo.SOBRECARGA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('ALERTA')}
                  className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'ALERTA'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                  }`}
                >
                  🟡 En Alza ({conteosSemaforo.ALERTA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('ESTABLE')}
                  className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'ESTABLE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  🟢 Estable ({conteosSemaforo.ESTABLE})
                </button>
              </div>
            </div>

            {/* Selector de Ordenamiento */}
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

            {/* Listado de Tarjetas Interactivas de Desarrolladores */}
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
                              {dev.estadoAlerta?.replace(/_/g, ' ')}
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
                            {dev.tareasActivas} tareas WBS asignadas
                          </span>
                          <span className="font-mono">
                            {score}/100 Score
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isSelected ? 'bg-blue-900/40' : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelected ? 'bg-white' : getProgressColor(score)
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
                        <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
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

                {/* 3. Grid de 4 Métricas Clave */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Tareas Asignadas
                    </span>
                    <div className="text-xl font-black text-zinc-900 dark:text-white">
                      {selectedDev.tareasActivas} <span className="text-[0.65rem] font-normal text-zinc-500">WBS</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Carga Promedio
                    </span>
                    <div className={`text-xl font-black ${
                      selectedDev.promedioCarga >= 70 ? 'text-red-600 dark:text-red-400' :
                      selectedDev.promedioCarga >= 50 ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {Math.round(selectedDev.promedioCarga)}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Pico Máximo
                    </span>
                    <div className="text-xl font-black text-zinc-900 dark:text-white">
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
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
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
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
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
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                        {Math.round(selectedDev.scoreSemana3 || 0)}%
                      </span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            selectedDev.scoreSemana3 >= 70 ? 'bg-red-500' :
                            selectedDev.scoreSemana3 >= 50 ? 'bg-amber-500' : 'bg-blue-600'
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
                    IKernell Predictive Analytics Engine • PostgreSQL Engine
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleExportarDiagnostico(selectedDev)}
                      className="outline-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm flex-1 sm:flex-initial"
                      title="Descargar informe clínico-técnico en formato plano"
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

      {/* ─── Modal de Ayuda & Criterios del Algoritmo (ISO/IEC 25010) ─── */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                    Criterios del Algoritmo de Burnout (RF-35)
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-1">
                    1. ¿Qué mide el Desgaste Cognitivo?
                  </h4>
                  <p>
                    Evalúa la acumulación de carga de trabajo, volumen de tareas concurrentes en el desglose WBS y la recurrencia de errores técnicos reportados a lo largo de un ciclo continuo de 21 días.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-1">
                    2. Series Temporales (Ventanas S1, S2, S3)
                  </h4>
                  <ul className="space-y-1 list-disc list-inside mt-1 font-mono text-[0.7rem]">
                    <li><strong>Semana 1 (Días 15-21):</strong> Base histórica de carga.</li>
                    <li><strong>Semana 2 (Días 8-14):</strong> Detección de aceleración intermedia.</li>
                    <li><strong>Semana 3 (Últimos 7 días):</strong> Carga reciente y esfuerzo pico.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-1">
                    3. Clasificación del Semáforo
                  </h4>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      <span><strong>Crítico:</strong> 3 semanas consecutivas con sobrecarga ≥ 65%.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span><strong>Sobrecarga:</strong> Pico superior al 70% en la última semana.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span><strong>En Alza:</strong> Aumento progresivo en las 3 semanas (S3 &gt; S2 &gt; S1).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span><strong>Estable:</strong> Niveles de esfuerzo controlados y sostenibles.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
