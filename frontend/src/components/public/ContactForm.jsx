import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
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
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    }, 1000);
  };

  return (
    <div className="glass-card p-6 sm:p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
      <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">Formulario de Contacto</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm font-medium">
        ¿Tienes alguna duda específica o requerimiento de software? Envíanos tu mensaje directo a la administración de IKernell.
      </p>

      {submitted ? (
        <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-8 rounded-2xl text-center animate-fade-in">
          <CheckCircle2 size={48} className="text-zinc-900 dark:text-white mx-auto mb-4" />
          <h4 className="text-zinc-900 dark:text-white text-xl font-bold mb-2">¡Mensaje Enviado con Éxito!</h4>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md mx-auto mb-6 font-normal">
            Gracias por contactar a IKernell Soluciones Software. Un administrador revisará tu solicitud y se comunicará contigo a la brevedad.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="outline-button mx-auto text-sm py-2.5 px-6 font-bold"
          >
            Enviar otra duda
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. María Rodríguez"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="maria@empresa.com"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
              Asunto de la Consulta *
            </label>
            <input
              type="text"
              name="asunto"
              required
              value={formData.asunto}
              onChange={handleChange}
              placeholder="Ej. Solicitud de desarrollo a medida / Consultoría"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
              Detalle de tu Pregunta o Mensaje *
            </label>
            <textarea
              name="mensaje"
              rows={4}
              required
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Describe detalladamente tus requerimientos o inquietudes..."
              className="input-field resize-y"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="gradient-button w-full text-sm sm:text-base py-3.5 mt-2 font-bold shadow-lg" 
          >
            {loading ? 'Enviando Mensaje...' : <>Enviar a la Administración <Send size={18} /></>}
          </button>

        </form>
      )}
    </div>
  );
};



