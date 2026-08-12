package com.ikernell.service;

import com.ikernell.dto.SugerenciaDocumentoDto;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.DocumentoBiblioteca;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.DocumentoBibliotecaRepository;
import com.ikernell.repository.TrabajadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de negocio para la Biblioteca Digital de Documentos Técnicos (RF-33).
 * Soporta búsqueda predictiva, filtros por categoría y previsualización de especificaciones.
 */
@Service
@Transactional
public class BibliotecaService {

    private final DocumentoBibliotecaRepository documentoBibliotecaRepository;
    private final TrabajadorRepository trabajadorRepository;

    public BibliotecaService(DocumentoBibliotecaRepository documentoBibliotecaRepository, 
                             TrabajadorRepository trabajadorRepository) {
        this.documentoBibliotecaRepository = documentoBibliotecaRepository;
        this.trabajadorRepository = trabajadorRepository;
    }

    /**
     * Listado y filtrado de documentos técnicos con soporte para búsqueda libre y categoría.
     */
    @Transactional(readOnly = true)
    public List<DocumentoBiblioteca> listarDocumentos(String query, String categoria) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        String cleanCategoria = (categoria != null && !categoria.isBlank()) ? categoria.trim() : null;
        return documentoBibliotecaRepository.filtrarDocumentos(cleanQuery, cleanCategoria);
    }

    /**
     * Búsqueda predictiva (Live Autocomplete / Suggestion Bar) (RF-33).
     * Devuelve coincidencias instantáneas mientras el usuario escribe en el input.
     */
    @Transactional(readOnly = true)
    public List<SugerenciaDocumentoDto> obtenerSugerenciasPredictivas(String term) {
        if (term == null || term.trim().isBlank()) {
            return documentoBibliotecaRepository.findAllByOrderByFechaSubidaDesc().stream()
                    .limit(5)
                    .map(d -> new SugerenciaDocumentoDto(d.getIdDocumento(), d.getTitulo(), d.getCategoria(), d.getFormato(), d.getVersion()))
                    .collect(Collectors.toList());
        }

        return documentoBibliotecaRepository.buscarDocumentos(term.trim()).stream()
                .limit(6)
                .map(d -> new SugerenciaDocumentoDto(d.getIdDocumento(), d.getTitulo(), d.getCategoria(), d.getFormato(), d.getVersion()))
                .collect(Collectors.toList());
    }

    /**
     * Obtener detalle completo de un documento por su identificador.
     */
    @Transactional(readOnly = true)
    public DocumentoBiblioteca obtenerPorId(Long id) {
        return documentoBibliotecaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado con ID: " + id));
    }

    /**
     * Registrar un nuevo documento técnico en el repositorio digital.
     */
    public DocumentoBiblioteca registrarDocumento(DocumentoBiblioteca documento, String emailUsuario) {
        if (emailUsuario != null && !emailUsuario.isBlank()) {
            Trabajador autor = trabajadorRepository.findByEmail(emailUsuario).orElse(null);
            documento.setSubidoPor(autor);
        }
        documento.setFechaSubida(LocalDateTime.now());
        if (documento.getVersion() == null || documento.getVersion().isBlank()) {
            documento.setVersion("v1.0");
        }
        if (documento.getFormato() == null || documento.getFormato().isBlank()) {
            documento.setFormato("PDF");
        }
        return documentoBibliotecaRepository.save(documento);
    }
}
