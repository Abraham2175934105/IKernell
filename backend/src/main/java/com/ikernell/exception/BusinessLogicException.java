package com.ikernell.exception;

/**
 * Excepción para violaciones de reglas de negocio o datos incorrectos recibidos (HTTP 400).
 */
public class BusinessLogicException extends RuntimeException {
    public BusinessLogicException(String message) {
        super(message);
    }
}
