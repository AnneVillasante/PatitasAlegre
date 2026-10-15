<?php

namespace App\Eventos;

use App\Services\NotificacionService;
use App\Xml\XmlParser;
use Stomp\Client;
use Stomp\StatefulStomp;
use Throwable;

class EventoListener
{
    private StatefulStomp $stomp;
    private NotificacionService $service;
    private XmlParser $parser;

    public function __construct()
    {
        $client = new Client($_ENV['ACTIVEMQ_BROKER_URL'] ?? 'tcp://127.0.0.1:61613');
        $client->setLogin($_ENV['ACTIVEMQ_USER'] ?? 'admin', $_ENV['ACTIVEMQ_PASSWORD'] ?? 'admin');
        $this->stomp = new StatefulStomp($client);
        $this->service = new NotificacionService();
        $this->parser = new XmlParser();
    }

    public function escuchar(): void
    {
        $this->stomp->subscribe('/topic/topic.VentaCompletada', 'notificaciones-venta-completada', 'auto');
        $this->stomp->subscribe('/topic/topic.VentaCancelada', 'notificaciones-venta-cancelada', 'auto');

        echo "[*] Notificaciones escuchando eventos ActiveMQ...\n";
        while (true) {
            $message = $this->stomp->read();
            if ($message === null) {
                usleep(200000);
                continue;
            }

            try {
                $evento = $this->parser->parsear($message->getBody());
                $tipo = $evento['tipo'] ?? null;
                if (in_array($tipo, ['VentaCompletada', 'VentaCancelada'], true)) {
                    $notificacion = $this->service->procesarEvento($evento);
                    echo "[+] {$tipo} procesado: {$notificacion->codigo}\n";
                }
            } catch (Throwable $e) {
                error_log('Error procesando evento ActiveMQ: ' . $e->getMessage());
            }
        }
    }
}
