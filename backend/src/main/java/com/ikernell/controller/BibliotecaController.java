package com.ikernell.controller;

import com.ikernell.dto.SugerenciaDocumentoDto;
import com.ikernell.model.DocumentoBiblioteca;
import com.ikernell.service.BibliotecaService;
import io.swagger.v3.oas.annotations.Operation;
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
 * Controlador REST para la Biblioteca Digital de Documentos Técnicos (RF-33).
 * Soporta búsqueda predictiva en vivo, consulta de especificaciones técnicas y categorización.
 */
@RestController
@RequestMapping("/api/biblioteca")
@Tag(name = "Módulo Biblioteca Digital", description = "Endpoints para consulta, búsqueda predictiva y descarga de manuales y especificaciones técnicas (RF-33)")
@SecurityRequirement(name = "BearerAuth")
public class BibliotecaController {

    private final BibliotecaService bibliotecaService;

    public BibliotecaController(BibliotecaService bibliotecaService) {
        this.bibliotecaService = bibliotecaService;
    }

    @GetMapping("/documentos")
    @Operation(summary = "Listar y filtrar documentos", description = "Retorna documentos técnicos con filtro opcional por término de búsqueda y categoría")
    public ResponseEntity<List<DocumentoBiblioteca>> listarDocumentos(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "TODOS") String categoria) {
        return ResponseEntity.ok(bibliotecaService.listarDocumentos(q, categoria));
    }

    @GetMapping("/sugerencias")
    @Operation(summary = "Búsqueda predictiva (Live Autocomplete)", description = "Devuelve una lista rápida de sugerencias coincidentes a medida que el usuario escribe (RF-33)")
    public ResponseEntity<List<SugerenciaDocumentoDto>> obtenerSugerencias(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(bibliotecaService.obtenerSugerenciasPredictivas(q));
    }

    @GetMapping("/documentos/{id}")
    @Operation(summary = "Obtener detalle y contenido de documento", description = "Devuelve el registro técnico completo para previsualización o lectura")
    public ResponseEntity<DocumentoBiblioteca> obtenerDocumentoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(bibliotecaService.obtenerPorId(id));
    }

    @PostMapping("/documentos")
    @Operation(summary = "Registrar nuevo documento", description = "Agrega un documento técnico al repositorio de IKernell")
    public ResponseEntity<DocumentoBiblioteca> registrarDocumento(
            @Valid @RequestBody DocumentoBiblioteca documento,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        DocumentoBiblioteca guardado = bibliotecaService.registrarDocumento(documento, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }
}
