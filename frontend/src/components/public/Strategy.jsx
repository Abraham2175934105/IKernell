import React from 'react';
import { Target, Eye, Award, Globe2 } from 'lucide-react';

export const Strategy = () => {
  return (
    <section id="estrategia" className="section-padding" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '16px' }}>
            Lineamientos <span className="gradient-text">Estratégicos Corporativos</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            Nuestra visión empresarial se sostiene en la excelencia técnica, la transparencia transaccional y las alianzas estratégicas internacionales.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          
          {/* Misión */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Target size={28} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>Misión</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Proveer productos de software robustos y seguros que resuelvan desafíos operativos complejos mediante metodologías ágiles, estándares de desarrollo de grado empresarial y algoritmos de mitigación proactiva de riesgos.
            </p>
          </div>

          {/* Visión */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Eye size={28} color="var(--color-accent)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>Visión</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Ser reconocidos internacionalmente como el referente tecnológico líder en ingeniería de software predictiva, expandiendo nuestras alianzas en Latinoamérica y consolidando la integración de procesos automatizados ETL.
            </p>
          </div>

          {/* Alianza Internacional Brasil */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Globe2 size={28} color="var(--color-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>Alianza Brasil</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Convenio de cooperación tecnológica que unifica métricas operativas y formatos internacionales de fechas/monedas mediante transferencia segura de datos automatizados (RF-28 a RF-30).
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
