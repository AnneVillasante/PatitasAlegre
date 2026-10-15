<?php

namespace App\Validators;

use DateTime;
use InvalidArgumentException;

class CitaValidator
{
    public static function validarRegistro(array $datos): void
    {
        self::validarEnteroPositivo($datos['idVeterinario'] ?? null, 'El veterinario es obligatorio');
        self::validarEnteroPositivo($datos['idMascota'] ?? null, 'La mascota es obligatoria');

        $esbHabilitado = filter_var($_ENV['ESB_HABILITADO'] ?? 'true', FILTER_VALIDATE_BOOLEAN);
        if ($esbHabilitado && empty($datos['dniPropietario'])) {
            throw new InvalidArgumentException('El DNI del propietario es obligatorio cuando el ESB está habilitado');
        }
        if (!$esbHabilitado && empty($datos['idPropietario'])) {
            throw new InvalidArgumentException('El idPropietario es obligatorio cuando el ESB está deshabilitado');
        }
        if (!$esbHabilitado && !empty($datos['idPropietario'])) {
            self::validarEnteroPositivo($datos['idPropietario'], 'El propietario debe ser un ID positivo');
        }
        if (empty($datos['fecha'])) {
            throw new InvalidArgumentException('La fecha es obligatoria');
        }
        if (empty($datos['hora'])) {
            throw new InvalidArgumentException('La hora es obligatoria');
        }

        $fecha = DateTime::createFromFormat('!Y-m-d', (string) $datos['fecha']);
        $erroresFecha = DateTime::getLastErrors();
        if (!$fecha || ($erroresFecha !== false && ($erroresFecha['warning_count'] > 0 || $erroresFecha['error_count'] > 0))) {
            throw new InvalidArgumentException('La fecha debe tener formato YYYY-MM-DD');
        }
        if ($fecha < new DateTime('today')) {
            throw new InvalidArgumentException('La fecha no puede ser anterior a hoy');
        }

        $hora = (string) $datos['hora'];
        $horaValida = DateTime::createFromFormat('!H:i:s', $hora)
            ?: DateTime::createFromFormat('!H:i', $hora);
        $erroresHora = DateTime::getLastErrors();
        if (!$horaValida || ($erroresHora !== false && ($erroresHora['warning_count'] > 0 || $erroresHora['error_count'] > 0))) {
            throw new InvalidArgumentException('La hora debe tener formato HH:MM o HH:MM:SS');
        }
    }

    public static function validarConsulta(array $datos): void
    {
        if (empty($datos['codigo_cita'])) {
            throw new InvalidArgumentException('El código de cita es obligatorio');
        }
    }

    public static function validarListado(array $datos): void
    {
        self::validarEnteroPositivo($datos['id_propietario'] ?? null, 'El propietario es obligatorio');
    }

    public static function validarCancelacion(array $datos): void
    {
        if (empty($datos['codigo_cita']) && empty($datos['id_cita'])) {
            throw new InvalidArgumentException('Debe indicar código o ID de cita');
        }
        if (isset($datos['id_cita'])) {
            self::validarEnteroPositivo($datos['id_cita'], 'El ID de cita debe ser positivo');
        }
    }

    private static function validarEnteroPositivo($valor, string $mensaje): void
    {
        if ($valor === null || $valor === '' || filter_var($valor, FILTER_VALIDATE_INT) === false || (int) $valor <= 0) {
            throw new InvalidArgumentException($mensaje);
        }
    }
}
