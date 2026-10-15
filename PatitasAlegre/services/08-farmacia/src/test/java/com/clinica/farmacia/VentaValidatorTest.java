package com.clinica.farmacia;

import com.clinica.farmacia.dto.VentaDTO;
import com.clinica.farmacia.validators.VentaValidator;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class VentaValidatorTest {

    private final VentaValidator validator = new VentaValidator();

    @Test
    void rechazaVentaSinItems() {
        VentaDTO venta = new VentaDTO();
        venta.setIdPropietario(1L);
        assertThrows(IllegalArgumentException.class, () -> validator.validarInicioVenta(venta));
    }

    @Test
    void aceptaVentaConItemsValidos() {
        VentaDTO venta = new VentaDTO();
        venta.setIdPropietario(1L);
        VentaDTO.ItemDTO item = new VentaDTO.ItemDTO();
        item.setIdProducto(1L);
        item.setCantidad(2);
        venta.setItems(List.of(item));
        assertDoesNotThrow(() -> validator.validarInicioVenta(venta));
    }
}
