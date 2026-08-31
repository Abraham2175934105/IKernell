package com.ikernell.repository;

import com.ikernell.model.DistribucionHorariaLider;
import com.ikernell.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DistribucionHorariaLiderRepository extends JpaRepository<DistribucionHorariaLider, Long> {
    Optional<DistribucionHorariaLider> findByTrabajadorAndSemanaCodigo(Trabajador trabajador, String semanaCodigo);
    Optional<DistribucionHorariaLider> findByTrabajador_IdTrabajadorAndSemanaCodigo(Long idTrabajador, String semanaCodigo);
}
