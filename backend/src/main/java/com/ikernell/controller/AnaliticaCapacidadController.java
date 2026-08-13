package com.ikernell.controller;

import com.ikernell.dto.BurnoutMetricsDto;
import com.ikernell.service.AnaliticaCapacidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST para el Predictor de Burnout y Carga Cognitiva Histórica (RF-35).
 * Provee datos analíticos para la toma de decisiones del Líder de Proyecto y Coordinador.
 */
@RestController
@RequestMapping("/api/analitica")
@Tag(name = "Módulo Analítica Predictiva de Capacidad", description = "Endpoints para el cálculo de desgaste histórico y predicción de riesgo de Burnout (RF-35)")
@SecurityRequirement(name = "BearerAuth")
public class AnaliticaCapacidadController {

    private final AnaliticaCapacidadService analiticaCapacidadService;

    public AnaliticaCapacidadController(AnaliticaCapacidadService analiticaCapacidadService) {
        this.analiticaCapacidadService = analiticaCapacidadService;
    }

    @GetMapping("/burnout")
    @Operation(summary = "Matriz histórica de Burnout y Carga Cognitiva", description = "Calcula la tendencia temporal de 21 días (S1, S2, S3) de todos los desarrolladores activos (RF-35)")
    public ResponseEntity<List<BurnoutMetricsDto>> obtenerMatrizBurnout() {
        return ResponseEntity.ok(analiticaCapacidadService.calcularMatrizBurnoutDesarrolladores());
    }
}
