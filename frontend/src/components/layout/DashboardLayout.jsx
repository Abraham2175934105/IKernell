import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Cpu, Users, Briefcase, Activity, CheckSquare, Bug, AlertTriangle, 
  MessageSquare, BookOpen, GraduationCap, Sun, Moon, LogOut, 
  Menu, X, Shield, Bell, ChevronRight, Layers, FileText, Sparkles, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChatCorporativo } from '../tools/ChatCorporativo';
import { BibliotecaDigital } from '../tools/BibliotecaDigital';
import { TutorialesInduccion } from '../tools/TutorialesInduccion';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = ({ children, activeTab, setActiveTab, customMetrics }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState(null); // 'chat' | 'biblioteca' | 'tutoriales' | null

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'COORDINADOR':
        return {
          label: 'Coordinador General',
          classes: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        };
      case 'LIDER':
        return {
          label: 'Líder de Proyecto',
          classes: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      default:
        return {
          label: 'Desarrollador de Software',
          classes: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
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
        { id: 'etl', label: 'Exportación ETL Brasil', icon: Sparkles, desc: 'Métricas ISO 8601 UTC' }
      ];
    } else {
      return [
        { id: 'actividades', label: 'Mis Actividades', icon: CheckSquare, desc: 'Tablero de trabajo' },
        { id: 'reportar', label: 'Reportes de Incidencias', icon: Bug, desc: 'Errores e interrupciones' }
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
      
      {/* 1. SIDEBAR IZQUIERDA (Desktop fija, Mobile deslizable) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <Cpu size={22} />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white block">
                  IKernell
                </span>
                <span className="text-[0.65rem] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block -mt-1">
                  Portal Corporativo
                </span>
              </div>
            </Link>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Mini Profile en Sidebar */}
          <div className="p-5 mx-4 my-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-extrabold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
              {user?.nombre ? user.nombre.charAt(0) : <User size={18} />}
            </div>
            <div className="truncate">
              <div className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                {user?.nombre ? `${user.nombre} ${user.apellido || ''}` : user?.email}
              </div>
              <span className={`inline-block text-[0.65rem] font-extrabold uppercase px-2 py-0.5 rounded-md border mt-0.5 ${roleInfo.classes}`}>
                {user?.rol || 'TRABAJADOR'}
              </span>
            </div>
          </div>

          {/* Secciones de Navegación */}
          <div className="px-4 space-y-6">
            
            {/* Sección Principal del Rol */}
            <div>
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 block mb-2">
                Panel del {user?.rol || 'Usuario'}
              </span>
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
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <div className="flex-1 truncate">
                        <div className="truncate">{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sección de Herramientas Corporativas Transversales */}
            <div>
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 block mb-2">
                Herramientas Corporativas
              </span>
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="truncate">{tool.label}</span>
                      </span>
                      <span className={`text-[0.6rem] font-black px-1.5 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {tool.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/80 transition-all cursor-pointer shadow-sm"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
          <div className="text-center">
            <span className="text-[0.65rem] text-zinc-400 font-medium">IKernell Enterprise v2.4 • JWT RBAC</span>
          </div>
        </div>

      </aside>

      {/* Overlay Oscuro para Móvil */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 2. CONTENIDO PRINCIPAL Y TOPBAR */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* TOPBAR (HEADER PRIVADO) */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
          
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
