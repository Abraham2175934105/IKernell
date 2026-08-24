import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  MessageSquare, Send, Users, Hash, Shield, Sparkles, CheckCircle2, User,
  Loader2, RefreshCw, AlertCircle, Clock, Check, Cpu, Globe, AlertTriangle,
  Search, ShieldCheck, Tag, Plus, Filter, CornerDownLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Configuración de Canales Temáticos Corporativos
const CHANNELS = [
  { 
    id: 'general', 
    name: 'general', 
    fullName: 'General - Equipo IKernell', 
    desc: 'Comunicaciones oficiales y anuncios generales',
    icon: Hash,
    color: 'text-blue-500'
  },
  { 
    id: 'arquitectura', 
    name: 'arquitectura', 
    fullName: 'Arquitectura & Backend', 
    desc: 'Diseño Spring Boot, Hibernate, JPA y PostgreSQL',
    icon: Cpu,
    color: 'text-purple-500'
  },
  { 
    id: 'soporte-brasil', 
    name: 'soporte-brasil', 
    fullName: 'Alianza Brasil (ETL)', 
    desc: 'Normativa ISO 8601 UTC y transferencias SFTP',
    icon: Globe,
    color: 'text-emerald-500'
  },
  { 
    id: 'alertas-wbs', 
    name: 'alertas-wbs', 
    fullName: 'Alertas del Semáforo WBS', 
    desc: 'Notificaciones automáticas del motor predictivo',
    icon: AlertTriangle,
    color: 'text-amber-500'
  }
];

// Etiquetas rápidas sugeridas para atajos de mención
const QUICK_TAGS = ['#Tarea', '#Bug', '#Urgente', '#WBS', '#Revisión'];

export const ChatCorporativo = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales
  const [activeTab, setActiveTab] = useState('canales'); // 'canales' | 'personal'
  const [activeChannel, setActiveChannel] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mantiene el scroll automático en el mensaje más reciente
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
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
    scrollToBottom('auto');
  }, [messages]);

  // Filtrado reactivo de Canales y Personal
  const canalesFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return CHANNELS;
    const q = searchQuery.toLowerCase();
    return CHANNELS.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.fullName.toLowerCase().includes(q) || 
      c.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const usuariosFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return usuarios;
    const q = searchQuery.toLowerCase();
    return usuarios.filter(u => {
      const nombre = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
      const rol = (u.rol || '').toLowerCase();
      const especialidad = (u.especialidad || u.tipoContrato || '').toLowerCase();
      return nombre.includes(q) || rol.includes(q) || especialidad.includes(q);
    });
  }, [usuarios, searchQuery]);

  // Manejadores de eventos (Handlers)
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      toast.error(err?.message || 'Error al enviar mensaje.');
      setNewMessage(texto); // Restaurar texto en caso de fallo
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInsertTag = (tag) => {
    setNewMessage(prev => {
      const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
      return `${prev}${space}${tag} `;
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const currentChannel = CHANNELS.find(c => c.id === activeChannel) || CHANNELS[0];
  const ChannelIcon = currentChannel.icon || Hash;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden h-[calc(100vh-180px)] min-h-[650px] flex flex-col"
    >
      
      {/* Header Superior Corporativo */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md flex-shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Canal de Mensajería Transversal
              </h3>
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <ShieldCheck size={11} /> Cifrado SSL / JWT
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Comunicación persistida en PostgreSQL con trazabilidad por rol y estampa UTC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => cargarMensajes(activeChannel)}
            disabled={loadingMessages}
            className="outline-button text-xs py-1.5 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            title="Refrescar hilo de conversación"
          >
            <RefreshCw size={13} className={loadingMessages ? 'animate-spin' : ''} />
            <span>Refrescar</span>
          </button>

          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[0.7rem] font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="hidden md:inline">Persistencia PostgreSQL</span>
            <span className="md:hidden">Conectado</span>
          </span>
        </div>
      </div>

      {/* Cuerpo Split: 2 Columnas */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Columna Izquierda: Directorio de Canales y Personal (280px - 320px) */}
        <div className="w-72 lg:w-80 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col flex-shrink-0 min-h-0">
          
          {/* Segmented Tab Bar */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-200/70 dark:bg-zinc-800/70 p-1 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('canales')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'canales'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Hash size={13} /> Canales ({CHANNELS.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'personal'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Users size={13} /> Personal ({usuarios.length})
              </button>
            </div>
          </div>

          {/* Buscador Rápido en Directorio */}
          <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/60">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'canales' ? 'Filtrar canales...' : 'Buscar colaboradores...'}
                className="input-field pl-8 pr-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-900/80"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Lista scrolleable del directorio */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
            
            {/* Pestaña: Canales Temáticos */}
            {activeTab === 'canales' && (
              <div className="space-y-1">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-2 block mb-2">
                  Temáticas de Discusión
                </span>
                {canalesFiltrados.map(ch => {
                  const IconComp = ch.icon || Hash;
                  const isActive = activeChannel === ch.id;

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChannel(ch.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-start gap-2.5 border ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md'
                          : 'bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl flex-shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        <IconComp size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold truncate">#{ch.name}</span>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-[0.68rem] truncate font-normal mt-0.5 ${
                          isActive ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {ch.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pestaña: Directorio de Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Equipo IKernell ({usuariosFiltrados.length})
                  </span>
                  {loadingUsers && <Loader2 size={12} className="animate-spin text-zinc-400" />}
                </div>

                {usuariosFiltrados.map(u => {
                  const rolBadge = u.rol === 'COORDINADOR' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' :
                                   u.rol === 'LIDER' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                                   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
                  
                  const iniciales = `${(u.nombre || 'U')[0]}${(u.apellido || '')[0] || ''}`.toUpperCase();

                  return (
                    <div 
                      key={u.idTrabajador || u.email}
                      className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black text-[0.7rem] flex items-center justify-center shadow-xs">
                            {iniciales}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                            {u.nombre} {u.apellido}
                          </h4>
                          <span className="text-[0.65rem] text-zinc-400 font-medium block truncate">
                            {u.especialidad || u.tipoContrato || 'Desarrollador'}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-md border flex-shrink-0 ${rolBadge}`}>
                        {u.rol?.substring(0, 4)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Footer de la columna izquierda */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/60 text-center flex-shrink-0">
            <span className="text-[0.65rem] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
              IKernell Enterprise Chat
            </span>
          </div>
        </div>

        {/* Columna Derecha: Área Principal de Conversación (Flex 1) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950/40 min-h-0">
          
          {/* Header del Canal Activo */}
          <div className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white flex-shrink-0 shadow-xs">
                <ChannelIcon size={18} className={currentChannel.color} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    #{currentChannel.fullName}
                  </h4>
                  <span className="text-[0.65rem] font-extrabold uppercase px-2 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                    Canal Activo
                  </span>
                </div>
                <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  {currentChannel.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <Users size={14} className="text-zinc-400" />
              <span>{usuarios.length} Participantes</span>
            </div>
          </div>

          {/* Área de Mensajes Scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
            
            {/* Loading Skeleton */}
            {loadingMessages && (
              <div className="space-y-4 animate-pulse">
                <div className="flex flex-col items-start space-y-1">
                  <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-12 w-72 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loadingMessages && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 text-zinc-400">
                <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 text-zinc-400 shadow-inner">
                  <MessageSquare size={30} />
                </div>
                <h4 className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                  No hay mensajes en #{currentChannel.name}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Sé el primero en publicar un anuncio o iniciar el debate técnico en este canal.
                </p>
              </div>
            )}

            {/* Renderizado de Hilos de Conversación */}
            {!loadingMessages && messages.map((msg, index) => {
              const isCurrentUser = msg?.remitente?.email === user?.email || 
                                    msg?.remitente?.idTrabajador === user?.idTrabajador;
              
              const nombreRemitente = msg?.remitente 
                ? `${msg.remitente.nombre || ''} ${msg.remitente.apellido || ''}`.trim() 
                : 'Usuario Corporativo';
              
              const rolRemitente = msg?.remitente?.rol || 'DESARROLLADOR';
              
              const horaUTC = msg?.fechaEnvio 
                ? `${new Date(msg.fechaEnvio).toISOString().substring(11, 16)} UTC` 
                : `${new Date().toISOString().substring(11, 16)} UTC`;

              // Formateo dinámico con resalte interactivo de etiquetas #ID (#ACT-102, #PRJ-01, #INC-05, etc.)
              const formatContent = (text) => {
                if (!text) return null;
                const parts = text.split(/(#[A-Za-z0-9_-]+)/g);
                return parts.map((part, idx) => {
                  if (part.startsWith('#')) {
                    return (
                      <span 
                        key={idx} 
                        onClick={() => toast.success(`Referencia de Tarea/Proyecto: ${part}`, { icon: '🏷️' })}
                        className={`font-mono font-extrabold px-1.5 py-0.5 rounded text-[0.72rem] inline-block mx-0.5 border cursor-pointer transition-all hover:scale-105 ${
                          isCurrentUser
                            ? 'bg-blue-600/40 text-white border-blue-400/50 dark:bg-blue-900/60 dark:text-blue-100 hover:bg-blue-600/60'
                            : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900'
                        }`}
                        title={`Referencia transaccional: ${part}`}
                      >
                        {part}
                      </span>
                    );
                  }
                  return part;
                });
              };

              const rolBadgeStyle = 
                rolRemitente === 'COORDINADOR' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' :
                rolRemitente === 'LIDER' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                rolRemitente === 'SISTEMA' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' :
                'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';

              return (
                <motion.div 
                  key={msg?.idMensaje || `msg-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Metadata Header del Mensaje */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {isCurrentUser ? 'Tú' : nombreRemitente}
                    </span>
                    <span className={`text-[0.6rem] font-black uppercase px-1.5 py-0.2 rounded border ${rolBadgeStyle}`}>
                      {rolRemitente}
                    </span>
                    <span className="text-[0.65rem] text-zinc-400 font-mono" title="Estampa de tiempo internacional ISO 8601 UTC">
                      {horaUTC}
                    </span>
                  </div>

                  {/* Burbuja de Diálogo con Alta Jerarquía Visual */}
                  <div className={`p-4 rounded-3xl max-w-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isCurrentUser
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-tr-none shadow-md'
                      : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-700/80 shadow-sm'
                  }`}>
                    {formatContent(msg?.contenido)}
                  </div>
                </motion.div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Barra Inferior de Entrada e Inserción Interactiva */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex-shrink-0 space-y-3">
            
            {/* Accesos Rápidos de Etiquetas (#ID) */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[0.65rem] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Tag size={11} /> Mencionar:
              </span>
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-[0.7rem] font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <Plus size={10} /> {tag}
                </button>
              ))}
            </div>

            {/* Formulario e Input de Texto con Atajos (Enter / Shift+Enter) */}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Escribir en #${currentChannel.name}... (Enter para enviar, Shift+Enter para salto)`}
                  className="input-field py-2.5 px-4 text-xs sm:text-sm bg-white dark:bg-zinc-900 resize-none font-sans min-h-[52px]"
                  disabled={sending}
                />
                <span className="absolute right-3 bottom-2 text-[0.65rem] text-zinc-400 font-mono hidden sm:inline">
                  Enter <CornerDownLeft size={10} className="inline" />
                </span>
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="gradient-button px-5 py-3 text-xs sm:text-sm font-bold flex-shrink-0 cursor-pointer disabled:opacity-40 inline-flex items-center justify-center gap-2 shadow-md h-[52px]"
                title="Enviar mensaje"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Enviar</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </form>

          </div>

        </div>

      </div>

    </motion.div>
  );
};
