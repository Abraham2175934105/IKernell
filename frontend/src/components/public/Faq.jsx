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

export const Faq = ({ isFullView = false }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODAS');

  const faqs = [
    {
      category: 'ARQUITECTURA',
      question: "¿Qué tipo de soluciones de software desarrolla IKernell?",
      answer: "IKernell se especializa en aplicaciones empresariales de alta complejidad desarrolladas en Java Spring Boot y React.js, aplicando desgloses WBS por etapas, control transaccional e inteligencia predictiva de riesgos."
    },
    {
      category: 'SEMÁFORO',
      question: "¿Cómo funciona el algoritmo del Semáforo Predictivo?",
      answer: "El motor analiza en tiempo real las métricas de errores tipificados y la duración en minutos de las interrupciones reportadas por los desarrolladores. Si la tasa acumulada supera los umbrales de riesgo, el semáforo alerta automáticamente a los líderes para reasignar personal o extender plazos."
    },
    {
      category: 'ETL BRASIL',
      question: "¿En qué consiste la automatización ETL para la Alianza en Brasil?",
      answer: "Es un proceso que recopila las métricas del proyecto con un solo clic del Líder (o mediante una tarea programada batch desatendida), las estandariza a formatos ISO 8601 UTC en archivos planos con delimitador '|' y las envía mediante canales seguros por SFTP o correo corporativo."
    },
    {
      category: 'SEGURIDAD',
      question: "¿Cómo garantiza IKernell la seguridad de los datos de usuario y credenciales?",
      answer: "Cumplimos con una arquitectura de seguridad perimetral basada en JWT (sin cookies de sesión) y almacenamiento unidireccional de contraseñas con el algoritmo BCrypt (RNF-08 a RNF-10)."
    },
    {
      category: 'COMERCIAL',
      question: "¿Cómo puedo solicitar una cotización o consultoría tecnológica?",
      answer: "Puedes completar el formulario interactivo en el Centro de Contacto de este portal. Nuestro equipo de administración revisará tu solicitud y se pondrá en contacto en menos de 24 horas."
    },
    {
      category: 'ARQUITECTURA',
      question: "¿Qué motor de base de datos utiliza el ecosistema IKernell?",
      answer: "Utilizamos PostgreSQL 15+ con esquemas fuertemente tipados, índices B-Tree para optimización de consultas de alta concurrencia, restricciones de integridad referencial CASCADE y aislamiento transaccional READ COMMITTED."
    },
    {
      category: 'SEGURIDAD',
      question: "¿Cómo se gestionan los roles y permisos (RBAC)?",
      answer: "El sistema diferencia 3 roles de negocio: Coordinador (crea y gestiona personal), Líder (administra proyectos y monitorea el semáforo predictivo) y Desarrollador (reporta actividades, errores e interrupciones)."
    }
  ];

  const initialList = isFullView ? faqs : faqs.slice(0, 4);
  const categories = ['TODAS', 'ARQUITECTURA', 'SEMÁFORO', 'ETL BRASIL', 'SEGURIDAD', 'COMERCIAL'];

  // Filtrado reactivo en tiempo real con normalización de mayúsculas, minúsculas y tildes
  const filteredFaqs = useMemo(() => {
    const term = normalizeText(searchTerm);
    const baseList = isFullView ? faqs : (term || activeCategory !== 'TODAS' ? faqs : initialList);

    return baseList.filter(faq => {
      const normalizedQuestion = normalizeText(faq.question);
      const normalizedAnswer = normalizeText(faq.answer);
      const normalizedCategory = normalizeText(faq.category);

      const matchesSearch = 
        !term || 
        normalizedQuestion.includes(term) || 
        normalizedAnswer.includes(term) ||
        normalizedCategory.includes(term);

      const matchesCategory = activeCategory === 'TODAS' || faq.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, isFullView]);

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
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Preguntas Frecuentes</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Búsqueda predictiva y respuestas técnicas en vivo</p>
            </div>
          </div>
        </div>

        {/* Real-Time Search Bar */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por pregunta, tecnología o concepto (ej. JWT, riesgo, ETL)..."
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

        {/* Category Filter Badges (Visible in Full View or when filtering) */}
        {isFullView && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(0);
                }}
                className={`text-[0.68rem] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-3">
          {filteredFaqs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="glass-card text-center py-10 px-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
                <HelpCircle size={24} />
              </div>
              <h4 className="text-zinc-900 dark:text-white font-bold text-base mb-1.5">
                No encontramos preguntas para "{searchTerm}"
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto font-normal">
                Intenta buscar con otros términos clave como "Spring", "JWT", "Semáforo" o "PostgreSQL".
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
      {!isFullView && (
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
      )}
    </div>
  );
};
