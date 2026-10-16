package com.clinica.farmacia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clinica.farmacia.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    @Query("SELECT p FROM Producto p WHERE p.estado = 'ACTIVO' ORDER BY p.nombre")
    List<Producto> findActivos();

    @Query("SELECT p FROM Producto p WHERE p.id = :id AND p.estado = 'ACTIVO' AND p.stock >= :cantidad")
    Producto findConStockSuficiente(@Param("id") Integer id, @Param("cantidad") Integer cantidad);
}
