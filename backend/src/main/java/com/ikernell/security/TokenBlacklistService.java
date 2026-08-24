package com.ikernell.security;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de lista negra (Blacklist) persistente para invalidar tokens JWT revocados tras logout (AUD-02).
 * Soporta reinicios conservando los tokens revocados en un archivo seguro en disco.
 */
@Service
public class TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);
    private static final Path BLACKLIST_FILE = Paths.get(System.getProperty("java.io.tmpdir"), "ikernell_jwt_blacklist.tmp");
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    @PostConstruct
    public void init() {
        try {
            if (Files.exists(BLACKLIST_FILE)) {
                List<String> lines = Files.readAllLines(BLACKLIST_FILE);
                for (String line : lines) {
                    if (line != null && !line.isBlank()) {
                        blacklistedTokens.add(line.trim());
                    }
                }
                log.info("[TOKEN-BLACKLIST] Se cargaron {} tokens revocados desde almacenamiento persistente.", blacklistedTokens.size());
            } else {
                Files.createFile(BLACKLIST_FILE);
            }
        } catch (IOException e) {
            log.warn("[TOKEN-BLACKLIST] No se pudo inicializar la persistencia en disco de la lista negra JWT: {}", e.getMessage());
        }
    }

    /**
     * Agrega un token a la lista negra de revocación y lo persiste en disco.
     */
    public synchronized void blacklistToken(String token) {
        if (token != null && !token.isBlank()) {
            String cleanToken = token.trim();
            if (blacklistedTokens.add(cleanToken)) {
                try {
                    Files.writeString(BLACKLIST_FILE, cleanToken + System.lineSeparator(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                } catch (IOException e) {
                    log.error("[TOKEN-BLACKLIST] Error al guardar token revocado en disco: {}", e.getMessage());
                }
            }
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
     * Limpia la lista negra en memoria y en disco si es necesario.
     */
    public synchronized void clear() {
        blacklistedTokens.clear();
        try {
            Files.deleteIfExists(BLACKLIST_FILE);
            Files.createFile(BLACKLIST_FILE);
        } catch (IOException e) {
            log.error("[TOKEN-BLACKLIST] Error al limpiar archivo de revocación en disco: {}", e.getMessage());
        }
    }
}
