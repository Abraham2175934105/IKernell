import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { Users, UserPlus, UserX, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const CoordinadorDashboard = () => {
  const { user } = useAuth();
  const api = useApi();

  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      mockTrabajadores();
    } catch (err) {
      toast.error('Error al cargar lista de personal.');
      mockTrabajadores();
    } finally {
      setLoading(false);
    }
  };

  const mockTrabajadores = () => {
    setTrabajadores([
      { idTrabajador: 1, identificacion: '10203040', nombre: 'Carlos', apellido: 'Mendoza', profesion: 'Ingeniero de Software', especialidad: 'Backend Java / Spring Boot', rol: 'LIDER', email: 'carlos.lider@ikernell.org', estado: true },
      { idTrabajador: 2, identificacion: '50607080', nombre: 'Ana', apellido: 'Gómez', profesion: 'Ingeniera de Sistemas', especialidad: 'Frontend React / UI/UX', rol: 'DESARROLLADOR', email: 'ana.dev@ikernell.org', estado: true },
      { idTrabajador: 3, identificacion: '90807060', nombre: 'Roberto', apellido: 'Silva', profesion: 'Arquitecto de Datos', especialidad: 'PostgreSQL & ETL', rol: 'COORDINADOR', email: 'roberto.coord@ikernell.org', estado: true },
      { idTrabajador: 4, identificacion: '11223344', nombre: 'Felipe', apellido: 'Torres', profesion: 'Analista de Pruebas', especialidad: 'QA & Automatización', rol: 'DESARROLLADOR', email: 'felipe.qa@ikernell.org', estado: false }
    ]);
  };

  const handleInhabilitar = async (id) => {
    const confirm = window.confirm('¿Está seguro de inhabilitar a este trabajador?');
    if (!confirm) return;
    
    const toastId = toast.loading('Procesando inhabilitación...');
    try {
      await new Promise(r => setTimeout(r, 800));
      setTrabajadores(trabajadores.map(t => t.idTrabajador === id ? { ...t, estado: false } : t));
      toast.success('Trabajador inhabilitado exitosamente.', { id: toastId });
    } catch (err) {
      toast.error('Error al inhabilitar trabajador.', { id: toastId });
    }
  };

  const filtered = trabajadores.filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.identificacion.includes(searchTerm)
  );

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col gap-8">
      
      {/* Header Coordinador */}
      <div className="glass-panel p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">
            Rol: Coordinador de Proyectos
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-2 text-zinc-900 dark:text-white tracking-tight">
            Gestión de Personal
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base font-medium">
            Registro de Desarrolladores, Edición de Perfiles e Inhabilitación Lógica (RF-08 a RF-13)
          </p>
        </div>

        <button className="gradient-button text-sm py-2.5 px-6 whitespace-nowrap font-bold shadow-lg">
          <UserPlus size={18} /> Registrar Personal
        </button>
      </div>

      {/* Listado General */}
      <div className="glass-panel p-6 md:p-10 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white shadow-sm">
              <Users size={24} />
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Listado General</h3>
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse bg-white dark:bg-zinc-900">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Identificación</th>
                <th className="py-4 px-5">Nombre Completo</th>
                <th className="py-4 px-5">Especialidad</th>
                <th className="py-4 px-5">Rol</th>
                <th className="py-4 px-5">Estado</th>
                <th className="py-4 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm font-medium">
              {loading ? (
                Array(4).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                    <td className="py-4 px-5">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-40"></div>
                    </td>
                    <td className="py-4 px-5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28"></div></td>
                    <td className="py-4 px-5"><div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full w-24"></div></td>
                    <td className="py-4 px-5"><div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full w-20"></div></td>
                    <td className="py-4 px-5"><div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-zinc-500 dark:text-zinc-400 font-medium">No se encontraron trabajadores.</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.idTrabajador} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-5 font-mono text-zinc-900 dark:text-zinc-100 font-semibold">{t.identificacion}</td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-zinc-900 dark:text-white">{t.nombre} {t.apellido}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t.email}</div>
                    </td>
                    <td className="py-4 px-5 text-zinc-600 dark:text-zinc-400">{t.especialidad}</td>
                    <td className="py-4 px-5">
                      <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 uppercase tracking-wider">
                        {t.rol}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-[0.7rem] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                        t.estado 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {t.estado ? 'ACTIVO' : 'INHABILITADO'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      {t.estado && (
                        <button
                          onClick={() => handleInhabilitar(t.idTrabajador)}
                          className="danger-button inline-flex text-xs py-1.5 px-3.5 whitespace-nowrap"
                        >
                          <UserX size={14} /> Inhabilitar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};


