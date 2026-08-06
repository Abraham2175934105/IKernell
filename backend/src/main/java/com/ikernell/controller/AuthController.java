package com.ikernell.controller;

import com.ikernell.dto.AuthResponse;
import com.ikernell.dto.LoginRequest;
import com.ikernell.exception.ResourceNotFoundException;
import com.ikernell.model.Trabajador;
import com.ikernell.repository.TrabajadorRepository;
import com.ikernell.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para la autenticación y emisión de tokens JWT.
 * <p>
 * Auditoría de Calidad:
 * - Se elimina captura genérica de excepciones confiando en @RestControllerAdvice global.
 * - Inyección de dependencias por constructor.
 * - Validación formal del payload @Valid en LoginRequest.
 * </p>
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión e intercambio de credenciales por Token JWT")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final TrabajadorRepository trabajadorRepository;

    public AuthController(AuthenticationManager authenticationManager, 
                          JwtUtils jwtUtils, 
                          TrabajadorRepository trabajadorRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.trabajadorRepository = trabajadorRepository;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar trabajador", description = "Valida credenciales y devuelve token JWT sin estado")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Autenticación exitosa, token generado"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada con formato inválido (Validación fallida)"),
        @ApiResponse(responseCode = "401", description = "Credenciales incorrectas")
    })
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // La excepción BadCredentialsException será capturada e interceptada por GlobalExceptionHandler
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(authentication);

        Trabajador trabajador = trabajadorRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador autenticado no hallado en la base de datos"));

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
}
