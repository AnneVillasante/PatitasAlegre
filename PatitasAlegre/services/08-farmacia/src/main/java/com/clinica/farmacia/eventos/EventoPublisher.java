package com.clinica.farmacia.eventos;

import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

import com.clinica.farmacia.entity.Venta;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

@Component
public class EventoPublisher {

    private final JmsTemplate jmsTemplate;
    private final XmlMapper xmlMapper = new XmlMapper();

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
        try {
            String payload = xmlMapper.writeValueAsString(evento);
            jmsTemplate.send(destino, session -> session.createTextMessage(payload));
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo publicar el evento " + evento.getTipo(), e);
        }
    }
}
