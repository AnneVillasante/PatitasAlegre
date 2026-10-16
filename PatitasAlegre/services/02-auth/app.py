
import os
import webbrowser
from threading import Timer
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from db import obtener_conexion


# =========================================================
# CONFIGURACION DE FLASK
# =========================================================
load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "Falta configurar JWT_SECRET en el archivo .env"
    )


app = Flask(__name__)
app.config['VERSION'] = '1.0.0'
__version__ = '1.0.0'
CORS(app)

# Carpeta principal: Proyecto-Veterinaria
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

# Puerto del backend de inicio de sesion
PUERTO = 5000


# =========================================================
# PAGINA PRINCIPAL: INDEX.HTML
# =========================================================

@app.route("/", methods=["GET"])
def inicio():
    return send_from_directory(BASE_DIR, "index.html")


# =========================================================
# ARCHIVOS CSS
# =========================================================

@app.route("/css/<path:archivo>", methods=["GET"])
def archivos_css(archivo):
    return send_from_directory(
        os.path.join(BASE_DIR, "css"),
        archivo
    )


# =========================================================
# ARCHIVOS JAVASCRIPT
# =========================================================

@app.route("/js/<path:archivo>", methods=["GET"])
def archivos_js(archivo):
    return send_from_directory(
        os.path.join(BASE_DIR, "js"),
        archivo
    )


# =========================================================
# PROBAR CONEXION CON MYSQL
# =========================================================

@app.route("/test-db", methods=["GET"])
def probar_base_datos():
    conexion = obtener_conexion()

    if conexion is None:
        return jsonify({
            "conectado": False,
            "mensaje": "No se pudo conectar con MySQL"
        }), 500

    cursor = None

    try:
        cursor = conexion.cursor()

        cursor.execute("SELECT DATABASE()")
        base_datos = cursor.fetchone()[0]

        cursor.execute("SHOW TABLES")
        tablas = [fila[0] for fila in cursor.fetchall()]

        return jsonify({
            "conectado": True,
            "mensaje": "Conexion exitosa con MySQL",
            "base_datos": base_datos,
            "tablas": tablas,
            "tabla_usuarios_existe": "usuarios" in tablas,
            "tabla_roles_existe": "roles" in tablas
        })

    except Exception:
        app.logger.exception(
            "Error al consultar la base de datos"
        )

        return jsonify({
            "conectado": False,
            "mensaje": "Fallo la consulta de MySQL"
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        conexion.close()


# =========================================================
# INICIO DE SESION
# =========================================================

@app.route("/login", methods=["POST"])
def iniciar_sesion():
    datos = request.get_json(silent=True) or {}

    email = datos.get("email", "")
    password = datos.get("password", "")
    rol_seleccionado = datos.get("rol", "")

    if not isinstance(email, str):
        email = ""

    if not isinstance(password, str):
        password = ""

    if not isinstance(rol_seleccionado, str):
        rol_seleccionado = ""

    email = email.strip().lower()
    rol_seleccionado = rol_seleccionado.strip().upper()

    if not email or not password or not rol_seleccionado:
        return jsonify({
            "ok": False,
            "mensaje": (
                "Completa el correo, la contrasena y el rol."
            )
        }), 400

    conexion = obtener_conexion()

    if conexion is None:
        return jsonify({
            "ok": False,
            "mensaje": "No se pudo conectar con la base de datos."
        }), 500

    cursor = None

    try:
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT
                u.id_usuario,
                u.username,
                u.email,
                u.password_hash,
                u.estado,
                u.id_rol,
                r.nombre AS nombre_rol
            FROM usuarios u
            INNER JOIN roles r ON r.id_rol = u.id_rol
            WHERE u.email = %s
            LIMIT 1
            """,
            (email,)
        )

        usuario = cursor.fetchone()

        if usuario is None:
            return jsonify({
                "ok": False,
                "mensaje": "Credenciales incorrectas."
            }), 401

        (
            id_usuario,
            username,
            correo,
            password_hash,
            estado,
            id_rol,
            nombre_rol
        ) = usuario

        if estado != "ACTIVO":
            return jsonify({
                "ok": False,
                "mensaje": "La cuenta no esta activa."
            }), 403

        # Comprobar la contrasena con BCrypt
        try:
            hash_bytes = (
                password_hash.encode("utf-8")
                if isinstance(password_hash, str)
                else password_hash
            )

            contrasena_correcta = bcrypt.checkpw(
                password.encode("utf-8"),
                hash_bytes
            )

        except (ValueError, TypeError, AttributeError):
            contrasena_correcta = False

        if not contrasena_correcta:
            return jsonify({
                "ok": False,
                "mensaje": "Credenciales incorrectas."
            }), 401

        # Verificar el rol guardado en MySQL
        if nombre_rol.upper() != rol_seleccionado:
            return jsonify({
                "ok": False,
                "mensaje": (
                    "El rol seleccionado no corresponde "
                    "a tu cuenta."
                )
            }), 403

        cursor.execute(
            """
            UPDATE usuarios
            SET ultimo_acceso = CURRENT_TIMESTAMP,
                intentos_fallidos = 0
            WHERE id_usuario = %s
            """,
            (id_usuario,)
        )

        conexion.commit()

        ahora = datetime.now(timezone.utc)

        payload = {
            "sub": str(id_usuario),
            "nombre": username,
            "email": correo,
            "rol": nombre_rol,
            "iat": ahora,
            "exp": ahora + timedelta(minutes=30)
        }

        token = jwt.encode(
            payload,
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "ok": True,
            "mensaje": "Inicio de sesion correcto.",
            "token": token,
            "tipo_token": "Bearer",
            "expira_en_segundos": 1800,
            "usuario": {
                "id": id_usuario,
                "nombre": username,
                "email": correo,
                "rol": nombre_rol
            }
        }), 200
    except Exception:
        conexion.rollback()

        app.logger.exception(
            "Error durante el inicio de sesion"
        )

        return jsonify({
            "ok": False,
            "mensaje": (
                "Ocurrio un error interno al iniciar sesion."
            )
        }), 500

    finally:
        if cursor is not None:
            cursor.close()

        conexion.close()


# =========================================================
# EJECUTAR FLASK Y ABRIR VETCARE AUTOMATICAMENTE
# =========================================================

if __name__ == "__main__":
    Timer(
        1.5,
        lambda: webbrowser.open(
            f"http://127.0.0.1:{PUERTO}/"
        )
    ).start()

    app.run(
        host="127.0.0.1",
        port=PUERTO,
        debug=True,
        use_reloader=False
    )
