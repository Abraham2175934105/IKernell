import React from 'react';
import { Faq } from '../../components/public/Faq';
import { ContactForm } from '../../components/public/ContactForm';

export const ContactPage = () => {
  return (
    <div style={{ paddingTop: '140px', paddingBottom: '90px' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '16px' }}>
            Centro de <span className="gradient-text">Contacto Corporativo</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto' }}>
            Consulta nuestras preguntas frecuentes (RF-03) o envía una duda personalizada directamente a la administración de IKernell (RF-04).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
          <Faq />
          <ContactForm />
        </div>

      </div>
    </div>
  );
};
