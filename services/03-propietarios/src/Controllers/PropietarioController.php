<?php

namespace App\Controllers;

use App\Services\PropietarioService;
use App\Services\EsbClient;
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

    /** Delega la consulta B2B de RUC al ESB Gateway (puerto 8290) -> PseudoSunat (puerto 8091). */
    public function consultarRucDemo(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $entrada = json_decode((string) file_get_contents('php://input'), true);
            if (!is_array($entrada)) {
                throw new InvalidArgumentException('Envía un JSON válido con el campo ruc.');
            }
            $ruc = (string) ($entrada['ruc'] ?? '');
            $resEsb = (new EsbClient())->consultarRucSunat($ruc);

            http_response_code($resEsb['httpCode']);
            echo json_encode($resEsb['body'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'modo' => 'B2B-ESB', 'mensaje' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        } catch (\Throwable $e) {
            http_response_code(500);
            error_log($e->getMessage());
            echo json_encode(['success' => false, 'modo' => 'B2B-ESB', 'mensaje' => 'No se pudo procesar la consulta B2B.'], JSON_UNESCAPED_UNICODE);
        }
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
