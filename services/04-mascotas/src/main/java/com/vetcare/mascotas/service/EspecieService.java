
package com.vetcare.mascotas.service;

import com.vetcare.mascotas.model.Especie;
import com.vetcare.mascotas.respository.EspecieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EspecieService {

    private final EspecieRepository especieRepository;

    public EspecieService(EspecieRepository especieRepository) {
        this.especieRepository = especieRepository;
    }

    public List<Especie> listarEspecies() {
        return especieRepository.findAll();
    }
}
