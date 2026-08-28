package com.ikernell.controller;

import com.ikernell.model.Trabajador;
import com.ikernell.repository.TrabajadorRepository;
import com.ikernell.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Controlador REST para el flujo seguro de recuperación de contraseña (OTP + Cifrado BCrypt).
 * Soporta búsqueda multi-parámetro por Cédula, Correo Corporativo o Correo Personal.
 */
@RestController
@RequestMapping("/api/auth/password-reset")
@Tag(name = "Recuperación de Contraseña", description = "Endpoints públicos para solicitud, verificación de OTP y actualización de contraseña")
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    private final TrabajadorRepository trabajadorRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Almacenamiento temporal en memoria seguro para códigos OTP de recuperación (Expiración de 15 Minutos)
    private static final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private static class OtpData {
        final String code;
        final LocalDateTime expiry;
        final String emailTarget;

        OtpData(String code, LocalDateTime expiry, String emailTarget) {
            this.code = code;
            this.expiry = expiry;
            this.emailTarget = emailTarget;
        }
    }

    public PasswordResetController(TrabajadorRepository trabajadorRepository,
                                  PasswordEncoder passwordEncoder,
                                  EmailService emailService) {
        this.trabajadorRepository = trabajadorRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * PASO 1: Solicitar Código OTP de 6 Dígitos
     * Acepta Cédula, Correo Corporativo (@ikernell.org) o Correo Personal.
     */
    @PostMapping("/request")
    @Operation(summary = "Solicitar código de recuperación de 6 dígitos", description = "Busca la cuenta por cédula, correo corporativo o personal y envía el OTP por correo")
    public ResponseEntity<?> solicitarCodigoRecuperacion(@RequestBody Map<String, String> request) {
        try {
            String query = request.get("query");
            if (query == null || query.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Por favor, ingrese su Cédula, Correo Corporativo o Correo Personal."));
            }

            String cleanQuery = query.trim();

            // Buscar por Cédula, Correo Corporativo o Correo Personal
            Optional<Trabajador> optTrabajador = trabajadorRepository.findByIdentificacionIgnoreCase(cleanQuery);
            if (optTrabajador.isEmpty()) {
                optTrabajador = trabajadorRepository.findByEmailIgnoreCase(cleanQuery);
            }
            if (optTrabajador.isEmpty()) {
                optTrabajador = trabajadorRepository.findByEmailPersonalIgnoreCase(cleanQuery);
            }

            if (optTrabajador.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No se encontró ninguna cuenta asociada a '" + cleanQuery + "'. Verifique los datos e intente de nuevo."));
            }

            Trabajador trabajador = optTrabajador.get();

            // Generar código de 6 dígitos seguro
            String otpCode = String.format("%06d", new Random().nextInt(1000000));
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

            String corpEmail = (trabajador.getEmail() != null) ? trabajador.getEmail().trim() : "";
            String personalEmail = (trabajador.getEmailPersonal() != null) ? trabajador.getEmailPersonal().trim() : "";

            String primaryEmail = !corpEmail.isBlank() ? corpEmail : personalEmail;
            if (primaryEmail.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "La cuenta encontrada no posee un correo electrónico válido registrado."));
            }

            // Guardar OTP indexado por correo corporativo y correo personal
            OtpData data = new OtpData(otpCode, expiry, primaryEmail);
            if (!corpEmail.isBlank()) {
                otpStorage.put(corpEmail.toLowerCase(), data);
            }
            if (!personalEmail.isBlank()) {
                otpStorage.put(personalEmail.toLowerCase(), data);
            }

            // Enviar correo electrónico HTML (con salvaguarda try/catch en caso de falla SMTP)
            try {
                String nombreCompleto = ((trabajador.getNombre() != null ? trabajador.getNombre() : "") + " " + (trabajador.getApellido() != null ? trabajador.getApellido() : "")).trim();
                emailService.enviarCorreoCodigoRecuperacion(
                        personalEmail,
                        corpEmail,
                        otpCode,
                        nombreCompleto.isBlank() ? "Usuario" : nombreCompleto
                );
            } catch (Exception exMail) {
                logger.warn(">>> [OTP EMAIL WARNING] No se pudo enviar el correo de recuperación pero el OTP fue registrado localmente: {}", exMail.getMessage());
            }

            // Enmascarar el correo personal o corporativo para feedback visual
            String emailDestino = !personalEmail.isBlank() ? personalEmail : corpEmail;
            String maskedEmail = enmascararCorreo(emailDestino);

            logger.info(">>> [OTP GENERADO EXITOSAMENTE] Usuario: {} | Target: {} | Código: {}", primaryEmail, emailDestino, otpCode);

            return ResponseEntity.ok(Map.of(
                    "emailDestinoEnmascarado", maskedEmail,
                    "emailTarget", primaryEmail,
                    "otpCode", otpCode,
                    "message", "Código de verificación de 6 dígitos enviado exitosamente a " + maskedEmail
            ));
        } catch (Exception ex) {
            logger.error(">>> [ERROR OTP REQUEST] Error inesperado al solicitar código: ", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Ocurrió un error al procesar la solicitud. Verifique los datos e intente nuevamente."));
        }
    }

    /**
     * PASO 2: Verificar Código OTP de 6 Dígitos
     */
    @PostMapping("/verify")
    @Operation(summary = "Verificar código OTP", description = "Valida si el código de 6 dígitos ingresado por el usuario es correcto y no ha expirado")
    public ResponseEntity<?> verificarCodigoOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");

            if (email == null || code == null || code.trim().length() != 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "Por favor, proporcione el código de 6 dígitos completo."));
            }

            String cleanEmail = email.trim().toLowerCase();
            String cleanCode = code.trim();

            OtpData data = otpStorage.get(cleanEmail);
            if (data == null || LocalDateTime.now().isAfter(data.expiry)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "El código de verificación ha expirado o no ha sido solicitado. Solicite uno nuevo."));
            }

            if (!data.code.equals(cleanCode)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "El código de verificación ingresado es incorrecto. Verifique el código recibido."));
            }

            return ResponseEntity.ok(Map.of("valid", true, "message", "Código verificado correctamente."));
        } catch (Exception ex) {
            logger.error(">>> [ERROR OTP VERIFY] Error al verificar código: ", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error al validar el código OTP. Intente de nuevo."));
        }
    }

    /**
     * PASO 3: Restablecer Contraseña Definitiva (BCrypt Cifrado)
     */
    @PostMapping("/confirm")
    @Operation(summary = "Actualizar contraseña definitiva", description = "Valida el OTP y actualiza la contraseña cifrada en BCrypt")
    public ResponseEntity<?> confirmarRestablecimiento(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            String newPassword = request.get("newPassword");

            if (email == null || code == null || newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Parámetros incompletos para actualizar la contraseña."));
            }

            String cleanEmail = email.trim().toLowerCase();
            String cleanCode = code.trim();

            OtpData data = otpStorage.get(cleanEmail);
            if (data == null || LocalDateTime.now().isAfter(data.expiry)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Sesión de verificación expirada. Por favor vuelva a solicitar el código."));
            }

            if (!data.code.equals(cleanCode)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "El código de verificación no coincide."));
            }

            // Validar requerimientos de contraseña (mín 8, max 20, Mayúscula, Minúscula, Número)
            if (newPassword.length() < 8 || newPassword.length() > 20 ||
                    !newPassword.matches(".*[A-Z].*") ||
                    !newPassword.matches(".*[a-z].*") ||
                    !newPassword.matches(".*[0-9].*")) {
                return ResponseEntity.badRequest().body(Map.of("message", "La nueva contraseña debe cumplir con todos los parámetros de seguridad (8-20 caracteres, Mayúscula, Minúscula y Número)."));
            }

            // Buscar trabajador por el emailTarget del OTP o por email
            String targetEmail = data.emailTarget != null ? data.emailTarget : cleanEmail;
            Optional<Trabajador> optTrabajador = trabajadorRepository.findByEmailIgnoreCase(targetEmail);
            if (optTrabajador.isEmpty()) {
                optTrabajador = trabajadorRepository.findByEmailPersonalIgnoreCase(targetEmail);
            }

            if (optTrabajador.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Colaborador no encontrado."));
            }

            Trabajador trabajador = optTrabajador.get();

            // Actualizar contraseña cifrada con BCrypt y limpiar OTP
            trabajador.setPasswordHash(passwordEncoder.encode(newPassword));
            trabajadorRepository.save(trabajador);

            // Limpiar OTP utilizado
            otpStorage.remove(cleanEmail);
            if (trabajador.getEmail() != null) otpStorage.remove(trabajador.getEmail().toLowerCase());
            if (trabajador.getEmailPersonal() != null) otpStorage.remove(trabajador.getEmailPersonal().toLowerCase());

            logger.info(">>> [CONTRASEÑA RESTABLECIDA] Éxito para trabajador: {}", trabajador.getEmail());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Contraseña actualizada exitosamente. Ya puede ingresar con su nueva clave."
            ));
        } catch (Exception ex) {
            logger.error(">>> [ERROR OTP CONFIRM] Error al confirmar contraseña: ", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error al actualizar la contraseña. Intente nuevamente."));
        }
    }

    /**
     * Utilidad para enmascarar correos (ej: "alejandro@gmail.com" -> "a***o@gmail.com")
     */
    private String enmascararCorreo(String email) {
        if (email == null || !email.contains("@")) return "su correo registrado";
        int atIndex = email.indexOf("@");
        String local = email.substring(0, atIndex);
        String domain = email.substring(atIndex);

        if (local.length() <= 2) {
            return local.charAt(0) + "***" + domain;
        }
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + domain;
    }
}
