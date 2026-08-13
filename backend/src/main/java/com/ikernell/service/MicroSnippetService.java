package com.ikernell.service;

import com.ikernell.model.MicroSnippet;
import com.ikernell.repository.MicroSnippetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Servicio de negocio para el motor de inyección de snippets técnicos (RF-36).
 * Utiliza búsqueda difusa (fuzzy search) sobre trigramas de PostgreSQL (pg_trgm).
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
        List<Object[]> rows = microSnippetRepository.buscarSugerenciasNativas(queryLimpia, 0.12, limite > 0 ? limite : 3);
        List<MicroSnippet> lista = new ArrayList<>();

        for (Object[] row : rows) {
            MicroSnippet snippet = new MicroSnippet();
            snippet.setIdSnippet(((Number) row[0]).longValue());
            snippet.setTitulo((String) row[1]);
            snippet.setDescripcion((String) row[2]);
            snippet.setTagsBusqueda((String) row[3]);
            snippet.setCodigoSolucion((String) row[4]);
            snippet.setLenguaje((String) row[5]);
            snippet.setComandoConsola((Boolean) row[6]);
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
