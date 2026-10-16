# Clinica Veterinaria Patitas Alegre

Plataforma SOA de gestion veterinaria compuesta por servicios Java, Python,
PHP y Node.js, schemas MySQL independientes, contratos XML y proxies WSO2.

## Arquitectura

El frontend consume los servicios mediante el ESB cuando este esta disponible.
Cada servicio mantiene su propio schema MySQL y usuario de base de datos.
Los contratos WSDL/XSD se encuentran en [docs/contratos](docs/contratos).

## Servicios locales

| Servicio | Tecnologia | Puerto | Base de datos |
|---|---|---:|---|
| Registro | Spring Boot | 8080 | `clinica_auth` |
| Auth | Flask | 5000 | `clinica_auth` |
| Propietarios | PHP | 8003 | `clinica_propietarios` |
| Mascotas | Spring Boot | 8081 | `clinica_mascotas` |
| Personal | Flask | 8005 | `clinica_veterinarios` |
| Venta | Node.js | 3000 | `clinica_accesorios` |
| Citas | PHP | 8007 | `clinica_citas` |
| Farmacia | Spring Boot | 8008 | `clinica_farmacia` |
| Notificaciones | PHP | 8010 | `clinica_notificaciones` |

El ESB usa `http://localhost:8280/services`. El motor BPM/BPEL se publica en
WSO2 BPS mediante el mapeo `9764:9763` de Docker.

## Inicio rapido

1. Copia `config/.env example` a `.env` y reemplaza los valores de secreto.
2. Con MySQL local, ejecuta en orden:

```powershell
mysql -u root -p < database/database.sql
mysql -u root -p < database/DB_users.sql
mysql -u root -p < database/seed-data.sql
```

3. Para infraestructura Docker:

```powershell
docker compose up -d
docker compose ps
```

4. Levanta los microservicios siguiendo [MANUAL_INICIO.md](MANUAL_INICIO.md).
5. Ejecuta la verificacion:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-status.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\phase1-smoke.ps1
```

## Contratos

Cada carpeta de [docs/contratos](docs/contratos) contiene un XSD y un WSDL:
registro, auth, propietarios, mascotas, personal, venta, citas, farmacia,
pagos y notificaciones. Los WSDL apuntan a los proxies del ESB en
`localhost:8280/services`.
