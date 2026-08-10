import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, LogIn, Mail, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.rol === 'COORDINADOR') return '/coordinador';
    if (user.rol === 'LIDER') return '/lider';
    return '/desarrollador';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm py-3.5' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 z-50 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md transition-transform group-hover:scale-105">
            <Cpu size={22} />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              IKernell
            </span>
            <span className="block text-[0.65rem] text-zinc-500 dark:text-zinc-400 -mt-1 font-bold uppercase tracking-widest">
              Soluciones Software
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/' 
                ? 'text-zinc-900 dark:text-white font-bold' 
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Inicio
          </Link>
          <a 
            href="/#servicios" 
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Servicios
          </a>
          <a 
            href="/#estrategia" 
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Estrategia
          </a>
          <Link 
            to="/faqs" 
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/faqs' 
                ? 'text-zinc-900 dark:text-white font-bold' 
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            FAQs & Docs
          </Link>
          <Link 
            to="/contacto" 
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/contacto' 
                ? 'text-zinc-900 dark:text-white font-bold' 
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Contacto
          </Link>
        </nav>

        {/* Desktop Controls (Theme Toggle & CTA) */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-amber-400 flex items-center justify-center transition-all shadow-sm"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} className="text-zinc-700" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link 
                to={getDashboardRoute()} 
                className="outline-button text-xs font-bold py-2 px-4"
              >
                <User size={14} /> Panel ({user?.rol || 'Sesión'})
              </Link>
              <button 
                onClick={handleLogout} 
                className="danger-button text-xs py-2 px-3"
                title="Cerrar Sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <>
              {!isLoginPage && (
                <Link to="/login" className="gradient-button text-xs sm:text-sm py-2.5 px-5 font-bold">
                  <LogIn size={16} /> Acceso Portal
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Hamburger & Mobile Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-amber-400 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} className="text-zinc-700" />}
          </button>

          <button 
            className="text-zinc-900 dark:text-white p-2 z-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-2xl z-40 flex flex-col justify-between p-6 sm:p-8 md:hidden animate-fade-in pt-24">
            <nav className="flex flex-col gap-4 text-base font-bold">
              <Link 
                to="/" 
                onClick={() => setMobileOpen(false)} 
                className={`py-2 border-b border-zinc-100 dark:border-zinc-800 ${
                  location.pathname === '/' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Inicio
              </Link>
              <a 
                href="/#servicios" 
                onClick={() => setMobileOpen(false)} 
                className="py-2 border-b border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                Servicios
              </a>
              <a 
                href="/#estrategia" 
                onClick={() => setMobileOpen(false)} 
                className="py-2 border-b border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                Estrategia
              </a>
              <Link 
                to="/faqs" 
                onClick={() => setMobileOpen(false)} 
                className={`py-2 border-b border-zinc-100 dark:border-zinc-800 ${
                  location.pathname === '/faqs' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                FAQs & Documentación
              </Link>
              <Link 
                to="/contacto" 
                onClick={() => setMobileOpen(false)} 
                className={`py-2 border-b border-zinc-100 dark:border-zinc-800 ${
                  location.pathname === '/contacto' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Centro de Contacto
              </Link>
            </nav>

            <div className="flex flex-col gap-3 w-full mt-6">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={getDashboardRoute()} 
                    onClick={() => setMobileOpen(false)} 
                    className="gradient-button w-full py-3"
                  >
                    <User size={16} /> Mi Panel de Trabajo
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileOpen(false); }} 
                    className="outline-button w-full py-3"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  {!isLoginPage && (
                    <Link 
                      to="/login" 
                      onClick={() => setMobileOpen(false)} 
                      className="gradient-button w-full py-3 font-bold"
                    >
                      <LogIn size={18} /> Acceso Portal
                    </Link>
                  )}
                  <Link 
                    to="/contacto" 
                    onClick={() => setMobileOpen(false)} 
                    className="outline-button w-full py-3"
                  >
                    <Mail size={16} /> Contacto
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};


