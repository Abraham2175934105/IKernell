import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, LogIn, Mail, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  // Estados locales
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  // Detecta el desplazamiento vertical para aplicar fondo glassmorphic sólido
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLoginPage = location.pathname === '/login';

  // Manejadores de eventos y navegación
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Redirige al panel correspondiente según el rol del usuario autenticado
  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.rol === 'COORDINADOR') return '/coordinador';
    if (user.rol === 'LIDER') return '/lider';
    return '/desarrollador';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-md py-3' 
        : 'bg-white/20 dark:bg-black/30 backdrop-blur-md border-b border-white/10 shadow-sm py-4'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 z-50 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-transform group-hover:scale-105">
            <Cpu size={22} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-zinc-950 dark:text-white transition-colors duration-300 drop-shadow-sm dark:drop-shadow-none">
              IKernell
            </span>
            <span className="block text-[0.65rem] text-blue-600 dark:text-blue-400 -mt-1 font-extrabold uppercase tracking-widest transition-colors duration-300">
              Soluciones Software
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          <Link 
            to="/" 
            className={`text-sm tracking-tight transition-all duration-200 ${
              location.pathname === '/' 
                ? 'text-blue-600 dark:text-blue-400 font-extrabold drop-shadow-sm' 
                : 'text-zinc-950 font-bold hover:text-blue-600 dark:text-zinc-100 dark:hover:text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-none'
            }`}
          >
            Inicio
          </Link>
          <a 
            href="/#servicios" 
            className="text-sm font-bold tracking-tight text-zinc-950 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-none transition-all duration-200"
          >
            Servicios
          </a>
          <a 
            href="/#estrategia" 
            className="text-sm font-bold tracking-tight text-zinc-950 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-none transition-all duration-200"
          >
            Estrategia
          </a>
          <Link 
            to="/faqs" 
            className={`text-sm tracking-tight transition-all duration-200 ${
              location.pathname === '/faqs' 
                ? 'text-blue-600 dark:text-blue-400 font-extrabold drop-shadow-sm' 
                : 'text-zinc-950 font-bold hover:text-blue-600 dark:text-zinc-100 dark:hover:text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-none'
            }`}
          >
            FAQs & Docs
          </Link>
          <Link 
            to="/contacto" 
            className={`text-sm tracking-tight transition-all duration-200 ${
              location.pathname === '/contacto' 
                ? 'text-blue-600 dark:text-blue-400 font-extrabold drop-shadow-sm' 
                : 'text-zinc-950 font-bold hover:text-blue-600 dark:text-zinc-100 dark:hover:text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-none'
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
            title={isDark ? "Cambiar a Modo Claro (Día)" : "Cambiar a Modo Oscuro (Noche)"}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-amber-400 shadow-sm backdrop-blur-md cursor-pointer hover:border-blue-500 dark:hover:border-blue-500"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link 
                to={getDashboardRoute()} 
                className="text-xs font-bold py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 backdrop-blur-md flex items-center gap-2 transition-all shadow-sm"
              >
                <User size={14} className="text-blue-600 dark:text-blue-400" /> Panel ({user?.rol || 'Sesión'})
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
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
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
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-amber-400 shadow-sm backdrop-blur-md"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button 
            className="p-2 z-50 rounded-xl transition-colors text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                className={`py-2.5 border-b border-zinc-200/80 dark:border-zinc-800 ${
                  location.pathname === '/' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-zinc-950 dark:text-zinc-100'
                }`}
              >
                Inicio
              </Link>
              <a 
                href="/#servicios" 
                onClick={() => setMobileOpen(false)} 
                className="py-2.5 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-950 dark:text-zinc-100"
              >
                Servicios
              </a>
              <a 
                href="/#estrategia" 
                onClick={() => setMobileOpen(false)} 
                className="py-2.5 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-950 dark:text-zinc-100"
              >
                Estrategia
              </a>
              <Link 
                to="/faqs" 
                onClick={() => setMobileOpen(false)} 
                className={`py-2.5 border-b border-zinc-200/80 dark:border-zinc-800 ${
                  location.pathname === '/faqs' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-zinc-950 dark:text-zinc-100'
                }`}
              >
                FAQs & Documentación
              </Link>
              <Link 
                to="/contacto" 
                onClick={() => setMobileOpen(false)} 
                className={`py-2.5 border-b border-zinc-200/80 dark:border-zinc-800 ${
                  location.pathname === '/contacto' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-zinc-950 dark:text-zinc-100'
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
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all"
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
