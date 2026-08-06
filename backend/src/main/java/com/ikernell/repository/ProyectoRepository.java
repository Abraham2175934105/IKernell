package com.ikernell.repository;

import com.ikernell.model.Proyecto;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    
    List<Proyecto> findByLider(Trabajador lider);
    
    List<Proyecto> findByEstado(String estado);
}
