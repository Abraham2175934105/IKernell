import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, Globe, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#050810', borderTop: '1px solid var(--border-light)', paddingTop: '70px', paddingBottom: '30px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '50px' }}>
          
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} color="#fff" />
              </div>
              <span className="gradient-text" style={{ fontSize: '1.3rem', fontWeight: '800' }}>IKernell</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', maxWidth: '300px' }}>
              Soluciones empresariales de software a medida, desarrollo de alta complejidad y sistemas predictivos de riesgo de grado internacional.
            </p>
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} color="var(--color-accent)" /> Alianza Brasil & LATAM
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '18px', fontSize: '1.05rem' }}>Navegación</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li><Link to="/" style={{ hover: { color: 'var(--color-primary)' } }}>Inicio</Link></li>
              <li><a href="#servicios">Servicios Tecnológicos</a></li>
              <li><a href="#estrategia">Lineamientos Estratégicos</a></li>
              <li><a href="#noticias">Noticias de Software</a></li>
              <li><Link to="/contacto">Centro de Contacto & FAQs</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '18px', fontSize: '1.05rem' }}>Contacto Corporativo</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color="var(--color-primary)" />
                <span>Edificio Inteligente IKernell, Piso 8</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--color-primary)" />
                <span>contacto@ikernell.org</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="var(--color-primary)" />
                <span>+57 (601) 800-IKERNELL</span>
              </div>
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          <p>© 2026 IKernell Soluciones Software. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Seguridad BCrypt (RNF-10)</span>
            <span>API REST Stateless JWT (RNF-09)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
