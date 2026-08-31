import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, Bug, RefreshCw, 
  FileText, Send, Zap, X, Loader2, Globe, Target, Sparkles, FolderGit2, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Normaliza el estado a la convención homologada de 4 niveles
 */
const normalizarNivelSemaforo = (nivel) => {
  if (!nivel) return 'VERDE';
  const n = nivel.toUpperCase().trim();
  if (n === 'ROJO' || n.includes('CRITIC') || n.includes('BURNOUT')) return 'ROJO';
  if (n === 'NARANJA' || n.includes('ALT') || n.includes('SOBRECARGA')) return 'NARANJA';
  if (n === 'AMARILLO' || n.includes('MED') || n.includes('ALERTA')) return 'AMARILLO';
  return 'VERDE';
};

const SemaforoInteligenteComponent = ({ idProyecto, proyectoNombre, onNavigateIncidencias, onEtlExportSuccess, onSelectProyecto }) => {
  const api = useApi();
  
  // Estados locales
  const [metrics, setMetrics] = useState(null);
  const [listaProyectosGlobal, setListaProyectosGlobal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [etlResult, setEtlResult] = useState(null);

  // Extracción defensiva del ID de proyecto (soporta objetos { idProyecto: X }, string, número o null)
  const targetId = useMemo(() => {
    if (!idProyecto) return null;
    if (typeof idProyecto === 'object') {
      return idProyecto.idProyecto || idProyecto.id || null;
    }
    return idProyecto;
  }, [idProyecto]);

  const isGlobal = !targetId || targetId === 'GLOBAL';

  // Peticiones API en tiempo real (Global o por Proyecto)
  const cargarMetricas = useCallback(async () => {
    try {
      setLoading(true);
      if (isGlobal) {
        const [data, listProyectos] = await Promise.all([
          api.get('/lider/proyectos/global/metricas-semaforo').catch(() => null),
          api.get('/lider/proyectos').catch(() => [])
        ]);
        setMetrics(data && typeof data === 'object' ? data : null);
        setListaProyectosGlobal(Array.isArray(listProyectos) ? listProyectos : []);
      } else {
        const data = await api.get(`/lider/proyectos/${targetId}/metricas-semaforo`);
        setMetrics(data && typeof data === 'object' ? data : null);
      }
    } catch (err) {
      console.error('Error cargando métricas del Semáforo:', err);
      toast.error('Error al sincronizar métricas predictivas desde PostgreSQL.');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [api, targetId, isGlobal]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  // Estructura los datos para el gráfico circular según la severidad de errores (4 niveles homologados)
  const pieData = useMemo(() => {
    if (!metrics || !metrics.severityCount || typeof metrics.severityCount !== 'object') return [];
    const colors = {
      CRITICA: '#ef4444',
      ALTA: '#f97316',
      MEDIA: '#eab308',
      BAJA: '#10b981'
    };
    const labels = {
      CRITICA: 'Crítica',
      ALTA: 'Alta',
      MEDIA: 'Media',
      BAJA: 'Baja'
    };

    try {
      return Object.entries(metrics.severityCount)
        .map(([key, value]) => ({
          name: labels[key] || key,
          rawKey: key,
          value: Number(value || 0),
          color: colors[key] || '#71717a'
        }))
        .filter(item => item.value > 0);
    } catch {
      return [];
    }
  }, [metrics]);

  // Manejador de exportación ETL hacia Brasil (RF-28 a RF-30)
  const handleExportEtlBrasil = async () => {
    const targetId = isGlobal ? 1 : idProyecto;
    setExporting(true);
    setEtlResult(null);

    const toastId = toast.loading('Generando lote ETL estandarizado ISO 8601 UTC en backend...');

    try {
      const response = await api.post(`/lider/proyectos/${targetId}/etl-export-brasil`);
      setEtlResult(response);
      toast.success('Lote ETL exportado y transmitido exitosamente.', { id: toastId });
      if (onEtlExportSuccess) onEtlExportSuccess(response);
    } catch (err) {
      console.error('Error en exportación ETL:', err);
      toast.error(err.message || 'Fallo en la exportación ETL hacia Brasil.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const currentLevel = normalizarNivelSemaforo(metrics?.nivel);
  const totalHoras = metrics?.totalHorasPerdidas ?? 0;
  const erroresCriticosCount = Number(metrics?.severityCount?.CRITICA || 0);
  const erroresAltosCount = Number(metrics?.severityCount?.ALTA || 0);
  const erroresCriticosAltos = (erroresCriticosCount + erroresAltosCount) || (metrics?.cantidadErroresCriticos ?? 0);
  const erroresMedios = Number(metrics?.severityCount?.MEDIA || 0);
  const erroresBajos = Number(metrics?.severityCount?.BAJA || 0);
  const totalErrores = metrics?.totalErrores ?? (erroresCriticosAltos + erroresMedios + erroresBajos);
  const totalInterrupciones = metrics?.totalInterrupciones ?? 0;

  // Configuración de estilos, puntos de estado CSS animados y badges ejecutivos (100% Cero Emojis)
  const nivelConfig = {
    ROJO: {
      dotColor: 'bg-red-500 animate-pulse',
      badge: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 border border-red-200 dark:border-red-900',
      label: isGlobal ? 'Riesgo Organizacional Crítico' : 'Riesgo Crítico de Proyecto',
      Icon: ShieldAlert
    },
    NARANJA: {
      dotColor: 'bg-amber-500 animate-pulse',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
      label: 'Riesgo Alto (Alerta Preventiva)',
      Icon: AlertTriangle
    },
    AMARILLO: {
      dotColor: 'bg-amber-400',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
      label: 'Riesgo Moderado (En Supervisión)',
      Icon: AlertTriangle
    },
    VERDE: {
      dotColor: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
      label: 'Operación Estable - Umbral Adecuado',
      Icon: CheckCircle2
    }
  }[currentLevel] || {
    dotColor: 'bg-zinc-400',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    iconBg: 'bg-zinc-100 text-zinc-700',
    label: 'Estado en Evaluación',
    Icon: Activity
  };

  const LevelIcon = nivelConfig?.Icon || Activity;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass-panel p-6 md:p-8 mb-8 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6"
    >
      
      {/* Encabezado Corporativo (Global vs Proyecto Específico) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-xl shadow-sm">
              {isGlobal ? <Globe size={18} className="text-blue-500" /> : <FolderGit2 size={18} className="text-emerald-500" />}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {isGlobal 
                  ? 'Semáforo de Riesgo Organizacional (Salud Global)'
                  : `Semáforo de Riesgo: ${proyectoNombre || metrics?.nombreProyecto || 'Proyecto Activo'}`
                }
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Algoritmo Predictivo • PostgreSQL Live
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-medium">
                  {isGlobal ? 'Consolidación corporativa de todos los proyectos' : `Alcance filtrado por ID #${idProyecto}`}
                </span>
              </div>
            </div>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-xs font-medium max-w-2xl leading-relaxed">
            Evalúa horas de interrupción y severidad de incidencias para predecir el riesgo operacional en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={cargarMetricas}
            disabled={loading}
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-xs py-2 px-3.5 rounded-2xl font-bold inline-flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Recalcular métricas en base a PostgreSQL en tiempo real"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'} />
            <span>Actualizar</span>
          </button>
          
          <button
            type="button"
            onClick={handleExportEtlBrasil}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl whitespace-nowrap text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Transmitir lote ETL bajo norma ISO 8601 UTC a Alianza Estratégica Brasil"
          >
            {exporting ? (
              <><Loader2 size={14} className="animate-spin" /> Transmitiendo ETL...</>
            ) : (
              <><Send size={14} /> Enviar ETL Brasil (ISO 8601)</>
            )}
          </button>
        </div>
      </div>

      {/* Grid Principal de Métricas Semafóricas */}
      {loading && !metrics ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-5 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-3xl" />
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
            <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
            <div className="col-span-2 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Fila Superior: Tarjeta Hero de Salud (Izquierda) + Gráfico de Severidad y Resumen (Derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
            
            {/* 1. Tarjeta Principal del Semáforo (Nivel Visual) */}
            <div className={`${isGlobal ? 'lg:col-span-5 p-8 md:p-10' : 'lg:col-span-5 p-6 md:p-8'} border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col justify-center items-center text-center bg-white dark:bg-zinc-900 shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
              
              <div className={`${isGlobal ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20'} rounded-full flex items-center justify-center mb-4 shadow-md ${nivelConfig.iconBg} relative`}>
                <LevelIcon size={isGlobal ? 48 : 38} />
              </div>

              <span className={`inline-flex items-center gap-2 text-xs font-black tracking-wider uppercase px-4 py-1.5 rounded-full border mb-3 shadow-2xs ${nivelConfig.badge}`}>
                <span className={`w-3 h-3 rounded-full ${nivelConfig.dotColor} shrink-0`} />
                <span>{nivelConfig.label}</span>
              </span>

              <h4 className={`${isGlobal ? 'text-2xl sm:text-3xl' : 'text-xl'} font-extrabold mb-1.5 text-zinc-900 dark:text-zinc-100 tracking-tight`}>
                {metrics?.titulo || (isGlobal ? 'Salud Organizacional Estable' : 'Proyecto Estable')}
              </h4>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xs leading-relaxed">
                Cálculo automatizado sobre <strong>{totalErrores + totalInterrupciones}</strong> métricas operativas en PostgreSQL.
              </p>
            </div>

            {/* 2. Gráfico de Distribución Real de Severidad */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all justify-between">
              {pieData.length > 0 ? (
                <>
                  <div className="w-full sm:w-1/2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={62}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#ffffff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col justify-center gap-2.5 text-xs">
                    <h5 className="font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
                      Distribución Real de Severidad
                    </h5>
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-zinc-600 dark:text-zinc-400">{item.name}:</span>
                        </div>
                        <span className="font-black text-zinc-900 dark:text-white font-mono text-sm">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full text-center text-zinc-500 dark:text-zinc-400 text-xs py-8 font-medium">
                  No hay incidencias reportadas en el alcance seleccionado.
                </div>
              )}
            </div>

          </div>

          {/* Cuadrícula de 4 Cuadros Grandes de Métricas Cuantitativas por Severidad de Incidencias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* 1. Horas de Contingencia */}
            <div 
              onClick={() => onNavigateIncidencias?.({ tipo: 'INTERRUPCIONES' })}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl flex flex-col justify-between p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Haga clic para ver el detalle de interrupciones y contingencias en la Consola de Incidencias"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-extrabold uppercase tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                  {isGlobal ? 'Horas Perdidas' : 'Horas Contingencia'}
                </div>
                <span className="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver lista →
                </span>
              </div>
              <div className="my-3">
                <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {totalHoras}h
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                {totalInterrupciones} eventos en PostgreSQL
              </span>
            </div>

            {/* 2. Errores Críticos / Altos */}
            <div 
              onClick={() => onNavigateIncidencias?.({ tipo: 'ERRORES', severidad: 'CRITICA_ALTA' })}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-400 rounded-3xl flex flex-col justify-between p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Haga clic para ir a la Consola de Incidencias y filtrar los Errores Críticos / Altos"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-extrabold uppercase tracking-wider group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  <Bug size={16} className="text-red-600 dark:text-red-400" />
                  Errores Críticos / Altos
                </div>
                <span className="text-[0.65rem] font-bold text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver lista →
                </span>
              </div>
              <div className="my-3">
                <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {erroresCriticosAltos}
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                de {totalErrores} errores totales evaluados
              </span>
            </div>

            {/* 3. Incidencias Severidad Media */}
            <div 
              onClick={() => onNavigateIncidencias?.({ tipo: 'ERRORES', severidad: 'MEDIA' })}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-400 rounded-3xl flex flex-col justify-between p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Haga clic para ir a la Consola de Incidencias y filtrar las Incidencias de Severidad Media"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-extrabold uppercase tracking-wider group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />
                  Severidad Media
                </div>
                <span className="text-[0.65rem] font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver lista →
                </span>
              </div>
              <div className="my-3">
                <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {erroresMedios}
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                Riesgo moderado en flujo operativo
              </span>
            </div>

            {/* 4. Incidencias Severidad Baja */}
            <div 
              onClick={() => onNavigateIncidencias?.({ tipo: 'ERRORES', severidad: 'BAJA' })}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-3xl flex flex-col justify-between p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Haga clic para ir a la Consola de Incidencias y filtrar las Incidencias de Severidad Baja"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-extrabold uppercase tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  Severidad Baja
                </div>
                <span className="text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver lista →
                </span>
              </div>
              <div className="my-3">
                <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {erroresBajos}
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                Ajustes menores y optimizaciones
              </span>
            </div>

          </div>

          {/* MATRIZ EXCLUSIVA EN VISTA GLOBAL: Salud y Nivel de Riesgo por Proyecto */}
          {isGlobal && listaProyectosGlobal && listaProyectosGlobal.length > 0 && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                    Monitoreo Individual de Salud por Proyecto
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Supervisión consolidada de los {listaProyectosGlobal.length} proyectos activos en la plataforma.
                  </p>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                  {listaProyectosGlobal.length} Proyectos Evaluados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listaProyectosGlobal.map((p) => {
                  const isFin = p.estado === 'FINALIZADO' || p.estado === 'COMPLETADO';
                  return (
                    <div
                      key={p.idProyecto}
                      onClick={() => onSelectProyecto && onSelectProyecto(p)}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[0.65rem] font-mono font-black text-blue-600 dark:text-blue-400">
                            #PRJ-00{p.idProyecto}
                          </span>
                          <span className={`text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isFin 
                              ? 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {p.estado || 'ACTIVO'}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {p.nombre}
                        </h5>
                        <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                          {p.cliente || 'Organización Interna'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-600 dark:text-zinc-400 text-[0.7rem] font-bold">
                          ${Number(p.presupuesto || 0).toLocaleString('en-US')}
                        </span>
                        <span className="text-[0.68rem] font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                          Inspeccionar →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recomendación Proactiva del Algoritmo Predictivo */}
      <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-3.5 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <strong className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white block mb-1">
            Recomendación Predictiva (Motor IA)
          </strong>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            {metrics?.recomendacion || 'Sin recomendaciones adicionales. Mantener ritmo de entregas.'}
          </p>
        </div>
      </div>

      {/* Panel del Resultado ETL Brasil */}
      <AnimatePresence>
        {etlResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-6 bg-zinc-900 text-white border border-zinc-800 rounded-3xl relative shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <Send size={16} /> Lote ETL Generado y Transmitido a Brasil (ISO 8601 UTC)
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-zinc-400 block mb-1">Nombre de Archivo:</span>
                <span className="text-white font-bold">{etlResult.nombreArchivo}</span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-1">Registros Estandarizados:</span>
                <span className="text-emerald-400 font-bold">{etlResult.totalRegistrosExportados}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-zinc-400 block mb-1">Canales Seguros de Envío:</span>
                <span className="text-zinc-200 bg-zinc-800 px-3 py-1.5 rounded-lg inline-block mt-1">{etlResult.destinoEnvio}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setEtlResult(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
              >
                Cerrar Notificación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const SemaforoInteligente = memo(SemaforoInteligenteComponent);
