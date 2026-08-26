package com.ikernell.repository;

import com.ikernell.model.HistorialCambiosCoordinador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialCambiosCoordinadorRepository extends JpaRepository<HistorialCambiosCoordinador, Long> {
    List<HistorialCambiosCoordinador> findByProyectoIdProyectoOrderByFechaCambioDesc(Long idProyecto);
}
