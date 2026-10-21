from lxml import etree


def _crear_raiz(nombre: str):
    return etree.Element(nombre)


def _agregar_hijos(nodo, datos: dict):
    for clave, valor in datos.items():
        hijo = etree.SubElement(nodo, str(clave))
        if valor is not None:
            hijo.text = str(valor)


def _serializar(raiz) -> str:
    return etree.tostring(
        raiz,
        xml_declaration=True,
        encoding='UTF-8',
    ).decode('utf-8')


def exito(root_name: str, datos: dict) -> str:
    raiz = _crear_raiz(root_name)
    _agregar_hijos(raiz, datos)
    return _serializar(raiz)


def error(root_name: str, codigo: str, mensaje: str) -> str:
    raiz = _crear_raiz(root_name)
    _agregar_hijos(raiz, {
        'codigo': codigo,
        'estado': 'FALLIDO',
        'mensaje': mensaje,
    })
    return _serializar(raiz)


def lista(root_name: str, item_name: str, items: list) -> str:
    raiz = _crear_raiz(root_name)
    for item in items:
        nodo = etree.SubElement(raiz, item_name)
        _agregar_hijos(nodo, item)
    return _serializar(raiz)
