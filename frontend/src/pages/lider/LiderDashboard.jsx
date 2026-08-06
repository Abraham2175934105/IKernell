import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { SemaforoInteligente } from '../../components/dashboard/SemaforoInteligente';
import { Layers, Plus, Activity, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export const LiderDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [errores, setErrores] = useState([]);
  const [interrupciones, setInterrupciones] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      setLoadingProyectos(true);
      // const data = await api.get(`/lider/lideres/${user?.idTrabajador || 1}/proyectos`);
      await new Promise(r => setTimeout(r, 800)); // Simulate loading
      mockProyectos();
    } catch (err) {
      toast.error('Error al cargar proyectos.');
      mockProyectos();
    } finally {
      setLoadingProyectos(false);
    }
  };

  const mockProyectos = () => {
    const mockList = [
      { idProyecto: 1, nombre: 'Plataforma Core IKernell v2.0', estado: 'ACTIVO', fechaInicio: '2026-06-01', fechaFinEstimada: '2026-11-30' },
      { idProyecto: 2, nombre: 'Módulo Predictivo Brasil', estado: 'ACTIVO', fechaInicio: '2026-07-15', fechaFinEstimada: '2026-10-15' }
    ];
    setProyectos(mockList);
    seleccionarProyecto(mockList[0]);
  };

  const seleccionarProyecto = (proy) => {
    setProyectoSeleccionado(proy);
    const toastId = toast.loading(`Cargando métricas de ${proy.nombre}...`);
    
    setTimeout(() => {
      // Simulación de consumo de métricas en tiempo real para el Semáforo Predictivo
      if (proy.idProyecto === 1) {
        setErrores([
          { idError: 1, tipoError: 'NullPointerException', severidad: 'MEDIA' },
          { idError: 2, tipoError: 'Concurrency Lock Timeout', severidad: 'CRITICA' },
          { idError: 3, tipoError: 'Validation Failed', severidad: 'ALTA' }
        ]);
        setInterrupciones([
          { idInterrupcion: 1, tipoInterrupcion: 'Corte Eléctrico Datacenter', duracionMinutos: 480 }, // 8 Horas
          { idInterrupcion: 2, tipoInterrupcion: 'Caída Servidor PostgreSQL', duracionMinutos: 540 }   // 9 Horas -> Total 17h (Dispara Alerta Roja)
        ]);
      } else {
        setErrores([{ idError: 1, tipoError: 'Sintaxis CSS', severidad: 'BAJA' }]);
        setInterrupciones([{ idInterrupcion: 1, tipoInterrupcion: 'Mantenimiento Red', duracionMinutos: 120 }]); // 2h (Verde)
      }
      toast.success('Métricas actualizadas.', { id: toastId });
    }, 600);
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      
      {/* Header Líder */}
      <div className="glass-panel p-8 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full tracking-wider">
            ROL: LÍDER DE PROYECTOS
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-2">
            Panel de Control del <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">Líder</span>
          </h2>
          <p className="text-text-muted text-sm">
            Administración de Proyectos, Desglose Estructural (WBS) y Semáforo Predictivo (RF-14 a RF-19)
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {loadingProyectos ? (
             <div className="flex gap-3">
                <div className="w-32 h-10 bg-surface border border-white/5 rounded-full animate-pulse"></div>
                <div className="w-32 h-10 bg-surface border border-white/5 rounded-full animate-pulse"></div>
             </div>
          ) : (
            proyectos.map((p) => (
              <button
                key={p.idProyecto}
                onClick={() => seleccionarProyecto(p)}
                className={`text-sm font-medium px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 ${
                  proyectoSeleccionado?.idProyecto === p.idProyecto
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
                    : "bg-surface/50 border border-white/10 text-text-muted hover:text-white hover:border-white/30"
                }`}
              >
                <Briefcase size={16} /> {p.nombre}
              </button>
            ))
          )}
        </div>
      </div>

      {/* COMPONENTE INNOVACIÓN 1: SEMÁFORO INTELIGENTE DE RIESGOS */}
      {proyectoSeleccionado && (
        <div className="animate-fade-in">
          <SemaforoInteligente
            proyectoId={proyectoSeleccionado.idProyecto}
            proyectoNombre={proyectoSeleccionado.nombre}
            errores={errores}
            interrupciones={interrupciones}
          />
        </div>
      )}

      {/* Panel WBS y Gestión de Etapas (RF-15) */}
      <div className="glass-panel p-8 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg text-accent">
              <Layers size={24} />
            </div>
            <h3 className="text-2xl font-bold">Desglose WBS (Etapas)</h3>
          </div>
          <button className="outline-button whitespace-nowrap">
            <Plus size={18} /> Nueva Etapa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold">Etapa 1: Análisis & Diseño DB</h4>
              <span className="text-[0.65rem] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                COMPLETADA
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-4 flex-grow">
              Modelo relacional PostgreSQL e índices B-Tree para alta concurrencia.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-dim mt-auto border-t border-white/5 pt-3">
              <Activity size={14} /> 3 Actividades finalizadas
            </div>
          </div>

          <div className="glass-card border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold">Etapa 2: Desarrollo Backend</h4>
              <span className="text-[0.65rem] font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                EN CURSO
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-4 flex-grow">
              Servicios REST, Spring Security JWT stateless y ETL para alianza Brasil.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-dim mt-auto border-t border-white/5 pt-3">
              <Activity size={14} className="text-primary" /> 2 Actividades pendientes
            </div>
          </div>

          <div className="glass-card opacity-80">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold">Etapa 3: Integración React</h4>
              <span className="text-[0.65rem] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PENDIENTE
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-4 flex-grow">
              Single Page Application con Dashboard Predictivo en tiempo real.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-dim mt-auto border-t border-white/5 pt-3">
              <Activity size={14} /> Sin actividades asignadas
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
