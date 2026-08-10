import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-8 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-lg flex items-center justify-center shadow-md">
                <Cpu size={20} />
              </div>
              <span className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">IKernell</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 max-w-sm leading-relaxed font-normal">
              Soluciones empresariales de software a medida, desarrollo de alta complejidad y sistemas predictivos de riesgo de grado internacional.
            </p>
            <div className="flex gap-3 text-zinc-600 dark:text-zinc-400">
              <span className="text-xs font-semibold flex items-center gap-2 uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                <Globe size={14} /> Alianza Brasil & LATAM
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col">
            <h4 className="text-zinc-900 dark:text-white font-bold mb-4">Navegación Rápida</h4>
            <ul className="flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <li><Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Inicio</Link></li>
              <li><a href="/#servicios" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Servicios Tecnológicos</a></li>
              <li><a href="/#estrategia" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Lineamientos Estratégicos</a></li>
              <li><Link to="/faqs" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Preguntas Frecuentes & Docs</Link></li>
              <li><Link to="/contacto" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Centro de Contacto & FAQs</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="flex flex-col">
            <h4 className="text-zinc-900 dark:text-white font-bold mb-4">Contacto Corporativo</h4>
            <div className="flex flex-col gap-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-zinc-800 dark:text-zinc-200" />
                <span>Edificio Inteligente IKernell, Piso 8</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-zinc-800 dark:text-zinc-200" />
                <span>contacto@ikernell.org</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-zinc-800 dark:text-zinc-200" />
                <span>+57 (601) 800-IKERNELL</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <p>© 2026 IKernell Soluciones Software. Todos los derechos reservados.</p>
          <div className="flex gap-6 uppercase tracking-wider">
            <span>Seguridad BCrypt</span>
            <span>API REST Stateless JWT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};



