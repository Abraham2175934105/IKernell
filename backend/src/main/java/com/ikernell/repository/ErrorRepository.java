package com.ikernell.repository;

import com.ikernell.model.Error;
import com.ikernell.model.Etapa;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ErrorRepository extends JpaRepository<Error, Long> {
    
    List<Error> findByEtapa(Etapa etapa);
    
    List<Error> findByDesarrollador(Trabajador desarrollador);
    
    List<Error> findBySeveridad(String severidad);
}
