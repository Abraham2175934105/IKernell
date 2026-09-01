package com.ikernell.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

// Configuración central de seguridad perimetral, control de acceso basado en roles (RBAC) y anti-caché
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Inyección de dependencias
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // Algoritmo de hash BCrypt unidireccional con sal aleatoria y costo computacional equilibrado (factor 10)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    // Proveedor de autenticación que valida el usuario contra la base de datos PostgreSQL
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Gestor de autenticación para validar credenciales en el endpoint de login
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Cadena de filtros de seguridad HTTP
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitamos CSRF porque la autenticación es completamente stateless mediante JWT
            .csrf(csrf -> csrf.disable())
            
            // Habilitamos CORS para permitir llamadas cruzadas desde el cliente Vite / React
            .cors(Customizer.withDefaults())

            // Hardening de Cabeceras HTTP Anti-Caché y Seguridad (Anti Back-Button & Cache Control)
            .headers(headers -> headers
                .cacheControl(Customizer.withDefaults())
                .addHeaderWriter(new StaticHeadersWriter("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"))
                .addHeaderWriter(new StaticHeadersWriter("Pragma", "no-cache"))
                .addHeaderWriter(new StaticHeadersWriter("Expires", "0"))
            )
            
            // Definimos sesiones sin estado para que el backend no almacene cookies ni sesiones en memoria
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Matriz de autorización por rutas y roles de negocio
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Peticiones preflight de navegadores
                .requestMatchers("/api/auth/**").permitAll() // Endpoints públicos (login, formulario de contacto)
                .requestMatchers("/error").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/api/coordinador/**").hasRole("COORDINADOR")
                .requestMatchers("/api/lider/**").hasAnyRole("COORDINADOR", "LIDER")
                .requestMatchers("/api/desarrollador/**").hasAnyRole("COORDINADOR", "LIDER", "DESARROLLADOR")
                .requestMatchers("/api/snippets/**").hasAnyRole("COORDINADOR", "LIDER", "DESARROLLADOR")
                .requestMatchers("/api/analitica/**").hasAnyRole("COORDINADOR", "LIDER", "DESARROLLADOR")
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        
        // Registramos el filtro de JWT antes del filtro de autenticación por formulario
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Configuración de orígenes permitidos, métodos y cabeceras para CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permitimos exclusivamente orígenes autorizados para desarrollo frontend y servicios conocidos
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
