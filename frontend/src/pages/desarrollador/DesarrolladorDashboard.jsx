import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { CheckSquare, Bug, AlertTriangle, Clock, X, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
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

  const cargarActividades = async () => {
    try {
      setLoading(true);
      // const data = await api.get('/desarrollador/mis-actividades');
      // setActividades(data || []);
      
      // Simulate network delay for UX
      await new Promise(r => setTimeout(r, 1000));
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
  };

  const handleReportarError = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Registrando error en sistema...');
    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate API delay
      // await api.post('/desarrollador/errores', { ... });
      toast.success('Error registrado correctamente. El Semáforo Predictivo fue actualizado.', { id: toastId });
      setShowErrorModal(false);
    } catch (err) {
      toast.error('Error registrando incidencia: ' + err.message, { id: toastId });
    }
  };

  const handleReportarInterrupcion = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Registrando contingencia...');
    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate API delay
      // await api.post('/desarrollador/interrupciones', { ... });
      toast.success('Interrupción registrada. Horas perdidas incorporadas al algoritmo.', { id: toastId });
      setShowInterrupcionModal(false);
    } catch (err) {
      toast.error('Error registrando interrupción: ' + err.message, { id: toastId });
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      
      {/* Header Usuario */}
      <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full tracking-wider">
            ROL: {user?.rol || 'DESARROLLADOR'}
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-2">
            Bienvenido, <span className="bg-gradient-to-r from-blue-400 to-accent bg-clip-text text-transparent">{user?.nombre || 'Desarrollador'} {user?.apellido || ''}</span>
          </h2>
          <p className="text-text-muted text-sm">
            Tablero de actividades asignadas y registro de métricas para el Semáforo Inteligente (RF-21 a RF-24)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button onClick={() => setShowErrorModal(true)} className="bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/30 flex items-center justify-center gap-2">
            <Bug size={18} /> Reportar Error
          </button>
          <button onClick={() => setShowInterrupcionModal(true)} className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2">
            <AlertTriangle size={18} /> Reportar Contingencia
          </button>
        </div>
      </div>

      {/* Tablero de Actividades */}
      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <div className="p-2 bg-primary/20 rounded-lg text-primary">
            <CheckSquare size={24} />
          </div>
          <h3 className="text-2xl font-bold">Mis Actividades Asignadas</h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface/50 border border-white/5 p-6 rounded-xl animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-24 h-5 bg-white/10 rounded"></div>
                  <div className="w-20 h-5 bg-white/10 rounded-full"></div>
                </div>
                <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : actividades.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
            <p className="text-text-muted text-lg">No tienes actividades pendientes actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actividades.map((act) => (
              <div key={act.idActividad} className="glass-card flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded text-text-muted flex items-center gap-1">
                    <Activity size={12} /> {act.etapa?.nombreEtapa || 'General'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    act.estado === 'FINALIZADA' ? 'bg-emerald-500/20 text-emerald-400' : 
                    act.estado === 'EN PROGRESO' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {act.estado}
                  </span>
                </div>
                <p className="text-text-main leading-relaxed mb-6 flex-grow group-hover:text-white transition-colors">
                  {act.descripcion}
                </p>
                <div className="mt-auto border-t border-white/5 pt-4">
                  <button className="text-sm text-primary font-medium flex items-center gap-1 hover:text-white transition-colors">
                    Ver detalles <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Reportar Error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-white/10 w-full max-w-md p-8 rounded-2xl shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-rose-500">
                <Bug size={24} /> Reportar Error
              </h3>
              <button onClick={() => setShowErrorModal(false)} className="text-text-muted hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportarError} className="space-y-5">
              <div>
                <label className="block text-sm text-text-muted mb-2">Fase Afectada (ID Etapa)</label>
                <input type="number" required value={errorForm.idEtapa} onChange={(e) => setErrorForm({ ...errorForm, idEtapa: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Tipo de Error</label>
                <input type="text" required value={errorForm.tipoError} onChange={(e) => setErrorForm({ ...errorForm, tipoError: e.target.value })} placeholder="Ej: Sintaxis, Lógico..." className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Severidad</label>
                <select value={errorForm.severidad} onChange={(e) => setErrorForm({ ...errorForm, severidad: e.target.value })} className="input-field bg-surface">
                  <option value="BAJA">BAJA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="CRITICA">CRÍTICA (Dispara Alerta Roja)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-rose-500/30 transition-all mt-4">
                Registrar Incidencia
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Interrupción */}
      {showInterrupcionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-white/10 w-full max-w-md p-8 rounded-2xl shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-amber-500">
                <AlertTriangle size={24} /> Registrar Contingencia
              </h3>
              <button onClick={() => setShowInterrupcionModal(false)} className="text-text-muted hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportarInterrupcion} className="space-y-5">
              <div>
                <label className="block text-sm text-text-muted mb-2">Fase Afectada (ID Etapa)</label>
                <input type="number" required value={interrupcionForm.idEtapa} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, idEtapa: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Tipo de Contingencia</label>
                <input type="text" required value={interrupcionForm.tipoInterrupcion} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, tipoInterrupcion: e.target.value })} placeholder="Ej: Corte eléctrico..." className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Duración Perdida (Minutos)</label>
                <input type="number" required min="1" value={interrupcionForm.duracionMinutos} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, duracionMinutos: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Observaciones</label>
                <textarea rows={3} value={interrupcionForm.comentarios} onChange={(e) => setInterrupcionForm({ ...interrupcionForm, comentarios: e.target.value })} className="input-field resize-none" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all mt-4">
                Registrar Contingencia
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
