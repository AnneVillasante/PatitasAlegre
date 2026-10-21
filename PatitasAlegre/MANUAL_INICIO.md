# 🐾 Manual de Instalación, Configuración y Despliegue de Servicios
## Sistema de Gestión Veterinaria — Patitas Alegre (VetCare)

Este documento detalla el procedimiento paso a paso para configurar la base de datos MySQL, instalar dependencias, levantar cada uno de los microservicios y acceder a las interfaces de usuario.

---

## 📋 1. Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu sistema:

| Herramienta | Versión Actual del Entorno | Verificación en Terminal |
| :--- | :--- | :--- |
| **MySQL Server** | 8.0 o superior | `mysql --version` |
| **Java JDK** | 25 (LTS) | `java -version` |
| **Maven** | 3.8+ (o usar `./mvnw`) | `mvn -version` |
| **Python** | 3.14 | `python --version` |
| **PHP** | 8.5 | `php -v` |
| **Composer** | 2.x | `composer -V` |
| **Node.js & npm** | Node 24.11 / npm 11+ | `node -v` y `npm -v` |

---

## 🗄️ 2. Configuración de la Base de Datos MySQL

El proyecto cuenta con scripts en la carpeta [`database/`](file:///c:/Users/suemy/OneDrive/Escritorio/PatitasAlegre/PatitasAlegre/database) que deben ejecutarse en el siguiente orden estricto:

### Paso 2.1: Iniciar el servicio de MySQL
Verifica que el servicio esté corriendo en el puerto por defecto `3306`:
```powershell
Get-Service -Name MySQL* | Start-Service
```

### Paso 2.2: Ejecutar los scripts SQL
Abre una terminal en la carpeta raíz del proyecto (`PatitasAlegre/`) y ejecuta con tu usuario `root` de MySQL:

```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\database

# 1. Crear todas las bases de datos y tablas de la clínica
mysql -u root -p < database.sql

# 2. Crear los usuarios y permisos por servicio (svc_auth, svc_citas, etc.)
mysql -u root -p < DB_users.sql

# 3. Insertar datos semilla (especialidades, razas, catálogos iniciales)
mysql -u root -p < seed-data.sql
```

> **Nota de credenciales:** Cada microservicio tiene asignado un usuario MySQL con permisos únicamente sobre su schema (ejemplo: `svc_citas` con clave `Cit2026!` sobre `clinica_citas`).

---

## ⚙️ 3. Configuración de Variables de Entorno (`.env`)

Revisa o copia los archivos `.env.example` en cada carpeta de servicio donde existan:

1. **`services/02-auth/.env`**:
   ```env
   DB_HOST=localhost
   DB_USER=svc_auth
   DB_PASSWORD=Auth2026!
   DB_NAME=clinica_auth
   JWT_SECRET=super_secreto_vetcare_jwt_2026
   ```
2. **`services/03-propietarios/.env`**:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=svc_propietarios
   DB_PASS=Prop2026!
   DB_NAME=clinica_propietarios
   ```
3. **`services/05-personal/.env`**:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=svc_veterinarios
   DB_PASSWORD=Vet2026!
   DB_NAME=clinica_veterinarios
   APP_PORT=8005
   ```
4. **`services/06-venta-node/.env`**:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=svc_accesorios
   DB_PASSWORD=Acc2026!
   DB_NAME=clinica_accesorios
   ```
5. **`services/07-citas/.env`**:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=svc_citas
   DB_PASS=Cit2026!
   DB_NAME=clinica_citas
   ESB_HABILITADO=false
   ```
6. **`services/10-notificaciones/.env`**:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=svc_notificaciones
   DB_PASS=Not2026!
   DB_NAME=clinica_notificaciones
   ```

---

## 🚀 4. Guía de Ejecución de los Microservicios

Para la **Fase 1 (Pruebas Individuales / Desarrollo)**, cada servicio se ejecuta en su propia ventana de terminal PowerShell.

### 🟢 Servicio 01: Registro de Usuarios (Spring Boot)
- **Puerto:** `8080`
- **Tecnología:** Java 17 + Spring Boot
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\01-registro
.\mvnw.cmd spring-boot:run
```

---

### 🟢 Servicio 02: Autenticación & JWT (Flask)
- **Puerto:** `5000`
- **Tecnología:** Python 3 + Flask + PyJWT
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\02-auth
# Si tienes entorno virtual:
.\.venv\Scripts\Activate.ps1
# Instalar dependencias si es la primera vez:
pip install flask flask-cors mysql-connector-python bcrypt pyjwt python-dotenv
# Ejecutar:
python app.py
```

---

### 🟢 Servicio 03: Propietarios (PHP)
- **Puerto:** `8003`
- **Tecnología:** PHP 8 + PDO
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\03-propietarios
# Instalar dependencias si no está la carpeta vendor:
composer install
# Iniciar servidor embebido PHP:
php -S localhost:8003 -t public
```

---

### 🟢 Servicio 04: Mascotas (Spring Boot)
- **Puerto:** `8081`
- **Tecnología:** Java 17 + Spring Boot
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\04-mascotas
.\mvnw.cmd spring-boot:run
```

---

### 🟢 Servicio 05: Personal Veterinario (Flask)
- **Puerto:** `8005`
- **Tecnología:** Python 3 + Flask + XML
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\05-personal
pip install -r requirements.txt
python app.py
```

---

### 🟢 Servicio 06: Ventas & Pet Shop (Node.js)
- **Puerto:** `3000`
- **Tecnología:** Node.js + Express + MySQL2
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\06-venta-node
npm install
node server.js
```

---

### 🟢 Servicio 07: Citas Médicas (PHP)
- **Puerto:** `8007`
- **Tecnología:** PHP 8 + PDO
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\07-citas
composer install
php -S localhost:8007 -t public
```

---

### 🟢 Servicio 08: Farmacia (Spring Boot)
- **Puerto:** `8008`
- **Tecnología:** Java 17 + Spring Boot + Jackson XML
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\08-farmacia
mvn clean spring-boot:run
```

---

### 🟢 Servicio 10: Notificaciones (PHP)
- **Puerto:** `8010`
- **Tecnología:** PHP 8 + PHPMailer
```powershell
cd c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\services\10-notificaciones
composer install
php -S localhost:8010 -t public
```

---

## 🧪 5. Comprobación Automática de Servicios (Smoke Test)

Una vez que tengas los servicios levantados, ejecuta el script de verificación automatizada:

```powershell
powershell -ExecutionPolicy Bypass -File .\PatitasAlegre\scripts\phase1-smoke.ps1
```

El script validará la conectividad en los puertos y respuestas XML esperadas:
- `03-propietarios`: **OK (200)**
- `05-personal`: **OK (200)**
- `07-citas`: **OK (200)**
- `08-farmacia`: **OK (200)**
- `10-notificaciones`: **OK (200)**

---

## 💻 6. Acceso al Frontend y Dashboard

Las interfaces de usuario se encuentran en [`frontend/usuario/`](file:///c:/Users/suemy/OneDrive/Escritorio/PatitasAlegre/PatitasAlegre/frontend/usuario/):

| Módulo / Interfaz | Archivo | Descripción |
| :--- | :--- | :--- |
| **Inicio & Login** | `index.html` | Pantalla de bienvenida, inicio de sesión y registro |
| **Dashboard Central** | `dashboard.html` | Monitor en vivo de microservicios y accesos rápidos |
| **Propietarios** | `propietarios.html` | Búsqueda y gestión de dueños (puerto 8003) |
| **Mascotas** | `mascotas.html` | Expediente clínico, razas y especies (puerto 8081) |
| **Personal Médico** | `veterinarios.html` | Médicos, colegiaturas y disponibilidad (puerto 8005) |
| **Citas Médicas** | `citas.html` | Solicitud y agenda de consultas (puerto 8007) |
| **Farmacia** | `farmacia.html` | Despacho de recetas y medicamentos (puerto 8008) |
| **Tienda** | `tienda.html` | Catálogo de accesorios y carrito de compras (puerto 3000) |
| **Notificaciones** | `notificaciones.html` | Plantillas de aviso por email y rastreo (puerto 8010) |
| **Historia Clínica** | `historial.html` | Consulta de diagnósticos y vacunas |

### Para abrirlas en el navegador:
Simplemente haz doble clic en cualquier archivo `.html` o ejecuta desde PowerShell:
```powershell
Start-Process "c:\Users\suemy\OneDrive\Escritorio\PatitasAlegre\PatitasAlegre\frontend\usuario\dashboard.html"
```
