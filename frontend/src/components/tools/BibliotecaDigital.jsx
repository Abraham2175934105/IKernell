import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BookOpen, FileText, Download, Eye, Search, Sparkles, CheckCircle2, 
  Shield, Layers, RefreshCw, Loader2, X, ChevronRight, Filter, FileCode,
  ArrowDownToLine, Maximize2, FileCheck, Terminal, Copy, Check
} from 'lucide-react';
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
  
  // Modal de Previsualización Universal de Texto Técnico
  const [previewDoc, setPreviewDoc] = useState(null);
  const [copied, setCopied] = useState(false);

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

  // Abre el visor emergente universal de texto técnico
  const abrirModalPrevisualizacion = (doc) => {
    setPreviewDoc(doc);
    setCopied(false);
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

  // Genera la descarga del archivo en formato Markdown (.md) o SQL (.sql) al vuelo vía Blob
  const handleDownload = (doc) => {
    if (!doc) return;
    const textContent = doc.contenidoTexto || doc.descripcion || "Documento IKernell";
    const extension = (doc.formato || '').toUpperCase() === 'SQL' ? 'sql' : 'md';
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${doc.titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${doc.version || 'v1.0'}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success(`Descargando especificación: ${doc.titulo} (.${extension})`);
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
              Repositorio centralizado de especificaciones técnicas con visor universal y descarga de documentación (PostgreSQL Live)
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
                  title="Abrir visor de documentación técnica"
                >
                  <Eye size={14} />
                  <span>Ver Documento</span>
                  <ChevronRight size={12} className="text-zinc-400" />
                </button>

                {/* Botón Descargar Especificación */}
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="gradient-button text-xs py-2 px-3.5 font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md flex-1 sm:flex-none justify-center"
                  title="Descargar especificación a su computadora"
                >
                  <ArrowDownToLine size={14} />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Visor Universal de Documentación Técnica */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden"
            >
              
              {/* Header del Modal */}
              <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/90 dark:bg-zinc-900/90 flex-shrink-0">
                <div className="flex items-center gap-3 truncate pr-4">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div className="truncate">
                    <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm sm:text-base truncate">
                      {previewDoc.titulo}
                    </h4>
                    <div className="flex items-center gap-2 text-[0.7rem] text-zinc-500 font-medium">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{previewDoc.categoria}</span>
                      <span>•</span>
                      <span>{previewDoc.version || 'v1.0'}</span>
                      <span>•</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {previewDoc.formato || 'PDF'} • {(previewDoc.contenidoTexto || '').length.toLocaleString()} Caracteres
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Botón Copiar Especificación */}
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="outline-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Copiar texto de la especificación técnica"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  {/* Botón Descargar desde el Modal */}
                  <button
                    type="button"
                    onClick={() => handleDownload(previewDoc)}
                    className="gradient-button text-xs py-2 px-3 font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Descargar especificación completa"
                  >
                    <ArrowDownToLine size={14} />
                    <span className="hidden sm:inline">Descargar</span>
                  </button>

                  {/* Botón Cerrar (X) */}
                  <button 
                    onClick={() => setPreviewDoc(null)} 
                    className="w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
                    title="Cerrar ventana emergente"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Cuerpo del Visor: Renderizado Universal de Texto Técnico */}
              <div className="flex-1 p-3 sm:p-5 bg-zinc-100/60 dark:bg-zinc-950/60 overflow-hidden flex flex-col">
                <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-inner">
                  
                  {/* Barra Superior del Buffer */}
                  <div className="p-3 bg-zinc-100/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Terminal size={15} className="text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                        Buffer de Lectura • {previewDoc.titulo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[0.7rem] text-zinc-500 dark:text-zinc-400">
                      <span className="hidden sm:inline">UTF-8 Encoded</span>
                      <span>•</span>
                      <span className="font-mono">Doc ID #{previewDoc.idDocumento}</span>
                    </div>
                  </div>

                  {/* Contenedor del Texto Técnico con Scroll Suave y Alto Contraste */}
                  <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-zinc-50/60 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 selection:bg-blue-500 selection:text-white">
                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-[0.84rem] leading-relaxed text-zinc-800 dark:text-zinc-200 font-normal">
                      {previewDoc.contenidoTexto || previewDoc.descripcion || 'Sin contenido de texto registrado en base de datos.'}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[0.7rem] text-zinc-500 bg-white dark:bg-zinc-900 flex-shrink-0">
                <span className="hidden sm:inline">IKernell Digital Library • Visor Universal de Especificaciones Técnicas</span>
                <span className="font-mono font-medium text-zinc-600 dark:text-zinc-400">
                  {previewDoc.categoria} • {previewDoc.version || 'v1.0'}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="outline-button text-xs py-1.5 px-4 font-bold cursor-pointer"
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
