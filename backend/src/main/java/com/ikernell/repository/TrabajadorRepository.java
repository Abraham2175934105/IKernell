package com.ikernell.repository;

import com.ikernell.model.Rol;
import com.ikernell.model.Trabajador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad Trabajador.
 * Incluye métodos paginados para consultas de alto volumen (Alta Concurrencia).
 */
@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {

    Optional<Trabajador> findByEmail(String email);
    Optional<Trabajador> findByEmailIgnoreCase(String email);

    Optional<Trabajador> findByEmailPersonal(String emailPersonal);
    Optional<Trabajador> findByEmailPersonalIgnoreCase(String emailPersonal);

    Optional<Trabajador> findByIdentificacion(String identificacion);
    Optional<Trabajador> findByIdentificacionIgnoreCase(String identificacion);

    List<Trabajador> findByRol(Rol rol);

    List<Trabajador> findByRolAndEstado(Rol rol, Boolean estado);

    List<Trabajador> findByEstadoTrue();

    /**
     * Listado paginado de trabajadores para el módulo Coordinador (alto volumen de
     * personal).
     */
    Page<Trabajador> findByEstado(Boolean estado, Pageable pageable);

    /** Listado general paginado. */
    Page<Trabajador> findAll(Pageable pageable);
}
