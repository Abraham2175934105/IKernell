import React from 'react';
import { Faq } from '../../components/public/Faq';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const FaqPage = () => {
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text transition-colors"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} /> Base de Conocimiento Institucional
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white tracking-tight mb-4">
            Centro de Preguntas Frecuentes & Documentación
          </h1>
          <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
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
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4 shadow-md">
              <Cpu size={24} />
            </div>
            <h4 className="font-bold text-black dark:text-white mb-1">Arquitectura N-Capas</h4>
            <p className="text-xs text-text-muted">Spring Boot 3 REST + React 18 SPA desacoplado.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4 shadow-md">
              <Sparkles size={24} />
            </div>
            <h4 className="font-bold text-black dark:text-white mb-1">Semáforo Predictivo</h4>
            <p className="text-xs text-text-muted">Cálculo dinámico de riesgos y contingencias.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-4 shadow-md">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-black dark:text-white mb-1">Seguridad BCrypt & JWT</h4>
            <p className="text-xs text-text-muted">Autenticación stateless sin cookies de sesión.</p>
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
          className="mt-12 text-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-8 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">¿Tienes una consulta adicional?</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
            Si no encontraste la respuesta a tu inquietud técnica o empresarial, nuestro equipo está listo para ayudarte.
          </p>
          <Link to="/contacto" className="gradient-button inline-flex text-sm py-2.5 px-6 font-bold">
            <MessageSquare size={16} /> Contactar a la Administración
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

