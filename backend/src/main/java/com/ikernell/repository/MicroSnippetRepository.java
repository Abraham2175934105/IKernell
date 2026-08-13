package com.ikernell.repository;

import com.ikernell.model.MicroSnippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MicroSnippetRepository extends JpaRepository<MicroSnippet, Long> {

    @Query(value = "SELECT id_snippet, titulo, descripcion, tags_busqueda, codigo_solucion, lenguaje, comando_consola, " +
                   "similarity(tags_busqueda, :termino) as score " +
                   "FROM micro_snippet " +
                   "WHERE similarity(tags_busqueda, :termino) > :umbral " +
                   "ORDER BY score DESC " +
                   "LIMIT :limite", nativeQuery = true)
    List<Object[]> buscarSugerenciasNativas(@Param("termino") String termino, 
                                           @Param("umbral") double umbral, 
                                           @Param("limite") int limite);

    List<MicroSnippet> findByLenguajeIgnoreCase(String lenguaje);
}
