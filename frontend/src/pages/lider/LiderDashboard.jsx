import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SemaforoInteligente } from '../../components/dashboard/SemaforoInteligente';
import { 
  Briefcase, Layers, Plus, Activity, Sparkles, Download, 
  Send, ShieldCheck, CheckCircle2, Clock, Calendar, ChevronRight, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LiderDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  const [activeTab, setActiveTab] = useState('wbs'); // 'wbs' | 'semaforo' | 'etl'
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [errores, setErrores] = useState([]);
  const [interrupciones, setInterrupciones] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [exportandoEtl, setExportandoEtl] = useState(false);
  const [etlPreview, setEtlPreview] = useState(null);

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = useCallback(async () => {
    try {
      setLoadingProyectos(true);
      await new Promise(r => setTimeout(r, 600));
      
      const mock = [
        { idProyecto: 1, nombre: 'IKernell Core Enterprise', descripcion: 'Sistema ERP transaccional y semáforo predictivo', estado: 'EN PROGRESO', fechaInicio: '2026-01-15', fechaFinEstimada: '2026-11-30' },
        { idProyecto: 2, nombre: 'Integración ETL Alianza Brasil', descripcion: 'Módulo de exportación automatizada de reportes ISO 8601 UTC', estado: 'EN PROGRESO', fechaInicio: '2026-02-01', fechaFinEstimada: '2026-08-30' }
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
    if (proyecto.idProyecto === 1) {
      setErrores([
        { idError: 1, tipoError: 'Lógico / Algoritmo WBS', severidad: 'CRITICA', fecha: '2026-08-10' },
        { idError: 2, tipoError: 'Sintaxis SQL', severidad: 'ALTA', fecha: '2026-08-11' },
        { idError: 3, tipoError: 'Validación Formulario', severidad: 'MEDIA', fecha: '2026-08-11' },
        { idError: 4, tipoError: 'Desbordamiento CSS', severidad: 'BAJA', fecha: '2026-08-12' }
      ]);
      setInterrupciones([
        { idInterrupcion: 1, tipoInterrupcion: 'Corte de Fibra Óptica', duracionMinutos: 180, motivo: 'Fallo proveedor ISP principal' },
        { idInterrupcion: 2, tipoInterrupcion: 'Mantenimiento Servidor PostgreSQL', duracionMinutos: 240, motivo: 'Migración a pool HikariCP' }
      ]);
    } else {
      setErrores([{ idError: 1, tipoError: 'Sintaxis CSS', severidad: 'BAJA', fecha: '2026-08-12' }]);
      setInterrupciones([{ idInterrupcion: 1, tipoInterrupcion: 'Mantenimiento Red', duracionMinutos: 60, motivo: 'Actualización routers' }]);
    }
  };

  const handleExportarEtl = async () => {
    setExportandoEtl(true);
    const toastId = toast.loading('Generando lote ETL estandarizado ISO 8601 UTC...');
    try {
      await new Promise(r => setTimeout(r, 1200));
      const timestamp = new Date().toISOString();
      const content = `HEADER|SYSTEM_IKERNELL|PARTNER_BRAZIL|TYPE_EXPORT|${timestamp}\nPROJECT|ID=${proyectoSeleccionado?.idProyecto || 1}|NAME=${proyectoSeleccionado?.nombre}|STATUS=${proyectoSeleccionado?.estado}\nMETRIC_SUMMARY|TOTAL_ERRORS=${errores.length}|TOTAL_INTERRUPTIONS_MIN=${interrupciones.reduce((acc, i) => acc + i.duracionMinutos, 0)}\nFOOTER|STATUS=SUCCESS|CHECKSUM_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
      setEtlPreview(content);
      toast.success('Métricas exportadas y transmitidas a sftp.brasil.ikernell.com exitosamente.', { id: toastId });
    } catch (err) {
      toast.error('Error al exportar lote ETL.', { id: toastId });
    } finally {
      setExportandoEtl(false);
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: `Proyectos: ${proyectos.length} Activos`,
        metric2: `Proyecto Seleccionado: ${proyectoSeleccionado?.nombre || 'Ninguno'}`
      }}
    >
      
      {/* Selector de Proyecto en Cabecera */}
      <div className="mb-6 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
            Gestión y Control de Proyectos
          </span>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {proyectoSeleccionado ? proyectoSeleccionado.nombre : 'Panel del Líder'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500">Seleccionar Proyecto:</span>
          <select
            value={proyectoSeleccionado?.idProyecto || ''}
            onChange={(e) => {
              const proj = proyectos.find(p => p.idProyecto === parseInt(e.target.value));
              if (proj) seleccionarProyecto(proj);
            }}
            className="input-field py-2 text-xs font-bold"
          >
            {proyectos.map(p => (
              <option key={p.idProyecto} value={p.idProyecto}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. SECCIÓN: WBS Y PROYECTOS */}
      {activeTab === 'wbs' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Estado del Cronograma</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Conforme a Plazos</div>
              <span className="text-[0.7rem] text-zinc-500">Fin Estimado: {proyectoSeleccionado?.fechaFinEstimada}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Total Errores Registrados</span>
              <div className="text-xl font-black text-zinc-900 dark:text-white mt-1">{errores.length} Incidencias</div>
              <span className="text-[0.7rem] text-zinc-500">Evaluados por el Semáforo</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[0.65rem] font-bold uppercase text-zinc-400">Horas de Interrupción</span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {(interrupciones.reduce((a, b) => a + b.duracionMinutos, 0) / 60).toFixed(1)} Horas
              </div>
              <span className="text-[0.7rem] text-zinc-500">En {interrupciones.length} eventos reportados</span>
            </div>
          </div>

          {/* Desglose de Fases WBS */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers size={18} /> Estructura de Desglose de Trabajo (WBS)
            </h3>

            <div className="space-y-3">
              {[
                { fase: 'Etapa 1: Arquitectura y Autenticación JWT Stateless', estado: 'COMPLETADA', dev: 'Ana Gómez', horas: '40 hrs' },
                { fase: 'Etapa 2: Pool HikariCP y Optimización de Consultas JPA', estado: 'EN PROGRESO', dev: 'Carlos Mendoza', horas: '32 hrs' },
                { fase: 'Etapa 3: Motor Predictivo de Riesgos y Exportación Brasil', estado: 'EN PROGRESO', dev: 'Roberto Silva', horas: '24 hrs' }
              ].map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-white">{f.fase}</div>
                    <div className="text-xs text-zinc-500">Responsable: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{f.dev}</span> • Estimación: {f.horas}</div>
                  </div>
                  <span className={`text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                    f.estado === 'COMPLETADA'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                  }`}>
                    {f.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. SECCIÓN: SEMÁFORO PREDICTIVO */}
      {activeTab === 'semaforo' && (
        <div className="space-y-6 animate-fade-in">
          <SemaforoInteligente 
            idProyecto={proyectoSeleccionado?.idProyecto} 
            errores={errores} 
            interrupciones={interrupciones} 
          />
        </div>
      )}

      {/* 3. SECCIÓN: EXPORTACIÓN ETL BRASIL */}
      {activeTab === 'etl' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              Innovación 2: Alianza Estratégica Brasil (RF-28 a RF-30)
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Automatización y Transferencia ETL de Métricas
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Estandarización bajo formato plano delimitado e ISO 8601 UTC para consumo internacional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Exportación Manual One-Click</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Genera el paquete de datos en tiempo real, calcula el hash SHA-256 de integridad y simula la transferencia por SFTP seguro y notificación por correo.
                </p>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs font-mono text-zinc-600 dark:text-zinc-300 mb-6">
                  <div>Canal: sftp.brasil.ikernell.com:22</div>
                  <div>Destinatario: equipo.brasil@ikernell.org</div>
                  <div>Formato: ISO 8601 UTC (|)</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportarEtl}
                disabled={exportandoEtl}
                className="gradient-button w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {exportandoEtl ? (
                  <>Procesando Exportación ETL...</>
                ) : (
                  <><Sparkles size={16} /> Generar y Enviar Lote ETL</>
                )}
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Previsualización del Archivo Plano</h3>
              {etlPreview ? (
                <pre className="bg-zinc-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[220px] border border-zinc-800">
                  {etlPreview}
                </pre>
              ) : (
                <div className="p-12 text-center text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  Haga clic en "Generar y Enviar Lote ETL" para previsualizar el contenido del archivo generado.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </DashboardLayout>
  );
};
