package com.ikernell.repository;

import com.ikernell.model.Proyecto;
import com.ikernell.model.Trabajador;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    
    List<Proyecto> findByLider(Trabajador lider);
    
    Page<Proyecto> findByLider(Trabajador lider, Pageable pageable);
    
    List<Proyecto> findByEstado(String estado);

    Page<Proyecto> findByEstado(String estado, Pageable pageable);
}

