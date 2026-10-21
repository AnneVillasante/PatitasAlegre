<?php

namespace App\Controllers;

use App\Services\PropietarioService;
use App\Validators\PropietarioValidator;
use App\Xml\XmlBuilder;
use App\Xml\XmlParser;
use InvalidArgumentException;
use RuntimeException;

class PropietarioController
{
    private PropietarioService $service;

    public function __construct()
    {
        $this->service = new PropietarioService();
    }

    public function registrar(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            PropietarioValidator::validarRegistro($datos);
            return XmlBuilder::exito(
                'registrarPropietarioResponse',
                $this->service->registrar($datos)
            );
        }, 'registrarPropietarioResponse');
    }

    public function consultar(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            PropietarioValidator::validarConsulta($datos);
            return XmlBuilder::exito(
                'consultarPropietarioResponse',
                $this->service->consultar($datos['dni'])
            );
        }, 'consultarPropietarioResponse');
    }

    public function listar(): void
    {
        $this->responder(function (): string {
            return XmlBuilder::lista(
                'listarPropietariosResponse',
                'propietario',
                $this->service->listar()
            );
        }, 'listarPropietariosResponse');
    }

    public function actualizar(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            PropietarioValidator::validarRegistro($datos);
            return XmlBuilder::exito(
                'actualizarPropietarioResponse',
                $this->service->actualizar($datos)
            );
        }, 'actualizarPropietarioResponse');
    }

    public function eliminar(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            PropietarioValidator::validarConsulta($datos);
            return XmlBuilder::exito(
                'eliminarPropietarioResponse',
                $this->service->eliminar($datos['dni'])
            );
        }, 'eliminarPropietarioResponse');
    }

    private function responder(callable $logica, string $rootName): void
    {
        header('Content-Type: text/xml; charset=utf-8');

        try {
            echo $logica();
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo XmlBuilder::error($rootName, 'ERROR-VALIDACION', $e->getMessage());
        } catch (RuntimeException $e) {
            http_response_code(404);
            echo XmlBuilder::error($rootName, 'ERROR-NEGOCIO', $e->getMessage());
        } catch (\Throwable $e) {
            http_response_code(500);
            echo XmlBuilder::error($rootName, 'ERROR-INTERNO', 'Error interno del servidor');
            error_log($e->getMessage());
        }
    }
}
