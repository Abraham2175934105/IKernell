import React, { useState } from 'react';
import { 
  Code2, Database, Activity, Cpu, Layers, ArrowRight, 
  ShieldCheck, Lock, KeyRound, ArrowLeftRight, DatabaseZap,
  Server, Boxes, LockKeyhole, Terminal, Gauge, CheckCircle2,
  Sparkles, Globe2, Binary, Users, Shield, UserCheck, ShieldAlert,
  Briefcase, CheckCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const springTransition = { type: "spring", stiffness: 350, damping: 25 };

const servicesContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const servicesHeaderVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' }
  }
};

/* ────────────────────────────────────────────────────────────────────────
   Componente de Imagen con Fallback y Gradiente
──────────────────────────────────────────────────────────────────────── */
const ServiceCardImage = ({ src, alt, fallbackIcon }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-100 via-blue-50 to-zinc-200 dark:from-zinc-900 dark:via-blue-950 dark:to-zinc-950 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-md">
          {fallbackIcon || <ShieldCheck size={26} className="text-blue-600 dark:text-blue-400" />}
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt || 'Servicio IKernell'}
      onError={() => setHasError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      loading="lazy"
    />
  );
};

const categories = [
  { id: 'all', label: 'Todos los Servicios' },
  { id: 'core', label: 'Desarrollo & Plataformas' },
  { id: 'analytics', label: 'Control & Predicción' },
  { id: 'security', label: 'Seguridad & Bases de Datos' },
];

const servicesList = [
  {
    id: 1,
    category: 'core',
    asuntoId: 'Desarrollo de Software a Medida (Proyecto Nuevo)',
    icon: <Code2 size={24} strokeWidth={2} />,
    title: "Desarrollo de Software a Medida",
    description: "Creamos aplicaciones web empresariales rápidas, modernas y adaptadas a las necesidades exactas de tu negocio.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["A la Medida", "Alta Velocidad", "Fácil de Usar"],
    featured: false
  },
  {
    id: 2,
    category: 'analytics',
    asuntoId: 'Consultoría & Arquitectura de Software',
    icon: <Gauge size={24} strokeWidth={2} />,
    title: "Semáforo Predictivo de Riesgos",
    description: "Sistema inteligente que avisa a tiempo si un proyecto corre peligro de retrasarse para tomar decisiones antes del vencimiento.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Alertas a Tiempo", "Prevención", "Control Diario"],
    featured: true
  },
  {
    id: 3,
    category: 'analytics',
    asuntoId: 'Integración de APIs & Servicios Web',
    icon: <DatabaseZap size={24} strokeWidth={2} />,
    title: "Reportes Automáticos para Brasil",
    description: "Envío y consolidación de informes internacionales en un solo clic, sin papeleos ni pérdida de tiempo en planillas.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Internacional", "En 1 Clic", "100% Preciso"],
    featured: false
  },
  {
    id: 4,
    category: 'security',
    asuntoId: 'Mantenimiento & Optimización de Aplicaciones',
    icon: <Database size={24} strokeWidth={2} />,
    title: "Bases de Datos Seguras y Rápidas",
    description: "Almacenamiento protegido donde tu información comercial se guarda sin pérdidas y se encuentra al instante.",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Respaldo Continuo", "Búsqueda Rápida", "Segura"],
    featured: false
  },
  {
    id: 5,
    category: 'core',
    asuntoId: 'Solicitud de Cotización / Propuesta Comercial',
    icon: <Boxes size={24} strokeWidth={2} />,
    title: "Organización de Proyectos por Etapas",
    description: "Divide los proyectos grandes en pasos sencillos, asignando responsables y plazos claros para que nada quede en el aire.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Paso a Paso", "Responsables", "Cronograma"],
    featured: false
  },
  {
    id: 6,
    category: 'security',
    asuntoId: 'Auditoría de Código & Ciberseguridad',
    icon: <ShieldCheck size={24} strokeWidth={2} />,
    title: "Control de Acceso y Privacidad",
    description: "Protección total donde cada usuario solo puede ver lo que le corresponde según su cargo en la empresa.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Permisos por Rol", "Privacidad", "Blindaje"],
    featured: false
  }
];

const rbacRolesData = [
  {
    role: 'COORDINADOR',
    title: 'Coordinador General',
    subtitle: 'Dirección y Gerencia',
    desc: 'Tiene una visión completa de la empresa. Asigna presupuestos, gestiona personal y revisa los informes generales de cada proyecto.',
    badge: 'Acceso Directivo Completo',
    permissions: [
      { name: 'Gestión de Personal & Roles', allowed: true, desc: 'Puede registrar nuevos colaboradores y gestionar el talento.' },
      { name: 'Aprobación de Presupuestos y Proyectos', allowed: true, desc: 'Puede crear proyectos y definir costos y fechas finales.' },
      { name: 'Descarga de Informes Internacionales', allowed: true, desc: 'Genera y descarga reportes certificados para socios externos.' },
    ]
  },
  {
    role: 'LIDER',
    title: 'Líder de Proyecto',
    subtitle: 'Gestión y Supervisión',
    desc: 'Se encarga de que las cosas se hagan a tiempo. Organiza las etapas de trabajo, reparte tareas al equipo y vigila el semáforo de entrega.',
    badge: 'Gestión de Proyectos',
    permissions: [
      { name: 'Organización de Etapas y Tareas', allowed: true, desc: 'Asigna qué debe hacer cada desarrollador día a día.' },
      { name: 'Monitoreo del Semáforo de Riesgos', allowed: true, desc: 'Revisa las alertas de sobrecarga para evitar retrasos.' },
      { name: 'Modificación de Credenciales de Otros', allowed: false, desc: 'Información restringida únicamente a la gerencia.' },
    ]
  },
  {
    role: 'DESARROLLADOR',
    title: 'Desarrollador de Software',
    subtitle: 'Ejecución Técnica',
    desc: 'Espacio de trabajo limpio y sin distracciones para que el desarrollador registre su avance diario, marque horas y avise si tiene bloqueos.',
    badge: 'Espacio de Ejecución',
    permissions: [
      { name: 'Registro de Avance Diario y Horas', allowed: true, desc: 'Marca las tareas completadas y su tiempo dedicado.' },
      { name: 'Avisos de Bloqueos o Dudas', allowed: true, desc: 'Notifica al líder si encuentra un problema que lo frena.' },
      { name: 'Acceso a Finanzas o Clientes Ajenos', allowed: false, desc: 'Protegido para mantener la confidencialidad de la empresa.' },
    ]
  }
];

export const Services = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedRole, setSelectedRole] = useState(0);

  const filteredServices = activeCategory === 'all' 
    ? servicesList 
    : servicesList.filter(s => s.category === activeCategory);

  const activeRbac = rbacRolesData[selectedRole];

  // Función para autoseleccionar el asunto y hacer scroll suave al formulario de contacto
  const handleConsultService = (srv) => {
    if (srv && srv.asuntoId) {
      window.dispatchEvent(new CustomEvent('ikernell-select-asunto', {
        detail: { asunto: srv.asuntoId }
      }));
    }
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="servicios" className="py-20 md:py-28 bg-zinc-50/60 dark:bg-zinc-950/60 backdrop-blur-xs border-t border-zinc-200/80 dark:border-zinc-800/50 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        variants={servicesContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 transform-gpu"
      >
        
        {/* Section Header */}
        <motion.div 
          variants={servicesHeaderVariants}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={13} /> Soluciones para tu Empresa
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
            Servicios Tecnológicos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Herramientas prácticas de desarrollo, organización de equipos y control predictivo para hacer crecer tus proyectos sin complicaciones.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30 -z-0"
                      transition={springTransition}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Services Cards Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((srv) => (
              <motion.div 
                key={srv.id} 
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.015 }}
                className={`group relative overflow-hidden rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border flex flex-col h-full transition-all duration-300 ${
                  srv.featured 
                    ? 'border-blue-500/50 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/5 ring-1 ring-blue-500/20' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5'
                }`}
              >
                {/* Card Image */}
                <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                  <ServiceCardImage 
                    src={srv.image} 
                    alt={srv.title} 
                    fallbackIcon={srv.icon} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900 dark:via-zinc-900/30 dark:to-transparent" />
                  
                  {/* Floating icon badge */}
                  <div className={`absolute bottom-4 left-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 transform group-hover:scale-110 ${
                    srv.featured
                      ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-400/20'
                      : 'bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'
                  }`}>
                    {srv.icon}
                  </div>

                  {srv.featured && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[0.62rem] font-black uppercase tracking-wider shadow-md">
                      Destacado
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
                    {srv.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed font-normal flex-1 mb-4">
                    {srv.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {srv.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[0.65rem] font-semibold text-zinc-600 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between">
                    <button 
                      type="button"
                      onClick={() => handleConsultService(srv)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 uppercase tracking-wider transition-colors group/link cursor-pointer"
                    >
                      Consultar solución
                      <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── Bloque Adaptativo: Seguridad y Control de Acceso por Roles ──── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 md:mt-24 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden text-left"
        >
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Privacidad & Orden en tu Empresa
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
              Seguridad y Control de Acceso por Roles
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs md:text-sm font-medium">
              Cada integrante de tu equipo ve únicamente lo necesario para su función, manteniendo tu información financiera y de clientes 100% protegida.
            </p>
          </div>

          {/* Interactive Role Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 gap-1">
              {rbacRolesData.map((r, rIdx) => {
                const isSelected = selectedRole === rIdx;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setSelectedRole(rIdx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {r.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Role Explanation Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Role Info Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{activeRbac.title}</h4>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{activeRbac.subtitle}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {activeRbac.desc}
                </p>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Nivel de Acceso:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{activeRbac.badge}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300">
                  <span className="font-bold block mb-0.5">Claves Seguras</span>
                  <span className="text-[0.7rem] text-emerald-700 dark:text-emerald-400">Nadie puede ver tus contraseñas</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-300">
                  <span className="font-bold block mb-0.5">Cero Fugas</span>
                  <span className="text-[0.7rem] text-blue-700 dark:text-blue-400">Sesiones privadas protegidas</span>
                </div>
              </div>
            </div>

            {/* Right: Permissions List */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>¿Qué puede hacer este rol en la plataforma?</span>
                <span className="text-zinc-400 text-[0.7rem]">Permisos</span>
              </div>

              <div className="space-y-2.5">
                {activeRbac.permissions.map((perm, pIdx) => (
                  <motion.div
                    key={perm.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pIdx * 0.05, duration: 0.25 }}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 shrink-0 ${perm.allowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                        {perm.allowed ? <CheckCircle2 size={16} /> : <Lock size={15} />}
                      </span>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100 block text-xs">{perm.name}</strong>
                        <span className="text-[0.72rem] text-zinc-500 dark:text-zinc-400">{perm.desc}</span>
                      </div>
                    </div>
                    {perm.allowed ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[0.65rem] shrink-0 border border-emerald-200 dark:border-emerald-800">
                        Permitido
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[0.65rem] shrink-0 border border-zinc-200 dark:border-zinc-700">
                        Restringido
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};
