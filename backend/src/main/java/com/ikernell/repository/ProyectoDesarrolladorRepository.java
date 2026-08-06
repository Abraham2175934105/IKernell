package com.ikernell.repository;

import com.ikernell.model.Proyecto;
import com.ikernell.model.ProyectoDesarrollador;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProyectoDesarrolladorRepository extends JpaRepository<ProyectoDesarrollador, Long> {
    
    List<ProyectoDesarrollador> findByProyecto(Proyecto proyecto);
    
    List<ProyectoDesarrollador> findByDesarrollador(Trabajador desarrollador);
    
    Optional<ProyectoDesarrollador> findByProyectoAndDesarrollador(Proyecto proyecto, Trabajador desarrollador);
}
