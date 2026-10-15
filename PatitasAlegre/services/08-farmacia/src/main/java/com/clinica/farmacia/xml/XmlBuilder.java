package com.clinica.farmacia.xml;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class XmlBuilder {

    private final XmlMapper xmlMapper = new XmlMapper();

    public String buildSuccess(String rootName, Map<String, Object> data) {
        return serialize(rootName, data);
    }

    public String buildError(String rootName, String codigo, String mensaje) {
        return serialize(rootName, Map.of(
                "codigo", codigo,
                "estado", "FALLIDO",
                "mensaje", mensaje == null ? "Error desconocido" : mensaje
        ));
    }

    private String serialize(String rootName, Map<String, Object> data) {
        try {
            return xmlMapper.writer().withRootName(rootName).writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Error al construir XML: " + e.getOriginalMessage(), e);
        }
    }
}
