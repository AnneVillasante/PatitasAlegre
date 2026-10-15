<?php

namespace App\Services;

use App\Config\Database;
use App\Models\Propietario;
use PDO;
use RuntimeException;

class PropietarioService
{
    public function registrar(array $datos): array
    {
        $pdo = Database::conectar();

        $stmt = $pdo->prepare('SELECT id_propietario FROM propietarios WHERE dni = ?');
        $stmt->execute([$datos['dni']]);
        if ($stmt->fetch()) {
            throw new RuntimeException('El DNI ya está registrado');
        }

        $propietario = new Propietario($datos);
        $codigo = 'PROP-' . date('Y') . '-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        $propietario->setCodigo($codigo);

        $sql = 'INSERT INTO propietarios (codigo, dni, nombres, apellidos, telefono, email, direccion, distrito)
                VALUES (:codigo, :dni, :nombres, :apellidos, :telefono, :email, :direccion, :distrito)';

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'codigo' => $codigo,
            'dni' => $propietario->getDni(),
            'nombres' => $propietario->getNombres(),
            'apellidos' => $propietario->getApellidos(),
            'telefono' => $propietario->getTelefono(),
            'email' => $propietario->getEmail(),
            'direccion' => $propietario->getDireccion(),
            'distrito' => $propietario->getDistrito(),
        ]);

        return [
            'codigo' => $codigo,
            'estado' => 'REGISTRADO',
            'mensaje' => 'Propietario registrado correctamente',
        ];
    }

    public function consultar(string $dni): array
    {
        $stmt = Database::conectar()->prepare('SELECT * FROM propietarios WHERE dni = ?');
        $stmt->execute([$dni]);
        $fila = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$fila) {
            throw new RuntimeException('Propietario no encontrado');
        }

        return $fila;
    }

    public function listar(): array
    {
        $stmt = Database::conectar()->query("SELECT * FROM propietarios WHERE estado = 'ACTIVO' ORDER BY apellidos, nombres");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function actualizar(array $datos): array
    {
        $pdo = Database::conectar();
        $stmt = $pdo->prepare('SELECT id_propietario FROM propietarios WHERE dni = ?');
        $stmt->execute([$datos['dni']]);

        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            throw new RuntimeException('Propietario no encontrado');
        }

        $sql = 'UPDATE propietarios SET nombres = :nombres, apellidos = :apellidos,
                telefono = :telefono, email = :email, direccion = :direccion, distrito = :distrito
                WHERE dni = :dni';
        $pdo->prepare($sql)->execute([
            'dni' => $datos['dni'],
            'nombres' => $datos['nombres'],
            'apellidos' => $datos['apellidos'],
            'telefono' => $datos['telefono'] ?? null,
            'email' => $datos['email'] ?? null,
            'direccion' => $datos['direccion'] ?? null,
            'distrito' => $datos['distrito'] ?? null,
        ]);

        return ['estado' => 'ACTUALIZADO', 'mensaje' => 'Propietario actualizado'];
    }

    public function eliminar(string $dni): array
    {
        $pdo = Database::conectar();
        $stmt = $pdo->prepare("UPDATE propietarios SET estado = 'INACTIVO' WHERE dni = ? AND estado = 'ACTIVO'");
        $stmt->execute([$dni]);

        if ($stmt->rowCount() === 0) {
            throw new RuntimeException('Propietario no encontrado');
        }

        return ['estado' => 'ELIMINADO', 'mensaje' => 'Propietario dado de baja'];
    }
}
