from lxml import etree


def parsear(xml_string: str) -> dict:
    if not xml_string or not xml_string.strip():
        raise ValueError('XML vacío')

    try:
        raiz = etree.fromstring(xml_string.encode('utf-8'))
    except (etree.XMLSyntaxError, UnicodeEncodeError) as error:
        raise ValueError(f'XML inválido: {error}') from error

    return _convertir(raiz)


def _convertir(nodo) -> dict:
    resultado = {}
    for hijo in nodo:
        nombre = etree.QName(hijo).localname
        if len(hijo) > 0:
            resultado[nombre] = _convertir(hijo)
        else:
            texto = (hijo.text or '').strip()
            resultado[nombre] = texto if texto else None
    return resultado
