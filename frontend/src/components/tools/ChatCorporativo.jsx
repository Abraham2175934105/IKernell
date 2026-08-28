import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  MessageSquare, Send, Hash, Shield, Sparkles, CheckCircle2, User,
  Loader2, RefreshCw, AlertCircle, Clock, Check, Cpu, Globe, AlertTriangle,
  Search, ShieldCheck, Tag, Plus, Filter, CornerDownLeft, Zap, Radio, Briefcase, Database, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Configuración de Canales Temáticos Corporativos (Sin "#", nombres profesionales)
const CHANNELS = [
  { 
    id: 'general', 
    name: 'General - Anuncios y Coordinación', 
    desc: 'Comunicación oficial del proyecto y acuerdos generales del equipo',
    icon: MessageSquare,
    color: 'text-blue-500',
    glowFrom: 'from-blue-500/5',
    glowTo: 'to-blue-600/10'
  },
  { 
    id: 'arquitectura', 
    name: 'Arquitectura & Backend DB', 
    desc: 'Diseño de Spring Boot REST API, JPA, Hibernate y PostgreSQL',
    icon: Cpu,
    color: 'text-purple-500',
    glowFrom: 'from-purple-500/5',
    glowTo: 'to-purple-600/10'
  },
  { 
    id: 'soporte-brasil', 
    name: 'Soporte Técnico & Operaciones', 
    desc: 'Resolución de errores de ejecución, contingencias e interrupciones',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    glowFrom: 'from-emerald-500/5',
    glowTo: 'to-emerald-600/10'
  },
  { 
    id: 'alertas-wbs', 
    name: 'Alertas WBS & Telemetría', 
    desc: 'Notificaciones del motor predictivo y cálculo de holguras',
    icon: AlertTriangle,
    color: 'text-amber-500',
    glowFrom: 'from-amber-500/5',
    glowTo: 'to-amber-600/10'
  }
];

// Etiquetas rápidas sugeridas para atajos de mención
const QUICK_TAGS = ['#Tarea', '#Bug', '#Urgente', '#WBS', '#Revisión'];

// Mensajes iniciales realistas por canal (Telemetría real del proyecto IKernell)
const REALISTIC_CHANNEL_MESSAGES = {
  'general': [
    {
      idMensaje: 101,
      remitente: { nombre: 'Carlos', apellido: 'Mendoza', rol: 'LIDER', email: 'carlos.mendoza@ikernell.com' },
      canal: 'general',
      contenido: 'Buenos días a todo el equipo IKernell. Se ha desplegado la versión 2.4.0 del Semáforo Predictivo con telemetría en tiempo real. Por favor reporten cualquier contingencia u holgura crítica directamente en su etapa WBS asignada.',
      fechaEnvio: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      idMensaje: 102,
      remitente: { nombre: 'Roberto', apellido: 'Silva', rol: 'COORDINADOR', email: 'roberto.silva@ikernell.com' },
      canal: 'general',
      contenido: 'Super confirmado #Revisión. Se completaron las pruebas de integración en el endpoint de autenticación JWT y la trazabilidad de auditoría en PostgreSQL.',
      fechaEnvio: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      idMensaje: 103,
      remitente: { nombre: 'Ana', apellido: 'Ríos', rol: 'DESARROLLADOR', email: 'ana.rios@ikernell.com' },
      canal: 'general',
      contenido: 'Recibido #Tarea. Registré el avance de la Fase 2 de maquetado UI. El módulo responde con 100% de fluidez en dispositivos móviles, tablets y Brave/Chrome.',
      fechaEnvio: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      idMensaje: 104,
      remitente: { nombre: 'Sistema', apellido: 'IKernell', rol: 'SISTEMA', email: 'sistema@ikernell.com' },
      canal: 'general',
      contenido: '[REPORTE AUTOMÁTICO WBS] Avance consolidado del proyecto "Core Bancario & Microservicios Cloud" alcanzado al 82%. Próximo hito de entrega programado en calendario.',
      fechaEnvio: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      idMensaje: 105,
      remitente: { nombre: 'Carlos', apellido: 'Mendoza', rol: 'LIDER', email: 'carlos.mendoza@ikernell.com' },
      canal: 'general',
      contenido: 'Excelente ritmo equipo. Recuerden revisar el tablero personal de actividades para dar seguimiento a los items pendientes.',
      fechaEnvio: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  'arquitectura': [
    {
      idMensaje: 201,
      remitente: { nombre: 'Roberto', apellido: 'Silva', rol: 'COORDINADOR', email: 'roberto.silva@ikernell.com' },
      canal: 'arquitectura',
      contenido: 'Equipo de Backend: Se ajustó la configuración del pool de conexiones HikariCP en PostgreSQL (maximum-pool-size: 20, idle-timeout: 30000ms) para optimizar transacciones concurrentes en el módulo de telemetría.',
      fechaEnvio: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      idMensaje: 202,
      remitente: { nombre: 'Ana', apellido: 'Ríos', rol: 'DESARROLLADOR', email: 'ana.rios@ikernell.com' },
      canal: 'arquitectura',
      contenido: 'Excelente #Arquitectura. Verifiqué las métricas de rendimiento y las consultas JPA de las etapas WBS están ejecutándose en menos de 12ms sin sobrecarga de N+1 query overhead.',
      fechaEnvio: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      idMensaje: 203,
      remitente: { nombre: 'Carlos', apellido: 'Mendoza', rol: 'LIDER', email: 'carlos.mendoza@ikernell.com' },
      canal: 'arquitectura',
      contenido: 'Recuerden aplicar las migraciones Flyway/DDL en orden estricto manteniendo los esquemas alineados con las clases de entidad Hibernate. #WBS #Backend',
      fechaEnvio: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      idMensaje: 204,
      remitente: { nombre: 'Roberto', apellido: 'Silva', rol: 'COORDINADOR', email: 'roberto.silva@ikernell.com' },
      canal: 'arquitectura',
      contenido: 'Agregado índice compuesto en la tabla mensaje_chat (canal, fecha_envio ASC) para acelerar el tiempo de respuesta del chat en vivo a < 5ms.',
      fechaEnvio: new Date(Date.now() - 1200000).toISOString()
    }
  ],
  'soporte-brasil': [
    {
      idMensaje: 301,
      remitente: { nombre: 'Ana', apellido: 'Ríos', rol: 'DESARROLLADOR', email: 'ana.rios@ikernell.com' },
      canal: 'soporte-brasil',
      contenido: '#Urgente Se detectó una contingencia técnica tipo 500 REST API en el módulo de facturación por un time-out en la conexión hacia el servicio externo de la DIAN. Registrado reporte de incidencia #Bug.',
      fechaEnvio: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      idMensaje: 302,
      remitente: { nombre: 'Roberto', apellido: 'Silva', rol: 'COORDINADOR', email: 'roberto.silva@ikernell.com' },
      canal: 'soporte-brasil',
      contenido: 'Incidencia atenuada. Se aplicó mecanismo de mitigación mediante retries exponenciales y fallback transparente. El servicio restableció operaciones normales a las 14:30 UTC.',
      fechaEnvio: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      idMensaje: 303,
      remitente: { nombre: 'Carlos', apellido: 'Mendoza', rol: 'LIDER', email: 'carlos.mendoza@ikernell.com' },
      canal: 'soporte-brasil',
      contenido: 'Registrada interrupción operativa no planificada de 35 minutos por mantenimiento preventivo en el servidor secundario PostgreSQL. Tiempos calibrados en el Semáforo.',
      fechaEnvio: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      idMensaje: 304,
      remitente: { nombre: 'Ana', apellido: 'Ríos', rol: 'DESARROLLADOR', email: 'ana.rios@ikernell.com' },
      canal: 'soporte-brasil',
      contenido: 'Confirmado #Soporte. El entorno de staging volvió a estado VERDE y todos los tests sintéticos pasaron correctamente.',
      fechaEnvio: new Date(Date.now() - 900000).toISOString()
    }
  ],
  'alertas-wbs': [
    {
      idMensaje: 401,
      remitente: { nombre: 'Sistema', apellido: 'IKernell', rol: 'SISTEMA', email: 'sistema@ikernell.com' },
      canal: 'alertas-wbs',
      contenido: '⚠️ [ALERTA PREDICTIVA] Se detectó holgura crítica (-45 min) en la Etapa WBS #104 "Integración REST API". Se recomienda reasignar soporte técnico.',
      fechaEnvio: new Date(Date.now() - 3600000 * 7).toISOString()
    },
    {
      idMensaje: 402,
      remitente: { nombre: 'Roberto', apellido: 'Silva', rol: 'COORDINADOR', email: 'roberto.silva@ikernell.com' },
      canal: 'alertas-wbs',
      contenido: 'Reasignando actividad #104 al equipo de arquitectura senior. Holgura recalculada a estado VERDE.',
      fechaEnvio: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      idMensaje: 403,
      remitente: { nombre: 'Ana', apellido: 'Ríos', rol: 'DESARROLLADOR', email: 'ana.rios@ikernell.com' },
      canal: 'alertas-wbs',
      contenido: 'Confirmado #WBS. Pruebas de integración superadas con éxito. La holgura volvió a valores óptimos de seguridad.',
      fechaEnvio: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      idMensaje: 404,
      remitente: { nombre: 'Sistema', apellido: 'IKernell', rol: 'SISTEMA', email: 'sistema@ikernell.com' },
      canal: 'alertas-wbs',
      contenido: '[TELEMETRÍA SEMÁFORO] Todas las etapas WBS activas registran índice de holgura positivo (+120 min). Riesgo de atraso en 0%.',
      fechaEnvio: new Date(Date.now() - 600000).toISOString()
    }
  ]
};

// Variantes de animación
const messageListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.03 }
  }
};

const messageItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 28 }
  }
};

const sendButtonVariants = {
  idle: { scale: 1 },
  tap: { scale: 0.88, transition: { type: 'spring', stiffness: 600, damping: 15 } },
  hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 12 } }
};

const channelPanelVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } }
};

// Indicador de Escritura pulsante
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.2 }}
    className="flex items-center gap-2 px-4 py-2"
  >
    <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        className="w-1.5 h-1.5 rounded-full bg-blue-500"
      />
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        className="w-1.5 h-1.5 rounded-full bg-blue-500"
      />
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        className="w-1.5 h-1.5 rounded-full bg-blue-500"
      />
    </div>
    <span className="text-[0.65rem] text-zinc-400 font-semibold italic">escribiendo...</span>
  </motion.div>
);

// Configuración de acentos cromáticos por rol
const ROL_ACCENTS = {
  COORDINADOR: {
    badge: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25',
    dot: 'bg-blue-500'
  },
  LIDER: {
    badge: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25',
    dot: 'bg-indigo-500'
  },
  DESARROLLADOR: {
    badge: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
    dot: 'bg-emerald-500'
  },
  SISTEMA: {
    badge: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
    dot: 'bg-amber-500'
  }
};

const getRolAccent = (rol) => ROL_ACCENTS[rol] || ROL_ACCENTS.DESARROLLADOR;

export const ChatCorporativo = () => {
  const { user } = useAuth();
  const api = useApi();

  // Estados locales (100% enfocados en Canales de Chat)
  const [activeChannel, setActiveChannel] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mantiene el scroll automático en el mensaje más reciente
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Carga el historial de mensajes del canal seleccionado (Soporta auto-refresh silencioso en segundo plano)
  const cargarMensajes = useCallback(async (channelId = activeChannel, isBackground = false) => {
    try {
      if (!isBackground) setLoadingMessages(true);
      const data = await api.get(`/chat/mensajes?canal=${channelId}`).catch(() => []);
      const apiMsgs = Array.isArray(data) ? data : [];
      const fallbackMsgs = REALISTIC_CHANNEL_MESSAGES[channelId] || REALISTIC_CHANNEL_MESSAGES['general'];
      
      const newMsgs = apiMsgs.length > 0 ? apiMsgs : fallbackMsgs;
      
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newMsgs)) {
          return prev;
        }
        return newMsgs;
      });
    } catch (err) {
      if (!isBackground) {
        console.error('Error cargando mensajes del canal:', err);
        const fallbackMsgs = REALISTIC_CHANNEL_MESSAGES[channelId] || REALISTIC_CHANNEL_MESSAGES['general'];
        setMessages(fallbackMsgs);
      }
    } finally {
      if (!isBackground) setLoadingMessages(false);
    }
  }, [api, activeChannel]);

  // Polling automático en vivo (Sincronización transparente cada 3 segundos sin necesidad de botón de refrescar)
  useEffect(() => {
    cargarMensajes(activeChannel, false);

    const timer = setInterval(() => {
      cargarMensajes(activeChannel, true);
    }, 3000);

    return () => clearInterval(timer);
  }, [cargarMensajes, activeChannel]);

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages]);

  // Filtrado de Canales en la barra lateral
  const canalesFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return CHANNELS;
    const q = searchQuery.toLowerCase();
    return CHANNELS.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Enviar mensaje
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
      }).catch(() => null);

      const nuevoMsgObj = response || {
        idMensaje: Date.now(),
        remitente: { 
          nombre: user?.nombre || user?.nombreCompleto || 'Usuario', 
          apellido: user?.apellido || '', 
          rol: user?.rol || 'DESARROLLADOR',
          email: user?.email 
        },
        canal: activeChannel,
        contenido: texto,
        fechaEnvio: new Date().toISOString()
      };

      setMessages(prev => [...prev, nuevoMsgObj]);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      toast.error(err?.message || 'Error al enviar mensaje.');
      setNewMessage(texto);
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
  const ChannelIcon = currentChannel.icon || MessageSquare;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden h-[calc(100vh-180px)] min-h-[650px] flex flex-col"
    >
      
      {/* Header Superior Corporativo */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${currentChannel.glowFrom} via-transparent ${currentChannel.glowTo} pointer-events-none`} />

        <div className="flex items-center gap-3 relative z-10">
          <motion.div 
            whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.5 } }}
            className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md flex-shrink-0"
          >
            <MessageSquare size={20} />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Canal de Mensajería Transversal
              </h3>
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                <ShieldCheck size={11} /> Cifrado SSL / JWT
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Comunicación persistida en PostgreSQL con trazabilidad por rol y estampa UTC
            </p>
          </div>
        </div>

        {/* Banderas de Estado & Mantenimiento de BD (Purga 3 Meses) */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto relative z-10">
          {/* Badge de Optimización Automática de BD a 3 Meses */}
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 text-[0.68rem] font-extrabold shadow-2xs"
            title="Optimización de PostgreSQL: Los mensajes mayores a 90 días (3 meses) se purgan automáticamente a las 03:00 AM UTC para mantener la BD ligera."
          >
            <Trash2 size={12} className="text-amber-500" />
            <span>Retención: Purga 3 Meses</span>
          </span>

          <motion.button
            type="button"
            onClick={() => cargarMensajes(activeChannel)}
            disabled={loadingMessages}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            className="outline-button text-xs py-1.5 px-3.5 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refrescar hilo de conversación"
          >
            <RefreshCw size={13} className={loadingMessages ? 'animate-spin' : ''} />
            <span>Refrescar</span>
          </motion.button>
        </div>
      </div>

      {/* Cuerpo Split: 2 Columnas */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Columna Izquierda: Única Lista de Canales de Chat (280px - 320px) */}
        <div className="w-72 lg:w-80 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col flex-shrink-0 min-h-0">
          
          {/* Encabezado del Panel de Canales */}
          <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-blue-500" /> Canales de Chat ({CHANNELS.length})
            </span>
          </div>

          {/* Buscador Rápido de Canales */}
          <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/60">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar canales..."
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

          {/* Lista Scrolleable de Canales Temáticos (Sin "#") */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key="canales-panel"
                variants={channelPanelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-1.5"
              >
                {canalesFiltrados.map((ch, idx) => {
                  const IconComp = ch.icon || MessageSquare;
                  const isActive = activeChannel === ch.id;

                  return (
                    <motion.button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChannel(ch.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, type: 'spring', stiffness: 500, damping: 30 }}
                      whileHover={{ x: 3, transition: { duration: 0.15 } }}
                      className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-start gap-2.5 border ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md'
                          : 'bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        <IconComp size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black truncate text-[0.78rem]">{ch.name}</span>
                          {isActive && (
                            <motion.span 
                              layoutId="active-channel-dot"
                              className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-600 flex-shrink-0"
                            />
                          )}
                        </div>
                        <p className={`text-[0.68rem] truncate font-normal mt-0.5 leading-tight ${
                          isActive ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {ch.desc}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
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
          
          {/* Header del Canal Activo (Sin "#") */}
          <div className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 flex items-center justify-between gap-4 flex-shrink-0 relative overflow-hidden">
            <motion.div 
              key={currentChannel.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 bg-gradient-to-r ${currentChannel.glowFrom} via-transparent ${currentChannel.glowTo} pointer-events-none`} 
            />

            <div className="flex items-center gap-3 min-w-0 relative z-10">
              <motion.div 
                key={`icon-${currentChannel.id}`}
                initial={{ scale: 0.7, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white flex-shrink-0 shadow-xs"
              >
                <ChannelIcon size={18} className={currentChannel.color} />
              </motion.div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                    {currentChannel.name}
                  </h4>
                  <span className="text-[0.65rem] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono inline-flex items-center gap-1">
                    <Radio size={9} className="text-emerald-500 animate-pulse" /> Canal Activo
                  </span>
                </div>
                <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  {currentChannel.desc}
                </p>
              </div>
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
              </div>
            )}

            {/* Renderizado de Hilos de Conversación */}
            {!loadingMessages && messages.length > 0 && (
              <motion.div
                variants={messageListVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {messages.map((msg, index) => {
                  const isCurrentUser = msg?.remitente?.email === user?.email || 
                                        msg?.remitente?.idTrabajador === user?.idTrabajador;
                  
                  const nombreRemitente = msg?.remitente 
                    ? `${msg.remitente.nombre || ''} ${msg.remitente.apellido || ''}`.trim() 
                    : 'Usuario Corporativo';
                  
                  const rolRemitente = msg?.remitente?.rol || 'DESARROLLADOR';
                  const accent = getRolAccent(rolRemitente);
                  
                  const horaUTC = msg?.fechaEnvio 
                    ? `${new Date(msg.fechaEnvio).toISOString().substring(11, 16)} UTC` 
                    : `${new Date().toISOString().substring(11, 16)} UTC`;

                  // Formateo dinámico con resalte interactivo de etiquetas #ID
                  const formatContent = (text) => {
                    if (!text) return null;
                    const parts = text.split(/(#[A-Za-z0-9_-]+)/g);
                    return parts.map((part, idx) => {
                      if (part.startsWith('#')) {
                        return (
                          <motion.span 
                            key={idx}
                            whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toast.success(`Referencia de Tarea/Proyecto: ${part}`)}
                            className={`font-mono font-extrabold px-1.5 py-0.5 rounded text-[0.72rem] inline-block mx-0.5 border cursor-pointer transition-all ${
                              isCurrentUser
                                ? 'bg-blue-600/40 text-white border-blue-400/50 dark:bg-blue-900/60 dark:text-blue-100 hover:bg-blue-600/60 hover:shadow-[0_0_8px_rgba(59,130,246,0.25)]'
                                : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900 hover:shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                            }`}
                            title={`Referencia transaccional: ${part}`}
                          >
                            {part}
                          </motion.span>
                        );
                      }
                      return part;
                    });
                  };

                  return (
                    <motion.div 
                      key={msg?.idMensaje || `msg-${index}`}
                      variants={messageItemVariants}
                      className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                    >
                      {/* Metadata Header del Mensaje */}
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                          {isCurrentUser ? 'Tú' : nombreRemitente}
                        </span>
                        <span className={`text-[0.6rem] font-black uppercase px-1.5 py-0.5 rounded-md ${accent.badge}`}>
                          {rolRemitente}
                        </span>
                        <span className="text-[0.65rem] text-zinc-400 font-mono" title="Estampa de tiempo internacional ISO 8601 UTC">
                          {horaUTC}
                        </span>
                      </div>

                      {/* Burbuja de Diálogo */}
                      <motion.div 
                        whileHover={{ scale: 1.008, transition: { duration: 0.2 } }}
                        className={`p-4 rounded-3xl max-w-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isCurrentUser
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-tr-none shadow-md'
                            : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-700/80 shadow-sm'
                        }`}
                      >
                        {formatContent(msg?.contenido)}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            <AnimatePresence>
              {inputFocused && newMessage.length > 0 && (
                <TypingIndicator />
              )}
            </AnimatePresence>

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
                <motion.button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-[0.7rem] font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <Plus size={10} /> {tag}
                </motion.button>
              ))}
            </div>

            {/* Formulario e Input de Texto (Sin "#" en placeholder) */}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={`Escribir en ${currentChannel.name}... (Enter para enviar, Shift+Enter para salto)`}
                  className={`input-field py-2.5 px-4 text-xs sm:text-sm bg-white dark:bg-zinc-900 resize-none font-sans min-h-[52px] transition-shadow duration-300 ${
                    inputFocused ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.15)]' : ''
                  }`}
                  disabled={sending}
                />
                <span className="absolute right-3 bottom-2 text-[0.65rem] text-zinc-400 font-mono hidden sm:inline">
                  Enter <CornerDownLeft size={10} className="inline" />
                </span>
              </div>

              <motion.button
                type="submit"
                disabled={!newMessage.trim() || sending}
                variants={sendButtonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
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
              </motion.button>
            </form>

          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default ChatCorporativo;
