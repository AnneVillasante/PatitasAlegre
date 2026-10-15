
package com.vetcare.mascotas.service;

import com.vetcare.mascotas.model.Raza;
import com.vetcare.mascotas.respository.RazaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RazaService {

    private final RazaRepository razaRepository;

    public RazaService(RazaRepository razaRepository) {
        this.razaRepository = razaRepository;
    }

    public List<Raza> listarRazas() {
        return razaRepository.findAll();
    }

    public List<Raza> listarRazasPorEspecie(Integer idEspecie) {
        return razaRepository.findByIdEspecie(idEspecie);
    }
}
