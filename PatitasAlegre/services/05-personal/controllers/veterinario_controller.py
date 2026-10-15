from flask import Response, request

from services.veterinario_service import VeterinarioService
from validators.veterinario_validator import VeterinarioValidator
from xml.builder import error, exito, lista
from xml.parser import parsear


class VeterinarioController:
    def __init__(self):
        self.service = VeterinarioService()

    def registrar(self):
        return self._responder(
            lambda datos: self.service.registrar(datos),
            'registrarVeterinarioResponse',
            requiere_validacion=True,
            validator=VeterinarioValidator.validar_registro,
        )

    def consultar(self):
        return self._responder(
            lambda datos: self.service.consultar(datos),
            'consultarVeterinarioResponse',
            requiere_validacion=True,
            validator=VeterinarioValidator.validar_consulta,
        )

    def listar(self):
        return self._responder(
            lambda _: self.service.listar(),
            'listarVeterinariosResponse',
            es_lista=True,
            item_name='veterinario',
        )

    def listar_disponibles(self):
        return self._responder(
            lambda datos: self.service.listar_disponibles(datos),
            'listarDisponiblesResponse',
            es_lista=True,
            item_name='veterinario',
        )

    def listar_especialidades(self):
        return self._responder(
            lambda _: self.service.listar_especialidades(),
            'listarEspecialidadesResponse',
            es_lista=True,
            item_name='especialidad',
        )

    def actualizar_disponibilidad(self):
        return self._responder(
            lambda datos: self.service.actualizar_disponibilidad(datos),
            'actualizarDisponibilidadResponse',
            requiere_validacion=True,
            validator=VeterinarioValidator.validar_disponibilidad,
        )

    def _responder(
        self,
        logica,
        root_name: str,
        es_lista: bool = False,
        item_name: str = 'item',
        requiere_validacion: bool = False,
        validator=None,
    ):
        try:
            datos = parsear(request.data.decode('utf-8')) if request.data else {}
            if requiere_validacion and validator:
                validator(datos)
            resultado = logica(datos)
            xml = lista(root_name, item_name, resultado) if es_lista else exito(root_name, resultado)
            return Response(xml, mimetype='text/xml')
        except ValueError as error_value:
            return Response(
                error(root_name, 'ERROR-VALIDACION', str(error_value)),
                status=400,
                mimetype='text/xml',
            )
        except RuntimeError as runtime_error:
            return Response(
                error(root_name, 'ERROR-NEGOCIO', str(runtime_error)),
                status=404,
                mimetype='text/xml',
            )
        except Exception:
            return Response(
                error(root_name, 'ERROR-INTERNO', 'Error interno del servidor'),
                status=500,
                mimetype='text/xml',
            )
