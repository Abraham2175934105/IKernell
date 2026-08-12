package com.ikernell.repository;

import com.ikernell.model.Actividad;
import com.ikernell.model.Etapa;
import com.ikernell.model.Trabajador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActividadRepository extends JpaRepository<Actividad, Long> {
    
    List<Actividad> findByEtapa(Etapa etapa);
    
    List<Actividad> findByDesarrollador(Trabajador desarrollador);

    Page<Actividad> findByDesarrollador(Trabajador desarrollador, Pageable pageable);
    
    List<Actividad> findByEstado(String estado);

    Page<Actividad> findByEstado(String estado, Pageable pageable);
}

