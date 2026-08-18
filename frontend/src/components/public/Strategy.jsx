import React from 'react';
import { Target, Eye, Globe2, Compass, TrendingUp, Building2 } from 'lucide-react';
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

const strategies = [
  {
    icon: <Compass size={24} strokeWidth={2} />,
    title: 'Misión',
    description: 'Proveer productos de software robustos y seguros que resuelvan desafíos operativos complejos mediante metodologías ágiles, estándares de desarrollo de grado empresarial y algoritmos de mitigación proactiva de riesgos.',
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    accent: false
  },
  {
    icon: <TrendingUp size={24} strokeWidth={2} />,
    title: 'Visión',
    description: 'Ser reconocidos internacionalmente como el referente tecnológico líder en ingeniería de software predictiva, expandiendo nuestras alianzas en Latinoamérica y consolidando la integración de procesos automatizados ETL.',
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    accent: false
  },
  {
    icon: <Globe2 size={24} strokeWidth={2} />,
    title: 'Alianza Brasil',
    description: 'Convenio de cooperación tecnológica que unifica métricas operativas y formatos internacionales de fechas/monedas mediante transferencia segura de datos automatizados (RF-28 a RF-30).',
    image: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    accent: true
  }
];

export const Strategy = () => {
  return (
    <section id="estrategia" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800/50">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
      >
        
        {/* Section Header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-14 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-5">
            <Target size={13} /> Corporativo
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
            Lineamientos Estratégicos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Nuestra visión empresarial se sostiene en la excelencia técnica, la transparencia transaccional y las alianzas estratégicas internacionales.
          </p>
        </motion.div>

        {/* Strategy Cards - Horizontal layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
          {strategies.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border flex flex-col h-full transition-all duration-300 ${
                item.accent
                  ? 'border-blue-500/40 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5'
              }`}
            >
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-900 dark:via-zinc-900/40 dark:to-transparent" />
                
                {/* Icon Badge */}
                <div className={`absolute bottom-4 left-6 w-13 h-13 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 ${
                  item.accent 
                    ? 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-blue-600/30 ring-2 ring-blue-400/20'
                    : 'bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-zinc-100 border border-zinc-200/90 dark:border-zinc-700/90 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white group-hover:border-blue-500 group-hover:shadow-blue-500/25'
                }`}>
                  {item.icon}
                </div>

                {item.accent && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[0.6rem] font-black uppercase tracking-widest shadow-md">
                    <Globe2 size={10} /> Internacional
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 leading-snug">{item.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal flex-1">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </section>
  );
};
