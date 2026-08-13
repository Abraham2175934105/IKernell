import React from 'react';
import { Hero } from '../../components/public/Hero';
import { Services } from '../../components/public/Services';
import { Strategy } from '../../components/public/Strategy';
import { News } from '../../components/public/News';
import { Faq } from '../../components/public/Faq';
import { ContactForm } from '../../components/public/ContactForm';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <Strategy />
      <News />
      
      {/* Contact & FAQ Section on Landing Page */}
      <section id="contacto" className="py-20 md:py-28 border-t border-black/10 dark:border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-black dark:text-white tracking-tight mb-4">
              Centro de Contacto & Atención
            </h2>
            <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto font-medium">
              Resolvemos tus dudas institucionales y recibimos tus mensajes directos para acompañar tus proyectos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass-panel p-6 sm:p-8"
            >
              <Faq />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};



