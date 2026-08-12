package com.ikernell.controller;

import com.ikernell.dto.AuthResponse;
import com.ikernell.dto.LoginRequest;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.SolicitudContacto;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.SolicitudContactoRepository;
import com.ikernell.repository.TrabajadorRepository;
import com.ikernell.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

// Controlador de autenticación pública y recepción de solicitudes de contacto
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión e intercambio de credenciales por Token JWT")
public class AuthController {

    // Inyección de dependencias
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final TrabajadorRepository trabajadorRepository;
    private final SolicitudContactoRepository solicitudContactoRepository;

    public AuthController(AuthenticationManager authenticationManager, 
                          JwtUtils jwtUtils, 
                          TrabajadorRepository trabajadorRepository,
                          SolicitudContactoRepository solicitudContactoRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.trabajadorRepository = trabajadorRepository;
        this.solicitudContactoRepository = solicitudContactoRepository;
    }

    // Valida las credenciales del usuario y emite un token JWT si son correctas
    @PostMapping("/login")
    @Operation(summary = "Autenticar trabajador", description = "Valida credenciales y devuelve token JWT sin estado")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Autenticación contra Spring Security (las fallas son capturadas por el GlobalExceptionHandler)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(authentication);

        Trabajador trabajador = trabajadorRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador autenticado no encontrado en la base de datos"));

        AuthResponse authResponse = new AuthResponse(
                jwt,
                trabajador.getIdTrabajador(),
                trabajador.getNombre(),
                trabajador.getApellido(),
                trabajador.getEmail(),
                trabajador.getRol()
        );

        return ResponseEntity.ok(authResponse);
    }

    // Guarda mensajes del formulario de contacto público en la bandeja de entrada del Coordinador
    @PostMapping("/contacto")
    @Operation(summary = "Enviar solicitud pública de contacto", description = "Permite a los visitantes del portal enviar consultas que impactan la bandeja de entrada del Coordinador")
    public ResponseEntity<SolicitudContacto> enviarContactoPublico(@Valid @RequestBody SolicitudContacto solicitud) {
        // Persistencia
        solicitud.setFechaEnvio(java.time.LocalDateTime.now());
        solicitud.setAtendido(false);
        SolicitudContacto guardada = solicitudContactoRepository.save(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }
}
