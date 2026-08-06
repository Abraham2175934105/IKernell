import React from 'react';
import { Hero } from '../../components/public/Hero';
import { Services } from '../../components/public/Services';
import { Strategy } from '../../components/public/Strategy';
import { News } from '../../components/public/News';
import { Faq } from '../../components/public/Faq';
import { ContactForm } from '../../components/public/ContactForm';

export const LandingPage = () => {
  return (
    <div>
      <Hero />
      <Services />
      <Strategy />
      <News />
      
      {/* Contact & FAQ Section on Landing Page */}
      <section id="contacto" className="section-padding" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '16px' }}>
              Centro de <span className="gradient-text">Contacto & Atención</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
              Resolvemos tus dudas institucionales y recibimos tus mensajes directos para acompañar tus proyectos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
            <Faq />
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};
