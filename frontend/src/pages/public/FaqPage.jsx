import React from 'react';
import { Faq } from '../../components/public/Faq';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const FaqPage = () => {
  const navigate = useNavigate();

  const handleContactClick = () => {
    // Navigate to landing and scroll to the contact section
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('contacto');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <div className="pt-36 pb-24 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} /> Base de Conocimiento Institucional
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Centro de Preguntas Frecuentes & Documentación
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Conoce a profundidad la arquitectura técnica de IKernell, el funcionamiento del Semáforo Predictivo, los estándares ETL y las políticas de seguridad corporativa.
          </p>
        </motion.div>

        {/* Technical Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center mb-4 shadow-md">
              <Cpu size={24} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Arquitectura N-Capas</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Spring Boot 3 REST + React 18 SPA desacoplado.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center mb-4 shadow-md">
              <Sparkles size={24} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Semáforo Predictivo</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Cálculo dinámico de riesgos y contingencias.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center mb-4 shadow-md">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Seguridad BCrypt & JWT</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Autenticación stateless sin cookies de sesión.</p>
          </motion.div>
        </div>

        {/* Searchable FAQ Component in Full View Mode */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass-panel p-6 sm:p-10"
        >
          <Faq isFullView={true} />
        </motion.div>

        {/* Contact Assistance Callout */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-12 text-center bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">¿Tienes una consulta adicional?</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
            Si no encontraste la respuesta a tu inquietud técnica o empresarial, nuestro equipo está listo para ayudarte.
          </p>
          <button 
            type="button"
            onClick={handleContactClick}
            className="gradient-button inline-flex items-center gap-2 text-sm py-3 px-7 font-bold shadow-lg cursor-pointer hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <MessageSquare size={16} /> Ir al Formulario de Contacto
          </button>
        </motion.div>

      </div>
    </div>
  );
};
