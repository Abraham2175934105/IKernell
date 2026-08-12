package com.ikernell.service;

import com.ikernell.dto.MensajeChatRequest;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.MensajeChat;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.MensajeChatRepository;
import com.ikernell.repository.TrabajadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio de negocio para el Chat Corporativo Transversal (RF-31).
 * Almacena y recupera mensajes en tiempo real desde la base de datos PostgreSQL.
 */
@Service
@Transactional
public class ChatService {

    private final MensajeChatRepository mensajeChatRepository;
    private final TrabajadorRepository trabajadorRepository;

    public ChatService(MensajeChatRepository mensajeChatRepository, TrabajadorRepository trabajadorRepository) {
        this.mensajeChatRepository = mensajeChatRepository;
        this.trabajadorRepository = trabajadorRepository;
    }

    /**
     * Enviar y persistir un mensaje en un canal de discusión específico.
     */
    public MensajeChat enviarMensaje(String emailRemitente, MensajeChatRequest request) {
        Trabajador remitente = trabajadorRepository.findByEmail(emailRemitente)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador remitente no encontrado con email: " + emailRemitente));

        Trabajador destinatario = null;
        if (request.getDestinatarioId() != null) {
            destinatario = trabajadorRepository.findById(request.getDestinatarioId()).orElse(null);
        }

        String canal = (request.getCanal() != null && !request.getCanal().isBlank()) 
                ? request.getCanal().toLowerCase().trim() 
                : "general";

        MensajeChat mensaje = new MensajeChat();
        mensaje.setRemitente(remitente);
        mensaje.setDestinatario(destinatario);
        mensaje.setCanal(canal);
        mensaje.setContenido(request.getContenido());
        mensaje.setFechaEnvio(LocalDateTime.now());

        return mensajeChatRepository.save(mensaje);
    }

    /**
     * Listar mensajes por canal de discusión (orden cronológico ascendente).
     */
    @Transactional(readOnly = true)
    public List<MensajeChat> obtenerMensajesPorCanal(String canal) {
        String canalNormalizado = (canal != null && !canal.isBlank()) ? canal.toLowerCase().trim() : "general";
        return mensajeChatRepository.findByCanalOrderByFechaEnvioAsc(canalNormalizado);
    }

    /**
     * Listar todos los mensajes de chat registrados.
     */
    @Transactional(readOnly = true)
    public List<MensajeChat> obtenerTodosLosMensajes() {
        return mensajeChatRepository.findAllByOrderByFechaEnvioAsc();
    }

    /**
     * Obtener listado de miembros del equipo activos y habilitados en el sistema.
     */
    @Transactional(readOnly = true)
    public List<Trabajador> obtenerUsuariosDisponibles() {
        return trabajadorRepository.findByEstadoTrue();
    }
}
