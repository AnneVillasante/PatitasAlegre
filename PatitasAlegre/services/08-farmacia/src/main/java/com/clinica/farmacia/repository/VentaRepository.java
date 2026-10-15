package com.clinica.farmacia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.farmacia.entity.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    Optional<Venta> findByCodigoVenta(String codigoVenta);
    List<Venta> findByIdPropietarioOrderByFechaVentaDesc(Long idPropietario);
    List<Venta> findByEstado(String estado);
}
