package com.clinica.farmacia.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinica.farmacia.entity.Producto;
import com.clinica.farmacia.entity.Venta;
import com.clinica.farmacia.repository.ProductoRepository;
import com.clinica.farmacia.service.VentaService;
import com.clinica.farmacia.xml.XmlBuilder;
import com.clinica.farmacia.xml.XmlParser;

@RestController
@RequestMapping("/farmacia")
public class VentaController {

    private final VentaService ventaService;
    private final ProductoRepository productoRepository;
    private final XmlParser xmlParser;
    private final XmlBuilder xmlBuilder;

    public VentaController(VentaService ventaService, ProductoRepository productoRepository,
            XmlParser xmlParser, XmlBuilder xmlBuilder) {
        this.ventaService = ventaService;
        this.productoRepository = productoRepository;
        this.xmlParser = xmlParser;
        this.xmlBuilder = xmlBuilder;
    }

    @PostMapping(value = "/ventas/iniciar", consumes = MediaType.APPLICATION_XML_VALUE, produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> iniciarVenta(@RequestBody String xmlPayload) {
        try {
            Venta venta = ventaService.iniciarVenta(xmlParser.parsearVentaRequest(xmlPayload));
            return ResponseEntity.ok(xmlBuilder.buildSuccess("iniciarVentaResponse", Map.of(
                    "codigoVenta", venta.getCodigoVenta(),
                    "estado", venta.getEstado(),
                    "total", venta.getTotal(),
                    "mensaje", "Venta iniciada, esperando confirmación de pago")));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.CONFLICT, "iniciarVentaResponse", e.getMessage());
        } catch (Exception e) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, "iniciarVentaResponse", "Error interno del servidor");
        }
    }

    @GetMapping(value = "/productos", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> listarProductos() {
        List<Map<String, Object>> productos = productoRepository.findActivos().stream()
                .map(this::productoXml)
                .toList();
        return ResponseEntity.ok(xmlBuilder.buildSuccess(
                "listarProductosResponse", Map.of("producto", productos)));
    }

    @GetMapping(value = "/ventas/propietario/{idPropietario}", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> listarVentas(@PathVariable Integer idPropietario) {
        List<Map<String, Object>> ventas = ventaService.listarPorPropietario(idPropietario).stream()
                .map(venta -> Map.<String, Object>of(
                        "codigoVenta", venta.getCodigoVenta(),
                        "estado", venta.getEstado(),
                        "total", venta.getTotal(),
                        "fechaVenta", venta.getFechaVenta()))
                .toList();
        return ResponseEntity.ok(xmlBuilder.buildSuccess(
                "listarVentasResponse", Map.of("venta", ventas)));
    }

    @GetMapping(value = "/ventas/{codigoVenta}", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> consultarVenta(@PathVariable String codigoVenta) {
        try {
            Venta venta = ventaService.buscar(codigoVenta);
            return ResponseEntity.ok(xmlBuilder.buildSuccess("consultarVentaResponse", Map.of(
                    "codigoVenta", venta.getCodigoVenta(),
                    "idPropietario", venta.getIdPropietario(),
                    "estado", venta.getEstado(),
                    "total", venta.getTotal(),
                    "fechaVenta", venta.getFechaVenta())));
        } catch (IllegalArgumentException e) {
            return error(HttpStatus.NOT_FOUND, "consultarVentaResponse", e.getMessage());
        }
    }

    private Map<String, Object> productoXml(Producto producto) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("idProducto", producto.getId());
        item.put("codigo", producto.getCodigo());
        item.put("nombre", producto.getNombre());
        item.put("descripcion", producto.getDescripcion());
        item.put("idCategoria", producto.getIdCategoria());
        item.put("presentacion", producto.getPresentacion());
        item.put("precio", producto.getPrecio());
        item.put("stock", producto.getStock());
        item.put("stockMinimo", producto.getStockMinimo());
        item.put("requiereReceta", producto.getRequiereReceta());
        item.put("fechaVencimiento", producto.getFechaVencimiento() != null ? producto.getFechaVencimiento().toString() : "");
        return item;
    }

    private ResponseEntity<String> error(HttpStatus status, String rootName, String message) {
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_XML)
                .body(xmlBuilder.buildError(rootName, "ERROR-NEGOCIO", message));
    }
}
