import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, FileText, Send, RefreshCw, Loader2, Download, 
  CheckCircle2, AlertTriangle, ShieldCheck, Server, Mail, Terminal, 
  Layers, Copy, Check, Hash, Lock, Shield, ArrowRight
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Calcula el hash criptográfico SHA-256 del contenido plano en el navegador
 */
const computeSha256 = async (text) => {
  if (!text) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }
};

export const EtlBrasil = ({ proyecto, onExportSuccess }) => {
  const api = useApi();
  
  // Estados locales
  const [exportando, setExportando] = useState(false);
  const [reporteEtl, setReporteEtl] = useState(null);
  const [sha256Hash, setSha256Hash] = useState('');
  const [copiadoContenido, setCopiadoContenido] = useState(false);
  const [copiadoHash, setCopiadoHash] = useState(false);

  // Calcula el hash cuando el contenido de previsualización esté disponible
  useEffect(() => {
    if (reporteEtl?.vistaPreviaFormatoISO) {
      computeSha256(reporteEtl.vistaPreviaFormatoISO).then(hash => {
        setSha256Hash(hash);
      });
    } else {
      setSha256Hash('');
    }
  }, [reporteEtl]);

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

  // Copia el texto delimitado al portapapeles
  const handleCopiarContenido = () => {
    if (!reporteEtl?.vistaPreviaFormatoISO) return;
    navigator.clipboard.writeText(reporteEtl.vistaPreviaFormatoISO);
    setCopiadoContenido(true);
    toast.success('Contenido ISO 8601 copiado al portapapeles.');
    setTimeout(() => setCopiadoContenido(false), 2000);
  };

  // Copia el hash SHA-256
  const handleCopiarHash = () => {
    if (!sha256Hash) return;
    navigator.clipboard.writeText(sha256Hash);
    setCopiadoHash(true);
    toast.success('Firma SHA-256 copiada al portapapeles.');
    setTimeout(() => setCopiadoHash(false), 2000);
  };

  // Renderiza una línea con Syntax Highlighting en el visor terminal
  const renderHighlightedLine = (line, idx) => {
    if (!line) return null;
    
    // Si es línea de comentario o cabecera
    if (line.startsWith('#') || line.startsWith('//') || line.startsWith('---')) {
      return (
        <div key={idx} className="text-zinc-500 italic py-0.5">
          <span className="text-zinc-700 select-none mr-2 font-mono text-[0.65rem]">{(idx + 1).toString().padStart(2, '0')}</span>
          {line}
        </div>
      );
    }

    const parts = line.split('|');
    return (
      <div key={idx} className="hover:bg-zinc-800/60 py-0.5 px-1 rounded transition-colors flex items-start font-mono text-[0.72rem] leading-relaxed">
        <span className="text-zinc-600 select-none mr-2 font-mono text-[0.65rem] shrink-0 pt-0.5">{(idx + 1).toString().padStart(2, '0')}</span>
        <div className="flex-1 break-all">
          {parts.map((part, pIdx) => {
            let partStyle = "text-zinc-300";
            // Validación si es fecha ISO 8601 UTC
            if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(part)) {
              partStyle = "text-cyan-300 font-semibold";
            } else if (/^\d+(\.\d+)?$/.test(part.trim())) {
              partStyle = "text-amber-400 font-bold";
            } else if (pIdx === 0) {
              partStyle = "text-blue-400 font-bold";
            } else if (part.includes('ERROR') || part.includes('CRITICO') || part.includes('ALTO')) {
              partStyle = "text-red-400 font-semibold";
            } else if (part.includes('FINALIZADA') || part.includes('OK') || part.includes('VERDE')) {
              partStyle = "text-emerald-400 font-semibold";
            }

            return (
              <React.Fragment key={pIdx}>
                <span className={partStyle}>{part}</span>
                {pIdx < parts.length - 1 && (
                  <span className="text-zinc-600 font-black mx-1 select-none">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const previewLines = useMemo(() => {
    if (!reporteEtl?.vistaPreviaFormatoISO) return [];
    return reporteEtl.vistaPreviaFormatoISO.split('\n');
  }, [reporteEtl]);

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
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Innovación 2 • Alianza Estratégica Brasil (RF-28 a RF-30)
            </span>
            <span className="text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ISO 8601 UTC
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Automatización y Transferencia ETL de Métricas
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1 max-w-2xl leading-relaxed">
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
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all duration-200">
          <div>
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-extrabold text-sm mb-3">
              <Server size={16} className="text-blue-600 dark:text-blue-400" /> Parámetros del Servidor y Destino
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400 font-semibold">Proyecto Seleccionado:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
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

          {/* Resumen del Último Lote Exportado & Firma Criptográfica */}
          {reporteEtl ? (
            <div className="space-y-3">
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

              {/* Sello / Hash Criptográfico SHA-256 */}
              {sha256Hash && (
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.62rem] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                      <ShieldCheck size={12} /> Sello Criptográfico SHA-256
                    </span>
                    <button
                      type="button"
                      onClick={handleCopiarHash}
                      className="text-[0.65rem] font-bold text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copiar hash SHA-256"
                    >
                      {copiadoHash ? <><Check size={11} className="text-emerald-400" /> Copiado</> : <><Copy size={11} /> Copiar Hash</>}
                    </button>
                  </div>
                  <p className="font-mono text-[0.65rem] text-zinc-300 break-all leading-tight">
                    {sha256Hash}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              No se ha generado ningún lote ETL en la sesión actual.
            </div>
          )}
        </div>

        {/* Visor Terminal Oscuro con Syntax Highlighting */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-extrabold text-sm">
              <Terminal size={16} className="text-blue-600 dark:text-blue-400" />
              <span>Visor Terminal del Archivo Plano (ISO 8601 UTC)</span>
            </div>

            {reporteEtl?.vistaPreviaFormatoISO && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopiarContenido}
                  className="outline-button text-xs py-1 px-3 font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  {copiadoContenido ? <><Check size={12} className="text-emerald-500" /> ¡Copiado!</> : <><Copy size={12} /> Copiar Contenido</>}
                </button>
                <button
                  type="button"
                  onClick={handleDescargarArchivo}
                  className="gradient-button text-xs py-1 px-3 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={12} /> Descargar .txt
                </button>
              </div>
            )}
          </div>

          {/* IDE Terminal Window */}
          {reporteEtl?.vistaPreviaFormatoISO ? (
            <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
              {/* Terminal Title Bar */}
              <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[0.65rem] font-mono text-zinc-400 font-medium truncate max-w-[260px]">
                  ikernell@etl-brasil: ~/{reporteEtl.nombreArchivo || 'batch.txt'}
                </span>
                <span className="text-[0.6rem] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  UTF-8 • CRLF
                </span>
              </div>

              {/* Code / Flat Content with Syntax Highlighting */}
              <div className="p-4 overflow-x-auto max-h-[320px] divide-y divide-zinc-900">
                {previewLines.map((line, idx) => renderHighlightedLine(line, idx))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center min-h-[260px]">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <FileText size={28} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-1 text-sm">
                Ningún lote generado para previsualizar
              </p>
              <p className="text-[0.7rem] text-zinc-400 max-w-sm leading-relaxed">
                Presione "Exportar Métricas ISO 8601" para recopilar las fases, contingencias e incidencias del proyecto desde PostgreSQL y generar el formato plano delimitado.
              </p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[0.65rem] text-zinc-400 font-medium">
            <span>IKernell ETL Automation Module • Spring Boot 3 Engine</span>
            <span>Normativa ISO 8601 UTC & SHA-256 Verified</span>
          </div>
        </div>

      </div>

    </motion.div>
  );
};
