package com.vetcare.mascotas.respository;

import com.vetcare.mascotas.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MascotaRepository
        extends JpaRepository<Mascota, Integer> {

    List<Mascota> findByIdPropietario(Integer idPropietario);

    List<Mascota> findByEstado(Mascota.EstadoMascota estado);

    Optional<Mascota> findByCodigo(String codigo);

    Optional<Mascota> findByNumeroChip(String numeroChip);
}