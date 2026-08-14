import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Cpu, ShieldCheck, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewsModal = ({ isOpen, onClose, news }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !news) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-[95%] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl z-10 my-auto text-zinc-900 dark:text-zinc-100 flex flex-col"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-md shadow-md cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>

          {/* Modal Header Image */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-t-3xl bg-zinc-950 flex-shrink-0">
            <img 
              src={news.image} 
              alt={news.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
            
            {/* Header Overlays */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                  <Tag size={12} /> {news.tag}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  <Calendar size={12} /> {news.date}
                </span>
                {news.author && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-zinc-200 border border-white/10">
                    <UserCheck size={12} /> {news.author}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                {news.title}
              </h2>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6 flex-1">
            
            {/* Subtitle / Key Takeaway */}
            {news.subtitle && (
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40">
                <p className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-300 leading-relaxed">
                  💡 {news.subtitle}
                </p>
              </div>
            )}

            {/* Detailed Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <Cpu size={18} className="text-blue-600 dark:text-blue-400" />
                Descripción Técnica y Funcional
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
                {news.fullText || news.summary}
              </p>
            </div>

            {/* Architecture & Stack */}
            {news.stack && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Arquitectura & Tecnologías Involucradas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {news.stack.map((tech, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Corporate Benefits */}
            {news.benefits && news.benefits.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                  Impacto Operativo & Beneficios de Negocio
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {news.benefits.map((benefit, i) => (
                    <li 
                      key={i} 
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-start gap-2.5 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-medium"
                    >
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              IKernell Soluciones Software • Ingeniería de Alto Impacto
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <Link 
                to="/contacto" 
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all"
              >
                Solicitar Demostración <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
