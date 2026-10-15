
import getpass
import bcrypt
from db import obtener_conexion


def crear_usuario():
    username = input("Nombre de usuario: ").strip()
    email = input("Correo electrónico: ").strip().lower()
    password = getpass.getpass("Contraseña: ")

    if not username or not email or not password:
        print("Todos los campos son obligatorios.")
        return

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    conexion = obtener_conexion()

    if conexion is None:
        print("No se pudo conectar con MySQL.")
        return

    cursor = None

    try:
        cursor = conexion.cursor()

        cursor.execute(
            "SELECT id_rol FROM roles WHERE nombre = %s",
            ("ADMIN",)
        )
        resultado = cursor.fetchone()

        if resultado is None:
            print("No existe el rol ADMIN.")
            return

        id_rol = resultado[0]

        cursor.execute(
            """
            INSERT INTO usuarios
                (username, email, password_hash, id_rol, estado,
                 intentos_fallidos)
            VALUES (%s, %s, %s, %s, 'ACTIVO', 0)
            """,
            (username, email, password_hash, id_rol)
        )

        conexion.commit()
        print("Usuario de prueba creado correctamente.")

    except Exception as error:
        conexion.rollback()
        print("No se pudo crear el usuario. Verifica si el nombre")
        print("o el correo ya existen y revisa la estructura de la tabla.")
        print(f"Detalle técnico: {error}")

    finally:
        if cursor is not None:
            cursor.close()
        conexion.close()


if __name__ == "__main__":
    crear_usuario()
