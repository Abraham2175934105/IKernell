import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldAlert, Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  User, RefreshCw, Sparkles, Lock, Filter, Layers, Users, ArrowRight,
  Briefcase, Check, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { Skeleton, SkeletonCard } from '../ui/Skeleton';

/**
 * Monitor visual del Predictor de Desgaste y Burnout Histórico (RF-35).
 * Analiza la ventana deslizante de 21 días (S1, S2, S3) para Líderes y Coordinadores.
 * Reactivo al proyecto activo seleccionado en el panel.
 */
export const PredictorBurnout = ({ proyecto, etapas, onNavigateToWbs }) => {
  const api = useApi();
  const [metricas, setMetricas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDev, setSelectedDev] = useState(null);
  const [filtroModo, setFiltroModo] = useState('PROYECTO'); // 'PROYECTO' | 'GLOBAL'

  // Obtiene los IDs y nombres de los desarrolladores asignados al proyecto activo
  const devIdsEnProyecto = useMemo(() => {
    if (!etapas || !Array.isArray(etapas)) return new Set();
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
  }, [etapas]);

  // Carga las métricas históricas de burnout desde el backend
  const fetchBurnoutMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/analitica/burnout');
      const list = Array.isArray(data) ? data : [];
      setMetricas(list);
    } catch (err) {
      console.error('Error fetching burnout metrics:', err);
      setError('No se pudieron cargar las métricas históricas de desgaste.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBurnoutMetrics();
  }, [fetchBurnoutMetrics]);

  // Filtrado reactivo según el modo (Proyecto Activo vs Global)
  const metricasVisibles = useMemo(() => {
    if (!proyecto || filtroModo === 'GLOBAL') {
      return metricas;
    }
    // Filtrado por los desarrolladores asignados al proyecto activo
    return metricas.filter(m => devIdsEnProyecto.has(m.idTrabajador));
  }, [metricas, proyecto, filtroModo, devIdsEnProyecto]);

  // Sincroniza la selección de desarrollador al cambiar el proyecto o el filtro
  useEffect(() => {
    if (metricasVisibles.length > 0) {
      // Si el desarrollador seleccionado actualmente está en la lista visible, conservarlo; sino, elegir el primero
      const stillVisible = metricasVisibles.find(m => m.idTrabajador === selectedDev?.idTrabajador);
      setSelectedDev(stillVisible || metricasVisibles[0]);
    } else {
      setSelectedDev(null);
    }
  }, [metricasVisibles, proyecto?.idProyecto]);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'RIESGO_BURNOUT_INMINENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-black bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse shadow-sm">
            <AlertTriangle size={11} className="text-red-500" /> RIESGO BURNOUT
          </span>
        );
      case 'SOBRECARGA_AGUDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Activity size={11} className="text-amber-500" /> SOBRECARGA
          </span>
        );
      case 'TENDENCIA_DE_ESTRES_ACELERADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <TrendingUp size={11} className="text-blue-500" /> EN ALZA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={11} className="text-emerald-500" /> ESTABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
      
      {/* Header con Contexto Reactivo de Proyecto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800/50">
              <Sparkles size={13} className="text-blue-600 dark:text-blue-400" /> Analítica Predictiva • RF-35
            </span>
            {proyecto && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                <Briefcase size={12} className="text-blue-600 dark:text-blue-400" />
                Proyecto: <strong className="text-zinc-900 dark:text-white truncate max-w-[180px]">{proyecto.nombre}</strong>
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Predictor de Desgaste & Burnout Histórico
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Análisis de series temporales de 21 días (Semanas S1, S2, S3) basado en carga WBS, errores e interrupciones.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchBurnoutMetrics}
            disabled={loading}
            className="outline-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Sincronizar métricas de desgaste con la base de datos en tiempo real"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar Matriz</span>
          </button>
        </div>
      </div>

      {/* Selector de Alcance (Contextual al Proyecto vs Vista Global) */}
      {proyecto && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <Filter size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Filtrar alcance de la analítica:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltroModo('PROYECTO')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filtroModo === 'PROYECTO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              🎯 Equipo de "{proyecto.nombre}" ({devIdsEnProyecto.size})
            </button>
            <button
              type="button"
              onClick={() => setFiltroModo('GLOBAL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filtroModo === 'GLOBAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              🌐 Vista Global ({metricas.length})
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          <div className="lg:col-span-5 space-y-3">
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
          <div className="lg:col-span-7">
            <SkeletonCard rows={4} />
          </div>
        </div>
      ) : error ? (
        <div className="p-4 my-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      ) : metricasVisibles.length === 0 ? (
        /* Empty State Elegante cuando el proyecto no tiene desarrolladores asignados */
        <div className="py-14 px-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-4 shadow-inner">
            <Users size={28} />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Sin desarrolladores asignados en "{proyecto?.nombre || 'este proyecto'}"
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-5 leading-relaxed">
            Actualmente no hay desarrolladores con actividades WBS asignadas en este proyecto para calcular la matriz de desgaste.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {onNavigateToWbs && (
              <button
                type="button"
                onClick={onNavigateToWbs}
                className="gradient-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Layers size={13} /> Asignar Tareas en WBS
              </button>
            )}
            <button
              type="button"
              onClick={() => setFiltroModo('GLOBAL')}
              className="outline-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Users size={13} /> Ver Todos los Desarrolladores (Modo Global)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          {/* List of Developers */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              <span>Desarrolladores ({metricasVisibles.length})</span>
              <span className="font-mono text-[0.65rem] text-blue-600 dark:text-blue-400 font-bold">
                {filtroModo === 'PROYECTO' ? 'Filtro Proyecto' : 'Vista Global'}
              </span>
            </div>
            
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {metricasVisibles.map((dev) => {
                const isSelected = selectedDev?.idTrabajador === dev.idTrabajador;
                return (
                  <motion.div
                    key={dev.idTrabajador}
                    onClick={() => setSelectedDev(dev)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                        : 'bg-white dark:bg-zinc-900 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm leading-snug">{dev.nombreCompleto}</h4>
                        <p className={`text-xs ${isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
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
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                      {selectedDev.nombreCompleto}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedDev.email}</p>
                  </div>
                  {selectedDev.capacidadBloqueada && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-lg border border-red-200 dark:border-red-800">
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
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Semana 1 (Días 15-21)
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(selectedDev.scoreSemana1)}%
                    </span>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-blue-400 h-full rounded-full"
                        style={{ width: `${selectedDev.scoreSemana1}%` }}
                      />
                    </div>
                  </div>

                  {/* Semana 2 */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Semana 2 (Días 8-14)
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(selectedDev.scoreSemana2)}%
                    </span>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${selectedDev.scoreSemana2}%` }}
                      />
                    </div>
                  </div>

                  {/* Semana 3 */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                      Semana 3 (Últimos 7d)
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(selectedDev.scoreSemana3)}%
                    </span>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${selectedDev.scoreSemana3}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-800 dark:text-blue-300 mb-1.5">
                    <ShieldAlert size={15} />
                    <span>Dictamen del Motor Predictivo:</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {selectedDev.recomendacion}
                  </p>
                </div>
              </div>

              {/* Bottom Legend */}
              <div className="pt-4 mt-6 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                <span>Algoritmo de Detección Continua ISO/IEC 25010</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">IKernell Analytics v2.0</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
