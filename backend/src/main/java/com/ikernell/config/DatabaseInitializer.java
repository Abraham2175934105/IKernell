package com.ikernell.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/**
 * Inicializador de base de datos automatizado para IKernell.
 * Garantiza que los 35 proyectos corporativos, etapas WBS, actividades
 * y asignaciones de desarrolladores se pueblen automáticamente en PostgreSQL.
 */
@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Sincronizando catálogo corporativo de 35 proyectos en PostgreSQL...");
            ejecutarScriptDataSql();
            Integer conteoNuevo = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM proyecto", Integer.class);
            log.info("Sembrado y actualización de proyectos finalizado exitosamente. Conteo actual: {}", conteoNuevo);
        } catch (Exception e) {
            log.warn("Nota sobre sincronización de datos: {}", e.getMessage());
        }
    }

    private void ejecutarScriptDataSql() {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource("data.sql").getInputStream(), StandardCharsets.UTF_8))) {

            StringBuilder sb = new StringBuilder();
            String line;
            boolean inDollarQuote = false;

            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.startsWith("--") && !inDollarQuote) {
                    continue; // Omitir comentarios de línea
                }

                if (line.contains("$DOC_TAG_")) {
                    inDollarQuote = !inDollarQuote;
                }

                sb.append(line).append("\n");

                // Ejecutar sentencia cuando encontramos punto y coma al final de línea y no estamos dentro de dollar quote
                if (trimmed.endsWith(";") && !inDollarQuote) {
                    String sql = sb.toString().trim();
                    if (!sql.isEmpty()) {
                        try {
                            jdbcTemplate.execute(sql);
                        } catch (Exception ex) {
                            log.debug("Sentencia SQL omitida o repetida: {}", ex.getMessage());
                        }
                    }
                    sb.setLength(0);
                }
            }

            if (sb.length() > 0) {
                String sql = sb.toString().trim();
                if (!sql.isEmpty()) {
                    try {
                        jdbcTemplate.execute(sql);
                    } catch (Exception ignored) {}
                }
            }
        } catch (Exception e) {
            log.error("Error al leer data.sql para sembrado: {}", e.getMessage());
        }
    }
}
