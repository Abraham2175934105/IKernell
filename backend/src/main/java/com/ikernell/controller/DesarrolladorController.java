package com.ikernell.controller;

import com.ikernell.dto.ErrorDto;
import com.ikernell.dto.InterrupcionDto;
import com.ikernell.model.Actividad;
import com.ikernell.model.Error;
import com.ikernell.model.Interrupcion;
import com.ikernell.service.DesarrolladorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para las operaciones operacionales cotidianas de los DESARROLLADORES.
 * Todos sus métodos requieren token JWT válido y rol autorizado.
 */
@RestController
@RequestMapping("/api/desarrollador")
@Tag(name = "Módulo Desarrollador", description = "Seguimiento de actividades asignadas y reporte de contingencias o errores en tiempo real")
@SecurityRequirement(name = "BearerAuth")
public class DesarrolladorController {

    private final DesarrolladorService desarrolladorService;

    public DesarrolladorController(DesarrolladorService desarrolladorService) {
        this.desarrolladorService = desarrolladorService;
    }

    @GetMapping("/mis-actividades")
    @Operation(summary = "Obtener actividades asignadas", description = "Devuelve el tablero de actividades pendientes del desarrollador autenticado en el token (RF-21)")
    public ResponseEntity<List<Actividad>> obtenerMisActividades(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(desarrolladorService.obtenerMisActividades(email));
    }

    @PostMapping("/errores")
    @Operation(summary = "Reportar un Error detectado", description = "Registra un error en una fase WBS específica con grado de severidad (RF-22)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Error registrado de forma transaccional"),
        @ApiResponse(responseCode = "400", description = "Error en validación JSON o parámetro requerido ausente"),
        @ApiResponse(responseCode = "404", description = "La etapa WBS referenciada no existe")
    })
    public ResponseEntity<Error> registrarError(
            @Valid @RequestBody ErrorDto errorDto, 
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Error nuevoError = desarrolladorService.registrarError(errorDto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoError);
    }

    @PostMapping("/interrupciones")
    @Operation(summary = "Reportar una Contingencia / Interrupción", description = "Reporta tiempo perdido en minutos para alimentar el Semáforo Predictivo de Riesgos de la gerencia (RF-23, RF-24)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Contingencia registrada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (ej: duración en minutos negativa o cero)"),
        @ApiResponse(responseCode = "404", description = "Fase/Etapa WBS no encontrada")
    })
    public ResponseEntity<Interrupcion> registrarInterrupcion(
            @Valid @RequestBody InterrupcionDto interrupcionDto, 
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Interrupcion nuevaInterrupcion = desarrolladorService.registrarInterrupcion(interrupcionDto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaInterrupcion);
    }
}
