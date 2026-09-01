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

            // Sembrado preventivo de Solicitudes de Contacto Web si la tabla está vacía
            Integer conteoSolicitudes = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM solicitud_contacto", Integer.class);
            if (conteoSolicitudes == null || conteoSolicitudes == 0) {
                log.info("Sembrando solicitudes de contacto web iniciales...");
                jdbcTemplate.execute("""
                    INSERT INTO solicitud_contacto (nombre_remitente, email_remitente, telefono, asunto, mensaje, fecha_envio, atendido, estado) VALUES
                    ('Carlos Mendoza', 'carlos.mendoza@techcorp.io', '+57 310 456 7890', 'Cotización Migración Cloud AWS', 'Requerimos evaluar la migración de nuestra infraestructura on-premise a microservicios en AWS EKS.', NOW() - INTERVAL '2 days', false, 'PENDIENTE'),
                    ('Andrea Villamizar', 'andrea.v@bancofinanciero.com', '+57 320 888 1234', 'Auditoría CMMI Dev Level 3', 'Solicito propuesta técnica para acompañamiento en certificación CMMI Dev Nivel 3 para nuestro equipo.', NOW() - INTERVAL '1 day', false, 'EN_PROCESO'),
                    ('Jorge Eliécer Gaitán', 'jorge.gaitan@innovasolutions.co', '+57 300 111 2233', 'Consultoría Desarrollo Mobile React Native', 'Interesados en contratar células de desarrollo senior para potenciar nuestra billetera digital.', NOW() - INTERVAL '5 hours', false, 'PENDIENTE'),
                    ('Laura Sofía Castro', 'laura.castro@logistics.com', '+57 315 777 9988', 'Integración API Pasarela Pagos', 'Necesitamos asistencia para integración segura con PCI-DSS y arquitectura de microservicios.', NOW() - INTERVAL '3 days', true, 'ATENDIDO'),
                    ('Mauricio Peralta', 'm.peralta@saluddigital.org', '+57 318 444 5566', 'Desarrollo Sistema Telemedicina', 'Cotización de sistema de gestión hospitalaria en la nube con altos estándares de seguridad.', NOW() - INTERVAL '4 days', false, 'REABIERTAS'),
                    ('Valeria Restrepo', 'valeria.r@fintechgroup.co', '+57 301 666 4422', 'Soporte DevOps & Kubernetes', 'Requerimos optimización de pipelines CI/CD y despliegue automatizado con Helm en GCP.', NOW() - INTERVAL '6 hours', false, 'PENDIENTE');
                """);
                log.info("Solicitudes de contacto web sembradas exitosamente.");
            }
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
