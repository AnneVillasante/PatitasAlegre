import os

import requests


class EsbClient:
    def __init__(self):
        self.base_url = os.getenv('ESB_URL', 'http://localhost:8280/services').rstrip('/')

    def enviar(self, proxy_name: str, xml_payload: str, soap_action: str = '') -> str:
        url = f'{self.base_url}/{proxy_name}'
        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': soap_action,
        }

        try:
            respuesta = requests.post(
                url,
                data=xml_payload.encode('utf-8'),
                headers=headers,
                timeout=30,
            )
            respuesta.raise_for_status()
            return respuesta.text
        except requests.exceptions.RequestException as error:
            raise RuntimeError(f'Error al comunicarse con el ESB: {error}') from error
