from datetime import datetime

from config.database import conectar


class VeterinarioService:
    def registrar(self, datos: dict) -> dict:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                'SELECT id_veterinario FROM veterinarios WHERE colegiatura = %s',
                (datos['colegiatura'],),
            )
            if cursor.fetchone():
                raise ValueError('La colegiatura ya está registrada')

            codigo = f"VET-{datetime.now().year}-{datetime.now().strftime('%f')[:4]}"
            cursor.execute(
                '''INSERT INTO veterinarios
                   (codigo, nombres, apellidos, colegiatura, id_especialidad,
                    telefono, email, horario_inicio, horario_fin)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                (
                    codigo,
                    datos['nombres'],
                    datos['apellidos'],
                    datos['colegiatura'],
                    datos.get('id_especialidad'),
                    datos.get('telefono'),
                    datos.get('email'),
                    datos.get('horario_inicio'),
                    datos.get('horario_fin'),
                ),
            )
            conn.commit()
            return {
                'codigo': codigo,
                'estado': 'REGISTRADO',
                'mensaje': 'Veterinario registrado correctamente',
            }
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()

    def consultar(self, datos: dict) -> dict:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        try:
            if datos.get('id_veterinario'):
                cursor.execute(
                    'SELECT * FROM veterinarios WHERE id_veterinario = %s',
                    (int(datos['id_veterinario']),),
                )
            else:
                cursor.execute(
                    'SELECT * FROM veterinarios WHERE colegiatura = %s',
                    (datos['colegiatura'],),
                )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if not fila:
            raise ValueError('Veterinario no encontrado')
        return fila

    def listar(self) -> list:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM veterinarios WHERE estado = 'ACTIVO' "
                'ORDER BY apellidos, nombres'
            )
            return cursor.fetchall()
        finally:
            cursor.close()

    def listar_disponibles(self, datos: dict) -> list:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        try:
            sql = '''SELECT v.*, e.nombre AS especialidad
                     FROM veterinarios v
                     LEFT JOIN especialidades e ON v.id_especialidad = e.id_especialidad
                     WHERE v.estado = 'ACTIVO' AND v.disponible = TRUE'''
            params = []
            if datos.get('especialidad'):
                sql += ' AND e.nombre = %s'
                params.append(datos['especialidad'])
            sql += ' ORDER BY v.apellidos, v.nombres'
            cursor.execute(sql, params)
            return cursor.fetchall()
        finally:
            cursor.close()

    def listar_especialidades(self) -> list:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                'SELECT id_especialidad, nombre FROM especialidades ORDER BY nombre'
            )
            return cursor.fetchall()
        finally:
            cursor.close()

    def actualizar_disponibilidad(self, datos: dict) -> dict:
        conn = conectar()
        cursor = conn.cursor()
        disponible = 1 if str(datos['disponible']).lower() in ('true', '1', 'si', 'sí') else 0
        try:
            cursor.execute(
                'UPDATE veterinarios SET disponible = %s WHERE id_veterinario = %s',
                (disponible, int(datos['id_veterinario'])),
            )
            conn.commit()
            if cursor.rowcount == 0:
                raise ValueError('Veterinario no encontrado')
            return {
                'estado': 'ACTUALIZADO',
                'mensaje': 'Disponibilidad actualizada',
            }
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
