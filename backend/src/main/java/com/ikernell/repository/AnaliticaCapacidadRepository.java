package com.ikernell.repository;

import com.ikernell.dto.BurnoutProjection;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio analítico especializado para el Predictor de Burnout Histórico (RF-35).
 *
 * Toda la lógica de cálculo pesado (agregaciones, cruces, ponderaciones y clasificación)
 * se ejecuta directamente en PostgreSQL mediante una CTE analítica con generate_series.
 *
 * Clasificación homologada en 4 niveles semafóricos:
 * - CRITICA  (🔴 Carga > 80% o sobrecarga sostenida en 3 semanas)
 * - ALTA     (🟠 Carga 65% - 80% o aceleración de estrés S3 >= 65%)
 * - MEDIA    (🟡 Carga 45% - 64% o contingencias recurrentes)
 * - BAJA     (🟢 Carga < 45% y flujo balanceado)
 */
@Repository
public interface AnaliticaCapacidadRepository extends JpaRepository<Trabajador, Long> {

    @Query(value = """
        WITH
        -- ═══════════════════════════════════════════════════════════════════
        -- CTE 1: Calendario analítico de 21 días generado por PostgreSQL
        -- Cada día se etiqueta en su ventana temporal (S1, S2, S3)
        -- ═══════════════════════════════════════════════════════════════════
        calendario_analitico AS (
            SELECT
                dia::date AS dia,
                CASE
                    WHEN dia::date >= CURRENT_DATE - 6  THEN 'S3'
                    WHEN dia::date >= CURRENT_DATE - 13 THEN 'S2'
                    ELSE 'S1'
                END AS ventana
            FROM generate_series(
                CURRENT_DATE - INTERVAL '20 days',
                CURRENT_DATE,
                INTERVAL '1 day'
            ) AS dia
        ),
       
        -- ═══════════════════════════════════════════════════════════════════
        -- CTE 2: Desarrolladores activos en el sistema
        -- ═══════════════════════════════════════════════════════════════════
        desarrolladores AS (
            SELECT id_trabajador, nombre, apellido, email, especialidad
            FROM trabajador
            WHERE rol = 'DESARROLLADOR' AND estado = true
        ),
       
        -- ═══════════════════════════════════════════════════════════════════
        -- CTE 3: Carga actual de la WBS (tareas activas por desarrollador)
        -- ═══════════════════════════════════════════════════════════════════
        carga_wbs AS (
            SELECT
                desarrollador_id,
                COUNT(*) AS tareas_activas
            FROM actividad
            WHERE estado IN ('PENDIENTE', 'EN_PROGRESO')
              AND desarrollador_id IS NOT NULL
            GROUP BY desarrollador_id
        ),
       
        -- ═══════════════════════════════════════════════════════════════════
        -- CTE 4: Errores técnicos cruzados con el calendario analítico
        -- Peso diferencial: CRITICA = x2, resto = x1
        -- ═══════════════════════════════════════════════════════════════════
        errores_por_ventana AS (
            SELECT
                e.desarrollador_id,
                c.ventana,
                COUNT(*)                                                    AS total_errores,
                SUM(CASE WHEN e.severidad = 'CRITICA' THEN 2 ELSE 1 END)   AS peso_errores
            FROM error e
            INNER JOIN calendario_analitico c ON e.fecha_registro::date = c.dia
            GROUP BY e.desarrollador_id, c.ventana
        ),
       
        -- ═══════════════════════════════════════════════════════════════════
        -- CTE 5: Interrupciones/contingencias cruzadas con el calendario
        -- Convierte minutos a horas decimales para el cálculo de impacto
        -- ═══════════════════════════════════════════════════════════════════
        interrupciones_por_ventana AS (
            SELECT
                i.desarrollador_id,
                c.ventana,
                SUM(COALESCE(i.duracion_minutos, 0)) / 60.0 AS horas_perdidas
            FROM interrupcion i
            INNER JOIN calendario_analitico c ON i.fecha_ocurrencia::date = c.dia
            GROUP BY i.desarrollador_id, c.ventana
        ),
       
        -- ═══════════════════════════════════════════════════════════════════
        -- CTE 6: Cruce maestro (LEFT JOIN) de todas las fuentes de datos
        -- Pivotea indicadores por ventana temporal (S1, S2, S3)
        -- ═══════════════════════════════════════════════════════════════════
        metricas_cruzadas AS (
            SELECT
                d.id_trabajador,
                d.nombre || ' ' || d.apellido                               AS nombre_completo,
                d.email,
                COALESCE(d.especialidad, 'Ingeniería de Software')          AS especialidad,
                COALESCE(w.tareas_activas, 0)                               AS tareas_activas,
                LEAST(45.0, COALESCE(w.tareas_activas, 0) * 12.0)          AS carga_base_wbs,
                COALESCE(SUM(CASE WHEN ev.ventana = 'S1' THEN ev.peso_errores END), 0)   AS errores_s1,
                COALESCE(SUM(CASE WHEN ev.ventana = 'S2' THEN ev.peso_errores END), 0)   AS errores_s2,
                COALESCE(SUM(CASE WHEN ev.ventana = 'S3' THEN ev.peso_errores END), 0)   AS errores_s3,
                COALESCE(SUM(CASE WHEN iv.ventana = 'S1' THEN iv.horas_perdidas END), 0) AS horas_s1,
                COALESCE(SUM(CASE WHEN iv.ventana = 'S2' THEN iv.horas_perdidas END), 0) AS horas_s2,
                COALESCE(SUM(CASE WHEN iv.ventana = 'S3' THEN iv.horas_perdidas END), 0) AS horas_s3
            FROM desarrolladores d
            LEFT JOIN carga_wbs w               ON w.desarrollador_id = d.id_trabajador
            LEFT JOIN errores_por_ventana ev    ON ev.desarrollador_id = d.id_trabajador
            LEFT JOIN interrupciones_por_ventana iv ON iv.desarrollador_id = d.id_trabajador
            GROUP BY d.id_trabajador, d.nombre, d.apellido, d.email, d.especialidad, w.tareas_activas
        ),
       
        -- ═══════════════════════════════════════════════════════════════════
        -- CTE 7: Fórmula ponderada de estrés por ventana temporal
        -- S1/S2: errores x10, horas x6 (línea base / transición)
        -- S3:    errores x12, horas x8 (sensibilidad alta a carga reciente)
        -- ═══════════════════════════════════════════════════════════════════
        scores_finales AS (
            SELECT
                mc.*,
                LEAST(100.0, mc.carga_base_wbs + mc.errores_s1 * 10.0 + mc.horas_s1 * 6.0)  AS score_s1,
                LEAST(100.0, mc.carga_base_wbs + mc.errores_s2 * 10.0 + mc.horas_s2 * 6.0)  AS score_s2,
                LEAST(100.0, mc.carga_base_wbs + mc.errores_s3 * 12.0 + mc.horas_s3 * 8.0)  AS score_s3
            FROM metricas_cruzadas mc
        )
       
        -- ═══════════════════════════════════════════════════════════════════
        -- SELECT FINAL: Clasificación homologada en 4 niveles de riesgo
        -- ═══════════════════════════════════════════════════════════════════
        SELECT
            sf.id_trabajador                                                           AS idTrabajador,
            sf.nombre_completo                                                         AS nombreCompleto,
            sf.email                                                                   AS email,
            sf.especialidad                                                            AS especialidad,
            sf.tareas_activas::int                                                     AS tareasActivas,
            ROUND(sf.score_s1::numeric, 1)                                             AS scoreSemana1,
            ROUND(sf.score_s2::numeric, 1)                                             AS scoreSemana2,
            ROUND(sf.score_s3::numeric, 1)                                             AS scoreSemana3,
            ROUND(((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0)::numeric, 1)      AS promedioCarga,
            CASE
                WHEN (sf.score_s1 >= 65 AND sf.score_s2 >= 65 AND sf.score_s3 >= 65) 
                     OR ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) >= 80
                    THEN 'CRITICA'
                WHEN sf.score_s3 >= 65 
                     OR ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) >= 60 
                     OR (sf.score_s3 - sf.score_s1) >= 25
                    THEN 'ALTA'
                WHEN sf.score_s3 >= 45 
                     OR ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) >= 40 
                     OR (sf.score_s3 - sf.score_s1) >= 15
                    THEN 'MEDIA'
                ELSE 'BAJA'
            END                                                                        AS estadoAlerta,
            CASE
                WHEN (sf.score_s1 >= 65 AND sf.score_s2 >= 65 AND sf.score_s3 >= 65) 
                     OR ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) >= 80
                    THEN 'ALERTA CRÍTICA: Desgaste severo acumulado en el ciclo de 21 días (Carga > 80%). Se requiere rebalanceo urgente de tareas WBS y restricción preventiva de nuevas asignaciones.'
                WHEN sf.score_s3 >= 65 
                     OR ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) >= 60 
                     OR (sf.score_s3 - sf.score_s1) >= 25
                    THEN 'NIVEL ALTO: Sobrecarga considerable o tendencia acelerada en los últimos 7 días. Monitorear resolución de contingencias y redistribuir actividades complejas.'
                WHEN sf.score_s3 >= 45 
                     OR ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) >= 40 
                     OR (sf.score_s3 - sf.score_s1) >= 15
                    THEN 'NIVEL MEDIO: Carga moderada con alertas preventivas e interrupciones recurrentes. Mantener seguimiento durante las entregas del sprint.'
                ELSE 'NIVEL BAJO / ESTABLE: Carga operativa equilibrada y ritmo de trabajo sostenible dentro de los parámetros óptimos.'
            END                                                                        AS recomendacion,
            CASE
                WHEN (sf.score_s1 >= 65 AND sf.score_s2 >= 65 AND sf.score_s3 >= 65) 
                     OR ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) >= 80
                    THEN true
                ELSE false
            END                                                                        AS capacidadBloqueada
        FROM scores_finales sf
        ORDER BY ((sf.score_s1 + sf.score_s2 + sf.score_s3) / 3.0) DESC, sf.score_s3 DESC
        """, nativeQuery = true)
    List<BurnoutProjection> calcularMatrizBurnout21Dias();
}
