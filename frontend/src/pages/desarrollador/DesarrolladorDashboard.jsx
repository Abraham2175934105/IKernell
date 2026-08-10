import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { CheckSquare, Bug, AlertTriangle, X, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export const DesarrolladorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInterrupcionModal, setShowInterrupcionModal] = useState(false);

  // Form (RF-22)
  const [errorForm, setErrorForm] = useState({
    idEtapa: '1',
    tipoError: 'Lógico / Sintaxis',
    severidad: 'MEDIA'
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
      await new Promise(r => setTimeout(r, 800));
      setActividades([
        { idActividad: 1, descripcion: 'Implementar autenticación JWT stateless en Spring Boot', estado: 'EN PROGRESO', etapa: { idEtapa: 1, nombreEtapa: 'Desarrollo Backend' } },
        { idActividad: 2, descripcion: 'Crear vistas responsive en React para el Módulo Público', estado: 'ASIGNADA', etapa: { idEtapa: 1, nombreEtapa: 'Desarrollo Frontend' } },
        { idActividad: 3, descripcion: 'Optimizar índices B-Tree en PostgreSQL para alta concurrencia', estado: 'FINALIZADA', etapa: { idEtapa: 2, nombreEtapa: 'Base de Datos' } }
      ]);
    } catch (err) {
      toast.error('Error al cargar actividades.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReportarError = useCallback(async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Registrando error en sistema...');
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success('Error registrado correctamente. El Semáforo Predictivo fue actualizado.', { id: toastId });
      setShowErrorModal(false);
    } catch (err) {
      toast.error('Error registrando incidencia: ' + err.message, { id: toastId });
    }
  }, [errorForm]);

  const handleReportarInterrupcion = useCallback(async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Registrando contingencia...');
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success('Interrupción registrada. Horas perdidas incorporadas al algoritmo.', { id: toastId });
      setShowInterrupcionModal(false);
    } catch (err) {
      toast.error('Error registrando interrupción: ' + err.message, { id: toastId });
    }
  }, [interrupcionForm]);

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col gap-8">
      
      {/* Header Usuario */}
      <div className="glass-panel p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">
            Rol: {user?.rol || 'DESARROLLADOR'}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-2 text-zinc-900 dark:text-white tracking-tight">
            Bienvenido, {user?.nombre || 'Desarrollador'} {user?.apellido || ''}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base font-medium">
            Tablero de actividades asignadas y registro de métricas para el Semáforo Inteligente (RF-21 a RF-24)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button onClick={() => setShowErrorModal(true)} className="gradient-button whitespace-nowrap text-sm py-2.5 px-5 font-bold shadow-lg">
            <Bug size={18} /> Reportar Error
          </button>
          <button onClick={() => setShowInterrupcionModal(true)} className="outline-button whitespace-nowrap text-sm py-2.5 px-5 font-bold">
            <AlertTriangle size={18} /> Reportar Contingencia
          </button>
        </div>
      </div>

      {/* Tablero de Actividades */}
      <div className="glass-panel p-6 md:p-10 border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white shadow-sm">
            <CheckSquare size={24} />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Mis Actividades Asignadas</h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-24 h-5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="w-20 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                </div>
                <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : actividades.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 size={48} className="mx-auto text-zinc-400 mb-4 opacity-50" />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">No tienes actividades pendientes actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {actividades.map((act) => (
              <div key={act.idActividad} className="glass-card flex flex-col justify-between p-6 md:p-8 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1 border border-zinc-200 dark:border-zinc-700">
                      <Activity size={12} /> {act.etapa?.nombreEtapa || 'General'}
                    </span>
                    <span className={`text-[0.65rem] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                      act.estado === 'FINALIZADA' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 
                      act.estado === 'EN PROGRESO' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 
                      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {act.estado}
                    </span>
                  </div>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed mb-6">
                    {act.descripcion}
                  </p>
                </div>
                <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <button className="text-xs text-zinc-900 dark:text-white font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
                    Ver detalles <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Reportar Error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-8 rounded-3xl shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <Bug size={22} /> Reportar Error
              </h3>
              <button onClick={() => setShowErrorModal(false)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportarError} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Fase Afectada (ID Etapa)</label>
                <input type="number" required value={errorForm.idEtapa} onChange={(e) => setErrorForm({ ...errorForm, idEtapa: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Tipo de Error</label>
                <input type="text" required value={errorForm.tipoError} onChange={(e) => setErrorForm({ ...errorForm, tipoError: e.target.value })} placeholder="Ej: Sintaxis, Lógico..." className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Severidad</label>
                <select value={errorForm.severidad} onChange={(e) => setErrorForm({ ...errorForm, severidad: e.target.value })} className="input-field">
                  <option value="BAJA">BAJA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="CRITICA">CRÍTICA (Dispara Alerta Roja)</option>
                </select>
              </div>
              <button type="submit" className="gradient-button w-full py-3.5 mt-4 font-bold text-sm shadow-lg">
                Registrar Incidencia
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Interrupción */}
      {showInterrupcionModal && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-8 rounded-3xl shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <AlertTriangle size={22} /> Registrar Contingencia
              </h3>
              <button onClick={() => setShowInterrupcionModal(false)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportarInterrupcion} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Fase Afectada (ID Etapa)</label>
                <input type="number" required value={interrupcionForm.idEtapa} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, idEtapa: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Tipo de Contingencia</label>
                <input type="text" required value={interrupcionForm.tipoInterrupcion} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, tipoInterrupcion: e.target.value })} placeholder="Ej: Corte eléctrico..." className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Duración Perdida (Minutos)</label>
                <input type="number" required min="1" value={interrupcionForm.duracionMinutos} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, duracionMinutos: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Observaciones</label>
                <textarea rows={3} value={interrupcionForm.comentarios} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, comentarios: e.target.value })} className="input-field resize-none" />
              </div>
              <button type="submit" className="gradient-button w-full py-3.5 mt-4 font-bold text-sm shadow-lg">
                Registrar Contingencia
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};


