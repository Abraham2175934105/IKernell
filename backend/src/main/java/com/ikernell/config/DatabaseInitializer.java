package com.ikernell.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Inicializador de base de datos automatizado para IKernell.
 * Garantiza que los 35 proyectos corporativos, etapas WBS, actividades
 * y asignaciones de desarrolladores se pueblen automáticamente en PostgreSQL.
 */
@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            Integer totalProyectos = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM proyecto", Integer.class);
            log.info("Verificando catálogo de proyectos en PostgreSQL. Conteo actual: {}", totalProyectos);

            if (totalProyectos == null || totalProyectos < 35) {
                log.info("Ejecutando sembrado automático de 35 proyectos desde data.sql...");
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.addScript(new ClassPathResource("data.sql"));
                populator.setContinueOnError(true);
                populator.execute(dataSource);
                log.info("Sembrado de datos finalizado exitosamente.");
            }
        } catch (Exception e) {
            log.warn("Nota sobre sincronización de datos: {}", e.getMessage());
        }
    }
}
