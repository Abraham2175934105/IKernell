package com.ikernell.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuración del pool de hilos asíncronos para operaciones no-bloqueantes.
 * <p>
 * Utilizado por: EtlAutomationService (@Async) para procesar reportes ETL hacia Brasil
 * sin bloquear el hilo HTTP del controlador que atiende la petición del Líder.
 * </p>
 */
@Configuration
public class AsyncConfig {

    @Bean(name = "etlTaskExecutor")
    public Executor etlTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("IKernell-ETL-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
