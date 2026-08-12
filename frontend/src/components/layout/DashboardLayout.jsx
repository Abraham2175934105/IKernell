import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Cpu, Users, Briefcase, Activity, CheckSquare, Bug, AlertTriangle, 
  MessageSquare, BookOpen, GraduationCap, Sun, Moon, LogOut, 
  Menu, X, Shield, Bell, ChevronRight, ChevronLeft, Layers, 
  FileText, Sparkles, User, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChatCorporativo } from '../tools/ChatCorporativo';
import { BibliotecaDigital } from '../tools/BibliotecaDigital';
import { TutorialesInduccion } from '../tools/TutorialesInduccion';
import { motion, AnimatePresence } from 'framer-motion';

// Helper para iniciales de Avatar
const getInitials = (nombre, apellido) => {
  if (!nombre) return 'IK';
  const first = nombre.trim().charAt(0);
  const second = apellido ? apellido.trim().charAt(0) : '';
  return (first + second).toUpperCase();
};

export const DashboardLayout = ({ children, activeTab, setActiveTab, customMetrics }) => {
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

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const nextState = !prev;
      localStorage.setItem('sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  // La barra se considera expandida si no está colapsada o si el usuario pasa el cursor por encima (hover)
  const isExpanded = !isCollapsed || isHovered;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'COORDINADOR':
        return {
          label: 'Coordinador General',
          badgeText: 'COORDINADOR',
          shortLabel: 'Coord',
          classes: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
        };
      case 'LIDER':
        return {
          label: 'Líder de Proyecto',
          badgeText: 'LÍDER DE PROYECTO',
          shortLabel: 'Líder',
          classes: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
        };
      default:
        return {
          label: 'Desarrollador de Software',
          badgeText: 'DESARROLLADOR',
          shortLabel: 'Dev',
          classes: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
        };
    }
  };

  const roleInfo = getRoleBadge(user?.rol);

  // Configuración de elementos del Sidebar según el Rol
  const getRoleNavItems = () => {
    if (user?.rol === 'COORDINADOR') {
      return [
        { id: 'personal', label: 'Gestión de Personal', icon: Users, desc: 'CRUD y control de acceso' },
        { id: 'solicitudes', label: 'Solicitudes Web', icon: FileText, desc: 'Consultas públicas' }
      ];
    } else if (user?.rol === 'LIDER') {
      return [
        { id: 'wbs', label: 'WBS y Proyectos', icon: Layers, desc: 'Desglose por etapas' },
        { id: 'semaforo', label: 'Semáforo Predictivo', icon: Activity, desc: 'Matriz de riesgo en tiempo real' },
        { id: 'incidencias', label: 'Gestión de Incidencias', icon: AlertTriangle, desc: 'Bandeja de reportes de equipo' },
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
    { id: 'biblioteca', label: 'Biblioteca Digital', icon: BookOpen, badge: '4 Docs' },
    { id: 'tutoriales', label: 'Tutoriales e Inducción', icon: GraduationCap, badge: '3 Guías' }
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      
      {/* Barra lateral navegable (colapsable en escritorio y deslizable en móvil) */}
      <aside 
        onMouseEnter={() => {
          if (isCollapsed) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (isCollapsed) setIsHovered(false);
        }}
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-lg lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isExpanded ? 'w-72' : 'w-20'
        }`}
      >
        
        <div className="overflow-x-hidden overflow-y-auto">
          {/* Cabecera con logo corporativo */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between min-h-[73px]">
            <Link to="/" className="flex items-center gap-3 group truncate">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md transition-transform group-hover:scale-105 flex-shrink-0">
                <Cpu size={22} />
              </div>
              
              <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
              }`}>
                <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white block">
                  IKernell
                </span>
                <span className="text-[0.6rem] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block -mt-1">
                  Portal Corporativo
                </span>
              </div>
            </Link>

            {/* Toggle para alternar entre vista completa y barra delgada */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
              className={`hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                !isExpanded ? 'mx-auto mt-2' : ''
              }`}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            {/* Cierre del drawer en dispositivos móviles */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tarjeta de perfil con estado en línea */}
          <div className="my-3.5 mx-3">
            {isExpanded ? (
              <motion.div
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                className="p-3.5 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/70 border border-zinc-200/90 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm transition-all duration-200 flex items-center gap-3"
              >
                {/* Avatar con punto indicador de sesión activa */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center shadow-md tracking-tight">
                    {getInitials(user?.nombre, user?.apellido)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
                  </span>
                </div>

                {/* Información Jerárquica */}
                <div className="min-w-0 text-left">
                  <div className="font-extrabold text-xs text-zinc-900 dark:text-white truncate leading-tight">
                    {user?.nombre ? `${user.nombre} ${user.apellido || ''}` : user?.email}
                  </div>
                  <div className="text-[0.68rem] text-zinc-500 dark:text-zinc-400 truncate font-mono mt-0.5 leading-none">
                    {user?.email}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className={`inline-block text-[0.55rem] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${roleInfo.classes}`}>
                      [{roleInfo.badgeText}]
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Mini Avatar Colapsado (w-20) */
              <div className="flex justify-center p-1">
                <div 
                  title={`${user?.nombre} ${user?.apellido || ''} [${roleInfo.badgeText}] - En línea`}
                  className="relative group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {getInitials(user?.nombre, user?.apellido)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Secciones de Navegación */}
          <div className="px-3 space-y-5">
            
            {/* Sección Principal del Rol */}
            <div>
              {isExpanded && (
                <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 block mb-2 transition-opacity duration-300">
                  Panel del {user?.rol || 'Usuario'}
                </span>
              )}
              
              <div className="space-y-1">
                {roleNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTool === null && (!activeTab || activeTab === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTool(null);
                        if (setActiveTab) setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      title={!isExpanded ? item.label : undefined}
                      className={`w-full flex items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isExpanded ? 'gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'
                      } ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      
                      <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden text-left ${
                        isExpanded ? 'opacity-100 max-w-[170px]' : 'opacity-0 max-w-0 hidden'
                      }`}>
                        <div className="truncate">{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sección de Herramientas Corporativas Transversales */}
            <div>
              {isExpanded && (
                <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 block mb-2 transition-opacity duration-300">
                  Herramientas Corporativas
                </span>
              )}
              
              <div className="space-y-1">
                {transversalTools.map(tool => {
                  const Icon = tool.icon;
                  const isActive = currentTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setCurrentTool(tool.id);
                        setSidebarOpen(false);
                      }}
                      title={!isExpanded ? tool.label : undefined}
                      className={`w-full flex items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isExpanded ? 'justify-between px-3.5 py-2.5' : 'justify-center p-2.5'
                      } ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <Icon size={18} className="flex-shrink-0" />
                        <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden text-left ${
                          isExpanded ? 'opacity-100 max-w-[130px]' : 'opacity-0 max-w-0 hidden'
                        }`}>
                          {tool.label}
                        </span>
                      </span>

                      {isExpanded && (
                        <span className={`text-[0.55rem] font-black px-1.5 py-0.5 rounded-full transition-opacity duration-300 ${
                          isActive 
                            ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button
            onClick={handleLogout}
            title={!isExpanded ? "Cerrar Sesión" : undefined}
            className={`w-full flex items-center justify-center rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/80 transition-all cursor-pointer shadow-sm ${
              isExpanded ? 'gap-2 py-2.5 px-4' : 'p-2.5'
            }`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isExpanded ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0 hidden'
            }`}>
              Cerrar Sesión
            </span>
          </button>

          {isExpanded && (
            <div className="text-center transition-opacity duration-300">
              <span className="text-[0.6rem] text-zinc-400 font-medium">IKernell v2.4 • JWT Stateless</span>
            </div>
          )}
        </div>

      </aside>

      {/* Overlay Oscuro para Móvil */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 2. CONTENIDO PRINCIPAL Y TOPBAR (Ajuste fluido de padding según estado colapsado) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        
        {/* TOPBAR (HEADER PRIVADO) */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm min-h-[73px]">
          
          {/* Lado Izquierdo: Botón Menú Móvil & Título */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
              aria-label="Abrir Menú"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                {currentTool === 'chat' && <>Chat Corporativo <MessageSquare size={18} className="text-zinc-500" /></>}
                {currentTool === 'biblioteca' && <>Biblioteca Digital <BookOpen size={18} className="text-zinc-500" /></>}
                {currentTool === 'tutoriales' && <>Tutoriales e Inducción <GraduationCap size={18} className="text-zinc-500" /></>}
                {!currentTool && (
                  <>
                    Panel de {roleInfo.label}
                  </>
                )}
              </h1>
              <span className="hidden sm:block text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium">
                {user?.especialidad || 'Especialista en Soluciones de Software'} • Sesión Autenticada
              </span>
            </div>
          </div>

          {/* Lado Derecho: Métricas Rápidas, Toggle Tema, Usuario & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Indicadores / Métricas Rápidas */}
            <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {customMetrics?.metric1 || 'Sistema Online'}
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                {customMetrics?.metric2 || 'Conexión Segura (JWT)'}
              </span>
            </div>

            {/* Toggle Tema Claro / Oscuro */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} className="text-zinc-700" />}
            </button>

            {/* Botón Salir Rápido */}
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer shadow-sm"
            >
              <LogOut size={14} /> Salir
            </button>

          </div>

        </header>

        {/* 3. AREA DE CONTENIDO DEL DASHBOARD */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
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

    </div>
  );
};
