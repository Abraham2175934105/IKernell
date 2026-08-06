package com.ikernell.repository;

import com.ikernell.model.Error;
import com.ikernell.model.Etapa;
import com.ikernell.model.Trabajador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para la entidad Error.
 * Incluye métodos paginados para consultas del Dashboard Predictivo (alta frecuencia de lectura).
 */
@Repository
public interface ErrorRepository extends JpaRepository<Error, Long> {

    List<Error> findByEtapa(Etapa etapa);

    List<Error> findByDesarrollador(Trabajador desarrollador);

    List<Error> findBySeveridad(String severidad);

    /** Paginación de errores por etapa para reportes del Semáforo Inteligente. */
    Page<Error> findByEtapa(Etapa etapa, Pageable pageable);

    /** Paginación de errores por severidad para filtrado del Dashboard. */
    Page<Error> findBySeveridad(String severidad, Pageable pageable);
}
