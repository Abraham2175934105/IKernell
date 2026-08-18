-- ==============================================================================
-- SCHEMA COMPLETO Y CONSOLIDADO DDL + DML - IKERNELL SOLUCIONES SOFTWARE
-- Stack: PostgreSQL 14+ con extensión pg_trgm y GIN Indexes
-- Versión: 3.0 Enterprise High Performance
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. EXTENSIONES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- 2. DDL - TABLAS MAESTRAS DEL SISTEMA
-- ==============================================================================

-- 2.1 TABLA TRABAJADOR (Coordinador, Líderes y Desarrolladores con Soft-Delete)
CREATE TABLE IF NOT EXISTS trabajador (
    id_trabajador BIGSERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    direccion VARCHAR(150),
    profesion VARCHAR(100),
    especialidad VARCHAR(100),
    tipo_trabajador VARCHAR(20) NOT NULL, -- 'PLANTA' o 'CONTRATISTA'
    foto_url VARCHAR(500),
    email VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) NOT NULL,             -- 'COORDINADOR', 'LIDER', 'DESARROLLADOR'
    password_hash VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE  -- Soft-Delete (RNF-10)
);

CREATE INDEX IF NOT EXISTS idx_trabajador_email ON trabajador(email);
CREATE INDEX IF NOT EXISTS idx_trabajador_rol_estado ON trabajador(rol, estado);
CREATE INDEX IF NOT EXISTS idx_trabajador_identificacion ON trabajador(identificacion);

-- 2.2 TABLA PROYECTO (Proyectos empresariales con presupuesto, fechas y líder)
CREATE TABLE IF NOT EXISTS proyecto (
    id_proyecto BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    cliente VARCHAR(150),
    descripcion TEXT,
    presupuesto NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- 'ACTIVO', 'COMPLETADO', 'FINALIZADO', 'INHABILITADO'
    lider_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_proyecto_lider ON proyecto(lider_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_estado ON proyecto(estado);
CREATE INDEX IF NOT EXISTS idx_proyecto_nombre_gin ON proyecto USING gin (nombre gin_trgm_ops);

-- 2.3 TABLA PROYECTO_DESARROLLADOR (Pivote N:M con dedicación horaria semanal)
CREATE TABLE IF NOT EXISTS proyecto_desarrollador (
    id_asignacion BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    horas_semanales INT NOT NULL DEFAULT 40,
    CONSTRAINT uk_proyecto_desarrollador UNIQUE (proyecto_id, desarrollador_id)
);

CREATE INDEX IF NOT EXISTS idx_pd_proyecto ON proyecto_desarrollador(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pd_desarrollador ON proyecto_desarrollador(desarrollador_id);

-- 2.4 TABLA ETAPA (Fases WBS de desglose estructurado del proyecto)
CREATE TABLE IF NOT EXISTS etapa (
    id_etapa BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    nombre_etapa VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' -- 'PENDIENTE', 'EN_PROGRESO', 'FINALIZADA', 'COMPLETADA'
);

CREATE INDEX IF NOT EXISTS idx_etapa_proyecto ON etapa(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_etapa_estado ON etapa(estado);

-- 2.5 TABLA ACTIVIDAD (Tareas granulares WBS asignadas a desarrolladores)
CREATE TABLE IF NOT EXISTS actividad (
    id_actividad BIGSERIAL PRIMARY KEY,
    etapa_id BIGINT NOT NULL REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    desarrollador_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    descripcion VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' -- 'PENDIENTE', 'EN_PROGRESO', 'FINALIZADA', 'COMPLETADA'
);

CREATE INDEX IF NOT EXISTS idx_actividad_etapa ON actividad(etapa_id);
CREATE INDEX IF NOT EXISTS idx_actividad_desarrollador ON actividad(desarrollador_id);
CREATE INDEX IF NOT EXISTS idx_actividad_estado ON actividad(estado);

-- 2.6 TABLA ERROR (Telemetría de bugs, severidad y tiempo de atención)
CREATE TABLE IF NOT EXISTS error (
    id_error BIGSERIAL PRIMARY KEY,
    etapa_id BIGINT NOT NULL REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    tipo_error VARCHAR(50) NOT NULL,
    severidad VARCHAR(20) NOT NULL, -- 'BAJA', 'MEDIA', 'ALTA', 'CRITICA'
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT NOT NULL,
    estado_atencion VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO', -- 'REGISTRADO', 'EN_REVISION', 'SOLUCIONADO'
    resolucion_nota TEXT,
    fecha_resolucion TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_error_etapa ON error(etapa_id);
CREATE INDEX IF NOT EXISTS idx_error_desarrollador ON error(desarrollador_id);
CREATE INDEX IF NOT EXISTS idx_error_estado_atencion ON error(estado_atencion);
CREATE INDEX IF NOT EXISTS idx_error_fecha_registro ON error(fecha_registro DESC);

-- 2.7 TABLA INTERRUPCION (Métricas de tiempos muertos, bloqueos y contingencias)
CREATE TABLE IF NOT EXISTS interrupcion (
    id_interrupcion BIGSERIAL PRIMARY KEY,
    etapa_id BIGINT NOT NULL REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    tipo_interrupcion VARCHAR(50) NOT NULL,
    fecha_ocurrencia TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duracion_minutos INT NOT NULL,
    comentarios TEXT NOT NULL,
    estado_atencion VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO', -- 'REGISTRADO', 'EN_REVISION', 'SOLUCIONADO'
    resolucion_nota TEXT,
    fecha_resolucion TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interrupcion_etapa ON interrupcion(etapa_id);
CREATE INDEX IF NOT EXISTS idx_interrupcion_desarrollador ON interrupcion(desarrollador_id);
CREATE INDEX IF NOT EXISTS idx_interrupcion_fecha ON interrupcion(fecha_ocurrencia DESC);

-- 2.8 TABLA HISTORIAL_REASIGNACION (Auditoría inmutable de reasignación WBS)
CREATE TABLE IF NOT EXISTS historial_reasignacion (
    id_historial BIGSERIAL PRIMARY KEY,
    actividad_id BIGINT REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    desarrollador_anterior_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    nuevo_desarrollador_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    motivo TEXT NOT NULL,
    fecha_reasignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historial_actividad ON historial_reasignacion(actividad_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_reasignacion(fecha_reasignacion DESC);

-- 2.9 TABLA SOLICITUD_CONTACTO (Leads comerciales del portal institucional)
CREATE TABLE IF NOT EXISTS solicitud_contacto (
    id_solicitud BIGSERIAL PRIMARY KEY,
    nombre_remitente VARCHAR(100) NOT NULL,
    email_remitente VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atendido BOOLEAN NOT NULL DEFAULT FALSE,
    coordinador_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_solicitud_atendido ON solicitud_contacto(atendido);
CREATE INDEX IF NOT EXISTS idx_solicitud_fecha ON solicitud_contacto(fecha_envio DESC);

-- 2.10 TABLA MENSAJE_CHAT (Mensajería corporativa en tiempo real)
CREATE TABLE IF NOT EXISTS mensaje_chat (
    id_mensaje BIGSERIAL PRIMARY KEY,
    remitente_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    destinatario_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    canal VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    contenido TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_chat_canal ON mensaje_chat(canal);
CREATE INDEX IF NOT EXISTS idx_chat_remitente ON mensaje_chat(remitente_id);
CREATE INDEX IF NOT EXISTS idx_chat_destinatario ON mensaje_chat(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_chat_fecha ON mensaje_chat(fecha_envio DESC);

-- 2.11 TABLA DOCUMENTO_BIBLIOTECA (Gestor documental con visor A4 y soporte PDF/TXT)
CREATE TABLE IF NOT EXISTS documento_biblioteca (
    id_documento BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    archivo_url VARCHAR(500),
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subido_por_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    descripcion TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    formato VARCHAR(20) DEFAULT 'PDF',
    contenido_texto TEXT
);

CREATE INDEX IF NOT EXISTS idx_doc_categoria ON documento_biblioteca(categoria);
CREATE INDEX IF NOT EXISTS idx_doc_titulo_gin ON documento_biblioteca USING gin (titulo gin_trgm_ops);

-- 2.12 TABLA TUTORIAL (Módulos de inducción y capacitación técnica)
CREATE TABLE IF NOT EXISTS tutorial (
    id_tutorial BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    video_url VARCHAR(500),
    categoria VARCHAR(50),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    autor_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tutorial_categoria ON tutorial(categoria);

-- 2.13 TABLA MICRO_SNIPPET (Repositorio de inyección de código con búsqueda difusa)
CREATE TABLE IF NOT EXISTS micro_snippet (
    id_snippet BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tags_busqueda TEXT,
    codigo_solucion TEXT NOT NULL,
    lenguaje VARCHAR(50) NOT NULL,
    comando_consola VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snippet_titulo_gin ON micro_snippet USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_snippet_tags_gin ON micro_snippet USING gin (tags_busqueda gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_snippet_lenguaje ON micro_snippet(lenguaje);

-- 2.14 TABLA NOTICIA (Boletines informativos corporativos)
CREATE TABLE IF NOT EXISTS noticia (
    id_noticia BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    resumen TEXT,
    contenido TEXT NOT NULL,
    imagen_url VARCHAR(500),
    categoria VARCHAR(50),
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    autor_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

-- ==============================================================================
-- 3. DML - SEEDING INICIAL DE DATOS EMPRESARIALES
-- ==============================================================================

-- 3.1 TRABAJADORES (Hash BCrypt para 'password123')
INSERT INTO trabajador (id_trabajador, identificacion, nombre, apellido, fecha_nacimiento, direccion, profesion, especialidad, tipo_trabajador, foto_url, email, rol, password_hash, estado)
VALUES 
  (1, '1001001', 'Carlos', 'Gómez', '1985-04-12', 'Av. Empresarial 100', 'Ingeniero de Sistemas', 'Gestión de Proyectos & CMMI', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'carlos.coordinador@ikernell.com', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (2, '1001002', 'Ana', 'Martínez', '1988-08-23', 'Calle 45 # 12-30', 'Ingeniera de Software', 'Scrum Master & Cloud', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'ana.lider@ikernell.com', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (3, '1001003', 'Luis', 'Pérez', '1992-11-05', 'Carrera 15 # 80-45', 'Desarrollador Full Stack', 'React & Spring Boot', 'CONTRATISTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'luis.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (4, '1001004', 'Marta', 'López', '1994-02-18', 'Av. Circunvalar 23-10', 'Desarrolladora Backend', 'Java & Microservicios', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'marta.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (5, '1001005', 'Carlos', 'Mendoza', '1986-06-15', 'Calle 100 # 19-40', 'Tech Lead & Arquitecto', 'Arquitectura Distribuida & Java 17', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'carlos.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (6, '1001006', 'Ana', 'Gómez', '1993-09-20', 'Carrera 7 # 116-50', 'Desarrolladora Senior Full-Stack', 'React 18, Spring Boot 3 & PostgreSQL', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ana.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (7, '1001007', 'Roberto', 'Silva', '1980-03-10', 'Transversal 23 # 95-12', 'Coordinador General de Operaciones', 'Gestión de Proyectos & Auditoría CMMI', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'roberto.coord@ikernell.org', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (8, '1001008', 'Elena', 'Rostova', '1989-12-01', 'Calle 127 # 53-10', 'Líder de Proyecto & Cloud Architect', 'Kubernetes, AWS & Microfrontends', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'elena.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (9, '1001009', 'David', 'Valenzuela', '1995-05-14', 'Av. Boyacá # 72-15', 'Ingeniero Backend Senior', 'Java 17, JPA/Hibernate & Concurrencia', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'david.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (10, '1001010', 'Lucía', 'Morales', '1996-10-30', 'Carrera 68 # 45-20', 'Especialista UI/UX & Frontend Lead', 'React 18, Tailwind CSS & Framer Motion', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'lucia.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (11, '1001011', 'Mateo', 'Restrepo', '1994-07-22', 'Calle 80 # 11-45', 'Ingeniero de Datos & ETL Lead', 'PostgreSQL, Window Functions & Python', 'CONTRATISTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'mateo.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (12, '1001012', 'Sofía', 'Benítez', '1997-01-19', 'Calle 134 # 9-60', 'Ingeniera QA & Seguridad Aplicativa', 'Pruebas Automatizadas, Jest & OWASP', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'sofia.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (13, '1001013', 'Javier', 'Arboleda', '1991-04-03', 'Diagonal 45 # 22-80', 'Ingeniero DevOps & Resiliencia', 'Docker, CI/CD, Nginx & Monitoring', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'javier.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (14, '1001014', 'Ana', 'Ríos', '1982-07-15', 'Calle 100 # 15-20', 'Directora de Operaciones', 'Gestión de Proyectos & CMMI', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'ana.coordinador@ikernell.org', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (15, '1001015', 'Diego', 'Torres', '1995-12-08', 'Carrera 45 # 28-10', 'Desarrollador Frontend & Mobile', 'React Native & Cloud', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'diego.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true)
ON CONFLICT (id_trabajador) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  profesion = EXCLUDED.profesion,
  especialidad = EXCLUDED.especialidad,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  password_hash = EXCLUDED.password_hash;

SELECT setval('trabajador_id_trabajador_seq', (SELECT MAX(id_trabajador) FROM trabajador));

-- 3.2 PROYECTOS EMPRESARIALES CON PRESUPUESTO REAL
INSERT INTO proyecto (id_proyecto, nombre, cliente, descripcion, presupuesto, fecha_inicio, fecha_fin_estimada, estado, lider_id)
VALUES 
  (1, 'Sistema Facturación Cloud & ETL Brasil', 'Banco Santander Brasil S.A.', 'Plataforma empresarial para emisión de facturación electrónica y sincronización de métricas operacionales bajo estándar ISO 8601 hacia filiales en Brasil.', 85000.00, '2026-01-15', '2026-11-30', 'ACTIVO', 5),
  (2, 'Core Bancario & Microservicios Cloud', 'Itaú Unibanco Holding', 'Modernización de la arquitectura financiera con servicios transaccionales idempotentes, seguridad stateless JWT y alta concurrencia.', 120000.00, '2026-02-01', '2026-12-15', 'ACTIVO', 5),
  (3, 'App Móvil Fintech & Billetera Digital', 'Nubank Brasil S.A.', 'Billetera digital multiplataforma con pagos QR dinámicos, autenticación biométrica y transferencias interbancarias inmediatas.', 65000.00, '2026-03-01', '2026-10-30', 'ACTIVO', 8),
  (4, 'Plataforma Telemedicina & Triaje Inteligente', 'Hospital Israelita Albert Einstein', 'Sistema de atención médica virtual con streaming WebRTC de baja latencia, recetas digitales encriptadas y triaje automatizado.', 48000.00, '2026-04-10', '2026-09-30', 'ACTIVO', 8),
  (5, 'Migración ERP Empresarial & Data Warehouse', 'Embraer Enterprise Solutions', 'Migración masiva de base de datos legada hacia cluster PostgreSQL con pipelines de analítica predictiva en tiempo real.', 95000.00, '2025-06-01', '2026-01-30', 'COMPLETADO', 5)
ON CONFLICT (id_proyecto) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  cliente = EXCLUDED.cliente,
  descripcion = EXCLUDED.descripcion,
  presupuesto = EXCLUDED.presupuesto,
  fecha_inicio = EXCLUDED.fecha_inicio,
  fecha_fin_estimada = EXCLUDED.fecha_fin_estimada,
  estado = EXCLUDED.estado,
  lider_id = EXCLUDED.lider_id;

SELECT setval('proyecto_id_proyecto_seq', (SELECT MAX(id_proyecto) FROM proyecto));

-- 3.3 ASIGNACIONES NÓMINA DESARROLLADORES
DELETE FROM proyecto_desarrollador;
INSERT INTO proyecto_desarrollador (proyecto_id, desarrollador_id, horas_semanales)
VALUES 
  (1, 6, 20), (1, 9, 20), (1, 11, 18), (1, 3, 30),
  (2, 6, 15), (2, 9, 20), (2, 4, 24), (2, 12, 15), (2, 13, 20),
  (3, 10, 20), (3, 11, 10),
  (4, 10, 15), (4, 12, 15), (4, 13, 20), (4, 4, 20),
  (5, 9, 8);

-- 3.4 ETAPAS WBS
DELETE FROM etapa;
INSERT INTO etapa (id_etapa, proyecto_id, nombre_etapa, estado)
VALUES 
  (101, 1, 'Fase 1: Especificación y Arquitectura N-Capas', 'FINALIZADA'),
  (102, 1, 'Fase 2: Motor de Facturación y Cifrado DIAN', 'EN_PROGRESO'),
  (103, 1, 'Fase 3: Pipeline ETL ISO 8601 y Transmisión SFTP Brasil', 'EN_PROGRESO'),
  (104, 1, 'Fase 4: Pruebas de Estrés y Despliegue en Producción', 'PENDIENTE'),
  (201, 2, 'Fase 1: Modelado de Dominio y Transaccionalidad ACID', 'FINALIZADA'),
  (202, 2, 'Fase 2: Microservicios de Cuentas y Transferencias REST', 'EN_PROGRESO'),
  (203, 2, 'Fase 3: Semáforo Predictivo y Monitor de Contingencias', 'EN_PROGRESO'),
  (204, 2, 'Fase 4: Certificación de Seguridad PCI-DSS y Penetration Testing', 'PENDIENTE'),
  (301, 3, 'Fase 1: Wireframes y Sistema de Diseño en React Native', 'FINALIZADA'),
  (302, 3, 'Fase 2: Integración de Pagos QR y Webhooks Bancarios', 'EN_PROGRESO'),
  (303, 3, 'Fase 3: Módulo de Inyección de Snippets y Optimización', 'EN_PROGRESO'),
  (401, 4, 'Fase 1: Diseño de Protocolos de Historia Clínica y Criptografía', 'FINALIZADA'),
  (402, 4, 'Fase 2: Módulo WebRTC y Sala de Consulta Virtual', 'EN_PROGRESO'),
  (403, 4, 'Fase 3: Triaje Asistido y Portal de Pacientes', 'PENDIENTE'),
  (501, 5, 'Fase 1: Extracción de Schemas Legados y Sanitización', 'FINALIZADA'),
  (502, 5, 'Fase 2: Carga en Data Warehouse PostgreSQL y Validación', 'FINALIZADA')
ON CONFLICT (id_etapa) DO UPDATE SET
  proyecto_id = EXCLUDED.proyecto_id,
  nombre_etapa = EXCLUDED.nombre_etapa,
  estado = EXCLUDED.estado;

SELECT setval('etapa_id_etapa_seq', 600);

-- 3.5 ACTIVIDADES WBS
DELETE FROM actividad;
INSERT INTO actividad (id_actividad, etapa_id, desarrollador_id, descripcion, estado)
VALUES
  (1001, 102, 6, 'Implementar firma digital XAdES con certificado corporativo RSA 2048-bit', 'EN_PROGRESO'),
  (1002, 102, 6, 'Construir generador de código QR fiscal para representación gráfica de factura', 'EN_PROGRESO'),
  (1003, 103, 6, 'Diseñar parser de exportación plana delimitada bajo norma internacional ISO 8601 UTC', 'EN_PROGRESO'),
  (1004, 202, 6, 'Refactorizar servicio de conciliación con aislamiento de transacciones REQUIRES_NEW', 'EN_PROGRESO'),
  (1005, 302, 6, 'Desarrollar consumidor Kafka para procesamiento asíncrono de eventos de pago QR', 'EN_PROGRESO'),
  (1006, 101, 6, 'Documentar contratos OpenAPI 3.0 para la API pública de facturación', 'FINALIZADA'),
  (1007, 201, 6, 'Crear entidades JPA para auditoría inmutable de transacciones financieras', 'FINALIZADA'),
  (1008, 104, 6, 'Ejecutar pruebas de carga con k6 simulando 1,500 peticiones concurrentes por segundo', 'PENDIENTE'),
  (2001, 102, 9, 'Optimizar consultas de cálculo de impuestos en lote con Native Queries y CTEs', 'EN_PROGRESO'),
  (2002, 202, 9, 'Implementar mecanismo de Circuit Breaker con Resilience4j en pasarela de pagos', 'EN_PROGRESO'),
  (2003, 203, 9, 'Construir repository nativo para analítica de capacidad con Window Functions en PostgreSQL', 'EN_PROGRESO'),
  (2004, 501, 9, 'Desarrollar scripts de migración Flyway para compatibilidad con PostgreSQL 16', 'FINALIZADA'),
  (2005, 201, 9, 'Configurar pool HikariCP con detección de leaks a 20 segundos y métricas Micrometer', 'FINALIZADA'),
  (2006, 204, 9, 'Auditar algoritmos de encriptación de tarjetas de crédito cumpliendo norma PCI-DSS', 'PENDIENTE'),
  (2007, 202, 4, 'Construir endpoint de consulta de saldos con validación de tokens JWT', 'EN_PROGRESO'),
  (2008, 203, 4, 'Diseñar interceptores de auditoría para registro de peticiones HTTP en tiempo real', 'EN_PROGRESO'),
  (2009, 402, 4, 'Configurar endpoints de señalización WebRTC para videoconsultas médicas', 'FINALIZADA'),
  (4001, 103, 11, 'Configurar cliente SFTP con canal SSH2 cifrado y validación de Checksum MD5', 'EN_PROGRESO'),
  (4002, 103, 11, 'Automatizar tarea programada @Scheduled para generación nocturna de lotes ETL', 'EN_PROGRESO'),
  (4003, 502, 11, 'Ejecutar reconciliación de 2.4 millones de registros históricos en Data Warehouse', 'FINALIZADA'),
  (4004, 302, 11, 'Construir vistas materializadas en PostgreSQL para reportes financieros instantáneos', 'EN_PROGRESO'),
  (4005, 101, 11, 'Diseñar especificación de formato plano de 14 columnas para la alianza estratégica Brasil', 'FINALIZADA'),
  (3001, 301, 10, 'Crear sistema de diseño monocromático con soporte dinámico de modo Claro/Oscuro', 'FINALIZADA'),
  (3002, 302, 10, 'Construir componente interactivo de escáner QR con retroalimentación háptica', 'EN_PROGRESO'),
  (3003, 303, 10, 'Implementar motor de inyección de Micro-Snippets con búsqueda debounced en React', 'FINALIZADA'),
  (3004, 402, 10, 'Desarrollar interfaz de videollamada WebRTC con controles flotantes en Tailwind CSS', 'FINALIZADA'),
  (3005, 401, 10, 'Diseñar arquitectura de microfrontends con Module Federation en Vite', 'FINALIZADA'),
  (5001, 204, 12, 'Ejecutar escaneo estático de código fuente con SonarQube y reglas OWASP Top 10', 'EN_PROGRESO'),
  (5002, 403, 12, 'Diseñar suite de pruebas end-to-end con Playwright para flujo de triaje de pacientes', 'PENDIENTE'),
  (5003, 101, 12, 'Verificar cumplimiento de tiempos de respuesta menores a 200ms en endpoints críticos', 'FINALIZADA'),
  (6001, 402, 13, 'Desplegar clúster de Kubernetes con autoescalado horizontal (HPA) en AWS EKS', 'EN_PROGRESO'),
  (6002, 203, 13, 'Configurar dashboards de observabilidad en Grafana y alertas automáticas por webhook', 'EN_PROGRESO'),
  (6003, 501, 13, 'Crear pipeline de CI/CD en GitHub Actions con compilación incremental y tests unitarios', 'FINALIZADA')
ON CONFLICT (id_actividad) DO UPDATE SET
  etapa_id = EXCLUDED.etapa_id,
  desarrollador_id = EXCLUDED.desarrollador_id,
  descripcion = EXCLUDED.descripcion,
  estado = EXCLUDED.estado;

SELECT setval('actividad_id_actividad_seq', 7000);

-- 3.6 TELEMETRÍA DE ERRORES E INTERRUPCIONES
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES 
  (102, 6, 'ERROR_COMPILACION', 'CRITICA', '2026-08-10 09:15:00', 'Conflicto de dependencias en BouncyCastle al compilar módulo de firma XAdES', 'SOLUCIONADO', 'Actualizado bcprov-jdk18on a versión 1.78 y exclusión de versiones transitivas.', '2026-08-10 11:30:00'),
  (102, 6, 'DESBORDAMIENTO_MEMORIA', 'ALTA', '2026-08-11 14:20:00', 'OutOfMemoryError en JVM durante generación de PDFs masivos de facturación', 'EN_REVISION', 'Evaluando streaming directo a disco y ajuste de heap size -Xmx2g.', NULL),
  (202, 6, 'TIMEOUT_RED', 'MEDIA', '2026-08-12 16:45:00', 'Timeout de conexión HTTP al invocar servicio de validación de cuentas bancarias', 'REGISTRADO', NULL, NULL),
  (302, 6, 'FALLO_SEGURIDAD', 'CRITICA', '2026-08-13 10:00:00', 'Token JWT no revocado permitía transacciones en billetera tras logout', 'SOLUCIONADO', 'Implementada blacklist distribuida con Redis y TTL sincronizado con la expiración del token.', '2026-08-13 12:15:00'),
  (103, 6, 'ERROR_COMPILACION', 'BAJA', '2026-08-14 08:30:00', 'Warning de deprecación en parser ISO 8601 de fechas UTC para transmisión Brasil', 'REGISTRADO', NULL, NULL);

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES 
  (102, 6, 'CAIDA_SERVICIO_EXTERNO', '2026-08-10 10:00:00', 90, 'Indisponibilidad del Web Service de homologación DIAN para pruebas de firma', 'SOLUCIONADO', 'Configurado servidor Mock local con WireMock para pruebas desacopladas.', '2026-08-10 11:45:00'),
  (202, 6, 'REUNION_NO_PLANIFICADA', '2026-08-11 11:00:00', 60, 'Reunión de emergencia con equipo de arquitectura por fallo en conciliación', 'SOLUCIONADO', 'Acuerdos documentados en Confluence y ajustado diagrama de secuencia.', '2026-08-11 12:00:00'),
  (103, 6, 'PROBLEMA_INFRAESTRUCTURA', '2026-08-12 15:30:00', 45, 'Corte de red en VPN corporativa para acceso al servidor SFTP Brasil', 'REGISTRADO', NULL, NULL),
  (302, 6, 'BLOQUEO_POR_TERCEROS', '2026-08-13 09:00:00', 120, 'Esperando credenciales de prueba del sandbox de pagos QR de Redeban', 'EN_REVISION', 'Escalado al Coordinador General para gestión de accesos con el proveedor.', NULL);

-- 3.7 DOCUMENTOS BIBLIOTECA DUAL
INSERT INTO documento_biblioteca (id_documento, titulo, categoria, archivo_url, fecha_subida, subido_por_id, descripcion, version, formato, contenido_texto)
VALUES 
  (1, 'Manual de Estándares de Arquitectura y Microservicios IKernell', 'ARQUITECTURA', 'https://ikernell.org/docs/manual-arquitectura-v3.pdf', '2026-01-10 08:00:00', 7, 'Directrices oficiales de arquitectura de software para el desarrollo de APIs REST, seguridad JWT y patrones de resiliencia.', '3.2', 'PDF', 'MANUAL DE ESTÁNDARES DE ARQUITECTURA IKERNELL\n\n1. PRINCIPIOS GENERALES\n- Desacoplamiento estricto mediante N-Capas.\n- Comunicación asíncrona no bloqueante.\n- Cobertura de pruebas unitarias mínima del 80%.'),
  (2, 'Protocolo de Seguridad y Protección de Datos Personales (CMMI Level 3)', 'SEGURIDAD', 'https://ikernell.org/docs/protocolo-seguridad-cmmi.pdf', '2026-01-15 10:30:00', 7, 'Normativa de cumplimiento para la gestión de credenciales, cifrado en tránsito (TLS 1.3) y en reposo (AES-256).', '2.0', 'PDF', 'PROTOCOLO DE SEGURIDAD Y PRIVACIDAD\n\n1. CIFRADO\nTodas las comunicaciones entre microservicios deben utilizar TLS 1.3.');

SELECT setval('documento_biblioteca_id_documento_seq', 10);

-- 3.8 TUTORIALES Y MICRO-SNIPPETS
INSERT INTO tutorial (id_tutorial, titulo, descripcion, video_url, categoria, fecha_creacion, autor_id)
VALUES 
  (1, 'Inducción al Pipeline ETL Brasil y Estándar ISO 8601', 'Guía paso a paso para la generación, validación y transmisión segura de lotes operacionales hacia Brasil.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'INTEGRACION', '2026-02-01 09:00:00', 5),
  (2, 'Diagnóstico Temprano de Burnout y Gestión de Cargas 48h', 'Capacitación para líderes sobre balance de capacidad semanal y prevención de sobreasignación según HU-12.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'METODOLOGIA', '2026-02-05 14:00:00', 7);

SELECT setval('tutorial_id_tutorial_seq', 10);

COMMIT;
