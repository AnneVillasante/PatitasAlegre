<?php

namespace App\Controllers;

use App\Services\CitaService;
use App\Validators\CitaValidator;
use App\Xml\XmlBuilder;
use App\Xml\XmlParser;
use InvalidArgumentException;
use RuntimeException;

class CitaController
{
    private CitaService $service;

    public function __construct()
    {
        $this->service = new CitaService();
    }

    public function crear(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            CitaValidator::validarRegistro($datos);
            return XmlBuilder::exito('crearCitaResponse', $this->service->crear($datos));
        }, 'crearCitaResponse');
    }

    public function consultar(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            CitaValidator::validarConsulta($datos);
            return XmlBuilder::exito(
                'consultarCitaResponse',
                $this->service->consultar($datos['codigo_cita'])
            );
        }, 'consultarCitaResponse');
    }

    public function listarPorPropietario(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            CitaValidator::validarListado($datos);
            return XmlBuilder::lista(
                'listarCitasResponse',
                'cita',
                $this->service->listarPorPropietario((int) $datos['id_propietario'])
            );
        }, 'listarCitasResponse');
    }

    public function cancelar(): void
    {
        $this->responder(function (): string {
            $datos = XmlParser::parsear((string) file_get_contents('php://input'));
            CitaValidator::validarCancelacion($datos);
            return XmlBuilder::exito(
                'cancelarCitaResponse',
                $this->service->cancelar($datos)
            );
        }, 'cancelarCitaResponse');
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
            http_response_code(409);
            echo XmlBuilder::error($rootName, 'ERROR-NEGOCIO', $e->getMessage());
        } catch (\Throwable $e) {
            http_response_code(500);
            echo XmlBuilder::error($rootName, 'ERROR-INTERNO', 'Error interno del servidor');
            error_log($e->getMessage());
        }
    }
}
