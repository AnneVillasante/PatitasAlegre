<?php

namespace App\Models;

class Cita
{
    private ?int $id;
    private ?string $codigo;
    private int $idPropietario;
    private int $idMascota;
    private int $idVeterinario;
    private ?int $idTipo;
    private string $fecha;
    private string $hora;
    private ?string $motivo;
    private ?string $observaciones;
    private string $estado;

    public function __construct(array $datos)
    {
        $this->id = isset($datos['id_cita']) ? (int) $datos['id_cita'] : null;
        $this->codigo = $datos['codigo_cita'] ?? null;
        $this->idPropietario = (int) ($datos['id_propietario'] ?? 0);
        $this->idMascota = (int) ($datos['id_mascota'] ?? 0);
        $this->idVeterinario = (int) ($datos['id_veterinario'] ?? 0);
        $this->idTipo = isset($datos['id_tipo']) ? (int) $datos['id_tipo'] : null;
        $this->fecha = $datos['fecha'] ?? '';
        $this->hora = $datos['hora'] ?? '';
        $this->motivo = $datos['motivo'] ?? null;
        $this->observaciones = $datos['observaciones'] ?? null;
        $this->estado = $datos['estado'] ?? 'PENDIENTE';
    }

    public function getCodigo(): ?string { return $this->codigo; }
    public function setCodigo(string $codigo): void { $this->codigo = $codigo; }

    public function toArray(): array
    {
        return [
            'codigo' => $this->codigo,
            'id_propietario' => $this->idPropietario,
            'id_mascota' => $this->idMascota,
            'id_veterinario' => $this->idVeterinario,
            'id_tipo' => $this->idTipo,
            'fecha' => $this->fecha,
            'hora' => $this->hora,
            'motivo' => $this->motivo,
            'observaciones' => $this->observaciones,
            'estado' => $this->estado,
        ];
    }
}
