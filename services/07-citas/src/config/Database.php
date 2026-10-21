<?php

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $pdo = null;

    public static function conectar(): PDO
    {
        if (self::$pdo === null) {
            try {
                self::$pdo = new PDO(
                    sprintf(
                        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                        $_ENV['DB_HOST'] ?? '127.0.0.1',
                        $_ENV['DB_PORT'] ?? '3306',
                        $_ENV['DB_NAME'] ?? 'clinica_citas'
                    ),
                    $_ENV['DB_USER'] ?? 'svc_citas',
                    $_ENV['DB_PASS'] ?? 'Cit2026!',
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $e) {
                throw new \RuntimeException('Error de conexión a BD: ' . $e->getMessage(), 0, $e);
            }
        }

        return self::$pdo;
    }
}
