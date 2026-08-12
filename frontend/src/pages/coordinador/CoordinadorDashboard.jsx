import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  Users, UserPlus, UserX, Search, Shield, CheckCircle2, 
  Mail, Phone, Clock, FileText, AlertCircle, Sparkles, Filter, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CoordinadorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'solicitudes'
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulario nuevo trabajador
  const [newTrabajador, setNewTrabajador] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    email: '',
    profesion: 'Ingeniero de Software',
    especialidad: 'Frontend React / UI/UX',
    rol: 'DESARROLLADOR'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      
      // Personal inicial
      setTrabajadores([
        { idTrabajador: 1, identificacion: '10203040', nombre: 'Carlos', apellido: 'Mendoza', profesion: 'Ingeniero de Software', especialidad: 'Backend Java / Spring Boot', rol: 'LIDER', email: 'carlos.lider@ikernell.org', estado: true },
        { idTrabajador: 2, identificacion: '50607080', nombre: 'Ana', apellido: 'Gómez', profesion: 'Ingeniera de Sistemas', especialidad: 'Frontend React / UI/UX', rol: 'DESARROLLADOR', email: 'ana.dev@ikernell.org', estado: true },
        { idTrabajador: 3, identificacion: '90807060', nombre: 'Roberto', apellido: 'Silva', profesion: 'Arquitecto de Datos', especialidad: 'PostgreSQL & ETL', rol: 'COORDINADOR', email: 'roberto.coord@ikernell.org', estado: true },
        { idTrabajador: 4, identificacion: '11223344', nombre: 'Felipe', apellido: 'Torres', profesion: 'Analista QA', especialidad: 'Pruebas de Estrés & Automatización', rol: 'DESARROLLADOR', email: 'felipe.qa@ikernell.org', estado: false }
      ]);

      // Solicitudes Web de contacto (Atención de consultas públicas)
      setSolicitudes([
        { id: 1, nombre: 'Empresa Banco Sur Brasil', email: 'contacto@bancobrasil.com', telefono: '+55 11 98765-4321', asunto: 'Integración de API de Pagos Segura', mensaje: 'Deseamos coordinar la exportación del módulo de métricas ETL y consultoría de arquitectura.', fecha: 'Hace 2 horas', estado: 'PENDIENTE' },
        { id: 2, nombre: 'Tech Solutions Latam', email: 'director@techlatam.io', telefono: '+57 300 123 4567', asunto: 'Consultoría en Spring Boot 3 & JWT', mensaje: 'Requerimos auditoría de ciberseguridad y stress testing para nuestra infraestructura.', fecha: 'Ayer', estado: 'ATENDIDA' }
      ]);
    } catch (err) {
      toast.error('Error al sincronizar datos del Coordinador.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInhabilitar = (id) => {
    const confirm = window.confirm('¿Está seguro de inhabilitar a este trabajador? No podrá iniciar sesión pero se conservará su historial de actividades.');
    if (!confirm) return;

    setTrabajadores(prev => prev.map(t => t.idTrabajador === id ? { ...t, estado: !t.estado } : t));
    toast.success('Estado del trabajador actualizado.');
  };

  const handleCrearTrabajador = (e) => {
    e.preventDefault();
    if (!newTrabajador.nombre || !newTrabajador.email || !newTrabajador.identificacion) {
      toast.error('Por favor complete los campos obligatorios.');
      return;
    }

    const nuevo = {
      ...newTrabajador,
      idTrabajador: Date.now(),
      estado: true
    };

    setTrabajadores([nuevo, ...trabajadores]);
    toast.success(`Trabajador ${nuevo.nombre} registrado con éxito.`);
    setShowCreateModal(false);
    setNewTrabajador({
      identificacion: '',
      nombre: '',
      apellido: '',
      email: '',
      profesion: 'Ingeniero de Software',
      especialidad: 'Frontend React / UI/UX',
      rol: 'DESARROLLADOR'
    });
  };

  const handleToggleEstadoSolicitud = (id) => {
    setSolicitudes(prev => prev.map(s => {
      if (s.id === id) {
        const nuevoEstado = s.estado === 'PENDIENTE' ? 'ATENDIDA' : 'PENDIENTE';
        toast.success(`Solicitud marcada como ${nuevoEstado}.`);
        return { ...s, estado: nuevoEstado };
      }
      return s;
    }));
  };

  const filteredTrabajadores = trabajadores.filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.identificacion.includes(searchTerm) ||
    t.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activosCount = trabajadores.filter(t => t.estado).length;
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'PENDIENTE').length;

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      customMetrics={{
        metric1: `Personal Activo: ${activosCount}`,
        metric2: `Solicitudes Web: ${solicitudesPendientes} Pendientes`
      }}
    >
      
      {/* 1. SECCIÓN: GESTIÓN DE PERSONAL */}
      {activeTab === 'personal' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header de la Vista */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
                Administración y Talento Humano
              </span>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Gestión Centralizada de Personal
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Alta, edición y control de acceso lógico para Líderes y Desarrolladores (RF-08 a RF-13)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="gradient-button text-xs py-3 px-5 font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <UserPlus size={16} /> Registrar Trabajador
            </button>
          </div>

          {/* Barra de Búsqueda y Filtro */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nombre, identificación, especialidad o rol..."
              className="input-field pl-11 py-3 text-sm bg-white dark:bg-zinc-900"
            />
          </div>

          {/* Tabla de Personal */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[0.65rem] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="p-4">Identificación</th>
                    <th className="p-4">Nombre Completo</th>
                    <th className="p-4">Profesión / Especialidad</th>
                    <th className="p-4">Rol Asignado</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                  {filteredTrabajadores.map(t => (
                    <tr key={t.idTrabajador} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">{t.identificacion}</td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-900 dark:text-white text-sm">{t.nombre} {t.apellido}</div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-[0.7rem]">{t.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{t.profesion}</div>
                        <div className="text-zinc-500 text-[0.7rem]">{t.especialidad}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block text-[0.65rem] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                          t.rol === 'COORDINADOR' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' :
                          t.rol === 'LIDER' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                          'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        }`}>
                          {t.rol}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[0.7rem] font-bold px-2.5 py-1 rounded-full ${
                          t.estado 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.estado ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          {t.estado ? 'Habilitado' : 'Inhabilitado'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleInhabilitar(t.idTrabajador)}
                          className={`text-xs py-1.5 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                            t.estado
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {t.estado ? 'Inhabilitar' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 2. SECCIÓN: SOLICITUDES DE CONTACTO WEB */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1">
              Atención al Cliente Corporativo
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Bandeja de Solicitudes de Contacto Web
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Consultas recibidas en tiempo real a través del formulario público (ContactForm.jsx)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solicitudes.map(sol => (
              <div 
                key={sol.id} 
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[0.65rem] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      sol.estado === 'PENDIENTE'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    }`}>
                      {sol.estado}
                    </span>
                    <span className="text-[0.65rem] text-zinc-400 flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {sol.fecha}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mb-1">{sol.asunto}</h3>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">{sol.nombre}</p>
                  
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                    "{sol.mensaje}"
                  </div>

                  <div className="flex flex-col gap-1 text-[0.7rem] text-zinc-500 font-medium mb-4">
                    <div className="flex items-center gap-2"><Mail size={12} /> {sol.email}</div>
                    <div className="flex items-center gap-2"><Phone size={12} /> {sol.telefono}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleEstadoSolicitud(sol.id)}
                  className="outline-button text-xs py-2 w-full font-bold cursor-pointer"
                >
                  {sol.estado === 'PENDIENTE' ? 'Marcar como Atendida' : 'Reabrir Solicitud'}
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Modal Registrar Trabajador */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserPlus size={20} /> Registrar Nuevo Trabajador
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearTrabajador} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Identificación</label>
                  <input
                    type="text"
                    required
                    value={newTrabajador.identificacion}
                    onChange={(e) => setNewTrabajador({ ...newTrabajador, identificacion: e.target.value })}
                    placeholder="1020304050"
                    className="input-field py-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Rol en el Sistema</label>
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
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nombres</label>
                  <input
                    type="text"
                    required
                    value={newTrabajador.nombre}
                    onChange={(e) => setNewTrabajador({ ...newTrabajador, nombre: e.target.value })}
                    placeholder="Ej. Mateo"
                    className="input-field py-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Apellidos</label>
                  <input
                    type="text"
                    required
                    value={newTrabajador.apellido}
                    onChange={(e) => setNewTrabajador({ ...newTrabajador, apellido: e.target.value })}
                    placeholder="Ej. Ríos"
                    className="input-field py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Correo Electrónico Corporativo</label>
                <input
                  type="email"
                  required
                  value={newTrabajador.email}
                  onChange={(e) => setNewTrabajador({ ...newTrabajador, email: e.target.value })}
                  placeholder="mateo.dev@ikernell.org"
                  className="input-field py-2"
                />
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
                  onClick={() => setShowCreateModal(false)}
                  className="outline-button text-xs py-2 px-4 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gradient-button text-xs py-2 px-5 font-bold cursor-pointer"
                >
                  Guardar Trabajador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};
