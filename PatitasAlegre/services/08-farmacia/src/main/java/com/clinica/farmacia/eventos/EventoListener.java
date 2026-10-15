package com.clinica.farmacia.eventos;

import com.clinica.farmacia.service.SagaCompensacion;
import com.clinica.farmacia.service.VentaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class EventoListener {
    private static final Logger log = LoggerFactory.getLogger(EventoListener.class);

    private final VentaService ventaService;
    private final SagaCompensacion sagaCompensacion;

    public EventoListener(VentaService ventaService, SagaCompensacion sagaCompensacion) {
        this.ventaService = ventaService;
        this.sagaCompensacion = sagaCompensacion;
    }

    @JmsListener(destination = "topic.PagoConfirmado")
    public void onPagoConfirmado(Evento evento) {
        procesar(() -> ventaService.confirmarPago(evento.getCodigoVenta()), evento, "confirmar pago");
    }

    @JmsListener(destination = "topic.PagoFallido")
    public void onPagoFallido(Evento evento) {
        procesar(() -> sagaCompensacion.compensarVenta(evento.getCodigoVenta(), "Pago rechazado por el proveedor"), evento, "compensar venta");
    }

    private void procesar(Runnable accion, Evento evento, String operacion) {
        try {
            accion.run();
        } catch (Exception e) {
            log.error("Error al {} para la venta {}", operacion, evento.getCodigoVenta(), e);
        }
    }
}
