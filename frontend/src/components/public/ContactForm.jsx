import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, MessageSquare, Phone, Mail, User, Tag, Loader2, AlertCircle, XCircle } from 'lucide-react';
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
      return !EMAIL_REGEX.test(value.trim()) ? 'Ingrese un correo electrónico válido.' : '';
    case 'asunto':
      return value.trim().length < 4 ? 'El asunto debe tener al menos 4 caracteres.' : '';
    case 'mensaje':
      return value.trim().length < 20 ? `Mínimo 20 caracteres (${value.trim().length} ingresados).` : '';
    default:
      return '';
  }
};

/* ────────────────────────────────────────────────────────────────────────
   Toast banner component (success / error)
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
        className={`flex items-start gap-3 rounded-2xl p-4 mb-5 border shadow-lg
          ${type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-300'
          }`}
      >
        <span className="flex-shrink-0 mt-0.5">
          {type === 'success'
            ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            : <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
          }
        </span>
        <p className="flex-1 text-sm font-semibold leading-snug">{message}</p>
        <button onClick={onClose} className="flex-shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" aria-label="Cerrar notificación">
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
   Input wrapper — adds red border on error, green border on valid
──────────────────────────────────────────────────────────────────────── */
const inputCls = (fieldName, errors, touched, formData) => {
  const isRequired = ['nombre', 'email', 'asunto', 'mensaje'].includes(fieldName);
  if (!touched[fieldName] || !isRequired) return 'input-field';
  return errors[fieldName]
    ? 'input-field !border-red-400 dark:!border-red-600 !ring-1 !ring-red-400/30'
    : 'input-field !border-emerald-400 dark:!border-emerald-600';
};

/* ────────────────────────────────────────────────────────────────────────
   ContactForm
──────────────────────────────────────────────────────────────────────── */
export const ContactForm = () => {
  const INITIAL = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };

  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({ type: null, message: '' });

  /* Auto-dismiss toast after 6 s */
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

  const isFormValid = () => {
    const required = ['nombre', 'email', 'asunto', 'mensaje'];
    return required.every((f) => !validate(f, formData[f]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields to show any missing errors
    const allTouched = { nombre: true, email: true, asunto: true, mensaje: true };
    const allErrors = {
      nombre: validate('nombre', formData.nombre),
      email: validate('email', formData.email),
      asunto: validate('asunto', formData.asunto),
      mensaje: validate('mensaje', formData.mensaje),
    };
    setTouched(allTouched);
    setErrors(allErrors);

    if (Object.values(allErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/contacto', {
        nombreRemitente: formData.nombre.trim(),
        emailRemitente: formData.email.trim(),
        telefono: formData.telefono.trim(),
        asunto: formData.asunto.trim(),
        mensaje: formData.mensaje.trim(),
      });

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
      setToast({
        type: 'error',
        message: 'Error al enviar el mensaje. Por favor intente de nuevo más tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center shadow-sm">
          <MessageSquare size={18} strokeWidth={1.8} />
        </div>
        <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Formulario de Contacto</h3>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm font-medium">
        ¿Tienes un requerimiento de software? Envíanos tu mensaje directamente a la administración de IKernell.
      </p>

      {/* Toast notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: null, message: '' })}
      />

      {/* Success panel with new-consultation option */}
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
          <h4 className="text-zinc-900 dark:text-white text-xl font-bold mb-2">¡Mensaje Enviado con Éxito!</h4>
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Nombre & Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <User size={13} className="text-zinc-400" /> Nombre Completo *
              </label>
              <input
                type="text" name="nombre" required autoComplete="name"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Su nombre completo"
                className={inputCls('nombre', errors, touched, formData)}
              />
              <FieldError message={touched.nombre ? errors.nombre : ''} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <Mail size={13} className="text-zinc-400" /> Correo Electrónico *
              </label>
              <input
                type="email" name="email" required autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="correo@empresa.com"
                className={inputCls('email', errors, touched, formData)}
              />
              <FieldError message={touched.email ? errors.email : ''} />
            </div>
          </div>

          {/* Teléfono & Asunto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <Phone size={13} className="text-zinc-400" /> Teléfono de Contacto
              </label>
              <input
                type="tel" name="telefono" autoComplete="tel"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+57 (000) 000-0000"
                className="input-field"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <Tag size={13} className="text-zinc-400" /> Asunto de la Consulta *
              </label>
              <input
                type="text" name="asunto" required
                value={formData.asunto}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Motivo de su consulta"
                className={inputCls('asunto', errors, touched, formData)}
              />
              <FieldError message={touched.asunto ? errors.asunto : ''} />
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                <MessageSquare size={13} className="text-zinc-400" /> Detalle de su Consulta *
              </span>
              <span className={`text-[0.65rem] font-semibold tabular-nums ${
                formData.mensaje.trim().length < 20
                  ? 'text-zinc-400 dark:text-zinc-500'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {formData.mensaje.trim().length}/20 mín.
              </span>
            </label>
            <textarea
              name="mensaje" rows={4} required
              value={formData.mensaje}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describa detalladamente el motivo de su consulta o requerimiento de software..."
              className={`${inputCls('mensaje', errors, touched, formData)} resize-y`}
            />
            <FieldError message={touched.mensaje ? errors.mensaje : ''} />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`gradient-button w-full text-sm sm:text-base py-3.5 mt-1 font-bold shadow-lg flex items-center justify-center gap-2 transition-opacity duration-200
              ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Enviando Mensaje...</>
              : <><Send size={17} /> Enviar a la Administración</>
            }
          </button>

        </form>
      )}
    </div>
  );
};
