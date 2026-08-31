-- ==============================================================================
-- SCHEMA COMPLETO Y CONSOLIDADO DDL + DML - IKERNELL SOLUCIONES SOFTWARE
-- Stack: PostgreSQL 14+ con extensión pg_trgm y GIN Indexes
-- Versión: 3.0 Enterprise High Performance
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
  (2, '1001002', 'Ana', 'Martínez', '1988-08-23', 'Calle 45 # 12-30', 'Ingeniera de Software', 'Scrum Master & Cloud', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'ana.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (3, '1001003', 'Luis', 'Pérez', '1992-11-05', 'Carrera 15 # 80-45', 'Desarrollador Full Stack', 'React & Spring Boot', 'CONTRATISTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'luis.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (4, '1001004', 'Marta', 'López', '1994-02-18', 'Av. Circunvalar 23-10', 'Desarrolladora Backend', 'Java & Microservicios', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'marta.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (5, '1001005', 'Carlos', 'Mendoza', '1986-06-15', 'Calle 100 # 19-40', 'Tech Lead & Arquitecto', 'Arquitectura Distribuida & Java 17', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'carlos.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (6, '1001006', 'Ana', 'Gómez', '1993-09-20', 'Carrera 7 # 116-50', 'Desarrolladora Senior Full-Stack', 'React 18, Spring Boot 3 & PostgreSQL', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ana.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (7, '1001007', 'Roberto', 'Silva', '1980-03-10', 'Transversal 23 # 95-12', 'Coordinador General de Operaciones', 'Gestión de Proyectos & Auditoría CMMI', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'roberto.coord@ikernell.org', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (8, '1001008', 'Elena', 'Rostova', '1989-12-01', 'Calle 127 # 53-10', 'Líder de Proyecto & Cloud Architect', 'Kubernetes, AWS & Microfrontends', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'elena.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (9, '1001009', 'David', 'Valenzuela', '1995-05-14', 'Av. Boyacá # 72-15', 'Ingeniero Backend Senior', 'Java 17, JPA/Hibernate & Concurrencia', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'david.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
INSERT INTO trabajador (id_trabajador, identificacion, nombre, apellido, fecha_nacimiento, direccion, profesion, especialidad, tipo_trabajador, foto_url, email, email_personal, rol, password_hash, estado)
VALUES 
  (1, '1001001', 'Carlos', 'Gómez', '1985-04-12', 'Av. Empresarial 100', 'Ingeniero de Sistemas & MBA', 'Dirección de Operaciones & Gobierno TI • [Gestión de Talento Humano, Presupuestos & Costos, Planificación Estratégica, Métricas de Productividad, Gobernanza TI]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'carlos.coordinador@ikernell.com', 'carlos.coordinador.personal@gmail.com', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (2, '1001002', 'Ana', 'Martínez', '1988-08-23', 'Calle 45 # 12-30', 'Ingeniera de Software & Scrum Master', 'Liderazgo de Proyectos & Metodologías Ágiles • [Scrum Master, Planificación WBS, Liderazgo de Equipos, Jira / Confluence, Spring Boot 3, React.js]', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'ana.lider@ikernell.org', 'ana.lider.personal@gmail.com', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (3, '1001003', 'Luis', 'Pérez', '1992-11-05', 'Carrera 15 # 80-45', 'Ingeniero de Software Full Stack', 'Desarrollo Full Stack • [React.js, Java 17, Spring Boot 3, PostgreSQL, REST APIs, Git & GitHub]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'luis.dev@ikernell.com', 'luis.perez.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (4, '1001004', 'Marta', 'López', '1994-02-18', 'Av. Circunvalar 23-10', 'Ingeniera de Sistemas & Backend Lead', 'Arquitectura Backend & Microservicios • [Java 17, Spring Boot 3, Microservicios, PostgreSQL, Docker, Redis]', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'marta.dev@ikernell.com', 'marta.lopez.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (5, '1001005', 'Carlos', 'Mendoza', '1986-06-15', 'Calle 100 # 19-40', 'Tech Lead & Arquitecto de Software', 'Arquitectura Distribuida & Dirección Técnica • [Arquitectura de Software, Planificación WBS, Code Review, Java 17, Spring Boot 3, Docker, Kubernetes]', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'carlos.lider@ikernell.org', 'carlos.mendoza.personal@gmail.com', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (6, '1001006', 'Ana', 'Gómez', '1993-09-20', 'Carrera 7 # 116-50', 'Ingeniera de Sistemas Senior', 'Desarrollo Full Stack & PostgreSQL • [React.js, Spring Boot 3, PostgreSQL, TypeScript, REST APIs, Tailwind CSS]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ana.dev@ikernell.org', 'ana.gomez.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (7, '1001007', 'Roberto', 'Silva', '1980-03-10', 'Transversal 23 # 95-12', 'Director de Operaciones & Calidad', 'Gestión de Talento & Auditoría CMMI • [Gestión de Talento Humano, Auditoría de Procesos, Coordinación Operativa, Presupuestos & Costos, Cumplimiento Normativo]', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'roberto.coord@ikernell.org', 'roberto.silva.personal@gmail.com', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (8, '1001008', 'Elena', 'Rostova', '1989-12-01', 'Calle 127 # 53-10', 'Líder de Proyecto & Cloud Architect', 'Gestión de Proyectos Cloud & Microservicios • [Gestión de Proyectos, Scrum Master, AWS, Docker, Kubernetes, Microservicios, Planificación WBS]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'elena.lider@ikernell.org', 'elena.rostova.personal@gmail.com', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (9, '1001009', 'David', 'Valenzuela', '1995-05-14', 'Av. Boyacá # 72-15', 'Ingeniero Backend Senior', 'Backend & Alta Concurrencia • [Java 17, Spring Boot 3, JPA / Hibernate, PostgreSQL, Docker, REST APIs]', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'david.dev@ikernell.org', 'david.valenzuela.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (10, '1001010', 'Lucía', 'Morales', '1996-10-30', 'Carrera 68 # 45-20', 'Especialista UI/UX & Frontend Lead', 'Frontend Moderno & Experiencia de Usuario • [React.js, TypeScript, Tailwind CSS, UI/UX Design, Framer Motion, Next.js]', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'lucia.dev@ikernell.org', 'lucia.morales.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (11, '1001011', 'Mateo', 'Restrepo', '1994-07-22', 'Calle 80 # 11-45', 'Ingeniero de Datos & ETL Lead', 'Ingeniería de Datos & Pipelines ETL • [PostgreSQL, Python, Docker, Pipelines ETL, Linux, REST APIs]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'mateo.dev@ikernell.org', 'mateo.restrepo.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (12, '1001012', 'Sofía', 'Benítez', '1997-01-19', 'Calle 134 # 9-60', 'Ingeniera QA & Seguridad de Software', 'Aseguramiento de Calidad & Ciberseguridad • [Pruebas Automatizadas, Jest, OWASP, Java 17, CI/CD Pipelines, Git & GitHub]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'sofia.dev@ikernell.org', 'sofia.benitez.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (13, '1001013', 'Javier', 'Arboleda', '1991-04-03', 'Diagonal 45 # 22-80', 'Ingeniero DevOps & Resiliencia de Infraestructura', 'Infraestructura Cloud & CI/CD • [Docker, CI/CD Pipelines, Linux, AWS, Kubernetes, Nginx, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'javier.dev@ikernell.org', 'javier.arboleda.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (14, '1001014', 'Ana', 'Ríos', '1982-07-15', 'Calle 100 # 15-20', 'Directora de Talento & Operaciones TI', 'Administración de Personal & Gobernanza • [Administración de Personal, Planificación Estratégica, Atención de Casos Web, Negociación con Clientes, Resolución de Conflictos]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'ana.coordinador@ikernell.org', 'ana.rios.personal@gmail.com', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (15, '1001015', 'Diego', 'Torres', '1995-12-08', 'Carrera 45 # 28-10', 'Ingeniero de Software Frontend & Mobile', 'Desarrollo Frontend & Aplicaciones Móviles • [React.js, TypeScript, Tailwind CSS, REST APIs, Git & GitHub, UI/UX Design]', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'diego.dev@ikernell.org', 'diego.torres.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (16, '1001016', 'Gabriel', 'Ruiz', '1996-03-14', 'Calle 72 # 11-20', 'Ingeniero de Software Frontend', 'Desarrollo Web Frontend • [React.js, TypeScript, Tailwind CSS, Redux Toolkit]', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'gabriel.dev@ikernell.org', 'gabriel.ruiz.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (17, '1001017', 'Valentina', 'Castro', '1997-08-25', 'Carrera 19 # 104-15', 'Ingeniera Backend Java', 'Microservicios & Spring Boot • [Java 17, Spring Boot 3, Hibernate, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'valentina.dev@ikernell.org', 'valentina.castro.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (18, '1001018', 'Camilo', 'Medina', '1994-11-02', 'Av. Suba # 116-40', 'Administrador de Base de Datos', 'Bases de Datos & Tuning SQL • [PostgreSQL, Redis, Consultas Optimizadas, Índices B-Tree]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'camilo.dev@ikernell.org', 'camilo.medina.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (19, '1001019', 'Mariana', 'Ospina', '1995-04-18', 'Calle 100 # 23-10', 'Ingeniera de Pruebas QA', 'Pruebas Automatizadas & Calidad • [Jest, Cypress, Selenium, Postman, Java 17]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'mariana.dev@ikernell.org', 'mariana.ospina.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (20, '1001020', 'Andrés', 'Silva', '1991-09-30', 'Calle 134 # 45-80', 'Arquitecto Cloud & Kubernetes', 'Infraestructura Cloud & Orchestration • [Docker, Kubernetes, AWS, Terraform, Nginx]', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'andres.dev@ikernell.org', 'andres.silva.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (21, '1001021', 'Camila', 'Rincón', '1998-02-12', 'Carrera 15 # 93-60', 'Desarrolladora Mobile', 'Desarrollo Móvil Multiplataforma • [React Native, Flutter, iOS, Android, REST APIs]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'camila.dev@ikernell.org', 'camila.rincon.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (22, '1001022', 'Felipe', 'Duarte', '1993-06-05', 'Calle 80 # 45-12', 'Especialista en Ciberseguridad', 'Seguridad de Software & Auditing • [OWASP Top 10, JWT, BCrypt, Penetration Testing]', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'felipe.dev@ikernell.org', 'felipe.duarte.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (23, '1001023', 'Isabella', 'Vargas', '1996-12-20', 'Diagonal 60 # 18-30', 'Desarrolladora Backend Java', 'Servicios REST & Integraciones • [Java 17, Spring Boot, Microservicios, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'isabella.dev@ikernell.org', 'isabella.vargas.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (24, '1001024', 'Samuel', 'Moreno', '1992-07-08', 'Calle 116 # 7-40', 'Ingeniero de Datos Python', 'Pipelines ETL & Analítica • [Python, Pandas, PostgreSQL, Docker, Airflow]', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'samuel.dev@ikernell.org', 'samuel.moreno.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (25, '1001025', 'Natalia', 'Vega', '1997-01-31', 'Carrera 9 # 72-15', 'Desarrolladora Full Stack', 'Full Stack TypeScript & Node • [Node.js, React.js, TypeScript, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'natalia.dev@ikernell.org', 'natalia.vega.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (26, '1001026', 'Nicolás', 'Herrera', '1994-05-22', 'Av. Pepe Sierra # 15-50', 'Ingeniero DevOps CI/CD', 'Automatización & CI/CD Pipelines • [GitHub Actions, Docker, Linux, Bash, AWS]', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'nicolas.dev@ikernell.org', 'nicolas.herrera.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (27, '1001027', 'Daniela', 'Jiménez', '1998-10-14', 'Calle 140 # 19-35', 'Diseñadora UI/UX Lead', 'Diseño de Interfaces & Figma • [Figma, Tailwind CSS, Accessibility, Design Systems]', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'daniela.dev@ikernell.org', 'daniela.jimenez.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (28, '1001028', 'Alejandro', 'Paredes', '1993-03-09', 'Carrera 45 # 100-20', 'Ingeniero Backend Senior', 'Sistemas Distribuidos & Go • [Go, C++, Microservicios, gRPC, PostgreSQL]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'alejandro.dev@ikernell.org', 'alejandro.paredes.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (29, '1001029', 'Valeria', 'Mendoza', '1996-09-17', 'Calle 90 # 14-60', 'Ingeniera de Pruebas QA', 'QA Automation & Performance • [K6, JMeter, Selenium, Cypress, CI/CD]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'valeria.dev@ikernell.org', 'valeria.mendoza.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (30, '1001030', 'Sebastián', 'Cruz', '1995-11-28', 'Carrera 7 # 82-40', 'Especialista Cloud AWS', 'Infraestructura como Código • [AWS Lambda, Terraform, S3, ECS, Docker]', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'sebastian.dev@ikernell.org', 'sebastian.cruz.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (31, '1001031', 'Andrea', 'Delgado', '1997-06-11', 'Calle 127 # 20-80', 'Desarrolladora Frontend Senior', 'Frontend React & Vue.js • [React.js, Vue 3, TypeScript, Vite, Tailwind CSS]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'andrea.dev@ikernell.org', 'andrea.delgado.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (32, '1001032', 'Tomás', 'Ramírez', '1994-01-05', 'Av. Suba # 98-15', 'Ingeniero Backend Java 17', 'Arquitectura REST & Spring • [Java 17, Spring Boot 3, Spring Security, JPA]', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'tomas.dev@ikernell.org', 'tomas.ramirez.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (33, '1001033', 'Sofía', 'Guerrero', '1998-05-19', 'Calle 53 # 13-40', 'Ingeniera de Datos ETL', 'Ingeniería de Datos & Pipelines • [PostgreSQL, Python, Airflow, Spark, SQL]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'sofia.g.dev@ikernell.org', 'sofia.guerrero.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (34, '1001034', 'Lucas', 'Navarro', '1996-07-24', 'Carrera 11 # 95-10', 'Desarrollador Full Stack', 'Full Stack Java & React • [Java 17, Spring Boot 3, React.js, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'lucas.dev@ikernell.org', 'lucas.navarro.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (35, '1001035', 'Juliana', 'Beltrán', '1995-10-03', 'Av. 19 # 120-45', 'Especialista en Auditoría TI', 'Ciberseguridad & Gobierno TI • [OWASP, ISO 27001, Hardening, Audit SQL]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'juliana.dev@ikernell.org', 'juliana.beltran.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (36, '1001036', 'Fernando', 'Montoya', '1995-08-12', 'Carrera 7 # 120-10', 'Ingeniero Backend Java', 'Desarrollo Backend & Microservicios • [Java 17, Spring Boot 3, REST APIs, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'fernando.dev@ikernell.org', 'fernando.montoya.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (37, '1001037', 'Carolina', 'Espinoza', '1996-03-22', 'Calle 116 # 23-45', 'Ingeniera Frontend React', 'Desarrollo Web Frontend & UI • [React.js, Next.js, Tailwind CSS, TypeScript]', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'carolina.dev@ikernell.org', 'carolina.espinoza.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (38, '1001038', 'Mauricio', 'Cárdenas', '1994-11-15', 'Av. Pepe Sierra # 45-12', 'Ingeniero Full Stack Enterprise', 'Desarrollo Full Stack Enterprise • [Java 17, Spring Boot, React.js, Docker, PostgreSQL]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'mauricio.dev@ikernell.org', 'mauricio.cardenas.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (39, '1001039', 'Paula', 'Santamaría', '1997-04-18', 'Calle 100 # 14-80', 'Ingeniera QA & Automated Testing', 'Aseguramiento de Calidad & QA Automation • [Cypress, Jest, Postman, Java 17, Selenium]', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'paula.dev@ikernell.org', 'paula.santamaria.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (40, '1001040', 'Gonzalo', 'Barrios', '1993-09-05', 'Carrera 15 # 78-20', 'Arquitecto Cloud & CI/CD', 'Infraestructura Cloud & CI/CD Pipelines • [Docker, Kubernetes, AWS, Nginx, CI/CD]', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'gonzalo.dev@ikernell.org', 'gonzalo.barrios.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (41, '1001041', 'Vanessa', 'Zapata', '1998-01-27', 'Calle 134 # 19-30', 'Desarrolladora Frontend TypeScript', 'Frontend Moderno & Componentes UI • [React.js, TypeScript, Tailwind CSS, Redux]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'vanessa.dev@ikernell.org', 'vanessa.zapata.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (42, '1001042', 'Esteban', 'Pardo', '1995-06-30', 'Av. Suba # 100-50', 'Ingeniero de Datos & SQL Lead', 'Bases de Datos & Pipelines ETL • [PostgreSQL, Python, ETL, SQL, Redis]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'esteban.dev@ikernell.org', 'esteban.pardo.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (43, '1001043', 'Lina', 'Cordero', '1996-12-14', 'Carrera 45 # 82-15', 'Desarrolladora Microservicios', 'Arquitectura REST & Spring Boot • [Java 17, Spring Boot 3, Microservicios, Docker]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'lina.dev@ikernell.org', 'lina.cordero.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (44, '1001044', 'Hugo', 'Benavides', '1992-02-08', 'Calle 80 # 22-60', 'Especialista Ciberseguridad', 'Ciberseguridad & OWASP Hardening • [OWASP, BCrypt, JWT, Spring Security, Audit]', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'hugo.dev@ikernell.org', 'hugo.benavides.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (45, '1001045', 'Adriana', 'Castaño', '1997-10-19', 'Carrera 19 # 95-40', 'Diseñadora UI/UX & Frontend', 'Experiencia de Usuario & React • [React.js, Figma, Tailwind CSS, Framer Motion]', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'adriana.dev@ikernell.org', 'adriana.castano.personal@gmail.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true)
ON CONFLICT (id_trabajador) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  profesion = EXCLUDED.profesion,
  especialidad = EXCLUDED.especialidad,
  email = EXCLUDED.email,
  email_personal = EXCLUDED.email_personal,
  rol = EXCLUDED.rol,
  password_hash = EXCLUDED.password_hash;

SELECT setval('trabajador_id_trabajador_seq', (SELECT MAX(id_trabajador) FROM trabajador));

-- 3.2 PROYECTOS EMPRESARIALES CON PRESUPUESTO REAL
INSERT INTO proyecto (id_proyecto, nombre, cliente, descripcion, presupuesto, fecha_inicio, fecha_fin_estimada, estado, lider_id)
VALUES 
  (1, 'Sistema Facturación Cloud & ETL Brasil', 'Banco Santander Brasil S.A.', 'Plataforma empresarial para emisión de facturación electrónica y sincronización de métricas operacionales bajo estándar ISO 8601 hacia filiales en Brasil.', 85000.00, '2026-01-15', '2026-11-30', 'ACTIVO', 2),
  (2, 'Core Bancario & Microservicios Cloud', 'Itaú Unibanco Holding', 'Modernización de la arquitectura financiera con servicios transaccionales idempotentes, seguridad stateless JWT y alta concurrencia.', 120000.00, '2026-02-01', '2026-12-15', 'ACTIVO', 5),
  (3, 'App Móvil Fintech & Billetera Digital', 'Nubank Brasil S.A.', 'Billetera digital multiplataforma con pagos QR dinámicos, autenticación biométrica y transferencias interbancarias inmediatas.', 65000.00, '2026-03-01', '2026-10-30', 'ACTIVO', 8),
  (4, 'Plataforma Telemedicina & Triaje Inteligente', 'Hospital Israelita Albert Einstein', 'Sistema de atención médica virtual con streaming WebRTC de baja latencia, recetas digitales encriptadas y triaje automatizado.', 48000.00, '2026-04-10', '2026-09-30', 'ACTIVO', 8),
  (5, 'Migración ERP Empresarial & Data Warehouse', 'Embraer Enterprise Solutions', 'Migración masiva de base de datos legada hacia cluster PostgreSQL con pipelines de analítica predictiva en tiempo real.', 95000.00, '2025-06-01', '2026-01-30', 'ACTIVO', 2),
  (6, 'Portal E-Commerce Internacional & Pasarela Multi-Moneda', 'Mercado Libre LatAm', 'Plataforma global de comercio electrónico con procesamiento transaccional en tiempo real, catálogo distribuido y pasarela multi-divisa.', 185000.00, '2024-03-01', '2025-02-28', 'FINALIZADO', 5),
  (7, 'Sistema de Logística Fleet-Tracker & Telemetría IoT', 'DHL Express Logistics', 'Plataforma de monitoreo y rastreo satelital de flota de transporte pesado con alertas de telemetría IoT y geocercas inteligentes.', 110000.00, '2025-08-01', '2026-06-30', 'EN_PAUSA', 2),
  (8, 'Microservicio OAuth2 & SSO Corporativo', 'Seguros Bolívar S.A.', 'Servidor centralizado de autenticación y autorización unificada bajo estándares OAuth2 / OpenID Connect con soporte MFA.', 28000.00, '2026-05-01', '2026-09-15', 'ACTIVO', 8),
  (9, 'App Móvil de Gestión Hospitalaria & Recetas QR', 'Organización Sanitas Internacional', 'Aplicación móvil asistencial para gestión de citas médicas, historial clínico digital y dispensación de recetas con validación QR.', 75000.00, '2024-09-01', '2025-05-30', 'FINALIZADO', 2),
  (10, 'Motor de IA & Scoring Crediticio en Tiempo Real', 'Bancolombia S.A.', 'Sistema de analítica predictiva y scoring crediticio asistido por modelos de Machine Learning para aprobación de créditos en tiempo real.', 210000.00, '2026-02-15', '2026-12-31', 'ACTIVO', 5),
  (11, 'Sistema Interno de Mesas de Ayuda & Control de Assets', 'IKernell Internal Operations', 'Plataforma web interna para seguimiento de tickets de soporte técnico, gestión de activos de hardware e inventario corporativo.', 15000.00, '2026-01-10', '2026-08-30', 'EN_PAUSA', 8),
  (12, 'Plataforma de Auditoría & Ciberseguridad ISO 27001', 'Superintendencia Financiera', 'Módulo de auditoría inmutable, escaneo continuo de vulnerabilidades y verificación de cumplimiento normativo ISO 27001 / CMMI-5.', 90000.00, '2026-04-01', '2026-11-15', 'ACTIVO', 5),
  (13, 'Portal de Facturación Electrónica DIAN v3.0 Enterprise', 'Empresas Públicas de Medellín (EPM)', 'Sistema corporativo de emisión masiva de documentos electrónicos bajo normativa DIAN UBL 2.1 con alta disponibilidad.', 140000.00, '2026-03-15', '2026-12-01', 'ACTIVO', 2),
  (14, 'Infraestructura Cloud & Clúster Redis Distribuido', 'Grupo Éxito S.A.', 'Implementación de clúster de almacenamiento en memoria de ultra alta velocidad para soporte de sesiones concurrentes en eventos HotSale.', 32000.00, '2025-01-15', '2025-06-15', 'FINALIZADO', 8),
  (15, 'Sistema de Detección de Fraudes con Machine Learning', 'BBVA Colombia S.A.', 'Pipeline de análisis de patrones sospechosos e inyección de alertas antifraude en transacciones con modelos de regresión logística.', 250000.00, '2026-01-10', '2026-12-20', 'ACTIVO', 5),
  (16, 'Plataforma de Firma Electrónica & Certificados PKI', 'Cámara de Comercio de Bogotá', 'Sistema corporativo para la emisión, validación y almacenamiento de certificados digitales de firma electrónica con validez jurídica.', 68000.00, '2024-05-01', '2025-01-30', 'FINALIZADO', 2),
  (17, 'Portal de Gestión de Proveedores & Licitaciones', 'Ecopetrol S.A.', 'Módulo empresarial para registro de contratistas, recepción de propuestas de licitación y evaluación automatizada de pliegos.', 175000.00, '2026-02-01', '2026-11-15', 'ACTIVO', 2),
  (18, 'App Móvil de Delivery & Rastreio de Pedidos', 'Rappi LatAm', 'Plataforma móvil con asignación dinámica de repartidores, cálculo de rutas óptimas y notificaciones push en tiempo real.', 82000.00, '2025-09-01', '2026-07-15', 'EN_PAUSA', 8),
  (19, 'Plataforma de Streaming & Eventos en Vivo WebRTC', 'Movistar España / Colombia', 'Infraestructura de transmisión masiva de video en ultra alta definición con chat interactivo y moderación de contenido en tiempo real.', 130000.00, '2026-03-01', '2026-10-31', 'ACTIVO', 5),
  (20, 'Sistema de Control de Inventario & Código de Barras RFID', 'Homecenter Sodimac', 'Módulo de auditoría de existencias en tiempo real con integración de escáneres RFID de alta frecuencia y alertas de reabastecimiento.', 52000.00, '2024-08-01', '2025-04-15', 'FINALIZADO', 8),
  (21, 'Core de Notificaciones Push & Mensajería SMS/WhatsApp', 'Claro Telecomunicaciones', 'Gateway unificado para el envío de códigos OTP y mensajes de verificación a más de 10 millones de clientes móviles.', 38000.00, '2026-04-01', '2026-09-30', 'ACTIVO', 5),
  (22, 'Portal Académico & Sistema de Calificaciones Online', 'Universidad Nacional de Colombia', 'Sistema de gestión de matrículas, historial académico y registro de notas con firma digital para docentes y estudiantes.', 45000.00, '2024-02-01', '2024-11-30', 'FINALIZADO', 2),
  (23, 'Motor de Búsqueda Semántica & Ingesta Elasticsearch', 'El Tiempo Casa Editorial', 'Módulo de indexación masiva de artículos periodísticos con motor de recomendación inteligente y búsqueda por palabras clave.', 42000.00, '2025-10-01', '2026-06-15', 'EN_PAUSA', 8),
  (24, 'Plataforma de Leasing Operativo & Cotización Vehicular', 'Renting Colombia', 'Portal transaccional para simulación de cánones de arrendamiento de vehículos corporativos y aprobación de créditos.', 98000.00, '2026-02-15', '2026-11-30', 'ACTIVO', 2),
  (25, 'Sistema de Gestión de Recargas & Tarjeta Inteligente MIO', 'MetroCali S.A.', 'Plataforma de recarga en línea de tarjetas de transporte con integración de validadores sin contacto en estaciones.', 60000.00, '2024-06-01', '2025-03-31', 'FINALIZADO', 5),
  (26, 'Microservicio de Almacenamiento S3 & Encriptación AES-256', 'Terpel S.A.', 'Servicio cloud para la carga segura de comprobantes de venta con cifrado asimétrico en reposo y rotación de claves.', 22000.00, '2026-05-10', '2026-09-30', 'ACTIVO', 8),
  (27, 'Portal de Gestión Catastral & Mapeo GIS', 'IGAC - Instituto Geográfico Agustín Codazzi', 'Sistema de información geográfica para consulta de predios urbanos, capas de mapas vectoriales y trámites de avalúo.', 160000.00, '2026-01-20', '2026-12-15', 'ACTIVO', 5),
  (28, 'App Móvil de Lealtad & Puntos Redimibles', 'Puntos Colombia', 'Billetera de recompensas con acumulación por compras en comercios aliados y catálogo interactivo de redención.', 54000.00, '2024-07-01', '2025-02-28', 'FINALIZADO', 2),
  (29, 'Plataforma de Reservas Hoteleras & Tarifa Dinámica', 'Decameron All-Inclusive Hotels', 'Motor de reservas de alojamiento con motor de precios dinámicos basado en ocupación y pasarela de pago segura.', 88000.00, '2025-11-01', '2026-08-31', 'EN_PAUSA', 8),
  (30, 'Motor de Conciliación Bancaria & Archivos NACHA', 'Scotiabank Colpatria', 'Sistema de procesamiento asíncrono para emparejamiento de extractos de cuentas y lotes de transferencias masivas.', 115000.00, '2026-03-01', '2026-12-10', 'ACTIVO', 5),
  (31, 'Sistema de Telemetría Agrícola & Monitoreo de Suelos', 'Manuelita S.A.', 'Plataforma IoT para lectura de sensores de humedad en cultivos de caña de azúcar con alertas de riego automatizado.', 70000.00, '2024-04-01', '2025-01-15', 'FINALIZADO', 2),
  (32, 'API Gateway de Integración Open Banking PSD2', 'Banco de Bogotá', 'Pasarela de interoperabilidad para exposición segura de APIs bancarias a terceros bajo la directiva de banca abierta.', 190000.00, '2026-02-01', '2026-11-30', 'ACTIVO', 5),
  (33, 'Microservicio de Conversión de Monedas & Crypto Feeds', 'Bitso LatAm', 'Servicio REST de altísima frecuencia para consulta de tipos de cambio internacionales y actualización de tasas en tiempo real.', 18000.00, '2024-10-01', '2025-03-15', 'FINALIZADO', 8),
  (34, 'Portal de Gestión de Pólizas & Siniestros Automotrices', 'Sura Seguros', 'Plataforma de atención de siniestros de vehículos con radicación de fotografías, peritaje digital y liquidación de indemnizaciones.', 105000.00, '2026-03-15', '2026-12-15', 'ACTIVO', 2),
  (35, 'Sistema de Calibración & Monitoreo de Servidores Bare-Metal', 'Equinix Data Center LatAm', 'Dashboard de supervisión de temperatura, consumo energético y estado de hardware en centros de cómputo de alta densidad.', 30000.00, '2025-12-01', '2026-08-30', 'EN_PAUSA', 8)
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
  (1, 6, 12), (1, 9, 12), (1, 11, 12), (1, 3, 12), (1, 15, 12), 
  (2, 6, 12), (2, 9, 12), (2, 4, 12), (2, 12, 12), (2, 13, 12), 
  (3, 10, 12), (3, 11, 12), (3, 15, 12), (3, 16, 12),
  (4, 10, 12), (4, 12, 12), (4, 13, 12), (4, 4, 12), (4, 15, 12), 
  (5, 9, 8), (5, 17, 8), (5, 18, 8), (5, 19, 8), (5, 20, 8),
  (6, 21, 15), (6, 25, 15), (6, 31, 15), (6, 36, 15),
  (7, 24, 10), (7, 26, 10), (7, 30, 10), (7, 42, 10),
  (8, 22, 15), (8, 32, 15), (8, 44, 15),
  (9, 15, 12), (9, 21, 12), (9, 37, 12),
  (10, 28, 20), (10, 33, 20), (10, 38, 20), (10, 40, 20),
  (11, 16, 10), (11, 27, 10), (11, 41, 10),
  (12, 35, 12), (12, 39, 12), (12, 43, 12), (12, 44, 12),
  (13, 34, 15), (13, 36, 15), (13, 37, 15), (13, 45, 15),
  (14, 18, 12), (14, 20, 12), (14, 26, 12),
  (15, 23, 15), (15, 28, 15), (15, 33, 15),
  (16, 21, 10), (16, 25, 10), (16, 31, 10),
  (17, 34, 15), (17, 36, 15), (17, 45, 15),
  (18, 16, 12), (18, 27, 12), (18, 41, 12),
  (19, 38, 15), (19, 40, 15), (19, 43, 15),
  (20, 18, 10), (20, 20, 10), (20, 26, 10),
  (21, 22, 12), (21, 32, 12), (21, 44, 12),
  (22, 15, 10), (22, 37, 10), (22, 42, 10),
  (23, 24, 10), (23, 30, 10), (23, 39, 10),
  (24, 6, 15), (24, 9, 15), (24, 11, 15),
  (25, 10, 12), (25, 12, 12), (25, 13, 12),
  (26, 3, 10), (26, 4, 10), (26, 17, 10),
  (27, 19, 15), (27, 28, 15), (27, 33, 15),
  (28, 21, 12), (28, 25, 12), (28, 31, 12),
  (29, 22, 10), (29, 32, 10), (29, 44, 10),
  (30, 35, 15), (30, 38, 15), (30, 40, 15),
  (31, 15, 10), (31, 18, 10), (31, 20, 10),
  (32, 34, 20), (32, 36, 20), (32, 45, 20),
  (33, 26, 10), (33, 27, 10), (33, 41, 10),
  (34, 6, 15), (34, 11, 15), (34, 37, 15),
  (35, 24, 10), (35, 30, 10), (35, 42, 10);

-- 3.4 ETAPAS WBS
DELETE FROM etapa;
INSERT INTO etapa (id_etapa, proyecto_id, nombre_etapa, estado)
VALUES 
  -- Proyecto 1 (Facturación Cloud)
  (101, 1, 'Fase 1: Especificación y Arquitectura N-Capas', 'FINALIZADA'),
  (102, 1, 'Fase 2: Motor de Facturación y Cifrado DIAN', 'EN_PROGRESO'),
  (103, 1, 'Fase 3: Pipeline ETL ISO 8601 y Transmisión SFTP Brasil', 'EN_PROGRESO'),
  (104, 1, 'Fase 4: Pruebas de Estrés y Despliegue en Producción', 'PENDIENTE'),

  -- Proyecto 2 (Core Bancario)
  (201, 2, 'Fase 1: Modelado de Dominio y Transaccionalidad ACID', 'FINALIZADA'),
  (202, 2, 'Fase 2: Microservicios de Cuentas y Transferencias REST', 'EN_PROGRESO'),
  (203, 2, 'Fase 3: Semáforo Predictivo y Monitor de Contingencias', 'EN_PROGRESO'),
  (204, 2, 'Fase 4: Certificación de Seguridad PCI-DSS y Penetration Testing', 'PENDIENTE'),

  -- Proyecto 3 (App Móvil Fintech)
  (301, 3, 'Fase 1: Wireframes y Sistema de Diseño en React Native', 'FINALIZADA'),
  (302, 3, 'Fase 2: Integración de Pagos QR y Webhooks Bancarios', 'EN_PROGRESO'),
  (303, 3, 'Fase 3: Módulo de Inyección de Snippets y Optimización', 'EN_PROGRESO'),

  -- Proyecto 4 (Telemedicina)
  (401, 4, 'Fase 1: Diseño de Protocolos de Historia Clínica y Criptografía', 'FINALIZADA'),
  (402, 4, 'Fase 2: Módulo WebRTC y Sala de Consulta Virtual', 'EN_PROGRESO'),
  (403, 4, 'Fase 3: Triaje Asistido y Portal de Pacientes', 'PENDIENTE'),

  -- Proyecto 5 (Migración ERP)
  (501, 5, 'Fase 1: Extracción de Schemas Legados y Sanitización', 'FINALIZADA'),
  (502, 5, 'Fase 2: Carga en Data Warehouse PostgreSQL y Validación', 'FINALIZADA'),

  -- Proyecto 6 (E-Commerce - FINALIZADO)
  (601, 6, 'Fase 1: Arquitectura de Catálogo & Microservicios React/Spring', 'FINALIZADA'),
  (602, 6, 'Fase 2: Pasarela Multi-Moneda & Cifrado PCI-DSS', 'FINALIZADA'),
  (603, 6, 'Fase 3: Pruebas Globales de Carga & Liberación', 'FINALIZADA'),

  -- Proyecto 7 (Logística IoT - EN_PAUSA)
  (701, 7, 'Fase 1: Ingesta de Telemetría GPS en Tiempo Real', 'FINALIZADA'),
  (702, 7, 'Fase 2: Motor de Geocercas & Alertas de Ruta', 'EN_PROGRESO'),
  (703, 7, 'Fase 3: Dashboard de Control de Flotas & Analítica', 'PENDIENTE'),

  -- Proyecto 8 (OAuth2 SSO - ACTIVO)
  (801, 8, 'Fase 1: Servidor de Autorización Spring Security OAuth2/OIDC', 'EN_PROGRESO'),
  (802, 8, 'Fase 2: Integración MFA & Tokens JWT Encriptados', 'PENDIENTE'),

  -- Proyecto 9 (App Hospitalaria - FINALIZADO)
  (901, 9, 'Fase 1: Portal de Citas Médicas & Prescripción Digital', 'FINALIZADA'),
  (902, 9, 'Fase 2: App Móvil Flutter & Generación de QR Medico', 'FINALIZADA'),

  -- Proyecto 10 (IA Credit Scoring - ACTIVO)
  (1001, 10, 'Fase 1: Pipeline de Ingesta Masiva Spark & Feature Store', 'FINALIZADA'),
  (1002, 10, 'Fase 2: Inferencia de Modelos ML via gRPC en C++', 'EN_PROGRESO'),
  (1003, 10, 'Fase 3: API Gateway & Integración en Canal Transaccional', 'PENDIENTE'),

  -- Proyecto 11 (CRM Interno - EN_PAUSA)
  (1101, 11, 'Fase 1: Tablero Kanban & Módulo de Tickets Web', 'FINALIZADA'),
  (1102, 11, 'Fase 2: Automatización de Notificaciones por Email & Slack', 'EN_PROGRESO'),

  -- Proyecto 12 (Auditoría ISO 27001 - ACTIVO)
  (1201, 12, 'Fase 1: Registro Criptográfico de Auditoría Inmutable', 'FINALIZADA'),
  (1202, 12, 'Fase 2: Escaneo Continuo de Vulnerabilidades OWASP', 'EN_PROGRESO'),
  (1203, 12, 'Fase 3: Generador de Reportes Ejecutivos CMMI-5', 'PENDIENTE'),

  -- Proyecto 13 (DIAN v3.0 Enterprise - ACTIVO)
  (1301, 13, 'Fase 1: Motor XML UBL 2.1 & Cifrado Asimétrico RSA', 'FINALIZADA'),
  (1302, 13, 'Fase 2: Transmisión Masiva en Lote & Webhooks DIAN', 'EN_PROGRESO'),
  (1303, 13, 'Fase 3: Portal de Recepción Proveedores & Validación', 'PENDIENTE'),

  -- Proyecto 14 (Redis Distribuido - FINALIZADO)
  (1401, 14, 'Fase 1: Despliegue de Cluster Redis Sentinel & Sharding', 'FINALIZADA'),
  (1402, 14, 'Fase 2: Pruebas de Estrés en Eventos HotSale & Tuning SQL', 'FINALIZADA'),

  -- Proyectos 15 al 35
  (1501, 15, 'Fase 1: Ingesta de Logs de Transacciones Fraudulentas', 'FINALIZADA'),
  (1502, 15, 'Fase 2: Inferencia de Modelos ML & Alertas en Tiempo Real', 'EN_PROGRESO'),
  (1601, 16, 'Fase 1: Infraestructura de Claves Públicas (PKI)', 'FINALIZADA'),
  (1602, 16, 'Fase 2: Portal de Validación de Certificados PDF', 'FINALIZADA'),
  (1701, 17, 'Fase 1: Registro de Contratistas & Verificación RUES', 'FINALIZADA'),
  (1702, 17, 'Fase 2: Módulo de Licitaciones & Recepción de Pliegos', 'EN_PROGRESO'),
  (1801, 18, 'Fase 1: Geolocalización & Rastreio de Repartidores', 'FINALIZADA'),
  (1802, 18, 'Fase 2: Motor de Asignación de Pedidos en Tiempo Real', 'EN_PROGRESO'),
  (1901, 19, 'Fase 1: Clúster de Streaming WebRTC de Baja Latencia', 'FINALIZADA'),
  (1902, 19, 'Fase 2: Chat Interactivo & Moderación de Comentarios', 'EN_PROGRESO'),
  (2001, 20, 'Fase 1: Ingesta de Lectores RFID en Almacén Central', 'FINALIZADA'),
  (2002, 20, 'Fase 2: Conciliación de Existencias & Alertas de Stock', 'FINALIZADA'),
  (2101, 21, 'Fase 1: Servidor OTP & Integración WhatsApp API', 'FINALIZADA'),
  (2102, 21, 'Fase 2: Monitor de Entregabilidad de Mensajes SMS', 'EN_PROGRESO'),
  (2201, 22, 'Fase 1: Módulo de Registro de Calificaciones Digitales', 'FINALIZADA'),
  (2202, 22, 'Fase 2: Generación de Certificados Académicos QR', 'FINALIZADA'),
  (2301, 23, 'Fase 1: Indexador de Artículos en Clúster Elasticsearch', 'FINALIZADA'),
  (2302, 23, 'Fase 2: Motor de Búsqueda Semántica debounced', 'EN_PROGRESO'),
  (2401, 24, 'Fase 1: Cotizador de Cánones de Arrendamiento Vehicular', 'FINALIZADA'),
  (2402, 24, 'Fase 2: Evaluación de Riesgo de Crédito Automotriz', 'EN_PROGRESO'),
  (2501, 25, 'Fase 1: Integración con Pasarela de Recarga MIO', 'FINALIZADA'),
  (2502, 25, 'Fase 2: Pruebas de Lectura NFC sin Contacto', 'FINALIZADA'),
  (2601, 26, 'Fase 1: Bucket S3 Cifrado con Claves KMS AWS', 'FINALIZADA'),
  (2602, 26, 'Fase 2: Pipeline de Carga Masiva de Facturas Terpel', 'EN_PROGRESO'),
  (2701, 27, 'Fase 1: Digitalización de Capas de Mapas Vectoriales GIS', 'FINALIZADA'),
  (2702, 27, 'Fase 2: Portal de Trámites de Avalúo Catastral', 'EN_PROGRESO'),
  (2801, 28, 'Fase 1: Motor de Puntos & Reglas de Acumulación', 'FINALIZADA'),
  (2802, 28, 'Fase 2: Catálogo Móvil de Redención de Incentivos', 'FINALIZADA'),
  (2901, 29, 'Fase 1: Motor de Tarifas Dinámicas por Temporada', 'FINALIZADA'),
  (2902, 29, 'Fase 2: Pasarela de Reserva de Habitaciones Hoteleras', 'EN_PROGRESO'),
  (3001, 30, 'Fase 1: Parser de Archivos Planos Bancarios NACHA ACH', 'FINALIZADA'),
  (3002, 30, 'Fase 2: Motor de Conciliación Automática en Lote', 'EN_PROGRESO'),
  (3101, 31, 'Fase 1: Ingesta de Sensores de Humedad de Suelo IoT', 'FINALIZADA'),
  (3102, 31, 'Fase 2: Dashboard de Control de Riego Automatizado', 'FINALIZADA'),
  (3201, 32, 'Fase 1: Portal de Desarrolladores PSD2 & OAuth2 Scopes', 'FINALIZADA'),
  (3202, 32, 'Fase 2: Endpoints de Consulta de Saldos Open Banking', 'EN_PROGRESO'),
  (3301, 33, 'Fase 1: Ingesta de Tasa de Cambio Spot en Tiempo Real', 'FINALIZADA'),
  (3302, 33, 'Fase 2: API REST de Alta Frecuencia Crypto Feeds', 'FINALIZADA'),
  (3401, 34, 'Fase 1: Radicación Digital de Fotografías de Siniestros', 'FINALIZADA'),
  (3402, 34, 'Fase 2: Módulo de Peritaje & Liquidación de Indemnización', 'EN_PROGRESO'),
  (3501, 35, 'Fase 1: Monitor de Sensores de Temperatura Data Center', 'FINALIZADA'),
  (3502, 35, 'Fase 2: Alertas de Eficiencia Energética PUE en Tiempo Real', 'EN_PROGRESO')
ON CONFLICT (id_etapa) DO UPDATE SET
  proyecto_id = EXCLUDED.proyecto_id,
  nombre_etapa = EXCLUDED.nombre_etapa,
  estado = EXCLUDED.estado;

SELECT setval('etapa_id_etapa_seq', 5000);

-- 3.5 ACTIVIDADES WBS
DELETE FROM actividad;
INSERT INTO actividad (id_actividad, etapa_id, desarrollador_id, descripcion, estado)
VALUES
  -- Asignaciones para Ana Gómez (id: 6) - Carga de trabajo intensa -> CRÍTICA (🔴)
  (1001, 102, 6, 'Implementar firma digital XAdES con certificado corporativo RSA 2048-bit', 'EN_PROGRESO'),
  (1002, 102, 6, 'Construir generador de código QR fiscal para representación gráfica de factura', 'EN_PROGRESO'),
  (1003, 103, 6, 'Diseñar parser de exportación plana delimitada bajo norma internacional ISO 8601 UTC', 'EN_PROGRESO'),
  (1004, 202, 6, 'Refactorizar servicio de conciliación con aislamiento de transacciones REQUIRES_NEW', 'EN_PROGRESO'),
  (1005, 302, 6, 'Desarrollar consumidor Kafka para procesamiento asíncrono de eventos de pago QR', 'EN_PROGRESO'),
  (1006, 101, 6, 'Documentar contratos OpenAPI 3.0 para la API pública de facturación', 'FINALIZADA'),
  (1007, 201, 6, 'Crear entidades JPA para auditoría inmutable de transacciones financieras', 'FINALIZADA'),
  (1008, 104, 6, 'Ejecutar pruebas de carga con k6 simulando 1,500 peticiones concurrentes por segundo', 'PENDIENTE'),

  -- Asignaciones para David Valenzuela (id: 9) - Backend & Infra -> ALTA (🟠)
  (2001, 102, 9, 'Optimizar consultas de cálculo de impuestos en lote con Native Queries y CTEs', 'EN_PROGRESO'),
  (2002, 202, 9, 'Implementar mecanismo de Circuit Breaker con Resilience4j en pasarela de pagos', 'EN_PROGRESO'),
  (2003, 203, 9, 'Construir repository nativo para analítica de capacidad con Window Functions en PostgreSQL', 'EN_PROGRESO'),
  (2004, 501, 9, 'Desarrollar scripts de migración Flyway para compatibilidad con PostgreSQL 16', 'FINALIZADA'),
  (2005, 201, 9, 'Configurar pool HikariCP con detección de leaks a 20 segundos y métricas Micrometer', 'FINALIZADA'),
  (2006, 204, 9, 'Auditar algoritmos de encriptación de tarjetas de crédito cumpliendo norma PCI-DSS', 'PENDIENTE'),

  -- Asignaciones para Marta López (id: 4) - Backend & Servicios -> MEDIA (🟡)
  (2007, 202, 4, 'Construir endpoint de consulta de saldos con validación de tokens JWT', 'EN_PROGRESO'),
  (2008, 203, 4, 'Diseñar interceptores de auditoría para registro de peticiones HTTP en tiempo real', 'EN_PROGRESO'),
  (2009, 402, 4, 'Configurar endpoints de señalización WebRTC para videoconsultas médicas', 'FINALIZADA'),

  -- Asignaciones para Mateo Restrepo (id: 11) - Datos & ETL -> MEDIA (🟡)
  (4001, 103, 11, 'Configurar cliente SFTP con canal SSH2 cifrado y validación de Checksum MD5', 'EN_PROGRESO'),
  (4002, 103, 11, 'Automatizar tarea programada @Scheduled para generación nocturna de lotes ETL', 'EN_PROGRESO'),
  (4003, 502, 11, 'Ejecutar reconciliación de 2.4 millones de registros históricos en Data Warehouse', 'FINALIZADA'),
  (4004, 302, 11, 'Construir vistas materializadas en PostgreSQL para reportes financieros instantáneos', 'EN_PROGRESO'),
  (4005, 101, 11, 'Diseñar especificación de formato plano de 14 columnas para la alianza estratégica Brasil', 'FINALIZADA'),

  -- Asignaciones para Lucía Morales (id: 10) - Frontend & UI/UX -> BAJA / ESTABLE (🟢)
  (3001, 301, 10, 'Crear sistema de diseño monocromático con soporte dinámico de modo Claro/Oscuro', 'FINALIZADA'),
  (3002, 302, 10, 'Construir componente interactivo de escáner QR con retroalimentación háptica', 'EN_PROGRESO'),
  (3003, 303, 10, 'Implementar motor de inyección de Micro-Snippets con búsqueda debounced en React', 'FINALIZADA'),
  (3004, 402, 10, 'Desarrollar interfaz de videollamada WebRTC con controles flotantes en Tailwind CSS', 'FINALIZADA'),
  (3005, 401, 10, 'Diseñar prototipos de alta fidelidad para el módulo de prescripción médica digital', 'FINALIZADA'),
  (3006, 403, 10, 'Integrar animaciones con Framer Motion para transiciones suaves de triaje médico', 'PENDIENTE'),

  -- Asignaciones para Javier Arboleda (id: 13) - DevOps & Cloud -> BAJA / ESTABLE (🟢)
  (6001, 204, 13, 'Configurar pipeline de CI/CD en GitHub Actions con compilación Maven y pruebas Vite', 'EN_PROGRESO'),
  (6002, 402, 13, 'Desplegar servidor de señalización WebRTC en clúster Kubernetes con autoescalado', 'FINALIZADA'),
  (6003, 101, 13, 'Construir imágenes Docker multi-stage optimizadas para frontend y backend', 'FINALIZADA'),
  (6004, 204, 13, 'Configurar monitoreo de métricas JVM con Prometheus y tableros en Grafana', 'PENDIENTE'),

  -- Asignaciones para Sofía Benítez (id: 12) - QA & Ciberseguridad -> BAJA / ESTABLE (🟢)
  (5001, 204, 12, 'Ejecutar escaneo de vulnerabilidades con OWASP ZAP sobre endpoints de autenticación', 'EN_PROGRESO'),
  (5002, 203, 12, 'Automatizar suite de pruebas de integración para el Semáforo Inteligente de Riesgos', 'EN_PROGRESO'),
  (5003, 401, 12, 'Verificar cumplimiento de estándares HIPAA en el almacenamiento de datos clínicos', 'FINALIZADA'),
  (5004, 201, 12, 'Implementar pruebas unitarias con JUnit 5 y Mockito alcanzando 88% de cobertura', 'FINALIZADA'),

  -- Asignaciones para Luis Pérez (id: 3) - Contratista React -> BAJA / ESTABLE (🟢)
  (7001, 102, 3, 'Implementar componentes visuales para previsualización de facturas electrónicas en PDF', 'EN_PROGRESO'),

  -- Asignaciones para Diego Torres (id: 15) - Frontend & Mobile Lead -> ACTIVO (🔵)
  (1009, 102, 15, 'Construir interfaz reactiva para el visor de facturas y certificados XAdES', 'EN_PROGRESO'),
  (1010, 101, 15, 'Diseño de componentes UI y prototipo de consola web de facturación', 'FINALIZADA'),
  (3007, 301, 15, 'Maquetación de pantallas principales del dashboard móvil y flujo de transferencias', 'FINALIZADA'),
  (3008, 302, 15, 'Integración de animaciones de confirmación de pago y micro-interacciones hápticas', 'EN_PROGRESO'),
  (3009, 303, 15, 'Desarrollo del componente de previsualización y copiado rápido de código snippet', 'PENDIENTE'),
  (4006, 402, 15, 'Implementar controles de audio/video y chat interactivo en sala de telemedicina', 'EN_PROGRESO'),

  -- Asignaciones para Proyecto 6 (E-Commerce - FINALIZADO)
  (6011, 601, 21, 'Diseñar componentes de carrito de compras responsivo en React.js', 'FINALIZADA'),
  (6012, 601, 25, 'Construir servicio REST de catálogo distribuido con cache Redis', 'FINALIZADA'),
  (6013, 602, 31, 'Integrar SDK de tokenización de tarjetas con certificación PCI-DSS', 'FINALIZADA'),
  (6014, 603, 36, 'Ejecutar pruebas de estrés con 5,000 usuarios simulados en checkout', 'FINALIZADA'),

  -- Asignaciones para Proyecto 7 (Logística IoT - EN_PAUSA)
  (7011, 701, 24, 'Construir adaptador MQTT / WebSocket para recibir coordenadas GPS de vehículos', 'FINALIZADA'),
  (7012, 702, 26, 'Desarrollar algoritmo de cálculo de geocercas polinomiales para alertas de ruta', 'EN_PROGRESO'),
  (7013, 702, 30, 'Configurar alertas automáticas en mapa con mapas vectoriales Mapbox', 'EN_PROGRESO'),
  (7014, 703, 42, 'Crear consultas optimizadas en PostgreSQL para histórico de rutas semanales', 'PENDIENTE'),

  -- Asignaciones para Proyecto 8 (OAuth2 SSO - ACTIVO)
  (8011, 801, 22, 'Implementar servidor de autorización Spring Authorization Server con OAuth2 OIDC', 'EN_PROGRESO'),
  (8012, 801, 32, 'Configurar proveedor de identidad JWT con firma asimétrica RS256', 'EN_PROGRESO'),
  (8013, 802, 44, 'Integrar módulo MFA con códigos de autenticación TOTP (Google Authenticator)', 'PENDIENTE'),

  -- Asignaciones para Proyecto 9 (App Hospitalaria - FINALIZADO)
  (9011, 901, 15, 'Maquetar interfaz de agenda de citas médicas con selección de especialistas', 'FINALIZADA'),
  (9012, 901, 21, 'Construir generador de recetas encriptadas con código de validación QR', 'FINALIZADA'),
  (9013, 902, 37, 'Integrar módulo de escaneo de QR médico en aplicación móvil Flutter', 'FINALIZADA'),

  -- Asignaciones para Proyecto 10 (IA Credit Scoring - ACTIVO)
  (10011, 1001, 28, 'Desarrollar pipeline en Apache Spark para consolidación de historial de crédito', 'FINALIZADA'),
  (10012, 1002, 33, 'Construir cliente gRPC en Java 17 para comunicación de baja latencia con modelo ML', 'EN_PROGRESO'),
  (10013, 1002, 38, 'Optimizar motor de inferencia C++ para responder solicitudes en menos de 50ms', 'EN_PROGRESO'),
  (10014, 1003, 40, 'Configurar API Gateway en Nginx con reglas de rate-limiting por cliente bancario', 'PENDIENTE'),

  -- Asignaciones para Proyecto 11 (CRM Interno - EN_PAUSA)
  (11011, 1101, 16, 'Crear tablero Kanban interactivo drag-and-drop con HTML5 Drag and Drop API', 'FINALIZADA'),
  (11012, 1102, 27, 'Diseñar plantillas de correo corporativas responsivas para notificaciones de ticket', 'EN_PROGRESO'),
  (11013, 1102, 41, 'Integrar webhooks de Slack para alertas de incidencias de soporte urgente', 'EN_PROGRESO'),

  -- Asignaciones para Proyecto 12 (Auditoría ISO 27001 - ACTIVO)
  (12011, 1201, 35, 'Implementar log de auditoría con tablas hash encadenadas (Blockchain-like SQL)', 'FINALIZADA'),
  (12012, 1202, 39, 'Automatizar pruebas de seguridad dinámicas DAST con OWASP ZAP CLI en CI/CD', 'EN_PROGRESO'),
  (12013, 1202, 43, 'Construir servicio REST de alerta de anomalías en accesos administrativos', 'EN_PROGRESO'),
  (12014, 1203, 44, 'Diseñar generador de reportes de cumplimiento normativo ISO 27001 en PDF', 'PENDIENTE'),

  -- Asignaciones para Proyecto 13 (DIAN v3.0 Enterprise - ACTIVO)
  (13011, 1301, 34, 'Implementar serializador XML UBL 2.1 con validación de esquemas XSD oficiales', 'FINALIZADA'),
  (13021, 1302, 36, 'Construir cliente SOAP/REST para transmisión masiva de lotes a servidores DIAN', 'EN_PROGRESO'),
  (13022, 1302, 37, 'Desarrollar componentes UI para monitor de estado de documentos electrónicos', 'EN_PROGRESO'),
  (13031, 1303, 45, 'Diseñar portal de recepción y recepción de facturas de proveedores externos', 'PENDIENTE'),

  -- Asignaciones para Proyecto 14 (Redis Distribuido - FINALIZADO)
  (14011, 1401, 18, 'Configurar clúster Redis Sentinel con failover automático y 3 nodos de réplica', 'FINALIZADA'),
  (14012, 1401, 20, 'Automatizar scripts de Terraform para aprovisionamiento de infraestructura cloud', 'FINALIZADA'),
  (14013, 1402, 26, 'Ejecutar pruebas de resistencia con k6 simulando 10,000 sesiones concurrentes', 'FINALIZADA')
ON CONFLICT (id_actividad) DO UPDATE SET
  etapa_id = EXCLUDED.etapa_id,
  desarrollador_id = EXCLUDED.desarrollador_id,
  descripcion = EXCLUDED.descripcion,
  estado = EXCLUDED.estado;

SELECT setval('actividad_id_actividad_seq', 20000);

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

-- 3.7 SOLICITUDES DE CONTACTO EMPRESARIALES (Consola del Coordinador)
DELETE FROM solicitud_contacto;

INSERT INTO solicitud_contacto (id_solicitud, nombre_remitente, email_remitente, telefono, asunto, mensaje, fecha_envio, atendido, estado, notas_atencion, fecha_atencion, motivo_reapertura, fecha_reapertura, contador_reaperturas, historial_atencion, coordinador_id)
VALUES 
  (1, 'Banco Internacional de Comercio', 'sistemas@bancomercio.com', '+57 310 987 6543', 'Consultoría en Migración a Microservicios', 'Requerimos modernizar nuestro sistema transaccional con arquitectura Java Spring Boot y soporte de alta concurrencia.', NOW() - INTERVAL '2 days', false, 'PENDIENTE', NULL, NULL, NULL, NULL, 0, NULL, NULL),
  (2, 'Hospital Metropolitano', 'director.ti@hospmetropolitano.org', '+57 315 456 7890', 'Plataforma de Telemedicina y Recetas Digitales', 'Interesados en implementar su solución de triaje inteligente y consultas WebRTC encriptadas.', NOW() - INTERVAL '4 days', false, 'PENDIENTE', NULL, NULL, NULL, NULL, 0, NULL, NULL),
  (3, 'Fintech CrediYa Brasil', 'contato@crediya.com.br', '+55 11 98765 4321', 'Integración de Lotes ETL y Pagos QR', 'Solicitamos reunión técnica para sincronizar métricas operacionales bajo estándar ISO 8601.', NOW() - INTERVAL '6 days', false, 'PENDIENTE', NULL, NULL, NULL, NULL, 0, NULL, NULL),
  (4, 'Logística Andina S.A.S.', 'gerencia@logisticaandina.co', '+57 320 123 4567', 'Facturación Electrónica Masiva', 'Buscamos integrar su motor de facturación con certificado digital para 50,000 documentos mensuales.', NOW() - INTERVAL '8 days', false, 'PENDIENTE', NULL, NULL, NULL, NULL, 0, NULL, NULL),
  (5, 'Universidad Central', 'vicerrectoria@unicentral.edu.co', '+57 300 890 1234', 'Portal Académico y Gestión WBS', 'Queremos evaluar la plataforma IKernell para seguimiento de proyectos de grado e investigación.', NOW() - INTERVAL '10 days', false, 'PENDIENTE', NULL, NULL, NULL, NULL, 0, NULL, NULL),
  (6, 'Constructora Urbano S.A.', 'contacto@urbanosa.com', '+57 312 444 5566', 'Cotización de Sistema ERP para Obras', 'Necesitamos un software personalizado para control de presupuestos y materiales en obra.', NOW() - INTERVAL '1 day', false, 'EN_PROCESO', 'Caso tomado por Carlos Gómez. Se realizó reunión exploratoria previa. En elaboración de propuesta técnica con arquitectura Java 17.', NOW() - INTERVAL '12 hours', NULL, NULL, 0, '[Ayer] En revisión técnica por Carlos Gómez (Coordinador General)', 1),
  (7, 'Aseguradora del Pacífico', 'ti@aseguradorapacifico.pe', '+51 1 456 7890', 'Auditoría CMMI & Pentesting de Seguridad', 'Requerimos una revisión de vulnerabilidades OWASP y análisis de cumplimiento ISO 27001 para nuestra app móvil.', NOW() - INTERVAL '3 days', false, 'EN_PROCESO', 'Caso asignado a Roberto Silva. Términos de referencia recibidos. Evaluación de alcance de pentesting en ejecución.', NOW() - INTERVAL '1 day', NULL, NULL, 0, '[Hace 3 días] Asignado a Roberto Silva (Director de Operaciones & Calidad)', 7),
  (8, 'Supermercados El Sol', 'operaciones@elsol.com.co', '+57 318 777 8899', 'Módulo POS Cloud y Sincronización PostgreSQL', 'Solicitamos cotizar la migración de 120 puntos de venta a una arquitectura centralizada basada en microservicios.', NOW() - INTERVAL '2 days', false, 'EN_PROCESO', 'Atendido por Ana Ríos. Plan de trabajo enviado a gerencia de operaciones para definición de presupuesto.', NOW() - INTERVAL '1 day', NULL, NULL, 0, '[Hace 2 días] Iniciado por Ana Ríos (Directora de Talento & Operaciones TI)', 14),
  (9, 'Transportes Vía Rápida', 'gerencia@viarapida.com.ec', '+593 2 345 6789', 'Sistema de Rastreio GPS & Desglose WBS', 'Requerimos integración de telemetría IoT con mapas vectoriales y alertas de mantenimiento preventivo.', NOW() - INTERVAL '5 days', true, 'ATENDIDA', 'Propuesta comercial aprobada y formalizada. Se procedió a crear el proyecto en el sistema y asignar al equipo de backend.', NOW() - INTERVAL '4 days', NULL, NULL, 0, '[Hace 5 días] ATENDIDA por Carlos Gómez (Coordinador General) | Propuesta firmada por cliente.', 1),
  (10, 'Laboratorios Farmacéuticos BioSalud', 'calidad@biosalud.com', '+57 311 222 3344', 'Firma Digital y Trazabilidad de Lotes', 'Buscamos un sistema de trazabilidad de lotes con firma criptográfica y exportación de reportes sanitarios.', NOW() - INTERVAL '7 days', true, 'ATENDIDA', 'Atención concluida. Documentación técnica de la API entregada al equipo de sistemas de BioSalud.', NOW() - INTERVAL '6 days', NULL, NULL, 0, '[Hace 7 días] ATENDIDA por Roberto Silva (Director de Operaciones & Calidad).', 7),
  (11, 'Grupo Educativo Futuro', 'sistemas@edufuturo.edu.co', '+57 301 555 6677', 'Plataforma Virtual de Aprendizaje & Exámenes', 'Requerimos soporte para 10,000 usuarios concurrentes con evaluación en tiempo real.', NOW() - INTERVAL '9 days', true, 'ATENDIDA', 'Cotización aprobada. Asignado desarrollador frontend y líder de proyecto.', NOW() - INTERVAL '8 days', NULL, NULL, 0, '[Hace 9 días] ATENDIDA por Ana Ríos (Directora de Talento & Operaciones TI).', 14),
  (12, 'Inmobiliaria Siglo XXI', 'administracion@siglo21.com', '+57 314 888 9900', 'Portal de Arriendos & Pagos PSE', 'Integración con pasarela de pagos PSE y generación de recibos automáticos.', NOW() - INTERVAL '12 days', true, 'ATENDIDA', 'Caso atendido. Solución entregada en ambiente de pruebas staging.', NOW() - INTERVAL '11 days', NULL, NULL, 0, '[Hace 12 días] ATENDIDA por Carlos Gómez.', 1),
  (13, 'Financiera Colectiva', 'servicio@financieracolectiva.com', '+57 316 333 2211', 'Ampliación de Módulo de Scoring Crediticio', 'Solicitamos agregar un algoritmo predictivo de riesgo crediticio para clientes independientes.', NOW() - INTERVAL '6 days', false, 'REABIERTA', 'Cliente solicita extender el alcance de la integración con fuentes externas.', NOW() - INTERVAL '5 days', 'El cliente solicitó incluir soporte para consulta de datos en tiempo real mediante API externa. Reapertura #1.', NOW() - INTERVAL '1 day', 1, '[Hace 6 días] ATENDIDA por Roberto Silva\n[Hace 1 día] REABIERTA por Roberto Silva | Motivo: Ampliación de requerimientos de scoring crediticio.', 7),
  (14, 'Cadenas de RestoBar Gourmet', 'sistemas@restogourmet.com', '+57 317 999 0011', 'Sincronización de Inventarios en Tiempo Real', 'Deseamos integrar el inventario de 15 sedes con la cocina central.', NOW() - INTERVAL '10 days', false, 'REABIERTA', 'Cliente solicitó optimizar la latencia del webhook de pedidos.', NOW() - INTERVAL '8 days', 'Solicitud de ajuste en los tiempos de respuesta del Webhook de pedidos. Reapertura #1.', NOW() - INTERVAL '2 days', 1, '[Hace 10 días] ATENDIDA por Ana Ríos\n[Hace 2 días] REABIERTA por Ana Ríos | Motivo: Optimización de latencia en webhooks.', 14),
  (15, 'Plataforma Streaming Eventos', 'soporte@eventosstream.com', '+57 313 111 2233', 'Soporte Técnico de Alta Concurrencia', 'Requerimos acompañamiento DevOps para un evento en vivo de 50,000 personas.', NOW() - INTERVAL '4 days', false, 'REABIERTA', 'Caso reabierto para coordinación de pruebas de estrés en clúster AWS.', NOW() - INTERVAL '2 days', 'Ajuste de límites de infraestructura.', NOW() - INTERVAL '1 day', 2, '[Hace 4 días] Atendido inicialmente por Roberto Silva\n[Hace 1 día] REABIERTA para dirección de infraestructura por Carlos Gómez.', 1),
  (16, 'Inversiones Capital S.A.', 'sistemas@inversionescapital.com', '+57 310 111 2222', 'Dashboard Ejecutivo de Riesgos y Liquidez', 'Requerimos un panel analítico en tiempo real con métricas de liquidez y simulación de escenarios de mercado.', NOW() - INTERVAL '1 day', false, 'PENDIENTE', NULL, NULL, NULL, NULL, 0, NULL, NULL),
  (17, 'Cadena Hotelera Gran Caribe', 'gerencia@grancaribe.com', '+57 305 444 3322', 'Motor de Reservas Directas y Check-in QR', 'Interesados en implementar motor de reservas web con autocheck-in mediante lectura de documento y QR.', NOW() - INTERVAL '3 days', false, 'PENDIENTE', NULL, NULL, NULL, NULL, 0, NULL, NULL),
  (18, 'Distribuidora Nacional de Alimentos', 'operaciones@distalimentos.co', '+57 321 888 7766', 'Optimización de Rutas de Entrega IoT', 'Buscamos reducir tiempos de entrega con ruteo dinámico GPS para 80 vehículos de reparto.', NOW() - INTERVAL '2 days', false, 'EN_PROCESO', 'En evaluación de mapa vectorial e integración GPS por Carlos Gómez.', NOW() - INTERVAL '1 day', NULL, NULL, 0, '[Hace 2 días] Recibido y asignado a Carlos Gómez (Coordinador General)', 1),
  (19, 'Clínica San Rafael', 'sistemas@clinicasanrafael.org', '+57 316 222 1100', 'Historia Clínica Unificada y Firma Médica', 'Plataforma web para gestión de expedientes clínicos con certificado digital de médicos.', NOW() - INTERVAL '4 days', false, 'EN_PROCESO', 'Reunión de requerimientos normativos realizada por Roberto Silva.', NOW() - INTERVAL '2 days', NULL, NULL, 0, '[Hace 4 días] Tomado por Roberto Silva (Director de Operaciones)', 7),
  (20, 'Editorial Global Textos', 'contacto@editorialglobal.com', '+57 300 999 8877', 'Plataforma E-learning y Derechos Digitales DRM', 'Sistema de suscripción académica con visor PDF protegido contra descargas no autorizadas.', NOW() - INTERVAL '5 days', false, 'EN_PROCESO', 'Propuesta de arquitectura segura en preparación por Ana Ríos.', NOW() - INTERVAL '3 days', NULL, NULL, 0, '[Hace 5 días] Asignado a Ana Ríos (Directora de Talento)', 14),
  (21, 'Cooperativa Financiera del Norte', 'ti@coopnorte.com.co', '+57 313 555 4433', 'Core Transaccional en Caliente y Microservicios', 'Migración de la lógica contable a microservicios idempotentes con Java 17 y Spring Boot 3.', NOW() - INTERVAL '3 days', false, 'EN_PROCESO', 'Evaluación de capacidad y dimensionamiento de equipo a cargo de Carlos Gómez.', NOW() - INTERVAL '1 day', NULL, NULL, 0, '[Hace 3 días] En revisión por Carlos Gómez (Coordinador General)', 1),
  (22, 'Empresa de Envíos Express', 'operaciones@enviosexpress.com', '+57 319 666 5544', 'Rastreio de Paquetes en Tiempo Real', 'Portal público para clientes con notificación SMS/Email de entregas.', NOW() - INTERVAL '4 days', false, 'EN_PROCESO', 'Análisis de arquitectura de mensajería asíncrona por Roberto Silva.', NOW() - INTERVAL '2 days', NULL, NULL, 0, '[Hace 4 días] En progreso por Roberto Silva (Director de Operaciones)', 7),
  (23, 'Textilera Panamericana', 'gerencia@textilerapan.co', '+57 311 333 4455', 'Gestión de Producción e Inventario Textil', 'Control de lotes de materia prima y trazabilidad de ordenes de producción en planta.', NOW() - INTERVAL '11 days', true, 'ATENDIDA', 'Propuesta aprobada e inicio de desarrollo programado.', NOW() - INTERVAL '10 days', NULL, NULL, 0, '[Hace 11 días] ATENDIDA por Roberto Silva', 7),
  (24, 'Municipio de Medellín', 'gobierno@medellin.gov.co', '+57 300 123 9988', 'Portal de Trámites Digitales Ciudadanos', 'Automatización de expedición de paz y salvos con firma electrónica.', NOW() - INTERVAL '14 days', true, 'ATENDIDA', 'Convenio interinstitucional firmado y solución entregada.', NOW() - INTERVAL '13 days', NULL, NULL, 0, '[Hace 14 días] ATENDIDA por Ana Ríos', 14),
  (25, 'Automotriz del Ande', 'soporte@automotrizande.com', '+57 315 777 6655', 'Concesionario Virtual y Cotizador 3D', 'Herramienta interactiva para cotizar vehículos con planes de financiamiento.', NOW() - INTERVAL '8 days', false, 'REABIERTA', 'Cliente solicitó añadir módulo de simulación de crédito con bancos aliados.', NOW() - INTERVAL '7 days', 'Reapertura para adición de módulo bancario.', NOW() - INTERVAL '1 day', 1, '[Hace 8 días] ATENDIDA por Roberto Silva\n[Hace 1 día] REABIERTA por Roberto Silva', 7);

SELECT setval('solicitud_contacto_id_solicitud_seq', (SELECT MAX(id_solicitud) FROM solicitud_contacto));

-- 3.8 DOCUMENTOS BIBLIOTECA DUAL
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
