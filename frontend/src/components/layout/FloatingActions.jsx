import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageSquare, Sparkles } from 'lucide-react';

const MESSAGES = [
  '¿Tienes un proyecto en mente? Hablemos.',
  '¿Necesitas asesoría técnica? Haz clic aquí.',
  'Te guiamos en la estimación de tu software.',
  'Arquitectura escalable a la medida de tu empresa.',
  'Optimiza tus entregas con analítica predictiva.',
];

const messageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.96,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const FloatingActions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTop, setHoverTop] = useState(false);

  /* ── Scroll-to-top visibility (> 300px) ── */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Rotating messages with 5.5s interval & Hover Pause ── */
  useEffect(() => {
    if (isHovered) return; // Pausa el temporizador si el usuario tiene el cursor encima

    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isHovered]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToContact = () => {
    const el = document.getElementById('contacto');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const input = el.querySelector('input');
        if (input) input.focus();
      }, 500);
    } else {
      window.location.hash = '#contacto';
    }
  };

  return (
    <aside aria-label="Acciones flotantes" className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">

      {/* ── Botón Scroll-to-Top Compacto & Glassmorphic ─────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <div className="relative pointer-events-auto">
            <motion.button
              key="scroll-top"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoverTop(true)}
              onMouseLeave={() => setHoverTop(false)}
              onClick={scrollToTop}
              aria-label="Volver arriba"
              className="w-10 h-10 rounded-xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-700/70 text-zinc-700 dark:text-zinc-200 shadow-lg shadow-zinc-900/5 dark:shadow-none flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600 transition-colors duration-200 cursor-pointer"
            >
              <ArrowUp size={17} strokeWidth={2.2} />
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {hoverTop && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[0.68rem] font-semibold whitespace-nowrap shadow-md pointer-events-none border border-zinc-700"
                >
                  Volver al inicio
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* ── Widget Flotante de Asistencia Directa (Glassmorphic) ────── */}
      <div className="relative pointer-events-auto">
        <motion.button
          layout
          onClick={scrollToContact}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Contactar con IKernell"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ layout: { duration: 0.3, ease: 'easeOut' } }}
          className="group flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600/95 via-blue-600/90 to-blue-700/95 hover:from-blue-500 hover:to-blue-600 text-white shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35 border border-white/20 backdrop-blur-xl cursor-pointer transition-all duration-300"
        >
          {/* Isotipo con halo de pulso sutil */}
          <div className="relative flex-shrink-0">
            <span className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 dark:bg-white/10 shadow-inner border border-white/20">
              {/* Halo sutil */}
              <span className="absolute inset-0 rounded-xl bg-white/40 animate-ping opacity-30" />
              <MessageSquare size={16} strokeWidth={2.2} className="relative z-10 text-white group-hover:scale-110 transition-transform duration-200" />
              
              {/* Indicador live online */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600 shadow-sm ring-1 ring-emerald-300/50" />
            </span>
          </div>

          {/* Contenedor de Texto con Transición Cinematográfica */}
          <div className="flex flex-col text-left overflow-hidden min-w-[155px] max-w-[210px]">
            <span className="text-[0.56rem] font-black uppercase tracking-widest text-blue-200/90 flex items-center gap-1">
              <Sparkles size={9} className="text-blue-200" /> Asistencia Directa
            </span>

            <div className="relative min-h-[1.15rem] flex items-center mt-0.5">
              <AnimatePresence mode="wait">
                <motion.span
                  key={msgIndex}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-[0.73rem] font-bold leading-tight tracking-tight text-white block select-none"
                >
                  {MESSAGES[msgIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </motion.button>
      </div>

    </aside>
  );
};
