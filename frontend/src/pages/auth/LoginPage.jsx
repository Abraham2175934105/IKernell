import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, Lock, Mail, LogIn, AlertCircle, Shield, ArrowLeft, KeyRound } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Credenciales de acceso inválidas o usuario inhabilitado.');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      if (data.rol === 'COORDINADOR') navigate('/coordinador');
      else if (data.rol === 'LIDER') navigate('/lider');
      else navigate('/desarrollador');

    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (rolEmail) => {
    setEmail(rolEmail);
    setPassword('abrah1234');
  };

  return (
    <div className="pt-32 pb-20 min-h-[90vh] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-lg relative animate-slide-up">
        
        {/* Glow ambient accent */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-50 pointer-events-none" />

        {/* Card: Radiant Pure White in Light Mode, Elegant Dark Zinc in Dark Mode */}
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-zinc-300/60 dark:shadow-none transition-all duration-300">
          
          {/* Top back link */}
          <div className="mb-6 flex justify-between items-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Volver al Inicio
            </Link>
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              Seguridad JWT
            </span>
          </div>

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-transform hover:scale-105">
              <Cpu size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2">
              Acceso al Portal
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-medium">
              Autenticación corporativa para Coordinadores, Líderes y Desarrolladores
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 mb-6 font-medium border border-red-200 dark:border-red-800/60">
              <AlertCircle size={18} className="flex-shrink-0 text-red-500" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. lider@ikernell.org"
                  className="input-field pl-12 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input-field pl-12 py-3"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="gradient-button w-full py-3.5 mt-2 font-bold text-sm shadow-lg"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  Validando Token JWT...
                </span>
              ) : (
                <>Ingresar al Sistema <LogIn size={18} /></>
              )}
            </button>
          </form>

          {/* Quick Roles Assistant */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
              <KeyRound size={14} /> Accesos Rápidos de Prueba:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('carlos.lider@ikernell.org')}
                className="p-2 text-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[0.7rem] font-bold text-zinc-800 dark:text-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                Líder
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('ana.dev@ikernell.org')}
                className="p-2 text-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[0.7rem] font-bold text-zinc-800 dark:text-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                Desarrollador
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('roberto.coord@ikernell.org')}
                className="p-2 text-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[0.7rem] font-bold text-zinc-800 dark:text-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                Coordinador
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1.5">
              <Shield size={12} /> Cifrado unidireccional BCrypt (RNF-10) • Acceso Restringido
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};



