package com.clinica.farmacia.validators;

import org.springframework.stereotype.Component;

import com.clinica.farmacia.dto.VentaDTO;

@Component
public class VentaValidator {

    public void validarInicioVenta(VentaDTO ventaDTO) {
        if (ventaDTO == null || ventaDTO.getIdPropietario() == null || ventaDTO.getIdPropietario() <= 0) {
            throw new IllegalArgumentException("El id del propietario es obligatorio");
        }
        if (ventaDTO.getItems() == null || ventaDTO.getItems().isEmpty()) {
            throw new IllegalArgumentException("La venta debe tener al menos un item");
        }
        for (VentaDTO.ItemDTO item : ventaDTO.getItems()) {
            if (item == null || item.getIdProducto() == null || item.getIdProducto() <= 0
                    || item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new IllegalArgumentException("Cada item debe tener un id de producto y una cantidad válida");
            }
        }
    }
}
