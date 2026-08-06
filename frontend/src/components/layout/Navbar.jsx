import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, ShieldCheck, Menu, X, LogIn, Mail } from 'lucide-react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
      <div className="container flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
          }}>
            <Cpu size={24} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="gradient-text">
              IKernell
            </span>
            <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-muted)', marginTop: '-4px', fontWeight: '600' }}>
              SOLUCIONES SOFTWARE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (SPA React Router) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          <Link to="/" style={{ color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition-fast)' }}>
            Inicio
          </Link>
          <a href="#servicios" style={{ color: 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition-fast)' }}>
            Servicios
          </a>
          <a href="#estrategia" style={{ color: 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition-fast)' }}>
            Estrategia
          </a>
          <a href="#noticias" style={{ color: 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition-fast)' }}>
            Noticias
          </a>
          <Link to="/contacto" style={{ color: location.pathname === '/contacto' ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition-fast)' }}>
            Centro de Contacto
          </Link>
        </nav>

        {/* Access CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/contacto" className="outline-button" style={{ padding: '8px 18px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={16} /> Contacto
          </Link>
          <Link to="/login" className="gradient-button" style={{ padding: '9px 20px', fontSize: '0.9rem' }}>
            <LogIn size={16} /> Acceso Portal
          </Link>
        </div>

      </div>
    </header>
  );
};
