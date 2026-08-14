import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageCircle } from 'lucide-react';

const MESSAGES = [
  '¿Tienes un proyecto en mente? Hablemos.',
  'Optimiza tu software con IKernell.',
  'Solicita una consultoría técnica aquí.',
  'Arquitectura a medida para tu empresa.',
  'Impulsa tu equipo con analítica predictiva.',
];

export const FloatingActions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);

  /* ── Scroll-to-top visibility ── */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Rotating messages every 5s ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToContact = () => {
    const el = document.getElementById('contacto');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: navigate to #contacto anchor
      window.location.hash = '#contacto';
    }
  };

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3">

      {/* ── Scroll-to-top button ─────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={scrollToTop}
            aria-label="Volver arriba"
            className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Floating contact widget ──────────────────────────────────── */}
      <motion.button
        onClick={scrollToContact}
        aria-label="Contactar con IKernell"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 cursor-pointer border border-blue-500/40 transition-colors duration-200"
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
        <AnimatePresence mode="wait">
          {msgVisible && (
            <motion.span
              key={msgIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-[0.72rem] font-bold leading-tight max-w-[170px] text-left"
            >
              {MESSAGES[msgIndex]}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
