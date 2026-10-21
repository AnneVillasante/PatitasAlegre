
package com.vetcare.registro.service;

import com.vetcare.registro.model.Usuario;
import com.vetcare.registro.repository.UsuarioRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional
    public Usuario registrarCliente(
            String username,
            String email,
            String password) {

        username = username.trim();
        email = email.trim().toLowerCase();

        if (username.isBlank() || email.isBlank() || password.isBlank()) {
            throw new IllegalArgumentException(
                "Todos los campos son obligatorios."
            );
        }

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException(
                "El correo electrónico no es válido."
            );
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException(
                "La contraseña debe tener al menos 8 caracteres."
            );
        }

        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                "El nombre de usuario ya está registrado."
            );
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                "El correo electrónico ya está registrado."
            );
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(password));

        // El rol CLIENTE se asigna en el backend.
        // No se recibe el rol desde el formulario.
        usuario.setIdRol(obtenerIdRolCliente());

        usuario.setEstado("ACTIVO");
        usuario.setIntentosFallidos(0);

        return usuarioRepository.save(usuario);
    }

    private Integer obtenerIdRolCliente() {
        return 4;
    }
}
