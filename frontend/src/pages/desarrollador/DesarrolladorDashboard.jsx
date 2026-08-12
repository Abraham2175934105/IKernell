import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  CheckSquare, Bug, AlertTriangle, X, CheckCircle2, 
  ChevronRight, Clock, Plus, Activity, Layers, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DesarrolladorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  const [activeTab, setActiveTab] = useState('actividades'); // 'actividades' | 'reportar'
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / Forms
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInterrupcionModal, setShowInterrupcionModal] = useState(false);

  // Form (RF-22)
  const [errorForm, setErrorForm] = useState({
    idEtapa: '1',
    tipoError: 'Lógico / Sintaxis',
    severidad: 'MEDIA',
    descripcion: ''
  });

  // Form (RF-23, RF-24)
  const [interrupcionForm, setInterrupcionForm] = useState({
    idEtapa: '1',
    tipoInterrupcion: 'Corte Eléctrico / Caída de Servidor BD',
    duracionMinutos: 45,
    comentarios: ''
  });

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setActividades([
        { idActividad: 1, descripcion: 'Implementar autenticación JWT stateless en Spring Boot', estado: 'EN PROGRESO', etapa: 'Desarrollo Backend' },
        { idActividad: 2, descripcion: 'Crear vistas responsive en React para el Módulo Público', estado: 'ASIGNADA', etapa: 'Desarrollo Frontend' },
        { idActividad: 3, descripcion: 'Optimizar índices B-Tree en PostgreSQL para alta concurrencia', estado: 'FINALIZADA', etapa: 'Base de Datos' }
      ]);
    } catch (err) {
      toast.error('Error al cargar actividades.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCambiarEstado = (id, nuevoEstado) => {
    setActividades(prev => prev.map(a => a.idActividad === id ? { ...a, estado: nuevoEstado } : a));
    toast.success(`Actividad actualizada a ${nuevoEstado}.`);
  };

  const handleReportarError = (e) => {
    e.preventDefault();
    toast.success('Error registrado correctamente. El Semáforo Predictivo fue actualizado.');
    setShowErrorModal(false);
    setErrorForm({ idEtapa: '1', tipoError: 'Lógico / Sintaxis', severidad: 'MEDIA', descripcion: '' });
  };

  const handleReportarInterrupcion = (e) => {
    e.preventDefault();
    toast.success(`Contingencia de ${interrupcionForm.duracionMinutos} minutos registrada correctamente.`);
    setShowInterrupcionModal(false);
    setInterrupcionForm({ idEtapa: '1', tipoInterrupcion: 'Corte Eléctrico / Caída de Servidor BD', duracionMinutos: 45, comentarios: '' });
  };

  const actividadesEnProgreso = actividades.filter(a => a.estado === 'EN PROGRESO').length;
  const actividadesFinalizadas = actividades.filter(a => a.estado === 'FINALIZADA').length;

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: `Tareas: ${actividades.length} Asignadas`,
        metric2: `${actividadesEnProgreso} En Progreso • ${actividadesFinalizadas} Finalizadas`
      }}
    >
      
      {/* 1. SECCIÓN: MIS ACTIVIDADES */}
      {activeTab === 'actividades' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header de la Vista */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
                Operaciones del Desarrollador (RF-19 a RF-21)
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Tablero Personal de Actividades
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Seguimiento de tareas asignadas por etapa WBS y control de avance
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowErrorModal(true)}
                className="outline-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Bug size={16} /> Reportar Error
              </button>
              <button
                type="button"
                onClick={() => setShowInterrupcionModal(true)}
                className="gradient-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <AlertTriangle size={16} /> Registrar Contingencia
              </button>
            </div>
          </div>

          {/* Grid de Actividades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actividades.map(act => (
              <div 
                key={act.idActividad}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-wider">
                      {act.etapa}
                    </span>
                    <span className={`text-[0.65rem] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      act.estado === 'FINALIZADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
                      act.estado === 'EN PROGRESO' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                      'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                    }`}>
                      {act.estado}
                    </span>
                  </div>

                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm leading-snug mb-4">
                    {act.descripcion}
                  </h3>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <label className="text-[0.65rem] font-bold text-zinc-400 block mb-1.5">Cambiar Estado:</label>
                  <select
                    value={act.estado}
                    onChange={(e) => handleCambiarEstado(act.idActividad, e.target.value)}
                    className="input-field py-1.5 text-xs font-bold uppercase"
                  >
                    <option value="ASIGNADA">Asignada</option>
                    <option value="EN PROGRESO">En Progreso</option>
                    <option value="FINALIZADA">Finalizada</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 2. SECCIÓN: REPORTES DE INCIDENCIAS */}
      {activeTab === 'reportar' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              Control de Calidad y Rendimiento (RF-22 a RF-24)
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Módulo de Reportes de Incidencias e Interrupciones
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Alimente el motor predictivo de riesgos reportando los hallazgos técnicos y las contingencias operacionales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tarjeta Reportar Error */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white mb-4">
                  <Bug size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Reportar Error Técnico</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Registre cualquier fallo de lógica, sintaxis, concurrencia o validación. Clasifique la severidad (Baja, Media, Alta, Crítica) para recalibrar el Semáforo de Riesgos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowErrorModal(true)}
                className="outline-button w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Abrir Formulario de Errores
              </button>
            </div>

            {/* Tarjeta Reportar Contingencia */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Registrar Interrupción / Tiempos Muertos</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Notifique fallas de suministro eléctrico, caídas de servidores, problemas de ISP o indisponibilidad de dependencias indicando los minutos de inactividad.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInterrupcionModal(true)}
                className="gradient-button w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Plus size={16} /> Abrir Formulario de Contingencias
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Modal Reportar Error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Bug size={20} /> Reportar Error Técnico (RF-22)
              </h3>
              <button onClick={() => setShowErrorModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportarError} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Tipo de Error</label>
                <select
                  value={errorForm.tipoError}
                  onChange={(e) => setErrorForm({ ...errorForm, tipoError: e.target.value })}
                  className="input-field py-2 font-bold"
                >
                  <option value="Lógico / Sintaxis">Lógico / Sintaxis</option>
                  <option value="Validación de Formulario">Validación de Formulario</option>
                  <option value="Concurrencia / Pool HikariCP">Concurrencia / Pool HikariCP</option>
                  <option value="Integración REST / CORS">Integración REST / CORS</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Severidad del Error</label>
                <select
                  value={errorForm.severidad}
                  onChange={(e) => setErrorForm({ ...errorForm, severidad: e.target.value })}
                  className="input-field py-2 font-bold uppercase"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica (Impacto en Semáforo)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Descripción del Hallazgo</label>
                <textarea
                  rows={3}
                  value={errorForm.descripcion}
                  onChange={(e) => setErrorForm({ ...errorForm, descripcion: e.target.value })}
                  placeholder="Detalle el comportamiento anómalo detectado..."
                  className="input-field py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="outline-button text-xs py-2 px-4 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  Registrar Error
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reportar Interrupción */}
      {showInterrupcionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={20} /> Registrar Interrupción Operativa (RF-23, RF-24)
              </h3>
              <button onClick={() => setShowInterrupcionModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportarInterrupcion} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Tipo de Contingencia</label>
                <select
                  value={interrupcionForm.tipoInterrupcion}
                  onChange={(e) => setInterrupcionForm({ ...interrupcionForm, tipoInterrupcion: e.target.value })}
                  className="input-field py-2 font-bold"
                >
                  <option value="Corte Eléctrico / Caída de Servidor BD">Corte Eléctrico / Caída de Servidor BD</option>
                  <option value="Corte de Fibra Óptica / Red ISP">Corte de Fibra Óptica / Red ISP</option>
                  <option value="Mantenimiento de Infraestructura">Mantenimiento de Infraestructura</option>
                  <option value="Indisponibilidad de Dependencia Externa">Indisponibilidad de Dependencia Externa</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Duración en Minutos</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={interrupcionForm.duracionMinutos}
                  onChange={(e) => setInterrupcionForm({ ...interrupcionForm, duracionMinutos: parseInt(e.target.value) || 0 })}
                  className="input-field py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Justificación Técnica</label>
                <textarea
                  rows={3}
                  value={interrupcionForm.comentarios}
                  onChange={(e) => setInterrupcionForm({ ...interrupcionForm, comentarios: e.target.value })}
                  placeholder="Explique el motivo y acciones de mitigación tomadas..."
                  className="input-field py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowInterrupcionModal(false)}
                  className="outline-button text-xs py-2 px-4 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  Registrar Contingencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};
