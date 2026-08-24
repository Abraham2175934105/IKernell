import React, { useState } from 'react';
import { 
  Code2, Database, Activity, Cpu, Layers, ArrowRight, 
  ShieldCheck, Lock, KeyRound, ArrowLeftRight, DatabaseZap,
  Server, Boxes, LockKeyhole, Terminal, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

/* ────────────────────────────────────────────────────────────────────────
   Componente de Imagen con Fallback Seguro y Gradiente Glow
──────────────────────────────────────────────────────────────────────── */
const ServiceCardImage = ({ src, alt, fallbackIcon }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-blue-950 to-zinc-950 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-xl shadow-blue-500/20 backdrop-blur-sm z-10">
          {fallbackIcon || <ShieldCheck size={28} className="text-blue-400" />}
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

const servicesList = [
  {
    icon: <Code2 size={24} strokeWidth={2} />,
    title: "Desarrollo de Software a Medida",
    description: "Construcción de aplicaciones empresariales escalables con Java Spring Boot y React.js, optimizadas para alta concurrencia y despliegues modulares.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    icon: <Gauge size={24} strokeWidth={2} />,
    title: "Semáforo Predictivo de Riesgos",
    description: "Algoritmos lógicos de monitoreo en tiempo real que evalúan errores severos e interrupciones para prevenir retrasos en el cronograma.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: true
  },
  {
    icon: <DatabaseZap size={24} strokeWidth={2} />,
    title: "Automatización ETL Internacional",
    description: "Integración batch estandarizada bajo ISO 8601 UTC y envío seguro vía SFTP/Email para reportes con la alianza estratégica en Brasil.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    icon: <Database size={24} strokeWidth={2} />,
    title: "Diseño & Administración de PostgreSQL",
    description: "Estructuras relacionales optimizadas con índices B-Tree, restricciones CHECK de integridad y modelos WBS de alta concurrencia.",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    icon: <Boxes size={24} strokeWidth={2} />,
    title: "Gestión de Proyectos WBS",
    description: "Desglose estructural del trabajo por etapas y asignación granular de actividades para equipos multidisciplinarios.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    icon: <ShieldCheck size={24} strokeWidth={2} />,
    title: "Arquitectura de Seguridad RBAC & JWT",
    description: "Protección perimetral con tokens encriptados sin cookies, encriptación unidireccional BCrypt y perfiles unificados de trabajo.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  }
];

const securityFeatures = [
  {
    icon: <ShieldCheck size={22} strokeWidth={2} />,
    title: 'RBAC — Control Basado en Roles',
    description: 'Tres perfiles segregados: Coordinador, Líder y Desarrollador. Cada rol accede estrictamente a los recursos y endpoints autorizados por Spring Security.',
  },
  {
    icon: <KeyRound size={22} strokeWidth={2} />,
    title: 'JWT Stateless (HMAC-SHA256)',
    description: 'Sesiones tokenizadas sin cookies ni almacenamiento en memoria de servidor. Cada solicitud HTTP se valida atómicamente con firma criptográfica.',
  },
  {
    icon: <LockKeyhole size={22} strokeWidth={2} />,
    title: 'BCrypt — Cifrado Unidireccional',
    description: 'Almacenamiento irreversible de credenciales con factor de costo 10 y salt aleatorio, blindando el acceso contra ataques de fuerza bruta.',
  },
];

export const Services = () => {
  const safeServices = servicesList || [];
  const safeFeatures = securityFeatures || [];

  return (
    <section id="servicios" className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/50">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
      >
        
        {/* Section Header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-14 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-5">
            Portafolio
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
            Servicios Tecnológicos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Ofrecemos soluciones integrales de arquitectura de software, gestión por etapas y analítica avanzada para potenciar la transformación digital.
          </p>
        </motion.div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {safeServices.map((srv, idx) => {
            if (!srv) return null;
            return (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 h-full flex flex-col ${
                  srv.featured 
                    ? 'border-blue-500/40 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/5'
                }`}
              >
                {/* Card Image con protección anti-rotura */}
                <div className="relative h-44 overflow-hidden">
                  <ServiceCardImage 
                    src={srv.image} 
                    alt={srv.title} 
                    fallbackIcon={srv.icon} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-zinc-900 dark:via-zinc-900/30 dark:to-transparent" />
                  
                  {/* Floating icon badge */}
                  <div className={`absolute bottom-4 left-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-2 ${
                    srv.featured
                      ? 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-blue-600/30 ring-2 ring-blue-400/20'
                      : 'bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-zinc-100 border border-zinc-200/90 dark:border-zinc-700/90 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white group-hover:border-blue-500 group-hover:shadow-blue-500/25'
                  }`}>
                    {srv.icon || <Boxes size={24} />}
                  </div>

                  {srv.featured && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[0.6rem] font-black uppercase tracking-widest shadow-md">
                      Destacado
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2.5 leading-snug">{srv.title || ''}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal flex-1">{srv.description || ''}</p>
                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/70">
                    <a 
                      href="/#contacto" 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 uppercase tracking-wider transition-colors group/link"
                    >
                      Más información 
                      <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bloque Destacado: Arquitectura de Seguridad RBAC & JWT ──── */}
        <motion.div
          variants={itemVariants}
          className="mt-16 md:mt-24"
        >
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider mb-5 shadow-md">
              <ShieldCheck size={14} className="text-blue-400 dark:text-blue-600" /> Seguridad Corporativa de Nivel Bancario
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
              Arquitectura de Seguridad RBAC & JWT
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
              Control de acceso basado en roles, protección de endpoints stateless y cifrado unidireccional de credenciales con BCrypt.
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safeFeatures.map((feat, idx) => {
              if (!feat) return null;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="group relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7 flex flex-col hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className="w-13 h-13 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center mb-5 shadow-sm group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-500 group-hover:text-white group-hover:border-blue-500 group-hover:scale-105 transition-all duration-300">
                    {feat.icon || <ShieldCheck size={22} />}
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2.5 leading-snug">{feat.title || ''}</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal flex-1">{feat.description || ''}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};
