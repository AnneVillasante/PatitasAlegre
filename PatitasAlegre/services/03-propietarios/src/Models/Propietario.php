<?php

namespace App\Models;

class Propietario
{
    private ?int $id;
    private ?string $codigo;
    private string $dni;
    private string $nombres;
    private string $apellidos;
    private ?string $telefono;
    private ?string $email;
    private ?string $direccion;
    private ?string $distrito;

    public function __construct(array $datos)
    {
        $this->id = isset($datos['id_propietario']) ? (int) $datos['id_propietario'] : null;
        $this->codigo = $datos['codigo'] ?? null;
        $this->dni = $datos['dni'] ?? '';
        $this->nombres = $datos['nombres'] ?? '';
        $this->apellidos = $datos['apellidos'] ?? '';
        $this->telefono = $datos['telefono'] ?? null;
        $this->email = $datos['email'] ?? null;
        $this->direccion = $datos['direccion'] ?? null;
        $this->distrito = $datos['distrito'] ?? null;
    }

    public function getDni(): string { return $this->dni; }
    public function getNombres(): string { return $this->nombres; }
    public function getApellidos(): string { return $this->apellidos; }
    public function getTelefono(): ?string { return $this->telefono; }
    public function getEmail(): ?string { return $this->email; }
    public function getDireccion(): ?string { return $this->direccion; }
    public function getDistrito(): ?string { return $this->distrito; }
    public function getCodigo(): ?string { return $this->codigo; }
    public function getId(): ?int { return $this->id; }

    public function setCodigo(string $codigo): void { $this->codigo = $codigo; }
    public function setId(int $id): void { $this->id = $id; }

    public function toArray(): array
    {
        return [
            'dni' => $this->dni,
            'nombres' => $this->nombres,
            'apellidos' => $this->apellidos,
            'telefono' => $this->telefono,
            'email' => $this->email,
            'direccion' => $this->direccion,
            'distrito' => $this->distrito,
        ];
    }
}
