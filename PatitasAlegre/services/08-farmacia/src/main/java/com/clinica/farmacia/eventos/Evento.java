package com.clinica.farmacia.eventos;

import java.io.Serializable;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "Evento")
public class Evento implements Serializable {
    private static final long serialVersionUID = 1L;

    private String tipo;
    private String codigoVenta;
    private Long idPropietario;

    public Evento() {
    }

    public Evento(String tipo, String codigoVenta, Long idPropietario) {
        this.tipo = tipo;
        this.codigoVenta = codigoVenta;
        this.idPropietario = idPropietario;
    }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getCodigoVenta() { return codigoVenta; }
    public void setCodigoVenta(String codigoVenta) { this.codigoVenta = codigoVenta; }
    public Long getIdPropietario() { return idPropietario; }
    public void setIdPropietario(Long idPropietario) { this.idPropietario = idPropietario; }
}
