package com.ikernell.controller;

import com.ikernell.dto.ErrorDto;
import com.ikernell.dto.InterrupcionDto;
import com.ikernell.model.Actividad;
import com.ikernell.model.Error;
import com.ikernell.model.Etapa;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para las operaciones operacionales cotidianas de los DESARROLLADORES.
 * Todos sus métodos requieren token JWT válido y rol autorizado.
 */
@RestController
@RequestMapping("/api/desarrollador")
@PreAuthorize("hasAnyRole('COORDINADOR','LIDER','DESARROLLADOR')")
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

    @GetMapping("/mis-actividades/paginado")
    @Operation(summary = "Obtener actividades asignadas paginadas", description = "Devuelve el listado paginado de actividades del desarrollador (Params: ?page=0&size=10&sort=estado,asc)")
    public ResponseEntity<org.springframework.data.domain.Page<Actividad>> obtenerMisActividadesPaginado(
            @AuthenticationPrincipal UserDetails userDetails,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "estado") org.springframework.data.domain.Pageable pageable) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(desarrolladorService.obtenerMisActividadesPaginado(email, pageable));
    }

    @PatchMapping("/actividades/{id}/estado")
    @Operation(summary = "Cambiar estado de una actividad", description = "Cambia el estado de una actividad asignada al desarrollador (RF-20). Body: { \"estado\": \"EN_PROGRESO\" }")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estado de la actividad actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "Estado inválido proporcionado"),
        @ApiResponse(responseCode = "403", description = "La actividad no pertenece al desarrollador autenticado"),
        @ApiResponse(responseCode = "404", description = "Actividad no encontrada")
    })
    public ResponseEntity<Actividad> cambiarEstadoActividad(
            @PathVariable("id") Long idActividad,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String nuevoEstado = body.get("estado");
        String email = userDetails.getUsername();
        Actividad actividadActualizada = desarrolladorService.cambiarEstadoActividad(idActividad, nuevoEstado, email);
        return ResponseEntity.ok(actividadActualizada);
    }

    @GetMapping("/etapas")
    @Operation(summary = "Obtener etapas WBS disponibles", description = "Devuelve todas las etapas del sistema para los selectores de formulario del desarrollador")
    public ResponseEntity<List<Etapa>> obtenerEtapas() {
        return ResponseEntity.ok(desarrolladorService.obtenerEtapasDisponibles());
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

    @GetMapping("/mis-reportes")
    @Operation(summary = "Obtener historial de reportes del desarrollador", description = "Devuelve los errores e interrupciones reportados por el usuario autenticado (RF-22 a RF-24)")
    public ResponseEntity<Map<String, Object>> obtenerMisReportes(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(desarrolladorService.obtenerMisReportes(email));
    }
}
