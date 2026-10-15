package com.vetcare.mascotas.respository;

import com.vetcare.mascotas.model.Especie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecieRepository
        extends JpaRepository<Especie, Integer> {
}