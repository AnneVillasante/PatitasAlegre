# Fase 1: verificación individual de servicios

La Fase 1 se ejecuta sin WSO2. MySQL debe estar activo y cada servicio se levanta en su propia terminal.

## Servicios

| Servicio | Puerto | Comando |
|---|---:|---|
| Propietarios | 8003 | `php -S localhost:8003 -t public` desde `services/03-propietarios` |
| Personal | 8005 | `python app.py` desde `services/05-personal` |
| Citas | 8007 | `php -S localhost:8007 -t public` desde `services/07-citas` |
| Farmacia | 8008 | `mvn spring-boot:run` desde `services/08-farmacia` |
| Notificaciones | 8010 | `php -S localhost:8010 -t public` desde `services/10-notificaciones` |

## Colecciones Postman

Las colecciones están en `postman/colecciones-por-servicio/`:

- `03-propietarios.json`
- `05-personal.json`
- `07-citas.json`
- `08-farmacia.json`
- `10-notificaciones.json`

Importar la colección correspondiente y ejecutar sus requests en orden.

## Citas aislado

Para probar Citas sin ESB, cambiar temporalmente en `services/07-citas/.env`:

```env
ESB_HABILITADO=false
```

En ese modo `crearCitaRequest` debe incluir `idPropietario`. En modo integrado se usa `dniPropietario` y Citas valida el propietario y veterinario mediante ESB.

## Comprobación de base de datos

Ejecutar las consultas con el usuario del servicio correspondiente, no con un usuario administrador:

```sql
SELECT * FROM clinica_propietarios.propietarios;
SELECT * FROM clinica_veterinarios.veterinarios;
SELECT * FROM clinica_citas.citas;
SELECT * FROM clinica_farmacia.ventas_farmacia;
SELECT * FROM clinica_notificaciones.notificaciones;
```

Cada usuario debe tener acceso únicamente a su schema. Una consulta a otro schema debe fallar con `SELECT command denied`.

## Estado de infraestructura

La verificación individual no requiere WSO2 ni ActiveMQ. La Fase 2 necesita cinco proxies desplegados en WSO2; la Fase 5 necesita ActiveMQ en los puertos OpenWire `61616` y STOMP `61613`. Las capturas de Postman/MySQL deben tomarse durante la ejecución local porque no son generables como archivos reproducibles del repositorio.

## Resultado ejecutado

- `03-propietarios`: registro, consulta, duplicado y limpieza temporal verificados por HTTP.
- `05-personal`: especialidades, disponibles y error de colegiatura verificados por HTTP.
- `07-citas`: crear, consultar, listar y cancelar verificados sin ESB; el modo integrado queda en `ESB_HABILITADO=true`.
- `08-farmacia`: `mvn test` correcto; la consulta HTTP requiere que Spring Boot permanezca expuesto en `8008`.
- `10-notificaciones`: envío y consulta XML verificados por HTTP con SMTP simulado.
- Aislamiento MySQL verificado para los cinco usuarios: schema propio accesible y schema ajeno rechazado.
