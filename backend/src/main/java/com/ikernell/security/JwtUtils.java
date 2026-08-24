package com.ikernell.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// Utilidad criptográfica para generar, firmar y verificar tokens JWT bajo el algoritmo HMAC-SHA256
@Component
public class JwtUtils {

    // Clave de firma simétrica configurada en el archivo de propiedades
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Tiempo de expiración del token (24 horas por defecto o según propiedad)
    @Value("${jwt.expiration:86400000}")
    private int jwtExpirationMs;

    // Genera la clave secreta en formato binario para JJWT
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Construye un token firmado incorporando el usuario, el rol y la fecha de caducidad
    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        String role = userPrincipal.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("ROLE_DESARROLLADOR");

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // Extrae el correo o nombre de usuario contenido en el cuerpo del token
    public String getUsernameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Valida la firma del token y comprueba que no haya expirado ni sido alterado
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // El token expiró, tiene una firma no válida o su estructura está corrupta
            return false;
        }
    }
}
