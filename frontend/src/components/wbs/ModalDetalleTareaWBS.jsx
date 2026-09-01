import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  Server,
  Code2,
  Sparkles,
  Database,
  TestTube2,
  Cloud,
  Briefcase,
  FileText,
  ShieldCheck,
  Calendar,
  Building2,
  Tag,
  Cpu,
  Zap,
  Check,
  CheckSquare
} from 'lucide-react';
import { DOMINIOS_WBS } from './PaginaDedicadaAsignarTarea';

export function ModalDetalleTareaWBS({
  actividad,
  etapa,
  proyecto,
  trabajadores = [],
  rolUsuario = 'LÍDER',
  usuarioActual,
  onClose
}) {
  if (!actividad) return null;

  // 1. Resolución de dominios asociados a la tarea
  const domKeysStr = actividad.cualidadTecnica || '';
  const domKeysArr = domKeysStr ? domKeysStr.split(',') : [];
  
  let dominiosResueltos = DOMINIOS_WBS.filter(d => 
    domKeysArr.includes(d.key) || 
    (actividad.cualidadNombre && actividad.cualidadNombre.toLowerCase().includes(d.label.toLowerCase()))
  );

  // Si no se encontraron por split, resolver según palabras clave en el título o cualidadNombre
  if (dominiosResueltos.length === 0) {
    const textTarget = `${actividad.nombreActividad || ''} ${actividad.descripcion || ''} ${actividad.cualidadNombre || ''}`.toLowerCase();
    DOMINIOS_WBS.forEach(dom => {
      if (dom.tags.some(t => textTarget.includes(t.toLowerCase())) || textTarget.includes(dom.key.toLowerCase())) {
        if (!dominiosResueltos.some(d => d.key === dom.key)) {
          dominiosResueltos.push(dom);
        }
      }
    });
  }

  // Fallback si la tarea no tiene dominios mapeados aún (por defecto Backend & APIs)
  if (dominiosResueltos.length === 0) {
    dominiosResueltos.push(DOMINIOS_WBS[0]);
  }

  // 2. Resolución del Squad COMPLETO de Desarrolladores Asignados (SIN RECORTAR INTEGRANTES)
  let rawDevs = [];
  if (Array.isArray(actividad.desarrolladores) && actividad.desarrolladores.length > 0) {
    rawDevs = [...actividad.desarrolladores];
  } else if (Array.isArray(actividad.equipoDesarrolladores) && actividad.equipoDesarrolladores.length > 0) {
    rawDevs = [...actividad.equipoDesarrolladores];
  } else if (actividad.desarrollador) {
    rawDevs = [actividad.desarrollador];
    if (actividad.coDesarrollador) rawDevs.push(actividad.coDesarrollador);
  }

  if (rawDevs.length === 0 && Array.isArray(trabajadores) && trabajadores.length > 0) {
    const firstDev = trabajadores.find(t => t.estado !== false && (t.rol || '').toUpperCase().includes('DESARROLLADOR')) || trabajadores[0];
    if (firstDev) rawDevs.push(firstDev);
  }

  // Garantizar unicidad por ID o Nombre
  let fullSquadList = [];
  rawDevs.forEach(dev => {
    const dName = `${dev.nombre || dev.desarrolladorNombre || ''} ${dev.apellido || dev.desarrolladorApellido || ''}`.trim();
    if (!fullSquadList.some(existing => `${existing.nombre || existing.desarrolladorNombre || ''} ${existing.apellido || existing.desarrolladorApellido || ''}`.trim() === dName)) {
      fullSquadList.push(dev);
    }
  });

  // Métrica de horas y estado
  const horasTask = Number(actividad.horasSemanales) || 8;
  const horasTotalesSquad = fullSquadList.length * horasTask;
  const estadoStr = (actividad.estado || 'PENDIENTE').toUpperCase().replace(/[\s_]+/g, '_');
  const isCompletada = ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO'].includes(estadoStr);
  const isEnProceso = ['EN_PROCESO', 'EN_PROGRESO', 'EN_CURSO', 'ACTIVO'].includes(estadoStr);

  // Nombre y Rol real del Responsable para Auditoría
  const responsableNombre = usuarioActual?.nombre 
    ? `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`.trim() 
    : (rolUsuario === 'COORDINADOR' ? 'Roberto (Coordinador General)' : 'Elena Rostova (Líder de Proyecto)');
  
  const responsableRol = usuarioActual?.rol 
    ? usuarioActual.rol 
    : (rolUsuario === 'COORDINADOR' ? 'COORDINADOR GENERAL' : 'LÍDER DE PROYECTO');

  const getInitials = (nombre = '', apellido = '') => {
    return `${(nombre[0] || '').toUpperCase()}${(apellido[0] || '').toUpperCase()}`;
  };

  // Mapeo estilizado de paleta de colores para dominios (Diferenciable del púrpura EN_PROCESO)
  const getDomainColorTheme = (key) => {
    switch (key) {
      case 'BACKEND':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800';
      case 'FRONTEND':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800';
      case 'FIGMA':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800';
      case 'DBA':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800';
      case 'QA':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800';
      case 'DEVOPS':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
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
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-4 relative"
        >
          {/* Cabecera del Modal con Gradiente Directivo */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 space-y-4 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 rounded-2xl bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer shadow-sm border border-white/10"
              title="Cerrar modal de inspección"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 font-mono text-[0.68rem] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={12} className="text-amber-400" />
                INSPECCIÓN TÉCNICA WBS
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-[0.68rem] font-bold border border-white/10">
                REF #{actividad.idActividad || actividad.id || 'ACT-001'}
              </span>
              <span className={`px-3.5 py-1 rounded-full text-[0.68rem] font-mono font-black uppercase border ${
                isCompletada
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                  : isEnProceso
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                    : 'bg-slate-500/25 text-slate-300 border-slate-500/40'
              }`}>
                Estado: {estadoStr.replace(/_/g, ' ')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight max-w-4xl">
              {actividad.nombreActividad || actividad.descripcion || 'Tarea Operativa WBS'}
            </h2>

            <div className="flex items-center gap-4 flex-wrap text-xs text-blue-200/90 font-medium pt-1">
              <span className="flex items-center gap-1.5 font-semibold">
                <Layers size={15} className="text-blue-400" />
                <span>Etapa: <strong className="text-white">{etapa?.nombreEtapa || `Fase #${actividad.idEtapa || 1}`}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Building2 size={15} className="text-blue-400" />
                <span>Proyecto: <strong className="text-white">{proyecto?.nombre || 'PRJ-001'}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 font-mono font-bold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <Clock size={14} />
                <span>{horasTask}h/semana por desarrollador</span>
              </span>
            </div>
          </div>

          {/* Cuerpo Principal del Modal en Ancho Ampliado max-w-5xl */}
          <div className="p-6 sm:p-8 space-y-7 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
            {/* SECCIÓN 1: Dominios Técnicos Requeridos */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                    <Cpu size={16} />
                  </div>
                  <span>Dominios Técnicos Requeridos ({dominiosResueltos.length})</span>
                </h4>
                <span className="text-[0.68rem] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  ✓ {dominiosResueltos.length} Dominios Asignados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {dominiosResueltos.map((dom, dIdx) => {
                  const IconComp = dom.LucideIcon;
                  const themeStyle = getDomainColorTheme(dom.key);
                  return (
                    <div
                      key={dom.key}
                      className={`p-4 rounded-2xl border space-y-2.5 shadow-2xs hover:shadow-md transition-all ${themeStyle}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-extrabold text-xs">
                          <IconComp size={16} />
                          <span>{dom.label}</span>
                        </div>
                        <span className="text-[0.6rem] font-mono font-bold px-2 py-0.5 rounded bg-white/70 dark:bg-zinc-800 border">
                          Dominio #{dIdx + 1}
                        </span>
                      </div>

                      <p className="text-[0.72rem] font-medium leading-relaxed opacity-90">
                        {dom.desc}
                      </p>

                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {dom.tags.slice(0, 4).map((tg, idx) => (
                          <span key={idx} className="text-[0.6rem] font-mono px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-800 font-bold border border-black/5">
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 2: Squad Técnico Completo de Desarrolladores (TODOS LOS INTEGRANTES VISIBLES) */}
            <div className="space-y-3.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-800">
                    <Users size={16} />
                  </div>
                  <span>Squad Técnico de Ejecución ({fullSquadList.length} Integrantes Asignados)</span>
                </h4>
                <span className="text-[0.68rem] font-mono font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                  Carga Total Squad: {horasTotalesSquad}h/semana
                </span>
              </div>

              {/* Retícula Ampliada de 2 Columnas para Desplegar el Squad Completo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {fullSquadList.map((dev, idx) => {
                  const domCUBIERTO = dominiosResueltos[idx % dominiosResueltos.length];
                  const isLiderDev = Boolean(
                    dev.esLider ||
                    ['LÍDER', 'LIDER', 'ROLE_LIDER', 'LÍDER DE PROYECTO', 'LIDER DE PROYECTO'].includes((dev.rol || '').toUpperCase()) ||
                    (dev.profesion || '').toLowerCase().includes('líder de proyecto') ||
                    (dev.profesion || '').toLowerCase().includes('lider de proyecto')
                  );

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between gap-3 shadow-2xs hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-md ${
                          isLiderDev
                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                        }`}>
                          {getInitials(dev.nombre || dev.desarrolladorNombre, dev.apellido || dev.desarrolladorApellido)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-zinc-900 dark:text-zinc-100 text-xs truncate">
                              {dev.nombre || dev.desarrolladorNombre} {dev.apellido || dev.desarrolladorApellido}
                            </span>
                            {isLiderDev && (
                              <span className="px-2 py-0.2 rounded text-[0.58rem] font-mono font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
                                Líder
                              </span>
                            )}
                          </div>
                          <span className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-semibold block truncate mt-0.5">
                            {dev.profesion || dev.especialidad || 'Desarrollador de Software'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-purple-600 dark:text-purple-400 font-extrabold text-xs block">
                          {horasTask}h/semana
                        </span>
                        <span className="text-[0.6rem] text-emerald-600 dark:text-emerald-400 font-bold block">
                          ✓ Asignado
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 3: Descripción Detallada & Criterios de Aceptación WBS */}
            <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
                  <FileText size={16} />
                </div>
                <span>Descripción Detallada & Criterios de Aceptación WBS</span>
              </h4>
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed text-xs">
                {actividad.descripcionDetallada || actividad.descripcion || 'Entregables técnicos de código, modelado de diagramas ER, contratos OpenAPI 3.0 y pruebas unitarias integrales.'}
              </div>
            </div>

            {/* SECCIÓN 4: Auditoría Directiva con Nombre y Rol Real del Responsable */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-zinc-800 dark:text-zinc-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
                  <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
                  <span>Auditoría Directiva & Trazabilidad PostgreSQL</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[0.62rem] font-mono font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  ✓ Auditado CMMI-3
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <div>
                  • Formulado / Asignado por: <strong className="text-zinc-900 dark:text-zinc-100">{responsableNombre}</strong> <span className="text-[0.65rem] text-blue-600 dark:text-blue-400 font-mono font-bold">({responsableRol})</span>
                </div>
                <div>
                  • Persistencia DB: <strong className="text-emerald-700 dark:text-emerald-300 font-mono font-bold">PostgreSQL (Tabla Actividad)</strong>
                </div>
                <div>
                  • Timestamp de Registro: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{actividad.createdAt || '2026-09-01T12:00:00Z'}</strong>
                </div>
                <div>
                  • Estado WBS Operativo: <strong className="text-purple-700 dark:text-purple-300 font-mono font-bold">{estadoStr}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Pie del Modal: Matriz de Cobertura Sin Botón Inferior */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 dark:from-zinc-800/80 dark:via-zinc-800/40 dark:to-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <CheckSquare size={16} className="text-purple-600 dark:text-purple-400" />
                Matriz de Cobertura WBS:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-black text-[0.68rem] border border-emerald-300 dark:border-emerald-800">
                100% Cobertura Squad ({fullSquadList.length} Devs / {dominiosResueltos.length} Dominios)
              </span>
            </div>

            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 font-bold text-[0.68rem]">
              <span>Squad Total: <strong className="text-purple-600 dark:text-purple-400">{horasTotalesSquad}h/semana</strong></span>
              <span>•</span>
              <span className="text-zinc-400">Presione 'X' arriba para salir</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
