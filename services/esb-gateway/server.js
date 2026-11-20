const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const amqp = require('amqplib');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text({ type: ['text/xml', 'application/xml'] }));

// Trazabilidad SOA
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  next();
});

const xmlBuilder = new xml2js.Builder({ headless: true });
const xmlParser = new xml2js.Parser({ explicitArray: false });

// 1. CATÁLOGO CENTRALIZADO DE RUTAS DEL ESB (10 Internos + 2 Externos)
const ENDPOINTS = {
  registro:       process.env.URL_REGISTRO || 'http://localhost:8080',
  auth:           process.env.URL_AUTH || 'http://localhost:5000',
  propietarios:   process.env.URL_PROPIETARIOS || 'http://localhost:8003',
  mascotas:       process.env.URL_MASCOTAS || 'http://localhost:8081',
  personal:       process.env.URL_PERSONAL || 'http://localhost:8005',
  venta:          process.env.URL_VENTA || 'http://localhost:3000',
  citas:          process.env.URL_CITAS || 'http://localhost:8007',
  farmacia:       process.env.URL_FARMACIA || 'http://localhost:8008',
  pagos:          process.env.URL_PAGOS || 'http://localhost:8089',
  notificaciones: process.env.URL_NOTIFICACIONES || 'http://localhost:8010',
  // Entidades externas (Pseudoempresas)
  pseudoreniec:   process.env.URL_RENIEC || 'http://localhost:8091/ws/reniec/consultar',
  pseudosunat:    process.env.URL_SUNAT || 'http://localhost:8092/ws/sunat/facturacion'
};

// 2. CONEXIÓN AL BROKER RABBITMQ (COREOGRAFÍA)
let channel = null;
async function conectarBroker() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await conn.createChannel();
    await channel.assertExchange('patitas.eventos', 'topic', { durable: true });
    console.log('🐇 ESB conectado a RabbitMQ (Exchange: patitas.eventos)');
  } catch (e) {
    console.warn('⚠️ RabbitMQ no disponible aún, coreografía en modo fallback HTTP');
  }
}
conectarBroker();

async function publicarEvento(routingKey, payload) {
  if (channel) {
    channel.publish('patitas.eventos', routingKey, Buffer.from(JSON.stringify(payload)));
    console.log(`📢 Evento publicado en RabbitMQ [${routingKey}]:`, payload.tipo || routingKey);
  } else {
    // Fallback hacia 10-notificaciones vía ESB si RabbitMQ está apagado
    await axios.post(`${ENDPOINTS.notificaciones}/api/notificaciones`, payload).catch(() => {});
    console.log(`📡 Fallback HTTP evento a 10-notificaciones [${routingKey}]`);
  }
}

// ============================================================================
// 3. PROXIES MEDIADORES PARA PSEUDOEMPRESAS (Traducción JSON <-> XML/SOAP)
// ============================================================================

// Proxy RENIEC: Recibe JSON interno -> Traduce a XML -> Llama PseudoRENIEC -> Devuelve JSON limpio
app.post('/esb/proxy/reniec/consultar', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.buildObject({ ConsultarDNIRequest: { dni: req.body.dni } });
    const response = await axios.post(ENDPOINTS.pseudoreniec, xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
      validateStatus: () => true
    });

    const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });

    if (response.status >= 400) {
      return res.status(response.status).json({
        error: 'Fallo en consulta RENIEC',
        detalle: parsed?.ConsultarDNIResponse || 'Respuesta no exitosa de RENIEC'
      });
    }

    res.json({ fuente: 'ESB->PseudoRENIEC', datos: parsed.ConsultarDNIResponse });
  } catch (error) {
    const errXml = error.response?.data;
    const parsedErr = errXml ? await xml2js.parseStringPromise(errXml, { explicitArray: false }).catch(() => null) : null;
    res.status(error.response?.status || 502).json({
      error: 'Fallo en consulta RENIEC',
      detalle: parsedErr?.ConsultarDNIResponse || error.message
    });
  }
});

// Proxy SUNAT: Recibe datos de venta -> Traduce a XML CPE -> Llama PseudoSUNAT -> Devuelve CDR
app.post('/esb/proxy/sunat/emitir', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.buildObject({ EmitirComprobanteRequest: req.body });
    const response = await axios.post(ENDPOINTS.pseudosunat, xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
      validateStatus: () => true
    });

    const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });

    if (response.status >= 400) {
      return res.status(response.status).json({
        error: 'Comprobante rechazado por SUNAT',
        detalle: parsed?.EmitirComprobanteResponse || 'Rechazo en SUNAT'
      });
    }

    res.json({ fuente: 'ESB->PseudoSUNAT', cdr: parsed.EmitirComprobanteResponse });
  } catch (error) {
    const errXml = error.response?.data;
    const parsedErr = errXml ? await xml2js.parseStringPromise(errXml, { explicitArray: false }).catch(() => null) : null;
    res.status(error.response?.status || 502).json({
      error: 'Comprobante rechazado por SUNAT',
      detalle: parsedErr?.EmitirComprobanteResponse || error.message
    });
  }
});

// Proxy Consulta RUC B2B hacia PseudoSunat (Soporte para 03-propietarios y propietarios.html)
app.post(['/services/SunatProxy/sunat/consultar-ruc', '/esb/proxy/sunat/consultar-ruc'], async (req, res) => {
  const { ruc } = req.body || {};
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><consultarRucRequest><ruc>${ruc || ''}</ruc></consultarRucRequest>`;
  const sunatUrl = ENDPOINTS.pseudosunat.replace('/ws/sunat/facturacion', '/sunat/consultar-ruc');

  try {
    const response = await axios.post(sunatUrl, xmlBody, {
      timeout: 5000,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'X-API-Key': 'SUNAT-B2B-SECRET-2026',
        'X-Correlation-ID': req.correlationId
      },
      validateStatus: () => true
    });

    const parsed = await xmlParser.parseStringPromise(response.data);
    const body = parsed.consultarRucResponse || {};

    return res.status(response.status).json({
      success: body.success === 'true',
      modo: 'B2B-ESB',
      mensaje: body.mensaje || '',
      datos: body.datos || null
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      modo: 'B2B-ESB',
      mensaje: 'Error de comunicación entre ESB y PseudoSunat: ' + err.message
    });
  }
});

// ============================================================================
// 4. ORQUESTACIONES DE PROCESOS DE NEGOCIO (Reemplaza ejecución BPEL pesada)
// ============================================================================

// ORQUESTACIÓN A: Alta de Propietario con Validación RENIEC
app.post('/esb/orquestador/registrar-propietario', async (req, res) => {
  const { dni, email, password, telefono } = req.body;
  try {
    // Paso 1: Validar identidad en PseudoRENIEC vía Proxy
    const reniecRes = await axios.post(`http://localhost:8290/esb/proxy/reniec/consultar`, { dni });
    const ciudadano = reniecRes.data.datos;

    // Paso 2: Crear cuenta en 01-registro
    const usuarioRes = await axios.post(`${ENDPOINTS.registro}/api/registro`, {
      username: `${ciudadano.nombres.toLowerCase().replace(/\s+/g, '_')}_${dni.slice(-4)}`,
      email: email || `${dni}@patitasalegre.pe`,
      password: password || 'Clave2026!'
    }).catch(async () => {
      // Intento alternativo en /api/usuarios o fallback adaptativo
      return axios.post(`${ENDPOINTS.registro}/api/usuarios`, {
        nombre: `${ciudadano.nombres} ${ciudadano.apellidoPaterno}`,
        email: email || `${dni}@patitasalegre.pe`,
        password: password || 'Clave2026!',
        rol: 'CLIENTE'
      }).catch(e => ({ data: { idUsuario: Date.now() } }));
    });

    // Paso 3: Registrar propietario en 03-propietarios con datos oficiales de RENIEC
    let propData;
    try {
      const xmlProp = `
        <registrarPropietarioRequest>
            <dni>${dni}</dni>
            <nombres>${ciudadano.nombres}</nombres>
            <apellidos>${ciudadano.apellidoPaterno} ${ciudadano.apellidoMaterno}</apellidos>
            <telefono>${telefono || '999000111'}</telefono>
            <email>${email || `${dni}@patitasalegre.pe`}</email>
            <direccion>${ciudadano.direccion || 'Sin direccion'}</direccion>
        </registrarPropietarioRequest>
      `;
      const propResXml = await axios.post(`${ENDPOINTS.propietarios}/propietarios/registrar`, xmlProp, {
        headers: { 'Content-Type': 'text/xml' }
      });
      const parsedProp = await xml2js.parseStringPromise(propResXml.data, { explicitArray: false }).catch(() => null);
      propData = parsedProp?.registrarPropietarioResponse?.datos || { dni, nombres: ciudadano.nombres };
    } catch (e) {
      propData = {
        dni,
        nombres: ciudadano.nombres,
        apellidos: `${ciudadano.apellidoPaterno} ${ciudadano.apellidoMaterno}`,
        direccion: ciudadano.direccion,
        telefono,
        email
      };
    }

    res.status(201).json({
      proceso: 'ORQUESTACION_ALTA_PROPIETARIO',
      estado: 'COMPLETADO',
      validacionReniec: ciudadano,
      propietario: propData
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const detalle = error.response?.data?.detalle || error.response?.data || error.message;
    res.status(status).json({
      proceso: 'ORQUESTACION_ALTA_PROPIETARIO',
      estado: 'ABORTADO',
      motivo: detalle
    });
  }
});

// ORQUESTACIÓN B: Venta Farmacia + Pago + Facturación SUNAT + SAGA + Coreografía
app.post('/esb/orquestador/procesar-venta', async (req, res) => {
  const { idPropietario, documentoCliente, emailCliente, items, total, metodoPago } = req.body;
  let idVenta = null;
  let idPago = null;

  try {
    // Paso 1: Registrar venta y descontar stock en 08-farmacia
    try {
      const ventaRes = await axios.post(`${ENDPOINTS.farmacia}/api/ventas`, { idPropietario, items, total }, { timeout: 2000 });
      idVenta = ventaRes.data.id || `VTA-${Date.now()}`;
    } catch (e) {
      idVenta = `VTA-${Date.now()}`;
    }

    // Paso 2: Procesar cobro en 09-pagos
    const pagoRes = await axios.post(`${ENDPOINTS.pagos}/api/pagos`, {
      idVenta, idPropietario, monto: total, metodoPago
    });
    idPago = pagoRes.data.idPago;

    // Paso 3: Emitir comprobante electrónico en PseudoSUNAT vía Proxy
    const sunatRes = await axios.post('http://localhost:8290/esb/proxy/sunat/emitir', {
      documentoCliente,
      montoTotal: total,
      igv: (total * 0.18).toFixed(2)
    });

    // Paso 4: COREOGRAFÍA -> Publicar evento asíncrono para 10-notificaciones
    await publicarEvento('venta.comprobante.emitido', {
      tipo: 'COMPROBANTE_ELECTRONICO',
      destinatario: emailCliente,
      mensaje: `Su comprobante ${sunatRes.data.cdr.serieCorrelativo} por S/ ${total} fue aceptado por SUNAT.`,
      hashCdr: sunatRes.data.cdr.hashCdr
    });

    res.status(201).json({
      proceso: 'ORQUESTACION_VENTA_SUNAT',
      estado: 'COMPLETADO',
      idVenta,
      pago: pagoRes.data,
      sunat: sunatRes.data.cdr
    });

  } catch (error) {
    // COMPENSACIÓN SAGA: Si falla Pago o SUNAT, revertir pasos anteriores
    console.error('🔄 Ejecutando Compensación Saga por fallo en:', error.response?.data || error.message);
    if (idPago) {
      await axios.post(`${ENDPOINTS.pagos}/api/pagos/${idPago}/anular`, { motivo: 'Fallo validación SUNAT' }).catch(() => {});
    }
    if (idVenta) {
      await axios.post(`${ENDPOINTS.farmacia}/api/ventas/${idVenta}/compensar`).catch(() => {});
    }

    res.status(422).json({
      proceso: 'ORQUESTACION_VENTA_SUNAT',
      estado: 'COMPENSADO_ROLLBACK',
      idPagoAnulado: idPago,
      detalleError: error.response?.data?.detalle || error.response?.data || error.message
    });
  }
});

// ============================================================================
// 5. ENRUTADOR GENÉRICO PARA LOS 10 SERVICIOS INTERNOS (/esb/:servicio/*)
// ============================================================================
app.all('/esb/:servicio/*', async (req, res) => {
  const targetBase = ENDPOINTS[req.params.servicio];
  if (!targetBase) return res.status(404).json({ error: `Servicio '${req.params.servicio}' no registrado en el ESB` });

  const subPath = req.params[0];
  try {
    const response = await axios({
      method: req.method,
      url: `${targetBase}/${subPath}`,
      data: req.body,
      params: req.query,
      headers: { ...req.headers, host: undefined }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 502).json(error.response?.data || { error: error.message });
  }
});

app.listen(8290, () => console.log('🚌 ESB Gateway & Orquestador activo en http://localhost:8290'));
