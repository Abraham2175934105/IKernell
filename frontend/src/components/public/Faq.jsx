import React, { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle, Search, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Normaliza cadenas de texto eliminando tildes, signos diacríticos y convirtiendo a minúsculas.
 */
const normalizeText = (text) => {
  if (!text) return '';
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

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado predictivo en tiempo real para el bloque de la landing
  const filteredFaqs = useMemo(() => {
    const term = normalizeText(searchTerm);
    const baseList = term ? faqsList : faqsList.slice(0, 4);

    return baseList.filter(faq => {
      const normalizedQuestion = normalizeText(faq.question);
      const normalizedAnswer = normalizeText(faq.answer);
      const normalizedCategory = normalizeText(faq.category);

      return !term || 
        normalizedQuestion.includes(term) || 
        normalizedAnswer.includes(term) ||
        normalizedCategory.includes(term);
    });
  }, [searchTerm]);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full flex flex-col justify-between">
      <div>
        {/* Header FAQs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center shadow-sm">
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Preguntas Frecuentes</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Búsqueda predictiva y respuestas técnicas en vivo</p>
            </div>
          </div>
        </div>

        {/* Real-Time Search Bar */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por pregunta, tecnología o concepto (ej. WBS, roles, semáforo, JWT)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOpenIndex(0);
            }}
            className="input-field pl-11 pr-10 py-3 text-sm shadow-sm"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')} 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-3">
          {filteredFaqs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="glass-card text-center py-8 px-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
                <HelpCircle size={24} />
              </div>
              <h4 className="text-zinc-900 dark:text-white font-bold text-base mb-1.5">
                No encontramos preguntas para "{searchTerm}"
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto font-normal">
                Intenta buscar con términos clave como "roles", "JWT", "WBS" o "semáforo".
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredFaqs.map((faq, idx) => (
                <motion.div 
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
                    openIndex === idx 
                      ? 'bg-white dark:bg-zinc-900 border-blue-500/50 dark:border-blue-500/50 shadow-md shadow-blue-500/5' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 bg-transparent cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-[0.62rem] font-black tracking-widest uppercase transition-colors ${
                        openIndex === idx 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {faq.category}
                      </span>
                      <span className="font-bold text-base text-zinc-900 dark:text-white leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      openIndex === idx
                        ? 'bg-blue-600 text-white rotate-180'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rotate-0'
                    }`}>
                      <ChevronDown size={16} strokeWidth={2.2} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openIndex === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-normal border-t border-zinc-100 dark:border-zinc-800 pt-3.5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom Link to Full FAQ Page */}
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          ¿Quieres explorar toda la base técnica?
        </span>
        <Link 
          to="/faqs" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider transition-colors"
        >
          Ver más detalles & FAQs <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
