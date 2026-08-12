import React, { useState } from 'react';
import { BookOpen, FileText, Download, Eye, Search, Sparkles, CheckCircle2, Shield, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export const BibliotecaDigital = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [previewDoc, setPreviewDoc] = useState(null);

  const documents = [
    {
      id: 'DOC-01',
      title: 'Estandar de Transferencia de Metricas ISO 8601 (Alianza Brasil)',
      category: 'NORMATIVAS',
      format: 'PDF / TXT',
      version: 'v2.4',
      description: 'Especificacion tecnica del formato de archivo plano delimitado con cabeceras, fases WBS y estampas de tiempo UTC para el partner en Brasil (RF-28 a RF-30).',
      content: `ESPECIFICACION TECNICA DE METRICAS - ALIANZA BRASIL
Norma: ISO 8601 UTC (YYYY-MM-DDTHH:mm:ssZ)
Delimitador: Pipe (|)
Estructura:
1. HEADER|SYSTEM_IKERNELL|PARTNER_BRAZIL|TYPE_EXPORT|<TIMESTAMP_UTC>
2. PROJECT|ID=<ID>|NAME=<NOMBRE>|STATUS=<ESTADO>|START_DATE=<FECHA>|ESTIMATED_END=<FECHA>
3. STAGE|ID=<ID>|NAME=<NOMBRE>|STATUS=<ESTADO>
4. METRIC_ERROR|STAGE_ID=<ID>|DEV_ID=<ID>|TYPE=<TIPO>|SEVERITY=<SEV>|TIMESTAMP_ISO=<UTC>
5. METRIC_CONTINGENCY|STAGE_ID=<ID>|DEV_ID=<ID>|TYPE=<TIPO>|DURATION_MINUTES=<MIN>|TIMESTAMP_ISO=<UTC>
6. FOOTER|TOTAL_RECORDS=<TOTAL>`
    },
    {
      id: 'DOC-02',
      title: 'Manual de Arquitectura Desacoplada N-Capas (Spring Boot & React)',
      category: 'ARQUITECTURA',
      format: 'PDF',
      version: 'v3.1',
      description: 'Guia de diseno de controladores RESTful, servicios transaccionales bajo principios SOLID, inyeccion por constructor y desacoplamiento de frontend.',
      content: `ARQUITECTURA N-CAPAS IKERNELL
- Capa de Presentacion: React 18 SPA con Vite y Tailwind CSS.
- Capa de Seguridad: Spring Security 6 con JWT stateless sin cookies de sesion.
- Capa de Servicios: Logica de negocio encapsulada con @Transactional.
- Capa de Persistencia: Spring Data JPA + Hibernate ORM con Pool HikariCP.`
    },
    {
      id: 'DOC-03',
      title: 'Diccionario de Datos y Modelo Relacional PostgreSQL',
      category: 'BASE DE DATOS',
      format: 'PDF / SQL',
      version: 'v2.0',
      description: 'Estructura relacional de 20 tablas, claves primarias compuestas, restricciones ON DELETE CASCADE y configuracion de indices B-Tree para alta concurrencia.',
      content: `MODELO RELACIONAL POSTGRESQL (backend_db)
Tablas Principales:
- trabajador (id_trabajador, identificacion, nombre, email, password_hash, rol, estado)
- proyecto (id_proyecto, nombre, descripcion, fecha_inicio, fecha_fin_estimada, estado, lider_id)
- etapa (id_etapa, proyecto_id, nombre_etapa, estado)
- actividad (id_actividad, etapa_id, desarrollador_id, descripcion, estado)
- error (id_error, etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro)
- interrupcion (id_interrupcion, etapa_id, desarrollador_id, tipo_interrupcion, duracion_minutos)`
    },
    {
      id: 'DOC-04',
      title: 'Politica de Seguridad JWT y Cifrado de Contraseñas BCrypt',
      category: 'CIBERSEGURIDAD',
      format: 'PDF',
      version: 'v1.8',
      description: 'Procedimientos de seguridad perimetral, expiracion de tokens a 24 horas, derivacion de claves con factor de costo 10 y proteccion RNF-11 en .gitignore.',
      content: `POLITICA DE CIBERSEGURIDAD IKERNELL (RNF-08 a RNF-11)
- Tokens JWT emitidos con firma HMAC-SHA256 y expiracion a 86,400,000 ms.
- Hashes BCrypt unidireccionales generados con BCryptPasswordEncoder.
- Protocolo CORS restringido para origenes autorizados.
- Exclusion absoluta de documentos sensibles en el control de versiones Git.`
    }
  ];

  const categories = ['TODOS', 'NORMATIVAS', 'ARQUITECTURA', 'BASE DE DATOS', 'CIBERSEGURIDAD'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'TODOS' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownload = (doc) => {
    toast.success(`Descarga iniciada: ${doc.title} (${doc.format})`);
  };

  return (
    <div className="glass-card p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-md">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Biblioteca Digital de Documentos
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Repositorio centralizado de manuales tecnicos, normativas internacionales y especificaciones
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
          {documents.length} Documentos Oficiales
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="sm:col-span-2 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por titulo, codigo (ej. DOC-01) o descripcion..."
            className="input-field pl-11 py-2.5 text-sm"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field py-2.5 text-xs font-bold uppercase tracking-wider"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id}
            className="p-5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.65rem] font-black px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                  {doc.id} • {doc.version}
                </span>
                <span className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-wider">
                  {doc.category}
                </span>
              </div>

              <h4 className="font-bold text-zinc-900 dark:text-white text-base leading-snug mb-2">
                {doc.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {doc.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="font-bold text-zinc-500 dark:text-zinc-400">{doc.format}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="outline-button text-xs py-1.5 px-3 font-bold cursor-pointer"
                >
                  <Eye size={13} /> Previsualizar
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="gradient-button text-xs py-1.5 px-3 font-bold cursor-pointer"
                >
                  <Download size={13} /> Descargar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Previsualizacion */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-zinc-900 dark:text-white" />
                <h4 className="font-extrabold text-zinc-900 dark:text-white text-lg">{previewDoc.title}</h4>
              </div>
              <span className="text-xs font-bold text-zinc-500">{previewDoc.version}</span>
            </div>

            <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] mb-6 border border-zinc-800">
              {previewDoc.content}
            </pre>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="outline-button text-xs py-2 px-4 font-bold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => { handleDownload(previewDoc); setPreviewDoc(null); }}
                className="gradient-button text-xs py-2 px-4 font-bold cursor-pointer"
              >
                <Download size={14} /> Descargar Documento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
