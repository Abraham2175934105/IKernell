import React from 'react';
import { Hero } from '../../components/public/Hero';
import { Services } from '../../components/public/Services';
import { Strategy } from '../../components/public/Strategy';
import { News } from '../../components/public/News';
import { Faq } from '../../components/public/Faq';
import { ContactForm } from '../../components/public/ContactForm';
import { motion } from 'framer-motion';

const contactContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.05 }
  }
};

const contactHeaderVariants = {
  hidden: { opacity: 0, y: -25, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const faqLeftSlideVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const formRightSlideVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <Strategy />
      <News />
      
      {/* Contact & FAQ Section on Landing Page */}
      <section id="contacto" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
        <motion.div 
          variants={contactContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05, margin: "0px 0px -30px 0px" }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl 2xl:max-w-screen-2xl transform-gpu"
        >
          
          <motion.div 
            variants={contactHeaderVariants}
            className="text-center mb-14 md:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-5">
              Soporte
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
              Centro de Contacto & Atención
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
              Resolvemos tus dudas institucionales y recibimos tus mensajes directos para acompañar tus proyectos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
            <motion.div 
              variants={faqLeftSlideVariants}
              className="glass-panel p-6 sm:p-8"
            >
              <Faq />
            </motion.div>

            <motion.div
              variants={formRightSlideVariants}
            >
              <ContactForm />
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
