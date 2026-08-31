import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Cpu, Users, Briefcase, Activity, CheckSquare, Bug, AlertTriangle, 
  MessageSquare, BookOpen, GraduationCap, Sun, Moon, LogOut, 
  Menu, X, Shield, ChevronRight, ChevronLeft, Layers, 
  FileText, Sparkles, User, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../config/routes';
import { ChatCorporativo } from '../tools/ChatCorporativo';
import { BibliotecaDigital } from '../tools/BibliotecaDigital';
import { TutorialesInduccion } from '../tools/TutorialesInduccion';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Helper para iniciales de Avatar
const getInitials = (nombre, apellido) => {
  if (!nombre) return 'IK';
  const first = nombre.trim().charAt(0);
  const second = apellido ? apellido.trim().charAt(0) : '';
  return (first + second).toUpperCase();
};

export const DashboardLayout = ({ children, activeTab, setActiveTab, customMetrics, hasUnsavedChanges = false, onCancelUnsavedChanges }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de la barra lateral
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [currentTool, setCurrentTool] = useState(null); // 'chat' | 'biblioteca' | 'tutoriales' | null
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Estado para la Intercepción de Navegación por Seguridad (Cambio de Contraseña en curso)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState(null);

  const confirmOrNavigate = (action) => {
    if (hasUnsavedChanges) {
      setPendingNavAction(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const nextState = !prev;
      localStorage.setItem('sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  // La barra se considera expandida si no está colapsada o si el usuario pasa el cursor por encima (hover)
  const isExpanded = !isCollapsed || isHovered;

  const handleLogoutClick = () => {
    const skipConfirm = localStorage.getItem('ikernell_skip_logout_confirm') === 'true';
    if (skipConfirm) {
      handleConfirmLogout();
    } else {
      setShowLogoutModal(true);
    }
  };

  const handleConfirmLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'COORDINADOR':
        return {
          label: 'Coordinador General',
          badgeText: 'COORDINADOR',
          classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      case 'LIDER':
        return {
          label: 'Líder de Proyecto',
          badgeText: 'LÍDER',
          classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        };
      default:
        return {
          label: 'Desarrollador de Software',
          badgeText: 'DESARROLLADOR',
          classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
    }
  };

  const roleInfo = getRoleBadge(user?.rol);

  // Configuración de elementos del Sidebar según el Rol
  const getRoleNavItems = () => {
    if (user?.rol === 'COORDINADOR') {
      return [
        { id: 'personal', label: 'Gestión de Personal', icon: Users, desc: 'CRUD y control de acceso' },
        { id: 'proyectos', label: 'Gestión de Proyectos', icon: Briefcase, desc: 'Vista global de catálogo y líderes' },
        { id: 'solicitudes', label: 'Solicitudes Web', icon: FileText, desc: 'Consultas públicas' },
        { id: 'burnout', label: 'Predictor de Burnout', icon: Activity, desc: 'Capacidad y desgaste 21d' }
      ];
    } else if (user?.rol === 'LIDER') {
      return [
        { id: 'wbs', label: 'WBS y Proyectos', icon: Layers, desc: 'Desglose por etapas' },
        { id: 'personal', label: 'Gestión de Personal', icon: Users, desc: 'Líderes y Desarrolladores' },
        { id: 'semaforo', label: 'Semáforo Predictivo', icon: Activity, desc: 'Matriz de riesgo en tiempo real' },
        { id: 'incidencias', label: 'Gestión de Incidencias', icon: AlertTriangle, desc: 'Bandeja de reportes de equipo' },
        { id: 'burnout', label: 'Predictor de Burnout', icon: Activity, desc: 'Carga histórica de 21 días' },
        { id: 'etl', label: 'Exportación ETL Brasil', icon: Sparkles, desc: 'Métricas ISO 8601 UTC' }
      ];
    } else {
      return [
        { id: 'actividades', label: 'Mis Actividades', icon: CheckSquare, desc: 'Tablero de trabajo' },
        { id: 'reportar', label: 'Registrar Incidencia', icon: Bug, desc: 'Errores e interrupciones' },
        { id: 'historial', label: 'Historial de Mis Reportes', icon: FileText, desc: 'Trazabilidad y estado' }
      ];
    }
  };

  const roleNavItems = getRoleNavItems();

  const transversalTools = [
    { id: 'chat', label: 'Chat Corporativo', icon: MessageSquare, badge: 'En Vivo' },
    { id: 'biblioteca', label: 'Biblioteca Digital', icon: BookOpen, badge: '8 Docs' },
    { id: 'tutoriales', label: 'Tutoriales e Inducción', icon: GraduationCap, badge: '3 Guías' }
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      <aside 
        onMouseEnter={() => { if (isCollapsed) setIsHovered(true); }}
        onMouseLeave={() => { if (isCollapsed) setIsHovered(false); }}
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xl md:shadow-none ${
          sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${
          sidebarOpen ? 'w-72' : (isExpanded ? 'md:w-20 lg:w-72' : 'md:w-20 lg:w-20')
        }`}
      >
        
        <div className="overflow-x-hidden overflow-y-auto">
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between min-h-[73px]">
            <button 
              type="button"
              onClick={() => confirmOrNavigate(() => navigate('/'))} 
              className="flex items-center gap-3 group truncate text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-transform group-hover:scale-105 flex-shrink-0">
                <Cpu size={22} />
              </div>
              
              <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                sidebarOpen ? 'block' : (isExpanded ? 'hidden lg:block opacity-100 max-w-[160px]' : 'hidden opacity-0 max-w-0')
              }`}>
                <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 block">
                  IKernell
                </span>
                <span className="text-[0.6rem] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block -mt-1">
                  Portal Corporativo
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
              className={`hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                !isExpanded ? 'mx-auto' : ''
              }`}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-5 mb-4 mx-3">
            <div className={`${sidebarOpen ? 'block' : (isExpanded ? 'hidden lg:block' : 'hidden')}`}>
              <motion.button
                type="button"
                onClick={() => {
                  confirmOrNavigate(() => {
                    navigate(ROUTES.PERFIL);
                    setSidebarOpen(false);
                  });
                }}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full p-3.5 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/90 dark:border-zinc-700/80 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-zinc-800 shadow-sm transition-all duration-200 flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/30 tracking-tight">
                    {getInitials(user?.nombre, user?.apellido)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">{user?.nombre || 'Usuario'}</div>
                  <div className="mt-1">
                    <span className={`inline-block text-[0.58rem] font-black uppercase px-2.5 py-0.5 rounded-md border ${roleInfo.classes}`}>
                      {roleInfo.badgeText}
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>

            <div className={`${sidebarOpen ? 'hidden' : (isExpanded ? 'block lg:hidden' : 'block')}`}>
              <div className="flex justify-center p-1">
                <button 
                  type="button"
                  onClick={() => {
                    confirmOrNavigate(() => {
                      navigate(ROUTES.PERFIL);
                      setSidebarOpen(false);
                    });
                  }}
                  className="relative group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/30">
                    {getInitials(user?.nombre, user?.apellido)}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="px-3 space-y-5">
            <div>
              <span className={`text-[0.6rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 mb-2 transition-opacity duration-300 ${
                !isExpanded && !sidebarOpen ? 'hidden' : 'block'
              }`}>
                Panel del {user?.rol || 'Usuario'}
              </span>
              
              <div className="space-y-1">
                {roleNavItems.map(item => {
                  const Icon = item.icon;
                  const activeTabToMatch = activeTab || (location.pathname === ROUTES.PERFIL ? null : roleNavItems[0]?.id);
                  const isActive = currentTool === null && activeTabToMatch === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        confirmOrNavigate(() => {
                          setCurrentTool(null);
                          if (setActiveTab) setActiveTab(item.id);
                          const roleHome = user?.rol === 'COORDINADOR' ? ROUTES.COORDINADOR : user?.rol === 'LIDER' ? ROUTES.LIDER : ROUTES.DESARROLLADOR;
                          if (location.pathname !== roleHome) {
                            navigate(roleHome);
                          }
                          setSidebarOpen(false);
                        });
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !isExpanded && !sidebarOpen ? 'justify-center px-0' : 'justify-start'
                      } ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-zinc-800/60'}`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className={`truncate transition-all ${!isExpanded && !sidebarOpen ? 'hidden' : 'block'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className={`text-[0.6rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 mb-2 transition-opacity duration-300 ${
                !isExpanded && !sidebarOpen ? 'hidden' : 'block'
              }`}>
                Herramientas
              </span>
              
              <div className="space-y-1">
                {transversalTools.map(tool => {
                  const Icon = tool.icon;
                  const isActive = currentTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        confirmOrNavigate(() => {
                          setCurrentTool(tool.id);
                          setSidebarOpen(false);
                        });
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !isExpanded && !sidebarOpen ? 'justify-center px-0' : 'justify-start'
                      } ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-zinc-800/60'}`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className={`truncate transition-all ${!isExpanded && !sidebarOpen ? 'hidden' : 'block'}`}>
                        {tool.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button
            type="button"
            onClick={() => confirmOrNavigate(() => handleLogoutClick())}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 cursor-pointer transition-all ${
              !isExpanded && !sidebarOpen ? 'justify-center px-0' : 'justify-start'
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={`truncate transition-all ${!isExpanded && !sidebarOpen ? 'hidden' : 'block'}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>

      </aside>

      {/* Overlay Oscuro para Móvil */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* 2. CONTENIDO PRINCIPAL Y TOPBAR (Ajuste fluido de padding según estado: móvil pl-0, tablet pl-20, desktop pl-72/pl-20) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pl-0 md:pl-20 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        
        {/* TOPBAR (HEADER PRIVADO) - Alineación simétrica perfecta y responsiva */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-sm min-h-[68px] sm:min-h-[72px]">
          
          {/* Lado Izquierdo: Botón Menú Móvil & Título */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
              aria-label="Abrir Menú de Navegación"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2 truncate">
                {currentTool === 'chat' && <>Chat Corporativo <MessageSquare size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /></>}
                {currentTool === 'biblioteca' && <>Biblioteca Digital <BookOpen size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /></>}
                {currentTool === 'tutoriales' && <>Tutoriales e Inducción <GraduationCap size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" /></>}
                {!currentTool && (
                  <span className="truncate">
                    {location.pathname.includes('perfil') ? 'Mi Perfil & Seguridad' : `Panel de ${roleInfo.label}`}
                  </span>
                )}
              </h1>
              <span className="hidden sm:block text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                {location.pathname.includes('perfil')
                  ? 'Información de cuenta y credenciales criptográficas'
                  : `${user?.especialidad || 'Especialista en Soluciones de Software'} • Sesión Autenticada`}
              </span>
            </div>
          </div>

          {/* Lado Derecho: Herramientas Globales (Métricas, Notificaciones, Toggle Tema) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Indicadores / Métricas Rápidas en Azul Corporativo */}
            <div className="hidden lg:flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/50 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {customMetrics?.metric1 || 'Sistema Online'}
              </span>
              <span className="text-blue-200 dark:text-blue-800">|</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {customMetrics?.metric2 || 'Conexión Segura (JWT)'}
              </span>
            </div>

            {/* Toggle Tema Claro / Oscuro */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:border-blue-400 dark:hover:border-blue-600"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} className="text-zinc-700 dark:text-zinc-300" />}
            </button>

          </div>

        </header>

        {/* 3. AREA DE CONTENIDO DEL DASHBOARD CON ESPACIADO ESTANDARIZADO RESPONSIVO */}
        <main className="flex-1 p-4 sm:p-5 lg:p-7 max-w-[1600px] w-full mx-auto min-w-0">
          {currentTool ? (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentTool(null)}
                  className="outline-button text-xs py-2 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  ← Volver al Panel Principal ({roleInfo.label})
                </button>
              </div>

              {currentTool === 'chat' && <ChatCorporativo />}
              {currentTool === 'biblioteca' && <BibliotecaDigital />}
              {currentTool === 'tutoriales' && <TutorialesInduccion />}
            </div>
          ) : (
            children
          )}
        </main>

      </div>

      {/* Modal Avanzado de Confirmación de Cierre de Sesión */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />

      {/* Modal de Alerta de Seguridad por Cambios No Guardados en Contraseña */}
      <AnimatePresence>
        {showUnsavedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-amber-300 dark:border-amber-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800 shadow-xs">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Cambio de Contraseña en Curso
                  </h3>
                  <span className="text-[0.68rem] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                    Alerta de Seguridad & Navegación
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                Estás realizando la opción de cambiar contraseña. Si accedes a otro apartado sin guardar la contraseña o actualizarla, se cancelará la opción y los datos ingresados no se guardarán.
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedModal(false);
                    setPendingNavAction(null);
                  }}
                  className="w-full sm:w-auto outline-button text-xs py-2.5 px-4 font-bold rounded-xl cursor-pointer"
                >
                  Permanecer aquí (Continuar editando)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedModal(false);
                    if (onCancelUnsavedChanges) onCancelUnsavedChanges();
                    if (pendingNavAction) pendingNavAction();
                    setPendingNavAction(null);
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs py-2.5 px-4 rounded-xl font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
                >
                  <span>Salir sin guardar (Cancelar cambio)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
