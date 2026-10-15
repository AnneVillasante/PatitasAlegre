
package com.vetcare.mascotas.controller;

import com.vetcare.mascotas.model.Mascota;
import com.vetcare.mascotas.service.MascotaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    private final MascotaService mascotaService;

    public MascotaController(MascotaService mascotaService) {
        this.mascotaService = mascotaService;
    }

    @GetMapping
    public List<Mascota> listar() {
        return mascotaService.listarMascotas();
    }

        
    @GetMapping("/estado")
    public String estado() {
        return "Microservicio Mascotas funcionando correctamente";
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Mascota> buscarPorId(
            @PathVariable Integer id) {
        return mascotaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }


    @GetMapping("/propietario/{idPropietario}")
    public List<Mascota> listarPorPropietario(
            @PathVariable Integer idPropietario) {
        return mascotaService.listarPorPropietario(idPropietario);
    }

    @GetMapping("/estado/{estado}")
    public List<Mascota> listarPorEstado(
            @PathVariable Mascota.EstadoMascota estado) {
        return mascotaService.listarPorEstado(estado);
    }

    @PostMapping
    public ResponseEntity<Mascota> registrar(
            @RequestBody Mascota mascota) {
        Mascota nueva = mascotaService.registrar(mascota);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mascota> actualizar(
            @PathVariable Integer id,
            @RequestBody Mascota mascota) {
        return ResponseEntity.ok(
                mascotaService.actualizar(id, mascota));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id) {
        mascotaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
