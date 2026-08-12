package com.ikernell.repository;

import com.ikernell.model.SolicitudContacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudContactoRepository extends JpaRepository<SolicitudContacto, Long> {

    List<SolicitudContacto> findAllByOrderByFechaEnvioDesc();

    List<SolicitudContacto> findByAtendidoOrderByFechaEnvioDesc(Boolean atendido);
}
