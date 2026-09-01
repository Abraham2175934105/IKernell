package com.ikernell.controller;

import com.ikernell.model.Proyecto;
import com.ikernell.model.ProyectoDesarrollador;
import com.ikernell.model.SolicitudContacto;
import com.ikernell.model.Trabajador;
import com.ikernell.service.CoordinadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el rol COORDINADOR.
 * Administración de talento humano, control de acceso lógico y bandeja de solicitudes web.
 */
@RestController
@RequestMapping("/api/coordinador")
@PreAuthorize("hasRole('COORDINADOR')")
@Tag(name = "Módulo Coordinador", description = "Operaciones de administración y gestión general de personal de IKernell")
@SecurityRequirement(name = "BearerAuth")
public class CoordinadorController {

    private final CoordinadorService coordinadorService;

    public CoordinadorController(CoordinadorService coordinadorService) {
        this.coordinadorService = coordinadorService;
    }

    @PostMapping("/trabajadores")
    @Operation(summary = "Registrar nuevo trabajador", description = "Crea un trabajador con contraseña cifrada en BCrypt (RF-08, RF-09)")
    public ResponseEntity<Trabajador> registrarTrabajador(@Valid @RequestBody Trabajador trabajador) {
        Trabajador nuevo = coordinadorService.registrarTrabajador(trabajador);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @GetMapping("/trabajadores")
    @Operation(summary = "Listar todos los trabajadores", description = "Retorna el listado completo del personal (RF-10)")
    public ResponseEntity<List<Trabajador>> listarTrabajadores() {
        return ResponseEntity.ok(coordinadorService.listarTodosTrabajadores());
    }

    @GetMapping("/proyectos")
    @Operation(summary = "Listar todos los proyectos de la empresa", description = "Devuelve el listado completo de proyectos para la gestión corporativa del coordinador")
    public ResponseEntity<List<Proyecto>> listarProyectos() {
        return ResponseEntity.ok(coordinadorService.listarTodosProyectos());
    }

    @GetMapping("/trabajadores/paginado")
    @Operation(summary = "Listar trabajadores con paginación", description = "Retorna el listado paginado del personal para alta concurrencia (RF-10). Params: ?page=0&size=20&sort=nombre,asc")
    public ResponseEntity<Page<Trabajador>> listarTrabajadoresPaginado(
            @Parameter(description = "Parámetros de paginación y ordenamiento")
            @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(coordinadorService.listarTrabajadoresPaginado(pageable));
    }

    @GetMapping("/trabajadores/{id}")
    @Operation(summary = "Obtener detalle de un trabajador", description = "Busca por ID y retorna los datos del trabajador")
    public ResponseEntity<Trabajador> obtenerTrabajador(@PathVariable Long id) {
        return ResponseEntity.ok(coordinadorService.obtenerPorId(id));
    }

    @PutMapping("/trabajadores/{id}")
    @Operation(summary = "Actualizar perfil de trabajador", description = "Modifica los datos del trabajador existente (RF-10)")
    public ResponseEntity<Trabajador> actualizarTrabajador(@PathVariable Long id, @Valid @RequestBody Trabajador datos) {
        Trabajador actualizado = coordinadorService.actualizarTrabajador(id, datos);
        return ResponseEntity.ok(actualizado);
    }

    @PatchMapping("/trabajadores/{id}/estado")
    @Operation(summary = "Alternar estado del trabajador", description = "Habilita o inhabilita lógicamente la cuenta del trabajador (RF-11)")
    public ResponseEntity<Trabajador> cambiarEstadoTrabajador(@PathVariable Long id) {
        Trabajador actualizado = coordinadorService.cambiarEstadoTrabajador(id);
        return ResponseEntity.ok(actualizado);
    }

    @PatchMapping("/trabajadores/{id}/inhabilitar")
    @Operation(summary = "Inhabilitar trabajador", description = "Realiza un borrado lógico cambiando el estado del trabajador (RF-11)")
    public ResponseEntity<Void> inhabilitarTrabajador(@PathVariable Long id) {
        coordinadorService.inhabilitarTrabajador(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/trabajadores/{idLider}/inhabilitar-reasignar")
    @Operation(summary = "Inhabilitar Líder y reasignar sus proyectos", description = "Inhabilita la cuenta de un Líder y transfiere todo su portafolio de proyectos a un nuevo Líder asignado")
    public ResponseEntity<Trabajador> inhabilitarLiderYReasignarProyectos(
            @PathVariable Long idLider,
            @RequestParam Long idNuevoLiderTarget) {
        Trabajador inhabilitado = coordinadorService.inhabilitarLiderYReasignarProyectos(idLider, idNuevoLiderTarget);
        return ResponseEntity.ok(inhabilitado);
    }

    @PutMapping("/proyectos/{idProyecto}/reasignar-lider")
    @Operation(summary = "Reasignar Líder a un proyecto", description = "Transfiere la dirección de un proyecto específico a un nuevo Líder asignado")
    public ResponseEntity<Proyecto> reasignarLiderAProyecto(
            @PathVariable Long idProyecto,
            @RequestParam Long idNuevoLiderTarget,
            @RequestParam(required = false) String motivo) {
        Proyecto actualizado = coordinadorService.reasignarLiderAProyecto(idProyecto, idNuevoLiderTarget, motivo);
        return ResponseEntity.ok(actualizado);
    }

    @PutMapping("/proyectos/{idProyecto}/confirmar-lectura-reasignacion")
    @Operation(summary = "Confirmar lectura de reasignación", description = "Marca como leída la notificación de transferencia por parte del Líder anterior")
    public ResponseEntity<Proyecto> confirmarLecturaReasignacion(@PathVariable Long idProyecto) {
        Proyecto actualizado = coordinadorService.confirmarLecturaReasignacion(idProyecto);
        return ResponseEntity.ok(actualizado);
    }

    @PostMapping("/proyectos/{idProyecto}/historial-cambios")
    @Operation(summary = "Registrar acción de auditoría directiva", description = "Guarda un registro acumulado de modificaciones realizadas por la Coordinación General")
    public ResponseEntity<com.ikernell.model.HistorialCambiosCoordinador> registrarCambioCoordinador(
            @PathVariable Long idProyecto,
            @RequestParam Long idCoordinador,
            @RequestParam String nombreCoordinador,
            @RequestParam String emailCoordinador,
            @RequestParam String accion,
            @RequestParam String detalles,
            @RequestParam(required = false) String batchId) {
        com.ikernell.model.HistorialCambiosCoordinador registro = coordinadorService.registrarCambioCoordinador(
                idProyecto, idCoordinador, nombreCoordinador, emailCoordinador, accion, detalles, batchId
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(registro);
    }

    @GetMapping("/proyectos/{idProyecto}/historial-cambios")
    @Operation(summary = "Obtener historial de cambios del Coordinador", description = "Devuelve el registro acumulado de modificaciones realizadas por Coordinadores en el proyecto")
    public ResponseEntity<List<com.ikernell.model.HistorialCambiosCoordinador>> obtenerHistorialCambiosCoordinador(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(coordinadorService.obtenerHistorialCambiosProyecto(idProyecto));
    }

    @PostMapping("/proyectos/{idProyecto}/asignar/{idDesarrollador}")
    @Operation(summary = "Asignación operativa", description = "Vincula a un desarrollador a la planilla general de un proyecto (RF-12)")
    public ResponseEntity<ProyectoDesarrollador> asignarProyectoInicial(
            @PathVariable Long idProyecto,
            @PathVariable Long idDesarrollador) {
        ProyectoDesarrollador asignacion = coordinadorService.asignarProyectoADesarrollador(idProyecto, idDesarrollador);
        return ResponseEntity.status(HttpStatus.CREATED).body(asignacion);
    }

    @DeleteMapping("/etapas/{idEtapa}")
    @Operation(summary = "Eliminar Etapa WBS (Coordinador)", description = "Elimina una etapa sin actividades asociadas del desglose WBS de un proyecto")
    public ResponseEntity<Void> eliminarEtapa(@PathVariable Long idEtapa) {
        coordinadorService.eliminarEtapa(idEtapa);
        return ResponseEntity.noContent().build();
    }

    // Gestión de solicitudes de contacto recibidas desde la landing pública
    @GetMapping("/solicitudes")
    @Operation(summary = "Listar solicitudes de contacto web", description = "Devuelve todas las consultas enviadas por el formulario público de la web")
    public ResponseEntity<List<SolicitudContacto>> listarSolicitudes() {
        return ResponseEntity.ok(coordinadorService.listarSolicitudes());
    }

    @PatchMapping("/solicitudes/{id}/atender")
    @Operation(summary = "Alternar o gestionar estado de atención de solicitud", description = "Marca una solicitud de contacto como ATENDIDA o PENDIENTE con notas opcionales")
    public ResponseEntity<SolicitudContacto> toggleEstadoSolicitud(
            @PathVariable Long id,
            @RequestBody(required = false) com.ikernell.dto.GestionarSolicitudRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        if (request != null && request.getEstado() != null) {
            return ResponseEntity.ok(coordinadorService.gestionarSolicitud(id, request, email));
        }
        SolicitudContacto actualizada = coordinadorService.toggleEstadoSolicitud(id, email);
        return ResponseEntity.ok(actualizada);
    }

    @PatchMapping("/solicitudes/{id}/gestionar")
    @Operation(summary = "Gestionar Caso de Solicitud Web", description = "Registra notas de atención, cambio de estado formal o motivo de reapertura con auditoría histórica")
    public ResponseEntity<SolicitudContacto> gestionarSolicitud(
            @PathVariable Long id,
            @RequestBody com.ikernell.dto.GestionarSolicitudRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        SolicitudContacto actualizada = coordinadorService.gestionarSolicitud(id, request, email);
        return ResponseEntity.ok(actualizada);
    }
}
