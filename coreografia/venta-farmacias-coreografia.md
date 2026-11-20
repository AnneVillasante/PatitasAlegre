# 💊 Coreografía y Patrón Saga: Venta de Farmacia y Facturación SUNAT

Este flujo implementa el patrón **Saga con Compensación** orquestado por el **ESB Gateway**, junto con coreografía de eventos asíncrona mediante **RabbitMQ** (`patitas.eventos`).

---

## 🔄 1. Diagrama de Secuencia: Flujo Feliz

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente / Farmacia UI
    participant ESB as ESB Gateway / Orquestador (:8290)
    participant Farm as 08-farmacia (:8008)
    participant Pagos as 09-pagos (:8089)
    participant Sunat as PseudoSUNAT (:8092)
    participant Rabbit as RabbitMQ (patitas.eventos)
    participant Notif as 10-notificaciones

    Cliente->>ESB: POST /esb/orquestador/procesar-venta (JSON)
    ESB->>Farm: POST /api/ventas (Descuenta stock)
    Farm-->>ESB: 201 Created (idVenta)
    ESB->>Pagos: POST /api/pagos (Registra cobro)
    Pagos-->>ESB: 201 Created (idPago: COMPLETADO)
    ESB->>Sunat: POST /esb/proxy/sunat/emitir (XML CPE)
    Sunat-->>ESB: 200 OK (CDR Aceptado, F001-00001234)
    ESB->>Rabbit: Publica evento [venta.comprobante.emitido]
    Rabbit->>Notif: Entrega a cola.notificaciones
    Notif->>Notif: Registra notificación de comprobante emitido
    ESB-->>Cliente: 201 Created (COMPLETADO, Serie, Hash CDR)
```

---

## ⚠️ 2. Diagrama de Secuencia: Compensación Saga (Rollback en Vivo)

Si el cliente envía un RUC en estado **BAJA DEFINITIVA** (ej. `20000000001`) o el servicio de SUNAT rechaza el comprobante:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente / Farmacia UI
    participant ESB as ESB Gateway / Orquestador (:8290)
    participant Farm as 08-farmacia (:8008)
    participant Pagos as 09-pagos (:8089)
    participant Sunat as PseudoSUNAT (:8092)

    Cliente->>ESB: POST /esb/orquestador/procesar-venta (RUC 20000000001)
    ESB->>Farm: POST /api/ventas (Reserva stock)
    Farm-->>ESB: idVenta
    ESB->>Pagos: POST /api/pagos (Cobra total)
    Pagos-->>ESB: idPago: COMPLETADO
    ESB->>Sunat: POST /esb/proxy/sunat/emitir
    Sunat-->>ESB: 422 Unprocessable Entity (RECHAZADO: RUC BAJA DEFINITIVA)
    
    Note over ESB: 🔄 INICIA COMPENSACIÓN SAGA
    ESB->>Pagos: POST /api/pagos/{idPago}/anular
    Pagos-->>ESB: Estado: ANULADO_POR_COMPENSACION
    ESB->>Farm: POST /api/ventas/{idVenta}/compensar (Devuelve stock)
    Farm-->>ESB: Stock restaurado
    ESB-->>Cliente: 422 Unprocessable (COMPENSADO_ROLLBACK)
```

---

## 📋 3. Contrato del Evento publicado en RabbitMQ

- **Routing Key:** `venta.comprobante.emitido`
- **Payload:**
```json
{
  "tipo": "COMPROBANTE_ELECTRONICO",
  "destinatario": "cliente@patitasalegre.pe",
  "mensaje": "Su comprobante F001-00001234 por S/ 150.00 fue aceptado por SUNAT.",
  "hashCdr": "cpe-hash-a1b2c3d4e5f67890"
}
```
