-- ==============================================================================
-- SCRIPT DE SIEMBRA DE DATOS MASIVA (DATA SEEDING) - IKerneLL SOLUCIONES SOFTWARE
-- Stack: PostgreSQL 14+ con extensión pg_trgm
-- ==============================================================================

BEGIN;

-- 1. EXTENSIÓN PG_TRGM (Para Búsqueda Difusa Fuzzy en MicroSnippets)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. TRABAJADORES (COORDINADOR, LÍDERES Y DESARROLLADORES)
-- Contraseña estándar para todos los perfiles de prueba: 'password123'
-- Hash BCrypt: $2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG

INSERT INTO trabajador (id_trabajador, identificacion, nombre, apellido, fecha_nacimiento, direccion, profesion, especialidad, tipo_trabajador, foto_url, email, rol, password_hash, estado)
VALUES 
  (1, '1001001', 'Carlos', 'Gómez', '1985-04-12', 'Av. Empresarial 100', 'Ingeniero de Sistemas & MBA', 'Dirección de Operaciones & Gobierno TI • [Gestión de Talento Humano, Presupuestos & Costos, Planificación Estratégica, Métricas de Productividad, Gobernanza TI]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'carlos.coordinador@ikernell.com', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (2, '1001002', 'Ana', 'Martínez', '1988-08-23', 'Calle 45 # 12-30', 'Ingeniera de Software & Scrum Master', 'Liderazgo de Proyectos & Metodologías Ágiles • [Scrum Master, Planificación WBS, Liderazgo de Equipos, Jira / Confluence, Spring Boot 3, React.js]', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'ana.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (3, '1001003', 'Luis', 'Pérez', '1992-11-05', 'Carrera 15 # 80-45', 'Ingeniero de Software Full Stack', 'Desarrollo Full Stack • [React.js, Java 17, Spring Boot 3, PostgreSQL, REST APIs, Git & GitHub]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'luis.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (4, '1001004', 'Marta', 'López', '1994-02-18', 'Av. Circunvalar 23-10', 'Ingeniera de Sistemas & Backend Lead', 'Arquitectura Backend & Microservicios • [Java 17, Spring Boot 3, Microservicios, PostgreSQL, Docker, Redis]', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'marta.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (5, '1001005', 'Carlos', 'Mendoza', '1986-06-15', 'Calle 100 # 19-40', 'Tech Lead & Arquitecto de Software', 'Arquitectura Distribuida & Dirección Técnica • [Arquitectura de Software, Planificación WBS, Code Review, Java 17, Spring Boot 3, Docker, Kubernetes]', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'carlos.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (6, '1001006', 'Ana', 'Gómez', '1993-09-20', 'Carrera 7 # 116-50', 'Ingeniera de Sistemas Senior', 'Desarrollo Full Stack & PostgreSQL • [React.js, Spring Boot 3, PostgreSQL, TypeScript, REST APIs, Tailwind CSS]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ana.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (7, '1001007', 'Roberto', 'Silva', '1980-03-10', 'Transversal 23 # 95-12', 'Director de Operaciones & Calidad', 'Gestión de Talento & Auditoría CMMI • [Gestión de Talento Humano, Auditoría de Procesos, Coordinación Operativa, Presupuestos & Costos, Cumplimiento Normativo]', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'roberto.coord@ikernell.org', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (8, '1001008', 'Elena', 'Rostova', '1989-12-01', 'Calle 127 # 53-10', 'Líder de Proyecto & Cloud Architect', 'Gestión de Proyectos Cloud & Microservicios • [Gestión de Proyectos, Scrum Master, AWS, Docker, Kubernetes, Microservicios, Planificación WBS]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'elena.lider@ikernell.org', 'LIDER', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (9, '1001009', 'David', 'Valenzuela', '1995-05-14', 'Av. Boyacá # 72-15', 'Ingeniero Backend Senior', 'Backend & Alta Concurrencia • [Java 17, Spring Boot 3, JPA / Hibernate, PostgreSQL, Docker, REST APIs]', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'david.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (10, '1001010', 'Lucía', 'Morales', '1996-10-30', 'Carrera 68 # 45-20', 'Especialista UI/UX & Frontend Lead', 'Frontend Moderno & Experiencia de Usuario • [React.js, TypeScript, Tailwind CSS, UI/UX Design, Framer Motion, Next.js]', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'lucia.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (11, '1001011', 'Mateo', 'Restrepo', '1994-07-22', 'Calle 80 # 11-45', 'Ingeniero de Datos & ETL Lead', 'Ingeniería de Datos & Pipelines ETL • [PostgreSQL, Python, Docker, Pipelines ETL, Linux, REST APIs]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'mateo.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (12, '1001012', 'Sofía', 'Benítez', '1997-01-19', 'Calle 134 # 9-60', 'Ingeniera QA & Seguridad de Software', 'Aseguramiento de Calidad & Ciberseguridad • [Pruebas Automatizadas, Jest, OWASP, Java 17, CI/CD Pipelines, Git & GitHub]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'sofia.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (13, '1001013', 'Javier', 'Arboleda', '1991-04-03', 'Diagonal 45 # 22-80', 'Ingeniero DevOps & Resiliencia de Infraestructura', 'Infraestructura Cloud & CI/CD • [Docker, CI/CD Pipelines, Linux, AWS, Kubernetes, Nginx, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'javier.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (14, '1001014', 'Ana', 'Ríos', '1982-07-15', 'Calle 100 # 15-20', 'Directora de Talento & Operaciones TI', 'Administración de Personal & Gobernanza • [Administración de Personal, Planificación Estratégica, Atención de Casos Web, Negociación con Clientes, Resolución de Conflictos]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'ana.coordinador@ikernell.org', 'COORDINADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (15, '1001015', 'Diego', 'Torres', '1995-12-08', 'Carrera 45 # 28-10', 'Ingeniero de Software Frontend & Mobile', 'Desarrollo Frontend & Aplicaciones Móviles • [React.js, TypeScript, Tailwind CSS, REST APIs, Git & GitHub, UI/UX Design]', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'diego.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (16, '1001016', 'Gabriel', 'Ruiz', '1996-03-14', 'Calle 72 # 11-20', 'Ingeniero de Software Frontend', 'Desarrollo Web Frontend • [React.js, TypeScript, Tailwind CSS, Redux Toolkit]', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'gabriel.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (17, '1001017', 'Valentina', 'Castro', '1997-08-25', 'Carrera 19 # 104-15', 'Ingeniera Backend Java', 'Microservicios & Spring Boot • [Java 17, Spring Boot 3, Hibernate, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'valentina.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (18, '1001018', 'Camilo', 'Medina', '1994-11-02', 'Av. Suba # 116-40', 'Administrador de Base de Datos', 'Bases de Datos & Tuning SQL • [PostgreSQL, Redis, Consultas Optimizadas, Índices B-Tree]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'camilo.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (19, '1001019', 'Mariana', 'Ospina', '1995-04-18', 'Calle 100 # 23-10', 'Ingeniera de Pruebas QA', 'Pruebas Automatizadas & Calidad • [Jest, Cypress, Selenium, Postman, Java 17]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'mariana.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (20, '1001020', 'Andrés', 'Silva', '1991-09-30', 'Calle 134 # 45-80', 'Arquitecto Cloud & Kubernetes', 'Infraestructura Cloud & Orchestration • [Docker, Kubernetes, AWS, Terraform, Nginx]', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'andres.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (21, '1001021', 'Camila', 'Rincón', '1998-02-12', 'Carrera 15 # 93-60', 'Desarrolladora Mobile', 'Desarrollo Móvil Multiplataforma • [React Native, Flutter, iOS, Android, REST APIs]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'camila.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (22, '1001022', 'Felipe', 'Duarte', '1993-06-05', 'Calle 80 # 45-12', 'Especialista en Ciberseguridad', 'Seguridad de Software & Auditing • [OWASP Top 10, JWT, BCrypt, Penetration Testing]', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'felipe.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (23, '1001023', 'Isabella', 'Vargas', '1996-12-20', 'Diagonal 60 # 18-30', 'Desarrolladora Backend Java', 'Servicios REST & Integraciones • [Java 17, Spring Boot, Microservicios, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'isabella.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (24, '1001024', 'Samuel', 'Moreno', '1992-07-08', 'Calle 116 # 7-40', 'Ingeniero de Datos Python', 'Pipelines ETL & Analítica • [Python, Pandas, PostgreSQL, Docker, Airflow]', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'samuel.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (25, '1001025', 'Natalia', 'Vega', '1997-01-31', 'Carrera 9 # 72-15', 'Desarrolladora Full Stack', 'Full Stack TypeScript & Node • [Node.js, React.js, TypeScript, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'natalia.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (26, '1001026', 'Nicolás', 'Herrera', '1994-05-22', 'Av. Pepe Sierra # 15-50', 'Ingeniero DevOps CI/CD', 'Automatización & CI/CD Pipelines • [GitHub Actions, Docker, Linux, Bash, AWS]', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'nicolas.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (27, '1001027', 'Daniela', 'Jiménez', '1998-10-14', 'Calle 140 # 19-35', 'Diseñadora UI/UX Lead', 'Diseño de Interfaces & Figma • [Figma, Tailwind CSS, Accessibility, Design Systems]', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'daniela.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (28, '1001028', 'Alejandro', 'Paredes', '1993-03-09', 'Carrera 45 # 100-20', 'Ingeniero Backend Senior', 'Sistemas Distribuidos & Go • [Go, C++, Microservicios, gRPC, PostgreSQL]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'alejandro.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (29, '1001029', 'Valeria', 'Mendoza', '1996-09-17', 'Calle 90 # 14-60', 'Ingeniera de Pruebas QA', 'QA Automation & Performance • [K6, JMeter, Selenium, Cypress, CI/CD]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'valeria.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (30, '1001030', 'Sebastián', 'Cruz', '1995-11-28', 'Carrera 7 # 82-40', 'Especialista Cloud AWS', 'Infraestructura como Código • [AWS Lambda, Terraform, S3, ECS, Docker]', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'sebastian.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (31, '1001031', 'Andrea', 'Delgado', '1997-06-11', 'Calle 127 # 20-80', 'Desarrolladora Frontend Senior', 'Frontend React & Vue.js • [React.js, Vue 3, TypeScript, Vite, Tailwind CSS]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'andrea.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (32, '1001032', 'Tomás', 'Ramírez', '1994-01-05', 'Av. Suba # 98-15', 'Ingeniero Backend Java 17', 'Arquitectura REST & Spring • [Java 17, Spring Boot 3, Spring Security, JPA]', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'tomas.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (33, '1001033', 'Sofía', 'Guerrero', '1998-05-19', 'Calle 53 # 13-40', 'Ingeniera de Datos ETL', 'Ingeniería de Datos & Pipelines • [PostgreSQL, Python, Airflow, Spark, SQL]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'sofia.g.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (34, '1001034', 'Lucas', 'Navarro', '1996-07-24', 'Carrera 11 # 95-10', 'Desarrollador Full Stack', 'Full Stack Java & React • [Java 17, Spring Boot 3, React.js, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'lucas.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (35, '1001035', 'Juliana', 'Beltrán', '1995-10-03', 'Av. 19 # 120-45', 'Especialista en Auditoría TI', 'Ciberseguridad & Gobierno TI • [OWASP, ISO 27001, Hardening, Audit SQL]', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'juliana.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (36, '1001036', 'Fernando', 'Montoya', '1995-08-12', 'Carrera 7 # 120-10', 'Ingeniero Backend Java', 'Desarrollo Backend & Microservicios • [Java 17, Spring Boot 3, REST APIs, PostgreSQL]', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'fernando.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (37, '1001037', 'Carolina', 'Espinoza', '1996-03-22', 'Calle 116 # 23-45', 'Ingeniera Frontend React', 'Desarrollo Web Frontend & UI • [React.js, Next.js, Tailwind CSS, TypeScript]', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'carolina.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (38, '1001038', 'Mauricio', 'Cárdenas', '1994-11-15', 'Av. Pepe Sierra # 45-12', 'Ingeniero Full Stack Enterprise', 'Desarrollo Full Stack Enterprise • [Java 17, Spring Boot, React.js, Docker, PostgreSQL]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'mauricio.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (39, '1001039', 'Paula', 'Santamaría', '1997-04-18', 'Calle 100 # 14-80', 'Ingeniera QA & Automated Testing', 'Aseguramiento de Calidad & QA Automation • [Cypress, Jest, Postman, Java 17, Selenium]', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'paula.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (40, '1001040', 'Gonzalo', 'Barrios', '1993-09-05', 'Carrera 15 # 78-20', 'Arquitecto Cloud & CI/CD', 'Infraestructura Cloud & CI/CD Pipelines • [Docker, Kubernetes, AWS, Nginx, CI/CD]', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'gonzalo.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (41, '1001041', 'Vanessa', 'Zapata', '1998-01-27', 'Calle 134 # 19-30', 'Desarrolladora Frontend TypeScript', 'Frontend Moderno & Componentes UI • [React.js, TypeScript, Tailwind CSS, Redux]', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'vanessa.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (42, '1001042', 'Esteban', 'Pardo', '1995-06-30', 'Av. Suba # 100-50', 'Ingeniero de Datos & SQL Lead', 'Bases de Datos & Pipelines ETL • [PostgreSQL, Python, ETL, SQL, Redis]', 'CONTRATISTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'esteban.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (43, '1001043', 'Lina', 'Cordero', '1996-12-14', 'Carrera 45 # 82-15', 'Desarrolladora Microservicios', 'Arquitectura REST & Spring Boot • [Java 17, Spring Boot 3, Microservicios, Docker]', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'lina.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (44, '1001044', 'Hugo', 'Benavides', '1992-02-08', 'Calle 80 # 22-60', 'Especialista Ciberseguridad', 'Ciberseguridad & OWASP Hardening • [OWASP, BCrypt, JWT, Spring Security, Audit]', 'PLANTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'hugo.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true),
  (45, '1001045', 'Adriana', 'Castaño', '1997-10-19', 'Carrera 19 # 95-40', 'Diseñadora UI/UX & Frontend', 'Experiencia de Usuario & React • [React.js, Figma, Tailwind CSS, Framer Motion]', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'adriana.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$GVn/FMWL/swgoaRnJZ3HNe3RK/YMut0wHdZ9/Fd.ZhZ6Hu2J5bIhG', true)
ON CONFLICT (id_trabajador) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  profesion = EXCLUDED.profesion,
  especialidad = EXCLUDED.especialidad,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  password_hash = EXCLUDED.password_hash;

SELECT setval('trabajador_id_trabajador_seq', (SELECT MAX(id_trabajador) FROM trabajador));

-- 3. PROYECTOS EMPRESARIALES
INSERT INTO proyecto (id_proyecto, nombre, cliente, descripcion, presupuesto, fecha_inicio, fecha_fin_estimada, estado, lider_id)
VALUES 
  (1, 'Sistema Facturación Cloud & ETL Brasil', 'Banco Santander Brasil S.A.', 'Plataforma empresarial para emisión de facturación electrónica y sincronización de métricas operacionales bajo estándar ISO 8601 hacia filiales en Brasil.', 85000.00, '2026-01-15', '2026-11-30', 'ACTIVO', 2),
  (2, 'Core Bancario & Microservicios Cloud', 'Itaú Unibanco Holding', 'Modernización de la arquitectura financiera con servicios transaccionales idempotentes, seguridad stateless JWT y alta concurrencia.', 120000.00, '2026-02-01', '2026-12-15', 'ACTIVO', 5),
  (3, 'App Móvil Fintech & Billetera Digital', 'Nubank Brasil S.A.', 'Billetera digital multiplataforma con pagos QR dinámicos, autenticación biométrica y transferencias interbancarias inmediatas.', 65000.00, '2026-03-01', '2026-10-30', 'ACTIVO', 8),
  (4, 'Plataforma Telemedicina & Triaje Inteligente', 'Hospital Israelita Albert Einstein', 'Sistema de atención médica virtual con streaming WebRTC de baja latencia, recetas digitales encriptadas y triaje automatizado.', 48000.00, '2026-04-10', '2026-09-30', 'ACTIVO', 8),
  (5, 'Migración ERP Empresarial & Data Warehouse', 'Embraer Enterprise Solutions', 'Migración masiva de base de datos legada hacia cluster PostgreSQL con pipelines de analítica predictiva en tiempo real.', 95000.00, '2025-06-01', '2026-01-30', 'COMPLETADO', 2)
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

-- 4. ASIGNACIONES DE DESARROLLADORES A PROYECTOS
DELETE FROM proyecto_desarrollador;

INSERT INTO proyecto_desarrollador (proyecto_id, desarrollador_id, horas_semanales)
VALUES 
  (1, 6, 12), (1, 9, 12), (1, 11, 12), (1, 3, 12), (1, 15, 12), 
  (2, 6, 12), (2, 9, 12), (2, 4, 12), (2, 12, 12), (2, 13, 12), 
  (3, 10, 12), (3, 11, 12), (3, 15, 12), (3, 16, 12),
  (4, 10, 12), (4, 12, 12), (4, 13, 12), (4, 4, 12), (4, 15, 12), 
  (5, 9, 8), (5, 17, 8), (5, 18, 8), (5, 19, 8), (5, 20, 8);

-- 5. ETAPAS (WBS)
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
  (502, 5, 'Fase 2: Carga en Data Warehouse PostgreSQL y Validación', 'FINALIZADA')
ON CONFLICT (id_etapa) DO UPDATE SET
  proyecto_id = EXCLUDED.proyecto_id,
  nombre_etapa = EXCLUDED.nombre_etapa,
  estado = EXCLUDED.estado;

SELECT setval('etapa_id_etapa_seq', 600);

-- 6. ACTIVIDADES (WBS Granular)
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
  (4006, 402, 15, 'Implementar controles de audio/video y chat interactivo en sala de telemedicina', 'EN_PROGRESO');

SELECT setval('actividad_id_actividad_seq', 8000);

-- 7. MÉTRICAS CRÍTICAS PARA EL PREDICTOR DE BURNOUT (capacity.pulse)
-- Ventana de 21 días (S1: días 15-21, S2: días 8-14, S3: días 1-7)
DELETE FROM error;
DELETE FROM interrupcion;

-- 1. Ana Gómez (id: 6) -> 🔴 CRÍTICA (1 desarrollador con sobrecarga extrema, Score > 80%)
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES 
  (101, 6, 'LOGICO', 'ALTA', NOW() - INTERVAL '18 days', 'Validación de fecha de vencimiento menor a fecha de emisión', 'SOLUCIONADO', 'Añadida aserción custom', NOW() - INTERVAL '17 days'),
  (102, 6, 'CONCURRENCIA', 'CRITICA', NOW() - INTERVAL '16 days', 'Bloqueo pesimista en base de datos', 'SOLUCIONADO', 'Bloqueo optimista aplicado', NOW() - INTERVAL '15 days'),
  (102, 6, 'CONCURRENCIA', 'ALTA', NOW() - INTERVAL '11 days', 'Race condition al generar número consecutivo', 'SOLUCIONADO', 'Secuencia atómica', NOW() - INTERVAL '10 days'),
  (202, 6, 'RENDIMIENTO', 'CRITICA', NOW() - INTERVAL '9 days', 'Latencia en algoritmo de firma criptográfica XAdES', 'SOLUCIONADO', 'Paralelizado', NOW() - INTERVAL '8 days'),
  (102, 6, 'CONCURRENCIA', 'CRITICA', NOW() - INTERVAL '5 days', 'Deadlock en tabla factura_detalle bajo 500 hilos concurrentes', 'EN_REVISION', NULL, NULL),
  (202, 6, 'RENDIMIENTO', 'CRITICA', NOW() - INTERVAL '4 days', 'Consumo de CPU al 98% en algoritmo de firma criptográfica XAdES', 'REGISTRADO', NULL, NULL),
  (302, 6, 'CONCURRENCIA', 'CRITICA', NOW() - INTERVAL '2 days', 'Pérdida de mensajes en topic de transacciones de billetera', 'REGISTRADO', NULL, NULL);

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES 
  (101, 6, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '18 days', 60, 'Reunión de alineación con DIAN para validación de XML', 'SOLUCIONADO', 'Minuta aprobada', NOW() - INTERVAL '18 days'),
  (102, 6, 'CAIDA_SERVICIO_EXTERNO', NOW() - INTERVAL '12 days', 90, 'Indisponibilidad del entorno de pruebas DIAN', 'SOLUCIONADO', 'Servicio reestablecido', NOW() - INTERVAL '12 days'),
  (102, 6, 'INCIDENCIA_PRODUCCION', NOW() - INTERVAL '4 days', 120, 'Investigación de caída de servidor transaccional', 'REGISTRADO', NULL, NULL),
  (102, 6, 'SOPORTE_URGENTE', NOW() - INTERVAL '2 days', 180, 'Depuración de fallo en firma digital con equipo de seguridad', 'REGISTRADO', NULL, NULL);

-- 2. David Valenzuela (id: 9) -> 🟠 ALTA (1 desarrollador con tensión en rango 65% - 79%)
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion)
VALUES 
  (202, 9, 'LOGICO', 'MEDIA', NOW() - INTERVAL '17 days', 'Cálculo inexacto en redondeo de céntimos en liquidación', 'SOLUCIONADO'),
  (202, 9, 'RENDIMIENTO', 'ALTA', NOW() - INTERVAL '11 days', 'Falta de índice compuesto en tabla transacciones_bancarias', 'SOLUCIONADO'),
  (202, 9, 'RENDIMIENTO', 'ALTA', NOW() - INTERVAL '4 days', 'Latencia de 1.8 segundos en consulta de historial bancario', 'EN_REVISION'),
  (203, 9, 'INTEGRACION_REST', 'ALTA', NOW() - INTERVAL '2 days', 'Error 504 Gateway Timeout en microservicio de notificaciones Push', 'REGISTRADO');

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion)
VALUES 
  (202, 9, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '17 days', 30, 'Revisión de arquitectura técnica', 'SOLUCIONADO'),
  (202, 9, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '10 days', 60, 'Revisión de microservicios transaccionales', 'SOLUCIONADO'),
  (202, 9, 'INCIDENCIA_PRODUCCION', NOW() - INTERVAL '5 days', 60, 'Alerta de saturación de disco en base de datos', 'REGISTRADO'),
  (203, 9, 'SOPORTE_URGENTE', NOW() - INTERVAL '2 days', 90, 'Asistencia técnica a equipo de QA para pruebas de carga', 'REGISTRADO');

-- 3. Marta López (id: 4) -> 🟡 MEDIA (Desarrollador 1 de 2 en Media, Score 45% - 64%)
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion)
VALUES 
  (202, 4, 'LOGICO', 'MEDIA', NOW() - INTERVAL '16 days', 'Inconsistencia en validación de formato de teléfono internacional', 'SOLUCIONADO'),
  (202, 4, 'LOGICO', 'MEDIA', NOW() - INTERVAL '10 days', 'Inconsistencia menor en cálculo de comisiones', 'SOLUCIONADO'),
  (202, 4, 'RENDIMIENTO', 'MEDIA', NOW() - INTERVAL '3 days', 'Consumo moderado de memoria en procesamiento de lotes', 'EN_REVISION');

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion)
VALUES 
  (202, 4, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '3 days', 30, 'Reunión de coordinación técnica de microservicios', 'SOLUCIONADO');

-- 4. Mateo Restrepo (id: 11) -> 🟡 MEDIA (Desarrollador 2 de 2 en Media, Score 45% - 64%)
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion)
VALUES 
  (103, 11, 'VALIDACION', 'MEDIA', NOW() - INTERVAL '17 days', 'Validación de caracteres especiales en campos de texto plano', 'SOLUCIONADO'),
  (103, 11, 'VALIDACION', 'MEDIA', NOW() - INTERVAL '10 days', 'Formato de fecha no compatible con especificación ISO 8601', 'SOLUCIONADO'),
  (103, 11, 'LOGICO', 'MEDIA', NOW() - INTERVAL '3 days', 'Caracteres especiales en extracción de archivo plano', 'REGISTRADO');

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion)
VALUES 
  (103, 11, 'BLOQUEO_AMBIENTE', NOW() - INTERVAL '4 days', 30, 'Mantenimiento preventivo en servidor SFTP de pruebas', 'SOLUCIONADO');

-- 5. Desarrolladores en Nivel Óptimo -> 🟢 BAJA / ESTABLE (4 desarrolladores, Score < 45%)
-- Lucía Morales (id: 10), Javier Arboleda (id: 13), Sofía Benítez (id: 12), Luis Pérez (id: 3), Diego Torres (id: 15)
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES 
  (301, 10, 'SINTAXIS', 'BAJA', NOW() - INTERVAL '16 days', 'Warning menor de propTypes en componente botón', 'SOLUCIONADO', 'Corregido propTypes', NOW() - INTERVAL '15 days'),
  (204, 13, 'SINTAXIS', 'BAJA', NOW() - INTERVAL '14 days', 'Comentario desactualizado en Dockerfile multi-stage', 'SOLUCIONADO', 'Actualizado', NOW() - INTERVAL '13 days'),
  (204, 12, 'SINTAXIS', 'BAJA', NOW() - INTERVAL '15 days', 'Aserción de prueba unitaria con mensaje incompleto', 'SOLUCIONADO', 'Corregido', NOW() - INTERVAL '14 days'),
  (102, 3, 'SINTAXIS', 'BAJA', NOW() - INTERVAL '10 days', 'Etiqueta HTML no cerrada en plantilla de previsualización', 'SOLUCIONADO', 'Cerrada etiqueta', NOW() - INTERVAL '9 days'),
  (102, 15, 'SINTAXIS', 'BAJA', NOW() - INTERVAL '6 days', 'Error de tipado en props de componente visor de PDF', 'SOLUCIONADO', 'Corregido con TypeScript interfaces', NOW() - INTERVAL '5 days'),
  (302, 15, 'INTEGRACION_REST', 'MEDIA', NOW() - INTERVAL '3 days', 'Desincronización en webhook de confirmación de saldo en app móvil', 'EN_REVISION', NULL, NULL),
  (402, 15, 'LOGICO', 'ALTA', NOW() - INTERVAL '1 days', 'Fallo al reconectar stream WebRTC tras pérdida intermitente de red', 'REGISTRADO', NULL, NULL);

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES
  (102, 15, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '5 days', 45, 'Sesión técnica de revisión de estilos con el equipo de diseño UI', 'SOLUCIONADO', 'Aprobado diseño mobile', NOW() - INTERVAL '5 days'),
  (302, 15, 'BLOQUEO_AMBIENTE', NOW() - INTERVAL '2 days', 90, 'Bloqueo temporal por actualización del emulador Android SDK', 'SOLUCIONADO', 'SDK actualizado a v34', NOW() - INTERVAL '2 days'),
  (402, 15, 'INCIDENCIA_PRODUCCION', NOW() - INTERVAL '1 days', 60, 'Revisión urgente de compatibilidad de cámara en Safari iOS', 'REGISTRADO', NULL, NULL);

SELECT setval('error_id_error_seq', (SELECT MAX(id_error) FROM error));
SELECT setval('interrupcion_id_interrupcion_seq', (SELECT MAX(id_interrupcion) FROM interrupcion));



-- 8. MICRO SNIPPETS TÉCNICOS PARA EL BUSCADOR (Snippet.inject - RF-36)
DELETE FROM micro_snippet;

INSERT INTO micro_snippet (id_snippet, titulo, descripcion, tags_busqueda, codigo_solucion, lenguaje, comando_consola)
VALUES 
  (1, 'Configuración de CORS y WebSecurityCustomizer en Spring Boot 3', 'Soluciona errores de bloqueo de CORS e integración REST entre Frontend React (Vite 5173) y Backend Spring Boot (8080).', 'cors spring security 403 forbidden react vite integration rest websecurity', 
'@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
            config.setAllowedHeaders(List.of("*"));
            config.setAllowCredentials(true);
            return config;
        }))
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}', 'java', false),

  (2, 'Aislamiento de Transacciones con @Transactional(REQUIRES_NEW)', 'Previene deadlocks y evita que la falla de una subtarea anule la transacción principal.', 'transactional deadlock rollback atomic concurrencia requires_new postgresql',
'@Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED, timeout = 10)
public void registrarAuditoriaInmutable(Long idUsuario, String accion) {
    Auditoria auditoria = new Auditoria(idUsuario, accion, Instant.now());
    auditoriaRepository.saveAndFlush(auditoria);
}', 'java', false),

  (3, 'Hook Personalizado useDebounce en React 18 con Limpieza de Timer', 'Optimiza llamadas a endpoints de búsqueda difusa reduciendo peticiones innecesarias.', 'debounce hook useeffect search input optimizacion rendimiento react',
'export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}', 'javascript', false),

  (4, 'Optimización de Índices GIN y pg_trgm para Búsqueda Difusa', 'Habilita la extensión trigram y crea índices invertidos de alta velocidad para búsquedas LIKE/ILIKE y similitud.', 'postgresql pg_trgm gin index fuzzy search similitud rendimiento',
'-- Habilitar extensión trigram
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Crear índice GIN acelerador de búsqueda difusa
CREATE INDEX idx_micro_snippet_trgm 
ON micro_snippet 
USING gin (tags_busqueda gin_trgm_ops);

-- Consulta de coincidencia difusa ponderada
SELECT id_snippet, titulo, codigo_solucion,
       similarity(tags_busqueda, ''cors spring'') AS score
FROM micro_snippet
WHERE tags_busqueda % ''cors spring''
ORDER BY score DESC
LIMIT 5;', 'sql', false),

  (5, 'Configuración de Pool HikariCP para Alta Concurrencia', 'Dimensionamiento óptimo del pool de conexiones para soportar alta demanda sin fugas de memoria.', 'hikaricp connection pool database leak postgresql properties concurrencia',
'spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.leak-detection-threshold=20000
spring.datasource.hikari.pool-name=IKernellHikariPool', 'properties', false),

  (6, 'Interceptor Global Axios con Renovación Automática de JWT', 'Captura respuestas 401 Unauthorized y renueva el token mediante refresh token sin interrumpir al usuario.', 'axios interceptor jwt token 401 unauthorized auth refresh react',
'api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post("/api/auth/refresh");
        localStorage.setItem("token", data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);', 'javascript', false),

  (7, 'Cálculo de Ventana Deslizante de 21 Días en PostgreSQL (CTE + Window Functions)', 'Matemática analítica de alta velocidad delegada en PostgreSQL para predecir sobrecarga operacional.', 'window function generate_series burnout analitica postgresql cte sql',
'WITH dias_serie AS (
    SELECT generate_series(CURRENT_DATE - INTERVAL ''21 days'', CURRENT_DATE, ''1 day'')::date AS fecha
),
conteo_diario AS (
    SELECT d.fecha,
           COALESCE(COUNT(DISTINCT e.id_error), 0) AS total_errores,
           COALESCE(SUM(i.duracion_minutos), 0) AS minutos_bloqueo
    FROM dias_serie d
    LEFT JOIN error e ON e.fecha_registro::date = d.fecha AND e.desarrollador_id = :desarrolladorId
    LEFT JOIN interrupcion i ON i.fecha_ocurrencia::date = d.fecha AND i.desarrollador_id = :desarrolladorId
    GROUP BY d.fecha
)
SELECT 
    AVG(total_errores) OVER (ORDER BY fecha ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS media_movil_7d
FROM conteo_diario;', 'sql', false),

  (8, 'Generación de Lote Delimitado ISO 8601 UTC para Alianza Brasil (RF-28 a RF-30)', 'Estandariza métricas de proyectos en formato plano con marcas de tiempo en formato internacional UTC.', 'iso 8601 utc sftp etl brasil exportacion timestamp',
'public String generarLoteIso8601(Proyecto proyecto, List<Error> errores, List<Interrupcion> interrupciones) {
    StringBuilder sb = new StringBuilder();
    sb.append("COD_PROYECTO|ETAPA|FECHA_UTC|TIPO_EVENTO|SEVERIDAD_O_DURACION\n");
    DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_INSTANT;

    for (Error e : errores) {
        sb.append(proyecto.getIdProyecto()).append("|")
          .append(e.getEtapa().getNombreEtapa()).append("|")
          .append(isoFormatter.format(e.getFechaRegistro().toInstant(ZoneOffset.UTC))).append("|")
          .append("ERROR_").append(e.getTipoError()).append("|")
          .append(e.getSeveridad()).append("\n");
    }
    return sb.toString();
}', 'java', false),

  (9, 'Manejo Global de Excepciones con ProblemDetail (RFC 7807) en Spring Boot 3', 'Estandariza las respuestas de error RESTful con códigos semánticos, timestamps y trazabilidad.', 'exceptionhandler restcontrolleradvice problemdetail rfc7807 error spring',
'@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ProblemDetail handleNotFound(EntityNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Recurso No Encontrado");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Error de validación en campos");
        problem.setTitle("Validación Fallida");
        return problem;
    }
}', 'java', false),

  (10, 'Comandos Docker Compose para Base de Datos PostgreSQL y Redis', 'Levanta la base de datos PostgreSQL con extensión pg_trgm y caché Redis en un solo comando.', 'docker compose postgresql redis database container',
'version: "3.8"
services:
  postgres:
    image: postgres:16-alpine
    container_name: ikernell-postgres
    environment:
      POSTGRES_DB: backend_db
      POSTGRES_USER: abrah
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:', 'yaml', true),

  (11, 'Compilación y Ejecución Maven de Spring Boot en Modo Producción', 'Compila el artefacto jar omitiendo tests para acelerar el ciclo de despliegue local.', 'maven build jar spring boot compile produccion',
'mvn clean package -DskipTests && java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod', 'bash', true),

  (12, 'Instalación y Verificación de Dependencias con PNPM', 'Garantiza instalación determinista de dependencias frontend respetando pnpm-lock.yaml.', 'pnpm install build dev vite package frontend',
'pnpm install --frozen-lockfile && pnpm run build', 'bash', true);

SELECT setval('micro_snippet_id_snippet_seq', (SELECT MAX(id_snippet) FROM micro_snippet));

-- 9. SOLICITUDES DE CONTACTO EMPRESARIALES (Consola del Coordinador)
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

-- 10. BIBLIOTECA DIGITAL, NOTICIAS Y TUTORIALES
DELETE FROM documento_biblioteca;
INSERT INTO documento_biblioteca (id_documento, titulo, categoria, archivo_url, fecha_subida, subido_por_id, descripcion, version, formato, contenido_texto)
VALUES 
  (1, 'Catálogo de Requerimientos Funcionales y No Funcionales v2.0', 'NORMATIVAS', 'https://docs.ikernell.org/catalogo-requerimientos-v2.pdf', NOW() - INTERVAL '3 days', 5, 'Matriz completa de 36 Requerimientos Funcionales (RF-01 a RF-36) y 15 No Funcionales con trazabilidad WBS, RBAC e integraciones internacionales.', 'v2.0', 'PDF', ''),
  (2, 'Especificación de Arquitectura de N-Capas y Microservicios Cloud', 'ARQUITECTURA', 'https://docs.ikernell.org/arquitectura-ncapas-v2.pdf', NOW() - INTERVAL '5 days', 5, 'Estándares de desacoplamiento entre Backend Java 17 (Spring Boot 3 REST), Frontend React 18 (Vite SPA) y capa de persistencia PostgreSQL.', 'v2.1', 'PDF', ''),
  (3, 'Modelo Relacional PostgreSQL, Índices GIN y Diccionario DDL', 'BASE DE DATOS', 'https://docs.ikernell.org/modelo-relacional-ddl.sql', NOW() - INTERVAL '8 days', 5, 'Esquema relacional integral de 16 tablas con integridad referencial ON DELETE CASCADE/SET NULL, índices GIN pg_trgm y CTEs de analítica.', 'v3.0', 'SQL', ''),
  (4, 'Playbook de Resolución de Incidencias & Snippets Técnicos', 'OPERACIONES', 'https://docs.ikernell.org/playbook-incidencias.pdf', NOW() - INTERVAL '9 days', 5, 'Guía de contingencias operativas, resolución de deadlocks transaccionales con REQUIRES_NEW y catálogo de snippets de rápida inyección.', 'v1.5', 'PDF', ''),
  (5, 'Manual de Integración y Formato Plano ISO 8601 UTC Brasil', 'INTEGRACION', 'https://docs.ikernell.org/manual-integracion-brasil.pdf', NOW() - INTERVAL '11 days', 5, 'Protocolo de delimitación de registros por piping (|), cálculo de sumatorias de control SHA-256 y transferencia SFTP asíncrona (RF-28 a RF-31).', 'v1.2', 'PDF', ''),
  (6, 'Guía de Estándares de Código y Despliegue con pnpm', 'DESARROLLO', 'https://docs.ikernell.org/guia-desarrollo-pnpm.docx', NOW() - INTERVAL '14 days', 5, 'Convenciones de código Clean Architecture, TypeScript/ES6, Tailwind CSS con modo oscuro/claro y políticas de dependencias estrictas con pnpm.', 'v2.0', 'DOCX', ''),
  (7, 'Manual de Ciberseguridad, RBAC y Políticas OWASP 2026', 'CIBERSEGURIDAD', 'https://docs.ikernell.org/seguridad-rbac-owasp.pdf', NOW() - INTERVAL '16 days', 5, 'Hardening de seguridad contra inyecciones SQL, tokens JWT con firma HMAC-SHA256, BCrypt cost factor 10 y protección CSRF/CORS estricta.', 'v1.8', 'PDF', ''),
  (8, 'Matriz de Capacidad, Carga Cognitiva y Predictor de Burnout', 'ANALITICA', 'https://docs.ikernell.org/predictor-burnout-algoritmo.pdf', NOW() - INTERVAL '19 days', 5, 'Documentación matemática del algoritmo capacity.pulse (RF-35) con 7 CTEs deslizantes en PostgreSQL para la prevención de fatiga en desarrolladores.', 'v1.1', 'PDF', '');

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_1$# CATÁLOGO FORMAL DE REQUERIMIENTOS DE SOFTWARE (SRS v2.0)
**Proyecto:** Plataforma IKernell Soluciones Software  
**Normativa Internacional:** IEEE 830 / ISO/IEC/IEEE 29148 / ISO/IEC 25010  
**Versión:** 2.0 | **Estado:** Aprobado para Producción  
**Clasificación:** Confidencial - Uso Interno de Ingeniería  

---

## 1. INTRODUCCIÓN Y PROPÓSITO DEL SISTEMA
El presente documento constituye la Especificación Formal de Requerimientos de Software (SRS) para la plataforma **IKernell**, un ecosistema empresarial de gestión y monitoreo predictivo de proyectos de desarrollo de software. El sistema integra control granular de estructuras WBS (*Work Breakdown Structure*), análisis de salud cognitiva de desarrolladores mediante telemetría operativa (*capacity.pulse*), inyección contextual de soluciones de código (*Snippet.inject*) y módulos de intercambio de información batch bajo estándares internacionales con el sector bancario de Brasil.

### 1.1. Objetivos del Negocio
1. **Centralización de Operaciones:** Unificar en una sola interfaz reactiva la gestión de requerimientos, actividades, asignación de talento y balance presupuestal.
2. **Prevención Temprana de Fricción Técnica:** Identificar sobrecargas cognitivas antes de que se conviertan en incidentes críticos o atrasos en el cronograma mediante algoritmos estocásticos sobre ventanas de 21 días.
3. **Interoperabilidad Transfronteriza:** Asegurar que las actividades operacionales puedan ser auditadas y transferidas a centros de compensación financiera internacional en São Paulo bajo el estándar ISO 8601 UTC.

---

## 2. ACTORES DEL SISTEMA Y MATRIZ DE RESPONSABILIDADES
- **ACT-01 (Coordinador General):** Responsable de la gestión del capital humano, aprobación de solicitudes comerciales, asignación de roles corporativos y supervisión estratégica de proyectos.
- **ACT-02 (Líder de Proyecto):** Encargado de la creación de proyectos, dimensionamiento presupuestal, descomposición WBS en etapas y actividades, asignación de desarrolladores y monitoreo de riesgos.
- **ACT-03 (Desarrollador de Software):** Ejecutor técnico de actividades WBS, reportador de horas invertidas, registrador de incidencias técnicas (errores) y bloqueos operativos (interrupciones).
- **ACT-04 (Visitante / Lead Corporativo):** Usuario anónimo que explora la Landing Page corporativa, consulta la oferta de servicios y remite formularios de contacto.
- **ACT-05 (Nodo Financiero Brasil ETL):** Sistema bancario externo receptor de lotes de auditoría en formato delimitado por tuberías ISO 8601 UTC.

---

## 3. CATÁLOGO COMPLETO DE REQUERIMIENTOS FUNCIONALES (RF-01 AL RF-36)

### 3.1. Módulo Público, Identidad y Autenticación (RF-01 a RF-07)
| Código | Nombre | Descripción Técnica Detallada | Actor Primario |
| :--- | :--- | :--- | :--- |
| **RF-01** | Landing Page Corporativa | Despliegue responsivo de la propuesta de valor de IKernell, métricas de rendimiento, stack tecnológico y clientes. | Visitante |
| **RF-02** | Hero Dinámico Día/Noche | Efecto de iluminación y transición solar sobre globo terráqueo usando CSS `mix-blend-mode` y overlays de luz sincronizados con el tema del sistema. | Visitante |
| **RF-03** | Catálogo de Servicios | Exposición modular de servicios: Arquitectura Cloud, Ciberseguridad OWASP, Analítica Predictiva y Consultoría Enterprise. | Visitante |
| **RF-04** | Captura de Solicitudes Web | Formulario de contacto con validaciones de formato de correo RFC 5322, teléfono E.164 y persistencia transaccional en `solicitud_contacto`. | Visitante |
| **RF-05** | FAQ Interactivo | Módulo colapsable de preguntas frecuentes categorizadas con búsqueda por palabras clave en memoria del cliente. | Visitante |
| **RF-06** | Autenticación JWT Stateless | Endpoint `/api/auth/login` que valida credenciales contra hash BCrypt y emite token HMAC-SHA256 con vigencia de 24 horas. | Todos |
| **RF-07** | Control de Sesión RBAC | Interceptor en frontend que decodifica los claims del token y enruta al dashboard respectivo según el rol del usuario. | Usuario |

### 3.2. Módulo de Gestión de Personal - Coordinador (RF-08 a RF-13)
| Código | Nombre | Descripción Técnica Detallada | Actor Primario |
| :--- | :--- | :--- | :--- |
| **RF-08** | Alta de Personal | Creación de cuentas de colaboradores con campos obligatorios: identificación, nombres, apellidos, correo, rol, profesión y especialidad. | Coordinador |
| **RF-09** | Cifrado Obligatorio | Hashing unidireccional de contraseñas mediante algoritmo BCrypt con factor de costo 10 antes de la persistencia en base de datos. | Sistema |
| **RF-10** | Tabla de Gestión de Personal | Listado paginado con búsqueda por nombre/correo, insignias de rol diferenciadas y diseño tabular empresarial. | Coordinador |
| **RF-11** | Inhabilitación Lógica (Soft-Delete) | Endpoint `PATCH /coordinador/trabajadores/{id}/estado` que conmuta el booleano `estado` sin destruir la integridad referencial histórica. | Coordinador |
| **RF-12** | Bandeja de Solicitudes Web | Panel de administración de leads entrantes con capacidad de cambio de estado (*Pendiente, Atendida, Archivada*) y notas de seguimiento. | Coordinador |
| **RF-13** | Panel de Supervisión Global | Métricas consolidadas de proyectos activos, desarrolladores asignados, horas globales y tasa de incidentes. | Coordinador |

### 3.3. Módulo de Proyectos y Estructura WBS - Líder (RF-14 a RF-20)
| Código | Nombre | Descripción Técnica Detallada | Actor Primario |
| :--- | :--- | :--- | :--- |
| **RF-14** | Creación de Proyectos | Registro de proyectos con nombre, descripción, cliente, fechas estimadas de inicio/fin, presupuesto y líder asignado. | Líder |
| **RF-15** | Asignación de Desarrolladores | Vinculación N:M de colaboradores al proyecto con control de horas máximas semanales para prevenir sobreasignación. | Líder |
| **RF-16** | Desglose WBS por Etapas | Configuración secuencial de fases del proyecto (ej. Análisis, Arquitectura, Backend, Frontend, QA, Despliegue). | Líder |
| **RF-17** | Gestión de Actividades Granulares | Creación de tareas asignadas a desarrolladores específicos con estimación de horas, fecha límite y descripción funcional. | Líder |
| **RF-18** | Rebalanceo de Cargas | Reasignación rápida de actividades entre desarrolladores para mitigar alertas generadas por el predictor de fatiga. | Líder |
| **RF-19** | Semáforo Inteligente de Riesgos | Algoritmo que calcula el nivel de riesgo de un proyecto según el porcentaje de errores críticos y desvío de cronograma. | Líder |
| **RF-20** | Liquidación de Proyecto | Cierre formal de proyecto con consolidación de balance de horas reales vs presupuestadas y generación de reporte final. | Líder |

### 3.4. Módulo Operacional del Desarrollador (RF-21 a RF-27)
| Código | Nombre | Descripción Técnica Detallada | Actor Primario |
| :--- | :--- | :--- | :--- |
| **RF-21** | Tablero de Trabajo Personal | Visualización de actividades asignadas ordenadas por prioridad, estado y fecha de entrega inminente. | Desarrollador |
| **RF-22** | Registro de Progreso y Horas | Actualización de porcentaje de avance (0-100%) y horas invertidas por sesión de trabajo sobre la actividad. | Desarrollador |
| **RF-23** | Reporte de Incidencias Técnicas | Formulario de registro de errores con severidad (*BAJA, MEDIA, ALTA, CRÍTICA*), descripción y traza de error. | Desarrollador |
| **RF-24** | Registro de Interrupciones | Auditoría de contingencias operativas no programadas (reuniones de emergencia, fallas de infraestructura, soporte). | Desarrollador |
| **RF-25** | Historial de Trazabilidad | Consulta de todas las incidencias reportadas con filtros por fecha, estado de resolución y actividad vinculada. | Desarrollador |
| **RF-26** | Inyector de Snippets | Búsqueda difusa automática de soluciones de código ante la redacción del título o descripción de una incidencia. | Desarrollador |
| **RF-27** | Perfil y Rendimiento | Panel personal con estadísticas de cumplimiento de tareas, promedio de horas y tasa de resolución de incidencias. | Desarrollador |

### 3.5. Alianza Internacional Brasil & Protocolo ETL (RF-28 a RF-31)
| Código | Nombre | Descripción Técnica Detallada | Actor Primario |
| :--- | :--- | :--- | :--- |
| **RF-28** | Pipeline Batch ETL | Proceso automatizado de extracción, transformación y limpieza de actividades operacionales para liquidación internacional. | Sistema |
| **RF-29** | Formato Plano ISO 8601 UTC | Estructuración de archivo delimitado por tuberías (`|`) con todas las marcas temporales convertidas al huso horario UTC. | Sistema |
| **RF-30** | Sellado de Integridad SHA-256 | Generación y estampado de hash criptográfico de 256 bits en el encabezado del lote para garantizar la no alteración del archivo. | Sistema |
| **RF-31** | Transmisión SFTP Asíncrona | Canal de transferencia segura sobre SSH puerto 2222 con clave RSA de 4096 bits y reintentos automáticos con backoff exponencial. | Sistema |

### 3.6. Innovaciones Transversales (RF-32 a RF-36)
| Código | Nombre | Descripción Técnica Detallada | Actor Primario |
| :--- | :--- | :--- | :--- |
| **RF-32** | Chat Corporativo en Tiempo Real | Canal de mensajería interna entre miembros del equipo con persistencia de historial en PostgreSQL. | Todos |
| **RF-33** | Biblioteca Digital de Documentos | Repositorio central de documentación con visor interactivo de hoja A4, modo terminal y exportador de PDFs en cliente. | Todos |
| **RF-34** | Tutoriales Multimedia | Catálogo de guías audiovisuales y tutoriales interactivos para capacitación e inducción de nuevos miembros. | Todos |
| **RF-35** | Predictor capacity.pulse | Algoritmo matemático con 7 CTEs deslizantes en PostgreSQL para la detección temprana de estrés y sobrecarga cognitiva. | Líder / Coord |
| **RF-36** | Motor Snippet.inject | Búsqueda de alta velocidad basada en trigramas (`pg_trgm`) sobre catálogo de micro-snippets técnicos con scoring de similitud. | Desarrollador |

---

## 4. MATRIZ DE REQUERIMIENTOS NO FUNCIONALES (RNF-01 AL RNF-15)

1. **RNF-01 (Capacidad de Procesamiento):** El backend debe procesar al menos 6,000 solicitudes por segundo en endpoints pesados con latencia media inferior a 100 ms.
2. **RNF-02 (Concurrencia de Conexiones):** El pool de conexiones HikariCP debe absorber 500 conexiones concurrentes sostenidas sin fugas de memoria ni tiempos de espera agotados.
3. **RNF-03 (Seguridad JWT):** Los tokens deben firmarse con HMAC-SHA256 utilizando secretos de al menos 256 bits, sin persistir estado de sesión en memoria del servidor.
4. **RNF-04 (Criptografía de Contraseñas):** Las credenciales deben ser procesadas con algoritmo BCrypt con factor de costo 10 (mínimo 10 rondas de salt).
5. **RNF-05 (Gestor de Paquetes Estricto):** Se prohíbe el uso de `npm` y `yarn`. Toda la gestión de dependencias debe realizarse exclusivamente con **`pnpm`**.
6. **RNF-06 (Diseño Adaptativo):** La interfaz debe responder fluidamente a pantallas móviles (360px), tablets (768px), laptops (1024px) y monitores 4K (2160px).
7. **RNF-07 (Accesibilidad y Contraste):** Cumplimiento estricto del estándar WCAG 2.1 Nivel AA en todos los contrastes de color para modo claro y oscuro.
8. **RNF-08 (Motor de Persistencia):** Uso obligatorio de PostgreSQL 16+ con integridad referencial ACID estricta y extensión `pg_trgm` activada.
9. **RNF-09 (Manejo de Errores RFC 7807):** Toda excepción no controlada debe responder con la estructura estándar `ProblemDetail` de HTTP API.
10. **RNF-10 (Aislamiento Transaccional):** El registro de auditoría de incidentes debe ejecutarse con `Propagation.REQUIRES_NEW` para evitar rollbacks inducidos.
11. **RNF-11 (Optimización de Bundles):** El código JavaScript generado por Vite no debe superar 500 KB por chunk principal tras compresión gzip.
12. **RNF-12 (Trazabilidad Temporal UTC):** Todas las marcas temporales en base de datos deben almacenarse con zona horaria (`TIMESTAMP WITH TIME ZONE`) y servirse en ISO 8601 UTC.
13. **RNF-13 (Latencia de Búsqueda Predictiva):** Las consultas de autocompletado en biblioteca y snippets deben responder en menos de 50 ms con un debounce de 200 ms.
14. **RNF-14 (Modularidad de Código):** Separación estricta de responsabilidades entre Capa de Presentación (React), Capa de Controladores (REST), Capa de Servicio (Lógica) y Capa de Datos (JPA).
15. **RNF-15 (Documentación API OpenAPI 3.0):** La API REST debe estar completamente documentada bajo especificación Swagger / OpenAPI 3.0 accesible en `/swagger-ui.html`.
$DOC_TAG_1$ WHERE id_documento = 1;

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_2$# ESPECIFICACIÓN FORMAL DE ARQUITECTURA DE SOFTWARE N-CAPAS & MICROSERVICIOS
**Proyecto:** Plataforma IKernell Enterprise Core  
**Estilo Arquitectónico:** N-Capas Desacopladas (React SPA + Spring Boot REST + PostgreSQL Engine)  
**Versión:** 2.5 | **Estado:** Aprobado para Producción  
**Autor:** Consejo de Arquitectura de Software IKernell  

---

## 1. VISIÓN GENERAL DE LA ARQUITECTURA
La arquitectura de **IKernell** está fundamentada en el principio de separación estricta de responsabilidades (*Separation of Concerns*) y bajo acoplamiento con alta cohesión. El sistema desacopla totalmente la capa de presentación de la capa de cómputo y persistencia, garantizando mantenibilidad, alta disponibilidad y capacidad de escalamiento horizontal.

```text
+-------------------------------------------------------------------------------+
|                       CAPA 1: PRESENTACIÓN (REACT 18 SPA)                     |
|  - React 18.3 con Functional Components, Hooks (useApi, useDebounce, useAuth)  |
|  - Tailwind CSS 3.4 (Design Tokens: Blue Accent / Zinc Neutrals / Dark Mode)  |
|  - Framer Motion (Transiciones y micro-animaciones aceleradas por GPU)        |
|  - jsPDF + ReactMarkdown (Motor dual de renderizado y exportación de PDFs)    |
+---------------------------------------+---------------------------------------+
                                        | HTTPS / JSON (Bearer JWT HMAC-SHA256)
                                        v
+-------------------------------------------------------------------------------+
|                 CAPA 2: SEGURIDAD Y ENTRADA (SPRING SECURITY 6)               |
|  - SecurityFilterChain (CORS Config, CSRF Disabled, Stateless Session)        |
|  - JwtAuthenticationFilter (Extracción, verificación de firma y claims)       |
|  - SecurityContextHolder (Inyección de UsernamePasswordAuthenticationToken)    |
+---------------------------------------+---------------------------------------+
                                        | Despacho a Controladores
                                        v
+-------------------------------------------------------------------------------+
|                   CAPA 3: CONTROLADORES REST (SPRING MVC REST)                |
|  - Endpoints: /api/auth, /api/coordinador, /api/lider, /api/desarrollador     |
|  - Endpoints Analíticos: /api/analitica/burnout, /api/biblioteca, /api/snippets|
|  - Validación Bean Validation (JSR-380: @Valid, @NotNull, @Email, @NotBlank)  |
|  - GlobalExceptionHandler (@RestControllerAdvice -> RFC 7807 ProblemDetail)  |
+---------------------------------------+---------------------------------------+
                                        | Invocación de Métodos de Negocio
                                        v
+-------------------------------------------------------------------------------+
|                   CAPA 4: SERVICIOS DE NEGOCIO (SPRING SERVICE)               |
|  - Reglas de Negocio Empresariales (RF-01 a RF-36)                            |
|  - Transaccionalidad Declarativa (@Transactional readOnly=true / REQUIRES_NEW)|
|  - Algoritmo Predictivo capacity.pulse & Orquestador de Lotes ETL Brasil       |
+---------------------------------------+---------------------------------------+
                                        | Spring Data JPA / Hibernate 6
                                        v
+-------------------------------------------------------------------------------+
|                  CAPA 5: ACCESO A DATOS Y PERSISTENCIA (RDBMS)                |
|  - HikariCP Connection Pool (30 Conexiones Máximas, 20s Leak Detection)       |
|  - Repositorios Spring Data JPA con Consultas Nativas y Funciones de Ventana   |
|  - PostgreSQL 16 Engine (pg_trgm Trigrams, GIN Indexes, Foreign Key Cascades) |
+-------------------------------------------------------------------------------+
```

---

## 2. DESGLOSE TÉCNICO DE CADA CAPA

### 2.1. Capa de Presentación (Frontend Client-Side)
- **Tecnologías:** React 18, Vite 5, Tailwind CSS 3.4, Framer Motion, Axios, jsPDF, ReactMarkdown.
- **Custom Hooks:**
  - `useApi()`: Provee métodos HTTP autenticados (`get`, `post`, `put`, `patch`, `delete`), intercepta respuestas de error `401 Unauthorized` para desloguear al usuario limpiamente y renueva tokens en segundo plano.
  - `useDebounce()`: Optimiza el consumo de red en búsquedas predictivas retrasando peticiones 200 ms.
  - `useAuth()`: Administra el estado global de autenticación, decodifica claims del token JWT y expone helpers `hasRole('COORDINADOR')`.

### 2.2. Capa de Seguridad (Spring Security 6)
- **Cadena de Filtros (`SecurityFilterChain`):**
  - Deshabilitación explícita de CSRF debido al modelo Stateless de la API.
  - Configuración CORS granular para permitir solicitudes cruzadas seguras desde dominios autorizados.
  - Protección de rutas con coincidencia de patrones:
    - `/api/auth/**`, `/api/public/**`: Públicos.
    - `/api/coordinador/**`: Requiere `ROLE_COORDINADOR`.
    - `/api/lider/**`: Requiere `ROLE_LIDER`.
    - `/api/desarrollador/**`: Requiere `ROLE_DESARROLLADOR`.
    - `/api/analitica/**`, `/api/biblioteca/**`: Requiere usuario autenticado.

### 2.3. Capa de Controladores REST (Controllers)
- Diseñados siguiendo los principios de inyección por constructor.
- Implementación de `@RestControllerAdvice` con `GlobalExceptionHandler` que captura `MethodArgumentNotValidException`, `EntityNotFoundException`, `AccessDeniedException` y `DataIntegrityViolationException`, transformándolas en respuestas estándar **RFC 7807 Problem Details**:
  ```json
  {
    "type": "https://ikernell.org/errors/bad-request",
    "title": "Error de Validación en Entrada",
    "status": 400,
    "detail": "El campo 'email' debe tener un formato válido de correo RFC 5322",
    "instance": "/api/coordinador/trabajadores"
  }
  ```

### 2.4. Capa de Servicios de Negocio (Business Services)
- Encapsula toda la lógica de negocio y validación de reglas de la empresa.
- **Estrategia Transaccional:**
  - Consultas y lecturas: `@Transactional(readOnly = true)`. Hibernate desactiva el dirty-checking en las entidades administradas, optimizando el rendimiento de memoria en un 40%.
  - Guardado de incidencias: `@Transactional(propagation = Propagation.REQUIRES_NEW)`. Se crea una transacción física independiente en PostgreSQL para garantizar que el log de auditoría nunca se pierda ante excepciones en otros componentes.

### 2.5. Capa de Persistencia y Pool HikariCP
- **Configuración en `application.properties`:**
  ```properties
  spring.datasource.hikari.pool-name=IKernellHikariPool
  spring.datasource.hikari.maximum-pool-size=30
  spring.datasource.hikari.minimum-idle=10
  spring.datasource.hikari.connection-timeout=30000
  spring.datasource.hikari.idle-timeout=600000
  spring.datasource.hikari.max-lifetime=1800000
  spring.datasource.hikari.leak-detection-threshold=20000
  spring.jpa.open-in-view=false
  ```
- **Optimizaciones de Rendimiento:** Las consultas analíticas intensivas utilizan expresiones de tabla comunes (CTEs) y funciones de ventana procesadas nativamente por PostgreSQL.
$DOC_TAG_2$ WHERE id_documento = 2;

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_3$# MODELO RELACIONAL POSTGRESQL, ÍNDICES GIN Y DICCIONARIO DDL
**Proyecto:** Base de Datos Corporativa IKernell  
**Motor:** PostgreSQL 16.x / 18.x  
**Versión:** 3.5 | **Esquema:** `public` (backend_db)  
**Normalización:** Tercera Forma Normal (3FN)  

---

## 1. VISIÓN GENERAL DEL MODELO DE DATOS
La base de datos de IKernell contiene 16 tablas relacionales diseñadas para cumplir con los estándares de integridad ACID, cero redundancia de datos y soporte para analítica temporal en tiempo real.

```text
               +--------------------+
               |     TRABAJADOR     |
               +---------+----------+
                         | 1:N
       +-----------------+-----------------+-----------------+
       |                                   |                 |
       v                                   v                 v
+--------------+                   +---------------+ +---------------+
|   PROYECTO   |                   |  PROY_DESARR  | | MENSAJE_CHAT  |
+------+-------+                   +---------------+ +---------------+
       | 1:N
       v
+--------------+
|    ETAPA     |
+------+-------+
       | 1:N
       v
+--------------+
|  ACTIVIDAD   |
+------+-------+
       | 1:N
       +-----------------------------------+
       |                                   |
       v                                   v
+--------------+                   +---------------+
|    ERROR     |                   | INTERRUPCION  |
+--------------+                   +---------------+
```

---

## 2. ESPECIFICACIÓN DDL DE TODAS LAS TABLAS CORE

### 2.1. Habilitación de Extensiones
```sql
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2.2. Tabla: `trabajador` (Usuarios y Roles RBAC)
```sql
CREATE TABLE trabajador (
    id_trabajador BIGSERIAL PRIMARY KEY,
    identificacion VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profesion VARCHAR(100) DEFAULT 'Ingeniero de Software',
    especialidad VARCHAR(150) DEFAULT 'General',
    foto_url VARCHAR(500),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('COORDINADOR', 'LIDER', 'DESARROLLADOR')),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_nacimiento DATE,
    direccion VARCHAR(255)
);

CREATE INDEX idx_trabajador_email ON trabajador(email);
CREATE INDEX idx_trabajador_rol ON trabajador(rol);
```

### 2.3. Tabla: `proyecto` (Proyectos de Software)
```sql
CREATE TABLE proyecto (
    id_proyecto BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    cliente VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    fecha_fin_real DATE,
    presupuesto NUMERIC(12,2) DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'EN_PLANIFICACION',
    lider_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE RESTRICT
);

CREATE INDEX idx_proyecto_lider ON proyecto(lider_id);
CREATE INDEX idx_proyecto_estado ON proyecto(estado);
```

### 2.4. Tabla: `proyecto_desarrollador` (Asignación N:M)
```sql
CREATE TABLE proyecto_desarrollador (
    id_asignacion BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rol_en_proyecto VARCHAR(50) DEFAULT 'Desarrollador Full Stack',
    horas_asignadas INT DEFAULT 40,
    CONSTRAINT uq_proyecto_desarrollador UNIQUE (proyecto_id, desarrollador_id)
);
```

### 2.5. Tabla: `etapa` (Fases WBS)
```sql
CREATE TABLE etapa (
    id_etapa BIGSERIAL PRIMARY KEY,
    proyecto_id BIGINT NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    orden INT NOT NULL DEFAULT 1,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(30) DEFAULT 'PENDIENTE'
);

CREATE INDEX idx_etapa_proyecto ON etapa(proyecto_id);
```

### 2.6. Tabla: `actividad` (Tareas Granulares WBS)
```sql
CREATE TABLE actividad (
    id_actividad BIGSERIAL PRIMARY KEY,
    etapa_id BIGINT NOT NULL REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    desarrollador_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    horas_estimadas NUMERIC(6,2) NOT NULL DEFAULT 8.0,
    horas_reales NUMERIC(6,2) DEFAULT 0.0,
    porcentaje_avance INT NOT NULL DEFAULT 0 CHECK (porcentaje_avance BETWEEN 0 AND 100),
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha_limite DATE,
    fecha_completada TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_actividad_desarrollador ON actividad(desarrollador_id);
CREATE INDEX idx_actividad_etapa ON actividad(etapa_id);
```

### 2.7. Tabla: `error` (Incidencias Técnicas)
```sql
CREATE TABLE error (
    id_error BIGSERIAL PRIMARY KEY,
    actividad_id BIGINT NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
    horas_invertidas_solucion NUMERIC(6,2) DEFAULT 1.0,
    resuelto BOOLEAN NOT NULL DEFAULT FALSE,
    solucion TEXT,
    fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_error_desarrollador_fecha ON error(desarrollador_id, fecha_reporte DESC);
```

### 2.8. Tabla: `interrupcion` (Bloqueos Operativos)
```sql
CREATE TABLE interrupcion (
    id_interrupcion BIGSERIAL PRIMARY KEY,
    actividad_id BIGINT NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    desarrollador_id BIGINT NOT NULL REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    motivo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    horas_perdidas NUMERIC(6,2) NOT NULL DEFAULT 1.0,
    fecha_interrupcion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interrupcion_desarrollador_fecha ON interrupcion(desarrollador_id, fecha_interrupcion DESC);
```

### 2.9. Tabla: `micro_snippet` (Catálogo de Código Reutilizable)
```sql
CREATE TABLE micro_snippet (
    id_snippet BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    tags_busqueda TEXT NOT NULL,
    codigo_solucion TEXT NOT NULL,
    lenguaje VARCHAR(50) NOT NULL,
    comando_consola BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_micro_snippet_trgm ON micro_snippet USING gin (tags_busqueda gin_trgm_ops);
```

### 2.10. Tabla: `documento_biblioteca` (Repositorio Digital RF-33)
```sql
CREATE TABLE documento_biblioteca (
    id_documento BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    archivo_url VARCHAR(500),
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subido_por_id BIGINT REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    descripcion TEXT,
    version VARCHAR(20) DEFAULT 'v1.0',
    formato VARCHAR(20) DEFAULT 'PDF',
    contenido_texto TEXT
);

CREATE INDEX idx_documento_categoria ON documento_biblioteca(categoria);
CREATE INDEX idx_documento_fecha ON documento_biblioteca(fecha_subida DESC);
```
$DOC_TAG_3$ WHERE id_documento = 3;

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_4$# PLAYBOOK DE RESOLUCIÓN DE INCIDENCIAS & SNIPPETS TÉCNICOS
**Proyecto:** Guía Operacional de SRE & Soporte N2/N3  
**Clasificación:** Procedimientos de Contingencia  
**Versión:** 2.5 | **Estado:** Vigente  

---

## 1. PROCEDIMIENTOS ANTE ERRORES CRÍTICOS EN PRODUCCIÓN

### 1.1. Incidencia 1: Deadlocks y Fallas en Transacciones Anidadas
- **Diagnóstico:** Excepción `org.postgresql.util.PSQLException: ERROR: deadlock detected` o rollback total del registro de incidencias al fallar la tarea principal.
- **Causa Raíz:** Propagación transaccional `REQUIRED` por defecto que fusiona el registro de error en el mismo contexto transaccional en fallo.
- **Procedimiento de Solución:** Aislar el guardado de la entidad `Error` mediante `Propagation.REQUIRES_NEW` en un servicio dedicado:
  ```java
  @Service
  public class ErrorLogService {
      @Autowired
      private ErrorRepository errorRepository;

      @Transactional(propagation = Propagation.REQUIRES_NEW)
      public Error registrarIncidenciaCritica(Error error) {
          return errorRepository.save(error);
      }
  }
  ```

### 1.2. Incidencia 2: Bloqueo de Peticiones CORS Preflight (OPTIONS)
- **Diagnóstico:** Los navegadores rechazan llamadas a endpoints con cabecera `Authorization` mostrando `CORS Missing Allow Header`.
- **Procedimiento de Solución:** Configurar explícitamente `CorsConfigurationSource` en Spring Security permitiendo los métodos HTTP necesarios y la cabecera `Authorization`:
  ```java
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration configuration = new CorsConfiguration();
      configuration.setAllowedOrigins(List.of("http://localhost:5173", "https://app.ikernell.org"));
      configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
      configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
      configuration.setAllowCredentials(true);
      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", configuration);
      return source;
  }
  ```

### 1.3. Incidencia 3: Saturación de Conexiones en HikariCP Pool
- **Diagnóstico:** Excepción `Connection is not available, request timed out after 30000ms`.
- **Comando de Diagnóstico en BD:**
  ```sql
  SELECT pid, now() - query_start AS duracion, usename, state, query 
  FROM pg_stat_activity 
  WHERE state != 'idle' AND datname = 'backend_db' 
  ORDER BY duracion DESC;
  ```
- **Mitigación:** Asegurar que `spring.jpa.open-in-view=false` esté configurado en `application.properties` para liberar las conexiones de base de datos inmediatamente después de ejecutar el servicio.

### 1.4. Incidencia 4: Optimización de Búsqueda Difusa con pg_trgm
- **Diagnóstico:** Búsqueda difusa que omite resultados cuando el término buscado es corto comparado con la cadena de tags.
- **Query Nativa Optimizada:**
  ```sql
  SELECT id_snippet, titulo, codigo_solucion, lenguaje,
         GREATEST(similarity(tags_busqueda, :termino), word_similarity(:termino, tags_busqueda)) AS score
  FROM micro_snippet
  WHERE similarity(tags_busqueda, :termino) > 0.10
     OR word_similarity(:termino, tags_busqueda) > 0.30
     OR tags_busqueda ILIKE CONCAT('%', :termino, '%')
  ORDER BY score DESC LIMIT 5;
  ```

---

## 2. GUÍA DE COMANDOS DE DIAGNÓSTICO EN SERVIDORES
- **Inspección de Puertos:** `ss -tulpn | grep -E '8080|5173|5432'`
- **Monitoreo de Logs de Spring Boot:** `tail -f logs/spring-boot.log | grep -E 'ERROR|WARN|HikariPool'`
- **Prueba de Estrés con Autocannon:** `pnpx autocannon -c 100 -d 15 http://localhost:8080/api/snippets/sugerencias?termino=react`
$DOC_TAG_4$ WHERE id_documento = 4;

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_5$# MANUAL DE INTEGRACIÓN Y FORMATO PLANO ISO 8601 UTC BRASIL (RF-28 a RF-31)
**Proyecto:** Protocolo de Interoperabilidad Financiera Internacional  
**Estándar:** ISO 8601 UTC / Delimitado por Tuberías (Pipe-Delimited)  
**Versión:** 2.0 | **Estado:** Activo en Producción  

---

## 1. OBJETIVO DEL PROTOCOLO DE INTERCAMBIO
Garantizar la exportación periódica, atómica y segura de los registros de actividades operacionales, balance de horas, errores técnicos y métricas de desempeño desde el nodo central de IKernell hacia la plataforma de compensación financiera en São Paulo, Brasil.

---

## 2. ESPECIFICACIÓN DEL FORMATO PLANO

### 2.1. Reglas Estrictas de Estructura de Archivo
1. **Codificación:** UTF-8 estricto sin marca de orden de bytes (BOM).
2. **Fin de Línea:** Salto de línea estándar Unix (`\n` / LF).
3. **Delimitador de Campos:** Carácter Pipe (`|`), ASCII 124.
4. **Formato de Marcas Temporales:** ISO 8601 en Horario Universal Coordinado (UTC) exacto: `YYYY-MM-DDTHH:mm:ssZ` (ejemplo: `2026-08-13T13:45:00Z`).
5. **Formato Numérico:** Punto decimal (`.`), sin separadores de miles (ejemplo: `1250.50`).

### 2.2. Estructura del Header del Lote (Fila 1)
```text
BATCH_HEADER|LOTE_ID|CANTIDAD_REGISTROS|TIMESTAMP_GENERACION_UTC|SUMATORIA_CONTROL_SHA256
```

### 2.3. Estructura de Registros de Detalle (Filas 2 a N)
```text
DETALLE|ID_ACTIVIDAD|ID_DESARROLLADOR|NOMBRE_PROYECTO|HORAS_ESTIMADAS|HORAS_REALES|TOTAL_ERRORES|TOTAL_INTERRUPCIONES|ESTADO|FECHA_REGISTRO_UTC
```

### 2.4. Estructura del Footer del Lote (Última Fila)
```text
BATCH_FOOTER|LOTE_ID|TOTAL_HORAS_ACUMULADAS|HASH_VERIFICACION_FINAL
```

---

## 3. EJEMPLO REAL DE LOTE DELIMITADO EXPORTADO
```text
BATCH_HEADER|LT-2026-BR-089|3|2026-08-13T12:00:00Z|8f4b23c9e1d5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
DETALLE|101|6|Facturación Cloud & ETL Brasil|40.00|46.50|5|3|COMPLETADA|2026-08-10T15:30:00Z
DETALLE|102|9|Core Bancario & Microservicios Cloud|35.00|38.20|3|2|EN_PROGRESO|2026-08-11T18:45:00Z
DETALLE|103|11|App Móvil Fintech & Billetera Digital|20.00|19.50|0|1|COMPLETADA|2026-08-12T09:15:00Z
BATCH_FOOTER|LT-2026-BR-089|104.20|VALIDATED_OK
```

---

## 4. PIPELINE DE EJECUCIÓN CON SPRING BATCH (JOB ETL)
```java
@Configuration
public class AlianzaBrasilEtlConfig {

    @Bean
    public Step exportarLoteIso8601Step(JobRepository jobRepository, 
                                        PlatformTransactionManager transactionManager,
                                        ItemReader<ActividadBrasilDto> reader,
                                        ItemProcessor<ActividadBrasilDto, String> processor,
                                        FlatFileItemWriter<String> writer) {
        return new StepBuilder("exportarLoteIso8601Step", jobRepository)
                .<ActividadBrasilDto, String>chunk(100, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }
}
```
$DOC_TAG_5$ WHERE id_documento = 5;

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_6$# GUÍA DE ESTÁNDARES DE CÓDIGO, PNPM Y CLEAN ARCHITECTURE
**Proyecto:** Estándares Oficiales de Ingeniería Frontend & Backend  
**Herramientas Obligatorias:** pnpm, React 18, Tailwind CSS, Spring Boot 3  
**Versión:** 2.5 | **Estado:** Obligatorio  

---

## 1. REGLA INQUEBRANTABLE: GESTIÓN DE PAQUETES CON PNPM

> 🛑 **PROHIBICIÓN ESTRICTA DE NPM Y YARN**  
> En el ecosistema de IKernell está terminantemente prohibido ejecutar `npm install`, `npm run` o `yarn`. Toda gestión de dependencias y scripts debe ejecutarse exclusivamente con **`pnpm`** (o `pnpx`).

### 1.1. Justificación Técnica
- **Aislamiento de Dependencias no Declaradas (Phantom Dependencies):** `pnpm` utiliza un árbol de dependencias basado en enlaces simbólicos (*hard links / symlinks*), impidiendo que el código importe paquetes no declarados en `package.json`.
- **Ahorro Masivo de Disco:** Los paquetes se almacenan en un *Global Content-Addressable Store* central, reutilizando binarios en múltiples proyectos.
- **Rendimiento de Instalación:** Hasta 3 veces más rápido que npm en la resolución e instalación de dependencias en frío.

### 1.2. Comandos Homologados
| Tarea | Comando Válido (pnpm) | Comando Prohibido |
| :--- | :--- | :--- |
| Instalar dependencias | `pnpm install` | ~~`npm install`~~ |
| Añadir librería | `pnpm add <paquete>` | ~~`npm i <paquete>`~~ |
| Añadir devDependency | `pnpm add -D <paquete>` | ~~`npm i -D <paquete>`~~ |
| Iniciar servidor de desarrollo | `pnpm dev` o `pnpm run dev` | ~~`npm run dev`~~ |
| Compilar para producción | `pnpm build` | ~~`npm run build`~~ |
| Ejecutar herramientas CLI | `pnpx <herramienta>` | ~~`npx <herramienta>`~~ |

---

## 2. ESTÁNDARES DE CODIFICACIÓN FRONTEND (REACT 18 + TAILWIND)

### 2.1. Estructura de Directorios
```text
frontend/src/
├── assets/          # Imágenes vectoriales, favicons y logos
├── components/      # Componentes UI reutilizables
│   ├── auth/        # Guards y rutas protegidas RBAC
│   ├── dashboard/   # Widgets analíticos (PredictorBurnout, Semaforo)
│   ├── layout/      # Navbar, Header, Sidebar, DashboardLayout
│   ├── public/      # Secciones de la Landing Page (Hero, Servicios, FAQ)
│   └── tools/       # Herramientas transversales (Biblioteca, Chat, Tutoriales)
├── context/         # AuthContext y ThemeContext globales
├── hooks/           # Custom hooks (useApi, useDebounce, useTheme)
├── pages/           # Vistas de ruta (Landing, Login, Coordinador, Líder, Dev)
└── services/        # Clientes de API y peticiones Axios
```

### 2.2. Paleta de Colores Corporativa y Psicología del Color
- **Acento Primario (Azul Corporativo):** Simboliza seguridad, calma y alta tecnología.
  - Botones principales: `bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white`
  - Bordes interactivos: `hover:border-blue-400 dark:hover:border-blue-500`
  - Sombras con brillo: `hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]`
- **Superficies Neutras (Zinc Palette):**
  - Fondo Claro: `bg-zinc-50` / Fondo Oscuro: `dark:bg-zinc-950`
  - Tarjetas Claras: `bg-white border-zinc-200` / Tarjetas Oscuras: `dark:bg-zinc-900 dark:border-zinc-800`
- **Textos Dinámicos (Sin Hardcoding):**
  - Títulos principales: `text-zinc-900 dark:text-zinc-100`
  - Textos secundarios: `text-zinc-500 dark:text-zinc-400`
  - Textos terciarios / fechas: `text-zinc-400 dark:text-zinc-500`
$DOC_TAG_6$ WHERE id_documento = 6;

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_7$# MANUAL DE CIBERSEGURIDAD, RBAC Y POLÍTICAS OWASP 2026
**Proyecto:** Gobernanza de Seguridad de la Información  
**Estándar:** OWASP Top 10 (2026) / NIST SP 800-63B  
**Versión:** 2.5 | **Estado:** Aprobado para Producción  

---

## 1. CONTROL DE ACCESO BASADO EN ROLES (RBAC MATRIX)

IKernell implementa un modelo de autorización estricto de menor privilegio (*Principle of Least Privilege*) mediante roles protegidos por anotaciones `@PreAuthorize` y filtros de Spring Security:

| Módulo / Operación | COORDINADOR | LÍDER DE PROYECTO | DESARROLLADOR | VISITANTE |
| :--- | :---: | :---: | :---: | :---: |
| **Landing Page & FAQ** | ✔ Permitido | ✔ Permitido | ✔ Permitido | ✔ Permitido |
| **Envío de Solicitud Web** | ✔ Permitido | ✔ Permitido | ✔ Permitido | ✔ Permitido |
| **Gestión de Personal (Alta/Baja)** | ✔ Exclusivo | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Bandeja de Solicitudes Leads** | ✔ Exclusivo | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Creación de Proyectos** | ❌ Bloqueado | ✔ Exclusivo | ❌ Bloqueado | ❌ Bloqueado |
| **Desglose WBS & Asignaciones** | ❌ Bloqueado | ✔ Exclusivo | ❌ Bloqueado | ❌ Bloqueado |
| **Semáforo Inteligente & Riesgos**| ✔ Lectura | ✔ Total | ❌ Bloqueado | ❌ Bloqueado |
| **Predictor de Burnout (Analítica)**| ✔ Total | ✔ Total | ❌ Bloqueado | ❌ Bloqueado |
| **Tablero WBS & Progreso Tareas** | ❌ Bloqueado | ✔ Supervisión | ✔ Asignadas | ❌ Bloqueado |
| **Reportar Errores / Bloqueos** | ❌ Bloqueado | ❌ Bloqueado | ✔ Exclusivo | ❌ Bloqueado |
| **Buscador Snippet.inject** | ✔ Lectura | ✔ Lectura | ✔ Total | ❌ Bloqueado |
| **Biblioteca Digital & Descargas**| ✔ Total | ✔ Total | ✔ Total | ❌ Bloqueado |

---

## 2. ARQUITECTURA DE AUTENTICACIÓN JWT STATELESS

```text
[Cliente React] --(1) POST /api/auth/login (email, password)--> [Spring Boot Auth]
[Cliente React] <--(2) 200 OK + JWT Token (HMAC-SHA256, 24h)--- [Spring Boot Auth]
[Cliente React] --(3) GET /api/coordinador/* + [Bearer Token]--> [JwtAuthFilter]
[Cliente React] <--(4) Valida Firma & Claims -> Ejecuta Controller-- [SecurityContext]
```

### 2.1. Estructura del Token JWT
- **Header:** `{"alg": "HS256", "typ": "JWT"}`
- **Payload Claims:**
  - `sub`: Correo corporativo del usuario (`carlos.lider@ikernell.org`)
  - `role`: Rol unificado con prefijo Spring (`ROLE_LIDER`, `ROLE_COORDINADOR`, `ROLE_DESARROLLADOR`)
  - `iat`: Timestamp de emisión en UTC
  - `exp`: Timestamp de expiración (24 horas = 86,400,000 ms)
- **Firma Criptográfica:** Firmado con clave secreta de 256 bits (`jwt.secret`).

---

## 3. PROTECCIÓN CONTRA OWASP TOP 10 (HARDENING)
1. **A01 - Broken Access Control:** Blindaje en backend mediante `@SecurityRequirement(name = "BearerAuth")` y validación de pertenencia de recursos por usuario autenticado.
2. **A02 - Cryptographic Failures:** Todas las contraseñas se almacenan cifradas con `BCryptPasswordEncoder(10)`. Ninguna contraseña en texto plano es registrada en logs o devuelta en respuestas DTO.
3. **A03 - Injection (SQL / HQL):** Prohibición absoluta de concatenación de strings en sentencias SQL. Todas las consultas utilizan parámetros nombrados (`@Param("variable")`) o Criteria API con Prepared Statements en el driver PostgreSQL.
4. **A05 - Security Misconfiguration:** Deshabilitación de listado de directorios estáticos, configuración de headers de seguridad HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
5. **A07 - Identification and Authentication Failures:** Prevención de fuerza bruta con validación estricta y bloqueo de endpoints administrativos.
$DOC_TAG_7$ WHERE id_documento = 7;

UPDATE documento_biblioteca SET contenido_texto = $DOC_TAG_8$# MATRIZ DE CAPACIDAD, CARGA COGNITIVA Y PREDICTOR DE BURNOUT (RF-35)
**Proyecto:** Algoritmo Matemático capacity.pulse  
**Motor:** PostgreSQL Native Window Functions & 7 Sliding CTEs  
**Versión:** 2.0 | **Estado:** Aprobado en Producción  

---

## 1. FUNDAMENTO CIENTÍFICO Y MATEMÁTICO DEL ALGORITMO
El componente **`capacity.pulse`** (RF-35) evalúa la salud técnica y cognitiva de los desarrolladores en tiempo real mediante el análisis temporal de tres variables operativas registradas en la base de datos:
1. **Frecuencia y Severidad de Errores Técnicos:** Ponderación del impacto cognitivo y frustración técnica.
2. **Horas Acumuladas de Interrupción:** Pérdida de foco y cambio de contexto (*context-switching penalty*).
3. **Volumen de Actividades WBS Simultáneas:** Sobrecarga de paralelismo y fechas límite inminentes.

---

## 2. MODELO TEMPORAL DE VENTANAS DESLIZANTES (21 DÍAS)

El algoritmo divide el histórico reciente de 21 días en tres sub-ventanas temporales continuas de 7 días:

```text
|<------------------------- VENTANA HISTÓRICA (21 DÍAS) ------------------------->|
|                                                                                |
| [ SEMANA 1 (S1) ]        | [ SEMANA 2 (S2) ]        | [ SEMANA 3 (S3) ]        |
| Días 15 a 21 atrás       | Días 8 a 14 atrás        | Últimos 7 días (HOY)     |
| (Línea Base Histórica)   | (Tendencia Intermedia)   | (Presión Reciente)       |
```

### 2.1. Tabla de Ponderación de Pesos
| Variable Operativa | Categoría / Magnitud | Peso Ponderado ($W_i$) |
| :--- | :--- | :---: |
| **Error Técnico** | Severidad `CRITICA` | **12.0 puntos** |
| **Error Técnico** | Severidad `ALTA` | **8.0 puntos** |
| **Error Técnico** | Severidad `MEDIA` | **4.0 puntos** |
| **Error Técnico** | Severidad `BAJA` | **1.0 punto** |
| **Interrupción** | Por cada 1.0 hora perdida | **1.5 puntos** |
| **Actividad Activa** | Tarea en progreso simultánea | **3.0 puntos** |

---

## 3. FÓRMULA DE CÁLCULO DE SCORE DE ESTRÉS POR VENTANA

Para cada sub-ventana $S_k$ ($k \in \{1, 2, 3\}$), el puntaje de sobrecarga se calcula como:

$$\text{Score}(S_k) = \min\left(100.0, \; \sum_{i} (E_{i,k} \cdot W_{E_i}) + (H_{int,k} \cdot 1.5) + (N_{act} \cdot 3.0)\right)$$

Donde:
- $E_{i,k}$: Cantidad de errores de severidad $i$ reportados en la ventana $k$.
- $H_{int,k}$: Horas totales de interrupción en la ventana $k$.
- $N_{act}$: Número de actividades WBS actualmente activas asignadas al desarrollador.

### 3.1. Índice de Aceleración y Detección de Desgaste
El factor de aceleración $\Delta$ compara la ventana crítica reciente ($S_3$) contra la línea base ($S_1$):

$$\Delta_{\text{estrés}} = \text{Score}(S_3) - \text{Score}(S_1)$$

### 3.2. Clasificación de Alertas del Semáforo
- 🟢 **`ESTABLE` (Score Promedio $< 40.0$ y $\Delta \le 15\%$):** Carga operativa equilibrada dentro de los parámetros de rendimiento óptimo. Capacidad disponible para nuevas asignaciones.
- 🟡 **`TENDENCIA_DE_ESTRES_ACELERADA` ($40.0 \le \text{Score} < 75.0$ o $\Delta > 20\%$):** Incremento sostenido de fricción técnica y contingencias. Sugerencia de revisión por el Líder de Proyecto.
- 🔴 **`RIESGO_BURNOUT_INMINENTE` ($\text{Score} \ge 75.0$ o $\Delta > 35\%$):** **Alerta Crítica**. Fatiga acumulada severa. El sistema sugiere rebalanceo automático de actividades WBS e inhabilita temporalmente la asignación de nuevas tareas de alta complejidad.

---

## 4. CONSULTA SQL NATIVA CON 7 CTES EN POSTGRESQL

```sql
WITH params AS (
    SELECT CURRENT_DATE AS hoy
),
semanas AS (
    SELECT 
        hoy - INTERVAL '21 days' AS s1_inicio, hoy - INTERVAL '14 days' AS s1_fin,
        hoy - INTERVAL '14 days' AS s2_inicio, hoy - INTERVAL '7 days' AS s2_fin,
        hoy - INTERVAL '7 days'  AS s3_inicio, hoy                      AS s3_fin
    FROM params
),
desarrolladores AS (
    SELECT id_trabajador, nombre, apellido, email, especialidad 
    FROM trabajador 
    WHERE rol = 'DESARROLLADOR' AND estado = TRUE
),
errores_calc AS (
    SELECT e.desarrollador_id,
        COALESCE(SUM(CASE WHEN e.fecha_reporte >= s.s1_inicio AND e.fecha_reporte < s.s1_fin 
            THEN (CASE e.severidad WHEN 'CRITICA' THEN 12 WHEN 'ALTA' THEN 8 WHEN 'MEDIA' THEN 4 ELSE 1 END) ELSE 0 END), 0) AS err_s1,
        COALESCE(SUM(CASE WHEN e.fecha_reporte >= s.s2_inicio AND e.fecha_reporte < s.s2_fin 
            THEN (CASE e.severidad WHEN 'CRITICA' THEN 12 WHEN 'ALTA' THEN 8 WHEN 'MEDIA' THEN 4 ELSE 1 END) ELSE 0 END), 0) AS err_s2,
        COALESCE(SUM(CASE WHEN e.fecha_reporte >= s.s3_inicio AND e.fecha_reporte <= s.s3_fin 
            THEN (CASE e.severidad WHEN 'CRITICA' THEN 12 WHEN 'ALTA' THEN 8 WHEN 'MEDIA' THEN 4 ELSE 1 END) ELSE 0 END), 0) AS err_s3
    FROM error e CROSS JOIN semanas s GROUP BY e.desarrollador_id
),
interrupciones_calc AS (
    SELECT i.desarrollador_id,
        COALESCE(SUM(CASE WHEN i.fecha_interrupcion >= s.s1_inicio AND i.fecha_interrupcion < s.s1_fin THEN i.horas_perdidas * 1.5 ELSE 0 END), 0) AS int_s1,
        COALESCE(SUM(CASE WHEN i.fecha_interrupcion >= s.s2_inicio AND i.fecha_interrupcion < s.s2_fin THEN i.horas_perdidas * 1.5 ELSE 0 END), 0) AS int_s2,
        COALESCE(SUM(CASE WHEN i.fecha_interrupcion >= s.s3_inicio AND i.fecha_interrupcion <= s.s3_fin THEN i.horas_perdidas * 1.5 ELSE 0 END), 0) AS int_s3
    FROM interrupcion i CROSS JOIN semanas s GROUP BY i.desarrollador_id
),
actividades_activas AS (
    SELECT a.desarrollador_id, COUNT(*) AS tareas_activas 
    FROM actividad a 
    WHERE a.estado != 'COMPLETADA' AND a.desarrollador_id IS NOT NULL 
    GROUP BY a.desarrollador_id
)
SELECT 
    d.id_trabajador AS idTrabajador,
    CONCAT(d.nombre, ' ', d.apellido) AS nombreCompleto,
    d.email AS email,
    d.especialidad AS especialidad,
    COALESCE(act.tareas_activas, 0) AS tareasActivas,
    LEAST(100.0, COALESCE(ec.err_s1, 0) + COALESCE(ic.int_s1, 0) + COALESCE(act.tareas_activas, 0) * 3.0) AS scoreSemana1,
    LEAST(100.0, COALESCE(ec.err_s2, 0) + COALESCE(ic.int_s2, 0) + COALESCE(act.tareas_activas, 0) * 3.0) AS scoreSemana2,
    LEAST(100.0, COALESCE(ec.err_s3, 0) + COALESCE(ic.int_s3, 0) + COALESCE(act.tareas_activas, 0) * 3.0) AS scoreSemana3
FROM desarrolladores d
LEFT JOIN errores_calc ec ON d.id_trabajador = ec.desarrollador_id
LEFT JOIN interrupciones_calc ic ON d.id_trabajador = ic.desarrollador_id
LEFT JOIN actividades_activas act ON d.id_trabajador = act.desarrollador_id
ORDER BY scoreSemana3 DESC;
```
$DOC_TAG_8$ WHERE id_documento = 8;

SELECT setval('documento_biblioteca_id_documento_seq', (SELECT MAX(id_documento) FROM documento_biblioteca));

DELETE FROM noticia;
INSERT INTO noticia (id_noticia, titulo, resumen, contenido, imagen_url, categoria, fecha_publicacion, autor_id)
VALUES 
  (1, 'IKernell Consolida Alianza Estratégica con Sector Financiero de Brasil', 'Se firma convenio para la transferencia automatizada de métricas operacionales bajo estándar ISO 8601.', 'En el marco de la expansión internacional, IKernell Soluciones Software ha integrado con éxito su módulo ETL de alta velocidad para la transmisión segura de registros operacionales hacia servidores en São Paulo.', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600', 'Corporativo', NOW() - INTERVAL '3 days', 5),
  (2, 'Lanzamiento del Motor Predictivo de Capacidad capacity.pulse', 'Innovación algorítmica con funciones de ventana en PostgreSQL para anticipar sobrecargas.', 'El nuevo componente analítico permite a los líderes de proyecto evaluar tendencias de estrés en ventanas de 21 días, optimizando la asignación de recursos y previniendo el agotamiento técnico.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', 'Innovación', NOW() - INTERVAL '7 days', 5),
  (3, 'Certificación de Seguridad CMMI Nivel 3 y Cumplimiento OWASP', 'IKernell supera auditoría internacional de calidad de código y resiliencia de datos.', 'Todas las APIs RESTful y componentes de persistencia han sido auditados con éxito, garantizando protección de datos y alta tolerancia a fallos.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600', 'Seguridad', NOW() - INTERVAL '14 days', 5);

SELECT setval('noticia_id_noticia_seq', (SELECT MAX(id_noticia) FROM noticia));

DELETE FROM tutorial;
INSERT INTO tutorial (id_tutorial, titulo, descripcion, video_url, categoria, fecha_creacion, autor_id)
VALUES 
  (1, 'Inducción: Flujo de Gestión de Actividades WBS en IKernell', 'Aprende a reportar avances, cambiar estados y documentar entregables en tu panel de desarrollador.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Inducción', NOW() - INTERVAL '15 days', 5),
  (2, 'Cómo Utilizar el Inyector de Snippets Técnicos (Snippet.inject)', 'Guía paso a paso para acelerar la resolución de incidencias con búsqueda difusa en caliente.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Desarrollo', NOW() - INTERVAL '10 days', 5),
  (3, 'Interpretación del Semáforo Inteligente de Riesgos para Líderes', 'Aprende a gestionar contingencias operacionales y evaluar la salud integral de tus proyectos.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Liderazgo', NOW() - INTERVAL '5 days', 5);

SELECT setval('tutorial_id_tutorial_seq', (SELECT MAX(id_tutorial) FROM tutorial));

COMMIT;
