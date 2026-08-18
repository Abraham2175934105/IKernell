import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, CheckCircle2, MessageSquare, Phone, Mail, User, Tag, 
  Loader2, AlertCircle, XCircle, HelpCircle, ArrowRight, Edit3, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

/* ────────────────────────────────────────────────────────────────────────
   Validation helpers
──────────────────────────────────────────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validate = (name, value) => {
  switch (name) {
    case 'nombre':
      return value.trim().length < 3 ? 'El nombre debe tener al menos 3 caracteres.' : '';
    case 'email':
      return !EMAIL_REGEX.test(value.trim()) ? 'Ingrese un correo electrónico válido (ej. nombre@empresa.com).' : '';
    case 'asunto':
      return value.trim().length < 4 ? 'El asunto debe tener al menos 4 caracteres.' : '';
    case 'mensaje':
      return value.trim().length < 20 ? `Mínimo 20 caracteres (${value.trim().length} ingresados).` : '';
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
  <AnimatePresence>
    {message && (
      <motion.p
        key={message}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1 mt-1.5 text-[0.7rem] font-semibold text-red-600 dark:text-red-400"
      >
        <AlertCircle size={11} /> {message}
      </motion.p>
    )}
  </AnimatePresence>
);

/* ────────────────────────────────────────────────────────────────────────
   Micro-Tooltip helper
──────────────────────────────────────────────────────────────────────── */
const FieldTooltip = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-zinc-400 hover:text-blue-500 transition-colors p-0.5 rounded-full cursor-help"
        aria-label="Ayuda contextual"
      >
        <HelpCircle size={13} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 p-2 rounded-xl bg-zinc-900 text-white text-[0.68rem] leading-snug shadow-xl z-30 pointer-events-none border border-zinc-700 text-center"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   Modal de Confirmación Preventiva (Doble Check)
──────────────────────────────────────────────────────────────────────── */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, data, loading }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
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
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3 mb-6 text-xs">
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Remitente</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-right">{data.nombre}</span>
            </div>
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Correo</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-right">{data.email}</span>
            </div>
            {data.telefono && (
              <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Teléfono</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200 text-right">{data.telefono}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem]">Asunto</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">{data.asunto}</span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[0.65rem] block mb-1">Mensaje</span>
              <p className="text-zinc-700 dark:text-zinc-300 italic text-[0.72rem] line-clamp-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                "{data.mensaje}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={14} /> Revisar datos
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
   ContactForm Principal con Validación Activa y UX Guiada
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

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast.message) return;
    const t = setTimeout(() => setToast({ type: null, message: '' }), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    e.preventDefault();
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
      // Trigger micro-shake animation and warning toast
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setToast({
        type: 'warning',
        message: 'Falta completar o corregir algunos campos obligatorios antes de continuar.',
      });
      return;
    }

    // Opens confirmation dialog (Doble Check)
    setShowConfirm(true);
  };

  /* Final network submit from confirmation modal */
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/contacto', {
        nombreRemitente: formData.nombre.trim(),
        emailRemitente: formData.email.trim(),
        telefono: formData.telefono.trim(),
        asunto: formData.asunto.trim(),
        mensaje: formData.mensaje.trim(),
      });

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
      setToast({
        type: 'error',
        message: 'Error al procesar el envío. Por favor intente de nuevo más tarde.',
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
    <div className="glass-card p-6 sm:p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">

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
          {/* Nombre & Correo */}
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

          {/* Teléfono & Asunto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                  <Tag size={13} className="text-zinc-400" /> Asunto de la Consulta *
                </label>
                <FieldTooltip text="Resume brevemente el motivo de tu consulta o área de interés." />
              </div>
              <input
                type="text"
                name="asunto"
                required
                value={formData.asunto}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Motivo de su consulta"
                className={inputCls('asunto')}
              />
              <FieldError message={touched.asunto ? errors.asunto : ''} />
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                <MessageSquare size={13} className="text-zinc-400" /> Detalle de su Consulta *
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[0.65rem] font-semibold tabular-nums ${
                  formData.mensaje.trim().length < 20
                    ? 'text-zinc-400 dark:text-zinc-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {formData.mensaje.trim().length}/20 mín.
                </span>
                <FieldTooltip text="Detalla el alcance, tecnologías o requerimientos específicos de tu proyecto." />
              </div>
            </div>
            <textarea
              name="mensaje"
              rows={4}
              required
              value={formData.mensaje}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describa detalladamente el motivo de su consulta o requerimiento de software..."
              className={`${inputCls('mensaje')} resize-y`}
            />
            <FieldError message={touched.mensaje ? errors.mensaje : ''} />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="gradient-button w-full text-sm sm:text-base py-3.5 mt-1 font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <Send size={17} /> Continuar y Revisar Solicitud
          </button>

        </motion.form>
      )}
    </div>
  );
};
