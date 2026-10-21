<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Notificacion
{
    public ?int $id = null;
    public ?string $codigo = null;
    public int $idPropietario;
    public ?int $idPlantilla = null;
    public string $tipo;
    public string $destinatario;
    public string $canal;
    public ?string $asunto = null;
    public string $mensaje;
    public string $estado = 'PENDIENTE';
    public int $intentos = 0;
    public ?string $errorMensaje = null;
    public ?string $fechaEnvio = null;

    public function guardar(): bool
    {
        $pdo = Database::getConnection();

        if ($this->id === null) {
            $sql = 'INSERT INTO notificaciones
                    (codigo, id_propietario, id_plantilla, tipo, canal, destinatario,
                     asunto, mensaje, estado, intentos, error_mensaje)
                    VALUES (:codigo, :id_propietario, :id_plantilla, :tipo, :canal,
                            :destinatario, :asunto, :mensaje, :estado, :intentos, :error_mensaje)';
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute([
                'codigo' => $this->codigo,
                'id_propietario' => $this->idPropietario,
                'id_plantilla' => $this->idPlantilla,
                'tipo' => $this->tipo,
                'canal' => $this->canal,
                'destinatario' => $this->destinatario,
                'asunto' => $this->asunto,
                'mensaje' => $this->mensaje,
                'estado' => $this->estado,
                'intentos' => $this->intentos,
                'error_mensaje' => $this->errorMensaje,
            ]);
            if ($result) {
                $this->id = (int) $pdo->lastInsertId();
            }
            return $result;
        }

        $stmt = $pdo->prepare(
            'UPDATE notificaciones SET estado = :estado, intentos = :intentos,
             error_mensaje = :error_mensaje, fecha_envio = :fecha_envio
             WHERE id_notificacion = :id'
        );
        return $stmt->execute([
            'estado' => $this->estado,
            'intentos' => $this->intentos,
            'error_mensaje' => $this->errorMensaje,
            'fecha_envio' => $this->fechaEnvio,
            'id' => $this->id,
        ]);
    }

    public static function buscarPorCodigo(string $codigo): ?self
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM notificaciones WHERE codigo = :codigo LIMIT 1'
        );
        $stmt->execute(['codigo' => $codigo]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return self::fromRow($row);
    }

    private static function fromRow(array $row): self
    {
        $notificacion = new self();
        $notificacion->id = (int) $row['id_notificacion'];
        $notificacion->codigo = $row['codigo'];
        $notificacion->idPropietario = (int) $row['id_propietario'];
        $notificacion->idPlantilla = $row['id_plantilla'] !== null ? (int) $row['id_plantilla'] : null;
        $notificacion->tipo = $row['tipo'];
        $notificacion->destinatario = $row['destinatario'];
        $notificacion->canal = $row['canal'];
        $notificacion->asunto = $row['asunto'];
        $notificacion->mensaje = $row['mensaje'] ?? '';
        $notificacion->estado = $row['estado'];
        $notificacion->intentos = (int) $row['intentos'];
        $notificacion->errorMensaje = $row['error_mensaje'];
        $notificacion->fechaEnvio = $row['fecha_envio'];
        return $notificacion;
    }
}
