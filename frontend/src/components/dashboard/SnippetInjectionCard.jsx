import React, { useState } from 'react';
import { Terminal, Code2, ClipboardCheck, Copy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Componente interactivo para la inyección de Snippets Técnicos (RF-36).
 * Muestra el bloque de código o comando sugerido con soporte para copiar en un clic.
 */
export const SnippetInjectionCard = ({ snippet }) => {
  const [copied, setCopied] = useState(false);

  if (!snippet) return null;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(snippet.codigoSolucion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const isCommand = snippet.comandoConsola || snippet.lenguaje?.toLowerCase() === 'bash';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-3 p-4 rounded-2xl bg-zinc-950 text-zinc-100 border border-blue-900/40 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
            {isCommand ? <Terminal size={14} /> : <Code2 size={14} />}
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-white tracking-wide block truncate">
              {snippet.titulo}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="uppercase px-1.5 py-0.2 rounded bg-blue-950/60 border border-blue-800/60 font-semibold text-blue-300">
                {snippet.lenguaje || 'code'}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-blue-400 flex items-center gap-1">
                <Sparkles size={10} className="text-blue-400" /> Inyección inteligente
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
              : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-600/30'
          }`}
          title="Copiar código al portapapeles"
        >
          {copied ? (
            <>
              <ClipboardCheck size={14} className="text-emerald-400" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Description */}
      {snippet.descripcion && (
        <p className="text-xs text-zinc-400 mb-2.5 leading-relaxed font-sans">
          {snippet.descripcion}
        </p>
      )}

      {/* Code / Command Block */}
      <div className="relative group">
        <pre className="p-3.5 rounded-xl bg-black/90 border border-zinc-800/90 text-xs font-mono leading-relaxed overflow-x-auto text-emerald-400 select-all custom-scrollbar max-h-48 whitespace-pre-wrap">
          <code>{snippet.codigoSolucion}</code>
        </pre>
      </div>

      <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between">
        <span>Fuente: Base de Conocimiento IKernell</span>
        {snippet.score && (
          <span className="font-mono text-blue-400">
            Relevancia: {Math.round(snippet.score * 100)}%
          </span>
        )}
      </div>
    </motion.div>
  );
};
