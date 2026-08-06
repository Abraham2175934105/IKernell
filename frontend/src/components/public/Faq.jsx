import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "¿Qué tipo de soluciones de software desarrolla IKernell?",
      answer: "IKernell se especializa en aplicaciones empresariales de alta complejidad desarrolladas en Java Spring Boot y React.js, aplicando desgloses WBS por etapas, control transaccional e inteligencia predictiva de riesgos."
    },
    {
      question: "¿Cómo funciona el algoritmo del Semáforo Predictivo?",
      answer: "El motor analiza en tiempo real las métricas de errores tipificados y la duración en minutos de las interrupciones reportadas por los desarrolladores. Si la tasa acumulada supera los umbrales de riesgo, el semáforo alerta automáticamente a los líderes para reasignar personal o extender plazos."
    },
    {
      question: "¿En qué consiste la automatización ETL para la Alianza en Brasil?",
      answer: "Es un proceso que recopila las métricas del proyecto con un solo clic del Líder (o mediante una tarea programada batch desatendida), las estandariza a formatos ISO 8601 UTC en archivos planos con delimitador '|' y las envía mediante canales seguros por SFTP o correo corporativo."
    },
    {
      question: "¿Cómo garantiza IKernell la seguridad de los datos de usuario y credenciales?",
      answer: "Cumplimos con una arquitectura de seguridad perimetral basada en JWT (sin cookies de sesión) y almacenamiento unidireccional de contraseñas con el algoritmo BCrypt (RNF-08 a RNF-10)."
    },
    {
      question: "¿Cómo puedo solicitar una cotización o consultoría tecnológica?",
      answer: "Puedes completar el formulario interactivo en el Centro de Contacto de este portal. Nuestro equipo de administración revisará tu solicitud y se pondrá en contacto en menos de 24 horas."
    }
  ];

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ marginBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <HelpCircle size={24} color="var(--color-primary)" />
        <h3 style={{ fontSize: '1.6rem' }}>Preguntas Frecuentes (FAQs)</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className="glass-panel" 
            style={{ 
              overflow: 'hidden', 
              transition: 'var(--transition-fast)',
              borderColor: openIndex === idx ? 'var(--color-primary)' : 'var(--border-light)'
            }}
          >
            <button
              onClick={() => toggleFaq(idx)}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'transparent',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-main)',
                fontSize: '1.05rem',
                fontWeight: '600'
              }}
            >
              <span>{faq.question}</span>
              <ChevronDown 
                size={20} 
                color="var(--color-primary)" 
                style={{ 
                  transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} 
              />
            </button>

            {openIndex === idx && (
              <div style={{ padding: '0 24px 20px 24px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
