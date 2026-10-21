class Veterinario:
    def __init__(self, datos: dict):
        self.id_veterinario = datos.get('id_veterinario')
        self.codigo = datos.get('codigo')
        self.id_usuario = datos.get('id_usuario')
        self.nombres = datos.get('nombres', '')
        self.apellidos = datos.get('apellidos', '')
        self.colegiatura = datos.get('colegiatura')
        self.id_especialidad = datos.get('id_especialidad')
        self.telefono = datos.get('telefono')
        self.email = datos.get('email')
        self.horario_inicio = datos.get('horario_inicio')
        self.horario_fin = datos.get('horario_fin')
        self.disponible = datos.get('disponible', True)
        self.estado = datos.get('estado', 'ACTIVO')

    def to_dict(self) -> dict:
        return {
            'id_veterinario': self.id_veterinario,
            'codigo': self.codigo,
            'nombres': self.nombres,
            'apellidos': self.apellidos,
            'colegiatura': self.colegiatura,
            'id_especialidad': self.id_especialidad,
            'telefono': self.telefono,
            'email': self.email,
            'horario_inicio': str(self.horario_inicio) if self.horario_inicio else None,
            'horario_fin': str(self.horario_fin) if self.horario_fin else None,
            'disponible': self.disponible,
            'estado': self.estado,
        }
