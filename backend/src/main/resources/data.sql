-- ==============================================================================
-- SCHEMA COMPLETO Y CONSOLIDADO DDL + DML - IKERNELL SOLUCIONES SOFTWARE
-- Versión: 4.3 Industrial Enterprise & Dual-Skill Leader Architecture
-- Contraseña Universal para todos los usuarios: 12345678Ik.
-- Hash BCrypt: $2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS
-- ==============================================================================

-- 1. LIMPIEZA TOTAL DE SCHEMA (WIPE OUT)
-- ==============================================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO abrah;
GRANT ALL ON SCHEMA public TO public;

-- 2. EXTENSIONES POSTGRESQL DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. DDL - TABLAS MAESTRAS DEL SISTEMA
-- ==============================================================================

-- 3.1 TABLA TRABAJADOR (Con soporte para Perfil Híbrido / Doble Habilidad de Líderes)
CREATE TABLE trabajador (
    id_trabajador BIGSERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    direccion VARCHAR(150),
    profesion VARCHAR(100),
    especialidad VARCHAR(100),
    habilidades_directivas TEXT,
    habilidades_tecnicas TEXT,
    tipo_trabajador VARCHAR(20) NOT NULL DEFAULT 'PLANTA',
    foto_url VARCHAR(500),
    email VARCHAR(100) UNIQUE NOT NULL,
    email_personal VARCHAR(100) UNIQUE,
    rol VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    primer_login BOOLEAN NOT NULL DEFAULT FALSE,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_trabajador_email ON trabajador(email);
CREATE INDEX idx_trabajador_rol_estado ON trabajador(rol, estado);
CREATE INDEX idx_trabajador_identificacion ON trabajador(identificacion);

-- 3.2 TABLA PROYECTO
CREATE TABLE proyecto (
    id_proyecto BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    cliente VARCHAR(150),
    descripcion TEXT,
    presupuesto NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    reasignado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_reasignacion TIMESTAMP,
    motivo_reasignacion TEXT,
    id_lider_anterior BIGINT,
    nombre_lider_anterior VARCHAR(150),
    leido_por_lider_anterior BOOLEAN NOT NULL DEFAULT FALSE,
    lider_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX idx_proyecto_lider ON proyecto(lider_id);
CREATE INDEX idx_proyecto_estado ON proyecto(estado);
CREATE INDEX idx_proyecto_nombre_gin ON proyecto USING gin (nombre gin_trgm_ops);

-- 3.3 TABLA PROYECTO_DESARROLLADOR (Pivote N:M con regla de doble rol para líderes y control 48h)
CREATE TABLE proyecto_desarrollador (
    id_asignacion BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    horas_semanales INT NOT NULL DEFAULT 40,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_proyecto_desarrollador UNIQUE (proyecto_id, desarrollador_id)
);

CREATE INDEX idx_pd_proyecto ON proyecto_desarrollador(proyecto_id);
CREATE INDEX idx_pd_desarrollador ON proyecto_desarrollador(desarrollador_id);

-- 3.4 TABLA ETAPA (Fases WBS)
CREATE TABLE etapa (
    id_etapa BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    nombre_etapa VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
);

CREATE INDEX idx_etapa_proyecto ON etapa(proyecto_id);
CREATE INDEX idx_etapa_estado ON etapa(estado);

-- 3.5 TABLA ACTIVIDAD (Tareas Granulares WBS)
CREATE TABLE actividad (
    id_actividad BIGSERIAL PRIMARY KEY,
    etapa_id BIGINT NOT NULL REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    desarrollador_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    descripcion TEXT NOT NULL,
    descripcion_detallada TEXT,
    cualidad_nombre VARCHAR(255),
    cualidad_tecnica VARCHAR(255),
    horas_semanales INT,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_actividad_etapa ON actividad(etapa_id);
CREATE INDEX idx_actividad_desarrollador ON actividad(desarrollador_id);
CREATE INDEX idx_actividad_estado ON actividad(estado);

-- 3.6 TABLA ERROR (Incidencias y Bugs - Semáforo de 3 Estados)
CREATE TABLE error (
    id_error BIGSERIAL PRIMARY KEY,
    etapa_id BIGINT NOT NULL REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    tipo_error VARCHAR(100) NOT NULL,
    severidad VARCHAR(20) NOT NULL, -- 'BAJA', 'MEDIA', 'CRITICA' (Estricto 3 Estados)
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT NOT NULL,
    estado_atencion VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO',
    resolucion_nota TEXT,
    fecha_resolucion TIMESTAMP
);

CREATE INDEX idx_error_etapa ON error(etapa_id);
CREATE INDEX idx_error_desarrollador ON error(desarrollador_id);
CREATE INDEX idx_error_severidad ON error(severidad);

-- 3.7 TABLA INTERRUPCION (Contingencias y Paradas)
CREATE TABLE interrupcion (
    id_interrupcion BIGSERIAL PRIMARY KEY,
    etapa_id BIGINT NOT NULL REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    tipo_interrupcion VARCHAR(100) NOT NULL,
    duracion_minutos INT NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_ocurrencia TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    comentarios TEXT,
    impacto_operativo VARCHAR(20) NOT NULL DEFAULT 'MODERADO',
    estado_atencion VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO',
    resolucion_nota TEXT,
    fecha_resolucion TIMESTAMP
);

CREATE INDEX idx_interrupcion_etapa ON interrupcion(etapa_id);
CREATE INDEX idx_interrupcion_desarrollador ON interrupcion(desarrollador_id);

-- 3.8 TABLA HISTORIAL_CAMBIOS (Auditoría CMMI 3)
CREATE TABLE historial_cambios (
    id_cambio BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    tipo_accion VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    usuario_responsable VARCHAR(100) NOT NULL,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historial_proyecto ON historial_cambios(proyecto_id);

-- 3.9 TABLA SOLICITUD_SOPORTE
CREATE TABLE solicitud_soporte (
    id_solicitud BIGSERIAL PRIMARY KEY,
    trabajador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    tipo_solicitud VARCHAR(50) NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas_atencion TEXT
);

CREATE INDEX idx_solicitud_trabajador ON solicitud_soporte(trabajador_id);

-- 3.10 TABLA CONSECUTIVO_PROYECTOS
CREATE TABLE consecutivo_proyectos (
    id BIGSERIAL PRIMARY KEY,
    ultimo_numero INT NOT NULL DEFAULT 0
);

-- 3.11 TABLA SOLICITUD_CONTACTO (Bandeja de Leads y Contacto Web)
CREATE TABLE solicitud_contacto (
    id_solicitud BIGSERIAL PRIMARY KEY,
    nombre_remitente VARCHAR(150) NOT NULL,
    email_remitente VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    asunto VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atendido BOOLEAN DEFAULT FALSE NOT NULL,
    estado VARCHAR(30) DEFAULT 'PENDIENTE',
    id_coordinador_atencion BIGINT,
    nombre_coordinador_atencion VARCHAR(150),
    fecha_atencion TIMESTAMP,
    notas_atencion TEXT,
    motivo_reapertura TEXT,
    fecha_reapertura TIMESTAMP,
    contador_reaperturas INT DEFAULT 0,
    historial_atencion TEXT,
    coordinador_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

-- ==============================================================================
-- 4. DML - SEEDER MASIVO CORPORATIVO DE ALTO RENDIMIENTO
-- ==============================================================================

-- 4.1 INYECCIÓN DE PERSONAL (2 Coordinadores, 6 Líderes con Perfil Dual, 30 Desarrolladores)
-- Contraseña Universal: 12345678Ik.
-- Hash BCrypt: $2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS
INSERT INTO trabajador (id_trabajador, identificacion, nombre, apellido, fecha_nacimiento, direccion, profesion, especialidad, habilidades_directivas, habilidades_tecnicas, tipo_trabajador, foto_url, email, email_personal, rol, password_hash, primer_login, estado) VALUES
-- Coordinadores (2)
(1, '1001001', 'Roberto', 'Gómez', '1980-03-10', 'Transversal 23 # 95-12', 'Director de Operaciones & Calidad', 'Gestión de Talento & Auditoría CMMI', 'Gestión de Proyectos, Planificación WBS, Presupuestos & Costos, Auditoría CMMI, Gestión de Riesgos', 'PostgreSQL, Java 17, React.js, Docker, Kubernetes', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'roberto.coord@ikernell.org', 'roberto.gomez.personal@gmail.com', 'COORDINADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(2, '1001002', 'Carlos', 'Mendoza', '1985-04-12', 'Av. Empresarial 100', 'Ingeniero de Sistemas & MBA', 'Dirección de Operaciones & Gobierno TI', 'Liderazgo de Equipos, Scrum Master, Negociación con Clientes, Resolución de Conflictos', 'Spring Boot 3, Microservicios, PostgreSQL DBA, Python, AWS', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'carlos.coord@ikernell.org', 'carlos.mendoza.personal@gmail.com', 'COORDINADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),

-- Líderes de Proyecto (6) - CON PERFIL DUAL: HABILIDADES DIRECTIVAS + HABILIDADES TÉCNICAS
(3, '1001003', 'Elena', 'Rostova', '1989-12-01', 'Calle 127 # 53-10', 'Líder de Proyecto & Cloud Architect', 'Gestión Cloud & Microservicios', 'Scrum Master, Planificación WBS, Gestión de Riesgos, Liderazgo de Equipos', 'Java 17, Spring Boot 3, Docker, Kubernetes, Microservicios', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'elena.lider@ikernell.org', 'elena.rostova.personal@gmail.com', 'LIDER', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(4, '1001004', 'Alejandro', 'Silva', '1986-06-15', 'Calle 100 # 19-40', 'Tech Lead & Arquitecto de Software', 'Arquitectura Distribuida & Java 17', 'Arquitectura de Software, Code Review, Estimación de Esfuerzo, Gestión de Equipos', 'Java 17, Spring Boot 3, PostgreSQL, Redis, JPA / Hibernate', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'alejandro.lider@ikernell.org', 'alejandro.silva.personal@gmail.com', 'LIDER', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(5, '1001005', 'Mariana', 'Torres', '1988-08-23', 'Calle 45 # 12-30', 'Ingeniera de Software & Scrum Master', 'Liderazgo Ágil & Frontend Moderno', 'Scrum Master, Jira / Confluence, Metodologías Ágiles, Resolución de Conflictos', 'React 18, TypeScript, Tailwind CSS, Next.js, Redux Toolkit', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'mariana.lider@ikernell.org', 'mariana.torres.personal@gmail.com', 'LIDER', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(6, '1001006', 'David', 'López', '1987-11-19', 'Av. Boyacá # 72-15', 'Líder de Infraestructura & Cloud', 'AWS, DevOps & Ciberseguridad', 'Gestión de Infraestructura Cloud, Auditoría de Seguridad, Costos Cloud', 'AWS Cloud, Terraform, Docker, Kubernetes, CI/CD Pipelines', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'david.lider@ikernell.org', 'david.lopez.personal@gmail.com', 'LIDER', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(7, '1001007', 'Sofía', 'Ramírez', '1990-05-14', 'Carrera 15 # 80-45', 'Líder de Innovación & Machine Learning', 'IA, Python & Data Science', 'Gestión de Proyectos IA, Innovación Tecnológica, Investigación & Desarrollo', 'Python, Pandas, FastAPI, Scikit-Learn, PostgreSQL DBA', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'sofia.lider@ikernell.org', 'sofia.ramirez.personal@gmail.com', 'LIDER', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(8, '1001008', 'Fernando', 'Castro', '1984-09-28', 'Av. Circunvalar 23-10', 'Líder de Sistemas de Información', 'ERP & Integraciones Enterprise', 'Gobierno TI, Gestión de Stakeholders, Control de Presupuestos', 'Java 17, Spring Boot, PostgreSQL, Kafka, REST APIs', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'fernando.lider@ikernell.org', 'fernando.castro.personal@gmail.com', 'LIDER', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),

-- Desarrolladores (30) Categorizados por Especialidades Técnicas
(9, '1001009', 'Mateo', 'Morales', '1994-02-18', 'Av. Suba # 116-40', 'Desarrollador Frontend Senior', 'Frontend React 18', NULL, 'React 18, TypeScript, Tailwind CSS, Vite, Redux Toolkit', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'mateo.dev@ikernell.org', 'mateo.morales@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(10, '1001010', 'Camila', 'Vargas', '1993-09-20', 'Carrera 7 # 116-50', 'Desarrolladora Backend Java', 'Backend Java & Spring Boot', NULL, 'Java 17, Spring Boot 3, Microservicios, JPA / Hibernate, REST APIs', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'camila.dev@ikernell.org', 'camila.vargas@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(11, '1001011', 'Lucas', 'Herrera', '1991-04-03', 'Diagonal 45 # 22-80', 'Administrador de Base de Datos', 'Base de Datos PostgreSQL', NULL, 'PostgreSQL DBA, Consultas Optimizadas, Índices B-Tree, SQL Tuning, Redis', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'lucas.dev@ikernell.org', 'lucas.herrera@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(12, '1001012', 'Isabella', 'Rojas', '1997-01-19', 'Calle 134 # 9-60', 'Ingeniera de Pruebas QA', 'QA & Testing Automatizado', NULL, 'QA Automation, JUnit, Mockito, Cypress, Postman API Testing', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'isabella.dev@ikernell.org', 'isabella.rojas@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(13, '1001013', 'Gabriel', 'Benítez', '1994-07-22', 'Calle 80 # 11-45', 'Ingeniero DevOps', 'DevOps & Infraestructura Cloud', NULL, 'Docker, Kubernetes, GitHub Actions, CI/CD Pipelines, Linux SysAdmin', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'gabriel.dev@ikernell.org', 'gabriel.benitez@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(14, '1001014', 'Valentina', 'Ortiz', '1996-10-30', 'Carrera 68 # 45-20', 'Diseñadora UI/UX', 'Diseño Figma & Experiencia UI/UX', NULL, 'Figma Prototyping, UI/UX Design, Design Systems, Wireframing, User Research', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'valentina.dev@ikernell.org', 'valentina.ortiz@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(15, '1001015', 'Mateo', 'Silva', '1995-12-08', 'Carrera 45 # 28-10', 'Desarrollador Frontend', 'Frontend React & Next.js', NULL, 'React.js, Next.js, TypeScript, Tailwind CSS, Framer Motion', 'CONTRATISTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'mateos.dev@ikernell.org', 'mateo.silva@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(16, '1001016', 'Lucía', 'Navarro', '1992-11-05', 'Carrera 15 # 80-45', 'Desarrolladora Backend Java', 'Backend Java & Spring Boot', NULL, 'Java 17, Spring Boot 3, Spring Security, JPA Hibernate, PostgreSQL', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'lucian.dev@ikernell.org', 'lucia.navarro@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(17, '1001017', 'Santiago', 'Flores', '1996-03-14', 'Calle 72 # 11-20', 'Desarrollador Full Stack', 'Full Stack React & Java', NULL, 'React.js, Spring Boot 3, Java 17, PostgreSQL, REST APIs', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'santiago.dev@ikernell.org', 'santiago.flores@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(18, '1001018', 'Victoria', 'Rivas', '1995-04-18', 'Calle 100 # 23-10', 'Ingeniera de Datos', 'Base de Datos & Pipelines ETL', NULL, 'Python, Pipelines ETL, PostgreSQL, Pandas, Airflow', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'victoria.dev@ikernell.org', 'victoria.rivas@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(19, '1001019', 'Daniel', 'Castillo', '1993-02-11', 'Calle 116 # 15-30', 'Ingeniero QA Automation', 'QA & Pruebas Automatizadas', NULL, 'Cypress, Jest, Selenium, Postman API Testing, Java 17', 'CONTRATISTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'daniel.dev@ikernell.org', 'daniel.castillo@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(20, '1001020', 'Natalia', 'Domínguez', '1997-08-25', 'Carrera 19 # 104-15', 'Arquitecta Cloud Junior', 'DevOps & Infraestructura Cloud', NULL, 'AWS Cloud, Terraform, Docker, Kubernetes, Nginx', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'natalia.dev@ikernell.org', 'natalia.dominguez@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(21, '1001021', 'Andrés', 'Vega', '1991-10-12', 'Calle 45 # 18-90', 'Desarrollador Backend Java', 'Backend Java & Caché', NULL, 'Spring Boot 3, Java 17, Redis Cache, PostgreSQL, Microservicios', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'andres.dev@ikernell.org', 'andres.vega@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(22, '1001022', 'Paola', 'Reyes', '1995-06-30', 'Carrera 9 # 120-40', 'Desarrolladora Frontend', 'Frontend React & Redux', NULL, 'React.js, Redux Toolkit, Tailwind CSS, TypeScript, Vite', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'paola.dev@ikernell.org', 'paola.reyes@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(23, '1001023', 'Esteban', 'Medina', '1990-01-15', 'Av. 68 # 80-10', 'Administrador de Base de Datos', 'Base de Datos PostgreSQL', NULL, 'PostgreSQL DBA, Query Optimization, Consultas Optimizadas, Redis', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'esteban.dev@ikernell.org', 'esteban.medina@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(24, '1001024', 'Daniela', 'Paredes', '1996-09-14', 'Calle 100 # 55-20', 'Ingeniera QA de Seguridad', 'QA & Ciberseguridad', NULL, 'OWASP Testing, Pentesting Web, Postman API Testing, Cypress, Security Auditing', 'CONTRATISTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'daniela.dev@ikernell.org', 'daniela.paredes@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(25, '1001025', 'Felipe', 'Salazar', '1992-05-20', 'Transversal 15 # 40-10', 'Ingeniero DevOps CI/CD', 'DevOps & CI/CD', NULL, 'GitHub Actions, Docker Containerization, Kubernetes, Linux, Terraform', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'felipe.dev@ikernell.org', 'felipe.salazar@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(26, '1001026', 'Andrea', 'Cárdenas', '1994-12-05', 'Calle 127 # 20-30', 'Diseñadora de Producto UI/UX', 'Diseño Figma & UI/UX', NULL, 'System Design, Wireframing Figma, Figma Prototyping, Design Systems', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'andrea.dev@ikernell.org', 'andrea.cardenas@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(27, '1001027', 'Javier', 'Peralta', '1993-04-18', 'Carrera 50 # 100-15', 'Desarrollador Full Stack', 'Full Stack React & Java', NULL, 'React.js, Spring Boot 3, Java 17, PostgreSQL, REST APIs', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'javierp.dev@ikernell.org', 'javier.peralta@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(28, '1001028', 'Monica', 'Ibáñez', '1995-11-28', 'Calle 85 # 12-40', 'Desarrolladora Backend Microservicios', 'Backend Java & Kafka', NULL, 'Java 17, Spring Boot, Kafka Events, Microservicios, PostgreSQL', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'monica.dev@ikernell.org', 'monica.ibanez@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(29, '1001029', 'Rodrigo', 'Delgado', '1989-08-04', 'Av. El Dorado # 68-90', 'Administrador de Base de Datos', 'Base de Datos PostgreSQL', NULL, 'PostgreSQL Migration, Backup Strategies, SQL Tuning, Consultas Optimizadas', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'rodrigo.dev@ikernell.org', 'rodrigo.delgado@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(30, '1001030', 'Claudia', 'Bravo', '1996-01-23', 'Carrera 11 # 93-20', 'Ingeniera QA Lead', 'QA & Testing Automatizado', NULL, 'Test Strategy, Automated Regression, JUnit, Postman API Testing', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'claudia.dev@ikernell.org', 'claudia.bravo@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(31, '1001031', 'Bruno', 'Miranda', '1992-03-30', 'Calle 140 # 11-15', 'Ingeniero DevOps Lead', 'DevOps & Kubernetes', NULL, 'Kubernetes Helm, Cloud Native Security, Docker, CI/CD Pipelines', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'bruno.dev@ikernell.org', 'bruno.miranda@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(32, '1001032', 'Valeria', 'Fuentes', '1997-07-11', 'Carrera 7 # 45-60', 'Desarrolladora Frontend Mobile', 'Frontend React & Mobile', NULL, 'React Native, React.js, TypeScript, Tailwind CSS', 'CONTRATISTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'valeria.dev@ikernell.org', 'valeria.fuentes@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(33, '1001033', 'Ignacio', 'Rosas', '1994-05-09', 'Calle 72 # 20-50', 'Desarrollador Backend Senior', 'Backend Go & Java', NULL, 'Go, Java 17, Microservicios, Spring Boot 3, PostgreSQL', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ignacio.dev@ikernell.org', 'ignacio.rosas@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(34, '1001034', 'Gabriel', 'Villalobos', '1993-10-15', 'Av. 19 # 100-25', 'Desarrollador Full Stack', 'Full Stack Python & React', NULL, 'React.js, Python, FastAPI, PostgreSQL, Tailwind CSS', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'gabrielv.dev@ikernell.org', 'gabriel.villalobos@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(35, '1001035', 'Diana', 'Solís', '1996-06-18', 'Carrera 15 # 116-30', 'Ingeniera QA Manual & Usabilidad', 'QA & Pruebas Manuales', NULL, 'Software QA, User Acceptance Testing, Postman API Testing, Test Case Design', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'diana.dev@ikernell.org', 'diana.solis@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(36, '1001036', 'Hugo', 'Campos', '1991-09-02', 'Calle 100 # 18-50', 'Especialista en Ciberseguridad & DevOps', 'DevOps & Ciberseguridad', NULL, 'Cyber Security, Docker, Network Audit, OWASP Testing, Linux', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'hugo.dev@ikernell.org', 'hugo.campos@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(37, '1001037', 'Beatriz', 'Peña', '1995-02-24', 'Carrera 9 # 100-10', 'Diseñadora UI/UX Lead', 'Diseño Figma & Wireframing', NULL, 'UI Prototyping, Design Systems, Figma Prototyping, User Research', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'beatriz.dev@ikernell.org', 'beatriz.pena@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true),
(38, '1001038', 'Tomás', 'Guajardo', '1994-08-11', 'Calle 127 # 45-80', 'Desarrollador Backend', 'Backend Node.js & PostgreSQL', NULL, 'Node.js, Express, PostgreSQL, REST APIs, Docker', 'CONTRATISTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'tomas.dev@ikernell.org', 'tomas.guajardo@gmail.com', 'DESARROLLADOR', '$2a$10$xYfn0wCKex2JIrdm1.YaPu2oNDTHaaN9Oj7PXsU1HWqwhIlGTOPrS', false, true);


-- 4.2 INYECCIÓN DE PROYECTOS (15 Proyectos asignados equitativamente entre los 6 Líderes)
INSERT INTO proyecto (id_proyecto, nombre, cliente, descripcion, presupuesto, fecha_inicio, fecha_fin_estimada, estado, lider_id) VALUES
(1, 'App Móvil Fintech & Billetera Digital', 'Nubank Brasil S.A.', 'Billetera digital multiplataforma con pagos QR dinámicos, autenticación biométrica y transferencias interbancarias inmediatas.', 65000.00, '2026-03-01', '2026-10-30', 'ACTIVO', 3),
(2, 'Gestor Documental Normativo & CMMI 3', 'Ministerio de Tecnologías & Ciencia', 'Plataforma de gestión de normativas técnicas con visor en formato A4 interactivo y exportador nativo PDF.', 310000.00, '2026-06-15', '2027-01-15', 'ACTIVO', 3),
(3, 'Plataforma Core Banking Microservicios', 'Banco Santander Corporativo', 'Motor transaccional de alta concurrencia procesado en Spring Boot y PostgreSQL con arquitectura Hexagonal.', 450000.00, '2026-01-10', '2026-12-20', 'ACTIVO', 4),
(4, 'Sistema de Telemedicina & Triaje IA', 'Red Salud Global', 'Sistema clínico multiplataforma para consulta médica remota con soporte de diagnóstico predictivo en tiempo real.', 180000.00, '2026-02-01', '2026-09-15', 'ACTIVO', 4),
(5, 'Motor de Analítica Predictiva & ETL Brasil', 'Petrobras Logística', 'Pipeline ETL de alto volumen estandarizado en ISO 8601 UTC para envío de telemetría a centro de datos regional.', 290000.00, '2026-04-01', '2026-11-30', 'ACTIVO', 5),
(6, 'Portal Omnicanal de Comercio Electrónico', 'MercadoLibre Enterprise', 'E-commerce B2B multiplataforma con gestión de catálogo masivo, pasarelas de pago y trazabilidad de pedidos.', 210000.00, '2026-03-15', '2026-10-15', 'ACTIVO', 5),
(7, 'Sistema de Facturación Electrónica Cloud', 'DIAN / Impuestos Nacionales', 'Módulo fiscal certificado de firma digital y generación XML ISO 20022 con integración a servicios tributarios.', 190000.00, '2026-01-15', '2026-08-30', 'ACTIVO', 6),
(8, 'Plataforma IoT de Monitoreo Industrial', 'Ternium Sostenible', 'Ingesta de datos de sensores en tiempo real con alertas tempranas y panel de supervisión de maquinaria pesada.', 340000.00, '2026-05-01', '2027-02-28', 'ACTIVO', 6),
(9, 'Motor de Riesgo Crediticio & Machine Learning', 'Credit Corp Financial', 'Algoritmo de score de crédito dinámico que evalúa capacidad de pago y comportamiento histórico de clientes.', 275000.00, '2026-02-15', '2026-11-15', 'ACTIVO', 7),
(10, 'E-Learning Empresarial & Asistente IA', 'Globant Academy', 'Plataforma de capacitación técnica corporativa con rutas de aprendizaje personalizadas y evaluaciones adaptativas.', 140000.00, '2026-04-10', '2026-09-30', 'ACTIVO', 7),
(11, 'Sistema de Inventarios y Cadena de Suministro', 'DHL Supply Chain', 'Control de stock distribuido multi-bodega con optimización de rutas de transporte y trazabilidad RFID.', 230000.00, '2026-02-20', '2026-10-20', 'ACTIVO', 8),
(12, 'Orquestador de Identidad Digital & Biometría', 'Registraduría Nacional', 'Gateway de autenticación ciudadana segura con verificación de huella facial y firmas electrónicas avanzadas.', 380000.00, '2026-01-05', '2026-12-05', 'ACTIVO', 8),
(13, 'Consola de Ciberseguridad & SIEM', 'Seguros Bolívar', 'Dashboard de monitoreo de amanezas en tiempo real con detección de anomalías y respuesta automatizada a incidentes.', 320000.00, '2026-03-01', '2026-11-30', 'ACTIVO', 3),
(14, 'Plataforma de Reserva de Vuelos & Hoteles', 'Avianca Group', 'Motor de reservas internacional con integración a GDS Amadeus y pasarela de fidelización de viajeros.', 260000.00, '2026-04-15', '2026-12-15', 'ACTIVO', 4),
(15, 'Portal de Gestión de Flotas GPS', 'RentiCargo Logistics', 'Sistema de rastreo satelital en vivo con telemetría de consumo de combustible y mantenimiento preventivo.', 175000.00, '2026-02-01', '2026-09-30', 'ACTIVO', 5),
(16, 'Migración Legacy Mainframe a Cloud Microservicios', 'Bancolombia S.A.', 'Modernización de arquitectura financiera monolítica hacia microservicios desacoplados en AWS EKS.', 420000.00, '2025-01-10', '2025-12-15', 'COMPLETADO', 3),
(17, 'Portal de Autogestión de Clientes & CRM', 'Claro Telecomunicaciones', 'Plataforma web omnicanal para gestión de solicitudes, consultas de saldo y atención al cliente 24/7.', 165000.00, '2025-03-01', '2025-11-30', 'COMPLETADO', 4),
(18, 'Firma Electrónica Autenticada & Blockchain', 'Cámara de Comercio', 'Sistema de certificación y estampado cronológico de contratos comerciales con tokenización de seguridad.', 280000.00, '2025-02-15', '2025-10-31', 'FINALIZADO', 5),
(19, 'Motor de Conciliación Bancaria Automática', 'Fintech Pagos YA', 'Procesamiento nocturno de extractos y conciliación masiva de transacciones con IA de cotejo.', 195000.00, '2026-01-15', '2026-08-15', 'PAUSADO', 6),
(20, 'Sistema de Monitoreo de Emisiones Carbono', 'EcoEnergy Latam', 'Panel de auditoría ambiental y cálculo de huella de carbono con sensores IoT industriales.', 220000.00, '2026-02-10', '2026-09-20', 'EN_PAUSA', 7);


-- 4.3 INYECCIÓN DE PIVOTE PROYECTO_DESARROLLADOR (PREVENCIÓN DE CONFLICTO DE INTERÉS & CONTROL 48H)
-- Regla: Elena Rostova (Líder ID 3) es Dev en Proyecto 3 (Líder Alejandro Silva)
-- Regla: Alejandro Silva (Líder ID 4) es Dev en Proyecto 1 (Líder Elena Rostova)
-- Regla: Mariana Torres (Líder ID 5) es Dev en Proyecto 8 (Líder David López)
INSERT INTO proyecto_desarrollador (proyecto_id, desarrollador_id, horas_semanales) VALUES
(1, 4, 15), -- Alejandro Silva (Líder ID 4) ayuda en Proyecto 1 de Elena
(1, 9, 40),
(1, 10, 40),
(1, 14, 20),
(2, 9, 20),
(2, 11, 40),
(2, 12, 40),
(3, 3, 20), -- Elena Rostova (Líder ID 3) ayuda en Proyecto 3 de Alejandro
(3, 10, 20),
(3, 13, 40),
(3, 21, 40),
(4, 15, 40),
(4, 16, 40),
(4, 19, 20),
(5, 17, 40),
(5, 18, 40),
(5, 23, 40),
(6, 22, 40),
(6, 24, 40),
(6, 26, 20),
(7, 25, 40),
(7, 27, 40),
(7, 28, 40),
(8, 5, 20), -- Mariana Torres (Líder ID 5) ayuda en Proyecto 8 de David
(8, 29, 40),
(8, 30, 40),
(8, 31, 40),
(9, 32, 40),
(9, 33, 40),
(9, 34, 40),
(10, 35, 40),
(10, 36, 40),
(10, 37, 40),
(11, 38, 40),
(11, 9, 20),
(11, 10, 20),
(12, 11, 20),
(12, 13, 20),
(12, 21, 20),
(13, 36, 20),
(13, 24, 20),
(13, 31, 20),
(14, 15, 20),
(14, 17, 20),
(14, 27, 20),
(15, 18, 20),
(15, 25, 20),
(15, 34, 20);


-- 4.4 INYECCIÓN DE ETAPAS WBS (3 Fases por Proyecto)
INSERT INTO etapa (id_etapa, proyecto_id, nombre_etapa, estado) VALUES
(1, 1, 'Fase 1: Especificación y Arquitectura N-Capas', 'FINALIZADA'),
(2, 1, 'Fase 2: Desarrollo y Construcción de Componentes UI/API', 'EN_PROCESO'),
(3, 1, 'Fase 3: Pruebas Integrales, QA y Despliegue', 'PENDIENTE'),
(4, 2, 'Fase 1: Análisis de Requerimientos y Formato A4', 'FINALIZADA'),
(5, 2, 'Fase 2: Desarrollo del Visor PDF e Integración CMMI 3', 'EN_PROCESO'),
(6, 2, 'Fase 3: Auditoría Normativa y Pruebas de Carga', 'PENDIENTE'),
(7, 3, 'Fase 1: Diseño de Arquitectura Hexagonal y Esquemas SQL', 'FINALIZADA'),
(8, 3, 'Fase 2: Implementación de Microservicios Core Banking', 'EN_PROCESO'),
(9, 3, 'Fase 3: Pruebas de Estrés, Alta Concurrencia y Failover', 'PENDIENTE'),
(10, 4, 'Fase 1: Levantamiento y Protocolos Médicos Triaje', 'FINALIZADA'),
(11, 4, 'Fase 2: Integración de Motor IA y Videollamadas', 'EN_PROCESO'),
(12, 4, 'Fase 3: Certificación de Seguridad de Datos Paciente', 'PENDIENTE'),
(13, 5, 'Fase 1: Diseño de Pipelines ETL y Norma ISO 8601', 'FINALIZADA'),
(14, 5, 'Fase 2: Construcción de Conectores y Transmisión Brasil', 'EN_PROCESO'),
(15, 5, 'Fase 3: Pruebas de Volumen Masivo y Recuperación', 'PENDIENTE'),
(16, 6, 'Fase 1: Especificación de Catálogo B2B y Pasarelas', 'FINALIZADA'),
(17, 6, 'Fase 2: Desarrollo de Módulos de Checkout y Stock', 'EN_PROCESO'),
(18, 6, 'Fase 3: QA Automation y Pruebas de Experiencia', 'PENDIENTE'),
(19, 7, 'Fase 1: Análisis de Regulaciones Fiscales XML ISO 20022', 'FINALIZADA'),
(20, 7, 'Fase 2: Desarrollo del Módulo de Firma Digital', 'EN_PROCESO'),
(21, 7, 'Fase 3: Certificación Dian y Despliegue Cloud', 'PENDIENTE'),
(22, 8, 'Fase 1: Protocolos de Ingesta IoT e Infraestructura', 'FINALIZADA'),
(23, 8, 'Fase 2: Construcción de Dashboard de Alertas Tempranas', 'EN_PROCESO'),
(24, 8, 'Fase 3: Pruebas de Campo con Maquinaria Pesada', 'PENDIENTE'),
(25, 9, 'Fase 1: Limpieza de Datos y Modelado Machine Learning', 'FINALIZADA'),
(26, 9, 'Fase 2: Integración del Motor Score de Crédito API', 'EN_PROCESO'),
(27, 9, 'Fase 3: Pruebas A/B y Validación Financiera', 'PENDIENTE'),
(28, 10, 'Fase 1: Diseño de Rutas E-Learning y Contenidos', 'FINALIZADA'),
(29, 10, 'Fase 2: Desarrollo de Evaluaciones Adaptativas IA', 'EN_PROCESO'),
(30, 10, 'Fase 3: Piloto Empresarial y Ajustes de Usabilidad', 'PENDIENTE'),
(31, 11, 'Fase 1: Mapeo de Bodegas y Red de Transporte', 'FINALIZADA'),
(32, 11, 'Fase 2: Módulo RFID e Integración de Inventario', 'EN_PROCESO'),
(33, 11, 'Fase 3: QA de Transacciones de Bodega', 'PENDIENTE'),
(34, 12, 'Fase 1: Especificación Biométrica y Seguridad Criptográfica', 'FINALIZADA'),
(35, 12, 'Fase 2: Desarrollo de Gateway Huella y Rostro Facial', 'EN_PROCESO'),
(36, 12, 'Fase 3: Auditoría Ciudadana y Pruebas de Penetración', 'PENDIENTE'),
(37, 13, 'Fase 1: Definición de Reglas SIEM y Fuentes Syslog', 'FINALIZADA'),
(38, 13, 'Fase 2: Panel de Respuesta Automatizada a Incidentes', 'EN_PROCESO'),
(39, 13, 'Fase 3: Simulacro de Ciberataque Red Team', 'PENDIENTE'),
(40, 14, 'Fase 1: Integración Amadeus GDS y Contratos API', 'FINALIZADA'),
(41, 14, 'Fase 2: Front-End de Selección de Asientos y Hoteles', 'EN_PROCESO'),
(42, 14, 'Fase 3: Pruebas de Carga en Temporada Alta', 'PENDIENTE'),
(43, 15, 'Fase 1: Ingesta de Telemetría GPS y Alertas', 'FINALIZADA'),
(44, 15, 'Fase 2: Módulo de Mantenimiento Preventivo Flotas', 'EN_PROCESO'),
(45, 15, 'Fase 3: Pruebas de Campo en Ruta Nacional', 'PENDIENTE');


-- 4.5 INYECCIÓN DE ACTIVIDADES WBS (Match Inteligente con Habilidades)
INSERT INTO actividad (id_actividad, etapa_id, desarrollador_id, descripcion, estado) VALUES
(1, 1, 14, 'Diseñar prototipos interactivos en Figma para la Billetera Digital', 'COMPLETADO'),
(2, 1, 11, 'Modelar diagrama ER en PostgreSQL para transacciones QR', 'COMPLETADO'),
(3, 2, 4, 'Implementar módulo de autenticación biométrica en Spring Boot', 'EN_PROCESO'),
(4, 2, 9, 'Desarrollar componentes UI React 18 para transferencia inmediata', 'EN_PROCESO'),
(5, 2, 10, 'Crear controladores REST OpenAPI 3.0 para pasarela Nubank', 'EN_PROCESO'),
(6, 3, 12, 'Ejecutar suite de pruebas de usabilidad móvil UI/UX', 'PENDIENTE'),
(7, 4, 11, 'Configurar esquema PostgreSQL e índices GIN para visor A4', 'COMPLETADO'),
(8, 5, 12, 'Desarrollar componente React de vista previa A4 imprimible', 'EN_PROCESO'),
(9, 5, 9, 'Integrar librería jsPDF con soporte nativo de firmas digitales', 'EN_PROCESO'),
(10, 7, 13, 'Definir manifiestos Docker y Helm Charts para Microservicios', 'COMPLETADO'),
(11, 8, 3, 'Construir microservicio de saldos y movimientos en Java 17', 'EN_PROCESO'),
(12, 8, 21, 'Implementar capa de caché Redis para consultas de alta frecuencia', 'EN_PROCESO'),
(13, 8, 10, 'Refactorizar capa de persistencia JPA/Hibernate en Core Banking', 'EN_PROCESO'),
(14, 9, 13, 'Ejecutar pruebas de carga masiva con JMeter en ambiente staging', 'PENDIENTE'),
(15, 10, 15, 'Diseñar pantalla de registro de pacientes y ficha clínica en React', 'COMPLETADO'),
(16, 11, 16, 'Implementar servicio WebRTC para videollamada médica remota', 'EN_PROCESO'),
(17, 11, 19, 'Crear scripts de prueba automatizados para módulo de triaje', 'PENDIENTE'),
(18, 13, 18, 'Construir script Python ETL para transformación ISO 8601 UTC', 'COMPLETADO'),
(19, 14, 23, 'Optimizar queries SQL batch de inyección continua en PostgreSQL', 'EN_PROCESO'),
(20, 14, 17, 'Implementar canal seguro de transmisión REST HTTPS hacia Brasil', 'EN_PROCESO'),
(21, 16, 22, 'Desarrollar catálogo dinámico de productos B2B en React', 'COMPLETADO'),
(22, 17, 24, 'Ejecutar pruebas OWASP de seguridad en checkout e commerce', 'EN_PROCESO'),
(23, 17, 26, 'Crear componentes visuales en Figma para flujo de compras', 'EN_PROCESO'),
(24, 19, 25, 'Configurar pipelines GitHub Actions para compilación automatizada XML', 'COMPLETADO'),
(25, 20, 27, 'Implementar módulo de firma digital XAdES en Java 17', 'EN_PROCESO'),
(26, 20, 28, 'Desarrollar eventos Kafka para notificación de facturas', 'EN_PROCESO'),
(27, 22, 29, 'Diseñar estructura de tablas para ingesta de sensores IoT', 'COMPLETADO'),
(28, 23, 30, 'Construir casos de prueba para alertas de sobretemperatura', 'EN_PROCESO'),
(29, 23, 31, 'Desplegar cluster Kubernetes para procesar datos de maquinaria', 'EN_PROCESO'),
(30, 25, 33, 'Implementar servicio en Go para cálculo de Score Crediticio', 'COMPLETADO'),
(31, 26, 32, 'Desarrollar formulario interactivo en React Native para solicitud', 'EN_PROCESO'),
(32, 26, 34, 'Entrenar modelo Scikit-Learn de predicción de morosidad', 'EN_PROCESO'),
(33, 28, 37, 'Diseñar interfaz gráfica en Figma para plataforma E-Learning', 'COMPLETADO'),
(34, 29, 35, 'Documentar matriz de pruebas para evaluaciones adaptativas', 'EN_PROCESO'),
(35, 29, 36, 'Implementar API FastAPI para asistente IA de dudas técnicas', 'EN_PROCESO'),
(36, 31, 38, 'Desarrollar servicio Node.js Express para lecturas de RFID', 'COMPLETADO'),
(37, 32, 9, 'Crear vista web React para monitoreo de stock multi-bodega', 'EN_PROCESO'),
(38, 32, 10, 'Implementar procedimientos almacenados en PostgreSQL para inventario', 'EN_PROCESO'),
(39, 34, 11, 'Configurar tablas criptográficas en PostgreSQL para plantillas de huellas', 'COMPLETADO'),
(40, 35, 13, 'Implementar servicio gRPC para emparejamiento facial en tiempo real', 'EN_PROCESO'),
(41, 35, 21, 'Optimizar respuesta de gateway biométrico a menos de 200ms', 'EN_PROCESO'),
(42, 37, 36, 'Definir reglas YARA y Snort para consola de ciberseguridad', 'COMPLETADO'),
(43, 38, 24, 'Realizar pentesting sobre la API de alertas SIEM', 'EN_PROCESO'),
(44, 38, 31, 'Implementar bot de aislamiento automático de nodos comprometidos', 'EN_PROCESO'),
(45, 40, 15, 'Construir integrador SOAP/REST con Amadeus GDS', 'COMPLETADO'),
(46, 41, 17, 'Desarrollar mapa interactivo de asientos en React 18', 'EN_PROCESO'),
(47, 41, 27, 'Implementar pasarela de cobro seguro con encriptación TLS 1.3', 'EN_PROCESO'),
(48, 43, 18, 'Crear script de procesamiento continuo de coordenadas GPS', 'COMPLETADO'),
(49, 44, 25, 'Configurar alertas automáticas de cambio de aceite y frenos', 'EN_PROCESO'),
(50, 44, 34, 'Desarrollar dashboard web React con mapa en tiempo real Leaflet', 'EN_PROCESO');


-- 4.6 INYECCIÓN DE ERRORES E INCIDENCIAS (Semáforo Estricto de 3 Estados: BAJA, MEDIA, CRITICA)
INSERT INTO error (id_error, etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion, resolucion_nota, fecha_resolucion) VALUES
(1, 2, 4, 'Fallo de Memoria / OutOfMemory', 'CRITICA', '2026-08-25 10:30:00', 'Excepción OutOfMemoryError al procesar lote masivo de firmas biométricas en Spring Boot.', 'EN_REVISION', NULL, NULL),
(2, 2, 9, 'Incompatibilidad React 18 Concurrent', 'MEDIA', '2026-08-26 14:15:00', 'Bloqueo de renderizado en componente QR dinámico al recibir eventos de WebSocket.', 'REGISTRADO', NULL, NULL),
(3, 2, 10, 'Fallo en Transacción PostgreSQL', 'CRITICA', '2026-08-28 09:00:00', 'Deadlock detectado en la tabla movimiento_financiero durante transferencia masiva.', 'REGISTRADO', NULL, NULL),
(4, 2, 4, 'Timeout en Pasarela Nubank', 'MEDIA', '2026-08-29 16:45:00', 'Peticiones HTTP exceden los 10s de espera sin recibir respuesta del gateway.', 'REGISTRADO', NULL, NULL),
(5, 5, 12, 'Desbordamiento Visual en Visor A4', 'MEDIA', '2026-08-20 11:20:00', 'El texto de la normativa desborda las márgenes de la página A4 en pantallas de 13 pulgadas.', 'SOLUCIONADO', 'Ajustado CSS container query y padding de hoja A4.', '2026-08-22 15:00:00'),
(6, 5, 9, 'Error en Generación de PDF jsPDF', 'BAJA', '2026-08-24 16:10:00', 'Los acentos especiales se representan como caracteres inválidos en la exportación nativa.', 'SOLUCIONADO', 'Cargada fuente personalizada UTF-8 en formato TTF Base64.', '2026-08-25 10:00:00'),
(7, 8, 3, 'Excepción NullPointer en Microservicio Core', 'CRITICA', '2026-08-27 08:30:00', 'Instancia de cuenta bancaria nula al calcular saldos consolidados.', 'EN_REVISION', NULL, NULL),
(8, 8, 21, 'Fallo de Conexión Redis Cache', 'MEDIA', '2026-08-28 11:00:00', 'Caída de conexión hacia cluster Redis provocando fallback directo a base de datos.', 'REGISTRADO', NULL, NULL),
(9, 8, 10, 'Corrupción de Payload JSON OpenAPI', 'CRITICA', '2026-08-29 13:20:00', 'El serializador Jackson omite el campo id_transaccion en respuestas HTTP 200.', 'REGISTRADO', NULL, NULL),
(10, 14, 17, 'Error de Formato Timestamp ISO 8601', 'MEDIA', '2026-08-22 09:15:00', 'El offset UTC no incluye los segundos en la exportación ETL hacia Brasil.', 'SOLUCIONADO', 'Ajustado DateTimeFormatter en script Python.', '2026-08-23 11:30:00'),
(11, 20, 27, 'Excepción de Llave Criptográfica XAdES', 'MEDIA', '2026-08-26 15:40:00', 'La firma digital es rechazada por el validador DIAN por certificado expirado.', 'EN_REVISION', NULL, NULL),
(12, 26, 34, 'Overfitting en Modelo Machine Learning', 'MEDIA', '2026-08-25 17:00:00', 'El algoritmo asigna score de riesgo 0 a usuarios con historial crediticio nulo.', 'SOLUCIONADO', 'Reentrenado dataset con técnicas de regularización L2.', '2026-08-27 12:00:00'),
(13, 8, 13, 'Fallo de Configuración Helm Chart', 'BAJA', '2026-08-21 10:00:00', 'Variable de entorno DB_MAX_POOL desconfigurada en pod staging.', 'SOLUCIONADO', 'Corregido archivo values.yaml.', '2026-08-21 14:00:00'),
(14, 11, 16, 'Retraso de Audio en WebRTC Telemedicina', 'MEDIA', '2026-08-24 18:30:00', 'Latencia de audio supera los 800ms en conexiones de baja velocidad 3G.', 'EN_REVISION', NULL, NULL),
(15, 17, 24, 'Vulnerabilidad CSRF en Formulario Checkout', 'MEDIA', '2026-08-28 10:15:00', 'Falta token de validación CSRF en la petición POST de pago.', 'EN_REVISION', NULL, NULL),
(16, 23, 30, 'Falsa Alarma de Sobretemperatura IoT', 'BAJA', '2026-08-23 14:20:00', 'Sensor envía lectura de 999 grados por falla de calibración de hardware.', 'SOLUCIONADO', 'Filtro de mediana aplicado en el ingestion worker.', '2026-08-24 09:00:00'),
(17, 29, 36, 'Respuesta Lenta Asistente IA E-Learning', 'MEDIA', '2026-08-27 16:50:00', 'Tiempo de primera respuesta del chatbot supera los 5 segundos.', 'EN_REVISION', NULL, NULL),
(18, 32, 38, 'Pérdida de Paquetes RFID Bodega', 'MEDIA', '2026-08-26 12:10:00', 'Las lecturas consecutivas de stock omiten los tag con señal débil.', 'SOLUCIONADO', 'Aumentada la ganancia de la antena lectora en backend.', '2026-08-27 16:00:00'),
(19, 35, 13, 'Error en Matching Biométrico gRPC', 'CRITICA', '2026-08-29 11:30:00', 'Buffer overflow en librería de procesamiento facial C++ integrada.', 'REGISTRADO', NULL, NULL),
(20, 38, 24, 'Bypass de Autenticación en Consola SIEM', 'CRITICA', '2026-08-30 08:45:00', 'Petición GET permitía visualizar logs de auditoría sin token JWT.', 'REGISTRADO', NULL, NULL);


-- 4.7 INYECCIÓN DE INTERRUPCIONES Y CONTINGENCIAS
INSERT INTO interrupcion (id_interrupcion, etapa_id, desarrollador_id, tipo_interrupcion, duracion_minutos, fecha_registro, fecha_ocurrencia, descripcion, comentarios, impacto_operativo, estado_atencion) VALUES
(1, 2, 4, 'Caída de Servidor Staging', 480, '2026-08-24 08:00:00', '2026-08-24 08:00:00', 'Servidor de pruebas fuera de servicio por falla de disco SSD en el proveedor cloud.', 'Servidor de pruebas fuera de servicio por falla de disco SSD.', 'CRITICO', 'REGISTRADO'),
(2, 2, 9, 'Bloqueo por Falla de Red Corporativa', 360, '2026-08-27 09:30:00', '2026-08-27 09:30:00', 'Corte de fibra óptica en la sede principal impidió el despliegue de componentes UI.', 'Corte de fibra óptica en la sede principal.', 'ALTO', 'REGISTRADO'),
(3, 2, 10, 'Reunión de Emergencia de Seguridad', 240, '2026-08-29 11:00:00', '2026-08-29 11:00:00', 'Sesión extraordinaria de mitigación de fallas transaccionales con el cliente Nubank.', 'Sesión extraordinaria de mitigación de fallas transaccionales.', 'ALTO', 'REGISTRADO'),
(4, 8, 3, 'Corte de Energía y Respaldo UPS', 300, '2026-08-25 13:00:00', '2026-08-25 13:00:00', 'Fallo de la red eléctrica local y demora en la conmutación de la planta de energía.', 'Fallo de la red eléctrica local.', 'ALTO', 'REGISTRADO'),
(5, 8, 13, 'Mantenimiento No Programado Cluster K8s', 420, '2026-08-28 07:00:00', '2026-08-28 07:00:00', 'Actualización crítica de parches de seguridad Kernel en el cluster de desarrollo.', 'Actualización crítica de parches de seguridad Kernel.', 'CRITICO', 'REGISTRADO'),
(6, 8, 21, 'Bloqueo Administrativo por Licencias', 300, '2026-08-29 14:00:00', '2026-08-29 14:00:00', 'Expiración de licencias de herramienta de profiling de memoria Java.', 'Expiración de licencias.', 'MODERADO', 'REGISTRADO'),
(7, 5, 11, 'Capacitación Obligatoria CMMI 3', 360, '2026-08-21 08:00:00', '2026-08-21 08:00:00', 'Taller de auditoría de procesos normativos con consultores externos.', 'Taller de auditoría de procesos normativos.', 'MODERADO', 'REGISTRADO'),
(8, 14, 18, 'Demora en Proveedor de Conectividad Brasil', 240, '2026-08-23 10:00:00', '2026-08-23 10:00:00', 'Espera de aprobación de credenciales VPN por parte del cliente Petrobras.', 'Espera de aprobación de credenciales VPN.', 'MODERADO', 'REGISTRADO'),
(9, 11, 16, 'Problemas de Salud / Incapacidad', 120, '2026-08-22 09:00:00', '2026-08-22 09:00:00', 'Permiso médico laboral de medio día presentado por el desarrollador.', 'Permiso médico laboral de medio día.', 'BAJO', 'REGISTRADO'),
(10, 17, 22, 'Actualización de Sistema Operativo', 60, '2026-08-25 15:00:00', '2026-08-25 15:00:00', 'Reinicio obligatorio por parches de seguridad en la estación de trabajo.', 'Reinicio obligatorio por parches.', 'BAJO', 'REGISTRADO'),
(11, 20, 27, 'Falla de Hardware en Lector de Tarjetas', 90, '2026-08-24 11:30:00', '2026-08-24 11:30:00', 'Remplazo de tarjeta de red dañada en el equipo de desarrollo.', 'Remplazo de tarjeta de red dañada.', 'BAJO', 'REGISTRADO'),
(12, 23, 31, 'Inducción de Seguridad Industrial', 180, '2026-08-26 08:30:00', '2026-08-26 08:30:00', 'Capacitación presencial sobre normativas de trabajo en planta Ternium.', 'Capacitación presencial.', 'MODERADO', 'REGISTRADO'),
(13, 26, 33, 'Falla de API Externa de Consulta', 150, '2026-08-27 10:00:00', '2026-08-27 10:00:00', 'Indisponibilidad del servicio sandbox de consulta de centrales de riesgo.', 'Indisponibilidad del servicio sandbox.', 'MODERADO', 'REGISTRADO'),
(14, 32, 38, 'Calibración de Antenas RFID', 120, '2026-08-25 14:00:00', '2026-08-25 14:00:00', 'Ajuste de frecuencia en portal de pruebas de la bodega DHL.', 'Ajuste de frecuencia.', 'BAJO', 'REGISTRADO'),
(15, 38, 31, 'Simulacro de Evacuación de Edificio', 60, '2026-08-28 10:30:00', '2026-08-28 10:30:00', 'Participación obligatoria en simulacro institucional de emergencia.', 'Participación obligatoria en simulacro.', 'BAJO', 'REGISTRADO');


-- 4.8 INYECCIÓN DE HISTORIAL DE CAMBIOS Y AUDITORÍA CMMI 3
INSERT INTO historial_cambios (id_cambio, proyecto_id, tipo_accion, descripcion, usuario_responsable, fecha_cambio) VALUES
(1, 1, 'ASIGNACION_DESARROLLADOR', 'Asignado Alejandro Silva (Líder) como Desarrollador con 15h/sem de dedicación.', 'Elena Rostova', '2026-03-02 09:00:00'),
(2, 1, 'CREACION_ACTIVIDAD', 'Actividad "Implementar módulo de autenticación biométrica" creada y asignada.', 'Elena Rostova', '2026-03-05 10:30:00'),
(3, 3, 'ASIGNACION_DESARROLLADOR', 'Asignada Elena Rostova (Líder) como Desarrolladora con 20h/sem de dedicación.', 'Alejandro Silva', '2026-01-12 11:00:00'),
(4, 3, 'CREACION_ETAPA', 'Fase 2: Implementación de Microservicios Core Banking registrada exitosamente.', 'Alejandro Silva', '2026-01-15 14:20:00'),
(5, 2, 'REASIGNACION_TAREA', 'Tarea "Visor A4 Imprimible" reasignada a Isabella Rojas por carga operativa.', 'Elena Rostova', '2026-06-20 16:00:00'),
(6, 5, 'EXPORTACION_ETL', 'Lote ETL ISO 8601 UTC exportado y transmitido hacia centro regional Brasil.', 'Mariana Torres', '2026-04-10 17:30:00');


-- 4.9 INYECCIÓN DE SOLICITUDES DE SOPORTE
INSERT INTO solicitud_soporte (id_solicitud, trabajador_id, tipo_solicitud, asunto, descripcion, estado, fecha_creacion, notas_atencion) VALUES
(1, 9, 'ACCESO_HERRAMIENTAS', 'Solicitud de Licencia JetBrains IntelliJ Ultimate', 'Requiero licencia corporativa para desarrollo backend y optimización de componentes.', 'ATENDIDA', '2026-08-20 09:00:00', 'Licencia asignada e informada al colaborador por correo.'),
(2, 10, 'INCREMENTO_CAPACIDAD', 'Ampliación de RAM en Estación de Trabajo', 'Se solicita ampliación a 32GB RAM para ejecutar clusters locales de Docker y Kubernetes.', 'PENDIENTE', '2026-08-28 14:30:00', NULL),
(3, 4, 'PERMISO_TEMPORAL', 'Ajuste de Horario para Postgrado', 'Solicitud de salida 1 hora antes los días jueves por cursar Maestría en Arquitectura.', 'ATENDIDA', '2026-08-15 11:00:00', 'Aprobado por Coordinación General con compromiso de reposición.');


-- 4.10 INICIALIZACIÓN DE CONSECUTIVO
INSERT INTO consecutivo_proyectos (id, ultimo_numero) VALUES (1, 15);

-- Ajustar secuencias PostgreSQL para garantizar IDs autoincrementales limpios
SELECT setval('trabajador_id_trabajador_seq', (SELECT MAX(id_trabajador) FROM trabajador));
SELECT setval('proyecto_id_proyecto_seq', (SELECT MAX(id_proyecto) FROM proyecto));
SELECT setval('proyecto_desarrollador_id_asignacion_seq', (SELECT MAX(id_asignacion) FROM proyecto_desarrollador));
SELECT setval('etapa_id_etapa_seq', (SELECT MAX(id_etapa) FROM etapa));
SELECT setval('actividad_id_actividad_seq', (SELECT MAX(id_actividad) FROM actividad));
SELECT setval('error_id_error_seq', (SELECT MAX(id_error) FROM error));
SELECT setval('interrupcion_id_interrupcion_seq', (SELECT MAX(id_interrupcion) FROM interrupcion));
SELECT setval('historial_cambios_id_cambio_seq', (SELECT MAX(id_cambio) FROM historial_cambios));
SELECT setval('solicitud_soporte_id_solicitud_seq', (SELECT MAX(id_solicitud) FROM solicitud_soporte));

-- Fin del script SQL consolidado
