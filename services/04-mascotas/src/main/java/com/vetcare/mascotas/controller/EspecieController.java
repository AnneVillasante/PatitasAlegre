
package com.vetcare.mascotas.controller;

import com.vetcare.mascotas.model.Especie;
import com.vetcare.mascotas.service.EspecieService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
@RestController
@RequestMapping("/api/mascotas/especies")
public class EspecieController {

    private final EspecieService especieService;

    public EspecieController(EspecieService especieService) {
        this.especieService = especieService;
    }

    @GetMapping
    public List<Especie> listar() {
        return especieService.listarEspecies();
    }
}

