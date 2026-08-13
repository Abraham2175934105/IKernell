import React from 'react';
import { Code2, Database, ShieldAlert, Cpu, Layers, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

export const Services = () => {
  const servicesList = [
    {
      icon: <Code2 size={28} />,
      title: "Desarrollo de Software a Medida",
      description: "Construcción de aplicaciones empresariales escalables con Java Spring Boot y React.js, optimizadas para alta concurrencia y despliegues modulares."
    },
    {
      icon: <ShieldAlert size={28} />,
      title: "Semáforo Predictivo de Riesgos",
      description: "Algoritmos lógicos de monitoreo en tiempo real que evalúan errores severos e interrupciones para prevenir retrasos en el cronograma."
    },
    {
      icon: <Workflow size={28} />,
      title: "Automatización ETL Internacional",
      description: "Integración batch estandarizada bajo ISO 8601 UTC y envío seguro vía SFTP/Email para reportes con la alianza estratégica en Brasil."
    },
    {
      icon: <Database size={28} />,
      title: "Diseño & Administración de PostgreSQL",
      description: "Estructuras relacionales optimizadas con índices B-Tree, restricciones CHECK de integridad y modelos WBS de alta concurrencia."
    },
    {
      icon: <Layers size={28} />,
      title: "Gestión de Proyectos WBS",
      description: "Desglose estructural del trabajo por etapas y asignación granular de actividades para equipos multidisciplinarios."
    },
    {
      icon: <Cpu size={28} />,
      title: "Arquitectura de Seguridad RBAC & JWT",
      description: "Protección perimetral con tokens encriptados sin cookies, encriptación unidireccional BCrypt y perfiles unificados de trabajo."
    }
  ];

  return (
    <section id="servicios" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Portafolio de Servicios Tecnológicos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Ofrecemos soluciones integrales de arquitectura de software, gestión por etapas y analítica avanzada para potenciar la transformación digital.
          </p>
        </motion.div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {servicesList.map((srv, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.35, delay: (idx % 3) * 0.08, ease: "easeOut" }}
              className="glass-card flex flex-col justify-between p-6 md:p-8 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-all h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-6 text-zinc-900 dark:text-white group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-950 transition-all shadow-sm">
                  {srv.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{srv.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">{srv.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};




