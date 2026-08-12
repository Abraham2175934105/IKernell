import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, FileText, Send, RefreshCw, Loader2, Download, 
  CheckCircle2, AlertTriangle, ShieldCheck, Server, Mail, Terminal, Layers
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const EtlBrasil = ({ proyecto, onExportSuccess }) => {
  const api = useApi();
  
  // Estados locales
  const [exportando, setExportando] = useState(false);
  const [reporteEtl, setReporteEtl] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Manejadores de eventos (Handlers)
  // Genera el lote de datos plano bajo la norma ISO 8601 UTC en el backend
  const handleExportar = async () => {
    if (!proyecto?.idProyecto) {
      toast.error('Seleccione un proyecto activo para exportar el lote ETL.');
      return;
    }

    setExportando(true);
    const toastId = toast.loading(`Generando lote ETL ISO 8601 UTC para "${proyecto.nombre || 'Proyecto'}"...`);

    try {
      const response = await api.post(`/lider/proyectos/${proyecto.idProyecto}/etl-export-brasil`);
      setReporteEtl(response);
      toast.success(`¡Lote ETL exportado con éxito (${response?.totalRegistrosExportados ?? 0} registros) y transmitido a Brasil!`, { id: toastId });
      if (onExportSuccess) {
        onExportSuccess(response);
      }
    } catch (err) {
      console.error('Error al exportar lote ETL hacia Brasil:', err);
      toast.error(err?.message || 'Error al ejecutar el proceso ETL en el backend.', { id: toastId });
    } finally {
      setExportando(false);
    }
  };

  // Descarga el archivo plano generado en la computadora local
  const handleDescargarArchivo = () => {
    if (!reporteEtl?.vistaPreviaFormatoISO) {
      toast.error('No hay contenido ETL disponible para descargar.');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([reporteEtl.vistaPreviaFormatoISO], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = reporteEtl.nombreArchivo || `METRICAS_BRASIL_PROY_${proyecto?.idProyecto || 1}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Archivo ${element.download} descargado.`);
  };

  // Copia el texto delimitado al portapapeles para inspección rápida
  const handleCopiarContenido = () => {
    if (!reporteEtl?.vistaPreviaFormatoISO) return;
    navigator.clipboard.writeText(reporteEtl.vistaPreviaFormatoISO);
    setCopiado(true);
    toast.success('Contenido ISO 8601 copiado al portapapeles.');
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      
      {/* Banner Principal de la Innovación */}
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Innovación 2 • Alianza Estratégica Brasil (RF-28 a RF-30)
            </span>
            <span className="text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ISO 8601 UTC
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Automatización y Transferencia ETL de Métricas
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1 max-w-2xl">
            Extracción, transformación de datos operacionales y carga estandarizada bajo formato plano delimitado con simulación de entrega SFTP y Email cifrado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportar}
          disabled={exportando || !proyecto?.idProyecto}
          title="Genera el archivo plano delimitado bajo la norma internacional ISO 8601 UTC y simula la transferencia por SFTP a Brasil"
          className="gradient-button whitespace-nowrap text-xs py-3 px-5 font-bold inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 flex-shrink-0"
        >
          {exportando ? (
            <><Loader2 size={16} className="animate-spin" /> Procesando Lote ETL...</>
          ) : (
            <><Sparkles size={16} /> Exportar Métricas ISO 8601</>
          )}
        </button>
      </div>

      {/* Grid de Configuración & Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tarjeta de Especificación y Parámetros del Lote */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-extrabold text-sm mb-3">
              <Server size={16} /> Parámetros del Servidor y Destino
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex justify-between items-center">
                <span className="text-zinc-500 font-semibold">Proyecto Seleccionado:</span>
                <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
                  {proyecto?.nombre || 'Ninguno'} (ID: {proyecto?.idProyecto ?? 'N/A'})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex justify-between items-center">
                <span className="text-zinc-500 font-semibold">Servidor SFTP:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-[0.7rem]">
                  sftp.brasil.ikernell.com:22
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex justify-between items-center">
                <span className="text-zinc-500 font-semibold">Canal Cifrado Email:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-[0.7rem]">
                  equipo.brasil@ikernell.org
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex justify-between items-center">
                <span className="text-zinc-500 font-semibold">Estandarización:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ISO 8601 UTC (YYYY-MM-DDTHH:mm:ssZ)
                </span>
              </div>
            </div>
          </div>

          {/* Resumen del Último Lote Exportado */}
          {reporteEtl ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                <CheckCircle2 size={16} /> Lote Generado y Transmitido
              </div>
              <div className="text-[0.7rem] text-zinc-600 dark:text-zinc-400 space-y-1 font-mono">
                <div>Archivo: <strong className="text-zinc-900 dark:text-zinc-100">{reporteEtl.nombreArchivo}</strong></div>
                <div>Total Registros: <strong className="text-emerald-600 dark:text-emerald-400">{reporteEtl.totalRegistrosExportados}</strong></div>
                <div>Fecha: {reporteEtl.fechaGeneracion ? new Date(reporteEtl.fechaGeneracion).toLocaleString() : 'Reciente'}</div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              No se ha generado ningún lote ETL en la sesión actual.
            </div>
          )}
        </div>

        {/* Visor de Previsualización del Archivo Plano */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-extrabold text-sm">
              <FileText size={16} /> Previsualización del Archivo Plano (ISO 8601 UTC)
            </div>

            {reporteEtl?.vistaPreviaFormatoISO && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopiarContenido}
                  className="outline-button text-xs py-1 px-2.5 font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <Terminal size={12} /> {copiado ? '¡Copiado!' : 'Copiar'}
                </button>
                <button
                  type="button"
                  onClick={handleDescargarArchivo}
                  className="gradient-button text-xs py-1 px-2.5 font-bold cursor-pointer inline-flex items-center gap-1 shadow-sm"
                >
                  <Download size={12} /> Descargar .txt
                </button>
              </div>
            )}
          </div>

          {reporteEtl?.vistaPreviaFormatoISO ? (
            <pre className="bg-zinc-900 text-emerald-400 p-5 rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] border border-zinc-800 shadow-inner">
              {reporteEtl.vistaPreviaFormatoISO}
            </pre>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center min-h-[260px]">
              <FileText size={36} className="text-zinc-300 dark:text-zinc-600 mb-3" />
              <p className="font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                Ningún lote generado para previsualizar
              </p>
              <p className="text-[0.7rem] text-zinc-400 max-w-sm">
                Presione "Exportar Métricas ISO 8601" para recopilar las fases, contingencias e incidencias del proyecto desde PostgreSQL y generar el formato plano delimitado.
              </p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[0.65rem] text-zinc-400 font-medium">
            <span>IKernell ETL Automation Module • Spring Boot 3 Engine</span>
            <span>Normativa ISO 8601 UTC Compliant</span>
          </div>
        </div>

      </div>

    </motion.div>
  );
};
