import React from 'react';
import { Calendar, ArrowUpRight, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const newsItems = [
  {
    date: "02 de Agosto, 2026",
    tag: "Innovación 1",
    title: "Despliegue del Semáforo Predictivo Inteligente en Proyectos Críticos",
    summary: "IKernell lanza el módulo de análisis en tiempo real que calcula dinámicamente el Nivel de Riesgo a partir del consumo concurrente de errores e interrupciones reportados por los desarrolladores.",
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: true
  },
  {
    date: "28 de Julio, 2026",
    tag: "Innovación 2",
    title: "Consolidación de la Alianza con Brasil mediante Automatización ETL",
    summary: "Implementación exitosa del motor de exportación en un solo clic que estandariza formatos internacionales (ISO 8601 UTC) y transfiere archivos planos seguros por SFTP y correo corporativo.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    date: "15 de Julio, 2026",
    tag: "Seguridad & RNF",
    title: "Actualización de Seguridad: Arquitectura REST Stateless con JWT y BCrypt",
    summary: "Finalización de la refactorización perimetral de Spring Security garantizando autenticación tokenizada sin cookies y encriptación unidireccional de credenciales de trabajadores (RNF-08 a RNF-10).",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  }
];

export const News = () => {
  return (
    <section id="noticias" className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/50">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
      >
        
        {/* Section Header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-14 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-5">
            <Newspaper size={12} /> Actualidad
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Noticias & Actualidad Tecnológica
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Novedades corporativas, lanzamientos de arquitectura y avances en nuestras alianzas de desarrollo de software.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {newsItems.map((news, idx) => (
            <motion.article 
              key={idx} 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border flex flex-col h-full transition-all duration-300 ${
                news.featured
                  ? 'border-blue-500/40 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5'
              }`}
            >
              {/* Article Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-zinc-900 dark:via-transparent dark:to-transparent" />
                
                {/* Tag Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-widest shadow-md ${
                  news.featured 
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50'
                }`}>
                  {news.tag}
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <Calendar size={13} className="text-blue-500 dark:text-blue-400" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{news.date}</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2.5 leading-snug">{news.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal flex-1">{news.summary}</p>

                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/70">
                  <a 
                    href="/#contacto" 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 uppercase tracking-wider transition-colors group/link"
                  >
                    Leer más 
                    <ArrowUpRight size={13} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </motion.div>
    </section>
  );
};
