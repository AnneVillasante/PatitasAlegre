<?php

namespace App\Services;

use App\Models\Notificacion;
use App\Validators\NotificacionValidator;
use RuntimeException;

class NotificacionService
{
    private NotificacionValidator $validator;
    private EmailService $emailService;
    private SmsService $smsService;

    public function __construct()
    {
        $this->validator = new NotificacionValidator();
        $this->emailService = new EmailService();
        $this->smsService = new SmsService();
    }

    public function procesar(array $datos): Notificacion
    {
        $this->validator->validarEnvio($datos);
        $canal = strtoupper($datos['canal']);
        $notificacion = new Notificacion();
        $notificacion->codigo = $this->generarCodigo();
        $notificacion->idPropietario = (int) $datos['idPropietario'];
        $notificacion->idPlantilla = isset($datos['idPlantilla']) ? (int) $datos['idPlantilla'] : null;
        $notificacion->tipo = strtoupper($datos['tipo']);
        $notificacion->destinatario = $datos['destinatario'];
        $notificacion->canal = $canal;
        $notificacion->asunto = $datos['asunto'] ?? 'Notificación Clínica';
        $notificacion->mensaje = $datos['mensaje'];
        $notificacion->estado = 'PENDIENTE';
        $notificacion->guardar();

        $notificacion->intentos = 1;
        $enviado = match ($canal) {
            'EMAIL' => $this->emailService->enviar($notificacion->destinatario, $notificacion->asunto, $notificacion->mensaje),
            'SMS' => $this->smsService->enviar($notificacion->destinatario, $notificacion->mensaje),
            'AMBOS' => $this->emailService->enviar($notificacion->destinatario, $notificacion->asunto, $notificacion->mensaje)
                && $this->smsService->enviar($notificacion->destinatario, $notificacion->mensaje),
            default => false,
        };

        $notificacion->estado = $enviado ? 'ENVIADO' : 'FALLIDO';
        $notificacion->errorMensaje = $enviado ? null : 'No se pudo entregar por el canal configurado';
        $notificacion->fechaEnvio = date('Y-m-d H:i:s');
        $notificacion->guardar();
        return $notificacion;
    }

    public function buscar(string $codigo): Notificacion
    {
        $notificacion = Notificacion::buscarPorCodigo($codigo);
        if ($notificacion === null) {
            throw new RuntimeException('Notificación no encontrada');
        }
        return $notificacion;
    }

    public function procesarEvento(array $evento): ?Notificacion
    {
        $tipo = $evento['tipo'] ?? null;
        $codigoVenta = $evento['codigoVenta'] ?? 'N/A';
        $idPropietario = $evento['idPropietario'] ?? null;
        if (!$tipo || !$idPropietario) {
            throw new RuntimeException('Evento sin tipo o propietario');
        }

        $datos = [
            'idPropietario' => $idPropietario,
            'destinatario' => $evento['destinatario'] ?? "cliente_{$idPropietario}@clinica.pe",
            'canal' => 'EMAIL',
            'tipo' => $tipo === 'VentaCancelada' ? 'CANCELACION' : 'COMPROBANTE_VENTA',
            'asunto' => $tipo === 'VentaCancelada' ? "Cancelación de Venta {$codigoVenta}" : "Comprobante de Venta {$codigoVenta}",
            'mensaje' => $tipo === 'VentaCancelada'
                ? "No fue posible procesar su pago. La venta {$codigoVenta} ha sido revertida."
                : "Su pago ha sido procesado exitosamente. La orden {$codigoVenta} está lista para retiro.",
        ];

        return $this->procesar($datos);
    }

    private function generarCodigo(): string
    {
        return 'NOT-' . date('Y') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    }
}
