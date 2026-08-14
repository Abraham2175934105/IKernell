import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, ShieldCheck, Cpu, Sparkles, 
  Search, ChevronDown, HelpCircle, X, Layers, Database, Lock,
  Activity, RefreshCw, Terminal, Check, Copy, Clock, ThumbsUp, 
  ThumbsDown, AlertCircle, LifeBuoy, UserCheck, CheckCircle2
} from 'lucide-react';
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

const faqsData = [
  {
    id: 1,
    category: 'ARQUITECTURA',
    roleTag: 'General · Público',
    readTime: '1 min de lectura',
    question: "¿Qué tipo de soluciones de software desarrolla IKernell?",
    answer: "IKernell se especializa en aplicaciones empresariales de alta complejidad desarrolladas en Java Spring Boot y React.js, aplicando desgloses WBS por etapas, control transaccional e inteligencia predictiva de riesgos."
  },
  {
    id: 2,
    category: 'SEMÁFORO',
    roleTag: 'Líder · Coordinador',
    readTime: '1 min de lectura',
    question: "¿Cómo funciona el algoritmo del Semáforo Predictivo?",
    answer: "El motor analiza en tiempo real las métricas de errores tipificados y la duración en minutos de las interrupciones reportadas por los desarrolladores. Si la tasa acumulada supera los umbrales de riesgo, el semáforo alerta automáticamente a los líderes para reasignar personal o extender plazos."
  },
  {
    id: 3,
    category: 'ETL BRASIL',
    roleTag: 'Líder · Internacional',
    readTime: '1 min de lectura',
    question: "¿En qué consiste la automatización ETL para la Alianza en Brasil?",
    answer: "Es un proceso que recopila las métricas del proyecto con un solo clic del Líder (o mediante una tarea programada batch desatendida), las estandariza a formatos ISO 8601 UTC en archivos planos con delimitador '|' y las envía mediante canales seguros por SFTP o correo corporativo."
  },
  {
    id: 4,
    category: 'SEGURIDAD',
    roleTag: 'Desarrollador · Seguridad',
    readTime: '1 min de lectura',
    question: "¿Cómo garantiza IKernell la seguridad de los datos de usuario y credenciales?",
    answer: "Cumplimos con una arquitectura de seguridad perimetral basada en JWT (sin cookies de sesión) y almacenamiento unidireccional de contraseñas con el algoritmo BCrypt (RNF-08 a RNF-10)."
  },
  {
    id: 5,
    category: 'COMERCIAL',
    roleTag: 'Público · Clientes',
    readTime: '1 min de lectura',
    question: "¿Cómo puedo solicitar una cotización o consultoría tecnológica?",
    answer: "Puedes completar el formulario interactivo en el Centro de Contacto de este portal. Nuestro equipo de administración revisará tu solicitud y se pondrá en contacto en menos de 24 horas."
  },
  {
    id: 6,
    category: 'ARQUITECTURA',
    roleTag: 'Desarrollador · Base de Datos',
    readTime: '1 min de lectura',
    question: "¿Qué motor de base de datos utiliza el ecosistema IKernell?",
    answer: "Utilizamos PostgreSQL 15+ con esquemas fuertemente tipados, índices B-Tree para optimización de consultas de alta concurrencia, restricciones de integridad referencial CASCADE y aislamiento transaccional READ COMMITTED."
  },
  {
    id: 7,
    category: 'SEGURIDAD',
    roleTag: 'Todos los Roles (RBAC)',
    readTime: '1 min de lectura',
    question: "¿Cómo se gestionan los roles y permisos (RBAC)?",
    answer: "El sistema diferencia 3 roles de negocio: Coordinador (crea y gestiona personal), Líder (administra proyectos y monitorea el semáforo predictivo) y Desarrollador (reporta actividades, errores e interrupciones)."
  },
  {
    id: 8,
    category: 'ETL BRASIL',
    roleTag: 'Seguridad · Internacional',
    readTime: '1 min de lectura',
    question: "¿Qué validaciones de integridad se aplican a los archivos exportados?",
    answer: "Cada archivo generado para la alianza con Brasil incorpora una firma criptográfica SHA-256 en su encabezado y valida la estructura de campos numéricos y fechas ISO antes de su transmisión."
  }
];

const categoryItems = [
  { id: 'TODAS', label: 'Todas', icon: <Layers size={13} strokeWidth={1.8} /> },
  { id: 'ARQUITECTURA', label: 'Arquitectura', icon: <Cpu size={13} strokeWidth={1.8} /> },
  { id: 'SEMÁFORO', label: 'Semáforo', icon: <Activity size={13} strokeWidth={1.8} /> },
  { id: 'ETL BRASIL', label: 'ETL Brasil', icon: <RefreshCw size={13} strokeWidth={1.8} /> },
  { id: 'SEGURIDAD', label: 'Seguridad', icon: <ShieldCheck size={13} strokeWidth={1.8} /> },
  { id: 'COMERCIAL', label: 'Comercial', icon: <Database size={13} strokeWidth={1.8} /> },
];

export const FaqPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({}); // { [faqId]: 'yes' | 'no' }

  // Filtrado predictivo y en tiempo real
  const filteredFaqs = useMemo(() => {
    const term = normalizeText(searchTerm);
    return faqsData.filter((faq) => {
      const q = normalizeText(faq.question);
      const a = normalizeText(faq.answer);
      const c = normalizeText(faq.category);
      const r = normalizeText(faq.roleTag);

      const matchesSearch = !term || q.includes(term) || a.includes(term) || c.includes(term) || r.includes(term);
      const matchesCategory = activeCategory === 'TODAS' || faq.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleCopy = (id, text, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleFeedback = (faqId, value, e) => {
    e.stopPropagation();
    setFeedbackState((prev) => ({ ...prev, [faqId]: value }));
  };

  // Redirección y scroll suave a la sección de contacto en la landing page
  const handleIrContacto = () => {
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('contacto');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <div className="pt-36 pb-24 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles size={14} className="text-blue-600 dark:text-blue-400" /> Base de Conocimiento Institucional
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Centro de Preguntas Frecuentes & Documentación
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Conoce a profundidad la arquitectura técnica de IKernell, el funcionamiento del Semáforo Predictivo, los estándares ETL y las políticas de seguridad corporativa.
          </p>
        </motion.div>

        {/* ── BANNER GUÍA / PASO A PASO SUPERIOR ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-10 p-5 sm:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
              Guía de Navegación Rápida
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                1
              </span>
              <p className="leading-snug">
                <strong className="text-zinc-900 dark:text-white block mb-0.5">Filtra o busca:</strong>
                Escribe tu inquietud o elige una categoría temáticа.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                2
              </span>
              <p className="leading-snug">
                <strong className="text-zinc-900 dark:text-white block mb-0.5">Despliega la solución:</strong>
                Haz clic sobre cualquier tarjeta para leer la respuesta.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm">
              <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                3
              </span>
              <p className="leading-snug">
                <strong className="text-zinc-900 dark:text-white block mb-0.5">Soporte directo:</strong>
                ¿No encuentras lo que buscas? Usa el botón inferior a contacto.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Technical Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="glass-card p-6 flex flex-col items-center text-center border border-zinc-200 dark:border-zinc-800"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-4 shadow-sm">
              <Cpu size={24} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Arquitectura N-Capas</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Spring Boot 3 REST + React 18 SPA desacoplado.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="glass-card p-6 flex flex-col items-center text-center border border-zinc-200 dark:border-zinc-800"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-4 shadow-sm">
              <Sparkles size={24} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Semáforo Predictivo</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Cálculo dinámico de riesgos y contingencias.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="glass-card p-6 flex flex-col items-center text-center border border-zinc-200 dark:border-zinc-800"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Seguridad BCrypt & JWT</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Autenticación stateless sin cookies de sesión.</p>
          </motion.div>
        </div>

        {/* Searchable FAQ Interactive Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800"
        >
          {/* Header FAQs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center shadow-sm">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Preguntas & Respuestas Técnicas</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Filtra por módulo temático o busca palabras clave</p>
              </div>
            </div>

            {/* Match Counter Badge */}
            {filteredFaqs.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'respuesta disponible' : 'respuestas técnicas'}
              </span>
            )}
          </div>

          {/* Real-Time Search Bar */}
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por pregunta, tecnología o concepto (ej. JWT, riesgo, ETL, PostgreSQL)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpenIndex(0);
              }}
              className="input-field pl-11 pr-10 py-3.5 text-sm shadow-sm"
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

          {/* Category Filter Pills con Iconos Lucide Profesionales */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categoryItems.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(0);
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 border border-blue-500'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="flex flex-col gap-3.5">
            {filteredFaqs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="glass-card text-center py-10 px-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <AlertCircle size={28} />
                </div>
                <h4 className="text-zinc-900 dark:text-white font-bold text-lg mb-1.5">
                  No encontramos coincidencias para esa búsqueda
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6 font-normal">
                  ¿Tienes una consulta específica no incluida en este listado? Puedes contactar a nuestro equipo de soporte directamente.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setActiveCategory('TODAS'); }}
                    className="outline-button text-xs py-2.5 px-5 font-bold cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                  <button
                    type="button"
                    onClick={handleIrContacto}
                    className="gradient-button text-xs py-2.5 px-5 font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} /> Consultar a Soporte
                  </button>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredFaqs.map((faq, idx) => (
                  <motion.div 
                    key={faq.id}
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
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[0.62rem] font-black tracking-widest uppercase transition-colors ${
                            openIndex === idx 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-zinc-500 dark:text-zinc-400'
                          }`}>
                            {faq.category}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold text-zinc-500 dark:text-zinc-400">
                            <Clock size={10} /> {faq.readTime}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold text-zinc-500 dark:text-zinc-400">
                            <UserCheck size={10} /> {faq.roleTag}
                          </span>
                        </div>
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
                          <div className="px-5 pb-5 text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-normal border-t border-zinc-100 dark:border-zinc-800 pt-4">
                            <p className="mb-4">{faq.answer}</p>
                            
                            {/* Interactive Footer per Answer */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/70 text-xs">
                              
                              {/* Copy Answer Button */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(faq.id, `${faq.question}\n\n${faq.answer}`, e)}
                                  className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors cursor-pointer"
                                >
                                  {copiedId === faq.id ? (
                                    <><Check size={13} className="text-emerald-500" /> ¡Copiado al portapapeles!</>
                                  ) : (
                                    <><Copy size={13} /> Copiar respuesta</>
                                  )}
                                </button>
                              </div>

                              {/* Feedback Question */}
                              <div className="flex items-center gap-2">
                                <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">
                                  ¿Te fue útil esta respuesta?
                                </span>
                                {feedbackState[faq.id] ? (
                                  <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 size={12} /> ¡Gracias por tu valoración!
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => handleFeedback(faq.id, 'yes', e)}
                                      className="p-1 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-[0.7rem] font-semibold cursor-pointer"
                                      title="Sí, fue útil"
                                    >
                                      <ThumbsUp size={12} /> Sí
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleFeedback(faq.id, 'no', e)}
                                      className="p-1 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[0.7rem] font-semibold cursor-pointer"
                                      title="No, no resolvió mi duda"
                                    >
                                      <ThumbsDown size={12} /> No
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Contact Assistance Callout Expandido */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-12 text-center bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-sm"
        >
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
            ¿Tienes dudas adicionales o un proyecto en mente?
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6 font-medium leading-relaxed">
            Si no encontraste la respuesta técnica a tu requerimiento, nuestro equipo de soporte e ingeniería está listo para acompañarte.
          </p>
          <button 
            type="button"
            onClick={handleIrContacto}
            className="gradient-button inline-flex items-center gap-2 text-sm py-3.5 px-8 font-bold shadow-lg shadow-blue-600/25 cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <MessageSquare size={16} /> Ir al Formulario de Contacto
          </button>
        </motion.div>

      </div>
    </div>
  );
};
