import React from 'react';
import { Code2, Database, ShieldAlert, Cpu, Layers, Workflow, ArrowRight, ShieldCheck, Lock, KeyRound } from 'lucide-react';
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

const servicesList = [
  {
    icon: <Code2 size={28} />,
    title: "Desarrollo de Software a Medida",
    description: "Construcción de aplicaciones empresariales escalables con Java Spring Boot y React.js, optimizadas para alta concurrencia y despliegues modulares.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    icon: <ShieldAlert size={28} />,
    title: "Semáforo Predictivo de Riesgos",
    description: "Algoritmos lógicos de monitoreo en tiempo real que evalúan errores severos e interrupciones para prevenir retrasos en el cronograma.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: true
  },
  {
    icon: <Workflow size={28} />,
    title: "Automatización ETL Internacional",
    description: "Integración batch estandarizada bajo ISO 8601 UTC y envío seguro vía SFTP/Email para reportes con la alianza estratégica en Brasil.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    icon: <Database size={28} />,
    title: "Diseño & Administración de PostgreSQL",
    description: "Estructuras relacionales optimizadas con índices B-Tree, restricciones CHECK de integridad y modelos WBS de alta concurrencia.",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    icon: <Layers size={28} />,
    title: "Gestión de Proyectos WBS",
    description: "Desglose estructural del trabajo por etapas y asignación granular de actividades para equipos multidisciplinarios.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false
  }
];

/* ────────────────────────────────────────────────────────────────────────
   Bloques técnicos del módulo RBAC & JWT
──────────────────────────────────────────────────────────────────────── */
const securityFeatures = [
  {
    icon: <ShieldCheck size={22} strokeWidth={1.8} />,
    title: 'RBAC — Control Basado en Roles',
    description: 'Tres perfiles de negocio segregados: Coordinador, Líder y Desarrollador. Cada rol accede exclusivamente a las funcionalidades autorizadas por el Spring Security Filter Chain.',
  },
  {
    icon: <KeyRound size={22} strokeWidth={1.8} />,
    title: 'JWT Stateless Authentication',
    description: 'Autenticación sin cookies ni sesión en servidor. Cada petición HTTP porta un token firmado con HMAC-SHA256 que el backend valida atómicamente en cada endpoint.',
  },
  {
    icon: <Lock size={22} strokeWidth={1.8} />,
    title: 'BCrypt — Cifrado Unidireccional',
    description: 'Las contraseñas se almacenan con hashing irreversible BCrypt (costo 10). Ni siquiera un administrador puede recuperar la contraseña original del usuario.',
  },
];

export const Services = () => {
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
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Servicios Tecnológicos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Ofrecemos soluciones integrales de arquitectura de software, gestión por etapas y analítica avanzada para potenciar la transformación digital.
          </p>
        </motion.div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {servicesList.map((srv, idx) => (
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
              {/* Card Image */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={srv.image} 
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-zinc-900 dark:via-zinc-900/30 dark:to-transparent" />
                
                {/* Floating icon badge */}
                <div className={`absolute bottom-4 left-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
                  srv.featured
                    ? 'bg-blue-600 text-white shadow-blue-600/30'
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-blue-600/20'
                }`}>
                  {srv.icon}
                </div>

                {srv.featured && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[0.6rem] font-black uppercase tracking-widest shadow-md">
                    Destacado
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2.5 leading-snug">{srv.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal flex-1">{srv.description}</p>
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
          ))}
        </div>

        {/* ── Bloque Destacado: Arquitectura de Seguridad RBAC & JWT ──── */}
        <motion.div
          variants={itemVariants}
          className="mt-16 md:mt-24"
        >
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider mb-5 shadow-md">
              <ShieldCheck size={14} /> Seguridad Corporativa de Nivel Bancario
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Arquitectura de Seguridad RBAC & JWT
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
              Control de acceso basado en roles, protección de endpoints stateless y cifrado unidireccional de credenciales con BCrypt.
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7 flex flex-col hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center mb-5 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2.5 leading-snug">{feat.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal flex-1">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};
