package com.ikernell.controller;

import com.ikernell.model.MicroSnippet;
import com.ikernell.service.MicroSnippetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el motor de inyección de snippets y micro-soluciones (RF-36).
 * Soporta búsqueda difusa (fuzzy search) sobre trigramas de PostgreSQL para recomendaciones en caliente.
 */
@RestController
@RequestMapping("/api/snippets")
@Tag(name = "Módulo Snippets Técnicos", description = "Endpoints para búsqueda difusa (Fuzzy Search pg_trgm) e inyección interactiva de soluciones de código (RF-36)")
@SecurityRequirement(name = "BearerAuth")
public class MicroSnippetController {

    private final MicroSnippetService microSnippetService;

    public MicroSnippetController(MicroSnippetService microSnippetService) {
        this.microSnippetService = microSnippetService;
    }

    @GetMapping("/sugerencias")
    @Operation(summary = "Búsqueda difusa de snippets (Fuzzy Search)", description = "Retorna fragmentos de código y comandos sugeridos con tolerancia a errores ortográficos (RF-36)")
    public ResponseEntity<List<MicroSnippet>> buscarSugerencias(
            @RequestParam("termino") String termino,
            @RequestParam(name = "limite", required = false, defaultValue = "3") int limite) {
        return ResponseEntity.ok(microSnippetService.buscarSugerencias(termino, limite));
    }

    @GetMapping
    @Operation(summary = "Listar catálogo de snippets", description = "Retorna todos los micro-snippets registrados en la base de datos")
    public ResponseEntity<List<MicroSnippet>> listarTodos() {
        return ResponseEntity.ok(microSnippetService.listarTodos());
    }
}
