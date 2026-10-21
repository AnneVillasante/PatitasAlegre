package com.vetcare.registro.controller;

import com.vetcare.registro.model.Usuario;
import com.vetcare.registro.service.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/registro")
@CrossOrigin(
    originPatterns = "*",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class RegistroController {

    private final UsuarioService usuarioService;

    public RegistroController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    public record RegistroRequest(
        @NotBlank(message = "El nombre de usuario es obligatorio")
        @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
        String username,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        @Size(max = 100, message = "El correo no puede superar 100 caracteres")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password
    ) {}

    @PostMapping
    public ResponseEntity<?> registrar(
            @Valid @RequestBody RegistroRequest datos) {

        try {
            Usuario usuario = usuarioService.registrarCliente(
                datos.username(),
                datos.email(),
                datos.password()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "ok", true,
                "mensaje", "Cliente registrado correctamente",
                "usuario", Map.of(
                    "id", usuario.getIdUsuario(),
                    "username", usuario.getUsername(),
                    "email", usuario.getEmail(),
                    "rol", "CLIENTE"
                )
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "ok", false,
                "mensaje", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> infoRegistro() {
        return ResponseEntity.ok(Map.of(
            "servicio", "VetCare - Registro",
            "estado", "activo",
            "metodoEsperado", "POST",
            "mensaje", "Endpoint disponible para creación de cuentas de clientes vía POST."
        ));
    }

    @GetMapping("/estado")
    public Map<String, String> estado() {
        return Map.of(
            "servicio", "VetCare - Registro",
            "estado", "funcionando",
            "tecnologia", "Java + Spring Boot"
        );
    }
}

