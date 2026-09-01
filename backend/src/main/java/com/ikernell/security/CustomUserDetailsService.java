package com.ikernell.security;

import com.ikernell.model.Trabajador;
import com.ikernell.repository.TrabajadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Trabajador trabajador = trabajadorRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        if (!Boolean.TRUE.equals(trabajador.getEstado())) {
            throw new DisabledException("El trabajador se encuentra inhabilitado en el sistema.");
        }

        // Prefijo ROLE_ estándar de Spring Security
        String authority = "ROLE_" + trabajador.getRol().name();

        return new User(
                trabajador.getEmail(),
                trabajador.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority(authority))
        );
    }
}
