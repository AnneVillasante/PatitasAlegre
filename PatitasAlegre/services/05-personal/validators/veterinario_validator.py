import re


class VeterinarioValidator:
    @staticmethod
    def validar_registro(datos: dict):
        if not datos.get('nombres'):
            raise ValueError('Los nombres son obligatorios')
        if not datos.get('apellidos'):
            raise ValueError('Los apellidos son obligatorios')
        if not datos.get('colegiatura'):
            raise ValueError('La colegiatura es obligatoria')

        colegiatura = str(datos['colegiatura'])
        if not re.fullmatch(r'[A-Za-z0-9-]{5,20}', colegiatura):
            raise ValueError('La colegiatura debe tener entre 5 y 20 caracteres alfanuméricos')

        email = datos.get('email')
        if email and not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', str(email)):
            raise ValueError('El email no tiene formato válido')

        telefono = datos.get('telefono')
        if telefono and not re.fullmatch(r'\d{6,15}', str(telefono)):
            raise ValueError('El teléfono debe tener entre 6 y 15 dígitos')

    @staticmethod
    def validar_consulta(datos: dict):
        if not datos.get('id_veterinario') and not datos.get('colegiatura'):
            raise ValueError('Debe proporcionar id_veterinario o colegiatura')

        if datos.get('id_veterinario'):
            try:
                if int(datos['id_veterinario']) <= 0:
                    raise ValueError
            except (TypeError, ValueError) as error:
                raise ValueError('El id_veterinario debe ser un entero positivo') from error

    @staticmethod
    def validar_disponibilidad(datos: dict):
        if not datos.get('id_veterinario'):
            raise ValueError('El id_veterinario es obligatorio')
        try:
            if int(datos['id_veterinario']) <= 0:
                raise ValueError
        except (TypeError, ValueError) as error:
            raise ValueError('El id_veterinario debe ser un entero positivo') from error
        if 'disponible' not in datos or datos['disponible'] is None:
            raise ValueError('El campo disponible es obligatorio')
