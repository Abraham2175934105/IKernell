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
 * El backend Java NO realiza ningún cálculo matemático; únicamente consume la proyección.
 */
@Repository
public interface AnaliticaCapacidadRepository extends JpaRepository<Trabajador, Long> {

    /**
     * Consulta analítica nativa que calcula la Matriz de Burnout Histórico de 21 días.
     *
     * Arquitectura SQL:
     * ─────────────────────────────────────────────────────────────────────────
     * CTE 1 (calendario_analitico): Genera la serie temporal de 21 días con
     *        generate_series() y etiqueta cada día en su ventana (S1, S2, S3).
     *
     * CTE 2 (desarrolladores):      Filtra trabajadores activos con rol DESARROLLADOR.
     *
     * CTE 3 (carga_wbs):            Cuenta tareas activas (PENDIENTE / EN_PROGRESO)
     *        por desarrollador como indicador de saturación operativa.
     *
     * CTE 4 (errores_por_ventana):  Cruza errores con el calendario y agrega por ventana.
     *        Aplica peso diferencial por severidad (CRITICA = x2).
     *
     * CTE 5 (interrupciones_por_ventana): Cruza interrupciones con el calendario
     *        y convierte duración de minutos a horas decimales por ventana.
     *
     * CTE 6 (metricas_cruzadas):    LEFT JOIN de las 4 fuentes de datos.
     *        Pivotea los indicadores por ventana (S1, S2, S3).
     *
     * CTE 7 (scores_finales):       Aplica la fórmula ponderada:
     *        Score = min(100, carga_wbs + errores * peso + horas * peso)
     *        S3 tiene coeficientes más altos (sensibilidad a carga reciente).
     *
     * SELECT final:                 Clasifica el estado predictivo con CASE:
     *        - RIESGO_BURNOUT_INMINENTE: 3 semanas consecutivas >= 65%
     *        - SOBRECARGA_AGUDA: S3 >= 80%
     *        - TENDENCIA_DE_ESTRES_ACELERADA: delta(S3 - S1) >= 25
     *        - ESTABLE: caso por defecto
     * ─────────────────────────────────────────────────────────────────────────
     */
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
                LEAST(60.0, COALESCE(w.tareas_activas, 0) * 18.0)          AS carga_base_wbs,
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
        -- S1/S2: errores x12, horas x8 (línea base / transición)
        -- S3:    errores x15, horas x10 (sensibilidad alta a carga reciente)
        -- ═══════════════════════════════════════════════════════════════════
        scores_finales AS (
            SELECT
                mc.*,
                LEAST(100.0, mc.carga_base_wbs + mc.errores_s1 * 12.0 + mc.horas_s1 * 8.0)  AS score_s1,
                LEAST(100.0, mc.carga_base_wbs + mc.errores_s2 * 12.0 + mc.horas_s2 * 8.0)  AS score_s2,
                LEAST(100.0, mc.carga_base_wbs + mc.errores_s3 * 15.0 + mc.horas_s3 * 10.0) AS score_s3
            FROM metricas_cruzadas mc
        )
       
        -- ═══════════════════════════════════════════════════════════════════
        -- SELECT FINAL: Clasificación predictiva del estado de burnout
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
                WHEN sf.score_s1 >= 65 AND sf.score_s2 >= 65 AND sf.score_s3 >= 65
                    THEN 'RIESGO_BURNOUT_INMINENTE'
                WHEN sf.score_s3 >= 80
                    THEN 'SOBRECARGA_AGUDA'
                WHEN (sf.score_s3 - sf.score_s1) >= 25
                    THEN 'TENDENCIA_DE_ESTRES_ACELERADA'
                ELSE 'ESTABLE'
            END                                                                        AS estadoAlerta,
            CASE
                WHEN sf.score_s1 >= 65 AND sf.score_s2 >= 65 AND sf.score_s3 >= 65
                    THEN 'ALERTA CRITICA: Desgaste acumulado durante 3 semanas consecutivas. Redistribuir tareas WBS inmediatamente y restringir nuevas asignaciones.'
                WHEN sf.score_s3 >= 80
                    THEN 'Sobrecarga elevada en los ultimos 7 dias. Monitorear resolucion de contingencias y reducir asignaciones.'
                WHEN (sf.score_s3 - sf.score_s1) >= 25
                    THEN 'Incremento acelerado en el volumen de errores e interrupciones respecto a la linea base semanal.'
                ELSE 'Carga operativa equilibrada dentro de los parametros de rendimiento optimo.'
            END                                                                        AS recomendacion,
            CASE
                WHEN sf.score_s1 >= 65 AND sf.score_s2 >= 65 AND sf.score_s3 >= 65
                    THEN true
                ELSE false
            END                                                                        AS capacidadBloqueada
        FROM scores_finales sf
        ORDER BY sf.score_s3 DESC, sf.score_s2 DESC
        """, nativeQuery = true)
    List<BurnoutProjection> calcularMatrizBurnout21Dias();
}
