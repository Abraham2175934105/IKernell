import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  Users, UserPlus, UserX, Search, Shield, CheckCircle2, 
  Mail, Phone, Clock, FileText, AlertTriangle, Sparkles, Filter, X,
  Loader2, RefreshCw, Inbox, Pencil, Power, Check, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PredictorBurnout } from '../../components/dashboard/PredictorBurnout';

// Variantes de animación de alto rendimiento y ultra rápidas (0.25s)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  }
};

/* ─── Skeleton Component ─── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6"><div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" /></td>
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div>
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
          <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </td>
    <td className="py-4 px-6">
      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-1" />
      <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
    </td>
    <td className="py-4 px-6"><div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
    <td className="py-4 px-6"><div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
    <td className="py-4 px-6 text-right"><div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl ml-auto" /></td>
  </tr>
);

// Estado vacío cuando no hay registros para mostrar
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center w-full">
    <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
      <Icon size={36} className="text-zinc-400 dark:text-zinc-500" />
    </div>
    <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-2">{title}</h3>
    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-4">{description}</p>
    {action && action}
  </div>
);

// Helper para extraer iniciales del nombre completo
const getInitials = (nombre = '', apellido = '') => {
  const n = nombre.trim().charAt(0).toUpperCase();
  const a = apellido.trim().charAt(0).toUpperCase();
  return `${n}${a}` || 'TK';
};

// Componente para Insignia de Rol con colores semánticos
const RoleBadge = ({ rol }) => {
  switch (rol) {
    case 'COORDINADOR':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
          <Shield size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
          Coordinador
        </span>
      );
    case 'LIDER':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
          <Sparkles size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
          Líder de Proyecto
        </span>
      );
    case 'DESARROLLADOR':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <Users size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          Desarrollador
        </span>
      );
  }
};

// Avatar con colores según el rol
const UserAvatar = ({ nombre, apellido, rol, fotoUrl }) => {
  const initials = getInitials(nombre, apellido);
  
  const getAvatarStyles = () => {
    switch (rol) {
      case 'COORDINADOR':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'LIDER':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'DESARROLLADOR':
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  if (fotoUrl) {
    return (
      <img 
        src={fotoUrl} 
        alt={`${nombre} ${apellido}`} 
        className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0"
      />
    );
  }

  return (
    <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border shadow-sm shrink-0 ${getAvatarStyles()}`}>
      {initials}
    </div>
  );
};

export const CoordinadorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('personal');
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingSolicitudId, setTogglingSolicitudId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState(null);

  const [newTrabajador, setNewTrabajador] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    email: '',
    profesion: 'Ingeniero de Software',
    especialidad: 'Frontend React / UI/UX',
    rol: 'DESARROLLADOR',
    passwordHash: 'abrah1234'
  });
  const [formErrors, setFormErrors] = useState({});

  // Peticiones API
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [trabajadoresRes, solicitudesRes] = await Promise.all([
        api.get('/coordinador/trabajadores'),
        api.get('/coordinador/solicitudes')
      ]);

      setTrabajadores(Array.isArray(trabajadoresRes) ? trabajadoresRes : []);
      setSolicitudes(Array.isArray(solicitudesRes) ? solicitudesRes : []);
    } catch (err) {
      console.error('Error cargando datos del coordinador:', err);
      toast.error('Error al sincronizar datos desde PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejadores de eventos (Handlers)
  const handleInhabilitar = async (id) => {
    try {
      setTogglingId(id);
      const updated = await api.patch(`/coordinador/trabajadores/${id}/estado`);
      
      setTrabajadores(prev => prev.map(t => t.idTrabajador === id ? updated : t));
      const estadoTexto = updated.estado ? 'Habilitado' : 'Inhabilitado';
      toast.success(`Trabajador marcado como ${estadoTexto} en la base de datos.`);
    } catch (err) {
      console.error('Error alternando estado del trabajador:', err);
      toast.error(err.message || 'Error al actualizar el estado del trabajador.');
    } finally {
      setTogglingId(null);
    }
  };

  const validarFormulario = (data) => {
    const errors = {};
    if (!data.identificacion?.trim()) errors.identificacion = 'La identificación es obligatoria';
    if (!data.nombre?.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!data.apellido?.trim()) errors.apellido = 'El apellido es obligatorio';
    if (!data.email?.trim() || !data.email.includes('@')) {
      errors.email = 'Ingrese un correo electrónico corporativo válido';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrearTrabajador = async (e) => {
    e.preventDefault();
    if (!validarFormulario(newTrabajador)) return;

    try {
      setSubmitting(true);
      const nuevo = await api.post('/coordinador/trabajadores', {
        ...newTrabajador,
        identificacion: newTrabajador.identificacion.trim(),
        nombre: newTrabajador.nombre.trim(),
        apellido: newTrabajador.apellido.trim(),
        email: newTrabajador.email.trim(),
        profesion: newTrabajador.profesion.trim(),
        especialidad: newTrabajador.especialidad.trim(),
        rol: newTrabajador.rol,
        passwordHash: 'abrah1234'
      });

      setTrabajadores([nuevo, ...trabajadores]);
      toast.success(`Trabajador ${nuevo.nombre} ${nuevo.apellido} registrado exitosamente en PostgreSQL.`);
      setShowCreateModal(false);
      setNewTrabajador({
        identificacion: '',
        nombre: '',
        apellido: '',
        email: '',
        profesion: 'Ingeniero de Software',
        especialidad: 'Frontend React / UI/UX',
        rol: 'DESARROLLADOR',
        passwordHash: 'abrah1234'
      });
      setFormErrors({});
    } catch (err) {
      console.error('Error creando trabajador:', err);
      toast.error(err.message || 'Error al registrar el trabajador en el sistema.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualizarTrabajador = async (e) => {
    e.preventDefault();
    if (!editingTrabajador || !validarFormulario(editingTrabajador)) return;

    try {
      setSubmitting(true);
      const actualizado = await api.put(`/coordinador/trabajadores/${editingTrabajador.idTrabajador}`, {
        ...editingTrabajador,
        identificacion: editingTrabajador.identificacion.trim(),
        nombre: editingTrabajador.nombre.trim(),
        apellido: editingTrabajador.apellido.trim(),
        email: editingTrabajador.email.trim(),
        profesion: editingTrabajador.profesion?.trim() || 'Ingeniero de Software',
        especialidad: editingTrabajador.especialidad?.trim() || 'General',
        rol: editingTrabajador.rol
      });

      setTrabajadores(prev => prev.map(t => t.idTrabajador === actualizado.idTrabajador ? actualizado : t));
      toast.success(`Perfil de ${actualizado.nombre} ${actualizado.apellido} actualizado.`);
      setEditingTrabajador(null);
      setFormErrors({});
    } catch (err) {
      console.error('Error actualizando trabajador:', err);
      toast.error(err.message || 'Error al actualizar datos del trabajador.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstadoSolicitud = async (idSolicitud) => {
    try {
      setTogglingSolicitudId(idSolicitud);
      const updated = await api.patch(`/coordinador/solicitudes/${idSolicitud}/atender`);
      
      setSolicitudes(prev => prev.map(s => s.idSolicitud === idSolicitud ? updated : s));
      const estadoTxt = updated.atendido ? 'ATENDIDA' : 'PENDIENTE';
      toast.success(`Solicitud marcada como ${estadoTxt}.`);
    } catch (err) {
      console.error('Error actualizando solicitud:', err);
      toast.error(err.message || 'Error al actualizar el estado de la solicitud.');
    } finally {
      setTogglingSolicitudId(null);
    }
  };

  const filteredTrabajadores = trabajadores.filter(t => 
    (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.identificacion || '').includes(searchTerm) ||
    (t.especialidad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.rol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activosCount = trabajadores.filter(t => t.estado).length;
  const solicitudesPendientes = solicitudes.filter(s => !s.atendido).length;

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: loading ? 'Cargando...' : `Personal Activo: ${activosCount}`,
        metric2: loading ? '...' : `Solicitudes: ${solicitudesPendientes} Pendientes`
      }}
    >
      {/* 1. SECCIÓN: GESTIÓN DE PERSONAL (REDiseño Stripe / Vercel Enterprise) */}
      {activeTab === 'personal' && (
        <motion.div 
          key="personal"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          
          {/* Header de la Vista */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Administración y Talento Humano
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Gestión Centralizada de Personal
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Alta, edición y control de acceso lógico para Líderes y Desarrolladores — Persistencia directa en PostgreSQL
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={cargarDatos}
                disabled={loading}
                className="outline-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refrescar
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="gradient-button text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <UserPlus size={16} /> Registrar Trabajador
              </button>
            </div>
          </motion.div>

          {/* Barra de Búsqueda y Filtro */}
          <motion.div variants={itemVariants} className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nombre, correo, identificación, especialidad o rol..."
              className="input-field pl-11 py-3 text-sm bg-white dark:bg-zinc-900 shadow-sm"
            />
          </motion.div>

          {/* Tabla de Personal Rediseñada (Estilo Stripe / Vercel) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[780px]">
                {/* 1. Contenedor y Encabezados Modernos */}
                <thead className="bg-zinc-50/90 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="py-4 px-6">Identificación</th>
                    <th className="py-4 px-6">Trabajador</th>
                    <th className="py-4 px-6">Profesión / Especialidad</th>
                    <th className="py-4 px-6">Rol Asignado</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 font-medium">
                  {loading && (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  )}

                  {!loading && filteredTrabajadores.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={Inbox}
                          title="No se encontraron empleados"
                          description={searchTerm ? "No hay trabajadores que coincidan con los criterios de búsqueda." : "Aún no hay personal registrado en la base de datos."}
                          action={
                            <button
                              type="button"
                              onClick={() => setShowCreateModal(true)}
                              className="gradient-button text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5"
                            >
                              <UserPlus size={14} /> Registrar primer empleado
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  )}

                  {/* 5. Efectos Hover en Filas */}
                  {!loading && filteredTrabajadores.map(t => (
                    <tr 
                      key={t.idTrabajador} 
                      className="transition-colors duration-150 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 group"
                    >
                      {/* Identificación */}
                      <td className="py-4 px-6 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {t.identificacion}
                      </td>

                      {/* 2. Identidad Visual con Avatares */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            nombre={t.nombre} 
                            apellido={t.apellido} 
                            rol={t.rol} 
                            fotoUrl={t.fotoUrl} 
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {t.nombre} {t.apellido}
                            </div>
                            <div className="text-zinc-500 dark:text-zinc-400 text-xs truncate">
                              {t.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Profesión y Especialidad */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {t.profesion || 'Ingeniero de Software'}
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-xs">
                          {t.especialidad || 'General'}
                        </div>
                      </td>

                      {/* 3. Insignias (Badges) Dinámicas para los Roles */}
                      <td className="py-4 px-6">
                        <RoleBadge rol={t.rol} />
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${
                          t.estado 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${t.estado ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                          {t.estado ? 'Habilitado' : 'Inhabilitado'}
                        </span>
                      </td>

                      {/* 4. Acciones con Iconografía de Lucide React */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Editar con Icono */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTrabajador({ ...t });
                              setFormErrors({});
                            }}
                            title="Editar información del trabajador"
                            className="p-2 rounded-xl text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Botón Inhabilitar / Reactivar con Icono */}
                          <button
                            type="button"
                            disabled={togglingId === t.idTrabajador}
                            onClick={() => handleInhabilitar(t.idTrabajador)}
                            title={t.estado ? "Inhabilitar acceso lógico" : "Reactivar acceso lógico"}
                            className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                              t.estado
                                ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-transparent hover:border-red-200 dark:hover:border-red-800'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800'
                            }`}
                          >
                            {togglingId === t.idTrabajador ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Power size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </motion.div>
      )}

      {/* 2. SECCIÓN: SOLICITUDES DE CONTACTO WEB */}
      {activeTab === 'solicitudes' && (
        <motion.div 
          key="solicitudes"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Atención al Cliente Corporativo
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Bandeja de Solicitudes de Contacto Web
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Consultas recibidas en tiempo real desde el formulario público — Persistencia en PostgreSQL
              </p>
            </div>

            <button
              type="button"
              onClick={cargarDatos}
              disabled={loading}
              className="outline-button text-xs py-2.5 px-4 font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refrescar
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading && (
              <>
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse h-48" />
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse h-48" />
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse h-48" />
              </>
            )}

            {!loading && solicitudes.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={Inbox}
                  title="No hay solicitudes de contacto"
                  description="Cuando los visitantes envíen consultas a través del portal público, aparecerán aquí para su gestión y seguimiento."
                />
              </div>
            )}

            {!loading && solicitudes.map(sol => (
              <div 
                key={sol.idSolicitud} 
                className={`bg-white dark:bg-zinc-900 p-6 rounded-3xl border flex flex-col justify-between shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.12)] hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-200 h-full ${
                  sol.atendido 
                    ? 'border-zinc-200 dark:border-zinc-800/80 opacity-90' 
                    : 'border-blue-300 dark:border-blue-700/80 ring-1 ring-blue-100 dark:ring-blue-950/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[0.65rem] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      !sol.atendido
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    }`}>
                      {sol.atendido ? 'ATENDIDA' : 'PENDIENTE'}
                    </span>
                    <span className="text-[0.65rem] text-zinc-400 flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {sol.fechaEnvio ? new Date(sol.fechaEnvio).toLocaleString() : 'Reciente'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mb-1">{sol.asunto}</h3>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">{sol.nombreRemitente}</p>
                  
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                    "{sol.mensaje}"
                  </div>

                  <div className="flex flex-col gap-1 text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium mb-4">
                    <div className="flex items-center gap-2"><Mail size={12} /> {sol.emailRemitente}</div>
                    {sol.telefono && <div className="flex items-center gap-2"><Phone size={12} /> {sol.telefono}</div>}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={togglingSolicitudId === sol.idSolicitud}
                  onClick={() => handleToggleEstadoSolicitud(sol.idSolicitud)}
                  className={`text-xs py-2 w-full font-bold cursor-pointer rounded-xl border transition-all inline-flex items-center justify-center gap-2 ${
                    !sol.atendido
                      ? 'gradient-button'
                      : 'outline-button'
                  }`}
                >
                  {togglingSolicitudId === sol.idSolicitud ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  {!sol.atendido ? 'Marcar como Atendida' : 'Reabrir Solicitud'}
                </button>
              </div>
            ))}
          </motion.div>

        </motion.div>
      )}

      {/* 3. SECCIÓN: PREDICTOR DE BURNOUT HISTÓRICO (RF-35) */}
      {activeTab === 'burnout' && (
        <motion.div 
          key="burnout"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <PredictorBurnout />
        </motion.div>
      )}

      {/* Modal Registrar Trabajador */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-blue-600 dark:text-blue-400" /> Registrar Nuevo Trabajador
                </h3>
                <button onClick={() => { setShowCreateModal(false); setFormErrors({}); }} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCrearTrabajador} className="space-y-4 text-xs" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Identificación *</label>
                    <input
                      type="text"
                      required
                      value={newTrabajador.identificacion}
                      onChange={(e) => { setNewTrabajador({ ...newTrabajador, identificacion: e.target.value }); setFormErrors(p => ({ ...p, identificacion: undefined })); }}
                      placeholder="1020304050"
                      className={`input-field py-2 ${formErrors.identificacion ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {formErrors.identificacion && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.identificacion}</p>}
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Rol en el Sistema *</label>
                    <select
                      value={newTrabajador.rol}
                      onChange={(e) => setNewTrabajador({ ...newTrabajador, rol: e.target.value })}
                      className="input-field py-2 font-bold uppercase"
                    >
                      <option value="DESARROLLADOR">Desarrollador</option>
                      <option value="LIDER">Líder</option>
                      <option value="COORDINADOR">Coordinador</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={newTrabajador.nombre}
                      onChange={(e) => { setNewTrabajador({ ...newTrabajador, nombre: e.target.value }); setFormErrors(p => ({ ...p, nombre: undefined })); }}
                      placeholder="Ej. Mateo"
                      className={`input-field py-2 ${formErrors.nombre ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {formErrors.nombre && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.nombre}</p>}
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={newTrabajador.apellido}
                      onChange={(e) => { setNewTrabajador({ ...newTrabajador, apellido: e.target.value }); setFormErrors(p => ({ ...p, apellido: undefined })); }}
                      placeholder="Ej. Ríos"
                      className={`input-field py-2 ${formErrors.apellido ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {formErrors.apellido && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.apellido}</p>}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Correo Electrónico Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={newTrabajador.email}
                    onChange={(e) => { setNewTrabajador({ ...newTrabajador, email: e.target.value }); setFormErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="mateo.dev@ikernell.com"
                    className={`input-field py-2 ${formErrors.email ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                  {formErrors.email && <p className="text-[0.65rem] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Profesión</label>
                    <input
                      type="text"
                      value={newTrabajador.profesion}
                      onChange={(e) => setNewTrabajador({ ...newTrabajador, profesion: e.target.value })}
                      placeholder="Ingeniero de Software"
                      className="input-field py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Especialidad</label>
                    <input
                      type="text"
                      value={newTrabajador.especialidad}
                      onChange={(e) => setNewTrabajador({ ...newTrabajador, especialidad: e.target.value })}
                      placeholder="Backend Java / Spring Boot"
                      className="input-field py-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setFormErrors({}); }}
                    disabled={submitting}
                    className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Guardar Trabajador'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Editar Trabajador */}
      <AnimatePresence>
        {editingTrabajador && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Pencil size={18} className="text-blue-600 dark:text-blue-400" /> Editar Perfil de Trabajador
                </h3>
                <button onClick={() => { setEditingTrabajador(null); setFormErrors({}); }} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleActualizarTrabajador} className="space-y-4 text-xs" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Identificación *</label>
                    <input
                      type="text"
                      required
                      value={editingTrabajador.identificacion}
                      onChange={(e) => setEditingTrabajador({ ...editingTrabajador, identificacion: e.target.value })}
                      className="input-field py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Rol en el Sistema *</label>
                    <select
                      value={editingTrabajador.rol}
                      onChange={(e) => setEditingTrabajador({ ...editingTrabajador, rol: e.target.value })}
                      className="input-field py-2 font-bold uppercase"
                    >
                      <option value="DESARROLLADOR">Desarrollador</option>
                      <option value="LIDER">Líder</option>
                      <option value="COORDINADOR">Coordinador</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={editingTrabajador.nombre}
                      onChange={(e) => setEditingTrabajador({ ...editingTrabajador, nombre: e.target.value })}
                      className="input-field py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={editingTrabajador.apellido}
                      onChange={(e) => setEditingTrabajador({ ...editingTrabajador, apellido: e.target.value })}
                      className="input-field py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Correo Electrónico Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={editingTrabajador.email}
                    onChange={(e) => setEditingTrabajador({ ...editingTrabajador, email: e.target.value })}
                    className="input-field py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Profesión</label>
                    <input
                      type="text"
                      value={editingTrabajador.profesion || ''}
                      onChange={(e) => setEditingTrabajador({ ...editingTrabajador, profesion: e.target.value })}
                      className="input-field py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Especialidad</label>
                    <input
                      type="text"
                      value={editingTrabajador.especialidad || ''}
                      onChange={(e) => setEditingTrabajador({ ...editingTrabajador, especialidad: e.target.value })}
                      className="input-field py-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => { setEditingTrabajador(null); setFormErrors({}); }}
                    disabled={submitting}
                    className="outline-button text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Actualizando...</> : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};
