import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Phone, Mail, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
    }, 900);
  };

  return (
    <div className="glass-card p-6 sm:p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center shadow-sm">
          <MessageSquare size={20} />
        </div>
        <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Formulario de Contacto</h3>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm font-medium">
        ¿Tienes alguna duda específica o requerimiento de software? Envíanos tu mensaje directo a la administración de IKernell.
      </p>

      {submitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-8 rounded-2xl text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="text-zinc-900 dark:text-white text-xl font-bold mb-2">¡Mensaje Enviado con Éxito!</h4>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md mx-auto mb-6 font-normal">
            Gracias por contactar a IKernell Soluciones Software. Un administrador revisará tu solicitud y se comunicará contigo a la brevedad.
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Nombre y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <User size={14} className="text-zinc-400" /> Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese su nombre completo"
                className="input-field"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <Mail size={14} className="text-zinc-400" /> Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingrese su correo electrónico corporativo"
                className="input-field"
              />
            </div>
          </div>

          {/* Teléfono y Asunto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <Phone size={14} className="text-zinc-400" /> Teléfono de Contacto
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ingrese su número de contacto"
                className="input-field"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                <Tag size={14} className="text-zinc-400" /> Asunto de la Consulta *
              </label>
              <input
                type="text"
                name="asunto"
                required
                value={formData.asunto}
                onChange={handleChange}
                placeholder="Ingrese el asunto o motivo de su consulta"
                className="input-field"
              />
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
              <MessageSquare size={14} className="text-zinc-400" /> Detalle de su Consulta o Requerimiento *
            </label>
            <textarea
              name="mensaje"
              rows={4}
              required
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Describa detalladamente el motivo de su consulta"
              className="input-field resize-y"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="gradient-button w-full text-sm sm:text-base py-3.5 mt-2 font-bold shadow-lg cursor-pointer" 
          >
            {loading ? 'Enviando Mensaje...' : <>Enviar a la Administración <Send size={18} /></>}
          </button>

        </form>
      )}
    </div>
  );
};




