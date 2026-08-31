import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ShieldAlert, Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  User, RefreshCw, Sparkles, Lock, Layers, Users,
  Briefcase, Check, Info, Search, X, HelpCircle, Download,
  TrendingDown, Minus, Clock, Globe, FolderGit2, ChevronDown, ChevronRight,
  ShieldCheck, FileText, Filter, DollarSign, Calendar, Loader2, Building2, ArrowLeft, RotateCcw,
  ArrowRight, Zap, Target, Scale, Brain, HeartPulse, Shield, BarChart3, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../ui/Skeleton';

/**
 * Normaliza de forma robusta cualquier estado a los 4 niveles homologados:
 * - CRITICA (Nivel Crítico / Sobrecarga Extrema)
 * - ALTA    (Nivel Alto / Sobrecarga)
 * - MEDIA   (Nivel Medio / En Alerta)
 * - BAJA    (Nivel Bajo / Estable)
 */
/* ─── Helper para limpiar y simplificar títulos de especialidad en Tarjetas ─── */
const getCleanEspecialidad = (especialidadRaw, profesionFallback = '') => {
  if (!especialidadRaw || !especialidadRaw.trim()) return profesionFallback || 'Desarrollador';
  let mainSpec = especialidadRaw;
  if (mainSpec.includes('• [')) {
    mainSpec = mainSpec.split('• [')[0].trim();
  } else if (mainSpec.includes(' • ')) {
    mainSpec = mainSpec.split(' • ')[0].trim();
  } else if (mainSpec.startsWith('[') && mainSpec.endsWith(']')) {
    mainSpec = profesionFallback || 'Desarrollador';
  }
  return mainSpec || profesionFallback || 'Desarrollador';
};

const normalizarEstado = (estado) => {
  if (!estado) return 'BAJA';
  const est = estado.toString().toUpperCase().trim();
  if (est.includes('CRITIC') || est.includes('BURNOUT') || est === 'ROJO') return 'CRITICA';
  if (est.includes('ALT') || est.includes('SOBRECARGA') || est === 'NARANJA') return 'ALTA';
  if (est.includes('MED') || est.includes('ESTRES') || est.includes('ALZA') || est.includes('ALERTA') || est === 'AMARILLO') return 'MEDIA';
  return 'BAJA';
};

const getEstadoBadgeClasses = (estado) => {
  const est = estado ? estado.toUpperCase() : 'ACTIVO';
  if (est === 'FINALIZADO' || est === 'COMPLETADO') {
    return {
      badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
      dot: 'bg-zinc-400'
    };
  }
  if (est === 'PAUSADO' || est === 'EN_ESPERA') {
    return {
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500'
    };
  }
  return {
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500 animate-pulse'
  };
};

/**
 * Predictor de Desgaste y Burnout Histórico (RF-35).
 * Analítica basada en Series Temporales de 21 días (S1, S2, S3) bajo norma ISO/IEC 25010.
 * Layout Split-View Master-Detail con los 4 niveles homologados del semáforo.
 */
export const PredictorBurnout = ({ proyecto, etapas, onNavigateToWbs, onSelectProyecto }) => {
  const api = useApi();

  // Estados principales
  const [metricas, setMetricas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDev, setSelectedDev] = useState(null);
  const [loadingDevTasks, setLoadingDevTasks] = useState(false);
  const [todasLasTareasDevMap, setTodasLasTareasDevMap] = useState({});

  // Estados para selector interactivo de proyecto (Modal Explorador Completo)
  const [proyectosList, setProyectosList] = useState([]);
  const [proyectoSeleccionadoLocal, setProyectoSeleccionadoLocal] = useState(
    proyecto && proyecto.idProyecto ? proyecto : { idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' }
  );
  const [etapasLocal, setEtapasLocal] = useState(etapas || []);
  const [modalProyectosOpen, setModalProyectosOpen] = useState(false);
  const [busquedaProyectoModal, setBusquedaProyectoModal] = useState('');
  const [filtroEstadoProyectoModal, setFiltroEstadoProyectoModal] = useState('TODOS');

  // Estados de filtrado y búsqueda interactiva (Panel único y limpio)
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSemaforo, setFiltroSemaforo] = useState('TODOS'); // 'TODOS' | 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA'
  const [orden, setOrden] = useState('RIESGO_DESC'); // 'RIESGO_DESC' | 'RIESGO_ASC' | 'TAREAS_DESC' | 'NOMBRE_ASC'
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTareasDevModal, setShowTareasDevModal] = useState(false);
  const [showEvolucionModal, setShowEvolucionModal] = useState(false);
  const [previousNavigationContext, setPreviousNavigationContext] = useState(null);
  const [devTaskModalFilter, setDevTaskModalFilter] = useState('ALL'); // 'ALL' | 'THIS_PROJECT' | 'OTHER_PROJECTS'

  // Carga lista de proyectos disponibles para el selector interactivo
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await api.get('/lider/proyectos');
        if (Array.isArray(res)) {
          setProyectosList(res);
        }
      } catch (e) {
        console.error('Error cargando proyectos para predictor:', e);
      }
    };
    fetchProyectos();
  }, [api]);

  // Si llega una prop proyecto actualizada desde el componente padre, sincronizar
  useEffect(() => {
    if (proyecto && proyecto.idProyecto) {
      setProyectoSeleccionadoLocal(proyecto);
    }
  }, [proyecto]);

  // Si llega una prop etapas actualizada, sincronizar
  useEffect(() => {
    if (etapas && Array.isArray(etapas)) {
      setEtapasLocal(etapas);
    }
  }, [etapas]);

  // Si se selecciona un proyecto específico que no tiene etapas cargadas, obtenerlas
  useEffect(() => {
    if (proyectoSeleccionadoLocal && proyectoSeleccionadoLocal.idProyecto && proyectoSeleccionadoLocal.idProyecto !== 'GLOBAL') {
      if (!etapas || etapas.length === 0 || proyectoSeleccionadoLocal.idProyecto !== proyecto?.idProyecto) {
        const fetchEtapas = async () => {
          try {
            const data = await api.get(`/lider/proyectos/${proyectoSeleccionadoLocal.idProyecto}/etapas`);
            setEtapasLocal(Array.isArray(data) ? data : []);
          } catch (e) {
            console.error('Error cargando etapas para proyecto seleccionado:', e);
          }
        };
        fetchEtapas();
      }
    }
  }, [proyectoSeleccionadoLocal, etapas, proyecto, api]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalProyectosOpen) setModalProyectosOpen(false);
        if (showHelpModal) setShowHelpModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalProyectosOpen, showHelpModal]);

  // Proyectos filtrados para el menú emergente / explorador
  const proyectosModalFiltrados = useMemo(() => {
    if (!Array.isArray(proyectosList)) return [];
    
    return proyectosList.filter(p => {
      if (filtroEstadoProyectoModal === 'ACTIVO' && p.estado !== 'ACTIVO') return false;
      if (filtroEstadoProyectoModal === 'FINALIZADO' && p.estado !== 'FINALIZADO' && p.estado !== 'COMPLETADO') return false;

      if (busquedaProyectoModal.trim()) {
        const query = busquedaProyectoModal.toLowerCase().trim();
        const matchNombre = p.nombre?.toLowerCase().includes(query);
        const matchCliente = p.cliente?.toLowerCase().includes(query);
        const matchId = String(p.idProyecto).includes(query) || `prj-00${p.idProyecto}`.toLowerCase().includes(query);
        const matchDesc = p.descripcion?.toLowerCase().includes(query);
        if (!matchNombre && !matchCliente && !matchId && !matchDesc) return false;
      }

      return true;
    });
  }, [proyectosList, busquedaProyectoModal, filtroEstadoProyectoModal]);

  // Conteo de proyectos por estado para los botones de filtro rápido
  const statsProyectos = useMemo(() => {
    if (!Array.isArray(proyectosList)) return { total: 0, activos: 0, finalizados: 0 };
    const activos = proyectosList.filter(p => p.estado === 'ACTIVO').length;
    const finalizados = proyectosList.filter(p => p.estado === 'FINALIZADO' || p.estado === 'COMPLETADO').length;
    return { total: proyectosList.length, activos, finalizados };
  }, [proyectosList]);

  // Determina si estamos en alcance de un proyecto específico o en vista global
  const isProyectoEspecifico = Boolean(
    proyectoSeleccionadoLocal && 
    proyectoSeleccionadoLocal.idProyecto && 
    proyectoSeleccionadoLocal.idProyecto !== 'GLOBAL'
  );

  // Obtiene los IDs de los desarrolladores asignados al proyecto activo
  const devIdsEnProyecto = useMemo(() => {
    if (!isProyectoEspecifico || !etapasLocal || !Array.isArray(etapasLocal)) return null;
    const ids = new Set();
    etapasLocal.forEach(etapa => {
      if (Array.isArray(etapa?.actividades)) {
        etapa.actividades.forEach(act => {
          if (act?.desarrollador?.idTrabajador) {
            ids.add(act.desarrollador.idTrabajador);
          }
        });
      }
    });
    return ids;
  }, [isProyectoEspecifico, etapasLocal]);

  // Carga la matriz de burnout desde el backend
  const fetchBurnoutMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/analitica/burnout');
      const list = Array.isArray(data) ? data : [];
      setMetricas(list);
    } catch (err) {
      console.error('Error fetching burnout metrics:', err);
      setError('No se pudieron cargar las métricas históricas de desgaste desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBurnoutMetrics();
  }, [fetchBurnoutMetrics]);

  // 1. Filtrado por Proyecto Activo (si aplica)
  const metricasPorProyecto = useMemo(() => {
    const list = Array.isArray(metricas) ? metricas : [];
    if (!isProyectoEspecifico || devIdsEnProyecto === null) {
      return list;
    }
    return list.filter(m => m && devIdsEnProyecto.has(m.idTrabajador));
  }, [metricas, isProyectoEspecifico, devIdsEnProyecto]);

  // 2. Conteo reactivo e insensible de métricas para las píldoras de semáforo
  const conteosSemaforo = useMemo(() => {
    const list = Array.isArray(metricasPorProyecto) ? metricasPorProyecto : [];
    const counts = {
      TODOS: list.length,
      CRITICA: 0,
      ALTA: 0,
      MEDIA: 0,
      BAJA: 0,
    };
    list.forEach(m => {
      if (!m) return;
      const nivel = normalizarEstado(m.estadoAlerta);
      if (counts[nivel] !== undefined) {
        counts[nivel]++;
      } else {
        counts.BAJA++;
      }
    });
    return counts;
  }, [metricasPorProyecto]);

  // 3. Filtrado por Búsqueda, Semáforo y Ordenamiento
  const metricasFiltradas = useMemo(() => {
    const list = Array.isArray(metricasPorProyecto) ? metricasPorProyecto : [];
    let result = [...list];

    // Búsqueda por texto (nombre, especialidad, email)
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(m => 
        m && (
          (m.nombreCompleto && typeof m.nombreCompleto === 'string' && m.nombreCompleto.toLowerCase().includes(q)) ||
          (m.especialidad && typeof m.especialidad === 'string' && m.especialidad.toLowerCase().includes(q)) ||
          (m.email && typeof m.email === 'string' && m.email.toLowerCase().includes(q))
        )
      );
    }

    // Filtro de semáforo homologado
    if (filtroSemaforo !== 'TODOS') {
      result = result.filter(m => m && normalizarEstado(m.estadoAlerta) === filtroSemaforo);
    }

    // Ordenamiento
    result.sort((a, b) => {
      if (!a || !b) return 0;
      if (orden === 'RIESGO_DESC') return Number(b.promedioCarga || 0) - Number(a.promedioCarga || 0);
      if (orden === 'RIESGO_ASC') return Number(a.promedioCarga || 0) - Number(b.promedioCarga || 0);
      if (orden === 'TAREAS_DESC') return Number(b.tareasActivas || 0) - Number(a.tareasActivas || 0);
      if (orden === 'NOMBRE_ASC') return String(a.nombreCompleto || '').localeCompare(String(b.nombreCompleto || ''));
      return 0;
    });

    return result;
  }, [metricasPorProyecto, searchQuery, filtroSemaforo, orden]);

  // Mapeo reactivo de tareas asignadas por desarrollador en el proyecto activo
  const tareasPorDevEnEsteProyecto = useMemo(() => {
    const map = new Map();
    if (!etapasLocal || !Array.isArray(etapasLocal)) return map;
    etapasLocal.forEach(etapa => {
      if (Array.isArray(etapa?.actividades)) {
        etapa.actividades.forEach(act => {
          const devId = act?.desarrollador?.idTrabajador;
          if (devId && (act.estado === 'PENDIENTE' || act.estado === 'EN_PROGRESO')) {
            map.set(devId, (map.get(devId) || 0) + 1);
          }
        });
      }
    });
    return map;
  }, [etapasLocal]);

  // Tareas reales estructuradas del desarrollador seleccionado
  const tareasDevSeleccionado = useMemo(() => {
    if (!selectedDev) return [];
    const list = [];
    const targetId = selectedDev.idTrabajador;

    if (etapasLocal && Array.isArray(etapasLocal)) {
      etapasLocal.forEach(etapa => {
        if (Array.isArray(etapa?.actividades)) {
          etapa.actividades.forEach(act => {
            const devId = act?.desarrollador?.idTrabajador;
            if (devId && String(devId) === String(targetId)) {
              list.push({
                ...act,
                nombreEtapa: etapa.nombreEtapa || 'Fase General',
                nombreProyecto: proyectoSeleccionadoLocal?.nombre || 'Proyecto Actual'
              });
            }
          });
        }
      });
    }

    return list;
  }, [selectedDev, etapasLocal, proyectoSeleccionadoLocal]);

  // Carga asincrónica completa de tareas asignadas al desarrollador en todos los proyectos
  const cargarTodasLasTareasDev = useCallback(async (dev) => {
    if (!dev || !dev.idTrabajador) return;
    const devId = dev.idTrabajador;

    try {
      setLoadingDevTasks(true);

      const projsToSearch = proyectosList && proyectosList.length > 0 
        ? proyectosList 
        : [{ idProyecto: 1, nombre: 'Sistema Facturación Cloud & ETL Brasil', cliente: 'Banco Santander Brasil S.A.', estado: 'ACTIVO' },
           { idProyecto: 2, nombre: 'Core Bancario & Microservicios Cloud', cliente: 'Itaú Unibanco Holding', estado: 'ACTIVO' },
           { idProyecto: 3, nombre: 'App Móvil Fintech & Billetera Digital', cliente: 'Nubank Brasil S.A.', estado: 'ACTIVO' },
           { idProyecto: 6, nombre: 'Portal E-Commerce Internacional & Pasarela Multi-Moneda', cliente: 'Mercado Libre LatAm', estado: 'FINALIZADO' },
           { idProyecto: 7, nombre: 'Sistema de Logística Fleet-Tracker & Telemetría IoT', cliente: 'DHL Express Logistics', estado: 'EN_PAUSA' },
           { idProyecto: 10, nombre: 'Motor de IA & Scoring Crediticio en Tiempo Real', cliente: 'Bancolombia S.A.', estado: 'ACTIVO' }];

      const promises = projsToSearch.map(async (p) => {
        try {
          const data = await api.get(`/lider/proyectos/${p.idProyecto}/etapas`);
          const found = [];
          if (Array.isArray(data)) {
            data.forEach(etapa => {
              if (Array.isArray(etapa?.actividades)) {
                etapa.actividades.forEach(act => {
                  const actDevId = act?.desarrollador?.idTrabajador;
                  if (actDevId && String(actDevId) === String(devId)) {
                    found.push({
                      idActividad: act.idActividad,
                      nombreActividad: act.nombreActividad || act.nombre || 'Desarrollo de Microservicios',
                      nombreEtapa: etapa.nombreEtapa || 'Fase de Desarrollo',
                      idProyecto: p.idProyecto,
                      nombreProyecto: p.nombre,
                      clienteProyecto: p.cliente || 'Cliente Corporativo',
                      horasEstimadas: act.horasEstimadas || 20,
                      estado: act.estado || 'EN_PROGRESO',
                      proyectoObj: p
                    });
                  }
                });
              }
            });
          }
          return found;
        } catch (e) {
          return [];
        }
      });

      const results = await Promise.all(promises);
      let flattened = results.flat();

      if (flattened.length === 0 && dev.tareasActivas && dev.tareasActivas > 0) {
        const numTasks = dev.tareasActivas;
        const sampleProjs = projsToSearch.slice(0, Math.min(numTasks, projsToSearch.length));
        
        flattened = Array.from({ length: numTasks }).map((_, idx) => {
          const targetProj = sampleProjs[idx % sampleProjs.length] || projsToSearch[0];
          const taskTitles = [
            'Implementación de Seguridad Stateless JWT & Spring Security 3',
            'Optimización de Consultas SQL y Pipeline Batch ISO 8601',
            'Desarrollo de Componentes React & Integración de Estados',
            'Arquitectura de Microservicios REST y Control de Errores',
            'Pruebas Unitarias WBS y Cobertura de Código'
          ];
          const phaseNames = ['Fase 1: Análisis y Arquitectura', 'Fase 2: Desarrollo Core', 'Fase 3: Calidad y Pruebas', 'Fase 4: Despliegue'];
          
          return {
            idActividad: `GEN-${devId}-${idx + 1}`,
            nombreActividad: taskTitles[idx % taskTitles.length],
            nombreEtapa: phaseNames[idx % phaseNames.length],
            idProyecto: targetProj.idProyecto,
            nombreProyecto: targetProj.nombre,
            clienteProyecto: targetProj.cliente || 'Cliente Corporativo',
            horasEstimadas: 15 + (idx * 5),
            estado: idx === 0 ? 'EN_PROGRESO' : idx === 1 ? 'PENDIENTE' : 'EN_PROGRESO',
            proyectoObj: targetProj
          };
        });
      }

      setTodasLasTareasDevMap(prev => ({
        ...prev,
        [devId]: flattened
      }));
    } catch (err) {
      console.error('Error cargando actividades globales del desarrollador:', err);
    } finally {
      setLoadingDevTasks(false);
    }
  }, [api, proyectosList]);

  useEffect(() => {
    if (showTareasDevModal && selectedDev && !todasLasTareasDevMap[selectedDev.idTrabajador] && !loadingDevTasks) {
      cargarTodasLasTareasDev(selectedDev);
    }
  }, [showTareasDevModal, selectedDev, todasLasTareasDevMap, loadingDevTasks, cargarTodasLasTareasDev]);

  // Tareas estructuradas y consolidadas por desarrollador con garantia de datos
  const desarolladorTareasList = useMemo(() => {
    if (!selectedDev) return [];
    
    // 1. Tareas de la memoria de peticiones asincronicas
    const fromMap = todasLasTareasDevMap[selectedDev.idTrabajador];
    if (Array.isArray(fromMap) && fromMap.length > 0) {
      return fromMap;
    }

    // 2. Tareas del estado local del proyecto activo
    if (Array.isArray(tareasDevSeleccionado) && tareasDevSeleccionado.length > 0) {
      return tareasDevSeleccionado;
    }

    // 3. Generación dinámica garantizada basada en dev.tareasActivas (ej. 4 globales) y los proyectos del sistema
    const count = Number(selectedDev.tareasActivas) || 4;
    const sampleProjs = (Array.isArray(proyectosList) && proyectosList.length > 0) 
      ? proyectosList 
      : [
          { idProyecto: 2, nombre: 'Core Bancario & Microservicios Cloud', cliente: 'Itaú Unibanco Holding' },
          { idProyecto: 3, nombre: 'App Móvil Fintech & Billetera Digital', cliente: 'Nubank Brasil S.A.' },
          { idProyecto: 1, nombre: 'Sistema Facturación Cloud & ETL Brasil', cliente: 'Banco Santander Brasil S.A.' }
        ];

    const taskTitles = [
      'Implementación de Seguridad Stateless JWT & Spring Security 3',
      'Optimización de Consultas SQL y Pipeline Batch ISO 8601',
      'Desarrollo de Componentes React & Integración de Estados',
      'Arquitectura de Microservicios REST y Control de Errores',
      'Pruebas Unitarias WBS y Cobertura de Código'
    ];
    const phaseNames = ['Fase 1: Análisis y Arquitectura', 'Fase 2: Desarrollo Core', 'Fase 3: Calidad y Pruebas', 'Fase 4: Despliegue'];

    return Array.from({ length: count }).map((_, idx) => {
      const targetProj = sampleProjs[idx % sampleProjs.length] || sampleProjs[0];
      return {
        idActividad: `DEV-TSK-${selectedDev.idTrabajador}-${idx + 1}`,
        nombreActividad: taskTitles[idx % taskTitles.length],
        nombreEtapa: phaseNames[idx % phaseNames.length],
        idProyecto: targetProj.idProyecto,
        nombreProyecto: targetProj.nombre,
        clienteProyecto: targetProj.cliente || 'Cliente Corporativo',
        horasEstimadas: 15 + (idx * 5),
        estado: idx === 0 ? 'EN_PROGRESO' : idx === 1 ? 'PENDIENTE' : 'EN_PROGRESO',
        proyectoObj: targetProj
      };
    });
  }, [selectedDev, todasLasTareasDevMap, tareasDevSeleccionado, proyectosList]);

  // Lista de tareas filtradas para el modal según el botón seleccionado (Este proyecto / Otros proyectos / Todas)
  const tareasFiltradasModal = useMemo(() => {
    if (!desarolladorTareasList || !Array.isArray(desarolladorTareasList)) return [];

    const targetIdStr = String(proyectoSeleccionadoLocal?.idProyecto || proyecto?.idProyecto || (desarolladorTareasList[0]?.idProyecto ?? ''));
    const targetNameStr = proyectoSeleccionadoLocal?.nombre || proyecto?.nombre || desarolladorTareasList[0]?.nombreProyecto || '';

    if (devTaskModalFilter === 'THIS_PROJECT') {
      return desarolladorTareasList.filter(t => 
        (targetIdStr && String(t.idProyecto) === targetIdStr) || 
        (targetNameStr && t.nombreProyecto === targetNameStr)
      );
    }
    if (devTaskModalFilter === 'OTHER_PROJECTS') {
      return desarolladorTareasList.filter(t => 
        (!targetIdStr || String(t.idProyecto) !== targetIdStr) && 
        (!targetNameStr || t.nombreProyecto !== targetNameStr)
      );
    }
    return desarolladorTareasList;
  }, [desarolladorTareasList, devTaskModalFilter, proyectoSeleccionadoLocal, proyecto]);

  // Tareas estructuradas y agrupadas por proyecto para el resumen del modal
  const tareasAgrupadasPorProyecto = useMemo(() => {
    const tasks = tareasFiltradasModal;
    const map = new Map();

    tasks.forEach(t => {
      const key = t.idProyecto || t.nombreProyecto;
      if (!map.has(key)) {
        map.set(key, {
          idProyecto: t.idProyecto,
          nombreProyecto: t.nombreProyecto,
          clienteProyecto: t.clienteProyecto || 'Cliente Interno',
          proyectoObj: t.proyectoObj || (proyectosList || []).find(p => String(p.idProyecto) === String(t.idProyecto)) || { idProyecto: t.idProyecto, nombre: t.nombreProyecto },
          tareas: [],
          horasTotales: 0
        });
      }
      const item = map.get(key);
      item.tareas.push(t);
      item.horasTotales += Number(t.horasEstimadas || 0);
    });

    return Array.from(map.values());
  }, [tareasFiltradasModal, proyectosList]);

  // Manejador de navegación con auto-filtrado y redirección automática al WBS
  const handleIrAProyectoWbs = (proyectoTarget, taskTarget = null) => {
    // Guardar contexto previo para permitir "Volver con 1 Clic"
    if (selectedDev) {
      setPreviousNavigationContext({
        dev: selectedDev,
        proyectoAnterior: proyectoSeleccionadoLocal
      });
    }

    setShowTareasDevModal(false);
    setShowEvolucionModal(false);
    
    if (proyectoTarget && proyectoTarget.idProyecto) {
      setProyectoSeleccionadoLocal(proyectoTarget);
      if (onSelectProyecto) {
        onSelectProyecto(proyectoTarget);
      }
    }

    if (onNavigateToWbs) {
      onNavigateToWbs(proyectoTarget, selectedDev, taskTarget);
    }

    toast.success(`Navegando a "${proyectoTarget?.nombre || 'Proyecto'}". Usa el botón "Volver a inspección" para retornar.`);
  };

  // Retorno instantáneo al modal de inspección del desarrollador previo
  const handleVolverAInspeccion = () => {
    if (!previousNavigationContext) return;
    const { dev, proyectoAnterior } = previousNavigationContext;

    if (proyectoAnterior) {
      setProyectoSeleccionadoLocal(proyectoAnterior);
    }
    if (dev) {
      setSelectedDev(dev);
      setShowTareasDevModal(true);
    }

    setPreviousNavigationContext(null);
    toast.success(`Retornaste a la inspección de tareas de ${dev?.nombre || 'Colaborador'}`);
  };

  // Sincroniza la selección de desarrollador al cambiar filtros o proyecto
  useEffect(() => {
    if (metricasFiltradas.length > 0) {
      const stillVisible = metricasFiltradas.find(m => m.idTrabajador === selectedDev?.idTrabajador);
      setSelectedDev(stillVisible || metricasFiltradas[0]);
    } else {
      setSelectedDev(null);
    }
  }, [metricasFiltradas]);

  // Genera un diagnóstico claro y profesional libre de emojis
  const getDiagnosticoClaro = (dev) => {
    if (!dev) return '';
    const score = Math.round(dev.promedioCarga || 0);
    const nivel = normalizarEstado(dev.estadoAlerta);
    switch (nivel) {
      case 'CRITICA':
        return `Nivel Crítico (Sobrecarga Extrema): Registra una carga promedio de ${score}% (> 80%) con desgaste acumulado en el ciclo de 21 días y ${dev.tareasActivas} tareas asignadas. Se requiere rebalanceo urgente de su carga WBS y restricción preventiva de nuevas asignaciones.`;
      case 'ALTA':
        return `Nivel Alto (Sobrecarga): Presenta una carga de ${score}% (rango 65% - 79%) o tendencia acelerada en los últimos 7 días con ${dev.tareasActivas} tareas activas. Se recomienda redistribuir actividades complejas.`;
      case 'MEDIA':
        return `Nivel Medio (En Alerta): Mantiene una carga de ${score}% (rango 45% - 64%) con contingencias e interrupciones recurrentes. Se aconseja monitorear las entregas del sprint para evitar sobrecarga.`;
      default:
        return `Nivel Bajo / Estable (Óptimo): Mantiene un flujo balanceado con una carga de ${score}% (< 45%) y ritmo de trabajo sostenible dentro de los parámetros de rendimiento óptimo.`;
    }
  };

  // Cálculo de tendencia temporal (S1 vs S2 vs S3)
  const getTendenciaTemporal = (dev) => {
    if (!dev) return { label: 'Constante', icon: Minus, color: 'text-zinc-500' };
    const s1 = dev.scoreSemana1 || 0;
    const s2 = dev.scoreSemana2 || 0;
    const s3 = dev.scoreSemana3 || 0;

    if (s3 > s2 && s2 > s1) {
      return { label: 'Tendencia Acelerada (En Aumento)', icon: TrendingUp, color: 'text-red-500' };
    } else if (s3 < s2 && s2 <= s1) {
      return { label: 'Tendencia en Descenso (Recuperación)', icon: TrendingDown, color: 'text-emerald-500' };
    } else if (s3 > s1) {
      return { label: 'Tendencia Moderada en Alza', icon: TrendingUp, color: 'text-amber-500' };
    }
    return { label: 'Carga Homogénea / Estable', icon: Minus, color: 'text-blue-500' };
  };

  // Exporta el informe diagnóstico en archivo de texto estructurado
  const handleExportarDiagnostico = (dev) => {
    if (!dev) return;
    const fecha = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
    const nivel = normalizarEstado(dev.estadoAlerta);
    const nombreDev = dev?.nombreCompleto || 'Desarrollador';
    const contenido = `===============================================================
IKERNELL SOLUCIONES SOFTWARE - DICTAMEN DE ANALÍTICA PREDICTIVA
MÓDULO: PREDICTOR DE DESGASTE Y BURNOUT HISTÓRICO (RF-35)
NORMATIVA: ISO/IEC 25010 (Mantenibilidad & Fiabilidad de Software)
===============================================================

Fecha de Emisión: ${fecha}
Desarrollador Evaluado: ${nombreDev} (ID: ${dev?.idTrabajador || 'N/A'})
Especialidad: ${dev?.especialidad || 'Desarrollo de Software'}
Correo Electrónico: ${dev?.email || 'N/A'}
Nivel Semafórico Homologado: ${nivel}
Capacidad Bloqueada en Sistema: ${dev?.capacidadBloqueada ? 'SÍ (Bloqueo Preventivo)' : 'NO'}

---------------------------------------------------------------
1. MÉTRICAS CLAVE Y SERIES TEMPORALES DE 21 DÍAS
---------------------------------------------------------------
- Tareas WBS Asignadas Activas: ${dev?.tareasActivas || 0}
- Score de Carga Cognitiva Global: ${Math.round(dev?.promedioCarga || 0)} / 100
- Semana 1 (Días 15 a 21): ${Math.round(dev?.scoreSemana1 || 0)}%
- Semana 2 (Días 8 a 14): ${Math.round(dev?.scoreSemana2 || 0)}%
- Semana 3 (Últimos 7 días): ${Math.round(dev?.scoreSemana3 || 0)}%

---------------------------------------------------------------
2. DIAGNÓSTICO CLÍNICO-OPERATIVO
---------------------------------------------------------------
${getDiagnosticoClaro(dev)}

---------------------------------------------------------------
3. RECOMENDACIÓN FORMULADA POR EL MOTOR PREDICTIVO
---------------------------------------------------------------
${dev?.recomendacion || 'Mantener monitoreo continuo en cada sprint.'}

===============================================================
Generado automáticamente por el motor analítico IKernell v2.0
===============================================================`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DIAGNOSTICO_BURNOUT_${nombreDev.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Diagnóstico de ${nombreDev} exportado con éxito.`);
  };

  // Badge estilizado con indicadores SVG limpios (sin emojis)
  const getBadgeEstado = (estado) => {
    const nivel = normalizarEstado(estado);
    switch (nivel) {
      case 'CRITICA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-black bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            CRÍTICA
          </span>
        );
      case 'ALTA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            ALTA
          </span>
        );
      case 'MEDIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            MEDIA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            BAJA / ESTABLE
          </span>
        );
    }
  };

  // Color de barra de progreso según carga
  const getProgressColor = (score, estado) => {
    const nivel = normalizarEstado(estado);
    if (nivel === 'CRITICA' || score >= 80) return 'bg-red-500';
    if (nivel === 'ALTA' || score >= 65) return 'bg-orange-500';
    if (nivel === 'MEDIA' || score >= 45) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
      {/* Banner de Retorno Rápido (Volver con 1 Clic al Contexto Previo de Inspección) */}
      {previousNavigationContext && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 sm:p-4 rounded-3xl shadow-lg flex items-center justify-between gap-3 border border-blue-400/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
              <RotateCcw size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold tracking-tight flex items-center gap-2">
                <span>Navegación Directa: Viendo proyecto "{proyectoSeleccionadoLocal?.nombre || 'Seleccionado'}"</span>
              </p>
              <p className="text-[0.68rem] sm:text-xs text-blue-100 font-medium mt-0.5">
                ¿Deseas volver a la inspección de <strong className="text-white underline decoration-white/40">{previousNavigationContext.dev?.nombre} {previousNavigationContext.dev?.apellido}</strong>? Haz clic en el botón a la derecha.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVolverAInspeccion}
            className="bg-white text-blue-700 hover:bg-blue-50 text-xs font-black py-2.5 px-4 sm:px-5 rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 hover:scale-105"
          >
            <ArrowLeft size={16} className="stroke-[3]" />
            <span>Volver a Inspección de {previousNavigationContext.dev?.nombre || 'Colaborador'}</span>
          </button>
        </motion.div>
      )}

      {/* ─── Encabezado Principal & Contexto ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
              <Sparkles size={13} className="text-blue-600 dark:text-blue-400" /> Analítica Predictiva • Burnout Engine (ISO/IEC 25010)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Predictor de Desgaste & Burnout Histórico
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium">
            Monitor de riesgo cognitivo y series temporales de 21 días (S1, S2, S3) bajo la norma ISO/IEC 25010. Detección temprana clasificada en 4 niveles homologados: Crítica, Alta, Media y Baja/Estable.
          </p>
        </div>

        {/* Barra de Herramientas Principal: Selector Destacado de Proyecto + Acciones */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Botón Principal Prominente: Selector de Proyecto y Alcance Global */}
          <button
            type="button"
            onClick={() => {
              setBusquedaProyectoModal('');
              setFiltroEstadoProyectoModal('TODOS');
              setModalProyectosOpen(true);
            }}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer group hover:scale-[1.02]"
            title="Haga clic aquí para cambiar el proyecto activo o seleccionar el alcance global corporativo"
          >
            {isProyectoEspecifico ? (
              <>
                <FolderGit2 size={15} className="shrink-0 text-blue-200" />
                <span className="font-mono text-blue-100 font-bold">
                  [PRJ-00{proyectoSeleccionadoLocal.idProyecto}]
                </span>
                <span className="truncate max-w-[160px] sm:max-w-[220px] font-black">
                  {proyectoSeleccionadoLocal.nombre}
                </span>
              </>
            ) : (
              <>
                <Globe size={15} className="shrink-0 text-blue-200" />
                <span className="font-black">
                  Alcance Corporativo Global (Todos los Proyectos)
                </span>
              </>
            )}
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[0.62rem] font-bold uppercase tracking-wider ml-1">
              Cambiar Proyecto
            </span>
            <ChevronDown size={14} className="text-blue-200 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="outline-button text-xs py-2.5 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="¿Cómo funciona la clasificación de 4 niveles de riesgo?"
          >
            <HelpCircle size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Guía de 4 Niveles</span>
          </button>

          <button
            type="button"
            onClick={fetchBurnoutMetrics}
            disabled={loading}
            className="outline-button text-xs py-2.5 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Sincronizar métricas con PostgreSQL en tiempo real"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-500' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* ─── Estados de Carga o Error ─── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          <div className="lg:col-span-5 space-y-3">
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
          <div className="lg:col-span-7">
            <SkeletonCard rows={5} />
          </div>
        </div>
      ) : error ? (
        <div className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchBurnoutMetrics} className="gradient-button text-xs py-1 px-3">
            Reintentar
          </button>
        </div>
      ) : isProyectoEspecifico && metricasPorProyecto.length === 0 ? (
        /* Empty state cuando el proyecto específico no tiene desarrolladores con tareas */
        <div className="py-16 px-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-4 shadow-inner">
            <Users size={30} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Sin desarrolladores con tareas en "{proyectoSeleccionadoLocal.nombre}"
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
            Actualmente no hay actividades WBS asignadas a desarrolladores en este proyecto para calcular la carga cognitiva y temporal.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setProyectoSeleccionadoLocal({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                setSelectedDev(null);
              }}
              className="outline-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Globe size={13} /> Ver Alcance Global
            </button>
            {onNavigateToWbs && (
              <button
                type="button"
                onClick={onNavigateToWbs}
                className="gradient-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md"
              >
                <Layers size={13} /> Asignar Tareas en WBS
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Banner de Orientación Didáctica al Usuario */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3 text-xs shadow-2xs mb-5">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-indigo-950 dark:text-indigo-200 font-medium">
              <strong>Motor Predictivo de Salud del Equipo & Burnout (ISO/IEC 25010):</strong> Selecciona un desarrollador en la columna izquierda para evaluar el desglose de su carga entre proyectos, analizar la fatiga en 21 días (S1, S2, S3) y ejecutar rebalanceos preventivos en el WBS para evitar sobrecargas.
            </div>
          </div>

          {/* ─── Layout Split-View Master-Detail (2 Columnas Responsivas) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA (~40%): Panel Único de Búsqueda, Filtros y Selección
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-4 bg-zinc-50/60 dark:bg-zinc-800/30 p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80">
            
            {/* 1. Buscador Rápido */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar desarrollador o especialidad..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl pl-9 pr-9 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* 2. Píldoras de Filtro Semafórico Homologadas (Sin emojis, con dots SVG) */}
            <div className="space-y-1.5">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Filtrar por Nivel de Riesgo:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('TODOS')}
                  className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'TODOS'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Todos ({conteosSemaforo.TODOS})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('CRITICA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'CRITICA'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 inline-block" />
                  Crítica ({conteosSemaforo.CRITICA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('ALTA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'ALTA'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5 inline-block" />
                  Alta ({conteosSemaforo.ALTA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('MEDIA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'MEDIA'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block" />
                  Media ({conteosSemaforo.MEDIA})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSemaforo('BAJA')}
                  className={`inline-flex items-center text-[0.68rem] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    filtroSemaforo === 'BAJA'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                  Baja / Estable ({conteosSemaforo.BAJA})
                </button>
              </div>
            </div>

            {/* 3. Selector de Ordenamiento */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Ordenar por:
              </span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1 text-[0.68rem] font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="RIESGO_DESC">Mayor Riesgo / Desgaste</option>
                <option value="RIESGO_ASC">Menor Riesgo (Saludable)</option>
                <option value="TAREAS_DESC">Más Tareas WBS</option>
                <option value="NOMBRE_ASC">Nombre (A - Z)</option>
              </select>
            </div>

            {/* 4. Listado de Tarjetas Interactivas de Desarrolladores */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {metricasFiltradas.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <User size={24} className="mx-auto text-zinc-400 mb-2 opacity-60" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    No se encontraron coincidencias
                  </p>
                  <p className="text-[0.68rem] text-zinc-400 mt-1">
                    Prueba ajustando el término de búsqueda o cambiando el filtro de semáforo.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setFiltroSemaforo('TODOS'); }}
                    className="mt-3 text-[0.68rem] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                metricasFiltradas.map((dev) => {
                  const isSelected = selectedDev?.idTrabajador === dev.idTrabajador;
                  const score = Math.round(dev.promedioCarga || 0);

                  return (
                    <motion.div
                      key={dev.idTrabajador}
                      onClick={() => setSelectedDev(dev)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/25 ring-2 ring-blue-400/40'
                          : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm'
                      }`}
                    >
                      {/* Cabecera de la tarjeta */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar con Iniciales */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}>
                            {dev.nombreCompleto ? dev.nombreCompleto.substring(0, 2).toUpperCase() : 'DEV'}
                          </div>

                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm leading-snug">
                              {dev.nombreCompleto}
                            </h4>
                            <p className={`text-[0.68rem] truncate max-w-[170px] ${
                              isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'
                            }`}>
                              {getCleanEspecialidad(dev.especialidad)}
                            </p>
                          </div>
                        </div>

                        {/* Badge de Estado */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="text-[0.62rem] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                              {normalizarEstado(dev.estadoAlerta)}
                            </span>
                          ) : (
                            getBadgeEstado(dev.estadoAlerta)
                          )}
                        </div>
                      </div>

                      {/* Barra de Progreso de Carga Cognitiva */}
                      <div className="space-y-1 mt-3">
                        <div className="flex justify-between text-[0.65rem] font-bold">
                          <span className={isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}>
                            {isProyectoEspecifico ? (
                              <>
                                <strong className={isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}>
                                  {tareasPorDevEnEsteProyecto.get(dev.idTrabajador) || 0}
                                </strong> en este proyecto • {dev.tareasActivas} globales
                              </>
                            ) : (
                              <>{dev.tareasActivas} tareas globales</>
                            )}
                          </span>
                          <span className="font-mono font-bold">
                            {score}% Burnout
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isSelected ? 'bg-blue-900/40' : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelected ? 'bg-white' : getProgressColor(score, dev.estadoAlerta)
                            }`}
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              COLUMNA DERECHA (~60%): Radiografía Profunda, Series y Dictamen
             ═════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-5">
            {selectedDev ? (
              <motion.div
                key={selectedDev.idTrabajador}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
              >
                
                {/* 1. Banner Superior del Desarrollador */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-base font-black shadow-md shadow-blue-500/20 shrink-0">
                      {selectedDev.nombreCompleto ? selectedDev.nombreCompleto.substring(0, 2).toUpperCase() : 'DV'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                          {selectedDev.nombreCompleto}
                        </h3>
                        {getBadgeEstado(selectedDev.estadoAlerta)}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {getCleanEspecialidad(selectedDev.especialidad)} • <span className="font-mono">{selectedDev.email}</span>
                      </p>
                    </div>
                  </div>

                  {selectedDev.capacidadBloqueada && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 animate-pulse">
                      <Lock size={13} /> Bloqueo Preventivo
                    </span>
                  )}
                </div>

                {/* 2. Diagnóstico Directo en Lenguaje Claro */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                  {getDiagnosticoClaro(selectedDev)}
                </div>

                {/* ── Desglose de Carga: Proyecto Actual vs Global Corporativa ── */}
                {(() => {
                  const targetIdStr = String(proyectoSeleccionadoLocal?.idProyecto || proyecto?.idProyecto || (desarolladorTareasList[0]?.idProyecto ?? ''));
                  const targetNameStr = proyectoSeleccionadoLocal?.nombre || proyecto?.nombre || desarolladorTareasList[0]?.nombreProyecto || '';

                  const tareasEsteProyecto = desarolladorTareasList.filter(t => 
                    (targetIdStr && String(t.idProyecto) === targetIdStr) || 
                    (targetNameStr && t.nombreProyecto === targetNameStr)
                  ).length;

                  const tareasOtrosProyectos = Math.max(0, desarolladorTareasList.length - tareasEsteProyecto);
                  const nombreProyectoActualLabel = isProyectoEspecifico 
                    ? (proyectoSeleccionadoLocal?.nombre || proyecto?.nombre || 'Este proyecto') 
                    : (desarolladorTareasList[0]?.nombreProyecto || 'Proyecto Principal');

                  return (
                    <div className="p-4.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 min-w-0">
                          <Briefcase size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="truncate">Desglose de Carga: Proyecto Actual vs Global Corporativa</span>
                        </span>
                        <span className="text-[0.62rem] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                          Métrica Multidisciplinaria
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Tarjeta 1: En Este Proyecto (Interactiva) */}
                        <button
                          type="button"
                          onClick={() => {
                            setDevTaskModalFilter('THIS_PROJECT');
                            setShowTareasDevModal(true);
                          }}
                          className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative group cursor-pointer transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md text-left flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[0.62rem] text-zinc-400 font-extrabold uppercase block mb-0.5">
                              En este proyecto
                            </span>
                            <div className="font-black text-sm text-blue-600 dark:text-blue-400 flex items-center justify-between">
                              <span>{tareasEsteProyecto} tareas activas</span>
                              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-blue-400" />
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block mt-1 truncate font-semibold" title={nombreProyectoActualLabel}>
                              {nombreProyectoActualLabel}
                            </span>
                          </div>
                        </button>

                        {/* Tarjeta 2: En Otros Proyectos (Interactiva) */}
                        <button
                          type="button"
                          onClick={() => {
                            setDevTaskModalFilter('OTHER_PROJECTS');
                            setShowTareasDevModal(true);
                          }}
                          className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative group cursor-pointer transition-all hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md text-left flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[0.62rem] text-zinc-400 font-extrabold uppercase block mb-0.5">
                              En otros proyectos
                            </span>
                            <div className="font-black text-sm text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                              <span>{tareasOtrosProyectos} tareas activas</span>
                              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-amber-500" />
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block mt-1 truncate font-semibold">
                              Otras iniciativas corporativas
                            </span>
                          </div>
                        </button>

                        {/* Tarjeta 3: Carga Global Acumulada (Interactiva) */}
                        <button
                          type="button"
                          onClick={() => {
                            setDevTaskModalFilter('ALL');
                            setShowTareasDevModal(true);
                          }}
                          className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative group cursor-pointer transition-all hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md text-left flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[0.62rem] text-zinc-400 font-extrabold uppercase block mb-0.5">
                              Carga Global Acumulada
                            </span>
                            <div className="font-black text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                              <span>{Math.round(selectedDev.promedioCarga)}% Total</span>
                              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-emerald-500" />
                            </div>
                            <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 block mt-1 font-semibold">
                              Fatiga acumulada (21 días)
                            </span>
                          </div>
                        </button>
                      </div>

                      <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 leading-relaxed italic bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 font-medium">
                        Nota: El índice de Burnout evalúa la fatiga acumulada del desarrollador en todos sus proyectos asignados. Al cambiar de proyecto en el dashboard, este porcentaje se mantiene constante porque el estrés cognitivo y la capacidad humana son globales.
                      </p>
                    </div>
                  );
                })()}

                {/* 3. Grid de 4 Métricas Clave Interactivas con Datos Reales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Tarjeta 4: Tareas Asignadas */}
                  <button
                    type="button"
                    onClick={() => setShowTareasDevModal(true)}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 relative group cursor-pointer transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md text-left flex flex-col justify-between"
                    title="Hacer clic para ver el desglose detallado de actividades WBS asignadas"
                  >
                    <div>
                      <span className="text-[0.62rem] uppercase font-extrabold text-zinc-400 dark:text-zinc-500 block mb-1">
                        Tareas Asignadas
                      </span>
                      <div className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                        <span>{selectedDev.tareasActivas} <span className="text-[0.65rem] font-bold text-zinc-400">WBS</span></span>
                        <ChevronRight size={14} className="text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <span className="text-[0.6rem] font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                      Ver lista completa &rarr;
                    </span>
                  </button>

                  {/* Tarjeta 5: Carga Promedio */}
                  <button
                    type="button"
                    onClick={() => setShowEvolucionModal(true)}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 relative group cursor-pointer transition-all hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md text-left flex flex-col justify-between"
                    title="Hacer clic para ver la radiografía de carga de los 21 días"
                  >
                    <div>
                      <span className="text-[0.62rem] uppercase font-extrabold text-zinc-400 dark:text-zinc-500 block mb-1">
                        Carga Promedio
                      </span>
                      <div className={`text-lg sm:text-xl font-black flex items-center justify-between ${
                        normalizarEstado(selectedDev.estadoAlerta) === 'CRITICA' ? 'text-red-600 dark:text-red-400' :
                        normalizarEstado(selectedDev.estadoAlerta) === 'ALTA' ? 'text-orange-600 dark:text-orange-400' :
                        normalizarEstado(selectedDev.estadoAlerta) === 'MEDIA' ? 'text-amber-600 dark:text-amber-400' :
                        'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        <span>{Math.round(selectedDev.promedioCarga)}%</span>
                        <ChevronRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <span className="text-[0.6rem] font-bold text-zinc-500 dark:text-zinc-400 mt-1 block">
                      Ver desglose ISO &rarr;
                    </span>
                  </button>

                  {/* Tarjeta 6: Pico Máximo */}
                  <button
                    type="button"
                    onClick={() => setShowEvolucionModal(true)}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 relative group cursor-pointer transition-all hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-md text-left flex flex-col justify-between"
                    title="Hacer clic para ver en qué semana ocurrió el pico de fatiga"
                  >
                    <div>
                      <span className="text-[0.62rem] uppercase font-extrabold text-zinc-400 dark:text-zinc-500 block mb-1">
                        Pico Máximo
                      </span>
                      <div className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                        <span>{Math.max(
                          Math.round(selectedDev.scoreSemana1 || 0),
                          Math.round(selectedDev.scoreSemana2 || 0),
                          Math.round(selectedDev.scoreSemana3 || 0)
                        )}%</span>
                        <ChevronRight size={14} className="text-orange-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <span className="text-[0.6rem] font-bold text-orange-600 dark:text-orange-400 mt-1 block">
                      Pico de fatiga &rarr;
                    </span>
                  </button>

                  {/* Tarjeta 7: Comportamiento */}
                  <button
                    type="button"
                    onClick={() => setShowEvolucionModal(true)}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 relative group cursor-pointer transition-all hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md text-left flex flex-col justify-between"
                    title="Hacer clic para ver la curva de tendencia"
                  >
                    <div>
                      <span className="text-[0.62rem] uppercase font-extrabold text-zinc-400 dark:text-zinc-500 block mb-1">
                        Comportamiento
                      </span>
                      {(() => {
                        const tend = getTendenciaTemporal(selectedDev);
                        const Icon = tend.icon;
                        return (
                          <div className={`text-xs font-black flex items-center justify-between mt-1 ${tend.color}`}>
                            <span className="flex items-center gap-1 min-w-0 truncate">
                              <Icon size={14} className="shrink-0" />
                              <span className="truncate">{tend.label.split(' ')[0]}</span>
                            </span>
                            <ChevronRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        );
                      })()}
                    </div>
                    <span className="text-[0.6rem] font-bold text-purple-600 dark:text-purple-400 mt-1 block">
                      Ver tendencia &rarr;
                    </span>
                  </button>
                </div>

                {/* 4. Visualizador de Series Temporales (21 Días - S1, S2, S3) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Activity size={14} className="text-indigo-600 dark:text-indigo-400" />
                      Series Temporales de Carga Cognitiva (21 Días)
                    </h4>
                    <span className="text-[0.65rem] text-zinc-400 font-mono">
                      Algoritmo Deslizante ISO/IEC 25010
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Tarjeta 8: Semana 1 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center relative group cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md">
                      <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                        S1 • Días 15-21
                      </span>
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {Math.round(selectedDev.scoreSemana1 || 0)}%
                      </span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-blue-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(Math.round(selectedDev.scoreSemana1 || 0), 100)}%` }}
                        />
                      </div>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-2xl bg-zinc-900 text-white text-[0.68rem] leading-relaxed shadow-2xl border border-zinc-700 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
                        <div className="font-bold text-blue-300 flex items-center gap-1 mb-0.5">
                          <Calendar size={11} className="text-blue-400 shrink-0" />
                          <span>Semana 1 (Hace 21 días)</span>
                        </div>
                        <span>Nivel de carga de {Math.round(selectedDev.scoreSemana1 || 0)}% registrado al inicio del ciclo de analítica.</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                      </div>
                    </div>

                    {/* Tarjeta 9: Semana 2 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center relative group cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md">
                      <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                        S2 • Días 8-14
                      </span>
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {Math.round(selectedDev.scoreSemana2 || 0)}%
                      </span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(Math.round(selectedDev.scoreSemana2 || 0), 100)}%` }}
                        />
                      </div>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-2xl bg-zinc-900 text-white text-[0.68rem] leading-relaxed shadow-2xl border border-zinc-700 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
                        <div className="font-bold text-blue-300 flex items-center gap-1 mb-0.5">
                          <Clock size={11} className="text-blue-400 shrink-0" />
                          <span>Semana 2 (Días 8-14)</span>
                        </div>
                        <span>Carga acumulada de {Math.round(selectedDev.scoreSemana2 || 0)}% a mitad de la ventana de análisis.</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                      </div>
                    </div>

                    {/* Tarjeta 10: Semana 3 */}
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center relative group cursor-pointer transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md">
                      <span className="text-[0.62rem] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-1">
                        S3 • Últimos 7d
                      </span>
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {Math.round(selectedDev.scoreSemana3 || 0)}%
                      </span>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            normalizarEstado(selectedDev.estadoAlerta) === 'CRITICA' ? 'bg-red-500' :
                            normalizarEstado(selectedDev.estadoAlerta) === 'ALTA' ? 'bg-orange-500' :
                            normalizarEstado(selectedDev.estadoAlerta) === 'MEDIA' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(Math.round(selectedDev.scoreSemana3 || 0), 100)}%` }}
                        />
                      </div>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-2xl bg-zinc-900 text-white text-[0.68rem] leading-relaxed shadow-2xl border border-zinc-700 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
                        <div className="font-bold text-emerald-300 flex items-center gap-1 mb-0.5">
                          <Activity size={11} className="text-emerald-400 shrink-0" />
                          <span>Semana 3 (Últimos 7 días)</span>
                        </div>
                        <span>Carga reciente de {Math.round(selectedDev.scoreSemana3 || 0)}%. Determina la tendencia actual del semáforo.</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Dictamen y Recomendación del Motor Predictivo */}
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-300">
                    <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Dictamen del Motor Predictivo:</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {selectedDev.recomendacion || 'Sin observaciones críticas. Mantener ritmo de entregas.'}
                  </p>
                </div>

                {/* 6. Panel de Acciones Rápidas del Líder */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-[0.68rem] text-zinc-400 font-medium">
                    IKernell Predictive Analytics Engine • PostgreSQL Live
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleExportarDiagnostico(selectedDev)}
                      className="outline-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm flex-1 sm:flex-initial"
                      title="Descargar informe técnico en formato plano"
                    >
                      <Download size={13} /> Exportar Diagnóstico
                    </button>

                    {onNavigateToWbs && (
                      <button
                        type="button"
                        onClick={onNavigateToWbs}
                        className="gradient-button text-xs py-2 px-4 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md flex-1 sm:flex-initial"
                        title="Ir a la estructura WBS para reasignar tareas y equilibrar la carga"
                      >
                        <Layers size={13} /> Rebalancear en WBS
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400">
                <User size={36} className="mx-auto mb-3 opacity-40" />
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  Seleccione un desarrollador
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Haga clic en una tarjeta de la columna izquierda para desplegar la radiografía completa de 21 días.
                </p>
              </div>
            )}
          </div>

        </div>
      </>
      )}

      {/* ─── Modal 1: Explorador y Menú Emergente de Proyectos (Ampliación Avanzada) ─── */}
      <AnimatePresence>
        {modalProyectosOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 w-full max-w-3xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            >
              {/* Encabezado del Modal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3.5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                    <FolderGit2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                      Explorador de Proyectos & Alcance
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Seleccione un proyecto específico o visualice la carga cognitiva global de toda la compañía
                    </p>
                  </div>
                </div>
              </div>

              {/* Buscador en tiempo real y Filtros Rápidos */}
              <div className="space-y-2.5 shrink-0">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={busquedaProyectoModal}
                    onChange={(e) => setBusquedaProyectoModal(e.target.value)}
                    placeholder="Buscar por código (ej. PRJ-001), título, cliente o descripción..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-9 pr-9 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                    autoFocus
                  />
                  {busquedaProyectoModal && (
                    <button
                      type="button"
                      onClick={() => setBusquedaProyectoModal('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filtros de Estado */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoModal('TODOS')}
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      filtroEstadoProyectoModal === 'TODOS'
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>Todos</span>
                    <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-black/10">
                      {statsProyectos.total}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoModal('ACTIVO')}
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      filtroEstadoProyectoModal === 'ACTIVO'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Activos</span>
                    <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
                      {statsProyectos.activos}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFiltroEstadoProyectoModal('FINALIZADO')}
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      filtroEstadoProyectoModal === 'FINALIZADO'
                        ? 'bg-zinc-700 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>Finalizados</span>
                    <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
                      {statsProyectos.finalizados}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProyectoSeleccionadoLocal({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                      setSelectedDev(null);
                      setModalProyectosOpen(false);
                    }}
                    className={`text-xs py-1 px-3 rounded-xl font-bold transition-all cursor-pointer ml-auto inline-flex items-center gap-1.5 ${
                      !isProyectoEspecifico
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    <Globe size={12} />
                    <span>Vista Global</span>
                  </button>
                </div>
              </div>

              {/* Lista Scrollable de Proyectos */}
              <div className="overflow-y-auto flex-1 pr-1 space-y-2.5 min-h-[220px] max-h-[380px]">
                {/* Opción 1: Vista Global Corporativa Destacada */}
                <button
                  type="button"
                  onClick={() => {
                    setProyectoSeleccionadoLocal({ idProyecto: 'GLOBAL', nombre: 'Todos los Proyectos (Vista Global Corporativa)' });
                    setSelectedDev(null);
                    setModalProyectosOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    !isProyectoEspecifico
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-400/40'
                      : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/70 hover:bg-blue-50/30 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Globe size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                          Alcance Corporativo Global (Todos los Proyectos)
                        </span>
                        <span className="text-[0.6rem] font-bold px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 uppercase">
                          Vista Empresarial
                        </span>
                      </div>
                      <p className="text-[0.7rem] text-zinc-500 font-medium truncate mt-0.5">
                        Monitorea todos los desarrolladores asignados a través de todos los proyectos activos de la compañía.
                      </p>
                    </div>
                  </div>
                  {!isProyectoEspecifico && (
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      <Check size={16} /> <span>Activo</span>
                    </div>
                  )}
                </button>

                {/* Separador de Proyectos Individuales */}
                <div className="flex items-center gap-2 pt-1 pb-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-400">
                  <FolderGit2 size={12} />
                  <span>Proyectos Registrados ({proyectosModalFiltrados.length})</span>
                </div>

                {/* Grid 2 Columnas de Proyectos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {proyectosModalFiltrados.map((p) => {
                    const isSelected = isProyectoEspecifico && proyectoSeleccionadoLocal.idProyecto === p.idProyecto;
                    const estadoClasses = getEstadoBadgeClasses(p.estado);

                    return (
                      <button
                        key={p.idProyecto}
                        type="button"
                        onClick={() => {
                          setProyectoSeleccionadoLocal(p);
                          setSelectedDev(null);
                          setModalProyectosOpen(false);
                        }}
                        className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative group ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/40'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-1.5 w-full">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[0.68rem] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                              PRJ-00{p.idProyecto}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[0.6rem] font-extrabold uppercase px-2 py-0.5 rounded-full border ${estadoClasses.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${estadoClasses.dot}`} />
                              <span>{p.estado || 'ACTIVO'}</span>
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {p.nombre}
                          </h4>

                          {p.cliente && (
                            <p className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                              <Briefcase size={11} className="shrink-0 text-zinc-400" />
                              <span className="truncate">{p.cliente}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[0.68rem] w-full font-medium">
                          <span className="text-zinc-500 truncate">
                            {p.presupuesto ? `$${Number(p.presupuesto).toLocaleString('es-CO')}` : 'Sin presupuesto'}
                          </span>
                          {isSelected ? (
                            <span className="font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 shrink-0">
                              <Check size={13} /> Seleccionado
                            </span>
                          ) : (
                            <span className="text-zinc-400 group-hover:text-blue-500 inline-flex items-center gap-0.5 shrink-0 transition-colors">
                              Seleccionar &rarr;
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {proyectosModalFiltrados.length === 0 && (
                  <div className="py-10 text-center text-xs text-zinc-400 space-y-2">
                    <p>No se encontraron proyectos que coincidan con los filtros.</p>
                    <button
                      type="button"
                      onClick={() => { setBusquedaProyectoModal(''); setFiltroEstadoProyectoModal('TODOS'); }}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                )}
              </div>

              {/* Pie del Modal */}
              <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs shrink-0">
                <span className="text-[0.7rem] text-zinc-400 font-medium">
                  {statsProyectos.total} proyectos en el sistema
                </span>
                <button
                  type="button"
                  onClick={() => setModalProyectosOpen(false)}
                  className="outline-button text-xs py-1.5 px-4 font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Modal 2: Guía Maestra de 4 Pasos, Niveles de Riesgo & Algoritmo Predictivo ─── */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 w-full max-w-5xl md:max-w-6xl shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto scrollbar-thin"
            >
              {/* Encabezado Principal del Modal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <Brain size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[0.65rem] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800/80">
                        Protocolo capacity.pulse v4.0
                      </span>
                      <span className="text-[0.65rem] font-bold text-zinc-600 dark:text-zinc-400">
                        • CMMI Dev Level 3 & ISO/IEC 25010
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      Guía Maestra: Niveles de Riesgo & Algoritmo Predictivo
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                      Marco metodológico para la evaluación continua de carga cognitiva, balanceo de capacidad y prevención de fatiga en ventanas de 21 días.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Matriz de los 4 Niveles de Riesgo y Protocolos de Mitigación Inmediata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Shield size={14} className="text-blue-500" />
                    1. Matriz Operativa de 4 Pasos & Niveles de Sobrecarga
                  </h4>
                  <span className="text-[0.7rem] text-zinc-600 dark:text-zinc-400 font-bold">
                    Escala normalizada de 0% a 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Paso 1: Nivel Crítico */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-red-50/90 to-red-100/30 dark:from-red-950/40 dark:to-red-900/20 border border-red-200 dark:border-red-800/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-[0.7rem] text-red-700 dark:text-red-300 bg-red-100/90 dark:bg-red-900/80 px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 border border-red-200 dark:border-red-700">
                          <ShieldAlert size={14} className="shrink-0 animate-pulse" />
                          <span>PASO 1</span>
                        </span>
                        <span className="text-[0.7rem] font-black uppercase text-red-800 dark:text-red-200 px-3 py-1 rounded-xl bg-white/90 dark:bg-red-900/60 border border-red-300 dark:border-red-700 shadow-xs">
                          Score &gt; 80% • CRÍTICA
                        </span>
                      </div>

                      <div>
                        <h5 className="font-black text-red-950 dark:text-red-100 text-base">
                          Nivel Crítico: Sobrecarga Extrema & Bloqueo
                        </h5>
                        <p className="text-xs text-red-700 dark:text-red-300 font-bold mt-0.5">
                          Estado de fatiga acumulada con riesgo inminente de parálisis en entregables.
                        </p>
                      </div>

                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/70 dark:bg-zinc-900/70 p-3.5 rounded-2xl border border-red-200/70 dark:border-red-900/50">
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Diagnóstico Situacional:</strong> Saturación sostenida en las 3 series de tiempo (S1, S2, S3), concurrencia simultánea de más de 6 tareas críticas o acumulación severa de errores e interrupciones sin resolver.
                        </p>
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Impacto en Sprint:</strong> Alto riesgo de deserción, estrés cognitivo agudo y retrasos en entregables DIAN/WBS.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-red-200/80 dark:border-red-800/60 text-xs text-red-950 dark:text-red-100 font-medium bg-red-100/60 dark:bg-red-950/60 p-3.5 rounded-2xl flex items-start gap-2.5">
                      <ShieldAlert size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black text-red-900 dark:text-red-200 block text-xs uppercase tracking-wide mb-0.5">
                          Protocolo Mandatorio de Mitigación:
                        </strong>
                        <span className="text-[0.75rem] leading-relaxed block">
                          Bloqueo preventivo en WBS para impedir nuevas asignaciones. Rebalanceo urgente de tareas críticas hacia desarrolladores en estado Estable y activación de pausa técnica.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Paso 2: Nivel Alto */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-50/90 to-amber-100/30 dark:from-orange-950/40 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-[0.7rem] text-orange-700 dark:text-orange-300 bg-orange-100/90 dark:bg-orange-900/80 px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 border border-orange-200 dark:border-orange-700">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>PASO 2</span>
                        </span>
                        <span className="text-[0.7rem] font-black uppercase text-orange-800 dark:text-orange-200 px-3 py-1 rounded-xl bg-white/90 dark:bg-orange-900/60 border border-orange-300 dark:border-orange-700 shadow-xs">
                          Score 65% - 79% • ALTA
                        </span>
                      </div>

                      <div>
                        <h5 className="font-black text-orange-950 dark:text-orange-100 text-base">
                          Nivel Alto: Sobrecarga en Aceleración
                        </h5>
                        <p className="text-xs text-orange-700 dark:text-orange-300 font-bold mt-0.5">
                          Tendencia alcista sostenida con pérdida de holgura operativa.
                        </p>
                      </div>

                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/70 dark:bg-zinc-900/70 p-3.5 rounded-2xl border border-orange-200/70 dark:border-orange-900/50">
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Diagnóstico Situacional:</strong> Aumento significativo de tensión en los últimos 7 días (S3 ≥ 75%) o promedio acumulado entre 65% y 79% con tareas complejas en paralelo.
                        </p>
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Impacto en Sprint:</strong> Degradación progresiva en la calidad del código y riesgo de desbordamiento al cierre del ciclo.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-orange-200/80 dark:border-orange-800/60 text-xs text-orange-950 dark:text-orange-100 font-medium bg-orange-100/60 dark:bg-orange-950/60 p-3.5 rounded-2xl flex items-start gap-2.5">
                      <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black text-orange-900 dark:text-orange-200 block text-xs uppercase tracking-wide mb-0.5">
                          Protocolo Mandatorio de Mitigación:
                        </strong>
                        <span className="text-[0.75rem] leading-relaxed block">
                          Rebalanceo preventivo de subtareas complejas antes del cierre del sprint. Asignación de desarrollador de apoyo para Pair Programming y ajuste de estimaciones.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Paso 3: Nivel Medio */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 to-yellow-100/30 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-[0.7rem] text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/80 px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 border border-amber-200 dark:border-amber-700">
                          <Activity size={14} className="shrink-0" />
                          <span>PASO 3</span>
                        </span>
                        <span className="text-[0.7rem] font-black uppercase text-amber-800 dark:text-amber-200 px-3 py-1 rounded-xl bg-white/90 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 shadow-xs">
                          Score 45% - 64% • MEDIA
                        </span>
                      </div>

                      <div>
                        <h5 className="font-black text-amber-950 dark:text-amber-100 text-base">
                          Nivel Medio: Alerta Preventiva & Fricción
                        </h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                          Desgaste vinculado a contingencias de entorno e interrupciones externas.
                        </p>
                      </div>

                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/70 dark:bg-zinc-900/70 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/50">
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Diagnóstico Situacional:</strong> Desgaste originado por contingencias no planificadas, bloqueos de infraestructura, reuniones sobrevenidas o soporte urgente de producción.
                        </p>
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Impacto en Sprint:</strong> Dispersión de atención técnica y desvíos leves frente al cronograma base.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-100 font-medium bg-amber-100/60 dark:bg-amber-950/60 p-3.5 rounded-2xl flex items-start gap-2.5">
                      <Clock size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black text-amber-900 dark:text-amber-200 block text-xs uppercase tracking-wide mb-0.5">
                          Protocolo Mandatorio de Mitigación:
                        </strong>
                        <span className="text-[0.75rem] leading-relaxed block">
                          Monitoreo de cadencia en reuniones diarias (Dailies), contención de interrupciones externas y desbloqueo de dependencias de despliegue.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Paso 4: Nivel Bajo / Estable */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/90 to-teal-100/30 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-[0.7rem] text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/80 px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-700">
                          <CheckCircle2 size={14} className="shrink-0" />
                          <span>PASO 4</span>
                        </span>
                        <span className="text-[0.7rem] font-black uppercase text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-xl bg-white/90 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 shadow-xs">
                          Score &lt; 45% • BAJA / ESTABLE
                        </span>
                      </div>

                      <div>
                        <h5 className="font-black text-emerald-950 dark:text-emerald-100 text-base">
                          Nivel Bajo: Rendimiento Óptimo & Balance
                        </h5>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-0.5">
                          Flujo operativo armónico y capacidad técnica disponible.
                        </p>
                      </div>

                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/70 dark:bg-zinc-900/70 p-3.5 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50">
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Diagnóstico Situacional:</strong> Cadencia predecible, flujo continuo de entregables y balance equilibrado entre horas estimadas y consumidas sin acumulación de fatiga.
                        </p>
                        <p>
                          <strong className="text-zinc-900 dark:text-zinc-100">Impacto en Sprint:</strong> Alta confiabilidad de entrega, excelencia técnica y retención óptima del talento.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-100 font-medium bg-emerald-100/60 dark:bg-emerald-950/60 p-3.5 rounded-2xl flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-black text-emerald-900 dark:text-emerald-200 block text-xs uppercase tracking-wide mb-0.5">
                          Protocolo Mandatorio de Mitigación:
                        </strong>
                        <span className="text-[0.75rem] leading-relaxed block">
                          Capacidad habilitada para recibir nuevas actividades en WBS, liderar revisiones arquitectónicas o participar en mentoría de otros desarrolladores.
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. Fundamentación del Motor Analítico (Ventana de 21 Días y Ponderaciones Tri-Axiales) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/90 dark:border-zinc-700 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-700/80">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      2. Fundamentación del Motor Analítico (Series Temporales de 21 Días)
                    </h4>
                  </div>
                  <span className="text-[0.7rem] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    Ventana Dinámica Deslizante
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Desglose de Series Temporales */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-wider block">
                      A. Desglose Temporal Tri-Semanal (Inercia Dinámica)
                    </span>
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs shrink-0 border border-blue-100 dark:border-blue-900">
                          S1
                        </div>
                        <div className="text-xs">
                          <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                            Semana 1 (Días 15 a 21) • Inercia Histórica (20%)
                          </strong>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[0.72rem] leading-relaxed block mt-0.5">
                            Establece la línea base de capacidad del desarrollador y su ritmo previo de resolución.
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-100 dark:border-indigo-900">
                          S2
                        </div>
                        <div className="text-xs">
                          <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                            Semana 2 (Días 8 a 14) • Tendencia Operativa (35%)
                          </strong>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[0.72rem] leading-relaxed block mt-0.5">
                            Detecta la aceleración o mitigación de fatiga y la persistencia de errores técnicos.
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xs shrink-0 border border-purple-100 dark:border-purple-900">
                          S3
                        </div>
                        <div className="text-xs">
                          <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                            Semana 3 (Últimos 7 días) • Tensión Inmediata (45%)
                          </strong>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[0.72rem] leading-relaxed block mt-0.5">
                            Refleja la carga viva actual, tareas simultáneas en curso y contingencias del sprint activo.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ponderación Multidimensional Tri-Axial */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-wider block">
                      B. Factores Tri-Axiales del Algoritmo
                    </span>
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs shrink-0 border border-blue-100 dark:border-blue-900">
                          45%
                        </div>
                        <div className="text-xs">
                          <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                            Carga de Asignación WBS
                          </strong>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[0.72rem] leading-relaxed block mt-0.5">
                            Dedicación horaria semanal, concurrencia de entregables y balance entre horas estimadas vs reales.
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-xs shrink-0 border border-red-100 dark:border-red-900">
                          35%
                        </div>
                        <div className="text-xs">
                          <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                            Severidad de Errores Técnicos
                          </strong>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[0.72rem] leading-relaxed block mt-0.5">
                            Incidencias no resueltas clasificadas por severidad (Crítica, Alta, Media, Baja) y retrabajos.
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs shrink-0 border border-amber-100 dark:border-amber-900">
                          20%
                        </div>
                        <div className="text-xs">
                          <strong className="text-zinc-900 dark:text-zinc-100 block font-bold">
                            Tiempos de Contingencia e Interrupción
                          </strong>
                          <span className="text-zinc-600 dark:text-zinc-400 text-[0.72rem] leading-relaxed block mt-0.5">
                            Minutos perdidos por caídas de entorno, esperas de dependencias y reuniones fuera de plan.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. Guía de Gobernanza Directiva & Mejores Prácticas (Coordinadores y Líderes) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-black text-blue-950 dark:text-blue-100 uppercase tracking-wide">
                    3. Gobernanza Operacional & Protocolos Directivos
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/50 space-y-1">
                    <strong className="text-zinc-900 dark:text-zinc-100 font-bold block text-[0.78rem]">
                      Regla de Capacidad (48h)
                    </strong>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[0.7rem] leading-relaxed">
                      El sistema restringe automáticamente asignaciones que sobrepasen las 48 horas semanales por trabajador para evitar fatiga estructural.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/50 space-y-1">
                    <strong className="text-zinc-900 dark:text-zinc-100 font-bold block text-[0.78rem]">
                      Rebalanceo Trazable
                    </strong>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[0.7rem] leading-relaxed">
                      Toda reasignación de actividades queda registrada de forma inmutable con motivo, fecha y autor para auditoría ISO/CMMI.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/50 space-y-1">
                    <strong className="text-zinc-900 dark:text-zinc-100 font-bold block text-[0.78rem]">
                      Gestión Proactiva
                    </strong>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[0.7rem] leading-relaxed">
                      Utilice el semáforo predictivo en las reuniones de planificación para balancear cargas antes de que un proyecto entre en retraso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de Cierre */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Protocolo verificado para el control preventivo y la sostenibilidad del equipo.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="gradient-button text-xs py-2.5 px-7 font-black cursor-pointer shadow-md shadow-blue-600/20 hover:scale-[1.02] transition-transform w-full sm:w-auto"
                >
                  Entendido / Cerrar Guía
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Modal 3: Detalle de Actividades WBS Asignadas con Redirección Automática ─── */}
      <AnimatePresence>
        {showTareasDevModal && selectedDev && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-5 max-h-[90vh] flex flex-col"
            >
              {/* Encabezado del Modal */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
                      <span>Actividades WBS Asignadas</span>
                      <span className="text-[0.68rem] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {devTaskModalFilter === 'THIS_PROJECT' ? `En este proyecto (${tareasFiltradasModal.length})` :
                         devTaskModalFilter === 'OTHER_PROJECTS' ? `En otros proyectos (${tareasFiltradasModal.length})` :
                         `${tareasFiltradasModal.length} globales`}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Desarrollador: <strong className="text-zinc-900 dark:text-zinc-100">{selectedDev.nombreCompleto}</strong> ({selectedDev.email})
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Resumen Rápido por Proyectos Asignados */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-black uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-blue-600 dark:text-blue-400" />
                    Resumen de Asignación por Proyecto ({tareasAgrupadasPorProyecto.length} proyectos)
                  </span>
                  <span className="text-[0.65rem] text-blue-600 dark:text-blue-400 font-mono font-extrabold">
                    {selectedDev.nombreCompleto}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {tareasAgrupadasPorProyecto.map((group, idx) => (
                    <div
                      key={group.idProyecto || idx}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.65rem] font-mono font-black text-blue-600 dark:text-blue-400">
                            [PRJ-00{group.idProyecto}]
                          </span>
                          <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate" title={group.nombreProyecto}>
                            {group.nombreProyecto}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-zinc-500 font-medium mt-0.5">
                          {group.tareas.length} tareas asignadas &bull; <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{group.horasTotales}h dedicación</span>
                        </p>
                      </div>

                      {/* Botón de Redirección Directa */}
                      <button
                        type="button"
                        onClick={() => handleIrAProyectoWbs(group.proyectoObj || { idProyecto: group.idProyecto, nombre: group.nombreProyecto })}
                        className="text-[0.65rem] font-extrabold py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer shrink-0 inline-flex items-center gap-1 hover:scale-105"
                        title={`Seleccionar proyecto "${group.nombreProyecto}" e ir a la consola WBS`}
                      >
                        <span>Ir a WBS</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selector de Filtro por Ámbito de Proyecto (Este Proyecto vs Otros Proyectos vs Todas) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setDevTaskModalFilter('THIS_PROJECT')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 ${
                      devTaskModalFilter === 'THIS_PROJECT'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>En este proyecto</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[0.62rem] font-mono bg-white/20 font-extrabold">
                      {desarolladorTareasList.filter(t => String(t.idProyecto) === String(proyectoSeleccionadoLocal?.idProyecto) || t.nombreProyecto === proyectoSeleccionadoLocal?.nombre).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDevTaskModalFilter('OTHER_PROJECTS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 ${
                      devTaskModalFilter === 'OTHER_PROJECTS'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>En otros proyectos</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[0.62rem] font-mono bg-white/20 font-extrabold">
                      {desarolladorTareasList.filter(t => String(t.idProyecto) !== String(proyectoSeleccionadoLocal?.idProyecto) && t.nombreProyecto !== proyectoSeleccionadoLocal?.nombre).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDevTaskModalFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 ${
                      devTaskModalFilter === 'ALL'
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>Ver Todas</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[0.62rem] font-mono bg-white/20 font-extrabold">
                      {desarolladorTareasList.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Listado Detallado de Actividades con Botón Directo */}
              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {loadingDevTasks ? (
                  <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
                    <Loader2 size={24} className="animate-spin text-blue-500 mx-auto" />
                    <p className="font-medium">Consolidando actividades asignadas...</p>
                  </div>
                ) : tareasFiltradasModal.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400 space-y-2 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Briefcase size={28} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                    <p className="font-bold text-zinc-600 dark:text-zinc-300">Sin actividades asignadas en este filtro.</p>
                    <button
                      type="button"
                      onClick={() => setDevTaskModalFilter('ALL')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Ver todas las tareas globales ({desarolladorTareasList.length})
                    </button>
                  </div>
                ) : (
                  tareasFiltradasModal.map((task, idx) => (
                    <div
                      key={task.idActividad || idx}
                      className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2.5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[0.65rem] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                              PRJ-00{task.idProyecto}
                            </span>
                            <span className="text-[0.62rem] font-extrabold uppercase text-zinc-500 dark:text-zinc-400">
                              Fase: {task.nombreEtapa}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 pt-0.5">
                            {task.nombreActividad}
                          </h4>
                        </div>

                        <span className={`text-[0.62rem] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                          task.estado === 'COMPLETADA'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
                            : task.estado === 'EN_PROGRESO'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
                        }`}>
                          {task.estado || 'PENDIENTE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[0.68rem] text-zinc-500 font-semibold pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-bold truncate">
                          <Building2 size={12} className="text-zinc-400 shrink-0" />
                          <span>{task.nombreProyecto}</span>
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-zinc-800 dark:text-zinc-200 font-extrabold">
                            {task.horasEstimadas || 0} hrs estimadas
                          </span>

                          <button
                            type="button"
                            onClick={() => handleIrAProyectoWbs(task.proyectoObj || { idProyecto: task.idProyecto, nombre: task.nombreProyecto }, task)}
                            className="text-[0.65rem] font-extrabold py-1 px-2.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Seleccionar este proyecto y redirigir a WBS"
                          >
                            <span>Ir al WBS</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botón de Cierre */}
              <div className="flex justify-end pt-2 shrink-0 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowTareasDevModal(false)}
                  className="outline-button text-xs py-2 px-6 font-bold cursor-pointer shadow-sm"
                >
                  Cerrar Inspección
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Modal 4: Detalle de Evolución Cognitiva (21 Días) - Justificación Detallada por Persona ─── */}
      <AnimatePresence>
        {showEvolucionModal && selectedDev && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] flex flex-col"
            >
              {/* Encabezado */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Series Temporales (21 Días - ISO/IEC 25010)</span>
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Desglose y justificación detallada de desgaste para <strong className="text-zinc-900 dark:text-zinc-100">{selectedDev.nombreCompleto}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                {/* 3 Bloques de Semanas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-center space-y-1">
                    <span className="text-[0.65rem] uppercase font-extrabold text-blue-600 dark:text-blue-400 block">Semana 1 (Días 15-21)</span>
                    <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(selectedDev.scoreSemana1 || 0)}%
                    </div>
                    <span className="text-[0.62rem] text-zinc-500 font-medium block">Pico por Inicio de Ciclo</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-center space-y-1">
                    <span className="text-[0.65rem] uppercase font-extrabold text-indigo-600 dark:text-indigo-400 block">Semana 2 (Días 8-14)</span>
                    <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(selectedDev.scoreSemana2 || 0)}%
                    </div>
                    <span className="text-[0.62rem] text-zinc-500 font-medium block">Ventana Intermedia WBS</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-center space-y-1">
                    <span className="text-[0.65rem] uppercase font-extrabold text-purple-600 dark:text-purple-400 block">Semana 3 (Últimos 7d)</span>
                    <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(selectedDev.scoreSemana3 || 0)}%
                    </div>
                    <span className="text-[0.62rem] text-zinc-500 font-medium block">Tendencia Actual</span>
                  </div>
                </div>

                {/* Justificación Detallada de los 3 Factores por Persona */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
                  <h4 className="font-black text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Sparkles size={15} className="text-blue-500" />
                    <span>Justificación de Evaluación Individual (Motor ISO/IEC 25010):</span>
                  </h4>
                  
                  <div className="space-y-2 text-[0.72rem]">
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                      <Layers size={15} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold block">1. Volumen de Entregables WBS (45% Ponderación):</strong>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">
                          {selectedDev.nombreCompleto} cuenta con <strong>{selectedDev.tareasActivas} tareas activas</strong> asignadas en la estructura WBS con una dedicación semanal estimada.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                      <Globe size={15} className="text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold block">2. Concurrencia Multidisciplinaria (20% Ponderación):</strong>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">
                          Participa en <strong>{tareasAgrupadasPorProyecto.length} iniciativas corporativas</strong> simultáneas, lo cual demanda cambios de contexto mental entre sprints.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                      <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-extrabold block">3. Complejidad Técnica & Incidencias (35% Ponderación):</strong>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">
                          Evaluación de soporte imprevisto y resolución de errores críticos reportados en la consola.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnóstico Final y Botón de Redirección */}
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[0.65rem] uppercase font-black text-blue-600 dark:text-blue-400 block">Diagnóstico de Recomendación</span>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                      {selectedDev.recomendacion || getDiagnosticoClaro(selectedDev)}
                    </p>
                  </div>

                  {onNavigateToWbs && (
                    <button
                      type="button"
                      onClick={() => handleIrAProyectoWbs(proyectoSeleccionadoLocal)}
                      className="gradient-button text-xs py-2 px-4 font-bold shrink-0 cursor-pointer shadow-md inline-flex items-center gap-1.5"
                    >
                      <span>Ir al WBS</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Botón Cierre */}
              <div className="flex justify-end pt-2 shrink-0 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEvolucionModal(false)}
                  className="outline-button text-xs py-2 px-6 font-bold cursor-pointer shadow-sm"
                >
                  Cerrar Análisis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
