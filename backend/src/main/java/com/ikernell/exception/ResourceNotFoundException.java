package com.ikernell.exception;

/**
 * Excepción personalizada para representar recursos no encontrados en la base de datos (HTTP 404).
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
