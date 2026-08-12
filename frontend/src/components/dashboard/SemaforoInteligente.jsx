import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Bug, RefreshCw, FileText, Send, Zap, X, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const SemaforoInteligenteComponent = ({ idProyecto, proyectoNombre, onEtlExportSuccess }) => {
  const api = useApi();
  
  // Estados locales
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [etlResult, setEtlResult] = useState(null);

  // Peticiones API
  const cargarMetricas = useCallback(async () => {
    if (!idProyecto) return;
    try {
      setLoading(true);
      const data = await api.get(`/lider/proyectos/${idProyecto}/metricas-semaforo`);
      setMetrics(data);
    } catch (err) {
      console.error('Error cargando métricas del Semáforo:', err);
      toast.error('Error al sincronizar métricas predictivas desde PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, [api, idProyecto]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarMetricas();
  }, [cargarMetricas]);

  // Estructura los datos para el gráfico circular según la severidad de errores
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
        value: Number(value) || 0,
        color: colors[key] || '#71717a'
      }))
      .filter(item => item.value > 0);
  }, [metrics]);

  // Manejadores de eventos (Handlers)
  const handleExportEtlBrasil = async () => {
    if (!idProyecto) {
      toast.error('Seleccione un proyecto para exportar.');
      return;
    }
    setExporting(true);
    setEtlResult(null);

    const toastId = toast.loading('Generando lote ETL estandarizado ISO 8601 UTC en backend...');

    try {
      const response = await api.post(`/lider/proyectos/${idProyecto}/etl-export-brasil`);
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

  if (loading && !metrics) {
    return (
      <div className="glass-panel p-8 mb-8 border border-zinc-200 dark:border-zinc-800 rounded-3xl animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-9 w-36 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-zinc-200 dark:bg-zinc-700 rounded-2xl" />
          <div className="h-44 bg-zinc-200 dark:bg-zinc-700 rounded-2xl" />
          <div className="h-44 bg-zinc-200 dark:bg-zinc-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentLevel = metrics?.nivel || 'VERDE';
  const totalHoras = metrics?.totalHorasPerdidas ?? 0;
  const erroresCriticos = metrics?.cantidadErroresCriticos ?? 0;
  const totalErrores = metrics?.totalErrores ?? 0;
  const totalInterrupciones = metrics?.totalInterrupciones ?? 0;

  return (
    <div className="glass-panel p-6 md:p-10 mb-8 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-xl shadow-md">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Semáforo Inteligente</h3>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">Algoritmo Predictivo RF-25 • PostgreSQL Live</span>
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-xs font-medium">
            Evaluación continua del nivel de riesgo operacional en base a contingencias e incidencias reales.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={cargarMetricas}
            disabled={loading}
            className="outline-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recalcular
          </button>
          <button
            type="button"
            onClick={handleExportEtlBrasil}
            disabled={exporting}
            className="gradient-button whitespace-nowrap text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            {exporting ? (
              <><Loader2 size={14} className="animate-spin" /> Procesando ETL...</>
            ) : (
              <><FileText size={14} /> Exportar Métricas ISO</>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
        
        {/* Risk Level Card (Semáforo) */}
        <div className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center text-center bg-white dark:bg-zinc-900 shadow-sm">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${metrics?.iconClass || 'bg-emerald-100 text-emerald-700'}`}>
            {currentLevel === 'VERDE' && <CheckCircle size={38} />}
            {currentLevel === 'NARANJA' && <AlertTriangle size={38} />}
            {currentLevel === 'ROJO' && <ShieldAlert size={38} />}
          </div>
          <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border mb-3 ${metrics?.badgeClass || 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            Nivel: {currentLevel}
          </span>
          <h4 className="text-xl font-extrabold mb-2 text-zinc-900 dark:text-white">{metrics?.titulo || 'Proyecto Estable'}</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xs">
            Cálculo automatizado sobre {totalErrores + totalInterrupciones} métricas persistidas en base de datos.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col justify-between p-6 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-2 text-xs font-bold uppercase tracking-wider">
              <Clock size={16} className="text-zinc-900 dark:text-white" /> Horas de Contingencia
            </div>
            <div className="my-2">
              <span className="text-4xl font-black text-zinc-900 dark:text-white">
                {totalHoras}h
              </span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-3">
              {totalInterrupciones} eventos registrados en PostgreSQL
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col justify-between p-6 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-2 text-xs font-bold uppercase tracking-wider">
              <Bug size={16} className="text-zinc-900 dark:text-white" /> Errores Críticos / Altos
            </div>
            <div className="my-2">
              <span className="text-4xl font-black text-zinc-900 dark:text-white">
                {erroresCriticos}
              </span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800 pt-3">
              de {totalErrores} errores totales evaluados
            </span>
          </div>

          {/* Chart Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl sm:col-span-2 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
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
                  <h5 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Distribución Real de Severidad</h5>
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
                No hay incidencias reportadas en el proyecto seleccionado.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Proactive Recommendation */}
      <div className="mt-8 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-4 bg-zinc-50 dark:bg-zinc-800/50 shadow-sm">
        <div className="mt-0.5 text-zinc-900 dark:text-white">
          <AlertTriangle size={20} />
        </div>
        <div>
          <strong className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white block mb-1">
            Recomendación Predictiva (Motor IA / Reglas RF-25)
          </strong>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            {metrics?.recomendacion || 'Sin recomendaciones adicionales.'}
          </p>
        </div>
      </div>

      {/* ETL Export Result Panel */}
      {etlResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-zinc-900 text-white border border-zinc-800 rounded-3xl relative shadow-xl"
        >
          <button onClick={() => setEtlResult(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 font-bold mb-4 text-emerald-400 text-sm">
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
    </div>
  );
};

export const SemaforoInteligente = memo(SemaforoInteligenteComponent);
