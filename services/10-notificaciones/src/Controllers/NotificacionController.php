<?php

namespace App\Controllers;

use App\Models\Notificacion;
use App\Services\NotificacionService;
use App\Validators\NotificacionValidator;
use App\Xml\XmlBuilder;
use App\Xml\XmlParser;
use InvalidArgumentException;
use RuntimeException;

class NotificacionController
{
    private NotificacionService $service;
    private NotificacionValidator $validator;
    private XmlParser $parser;
    private XmlBuilder $builder;

    public function __construct()
    {
        $this->service = new NotificacionService();
        $this->validator = new NotificacionValidator();
        $this->parser = new XmlParser();
        $this->builder = new XmlBuilder();
    }

    public function enviar(): void
    {
        $this->responder(function (): string {
            $datos = $this->parser->parsear((string) file_get_contents('php://input'));
            $this->validator->validarEnvio($datos);
            $notificacion = $this->service->procesar($datos);
            return $this->builder->buildSuccess('enviarNotificacionResponse', [
                'codigo' => $notificacion->codigo,
                'estado' => $notificacion->estado,
                'destinatario' => $notificacion->destinatario,
                'mensaje' => 'Notificación procesada correctamente',
            ]);
        }, 'enviarNotificacionResponse');
    }

    public function consultar(string $codigo): void
    {
        $this->responder(function () use ($codigo): string {
            $notificacion = $this->service->buscar($codigo);
            return $this->builder->buildSuccess('consultarNotificacionResponse', [
                'codigo' => $notificacion->codigo,
                'idPropietario' => $notificacion->idPropietario,
                'destinatario' => $notificacion->destinatario,
                'canal' => $notificacion->canal,
                'tipo' => $notificacion->tipo,
                'estado' => $notificacion->estado,
                'fechaEnvio' => $notificacion->fechaEnvio ?? 'PENDIENTE',
            ]);
        }, 'consultarNotificacionResponse', 404);
    }

    private function responder(callable $logica, string $rootName, int $businessStatus = 409): void
    {
        header('Content-Type: application/xml; charset=UTF-8');
        try {
            echo $logica();
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo $this->builder->buildError($rootName, 'ERROR-VALIDACION', $e->getMessage());
        } catch (RuntimeException $e) {
            http_response_code($businessStatus);
            echo $this->builder->buildError($rootName, 'ERROR-NEGOCIO', $e->getMessage());
        } catch (\Throwable $e) {
            http_response_code(500);
            echo $this->builder->buildError($rootName, 'ERROR-INTERNO', 'Error interno del servidor');
            error_log($e->getMessage());
        }
    }
}
