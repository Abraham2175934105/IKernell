package com.ikernell.controller;

import com.ikernell.dto.MensajeChatRequest;
import com.ikernell.model.MensajeChat;
import com.ikernell.model.Trabajador;
import com.ikernell.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el Chat Corporativo Transversal (RF-31).
 * Canales de comunicación segura entre Coordinadores, Líderes y Desarrolladores.
 */
@RestController
@RequestMapping("/api/chat")
@Tag(name = "Módulo Chat Corporativo", description = "Endpoints para mensajería interna, canales de discusión y presencia en tiempo real (RF-31)")
@SecurityRequirement(name = "BearerAuth")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/mensajes")
    @Operation(summary = "Obtener mensajes del canal", description = "Devuelve el historial cronológico de mensajes filtrados por canal (general, arquitectura, soporte-brasil, alertas-semaforo)")
    public ResponseEntity<List<MensajeChat>> obtenerMensajes(@RequestParam(defaultValue = "general") String canal) {
        return ResponseEntity.ok(chatService.obtenerMensajesPorCanal(canal));
    }

    @PostMapping("/mensajes")
    @Operation(summary = "Enviar mensaje de chat", description = "Persiste un nuevo mensaje en PostgreSQL asociándolo al trabajador autenticado")
    public ResponseEntity<MensajeChat> enviarMensaje(
            @Valid @RequestBody MensajeChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        MensajeChat mensaje = chatService.enviarMensaje(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mensaje);
    }

    @GetMapping("/usuarios")
    @Operation(summary = "Listar miembros del equipo disponibles", description = "Devuelve la lista real de trabajadores habilitados para interacción en el chat")
    public ResponseEntity<List<Trabajador>> obtenerUsuariosDisponibles() {
        return ResponseEntity.ok(chatService.obtenerUsuariosDisponibles());
    }
}
