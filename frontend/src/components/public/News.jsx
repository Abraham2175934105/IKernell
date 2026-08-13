import React from 'react';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const News = () => {
  const newsItems = [
    {
      date: "02 de Agosto, 2026",
      tag: "Innovación 1",
      title: "Despliegue del Semáforo Predictivo Inteligente en Proyectos Críticos",
      summary: "IKernell lanza el módulo de análisis en tiempo real que calcula dinámicamente el Nivel de Riesgo a partir del consumo concurrente de errores e interrupciones reportados por los desarrolladores."
    },
    {
      date: "28 de Julio, 2026",
      tag: "Innovación 2",
      title: "Consolidación de la Alianza con Brasil mediante Automatización ETL",
      summary: "Implementación exitosa del motor de exportación en un solo clic que estandariza formatos internacionales (ISO 8601 UTC) y transfiere archivos planos seguros por SFTP y correo corporativo."
    },
    {
      date: "15 de Julio, 2026",
      tag: "Seguridad & RNF",
      title: "Actualización de Seguridad: Arquitectura REST Stateless con JWT y BCrypt",
      summary: "Finalización de la refactorización perimetral de Spring Security garantizando autenticación tokenizada sin cookies y encriptación unidireccional de credenciales de trabajadores (RNF-08 a RNF-10)."
    }
  ];

  return (
    <section id="noticias" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Noticias & Actualidad Tecnológica
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Novedades corporativas, lanzamientos de arquitectura y avances en nuestras alianzas de desarrollo de software.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {newsItems.map((news, idx) => (
            <motion.article 
              key={idx} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
              className="glass-card flex flex-col justify-between p-6 md:p-8 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all h-full"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {news.tag}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Calendar size={13} className="text-zinc-900 dark:text-white" /> {news.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 leading-snug">{news.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">{news.summary}</p>
              </div>

              <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                <a href="/#contacto" className="text-zinc-900 dark:text-white font-semibold text-sm inline-flex items-center gap-1.5 hover:underline">
                  Leer más <ArrowUpRight size={16} />
                </a>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};




