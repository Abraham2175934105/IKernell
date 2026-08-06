import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

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

    // Simulación de envío hacia el backend de la administración de IKernell (RF-04)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    }, 1200);
  };

  return (
    <div className="glass-panel" style={{ padding: '40px' }}>
      <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Formulario de Contacto</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
        ¿Tienes alguna duda específica o requerimiento de software? Envíanos tu mensaje directo a la administración de IKernell.
      </p>

      {submitted ? (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          padding: '24px', 
          borderRadius: 'var(--radius-md)',
          textAlign: 'center' 
        }}>
          <CheckCircle2 size={42} color="var(--color-emerald)" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ color: 'var(--color-emerald)', fontSize: '1.2rem', marginBottom: '6px' }}>¡Mensaje Enviado con Éxito!</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gracias por contactar a IKernell Soluciones Software. Un administrador revisará tu solicitud y se comunicará contigo a la brevedad.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="outline-button"
            style={{ marginTop: '20px', padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Enviar otra duda
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. María Rodríguez"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="maria@empresa.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Asunto de la Consulta *
            </label>
            <input
              type="text"
              name="asunto"
              required
              value={formData.asunto}
              onChange={handleChange}
              placeholder="Ej. Solicitud de desarrollo a medida / Consultoría"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Detalle de tu Pregunta o Mensaje *
            </label>
            <textarea
              name="mensaje"
              rows={4}
              required
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Describe detalladamente tus requerimientos o inquietudes..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="gradient-button" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
          >
            {loading ? 'Enviando Mensaje...' : <>Enviar a la Administración <Send size={18} /></>}
          </button>

        </form>
      )}
    </div>
  );
};
