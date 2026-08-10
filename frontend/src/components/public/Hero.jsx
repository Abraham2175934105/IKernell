import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section className="pt-36 md:pt-48 pb-20 md:pb-28 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs md:text-sm font-semibold mb-8 shadow-sm backdrop-blur-md"
        >
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400" /> Innovación en Desarrollo de Software & Análisis Predictivo
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto"
        >
          Construimos Soluciones Tecnológicas de <span className="underline decoration-zinc-900 dark:decoration-white decoration-4 underline-offset-8">Alto Impacto</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 font-medium leading-relaxed"
        >
          IKernell Soluciones Software combina arquitectura Java Spring Boot, interfaces reactivas en React y analítica predictiva mediante el Semáforo Inteligente de Riesgos.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16 md:mb-24"
        >
          <Link to="/contacto" className="gradient-button w-full sm:w-auto text-base py-3.5 px-8 font-bold shadow-lg">
            Consultar Servicios <ArrowRight size={18} />
          </Link>
          <a href="/#servicios" className="outline-button w-full sm:w-auto text-base py-3.5 px-8 font-bold">
            Ver Portafolio
          </a>
        </motion.div>

        {/* Stat Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
          
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="glass-card flex flex-col justify-between p-6 md:p-8"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-5 text-zinc-900 dark:text-white shadow-sm">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">N-Capas REST</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">Desacoplamiento total entre Frontend React y Backend Java (RNF-01).</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="glass-card flex flex-col justify-between p-6 md:p-8 border-2 border-zinc-900 dark:border-zinc-300 shadow-xl shadow-zinc-300/30 dark:shadow-none"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center mb-5 shadow-md">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Semáforo Predictivo</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">Monitoreo en tiempo real de errores e interrupciones (RF-25).</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="glass-card flex flex-col justify-between p-6 md:p-8"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-5 text-zinc-900 dark:text-white shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Seguridad BCrypt</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">Sesiones JWT stateless y encriptación de grado militar (RNF-09/10).</p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};




