package com.ikernell.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.RejectedExecutionException;

/**
 * Manejador global de excepciones para toda la API (Auditoría Senior de Calidad).
 * Centraliza el manejo de errores aplicando principio de Responsabilidad Única (SRP).
 * Garantiza que cualquier fallo retorne un payload JSON controlado e indicativo.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Maneja errores de validación de Spring Validation (@Valid fallido en DTOs o RequestBody).
     * Devuelve código 400 Bad Request con un detalle por cada campo mal enviado.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Error de Validación en los datos enviados",
                "Uno o más campos no cumplen con el formato o restricciones requeridos.",
                request.getRequestURI(),
                errors
        );

        log.warn("Error de validación (400) en URI {}: {}", request.getRequestURI(), errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Maneja errores al solicitar recursos que no existen (ej. ID no encontrado en BD).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Recurso No Encontrado",
                ex.getMessage(),
                request.getRequestURI()
        );

        log.info("Recurso no encontrado (404) en URI {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Maneja excepciones de reglas de negocio o argumentos inválidos.
     */
    @ExceptionHandler({BusinessLogicException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiErrorResponse> handleBusinessOrIllegalArgumentException(
            RuntimeException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Petición Inválida o Error de Negocio",
                ex.getMessage(),
                request.getRequestURI()
        );

        log.warn("Petición inválida o error de negocio (400) en URI {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Maneja JSON malformado o payload no legible.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Cuerpo de la Petición Inválido",
                "El payload JSON no pudo ser deserializado o presenta un formato inválido.",
                request.getRequestURI()
        );

        log.warn("JSON no legible (400) en URI {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Maneja parámetros obligatorios ausentes en QueryParams.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Parámetro Requerido Ausente",
                String.format("El parámetro de consulta obligatorio '%s' de tipo '%s' no fue suministrado.",
                        ex.getParameterName(), ex.getParameterType()),
                request.getRequestURI()
        );

        log.warn("Parámetro ausente (400) en URI {}: {}", request.getRequestURI(), ex.getParameterName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Maneja tipos incorrectos en parámetros o PathVariables.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        String message = String.format("El parámetro '%s' con valor '%s' no pudo ser convertido al tipo '%s'",
                ex.getName(), ex.getValue(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "inválido");

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Tipo de Parámetro Inválido",
                message,
                request.getRequestURI()
        );

        log.warn("Tipo de parámetro inválido (400) en URI {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Maneja métodos HTTP no permitidos (ej. POST en endpoint GET).
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleHttpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                "Método HTTP No Permitido",
                String.format("El método '%s' no está soportado para este endpoint.", ex.getMethod()),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    /**
     * Maneja errores de credenciales inválidas.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Credenciales Inválidas",
                "El correo electrónico o la contraseña ingresados son incorrectos.",
                request.getRequestURI()
        );

        log.warn("Intento de login fallido (401) en URI {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Maneja accesos denegados por falta de permisos/roles.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Acceso Denegado",
                "No dispone de los privilegios de rol suficientes para ejecutar esta operación.",
                request.getRequestURI()
        );

        log.warn("Acceso denegado (403) en URI {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Maneja saturación de base de datos o pool de conexiones durante pruebas de estrés.
     */
    @ExceptionHandler({CannotCreateTransactionException.class, QueryTimeoutException.class})
    public ResponseEntity<ApiErrorResponse> handleDatabaseStressExceptions(
            Exception ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "Servicio Temporalmente Saturado",
                "El pool de conexiones de base de datos ha alcanzado su límite de concurrencia. Por favor, reintente en unos instantes.",
                request.getRequestURI()
        );

        log.error("Saturación de base de datos / Pool HikariCP agotado (503) en URI {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    /**
     * Maneja desbordamiento de colas en hilos asíncronos (@Async) bajo estrés extremo.
     */
    @ExceptionHandler({TaskRejectedException.class, RejectedExecutionException.class})
    public ResponseEntity<ApiErrorResponse> handleTaskRejectedException(
            Exception ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "Límite de Procesamiento Asíncrono Excedido",
                "El servidor se encuentra procesando la capacidad máxima de tareas en segundo plano. Intente nuevamente en breve.",
                request.getRequestURI()
        );

        log.error("Cola asíncrona desbordada (429) en URI {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    /**
     * Maneja errores generales de acceso a datos JPA / SQL.
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleDataAccessException(
            DataAccessException ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error en Capa de Persistencia",
                "Ocurrió un error al ejecutar la transacción en la base de datos.",
                request.getRequestURI()
        );

        log.error("Error JPA / DataAccess (500) en URI {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Captura cualquier otra excepción no manejada para prevenir caídas y filtrado de StackTrace.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneralException(
            Exception ex, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error Interno del Servidor",
                "Ha ocurrido un error inesperado al procesar la solicitud. Contacte al administrador si el problema persiste.",
                request.getRequestURI()
        );

        log.error("Error interno del servidor (500) en URI {}: ", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

