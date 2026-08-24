package com.ikernell.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Filtro interceptor que se ejecuta una sola vez por cada solicitud HTTP para validar el Bearer Token JWT
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Inyección de dependencias
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Extraemos la cadena del token presente en la cabecera Authorization
            String jwt = parseJwt(request);
            
            // Si el token existe, no ha sido revocado (blacklist) y su firma es válida, autenticamos al usuario
            if (jwt != null && !tokenBlacklistService.isBlacklisted(jwt) && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUsernameFromJwtToken(jwt);

                // Cargamos los datos del usuario y sus roles asignados
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                                userDetails, 
                                null, 
                                userDetails.getAuthorities()
                        );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Registramos la identidad en el contexto de seguridad de Spring durante el ciclo de vida de la petición
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("No se pudo establecer la autenticación del usuario en el contexto de seguridad", e);
        }

        // Continuamos la cadena de filtros de la solicitud
        filterChain.doFilter(request, response);
    }

    // Extrae el valor del token omitiendo el prefijo 'Bearer '
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
