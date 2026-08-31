import React, { useState, useRef } from 'react';
import {
  ArrowRight, ShieldCheck, Activity, ChevronDown, Globe2,
  Terminal, Layers, Cpu, Info, Server, Gauge, DatabaseZap,
  CheckCircle2, Code2, Wifi, Sparkles, Eye, Shield, Play,
  Zap, Lock, RefreshCw, KeyRound, Binary, ArrowUpRight,
  Clock, Award, HelpCircle, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

import heroLightImg from '../../assets/hero-light.jpg';

/* ────────────────────────────────────────────────────────────────────────
   Framer Motion Spring Configurations (Rápidas, Vivas y Reversibles)
──────────────────────────────────────────────────────────────────────── */
const springTransition = { type: "spring", stiffness: 380, damping: 26 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.03 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

/* ────────────────────────────────────────────────────────────────────────
   Micro-Tooltip con Explicación Sencilla
──────────────────────────────────────────────────────────────────────── */
const MetricTooltip = ({ text }) => {
  const [open, setOpen] = useState(false);
  if (!text) return null;

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-colors p-0.5 rounded cursor-help"
        aria-label="Explicación sencilla"
      >
        <Info size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-56 p-2.5 rounded-xl bg-zinc-900 text-zinc-100 text-[0.68rem] leading-snug shadow-2xl z-50 pointer-events-none border border-zinc-700 text-center font-normal"
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
   Simuladores Vivos con Telemetría Integral (Completamente Nítidos)
──────────────────────────────────────────────────────────────────────── */

// Simulador 1: Protección & Acceso Blindado
const JwtSimView = () => (
  <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left text-xs shadow-sm">
    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
      <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
        <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" /> Validación de Usuario
      </span>
      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[0.65rem] flex items-center gap-1">
        <CheckCircle2 size={10} /> Llave Autorizada
      </span>
    </div>
    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
      <div className="flex items-center justify-between text-[0.7rem]">
        <span className="text-zinc-600 dark:text-zinc-400">Identidad confirmada:</span>
        <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Usuario Autenticado</strong>
      </div>
      <div className="flex items-center justify-between text-[0.7rem]">
        <span className="text-zinc-600 dark:text-zinc-400">Protección de cuenta:</span>
        <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Sin contraseñas expuestas</strong>
      </div>
    </div>
    <div className="text-[0.68rem] text-zinc-600 dark:text-zinc-400 flex items-center justify-between pt-0.5">
      <span>Privacidad garantizada</span>
      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Cero fugas de datos</span>
    </div>
  </div>
);

// Simulador 2: Semáforo de Riesgos
const PulseSimView = () => {
  const [level, setLevel] = useState('estable');

  const scoreMap = {
    estable: { 
      label: 'Todo en Orden', 
      desc: 'El equipo trabaja a buen ritmo y sin retrasos previstos.',
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-500', 
      badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      pct: '20%' 
    },
    carga: { 
      label: 'Carga Elevada', 
      desc: 'Hay muchas tareas juntas. Conviene reasignar antes de que haya demoras.',
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-500', 
      badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      pct: '55%' 
    },
    riesgo: { 
      label: 'Riesgo de Retraso', 
      desc: 'Alerta: se detectan errores acumulados que pueden frenar la entrega.',
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-500', 
      badge: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      pct: '90%' 
    },
  };

  const curr = scoreMap[level];

  return (
    <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left text-xs shadow-sm">
      <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
        <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Gauge size={14} className="text-blue-600 dark:text-blue-400" /> Estado del Proyecto
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${curr.badge}`}>
          {curr.label}
        </span>
      </div>

      <p className="text-[0.68rem] text-zinc-600 dark:text-zinc-400 leading-tight">
        {curr.desc}
      </p>

      {/* Barra Visual */}
      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${curr.bg}`}
          initial={false}
          animate={{ width: curr.pct }}
          transition={springTransition}
        />
      </div>

      {/* Selectores interactivos */}
      <div className="flex gap-1 pt-1">
        <button
          type="button"
          onClick={() => setLevel('estable')}
          className={`flex-1 py-1 rounded-lg text-[0.62rem] font-bold transition-all cursor-pointer ${
            level === 'estable'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          Normal
        </button>
        <button
          type="button"
          onClick={() => setLevel('carga')}
          className={`flex-1 py-1 rounded-lg text-[0.62rem] font-bold transition-all cursor-pointer ${
            level === 'carga'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          Precaución
        </button>
        <button
          type="button"
          onClick={() => setLevel('riesgo')}
          className={`flex-1 py-1 rounded-lg text-[0.62rem] font-bold transition-all cursor-pointer ${
            level === 'riesgo'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          Urgente
        </button>
      </div>
    </div>
  );
};

// Simulador 3: Reportes Automáticos Brasil
const EtlSimView = () => (
  <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left text-xs shadow-sm">
    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
      <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
        <Globe2 size={14} className="text-blue-600 dark:text-blue-400" /> Exportación Internacional
      </span>
      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[0.65rem]">
        Listo en 1 clic
      </span>
    </div>
    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
      <div className="flex items-center justify-between text-[0.7rem]">
        <span className="text-zinc-600 dark:text-zinc-400">Destino:</span>
        <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Alianza Estratégica Brasil</strong>
      </div>
      <div className="flex items-center justify-between text-[0.7rem]">
        <span className="text-zinc-600 dark:text-zinc-400">Validación:</span>
        <strong className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 size={11} /> Datos Verificados y Certificados
        </strong>
      </div>
    </div>
    <div className="text-[0.68rem] text-zinc-600 dark:text-zinc-400 flex items-center justify-between pt-0.5">
      <span>Horario adaptado</span>
      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Sin errores manuales</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────────────
   Card Stack Data — Totalmente Nítido y Bien Organizado
──────────────────────────────────────────────────────────────────────── */
const stacks = [
  {
    id: 1,
    icon: <Shield size={22} strokeWidth={2} />,
    badge: 'Seguridad Total',
    title: 'Protección & Acceso Seguro',
    description: 'Tus proyectos y datos están protegidos con los más altos estándares de seguridad, garantizando que solo las personas autorizadas puedan ingresar.',
    featured: false,
    simComponent: <JwtSimView />,
    metrics: [
      { icon: <Zap size={13} strokeWidth={2} />, label: 'Velocidad de Carga', value: 'Instantánea', help: 'La plataforma responde de inmediato sin hacerte esperar.' },
      { icon: <Lock size={13} strokeWidth={2} />, label: 'Privacidad de Cuentas', value: '100% Protegida', help: 'Tus contraseñas e información nunca quedan expuestas.' },
      { icon: <ShieldCheck size={13} strokeWidth={2} />, label: 'Estabilidad de Conexión', value: 'Sin Caídas', help: 'El sistema soporta múltiples usuarios trabajando a la vez.' },
    ]
  },
  {
    id: 2,
    icon: <Gauge size={22} strokeWidth={2} />,
    badge: 'Prevención Inteligente',
    title: 'Semáforo Predictivo de Retrasos',
    description: 'Monitorea el avance de tu equipo y detecta a tiempo si hay sobrecarga o riesgos de retraso para actuar antes de que afecte la fecha límite.',
    featured: true,
    simComponent: <PulseSimView />,
    metrics: [
      { icon: <Activity size={13} strokeWidth={2} />, label: 'Salud del Proyecto', value: 'Al Día y Estable', help: 'Semáforo automático que avisa si las entregas están a salvo.' },
      { icon: <Clock size={13} strokeWidth={2} />, label: 'Monitoreo Continuo', value: 'Tiempo Real', help: 'Evalúa el trabajo del equipo día a día automáticamente.' },
      { icon: <CheckCircle2 size={13} strokeWidth={2} />, label: 'Entregas a Tiempo', value: 'Sin Bloqueos', help: 'Ayuda a cumplir los compromisos fijados con tus clientes.' },
    ]
  },
  {
    id: 3,
    icon: <Globe2 size={22} strokeWidth={2} />,
    badge: 'Conexión Internacional',
    title: 'Reportes Automáticos para Brasil',
    description: 'Genera y envía informes de avance completos y certificados para aliados internacionales con un solo clic, sin papeleos ni demoras.',
    featured: false,
    simComponent: <EtlSimView />,
    metrics: [
      { icon: <Globe2 size={13} strokeWidth={2} />, label: 'Horario Internacional', value: 'Automático', help: 'Ajusta automáticamente fechas y horas al estándar internacional.' },
      { icon: <Award size={13} strokeWidth={2} />, label: 'Certificado de Datos', value: '100% Verificado', help: 'Sello digital que confirma que la información es auténtica y no fue alterada.' },
      { icon: <Zap size={13} strokeWidth={2} />, label: 'Búsqueda de Proyectos', value: 'Ultrarrápida', help: 'Encuentra cualquier archivo o proyecto en una fracción de segundo.' },
    ]
  }
];

export const Hero = () => {
  const [viewMode, setViewMode] = useState('overview');
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 md:pt-32 md:pb-24 overflow-visible">

      {/* ── Fondo del Mundo Nítido y Luminoso (Sin cubrirlo de blanco) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Modo Claro: Imagen de la Tierra Nítida y Clara */}
        <motion.div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-90 dark:opacity-0"
          style={{ backgroundImage: `url(${heroLightImg || '/assets/hero-light.jpg'})`, y: bgY }}
        >
          {/* Sutil viñeta inferior para transición limpia a secciones siguientes */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-transparent" />
        </motion.div>

        {/* Modo Oscuro */}
        <motion.div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-0 dark:opacity-35"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`, y: bgY }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/80" />
        </motion.div>
      </div>

      {/* Ambient Glow Suave */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* ── Contenido Principal ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 text-center transform-gpu overflow-visible">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          className="flex flex-col items-center overflow-visible"
        >
          {/* Badge corporativo */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-xs md:text-sm font-bold mb-6 shadow-sm"
          >
            <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Plataforma Inteligente de Gestión & Control de Proyectos</span>
          </motion.div>

          {/* H1 Principal */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight leading-[1.08] mb-5 max-w-5xl transition-colors duration-300"
          >
            Construimos Soluciones Tecnológicas de{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-400">
                Alto Impacto
              </span>
              <span className="absolute bottom-1 left-0 w-full h-2.5 bg-blue-500/20 rounded-sm -z-0" />
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            variants={itemVariants}
            className="text-zinc-800 dark:text-zinc-300 text-sm sm:text-lg md:text-xl max-w-3xl mb-8 font-medium leading-relaxed"
          >
            IKernell te ayuda a coordinar equipos de trabajo, anticipar riesgos de entrega y automatizar reportes para que tus proyectos de software se entreguen a tiempo y con la máxima calidad.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-8"
          >
            <Link
              to="/contacto"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 font-bold rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              Consultar Servicios
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="/#servicios"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 font-bold rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 hover:-translate-y-0.5 shadow-md transition-all duration-200 cursor-pointer"
            >
              <Eye size={16} className="text-zinc-600 dark:text-zinc-400" />
              Ver Portafolio
            </a>
          </motion.div>

          {/* Switch de Modo Interactivo */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-8">
            <div className="p-1 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('overview')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  viewMode === 'overview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Resumen de Beneficios
              </button>
              <button
                type="button"
                onClick={() => setViewMode('simulation')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'simulation'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sparkles size={13} className="text-amber-400 animate-pulse" />
                Demostración Interactiva en Vivo
              </button>
            </div>
          </motion.div>

          {/* ── 3 Tarjetas de Beneficios NÍTIDAS, LIMPIAS Y ORGANIZADAS (Como en la foto) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 w-full text-left overflow-visible relative">
            {stacks.map((s, idx) => (
              <motion.div
                key={s.id}
                custom={idx}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.015, transition: { type: "spring", stiffness: 280, damping: 20 } }}
                className={`group relative rounded-3xl bg-white dark:bg-zinc-900 border transition-all duration-300 flex flex-col justify-between overflow-visible shadow-xl ${
                  s.featured
                    ? 'border-blue-500/50 shadow-blue-500/10 ring-1 ring-blue-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 shadow-zinc-200/50 dark:shadow-none'
                }`}
              >
                {/* Header de la tarjeta */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${
                      s.featured
                        ? 'bg-blue-600 text-white shadow-blue-500/30'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                    }`}>
                      {s.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${
                      s.featured
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>

                {/* Subsección Nítida (Sin desenfoques) */}
                <div className="px-6 pb-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-b-3xl">
                  <AnimatePresence mode="wait">
                    {viewMode === 'overview' ? (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Garantías del Servicio
                          </span>
                          <span className="flex items-center gap-1 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            100% Operativo
                          </span>
                        </div>
                        {s.metrics.map((m, mIdx) => (
                          <div key={mIdx} className="flex items-center justify-between text-xs py-0.5">
                            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-[0.72rem]">
                              {m.icon}
                              {m.label}
                              <MetricTooltip text={m.help} />
                            </span>
                            <span className="font-semibold text-[0.72rem] text-zinc-900 dark:text-zinc-100">
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="simulation"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                      >
                        {s.simComponent}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 flex flex-col items-center gap-1 text-zinc-400 dark:text-zinc-500 z-10 pointer-events-none"
      >
        <span className="text-[0.62rem] font-bold tracking-widest uppercase">Scroll para explorar</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown size={15} />
        </motion.div>
      </motion.div>

    </section>
  );
};

export default Hero;
