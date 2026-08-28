import React from 'react';
import { Faq } from '../../components/public/Faq';
import { ContactForm } from '../../components/public/ContactForm';
import { motion } from 'framer-motion';

export const ContactPage = () => {
  return (
    <div className="pt-36 pb-24 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05, margin: "0px 0px -30px 0px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-16 transform-gpu"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
            Centro de Contacto Corporativo
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto font-medium">
            Consulta nuestras preguntas frecuentes o envía una duda personalizada directamente a la administración de IKernell.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.05, margin: "0px 0px -30px 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel p-6 sm:p-8 transform-gpu"
          >
            <Faq />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.05, margin: "0px 0px -30px 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="transform-gpu"
          >
            <ContactForm />
          </motion.div>
        </div>

      </div>
    </div>
  );
};



