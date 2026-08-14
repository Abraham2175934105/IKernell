import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity, ChevronDown, CheckCircle2, Layers, Cpu, Globe2, BarChart3, Database } from 'lucide-react';
import { motion } from 'framer-motion';

import heroLightImg from '../../assets/hero-light.jpg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
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

export const Hero = () => {
  const [activeStack, setActiveStack] = useState(null);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 pt-28 md:pt-36">
      
      {/* ── Background Layers: Dual Adaptive (Light Mode Local Image / Dark Mode Night Earth) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950 pointer-events-none">
        
        {/* 1. MODO CLARO (LIGHT MODE): Imagen Local Nítida al 100% */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0"
          style={{
            backgroundImage: `url(${heroLightImg}), url('/assets/hero-light.jpg')`
          }}
        >
          {/* Viñeta sutil sin tapar la nitidez ni los colores de la imagen */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-zinc-50/60" />
        </div>

        {/* 2. MODO OSCURO (DARK MODE): Fondo Espacial Nocturno */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
          }}
        >
          {/* Filtro Cinematográfico Nocturno con gradientes de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/65 to-zinc-950/95" />
        </div>

      </div>

      {/* Brillos ambientales sutiles en Azul Corporativo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/8 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Contenido Principal con Contraste y Tipografía Limpia */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 text-center"
      >
        
        {/* Badge Corporativo con fondo de alto contraste */}
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-md border border-zinc-200 dark:border-white/15 text-zinc-900 dark:text-zinc-100 text-xs md:text-sm font-semibold mb-8 shadow-md dark:shadow-lg dark:shadow-blue-500/5 transition-colors duration-300"
        >
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400" /> 
          Ingeniería de Software de Alto Nivel & Control Predictivo
        </motion.div>

        {/* Título Principal */}
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.08] mb-6 max-w-5xl mx-auto transition-colors duration-300"
        >
          Construimos Soluciones Tecnológicas de{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-600">
              Alto Impacto
            </span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-500/20 rounded-sm -z-0" />
          </span>
        </motion.h1>

        {/* Subtítulo alineado a la arquitectura real */}
        <motion.p 
          variants={itemVariants}
          className="text-zinc-900 dark:text-zinc-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 font-semibold dark:font-medium leading-relaxed transition-colors duration-300"
        >
          IKernell combina la solidez de Java 17 LTS con Spring Boot 3, interfaces reactivas en React 18 (Vite) y analítica predictiva en tiempo real mediante el Semáforo Inteligente de Riesgos y el motor capacity.pulse.
        </motion.p>

        {/* Botones de Acción (CTAs) */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16 md:mb-20"
        >
          <Link 
            to="/contacto" 
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 font-bold rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-600/35 hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            Consultar Servicios 
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a 
            href="/#servicios" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 font-bold rounded-xl bg-white/90 dark:bg-white/10 backdrop-blur-md text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/15 hover:border-zinc-400 dark:hover:border-white/30 shadow-md transition-all duration-200"
          >
            Ver Portafolio
          </a>
        </motion.div>

        {/* ── CARD STACK INTERACTIVO (TARJETAS APILADAS CON CAPA INFERIOR DE SOPORTE) ── */}
        <motion.div variants={itemVariants} className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1.5">
            <Layers size={14} className="text-blue-600 dark:text-blue-400" />
            Tarjetas Apiladas Interactivas • Desliza el cursor para desplegar telemetría
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-7 text-left pt-2 pb-8">
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TARJETA STACK 1: N-CAPAS REST & SEGURIDAD JWT                   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div 
            className="relative group/stack min-h-[310px]"
            onMouseEnter={() => setActiveStack(1)}
            onMouseLeave={() => setActiveStack(null)}
            onClick={() => setActiveStack(activeStack === 1 ? null : 1)}
          >
            {/* CAPA INFERIOR DE SOPORTE (Detalle Técnico / Telemetría Revelada) */}
            <div className={`absolute inset-0 rounded-3xl p-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white border border-blue-400/40 shadow-2xl transition-all duration-500 ease-out flex flex-col justify-end ${
              activeStack === 1 
                ? 'translate-y-24 scale-100 opacity-100 z-30 shadow-blue-500/20' 
                : 'translate-y-3 translate-x-2.5 scale-[0.97] opacity-80 z-0 group-hover/stack:translate-y-20 group-hover/stack:translate-x-0 group-hover/stack:scale-100 group-hover/stack:opacity-100 group-hover/stack:z-30'
            }`}>
              <div className="pt-2 border-t border-white/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-blue-200 font-bold">
                  <span>⚡ Latencia Media:</span>
                  <span className="text-emerald-400 font-mono font-black">&lt; 38 ms</span>
                </div>
                <div className="flex items-center justify-between text-blue-200 font-bold">
                  <span>🛡️ Autenticación:</span>
                  <span className="text-white font-mono">JWT + BCrypt (Costo 10)</span>
                </div>
                <div className="flex items-center justify-between text-blue-200 font-bold">
                  <span>🗄️ HikariCP Pool:</span>
                  <span className="text-emerald-400 font-mono">10 Conexiones / Leak 20s</span>
                </div>
              </div>
            </div>

            {/* CAPA PRINCIPAL SUPERIOR (Vista Frontal de la Tarjeta) */}
            <div className="relative rounded-3xl p-6 md:p-7 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 shadow-xl transition-all duration-300 z-10 flex flex-col justify-between h-[270px] group-hover/stack:border-blue-500/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <Zap size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    RNF-01 • REST Stateless
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white mb-2">N-Capas & Seguridad JWT</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                  Desacoplamiento total entre Frontend React 18 y Backend Spring Boot 3 con sesiones tokenizadas sin cookies.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold pt-2">
                <span>Ver métricas de conexión</span>
                <ArrowRight size={12} className="group-hover/stack:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TARJETA STACK 2 (DESTACADA): SEMÁFORO PREDICTIVO & BURNOUT        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div 
            className="relative group/stack min-h-[310px]"
            onMouseEnter={() => setActiveStack(2)}
            onMouseLeave={() => setActiveStack(null)}
            onClick={() => setActiveStack(activeStack === 2 ? null : 2)}
          >
            {/* CAPA INFERIOR DE SOPORTE (Motor capacity.pulse y 7 CTEs) */}
            <div className={`absolute inset-0 rounded-3xl p-6 bg-gradient-to-br from-blue-600 via-indigo-700 to-zinc-950 text-white border-2 border-blue-400/50 shadow-2xl transition-all duration-500 ease-out flex flex-col justify-end ${
              activeStack === 2 
                ? 'translate-y-24 scale-100 opacity-100 z-30 shadow-blue-600/30' 
                : 'translate-y-3.5 -rotate-1 scale-[0.97] opacity-85 z-0 group-hover/stack:translate-y-20 group-hover/stack:rotate-0 group-hover/stack:scale-100 group-hover/stack:opacity-100 group-hover/stack:z-30'
            }`}>
              <div className="pt-2 border-t border-white/25 space-y-2 text-xs">
                <div className="flex items-center justify-between text-blue-100 font-bold">
                  <span>🧠 capacity.pulse:</span>
                  <span className="text-emerald-300 font-mono font-black">Score 18 (Estable)</span>
                </div>
                <div className="flex items-center justify-between text-blue-100 font-bold">
                  <span>📊 Ventana 21 Días:</span>
                  <span className="text-white font-mono">7 CTEs Deslizantes (S1-S3)</span>
                </div>
                <div className="flex items-center justify-between text-blue-100 font-bold">
                  <span>🔄 Rebalanceo WBS:</span>
                  <span className="text-emerald-300 font-mono font-bold">0 Bloqueos Críticos</span>
                </div>
              </div>
            </div>

            {/* CAPA PRINCIPAL SUPERIOR (Card Destacada de Riesgo Live) */}
            <div className="relative rounded-3xl p-6 md:p-7 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-blue-500/60 dark:border-blue-500/40 shadow-2xl shadow-blue-500/10 transition-all duration-300 z-10 flex flex-col justify-between h-[270px] group-hover/stack:border-blue-500">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <Activity size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                    <CheckCircle2 size={11} /> 96% Salud Sprint
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white mb-2">Semáforo Predictivo Live</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                  Algoritmo en tiempo real que evalúa errores e interrupciones para predecir riesgos y balancear cargas.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold pt-2">
                <span>Desplegar algoritmo capacity.pulse</span>
                <ArrowRight size={12} className="group-hover/stack:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TARJETA STACK 3: AUTOMATIZACIÓN ETL BRASIL & POSTGRESQL          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div 
            className="relative group/stack min-h-[310px]"
            onMouseEnter={() => setActiveStack(3)}
            onMouseLeave={() => setActiveStack(null)}
            onClick={() => setActiveStack(activeStack === 3 ? null : 3)}
          >
            {/* CAPA INFERIOR DE SOPORTE (Detalle de Integración Internacional) */}
            <div className={`absolute inset-0 rounded-3xl p-6 bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950 text-white border border-emerald-400/40 shadow-2xl transition-all duration-500 ease-out flex flex-col justify-end ${
              activeStack === 3 
                ? 'translate-y-24 scale-100 opacity-100 z-30 shadow-emerald-500/20' 
                : 'translate-y-3 -translate-x-2.5 scale-[0.97] opacity-80 z-0 group-hover/stack:translate-y-20 group-hover/stack:translate-x-0 group-hover/stack:scale-100 group-hover/stack:opacity-100 group-hover/stack:z-30'
            }`}>
              <div className="pt-2 border-t border-white/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-200 font-bold">
                  <span>🌐 Formato Global:</span>
                  <span className="text-white font-mono">ISO 8601 UTC (Pipe Delimited)</span>
                </div>
                <div className="flex items-center justify-between text-emerald-200 font-bold">
                  <span>🔒 Integridad:</span>
                  <span className="text-emerald-400 font-mono">Firma SHA-256 Validada</span>
                </div>
                <div className="flex items-center justify-between text-emerald-200 font-bold">
                  <span>⚡ Extensión Trigram:</span>
                  <span className="text-white font-mono">pg_trgm + GIN (&lt; 50ms)</span>
                </div>
              </div>
            </div>

            {/* CAPA PRINCIPAL SUPERIOR (Vista Frontal) */}
            <div className="relative rounded-3xl p-6 md:p-7 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 shadow-xl transition-all duration-300 z-10 flex flex-col justify-between h-[270px] group-hover/stack:border-blue-500/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <Globe2 size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                    RF-28 • Alianza Brasil
                  </span>
                </div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white mb-2">ETL Brasil & Trigram Search</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                  Pipeline batch desatendido para transferencias transfronterizas y motor Snippet.inject con PostgreSQL pg_trgm.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold pt-2">
                <span>Ver detalles de exportación</span>
                <ArrowRight size={12} className="group-hover/stack:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </motion.div>

      </motion.div>

      {/* Indicador animado de desplazamiento (Scroll) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400"
        >
          <span className="text-[0.65rem] font-bold tracking-wider uppercase">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
};
