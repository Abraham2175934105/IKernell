import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sparkles, Sliders, CheckCircle2, AlertCircle, RefreshCw, Code2, Crown } from 'lucide-react';
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

  const [horasDevReales, setHorasDevReales] = useState(devAssignedHours);

  // Cargar tareas de desarrollo asignadas en otros proyectos desde backend
  useEffect(() => {
    if (!token) return;
    const fetchTareasReales = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/desarrollador/actividades', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const actividades = await res.json();
          const sumaHoras = (actividades || [])
            .filter(a => {
              const st = (a.estado || '').toUpperCase();
              return st !== 'COMPLETADA' && st !== 'FINALIZADA';
            })
            .reduce((acc, a) => acc + (parseInt(a.horasEstimadas || a.horas) || 0), 0);
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

  // Manejar cambio de Horas de Líder (asegurar suma = 48)
  const handleHorasLiderChange = (val) => {
    const hl = Math.min(48, Math.max(0, parseInt(val) || 0));
    setHorasLider(hl);
    setHorasDev(48 - hl);
    setModo('MANUAL');
  };

  // Aplicar sugerencia inteligente automatizada basada en tareas WBS reales
  const aplicarSugerenciaInteligente = () => {
    const baseDev = horasDevReales > 0 ? horasDevReales : devAssignedHours;
    const hDevCalc = Math.min(44, Math.max(8, baseDev > 0 ? baseDev : 24));
    const hLiderCalc = 48 - hDevCalc;
    setHorasDev(hDevCalc);
    setHorasLider(hLiderCalc);
    setModo('AUTOMATICO_INTELIGENTE');
    guardarEnBackend(hLiderCalc, hDevCalc, 'AUTOMATICO_INTELIGENTE');
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

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Sliders size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Consola de Distribución Horaria Dual (Líder ↔ Desarrollador)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                48h Semanales
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Control dinámico e inteligente de horas para balancear supervisión técnica y desarrollo de software
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={aplicarSugerenciaInteligente}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Sparkles size={14} className="text-amber-500" />
          <span>Auto-Calcular por WBS</span>
        </button>
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
              ⚠️ Advertencia de Desfase en Jornada Horaria (RF-20)
            </span>
            <p className="font-semibold leading-relaxed">
              Tienes <strong>{horasDevReales}h</strong> asignadas en tareas WBS activas de desarrollo (en otros proyectos), pero solo has reservado <strong>{horasDev}h</strong> en tu jornada de 48h. Debes ajustar tu reserva de horas o reasignar actividades.
            </p>
            <button
              type="button"
              onClick={() => {
                const hDevCalc = Math.min(44, Math.max(8, horasDevReales));
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
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 space-y-2">
          <div className="flex justify-between items-center text-amber-700 dark:text-amber-300 font-extrabold">
            <span className="flex items-center gap-1.5 text-[0.68rem] uppercase font-mono">
              <Crown size={14} /> Horas Dirección Líder
            </span>
            <span className="text-xs bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md font-mono">{horasLider}h</span>
          </div>
          <p className="text-[0.68rem] text-zinc-600 dark:text-zinc-400">
            Revisión WBS, semáforo predictivo, evaluación de riesgos y coordinación del equipo.
          </p>
        </div>

        {/* Tarjeta Rol Desarrollador */}
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/90 dark:border-purple-800/60 space-y-2">
          <div className="flex justify-between items-center text-purple-700 dark:text-purple-300 font-extrabold">
            <span className="flex items-center gap-1.5 text-[0.68rem] uppercase font-mono">
              <Code2 size={14} /> Horas Desarrollo Técnico
            </span>
            <span className="text-xs bg-purple-200/60 dark:bg-purple-900/60 px-2 py-0.5 rounded-md font-mono">{horasDev}h</span>
          </div>
          <p className="text-[0.68rem] text-zinc-600 dark:text-zinc-400">
            Ejecución directa de actividades de código, pruebas y solución de errores técnicos en WBS.
          </p>
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

      {/* Barra Proporcional Interactivamente Ajustable */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold flex-wrap gap-2">
          <span className="text-zinc-700 dark:text-zinc-300">
            Barra Proporcional de Jornada Laboral (48 Horas Semanales):
          </span>
          <span className="text-zinc-500 font-mono text-[0.7rem]">
            Modo: <strong className="text-amber-600 dark:text-amber-400">{modo.replace('_', ' ')}</strong>
          </span>
        </div>

        {/* Visual Barra Proporcional */}
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${(horasLider / 48) * 100}%` }}
            className="bg-amber-500 h-full transition-all duration-300 flex items-center justify-center text-[0.6rem] font-black text-white"
            title={`Líder: ${horasLider}h`}
          >
            {horasLider >= 8 && `${horasLider}h Líder`}
          </div>
          <div
            style={{ width: `${(horasDev / 48) * 100}%` }}
            className="bg-purple-600 h-full transition-all duration-300 flex items-center justify-center text-[0.6rem] font-black text-white"
            title={`Desarrollador: ${horasDev}h`}
          >
            {horasDev >= 8 && `${horasDev}h Dev`}
          </div>
        </div>

        {/* Deslizador de Ajuste Físico */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
            <span>Ajustar horas como Líder: <strong className="text-amber-600">{horasLider}h</strong></span>
            <span>Ajustar horas como Desarrollador: <strong className="text-purple-600">{horasDev}h</strong></span>
          </div>
          <input
            type="range"
            min="4"
            max="44"
            step="1"
            value={horasLider}
            onChange={(e) => handleHorasLiderChange(e.target.value)}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Botones de Presets Rápidos */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60">
          <span className="text-[0.68rem] font-bold text-zinc-500">Configuraciones sugeridas:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { setHorasLider(24); setHorasDev(24); setModo('MANUAL'); }}
              className="px-3 py-1 rounded-xl text-[0.68rem] font-bold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
            >
              Equilibrado (24h / 24h)
            </button>
            <button
              type="button"
              onClick={() => { setHorasLider(16); setHorasDev(32); setModo('MANUAL'); }}
              className="px-3 py-1 rounded-xl text-[0.68rem] font-bold bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-all cursor-pointer shadow-2xs"
            >
              Enfoque Técnico (16h Líder / 32h Dev)
            </button>
            <button
              type="button"
              onClick={() => { setHorasLider(32); setHorasDev(16); setModo('MANUAL'); }}
              className="px-3 py-1 rounded-xl text-[0.68rem] font-bold bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
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
          className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-2"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={16} />}
          <span>{saving ? 'Guardando...' : 'Guardar Registro de Distribución Horaria'}</span>
        </button>
      </div>
    </div>
  );
};
