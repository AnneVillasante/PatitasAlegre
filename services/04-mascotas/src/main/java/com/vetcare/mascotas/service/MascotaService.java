
package com.vetcare.mascotas.service;

import com.vetcare.mascotas.model.Mascota;
import com.vetcare.mascotas.respository.MascotaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MascotaService {

    private final MascotaRepository mascotaRepository;

    public MascotaService(MascotaRepository mascotaRepository) {
        this.mascotaRepository = mascotaRepository;
    }

    public List<Mascota> listarMascotas() {
        return mascotaRepository.findAll();
    }

    public Optional<Mascota> buscarPorId(Integer id) {
        return mascotaRepository.findById(id);
    }

    public List<Mascota> listarPorPropietario(Integer idPropietario) {
        return mascotaRepository.findByIdPropietario(idPropietario);
    }

    public List<Mascota> listarPorEstado(
            Mascota.EstadoMascota estado) {
        return mascotaRepository.findByEstado(estado);
    }

    public Mascota registrar(Mascota mascota) {
        mascota.setIdMascota(null);
        return mascotaRepository.save(mascota);
    }

    public Mascota actualizar(Integer id, Mascota datos) {
        Mascota existente = mascotaRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No existe la mascota con ID " + id));

        existente.setCodigo(datos.getCodigo());
        existente.setIdPropietario(datos.getIdPropietario());
        existente.setIdEspecie(datos.getIdEspecie());
        existente.setIdRaza(datos.getIdRaza());
        existente.setNombre(datos.getNombre());
        existente.setSexo(datos.getSexo());
        existente.setFechaNacimiento(datos.getFechaNacimiento());
        existente.setPesoKg(datos.getPesoKg());
        existente.setColor(datos.getColor());
        existente.setNumeroChip(datos.getNumeroChip());
        existente.setAlergias(datos.getAlergias());
        existente.setObservaciones(datos.getObservaciones());
        existente.setEstado(datos.getEstado());

        return mascotaRepository.save(existente);
    }

    public void eliminar(Integer id) {
        if (!mascotaRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "No existe la mascota con ID " + id);
        }

        mascotaRepository.deleteById(id);
    }
}
