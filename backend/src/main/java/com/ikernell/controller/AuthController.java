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

        Trabajador trabajador = trabajadorRepository.findByEmailIgnoreCase(loginRequest.getEmail())
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
        Trabajador trabajador = null;
        if (request.getIdTrabajador() != null) {
            trabajador = trabajadorRepository.findById(request.getIdTrabajador()).orElse(null);
        }
        if (trabajador == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentEmail = auth != null ? auth.getName() : null;
            if (currentEmail != null && !currentEmail.isBlank()) {
                trabajador = trabajadorRepository.findByEmailIgnoreCase(currentEmail).orElse(null);
            }
        }
        if (trabajador == null) {
            throw new ResourceNotFoundException("Trabajador no encontrado con ID: " + request.getIdTrabajador());
        }

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

        // Re-autenticar con UserDetails real para que generateToken pueda hacer el cast correctamente
        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.builder()
                        .username(guardado.getEmail())
                        .password(guardado.getPasswordHash())
                        .authorities("ROLE_" + guardado.getRol().name())
                        .build();

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
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

    // Valida disponibilidad en tiempo real de Cédula y Correo Personal
    @GetMapping("/validar-unicidad")
    @Operation(summary = "Validar disponibilidad de cédula y correo personal", description = "Verifica en tiempo real que cédula y correo personal no pertenezcan a otro usuario")
    public ResponseEntity<java.util.Map<String, Boolean>> validarUnicidad(
            @RequestParam(required = false) String cedula,
            @RequestParam(required = false) String emailPersonal,
            @RequestParam(required = false) Long idExcluir) {
        
        boolean cedulaDuplicada = false;
        if (cedula != null && !cedula.isBlank()) {
            String targetCedula = cedula.trim();
            cedulaDuplicada = trabajadorRepository.findAll().stream()
                    .anyMatch(t -> (idExcluir == null || !t.getIdTrabajador().equals(idExcluir)) 
                            && t.getIdentificacion() != null 
                            && targetCedula.equalsIgnoreCase(t.getIdentificacion().trim()));
        }

        boolean emailPersonalDuplicado = false;
        if (emailPersonal != null && !emailPersonal.isBlank()) {
            String targetEmail = emailPersonal.trim();
            emailPersonalDuplicado = trabajadorRepository.findAll().stream()
                    .anyMatch(t -> (idExcluir == null || !t.getIdTrabajador().equals(idExcluir)) 
                            && ((t.getEmailPersonal() != null && targetEmail.equalsIgnoreCase(t.getEmailPersonal().trim()))
                             || (t.getEmail() != null && targetEmail.equalsIgnoreCase(t.getEmail().trim()))));
        }

        java.util.Map<String, Boolean> res = new java.util.HashMap<>();
        res.put("cedulaDuplicada", cedulaDuplicada);
        res.put("emailPersonalDuplicado", emailPersonalDuplicado);
        return ResponseEntity.ok(res);
    }

    // Consulta el perfil completo y actualizado del usuario autenticado
    @GetMapping("/perfil")
    @Operation(summary = "Obtener perfil del usuario autenticado", description = "Devuelve los datos completos del trabajador autenticado a partir de su token JWT")
    public ResponseEntity<Trabajador> getPerfilUsuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = auth.getName();
        Trabajador trabajador = trabajadorRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador autenticado no encontrado: " + email));

        return ResponseEntity.ok(trabajador);
    }

    // Permite al usuario autenticado cambiar su contraseña validando la contraseña actual
    @PostMapping("/cambiar-password")
    @Operation(summary = "Cambiar contraseña de usuario autenticado", description = "Valida contraseña actual y actualiza por nueva contraseña con validaciones de seguridad")
    public ResponseEntity<java.util.Map<String, String>> cambiarPassword(
            @Valid @RequestBody com.ikernell.dto.CambiarPasswordRequest request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Sesión no válida o expirada."));
        }

        String email = auth.getName();
        Trabajador trabajador = trabajadorRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Trabajador autenticado no encontrado: " + email));

        // 1. Validar que la contraseña actual coincida
        if (!passwordEncoder.matches(request.getCurrentPassword().trim(), trabajador.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "La contraseña actual ingresada es incorrecta."));
        }

        // 2. Validar que la nueva contraseña coincida con la confirmación
        if (!request.getNewPassword().trim().equals(request.getConfirmPassword().trim())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "La nueva contraseña y su confirmación no coinciden."));
        }

        // 3. Validar complejidad de la nueva contraseña
        String newPass = request.getNewPassword().trim();
        if (newPass.length() < 8 || newPass.length() > 20 ||
                !newPass.matches(".*[A-Z].*") ||
                !newPass.matches(".*[a-z].*") ||
                !newPass.matches(".*[0-9].*")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "La nueva contraseña debe tener entre 8 y 20 caracteres, e incluir al menos una mayúscula, una minúscula y un número."));
        }

        // 4. Validar que la nueva contraseña sea distinta a la actual
        if (passwordEncoder.matches(newPass, trabajador.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "La nueva contraseña no puede ser igual a la contraseña actual."));
        }

        // 5. Encriptar y persistir la nueva contraseña
        trabajador.setPasswordHash(passwordEncoder.encode(newPass));
        trabajadorRepository.save(trabajador);

        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Contraseña actualizada exitosamente.");
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
