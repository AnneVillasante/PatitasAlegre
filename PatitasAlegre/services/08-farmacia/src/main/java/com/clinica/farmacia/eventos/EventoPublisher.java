package com.clinica.farmacia.eventos;

import com.clinica.farmacia.entity.Venta;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

@Component
public class EventoPublisher {

    private final JmsTemplate jmsTemplate;

    public EventoPublisher(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public void publicarVentaIniciada(Venta venta) {
        publicar("topic.VentaIniciada", new Evento("VentaIniciada", venta.getCodigoVenta(), venta.getIdPropietario()));
    }

    public void publicarVentaCompletada(Venta venta) {
        publicar("topic.VentaCompletada", new Evento("VentaCompletada", venta.getCodigoVenta(), venta.getIdPropietario()));
    }

    public void publicarVentaCancelada(Venta venta, String motivo) {
        publicar("topic.VentaCancelada", new Evento("VentaCancelada", venta.getCodigoVenta(), venta.getIdPropietario()));
    }

    private void publicar(String destino, Evento evento) {
        jmsTemplate.convertAndSend(destino, evento);
    }
}
