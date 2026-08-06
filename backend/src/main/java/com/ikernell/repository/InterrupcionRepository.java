package com.ikernell.repository;

import com.ikernell.model.Etapa;
import com.ikernell.model.Interrupcion;
import com.ikernell.model.Trabajador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para la entidad Interrupcion.
 * Incluye métodos paginados para consultas del Dashboard Predictivo (alta frecuencia de lectura).
 */
@Repository
public interface InterrupcionRepository extends JpaRepository<Interrupcion, Long> {

    List<Interrupcion> findByEtapa(Etapa etapa);

    List<Interrupcion> findByDesarrollador(Trabajador desarrollador);

    /** Paginación de interrupciones por etapa para el Semáforo Inteligente. */
    Page<Interrupcion> findByEtapa(Etapa etapa, Pageable pageable);
}
