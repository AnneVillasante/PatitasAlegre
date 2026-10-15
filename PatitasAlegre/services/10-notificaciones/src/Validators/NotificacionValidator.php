<?php

namespace App\Validators;

use InvalidArgumentException;

class NotificacionValidator
{
    private const TIPOS = [
        'CONFIRMACION_CITA',
        'RECORDATORIO_VACUNA',
        'COMPROBANTE_VENTA',
        'CANCELACION',
        'BIENVENIDA',
        'RESULTADO_LABORATORIO',
    ];

    public function validarEnvio(array $datos): void
    {
        if (empty($datos['idPropietario']) || filter_var($datos['idPropietario'], FILTER_VALIDATE_INT) === false || (int) $datos['idPropietario'] <= 0) {
            throw new InvalidArgumentException('El id del propietario es obligatorio');
        }
        if (empty($datos['destinatario'])) {
            throw new InvalidArgumentException('El destinatario es obligatorio');
        }
        if (empty($datos['canal']) || !in_array(strtoupper($datos['canal']), ['EMAIL', 'SMS', 'AMBOS'], true)) {
            throw new InvalidArgumentException('El canal es inválido. Debe ser EMAIL, SMS o AMBOS');
        }
        if (in_array(strtoupper($datos['canal']), ['EMAIL', 'AMBOS'], true) && !filter_var($datos['destinatario'], FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Formato de correo electrónico inválido');
        }
        if (empty($datos['mensaje'])) {
            throw new InvalidArgumentException('El contenido del mensaje no puede estar vacío');
        }
        if (empty($datos['tipo']) || !in_array(strtoupper($datos['tipo']), self::TIPOS, true)) {
            throw new InvalidArgumentException('El tipo de notificación no es válido');
        }
    }

    public function validarConsulta(array $datos): void
    {
        if (empty($datos['codigo'])) {
            throw new InvalidArgumentException('El código de notificación es obligatorio');
        }
    }
}
