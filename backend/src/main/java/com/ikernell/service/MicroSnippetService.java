package com.ikernell.service;

import com.ikernell.model.MicroSnippet;
import com.ikernell.repository.MicroSnippetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Servicio de arquitectura de negocio para el motor Snippet.inject.
 * Implementa la consulta difusa (Fuzzy Match) aprovechando la extensión pg_trgm en PostgreSQL
 * y la función de similitud trigonométrica para inyección interactiva de soluciones de código.
 */
@Service
@Transactional
public class MicroSnippetService {

    private final MicroSnippetRepository microSnippetRepository;

    public MicroSnippetService(MicroSnippetRepository microSnippetRepository) {
        this.microSnippetRepository = microSnippetRepository;
    }

    /**
     * Búsqueda difusa de snippets por término de error o consulta con tolerancia a typos.
     */
    @Transactional(readOnly = true)
    public List<MicroSnippet> buscarSugerencias(String termino, int limite) {
        if (termino == null || termino.trim().length() < 3) {
            return List.of();
        }

        String queryLimpia = termino.trim();
        List<Object[]> rows = microSnippetRepository.buscarSugerenciasNativas(queryLimpia, 0.30, limite > 0 ? limite : 3);
        List<MicroSnippet> lista = new ArrayList<>();

        for (Object[] row : rows) {
            if (row == null || row.length < 7) continue;
            MicroSnippet snippet = new MicroSnippet();
            if (row[0] != null) snippet.setIdSnippet(((Number) row[0]).longValue());
            if (row.length > 1 && row[1] != null) snippet.setTitulo((String) row[1]);
            if (row.length > 2 && row[2] != null) snippet.setDescripcion((String) row[2]);
            if (row.length > 3 && row[3] != null) snippet.setTagsBusqueda((String) row[3]);
            if (row.length > 4 && row[4] != null) snippet.setCodigoSolucion((String) row[4]);
            if (row.length > 5 && row[5] != null) snippet.setLenguaje((String) row[5]);
            if (row.length > 6 && row[6] != null) snippet.setComandoConsola((Boolean) row[6]);
            if (row.length > 7 && row[7] != null) {
                snippet.setScore(((Number) row[7]).doubleValue());
            }
            lista.add(snippet);
        }

        return lista;
    }

    @Transactional(readOnly = true)
    public List<MicroSnippet> listarTodos() {
        return microSnippetRepository.findAll();
    }

    public MicroSnippet guardarSnippet(MicroSnippet snippet) {
        return microSnippetRepository.save(snippet);
    }
}
