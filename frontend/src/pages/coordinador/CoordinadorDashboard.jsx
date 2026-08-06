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
      // const data = await api.get('/coordinador/trabajadores');
      // setTrabajadores(data || []);
      await new Promise(r => setTimeout(r, 1000)); // Simulate loading UX
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

  // RF-11: Inhabilitación lógica
  const handleInhabilitar = async (id) => {
    const confirm = window.confirm('¿Está seguro de inhabilitar a este trabajador?');
    if (!confirm) return;
    
    const toastId = toast.loading('Procesando inhabilitación...');
    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate API delay
      // await api.patch(`/coordinador/trabajadores/${id}/inhabilitar`);
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
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      
      {/* Header Coordinador */}
      <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-purple-500/10 text-purple-400 text-xs font-bold px-3 py-1 rounded-full tracking-wider">
            ROL: COORDINADOR DE PROYECTOS
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-2">
            Gestión de Personal & <span className="bg-gradient-to-r from-purple-400 to-primary bg-clip-text text-transparent">Asignaciones</span>
          </h2>
          <p className="text-text-muted text-sm">
            Registro de Desarrolladores, Edición de Perfiles e Inhabilitación Lógica (RF-08 a RF-13)
          </p>
        </div>

        <button className="bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
          <UserPlus size={18} /> Registrar Personal
        </button>
      </div>

      {/* Listado General */}
      <div className="glass-panel p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Users size={24} />
            </div>
            <h3 className="text-2xl font-bold">Listado General</h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-text-muted text-sm uppercase tracking-wider">
                <th className="py-4 px-4 font-semibold">Identificación</th>
                <th className="py-4 px-4 font-semibold">Nombre Completo</th>
                <th className="py-4 px-4 font-semibold">Especialidad</th>
                <th className="py-4 px-4 font-semibold">Rol</th>
                <th className="py-4 px-4 font-semibold">Estado</th>
                <th className="py-4 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton Rows
                Array(4).fill(0).map((_, idx) => (
                  <tr key={idx} className="border-b border-white/5 animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-20"></div></td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-white/5 rounded w-40"></div>
                    </td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-white/10 rounded-full w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-white/10 rounded-full w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-8 bg-white/10 rounded-lg w-full max-w-[120px] ml-auto"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted">No se encontraron trabajadores.</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.idTrabajador} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4 font-medium text-text-main">{t.identificacion}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white group-hover:text-primary transition-colors">{t.nombre} {t.apellido}</div>
                      <div className="text-xs text-text-dim mt-0.5">{t.email}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-text-muted">{t.especialidad}</td>
                    <td className="py-4 px-4">
                      <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {t.rol}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-full border ${
                        t.estado 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {t.estado ? 'ACTIVO' : 'INHABILITADO'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {t.estado && (
                        <button
                          onClick={() => handleInhabilitar(t.idTrabajador)}
                          className="danger-button inline-flex text-xs py-1.5 px-3 whitespace-nowrap"
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
