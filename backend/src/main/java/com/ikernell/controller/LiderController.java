package com.ikernell.controller;

import com.ikernell.dto.EtlReportResponse;
import com.ikernell.dto.SemaforoMetricsDto;
import com.ikernell.model.*;
import com.ikernell.model.Error;
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
import java.util.Map;

/**
 * Controlador REST para el rol LÍDER DE PROYECTO.
 * Administra WBS, asignación de actividades, evaluación del Semáforo Inteligente y exportación ETL.
 */
@RestController
@RequestMapping("/api/lider")
@Tag(name = "Módulo Líder", description = "Gestión de WBS de proyectos, Semáforo Predictivo y exportación automatizada ETL")
@SecurityRequirement(name = "BearerAuth")
public class LiderController {

    private final LiderService liderService;
    private final EtlAutomationService etlAutomationService;

    public LiderController(LiderService liderService, EtlAutomationService etlAutomationService) {
        this.liderService = liderService;
        this.etlAutomationService = etlAutomationService;
    }

    @GetMapping("/proyectos")
    @Operation(summary = "Listar todos los proyectos disponibles", description = "Devuelve el listado completo de proyectos para el panel del líder")
    public ResponseEntity<List<Proyecto>> listarProyectos() {
        return ResponseEntity.ok(liderService.listarTodosLosProyectos());
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
    @Operation(summary = "Proyectos por Líder", description = "Obtiene los proyectos que se encuentran bajo supervisión de un líder")
    public ResponseEntity<List<Proyecto>> listarProyectosPorLider(@PathVariable Long idLider) {
        return ResponseEntity.ok(liderService.listarProyectosPorLider(idLider));
    }

    @GetMapping("/proyectos/{idProyecto}/etapas")
    @Operation(summary = "Etapas WBS por Proyecto", description = "Devuelve las fases y actividades del desglose WBS de un proyecto")
    public ResponseEntity<List<Etapa>> obtenerEtapasPorProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(liderService.obtenerEtapasPorProyecto(idProyecto));
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

    @GetMapping("/desarrolladores")
    @Operation(summary = "Listar desarrolladores disponibles", description = "Devuelve la nómina de desarrolladores activos para asignar a etapas y tareas")
    public ResponseEntity<List<Trabajador>> listarDesarrolladores() {
        return ResponseEntity.ok(liderService.listarDesarrolladoresActivos());
    }

    @PostMapping("/proyectos/{idProyecto}/desarrolladores/{idDesarrollador}")
    @Operation(summary = "Asignar Desarrollador a Proyecto", description = "Vincula formalmente a un desarrollador al proyecto del líder (RF-16)")
    public ResponseEntity<ProyectoDesarrollador> asignarDesarrollador(
            @PathVariable Long idProyecto, 
            @PathVariable Long idDesarrollador) {
        ProyectoDesarrollador asignacion = liderService.asignarDesarrollador(idProyecto, idDesarrollador);
        return ResponseEntity.status(HttpStatus.CREATED).body(asignacion);
    }

    @PostMapping("/actividades")
    @Operation(summary = "Crear y Asignar Actividad WBS", description = "Crea una nueva actividad asignada a un desarrollador dentro de una etapa (RF-17)")
    public ResponseEntity<Actividad> crearYAsignarActividad(@RequestBody Map<String, Object> payload) {
        Long idEtapa = Long.valueOf(payload.get("idEtapa").toString());
        Long idDesarrollador = Long.valueOf(payload.get("idDesarrollador").toString());
        String descripcion = (String) payload.get("descripcion");

        Actividad actividad = new Actividad();
        actividad.setDescripcion(descripcion);
        actividad.setEstado("PENDIENTE");

        Actividad nuevaActividad = liderService.asignarActividad(idEtapa, idDesarrollador, actividad);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaActividad);
    }

    @PostMapping("/etapas/{idEtapa}/desarrolladores/{idDesarrollador}/actividades")
    @Operation(summary = "Asignar Actividad a Desarrollador (Legacy)", description = "Crea y asigna una tarea específica dentro de una etapa para su desarrollo (RF-17)")
    public ResponseEntity<Actividad> asignarActividad(
            @PathVariable Long idEtapa, 
            @PathVariable Long idDesarrollador, 
            @Valid @RequestBody Actividad actividad) {
        Actividad nuevaActividad = liderService.asignarActividad(idEtapa, idDesarrollador, actividad);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaActividad);
    }

    @PatchMapping("/actividades/{idActividad}/reasignar")
    @Operation(summary = "Reasignar Actividad a otro Desarrollador", description = "Permite transferir la responsabilidad de una tarea a otro desarrollador registrando la justificación (RF-17)")
    public ResponseEntity<Actividad> reasignarActividad(
            @PathVariable Long idActividad, 
            @RequestBody Map<String, Object> payload) {
        Long idDesarrollador = Long.valueOf(payload.get("idDesarrollador").toString());
        String motivo = (String) payload.get("motivo");
        Actividad actualizada = liderService.reasignarActividad(idActividad, idDesarrollador, motivo);
        return ResponseEntity.ok(actualizada);
    }

    // Semáforo inteligente de riesgos corporativo global
    @GetMapping("/proyectos/global/metricas-semaforo")
    @Operation(
        summary = "Métricas consolidadas para el Semáforo Inteligente Corporativo Global", 
        description = "Calcula el nivel de riesgo consolidado de toda la organización integrando todos los proyectos activos"
    )
    public ResponseEntity<SemaforoMetricsDto> obtenerMetricasSemaforoGlobal() {
        return ResponseEntity.ok(liderService.calcularMetricasSemaforoGlobal());
    }

    // Semáforo inteligente de riesgos y salud del proyecto
    @GetMapping("/proyectos/{idProyecto}/metricas-semaforo")
    @Operation(
        summary = "Métricas en tiempo real para el Semáforo Inteligente", 
        description = "Calcula el nivel de riesgo del proyecto (Verde, Naranja, Rojo) basado en errores e interrupciones reales persistidos en PostgreSQL"
    )
    public ResponseEntity<SemaforoMetricsDto> obtenerMetricasSemaforo(@PathVariable String idProyecto) {
        if ("GLOBAL".equalsIgnoreCase(idProyecto) || "all".equalsIgnoreCase(idProyecto) || "null".equalsIgnoreCase(idProyecto)) {
            return ResponseEntity.ok(liderService.calcularMetricasSemaforoGlobal());
        }
        Long id = Long.valueOf(idProyecto);
        return ResponseEntity.ok(liderService.calcularMetricasSemaforo(id));
    }

    @GetMapping("/proyectos/{idProyecto}/errores")
    @Operation(summary = "Listar incidencias de un proyecto", description = "Devuelve todos los errores reportados en las fases del proyecto")
    public ResponseEntity<List<Error>> obtenerErroresProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(liderService.obtenerErroresPorProyecto(idProyecto));
    }

    @GetMapping("/proyectos/{idProyecto}/interrupciones")
    @Operation(summary = "Listar interrupciones de un proyecto", description = "Devuelve todas las contingencias reportadas en el proyecto")
    public ResponseEntity<List<Interrupcion>> obtenerInterrupcionesProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(liderService.obtenerInterrupcionesPorProyecto(idProyecto));
    }

    // Pipeline de exportación y estandarización ETL para Alianza Brasil
    @PostMapping("/proyectos/{idProyecto}/etl-export-brasil")
    @Operation(
        summary = "One-Click Export ETL Brasil", 
        description = "Ejecuta de forma instantánea el proceso ETL para el proyecto: recopila métricas operativas de contingencias y errores, estandariza según ISO 8601 en formato delimitado y simula envío por SFTP y Email cifrados a Brasil (RF-28, RF-29, RF-30)"
    )
    public ResponseEntity<EtlReportResponse> exportarReporteBrasilOneClick(@PathVariable Long idProyecto) {
        EtlReportResponse response = etlAutomationService.generarYEnviarReporteBrasil(idProyecto);
        return ResponseEntity.ok(response);
    }

    // Consola de gestión y resolución de incidencias del equipo
    @GetMapping("/proyectos/{idProyecto}/reportes-consolidados")
    @Operation(summary = "Reportes consolidados de equipo", description = "Devuelve errores e interrupciones cargados por desarrolladores en el proyecto (RF-22 a RF-24)")
    public ResponseEntity<Map<String, Object>> obtenerReportesConsolidados(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(liderService.obtenerReportesConsolidadosProyecto(idProyecto));
    }

    @PatchMapping("/errores/{idError}/atender")
    @Operation(summary = "Atender o Resolver Error Técnico", description = "Actualiza el estado de atención del error y agrega observaciones del líder/coordinador")
    public ResponseEntity<Error> atenderError(
            @PathVariable Long idError,
            @RequestBody Map<String, String> payload) {
        String estadoAtencion = payload.get("estadoAtencion");
        String resolucionNota = payload.get("resolucionNota");
        return ResponseEntity.ok(liderService.atenderError(idError, estadoAtencion, resolucionNota));
    }

    @PatchMapping("/interrupciones/{idInterrupcion}/atender")
    @Operation(summary = "Atender o Justificar Interrupción", description = "Actualiza el estado de atención de la interrupción y registra acciones correctivas")
    public ResponseEntity<Interrupcion> atenderInterrupcion(
            @PathVariable Long idInterrupcion,
            @RequestBody Map<String, String> payload) {
        String estadoAtencion = payload.get("estadoAtencion");
        String resolucionNota = payload.get("resolucionNota");
        return ResponseEntity.ok(liderService.atenderInterrupcion(idInterrupcion, estadoAtencion, resolucionNota));
    }
}
