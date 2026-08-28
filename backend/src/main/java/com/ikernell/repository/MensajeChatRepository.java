package com.ikernell.repository;

import com.ikernell.model.MensajeChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MensajeChatRepository extends JpaRepository<MensajeChat, Long> {

    List<MensajeChat> findByCanalOrderByFechaEnvioAsc(String canal);

    List<MensajeChat> findAllByOrderByFechaEnvioAsc();

    @Modifying
    @Query("DELETE FROM MensajeChat m WHERE m.fechaEnvio < :fechaLimite")
    int eliminarMensajesAnterioresA(@Param("fechaLimite") LocalDateTime fechaLimite);
}
