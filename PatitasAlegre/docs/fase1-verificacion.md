# Fase 1: verificación individual de servicios (9 Servicios)

La Fase 1 se ejecuta sin WSO2. MySQL debe estar activo y cada servicio se levanta en su propia terminal.

## Servicios

| Servicio | Puerto | Tecnología | Comando |
|---|---:|---|---|
| 01-registro | 8080 | Spring Boot | `.\mvnw.cmd spring-boot:run` desde `services/01-registro` |
| 02-auth | 5000 | Flask | `python app.py` desde `services/02-auth` |
| 03-propietarios | 8003 | PHP / PDO | `php -S localhost:8003 -t public` desde `services/03-propietarios` |
| 04-mascotas | 8081 | Spring Boot | `.\mvnw.cmd spring-boot:run` desde `services/04-mascotas` |
| 05-personal | 8005 | Flask | `python app.py` desde `services/05-personal` |
| 06-venta-node | 3000 | Node.js | `node server.js` desde `services/06-venta-node` |
| 07-citas | 8007 | PHP / PDO | `php -S localhost:8007 -t public` desde `services/07-citas` |
| 08-farmacia | 8008 | Spring Boot | `mvn spring-boot:run` desde `services/08-farmacia` |
| 10-notificaciones | 8010 | PHP / PDO | `php -S localhost:8010 -t public` desde `services/10-notificaciones` |

## Colecciones Postman

### 1. Colecciones individuales por servicio (`postman/colecciones-por-servicio/`)

- `01-registro.json`
- `02-auth.json`
- `03-propietarios.json`
- `04-mascotas.json`
- `05-personal.json`
- `06-venta-node.json`
- `07-citas.json`
- `08-farmacia.json`
- `10-notificaciones.json`

### 2. Colecciones vía ESB (`postman/colecciones-via-esb/`)

- `01-registro-esb.json`
- `02-auth-esb.json`
- `03-propietarios-esb.json`
- `04-mascotas-esb.json`
- `05-personal-esb.json`
- `06-venta-node-esb.json`
- `07-citas-esb.json`
- `08-farmacia-esb.json`
- `10-notificaciones-esb.json`

Colección maestra ESB: `postman/clinica-soa.postman_collection.json`

## Citas aislado

Para probar Citas sin ESB, cambiar temporalmente en `services/07-citas/.env`:

```env
ESB_HABILITADO=false
```

En ese modo `crearCitaRequest` debe incluir `idPropietario`. En modo integrado se usa `dniPropietario` y Citas valida el propietario y veterinario mediante ESB.

## Comprobación de base de datos

Ejecutar las consultas con el usuario del servicio correspondiente, no con un usuario administrador:

```sql
SELECT * FROM clinica_auth.usuarios;
SELECT * FROM clinica_propietarios.propietarios;
SELECT * FROM clinica_mascotas.mascotas;
SELECT * FROM clinica_veterinarios.veterinarios;
SELECT * FROM clinica_accesorios.productos_accesorios;
SELECT * FROM clinica_citas.citas;
SELECT * FROM clinica_farmacia.ventas_farmacia;
SELECT * FROM clinica_notificaciones.notificaciones;
```

Cada usuario debe tener acceso únicamente a su schema. Una consulta a otro schema debe fallar con `SELECT command denied`.

## Estado de infraestructura

La verificación individual no requiere WSO2 ni ActiveMQ. La Fase 2 necesita los proxies desplegados en WSO2 (puerto `8280`); la Fase 5 necesita ActiveMQ en los puertos OpenWire `61616` y STOMP `61613`. Las capturas de Postman/MySQL deben tomarse durante la ejecución local porque no son generables como archivos reproducibles del repositorio.
