import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Send, Users, Hash, Shield, Sparkles, CheckCircle2, User,
  Loader2, RefreshCw, AlertCircle, Clock, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CHANNELS = [
  { id: 'general', name: 'General - Equipo IKernell', desc: 'Comunicaciones y anuncios generales' },
  { id: 'arquitectura', name: 'Arquitectura & Backend', desc: 'Diseño Spring Boot, Hibernate y PostgreSQL' },
  { id: 'soporte-brasil', name: 'Alianza Brasil (ETL)', desc: 'Normativa ISO 8601 UTC y transferencias SFTP' },
  { id: 'alertas-semaforo', name: 'Alertas del Semáforo', desc: 'Notificaciones automáticas del motor predictivo' }
];

export const ChatCorporativo = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Mantiene el scroll en el mensaje más reciente al actualizar la conversación
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Peticiones API
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await api.get('/chat/usuarios');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando miembros del chat:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [api]);

  // Carga el historial de mensajes del canal seleccionado
  const cargarMensajes = useCallback(async (channelId = activeChannel) => {
    try {
      setLoadingMessages(true);
      const data = await api.get(`/chat/mensajes?canal=${channelId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando mensajes del canal:', err);
      toast.error('Error al cargar mensajes del canal.');
    } finally {
      setLoadingMessages(false);
    }
  }, [api, activeChannel]);

  // Efectos (Hooks)
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  useEffect(() => {
    cargarMensajes(activeChannel);
  }, [cargarMensajes, activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Manejadores de eventos (Handlers)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const texto = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await api.post('/chat/mensajes', {
        canal: activeChannel,
        contenido: texto
      });

      setMessages(prev => [...prev, response]);
      scrollToBottom();
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      toast.error(err.message || 'Error al enviar mensaje.');
      setNewMessage(texto); // Restaurar texto si falló
    } finally {
      setSending(false);
    }
  };

  const channelInfo = CHANNELS.find(c => c.id === activeChannel) || CHANNELS[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card p-0 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/40 dark:shadow-none"
    >
      
      {/* Header del Chat */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/80 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Chat Corporativo Transversal
              </h3>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                RF-31
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              #{channelInfo.name} — {channelInfo.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cargarMensajes(activeChannel)}
            disabled={loadingMessages}
            className="outline-button text-xs py-1.5 px-3 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={loadingMessages ? 'animate-spin' : ''} />
            Refrescar
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Conectado a PostgreSQL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[520px]">
        
        {/* Sidebar Canales y Miembros */}
        <div className="p-4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 flex flex-col justify-between">
          <div>
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3 block">
              Canales de Discusión
            </span>
            <div className="flex flex-col gap-1.5 mb-6">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    activeChannel === ch.id
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Hash size={14} className="opacity-60 flex-shrink-0" /> {ch.name.split(' - ')[0]}
                  </span>
                  {activeChannel === ch.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Personal Activo ({usuarios.length})
              </span>
              {loadingUsers && <Loader2 size={10} className="animate-spin text-zinc-400" />}
            </div>

            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
              {usuarios.map(u => (
                <div key={u.idTrabajador} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {u.nombre} {u.apellido}
                    </span>
                  </div>
                  <span className={`text-[0.6rem] font-black uppercase px-1.5 py-0.5 rounded border ${
                    u.rol === 'COORDINADOR' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' :
                    u.rol === 'LIDER' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                    'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                  }`}>
                    {u.rol?.substring(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-[0.65rem] text-zinc-400 font-medium">IKernell Secure Corporate Chat</span>
          </div>
        </div>

        {/* Área Principal de Mensajes */}
        <div className="md:col-span-3 flex flex-col justify-between p-4 sm:p-6 bg-white dark:bg-zinc-950/40">
          
          {/* Lista de Mensajes */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 max-h-[390px] min-h-[320px]">
            {loadingMessages && (
              <div className="space-y-4 animate-pulse">
                <div className="flex flex-col items-start space-y-1">
                  <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-700 rounded-2xl" />
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-700 rounded-2xl" />
                </div>
              </div>
            )}

            {!loadingMessages && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 text-zinc-400">
                <MessageSquare size={32} className="text-zinc-300 dark:text-zinc-600 mb-2" />
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No hay mensajes en este canal todavía.</p>
                <p className="text-[0.7rem] text-zinc-400">Sé el primero en iniciar la conversación en #{channelInfo.name.split(' - ')[0]}.</p>
              </div>
            )}

            {!loadingMessages && messages.map(msg => {
              const isCurrentUser = msg.remitente?.email === user?.email || 
                                    msg.remitente?.idTrabajador === user?.idTrabajador;
              const nombreRemitente = msg.remitente 
                ? `${msg.remitente.nombre} ${msg.remitente.apellido}` 
                : 'Usuario Corporativo';
              const rolRemitente = msg.remitente?.rol || 'TRABAJADOR';
              const hora = msg.fechaEnvio 
                ? new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : 'Reciente';

              return (
                <div 
                  key={msg.idMensaje}
                  className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {isCurrentUser ? 'Tú' : nombreRemitente}
                    </span>
                    <span className={`text-[0.6rem] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                      rolRemitente === 'COORDINADOR' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' :
                      rolRemitente === 'LIDER' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                      rolRemitente === 'SISTEMA' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                      'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                    }`}>
                      {rolRemitente}
                    </span>
                    <span className="text-[0.65rem] text-zinc-400">{hora}</span>
                  </div>
                  <div className={`p-3.5 rounded-2xl max-w-lg text-xs sm:text-sm leading-relaxed ${
                    isCurrentUser
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium rounded-tr-none shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700/80 shadow-sm'
                  }`}>
                    {msg.contenido}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Envío */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Escribir mensaje en #${channelInfo.name.split(' - ')[0]}...`}
              className="input-field py-3 text-sm bg-white dark:bg-zinc-900"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="gradient-button px-5 py-3 text-sm font-bold flex-shrink-0 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center shadow-md"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>

        </div>

      </div>

    </motion.div>
  );
};
