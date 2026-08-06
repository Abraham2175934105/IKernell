package com.ikernell.repository;

import com.ikernell.model.Rol;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    
    Optional<Trabajador> findByEmail(String email);
    
    Optional<Trabajador> findByIdentificacion(String identificacion);
    
    List<Trabajador> findByRol(Rol rol);
    
    List<Trabajador> findByEstadoTrue();
}
