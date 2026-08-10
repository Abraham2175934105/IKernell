import React from 'react';
import { Target, Eye, Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Strategy = () => {
  return (
    <section id="estrategia" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Lineamientos Estratégicos Corporativos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Nuestra visión empresarial se sostiene en la excelencia técnica, la transparencia transaccional y las alianzas estratégicas internacionales.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Misión */}
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            className="glass-card flex flex-col justify-between p-6 md:p-8"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-6 text-zinc-900 dark:text-white shadow-sm">
                <Target size={26} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Misión</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                Proveer productos de software robustos y seguros que resuelvan desafíos operativos complejos mediante metodologías ágiles, estándares de desarrollo de grado empresarial y algoritmos de mitigación proactiva de riesgos.
              </p>
            </div>
          </motion.div>

          {/* Visión */}
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
            className="glass-card flex flex-col justify-between p-6 md:p-8"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-6 text-zinc-900 dark:text-white shadow-sm">
                <Eye size={26} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Visión</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                Ser reconocidos internacionalmente como el referente tecnológico líder en ingeniería de software predictiva, expandiendo nuestras alianzas en Latinoamérica y consolidando la integración de procesos automatizados ETL.
              </p>
            </div>
          </motion.div>

          {/* Alianza Internacional Brasil */}
          <motion.div 
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
            className="glass-card flex flex-col justify-between p-6 md:p-8 border-2 border-zinc-900 dark:border-zinc-300 shadow-xl shadow-zinc-300/30 dark:shadow-none"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center mb-6 shadow-md">
                <Globe2 size={26} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Alianza Brasil</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                Convenio de cooperación tecnológica que unifica métricas operativas y formatos internacionales de fechas/monedas mediante transferencia segura de datos automatizados (RF-28 a RF-30).
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};




