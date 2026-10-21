import os
from typing import Any

import mysql.connector
from mysql.connector import Error

_connection: Any = None


def conectar():
    global _connection
    if _connection is None or not _connection.is_connected():
        try:
            _connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', '127.0.0.1'),
                port=int(os.getenv('DB_PORT', '3306')),
                database=os.getenv('DB_NAME', 'clinica_veterinarios'),
                user=os.getenv('DB_USER', 'svc_veterinarios'),
                password=os.getenv('DB_PASS', 'Vet2026!'),
                charset='utf8mb4',
            )
        except Error as error:
            raise RuntimeError(f'Error de conexión a BD: {error}') from error
    return _connection


def cerrar() -> None:
    global _connection
    if _connection is not None and _connection.is_connected():
        _connection.close()
    _connection = None
