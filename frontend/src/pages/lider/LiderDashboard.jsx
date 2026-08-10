import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { SemaforoInteligente } from '../../components/dashboard/SemaforoInteligente';
import { Briefcase, Layers, Plus, Activity } from 'lucide-react';
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

  const cargarProyectos = useCallback(async () => {
    try {
      setLoadingProyectos(true);
      await new Promise(r => setTimeout(r, 800));
      
      const mock = [
        { idProyecto: 1, nombre: 'IKernell Core Enterprise', descripcion: 'Sistema ERP y semáforo predictivo' },
        { idProyecto: 2, nombre: 'Integración ETL Alianza Brasil', descripcion: 'Módulo de exportación automatizada de reportes' }
      ];
      setProyectos(mock);
      if (mock.length > 0) {
        seleccionarProyecto(mock[0]);
      }
    } catch (err) {
      toast.error('Error cargando proyectos.');
    } finally {
      setLoadingProyectos(false);
    }
  }, []);

  const seleccionarProyecto = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    const toastId = toast.loading(`Cargando métricas de ${proyecto.nombre}...`);
    setTimeout(() => {
      if (proyecto.idProyecto === 1) {
        setErrores([
          { idError: 1, tipoError: 'Lógico / Algoritmo WBS', severidad: 'CRITICA' },
          { idError: 2, tipoError: 'Sintaxis SQL', severidad: 'ALTA' },
          { idError: 3, tipoError: 'Validación Formulario', severidad: 'MEDIA' },
          { idError: 4, tipoError: 'Desbordamiento CSS', severidad: 'BAJA' }
        ]);
        setInterrupciones([
          { idInterrupcion: 1, tipoInterrupcion: 'Corte de Fibra Óptica', duracionMinutos: 180 },
          { idInterrupcion: 2, tipoInterrupcion: 'Mantenimiento Servidor PostgreSQL', duracionMinutos: 240 }
        ]);
      } else {
        setErrores([{ idError: 1, tipoError: 'Sintaxis CSS', severidad: 'BAJA' }]);
        setInterrupciones([{ idInterrupcion: 1, tipoInterrupcion: 'Mantenimiento Red', duracionMinutos: 120 }]);
      }
      toast.success('Métricas actualizadas.', { id: toastId });
    }, 600);
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col gap-8">
      
      {/* Header Líder */}
      <div className="glass-panel p-6 md:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">
            Rol: Líder de Proyectos
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-2 text-zinc-900 dark:text-white tracking-tight">
            Panel de Control
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base font-medium">
            Administración de Proyectos, Desglose Estructural (WBS) y Semáforo Predictivo
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {loadingProyectos ? (
             <div className="flex gap-3">
                <div className="w-32 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
                <div className="w-32 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
             </div>
          ) : (
            proyectos.map((p) => (
              <button
                key={p.idProyecto}
                onClick={() => seleccionarProyecto(p)}
                className={`text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 ${
                  proyectoSeleccionado?.idProyecto === p.idProyecto
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Briefcase size={16} /> {p.nombre}
              </button>
            ))
          )}
        </div>
      </div>

      {/* SEMÁFORO INTELIGENTE DE RIESGOS */}
      {proyectoSeleccionado && (
        <div className="animate-fade-in w-full">
          <SemaforoInteligente
            proyectoId={proyectoSeleccionado.idProyecto}
            proyectoNombre={proyectoSeleccionado.nombre}
            errores={errores}
            interrupciones={interrupciones}
          />
        </div>
      )}

      {/* Panel WBS y Gestión de Etapas */}
      <div className="glass-panel p-6 md:p-10 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white shadow-sm">
              <Layers size={24} />
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Desglose WBS</h3>
          </div>
          <button className="gradient-button whitespace-nowrap text-sm py-2.5 px-5 font-bold shadow-lg">
            <Plus size={18} /> Nueva Etapa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="glass-card flex flex-col p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">1. Análisis & Diseño</h4>
              <span className="text-[0.65rem] font-bold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 uppercase tracking-wider">
                Completada
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6 flex-grow font-normal">
              Modelo relacional PostgreSQL e índices B-Tree para alta concurrencia.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-4 font-semibold">
              <Activity size={14} className="text-zinc-900 dark:text-white" /> 3 Actividades finalizadas
            </div>
          </div>

          <div className="glass-card flex flex-col p-6 border-zinc-900 dark:border-zinc-100 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-900 dark:bg-white"></div>
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">2. Backend</h4>
              <span className="text-[0.65rem] font-bold px-2 py-1 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 uppercase tracking-wider">
                En Curso
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6 flex-grow font-normal">
              Servicios REST, Spring Security JWT stateless y ETL para alianza Brasil.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-900 dark:text-white mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-4 font-bold">
              <Activity size={14} /> 2 Actividades pendientes
            </div>
          </div>

          <div className="glass-card flex flex-col p-6 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">3. Frontend</h4>
              <span className="text-[0.65rem] font-bold px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Pendiente
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6 flex-grow font-normal">
              Single Page Application con Dashboard Predictivo en tiempo real.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-4 font-semibold">
              <Activity size={14} /> Sin actividades asignadas
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
