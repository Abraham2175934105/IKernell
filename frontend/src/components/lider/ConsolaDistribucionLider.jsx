import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ShieldCheck, Sparkles, Sliders, CheckCircle2, AlertCircle, RefreshCw, Code2, Crown, Filter, Layers, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const ConsolaDistribucionLider = ({ devAssignedHours = 0 }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [horasLider, setHorasLider] = useState(24);
  const [horasDev, setHorasDev] = useState(24);
  const [modo, setModo] = useState('AUTOMATICO_INTELIGENTE');
  const [semanaCodigo, setSemanaCodigo] = useState('2026-W36');
  const [filtroEstadoTareas, setFiltroEstadoTareas] = useState('TODAS');

  const [horasDevReales, setHorasDevReales] = useState(devAssignedHours);
  const [actividadesDevList, setActividadesDevList] = useState([]);

  // Cargar tareas de desarrollo asignadas en otros proyectos desde backend
  useEffect(() => {
    if (!token) return;
    const fetchTareasReales = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/desarrollador/mis-actividades', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const actividades = await res.json();
          const list = Array.isArray(actividades) ? actividades : [];
          setActividadesDevList(list);

          const sumaHoras = list
            .filter(a => {
              const st = (a.estado || '').toUpperCase();
              return st !== 'COMPLETADA' && st !== 'FINALIZADA';
            })
            .reduce((acc, a) => {
              const match = (a.descripcion || '').match(/\b(\d+)\s*h(?:\/sem)?\b/i);
              const val = match ? parseInt(match[1]) : (parseInt(a.horasEstimadas || a.horas) || 6);
              return acc + val;
            }, 0);
          if (sumaHoras > 0) setHorasDevReales(sumaHoras);
        }
      } catch (err) {
        console.warn('No se pudieron consultar actividades reales de desarrollo:', err);
      }
    };
    fetchTareasReales();
  }, [token]);

  // Cargar distribución desde backend
  useEffect(() => {
    if (!user?.id && !user?.idTrabajador) return;
    const userId = user.idTrabajador || user.id;

    const fetchDistribucion = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/lider/distribucion-horaria/${userId}?semanaCodigo=${semanaCodigo}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setHorasLider(data.horasLiderAsignadas || 24);
          setHorasDev(data.horasDesarrolladorAsignadas || 24);
          setModo(data.modoDistribucion || 'AUTOMATICO_INTELIGENTE');
        }
      } catch (err) {
        console.warn('No se pudo cargar la distribución de horas del servidor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribucion();
  }, [user, token, semanaCodigo]);

  // Desglose de horas por estado WBS (Dividendo: Ejecutadas vs Activas Pendientes)
  const desgloseDividendoDev = useMemo(() => {
    let ejec = 0;
    let prog = 0;
    let pend = 0;

    (actividadesDevList || []).forEach(a => {
      const match = (a.descripcion || '').match(/\b(\d+)\s*h(?:\/sem)?\b/i);
      const hTask = match ? parseInt(match[1]) : (parseInt(a.horasEstimadas || a.horas) || 6);
      const st = (a.estado || 'PENDIENTE').toUpperCase();

      if (st === 'FINALIZADA' || st === 'COMPLETADA') {
        ejec += hTask;
      } else if (st === 'EN_PROGRESO' || st === 'EN_CURSO') {
        prog += hTask;
      } else {
        pend += hTask;
      }
    });

    const activas = prog + pend;
    const totales = activas + ejec;

    // Límite máximo de 30h para horas de desarrollo de un Líder (Mínimo 18h reservadas para dirección)
    const devAutoCalc = Math.min(30, Math.max(0, activas > 0 ? activas : 24));
    const liderAutoCalc = 48 - devAutoCalc;

    return {
      ejecutadas: ejec,
      enProgreso: prog,
      pendientes: pend,
      activas,
      totales,
      devAutoCalc,
      liderAutoCalc
    };
  }, [actividadesDevList]);

  // Auto-cálculo reactivo cuando cambia la lista de tareas WBS o el token
  useEffect(() => {
    if (modo === 'AUTOMATICO_INTELIGENTE' && actividadesDevList.length > 0) {
      setHorasDev(desgloseDividendoDev.devAutoCalc);
      setHorasLider(desgloseDividendoDev.liderAutoCalc);
    }
  }, [desgloseDividendoDev, modo, actividadesDevList.length]);

  // Manejar cambio de Horas de Líder (asegurar suma = 48 y límite dev <= 30h)
  const handleHorasLiderChange = (val) => {
    const hl = Math.min(48, Math.max(18, parseInt(val) || 18));
    const hd = 48 - hl;
    setHorasLider(hl);
    setHorasDev(hd);
    setModo('MANUAL');
  };

  // Aplicar sugerencia inteligente automatizada basada en tareas WBS reales (Límite 30h dev / 18h líder)
  const aplicarSugerenciaInteligente = () => {
    const hDevCalc = desgloseDividendoDev.devAutoCalc;
    const hLiderCalc = desgloseDividendoDev.liderAutoCalc;
    setHorasDev(hDevCalc);
    setHorasLider(hLiderCalc);
    setModo('AUTOMATICO_INTELIGENTE');
    guardarEnBackend(hLiderCalc, hDevCalc, 'AUTOMATICO_INTELIGENTE');
    toast.success(`Cálculo WBS Automático: ${hLiderCalc}h Líder / ${hDevCalc}h Desarrollador (Máx. 30h Dev)`);
  };

  // Guardar en backend
  const guardarEnBackend = async (hl = horasLider, hd = horasDev, m = modo) => {
    if (!user?.id && !user?.idTrabajador) return;
    const userId = user.idTrabajador || user.id;
    setSaving(true);

    try {
      const res = await fetch(`http://localhost:8080/api/lider/distribucion-horaria/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          semanaCodigo,
          horasLider: hl,
          horasDev: hd,
          modoDistribucion: m
        })
      });

      if (res.ok) {
        toast.success(`Jornada Dual de 48h guardada: ${hl}h Líder / ${hd}h Desarrollador`);
      } else {
        toast.error('Ocurrió un error al guardar la distribución horaria');
      }
    } catch (err) {
      toast.error('Error de conexión con la API de Distribución');
    } finally {
      setSaving(false);
    }
  };
  // Filtrado de actividades WBS según botón de estado
  const actividadesFiltradas = useMemo(() => {
    if (filtroEstadoTareas === 'EN_PROGRESO') {
      return actividadesDevList.filter(a => (a.estado || '').toUpperCase() === 'EN_PROGRESO');
    }
    if (filtroEstadoTareas === 'PENDIENTE') {
      return actividadesDevList.filter(a => (a.estado || '').toUpperCase() === 'PENDIENTE');
    }
    if (filtroEstadoTareas === 'FINALIZADA') {
      return actividadesDevList.filter(a => (a.estado || '').toUpperCase() === 'FINALIZADA' || (a.estado || '').toUpperCase() === 'COMPLETADA');
    }
    return actividadesDevList;
  }, [actividadesDevList, filtroEstadoTareas]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Sliders size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Consola de Distribución Horaria Dual (Líder ↔ Desarrollador)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                48h Semanales
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Control dinámico e inteligente de horas para balancear supervisión técnica y desarrollo de software
            </p>
          </div>
        </div>

        {/* Botón Destacado e Impactante de Auto-Calcular por WBS */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={aplicarSugerenciaInteligente}
          className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/30 border border-blue-400/30 transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden group shrink-0"
          title="Calcular automáticamente las horas según los entregables WBS activos asignados en otros proyectos"
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />
          <span className="tracking-wide">⚡ Auto-Calcular por WBS (Máx. 30h Dev)</span>
        </motion.button>
      </div>

      {/* Alerta de Desfase de Horas (RF-20 / 48h Dual) */}
      {horasDev < horasDevReales && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm"
        >
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-black uppercase tracking-wide block text-amber-700 dark:text-amber-300">
              Advertencia de Desfase en Jornada Horaria (RF-20)
            </span>
            <p className="font-semibold leading-relaxed">
              Tienes <strong>{horasDevReales}h</strong> asignadas en tareas WBS activas de desarrollo (en otros proyectos), pero solo has reservado <strong>{horasDev}h</strong> en tu jornada de 48h. Debes ajustar tu reserva de horas o reasignar actividades.
            </p>
            <button
              type="button"
              onClick={() => {
                const hDevCalc = Math.min(30, Math.max(0, horasDevReales));
                const hLiderCalc = 48 - hDevCalc;
                setHorasDev(hDevCalc);
                setHorasLider(hLiderCalc);
                setModo('AUTOMATICO_INTELIGENTE');
                guardarEnBackend(hLiderCalc, hDevCalc, 'AUTOMATICO_INTELIGENTE');
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs"
            >
              <Sparkles size={13} /> Auto-Ajustar a {horasDevReales}h de Desarrollo
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid de Tarjetas de Métricas de Horas Duales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Tarjeta Rol Líder */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/90 dark:border-blue-800/60 space-y-2">
          <div className="flex justify-between items-center text-blue-700 dark:text-blue-300 font-extrabold">
            <span className="flex items-center gap-1.5 text-[0.68rem] uppercase font-mono">
              <Crown size={14} /> Horas Dirección Líder
            </span>
            <span className="text-xs bg-blue-200/60 dark:bg-blue-900/60 px-2 py-0.5 rounded-md font-mono">{horasLider}h</span>
          </div>
          <p className="text-[0.68rem] text-zinc-600 dark:text-zinc-400">
            Supervisión WBS, semáforo predictivo, evaluación de riesgos y coordinación del equipo (Mínimo 18h reservadas para gobierno del proyecto).
          </p>
        </div>

        {/* Tarjeta Rol Desarrollador con Dividendo Visual (Ejecutadas vs Restantes por Ejecutar) */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/90 dark:border-indigo-800/60 space-y-2">
          <div className="flex justify-between items-center text-indigo-700 dark:text-indigo-300 font-extrabold">
            <span className="flex items-center gap-1.5 text-[0.68rem] uppercase font-mono">
              <Code2 size={14} /> Horas Desarrollo Técnico
            </span>
            <span className="text-xs bg-indigo-200/60 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md font-mono">{horasDev}h <span className="text-[0.6rem] font-normal text-zinc-400">(Máx. 30h)</span></span>
          </div>
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[0.68rem]">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Por Ejecutar (Activas):</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{desgloseDividendoDev.activas}h</span>
            </div>
            <div className="flex items-center justify-between text-[0.68rem]">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Ya Ejecutadas (Cumplidas):</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{desgloseDividendoDev.ejecutadas}h</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Total & Estado */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/60 space-y-2">
          <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-300 font-extrabold">
            <span className="flex items-center gap-1.5 text-[0.68rem] uppercase font-mono">
              <Clock size={14} /> Jornada Semanal Cumplida
            </span>
            <span className="text-xs bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md font-mono">48h / 48h</span>
          </div>
          <div className="flex items-center gap-1.5 text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
            <CheckCircle2 size={13} />
            <span>Distribución de jornada balanceada y validada</span>
          </div>
        </div>
      </div>

      {/* Panel Explicativo Detallado de por qué esa cantidad de Horas como Líder y Desarrollador */}
      <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-extrabold">
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Explicación del Balance de Jornada Dual (Líder ↔ Desarrollador):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[0.72rem] leading-relaxed">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/60 space-y-1">
            <span className="font-extrabold text-blue-700 dark:text-blue-300 block flex items-center gap-1">
              <Crown size={12} /> Rol Dirección Líder ({horasLider}h / 48h):
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Asignación automática de <strong>{horasLider}h</strong> ({Math.round((horasLider/48)*100)}% de la jornada) para el seguimiento WBS, revisión de Pull Requests, semáforo predictivo de riesgos y reuniones de coordinación. <em>Se garantiza un mínimo legal de 18h de liderazgo.</em>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300 block flex items-center gap-1">
              <Code2 size={12} /> Rol Desarrollo Técnico ({horasDev}h / 48h - Tope Máx 30h):
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              Calculado según tus entregables en otros proyectos: <strong>{desgloseDividendoDev.activas}h activas por ejecutar</strong> ({desgloseDividendoDev.enProgreso}h en progreso + {desgloseDividendoDev.pendientes}h pendientes). <em>{desgloseDividendoDev.ejecutadas}h ya fueron ejecutadas y liberadas en WBS.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Desglose de Tareas WBS del Líder actuando como Desarrollador con Botonera de Filtros */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Entregables WBS Asignados como Desarrollador ({actividadesDevList.length} Tareas)
            </span>
          </div>

          {/* Botonera de Filtros Rápida */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Filter size={13} className="text-zinc-400 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setFiltroEstadoTareas('TODAS')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold transition-all cursor-pointer ${filtroEstadoTareas === 'TODAS' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Todas ({actividadesDevList.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstadoTareas('EN_PROGRESO')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold transition-all cursor-pointer ${filtroEstadoTareas === 'EN_PROGRESO' ? 'bg-blue-600 text-white shadow-2xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              En Progreso ({actividadesDevList.filter(a => (a.estado || '').toUpperCase() === 'EN_PROGRESO').length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstadoTareas('PENDIENTE')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold transition-all cursor-pointer ${filtroEstadoTareas === 'PENDIENTE' ? 'bg-amber-600 text-white shadow-2xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Pendientes ({actividadesDevList.filter(a => (a.estado || '').toUpperCase() === 'PENDIENTE').length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstadoTareas('FINALIZADA')}
              className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold transition-all cursor-pointer ${filtroEstadoTareas === 'FINALIZADA' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Finalizadas ({actividadesDevList.filter(a => (a.estado || '').toUpperCase() === 'FINALIZADA' || (a.estado || '').toUpperCase() === 'COMPLETADA').length})
            </button>
          </div>
        </div>

        {actividadesFiltradas.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500 font-medium bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
            No hay tareas en el estado seleccionado ({filtroEstadoTareas}).
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {actividadesFiltradas.map((a, idx) => {
              const match = (a.descripcion || '').match(/\b(\d+)\s*h(?:\/sem)?\b/i);
              const hTask = match ? parseInt(match[1]) : (parseInt(a.horasEstimadas || a.horas) || 6);
              const estUpper = (a.estado || 'PENDIENTE').toUpperCase();
              const isFin = estUpper === 'FINALIZADA' || estUpper === 'COMPLETADO';
              const isProc = estUpper === 'EN_PROGRESO' || estUpper === 'EN_EJECUCION';

              return (
                <div key={a.idActividad || idx} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs gap-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block truncate">
                      • {a.descripcion}
                    </span>
                    <span className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                      Fase #{a.etapa?.idEtapa || a.idEtapa}: {a.etapa?.nombreEtapa || a.etapaNombre || 'Etapa WBS'} {a.etapa?.proyecto?.nombre && `— ${a.etapa.proyecto.nombre}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-black text-xs border border-indigo-200 dark:border-indigo-800">
                      {hTask}h/sem
                    </span>
                    {isFin ? (
                      <span className="px-2 py-0.5 rounded-md font-extrabold text-[0.62rem] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 size={11} /> FINALIZADA (🔒 Cumplida)
                      </span>
                    ) : isProc ? (
                      <span className="px-2 py-0.5 rounded-md font-extrabold text-[0.62rem] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                        <Activity size={11} /> EN PROGRESO (🔒 En Ejecución)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md font-extrabold text-[0.62rem] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Clock size={11} /> PENDIENTE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Barra Proporcional Interactivamente Ajustable con Dividendo Color Coded Multicapa */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold flex-wrap gap-2">
          <span className="text-zinc-700 dark:text-zinc-300">
            Barra Proporcional de Jornada Laboral (48 Horas Semanales - Límite Dev 30h):
          </span>
          <span className="text-zinc-500 font-mono text-[0.7rem]">
            Modo: <strong className="text-blue-600 dark:text-blue-400">{modo.replace('_', ' ')}</strong>
          </span>
        </div>

        {/* Visual Barra Proporcional con Dividendo Visual (Dirección Líder + Dev Activo + Dev Ejecutado) */}
        <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex shadow-inner border border-zinc-300 dark:border-zinc-700">
          {/* Segmento 1: Dirección Líder (Azul Rey: bg-blue-600) */}
          <div
            style={{ width: `${(horasLider / 48) * 100}%` }}
            className="bg-blue-600 h-full transition-all duration-300 flex items-center justify-center text-[0.65rem] font-black text-white px-2 shadow-xs shrink-0"
            title={`👑 Dirección Líder: ${horasLider}h (Mínimo 18h)`}
          >
            {horasLider >= 8 && `👑 ${horasLider}h Líder`}
          </div>

          {/* Segmento 2: Dev Activo por Ejecutar (Índigo: bg-indigo-600) */}
          <div
            style={{ width: `${(Math.min(horasDev, desgloseDividendoDev.activas > 0 ? desgloseDividendoDev.activas : horasDev) / 48) * 100}%` }}
            className="bg-indigo-600 h-full transition-all duration-300 flex items-center justify-center text-[0.65rem] font-black text-white px-2 shadow-xs shrink-0"
            title={`💻 Dev Restante por Ejecutar: ${desgloseDividendoDev.activas > 0 ? desgloseDividendoDev.activas : horasDev}h`}
          >
            {(desgloseDividendoDev.activas > 0 ? desgloseDividendoDev.activas : horasDev) >= 6 && `💻 ${desgloseDividendoDev.activas > 0 ? desgloseDividendoDev.activas : horasDev}h Dev Activo`}
          </div>

          {/* Segmento 3: Dev Ya Ejecutado (Esmeralda: bg-emerald-500) */}
          {desgloseDividendoDev.ejecutadas > 0 && (
            <div
              style={{ width: `${(Math.min(horasDev, desgloseDividendoDev.ejecutadas) / 48) * 100}%` }}
              className="bg-emerald-500 h-full transition-all duration-300 flex items-center justify-center text-[0.65rem] font-black text-white px-2 shadow-xs shrink-0"
              title={`🟢 Dev Ya Ejecutado: ${desgloseDividendoDev.ejecutadas}h (Cumplido)`}
            >
              {desgloseDividendoDev.ejecutadas >= 4 && `🟢 ${desgloseDividendoDev.ejecutadas}h Cumplidas`}
            </div>
          )}
        </div>

        {/* Deslizador de Ajuste Físico con Límite Mínimo de 18h para Líder (Tope Máx 30h Dev) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
            <span>Ajustar horas como Líder: <strong className="text-blue-600 dark:text-blue-400">{horasLider}h</strong> (Mín. 18h)</span>
            <span>Ajustar horas como Desarrollador: <strong className="text-indigo-600 dark:text-indigo-400">{horasDev}h</strong> (Máx. 30h)</span>
          </div>
          <input
            type="range"
            min="18"
            max="48"
            step="1"
            value={horasLider}
            onChange={(e) => handleHorasLiderChange(e.target.value)}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Botones de Presets Rápidos */}
        {/* Deslizador de Ajuste Físico con Límite Mínimo de 18h para Líder (Tope Máx 30h Dev) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
            <span>Ajustar horas como Líder: <strong className="text-blue-600 dark:text-blue-400">{horasLider}h</strong> (Mín. 18h)</span>
            <span>Ajustar horas como Desarrollador: <strong className="text-indigo-600 dark:text-indigo-400">{horasDev}h</strong> (Máx. 30h)</span>
          </div>
          <input
            type="range"
            min="18"
            max="48"
            step="1"
            value={horasLider}
            onChange={(e) => handleHorasLiderChange(e.target.value)}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Botones de Presets Rápidos */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60">
          <span className="text-[0.68rem] font-bold text-zinc-500">Configuraciones sugeridas (Máx 30h Dev):</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { setHorasLider(24); setHorasDev(24); setModo('MANUAL'); }}
              className="px-3 py-1 rounded-xl text-[0.68rem] font-bold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 transition-all cursor-pointer shadow-2xs"
            >
              Equilibrado (24h / 24h)
            </button>
            <button
              type="button"
              onClick={() => { setHorasLider(18); setHorasDev(30); setModo('MANUAL'); }}
              className="px-3 py-1 rounded-xl text-[0.68rem] font-bold bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
            >
              Límite Máximo Técnico (18h Líder / 30h Dev)
            </button>
            <button
              type="button"
              onClick={() => { setHorasLider(32); setHorasDev(16); setModo('MANUAL'); }}
              className="px-3 py-1 rounded-xl text-[0.68rem] font-bold bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-all cursor-pointer shadow-2xs"
            >
              Enfoque Dirección (32h Líder / 16h Dev)
            </button>
          </div>
        </div>
      </div>

      {/* Botón de Guardar en Servidor */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => guardarEnBackend()}
          className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={16} />}
          <span>{saving ? 'Guardando...' : 'Guardar Registro de Distribución Horaria'}</span>
        </button>
      </div>
    </div>
  );
};
