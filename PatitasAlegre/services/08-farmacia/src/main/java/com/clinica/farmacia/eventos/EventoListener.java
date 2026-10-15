package com.clinica.farmacia.eventos;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

import com.clinica.farmacia.service.SagaCompensacion;
import com.clinica.farmacia.service.VentaService;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

@Component
public class EventoListener {
    private static final Logger log = LoggerFactory.getLogger(EventoListener.class);

    private final VentaService ventaService;
    private final SagaCompensacion sagaCompensacion;
    private final XmlMapper xmlMapper = new XmlMapper();

    public EventoListener(VentaService ventaService, SagaCompensacion sagaCompensacion) {
        this.ventaService = ventaService;
        this.sagaCompensacion = sagaCompensacion;
    }

    @JmsListener(destination = "topic.PagoConfirmado")
    public void onPagoConfirmado(String payload) {
        Evento evento = parsear(payload);
        procesar(() -> ventaService.confirmarPago(evento.getCodigoVenta()), evento, "confirmar pago");
    }

    @JmsListener(destination = "topic.PagoFallido")
    public void onPagoFallido(String payload) {
        Evento evento = parsear(payload);
        procesar(() -> sagaCompensacion.compensarVenta(evento.getCodigoVenta(), "Pago rechazado por el proveedor"), evento, "compensar venta");
    }

    private Evento parsear(String payload) {
        try {
            return xmlMapper.readValue(payload, Evento.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Evento JMS XML inválido", e);
        }
    }

    private void procesar(Runnable accion, Evento evento, String operacion) {
        try {
            accion.run();
        } catch (Exception e) {
            log.error("Error al {} para la venta {}", operacion, evento.getCodigoVenta(), e);
        }
    }
}
