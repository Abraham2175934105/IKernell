package com.ikernell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Clase principal del sistema IKernell Soluciones Software.
 * <p>
 * Habilita:
 * - @EnableAsync: Pool de hilos asíncronos para procesos ETL y reportes que no bloquean el hilo HTTP principal.
 * - @EnableScheduling: Tareas programadas para la Innovación 2 (Batch ETL semanal a Brasil).
 * </p>
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class IKernellApplication {

    public static void main(String[] args) {
        SpringApplication.run(IKernellApplication.class, args);
    }
}
