import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CustomSelect - Desplegable Ejecutivo Moderno (Glassmorphic Custom Dropdown)
 * Reemplaza los elementos native HTML <select> por un selector interactivo accesible y de alto impacto.
 */
export const CustomSelect = ({
  value,
  onChange,
  options = [],
  groups = null,
  placeholder = 'Seleccionar...',
  icon: Icon = null,
  className = '',
  maxWidth = 'max-w-[260px]',
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Aplanar opciones para búsqueda y obtención de etiqueta activa
  const allOptions = React.useMemo(() => {
    if (groups && Array.isArray(groups)) {
      return groups.flatMap(g => g.options || []);
    }
    return options || [];
  }, [options, groups]);

  // Opción activa actualmente
  const selectedOption = allOptions.find(opt => String(opt.value) === String(value)) || allOptions[0];

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones si el buscador interno está activo
  const filteredOptions = (opts) => {
    if (!searchTerm.trim()) return opts;
    const q = searchTerm.toLowerCase().trim();
    return opts.filter(opt => 
      opt.label?.toLowerCase().includes(q) || 
      opt.subtitle?.toLowerCase().includes(q)
    );
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Botón Disparador (Trigger) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer border ${
          isOpen
            ? 'bg-white dark:bg-zinc-900 border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20 text-blue-600 dark:text-blue-400'
            : 'bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
        } ${maxWidth}`}
      >
        <span className="flex items-center gap-2 truncate min-w-0">
          {Icon && <Icon size={14} className="text-blue-500 shrink-0" />}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown 
          size={14} 
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} 
        />
      </button>

      {/* Menú Desplegable Flotante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full z-50 w-full min-w-[220px] max-w-[340px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 space-y-1"
          >
            {/* Buscador interno (si se habilita o hay más de 6 opciones) */}
            {(searchable || allOptions.length > 6) && (
              <div className="px-2.5 pt-1 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar opción..."
                    className="w-full pl-8 pr-3 py-1.5 text-[0.72rem] rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar text-xs">
              {groups ? (
                groups.map((grp, gIdx) => {
                  const filteredGrpOpts = filteredOptions(grp.options || []);
                  if (filteredGrpOpts.length === 0) return null;

                  return (
                    <div key={grp.label || gIdx} className="mb-1">
                      {grp.label && (
                        <span className="px-3 py-1 text-[0.62rem] uppercase font-black tracking-wider text-zinc-400 dark:text-zinc-500 block">
                          {grp.label}
                        </span>
                      )}
                      {filteredGrpOpts.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 font-semibold'
                            }`}
                          >
                            <div className="min-w-0 truncate">
                              <span className="block truncate text-[0.75rem]">{opt.label}</span>
                              {opt.subtitle && (
                                <span className="block text-[0.65rem] text-zinc-400 font-normal truncate">
                                  {opt.subtitle}
                                </span>
                              )}
                            </div>
                            {isSelected && <Check size={14} className="text-blue-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                filteredOptions(options).map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 font-semibold'
                      }`}
                    >
                      <div className="min-w-0 truncate">
                        <span className="block truncate text-[0.75rem]">{opt.label}</span>
                        {opt.subtitle && (
                          <span className="block text-[0.65rem] text-zinc-400 font-normal truncate">
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check size={14} className="text-blue-500 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
