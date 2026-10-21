
import os
import mysql.connector
from mysql.connector import Error


def obtener_conexion():
    try:
        conexion = mysql.connector.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "svc_auth"),
            password=os.getenv("DB_PASSWORD", "Auth2026!"),
            database=os.getenv("DB_NAME", "clinica_auth")
        )

        if conexion.is_connected():
            print("Conexión con MySQL establecida.")
            return conexion

    except Error as error:
        print(f"Error al conectar con MySQL: {error}")

    return None
