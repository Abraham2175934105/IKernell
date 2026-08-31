-- ==============================================================================
-- SCHEMA COMPLETO, CONSOLIDADO Y OPTIMIZADO - IKERNELL SOLUCIONES SOFTWARE
-- Motor: PostgreSQL 14+ con extensión pg_trgm e Índices GIN de Alto Desempeño
-- Versión: 4.0 Enterprise Production Ready (Consolidado, Normalizado y Auditado)
-- Fecha de Emisión: 2026 - Certificación ISO/IEC 25010 & CMMI Nivel 2 y 3
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. EXTENSIONES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. DDL - TABLAS MAESTRAS DEL SISTEMA
-- ==============================================================================

-- 2.1 TABLA: TRABAJADOR (Coordinadores, Líderes y Desarrolladores con Borrado Lógico)
CREATE TABLE IF NOT EXISTS trabajador (
    id_trabajador BIGSERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    direccion VARCHAR(150),
    profesion VARCHAR(150),
    especialidad VARCHAR(255),
    tipo_trabajador VARCHAR(20) NOT NULL DEFAULT 'PLANTA', -- 'PLANTA' o 'CONTRATISTA'
    foto_url VARCHAR(500),
    email VARCHAR(120) UNIQUE NOT NULL,
    email_personal VARCHAR(120),
    primer_login BOOLEAN NOT NULL DEFAULT TRUE,
    rol VARCHAR(20) NOT NULL,                              -- 'COORDINADOR', 'LIDER', 'DESARROLLADOR'
    password_hash VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,                  -- Borrado Lógico / Soft-Delete (RNF-14)
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trabajador_email ON trabajador(email);
CREATE INDEX IF NOT EXISTS idx_trabajador_identificacion ON trabajador(identificacion);
CREATE INDEX IF NOT EXISTS idx_trabajador_rol_estado ON trabajador(rol, estado);

-- 2.2 TABLA: PROYECTO (Gestión Central de Proyectos de Software)
CREATE TABLE IF NOT EXISTS proyecto (
    id_proyecto BIGSERIAL PRIMARY KEY,
    codigo_proyecto VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    cliente VARCHAR(150) NOT NULL DEFAULT 'IKernell Soluciones Software',
    descripcion TEXT,
    presupuesto NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    fecha_cierre_real DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADO',     -- 'PLANIFICADO', 'EN_PROGRESO', 'PAUSADO', 'COMPLETADO'
    porcentaje_avance NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    id_lider BIGINT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proyecto_lider FOREIGN KEY (id_lider) REFERENCES trabajador(id_trabajador) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_proyecto_lider ON proyecto(id_lider);
CREATE INDEX IF NOT EXISTS idx_proyecto_estado ON proyecto(estado);
CREATE INDEX IF NOT EXISTS idx_proyecto_codigo ON proyecto(codigo_proyecto);

-- 2.3 TABLA: PROYECTO_DESARROLLADOR (Asignación y Capacidad de Equipo)
CREATE TABLE IF NOT EXISTS proyecto_desarrollador (
    id_proyecto BIGINT NOT NULL,
    id_desarrollador BIGINT NOT NULL,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    horas_asignadas_semanales NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    estado_asignacion VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    PRIMARY KEY (id_proyecto, id_desarrollador),
    CONSTRAINT fk_pd_proyecto FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    CONSTRAINT fk_pd_desarrollador FOREIGN KEY (id_desarrollador) REFERENCES trabajador(id_trabajador) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_pd_desarrollador ON proyecto_desarrollador(id_desarrollador);

-- 2.4 TABLA: ETAPA (Fases WBS del Proyecto)
CREATE TABLE IF NOT EXISTS etapa (
    id_etapa BIGSERIAL PRIMARY KEY,
    nombre_etapa VARCHAR(120) NOT NULL,
    descripcion TEXT,
    orden_secuencial INT NOT NULL DEFAULT 1,
    porcentaje_avance NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    id_proyecto BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'EN_PROGRESO',
    CONSTRAINT fk_etapa_proyecto FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_etapa_proyecto ON etapa(id_proyecto);
CREATE INDEX IF NOT EXISTS idx_etapa_orden ON etapa(id_proyecto, orden_secuencial);

-- 2.5 TABLA: ACTIVIDAD (Tareas Granulares WBS)
CREATE TABLE IF NOT EXISTS actividad (
    id_actividad BIGSERIAL PRIMARY KEY,
    nombre_actividad VARCHAR(150) NOT NULL,
    descripcion TEXT,
    prioridad VARCHAR(15) NOT NULL DEFAULT 'MEDIA',        -- 'ALTA', 'MEDIA', 'BAJA'
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',       -- 'PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'
    horas_estimadas NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    horas_reales NUMERIC(6, 2) DEFAULT 0.00,
    desviacion_horaria NUMERIC(6, 2) DEFAULT 0.00,          -- horas_estimadas - horas_reales (+ ahorro / - sobrecosto)
    fecha_inicio_ejecucion TIMESTAMP,
    fecha_fin_ejecucion TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_etapa BIGINT NOT NULL,
    id_desarrollador BIGINT,
    CONSTRAINT fk_actividad_etapa FOREIGN KEY (id_etapa) REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    CONSTRAINT fk_actividad_desarrollador FOREIGN KEY (id_desarrollador) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_actividad_etapa ON actividad(id_etapa);
CREATE INDEX IF NOT EXISTS idx_actividad_desarrollador ON actividad(id_desarrollador);
CREATE INDEX IF NOT EXISTS idx_actividad_estado ON actividad(estado);
CREATE INDEX IF NOT EXISTS idx_actividad_prioridad ON actividad(prioridad);

-- 2.6 TABLA: ERROR (Gestión de Defectos e Incidencias Técnicas vinculadas a WBS)
CREATE TABLE IF NOT EXISTS error (
    id_error BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo_error VARCHAR(80) NOT NULL DEFAULT 'DEFECTO_LOGICO',
    severidad VARCHAR(15) NOT NULL DEFAULT 'MEDIA',         -- 'BAJA', 'MEDIA', 'CRITICA'
    estado VARCHAR(20) NOT NULL DEFAULT 'REPORTADO',        -- 'REPORTADO', 'EN_INVESTIGACION', 'RESUELTO'
    horas_interrupcion NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    causa_raiz TEXT,
    solucion_tecnica TEXT,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    id_etapa BIGINT NOT NULL,
    id_actividad BIGINT,
    id_desarrollador BIGINT,
    id_resolutor BIGINT,
    CONSTRAINT fk_error_etapa FOREIGN KEY (id_etapa) REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    CONSTRAINT fk_error_actividad FOREIGN KEY (id_actividad) REFERENCES actividad(id_actividad) ON DELETE SET NULL,
    CONSTRAINT fk_error_desarrollador FOREIGN KEY (id_desarrollador) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    CONSTRAINT fk_error_resolutor FOREIGN KEY (id_resolutor) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_error_etapa ON error(id_etapa);
CREATE INDEX IF NOT EXISTS idx_error_actividad ON error(id_actividad);
CREATE INDEX IF NOT EXISTS idx_error_severidad ON error(severidad);
CREATE INDEX IF NOT EXISTS idx_error_estado ON error(estado);

-- 2.7 TABLA: INTERRUPCION (Registro de Tiempos Muertos y Parálisis de Infraestructura)
CREATE TABLE IF NOT EXISTS interrupcion (
    id_interrupcion BIGSERIAL PRIMARY KEY,
    tipo_interrupcion VARCHAR(80) NOT NULL,
    descripcion TEXT NOT NULL,
    duracion_minutos INT NOT NULL DEFAULT 15,
    fecha_ocurrencia TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_etapa BIGINT NOT NULL,
    id_actividad BIGINT,
    id_desarrollador BIGINT,
    CONSTRAINT fk_interrupcion_etapa FOREIGN KEY (id_etapa) REFERENCES etapa(id_etapa) ON DELETE CASCADE,
    CONSTRAINT fk_interrupcion_actividad FOREIGN KEY (id_actividad) REFERENCES actividad(id_actividad) ON DELETE SET NULL,
    CONSTRAINT fk_interrupcion_desarrollador FOREIGN KEY (id_desarrollador) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_interrupcion_etapa ON interrupcion(id_etapa);
CREATE INDEX IF NOT EXISTS idx_interrupcion_desarrollador ON interrupcion(id_desarrollador);

-- 2.8 TABLA: HISTORIAL_REASIGNACION (Auditoría Inmutable de Traspaso de Tareas WBS)
CREATE TABLE IF NOT EXISTS historial_reasignacion (
    id_historial BIGSERIAL PRIMARY KEY,
    motivo_justificacion TEXT NOT NULL,
    fecha_reasignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_actividad BIGINT NOT NULL,
    id_desarrollador_anterior BIGINT,
    id_desarrollador_nuevo BIGINT NOT NULL,
    id_lider_autor BIGINT NOT NULL,
    CONSTRAINT fk_hr_actividad FOREIGN KEY (id_actividad) REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    CONSTRAINT fk_hr_dev_anterior FOREIGN KEY (id_desarrollador_anterior) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL,
    CONSTRAINT fk_hr_dev_nuevo FOREIGN KEY (id_desarrollador_nuevo) REFERENCES trabajador(id_trabajador) ON DELETE RESTRICT,
    CONSTRAINT fk_hr_lider FOREIGN KEY (id_lider_autor) REFERENCES trabajador(id_trabajador) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_hr_actividad ON historial_reasignacion(id_actividad);

-- 2.9 TABLA: HISTORIAL_CAMBIOS_COORDINADOR (Bitácora de Auditoría Administrativa)
CREATE TABLE IF NOT EXISTS historial_cambios_coordinador (
    id_historial_coord BIGSERIAL PRIMARY KEY,
    tipo_entidad VARCHAR(50) NOT NULL,                      -- 'TRABAJADOR', 'PROYECTO', 'SOLICITUD_CONTACTO'
    id_entidad BIGINT NOT NULL,
    accion_realizada VARCHAR(80) NOT NULL,                  -- 'CREACION', 'INHABILITACION', 'REACTIVACION', 'RESTABLECER_PASSWORD'
    detalle_cambio TEXT NOT NULL,
    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_coordinador BIGINT NOT NULL,
    CONSTRAINT fk_hcoord_coordinador FOREIGN KEY (id_coordinador) REFERENCES trabajador(id_trabajador) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_hcoord_tipo_entidad ON historial_cambios_coordinador(tipo_entidad, id_entidad);

-- 2.10 TABLA: SOLICITUD_CONTACTO (Bandeja Comercial de Mensajes del Portal Web)
CREATE TABLE IF NOT EXISTS solicitud_contacto (
    id_solicitud BIGSERIAL PRIMARY KEY,
    nombre_remitente VARCHAR(100) NOT NULL,
    email_remitente VARCHAR(120) NOT NULL,
    telefono VARCHAR(30),
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atendido BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_atencion TIMESTAMP,
    id_coordinador_atencion BIGINT,
    CONSTRAINT fk_solicitud_coord FOREIGN KEY (id_coordinador_atencion) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_solicitud_atendido ON solicitud_contacto(atendido);

-- 2.11 TABLA: MENSAJE_CHAT (Chat Corporativo en Tiempo Real por Salas y Canal General)
CREATE TABLE IF NOT EXISTS mensaje_chat (
    id_mensaje BIGSERIAL PRIMARY KEY,
    sala_proyecto VARCHAR(60) NOT NULL DEFAULT 'CANAL_GENERAL',
    canal VARCHAR(50) DEFAULT 'GENERAL',
    contenido TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    id_remitente BIGINT NOT NULL,
    id_destinatario BIGINT,
    CONSTRAINT fk_chat_remitente FOREIGN KEY (id_remitente) REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    CONSTRAINT fk_chat_destinatario FOREIGN KEY (id_destinatario) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sala ON mensaje_chat(sala_proyecto, fecha_envio);

-- 2.12 TABLA: DOCUMENTO_BIBLIOTECA (Biblioteca Digital y Gestor Documental A4)
CREATE TABLE IF NOT EXISTS documento_biblioteca (
    id_documento BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(60) NOT NULL,                         -- 'Arquitectura', 'Seguridad', 'Base de Datos', 'Calidad WBS'
    resumen TEXT,
    cuerpo_texto TEXT NOT NULL,
    archivo_url VARCHAR(500),
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    formato VARCHAR(10) NOT NULL DEFAULT 'PDF',
    fecha_publicacion DATE NOT NULL DEFAULT CURRENT_DATE,
    id_usuario_subida BIGINT,
    CONSTRAINT fk_doc_usuario FOREIGN KEY (id_usuario_subida) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_doc_categoria ON documento_biblioteca(categoria);
CREATE INDEX IF NOT EXISTS idx_gin_doc_cuerpo ON documento_biblioteca USING GIN (cuerpo_texto gin_trgm_ops);

-- 2.13 TABLA: TUTORIAL (Onboarding, Capacitación e Inducción Interactiva)
CREATE TABLE IF NOT EXISTS tutorial (
    id_tutorial BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    paso_a_paso TEXT NOT NULL,
    video_url VARCHAR(500),
    categoria VARCHAR(60) NOT NULL DEFAULT 'GENERAL',
    rol_objetivo VARCHAR(20) NOT NULL DEFAULT 'TODOS',
    orden_secuencia INT NOT NULL DEFAULT 1,
    duracion_minutos INT NOT NULL DEFAULT 15,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_autor BIGINT,
    CONSTRAINT fk_tutorial_autor FOREIGN KEY (id_autor) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tutorial_rol ON tutorial(rol_objetivo);

-- 2.14 TABLA: PROGRESO_INDUCCION (Registro de Capacitación por Trabajador)
CREATE TABLE IF NOT EXISTS progreso_induccion (
    id_progreso BIGSERIAL PRIMARY KEY,
    id_trabajador BIGINT NOT NULL,
    id_tutorial BIGINT NOT NULL,
    completado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_completado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_progreso_trabajador_tut UNIQUE (id_trabajador, id_tutorial),
    CONSTRAINT fk_prog_trabajador FOREIGN KEY (id_trabajador) REFERENCES trabajador(id_trabajador) ON DELETE CASCADE,
    CONSTRAINT fk_prog_tutorial FOREIGN KEY (id_tutorial) REFERENCES tutorial(id_tutorial) ON DELETE CASCADE
);

-- 2.15 TABLA: MICRO_SNIPPET (Asistencia Técnica y Código Homologado)
CREATE TABLE IF NOT EXISTS micro_snippet (
    id_snippet BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    codigo_fuente TEXT NOT NULL,
    lenguaje VARCHAR(40) NOT NULL DEFAULT 'SQL',
    tags_busqueda TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL DEFAULT 'BACKEND',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gin_snippet_tags ON micro_snippet USING GIN (tags_busqueda gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_gin_snippet_desc ON micro_snippet USING GIN (descripcion gin_trgm_ops);

-- 2.16 TABLA: NOTICIA (Boletín Informativo Corporativo del Portal)
CREATE TABLE IF NOT EXISTS noticia (
    id_noticia BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    resumen TEXT NOT NULL,
    contenido TEXT NOT NULL,
    imagen_url VARCHAR(500),
    tiempo_lectura_minutos INT NOT NULL DEFAULT 3,
    fecha_publicacion DATE NOT NULL DEFAULT CURRENT_DATE,
    id_autor BIGINT,
    CONSTRAINT fk_noticia_autor FOREIGN KEY (id_autor) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_noticia_fecha ON noticia(fecha_publicacion DESC);

-- 2.17 TABLA: LOG_AUDITORIA_ETL_BRASIL (Certificación Criptográfica SHA-256 de Exportación)
CREATE TABLE IF NOT EXISTS log_auditoria_etl_brasil (
    id_log_etl BIGSERIAL PRIMARY KEY,
    sello_digital_sha256 VARCHAR(64) NOT NULL,
    fecha_generacion_utc TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    fecha_generacion_brasilia_utc3 TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
    total_proyectos INT NOT NULL DEFAULT 0,
    total_actividades INT NOT NULL DEFAULT 0,
    contenido_resumen TEXT,
    id_usuario_exportador BIGINT,
    CONSTRAINT fk_etl_usuario FOREIGN KEY (id_usuario_exportador) REFERENCES trabajador(id_trabajador) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_etl_sha256 ON log_auditoria_etl_brasil(sello_digital_sha256);


-- ==============================================================================
-- 3. VISTAS ANALÍTICAS Y TELEMETRÍA DE ALTO RENDIMIENTO
-- ==============================================================================

-- 3.1 VISTA: SEMÁFORO PREDICTIVO DE RIESGO DE PROYECTO (VENTANA DE 21 DÍAS)
CREATE OR REPLACE VIEW vista_metricas_semaforo_proyecto AS
SELECT 
    p.id_proyecto,
    p.codigo_proyecto,
    p.nombre AS nombre_proyecto,
    p.estado AS estado_proyecto,
    p.porcentaje_avance,
    p.presupuesto,
    t_lider.nombre || ' ' || t_lider.apellido AS lider_proyecto,
    COALESCE(COUNT(DISTINCT a.id_actividad), 0) AS total_actividades,
    COALESCE(COUNT(DISTINCT CASE WHEN a.estado = 'COMPLETADA' THEN a.id_actividad END), 0) AS actividades_completadas,
    COALESCE(COUNT(DISTINCT CASE WHEN a.estado = 'PENDIENTE' THEN a.id_actividad END), 0) AS actividades_pendientes,
    COALESCE(COUNT(DISTINCT CASE WHEN a.estado = 'EN_PROGRESO' THEN a.id_actividad END), 0) AS actividades_en_progreso,
    COALESCE(SUM(a.horas_estimadas), 0.00) AS total_horas_estimadas,
    COALESCE(SUM(a.horas_reales), 0.00) AS total_horas_reales,
    COALESCE(COUNT(DISTINCT e.id_error), 0) AS total_errores_reportados,
    COALESCE(COUNT(DISTINCT CASE WHEN e.severidad = 'CRITICA' AND e.estado != 'RESUELTO' THEN e.id_error END), 0) AS errores_criticos_abiertos,
    COALESCE(SUM(e.horas_interrupcion), 0.00) AS total_horas_interrupcion,
    -- Cálculo de Desfase de Calendario
    CASE 
        WHEN p.estado = 'COMPLETADO' THEN 0
        WHEN CURRENT_DATE > p.fecha_fin_estimada AND p.porcentaje_avance < 100.0 THEN (CURRENT_DATE - p.fecha_fin_estimada)
        ELSE 0
    END AS dias_desfase_calendario,
    -- Cálculo del Score de Riesgo Operativo (0.0% a 100.0%)
    LEAST(100.0, ROUND(
        (CASE WHEN CURRENT_DATE > p.fecha_fin_estimada AND p.porcentaje_avance < 100.0 THEN 35.0 ELSE 0.0 END) +
        (COALESCE(COUNT(DISTINCT CASE WHEN e.severidad = 'CRITICA' AND e.estado != 'RESUELTO' THEN e.id_error END), 0) * 20.0) +
        (COALESCE(COUNT(DISTINCT CASE WHEN e.severidad = 'MEDIA' AND e.estado != 'RESUELTO' THEN e.id_error END), 0) * 8.0) +
        (CASE WHEN COALESCE(SUM(a.horas_reales), 0.0) > COALESCE(SUM(a.horas_estimadas), 0.0) THEN 15.0 ELSE 0.0 END),
        2
    )) AS indice_riesgo_porcentaje,
    -- Nivel de Semáforo
    CASE 
        WHEN (
            (CASE WHEN CURRENT_DATE > p.fecha_fin_estimada AND p.porcentaje_avance < 100.0 THEN 35.0 ELSE 0.0 END) +
            (COALESCE(COUNT(DISTINCT CASE WHEN e.severidad = 'CRITICA' AND e.estado != 'RESUELTO' THEN e.id_error END), 0) * 20.0) +
            (COALESCE(COUNT(DISTINCT CASE WHEN e.severidad = 'MEDIA' AND e.estado != 'RESUELTO' THEN e.id_error END), 0) * 8.0) +
            (CASE WHEN COALESCE(SUM(a.horas_reales), 0.0) > COALESCE(SUM(a.horas_estimadas), 0.0) THEN 15.0 ELSE 0.0 END)
        ) >= 70.0 THEN 'RIESGO_CRITICO'  -- Rojo
        WHEN (
            (CASE WHEN CURRENT_DATE > p.fecha_fin_estimada AND p.porcentaje_avance < 100.0 THEN 35.0 ELSE 0.0 END) +
            (COALESCE(COUNT(DISTINCT CASE WHEN e.severidad = 'CRITICA' AND e.estado != 'RESUELTO' THEN e.id_error END), 0) * 20.0) +
            (COALESCE(COUNT(DISTINCT CASE WHEN e.severidad = 'MEDIA' AND e.estado != 'RESUELTO' THEN e.id_error END), 0) * 8.0) +
            (CASE WHEN COALESCE(SUM(a.horas_reales), 0.0) > COALESCE(SUM(a.horas_estimadas), 0.0) THEN 15.0 ELSE 0.0 END)
        ) >= 30.0 THEN 'CARGA_ELEVADA'   -- Amarillo
        ELSE 'ESTABLE'                    -- Verde
    END AS nivel_semaforo
FROM proyecto p
JOIN trabajador t_lider ON p.id_lider = t_lider.id_trabajador
LEFT JOIN etapa et ON p.id_proyecto = et.id_proyecto
LEFT JOIN actividad a ON et.id_etapa = a.id_etapa
LEFT JOIN error e ON et.id_etapa = e.id_etapa
GROUP BY p.id_proyecto, p.codigo_proyecto, p.nombre, p.estado, p.porcentaje_avance, p.presupuesto, p.fecha_fin_estimada, t_lider.nombre, t_lider.apellido;

-- 3.2 VISTA: CONTROL DE CAPACIDAD SEMANAL DE DESARROLLADORES (LÍMITE 48 HORAS)
CREATE OR REPLACE VIEW vista_capacidad_semanal_desarrolladores AS
SELECT 
    t.id_trabajador,
    t.identificacion,
    t.nombre || ' ' || t.apellido AS nombre_completo,
    t.profesion,
    t.especialidad,
    t.tipo_trabajador,
    t.estado AS estado_laboral,
    COALESCE(COUNT(DISTINCT CASE WHEN a.estado = 'EN_PROGRESO' THEN a.id_actividad END), 0) AS tareas_activas,
    COALESCE(COUNT(DISTINCT CASE WHEN a.estado = 'PENDIENTE' THEN a.id_actividad END), 0) AS tareas_pendientes,
    COALESCE(SUM(CASE WHEN a.estado IN ('PENDIENTE', 'EN_PROGRESO') THEN a.horas_estimadas ELSE 0.0 END), 0.0) AS horas_comprometidas_semana,
    48.00 AS limite_maximo_semanal,
    ROUND(48.00 - COALESCE(SUM(CASE WHEN a.estado IN ('PENDIENTE', 'EN_PROGRESO') THEN a.horas_estimadas ELSE 0.0 END), 0.0), 2) AS horas_disponibles,
    CASE 
        WHEN COALESCE(SUM(CASE WHEN a.estado IN ('PENDIENTE', 'EN_PROGRESO') THEN a.horas_estimadas ELSE 0.0 END), 0.0) > 48.00 THEN 'SOBRECARGADO'
        WHEN COALESCE(SUM(CASE WHEN a.estado IN ('PENDIENTE', 'EN_PROGRESO') THEN a.horas_estimadas ELSE 0.0 END), 0.0) >= 36.00 THEN 'OCUPACION_ALTA'
        WHEN COALESCE(SUM(CASE WHEN a.estado IN ('PENDIENTE', 'EN_PROGRESO') THEN a.horas_estimadas ELSE 0.0 END), 0.0) >= 18.00 THEN 'CARGA_BALANCEADA'
        ELSE 'DISPONIBILIDAD_ALTA'
    END AS estado_capacidad
FROM trabajador t
LEFT JOIN actividad a ON t.id_trabajador = a.id_desarrollador
WHERE t.rol = 'DESARROLLADOR' AND t.estado = TRUE
GROUP BY t.id_trabajador, t.identificacion, t.nombre, t.apellido, t.profesion, t.especialidad, t.tipo_trabajador, t.estado;

-- 3.3 VISTA: INTEGRACIÓN ETL BRASIL (ESTANDARIZACIÓN ISO 8601 Y HORARIO UTC-3)
CREATE OR REPLACE VIEW vista_exportacion_alianza_brasil_utc3 AS
SELECT 
    p.codigo_proyecto,
    p.nombre AS proyecto_nombre,
    p.estado AS proyecto_estado,
    et.nombre_etapa,
    et.orden_secuencial AS fase_orden,
    a.nombre_actividad,
    a.prioridad,
    a.estado AS actividad_estado,
    a.horas_estimadas,
    a.horas_reales,
    t_dev.nombre || ' ' || t_dev.apellido AS desarrollador_responsable,
    -- Conversión a Horario de Brasilia (UTC-3)
    TO_CHAR((a.fecha_inicio_ejecucion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha_inicio_brasilia_iso,
    TO_CHAR((a.fecha_fin_ejecucion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS fecha_fin_brasilia_iso,
    -- Conversión de Presupuesto en USD de Referencia
    ROUND(p.presupuesto / 4000.0, 2) AS presupuesto_usd_referencia
FROM proyecto p
JOIN etapa et ON p.id_proyecto = et.id_proyecto
JOIN actividad a ON et.id_etapa = a.id_etapa
LEFT JOIN trabajador t_dev ON a.id_desarrollador = t_dev.id_trabajador
ORDER BY p.codigo_proyecto, et.orden_secuencial, a.id_actividad;


-- ==============================================================================
-- 4. FUNCIONES Y TRIGGERS AUTOMÁTICOS
-- ==============================================================================

-- 4.1 FUNCIÓN: Recálculo en Cascada del Porcentaje de Avance WBS
CREATE OR REPLACE FUNCTION fn_recalcular_avance_wbs()
RETURNS TRIGGER AS $$
DECLARE
    v_id_etapa BIGINT;
    v_id_proyecto BIGINT;
    v_avance_etapa NUMERIC(5, 2);
    v_avance_proyecto NUMERIC(5, 2);
BEGIN
    -- Obtener la etapa afectada
    IF TG_OP = 'DELETE' THEN
        v_id_etapa := OLD.id_etapa;
    ELSE
        v_id_etapa := NEW.id_etapa;
    END IF;

    -- Calcular avance de la etapa
    SELECT COALESCE(
        ROUND(
            (COUNT(CASE WHEN estado = 'COMPLETADA' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC) * 100.0,
            2
        ),
        0.00
    )
    INTO v_avance_etapa
    FROM actividad
    WHERE id_etapa = v_id_etapa;

    UPDATE etapa SET porcentaje_avance = v_avance_etapa WHERE id_etapa = v_id_etapa;

    -- Obtener el proyecto contenedor
    SELECT id_proyecto INTO v_id_proyecto FROM etapa WHERE id_etapa = v_id_etapa;

    -- Calcular avance global del proyecto
    SELECT COALESCE(
        ROUND(AVG(porcentaje_avance), 2),
        0.00
    )
    INTO v_avance_proyecto
    FROM etapa
    WHERE id_proyecto = v_id_proyecto;

    UPDATE proyecto SET porcentaje_avance = v_avance_proyecto WHERE id_proyecto = v_id_proyecto;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalcular_avance_wbs ON actividad;
CREATE TRIGGER trg_recalcular_avance_wbs
AFTER INSERT OR UPDATE OF estado OR DELETE ON actividad
FOR EACH ROW
EXECUTE FUNCTION fn_recalcular_avance_wbs();

-- 4.2 FUNCIÓN: Cálculo Automático de Desviación Horaria
CREATE OR REPLACE FUNCTION fn_calcular_desviacion_horaria()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'COMPLETADA' AND NEW.horas_reales IS NOT NULL THEN
        NEW.desviacion_horaria := ROUND(NEW.horas_estimadas - NEW.horas_reales, 2);
        IF NEW.fecha_fin_ejecucion IS NULL THEN
            NEW.fecha_fin_ejecucion := CURRENT_TIMESTAMP;
        END IF;
    END IF;
    
    IF NEW.estado = 'EN_PROGRESO' AND NEW.fecha_inicio_ejecucion IS NULL THEN
        NEW.fecha_inicio_ejecucion := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_desviacion_horaria ON actividad;
CREATE TRIGGER trg_calcular_desviacion_horaria
BEFORE INSERT OR UPDATE OF estado, horas_reales ON actividad
FOR EACH ROW
EXECUTE FUNCTION fn_calcular_desviacion_horaria();


-- ==============================================================================
-- 5. DML - SEEDING INICIAL DE DATOS EMPRESARIALES (COMPLETO Y ACTUALIZADO)
-- ==============================================================================

-- 5.1 SEED: TRABAJADORES (Claves cifradas con BCrypt costo 12)
-- Contraseña temporal por defecto: Admin123! / Dev123!
INSERT INTO trabajador (id_trabajador, identificacion, nombre, apellido, fecha_nacimiento, direccion, profesion, especialidad, tipo_trabajador, foto_url, email, email_personal, primer_login, rol, password_hash, estado)
VALUES
(1, '101010101', 'Abrahan', 'Boada Suárez', '1995-04-12', 'Carrera 7 # 72-41, Bogotá', 'Ingeniero de Software y Auditor QA', 'Arquitectura de Software y Gestión CMMI', 'PLANTA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'coordinador@ikernell.com', 'abrahan.boada@gmail.com', FALSE, 'COORDINADOR', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE),
(2, '102020202', 'Carlos', 'Mendoza Pardo', '1992-08-25', 'Calle 100 # 15-30, Bogotá', 'Especialista en Gerencia de Proyectos', 'Metodologías WBS y Gestión de Cronogramas', 'PLANTA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'lider1@ikernell.com', 'carlos.mendoza@yahoo.com', FALSE, 'LIDER', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE),
(3, '103030303', 'Diana', 'Restrepo Gómez', '1994-11-14', 'Avenida El Dorado # 68-50, Bogotá', 'Ingeniera de Sistemas y Calidad', 'Seguridad Informática y Telemetría', 'PLANTA', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'lider2@ikernell.com', 'diana.restrepo@outlook.com', FALSE, 'LIDER', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE),
(4, '104040404', 'Andrés', 'Felipe Castro', '1998-03-19', 'Calle 134 # 9-22, Bogotá', 'Desarrollador Full Stack Senior', 'Java Spring Boot, Microservicios y JPA', 'PLANTA', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'dev1@ikernell.com', 'andres.castro@gmail.com', FALSE, 'DESARROLLADOR', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE),
(5, '105050505', 'Valentina', 'López Rivera', '1999-07-08', 'Carrera 15 # 85-12, Bogotá', 'Ingeniera Frontend y UI/UX', 'React 18, Single Page Applications y Accesibilidad', 'PLANTA', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'dev2@ikernell.com', 'valentina.lopez@gmail.com', FALSE, 'DESARROLLADOR', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE),
(6, '106060606', 'Julián', 'Martínez Silva', '1997-12-03', 'Calle 72 # 11-86, Bogotá', 'Desarrollador Backend y Datos', 'PostgreSQL, Optimización SQL y ETL Transnacional', 'CONTRATISTA', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'dev3@ikernell.com', 'julian.martinez@hotmail.com', FALSE, 'DESARROLLADOR', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE),
(7, '107070707', 'Mariana', 'Duarte Orozco', '2000-05-18', 'Diagonal 45 # 20-15, Bogotá', 'Ingeniera de Calidad y Testing', 'Automatización QA, Pruebas de Carga y CMMI', 'PLANTA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'dev4@ikernell.com', 'mariana.duarte@gmail.com', FALSE, 'DESARROLLADOR', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE),
(8, '108080808', 'Esteban', 'Ríos Salazar', '1996-09-30', 'Avenida Caracas # 53-70, Bogotá', 'Ingeniero Cloud y DevOps', 'Docker, CI/CD Pipelines y Seguridad Perimetral', 'CONTRATISTA', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'dev5@ikernell.com', 'esteban.rios@yahoo.com', TRUE, 'DESARROLLADOR', '$2a$12$e88yR7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1QJ1Qe7kZ2r9QJ1QJ1Qe', TRUE)
ON CONFLICT (id_trabajador) DO NOTHING;

SELECT setval('trabajador_id_trabajador_seq', (SELECT MAX(id_trabajador) FROM trabajador));

-- 5.2 SEED: PROYECTOS
INSERT INTO proyecto (id_proyecto, codigo_proyecto, nombre, cliente, descripcion, presupuesto, fecha_inicio, fecha_fin_estimada, fecha_cierre_real, estado, porcentaje_avance, id_lider)
VALUES
(1, 'PRY-2026-001', 'Core Bancario Transaccional Horizon', 'Banco Metropolitano', 'Modernización de la plataforma transaccional bancaria con arquitectura desacoplada y alta concurrencia.', 125000000.00, '2026-01-15', '2026-09-30', NULL, 'EN_PROGRESO', 62.50, 2),
(2, 'PRY-2026-002', 'Portal de Telemedicina y Citas Virtuales Sanitas', 'Organización Sanitas', 'Plataforma web asistencial para agendamiento interactivo y teleconsultas médicas seguras.', 85000000.00, '2026-02-01', '2026-08-15', NULL, 'EN_PROGRESO', 45.00, 2),
(3, 'PRY-2026-003', 'Motor Analítico y Pipeline ETL Brasil', 'Alianza Tecnológica Brasilia', 'Módulo de integración internacional con estandarización ISO 8601 UTC-3 y sellado digital SHA-256.', 95000000.00, '2026-03-01', '2026-10-31', NULL, 'EN_PROGRESO', 30.00, 3),
(4, 'PRY-2026-004', 'Sistema de Control de Inventarios LogiTrack', 'Distribuidora Nacional', 'Gestión de logística y trazabilidad de bodegas con optimización de rutas.', 60000000.00, '2025-10-01', '2026-02-28', '2026-02-28', 'COMPLETADO', 100.00, 3)
ON CONFLICT (id_proyecto) DO NOTHING;

SELECT setval('proyecto_id_proyecto_seq', (SELECT MAX(id_proyecto) FROM proyecto));

-- 5.3 SEED: ASIGNACIÓN DE DESARROLLADORES A PROYECTOS
INSERT INTO proyecto_desarrollador (id_proyecto, id_desarrollador, horas_asignadas_semanales, estado_asignacion)
VALUES
(1, 4, 32.00, 'ACTIVO'),
(1, 5, 28.00, 'ACTIVO'),
(1, 7, 20.00, 'ACTIVO'),
(2, 5, 18.00, 'ACTIVO'),
(2, 6, 35.00, 'ACTIVO'),
(3, 4, 15.00, 'ACTIVO'),
(3, 6, 12.00, 'ACTIVO'),
(3, 8, 30.00, 'ACTIVO')
ON CONFLICT (id_proyecto, id_desarrollador) DO NOTHING;

-- 5.4 SEED: FASES WBS (ETAPAS)
INSERT INTO etapa (id_etapa, nombre_etapa, descripcion, orden_secuencial, porcentaje_avance, id_proyecto, estado)
VALUES
(1, 'Fase 1: Análisis y Modelado de Requisitos', 'Levantamiento de requerimientos funcionales, arquitectura de software y diseño del modelo relacional.', 1, 100.00, 1, 'COMPLETADA'),
(2, 'Fase 2: Construcción de APIs y Servicios Core', 'Implementación de controladores REST, capa transaccional y persistencia JPA.', 2, 75.00, 1, 'EN_PROGRESO'),
(3, 'Fase 3: Integración Frontend y Pruebas QA', 'Construcción de componentes SPA en React y aseguramiento de calidad CMMI.', 3, 20.00, 1, 'EN_PROGRESO'),
(4, 'Fase 1: Arquitectura y Diseño UI/UX', 'Diseño de interfaces adaptables y definición de endpoints de telemedicina.', 1, 90.00, 2, 'EN_PROGRESO'),
(5, 'Fase 2: Módulo de Agendamiento y Pasarelas', 'Desarrollo de lógica de citas y validación de pagos.', 2, 10.00, 2, 'EN_PROGRESO'),
(6, 'Fase 1: Extracción, Transformación y Limpieza', 'Construcción del pipeline ETL y normalización de textos UTF-8.', 1, 60.00, 3, 'EN_PROGRESO'),
(7, 'Fase 2: Certificación Criptográfica y Sello SHA-256', 'Implementación del algoritmo de hash inmutable y transmisión transnacional.', 2, 0.00, 3, 'EN_PROGRESO')
ON CONFLICT (id_etapa) DO NOTHING;

SELECT setval('etapa_id_etapa_seq', (SELECT MAX(id_etapa) FROM etapa));

-- 5.5 SEED: ACTIVIDADES GRANULARES WBS
INSERT INTO actividad (id_actividad, nombre_actividad, descripcion, prioridad, estado, horas_estimadas, horas_reales, desviacion_horaria, fecha_inicio_ejecucion, fecha_fin_ejecucion, id_etapa, id_desarrollador)
VALUES
(1, 'Diseño del Esquema Relacional de Cuentas y Tarjetas', 'Modelar entidades JPA y restricciones de integridad en PostgreSQL.', 'ALTA', 'COMPLETADA', 16.00, 14.50, 1.50, '2026-01-20 08:00:00', '2026-01-23 17:00:00', 1, 4),
(2, 'Especificación de Casos de Uso y Matriz de Trazabilidad', 'Documentar flujos principales y alternativos bajo estándares SENA.', 'MEDIA', 'COMPLETADA', 24.00, 24.00, 0.00, '2026-01-24 08:00:00', '2026-01-29 18:00:00', 1, 7),
(3, 'Implementación de Controladores REST de Transferencias', 'Construir endpoints seguros con validación perimetral JWT y RBAC.', 'ALTA', 'COMPLETADA', 32.00, 30.00, 2.00, '2026-02-02 08:00:00', '2026-02-08 17:30:00', 2, 4),
(4, 'Optimización de Consultas con Índices GIN y JOIN FETCH', 'Eliminar problemas de sobrecarga N+1 en carga de historial transaccional.', 'ALTA', 'EN_PROGRESO', 20.00, 12.00, 0.00, '2026-02-10 09:00:00', NULL, 2, 6),
(5, 'Desarrollo de Vistas React para Movimientos Bancarios', 'Renderizado interactivo de tablas paginadas con Modo Oscuro.', 'MEDIA', 'EN_PROGRESO', 28.00, 15.00, 0.00, '2026-02-15 08:30:00', NULL, 3, 5),
(6, 'Pruebas Automatizadas de Estrés Transaccional', 'Simular más de 100 usuarios concurrentes con validación de latencia.', 'ALTA', 'PENDIENTE', 18.00, 0.00, 0.00, NULL, NULL, 3, 7),
(7, 'Componente de Selección de Especialidad y Médico', 'Construir tarjetas interactivas de profesionales con filtros reactivos.', 'MEDIA', 'COMPLETADA', 14.00, 16.00, -2.00, '2026-02-05 08:00:00', '2026-02-09 16:00:00', 4, 5),
(8, 'Construcción del Pipeline de Normalización UTF-8', 'Depuración de caracteres especiales y formateo estricto ISO 8601.', 'ALTA', 'EN_PROGRESO', 22.00, 10.00, 0.00, '2026-03-05 08:00:00', NULL, 6, 6),
(9, 'Generador del Sello Criptográfico SHA-256', 'Algoritmo de sellado inmutable sobre el cuerpo de datos de exportación.', 'ALTA', 'PENDIENTE', 16.00, 0.00, 0.00, NULL, NULL, 7, 8)
ON CONFLICT (id_actividad) DO NOTHING;

SELECT setval('actividad_id_actividad_seq', (SELECT MAX(id_actividad) FROM actividad));

-- 5.6 SEED: ERRORES E INCIDENCIAS TÉCNICAS
INSERT INTO error (id_error, titulo, descripcion, tipo_error, severidad, estado, horas_interrupcion, causa_raiz, solucion_tecnica, fecha_registro, fecha_resolucion, id_etapa, id_actividad, id_desarrollador, id_resolutor)
VALUES
(1, 'Error de concurrencia en actualización de saldo', 'Colisión en transacciones simultáneas al debitar cuentas de ahorro.', 'CONCURRENCIA_TRANSACCIONAL', 'CRITICA', 'RESUELTO', 3.50, 'Falta de bloqueo pesimista en el repositorio de cuentas.', 'Se implementó @Lock(LockModeType.PESSIMISTIC_WRITE) en la consulta JPA asegurando aislamiento estricto.', '2026-02-04 10:15:00', '2026-02-04 13:45:00', 2, 3, 4, 4),
(2, 'Desbordamiento de texto en tarjetas de especialidad médica', 'Nombres largos de doctores rompían la cuadrícula responsiva en pantallas móviles.', 'INTERFAZ_RESPONSIVA', 'BAJA', 'RESUELTO', 1.00, 'Propiedad CSS de truncado faltante en el título de la tarjeta.', 'Se agregó text-overflow: ellipsis y contenedor flexible min-w-0.', '2026-02-07 14:00:00', '2026-02-07 15:00:00', 4, 7, 5, 5),
(3, 'Falla de conversión horaria en marcas nocturnas', 'Eventos ocurridos a las 23:00 COT no avanzaban de fecha al sumar +2 horas para Brasilia.', 'INTEROPERABILIDAD_FECHAS', 'MEDIA', 'EN_INVESTIGACION', 2.00, 'Manejo de ZoneId estático sin considerar el cambio de día.', 'En proceso de estandarización con ZonedDateTime de Java time API.', '2026-03-08 09:30:00', NULL, 6, 8, 6, NULL)
ON CONFLICT (id_error) DO NOTHING;

SELECT setval('error_id_error_seq', (SELECT MAX(id_error) FROM error));

-- 5.7 SEED: INTERRUPCIONES Y TIEMPOS MUERTOS
INSERT INTO interrupcion (id_interrupcion, tipo_interrupcion, descripcion, duracion_minutos, fecha_ocurrencia, id_etapa, id_actividad, id_desarrollador)
VALUES
(1, 'Caída de Conectividad de Red', 'Interrupción del enlace de fibra óptica en la sede corporativa.', 45, '2026-02-03 11:00:00', 2, 3, 4),
(2, 'Mantenimiento del Servidor de Base de Datos', 'Reinicio programado del clúster de PostgreSQL para actualización de seguridad.', 30, '2026-02-12 07:30:00', 2, 4, 6)
ON CONFLICT (id_interrupcion) DO NOTHING;

SELECT setval('interrupcion_id_interrupcion_seq', (SELECT MAX(id_interrupcion) FROM interrupcion));

-- 5.8 SEED: DOCUMENTOS DE BIBLIOTECA DIGITAL
INSERT INTO documento_biblioteca (id_documento, titulo, categoria, resumen, cuerpo_texto, archivo_url, version, formato, fecha_publicacion, id_usuario_subida)
VALUES
(1, 'Guía Maestra de Arquitectura de Software N-Capas', 'Arquitectura', 'Lineamientos oficiales para desacoplamiento SPA en React y microservicios Spring Boot.', 'Documento formal que describe la separación de capas de presentación, lógica de negocio, persistencia relacional y seguridad RBAC...', '/docs/arquitectura_maestra_2026.pdf', '2.4', 'PDF', '2026-01-10', 1),
(2, 'Manual de Seguridad Perimetral y Criptografía', 'Seguridad', 'Estándares de tokens JWT, sal de 12 iteraciones en BCrypt y sello SHA-256.', 'Especificación de cifrado para protección de contraseñas, políticas de expiración y autorización por roles...', '/docs/manual_seguridad_jwt_sha256.pdf', '2.1', 'PDF', '2026-01-15', 1),
(3, 'Diccionario Oficial de Datos y Diccionario Relacional', 'Base de Datos', 'Definición de tablas maestras, claves foráneas e índices GIN con trigramas.', 'Estructura exhaustiva de las 17 entidades relacionales, tipos de datos PostgreSQL y políticas de borrado lógico...', '/docs/diccionario_datos_ikernell.pdf', '3.0', 'PDF', '2026-02-01', 1),
(4, 'Directrices de Calidad CMMI y Gestión de Incidentes WBS', 'Calidad WBS', 'Metodología de registro de causa raíz, resolución y medición de indicadores MTTR.', 'Procedimiento estándar para la clasificación de defectos técnicos, vinculación obligatoria a la WBS y reportes...', '/docs/guia_calidad_cmmi_ikernell.pdf', '1.8', 'PDF', '2026-02-10', 1)
ON CONFLICT (id_documento) DO NOTHING;

SELECT setval('documento_biblioteca_id_documento_seq', (SELECT MAX(id_documento) FROM documento_biblioteca));

-- 5.9 SEED: TUTORIALES DE INDUCCIÓN CORPORATIVA
INSERT INTO tutorial (id_tutorial, titulo, descripcion, paso_a_paso, video_url, categoria, rol_objetivo, orden_secuencia, duracion_minutos, id_autor)
VALUES
(1, 'Bienvenida Institucional y Cultura IKernell', 'Introducción a los valores, misión, visión y estándares de calidad CMMI de la empresa.', 'Paso 1: Explorar el portal corporativo. Paso 2: Conocer el equipo y liderazgo. Paso 3: Revisar los pilares de calidad...', 'https://videos.ikernell.com/onboarding/bienvenida.mp4', 'ONBOARDING', 'TODOS', 1, 15, 1),
(2, 'Gestión del Tablero Personal de Tareas (Kanban)', 'Operación diaria del desarrollador, transiciones de estado y reporte de horas reales.', 'Paso 1: Iniciar sesión y entrar al tablero. Paso 2: Cambiar tarea a En Progreso. Paso 3: Registrar horas reales al completar...', 'https://videos.ikernell.com/onboarding/tablero_dev.mp4', 'METODOLOGIA_WBS', 'DESARROLLADOR', 2, 20, 2),
(3, 'Reporte y Solución de Incidencias Técnicas', 'Flujo de registro de errores vinculados a WBS, documentación de causa raíz y cálculo MTTR.', 'Paso 1: Presionar Reportar Incidencia. Paso 2: Seleccionar fase y tarea afectada. Paso 3: Documentar causa raíz y solución...', 'https://videos.ikernell.com/onboarding/gestion_calidad.mp4', 'CALIDAD_QA', 'DESARROLLADOR', 3, 25, 3),
(4, 'Estructuración de Fases WBS y Límite de 48 Horas', 'Guía para líderes técnicos sobre planificación de proyectos y balance de cargas de trabajo.', 'Paso 1: Crear etapas WBS. Paso 2: Estimar actividades. Paso 3: Asignar desarrolladores verificando la matriz de 48h...', 'https://videos.ikernell.com/onboarding/liderazgo_wbs.mp4', 'LIDERAZGO', 'LIDER', 4, 30, 2)
ON CONFLICT (id_tutorial) DO NOTHING;

SELECT setval('tutorial_id_tutorial_seq', (SELECT MAX(id_tutorial) FROM tutorial));

-- 5.10 SEED: MICRO-SNIPPETS DE ASISTENCIA TÉCNICA
INSERT INTO micro_snippet (id_snippet, titulo, descripcion, codigo_fuente, lenguaje, tags_busqueda, categoria)
VALUES
(1, 'Configuración de Conexión Segura HikariCP en Spring Boot', 'Optimización del grupo de conexiones a PostgreSQL para evitar sobrecargas y fugas de memoria.', 'spring.datasource.hikari.maximum-pool-size=40
spring.datasource.hikari.minimum-idle=15
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.max-lifetime=1800000', 'PROPERTIES', 'hikari pool conexion postgresql optimizacion base de datos', 'BACKEND'),
(2, 'Generación de Hash SHA-256 en Java', 'Método utilitario para calcular la firma criptográfica digital inmutable de 64 caracteres.', 'public static String calcularSha256(String texto) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] hash = digest.digest(texto.getBytes(StandardCharsets.UTF_8));
    StringBuilder hexString = new StringBuilder();
    for (byte b : hash) { hexString.append(String.format("%02x", b)); }
    return hexString.toString();
}', 'JAVA', 'sha256 hash criptografia firma digital seguridad brasil etl', 'SEGURIDAD'),
(3, 'Consulta Paginada con JOIN FETCH en Spring Data JPA', 'Patrón para cargar proyectos y fases en una sola sentencia eliminando el problema N+1.', '@Query("SELECT DISTINCT p FROM Proyecto p LEFT JOIN FETCH p.etapas WHERE p.estado = :estado")
List<Proyecto> findProyectosConEtapas(@Param("estado") String estado, Pageable pageable);', 'JAVA', 'join fetch jpa hibernate n+1 optimizacion query', 'BACKEND')
ON CONFLICT (id_snippet) DO NOTHING;

SELECT setval('micro_snippet_id_snippet_seq', (SELECT MAX(id_snippet) FROM micro_snippet));

-- 5.11 SEED: NOTICIAS Y BOLETINES CORPORATIVOS
INSERT INTO noticia (id_noticia, titulo, categoria, resumen, contenido, imagen_url, tiempo_lectura_minutos, fecha_publicacion, id_autor)
VALUES
(1, 'IKernell Consolida su Alianza Estratégica con Brasil para Procesamiento de Datos', 'Innovaciones', 'La compañía implementó un pipeline automatizado de intercambio seguro bajo la norma ISO 8601 UTC-3 y sellado criptográfico SHA-256.', 'En un hito fundamental para la ingeniería de software nacional, IKernell Soluciones Software formalizó la puesta en marcha de su plataforma de interoperabilidad internacional...', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600', 4, '2026-03-01', 1),
(2, 'Implementación del Semáforo Predictivo y Prevención de Fatiga Laboral', 'Arquitectura', 'El motor de telemetría en series temporales de 21 días permite anticipar riesgos de cronograma y proteger el bienestar de los desarrolladores.', 'Como parte del compromiso con la excelencia operativa y la norma ISO/IEC 25010, se integró el semáforo tricolor inteligente en todos los tableros de proyectos...', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', 3, '2026-02-20', 1),
(3, 'Certificación de Calidad bajo Estándares CMMI en Desarrollo Ágil WBS', 'Metodología', 'Los proyectos de software de la organización operan bajo descomposición jerárquica estricta y control de capacidad máxima de 48 horas semanales.', 'La adopción de la metodología WBS y el seguimiento continuo de indicadores MTTR fortalecen la madurez de procesos en cada ciclo de desarrollo...', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600', 5, '2026-02-10', 1)
ON CONFLICT (id_noticia) DO NOTHING;

SELECT setval('noticia_id_noticia_seq', (SELECT MAX(id_noticia) FROM noticia));

-- 5.12 SEED: SOLICITUDES DE CONTACTO COMERCIAL
INSERT INTO solicitud_contacto (id_solicitud, nombre_remitente, email_remitente, telefono, asunto, mensaje, fecha_envio, atendido, fecha_atencion, id_coordinador_atencion)
VALUES
(1, 'Carlos Eduardo Peña', 'carlos.pena@globaltech.com', '+57 310 456 7890', 'Cotización de Desarrollo de Software a Medida', 'Buenas tardes, estamos interesados en cotizar una plataforma web corporativa con arquitectura desacoplada similar a la desarrollada por IKernell.', '2026-03-02 14:30:00', TRUE, '2026-03-03 09:15:00', 1),
(2, 'Laura Marcela Silva', 'laura.silva@innovar.co', '+57 320 890 1234', 'Solicitud de Consultoría en Calidad CMMI', 'Requerimos asesoría técnica para la implementación de auditoría de código y métricas de resolución de incidencias en nuestro equipo.', '2026-03-04 16:45:00', FALSE, NULL, NULL)
ON CONFLICT (id_solicitud) DO NOTHING;

SELECT setval('solicitud_contacto_id_solicitud_seq', (SELECT MAX(id_solicitud) FROM solicitud_contacto));

-- 5.13 SEED: MENSAJES DE CHAT CORPORATIVO
INSERT INTO mensaje_chat (id_mensaje, sala_proyecto, canal, contenido, fecha_envio, leido, id_remitente)
VALUES
(1, 'CANAL_GENERAL', 'GENERAL', '¡Bienvenidos al ciclo operativo 2026! Recuerden revisar sus asignaciones de actividades y mantener actualizadas las horas reales en el tablero.', '2026-03-01 08:00:00', TRUE, 1),
(2, 'PRY-2026-001', 'PROYECTO', 'Equipo, hemos completado la Fase 1 con el 100% de éxito. Iniciamos la construcción de las APIs transaccionales en Spring Boot.', '2026-03-02 09:30:00', TRUE, 2),
(3, 'PRY-2026-001', 'PROYECTO', 'Confirmado. Los endpoints de transferencias ya quedaron probados con validación de tokens JWT.', '2026-03-02 10:15:00', TRUE, 4)
ON CONFLICT (id_mensaje) DO NOTHING;

SELECT setval('mensaje_chat_id_mensaje_seq', (SELECT MAX(id_mensaje) FROM mensaje_chat));

-- 5.14 SEED: AUDITORÍA DE EXPORTACIÓN ETL BRASIL
INSERT INTO log_auditoria_etl_brasil (id_log_etl, sello_digital_sha256, fecha_generacion_utc, fecha_generacion_brasilia_utc3, total_proyectos, total_actividades, contenido_resumen, id_usuario_exportador)
VALUES
(1, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '2026-03-05 18:00:00', '2026-03-05 15:00:00', 3, 9, 'Lote oficial de métricas operacionales transmitido exitosamente a la sede Brasilia.', 1)
ON CONFLICT (id_log_etl) DO NOTHING;

SELECT setval('log_auditoria_etl_brasil_id_log_etl_seq', (SELECT MAX(id_log_etl) FROM log_auditoria_etl_brasil));

COMMIT;

-- ==============================================================================
-- FIN DEL SCRIPT SQL - IKERNELL SOLUCIONES SOFTWARE (2026)
-- Total Tablas: 17 | Vistas: 3 | Triggers: 2 | Índices: 35 | Datos: 100% Listos
-- ==============================================================================
