import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit3,
  ListTodo,
  Layers,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  FileText,
  ShieldCheck,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { DOMINIOS_WBS } from './PaginaDedicadaAsignarTarea';

export function ModalOpcionesEdicionEtapa({
  isOpen,
  etapa,
  onClose,
  onConfirmEditarNombre,
  onSeleccionarTareaAEditar
}) {
  const [vista, setVista] = useState('OPCIONES'); // 'OPCIONES' | 'EDITAR_NOMBRE' | 'SELECCIONAR_TAREA'
  const [nuevoNombreEtapa, setNuevoNombreEtapa] = useState(etapa?.nombreEtapa || '');
  const [isSubmittingNombre, setIsSubmittingNombre] = useState(false);

  // Resetear estados al cambiar de etapa o abrir modal
  React.useEffect(() => {
    if (etapa) {
      setNuevoNombreEtapa(etapa.nombreEtapa || '');
      setVista('OPCIONES');
    }
  }, [etapa, isOpen]);

  if (!isOpen || !etapa) return null;

  const actividadesList = Array.isArray(etapa.actividades) ? etapa.actividades : [];

  const handleGuardarNombre = async (e) => {
    e.preventDefault();
    if (!nuevoNombreEtapa.trim()) return;
    try {
      setIsSubmittingNombre(true);
      await onConfirmEditarNombre(etapa, nuevoNombreEtapa.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingNombre(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-4 relative"
        >
          {/* Cabecera del Modal */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-6 sm:p-7 space-y-2 relative">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 font-mono text-[0.68rem] font-black uppercase tracking-wider">
                GESTIÓN WBS
              </span>
              <span className="px-3 py-0.5 rounded-full bg-white/10 text-white font-mono text-[0.68rem] font-bold border border-white/10">
                #ETAPA_{etapa.idEtapa || etapa.id || 1}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
              {vista === 'OPCIONES' && `Opciones de Edición de Fase: ${etapa.nombreEtapa}`}
              {vista === 'EDITAR_NOMBRE' && `Modificar Nombre de Fase`}
              {vista === 'SELECCIONAR_TAREA' && `Seleccionar Tarea a Editar en: ${etapa.nombreEtapa}`}
            </h3>
            <p className="text-xs text-blue-200/90 font-medium">
              {vista === 'OPCIONES' && 'Seleccione el componente o elemento de esta fase que requiere actualización directiva.'}
              {vista === 'EDITAR_NOMBRE' && 'Edite la denominación formal de la fase o etapa de trabajo WBS.'}
              {vista === 'SELECCIONAR_TAREA' && 'Solo las tareas en estado PENDIENTE se encuentran habilitadas para reconfigurar su Squad o formulario.'}
            </p>
          </div>

          {/* Cuerpo del Modal */}
          <div className="p-6 sm:p-7 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-xs">
            {/* ─── VISTA 1: OPCIONES DE EDICIÓN ─── */}
            {vista === 'OPCIONES' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Opción A: Editar Nombre de Fase */}
                <div
                  onClick={() => setVista('EDITAR_NOMBRE')}
                  className="p-5 rounded-2xl bg-zinc-50 hover:bg-blue-50/50 dark:bg-zinc-800/60 dark:hover:bg-blue-950/30 border border-zinc-200 dark:border-zinc-700/80 hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-pointer space-y-3 group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Edit3 size={22} />
                    </div>
                    <ChevronRight size={18} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Editar Nombre de la Fase
                    </h4>
                    <p className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                      Modifique el título técnico o la denominación principal de esta etapa de trabajo WBS.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-[0.68rem] shadow-xs">
                      <Layers size={12} /> Modificar Título
                    </span>
                  </div>
                </div>

                {/* Opción B: Editar Tareas de la Fase */}
                <div
                  onClick={() => setVista('SELECCIONAR_TAREA')}
                  className="p-5 rounded-2xl bg-zinc-50 hover:bg-purple-50/50 dark:bg-zinc-800/60 dark:hover:bg-purple-950/30 border border-zinc-200 dark:border-zinc-700/80 hover:border-purple-400 dark:hover:border-purple-700 transition-all cursor-pointer space-y-3 group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <ListTodo size={22} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono text-[0.62rem] font-black border border-purple-300 dark:border-purple-800">
                      {actividadesList.length} Tareas
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Editar Tareas de esta Fase
                    </h4>
                    <p className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                      Seleccione una tarea específica para reconfigurar sus dominios, requerimientos o integrantes del Squad.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-[0.68rem] shadow-xs">
                      <FileText size={12} /> Seleccionar Tarea
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── VISTA 2: EDITAR NOMBRE DE LA FASE ─── */}
            {vista === 'EDITAR_NOMBRE' && (
              <form onSubmit={handleGuardarNombre} className="space-y-4 pt-1">
                <div className="space-y-2">
                  <label className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs block">
                    Nombre o Título de la Fase / Etapa WBS *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoNombreEtapa}
                    onChange={(e) => setNuevoNombreEtapa(e.target.value)}
                    placeholder="Ej. Fase 1: Especificación y Arquitectura N-Capas"
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setVista('OPCIONES')}
                    className="px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Volver a Opciones</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingNombre || !nuevoNombreEtapa.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md hover:shadow-lg cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSubmittingNombre ? 'Guardando Cambios...' : 'Guardar Nombre'}
                  </button>
                </div>
              </form>
            )}

            {/* ─── VISTA 3: SELECCIONAR TAREA A EDITAR ─── */}
            {vista === 'SELECCIONAR_TAREA' && (
              <div className="space-y-4">
                {/* Banner Informativo sobre restricción por Estado */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[0.72rem] font-semibold flex items-start gap-2.5">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Restricción Operativa WBS:</strong> Solo las tareas en estado <strong>PENDIENTE</strong> pueden ser editadas. Las tareas en desarrollo o completadas se encuentran bloqueadas para proteger la trazabilidad técnica.
                  </span>
                </div>

                {/* Lista de Tareas vinculadas a la Etapa */}
                <div className="space-y-3">
                  {actividadesList.length > 0 ? (
                    actividadesList.map((act, idx) => {
                      const st = (act.estado || 'PENDIENTE').toUpperCase().replace(/[\s_]+/g, '_');
                      const isPendiente = ['PENDIENTE', 'NUEVO', 'CREADO'].includes(st);

                      return (
                        <div
                          key={act.idActividad || act.id || idx}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isPendiente
                              ? 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:shadow-sm'
                              : 'bg-zinc-100/70 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800 opacity-75'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                {act.nombreActividad || act.descripcion}
                              </h5>
                              <span className={`px-2.5 py-0.5 rounded-full text-[0.6rem] font-mono font-black uppercase border ${
                                isPendiente
                                  ? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                                  : st.includes('PROCESO') || st.includes('PROGRESO') || st.includes('CURSO')
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {st.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 truncate">
                              {act.descripcionDetallada || act.descripcion || 'Sin descripción detallada.'}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                            {isPendiente ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onSeleccionarTareaAEditar(act, etapa);
                                  onClose();
                                }}
                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                              >
                                <Edit3 size={13} />
                                <span>Seleccionar para Editar</span>
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-[0.68rem] font-bold flex items-center gap-1.5 border border-zinc-300 dark:border-zinc-600">
                                <Lock size={12} />
                                <span>Bloqueada ({st.includes('PROCESO') ? 'En Proceso' : 'Completada'})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[0.72rem] text-zinc-400 italic text-center py-4">
                      Esta etapa no posee tareas asignadas actualmente.
                    </p>
                  )}
                </div>

                {/* Pie con botón Volver a Opciones y Cerrar */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setVista('OPCIONES')}
                    className="px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Volver a Opciones</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-2xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
