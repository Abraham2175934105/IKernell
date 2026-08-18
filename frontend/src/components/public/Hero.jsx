import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity, ChevronDown, Globe2, Terminal, Layers, Cpu, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import heroLightImg from '../../assets/hero-light.jpg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 }
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

/* ────────────────────────────────────────────────────────────────────────
   Micro-Tooltip de Métrica Técnica
──────────────────────────────────────────────────────────────────────── */
const MetricTooltip = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-colors p-0.5 rounded cursor-help"
        aria-label="Explicación técnica"
      >
        <Info size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-44 p-2 rounded-xl bg-zinc-900 text-zinc-100 text-[0.65rem] leading-snug shadow-xl z-50 pointer-events-none border border-zinc-700 text-center font-normal"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   Card Stack Data — telemetría corporativa con micro-guías
──────────────────────────────────────────────────────────────────────── */
const stacks = [
  {
    id: 1,
    icon: <Zap size={22} strokeWidth={1.8} />,
    badge: 'RNF-01 · Stateless REST',
    title: 'N-Capas & JWT Security',
    description: 'Desacoplamiento total entre React 18 SPA y Spring Boot 3 con sesiones tokenizadas sin estado ni cookies.',
    ctaLabel: 'Ver métricas de conexión',
    featured: false,
    headerTelemetria: 'Telemetría de Red & Sesión',
    metrics: [
      { icon: <Terminal size={14} strokeWidth={1.8} />, label: 'Latencia Media API', value: '< 38 ms', help: 'Rapidez de respuesta del sistema ante cada petición.' },
      { icon: <ShieldCheck size={14} strokeWidth={1.8} />, label: 'Autenticación', value: 'JWT · BCrypt', help: 'Sesiones tokenizadas seguras sin almacenamiento de cookies.' },
      { icon: <Layers size={14} strokeWidth={1.8} />, label: 'HikariCP Pool', value: '10 Conn · Leak 20s', help: 'Gestor de conexiones de alta concurrencia para evitar caídas.' },
    ]
  },
  {
    id: 2,
    icon: <Activity size={22} strokeWidth={1.8} />,
    badge: 'RF-25 · capacity.pulse',
    title: 'Semáforo Predictivo Live',
    description: 'Algoritmo en tiempo real que evalúa errores e interrupciones en ventanas de 21 días para anticipar riesgos.',
    ctaLabel: 'Desplegar algoritmo capacity.pulse',
    featured: true,
    headerTelemetria: 'Motor capacity.pulse Live',
    metrics: [
      { icon: <Cpu size={14} strokeWidth={1.8} />, label: 'capacity.pulse Score', value: '18 — Estable', help: 'Índice de fatiga operativa que previene el síndrome de burnout.' },
      { icon: <Layers size={14} strokeWidth={1.8} />, label: 'Ventana Analítica', value: '7 CTEs · 21 Días', help: 'Análisis temporal retrospectivo para detectar cuellos de botella.' },
      { icon: <Activity size={14} strokeWidth={1.8} />, label: 'Rebalanceo WBS', value: '0 Bloqueos', help: 'Flujo de trabajo continuo sin dependencias que frenen el sprint.' },
    ]
  },
  {
    id: 3,
    icon: <Globe2 size={22} strokeWidth={1.8} />,
    badge: 'RF-28 · Alianza Brasil',
    title: 'ETL Brasil & pg_trgm',
    description: 'Pipeline batch desatendido con exportaciones ISO 8601 UTC y motor Snippet.inject por trigramas en PostgreSQL.',
    ctaLabel: 'Ver detalles de exportación',
    featured: false,
    headerTelemetria: 'Integración Internacional & Trigrams',
    metrics: [
      { icon: <Terminal size={14} strokeWidth={1.8} />, label: 'Formato Global', value: 'ISO 8601 UTC', help: 'Estandarización de fechas para intercambio seguro con Brasil.' },
      { icon: <ShieldCheck size={14} strokeWidth={1.8} />, label: 'Integridad', value: 'Firma SHA-256', help: 'Sello criptográfico que certifica que los datos no fueron alterados.' },
      { icon: <Layers size={14} strokeWidth={1.8} />, label: 'Búsqueda GIN', value: 'pg_trgm < 50 ms', help: 'Búsqueda difusa de fragmentos de código a velocidad ultrarrápida.' },
    ]
  }
];

export const Hero = () => {
  const [activeStack, setActiveStack] = useState(null);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pb-20 pt-28 md:pt-32">

      {/* ── Background: Adaptive Dual Mode ─────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950 pointer-events-none">
        {/* Light Mode — imagen local nítida */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-100 dark:opacity-0"
          style={{ backgroundImage: `url(${heroLightImg}), url('/assets/hero-light.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-zinc-50/55" />
        </div>

        {/* Dark Mode — Night Earth */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-0 dark:opacity-100"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950/95" />
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-blue-500/10 dark:bg-blue-500/12 rounded-full blur-[110px] pointer-events-none z-0" />

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 text-center"
      >
        {/* Badge corporativo */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-md border border-zinc-200 dark:border-white/15 text-zinc-900 dark:text-zinc-100 text-xs md:text-sm font-semibold mb-7 shadow-md transition-colors duration-300"
        >
          <Sparkles size={15} className="text-blue-600 dark:text-blue-400" />
          Ingeniería de Software de Alto Nivel & Control Predictivo
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight leading-[1.07] mb-5 max-w-5xl mx-auto transition-colors duration-300"
        >
          Construimos Soluciones Tecnológicas de{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-600">
              Alto Impacto
            </span>
            <span className="absolute bottom-1 left-0 w-full h-2.5 bg-blue-500/18 rounded-sm -z-0" />
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={itemVariants}
          className="text-zinc-900 dark:text-zinc-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 font-semibold dark:font-medium leading-relaxed transition-colors duration-300"
        >
          IKernell combina Java 17 LTS con Spring Boot 3, interfaces reactivas en React 18 (Vite) y analítica predictiva en tiempo real mediante el Semáforo Inteligente y el motor capacity.pulse.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-12"
        >
          <Link
            to="/contacto"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 font-bold rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 hover:-translate-y-0.5 transition-all duration-200"
          >
            Consultar Servicios
            <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="/#servicios"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 font-bold rounded-xl bg-white/90 dark:bg-white/10 backdrop-blur-md text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/15 shadow-md transition-all duration-200"
          >
            Ver Portafolio
          </a>
        </motion.div>

        {/* ── Indicador Guía de Telemetría con Alto Contraste ─────────────── */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-700/80 text-zinc-900 font-bold dark:text-zinc-300 text-xs shadow-sm tracking-wide">
            <Layers size={14} className="text-blue-600 dark:text-blue-400" strokeWidth={2} />
            Pase el cursor sobre cada tarjeta para desplegar la telemetría
          </span>
        </motion.div>

        {/* ── TARJETAS APILADAS ────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pb-16 overflow-visible">

          {stacks.map((s) => (
            <div
              key={s.id}
              className="relative group/stack overflow-visible"
              style={{ minHeight: 290 }}
              onMouseEnter={() => setActiveStack(s.id)}
              onMouseLeave={() => setActiveStack(null)}
              onClick={() => setActiveStack(activeStack === s.id ? null : s.id)}
            >
              {/* ── CAPA INFERIOR DE SOPORTE (Telemetría / Modo Claro y Oscuro) ── */}
              <div
                className={`
                  absolute inset-0 rounded-2xl p-5
                  bg-white/95 text-zinc-900 border-zinc-200 shadow-xl
                  dark:bg-zinc-900/90 dark:border-zinc-700/60 dark:text-zinc-100
                  border transition-all duration-300 ease-out
                  flex flex-col justify-between
                  ${activeStack === s.id
                    ? 'translate-y-[4.5rem] opacity-100 blur-0 backdrop-blur-none z-40'
                    : 'translate-y-2 opacity-75 blur-[1.5px] backdrop-blur-sm z-0 group-hover/stack:translate-y-[4.5rem] group-hover/stack:opacity-100 group-hover/stack:blur-0 group-hover/stack:backdrop-blur-none group-hover/stack:z-40'
                  }
                `}
              >
                {/* Header de la tarjeta inferior */}
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {s.headerTelemetria}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Métricas con micro-guías / tooltips */}
                <div className="space-y-2.5 py-2">
                  {s.metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-[0.72rem] font-medium">
                        <span className="text-zinc-400 dark:text-zinc-500">{m.icon}</span>
                        {m.label}
                        <MetricTooltip text={m.help} />
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100 text-[0.72rem] font-bold font-mono tracking-tight">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pie de estado */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[0.65rem] text-zinc-500 dark:text-zinc-400 font-semibold">
                  <span>Estado del servicio</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Operativo</span>
                </div>
              </div>

              {/* ── CAPA PRINCIPAL SUPERIOR (Frontal) ───────────────────────────── */}
              <div className={`
                relative rounded-2xl p-6
                bg-white/95 text-zinc-900 border-zinc-200 shadow-xl
                dark:bg-zinc-900/90 dark:border-zinc-700/60 dark:text-zinc-100
                border transition-all duration-300 z-20
                flex flex-col justify-between
                ${s.featured
                  ? 'border-blue-500/60 dark:border-blue-500/50 group-hover/stack:border-blue-500'
                  : 'border-zinc-200 dark:border-zinc-700 group-hover/stack:border-zinc-400 dark:group-hover/stack:border-zinc-500'
                }
              `} style={{ minHeight: 240 }}>

                {/* Top row */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-colors
                      ${s.featured
                        ? 'bg-blue-600 text-white shadow-blue-600/30'
                        : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 group-hover/stack:bg-blue-600 group-hover/stack:text-white group-hover/stack:border-blue-600'
                      }`}>
                      {s.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[0.62rem] font-bold uppercase tracking-wider
                      ${s.featured
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-100 mb-2 leading-snug">{s.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed font-medium">{s.description}</p>
                </div>

                {/* CTA row */}
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[0.7rem] font-bold mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span>{s.ctaLabel}</span>
                  <ArrowRight size={11} className="group-hover/stack:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}

        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-zinc-400 dark:text-zinc-500"
        >
          <span className="text-[0.6rem] font-bold tracking-widest uppercase">Scroll</span>
          <ChevronDown size={14} strokeWidth={2} />
        </motion.div>
      </motion.div>
    </section>
  );
};
