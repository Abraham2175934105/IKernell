import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity, ChevronDown } from 'lucide-react';
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
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* ── Background Layers: Dual Adaptive (Light Mode Local Image / Dark Mode Night Earth) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950">
        
        {/* 1. MODO CLARO (LIGHT MODE): Imagen Local Nítida y de Alta Resolución */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0"
          style={{
            backgroundImage: `url(${heroLightImg}), url('/assets/hero-light.jpg')`
          }}
        >
          {/* Viñeta sutil para enmarcar la escena sin tapar la nitidez ni los colores de la imagen */}
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

      {/* Contenido Principal con Contraste y Sombreado de Texto */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 text-center pt-28 pb-16 md:pt-0 md:pb-0"
      >
        
        {/* Badge Corporativo con fondo de alto contraste */}
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-md border border-zinc-200 dark:border-white/15 text-zinc-900 dark:text-zinc-100 text-xs md:text-sm font-semibold mb-8 shadow-md dark:shadow-lg dark:shadow-blue-500/5 transition-colors duration-300"
        >
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400" /> 
          Innovación en Desarrollo de Software & Análisis Predictivo
        </motion.div>

        {/* Título Principal con sombra tipográfica ligera para legibilidad sin opacar la imagen */}
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.08] mb-6 max-w-5xl mx-auto drop-shadow-[0_2px_12px_rgba(255,255,255,0.85)] dark:drop-shadow-none transition-colors duration-300"
        >
          Construimos Soluciones Tecnológicas de{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-600">
              Alto Impacto
            </span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-500/20 rounded-sm -z-0" />
          </span>
        </motion.h1>

        {/* Subtítulo con sombra de realce */}
        <motion.p 
          variants={itemVariants}
          className="text-zinc-900 dark:text-zinc-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-12 font-semibold dark:font-medium leading-relaxed drop-shadow-[0_1px_8px_rgba(255,255,255,0.9)] dark:drop-shadow-none transition-colors duration-300"
        >
          IKernell Soluciones Software combina arquitectura Java Spring Boot, interfaces reactivas en React y analítica predictiva mediante el Semáforo Inteligente de Riesgos.
        </motion.p>

        {/* Botones de Acción (CTAs) */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-20 md:mb-24"
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

        {/* Grid de Aspectos Clave con Glassmorphism Adaptativo */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 text-left">
          
          {/* Tarjeta 1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-zinc-200/90 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:border-blue-500/50 dark:hover:border-blue-500/30 shadow-lg shadow-zinc-900/5 dark:shadow-none hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">N-Capas REST</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">Desacoplamiento total entre Frontend React y Backend Java (RNF-01).</p>
          </motion.div>

          {/* Tarjeta 2 (Destacada) */}
          <motion.div 
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative bg-white/95 dark:bg-blue-600/10 backdrop-blur-xl border-2 border-blue-500/50 dark:border-blue-500/30 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/10 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-5 text-white shadow-md shadow-blue-600/30">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Semáforo Predictivo</h3>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed font-normal">Monitoreo en tiempo real de errores e interrupciones (RF-25).</p>
          </motion.div>

          {/* Tarjeta 3 */}
          <motion.div 
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-zinc-200/90 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:border-blue-500/50 dark:hover:border-blue-500/30 shadow-lg shadow-zinc-900/5 dark:shadow-none hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Seguridad BCrypt</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">Sesiones JWT stateless y encriptación de grado militar (RNF-09/10).</p>
          </motion.div>

        </motion.div>

      </motion.div>

      {/* Indicador animado de desplazamiento (Scroll) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400"
        >
          <span className="text-xs font-semibold tracking-wider uppercase">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
};
