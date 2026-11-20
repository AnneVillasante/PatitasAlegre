const express = require('express');
const xml2js = require('xml2js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.text({ type: ['text/xml', 'application/xml'] }));
app.use(express.json());

// Base de datos aislada de ciudadanos (RENIEC)
const ciudadanos = {
  "72345678": { nombres: "JUAN CARLOS", apellidoPaterno: "PEREZ", apellidoMaterno: "GOMEZ", estado: "ACTIVO", direccion: "AV. EJERCITO 102, AREQUIPA" },
  "45678912": { nombres: "MARIA ELENA", apellidoPaterno: "TORRES", apellidoMaterno: "QUISPE", estado: "ACTIVO", direccion: "CALLE MERCADERES 305, AREQUIPA" },
  "00000000": { nombres: "CARLOS", apellidoPaterno: "LOPEZ", apellidoMaterno: "RUIZ", estado: "FALLECIDO", direccion: "SIN DIRECCION" } // Para probar rechazo
};

const builder = new xml2js.Builder({ rootName: 'ConsultarDNIResponse', headless: true });

// Endpoint SOAP/XML estándar de RENIEC
app.post('/ws/reniec/consultar', async (req, res) => {
  try {
    let dni = req.body?.dni;
    if (typeof req.body === 'string') {
      const parsed = await xml2js.parseStringPromise(req.body, { explicitArray: false });
      dni = parsed?.ConsultarDNIRequest?.dni;
    }

    const persona = ciudadanos[dni];
    res.set('Content-Type', 'application/xml');

    if (!persona) {
      return res.status(404).send(builder.buildObject({ codigo: "404", mensaje: "DNI no encontrado en padrón RENIEC" }));
    }
    if (persona.estado !== "ACTIVO") {
      return res.status(422).send(builder.buildObject({ codigo: "422", mensaje: `Ciudadano en estado ${persona.estado}` }));
    }

    return res.status(200).send(builder.buildObject({ codigo: "0000", dni, ...persona }));
  } catch (err) {
    res.status(400).send(builder.buildObject({ codigo: "400", mensaje: "XML malformado" }));
  }
});

app.listen(8091, () => console.log('🏛️ PseudoRENIEC externo corriendo en puerto 8091'));
