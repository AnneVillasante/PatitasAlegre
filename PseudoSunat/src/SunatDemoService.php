<?php
namespace PseudoSunat;

use InvalidArgumentException;

/** Simulador externo B2B de SUNAT (puerto 8091). */
class SunatDemoService
{
    private const PADRON = [
        '20600000001' => [
            'ruc' => '20600000001',
            'razon_social' => 'VETERINARIA HUELLITAS DEL SUR S.A.C. (DEMO)',
            'estado' => 'ACTIVO',
            'condicion' => 'HABIDO',
            'direccion' => 'AV. EJEMPLO 123, AREQUIPA - AREQUIPA',
            'tipo_contribuyente' => 'SOCIEDAD ANONIMA CERRADA',
            'actividad_economica' => 'ACTIVIDADES VETERINARIAS',
            'origen' => 'PADRON SIMULADO'
        ],
        '20100000002' => [
            'ruc' => '20100000002',
            'razon_social' => 'COMERCIAL PATITAS ALEGRES E.I.R.L. (DEMO)',
            'estado' => 'SUSPENSION TEMPORAL',
            'condicion' => 'NO HABIDO',
            'direccion' => 'JR. DEMOSTRACION 456, CERCADO - AREQUIPA',
            'tipo_contribuyente' => 'EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA',
            'actividad_economica' => 'VENTA AL POR MENOR DE ARTICULOS PARA MASCOTAS',
            'origen' => 'PADRON SIMULADO'
        ],
    ];

    public function consultar(string $ruc): array
    {
        $ruc = trim($ruc);
        if (!preg_match('/^\d{11}$/', $ruc)) {
            throw new InvalidArgumentException('El RUC debe contener exactamente 11 dígitos.');
        }
        if (!isset(self::PADRON[$ruc])) {
            return [
                'success' => false,
                'modo' => 'DEMO',
                'mensaje' => 'RUC no encontrado en el padrón de demostración. Prueba con uno de los RUC de ejemplo.',
                'ruc' => $ruc,
                'ejemplos' => array_keys(self::PADRON)
            ];
        }
        return [
            'success' => true,
            'modo' => 'DEMO',
            'mensaje' => 'Consulta simulada correctamente. Estos datos son ficticios y no provienen de SUNAT.',
            'datos' => self::PADRON[$ruc]
        ];
    }
}
