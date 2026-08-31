import React, { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle, Search, ArrowRight, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export const faqsList = [
  {
    category: 'GENERAL',
    question: "¿Qué es IKernell y cómo ayuda a las empresas de tecnología?",
    answer: "Es una plataforma integral diseñada para planificar, monitorear y predecir el avance de proyectos de software. Centraliza la asignación de actividades, el control de tiempos y la comunicación del equipo en un solo entorno seguro."
  },
  {
    category: 'GESTIÓN',
    question: "¿Cuáles son los roles de usuario y sus permisos dentro del sistema?",
    answer: "IKernell maneja tres roles operativos: el Coordinador (administra talento y solicitudes), el Líder de Proyecto (crea etapas, asigna actividades y genera reportes) y el Desarrollador (registra avances, errores e interrupciones)."
  },
  {
    category: 'INNOVACIÓN',
    question: "¿Qué es el Semáforo Inteligente o Dashboard Predictivo de Riesgos?",
    answer: "Es un panel automatizado que analiza la acumulación de errores, retrasos e interrupciones. Clasifica la salud del proyecto en tres niveles (Verde, Amarillo y Rojo) para anticipar cuellos de botella antes de que afecten la entrega."
  },
  {
    category: 'INNOVACIÓN',
    question: "¿En qué consiste la Automatización ETL para el reporte internacional (Brasil)?",
    answer: "Es un proceso que consolida las métricas del proyecto y las exporta en un archivo plano estandarizado con un solo clic, listo para su transmisión e integración con la empresa aliada en Brasil."
  },
  {
    category: 'SEGURIDAD',
    question: "¿Cómo se garantiza la seguridad de las sesiones y la información?",
    answer: "La plataforma utiliza tokens de acceso JWT (JSON Web Tokens) firmados digitalmente para validar cada petición y cifra todas las contraseñas en la base de datos mediante el algoritmo seguro BCrypt."
  },
  {
    category: 'SEGURIDAD',
    question: "¿Qué tecnologías componen el sistema?",
    answer: "La interfaz de usuario está construida con React y Tailwind CSS para máxima fluidez, conectada a través de una API REST protegida a un backend empresarial desarrollado en Java Spring Boot con PostgreSQL."
  }
];

const faqCategories = [
  { id: 'ALL', label: 'Todas' },
  { id: 'GENERAL', label: 'General' },
  { id: 'GESTIÓN', label: 'Gestión WBS' },
  { id: 'INNOVACIÓN', label: 'Innovaciones' },
  { id: 'SEGURIDAD', label: 'Seguridad' },
];

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredFaqs = useMemo(() => {
    const term = normalizeText(searchTerm);
    let base = Array.isArray(faqsList) ? faqsList : [];

    if (selectedCategory !== 'ALL') {
      base = base.filter(f => f.category === selectedCategory);
    }

    if (!term) return base;

    return base.filter(faq => {
      if (!faq) return false;
      const q = normalizeText(faq.question);
      const a = normalizeText(faq.answer);
      const c = normalizeText(faq.category);
      return q.includes(term) || a.includes(term) || c.includes(term);
    });
  }, [searchTerm, selectedCategory]);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full flex flex-col justify-between">
      <div>
        {/* Header FAQs */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <HelpCircle size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Preguntas Frecuentes</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Búsqueda predictiva y respuestas técnicas en vivo</p>
            </div>
          </div>
        </div>

        {/* Real-Time Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por concepto (ej. WBS, JWT, roles, Brasil, semáforo)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value || '');
              setOpenIndex(0);
            }}
            className="input-field pl-10 pr-10 py-2.5 text-xs md:text-sm shadow-sm"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {faqCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-[0.7rem] font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-2.5">
          {filteredFaqs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center py-8 px-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50"
            >
              <HelpCircle size={22} className="mx-auto mb-2 text-zinc-400" />
              <h4 className="text-zinc-900 dark:text-white font-bold text-sm mb-1">
                No encontramos preguntas para "{searchTerm}"
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Intenta buscar términos como "roles", "JWT" o "semáforo".
              </p>
            </motion.div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div 
                  key={faq.question || idx}
                  className={`rounded-xl overflow-hidden border transition-all duration-200 ${
                    isOpen 
                      ? 'bg-white dark:bg-zinc-900 border-blue-500/50 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-3.5 sm:p-4 text-left flex justify-between items-center gap-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {faq.category}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        {faq.question}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-blue-600 dark:text-blue-400"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-4 sm:px-4 sm:pb-4 pt-1 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer link to Docs */}
      <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">¿Deseas consultar la base completa?</span>
        <Link
          to="/faqs"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
        >
          Centro de Ayuda Completo
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};
