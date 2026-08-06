package com.ikernell.controller;

import com.ikernell.dto.EtlReportResponse;
import com.ikernell.model.*;
import com.ikernell.service.EtlAutomationService;
import com.ikernell.service.LiderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el rol LÍDER DE PROYECTO.
 * Administra proyectos, etapas WBS, asignaciones operativas y ejecuta la automatización ETL para Brasil.
 */
@RestController
@RequestMapping("/api/lider")
@Tag(name = "Módulo Líder", description = "Gestión de WBS de proyectos y exportación automatizada de reportes ETL internacionales")
@SecurityRequirement(name = "BearerAuth")
public class LiderController {

    private final LiderService liderService;
    private final EtlAutomationService etlAutomationService;

    public LiderController(LiderService liderService, EtlAutomationService etlAutomationService) {
        this.liderService = liderService;
        this.etlAutomationService = etlAutomationService;
    }

    @PostMapping("/proyectos")
    @Operation(summary = "Crear un Proyecto", description = "Crea un nuevo proyecto en estado activo vinculándolo al líder responsable (RF-14)")
    public ResponseEntity<Proyecto> crearProyecto(@Valid @RequestBody Proyecto proyecto, @RequestParam Long idLider) {
        Proyecto nuevo = liderService.crearProyecto(proyecto, idLider);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/proyectos/{id}")
    @Operation(summary = "Modificar Proyecto", description = "Actualiza los datos descriptivos y fechas estimadas de un proyecto (RF-14)")
    public ResponseEntity<Proyecto> actualizarProyecto(@PathVariable Long id, @Valid @RequestBody Proyecto proyecto) {
        Proyecto actualizado = liderService.actualizarProyecto(id, proyecto);
        return ResponseEntity.ok(actualizado);
    }

    @PatchMapping("/proyectos/{id}/inhabilitar")
    @Operation(summary = "Inhabilitar Proyecto", description = "Cambia el estado de un proyecto a inhabilitado para detener su operación")
    public ResponseEntity<Void> inhabilitarProyecto(@PathVariable Long id) {
        liderService.inhabilitarProyecto(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/lideres/{idLider}/proyectos")
    @Operation(summary = "Proyectos por Líder", description = "Obtiene los proyectos que se encuentran bajo supervisión y responsibility de un líder")
    public ResponseEntity<List<Proyecto>> listarProyectosPorLider(@PathVariable Long idLider) {
        return ResponseEntity.ok(liderService.listarProyectosPorLider(idLider));
    }

    @PostMapping("/proyectos/{idProyecto}/etapas")
    @Operation(summary = "Registrar Etapa WBS", description = "Agrega una nueva fase o etapa al Desglose Estructural del Proyecto (RF-15)")
    public ResponseEntity<Etapa> registrarEtapa(@PathVariable Long idProyecto, @Valid @RequestBody Etapa etapa) {
        Etapa nuevaEtapa = liderService.registrarEtapa(idProyecto, etapa);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEtapa);
    }

    @DeleteMapping("/etapas/{idEtapa}")
    @Operation(summary = "Eliminar Etapa WBS", description = "Elimina una etapa del desglose WBS de un proyecto (RF-15)")
    public ResponseEntity<Void> eliminarEtapa(@PathVariable Long idEtapa) {
        liderService.eliminarEtapa(idEtapa);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/proyectos/{idProyecto}/desarrolladores/{idDesarrollador}")
    @Operation(summary = "Asignar Desarrollador a Proyecto", description = "Vincula formalmente a un desarrollador al proyecto del líder (RF-16)")
    public ResponseEntity<ProyectoDesarrollador> asignarDesarrollador(
            @PathVariable Long idProyecto, 
            @PathVariable Long idDesarrollador) {
        ProyectoDesarrollador asignacion = liderService.asignarDesarrollador(idProyecto, idDesarrollador);
        return ResponseEntity.status(HttpStatus.CREATED).body(asignacion);
    }

    @PostMapping("/etapas/{idEtapa}/desarrolladores/{idDesarrollador}/actividades")
    @Operation(summary = "Asignar Actividad a Desarrollador", description = "Crea y asigna una tarea específica dentro de una etapa para su desarrollo (RF-17)")
    public ResponseEntity<Actividad> asignarActividad(
            @PathVariable Long idEtapa, 
            @PathVariable Long idDesarrollador, 
            @Valid @RequestBody Actividad actividad) {
        Actividad nuevaActividad = liderService.asignarActividad(idEtapa, idDesarrollador, actividad);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaActividad);
    }

    // =========================================================================
    // INNOVACIÓN 2: AUTOMATIZACIÓN ETL PARA ALIANZA BRASIL (ONE-CLICK EXPORT)
    // RF-28, RF-29, RF-30
    // =========================================================================
    @PostMapping("/proyectos/{idProyecto}/etl-export-brasil")
    @Operation(
        summary = "Innovación 2: One-Click Export ETL Brasil", 
        description = "Ejecuta de forma instantánea el proceso ETL para el proyecto: recopila métricas operativas de contingencias y errores, estandariza según ISO 8601 en formato delimitado y simula envío por SFTP y Email cifrados a Brasil (RF-28, RF-29, RF-30)"
    )
    public ResponseEntity<EtlReportResponse> exportarReporteBrasilOneClick(@PathVariable Long idProyecto) {
        EtlReportResponse response = etlAutomationService.generarYEnviarReporteBrasil(idProyecto);
        return ResponseEntity.ok(response);
    }
}
