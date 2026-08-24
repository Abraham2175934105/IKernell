package com.ikernell.security;

import org.springframework.stereotype.Service;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de lista negra (Blacklist) en memoria para invalidar tokens JWT revocados tras logout (AUD-02).
 */
@Service
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    /**
     * Agrega un token a la lista negra de revocación.
     */
    public void blacklistToken(String token) {
        if (token != null && !token.isBlank()) {
            blacklistedTokens.add(token.trim());
        }
    }

    /**
     * Verifica si un token ha sido revocado tras el logout.
     */
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        return blacklistedTokens.contains(token.trim());
    }

    /**
     * Limpia la lista negra en memoria si es necesario.
     */
    public void clear() {
        blacklistedTokens.clear();
    }
}
