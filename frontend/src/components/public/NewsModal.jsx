import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Cpu, ShieldCheck, CheckCircle2, ArrowRight, UserCheck, Info, Sparkles, Layers, Zap, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const springTransition = { type: "spring", stiffness: 400, damping: 28 };

export const NewsModal = ({ isOpen, onClose, news }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'benefits' | 'tech'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab('overview');
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

  const stackList = news?.stack || [];
  const benefitsList = news?.benefits || [];

  const tabs = [
    { id: 'overview', label: 'Resumen & Funcionamiento', icon: Sparkles },
    { id: 'benefits', label: 'Beneficios para tu Empresa', icon: Award },
    { id: 'tech', label: 'Garantías & Tecnologías', icon: ShieldCheck },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container — Amplio, Moderno y Espacioso */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl z-10 my-auto text-zinc-900 dark:text-zinc-100 flex flex-col"
        >
          {/* Modal Header con Imagen de Impacto */}
          <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-t-3xl bg-zinc-950 flex-shrink-0">
            <img 
              src={news?.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
              alt={news?.title || 'Detalle de Noticia'} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-transparent" />
            
            {/* Header Overlays */}
            <div className="absolute bottom-5 left-6 right-16">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {news?.tag && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                    <Tag size={12} /> {news.tag}
                  </span>
                )}
                {news?.date && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                    <Calendar size={12} /> {news.date}
                  </span>
                )}
                {news?.author && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-semibold bg-white/10 backdrop-blur-md text-zinc-200 border border-white/10">
                    <UserCheck size={12} /> {news.author}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                {news?.title || ''}
              </h2>
            </div>
          </div>

          {/* Selector de Pestañas Interactivas (Aprovechamiento Espacial & UX Intuitiva) */}
          <div className="px-6 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeNewsModalTab"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30 -z-0"
                      transition={springTransition}
                    />
                  )}
                  <TabIcon size={14} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body Interactivo */}
          <div className="p-6 sm:p-8 flex-1 text-left">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Destacado principal */}
                  {news?.subtitle && (
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm mt-0.5">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <span className="text-[0.68rem] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                          Enfoque Principal
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {news.subtitle}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Descripción amigable */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <Info size={16} className="text-blue-600 dark:text-blue-400" />
                      ¿De qué trata esta innovación?
                    </h3>
                    <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      {news?.fullText || news?.summary || ''}
                    </p>
                  </div>

                  {/* Call to action directo */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        ¿Quieres aplicar esta solución en tu empresa?
                      </h4>
                      <p className="text-[0.72rem] text-zinc-500 dark:text-zinc-400">
                        Nuestro equipo de ingeniería puede asesorarte y desplegarla en tus proyectos.
                      </p>
                    </div>
                    <Link
                      to="/contacto"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
                    >
                      Consultar con un Asesor
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === 'benefits' && (
                <motion.div
                  key="benefits"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                      <Award size={16} className="text-blue-600 dark:text-blue-400" />
                      Resultados y Valor Empresarial
                    </h3>
                    <span className="text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Garantizado
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {benefitsList.map((benefit, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-start gap-3 transition-colors hover:border-blue-400"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                            Beneficio {i + 1}
                          </strong>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                            {benefit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tech' && (
                <motion.div
                  key="tech"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                      Garantías Técnicas y Estándares
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Tecnologías y herramientas que respaldan la estabilidad, seguridad y velocidad de la solución.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {stackList.map((tech, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                          <Layers size={14} />
                        </div>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {tech}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                    <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      Todos los componentes cumplen con estándares internacionales de confidencialidad, alta concurrencia y seguridad de datos.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón Inferior Único de Cierre */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                Cerrar Noticia
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
