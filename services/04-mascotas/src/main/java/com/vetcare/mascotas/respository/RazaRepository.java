package com.vetcare.mascotas.respository;

import com.vetcare.mascotas.model.Raza;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RazaRepository
        extends JpaRepository<Raza, Integer> {

    List<Raza> findByIdEspecie(Integer idEspecie);
}