import os

from dotenv import load_dotenv
from flask import Flask

from controllers.veterinario_controller import VeterinarioController

load_dotenv()

app = Flask(__name__)
controller = VeterinarioController()

app.add_url_rule(
    '/veterinarios/registrar',
    'registrar',
    controller.registrar,
    methods=['POST'],
)
app.add_url_rule(
    '/veterinarios/consultar',
    'consultar',
    controller.consultar,
    methods=['POST'],
)
app.add_url_rule(
    '/veterinarios/listar',
    'listar',
    controller.listar,
    methods=['POST'],
)
app.add_url_rule(
    '/veterinarios/disponibles',
    'disponibles',
    controller.listar_disponibles,
    methods=['POST'],
)
app.add_url_rule(
    '/veterinarios/especialidades',
    'especialidades',
    controller.listar_especialidades,
    methods=['POST'],
)
app.add_url_rule(
    '/veterinarios/disponibilidad',
    'disponibilidad',
    controller.actualizar_disponibilidad,
    methods=['POST'],
)


if __name__ == '__main__':
    port = int(os.getenv('APP_PORT', '8005'))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
