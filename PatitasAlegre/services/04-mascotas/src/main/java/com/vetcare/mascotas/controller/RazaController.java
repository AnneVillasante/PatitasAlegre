
package com.vetcare.mascotas.controller;

import com.vetcare.mascotas.model.Raza;
import com.vetcare.mascotas.service.RazaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
@RestController
@RequestMapping("/api/mascotas/razas")
public class RazaController {

    private final RazaService razaService;

    public RazaController(RazaService razaService) {
        this.razaService = razaService;
    }

    @GetMapping
    public List<Raza> listar() {
        return razaService.listarRazas();
    }

    @GetMapping("/especie/{idEspecie}")
    public List<Raza> listarPorEspecie(
            @PathVariable Integer idEspecie) {
        return razaService.listarRazasPorEspecie(idEspecie);
    }
}
