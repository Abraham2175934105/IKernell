import React, { useState, useEffect } from 'react';
import { Target, Compass, TrendingUp, Globe2, ShieldCheck, CheckCircle2, Binary, Cpu, ArrowRight, Zap, RefreshCw, ArrowLeftRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const strategyContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const strategyHeaderVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' }
  }
};

const strategyCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const strategies = [
  {
    icon: <Compass size={24} strokeWidth={2} />,
    badge: 'Nuestro Propósito',
    title: 'Misión Empresarial',
    description: 'Ayudar a las empresas a crear software de primer nivel de forma ágil, segura y ordenada, evitando retrasos y cuidando el bienestar de los equipos de trabajo.',
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    metrics: [
      { label: 'Enfoque', value: 'Resultados Ágiles' },
      { label: 'Calidad', value: 'Empresarial' },
    ],
    accent: false
  },
  {
    icon: <TrendingUp size={24} strokeWidth={2} />,
    badge: 'Hacia Dónde Vamos',
    title: 'Visión de Futuro',
    description: 'Ser la plataforma líder en Latinoamérica para la gestión inteligente de proyectos de tecnología, conectando empresas locales con aliados internacionales.',
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    metrics: [
      { label: 'Alcance', value: 'Latinoamérica' },
      { label: 'Innovación', value: 'Prevención Total' },
    ],
    accent: false
  },
  {
    icon: <Globe2 size={24} strokeWidth={2} />,
    badge: 'Alianza Estratégica',
    title: 'Conexión con Brasil',
    description: 'Acuerdo de cooperación internacional que permite intercambiar avances de proyectos y reportes certificados de forma automática y transparente.',
    image: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    metrics: [
      { label: 'Horarios', value: 'Adaptación Automática' },
      { label: 'Certificación', value: 'Sello Digital' },
    ],
    accent: true
  }
];

export const Strategy = () => {
  const [packetCount, setPacketCount] = useState(14820);

  useEffect(() => {
    const timer = setInterval(() => {
      setPacketCount(prev => prev + Math.floor(Math.random() * 3 + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="estrategia" className="py-20 md:py-28 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xs border-t border-zinc-200/80 dark:border-zinc-800/50 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        variants={strategyContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 transform-gpu"
      >
        
        {/* Section Header */}
        <motion.div 
          variants={strategyHeaderVariants}
          className="text-center mb-14 md:mb-18"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Target size={13} /> Compromiso Corporativo
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
            Lineamientos Estratégicos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Nuestra visión empresarial se sostiene en la excelencia técnica, la transparencia transaccional y las alianzas estratégicas internacionales.
          </p>
        </motion.div>

        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {strategies.map((item, idx) => (
            <motion.div
              key={idx}
              variants={strategyCardVariants}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className={`group relative overflow-hidden rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border flex flex-col h-full transition-all duration-300 ${
                item.accent
                  ? 'border-blue-500/50 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                <img 
                  src={item.image} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900 dark:via-zinc-900/30 dark:to-transparent" />
                
                {/* Icon Badge */}
                <div className={`absolute bottom-4 left-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 transform group-hover:scale-110 ${
                  item.accent 
                    ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-400/20'
                    : 'bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'
                }`}>
                  {item.icon}
                </div>

                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-full text-[0.62rem] font-black uppercase tracking-wider ${
                    item.accent
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-normal flex-1 mb-5">
                  {item.description}
                </p>

                {/* Key Metrics row */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
                  {item.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl text-center border border-zinc-100 dark:border-zinc-800">
                      <span className="block text-[0.62rem] font-bold text-zinc-400 uppercase tracking-wider">
                        {m.label}
                      </span>
                      <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 font-medium mt-0.5">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Live Telemetry Banner: Conexión Internacional Brasil ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 p-6 rounded-3xl bg-blue-50/80 dark:bg-zinc-900/90 border border-blue-200/90 dark:border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Globe2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Integración Automática de Reportes con Brasil
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[0.62rem] font-bold border border-emerald-200 dark:border-emerald-800">
                  En Línea
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Informes de avance certificados que se adaptan automáticamente a los husos horarios internacionales con un solo clic.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-2">
              <Award size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-zinc-600 dark:text-zinc-400">Reportes:</span>
              <strong className="text-zinc-900 dark:text-zinc-100">{packetCount.toLocaleString()} emitidos</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Envío:</span>
              <strong className="text-zinc-900 dark:text-zinc-100">Instantáneo</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-zinc-600 dark:text-zinc-400">Autenticidad:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">100% Verificada</strong>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};
