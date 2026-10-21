<?php

namespace App\Validators;

use InvalidArgumentException;

class PropietarioValidator
{
    public static function validarRegistro(array $datos): void
    {
        if (empty($datos['dni'])) {
            throw new InvalidArgumentException('El DNI es obligatorio');
        }
        if (!preg_match('/^\d{8}$/', (string) $datos['dni'])) {
            throw new InvalidArgumentException('El DNI debe tener exactamente 8 dígitos');
        }
        if (empty($datos['nombres'])) {
            throw new InvalidArgumentException('Los nombres son obligatorios');
        }
        if (empty($datos['apellidos'])) {
            throw new InvalidArgumentException('Los apellidos son obligatorios');
        }
        if (!empty($datos['email']) && !filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('El email no tiene formato válido');
        }
        if (!empty($datos['telefono']) && !preg_match('/^\d{6,15}$/', (string) $datos['telefono'])) {
            throw new InvalidArgumentException('El teléfono debe tener entre 6 y 15 dígitos');
        }
    }

    public static function validarConsulta(array $datos): void
    {
        if (empty($datos['dni'])) {
            throw new InvalidArgumentException('El DNI es obligatorio para consultar');
        }
        if (!preg_match('/^\d{8}$/', (string) $datos['dni'])) {
            throw new InvalidArgumentException('El DNI debe tener exactamente 8 dígitos');
        }
    }
}
