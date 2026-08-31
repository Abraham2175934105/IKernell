import React from 'react';
import { Hero } from '../../components/public/Hero';
import { Services } from '../../components/public/Services';
import { Strategy } from '../../components/public/Strategy';
import { News } from '../../components/public/News';
import { Faq } from '../../components/public/Faq';
import { ContactForm } from '../../components/public/ContactForm';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Headphones, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const contactContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const contactHeaderVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' }
  }
};

const faqLeftSlideVariants = {
  hidden: { opacity: 0, x: -25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const formRightSlideVariants = {
  hidden: { opacity: 0, x: 25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export const LandingPage = () => {
  // Global scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen relative bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* ── Global Scroll Reading Progress Bar ──────────────────────── */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 origin-left z-50 shadow-md shadow-blue-500/30"
      />

      <Hero />
      <Services />
      <Strategy />
      <News />
      
      {/* ── Centro de Contacto & Atención (Contraste Perfecto Light & Dark) ── */}
      <section id="contacto" className="py-20 md:py-28 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs border-t border-zinc-200/80 dark:border-zinc-800/50 overflow-hidden relative">
        
        {/* Ambient glow */}
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          variants={contactContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 transform-gpu"
        >
          
          {/* Header */}
          <motion.div 
            variants={contactHeaderVariants}
            className="text-center mb-12 md:mb-16"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Headphones size={13} /> Soporte & Asesoría
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Atención Activa
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
              Centro de Contacto & Atención
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
              Resolvemos tus dudas técnicas e institucionales y recibimos tus mensajes directos para acompañar tus proyectos.
            </p>
          </motion.div>

          {/* FAQ & Contact Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-start">
            <motion.div 
              variants={faqLeftSlideVariants}
              className="rounded-3xl p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"
            >
              <Faq />
            </motion.div>

            <motion.div
              variants={formRightSlideVariants}
              className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"
            >
              <ContactForm />
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
