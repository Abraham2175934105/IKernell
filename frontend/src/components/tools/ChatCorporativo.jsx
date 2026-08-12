import React, { useState } from 'react';
import { MessageSquare, Send, Users, Hash, Shield, Sparkles, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export const ChatCorporativo = () => {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');

  const [messages, setMessages] = useState({
    general: [
      { id: 1, sender: 'Roberto Silva', role: 'COORDINADOR', text: 'Buenos días a todo el equipo. Recuerden registrar las contingencias y tiempos perdidos para calibrar el Semáforo Predictivo.', time: '09:00 AM' },
      { id: 2, sender: 'Carlos Mendoza', role: 'LIDER', text: 'Entendido Roberto. Estamos por consolidar el lote ETL para el envío semanal hacia Brasil.', time: '09:15 AM' },
      { id: 3, sender: 'Ana Gómez', role: 'DESARROLLADOR', text: 'Terminadas las pruebas de carga en el módulo de autenticación stateless JWT.', time: '09:30 AM' }
    ],
    arquitectura: [
      { id: 1, sender: 'Carlos Mendoza', role: 'LIDER', text: 'Se ha validado el pool HikariCP con 30 conexiones concurrentes.', time: '08:45 AM' },
      { id: 2, sender: 'Roberto Silva', role: 'COORDINADOR', text: 'Excelente. Las excepciones de saturación ahora retornan HTTP 503 controlado.', time: '09:10 AM' }
    ],
    'soporte-brasil': [
      { id: 1, sender: 'Carlos Mendoza', role: 'LIDER', text: 'Archivo METRICAS_BRASIL exportado exitosamente bajo norma ISO 8601 UTC.', time: '08:30 AM' },
      { id: 2, sender: 'Ana Gómez', role: 'DESARROLLADOR', text: 'Canales SFTP verificados.', time: '08:50 AM' }
    ],
    'alertas-semaforo': [
      { id: 1, sender: 'Sistema Predictivo', role: 'SISTEMA', text: 'ALERTA: Umbral de contingencias verificado. Proyecto IKernell en estado ESTABLE (Verde).', time: '08:00 AM' }
    ]
  });

  const channels = [
    { id: 'general', name: 'General - Equipo IKernell', count: messages.general.length },
    { id: 'arquitectura', name: 'Arquitectura & Backend', count: messages.arquitectura.length },
    { id: 'soporte-brasil', name: 'Alianza Brasil (ETL)', count: messages['soporte-brasil'].length },
    { id: 'alertas-semaforo', name: 'Alertas del Semáforo', count: messages['alertas-semaforo'].length }
  ];

  const teamMembers = [
    { name: 'Roberto Silva', role: 'Coordinador', online: true },
    { name: 'Carlos Mendoza', role: 'Líder de Proyecto', online: true },
    { name: 'Ana Gómez', role: 'Desarrolladora', online: true },
    { name: 'Felipe Torres', role: 'QA Tester', online: false }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsgObj = {
      id: Date.now(),
      sender: user?.nombre ? `${user.nombre} ${user.apellido || ''}` : (user?.email || 'Usuario Actual'),
      role: user?.rol || 'DESARROLLADOR',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], newMsgObj]
    }));

    setNewMessage('');
  };

  return (
    <div className="glass-card p-0 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none animate-fade-in">
      
      {/* Header del Chat */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/70 dark:bg-zinc-900/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Chat Corporativo Transversal
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Canal unificado de comunicacion interna entre Coordinadores, Lideres y Desarrolladores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Canal Seguro Activo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
        
        {/* Sidebar Canales y Miembros */}
        <div className="p-4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 flex flex-col justify-between">
          <div>
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 mb-3 block">
              Canales de Discusion
            </span>
            <div className="flex flex-col gap-1.5 mb-6">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    activeChannel === ch.id
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Hash size={14} className="opacity-60 flex-shrink-0" /> {ch.name}
                  </span>
                  <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-full ${
                    activeChannel === ch.id ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {ch.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 mb-3 block">
              Miembros en Linea ({teamMembers.filter(m => m.online).length})
            </span>
            <div className="flex flex-col gap-2">
              {teamMembers.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs px-2 py-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.online ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{m.name}</span>
                  </div>
                  <span className="text-[0.65rem] text-zinc-500 dark:text-zinc-400 font-medium">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[0.65rem] text-zinc-400 font-medium">IKernell Secure Corporate Chat</span>
          </div>
        </div>

        {/* Area Principal de Mensajes */}
        <div className="md:col-span-3 flex flex-col justify-between p-4 sm:p-6 bg-white dark:bg-zinc-950/40">
          
          {/* Lista de Mensajes */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 max-h-[380px]">
            {messages[activeChannel].map(msg => {
              const isCurrentUser = msg.sender.includes(user?.nombre || user?.email || '___');
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{msg.sender}</span>
                    <span className={`text-[0.6rem] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                      msg.role === 'COORDINADOR' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' :
                      msg.role === 'LIDER' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                      msg.role === 'SISTEMA' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                      'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                    }`}>
                      {msg.role}
                    </span>
                    <span className="text-[0.65rem] text-zinc-400">{msg.time}</span>
                  </div>
                  <div className={`p-3.5 rounded-2xl max-w-lg text-sm leading-relaxed ${
                    isCurrentUser
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium rounded-tr-none shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulario de Envio */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Escribir mensaje en #${activeChannel}...`}
              className="input-field py-3 text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="gradient-button px-5 py-3 text-sm font-bold flex-shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
