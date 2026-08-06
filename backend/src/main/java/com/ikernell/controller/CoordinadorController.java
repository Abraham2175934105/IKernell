package com.ikernell.controller;

import com.ikernell.model.ProyectoDesarrollador;
import com.ikernell.model.Trabajador;
import com.ikernell.service.CoordinadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el rol COORDINADOR.
 * Gestiona el alta, consulta y modificación del personal, y las asignaciones directas.
 */
@RestController
@RequestMapping("/api/coordinador")
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
    @Operation(summary = "Listar todos los trabajadores", description = "Retorna el listado del personal de la empresa (RF-10)")
    public ResponseEntity<List<Trabajador>> listarTrabajadores() {
        return ResponseEntity.ok(coordinadorService.listarTodosTrabajadores());
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

    @PatchMapping("/trabajadores/{id}/inhabilitar")
    @Operation(summary = "Inhabilitar trabajador", description = "Realiza un borrado lógico cambiando el estado del trabajador (RF-11)")
    public ResponseEntity<Void> inhabilitarTrabajador(@PathVariable Long id) {
        coordinadorService.inhabilitarTrabajador(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/proyectos/{idProyecto}/asignar/{idDesarrollador}")
    @Operation(summary = "Asignación operativa", description = "Vincula a un desarrollador a la planilla general de un proyecto (RF-12)")
    public ResponseEntity<ProyectoDesarrollador> asignarProyectoInicial(
            @PathVariable Long idProyecto, 
            @PathVariable Long idDesarrollador) {
        ProyectoDesarrollador asignacion = coordinadorService.asignarProyectoADesarrollador(idProyecto, idDesarrollador);
        return ResponseEntity.status(HttpStatus.CREATED).body(asignacion);
    }
}
