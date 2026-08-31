package com.ikernell.controller;

import com.ikernell.dto.EtlReportResponse;
import com.ikernell.dto.SemaforoMetricsDto;
import com.ikernell.model.*;
import com.ikernell.model.Error;
import com.ikernell.service.EtlAutomationService;
import com.ikernell.service.LiderService;
import com.ikernell.repository.HistorialCambiosCoordinadorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para el rol LÍDER DE PROYECTO.
 * Administra WBS, asignación de actividades, evaluación del Semáforo Inteligente y exportación ETL.
 */
@RestController
@RequestMapping("/api/lider")
@PreAuthorize("hasAnyRole('COORDINADOR','LIDER')")
@Tag(name = "Módulo Líder", description = "Gestión de WBS de proyectos, Semáforo Predictivo y exportación automatizada ETL")
@SecurityRequirement(name = "BearerAuth")
public class LiderController {

    private final LiderService liderService;
    private final EtlAutomationService etlAutomationService;
    private final HistorialCambiosCoordinadorRepository historialCambiosCoordinadorRepository;

    public LiderController(LiderService liderService, EtlAutomationService etlAutomationService, HistorialCambiosCoordinadorRepository historialCambiosCoordinadorRepository) {
        this.liderService = liderService;
        this.etlAutomationService = etlAutomationService;
        this.historialCambiosCoordinadorRepository = historialCambiosCoordinadorRepository;
    }

    @GetMapping("/proyectos/{idProyecto}/historial-cambios")
    @Operation(summary = "Obtener historial de cambios realizados por Coordinador o Líder", description = "Permite consultar todas las modificaciones directivas registradas en el proyecto")
    public ResponseEntity<List<com.ikernell.model.HistorialCambiosCoordinador>> obtenerHistorialCambiosProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(historialCambiosCoordinadorRepository.findByProyectoIdProyectoOrderByFechaCambioDesc(idProyecto));
    }

    @PostMapping("/proyectos/{idProyecto}/historial-cambios")
    @Operation(summary = "Registrar acción de auditoría en proyecto", description = "Guarda un registro acumulado de modificaciones registradas en el proyecto")
    public ResponseEntity<HistorialCambiosCoordinador> registrarCambio(
            @PathVariable Long idProyecto,
            @RequestParam Long idCoordinador,
            @RequestParam String nombreCoordinador,
            @RequestParam String emailCoordinador,
            @RequestParam String accion,
            @RequestParam String detalles,
            @RequestParam(required = false) String batchId) {
        HistorialCambiosCoordinador reg = new HistorialCambiosCoordinador();
        Proyecto p = new Proyecto();
        p.setIdProyecto(idProyecto);
        reg.setProyecto(p);
        reg.setIdCoordinador(idCoordinador);
        reg.setNombreCoordinador(nombreCoordinador);
        reg.setEmailCoordinador(emailCoordinador);
        reg.setAccion(accion);
        reg.setDetalles(detalles);
        reg.setBatchId(batchId);
        reg.setFechaCambio(java.time.LocalDateTime.now());
        HistorialCambiosCoordinador guardado = historialCambiosCoordinadorRepository.save(reg);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PutMapping("/proyectos/{idProyecto}/confirmar-lectura-reasignacion")
    @Operation(summary = "Confirmar lectura de reasignación", description = "Marca como leída la notificación de transferencia por parte del Líder anterior")
    public ResponseEntity<Proyecto> confirmarLecturaReasignacion(@PathVariable Long idProyecto) {
        Proyecto actualizado = liderService.confirmarLecturaReasignacion(idProyecto);
        return ResponseEntity.ok(actualizado);
    }

    @PostMapping("/trabajadores")
    @Operation(summary = "Registrar nuevo trabajador (Líder o Desarrollador)", description = "Permite al Líder registrar nuevos colaboradores únicamente con rol Líder o Desarrollador")
    public ResponseEntity<Trabajador> registrarTrabajadorPorLider(@Valid @RequestBody Trabajador trabajador) {
        Trabajador nuevo = liderService.registrarTrabajadorPorLider(trabajador);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @GetMapping("/proyectos")
    @Operation(summary = "Listar todos los proyectos disponibles", description = "Devuelve el listado completo de proyectos para el panel del líder")
    public ResponseEntity<List<Proyecto>> listarProyectos() {
        return ResponseEntity.ok(liderService.listarTodosLosProyectos());
    }

    @PostMapping("/proyectos")
    @Operation(summary = "Crear un Proyecto", description = "Crea un nuevo proyecto en estado activo vinculándolo al líder responsable (HU-11 / RF-13 / RF-14)")
    public ResponseEntity<Proyecto> crearProyecto(@RequestBody Proyecto proyecto, @RequestParam(required = false) Long idLider) {
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

    @PatchMapping("/proyectos/{id}/pausar")
    @Operation(summary = "Pausar Proyecto", description = "Cambia el estado del proyecto a EN_PAUSA")
    public ResponseEntity<Proyecto> pausarProyecto(@PathVariable Long id) {
        Proyecto pausado = liderService.pausarProyecto(id);
        return ResponseEntity.ok(pausado);
    }

    @PatchMapping("/proyectos/{id}/reactivar")
    @Operation(summary = "Reactivar Proyecto", description = "Restablece el estado de un proyecto pausado a ACTIVO")
    public ResponseEntity<Proyecto> reactivarProyecto(@PathVariable Long id) {
        Proyecto reactivado = liderService.reactivarProyecto(id);
        return ResponseEntity.ok(reactivado);
    }

    @PatchMapping("/proyectos/{id}/finalizar")
    @Operation(
        summary = "Finalizar Proyecto Formalmente", 
        description = "Cierra el ciclo de vida del proyecto, congela sus fases WBS en estado FINALIZADA y libera la asignación horaria de los desarrolladores para regular el Burnout (RF-20)"
    )
    public ResponseEntity<Proyecto> finalizarProyecto(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        Proyecto finalizado = liderService.finalizarProyecto(id, payload);
        return ResponseEntity.ok(finalizado);
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

    @PutMapping("/etapas/{idEtapa}")
    @Operation(summary = "Editar Etapa WBS", description = "Actualiza el nombre y estado de una etapa WBS")
    public ResponseEntity<Etapa> actualizarEtapa(@PathVariable Long idEtapa, @RequestBody Etapa etapa) {
        Etapa actualizada = liderService.actualizarEtapa(idEtapa, etapa);
        return ResponseEntity.ok(actualizada);
    }

    @GetMapping("/desarrolladores")
    @Operation(summary = "Listar desarrolladores disponibles", description = "Devuelve la nómina de desarrolladores activos para asignar a etapas y tareas")
    public ResponseEntity<List<Trabajador>> listarDesarrolladores() {
        return ResponseEntity.ok(liderService.listarDesarrolladoresActivos());
    }

    @GetMapping("/desarrolladores-cargas")
    @Operation(summary = "Listar desarrolladores con balance de horas", description = "Devuelve los desarrolladores activos con sus horas semanales asignadas y límite de 48h (HU-12)")
    public ResponseEntity<List<com.ikernell.dto.DesarrolladorCargaDTO>> listarDesarrolladoresConCarga() {
        return ResponseEntity.ok(liderService.listarDesarrolladoresConCarga());
    }

    @GetMapping("/proyectos/{idProyecto}/desarrolladores")
    @Operation(summary = "Listar desarrolladores asignados al proyecto", description = "Devuelve las asignaciones activas de un proyecto específico (HU-12)")
    public ResponseEntity<List<ProyectoDesarrollador>> obtenerDesarrolladoresPorProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(liderService.obtenerDesarrolladoresPorProyecto(idProyecto));
    }

    @PostMapping("/proyectos/{idProyecto}/asignar")
    @Operation(summary = "Asignar Desarrollador a Proyecto con Horas", description = "Asigna un desarrollador al proyecto validando el límite máximo legal de 48 horas semanales (HU-12 / RF-16)")
    public ResponseEntity<ProyectoDesarrollador> asignarDesarrolladorConHoras(
            @PathVariable Long idProyecto,
            @RequestBody com.ikernell.dto.AsignarDesarrolladorRequest request) {
        ProyectoDesarrollador asignacion = liderService.asignarDesarrollador(
                idProyecto, 
                request.getIdDesarrollador(), 
                request.getHorasSemanales()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(asignacion);
    }

    @PostMapping("/proyectos/{idProyecto}/desarrolladores/{idDesarrollador}")
    @Operation(summary = "Asignar Desarrollador a Proyecto", description = "Vincula formalmente a un desarrollador al proyecto del líder con horas semanales opcionales (RF-16 / HU-12)")
    public ResponseEntity<ProyectoDesarrollador> asignarDesarrollador(
            @PathVariable Long idProyecto, 
            @PathVariable Long idDesarrollador,
            @RequestParam(required = false, defaultValue = "40") Integer horasSemanales) {
        ProyectoDesarrollador asignacion = liderService.asignarDesarrollador(idProyecto, idDesarrollador, horasSemanales);
        return ResponseEntity.status(HttpStatus.CREATED).body(asignacion);
    }

    @DeleteMapping("/proyectos/{idProyecto}/desarrolladores/{idDesarrollador}")
    @Operation(summary = "Desvincular Desarrollador del Proyecto", description = "Libera la asignación horaria de un desarrollador en un proyecto específico (HU-12)")
    public ResponseEntity<Void> desasignarDesarrollador(
            @PathVariable Long idProyecto,
            @PathVariable Long idDesarrollador) {
        liderService.desasignarDesarrolladorDeProyecto(idProyecto, idDesarrollador);
        return ResponseEntity.noContent().build();
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
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) Long idNuevoDesarrollador,
            @RequestParam(required = false) Long idDesarrollador,
            @RequestParam(required = false) String motivo) {
        
        Long targetDevId = idNuevoDesarrollador != null ? idNuevoDesarrollador : idDesarrollador;
        String targetMotivo = motivo;

        if (payload != null) {
            if (targetDevId == null && payload.containsKey("idDesarrollador") && payload.get("idDesarrollador") != null) {
                try { targetDevId = Long.valueOf(payload.get("idDesarrollador").toString()); } catch (Exception ignored) {}
            }
            if (targetDevId == null && payload.containsKey("idNuevoDesarrollador") && payload.get("idNuevoDesarrollador") != null) {
                try { targetDevId = Long.valueOf(payload.get("idNuevoDesarrollador").toString()); } catch (Exception ignored) {}
            }
            if (targetMotivo == null && payload.containsKey("motivo") && payload.get("motivo") != null) {
                targetMotivo = payload.get("motivo").toString();
            }
        }

        if (targetDevId == null) {
            throw new IllegalArgumentException("Debe especificar el identificador del nuevo desarrollador.");
        }

        Actividad actualizada = liderService.reasignarActividad(idActividad, targetDevId, targetMotivo);
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

    @GetMapping("/errores/global")
    @Operation(summary = "Listar todas las incidencias globales", description = "Devuelve todos los errores reportados en la compañía")
    public ResponseEntity<List<Error>> obtenerTodosLosErrores() {
        return ResponseEntity.ok(liderService.obtenerTodosLosErrores());
    }

    @GetMapping("/interrupciones/global")
    @Operation(summary = "Listar todas las interrupciones globales", description = "Devuelve todas las contingencias reportadas en la compañía")
    public ResponseEntity<List<Interrupcion>> obtenerTodasLasInterrupciones() {
        return ResponseEntity.ok(liderService.obtenerTodasLasInterrupciones());
    }

    @GetMapping("/incidencias/global")
    @Operation(summary = "Reportes consolidados globales", description = "Devuelve todos los errores e interrupciones de todos los proyectos")
    public ResponseEntity<Map<String, Object>> obtenerIncidenciasGlobales() {
        return ResponseEntity.ok(liderService.obtenerReportesConsolidadosGlobal());
    }

    @GetMapping("/proyectos/{idProyecto}/errores")
    @Operation(summary = "Listar incidencias de un proyecto o globales", description = "Devuelve todos los errores reportados en las fases del proyecto")
    public ResponseEntity<List<Error>> obtenerErroresProyecto(@PathVariable String idProyecto) {
        if ("GLOBAL".equalsIgnoreCase(idProyecto) || "all".equalsIgnoreCase(idProyecto) || "null".equalsIgnoreCase(idProyecto)) {
            return ResponseEntity.ok(liderService.obtenerTodosLosErrores());
        }
        return ResponseEntity.ok(liderService.obtenerErroresPorProyecto(Long.valueOf(idProyecto)));
    }

    @GetMapping("/proyectos/{idProyecto}/interrupciones")
    @Operation(summary = "Listar interrupciones de un proyecto o globales", description = "Devuelve todas las contingencias reportadas en el proyecto")
    public ResponseEntity<List<Interrupcion>> obtenerInterrupcionesProyecto(@PathVariable String idProyecto) {
        if ("GLOBAL".equalsIgnoreCase(idProyecto) || "all".equalsIgnoreCase(idProyecto) || "null".equalsIgnoreCase(idProyecto)) {
            return ResponseEntity.ok(liderService.obtenerTodasLasInterrupciones());
        }
        return ResponseEntity.ok(liderService.obtenerInterrupcionesPorProyecto(Long.valueOf(idProyecto)));
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
    public ResponseEntity<Map<String, Object>> obtenerReportesConsolidados(@PathVariable String idProyecto) {
        if ("GLOBAL".equalsIgnoreCase(idProyecto) || "all".equalsIgnoreCase(idProyecto) || "null".equalsIgnoreCase(idProyecto)) {
            return ResponseEntity.ok(liderService.obtenerReportesConsolidadosGlobal());
        }
        return ResponseEntity.ok(liderService.obtenerReportesConsolidadosProyecto(Long.valueOf(idProyecto)));
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
