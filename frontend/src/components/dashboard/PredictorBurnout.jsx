import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Activity, TrendingUp, AlertTriangle, CheckCircle2, User, RefreshCw, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApi } from '../../hooks/useApi';

/**
 * Monitor visual del Predictor de Desgaste y Burnout Histórico (RF-35).
 * Analiza la ventana deslizante de 21 días (S1, S2, S3) para Líderes y Coordinadores.
 */
export const PredictorBurnout = () => {
  const api = useApi();
  const [metricas, setMetricas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDev, setSelectedDev] = useState(null);

  const fetchBurnoutMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/analitica/burnout');
      setMetricas(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedDev) {
        setSelectedDev(data[0]);
      }
    } catch (err) {
      console.error('Error fetching burnout metrics:', err);
      setError('No se pudieron cargar las métricas históricas de desgaste.');
    } finally {
      setLoading(false);
    }
  }, [api, selectedDev]);

  useEffect(() => {
    fetchBurnoutMetrics();
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'RIESGO_BURNOUT_INMINENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border border-zinc-700 animate-pulse shadow-sm">
            <AlertTriangle size={13} className="text-red-500" /> RIESGO BURNOUT
          </span>
        );
      case 'SOBRECARGA_AGUDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200 border border-zinc-600">
            <Activity size={13} className="text-amber-400" /> SOBRECARGA
          </span>
        );
      case 'TENDENCIA_DE_ESTRES_ACELERADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200 border border-zinc-600">
            <TrendingUp size={13} className="text-yellow-400" /> EN ALZA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
            <CheckCircle2 size={13} className="text-emerald-500" /> ESTABLE
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} /> Analítica Predictiva • RF-35
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Predictor de Desgaste & Burnout Histórico
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            Análisis de series temporales de 21 días (Semanas S1, S2, S3) basado en carga WBS, errores e interrupciones.
          </p>
        </div>

        <button
          onClick={fetchBurnoutMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-bold transition-all self-start sm:self-auto border border-zinc-200 dark:border-zinc-700"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar Matriz</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500">
          <Activity size={32} className="animate-spin mx-auto mb-3 text-zinc-400" />
          <p className="text-sm font-medium">Calculando matriz de desgaste temporal...</p>
        </div>
      ) : error ? (
        <div className="p-4 my-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      ) : metricas.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">
          <User size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay desarrolladores activos registrados para calcular el histórico.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Developers */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Desarrolladores Monitoreados ({metricas.length})
            </h3>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {metricas.map((dev) => {
                const isSelected = selectedDev?.idTrabajador === dev.idTrabajador;
                return (
                  <motion.div
                    key={dev.idTrabajador}
                    onClick={() => setSelectedDev(dev)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-lg'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm leading-snug">{dev.nombreCompleto}</h4>
                        <p className={`text-xs ${isSelected ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {dev.especialidad}
                        </p>
                      </div>
                      <div>{getStatusBadge(dev.estadoAlerta)}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-current/10">
                      <span>{dev.tareasActivas} tareas WBS</span>
                      <span className="font-mono font-bold">Score: {dev.promedioCarga}/100</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Developer Deep Dive Card */}
          {selectedDev && (
            <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                      {selectedDev.nombreCompleto}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedDev.email}</p>
                  </div>
                  {selectedDev.capacidadBloqueada && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                      <Lock size={12} /> Asignación Bloqueada
                    </span>
                  )}
                </div>

                {/* 3-Week Historical Window Indicator */}
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  Evolución Histórica de Carga Cognitiva (21 Días)
                </h4>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {/* Semana 1 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Semana 1 (Días 15-21)
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                      {Math.round(selectedDev.scoreSemana1)}%
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-zinc-600 h-full rounded-full"
                        style={{ width: `${selectedDev.scoreSemana1}%` }}
                      />
                    </div>
                  </div>

                  {/* Semana 2 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Semana 2 (Días 8-14)
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                      {Math.round(selectedDev.scoreSemana2)}%
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-zinc-600 h-full rounded-full"
                        style={{ width: `${selectedDev.scoreSemana2}%` }}
                      />
                    </div>
                  </div>

                  {/* Semana 3 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Semana 3 (Últimos 7d)
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                      {Math.round(selectedDev.scoreSemana3)}%
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-zinc-900 dark:bg-white h-full rounded-full"
                        style={{ width: `${selectedDev.scoreSemana3}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-white mb-1.5">
                    <ShieldAlert size={15} />
                    <span>Dictamen del Motor Predictivo:</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {selectedDev.recomendacion}
                  </p>
                </div>
              </div>

              {/* Bottom Legend */}
              <div className="pt-4 mt-6 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Algoritmo de Detección Continua ISO/IEC 25010</span>
                <span className="font-mono">IKernell Analytics v2.0</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
