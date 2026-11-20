const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Almacenamiento en memoria/BD para pagos (conecta aquí tu pool MySQL de database.sql si deseas persistencia)
const pagos = new Map();

app.get('/health', (_, res) => res.json({ status: 'UP', service: '09-pagos' }));

// Registrar pago
app.post('/api/pagos', (req, res) => {
  const { idVenta, idPropietario, monto, metodoPago } = req.body;
  if (!idVenta || !monto || monto <= 0) {
    return res.status(400).json({ error: 'Datos de pago inválidos' });
  }
  const idPago = `PAG-${Date.now()}`;
  const registro = { idPago, idVenta, idPropietario, monto, metodoPago: metodoPago || 'TARJETA', estado: 'COMPLETADO' };
  pagos.set(idPago, registro);
  res.status(201).json(registro);
});

// Compensación Saga: Anular pago si falla SUNAT
app.post('/api/pagos/:idPago/anular', (req, res) => {
  const pago = pagos.get(req.params.idPago);
  if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
  pago.estado = 'ANULADO_POR_COMPENSACION';
  pago.motivoAnulacion = req.body?.motivo || 'Rechazo de comprobante en SUNAT';
  res.json(pago);
});

app.listen(8089, () => console.log('💳 Servicio 09-pagos corriendo en puerto 8089'));
