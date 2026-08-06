import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Bug, RefreshCw, FileText, Send, Zap, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

export const SemaforoInteligente = ({ proyectoId, proyectoNombre, errores = [], interrupciones = [] }) => {
  const api = useApi();
  const [exporting, setExporting] = useState(false);
  const [etlResult, setEtlResult] = useState(null);

  // RF-26: Cálculo Lógico del Nivel de Riesgo
  const riskAnalysis = useMemo(() => {
    const erroresSeveros = errores.filter(e => e.severidad === 'ALTA' || e.severidad === 'CRITICA');
    const cantidadErroresCriticos = erroresSeveros.length;
    
    const totalMinutosPerdidos = interrupciones.reduce((sum, i) => sum + (i.duracionMinutos || 0), 0);
    const totalHorasPerdidas = Number((totalMinutosPerdidos / 60).toFixed(1));

    let nivel = 'VERDE';
    let colorHex = '#10b981'; // accent / emerald
    let glowClass = 'shadow-[0_0_30px_rgba(16,185,129,0.3)] border-accent';
    let bgPulse = 'bg-accent/20';
    let textClass = 'text-accent';
    let titulo = 'Riesgo Bajo (Proyecto Estable)';
    let recomendacion = 'El proyecto avanza según la planificación esperada. Mantener el ritmo actual de desarrollo.';

    if (totalHorasPerdidas > 15 || cantidadErroresCriticos >= 3) {
      nivel = 'ROJO';
      colorHex = '#ef4444'; // danger
      glowClass = 'shadow-[0_0_30px_rgba(239,68,68,0.4)] border-danger';
      bgPulse = 'bg-danger/20';
      textClass = 'text-danger';
      titulo = 'ALERTA CRÍTICA DE RIESGO';
      recomendacion = '¡Atención Urgente! Las horas de contingencia o errores críticos superan el umbral tolerable. Acción proactiva recomendada: Reasignar desarrolladores inmediatamente o solicitar extensión del plazo de entrega.';
    } else if (totalHorasPerdidas >= 5 || cantidadErroresCriticos >= 1) {
      nivel = 'NARANJA';
      colorHex = '#f59e0b'; // warning
      glowClass = 'shadow-[0_0_30px_rgba(245,158,11,0.3)] border-warning';
      bgPulse = 'bg-warning/20';
      textClass = 'text-warning';
      titulo = 'Riesgo Moderado (Atención Requerida)';
      recomendacion = 'Se identifican cuellos de botella moderados. Se sugiere realizar un balance preventivo de actividades y monitorear la fase con mayor afectación.';
    }

    // Datos para gráficos
    const severityCount = { BAJA: 0, MEDIA: 0, ALTA: 0, CRITICA: 0 };
    errores.forEach(e => {
        if (severityCount[e.severidad] !== undefined) severityCount[e.severidad]++;
    });

    const pieData = [
      { name: 'Crítica', value: severityCount.CRITICA, color: '#ef4444' },
      { name: 'Alta', value: severityCount.ALTA, color: '#f97316' },
      { name: 'Media', value: severityCount.MEDIA, color: '#f59e0b' },
      { name: 'Baja', value: severityCount.BAJA, color: '#3b82f6' }
    ].filter(item => item.value > 0);

    return {
      nivel,
      colorHex,
      glowClass,
      bgPulse,
      textClass,
      titulo,
      recomendacion,
      totalHorasPerdidas,
      cantidadErroresCriticos,
      totalErrores: errores.length,
      totalInterrupciones: interrupciones.length,
      pieData
    };
  }, [errores, interrupciones]);

  const handleExportEtlBrasil = async () => {
    if (!proyectoId) return;
    setExporting(true);
    setEtlResult(null);

    // UX Notification
    const toastId = toast.loading('Procesando ETL Batch para alianza en Brasil...');

    try {
      // Si la API no está lista, simulamos retraso para UX visual
      await new Promise(r => setTimeout(r, 1500));
      // const data = await api.post(`/lider/proyectos/${proyectoId}/etl-export-brasil`);
      
      // MOCK RESULT
      const mockResult = {
        nombreArchivo: `METRICAS_BRASIL_PROY_${proyectoId}_${new Date().getTime()}.txt`,
        estado: "PROCESADO_EXITOSAMENTE",
        totalRegistrosExportados: riskAnalysis.totalErrores + riskAnalysis.totalInterrupciones,
        fechaGeneracion: new Date().toISOString(),
        destinoEnvio: "SFTP (sftp.brasil.ikernell.com) & Email Corporativo",
      };
      
      setEtlResult(mockResult);
      toast.success('¡Exportación exitosa! Métricas estandarizadas.', { id: toastId });
    } catch (err) {
      toast.error('Fallo en la exportación ETL.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="glass-panel p-6 md:p-8 mb-8 relative overflow-hidden group">
      {/* Background glow effect */}
      <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-20 -z-10 rounded-full transition-colors duration-700 ${riskAnalysis.bgPulse}`} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Semáforo Inteligente</h3>
          </div>
          <p className="text-text-muted mt-1 text-sm">
            Dashboard Predictivo de Riesgos en tiempo real para {proyectoNombre || 'el proyecto'} (RF-25)
          </p>
        </div>

        <button
          onClick={handleExportEtlBrasil}
          disabled={exporting}
          className="gradient-button whitespace-nowrap"
        >
          {exporting ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <FileText size={18} />
          )}
          <span>{exporting ? 'Procesando ETL...' : 'Exportar Métricas ISO'}</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Level Card (Semáforo) */}
        <div className={`lg:col-span-5 border-2 rounded-2xl p-6 flex flex-col justify-center items-center text-center transition-all duration-500 bg-surface/50 ${riskAnalysis.glowClass}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg`} style={{ backgroundColor: riskAnalysis.colorHex, boxShadow: `0 0 20px ${riskAnalysis.colorHex}` }}>
            {riskAnalysis.nivel === 'VERDE' && <CheckCircle size={40} className="text-white" />}
            {riskAnalysis.nivel === 'NARANJA' && <AlertTriangle size={40} className="text-white" />}
            {riskAnalysis.nivel === 'ROJO' && <ShieldAlert size={40} className="text-white animate-pulse" />}
          </div>
          <span className={`text-sm font-bold tracking-widest uppercase mb-2 ${riskAnalysis.textClass}`}>
            NIVEL DE RIESGO: {riskAnalysis.nivel}
          </span>
          <h4 className="text-xl font-semibold mb-2 text-white">{riskAnalysis.titulo}</h4>
          <p className="text-sm text-text-muted">Análisis automático basado en {riskAnalysis.totalErrores + riskAnalysis.totalInterrupciones} métricas.</p>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="glass-card flex flex-col justify-between">
            <div className="flex items-center gap-2 text-text-muted mb-2 text-sm font-medium">
              <Clock size={16} className="text-accent" /> Horas Perdidas
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-extrabold ${riskAnalysis.totalHorasPerdidas > 10 ? 'text-danger' : 'text-white'}`}>
                {riskAnalysis.totalHorasPerdidas}h
              </span>
            </div>
            <span className="text-xs text-text-dim mt-2">{riskAnalysis.totalInterrupciones} contingencias reportadas</span>
          </div>

          <div className="glass-card flex flex-col justify-between">
            <div className="flex items-center gap-2 text-text-muted mb-2 text-sm font-medium">
              <Bug size={16} className="text-danger" /> Errores Críticos
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-extrabold ${riskAnalysis.cantidadErroresCriticos > 0 ? 'text-danger' : 'text-white'}`}>
                {riskAnalysis.cantidadErroresCriticos}
              </span>
            </div>
            <span className="text-xs text-text-dim mt-2">de {riskAnalysis.totalErrores} errores totales</span>
          </div>

          {/* Chart Section */}
          <div className="glass-card sm:col-span-2 h-48 flex items-center">
            {riskAnalysis.pieData.length > 0 ? (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskAnalysis.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskAnalysis.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 flex flex-col justify-center gap-2">
                  <h5 className="text-sm font-semibold text-text-muted mb-1">Distribución de Errores</h5>
                  {riskAnalysis.pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-text-main">{item.name}:</span>
                      <span className="font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full text-center text-text-muted text-sm">No hay errores registrados en esta fase.</div>
            )}
          </div>

        </div>
      </div>

      {/* Proactive Recommendation */}
      <div className={`mt-6 p-4 rounded-xl border border-l-4 flex items-start gap-4 bg-surface/80 shadow-md ${riskAnalysis.nivel === 'ROJO' ? 'border-l-danger border-white/5' : riskAnalysis.nivel === 'NARANJA' ? 'border-l-warning border-white/5' : 'border-l-accent border-white/5'}`}>
        <div className={`mt-0.5 ${riskAnalysis.textClass}`}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <strong className={`text-sm block mb-1 ${riskAnalysis.textClass}`}>Recomendación Proactiva (Algoritmo IA)</strong>
          <p className="text-sm text-text-main leading-relaxed opacity-90">{riskAnalysis.recomendacion}</p>
        </div>
      </div>

      {/* ETL Export Result Modal / Panel */}
      {etlResult && (
        <div className="mt-6 p-5 bg-surface border border-accent/30 rounded-xl relative animate-slide-up">
          <button onClick={() => setEtlResult(null)} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors">
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-accent font-semibold mb-3">
            <Send size={18} /> Reporte ETL Generado con Éxito
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted block">Archivo:</span>
              <span className="font-mono text-primary">{etlResult.nombreArchivo}</span>
            </div>
            <div>
              <span className="text-text-muted block">Registros Exportados:</span>
              <span className="text-white font-medium">{etlResult.totalRegistrosExportados}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-text-muted block">Destinos de Envío:</span>
              <span className="text-white bg-white/10 px-2 py-1 rounded inline-block mt-1">{etlResult.destinoEnvio}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
