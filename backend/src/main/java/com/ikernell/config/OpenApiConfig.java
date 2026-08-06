package com.ikernell.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Swagger / OpenAPI (Springdoc) para autodocumentación y prueba de endpoints de IKernell.
 * Integra soporte para autenticación Stateless mediante Bearer Token JWT.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ikernellOpenAPI() {
        final String securitySchemeName = "BearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("IKernell Soluciones Software - API REST")
                        .description("Documentación interactiva de la arquitectura backend de IKernell. " +
                                "Incluye módulos operacionales de Coordinadores, Líderes y Desarrolladores con seguridad JWT stateless y automatización ETL.")
                        .version("v1.0.0")
                        .contact(new Contact().name("Equipo de Ingeniería IKernell").email("soporte@ikernell.org")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingrese aquí su token JWT recibido al autenticar en /api/auth/login")));
    }
}
