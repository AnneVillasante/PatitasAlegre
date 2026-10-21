package com.clinica.farmacia.service;

import com.clinica.farmacia.entity.DetalleVenta;
import com.clinica.farmacia.entity.Producto;
import com.clinica.farmacia.entity.Venta;
import com.clinica.farmacia.eventos.EventoPublisher;
import com.clinica.farmacia.repository.ProductoRepository;
import com.clinica.farmacia.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SagaCompensacion {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final EventoPublisher eventoPublisher;

    public SagaCompensacion(VentaRepository ventaRepository, ProductoRepository productoRepository,
                            EventoPublisher eventoPublisher) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.eventoPublisher = eventoPublisher;
    }

    @Transactional
    public void compensarVenta(String codigoVenta, String motivo) {
        Venta venta = ventaRepository.findByCodigoVenta(codigoVenta)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Venta no encontrada para compensar: " + codigoVenta));
        if ("CANCELADA".equals(venta.getEstado())) {
            return;
        }

        for (DetalleVenta detalle : venta.getDetalles()) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepository.save(producto);
        }

        venta.setEstado("CANCELADA");
        ventaRepository.save(venta);
        eventoPublisher.publicarVentaCancelada(venta, motivo);
    }
}
