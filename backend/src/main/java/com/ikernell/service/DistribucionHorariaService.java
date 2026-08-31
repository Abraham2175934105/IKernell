package com.ikernell.service;

import com.ikernell.model.DistribucionHorariaLider;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.DistribucionHorariaLiderRepository;
import com.ikernell.repository.TrabajadorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DistribucionHorariaService {

    private final DistribucionHorariaLiderRepository distribucionRepository;
    private final TrabajadorRepository trabajadorRepository;

    public DistribucionHorariaService(DistribucionHorariaLiderRepository distribucionRepository, TrabajadorRepository trabajadorRepository) {
        this.distribucionRepository = distribucionRepository;
        this.trabajadorRepository = trabajadorRepository;
    }

    public DistribucionHorariaLider obtenerODistribuirHoras(Long idTrabajador, String semanaCodigo) {
        String codigoSemana = (semanaCodigo != null && !semanaCodigo.isBlank()) ? semanaCodigo.trim() : "2026-W36";

        Optional<DistribucionHorariaLider> existente = distribucionRepository.findByTrabajador_IdTrabajadorAndSemanaCodigo(idTrabajador, codigoSemana);
        if (existente.isPresent()) {
            return existente.get();
        }

        Optional<Trabajador> trabOpt = trabajadorRepository.findById(idTrabajador);
        if (trabOpt.isEmpty()) {
            throw new IllegalArgumentException("Trabajador no encontrado con ID: " + idTrabajador);
        }

        DistribucionHorariaLider nueva = new DistribucionHorariaLider(
                trabOpt.get(),
                codigoSemana,
                24,
                24,
                "AUTOMATICO_INTELIGENTE"
        );

        return distribucionRepository.save(nueva);
    }

    public DistribucionHorariaLider guardarDistribucion(Long idTrabajador, String semanaCodigo, Integer horasLider, Integer horasDev, String modo) {
        String codigoSemana = (semanaCodigo != null && !semanaCodigo.isBlank()) ? semanaCodigo.trim() : "2026-W36";
        int hLider = (horasLider != null && horasLider >= 0) ? horasLider : 24;
        int hDev = (horasDev != null && horasDev >= 0) ? horasDev : (48 - hLider);

        if (hLider + hDev != 48) {
            hDev = Math.max(0, 48 - hLider);
        }

        Optional<DistribucionHorariaLider> existente = distribucionRepository.findByTrabajador_IdTrabajadorAndSemanaCodigo(idTrabajador, codigoSemana);
        DistribucionHorariaLider registro;

        if (existente.isPresent()) {
            registro = existente.get();
            registro.setHorasLiderAsignadas(hLider);
            registro.setHorasDesarrolladorAsignadas(hDev);
            registro.setModoDistribucion((modo != null && !modo.isBlank()) ? modo : "MANUAL");
            registro.setFechaActualizacion(LocalDateTime.now());
        } else {
            Optional<Trabajador> trabOpt = trabajadorRepository.findById(idTrabajador);
            if (trabOpt.isEmpty()) {
                throw new IllegalArgumentException("Trabajador no encontrado con ID: " + idTrabajador);
            }
            registro = new DistribucionHorariaLider(
                    trabOpt.get(),
                    codigoSemana,
                    hLider,
                    hDev,
                    (modo != null && !modo.isBlank()) ? modo : "MANUAL"
            );
        }

        return distribucionRepository.save(registro);
    }
}
