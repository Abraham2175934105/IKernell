import React, { useState } from 'react';
import { Calendar, ArrowRight, Newspaper, Award, User, Tag, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsModal } from './NewsModal';

const newsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 }
  }
};

const newsHeaderVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const newsCardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  }
};

const newsItems = [
  {
    id: 1,
    date: "08 de Agosto, 2026",
    author: "Equipo de Analítica & Arquitectura IKernell",
    tag: "Innovación 1 • capacity.pulse",
    category: "innovacion",
    title: "Dashboard Predictivo de Riesgos y Semáforo Inteligente en Tiempo Real",
    summary: "IKernell implementa su motor analítico en tiempo real que evalúa patrones de errores e interrupciones en el WBS para prevenir el síndrome de burnout en desarrolladores y evitar retrasos en entregas críticas.",
    subtitle: "Telemetría Continua y Análisis Algorítmico sobre Ventanas de 21 Días",
    fullText: "El nuevo módulo capacity.pulse de IKernell combina la captura de telemetría operativa en PostgreSQL con un algoritmo analítico avanzado ejecutado sobre 7 CTEs deslizantes (S1, S2, S3). El sistema correlaciona la concentración de errores de código de severidad alta con los tiempos acumulados de interrupción técnica en ventanas de 21 días (3 semanas), calculando un Índice de Riesgo Operativo tricolor (Verde: Estable, Amarillo: Carga Elevada, Rojo: Riesgo Crítico). Esto permite a los Líderes de Proyecto y Coordinadores rebalancear tareas preventivamente antes de que impacten los plazos de entrega.",
    stack: [
      "PostgreSQL 14+ (Window Functions & 7 CTEs)",
      "Java 17 / Spring Boot 3",
      "@Transactional(readOnly = true)",
      "React 18 + Recharts Radar",
      "Framer Motion"
    ],
    benefits: [
      "Reducción del 42% en cuellos de botella e incumplimiento de sprints.",
      "Detección temprana de sobrecarga cognitiva y fatiga técnica.",
      "Rebalanceo inteligente de asignaciones WBS entre desarrolladores.",
      "Visibilidad ejecutiva de la salud del equipo en tiempo real."
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 2,
    date: "28 de Julio, 2026",
    author: "Dirección de Integración Internacional",
    tag: "Innovación 2 • Alianza Brasil",
    category: "innovacion",
    title: "Automatización ETL de Reportes Internacionales para Brasil",
    summary: "Automatización desatendida en el backend con Java Spring Boot que procesa métricas de proyectos y genera archivos planos delimitados con estandarización ISO 8601 UTC y sellado criptográfico SHA-256.",
    subtitle: "Pipeline Batch de Alta Velocidad y Transferencia Segura",
    fullText: "Para consolidar el acuerdo de cooperación técnica con la filial de ingeniería en Brasil, IKernell integró un pipeline ETL automatizado en Spring Boot. El motor extrae métricas de productividad, horas hombre y avances de etapas, transformando los datos a formatos de zona horaria internacional ISO 8601 UTC y empaquetándolos en archivos planos delimitados por tuberías (|). Cada lote generado incluye un hash criptográfico SHA-256 para auditoría de integridad y soporte para transferencia directa por SFTP y descarga instantánea.",
    stack: [
      "Spring Batch / Scheduled Services",
      "Java NIO (Streams de Alta Velocidad)",
      "Criptografía SHA-256 MessageDigest",
      "Protocolo SFTP Seguro",
      "React DataViewer con Sintaxis de Tuberías"
    ],
    benefits: [
      "Generación y sellado de lotes en menos de 500 ms.",
      "Garantía de inmutabilidad de datos en transferencias transfronterizas.",
      "Cumplimiento con normativas internacionales de auditoría.",
      "Visor de registros interactivo con descarga directa en un clic."
    ],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: false
  },
  {
    id: 3,
    date: "15 de Julio, 2026",
    author: "Comité de Seguridad y Ciberseguridad",
    tag: "Actualización de Arquitectura",
    category: "arquitectura",
    title: "Ecosistema Seguro N-Capas con Spring Boot 3, JWT y PostgreSQL",
    summary: "Despliegue de la arquitectura desacoplada de alto rendimiento con Spring Security 6, sesiones sin estado (Stateless), encriptación BCrypt y optimización de conexiones con HikariCP.",
    subtitle: "Seguridad Perimetral, Búsqueda Semántica pg_trgm y Resiliencia REST",
    fullText: "IKernell consolida su estándar arquitectónico de N-Capas con separación completa entre la SPA en React 18 y el backend en Java 17 Spring Boot 3. El sistema implementa autenticación tokenizada mediante JSON Web Tokens (JWT) firmados con HMAC-SHA256, protección de contraseñas con factor de costo 10 en BCrypt y persistencia en PostgreSQL con índices GIN y extensión pg_trgm para búsqueda difusa en submilisegundos, respaldado por un interceptor global de excepciones @RestControllerAdvice.",
    stack: [
      "Java 17 LTS + Spring Boot 3.4.2",
      "Spring Security 6 (JWT Stateless)",
      "BCrypt Password Encoder (Costo 10)",
      "PostgreSQL 14+ con HikariCP",
      "Extensión pg_trgm & Índices GIN"
    ],
    benefits: [
      "Eliminación de vulnerabilidades de sesión y cookies (Cero CSRF).",
      "Tiempos de respuesta de API REST inferiores a 45 ms.",
      "Protección de integridad con Soft-Delete de trabajadores.",
      "Búsqueda difusa de snippets y documentos en menos de 50 ms."
    ],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: false
  }
];

const filterCategories = [
  { id: 'all', label: 'Todas las Noticias' },
  { id: 'innovacion', label: 'Innovaciones IKernell' },
  { id: 'arquitectura', label: 'Arquitectura & Seguridad' },
];

export const News = () => {
  const [selectedNews, setSelectedNews] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredNews = activeFilter === 'all'
    ? newsItems
    : newsItems.filter(item => item.category === activeFilter);

  return (
    <section id="noticias" className="py-20 md:py-28 bg-zinc-50/60 dark:bg-zinc-950/60 backdrop-blur-xs border-t border-zinc-200/80 dark:border-zinc-800/50 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        variants={newsContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 transform-gpu"
      >
        
        {/* Section Header */}
        <motion.div 
          variants={newsHeaderVariants}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Newspaper size={13} /> Actualidad & Innovación
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
            Noticias & Actualidad Tecnológica
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Novedades corporativas, lanzamientos de arquitectura y avances en nuestras alianzas de ingeniería de software.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {filterCategories.map(f => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeNewsFilterPill"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30 -z-0"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* News Cards Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredNews.map((news) => (
              <motion.article 
                key={news.id} 
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border flex flex-col h-full transition-all duration-300 ${
                  news.featured
                    ? 'border-blue-500/50 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5'
                }`}
              >
                {/* Article Image */}
                <div className="relative h-52 overflow-hidden bg-zinc-950">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Tag Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                      news.featured 
                        ? 'bg-blue-600 text-white border border-blue-400/30'
                        : 'bg-zinc-900/85 text-white border border-white/15'
                    }`}>
                      {news.tag}
                    </span>
                  </div>

                  {news.featured && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[0.62rem] font-black uppercase tracking-wider bg-blue-500 text-white flex items-center gap-1 shadow-md">
                      <Award size={12} strokeWidth={2.5} /> Destacado
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-600 dark:text-blue-400" />
                      <span>{news.date}</span>
                    </div>
                    <span className="text-[0.68rem] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold truncate max-w-[130px]">
                      {news.author}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100 mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h3>
                  
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-normal flex-1 mb-6">
                    {news.summary}
                  </p>

                  {/* Interactive Button */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                      onClick={() => setSelectedNews(news)}
                      className="w-full inline-flex items-center justify-between py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-600 text-blue-700 hover:text-white dark:text-blue-300 dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 group/btn shadow-sm cursor-pointer"
                    >
                      <span>Más información</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

      </motion.div>

      {/* Interactive Detail Modal */}
      <NewsModal 
        isOpen={!!selectedNews} 
        onClose={() => setSelectedNews(null)} 
        news={selectedNews} 
      />
    </section>
  );
};
