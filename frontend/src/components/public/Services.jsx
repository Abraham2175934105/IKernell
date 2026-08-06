import React from 'react';
import { Code2, Database, ShieldAlert, Cpu, Layers, Workflow } from 'lucide-react';

export const Services = () => {
  const servicesList = [
    {
      icon: <Code2 size={32} color="#3b82f6" />,
      title: "Desarrollo de Software a Medida",
      description: "Construcción de aplicaciones empresariales escalables con Java Spring Boot y React.js, optimizadas para alta concurrencia y despliegues modulares."
    },
    {
      icon: <ShieldAlert size={32} color="#06b6d4" />,
      title: "Semáforo Predictivo de Riesgos",
      description: "Algoritmos lógicos de monitoreo en tiempo real que evalúan errores severos e interrupciones para prevenir retrasos en el cronograma."
    },
    {
      icon: <Workflow size={32} color="#10b981" />,
      title: "Automatización ETL Internacional",
      description: "Integración batch estandarizada bajo ISO 8601 UTC y envío seguro vía SFTP/Email para reportes con la alianza estratégica en Brasil."
    },
    {
      icon: <Database size={32} color="#8b5cf6" />,
      title: "Diseño & Administración de PostgreSQL",
      description: "Estructuras relacionales optimizadas con índices B-Tree, restricciones CHECK de integridad y modelos WBS de alta concurrencia."
    },
    {
      icon: <Layers size={32} color="#f59e0b" />,
      title: "Gestión de Proyectos WBS",
      description: "Desglose estructural del trabajo por etapas y asignación granular de actividades para equipos multidisciplinarios."
    },
    {
      icon: <Cpu size={32} color="#ec4899" />,
      title: "Arquitectura de Seguridad RBAC & JWT",
      description: "Protección perimetral con tokens encriptados sin cookies, encriptación unidireccional BCrypt y perfiles unificados de trabajo."
    }
  ];

  return (
    <section id="servicios" className="section-padding">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '16px' }}>
            Portafolio de <span className="gradient-text">Servicios Tecnológicos</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            Ofrecemos soluciones integrales de arquitectura de software, gestión por etapas y analítica avanzada para potenciar la transformación digital.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {servicesList.map((srv, idx) => (
            <div 
              key={idx} 
              className="glass-panel"
              style={{
                padding: '32px',
                transition: 'var(--transition-normal)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'var(--color-primary-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <div style={{ marginBottom: '20px' }}>{srv.icon}</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>{srv.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{srv.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
