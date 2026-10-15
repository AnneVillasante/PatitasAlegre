<?php

namespace App\Services;

use App\Config\Database;
use App\Models\Cita;
use DateTime;
use PDO;
use RuntimeException;

class CitaService
{
    private EsbClient $esb;

    public function __construct()
    {
        $this->esb = new EsbClient();
    }

    public function crear(array $datos): array
    {
        $propietario = $this->verificarPropietario($datos['dniPropietario']);
        $this->verificarVeterinario($datos['idVeterinario']);
        $this->verificarDisponibilidadHorario($datos['idVeterinario'], $datos['fecha'], $datos['hora']);

        $datos['id_propietario'] = $this->extraerId($propietario, 'id_propietario', 'Propietario');
        $datos['id_mascota'] = (int) $datos['idMascota'];
        $datos['id_veterinario'] = (int) $datos['idVeterinario'];
        $datos['id_tipo'] = isset($datos['id_tipo']) ? (int) $datos['id_tipo'] : null;
        $datos['estado'] = 'CONFIRMADA';

        $cita = $this->insertarCita($datos);
        $this->notificarCreacion($cita, $datos);

        return [
            'codigo_cita' => $cita->getCodigo(),
            'estado' => 'CONFIRMADA',
            'fecha' => $datos['fecha'],
            'hora' => $datos['hora'],
            'mensaje' => 'Cita registrada correctamente',
        ];
    }

    private function verificarPropietario(string $dni): array
    {
        $xml = '<consultarPropietarioRequest><dni>'
            . htmlspecialchars($dni, ENT_XML1, 'UTF-8')
            . '</dni></consultarPropietarioRequest>';
        $proxy = $_ENV['ESB_PROXY_PROPIETARIOS'] ?? 'PropietariosProxy';
        $respuesta = $this->esb->enviar($proxy, $xml, 'urn:consultarPropietario');
        $datos = EsbClient::respuestaAArray($respuesta);

        if (EsbClient::esError($datos)) {
            throw new RuntimeException('Propietario no válido: ' . EsbClient::mensajeError($datos));
        }
        return $datos;
    }

    private function verificarVeterinario(string $idVeterinario): array
    {
        $xml = '<consultarVeterinarioRequest><id_veterinario>'
            . (int) $idVeterinario
            . '</id_veterinario></consultarVeterinarioRequest>';
        $proxy = $_ENV['ESB_PROXY_VETERINARIOS'] ?? 'VeterinariosProxy';
        $respuesta = $this->esb->enviar($proxy, $xml, 'urn:consultarVeterinario');
        $datos = EsbClient::respuestaAArray($respuesta);

        if (EsbClient::esError($datos)) {
            throw new RuntimeException('Veterinario no válido: ' . EsbClient::mensajeError($datos));
        }
        if (isset($datos['disponible']) && !filter_var($datos['disponible'], FILTER_VALIDATE_BOOLEAN)) {
            throw new RuntimeException('El veterinario no está disponible');
        }
        return $datos;
    }

    private function verificarDisponibilidadHorario(string $idVeterinario, string $fecha, string $hora): void
    {
        $stmt = Database::conectar()->prepare(
            "SELECT id_cita FROM citas
             WHERE id_veterinario = ? AND fecha = ? AND hora = ?
             AND estado IN ('PENDIENTE', 'CONFIRMADA')"
        );
        $stmt->execute([(int) $idVeterinario, $fecha, $hora]);

        if ($stmt->fetch()) {
            throw new RuntimeException('El veterinario ya tiene una cita en ese horario');
        }
    }

    private function insertarCita(array $datos): Cita
    {
        $pdo = Database::conectar();
        $cita = new Cita($datos);
        $cita->setCodigo($this->generarCodigoUnico($pdo));

        $sql = 'INSERT INTO citas
                (codigo_cita, id_propietario, id_mascota, id_veterinario, id_tipo,
                 fecha, hora, motivo, observaciones, estado)
                VALUES
                (:codigo, :id_propietario, :id_mascota, :id_veterinario, :id_tipo,
                 :fecha, :hora, :motivo, :observaciones, :estado)';
        $pdo->prepare($sql)->execute($cita->toArray());
        return $cita;
    }

    private function generarCodigoUnico(PDO $pdo): string
    {
        $prefijo = 'CIT-' . date('Y') . '-';
        do {
            $codigo = $prefijo . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
            $stmt = $pdo->prepare('SELECT id_cita FROM citas WHERE codigo_cita = ?');
            $stmt->execute([$codigo]);
        } while ($stmt->fetch());
        return $codigo;
    }

    private function extraerId(array $datos, string $campo, string $entidad): int
    {
        if (!isset($datos[$campo]) || filter_var($datos[$campo], FILTER_VALIDATE_INT) === false || (int) $datos[$campo] <= 0) {
            throw new RuntimeException("{$entidad} remoto no devolvió un ID válido");
        }
        return (int) $datos[$campo];
    }

    private function notificarCreacion(Cita $cita, array $datos): void
    {
        try {
            $proxy = $_ENV['ESB_PROXY_NOTIFICACIONES'] ?? 'NotificacionesProxy';
            $xml = '<enviarConfirmacionCitaRequest>'
                . '<idCita>' . htmlspecialchars((string) $cita->getCodigo(), ENT_XML1, 'UTF-8') . '</idCita>'
                . '<fecha>' . htmlspecialchars($datos['fecha'], ENT_XML1, 'UTF-8') . '</fecha>'
                . '<hora>' . htmlspecialchars($datos['hora'], ENT_XML1, 'UTF-8') . '</hora>'
                . '<idPropietario>' . (int) $datos['id_propietario'] . '</idPropietario>'
                . '<canal>EMAIL</canal></enviarConfirmacionCitaRequest>';
            $this->esb->enviar($proxy, $xml, 'urn:enviarConfirmacionCita');
        } catch (\Throwable $e) {
            error_log('Error al notificar cita: ' . $e->getMessage());
        }
    }

    public function consultar(string $codigo): array
    {
        $stmt = Database::conectar()->prepare('SELECT * FROM citas WHERE codigo_cita = ?');
        $stmt->execute([$codigo]);
        $fila = $stmt->fetch();
        if (!$fila) {
            throw new RuntimeException('Cita no encontrada');
        }
        return $fila;
    }

    public function listarPorPropietario(int $idPropietario): array
    {
        $stmt = Database::conectar()->prepare(
            'SELECT * FROM citas WHERE id_propietario = ? ORDER BY fecha DESC, hora DESC'
        );
        $stmt->execute([$idPropietario]);
        return $stmt->fetchAll();
    }

    public function cancelar(array $datos): array
    {
        $pdo = Database::conectar();
        if (!empty($datos['id_cita'])) {
            $stmt = $pdo->prepare(
                "SELECT * FROM citas WHERE id_cita = ? AND estado IN ('PENDIENTE', 'CONFIRMADA')"
            );
            $stmt->execute([(int) $datos['id_cita']]);
        } else {
            $stmt = $pdo->prepare(
                "SELECT * FROM citas WHERE codigo_cita = ? AND estado IN ('PENDIENTE', 'CONFIRMADA')"
            );
            $stmt->execute([$datos['codigo_cita']]);
        }
        $cita = $stmt->fetch();

        if (!$cita) {
            throw new RuntimeException('Cita no encontrada o ya cancelada');
        }

        $motivo = $datos['motivo'] ?? 'Sin motivo';
        $stmt = $pdo->prepare(
            'UPDATE citas SET estado = \'CANCELADA\', motivo_cancelacion = ? WHERE id_cita = ?'
        );
        $stmt->execute([$motivo, $cita['id_cita']]);
        $this->notificarCancelacion($cita, $motivo);

        return ['estado' => 'CANCELADA', 'mensaje' => 'Cita cancelada correctamente'];
    }

    private function notificarCancelacion(array $cita, string $motivo): void
    {
        try {
            $proxy = $_ENV['ESB_PROXY_NOTIFICACIONES'] ?? 'NotificacionesProxy';
            $xml = '<enviarCancelacionRequest>'
                . '<idCita>' . htmlspecialchars($cita['codigo_cita'], ENT_XML1, 'UTF-8') . '</idCita>'
                . '<idPropietario>' . (int) $cita['id_propietario'] . '</idPropietario>'
                . '<motivo>' . htmlspecialchars($motivo, ENT_XML1, 'UTF-8') . '</motivo>'
                . '<canal>EMAIL</canal></enviarCancelacionRequest>';
            $this->esb->enviar($proxy, $xml, 'urn:enviarCancelacion');
        } catch (\Throwable $e) {
            error_log('Error al notificar cancelación: ' . $e->getMessage());
        }
    }
}
