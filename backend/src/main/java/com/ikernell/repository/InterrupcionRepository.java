package com.ikernell.repository;

import com.ikernell.model.Etapa;
import com.ikernell.model.Interrupcion;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterrupcionRepository extends JpaRepository<Interrupcion, Long> {
    
    List<Interrupcion> findByEtapa(Etapa etapa);
    
    List<Interrupcion> findByDesarrollador(Trabajador desarrollador);
}
