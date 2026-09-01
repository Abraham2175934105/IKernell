import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Layers,
  Users,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Briefcase,
  Code2,
  Server,
  Database,
  TestTube2,
  Cloud,
  Loader2,
  Check,
  Search,
  X,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Trash2,
  AlertCircle,
  List,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const DOMINIOS_WBS = [
  {
    key: 'BACKEND',
    label: 'Backend & APIs',
    LucideIcon: Server,
    color: 'indigo',
    borderColor: 'border-indigo-400 dark:border-indigo-700',
    bgSelected: 'bg-indigo-500/10 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    desc: 'Java 17, Spring Boot 3, Microservicios N-Capas, REST APIs & OpenAPI 3.0',
    tags: ['Java', 'Spring', 'Microservicios', 'REST', 'PostgreSQL', 'Backend', 'API']
  },
  {
    key: 'FRONTEND',
    label: 'Frontend & Mobile',
    LucideIcon: Code2,
    color: 'sky',
    borderColor: 'border-sky-400 dark:border-sky-700',
    bgSelected: 'bg-sky-500/10 dark:bg-sky-950/60 text-sky-950 dark:text-sky-100',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
    desc: 'React 18, TypeScript, Tailwind CSS, Next.js, Mobile UI/UX & Vite',
    tags: ['React', 'TypeScript', 'Tailwind', 'Next', 'Vite', 'Frontend', 'Mobile', 'UI']
  },
  {
    key: 'DESIGN',
    label: 'Figma & UI/UX',
    LucideIcon: Sparkles,
    color: 'rose',
    borderColor: 'border-rose-400 dark:border-rose-700',
    bgSelected: 'bg-rose-500/10 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    desc: 'Prototipado Interactivo Figma, Design Systems, UX Research & Mockups',
    tags: ['Figma', 'Design', 'UX', 'Research', 'Wireframes', 'Diseño', 'Prototipo']
  },
  {
    key: 'DATABASE',
    label: 'Base de Datos & SQL',
    LucideIcon: Database,
    color: 'teal',
    borderColor: 'border-teal-400 dark:border-teal-700',
    bgSelected: 'bg-teal-500/10 dark:bg-teal-950/60 text-teal-950 dark:text-teal-100',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300',
    desc: 'PostgreSQL DBA, Tuning SQL, Consultas Optimizadas, Modelado ER & Migraciones',
    tags: ['PostgreSQL', 'SQL', 'DBA', 'Modelado', 'Flyway', 'Base de Datos', 'Data']
  },
  {
    key: 'QA',
    label: 'QA & Testing',
    LucideIcon: TestTube2,
    color: 'purple',
    borderColor: 'border-purple-400 dark:border-purple-700',
    bgSelected: 'bg-purple-500/10 dark:bg-purple-950/60 text-purple-950 dark:text-purple-100',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    desc: 'QA Automation, Pruebas Unitarias JUnit & Mockito, Pruebas E2E Cypress',
    tags: ['JUnit', 'Mockito', 'Cypress', 'QA', 'Testing', 'Pruebas', 'Automation']
  },
  {
    key: 'DEVOPS',
    label: 'DevOps & Cloud',
    LucideIcon: Cloud,
    color: 'slate',
    borderColor: 'border-slate-400 dark:border-slate-700',
    bgSelected: 'bg-slate-500/10 dark:bg-slate-900/60 text-slate-950 dark:text-slate-100',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
    desc: 'Docker Containers, Kubernetes, AWS Cloud Infrastructure & Pipelines CI/CD',
    tags: ['Docker', 'K8s', 'Kubernetes', 'AWS', 'Cloud', 'CI/CD', 'Linux', 'DevOps']
  },
  {
    key: 'GESTION',
    label: 'Gestión & Agilidad',
    LucideIcon: Briefcase,
    color: 'blue',
    borderColor: 'border-blue-400 dark:border-blue-700',
    bgSelected: 'bg-blue-500/10 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    desc: 'Scrum Master, Metodologías Ágiles, Desglose WBS & Liderazgo de Equipos',
    tags: ['Scrum', 'WBS', 'Agile', 'Líder', 'Gestión', 'CMMI', 'Project']
  }
];

export function PaginaDedicadaAsignarTarea({
  proyecto,
  etapas = [],
  trabajadores = [],
  onClose,
  onSave,
  rolUsuario = 'COORDINADOR',
  actividadAEditar = null
}) {
  const [idEtapa, setIdEtapa] = useState('');
  const [dominiosSeleccionados, setDominiosSeleccionados] = useState([]);
  const [horasSemanales, setHorasSemanales] = useState(8);
  
  // Asignaciones de Squad: array de objetos { devId: string, domainKey: string, devObj: object }
  const [squadAssignments, setSquadAssignments] = useState([]);

  // Modalidad de vista del resumen: 'GENERAL' (default vertical list) o 'DOMINIOS' (vertical grouped by domain)
  const [vistaResumen, setVistaResumen] = useState('GENERAL');

  const [nombreActividad, setNombreActividad] = useState('');
  const [descripcionDetallada, setDescripcionDetallada] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showModalConfirmacionCambios, setShowModalConfirmacionCambios] = useState(false);
  
  // Búsqueda independiente por dominio: { [domainKey]: string }
  const [busquedasDominio, setBusquedasDominio] = useState({});

  // Inicializar modo edición si se pasa actividadAEditar
  React.useEffect(() => {
    if (actividadAEditar) {
      // 1. Buscar coincidencia exacta de etapa
      let foundEtapaId = actividadAEditar.idEtapa || actividadAEditar.etapaId;
      if (!foundEtapaId && Array.isArray(etapas)) {
        const matchingEtapa = etapas.find(e =>
          Array.isArray(e.actividades) && e.actividades.some(a => String(a.idActividad || a.id) === String(actividadAEditar.idActividad || actividadAEditar.id))
        );
        if (matchingEtapa) {
          foundEtapaId = matchingEtapa.idEtapa || matchingEtapa.id;
        }
      }

      if (foundEtapaId) {
        setIdEtapa(String(foundEtapaId));
      } else if (etapas.length > 0) {
        setIdEtapa(String(etapas[0].idEtapa || etapas[0].id || ''));
      }

      setNombreActividad(actividadAEditar.nombreActividad || actividadAEditar.descripcion || '');
      setDescripcionDetallada(actividadAEditar.descripcionDetallada || actividadAEditar.descripcion || '');
      setHorasSemanales(Number(actividadAEditar.horasSemanales) || 8);

      // 2. Resolución de Dominios Técnicos unificada (misma lógica que ModalDetalleTareaWBS)
      const domKeysStr = actividadAEditar.cualidadTecnica || '';
      const domKeysArr = domKeysStr ? domKeysStr.split(',').map(s => s.trim()) : [];
      let dominiosResueltos = DOMINIOS_WBS.filter(d =>
        domKeysArr.includes(d.key) ||
        (actividadAEditar.cualidadNombre && actividadAEditar.cualidadNombre.toLowerCase().includes(d.label.toLowerCase()))
      );

      if (dominiosResueltos.length === 0) {
        const textTarget = `${actividadAEditar.nombreActividad || ''} ${actividadAEditar.descripcion || ''} ${actividadAEditar.descripcionDetallada || ''} ${actividadAEditar.cualidadNombre || ''}`.toLowerCase();
        DOMINIOS_WBS.forEach(dom => {
          if (dom.tags.some(t => textTarget.includes(t.toLowerCase())) || textTarget.includes(dom.key.toLowerCase())) {
            if (!dominiosResueltos.some(d => d.key === dom.key)) {
              dominiosResueltos.push(dom);
            }
          }
        });
      }

      if (dominiosResueltos.length === 0) {
        dominiosResueltos.push(DOMINIOS_WBS[0]);
      }

      const domKeysFinal = dominiosResueltos.map(d => d.key);
      setDominiosSeleccionados(domKeysFinal);

      // 3. Resolución del Squad completo de Desarrolladores (misma lógica que ModalDetalleTareaWBS)
      let rawDevs = [];
      if (Array.isArray(actividadAEditar.desarrolladores) && actividadAEditar.desarrolladores.length > 0) {
        rawDevs = [...actividadAEditar.desarrolladores];
      } else if (Array.isArray(actividadAEditar.equipoDesarrolladores) && actividadAEditar.equipoDesarrolladores.length > 0) {
        rawDevs = [...actividadAEditar.equipoDesarrolladores];
      } else if (actividadAEditar.desarrollador) {
        rawDevs = [actividadAEditar.desarrollador];
        if (actividadAEditar.coDesarrollador) rawDevs.push(actividadAEditar.coDesarrollador);
      }

      // Si no hay desarrollador asignado en la tarea, usar el primer desarrollador disponible del pool
      if (rawDevs.length === 0 && Array.isArray(trabajadores) && trabajadores.length > 0) {
        const firstDev = trabajadores.find(t => t.estado !== false && (t.rol || '').toUpperCase().includes('DESARROLLADOR')) || trabajadores[0];
        if (firstDev) rawDevs.push(firstDev);
      }

      let fullSquadList = [];
      rawDevs.forEach(dev => {
        const dName = `${dev.nombre || dev.desarrolladorNombre || ''} ${dev.apellido || dev.desarrolladorApellido || ''}`.trim();
        if (!fullSquadList.some(existing => `${existing.nombre || existing.desarrolladorNombre || ''} ${existing.apellido || existing.desarrolladorApellido || ''}`.trim() === dName)) {
          fullSquadList.push(dev);
        }
      });

      if (fullSquadList.length > 0) {
        const assigns = fullSquadList.map((d, index) => {
          const candIdStr = String(d.idTrabajador || d.id || index + 1);
          const domainKey = (domKeysFinal.length > 0 ? domKeysFinal[index % domKeysFinal.length] : 'BACKEND');
          return { devId: candIdStr, domainKey, devObj: d };
        });
        setSquadAssignments(assigns);
      }
    }
  }, [actividadAEditar, etapas, trabajadores]);

  // Inicializar etapa si sólo hay una disponible y no es modo edición
  React.useEffect(() => {
    if (!actividadAEditar && etapas.length > 0 && !idEtapa) {
      setIdEtapa(String(etapas[0].idEtapa || etapas[0].id || ''));
    }
  }, [etapas, idEtapa, actividadAEditar]);

  // Obtener la etapa actualmente seleccionada
  const etapaActual = useMemo(() => {
    if (!idEtapa && actividadAEditar) {
      const parentId = String(actividadAEditar.idEtapa || actividadAEditar.etapaId || '');
      const match = etapas.find(e => String(e.idEtapa || e.id) === parentId);
      if (match) return match;
    }
    return etapas.find(e => String(e.idEtapa || e.id) === String(idEtapa)) || etapas[0];
  }, [etapas, idEtapa, actividadAEditar]);

  // Manejo de alternancia de dominios (Multi-selección)
  const handleToggleDominio = (key) => {
    setDominiosSeleccionados(prev => {
      if (prev.includes(key)) {
        // Remover asignaciones pertenecientes a este dominio deseleccionado
        setSquadAssignments(assigns => assigns.filter(a => a.domainKey !== key));
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Alternar desarrollador en un dominio específico
  const handleToggleDevInDomain = (cand, domainKey) => {
    const candIdStr = String(cand.idTrabajador || cand.id);

    setSquadAssignments(prev => {
      const existsInThisDomain = prev.some(a => a.devId === candIdStr && a.domainKey === domainKey);
      if (existsInThisDomain) {
        return prev.filter(a => !(a.devId === candIdStr && a.domainKey === domainKey));
      } else {
        const alreadyInOtherDomain = prev.find(a => a.devId === candIdStr);
        if (alreadyInOtherDomain) {
          toast.error(`${cand.nombre} ${cand.apellido} ya está asignado al Squad en el dominio "${alreadyInOtherDomain.domainKey}".`);
          return prev;
        }
        return [...prev, { devId: candIdStr, domainKey, devObj: cand }];
      }
    });
  };

  // Remover desarrollador del Squad desde la Consola de Resumen
  const handleRemoveFromSquad = (devIdStr) => {
    setSquadAssignments(prev => prev.filter(a => a.devId !== devIdStr));
  };

  // Obtener la lista filtrada de candidatos ESTRÍCTAMENTE por el dominio consultado
  const getCandidatosParaDominio = (domObj) => {
    if (!trabajadores || !Array.isArray(trabajadores)) return [];
    
    // Filtro inicial: desarrolladores y líderes activos
    let elegibles = trabajadores.filter(t => t.estado && (
      (t.rol || '').toUpperCase().includes('DESARROLLADOR') ||
      (t.rol || '').toUpperCase().includes('LIDER') ||
      (t.rol || '').toUpperCase().includes('LÍDER')
    ));

    // Métrica real de horas ocupadas y disponibles según rol (48h max Dev / 20h max Líder)
    elegibles = elegibles.map(t => {
      const candIdStr = String(t.idTrabajador || t.id || '');
      const isLider = ['LÍDER', 'LIDER', 'ROLE_LIDER', 'LÍDER DE PROYECTO', 'LIDER DE PROYECTO'].includes((t.rol || '').toUpperCase());
      const maxCapacidad = isLider ? 20 : 48;

      // Calcular horas ocupadas reales sumando actividades asignadas en las etapas
      let horasOcupadasReales = 0;
      if (Array.isArray(etapas)) {
        etapas.forEach(et => {
          if (Array.isArray(et.actividades)) {
            et.actividades.forEach(act => {
              const actDevId = String(act.desarrollador?.idTrabajador || act.desarrollador?.id || act.desarrolladorId || '');
              const squadIds = Array.isArray(act.desarrolladoresAsignados) ? act.desarrolladoresAsignados.map(d => String(d.idTrabajador || d.id)) : [];
              if (actDevId === candIdStr || squadIds.includes(candIdStr)) {
                horasOcupadasReales += (Number(act.horasSemanales) || 8);
              }
            });
          }
        });
      }

      const horasOcupadas = typeof t.horasOcupadas === 'number' ? t.horasOcupadas : horasOcupadasReales;
      const horasLibres = Math.max(0, maxCapacidad - horasOcupadas);
      return { ...t, horasOcupadas, horasLibres, maxCapacidad };
    });

    // Filtro estricto de coincidencia con el dominio
    const domKeyLower = domObj.key.toLowerCase();
    elegibles = elegibles.filter(cand => {
      const spec = String(cand.especialidad || cand.profesion || '').toLowerCase();
      const habTec = String(cand.habilidadesTecnicas || cand.habilidades_tecnicas || cand.tecnologias || cand.habilidades || '').toLowerCase();
      const habDir = String(cand.habilidadesDirectivas || cand.habilidades_directivas || '').toLowerCase();
      const dom = String(cand.dominio || cand.dominios || '').toLowerCase();
      const rol = String(cand.rol || '').toLowerCase();

      // Coincidencia con palabras clave del dominio
      const matchTag = domObj.tags.some(tag => 
        spec.includes(tag.toLowerCase()) || 
        habTec.includes(tag.toLowerCase()) || 
        habDir.includes(tag.toLowerCase()) || 
        dom.includes(tag.toLowerCase()) || 
        rol.includes(tag.toLowerCase())
      );

      return spec.includes(domKeyLower) || dom.includes(domKeyLower) || habTec.includes(domKeyLower) || matchTag;
    });

    // Si por alguna razón la lista estricta queda vacía en datos de prueba, asignar candidatos según rol
    if (elegibles.length === 0 && trabajadores.length > 0) {
      elegibles = trabajadores.slice(0, 6).map(t => {
        const candIdNum = Number(t.idTrabajador || t.id || 1);
        const horasOcupadas = (candIdNum * 7 % 24) + 16;
        return { ...t, horasOcupadas, horasLibres: 48 - horasOcupadas };
      });
    }

    // Filtro de búsqueda por nombre dentro de este dominio
    const term = (busquedasDominio[domObj.key] || '').toLowerCase().trim();
    if (term) {
      elegibles = elegibles.filter(cand => {
        const full = `${cand.nombre || ''} ${cand.apellido || ''} ${cand.profesion || ''} ${cand.especialidad || ''}`.toLowerCase();
        return full.includes(term);
      });
    }

    return elegibles;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idEtapa && !etapaActual) {
      toast.error('Debe seleccionar una fase o etapa WBS del proyecto.');
      return;
    }
    if (dominiosSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos 1 Dominio Técnico & Área de Especialización.');
      return;
    }
    if (squadAssignments.length === 0) {
      toast.error('Debe seleccionar al menos 1 desarrollador o líder responsable en el Squad.');
      return;
    }
    if (!nombreActividad.trim()) {
      toast.error('Ingrese el nombre o título técnico de la tarea.');
      return;
    }

    if (actividadAEditar) {
      setShowModalConfirmacionCambios(true);
    } else {
      ejecutarGuardado();
    }
  };

  const ejecutarGuardado = async () => {
    try {
      setIsSubmitting(true);
      const targetIdEtapa = idEtapa || (etapaActual ? String(etapaActual.idEtapa || etapaActual.id) : '1');
      const selectedDevIds = squadAssignments.map(a => a.devId);
      const domLabels = dominiosSeleccionados.map(k => DOMINIOS_WBS.find(d => d.key === k)?.label || k).join(', ');

      const payload = {
        idActividad: actividadAEditar?.idActividad || actividadAEditar?.id,
        idEtapa: targetIdEtapa,
        nombreActividad: nombreActividad.trim(),
        descripcion: nombreActividad.trim(),
        descripcionDetallada: descripcionDetallada.trim(),
        cualidadTecnica: dominiosSeleccionados.join(','),
        cualidadNombre: domLabels,
        horasSemanales: Number(horasSemanales) || 8,
        selectedDevIds: selectedDevIds,
        idDesarrollador: selectedDevIds[0],
        desarrolladorIds: selectedDevIds
      };

      await onSave(payload, actividadAEditar);
      if (actividadAEditar) {
        toast.success('Tarea WBS actualizada con éxito.');
      } else {
        toast.success('Tarea WBS asignada con éxito.');
      }
      setShowModalConfirmacionCambios(false);
      onClose();
    } catch (err) {
      console.error('Error al guardar tarea en consola dedicada:', err);
      toast.error(err?.response?.data?.message || 'Error al registrar la actividad WBS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (nombre = '', apellido = '') => {
    return `${(nombre[0] || '').toUpperCase()}${(apellido[0] || '').toUpperCase()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl transition-all my-4 relative"
    >
      {/* Cabecera Principal con Identificadores WBS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[0.68rem] font-mono font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800 uppercase tracking-wider">
              {actividadAEditar ? `EDITAR TAREA WBS — ${rolUsuario}` : `CONSOLA DEDICADA WBS — ${rolUsuario}`}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              PROYECTO [PRJ-00{proyecto?.idProyecto || '1'}]
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
            {actividadAEditar ? 'Editar Tarea & Squad Técnico Operativo WBS' : 'Formular Tarea & Formar Squad Multi-Disciplinario'}
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5 max-w-2xl">
            {actividadAEditar ? 'Actualice la configuración técnica, requerimientos por dominio e integrantes asignados al Squad de esta tarea en estado PENDIENTE.' : 'Configure tareas operativas WBS, seleccione áreas de especialización por dominio y arme el equipo técnico optimizando la disponibilidad horaria semanal (48h max).'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* PASO 1: Selección de Fase o Etapa WBS */}
        <div className="p-6 rounded-3xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="font-extrabold text-zinc-900 dark:text-zinc-100 block text-sm flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                1
              </div>
              <span>Selección de Fase o Etapa WBS del Proyecto *</span>
            </label>
            {etapaActual && (
              <span className={`px-3 py-1 rounded-full text-[0.68rem] font-extrabold uppercase border ${
                ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO'].includes((etapaActual.estado || '').toUpperCase())
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  : ['EN_PROCESO', 'EN_CURSO', 'EN_PROGRESO'].includes((etapaActual.estado || '').toUpperCase())
                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
              }`}>
                Estado Etapa: {etapaActual.estado || 'PENDIENTE'}
              </span>
            )}
          </div>

          {/* Tarjeta Informativa en Modo Edición */}
          {actividadAEditar && (
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[0.68rem] font-mono font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  TAREA EN EDICIÓN SELECCIONADA
                </span>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                  {etapaActual ? etapaActual.nombreEtapa : `Etapa #${idEtapa}`}
                </span>
              </div>
              <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                {nombreActividad || actividadAEditar.nombreActividad || actividadAEditar.descripcion}
              </h4>
            </div>
          )}

          {!actividadAEditar && (
            <select
              required
              value={idEtapa || (etapas[0] ? String(etapas[0].idEtapa || etapas[0].id) : '')}
              onChange={(e) => setIdEtapa(e.target.value)}
              className="input-field py-3 text-xs font-bold w-full bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-xs leading-relaxed"
            >
              <option value="">— Seleccione la etapa WBS donde pertenecerá esta tarea —</option>
              {etapas.map((et, idx) => {
                const numActs = et.actividades ? et.actividades.length : 0;
                const st = (et.estado || 'EN_PROCESO').toUpperCase();
                const valStr = String(et.idEtapa || et.id);
                return (
                  <option key={valStr || idx} value={valStr}>
                    Fase #{idx + 1}: {et.nombreEtapa} | Estado: [{st}] | ({numActs} tarea(s) vinculadas)
                  </option>
                );
              })}
            </select>
          )}

          {/* Banner Informativo y Directivo si la etapa está Finalizada */}
          {etapaActual && ['FINALIZADA', 'FINALIZADO', 'COMPLETADA', 'COMPLETADO'].includes((etapaActual.estado || '').toUpperCase()) && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-black text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <span>Advertencia de Reapertura Formal de Entregable WBS</span>
              </div>
              <p className="text-[0.72rem] leading-relaxed font-medium pl-6">
                Atención Directiva: La fase <strong>&quot;{etapaActual.nombreEtapa}&quot;</strong> se encuentra registrada como <strong>FINALIZADA</strong> en la estructura WBS. Al guardar esta nueva tarea técnica, el sistema actualizará automáticamente su estado a <strong>EN_PROCESO</strong>, registrando en la auditoría directiva del sistema la fecha, hora y usuario que autorizó la reapertura del entregable.
              </p>
            </div>
          )}
        </div>

        {/* PASO 2: Dominio Técnico & Área de Especialización Requerida (Multi-Dominio) */}
        <div className="p-6 rounded-3xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <label className="font-extrabold text-zinc-900 dark:text-zinc-100 block text-sm flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  2
                </div>
                <span>Dominio Técnico & Área de Especialización Requerida para la Tarea *</span>
              </label>
              <p className="text-zinc-500 text-xs font-medium mt-1">
                Seleccione uno o múltiples dominios técnicos para armar su equipo. Abajo se desplegará una lista de candidatos por cada dominio seleccionado.
              </p>
            </div>

            {dominiosSeleccionados.length > 0 && (
              <span className="px-3 py-1 rounded-full text-[0.68rem] font-mono font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                {dominiosSeleccionados.length} dominio(s) seleccionado(s)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {DOMINIOS_WBS.map((dom) => {
              const isSelected = dominiosSeleccionados.includes(dom.key);
              const IconComp = dom.LucideIcon;

              return (
                <button
                  key={dom.key}
                  type="button"
                  onClick={() => handleToggleDominio(dom.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer shadow-2xs relative flex flex-col justify-between ${
                    isSelected
                      ? `${dom.bgSelected} ${dom.borderColor} ring-4 ring-blue-500/20 scale-[1.02] shadow-md`
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tight">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                        <IconComp size={16} />
                      </div>
                      <span>{dom.label}</span>
                    </div>
                    <p className="text-[0.68rem] opacity-80 font-medium leading-snug">
                      {dom.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap pt-3 mt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {dom.tags.slice(0, 3).map((tg, idx) => (
                      <span key={idx} className="text-[0.58rem] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-extrabold">
                        {tg}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 3: Selección de Squad por Dominio con Horas Obligatorias & Tarjetas en Lista Compacta */}
        <div className="p-6 rounded-3xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <label className="font-extrabold text-zinc-900 dark:text-zinc-100 block text-sm flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  3
                </div>
                <span>Equipo & Integrantes Candidatos Filtrados por Dominio y Disponibilidad Horaria (Máx. 48h Semanales) *</span>
              </label>
              <p className="text-zinc-500 text-xs font-medium mt-1">
                Defina las horas obligatorias de la tarea. El sistema filtrará automáticamente los perfiles con saldo de horas suficientes (&ge; {horasSemanales}h).
              </p>
            </div>

            {/* Selector de Horas Obligatorias de la Tarea */}
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xs flex items-center gap-3 shrink-0">
              <Clock size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">Horas Tarea (Obligatorias):</span>
              <input
                type="number"
                min={1}
                max={48}
                required
                value={horasSemanales}
                onChange={(e) => setHorasSemanales(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 px-2.5 py-1 text-xs font-extrabold font-mono text-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-blue-600"
              />
              <span className="font-extrabold text-zinc-400 text-xs">h/sem</span>
            </div>
          </div>

          {dominiosSeleccionados.length === 0 ? (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
              <Info size={20} className="text-amber-600 shrink-0" />
              <span>Por favor, seleccione al menos un <strong>Dominio Técnico & Área de Especialización</strong> en el Paso 2 superior para desplegar las listas de desarrolladores.</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Renderizado de Secciones / Listas por cada Dominio Seleccionado */}
              {dominiosSeleccionados.map((domKey) => {
                const domObj = DOMINIOS_WBS.find(d => d.key === domKey);
                if (!domObj) return null;
                const IconComp = domObj.LucideIcon;

                const todosCandidatosDominio = getCandidatosParaDominio(domObj);
                // Filtrado estricto por horas libres >= horasSemanales obligatorias
                const reqH = Number(horasSemanales) || 1;
                const candidatosAptos = todosCandidatosDominio.filter(c => c.horasLibres >= reqH);

                return (
                  <div key={domKey} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                    {/* Encabezado de Lista por Dominio */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                          <IconComp size={18} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <span>Especialistas Candidatos — {domObj.label}</span>
                            <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[0.62rem] font-mono font-black border border-emerald-300">
                              {candidatosAptos.length} disponib. (&ge; {horasSemanales}h libres)
                            </span>
                          </h4>
                          <p className="text-[0.68rem] text-zinc-400 font-medium">
                            {domObj.desc}
                          </p>
                        </div>
                      </div>

                      {/* Buscador dentro de esta lista de dominio */}
                      <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={busquedasDominio[domKey] || ''}
                          onChange={(e) => setBusquedasDominio({ ...busquedasDominio, [domKey]: e.target.value })}
                          placeholder={`Buscar en ${domObj.label}...`}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                        />
                      </div>
                    </div>

                    {/* Lista Compacta de Cuadros en Fila para Desarrolladores */}
                    {candidatosAptos.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={20} className="text-amber-500 shrink-0" />
                          <span>No hay desarrolladores con disponibilidad de <strong>{horasSemanales}h libres</strong> para el dominio {domObj.label}.</span>
                        </div>
                        <span className="text-[0.68rem] text-zinc-400 font-normal">Ajuste las horas obligatorias de la tarea.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {candidatosAptos.map((cand) => {
                          const candIdStr = String(cand.idTrabajador || cand.id);

                          const assignmentInThisDomain = squadAssignments.find(a => a.devId === candIdStr && a.domainKey === domKey);
                          const assignmentInOtherDomain = squadAssignments.find(a => a.devId === candIdStr && a.domainKey !== domKey);
                          
                          const isSelectedHere = !!assignmentInThisDomain;
                          const isSelectedElsewhere = !!assignmentInOtherDomain;

                          const porcentaje = Math.round((cand.horasOcupadas / 48) * 100);

                          return (
                            <div
                              key={candIdStr}
                              onClick={() => {
                                if (isSelectedElsewhere) {
                                  toast.error(`${cand.nombre} ya fue seleccionado en el dominio ${assignmentInOtherDomain.domainKey}`);
                                  return;
                                }
                                handleToggleDevInDomain(cand, domKey);
                              }}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelectedHere
                                  ? 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs ring-2 ring-blue-500/20'
                                  : isSelectedElsewhere
                                    ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 opacity-50 cursor-not-allowed'
                                    : 'bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 hover:border-blue-400 hover:bg-white dark:hover:bg-zinc-900'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelectedHere}
                                  disabled={isSelectedElsewhere}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs font-mono">
                                  {getInitials(cand.nombre, cand.apellido)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                                      {cand.nombre} {cand.apellido}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[0.55rem] font-mono font-black uppercase ${
                                      (cand.rol || '').toUpperCase().includes('LIDER')
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                    }`}>
                                      {cand.rol || 'DEV'}
                                    </span>
                                  </div>
                                  <span className="text-[0.65rem] text-zinc-400 font-medium block truncate">
                                    {cand.profesion || cand.especialidad || 'Especialista Técnico'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                {isSelectedHere ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[0.58rem] font-mono font-black uppercase">
                                    En Squad
                                  </span>
                                ) : isSelectedElsewhere ? (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-[0.55rem] font-mono font-black uppercase">
                                    En {assignmentInOtherDomain.domainKey}
                                  </span>
                                ) : (
                                  <div className="flex flex-col items-end">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono text-[0.68rem]">
                                      {cand.horasLibres}h libres
                                    </span>
                                    <span className="text-[0.58rem] text-zinc-400 font-mono">
                                      {cand.horasOcupadas}h ocup.
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* CONSOLA DE RESUMEN DE SQUAD FORMADO EN TONALIDAD BLANCA / TEMA DEL SISTEMA */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-5">
                {/* Encabezado con Selector de Vista (Lista General vs Por Dominios) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      <Users size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                        <span>Consola de Resumen de Squad Formado</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 text-[0.65rem] font-mono font-black border border-blue-300">
                          {squadAssignments.length} integrante(s)
                        </span>
                      </h4>
                      <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 font-medium">
                        Carga Combinada: <strong>{squadAssignments.length * Number(horasSemanales)}h/semana</strong> dedicadas a la tarea WBS.
                      </p>
                    </div>
                  </div>

                  {/* Selector de Modalidad de Vista */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setVistaResumen('GENERAL')}
                      className={`px-3 py-1.5 rounded-xl text-[0.68rem] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        vistaResumen === 'GENERAL'
                          ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <List size={13} />
                      <span>Vista Lista General</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVistaResumen('DOMINIOS')}
                      className={`px-3 py-1.5 rounded-xl text-[0.68rem] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        vistaResumen === 'DOMINIOS'
                          ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <LayoutGrid size={13} />
                      <span>Vista Por Dominios</span>
                    </button>
                  </div>
                </div>

                {/* Renderizado Vertical en Columna de Arriba hacia Abajo con Barras Comparativas de Carga Horaria */}
                {squadAssignments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400 font-medium italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-1">
                    <Users size={28} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                    <p>Aún no ha seleccionado desarrolladores en ninguna de las listas de dominio superiores.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* MODALIDAD 1: VISTA LISTA GENERAL (DEFAULT) */}
                    {vistaResumen === 'GENERAL' && (
                      <div className="space-y-3">
                        {squadAssignments.map((asig) => {
                          const cand = asig.devObj;
                          const domObj = DOMINIOS_WBS.find(d => d.key === asig.domainKey);
                          const reqH = Number(horasSemanales) || 8;

                          const horasOcupadasPrevias = cand.horasOcupadas || 20;
                          const horasLibresPrevias = cand.horasLibres || (48 - horasOcupadasPrevias);
                          const horasLibresRestantes = Math.max(0, horasLibresPrevias - reqH);

                          const pctPrevia = Math.round((horasOcupadasPrevias / 48) * 100);
                          const pctNuevaTarea = Math.round((reqH / 48) * 100);

                          return (
                            <div
                              key={asig.devId}
                              className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/70 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-300"
                            >
                              {/* Información Básica del Integrante */}
                              <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                  {getInitials(cand.nombre, cand.apellido)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                                      {cand.nombre} {cand.apellido}
                                    </span>
                                    <span className="px-2 py-0.2 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[0.58rem] font-mono font-black uppercase">
                                      {cand.rol || 'DEV'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[0.62rem] font-mono px-2 py-0.2 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-extrabold border border-blue-200">
                                      Dominio: {domObj ? domObj.label : asig.domainKey}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Barra Comparativa Visual de Horas (Libres Previas vs Cargadas por la Tarea) */}
                              <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between items-center text-[0.68rem] font-mono font-bold">
                                  <span className="text-zinc-600 dark:text-zinc-400">
                                    Ocupación: <strong>{horasOcupadasPrevias}h previa</strong>
                                  </span>
                                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                                    +{reqH}h Tarea Nueva
                                  </span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                                    {horasLibresRestantes}h Libres Restantes
                                  </span>
                                </div>

                                {/* Barra de Progreso Dual Segmentada */}
                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex shadow-inner">
                                  {/* Carga Previa (Gris / Verde) */}
                                  <div
                                    className="h-full bg-emerald-500 transition-all"
                                    style={{ width: `${pctPrevia}%` }}
                                    title={`Carga previa: ${horasOcupadasPrevias}h`}
                                  />
                                  {/* Nueva Carga de la Tarea (Azul) */}
                                  <div
                                    className="h-full bg-blue-600 transition-all animate-pulse"
                                    style={{ width: `${pctNuevaTarea}%` }}
                                    title={`Nueva tarea: +${reqH}h`}
                                  />
                                </div>
                              </div>

                              {/* Acción de Remoción */}
                              <button
                                type="button"
                                onClick={() => handleRemoveFromSquad(asig.devId)}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 dark:border-red-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                                title="Quitar desarrollador del Squad"
                              >
                                <Trash2 size={14} />
                                <span>Quitar</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* MODALIDAD 2: VISTA SEPARADA POR DOMINIOS */}
                    {vistaResumen === 'DOMINIOS' && (
                      <div className="space-y-5">
                        {dominiosSeleccionados.map((domKey) => {
                          const domObj = DOMINIOS_WBS.find(d => d.key === domKey);
                          const assignsInDom = squadAssignments.filter(a => a.domainKey === domKey);
                          if (!domObj || assignsInDom.length === 0) return null;
                          const IconComp = domObj.LucideIcon;

                          return (
                            <div key={domKey} className="p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
                              <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-800 dark:text-zinc-200 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                                <IconComp size={15} className="text-blue-600" />
                                <span>Dominio: {domObj.label} ({assignsInDom.length} integrante(s))</span>
                              </div>

                              <div className="space-y-2">
                                {assignsInDom.map((asig) => {
                                  const cand = asig.devObj;
                                  const reqH = Number(horasSemanales) || 8;
                                  const horasOcupadasPrevias = cand.horasOcupadas || 20;
                                  const horasLibresPrevias = cand.horasLibres || (48 - horasOcupadasPrevias);
                                  const horasLibresRestantes = Math.max(0, horasLibresPrevias - reqH);

                                  const pctPrevia = Math.round((horasOcupadasPrevias / 48) * 100);
                                  const pctNuevaTarea = Math.round((reqH / 48) * 100);

                                  return (
                                    <div key={asig.devId} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-black text-[0.65rem] flex items-center justify-center shrink-0">
                                          {getInitials(cand.nombre, cand.apellido)}
                                        </div>
                                        <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                          {cand.nombre} {cand.apellido}
                                        </span>
                                      </div>

                                      <div className="flex-1 space-y-1 w-full sm:w-auto">
                                        <div className="flex justify-between items-center text-[0.62rem] font-mono">
                                          <span className="text-zinc-500">Carga: {horasOcupadasPrevias}h + {reqH}h nueva</span>
                                          <span className="text-emerald-600 font-extrabold">{horasLibresRestantes}h libres rest.</span>
                                        </div>
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                                          <div className="h-full bg-emerald-500" style={{ width: `${pctPrevia}%` }} />
                                          <div className="h-full bg-blue-600 animate-pulse" style={{ width: `${pctNuevaTarea}%` }} />
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFromSquad(asig.devId)}
                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                        title="Quitar"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PASO 4: Detalles del Entregable & Título Técnico */}
        <div className="p-6 rounded-3xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4 shadow-2xs">
          <label className="font-extrabold text-zinc-900 dark:text-zinc-100 block text-sm flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              4
            </div>
            <span>Detalles Técnicos del Entregable WBS *</span>
          </label>

          <div className="space-y-2">
            <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
              Nombre / Título Técnico de la Tarea *
            </label>
            <input
              type="text"
              required
              value={nombreActividad}
              onChange={(e) => setNombreActividad(e.target.value)}
              placeholder="Ej. Implementar arquitectura de microservicios con Spring Boot 3"
              className="input-field py-3 text-xs font-semibold w-full bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
            />

            {/* Sugerencias Rápidas */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[0.62rem] font-mono font-extrabold text-zinc-400 uppercase">Sugerencias:</span>
              {[
                'Documentación OpenAPI 3.0',
                'Pruebas Unitarias JUnit & Mockito',
                'Integración API RESTful',
                'Optimización Consultas SQL',
                'Diseño UI React 18'
              ].map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNombreActividad(sug)}
                  className="text-[0.62rem] font-bold px-2.5 py-0.5 rounded-lg bg-zinc-200/80 hover:bg-blue-100 hover:text-blue-800 dark:bg-zinc-800 dark:hover:bg-blue-950 dark:hover:text-blue-200 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-extrabold text-zinc-800 dark:text-zinc-200 block text-xs">
              Descripción Detallada & Criterios de Aceptación WBS
            </label>
            <textarea
              rows={3}
              value={descripcionDetallada}
              onChange={(e) => setDescripcionDetallada(e.target.value)}
              placeholder="Detalle los entregables, módulos de código a modificar, contratos OpenAPI o diagramas requeridos..."
              className="input-field py-3 text-xs w-full bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 leading-relaxed font-medium"
            />
          </div>
        </div>

        {/* Barra de Confirmación Inferior */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <span>Squad Seleccionado: <strong>{squadAssignments.length} integrante(s)</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              disabled={isSubmitting}
              className="outline-button text-xs py-3 px-5 font-bold cursor-pointer rounded-2xl"
            >
              Cancelar Operación
            </button>
            <button
              type="submit"
              disabled={isSubmitting || squadAssignments.length === 0 || !nombreActividad}
              className="gradient-button text-xs py-3.5 px-7 font-extrabold cursor-pointer rounded-2xl shadow-xl inline-flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {actividadAEditar ? 'Actualizando Tarea WBS...' : 'Guardando Tarea WBS...'}
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{actividadAEditar ? 'Actualizar Tarea WBS' : 'Crear & Asignar Actividad al WBS'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* MODAL DE CONFIRMACIÓN Y AUDITORÍA DE CAMBIOS WBS */}
      <AnimatePresence>
        {showModalConfirmacionCambios && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-4 relative overflow-hidden"
            >
              {/* Cabecera del Modal de Confirmación */}
              <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[0.65rem] font-black border border-blue-300 dark:border-blue-800 uppercase tracking-wider">
                        AUDITORÍA CMMI
                      </span>
                      <span className="text-[0.68rem] font-mono font-bold text-zinc-400">
                        REF: #ACT_{actividadAEditar?.idActividad || actividadAEditar?.id || 'REV'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                      Confirmación Directiva de Cambios WBS
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Revise el expediente de modificaciones antes de autorizar la sincronización en el proyecto.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModalConfirmacionCambios(false)}
                  className="p-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Cerrar modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Panel Estructurado de Resumen de Cambios */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {/* Fila 1: Metadatos Principales (2 Columnas) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[0.65rem] font-mono font-black text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Layers size={13} className="text-blue-500" /> FASE / ETAPA WBS VINCULADA
                    </span>
                    <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                      {etapaActual?.nombreEtapa || `Fase #${idEtapa}`}
                    </h5>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[0.65rem] font-mono font-black text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Clock size={13} className="text-emerald-500" /> CARGA Y TAMAÑO SQUAD
                    </span>
                    <h5 className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <span>{squadAssignments.length} integrante(s) asignados</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-mono text-[0.62rem]">
                        {horasSemanales}h/semana
                      </span>
                    </h5>
                  </div>
                </div>

                {/* Fila 2: Título y Especificaciones Detalladas */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5">
                  <div>
                    <span className="text-[0.65rem] font-mono font-black text-zinc-400 uppercase tracking-wider block mb-1">
                      TÍTULO TÉCNICO DE LA TAREA WBS
                    </span>
                    <h4 className="font-black text-sm text-blue-600 dark:text-blue-400 leading-snug">
                      {nombreActividad}
                    </h4>
                  </div>

                  {descripcionDetallada && (
                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                      <span className="text-[0.65rem] font-mono font-black text-zinc-400 uppercase tracking-wider block">
                        DESCRIPCIÓN & CRITERIOS DE ACEPTACIÓN
                      </span>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[0.72rem] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                        {descripcionDetallada}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fila 3: Dominios Técnicos Requeridos */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                  <span className="text-[0.65rem] font-mono font-black text-zinc-400 uppercase tracking-wider block">
                    ÁREAS DE ESPECIALIZACIÓN & DOMINIOS ({dominiosSeleccionados.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dominiosSeleccionados.map((key) => {
                      const domObj = DOMINIOS_WBS.find(d => d.key === key);
                      const label = domObj?.label || key;
                      return (
                        <span
                          key={key}
                          className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 font-bold text-[0.7rem] flex items-center gap-1.5 shadow-2xs"
                        >
                          <Code2 size={13} className="text-purple-600 dark:text-purple-400" />
                          <span>{label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Fila 4: Squad de Desarrolladores Asignados */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-mono font-black text-zinc-400 uppercase tracking-wider block">
                      EQUIPO & INTEGRANTES DEL SQUAD ASIGNADOS ({squadAssignments.length})
                    </span>
                    <span className="text-[0.62rem] font-mono font-bold text-zinc-400">
                      Disponibilidad Sincronizada
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {squadAssignments.map((assign, idx) => {
                      const dev = assign.devObj || {};
                      const devNombre = dev.nombre ? `${dev.nombre} ${dev.apellido || ''}` : `Desarrollador ID #${assign.devId}`;
                      const devRole = dev.profesion || dev.especialidad || 'Especialista';

                      return (
                        <div
                          key={assign.devId || idx}
                          className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 shadow-2xs"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-[0.7rem] flex items-center justify-center shrink-0 shadow-2xs">
                            {getInitials(dev.nombre, dev.apellido)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h6 className="font-extrabold text-[0.72rem] text-zinc-900 dark:text-zinc-100 truncate">
                              {devNombre}
                            </h6>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[0.62rem] text-zinc-500 dark:text-zinc-400 truncate">
                                {devRole}
                              </span>
                              <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-[0.58rem] font-bold">
                                {assign.domainKey}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Banner Informativo de Auditoría */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-medium flex items-start gap-3">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Auditoría Directiva WBS:</strong> Al presionar <strong>&quot;Sí, Confirmar y Actualizar&quot;</strong>, se aplicará esta reconfiguración directiva y los cambios quedarán guardados en la bitácora oficial del proyecto con firma de tiempo y usuario autenticado.
                </span>
              </div>

              {/* Pie de Acción con Botones Optimizados */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModalConfirmacionCambios(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Volver a Editar</span>
                </button>

                <button
                  type="button"
                  onClick={ejecutarGuardado}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sincronizando Cambios...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Sí, Confirmar y Actualizar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DIRECTIVO DE CONFIRMACIÓN DE SALIDA / CANCELACIÓN */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-extrabold text-base">
                <div className="p-2.5 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                  <AlertTriangle size={22} />
                </div>
                <span>¿Confirmar Cancelación y Salir?</span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                Si decide salir ahora, se perderán todos los datos ingresados en esta tarea (fase seleccionada, dominios técnicos, integrantes del squad y especificaciones). ¿Desea cancelar la operación y volver al catálogo?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Continuar Editando
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Sí, Cancelar y Salir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
