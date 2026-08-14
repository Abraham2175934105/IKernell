import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageCircle, HelpCircle, Sparkles } from 'lucide-react';

const MESSAGES = [
  '¿Tienes un proyecto en mente? Hablemos.',
  '¿Necesitas ayuda técnica? Haz clic aquí.',
  'Te guiamos en la estimación de tu proyecto.',
  'Solicita una consultoría técnica aquí.',
  'Optimiza tu software con IKernell.',
  'Arquitectura N-Capas a tu medida.',
];

export const FloatingActions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [hoverWidget, setHoverWidget] = useState(false);
  const [hoverTop, setHoverTop] = useState(false);

  /* ── Scroll-to-top visibility (> 300px) ── */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Rotating messages every 4.5s ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 350);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToContact = () => {
    const el = document.getElementById('contacto');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus on first input if available
      setTimeout(() => {
        const input = el.querySelector('input');
        if (input) input.focus();
      }, 500);
    } else {
      window.location.hash = '#contacto';
    }
  };

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">

      {/* ── Scroll-to-top button con tooltip ─────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <div className="relative pointer-events-auto">
            <motion.button
              key="scroll-top"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHoverTop(true)}
              onMouseLeave={() => setHoverTop(false)}
              onClick={scrollToTop}
              aria-label="Volver arriba"
              className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
            >
              <ArrowUp size={18} strokeWidth={2} />
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {hoverTop && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[0.68rem] font-semibold whitespace-nowrap shadow-md pointer-events-none border border-zinc-700"
                >
                  Volver al inicio
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* ── Floating contact widget con guía dinámica ───────────────── */}
      <div className="relative pointer-events-auto">
        <motion.button
          onClick={scrollToContact}
          onMouseEnter={() => setHoverWidget(true)}
          onMouseLeave={() => setHoverWidget(false)}
          aria-label="Contactar con IKernell"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 cursor-pointer border border-blue-400/40 transition-colors duration-200"
        >
          {/* Pulse icon */}
          <span className="relative flex-shrink-0">
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-white/50"
            />
            <MessageCircle size={17} strokeWidth={2} className="relative z-10" />
          </span>

          {/* Rotating message */}
          <div className="flex flex-col text-left">
            <span className="text-[0.58rem] font-extrabold uppercase tracking-widest text-blue-200">
              Asistencia Directa
            </span>
            <AnimatePresence mode="wait">
              {msgVisible && (
                <motion.span
                  key={msgIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[0.72rem] font-bold leading-tight max-w-[175px]"
                >
                  {MESSAGES[msgIndex]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>

        {/* Hover Tooltip guide */}
        <AnimatePresence>
          {hoverWidget && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute right-0 bottom-full mb-2 px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-100 text-[0.68rem] font-medium whitespace-nowrap shadow-xl pointer-events-none border border-zinc-700 flex items-center gap-1.5"
            >
              <Sparkles size={11} className="text-blue-400" />
              Clic para desplazarte al formulario de contacto
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
