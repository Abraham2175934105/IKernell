import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BookOpen, FileText, Download, Eye, Search, Sparkles, CheckCircle2, 
  Shield, Layers, RefreshCw, Loader2, X, ChevronRight, Filter, FileCode,
  ArrowDownToLine, Maximize2, FileCheck, Terminal, Copy, Check, Printer
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'TODOS', 
  'NORMATIVAS', 
  'ARQUITECTURA', 
  'BASE DE DATOS', 
  'OPERACIONES', 
  'INTEGRACION', 
  'DESARROLLO', 
  'CIBERSEGURIDAD', 
  'ANALITICA'
];

export const BibliotecaDigital = () => {
  const api = useApi();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  
  // Modal de Previsualización Dual (PDF Hoja A4 / Terminal Código)
  const [previewDoc, setPreviewDoc] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('pdf'); // 'pdf' | 'terminal'
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Búsqueda Predictiva en Vivo
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Carga los documentos técnicos aplicando filtros de búsqueda y categoría
  const cargarDocumentos = useCallback(async (q = searchTerm, cat = selectedCategory) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q && q.trim()) params.append('q', q.trim());
      if (cat && cat !== 'TODOS') params.append('categoria', cat);

      const url = `/biblioteca/documentos${params.toString() ? '?' + params.toString() : ''}`;
      const data = await api.get(url);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando documentos técnicos:', err);
      toast.error('Error al sincronizar la biblioteca desde PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, [api, searchTerm, selectedCategory]);

  // Consulta sugerencias en tiempo real mientras el usuario escribe
  const fetchSuggestions = useCallback(async (term) => {
    if (!term || term.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const data = await api.get(`/biblioteca/sugerencias?q=${encodeURIComponent(term.trim())}`);
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error consultando sugerencias predictivas:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [api]);

  // Debounce para búsqueda predictiva y filtrado
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDocumentos(searchTerm, selectedCategory);
      if (searchTerm.trim().length >= 1) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, cargarDocumentos, fetchSuggestions]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = async (sug) => {
    setShowSuggestions(false);
    setSearchTerm(sug.titulo);
    try {
      const fullDoc = await api.get(`/biblioteca/documentos/${sug.idDocumento}`);
      abrirModalPrevisualizacion(fullDoc);
    } catch (err) {
      console.error('Error obteniendo documento:', err);
    }
  };

  // Abre el visor emergente determinando el modo según el formato
  const abrirModalPrevisualizacion = (doc) => {
    setPreviewDoc(doc);
    setCopied(false);
    const esCodigo = (doc.formato || '').toUpperCase() === 'SQL' || (doc.formato || '').toUpperCase() === 'TXT';
    setActiveViewMode(esCodigo ? 'terminal' : 'pdf');
  };

  // Copia el contenido técnico completo al portapapeles
  const handleCopyContent = () => {
    const textToCopy = previewDoc?.contenidoTexto || previewDoc?.descripcion || '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Especificación técnica copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  // Genera y descarga un archivo PDF real estructurado al vuelo con jsPDF (o archivo .sql si es código)
  const handleDownload = async (doc) => {
    if (!doc) return;
    const esSql = (doc.formato || '').toUpperCase() === 'SQL';

    if (esSql) {
      // Descarga de archivo de script SQL nativo
      const blob = new Blob([doc.contenidoTexto || doc.descripcion || ''], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${doc.titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${doc.version || 'v1.0'}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success(`Descargando script SQL: ${doc.titulo}`);
      return;
    }

    // Generación de PDF profesional con jsPDF
    try {
      setGeneratingPdf(true);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 18;
      const maxWidth = pageWidth - (margin * 2);
      let y = 25;

      const drawHeader = (currentPage) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(70, 70, 70);
        pdf.text('IKERNELL SOLUCIONES SOFTWARE — SISTEMA DE INGENIERÍA (RF-33)', margin, 12);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`DOC-0${doc.idDocumento} • ${doc.categoria} • ${doc.version || 'v1.0'}`, pageWidth - margin, 12, { align: 'right' });
        
        pdf.setDrawColor(210, 210, 210);
        pdf.setLineWidth(0.3);
        pdf.line(margin, 14, pageWidth - margin, 14);
      };

      const drawFooter = (currentPage) => {
        pdf.setDrawColor(210, 210, 210);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Documentación Oficial IKernell • Repositorio Digital Certificado ISO/IEC 25010', margin, pageHeight - 9);
        pdf.text(`Página ${currentPage}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
      };

      let pageNumber = 1;
      drawHeader(pageNumber);

      const rawText = doc.contenidoTexto || doc.descripcion || 'Sin contenido registrado.';
      const lines = rawText.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('# ')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(13);
          pdf.setTextColor(15, 23, 42);
          y += 3;
        } else if (line.startsWith('## ')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10.5);
          pdf.setTextColor(30, 41, 59);
          y += 2.5;
        } else if (line.startsWith('### ')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(51, 65, 85);
          y += 1.5;
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(40, 40, 40);
        }

        const cleanLine = line.replace(/^#{1,4}\s+/, '').replace(/\*\*/g, '');
        const wrappedLines = pdf.splitTextToSize(cleanLine || ' ', maxWidth);

        for (const wrapped of wrappedLines) {
          if (y + 5 > pageHeight - 18) {
            drawFooter(pageNumber);
            pdf.addPage();
            pageNumber++;
            drawHeader(pageNumber);
            y = 22;
          }
          pdf.text(wrapped, margin, y);
          y += 4.2;
        }
      }

      drawFooter(pageNumber);

      const fileName = `${doc.titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${doc.version || 'v1.0'}.pdf`;
      pdf.save(fileName);
      toast.success(`PDF generado y descargado: ${fileName}`);
    } catch (error) {
      console.error('Error generando PDF con jsPDF:', error);
      toast.error('Error al generar el archivo PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none"
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Biblioteca Digital de Documentos
              </h3>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                RF-33
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Repositorio centralizado con visor dual (Hoja A4 PDF & Terminal de Código) y descargas en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cargarDocumentos(searchTerm, selectedCategory)}
            disabled={loading}
            className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sincronizar documentos con PostgreSQL"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refrescar
          </button>
          <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            {documents.length} Documentos Oficiales
          </div>
        </div>
      </div>

      {/* Buscador Predictivo y Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        {/* Barra de Búsqueda Predictiva */}
        <div ref={searchContainerRef} className="sm:col-span-2 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            placeholder="Escribe para buscar (ej. ISO, Spring, PostgreSQL, JWT)..."
            className="input-field pl-11 pr-10 py-3 text-sm bg-white dark:bg-zinc-900 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setSuggestions([]); setShowSuggestions(false); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}

          {/* Menú Flotante de Sugerencias Predictivas */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
              >
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500" /> Coincidencias Predictivas (RF-33)
                  </span>
                  <span>{suggestions.length} sugerencias</span>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[260px] overflow-y-auto">
                  {suggestions.map((sug) => (
                    <button
                      key={sug.idDocumento}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 flex-shrink-0 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-950 transition-colors">
                          <FileText size={14} />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {sug.titulo}
                          </div>
                          <div className="text-[0.65rem] text-zinc-500 font-medium">
                            {sug.categoria} • {sug.version || 'v1.0'} ({sug.formato || 'PDF'})
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selector de Categoría */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field py-3 text-xs font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 shadow-sm"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Grid de Documentos Técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {loading && (
          <>
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse h-48" />
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse h-48" />
          </>
        )}

        {!loading && documents.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <FileCode size={28} />
            </div>
            <h4 className="text-base font-bold text-zinc-700 dark:text-zinc-300 mb-1">No se encontraron documentos</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchTerm 
                ? `No hay documentos que coincidan con "${searchTerm}". Intenta con otros términos o cambia de categoría.`
                : 'No hay especificaciones técnicas registradas en esta categoría.'}
            </p>
          </div>
        )}

        {!loading && documents.map(doc => (
          <div 
            key={doc.idDocumento}
            className="p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-md space-y-4 h-full"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.65rem] font-black px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                  DOC-0{doc.idDocumento} • {doc.version || 'v1.0'}
                </span>
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-zinc-500">
                  {doc.categoria}
                </span>
              </div>

              <h4 className="font-extrabold text-zinc-900 dark:text-white text-base leading-snug mb-2">
                {doc.titulo}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {doc.descripcion}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-bold uppercase text-[0.65rem] px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  (doc.formato || '').toUpperCase() === 'PDF' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' :
                  (doc.formato || '').toUpperCase() === 'SQL' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                  (doc.formato || '').toUpperCase() === 'DOCX' ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800' :
                  'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                }`}>
                  {doc.formato === 'SQL' ? <Terminal size={12} /> : <FileCheck size={12} />}
                  {doc.formato || 'PDF'}
                </span>

                <span className="text-[0.7rem] text-zinc-400 flex items-center gap-1 font-medium">
                  {doc.fechaSubida ? new Date(doc.fechaSubida).toLocaleDateString() : '2026'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Botón Ver Documento */}
                <button
                  type="button"
                  onClick={() => abrirModalPrevisualizacion(doc)}
                  className="outline-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex-1 sm:flex-none justify-center"
                  title="Abrir visor de documentación"
                >
                  <Eye size={14} />
                  <span>Ver Documento</span>
                  <ChevronRight size={12} className="text-zinc-400" />
                </button>

                {/* Botón Descargar PDF / SQL */}
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={generatingPdf}
                  className="gradient-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md flex-1 sm:flex-none justify-center disabled:opacity-50"
                  title={`Descargar ${doc.formato || 'PDF'} a su dispositivo`}
                >
                  <ArrowDownToLine size={14} />
                  <span>Descargar {doc.formato || 'PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Visor Dual de Documentos (Hoja A4 PDF & Terminal de Código) */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden text-white"
            >
              
              {/* Header del Modal */}
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 flex-shrink-0">
                <div className="flex items-center gap-3 truncate pr-4">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm border border-zinc-700">
                    {activeViewMode === 'terminal' ? <Terminal size={20} className="text-emerald-400" /> : <FileText size={20} className="text-blue-400" />}
                  </div>
                  <div className="truncate">
                    <h4 className="font-extrabold text-white text-sm sm:text-base truncate">
                      {previewDoc.titulo}
                    </h4>
                    <div className="flex items-center gap-2 text-[0.7rem] text-zinc-400 font-medium">
                      <span className="font-semibold text-zinc-300">{previewDoc.categoria}</span>
                      <span>•</span>
                      <span>{previewDoc.version || 'v1.0'}</span>
                      <span>•</span>
                      <span className="font-bold text-blue-400">
                        {previewDoc.formato || 'PDF'} (PostgreSQL Live)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Selector de Modo Dual: Hoja PDF (A4) vs Terminal */}
                  <div className="flex items-center bg-zinc-800 p-1 rounded-xl text-xs font-bold border border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('pdf')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeViewMode === 'pdf'
                          ? 'bg-blue-600 text-white shadow-sm font-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <FileText size={13} />
                      <span className="hidden sm:inline">Visor Hoja A4</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('terminal')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeViewMode === 'terminal'
                          ? 'bg-blue-600 text-white shadow-sm font-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Terminal size={13} />
                      <span className="hidden sm:inline">Modo Código</span>
                    </button>
                  </div>

                  {/* Botón Copiar Especificación */}
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    title="Copiar texto de la especificación"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span className="hidden md:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  {/* Botón Descargar PDF Real con jsPDF */}
                  <button
                    type="button"
                    onClick={() => handleDownload(previewDoc)}
                    disabled={generatingPdf}
                    className="gradient-button text-xs py-2 px-3.5 font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    title="Descargar archivo PDF generado"
                  >
                    {generatingPdf ? <Loader2 size={14} className="animate-spin" /> : <ArrowDownToLine size={14} />}
                    <span className="hidden sm:inline">Descargar {previewDoc.formato || 'PDF'}</span>
                  </button>

                  {/* Botón Cerrar (X) */}
                  <button 
                    onClick={() => setPreviewDoc(null)} 
                    className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
                    title="Cerrar ventana emergente"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Cuerpo del Visor Dual */}
              <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col">
                
                {/* 1. VISTA DOCUMENTO FORMAL (EFECTO HOJA A4 CON REACT-MARKDOWN) */}
                {activeViewMode === 'pdf' && (
                  <div className="w-full h-full bg-zinc-900 p-4 sm:p-8 overflow-y-auto rounded-2xl border border-zinc-800 shadow-inner flex justify-center">
                    <div className="w-full max-w-4xl mx-auto bg-white text-black shadow-2xl min-h-[1056px] p-10 sm:p-16 my-8 rounded-sm ring-1 ring-black/10 flex flex-col justify-between">
                      
                      {/* Cabecera Formal de la Hoja A4 con Membrete Oficial */}
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-blue-900 pb-4 mb-8 gap-3">
                          <div>
                            <div className="text-xl sm:text-2xl font-black tracking-wider text-blue-900 uppercase">
                              IKERNELL S.A.S.
                            </div>
                            <div className="text-[0.68rem] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                              DEPARTAMENTO DE INGENIERÍA & ARQUITECTURA CLOUD
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <div className="text-xs font-mono font-black text-blue-950 bg-blue-50 px-3 py-1.5 rounded border border-blue-200 inline-block shadow-sm">
                              REF: DOC-0{previewDoc.idDocumento} | VERSIÓN: {previewDoc.version || 'v1.0'}
                            </div>
                            <div className="text-[0.68rem] text-zinc-500 mt-1 font-medium">
                              Categoría: <span className="font-bold text-zinc-800">{previewDoc.categoria}</span> • Formato: <span className="font-bold text-blue-700">{previewDoc.formato || 'PDF'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Renderizado de Markdown Estructurado con Tailwind Typography */}
                        <div className="prose prose-zinc max-w-none prose-headings:text-blue-900 prose-headings:font-black prose-h1:text-2xl prose-h1:border-b prose-h1:border-zinc-200 prose-h1:pb-2 prose-h2:text-xl prose-h2:text-blue-950 prose-h3:text-lg prose-a:text-blue-600 prose-table:border-collapse prose-th:bg-zinc-100 prose-th:p-3 prose-th:border prose-th:border-zinc-300 prose-td:p-3 prose-td:border prose-td:border-zinc-300 prose-pre:bg-zinc-900 prose-pre:text-emerald-400 prose-pre:rounded-xl prose-pre:p-4 prose-code:text-blue-900 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none leading-relaxed text-[0.92rem]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {previewDoc.contenidoTexto || previewDoc.descripcion || 'Sin contenido registrado.'}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Pie de Página Formal de la Hoja A4 */}
                      <div className="border-t border-zinc-300 pt-6 mt-14 flex flex-col sm:flex-row justify-between items-center text-[0.7rem] text-zinc-500 gap-2">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-blue-900 flex-shrink-0" />
                          <span>Documento Oficial Certificado • Cumplimiento Normativa IEEE 830 / ISO-IEC 25010</span>
                        </div>
                        <span className="font-mono text-zinc-400">IKernell Enterprise Core Platform</span>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. VISTA TERMINAL / CÓDIGO FUENTE (DARK THEME) */}
                {activeViewMode === 'terminal' && (
                  <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
                    <div className="p-3 bg-zinc-900 text-zinc-300 border-b border-zinc-800 text-xs font-mono flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 mr-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <Terminal size={14} className="text-emerald-400" />
                        <span className="font-bold text-zinc-100 truncate max-w-xs sm:max-w-md">
                          Terminal de Lectura • {previewDoc.titulo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[0.7rem] text-zinc-400 font-mono">
                        <span>UTF-8 Buffer</span>
                        <span>•</span>
                        <span>{(previewDoc.contenidoTexto || '').length.toLocaleString()} Chars</span>
                      </div>
                    </div>

                    <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-zinc-950 text-emerald-400 font-mono text-xs sm:text-[0.82rem] leading-relaxed selection:bg-emerald-500 selection:text-black">
                      <pre className="whitespace-pre-wrap font-mono font-normal">
                        {previewDoc.contenidoTexto || previewDoc.descripcion || 'Sin contenido registrado.'}
                      </pre>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer del Modal */}
              <div className="px-6 py-3 border-t border-zinc-800 flex justify-between items-center text-[0.7rem] text-zinc-400 bg-zinc-900 flex-shrink-0">
                <span className="hidden sm:inline">IKernell Digital Library • Visor Certificado de Especificaciones Técnicas</span>
                <span className="font-mono font-medium text-zinc-400">
                  {previewDoc.categoria} • {previewDoc.version || 'v1.0'}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cerrar Visor
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
