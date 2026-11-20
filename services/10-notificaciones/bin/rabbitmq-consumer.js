/**
 * Consumidor RabbitMQ para 10-notificaciones
 * Escucha la cola 'cola.notificaciones' suscrita al exchange 'patitas.eventos'
 */
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'patitas.eventos';
const QUEUE_NAME = 'cola.notificaciones';
const ROUTING_KEY = '#'; // Escucha todos los eventos del dominio

async function iniciarConsumidor() {
  try {
    console.log(`🔌 Conectando a RabbitMQ en ${RABBITMQ_URL}...`);
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    // Declarar exchange tipo topic
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Declarar cola durable
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Enlazar cola al exchange con routing key wildcard
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log(`✅ [10-notificaciones] Escuchando en '${QUEUE_NAME}' -> '${EXCHANGE_NAME}' (key: '${ROUTING_KEY}')`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      const routingKey = msg.fields.routingKey;
      const contenidoStr = msg.content.toString();

      try {
        const evento = JSON.parse(contenidoStr);
        console.log(`\n🔔 [NOTIFICACIÓN RECIBIDA] Evento: '${routingKey}'`);
        console.log(`   Tipo:         ${evento.tipo || 'DESCONOCIDO'}`);
        console.log(`   Destinatario: ${evento.destinatario || 'General'}`);
        console.log(`   Mensaje:      ${evento.mensaje || JSON.stringify(evento)}`);
        if (evento.hashCdr) console.log(`   Hash CDR:     ${evento.hashCdr}`);

        // Acknowledge del mensaje
        channel.ack(msg);
      } catch (err) {
        console.error('❌ Error procesando evento JSON:', err.message);
        channel.nack(msg, false, false);
      }
    });

    conn.on('error', (err) => {
      console.error('⚠️ Conexión RabbitMQ error:', err.message);
      setTimeout(iniciarConsumidor, 5000);
    });

    conn.on('close', () => {
      console.warn('⚠️ Conexión RabbitMQ cerrada. Reintentando en 5s...');
      setTimeout(iniciarConsumidor, 5000);
    });

  } catch (err) {
    console.warn(`⚠️ No se pudo conectar a RabbitMQ (${err.message}). Reintentando en 5s...`);
    setTimeout(iniciarConsumidor, 5000);
  }
}

iniciarConsumidor();
