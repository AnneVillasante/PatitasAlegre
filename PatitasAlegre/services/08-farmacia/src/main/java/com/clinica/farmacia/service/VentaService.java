package com.clinica.farmacia.service;

import com.clinica.farmacia.dto.VentaDTO;
import com.clinica.farmacia.entity.DetalleVenta;
import com.clinica.farmacia.entity.Producto;
import com.clinica.farmacia.entity.Venta;
import com.clinica.farmacia.eventos.EventoPublisher;
import com.clinica.farmacia.repository.ProductoRepository;
import com.clinica.farmacia.repository.VentaRepository;
import com.clinica.farmacia.validators.VentaValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final VentaValidator validator;
    private final EventoPublisher eventoPublisher;

    public VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository,
                        VentaValidator validator, EventoPublisher eventoPublisher) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.validator = validator;
        this.eventoPublisher = eventoPublisher;
    }

    @Transactional
    public Venta iniciarVenta(VentaDTO ventaDTO) {
        validator.validarInicioVenta(ventaDTO);

        Venta venta = new Venta();
        venta.setCodigoVenta(generarCodigoVenta());
        venta.setIdPropietario(ventaDTO.getIdPropietario());
        venta.setIdMascota(ventaDTO.getIdMascota());
        venta.setIdReceta(ventaDTO.getIdReceta());
        venta.setEstado("PENDIENTE_PAGO");

        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (VentaDTO.ItemDTO itemDTO : ventaDTO.getItems()) {
            Producto producto = productoRepository.findConStockSuficiente(
                    itemDTO.getIdProducto(), itemDTO.getCantidad());
            if (producto == null) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para el producto ID: " + itemDTO.getIdProducto());
            }

            producto.setStock(producto.getStock() - itemDTO.getCantidad());
            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(itemDTO.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            BigDecimal subtotal = producto.getPrecio()
                    .multiply(BigDecimal.valueOf(itemDTO.getCantidad()));
            detalle.setSubtotal(subtotal);
            detalles.add(detalle);
            total = total.add(subtotal);
        }

        venta.setDetalles(detalles);
        venta.setTotal(total);
        Venta guardada = ventaRepository.save(venta);
        eventoPublisher.publicarVentaIniciada(guardada);
        return guardada;
    }

    @Transactional
    public void confirmarPago(String codigoVenta) {
        Venta venta = buscar(codigoVenta);
        if (!"PENDIENTE_PAGO".equals(venta.getEstado())) {
            return;
        }
        venta.setEstado("PAGADA");
        ventaRepository.save(venta);
        eventoPublisher.publicarVentaCompletada(venta);
    }

    public Venta buscar(String codigoVenta) {
        return ventaRepository.findByCodigoVenta(codigoVenta)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada: " + codigoVenta));
    }

    public List<Venta> listarPorPropietario(Long idPropietario) {
        return ventaRepository.findByIdPropietarioOrderByFechaVentaDesc(idPropietario);
    }

    private String generarCodigoVenta() {
        return "VFA-" + LocalDateTime.now().getYear() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
