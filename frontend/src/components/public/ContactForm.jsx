import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, CheckCircle2, MessageSquare, Phone, Mail, User, Tag, 
  Loader2, AlertCircle, XCircle, HelpCircle, ArrowRight, Edit3, ShieldAlert,
  ChevronDown, Check, Search, Sparkles, Layers, ShieldCheck, Globe, FileText, Wrench, Palette, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

/* ────────────────────────────────────────────────────────────────────────
   Validation helpers defensivos
──────────────────────────────────────────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ASUNTOS_CONSULTA = [
  {
    id: 'Desarrollo de Software a Medida (Proyecto Nuevo)',
    title: 'Desarrollo de Software a Medida',
    subtitle: 'Plataformas web, móviles o sistemas empresariales creados exactamente a la medida.',
    icon: Sparkles,
    badge: 'Proyecto Nuevo',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  {
    id: 'Consultoría & Arquitectura de Software',
    title: 'Consultoría & Semáforo de Riesgos',
    subtitle: 'Asesoría técnica para optimizar proyectos, prevenir retrasos y organizar equipos.',
    icon: Layers,
    badge: 'Prevención & Control',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  {
    id: 'Auditoría de Código & Ciberseguridad',
    title: 'Seguridad & Control de Acceso',
    subtitle: 'Protección de accesos, roles de usuario, privacidad de datos y blindaje de cuentas.',
    icon: ShieldCheck,
    badge: 'Seguridad',
    badgeColor: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
  },
  {
    id: 'Mantenimiento & Optimización de Aplicaciones',
    title: 'Bases de Datos & Mantenimiento',
    subtitle: 'Optimización de rendimiento, bases de datos y soporte continuo para aplicaciones.',
    icon: Wrench,
    badge: 'Optimización',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  {
    id: 'Integración de APIs & Servicios Web',
    title: 'Integraciones & Reportes Internacionales',
    subtitle: 'Conexión de sistemas, exportaciones automáticas de datos y reportes para Brasil.',
    icon: Globe,
    badge: 'Integraciones',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  },
  {
    id: 'Diseño UX/UI & Prototipado Interactivo',
    title: 'Diseño UX/UI & Experiencia Digital',
    subtitle: 'Interfaces modernas, fáciles de usar, prototipos interactivos y diseño web.',
    icon: Palette,
    badge: 'Diseño UX',
    badgeColor: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800'
  },
  {
    id: 'Soporte Técnico & Capacitación Empresarial',
    title: 'Soporte Técnico & Capacitación',
    subtitle: 'Acompañamiento especializado y entrenamiento práctico para tu equipo de trabajo.',
    icon: Headphones,
    badge: 'Soporte',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
  },
  {
    id: 'Solicitud de Cotización / Propuesta Comercial',
    title: 'Solicitud de Cotización Comercial',
    subtitle: 'Estimación de costos, plazos de entrega por etapas e información para contratación.',
    icon: FileText,
    badge: 'Cotización',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'Otro Asunto / Consulta General',
    title: 'Otro Asunto / Consulta General',
    subtitle: 'Pregunta o consulta general no especificada en las categorías anteriores.',
    icon: HelpCircle,
    badge: 'General',
    badgeColor: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
  }
];

const validate = (name, value) => {
  const str = (value || '').trim();
  switch (name) {
    case 'nombre':
      return str.length < 3 ? 'El nombre debe tener al menos 3 caracteres.' : '';
    case 'email':
      return !EMAIL_REGEX.test(str) ? 'Ingrese un correo electrónico válido (ej. nombre@empresa.com).' : '';
    case 'asunto':
      return !str ? 'Seleccione el asunto de su consulta.' : '';
    case 'mensaje':
      return str.length < 20 ? `Mínimo 20 caracteres (${str.length} ingresados).` : '';
    default:
      return '';
  }
};

/* ────────────────────────────────────────────────────────────────────────
   Toast notification
──────────────────────────────────────────────────────────────────────── */
const Toast = ({ type, message, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        key="toast"
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        role="alert"
        className={`flex items-start gap-3 rounded-2xl p-4 mb-5 border shadow-lg ${
          type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
            : type === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-300'
        }`}
      >
        <span className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />}
          {type === 'warning' && <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />}
          {type === 'error' && <AlertCircle size={18} className="text-red-600 dark:text-red-400" />}
        </span>
        <p className="flex-1 text-sm font-semibold leading-snug">{message}</p>
        <button onClick={onClose} className="flex-shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" aria-label="Cerrar">
          <XCircle size={16} />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ────────────────────────────────────────────────────────────────────────
   Field error inline
──────────────────────────────────────────────────────────────────────── */
const FieldError = ({ message }) => (
  <AnimatePresence mode="wait">
    {message && (
      <motion.p
        key="field-error"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.18 }}
        className="text-[0.72rem] text-red-600 dark:text-red-400 mt-1.5 font-semibold flex items-center gap-1"
      >
        <AlertCircle size={12} className="shrink-0" />
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

/* ────────────────────────────────────────────────────────────────────────
   Field Help Tooltip
──────────────────────────────────────────────────────────────────────── */
const FieldTooltip = ({ text }) => {
  const [open, setOpen] = useState(false);
  if (!text) return null;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-colors p-0.5 rounded cursor-help"
        aria-label="Ayuda del campo"
      >
        <HelpCircle size={13} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bottom-full mb-1.5 w-52 p-2.5 rounded-xl bg-zinc-900 text-zinc-100 text-[0.68rem] leading-snug shadow-xl z-50 pointer-events-none border border-zinc-700 text-center font-normal"
          >
            {text}
            <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   Selector Visual Amplio de Asuntos (Dropdown 100% de Ancho)
──────────────────────────────────────────────────────────────────────── */
const AsuntoDropdown = ({ value, onChange, onBlur, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedItem = ASUNTOS_CONSULTA.find(item => item.id === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  const filteredItems = ASUNTOS_CONSULTA.filter(item => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return item.title.toLowerCase().includes(q) || 
           item.subtitle.toLowerCase().includes(q) || 
           item.badge.toLowerCase().includes(q);
  });

  const handleSelect = (item) => {
    onChange(item.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Botón Principal (Trigger Amplio) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs sm:text-sm text-left transition-all cursor-pointer shadow-sm ${
          isOpen
            ? 'bg-white dark:bg-zinc-900 border-blue-500 ring-2 ring-blue-500/20 text-blue-600 dark:text-blue-400'
            : hasError
            ? 'bg-white dark:bg-zinc-900 border-red-400 dark:border-red-600 text-zinc-900 dark:text-zinc-100'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100'
        }`}
      >
        <span className="flex items-center gap-3 truncate min-w-0">
          {selectedItem ? (
            <>
              <selectedItem.icon size={17} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-bold truncate text-zinc-900 dark:text-zinc-100">{selectedItem.title}</span>
            </>
          ) : (
            <span className="text-zinc-400 font-medium truncate">-- Seleccione el asunto o servicio de su interés --</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
        />
      </button>

      {/* Menú Desplegable Flotante Amplio al 100% de Ancho */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 w-full bg-white dark:bg-zinc-900 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1.5 max-h-[380px] overflow-y-auto"
          >
            {/* Buscador interno rápido */}
            <div className="px-2 pt-1 pb-2 sticky top-0 bg-white dark:bg-zinc-900 z-10 border-b border-zinc-100 dark:border-zinc-800 mb-1">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar asunto o servicio por palabra clave..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Lista de Opciones */}
            <div className="space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isSelected = value === item.id;
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full p-3 rounded-xl flex items-start gap-3 transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-100'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        <ItemIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[0.62rem] font-bold shrink-0 border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[0.72rem] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No se encontraron asuntos que coincidan con "{searchTerm}".
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   Modal de Confirmación
──────────────────────────────────────────────────────────────────────── */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, data, loading }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading && onClose) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;
  const safeData = data || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className="fixed inset-0" onClick={!loading ? onClose : undefined} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-[95%] sm:w-full max-w-lg p-5 sm:p-7 md:p-8 shadow-2xl z-10 my-auto text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-100 leading-tight">
                ¿Confirmas el envío de tu consulta?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                Revisa los datos antes de despachar la solicitud a la administración.
              </p>
            </div>
          </div>

          {/* Data Summary Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3 mb-6 text-xs">
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Remitente</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-right">{safeData.nombre || 'N/A'}</span>
            </div>
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Correo</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-right">{safeData.email || 'N/A'}</span>
            </div>
            {safeData.telefono && (
              <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Teléfono</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200 text-right">{safeData.telefono}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Asunto</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">{safeData.asunto || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem] block mb-1">Mensaje</span>
              <p className="text-zinc-700 dark:text-zinc-300 text-[0.72rem] line-clamp-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                "{safeData.mensaje || ''}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Edit3 size={14} /> Revisar datos
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Enviando...</>
              ) : (
                <><Send size={14} /> Sí, enviar consulta</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   ContactForm Principal con Auto-Selección y Espacios Amplios
──────────────────────────────────────────────────────────────────────── */
export const ContactForm = () => {
  const INITIAL = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };

  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [toast, setToast] = useState({ type: null, message: '' });

  const firstInputRef = useRef(null);

  /* Listener para Auto-Selección cuando el usuario viene de "Consultar solución" */
  useEffect(() => {
    const handleAutoSelect = (e) => {
      const asuntoId = e?.detail?.asunto;
      if (asuntoId) {
        setFormData(prev => ({ ...prev, asunto: asuntoId }));
        setTouched(prev => ({ ...prev, asunto: true }));
        setErrors(prev => ({ ...prev, asunto: '' }));
        setToast({
          type: 'success',
          message: `Asunto "${asuntoId}" seleccionado automáticamente. Complete sus datos para continuar.`
        });
      }
    };
    window.addEventListener('ikernell-select-asunto', handleAutoSelect);
    return () => window.removeEventListener('ikernell-select-asunto', handleAutoSelect);
  }, []);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast.message) return;
    const t = setTimeout(() => setToast({ type: null, message: '' }), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || '' }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  /* Intercept submit -> Validate -> Open confirmation modal */
  const handlePreSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const allTouched = { nombre: true, email: true, asunto: true, mensaje: true };
    const allErrors = {
      nombre: validate('nombre', formData.nombre),
      email: validate('email', formData.email),
      asunto: validate('asunto', formData.asunto),
      mensaje: validate('mensaje', formData.mensaje),
    };

    setTouched(allTouched);
    setErrors(allErrors);

    if (Object.values(allErrors).some(Boolean)) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setToast({
        type: 'warning',
        message: 'Falta completar o corregir algunos campos obligatorios antes de continuar.',
      });
      return;
    }

    setShowConfirm(true);
  };

  /* Final network submit */
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/contacto', {
        nombreRemitente: (formData.nombre || '').trim(),
        emailRemitente: (formData.email || '').trim(),
        telefono: (formData.telefono || '').trim(),
        asunto: (formData.asunto || '').trim(),
        mensaje: (formData.mensaje || '').trim(),
      }, { timeout: 10000 });

      setShowConfirm(false);
      setSubmitted(true);
      setFormData(INITIAL);
      setTouched({});
      setErrors({});
      setToast({
        type: 'success',
        message: '¡Información enviada exitosamente! Un asesor técnico se comunicará contigo pronto.',
      });
    } catch (err) {
      console.error('Error enviando contacto:', err);
      setShowConfirm(false);
      const errorMsg = err?.response?.data?.message || err?.message || 'Error al procesar el envío. Por favor intente de nuevo más tarde.';
      setToast({
        type: 'error',
        message: `No se pudo entregar la solicitud: ${errorMsg}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (fieldName) => {
    const isRequired = ['nombre', 'email', 'asunto', 'mensaje'].includes(fieldName);
    if (!touched[fieldName] || !isRequired) return 'input-field';
    return errors[fieldName]
      ? 'input-field !border-red-500 dark:!border-red-500 !ring-2 !ring-red-500/20'
      : 'input-field !border-emerald-500 dark:!border-emerald-500';
  };

  return (
    <div className="glass-card p-6 sm:p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none text-left">

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalSubmit}
        data={formData}
        loading={loading}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
          <MessageSquare size={20} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Formulario de Contacto</h3>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm font-medium">
        ¿Tienes un requerimiento de software o consultoría? Envíanos tu mensaje directo a la administración.
      </p>

      {/* Toast notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: null, message: '' })}
      />

      {/* Success View */}
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-8 rounded-2xl text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={30} />
          </div>
          <h4 className="text-zinc-900 dark:text-zinc-100 text-xl font-bold mb-2">¡Mensaje Enviado con Éxito!</h4>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md mx-auto mb-6 font-normal">
            Gracias por contactar a IKernell Soluciones Software. Un asesor técnico revisará tu solicitud y se comunicará contigo a la brevedad.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="outline-button mx-auto text-sm py-2.5 px-6 font-bold cursor-pointer"
          >
            Enviar otra consulta
          </button>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handlePreSubmit}
          noValidate
          animate={isShaking ? { x: [-4, 4, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-5"
        >
          {/* Nombre & Correo (2 Columnas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                  <User size={13} className="text-zinc-400" /> Nombre Completo *
                </label>
                <FieldTooltip text="Escribe tu nombre completo o el de tu organización." />
              </div>
              <input
                ref={firstInputRef}
                type="text"
                name="nombre"
                required
                autoComplete="name"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Su nombre completo"
                className={inputCls('nombre')}
              />
              <FieldError message={touched.nombre ? errors.nombre : ''} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                  <Mail size={13} className="text-zinc-400" /> Correo Electrónico *
                </label>
                <FieldTooltip text="Escribe un correo corporativo válido para responderte formalmente." />
              </div>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="correo@empresa.com"
                className={inputCls('email')}
              />
              <FieldError message={touched.email ? errors.email : ''} />
            </div>
          </div>

          {/* Teléfono de Contacto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                <Phone size={13} className="text-zinc-400" /> Teléfono de Contacto
              </label>
              <FieldTooltip text="Opcional. Útil si prefieres comunicación telefónica directa." />
            </div>
            <input
              type="tel"
              name="telefono"
              autoComplete="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+57 (000) 000-0000"
              className="input-field"
            />
          </div>

          {/* Asunto de la Consulta (Ancho Completo & Espacioso) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                <Tag size={13} className="text-zinc-400" /> Asunto de la Consulta *
              </label>
              <FieldTooltip text="Selecciona el motivo principal de tu consulta o área de interés." />
            </div>
            <AsuntoDropdown
              value={formData.asunto}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, asunto: val }));
                setTouched((prev) => ({ ...prev, asunto: true }));
                setErrors((prev) => ({ ...prev, asunto: validate('asunto', val) }));
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, asunto: true }));
                setErrors((prev) => ({ ...prev, asunto: validate('asunto', formData.asunto) }));
              }}
              hasError={Boolean(touched.asunto && errors.asunto)}
            />
            <FieldError message={touched.asunto ? errors.asunto : ''} />
          </div>

          {/* Detalle de su Consulta (Ancho Completo & Espacioso con 5 Filas) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                <MessageSquare size={13} className="text-zinc-400" /> Detalle de su Consulta *
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[0.65rem] font-semibold tabular-nums ${
                  (formData.mensaje || '').trim().length < 20
                    ? 'text-zinc-400 dark:text-zinc-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {(formData.mensaje || '').trim().length}/20 mín.
                </span>
                <FieldTooltip text="Describe detalladamente el alcance, requerimientos o dudas específicas de tu proyecto." />
              </div>
            </div>
            <textarea
              name="mensaje"
              rows={5}
              required
              value={formData.mensaje}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describa detalladamente el motivo de su consulta, requerimiento de software o preguntas sobre nuestros servicios..."
              className={`${inputCls('mensaje')} resize-y`}
            />
            <FieldError message={touched.mensaje ? errors.mensaje : ''} />
          </div>

          {/* Botón de Envío Principal */}
          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full text-sm sm:text-base py-3.5 mt-2 font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Procesando Solicitud...</>
            ) : (
              <><Send size={17} /> Continuar y Revisar Solicitud</>
            )}
          </button>

        </motion.form>
      )}
    </div>
  );
};
