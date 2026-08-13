-- ==============================================================================
-- SCRIPT DE SIEMBRA DE DATOS MASIVA (DATA SEEDING) - IKerneLL SOLUCIONES SOFTWARE
-- Stack: PostgreSQL 14+ con extensión pg_trgm
-- ==============================================================================

BEGIN;

-- 1. EXTENSIÓN PG_TRGM (Para Búsqueda Difusa Fuzzy en MicroSnippets)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. TRABAJADORES (COORDINADOR, LÍDERES Y DESARROLLADORES)
-- Contraseña estándar para todos los perfiles de prueba: 'password123'
-- Hash BCrypt: $2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6

INSERT INTO trabajador (id_trabajador, identificacion, nombre, apellido, fecha_nacimiento, direccion, profesion, especialidad, tipo_trabajador, foto_url, email, rol, password_hash, estado)
VALUES 
  (1, '1001001', 'Carlos', 'Gómez', '1985-04-12', 'Av. Empresarial 100', 'Ingeniero de Sistemas', 'Gestión de Proyectos', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'carlos.coordinador@ikernell.com', 'COORDINADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (2, '1001002', 'Ana', 'Martínez', '1988-08-23', 'Calle 45 # 12-30', 'Ingeniera de Software', 'Scrum Master & Cloud', 'PLANTA', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'ana.lider@ikernell.com', 'LIDER', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (3, '1001003', 'Luis', 'Pérez', '1992-11-05', 'Carrera 15 # 80-45', 'Desarrollador Full Stack', 'React & Spring Boot', 'CONTRATISTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'luis.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (4, '1001004', 'Marta', 'López', '1994-02-18', 'Av. Circunvalar 23-10', 'Desarrolladora Backend', 'Java & Microservicios', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'marta.dev@ikernell.com', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (5, '1001005', 'Carlos', 'Mendoza', '1986-06-15', 'Calle 100 # 19-40', 'Tech Lead & Arquitecto', 'Arquitectura Distribuida & Java 17', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'carlos.lider@ikernell.org', 'LIDER', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (6, '1001006', 'Ana', 'Gómez', '1993-09-20', 'Carrera 7 # 116-50', 'Desarrolladora Senior Full-Stack', 'React 18, Spring Boot 3 & PostgreSQL', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ana.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (7, '1001007', 'Roberto', 'Silva', '1980-03-10', 'Transversal 23 # 95-12', 'Coordinador General de Operaciones', 'Gestión de Proyectos & Auditoría CMMI', 'PLANTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'roberto.coord@ikernell.org', 'COORDINADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (8, '1001008', 'Elena', 'Rostova', '1989-12-01', 'Calle 127 # 53-10', 'Líder de Proyecto & Cloud Architect', 'Kubernetes, AWS & Microfrontends', 'PLANTA', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'elena.lider@ikernell.org', 'LIDER', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (9, '1001009', 'David', 'Valenzuela', '1995-05-14', 'Av. Boyacá # 72-15', 'Ingeniero Backend Senior', 'Java 17, JPA/Hibernate & Concurrencia', 'PLANTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'david.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (10, '1001010', 'Lucía', 'Morales', '1996-10-30', 'Carrera 68 # 45-20', 'Especialista UI/UX & Frontend Lead', 'React 18, Tailwind CSS & Framer Motion', 'PLANTA', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'lucia.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (11, '1001011', 'Mateo', 'Restrepo', '1994-07-22', 'Calle 80 # 11-45', 'Ingeniero de Datos & ETL Lead', 'PostgreSQL, Window Functions & Python', 'CONTRATISTA', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'mateo.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (12, '1001012', 'Sofía', 'Benítez', '1997-01-19', 'Calle 134 # 9-60', 'Ingeniera QA & Seguridad Aplicativa', 'Pruebas Automatizadas, Jest & OWASP', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'sofia.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true),
  (13, '1001013', 'Javier', 'Arboleda', '1991-04-03', 'Diagonal 45 # 22-80', 'Ingeniero DevOps & Resiliencia', 'Docker, CI/CD, Nginx & Monitoring', 'PLANTA', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'javier.dev@ikernell.org', 'DESARROLLADOR', '$2a$10$n/dMU9LngzX5waGY7YmROeHMC9OwvPxYq88WuGwmMel4D8edFrT.6', true)
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
INSERT INTO proyecto (id_proyecto, nombre, descripcion, fecha_inicio, fecha_fin_estimada, estado, lider_id)
VALUES 
  (1, 'Sistema Facturación Cloud & ETL Brasil', 'Plataforma empresarial para emisión de facturación electrónica y sincronización de métricas operacionales bajo estándar ISO 8601 hacia filiales en Brasil.', '2026-01-15', '2026-11-30', 'ACTIVO', 5),
  (2, 'Core Bancario & Microservicios Cloud', 'Modernización de la arquitectura financiera con servicios transaccionales idempotentes, seguridad stateless JWT y alta concurrencia.', '2026-02-01', '2026-12-15', 'ACTIVO', 5),
  (3, 'App Móvil Fintech & Billetera Digital', 'Billetera digital multiplataforma con pagos QR dinámicos, autenticación biométrica y transferencias interbancarias inmediatas.', '2026-03-01', '2026-10-30', 'ACTIVO', 8),
  (4, 'Plataforma Telemedicina & Triaje Inteligente', 'Sistema de atención médica virtual con streaming WebRTC de baja latencia, recetas digitales encriptadas y triaje automatizado.', '2026-04-10', '2026-09-30', 'ACTIVO', 8),
  (5, 'Migración ERP Empresarial & Data Warehouse', 'Migración masiva de base de datos legada hacia cluster PostgreSQL con pipelines de analítica predictiva en tiempo real.', '2025-06-01', '2026-01-30', 'COMPLETADO', 5)
ON CONFLICT (id_proyecto) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  fecha_inicio = EXCLUDED.fecha_inicio,
  fecha_fin_estimada = EXCLUDED.fecha_fin_estimada,
  estado = EXCLUDED.estado,
  lider_id = EXCLUDED.lider_id;

SELECT setval('proyecto_id_proyecto_seq', (SELECT MAX(id_proyecto) FROM proyecto));

-- 4. ASIGNACIONES DE DESARROLLADORES A PROYECTOS
DELETE FROM proyecto_desarrollador;

INSERT INTO proyecto_desarrollador (proyecto_id, desarrollador_id)
VALUES 
  (1, 6), (1, 9), (1, 11),           -- Proyecto 1: Ana Gómez, David Valenzuela, Mateo Restrepo
  (2, 6), (2, 9), (2, 12), (2, 13),   -- Proyecto 2: Ana Gómez, David Valenzuela, Sofía Benítez, Javier Arboleda
  (3, 6), (3, 10), (3, 11),          -- Proyecto 3: Ana Gómez, Lucía Morales, Mateo Restrepo
  (4, 10), (4, 12), (4, 13),         -- Proyecto 4: Lucía Morales, Sofía Benítez, Javier Arboleda
  (5, 9), (5, 11);                   -- Proyecto 5: David Valenzuela, Mateo Restrepo

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
  -- Asignaciones para Ana Gómez (id: 6) - Carga de trabajo intensa para predictor de capacidad
  (1001, 102, 6, 'Implementar firma digital XAdES con certificado corporativo RSA 2048-bit', 'EN_PROGRESO'),
  (1002, 102, 6, 'Construir generador de código QR fiscal para representación gráfica de factura', 'EN_PROGRESO'),
  (1003, 103, 6, 'Diseñar parser de exportación plana delimitada bajo norma internacional ISO 8601 UTC', 'EN_PROGRESO'),
  (1004, 202, 6, 'Refactorizar servicio de conciliación con aislamiento de transacciones REQUIRES_NEW', 'EN_PROGRESO'),
  (1005, 302, 6, 'Desarrollar consumidor Kafka para procesamiento asíncrono de eventos de pago QR', 'EN_PROGRESO'),
  (1006, 101, 6, 'Documentar contratos OpenAPI 3.0 para la API pública de facturación', 'FINALIZADA'),
  (1007, 201, 6, 'Crear entidades JPA para auditoría inmutable de transacciones financieras', 'FINALIZADA'),
  (1008, 104, 6, 'Ejecutar pruebas de carga con k6 simulando 1,500 peticiones concurrentes por segundo', 'PENDIENTE'),

  -- Asignaciones para David Valenzuela (id: 9) - Backend & Infra
  (2001, 102, 9, 'Optimizar consultas de cálculo de impuestos en lote con Native Queries y CTEs', 'EN_PROGRESO'),
  (2002, 202, 9, 'Implementar mecanismo de Circuit Breaker con Resilience4j en pasarela de pagos', 'EN_PROGRESO'),
  (2003, 203, 9, 'Construir repository nativo para analítica de capacidad con Window Functions en PostgreSQL', 'EN_PROGRESO'),
  (2004, 501, 9, 'Desarrollar scripts de migración Flyway para compatibilidad con PostgreSQL 16', 'FINALIZADA'),
  (2005, 201, 9, 'Configurar pool HikariCP con detección de leaks a 20 segundos y métricas Micrometer', 'FINALIZADA'),
  (2006, 204, 9, 'Auditar algoritmos de encriptación de tarjetas de crédito cumpliendo norma PCI-DSS', 'PENDIENTE'),

  -- Asignaciones para Lucía Morales (id: 10) - Frontend & UI/UX
  (3001, 301, 10, 'Crear sistema de diseño monocromático con soporte dinámico de modo Claro/Oscuro', 'FINALIZADA'),
  (3002, 302, 10, 'Construir componente interactivo de escáner QR con retroalimentación háptica', 'EN_PROGRESO'),
  (3003, 303, 10, 'Implementar motor de inyección de Micro-Snippets con búsqueda debounced en React', 'EN_PROGRESO'),
  (3004, 402, 10, 'Desarrollar interfaz de videollamada WebRTC con controles flotantes en Tailwind CSS', 'EN_PROGRESO'),
  (3005, 401, 10, 'Diseñar prototipos de alta fidelidad para el módulo de prescripción médica digital', 'FINALIZADA'),
  (3006, 403, 10, 'Integrar animaciones con Framer Motion para transiciones suaves de triaje médico', 'PENDIENTE'),

  -- Asignaciones para Mateo Restrepo (id: 11) - Datos & ETL
  (4001, 103, 11, 'Configurar cliente SFTP con canal SSH2 cifrado y validación de Checksum MD5', 'EN_PROGRESO'),
  (4002, 103, 11, 'Automatizar tarea programada @Scheduled para generación nocturna de lotes ETL', 'EN_PROGRESO'),
  (4003, 502, 11, 'Ejecutar reconciliación de 2.4 millones de registros históricos en Data Warehouse', 'FINALIZADA'),
  (4004, 302, 11, 'Construir vistas materializadas en PostgreSQL para reportes financieros instantáneos', 'EN_PROGRESO'),
  (4005, 101, 11, 'Diseñar especificación de formato plano de 14 columnas para la alianza estratégica Brasil', 'FINALIZADA'),

  -- Asignaciones para Sofía Benítez (id: 12) - QA & Ciberseguridad
  (5001, 204, 12, 'Ejecutar escaneo de vulnerabilidades con OWASP ZAP sobre endpoints de autenticación', 'EN_PROGRESO'),
  (5002, 203, 12, 'Automatizar suite de pruebas de integración para el Semáforo Inteligente de Riesgos', 'EN_PROGRESO'),
  (5003, 401, 12, 'Verificar cumplimiento de estándares HIPAA en el almacenamiento de datos clínicos', 'FINALIZADA'),
  (5004, 201, 12, 'Implementar pruebas unitarias con JUnit 5 y Mockito alcanzando 88% de cobertura', 'FINALIZADA'),

  -- Asignaciones para Javier Arboleda (id: 13) - DevOps & Cloud
  (6001, 204, 13, 'Configurar pipeline de CI/CD en GitHub Actions con compilación Maven y pruebas Vite', 'EN_PROGRESO'),
  (6002, 402, 13, 'Desplegar servidor de señalización WebRTC en clúster Kubernetes con autoescalado', 'EN_PROGRESO'),
  (6003, 101, 13, 'Construir imágenes Docker multi-stage optimizadas para frontend y backend', 'FINALIZADA'),
  (6004, 204, 13, 'Configurar monitoreo de métricas JVM con Prometheus y tableros en Grafana', 'PENDIENTE');

SELECT setval('actividad_id_actividad_seq', 7000);

-- 7. MÉTRICAS CRÍTICAS PARA EL PREDICTOR DE BURNOUT (capacity.pulse)
-- Ventana de 21 días:
-- S1: Días 15-21 (Línea base histórica)
-- S2: Días 8-14 (Transición / Incremento)
-- S3: Días 1-7 (Carga reciente crítica)
DELETE FROM error;
DELETE FROM interrupcion;

-- Errores asignados a Ana Gómez (id: 6) -> Sobrecarga exponencial que dispara RIESGO_BURNOUT_INMINENTE
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES 
  -- Ventana S1 (hace 16-20 días) - Línea base normal
  (101, 6, 'SINTAXIS', 'BAJA', NOW() - INTERVAL '19 days', 'Falta de anotación @Valid en DTO de Facturación', 'SOLUCIONADO', 'Corregido en commit c1a', NOW() - INTERVAL '18 days'),
  (101, 6, 'LOGICO', 'MEDIA', NOW() - INTERVAL '16 days', 'Validación de fecha de vencimiento menor a fecha de emisión', 'SOLUCIONADO', 'Añadida aserción custom', NOW() - INTERVAL '15 days'),

  -- Ventana S2 (hace 8-14 días) - Comienzo de tensión operacional
  (102, 6, 'INTEGRACION_REST', 'MEDIA', NOW() - INTERVAL '13 days', 'Timeout intermitente en conexión con web service de la DIAN', 'SOLUCIONADO', 'Aumentado socket timeout a 5000ms', NOW() - INTERVAL '12 days'),
  (102, 6, 'CONCURRENCIA', 'ALTA', NOW() - INTERVAL '11 days', 'Race condition al generar número consecutivo de factura electrónica', 'SOLUCIONADO', 'Aplicado bloqueo pesimista en base de datos', NOW() - INTERVAL '10 days'),
  (202, 6, 'VALIDACION', 'MEDIA', NOW() - INTERVAL '9 days', 'El formato del hash XML no cumple con estándar SHA-384', 'EN_REVISION', NULL, NULL),

  -- Ventana S3 (Últimos 7 días) - SOBRECARGA CRÍTICA (Disparador de alerta de Burnout)
  (102, 6, 'CONCURRENCIA', 'CRITICA', NOW() - INTERVAL '6 days', 'Deadlock en tabla factura_detalle bajo 500 hilos concurrentes', 'EN_REVISION', NULL, NULL),
  (202, 6, 'RENDIMIENTO', 'CRITICA', NOW() - INTERVAL '5 days', 'Consumo de CPU al 98% en algoritmo de firma criptográfica XAdES', 'REGISTRADO', NULL, NULL),
  (103, 6, 'INTEGRACION_REST', 'ALTA', NOW() - INTERVAL '4 days', 'Fallo de autenticación SSH al conectar con servidor SFTP de Brasil', 'REGISTRADO', NULL, NULL),
  (102, 6, 'LOGICO', 'ALTA', NOW() - INTERVAL '3 days', 'Inconsistencia en el cálculo de retención en la fuente para personas jurídicas', 'REGISTRADO', NULL, NULL),
  (302, 6, 'CONCURRENCIA', 'CRITICA', NOW() - INTERVAL '2 days', 'Pérdida de mensajes en el topic de transacciones de billetera digital', 'REGISTRADO', NULL, NULL),
  (103, 6, 'VALIDACION', 'ALTA', NOW() - INTERVAL '1 day', 'Lote ETL rechazado en destino por zona horaria no normalizada en UTC', 'REGISTRADO', NULL, NULL),
  (102, 6, 'RENDIMIENTO', 'ALTA', NOW() - INTERVAL '4 hours', 'Fuga de memoria en pool de hilos de generación masiva de PDFs', 'REGISTRADO', NULL, NULL);

-- Interrupciones asignadas a Ana Gómez (id: 6)
INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion, resolucion_nota, fecha_resolucion)
VALUES 
  -- S1
  (101, 6, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '18 days', 35, 'Reunión de alineación con cliente para definir esquema XML', 'SOLUCIONADO', 'Minuta aprobada', NOW() - INTERVAL '18 days'),
  -- S2
  (102, 6, 'CAIDA_SERVICIO_EXTERNO', NOW() - INTERVAL '12 days', 50, 'Indisponibilidad del entorno de pruebas de la DIAN', 'SOLUCIONADO', 'Servicio reestablecido', NOW() - INTERVAL '12 days'),
  (102, 6, 'SOPORTE_URGENTE', NOW() - INTERVAL '10 days', 75, 'Atención de incidencia prioritaria en servidor de staging', 'SOLUCIONADO', 'Hotfix desplegado', NOW() - INTERVAL '10 days'),
  (202, 6, 'BLOQUEO_AMBIENTE', NOW() - INTERVAL '8 days', 45, 'Bloqueo de puerto 5432 en servidor de integración continua', 'SOLUCIONADO', 'Reglas de firewall actualizadas', NOW() - INTERVAL '8 days'),
  -- S3 (Sobrecarga de horas perdidas)
  (102, 6, 'INCIDENCIA_PRODUCCION', NOW() - INTERVAL '6 days', 120, 'Investigación de caída de servidor transaccional por saturación de RAM', 'REGISTRADO', NULL, NULL),
  (103, 6, 'REUNION_URGENCIA', NOW() - INTERVAL '4 days', 90, 'Comité de crisis con equipo técnico de Brasil por inconsistencias ETL', 'REGISTRADO', NULL, NULL),
  (202, 6, 'CAIDA_SERVICIO_EXTERNO', NOW() - INTERVAL '3 days', 150, 'Caída del proveedor de nube afectando base de datos principal', 'REGISTRADO', NULL, NULL),
  (102, 6, 'SOPORTE_URGENTE', NOW() - INTERVAL '2 days', 180, 'Depuración de fallo en firma digital con equipo de seguridad', 'REGISTRADO', NULL, NULL),
  (302, 6, 'BLOQUEO_AMBIENTE', NOW() - INTERVAL '1 day', 60, 'Falla en el despliegue del broker Kafka en cluster de desarrollo', 'REGISTRADO', NULL, NULL);

-- Errores e Interrupciones para David Valenzuela (id: 9) -> TENDENCIA_DE_ESTRES_ACELERADA (Naranja)
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion)
VALUES 
  (202, 9, 'LOGICO', 'BAJA', NOW() - INTERVAL '17 days', 'Cálculo inexacto de comisión para montos inferiores a $10 USD', 'SOLUCIONADO'),
  (202, 9, 'RENDIMIENTO', 'MEDIA', NOW() - INTERVAL '11 days', 'Falta de índice compuesto en tabla movimientos_cuenta', 'SOLUCIONADO'),
  (202, 9, 'CONCURRENCIA', 'ALTA', NOW() - INTERVAL '9 days', 'Bloqueo de cuenta simultáneo en dos cajeros automáticos', 'SOLUCIONADO'),
  (202, 9, 'RENDIMIENTO', 'ALTA', NOW() - INTERVAL '4 days', 'Latencia de 1.8 segundos en consulta de historial bancario', 'EN_REVISION'),
  (203, 9, 'INTEGRACION_REST', 'ALTA', NOW() - INTERVAL '2 days', 'Error 504 Gateway Timeout en microservicio de notificaciones Push', 'REGISTRADO'),
  (102, 9, 'LOGICO', 'MEDIA', NOW() - INTERVAL '1 day', 'Filtro de paginación devuelve duplicados en transacciones concurrentes', 'REGISTRADO');

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion)
VALUES 
  (202, 9, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '10 days', 45, 'Reunión de revisión de arquitectura de microservicios', 'SOLUCIONADO'),
  (202, 9, 'INCIDENCIA_PRODUCCION', NOW() - INTERVAL '5 days', 90, 'Alerta de saturación de disco en servidor de base de datos', 'REGISTRADO'),
  (203, 9, 'SOPORTE_URGENTE', NOW() - INTERVAL '2 days', 60, 'Asistencia técnica a equipo de QA para pruebas de estrés', 'REGISTRADO');

-- Errores e Interrupciones para Lucía Morales (id: 10) y Mateo Restrepo (id: 11) -> ESTABLE (Verde)
INSERT INTO error (etapa_id, desarrollador_id, tipo_error, severidad, fecha_registro, descripcion, estado_atencion)
VALUES 
  (301, 10, 'SINTAXIS', 'BAJA', NOW() - INTERVAL '18 days', 'Advertencia de clave única (unique key) en lista de componentes React', 'SOLUCIONADO'),
  (302, 10, 'VALIDACION', 'BAJA', NOW() - INTERVAL '10 days', 'Mensaje de error no visible en pantallas móviles menores a 360px', 'SOLUCIONADO'),
  (302, 10, 'LOGICO', 'MEDIA', NOW() - INTERVAL '3 days', 'Animación de carga se congela si la respuesta del servidor es menor a 50ms', 'REGISTRADO'),
  (103, 11, 'VALIDACION', 'BAJA', NOW() - INTERVAL '15 days', 'Separador de decimales incorrecto en formato CSV de prueba', 'SOLUCIONADO'),
  (103, 11, 'LOGICO', 'MEDIA', NOW() - INTERVAL '5 days', 'Conversión de caracteres especiales (ñ, acentos) en archivo plano', 'SOLUCIONADO');

INSERT INTO interrupcion (etapa_id, desarrollador_id, tipo_interrupcion, fecha_ocurrencia, duracion_minutos, comentarios, estado_atencion)
VALUES 
  (301, 10, 'REUNION_NO_PLANIFICADA', NOW() - INTERVAL '14 days', 25, 'Sincronización de UI con el equipo de diseño', 'SOLUCIONADO'),
  (103, 11, 'SOPORTE_URGENTE', NOW() - INTERVAL '7 days', 30, 'Verificación de llaves públicas con el equipo de Brasil', 'SOLUCIONADO');

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

INSERT INTO solicitud_contacto (id_solicitud, nombre_remitente, email_remitente, telefono, asunto, mensaje, fecha_envio, atendido, coordinador_id)
VALUES 
  (1, 'Banco Internacional de Comercio', 'sistemas@bancomercio.com', '+57 310 987 6543', 'Consultoría en Migración a Microservicios', 'Requerimos modernizar nuestro sistema transaccional con arquitectura Java Spring Boot y soporte de alta concurrencia.', NOW() - INTERVAL '2 days', false, NULL),
  (2, 'Hospital Metropolitano', 'director.ti@hospmetropolitano.org', '+57 315 456 7890', 'Plataforma de Telemedicina y Recetas Digitales', 'Interesados en implementar su solución de triaje inteligente y consultas WebRTC encriptadas.', NOW() - INTERVAL '4 days', true, 7),
  (3, 'Fintech CrediYa Brasil', 'contato@crediya.com.br', '+55 11 98765 4321', 'Integración de Lotes ETL y Pagos QR', 'Solicitamos reunión técnica para sincronizar métricas operacionales bajo estándar ISO 8601.', NOW() - INTERVAL '6 days', false, NULL),
  (4, 'Logística Andina S.A.S.', 'gerencia@logisticaandina.co', '+57 320 123 4567', 'Facturación Electrónica Masiva', 'Buscamos integrar su motor de facturación con certificado digital para 50,000 documentos mensuales.', NOW() - INTERVAL '8 days', true, 7),
  (5, 'Universidad Central', 'vicerrectoria@unicentral.edu.co', '+57 300 890 1234', 'Portal Académico y Gestión WBS', 'Queremos evaluar la plataforma IKernell para seguimiento de proyectos de grado e investigación.', NOW() - INTERVAL '10 days', false, NULL);

SELECT setval('solicitud_contacto_id_solicitud_seq', (SELECT MAX(id_solicitud) FROM solicitud_contacto));

-- 10. BIBLIOTECA DIGITAL, NOTICIAS Y TUTORIALES
DELETE FROM documento_biblioteca;
INSERT INTO documento_biblioteca (id_documento, titulo, categoria, archivo_url, fecha_subida, subido_por_id, descripcion, version, formato, contenido_texto)
VALUES 
  (1, 'Guía de Arquitectura N-Capas y Microservicios IKernell', 'Arquitectura', 'https://docs.ikernell.org/arquitectura-v2.pdf', NOW() - INTERVAL '20 days', 5, 'Estándares de desacoplamiento entre Backend Java y Frontend React.', 'v2.1', 'PDF', 'Documento técnico de arquitectura de software.'),
  (2, 'Manual de Ciberseguridad y Políticas OWASP 2026', 'Seguridad', 'https://docs.ikernell.org/seguridad-owasp.pdf', NOW() - INTERVAL '15 days', 5, 'Políticas de encriptación BCrypt, tokens JWT stateless y headers de protección HTTP.', 'v1.4', 'PDF', 'Guía de hardening de seguridad.'),
  (3, 'Especificación Técnica Formato Plano ISO 8601 UTC Brasil', 'Integración', 'https://docs.ikernell.org/especificacion-iso8601.pdf', NOW() - INTERVAL '10 days', 5, 'Protocolo de delimitación de registros y transferencia SFTP cifrada.', 'v1.0', 'PDF', 'Documento de especificación de intercambio internacional.');

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
