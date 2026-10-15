# 🐾 Clínica Veterinaria Patitas Alegre (VetCare)
## Arquitectura SOA & Microservicios

Este repositorio contiene la plataforma integral de gestión veterinaria **Patitas Alegre / VetCare**, compuesta por microservicios heterogéneos (Java Spring Boot, Python Flask, PHP, Node.js), base de datos MySQL segmentada y una interfaz web moderna.

---

## 📑 Manual de Inicio Rápido

Consulta el manual completo y detallado en:
👉 [**MANUAL_INICIO.md**](MANUAL_INICIO.md)

---

## 🗺️ Mapa de Puertos y Servicios

| N° | Microservicio | Directorio | Tecnología | Puerto | Endpoint de Prueba |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **01** | Registro de Usuarios | `services/01-registro` | Spring Boot (Java 17) | `8080` | `POST /api/registro` |
| **02** | Autenticación & JWT | `services/02-auth` | Flask (Python 3) | `5000` | `GET /` |
| **03** | Propietarios | `services/03-propietarios` | PHP 8 (PDO XML) | `8003` | `POST /propietarios/listar` |
| **04** | Mascotas & Pacientes | `services/04-mascotas` | Spring Boot (Java 17) | `8081` | `GET /api/mascotas/especies` |
| **05** | Personal Médico | `services/05-personal` | Flask (Python 3) | `8005` | `POST /veterinarios/especialidades` |
| **06** | Ventas & Accesorios | `services/06-venta-node` | Node.js (Express) | `3000` | `GET /api/salud` |
| **07** | Citas Médicas | `services/07-citas` | PHP 8 (PDO XML) | `8007` | `POST /citas/listar` |
| **08** | Farmacia Veterinaria | `services/08-farmacia` | Spring Boot (Java 17) | `8008` | `GET /farmacia/productos` |
| **10** | Notificaciones & SMTP | `services/10-notificaciones` | PHP 8 (PHPMailer) | `8010` | `GET /notificaciones/consultar/...` |
| **DB** | Base de Datos | `database/` | MySQL 8.0 | `3306` | Multi-Schema |

---

## ⚡ Comandos Rápidos de Inicialización

### 1. Base de Datos (ejecutar en MySQL):
```bash
mysql -u root -p < database/database.sql
mysql -u root -p < database/DB_users.sql
mysql -u root -p < database/seed-data.sql
```

### 2. Smoke Testing (Verificación de puertos y XML):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\phase1-smoke.ps1
```

### 3. Frontend:
Abre el panel principal en el navegador:
```powershell
Start-Process "frontend\usuario\dashboard.html"
```
