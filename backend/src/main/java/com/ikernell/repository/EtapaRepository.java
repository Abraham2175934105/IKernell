package com.ikernell.repository;

import com.ikernell.model.Etapa;
import com.ikernell.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EtapaRepository extends JpaRepository<Etapa, Long> {
    
    List<Etapa> findByProyecto(Proyecto proyecto);
    
    List<Etapa> findByProyectoAndEstado(Proyecto proyecto, String estado);
}
