import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

export const Hero = () => {
  return (
    <section style={{ paddingTop: '160px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Glow Effects Background */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(0,0,0,0) 80%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          color: 'var(--color-primary)',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '28px'
        }}>
          <Sparkles size={16} /> Innovación en Desarrollo de Software & Análisis Predictivo
        </div>

        {/* Main Title */}
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: '1.15', marginBottom: '24px', maxWidth: '900px', margin: '0 auto 24px auto' }}>
          Construimos Soluciones Tecnológicas de <span className="gradient-text">Alto Impacto Empresarial</span>
        </h1>

        {/* Subtitle */}
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '720px', margin: '0 auto 40px auto', fontWeight: '400' }}>
          IKernell Soluciones Software combina arquitectura Java Spring Boot, interfaces reactivas en React y analítica predictiva mediante el Semáforo Inteligente de Riesgos.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/contacto" className="gradient-button" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Consultar Servicios <ArrowRight size={18} />
          </Link>
          <a href="#servicios" className="outline-button" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Ver Portafolio
          </a>
        </div>

        {/* Stat Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '80px'
        }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
            <Zap size={28} color="var(--color-primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>N-Capas REST</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Desacoplamiento total entre Frontend React y Backend Java (RNF-01).</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
            <Activity size={28} color="var(--color-accent)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Semáforo Predictivo</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monitoreo en tiempo real de errores e interrupciones (RF-25).</p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
            <ShieldCheck size={28} color="var(--color-emerald)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Seguridad BCrypt</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sesiones JWT stateless y encriptación de grado militar (RNF-09/10).</p>
          </div>
        </div>

      </div>
    </section>
  );
};
