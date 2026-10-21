package com.clinica.farmacia.xml;

import org.springframework.stereotype.Component;

import com.clinica.farmacia.dto.VentaDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

@Component
public class XmlParser {

    private final XmlMapper xmlMapper = new XmlMapper();

    public VentaDTO parsearVentaRequest(String xmlString) {
        try {
            return xmlMapper.readValue(xmlString, VentaDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error al parsear XML de venta: " + e.getOriginalMessage(), e);
        }
    }
}
