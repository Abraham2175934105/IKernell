import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, Clock, Bug, RefreshCw, 
  FileText, Send, Zap, X, Loader2, Globe, Target, Sparkles, TrendingUp
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

const SemaforoInteligenteComponent = ({ idProyecto, proyectoNombre, onEtlExportSuccess }) => {
  const api = useApi();
  
  // Estados locales
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [etlResult, setEtlResult] = useState(null);

  const isGlobal = !idProyecto || idProyecto === 'GLOBAL';

  // Peticiones API en tiempo real (Global o por Proyecto)
  const cargarMetricas = useCallback(async () => {
    try {
      setLoading(true);
      const url = isGlobal 
        ? '/lider/proyectos/global/metricas-semaforo' 
        : `/lider/proyectos/${idProyecto}/metricas-semaforo`;
      const data = await api.get(url);
      setMetrics(data);
    } catch (err) {
      console.error('Error cargando métricas del Semáforo:', err);
      toast.error('Error al sincronizar métricas predictivas desde PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, [api, idProyecto, isGlobal]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  // Estructura los datos para el gráfico circular según la severidad de errores (4 niveles homologados)
  const pieData = useMemo(() => {
    if (!metrics || !metrics.severityCount) return [];
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

    return Object.entries(metrics.severityCount)
      .map(([key, value]) => ({
        name: labels[key] || key,
        rawKey: key,
        value: Number(value) || 0,
        color: colors[key] || '#71717a'
      }))
      .filter(item => item.value > 0);
  }, [metrics]);

  // Manejador de exportación ETL hacia Brasil (RF-28 a RF-30)
  const handleExportEtlBrasil = async () => {
    const targetId = isGlobal ? 1 : idProyecto; // Si es global, genera el lote consolidado
    setExporting(true);
    setEtlResult(null);

    const toastId = toast.loading('Generando lote ETL estandarizado ISO 8601 UTC en backend...');

    try {
      const response = await api.post(`/lider/proyectos/${targetId}/etl-export-brasil`);
      setEtlResult(response);
      toast.success('¡Lote ETL exportado y transmitido a sftp.brasil.ikernell.com exitosamente!', { id: toastId });
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
  const erroresCriticos = metrics?.cantidadErroresCriticos ?? 0;
  const totalErrores = metrics?.totalErrores ?? 0;
  const totalInterrupciones = metrics?.totalInterrupciones ?? 0;

  // Configuración de estilos y badges según el nivel semafórico
  const nivelConfig = {
    ROJO: {
      badge: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse',
      iconBg: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
      label: '🔴 Nivel Crítico (Alerta Roja)',
      Icon: ShieldAlert
    },
    NARANJA: {
      badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
      label: '🟠 Nivel Alto (Riesgo Moderado)',
      Icon: AlertTriangle
    },
    AMARILLO: {
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      label: '🟡 Nivel Medio (En Alerta)',
      Icon: AlertTriangle
    },
    VERDE: {
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      label: '🟢 Nivel Bajo (Operación Estable)',
      Icon: CheckCircle
    }
  }[currentLevel] || {
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    iconBg: 'bg-zinc-100 text-zinc-700',
    label: 'Desconocido',
    Icon: Zap
  };

  const LevelIcon = nivelConfig.Icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass-panel p-6 md:p-8 mb-8 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6"
    >
      
      {/* ─── Encabezado Reactivo (Global vs Proyecto Específico) ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-xl shadow-sm">
              {isGlobal ? <Globe size={20} className="text-blue-500" /> : <Target size={20} className="text-emerald-500" />}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                {isGlobal 
                  ? '🌐 Semáforo de Riesgo Organizacional (Salud Global de la Empresa)'
                  : `🎯 Semáforo de Riesgo: ${proyectoNombre || metrics?.nombreProyecto || 'Proyecto Activo'}`
                }
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Algoritmo Predictivo RF-25 • PostgreSQL Live
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-medium">
                  {isGlobal ? 'Consolidación corporativa de todos los proyectos' : `Alcance filtrado por ID #${idProyecto}`}
                </span>
              </div>
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-xs font-medium max-w-2xl leading-relaxed">
            {isGlobal 
              ? 'Evaluación continua del nivel de riesgo operacional en toda la compañía en base a la totalidad de contingencias e incidencias reales registradas.'
              : `Monitoreo en tiempo real de severidad de errores, horas de interrupción y calidad de entregas para "${proyectoNombre || metrics?.nombreProyecto}".`
            }
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={cargarMetricas}
            disabled={loading}
            className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Recalcular métricas en base a PostgreSQL en tiempo real"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Recalcular</span>
          </button>
          
          <button
            type="button"
            onClick={handleExportEtlBrasil}
            disabled={exporting}
            className="gradient-button whitespace-nowrap text-xs py-2 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            title="Generar archivo plano bajo norma ISO 8601 UTC para Alianza Estratégica Brasil"
          >
            {exporting ? (
              <><Loader2 size={13} className="animate-spin" /> Procesando ETL...</>
            ) : (
              <><FileText size={13} /> Exportar ETL Brasil (ISO 8601)</>
            )}
          </button>
        </div>
      </div>

      {/* ─── Grid Principal de Métricas Semafóricas ─── */}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
          
          {/* 1. Tarjeta Principal del Semáforo (Nivel Visual) */}
          <div className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center text-center bg-white dark:bg-zinc-900 shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-md ${nivelConfig.iconBg}`}>
              <LevelIcon size={40} />
            </div>

            <span className={`text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full border mb-2 ${nivelConfig.badge}`}>
              {nivelConfig.label}
            </span>

            <h4 className="text-xl font-extrabold mb-1.5 text-zinc-900 dark:text-zinc-100">
              {metrics?.titulo || (isGlobal ? 'Salud Organizacional Estable' : 'Proyecto Estable')}
            </h4>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xs leading-relaxed">
              Cálculo automatizado sobre <strong>{totalErrores + totalInterrupciones}</strong> métricas operativas persistidas en PostgreSQL.
            </p>
          </div>

          {/* 2. Grid de Indicadores Cuantitativos & Gráfico */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Horas de Contingencia */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col justify-between p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <Clock size={15} className="text-blue-600 dark:text-blue-400" />
                {isGlobal ? 'Horas Corporativas Perdidas' : 'Horas de Contingencia'}
              </div>
              <div className="my-2">
                <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100">
                  {totalHoras}h
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                {totalInterrupciones} eventos registrados en PostgreSQL
              </span>
            </div>

            {/* Errores Críticos / Altos */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col justify-between p-5 shadow-sm hover:border-red-400 dark:hover:border-red-500/40 transition-all">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <Bug size={15} className="text-red-600 dark:text-red-400" />
                Errores Críticos / Altos
              </div>
              <div className="my-2">
                <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100">
                  {erroresCriticos}
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                de {totalErrores} errores totales evaluados
              </span>
            </div>

            {/* Gráfico de Distribución Real de Severidad */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl sm:col-span-2 p-5 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all">
              {pieData.length > 0 ? (
                <>
                  <div className="w-full sm:w-1/2 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={46}
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
                  <div className="w-full sm:w-1/2 flex flex-col justify-center gap-2 text-xs">
                    <h5 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
                      Distribución Real de Severidad
                    </h5>
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-zinc-600 dark:text-zinc-400">{item.name}:</span>
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-white font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full text-center text-zinc-500 dark:text-zinc-400 text-xs py-6 font-medium">
                  No hay incidencias reportadas en el alcance seleccionado.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── Recomendación Proactiva del Algoritmo Predictivo ─── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-3.5 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <strong className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white block mb-1">
            Recomendación Predictiva (Motor IA / Reglas RF-25)
          </strong>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            {metrics?.recomendacion || 'Sin recomendaciones adicionales. Mantener ritmo de entregas.'}
          </p>
        </div>
      </div>

      {/* ─── Panel del Resultado ETL Brasil ─── */}
      <AnimatePresence>
        {etlResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-6 bg-zinc-900 text-white border border-zinc-800 rounded-3xl relative shadow-xl space-y-4"
          >
            <button onClick={() => setEtlResult(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
            
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const SemaforoInteligente = memo(SemaforoInteligenteComponent);
