package com.ikernell.controller;

import com.ikernell.dto.AuthResponse;
import com.ikernell.dto.LoginRequest;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.SolicitudContacto;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.SolicitudContactoRepository;
import com.ikernell.repository.TrabajadorRepository;
import com.ikernell.security.JwtUtils;
import com.ikernell.security.TokenBlacklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, 
                          JwtUtils jwtUtils, 
                          TrabajadorRepository trabajadorRepository,
                          SolicitudContactoRepository solicitudContactoRepository,
                          TokenBlacklistService tokenBlacklistService,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.trabajadorRepository = trabajadorRepository;
        this.solicitudContactoRepository = solicitudContactoRepository;
        this.tokenBlacklistService = tokenBlacklistService;
        this.passwordEncoder = passwordEncoder;
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
                trabajador.getEmailPersonal(),
                trabajador.getIdentificacion(),
                trabajador.getProfesion(),
                trabajador.getEspecialidad(),
                trabajador.getRol(),
                trabajador.getPrimerLogin()
        );

        return ResponseEntity.ok(authResponse);
    }

    // Completa la verificación obligatoria de datos y el cambio de clave en el primer inicio de sesión
    @PostMapping("/completar-primer-login")
    @Operation(summary = "Verificar datos y cambiar clave obligatoria en primer acceso", description = "Permite actualizar perfil (salvo correo corporativo), establece contraseña definitiva y desactiva primerLogin")
    public ResponseEntity<AuthResponse> completarPrimerLogin(@Valid @RequestBody com.ikernell.dto.PrimerLoginRequest request) {
        Trabajador trabajador = trabajadorRepository.findById(request.getIdTrabajador())
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador no encontrado con ID: " + request.getIdTrabajador()));

        // Actualizar datos permitidos (el correo corporativo es INMUTABLE)
        trabajador.setNombre(request.getNombre().trim());
        trabajador.setApellido(request.getApellido().trim());
        trabajador.setIdentificacion(request.getIdentificacion().trim());
        if (request.getEmailPersonal() != null) {
            trabajador.setEmailPersonal(request.getEmailPersonal().trim());
        }
        if (request.getProfesion() != null) {
            trabajador.setProfesion(request.getProfesion().trim());
        }
        if (request.getEspecialidad() != null) {
            trabajador.setEspecialidad(request.getEspecialidad().trim());
        }

        // Establecer contraseña definitiva
        trabajador.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword().trim()));
        trabajador.setPrimerLogin(false);

        Trabajador guardado = trabajadorRepository.save(trabajador);

        // Re-autenticar o generar nuevo token
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                guardado.getEmail(),
                null,
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + guardado.getRol().name()))
        );
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        String jwt = jwtUtils.generateToken(authenticationToken);

        AuthResponse authResponse = new AuthResponse(
                jwt,
                guardado.getIdTrabajador(),
                guardado.getNombre(),
                guardado.getApellido(),
                guardado.getEmail(),
                guardado.getEmailPersonal(),
                guardado.getIdentificacion(),
                guardado.getProfesion(),
                guardado.getEspecialidad(),
                guardado.getRol(),
                false
        );

        return ResponseEntity.ok(authResponse);
    }

    // Revoca el token JWT activo agregándolo a la lista negra en memoria
    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión e invalidar token JWT", description = "Agrega el token Bearer activo a la lista negra del servidor (AUD-02)")
    public ResponseEntity<java.util.Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String headerAuth) {
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            tokenBlacklistService.blacklistToken(token);
        }
        SecurityContextHolder.clearContext();
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Sesión cerrada e invalidada exitosamente en el servidor.");
        return ResponseEntity.ok(response);
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
