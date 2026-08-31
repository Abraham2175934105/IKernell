import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageSquare, Sparkles, Send, Headphones, CheckCircle2, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../config/routes';

/* ────────────────────────────────────────────────────────────────────────
   Diccionario de Mensajes Contextuales por Sección
──────────────────────────────────────────────────────────────────────── */
const CONTEXTUAL_PROMPTS = {
  hero: {
    tag: 'Asistente IKernell',
    title: '¡Descubre IKernell!',
    message: '¿Te damos un recorrido?',
    badgeColor: 'bg-blue-500'
  },
  servicios: {
    tag: 'Estructura WBS',
    title: 'Estructura tu equipo sin estrés',
    message: 'Solicita una demo técnica.',
    badgeColor: 'bg-indigo-500'
  },
  semaforo: {
    tag: 'Prevención Predictiva',
    title: 'Anticipa riesgos antes de que ocurran',
    message: '¿Hacemos una prueba de salud?',
    badgeColor: 'bg-emerald-500'
  },
  contacto: {
    tag: 'Canal Directo',
    title: '¿Hablamos de tu próximo proyecto?',
    message: 'Escríbenos directamente.',
    badgeColor: 'bg-blue-600'
  }
};

const badgeVariants = {
  initial: { opacity: 0, scale: 0.85, y: 6 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 22 }
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: -6,
    transition: { duration: 0.2 }
  }
};

export const FloatingActions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSection, setCurrentSection] = useState('hero');
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTop, setHoverTop] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const prevSectionRef = useRef('hero');

  /* ── Detección de Sección Activa para Scrolltelling ── */
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowScrollTop(y > 300);

      if (location.pathname === '/') {
        const serviciosEl = document.getElementById('servicios');
        const estrategiaEl = document.getElementById('estrategia');
        const noticiasEl = document.getElementById('noticias');
        const contactoEl = document.getElementById('contacto');

        const scrollMid = y + window.innerHeight * 0.4;

        let detected = 'hero';

        if (contactoEl && scrollMid >= contactoEl.offsetTop) {
          detected = 'contacto';
        } else if (noticiasEl && scrollMid >= noticiasEl.offsetTop) {
          detected = 'contacto';
        } else if (estrategiaEl && scrollMid >= estrategiaEl.offsetTop) {
          detected = 'semaforo';
        } else if (serviciosEl && scrollMid >= serviciosEl.offsetTop) {
          detected = 'servicios';
        }

        if (detected !== prevSectionRef.current) {
          prevSectionRef.current = detected;
          setCurrentSection(detected);
          setJustChanged(true);
          setTimeout(() => setJustChanged(false), 2400);
        }
      } else {
        setCurrentSection('contacto');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* ── Redirección Inteligente al Formulario de Contacto ── */
  const handleDirectAssistance = () => {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const firstInput = contactSection.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
      }, 550);
      return;
    }

    navigate(ROUTES.PUBLIC_CONTACT || '/contacto');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const formInput = document.querySelector('form input, form textarea');
      if (formInput) formInput.focus();
    }, 350);
  };

  const activePrompt = CONTEXTUAL_PROMPTS[currentSection] || CONTEXTUAL_PROMPTS.hero;

  return (
    <aside aria-label="Acciones flotantes del sistema" className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">

      {/* Botón Scroll-to-Top Compacto */}
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
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onMouseEnter={() => setHoverTop(true)}
              onMouseLeave={() => setHoverTop(false)}
              onClick={scrollToTop}
              aria-label="Volver arriba"
              className="w-10 h-10 rounded-xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-700/70 text-zinc-700 dark:text-zinc-200 shadow-lg flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer"
            >
              <ArrowUp size={17} strokeWidth={2.2} />
            </motion.button>

            <AnimatePresence>
              {hoverTop && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[0.68rem] font-bold whitespace-nowrap shadow-md pointer-events-none border border-zinc-700"
                >
                  Volver al inicio
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* Asistente Flotante Contextual Proactivo */}
      <div className="relative pointer-events-auto">
        <motion.button
          layout
          onClick={handleDirectAssistance}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ layout: { duration: 0.25, ease: 'easeOut' } }}
          className={`group flex items-center gap-3 pl-3.5 pr-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 border border-white/20 backdrop-blur-xl cursor-pointer transition-all duration-300 ${
            justChanged ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-zinc-950 animate-pulse' : ''
          }`}
        >
          {/* Isotipo con Halo de Notificación Activa */}
          <div className="relative flex-shrink-0">
            <span className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 dark:bg-white/10 shadow-inner border border-white/25">
              <MessageSquare size={16} strokeWidth={2.2} className="relative z-10 text-white group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600 shadow-xs" />
            </span>
          </div>

          {/* Contenido Contextual Reactivo */}
          <div className="flex flex-col text-left overflow-hidden min-w-[170px] max-w-[230px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[0.58rem] font-black uppercase tracking-wider text-blue-200 flex items-center gap-1">
                <Sparkles size={9} className="text-blue-200" />
                {activePrompt.tag}
              </span>
            </div>

            <div className="relative min-h-[1.2rem] flex items-center mt-0.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-0.5"
                >
                  <p className="text-[0.72rem] font-extrabold leading-tight text-white truncate">
                    {activePrompt.title}
                  </p>
                  <p className="text-[0.62rem] text-blue-100 font-medium leading-tight truncate flex items-center gap-1">
                    <span>{activePrompt.message}</span>
                    <ChevronRight size={10} className="text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.button>
      </div>

    </aside>
  );
};

export default FloatingActions;
