<?php

namespace Tests;

use App\Validators\NotificacionValidator;
use App\Xml\XmlBuilder;
use App\Xml\XmlParser;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class NotificacionTest extends TestCase
{
    public function testRechazaDestinatarioInvalido(): void
    {
        $validator = new NotificacionValidator();
        $this->expectException(InvalidArgumentException::class);
        $validator->validarEnvio([
            'idPropietario' => '105',
            'destinatario' => 'correo-invalido',
            'canal' => 'EMAIL',
            'tipo' => 'COMPROBANTE_VENTA',
            'mensaje' => 'Hola',
        ]);
    }

    public function testConstruyeYParseaXml(): void
    {
        $builder = new XmlBuilder();
        $parser = new XmlParser();
        $xml = $builder->buildSuccess('testResponse', [
            'codigo' => 'NOT-2026-ABC123',
            'estado' => 'OK',
            'mensaje' => 'A & B',
        ]);
        $datos = $parser->parsear($xml);
        self::assertSame('NOT-2026-ABC123', $datos['codigo']);
        self::assertSame('OK', $datos['estado']);
        self::assertSame('A & B', $datos['mensaje']);
    }
}
