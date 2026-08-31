import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { 
  ArrowLeft, MessageSquare, ShieldCheck, Cpu, 
  Search, ChevronDown, HelpCircle, X, Layers, Database, Lock,
  Activity, RefreshCw, Terminal, Check, Copy, Clock, ThumbsUp, 
  ThumbsDown, AlertCircle, LifeBuoy, UserCheck, CheckCircle2,
  Workflow, Globe2, Server, FileText, CheckSquare, Zap,
  Compass, Users, KeyRound, ArrowRight, Sparkles, BookOpen, Code2
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const springTransition = { type: "spring", stiffness: 380, damping: 26 };

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

/* ────────────────────────────────────────────────────────────────────────
   Fondo Dinámico Ultra-Avanzado para Documentación & Base de Conocimiento
──────────────────────────────────────────────────────────────────────── */
const DocumentationBackground = () => {
  // Nodos de Conocimiento y Conexiones de Red
  const nodes = [
    { x: 8, y: 15, size: 4.5, dur: 7, delay: 0 },
    { x: 22, y: 40, size: 5.5, dur: 8.5, delay: 1.5 },
    { x: 15, y: 78, size: 4, dur: 6.5, delay: 0.8 },
    { x: 85, y: 18, size: 5, dur: 9, delay: 2 },
    { x: 92, y: 50, size: 4, dur: 7.5, delay: 1 },
    { x: 82, y: 82, size: 6, dur: 8, delay: 0.4 },
    { x: 50, y: 8, size: 4.5, dur: 6.8, delay: 2.2 },
    { x: 48, y: 92, size: 5, dur: 7.2, delay: 1.8 },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Malla Blueprint de Rejilla Técnica Fina */}
      <div 
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3b82f6 1px, transparent 1px),
            linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Orbes de Resplandor Neón Multicapa */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 35, 0],
          y: [0, -25, 0],
          opacity: [0.35, 0.6, 0.35]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-28 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-transparent dark:from-blue-600/25 dark:via-cyan-500/20 rounded-full blur-[130px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
          opacity: [0.3, 0.55, 0.3]
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 -right-20 w-[520px] h-[520px] bg-gradient-to-bl from-indigo-500/20 via-blue-500/15 to-transparent dark:from-indigo-600/20 dark:via-blue-600/15 rounded-full blur-[125px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          y: [0, -35, 0],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -bottom-20 -left-10 w-[480px] h-[480px] bg-gradient-to-tr from-cyan-400/15 via-blue-400/15 to-transparent dark:from-blue-500/20 dark:via-teal-500/15 rounded-full blur-[115px]"
      />

      {/* 3. Rayos Láser de Indexación de Documentos */}
      <motion.div
        animate={{
          y: ['-100%', '300%'],
          opacity: [0, 0.75, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/6 w-[1px] h-44 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent"
      />
      <motion.div
        animate={{
          y: ['-100%', '300%'],
          opacity: [0, 0.75, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute right-1/4 w-[1px] h-52 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent"
      />

      {/* 4. Nodos de Base de Conocimiento con Anillos de Pulso */}
      {nodes.map((node, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <motion.div
            animate={{
              scale: [1, 2.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: node.dur,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut"
            }}
            className="absolute -inset-2 rounded-full border border-blue-400/30 dark:border-cyan-400/40"
          />
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0.85, 0.4]
            }}
            transition={{
              duration: node.dur * 0.8,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut"
            }}
            className="rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
            style={{ width: node.size, height: node.size }}
          />
        </div>
      ))}
    </div>
  );
};

export const faqsData = [
  /* ── Categoría 1: General & Servicios Corporativos ── */
  {
    id: 1,
    category: 'GENERAL',
    categoryLabel: 'General & Servicios',
    roleTag: 'Público',
    readTime: '1 min',
    question: "¿Qué es IKernell y cómo ayuda a las empresas?",
    answer: "Es una plataforma de ingeniería de software diseñada para planificar, monitorear y predecir el avance de proyectos tecnológicos. Centraliza la asignación de actividades, el control de tiempos y la comunicación del equipo en un solo entorno seguro."
  },
  {
    id: 2,
    category: 'GENERAL',
    categoryLabel: 'General & Servicios',
    roleTag: 'Comercial',
    readTime: '1 min',
    question: "¿Cómo puedo solicitar una cotización o asesoría para un desarrollo?",
    answer: "Puedes utilizar nuestro formulario de contacto en línea seleccionando el asunto de tu interés. Un coordinador técnico revisará tus requerimientos y se comunicará en menos de 24 horas hábiles."
  },
  {
    id: 3,
    category: 'GENERAL',
    categoryLabel: 'General & Servicios',
    roleTag: 'Metodología',
    readTime: '1 min',
    question: "¿Qué metodologías de trabajo soporta la plataforma?",
    answer: "Soporta división de trabajo por etapas (metodología WBS) y flujos ágiles. Permite organizar proyectos por fases secuenciales, asignar tareas específicas al equipo y realizar seguimiento visual del cumplimiento."
  },

  /* ── Categoría 2: Gestión de Proyectos y Roles ── */
  {
    id: 4,
    category: 'GESTIÓN',
    categoryLabel: 'Gestión & Roles',
    roleTag: 'Seguridad',
    readTime: '1 min',
    question: "¿Cuáles son los roles de usuario y sus permisos dentro del sistema?",
    answer: "IKernell maneja tres roles operativos: el Coordinador (administra talento y solicitudes generales), el Líder de Proyecto (crea etapas, asigna actividades y vigila el cronograma) y el Desarrollador (registra avances, errores e interrupciones)."
  },
  {
    id: 5,
    category: 'GESTIÓN',
    categoryLabel: 'Gestión & Roles',
    roleTag: 'Operación',
    readTime: '1 min',
    question: "¿Cómo se mide el avance real de cada etapa o actividad?",
    answer: "Cada desarrollador actualiza el estado de sus actividades asignadas (Pendiente, En Proceso, Finalizada). El sistema consolida automáticamente estos porcentajes para mostrar el progreso global de la etapa y del proyecto en tiempo real."
  },
  {
    id: 6,
    category: 'GESTIÓN',
    categoryLabel: 'Gestión & Roles',
    roleTag: 'Control',
    readTime: '1 min',
    question: "¿Cómo se realiza el registro de errores e interrupciones en el desarrollo?",
    answer: "Los desarrolladores cuentan con formularios rápidos para reportar bloqueos técnicos (con nivel de severidad) o tiempos muertos externos, asociándolos directamente a la fase y al proyecto en ejecución para anticipar retrasos."
  },

  /* ── Categoría 3: Control Predictivo & Alianzas ── */
  {
    id: 7,
    category: 'INNOVACIÓN',
    categoryLabel: 'Control Predictivo',
    roleTag: 'Prevención',
    readTime: '1 min',
    question: "¿Qué es el Semáforo Predictivo de Riesgos?",
    answer: "Es un panel automatizado que analiza la acumulación de errores, retrasos e interrupciones en las últimas semanas de trabajo. Clasifica el estado del proyecto en tres niveles (Verde: Todo en orden, Amarillo: Precaución, Rojo: Urgente) para rebalancear tareas antes de la fecha límite."
  },
  {
    id: 8,
    category: 'INNOVACIÓN',
    categoryLabel: 'Control Predictivo',
    roleTag: 'Internacional',
    readTime: '1 min',
    question: "¿En qué consiste la integración de reportes con Brasil?",
    answer: "Es un proceso que consolida las métricas del proyecto y las exporta en un formato plano certificado con un solo clic, listo para su transmisión e integración con la empresa aliada en Brasil con adaptación de horarios internacionales."
  },
  {
    id: 9,
    category: 'INNOVACIÓN',
    categoryLabel: 'Control Predictivo',
    roleTag: 'Colaboración',
    readTime: '1 min',
    question: "¿Qué herramientas de comunicación interna incluye el sistema?",
    answer: "Incluye canales de mensajería para coordinación de equipos, visualizadores de documentación técnica y módulos de capacitación interna para nuevos integrantes."
  },

  /* ── Categoría 4: Seguridad & Privacidad ── */
  {
    id: 10,
    category: 'SEGURIDAD',
    categoryLabel: 'Seguridad & Privacidad',
    roleTag: 'Protección',
    readTime: '1 min',
    question: "¿Cómo se garantiza la seguridad de las sesiones y la información?",
    answer: "La plataforma utiliza llaves de acceso digitales (tokens) firmadas criptográficamente para validar cada petición y cifra todas las contraseñas en la base de datos para que nadie pueda verlas."
  },
  {
    id: 11,
    category: 'SEGURIDAD',
    categoryLabel: 'Seguridad & Privacidad',
    roleTag: 'Tecnología',
    readTime: '1 min',
    question: "¿Qué tecnologías respaldan la plataforma?",
    answer: "La interfaz de usuario está construida con React para máxima fluidez y rapidez, conectada a través de servicios protegidos a un backend empresarial desarrollado en Java Spring Boot con bases de datos PostgreSQL."
  },
  {
    id: 12,
    category: 'SEGURIDAD',
    categoryLabel: 'Seguridad & Privacidad',
    roleTag: 'Respaldo',
    readTime: '1 min',
    question: "¿Los datos del proyecto están respaldados y seguros?",
    answer: "Sí, la base de datos relacional garantiza la integridad y consistencia de toda la información de proyectos, usuarios y reportes con respaldo continuo."
  }
];

const categoryItems = [
  { id: 'TODAS', label: 'Todas las Preguntas', icon: Layers },
  { id: 'GENERAL', label: 'General & Servicios', icon: HelpCircle },
  { id: 'GESTIÓN', label: 'Gestión & Roles', icon: Workflow },
  { id: 'INNOVACIÓN', label: 'Control Predictivo & Brasil', icon: Activity },
  { id: 'SEGURIDAD', label: 'Seguridad & Privacidad', icon: ShieldCheck },
];

const highlights = [
  {
    icon: Server,
    title: 'Arquitectura Estable',
    desc: 'Servicios desacoplados de alta velocidad y disponibilidad continua.'
  },
  {
    icon: Activity,
    title: 'Semáforo Predictivo',
    desc: 'Detección automática de sobrecarga para evitar demoras en entregas.'
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad por Roles',
    desc: 'Cada usuario accede únicamente a las funciones de su cargo.'
  },
  {
    icon: Globe2,
    title: 'Alianza Internacional',
    desc: 'Exportación de reportes certificados para socios en Brasil.'
  }
];

export const FaqPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});

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

  const handleIrContacto = () => {
    navigate(ROUTES.PUBLIC_CONTACT || '/contacto');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const firstInput = document.querySelector('form input, form textarea');
      if (firstInput) firstInput.focus();
    }, 300);
  };

  return (
    <div className="relative pt-32 pb-24 min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-hidden">
      
      {/* ── Fondo Blueprint & Orbes de Conocimiento Interactivo ── */}
      <DocumentationBackground />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={16} /> Volver a la Página Principal
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <BookOpen size={14} /> Base de Conocimiento Oficial
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight mb-4">
            Centro de Preguntas Frecuentes & Documentación
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            Respuestas claras y detalladas sobre el funcionamiento de IKernell, el semáforo predictivo, la gestión por roles y los estándares de seguridad.
          </p>
        </motion.div>

        {/* ── 4 Pilares de Documentación (Highlights Visuales) ──────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {highlights.map((h, idx) => {
            const IconComp = h.icon;
            return (
              <motion.div 
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col text-left hover:border-blue-500/50 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center mb-3 shadow-sm">
                  <IconComp size={20} />
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">{h.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{h.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Panel Principal de Búsqueda & FAQs ────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 md:p-10 shadow-xl text-left"
        >
          {/* Header del Panel */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Preguntas & Respuestas
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Encuentra respuestas rápidas organizadas por área temática
                </p>
              </div>
            </div>

            {/* Contador de resultados */}
            {filteredFaqs.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                <Check size={13} />
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'disponible' : 'disponibles'}
              </span>
            )}
          </div>

          {/* Buscador en Tiempo Real */}
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por pregunta o tema (ej. roles, semáforo, cotización, Brasil, seguridad)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpenIndex(0);
              }}
              className="input-field pl-11 pr-10 py-3.5 text-xs sm:text-sm shadow-sm"
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

          {/* Selector de Categorías (Pills Interactivas) */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categoryItems.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setOpenIndex(0);
                  }}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFaqCategoryPill"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30 -z-0"
                      transition={springTransition}
                    />
                  )}
                  <CatIcon size={14} className="relative z-10" />
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Listado de Acordeones */}
          <div className="flex flex-col gap-3">
            {filteredFaqs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-center py-10 px-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <AlertCircle size={24} />
                </div>
                <h4 className="text-zinc-900 dark:text-zinc-100 font-bold text-base mb-1">
                  No encontramos resultados para "{searchTerm}"
                </h4>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-5 font-normal">
                  Prueba buscando con palabras clave como "roles", "semáforo", "cotización" o "Brasil".
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setActiveCategory('TODAS'); }}
                    className="outline-button text-xs py-2 px-4 font-bold cursor-pointer"
                  >
                    Restablecer búsqueda
                  </button>
                  <button
                    type="button"
                    onClick={handleIrContacto}
                    className="gradient-button text-xs py-2 px-4 font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={13} /> Consultar con un Asesor
                  </button>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openIndex === idx;

                  return (
                    <motion.div 
                      key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
                        isOpen 
                          ? 'bg-white dark:bg-zinc-900 border-blue-500/50 dark:border-blue-500/50 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20' 
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-4 sm:p-5 text-left flex justify-between items-center gap-4 cursor-pointer"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${
                              isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
                            }`}>
                              {faq.categoryLabel}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-zinc-500 dark:text-zinc-400">
                              <Clock size={10} /> {faq.readTime}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-blue-600 dark:text-blue-400">
                              <UserCheck size={11} /> {faq.roleTag}
                            </span>
                          </div>
                          <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                            {faq.question}
                          </span>
                        </div>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isOpen
                            ? 'bg-blue-600 text-white rotate-180 shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rotate-0'
                        }`}>
                          <ChevronDown size={16} strokeWidth={2.2} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 sm:px-5 pb-5 text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal border-t border-zinc-100 dark:border-zinc-800 pt-4">
                              <p className="mb-4">{faq.answer}</p>
                              
                              {/* Footer Interactivo por Respuesta */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/70 text-xs">
                                
                                {/* Copiar Respuesta */}
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(faq.id, `${faq.question}\n\n${faq.answer}`, e)}
                                  className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors cursor-pointer"
                                >
                                  {copiedId === faq.id ? (
                                    <><Check size={13} className="text-emerald-500" /> ¡Copiado al portapapeles!</>
                                  ) : (
                                    <><Copy size={13} /> Copiar respuesta</>
                                  )}
                                </button>

                                {/* Feedback de Utilidad */}
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
                                        className="p-1 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-[0.7rem] font-bold cursor-pointer"
                                        title="Sí, fue útil"
                                      >
                                        <ThumbsUp size={11} /> Sí
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleFeedback(faq.id, 'no', e)}
                                        className="p-1 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/60 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[0.7rem] font-bold cursor-pointer"
                                        title="No resolvió mi duda"
                                      >
                                        <ThumbsDown size={11} /> No
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
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* ── Banner de Asistencia Directa al Final ─────────────────── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="mt-12 text-center bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MessageSquare size={22} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
            ¿Tienes dudas adicionales o un proyecto en mente?
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto mb-6 font-normal leading-relaxed">
            Nuestro equipo de ingenieros y coordinadores está listo para asesorarte y resolver cualquier requerimiento específico de tu empresa.
          </p>
          <button 
            type="button"
            onClick={handleIrContacto}
            className="gradient-button inline-flex items-center gap-2 text-sm py-3.5 px-8 font-bold shadow-lg shadow-blue-600/25 cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <MessageSquare size={16} /> Ir al Formulario de Contacto Directo
          </button>
        </motion.div>

      </div>
    </div>
  );
};
