import React from 'react';
import { Newspaper, Calendar, ArrowUpRight } from 'lucide-react';

export const News = () => {
  const newsItems = [
    {
      date: "02 de Agosto, 2026",
      tag: "Innovación 1",
      title: "Despliegue del Semáforo Predictivo Inteligente en Proyectos Críticos",
      summary: "IKernell lanza el módulo de análisis en tiempo real que calcula dinámicamente el Nivel de Riesgo a partir del consumo concurrente de errores e interrupciones reportados por los desarrolladores."
    },
    {
      date: "28 de Julio, 2026",
      tag: "Innovación 2",
      title: "Consolidación de la Alianza con Brasil mediante Automatización ETL",
      summary: "Implementación exitosa del motor de exportación en un solo clic que estandariza formatos internacionales (ISO 8601 UTC) y transfiere archivos planos seguros por SFTP y correo corporativo."
    },
    {
      date: "15 de Julio, 2026",
      tag: "Seguridad & RNF",
      title: "Actualización de Seguridad: Arquitectura REST Stateless con JWT y BCrypt",
      summary: "Finalización de la refactorización perimetral de Spring Security garantizando autenticación tokenizada sin cookies y encriptación unidireccional de credenciales de trabajadores (RNF-08 a RNF-10)."
    }
  ];

  return (
    <section id="noticias" className="section-padding">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '16px' }}>
            Noticias & <span className="gradient-text">Actualidad Tecnológica</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            Novedades corporativas, lanzamientos de arquitectura y avances en nuestras alianzas de desarrollo de software.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {newsItems.map((news, idx) => (
            <article key={idx} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px' }}>
                    {news.tag}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {news.date}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', lineHeight: '1.4' }}>{news.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{news.summary}</p>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <a href="#contacto" style={{ color: 'var(--color-accent)', fontWeight: '600', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Leer más <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
