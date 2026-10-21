package com.clinica.farmacia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EsbClient {

    @Value("${esb.url}")
    private String esbUrl;

    private final RestTemplate restTemplate;

    public EsbClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String enviar(String proxyName, String xmlPayload, String soapAction) {
        String url = esbUrl.replaceAll("/$", "") + "/" + proxyName;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);
        headers.set("SOAPAction", soapAction);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(xmlPayload, headers),
                    String.class
            );
            return response.getBody() == null ? "" : response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error al comunicarse con el ESB (" + proxyName + "): " + e.getMessage(), e);
        }
    }
}
