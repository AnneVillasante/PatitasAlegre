
-- ============================================================
-- PROYECTO: Clínica Veterinaria Patitas Alegres
-- ============================================================
CREATE DATABASE IF NOT EXISTS clinica_auth
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_dashboard
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_propietarios
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_mascotas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_veterinarios
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_accesorios
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_citas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_farmacia
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_pagos
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS clinica_notificaciones
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificación
SHOW DATABASES LIKE 'clinica_%';
-- ============================================================
-- SERVICIO 1: AUTENTICACIÓN
-- ============================================================
USE clinica_auth;

CREATE TABLE IF NOT EXISTS roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  estado ENUM('ACTIVO','INACTIVO','BLOQUEADO') DEFAULT 'ACTIVO',
  intentos_fallidos INT DEFAULT 0,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP NULL,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE IF NOT EXISTS permisos (
  id_permiso INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS roles_permisos (
  id_rol INT NOT NULL,
  id_permiso INT NOT NULL,
  PRIMARY KEY (id_rol, id_permiso),
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
  FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso)
);

CREATE TABLE IF NOT EXISTS sesiones (
  id_sesion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP,
  ip VARCHAR(45),
  activa BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS auditoria_accesos (
  id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  accion ENUM('LOGIN','LOGOUT','REGISTRO','FALLO_LOGIN') NOT NULL,
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SERVICIO 2: DASHBOARD
-- ============================================================
USE clinica_dashboard;

CREATE TABLE IF NOT EXISTS metricas_diarias (
  id_metrica INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE UNIQUE NOT NULL,
  total_citas INT DEFAULT 0,
  citas_atendidas INT DEFAULT 0,
  citas_canceladas INT DEFAULT 0,
  total_ventas_farmacia DECIMAL(12,2) DEFAULT 0,
  total_ventas_accesorios DECIMAL(12,2) DEFAULT 0,
  total_propietarios_nuevos INT DEFAULT 0,
  total_mascotas_nuevas INT DEFAULT 0,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cache_kpis (
  id_kpi INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  valor DECIMAL(12,2),
  unidad VARCHAR(20),
  fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SERVICIO 3: GESTIÓN DE PROPIETARIOS
-- ============================================================
USE clinica_propietarios;

CREATE TABLE IF NOT EXISTS propietarios (
  id_propietario INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  dni VARCHAR(8) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(15),
  email VARCHAR(100),
  direccion VARCHAR(200),
  distrito VARCHAR(80),
  estado ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dni (dni),
  INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS contactos_emergencia (
  id_contacto INT AUTO_INCREMENT PRIMARY KEY,
  id_propietario INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  parentesco VARCHAR(50),
  FOREIGN KEY (id_propietario) REFERENCES propietarios(id_propietario) ON DELETE CASCADE
);

-- ============================================================
-- SERVICIO 4: GESTIÓN DE MASCOTAS
-- ============================================================
USE clinica_mascotas;

CREATE TABLE IF NOT EXISTS especies (
  id_especie INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS razas (
  id_raza INT AUTO_INCREMENT PRIMARY KEY,
  id_especie INT NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  FOREIGN KEY (id_especie) REFERENCES especies(id_especie),
  UNIQUE KEY uk_raza (id_especie, nombre)
);

CREATE TABLE IF NOT EXISTS mascotas (
  id_mascota INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  id_propietario INT NOT NULL,
  id_especie INT NOT NULL,
  id_raza INT,
  nombre VARCHAR(80) NOT NULL,
  sexo ENUM('MACHO','HEMBRA') NOT NULL,
  fecha_nacimiento DATE,
  peso_kg DECIMAL(5,2),
  color VARCHAR(50),
  numero_chip VARCHAR(30) UNIQUE,
  alergias TEXT,
  observaciones TEXT,
  estado ENUM('ACTIVO','INACTIVO','FALLECIDO') DEFAULT 'ACTIVO',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_propietario (id_propietario),
  INDEX idx_chip (numero_chip),
  FOREIGN KEY (id_especie) REFERENCES especies(id_especie),
  FOREIGN KEY (id_raza) REFERENCES razas(id_raza)
);

-- ============================================================
-- SERVICIO 5: GESTIÓN DE PERSONAL MÉDICO
-- ============================================================
USE clinica_veterinarios;

CREATE TABLE IF NOT EXISTS especialidades (
  id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS veterinarios (
  id_veterinario INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  id_usuario INT,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  colegiatura VARCHAR(20) UNIQUE,
  id_especialidad INT,
  telefono VARCHAR(15),
  email VARCHAR(100),
  horario_inicio TIME,
  horario_fin TIME,
  disponible BOOLEAN DEFAULT TRUE,
  estado ENUM('ACTIVO','INACTIVO','VACACIONES') DEFAULT 'ACTIVO',
  FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad)
);

CREATE TABLE IF NOT EXISTS tecnicos (
  id_tecnico INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  area VARCHAR(80),
  telefono VARCHAR(15),
  estado ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO'
);

CREATE TABLE IF NOT EXISTS horarios_atencion (
  id_horario INT AUTO_INCREMENT PRIMARY KEY,
  id_veterinario INT NOT NULL,
  dia_semana ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id_veterinario)
);

-- ============================================================
-- SERVICIO 6: VENTA DE ACCESORIOS
-- ============================================================
USE clinica_accesorios;

CREATE TABLE IF NOT EXISTS categorias_accesorio (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS productos_accesorios (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(200),
  id_categoria INT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  stock_minimo INT DEFAULT 5,
  estado ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  FOREIGN KEY (id_categoria) REFERENCES categorias_accesorio(id_categoria)
);

CREATE TABLE IF NOT EXISTS ventas_accesorios (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  codigo_venta VARCHAR(20) UNIQUE,
  id_propietario INT NOT NULL,
  total DECIMAL(10,2),
  estado ENUM('PENDIENTE_PAGO','PAGADA','CANCELADA') DEFAULT 'PENDIENTE_PAGO',
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalle_venta_accesorios (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  FOREIGN KEY (id_venta) REFERENCES ventas_accesorios(id_venta) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos_accesorios(id_producto)
);

-- ============================================================
-- SERVICIO 7: REGISTRO DE CITAS
-- ============================================================
USE clinica_citas;

CREATE TABLE IF NOT EXISTS tipos_cita (
  id_tipo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) UNIQUE NOT NULL,
  duracion_minutos INT DEFAULT 30,
  costo_base DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS estados_cita (
  id_estado INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS citas (
  id_cita INT AUTO_INCREMENT PRIMARY KEY,
  codigo_cita VARCHAR(20) UNIQUE,
  id_propietario INT NOT NULL,
  id_mascota INT NOT NULL,
  id_veterinario INT NOT NULL,
  id_tipo INT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo VARCHAR(200),
  observaciones TEXT,
  estado ENUM('PENDIENTE','CONFIRMADA','CANCELADA','ATENDIDA','NO_ASISTIO') DEFAULT 'PENDIENTE',
  motivo_cancelacion VARCHAR(200),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha),
  INDEX idx_propietario (id_propietario),
  INDEX idx_mascota (id_mascota),
  INDEX idx_veterinario (id_veterinario),
  FOREIGN KEY (id_tipo) REFERENCES tipos_cita(id_tipo)
);

CREATE TABLE IF NOT EXISTS historial_reprogramaciones (
  id_historial INT AUTO_INCREMENT PRIMARY KEY,
  id_cita INT NOT NULL,
  fecha_anterior DATE,
  hora_anterior TIME,
  fecha_nueva DATE,
  hora_nueva TIME,
  motivo VARCHAR(200),
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cita) REFERENCES citas(id_cita)
);

-- ============================================================
-- SERVICIO 8: VENTA DE FARMACÉUTICOS
-- ============================================================
USE clinica_farmacia;

CREATE TABLE IF NOT EXISTS categorias_farmaco (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS productos_farmacia (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(200),
  id_categoria INT,
  presentacion VARCHAR(80),
  precio DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  stock_minimo INT DEFAULT 5,
  requiere_receta BOOLEAN DEFAULT FALSE,
  fecha_vencimiento DATE,
  estado ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  FOREIGN KEY (id_categoria) REFERENCES categorias_farmaco(id_categoria)
);

CREATE TABLE IF NOT EXISTS recetas (
  id_receta INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  id_mascota INT NOT NULL,
  id_veterinario INT NOT NULL,
  id_cita INT,
  fecha_emision DATE NOT NULL,
  observaciones TEXT,
  estado ENUM('EMITIDA','DESPACHADA','VENCIDA') DEFAULT 'EMITIDA'
);

CREATE TABLE IF NOT EXISTS detalle_receta (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_receta INT NOT NULL,
  id_producto INT NOT NULL,
  dosis VARCHAR(100),
  frecuencia VARCHAR(100),
  duracion_dias INT,
  cantidad INT,
  FOREIGN KEY (id_receta) REFERENCES recetas(id_receta) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos_farmacia(id_producto)
);

CREATE TABLE IF NOT EXISTS ventas_farmacia (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  codigo_venta VARCHAR(20) UNIQUE,
  id_propietario INT NOT NULL,
  id_mascota INT,
  id_receta INT,
  total DECIMAL(10,2),
  estado ENUM('PENDIENTE_PAGO','PAGADA','CANCELADA') DEFAULT 'PENDIENTE_PAGO',
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalle_venta_farmacia (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  FOREIGN KEY (id_venta) REFERENCES ventas_farmacia(id_venta) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos_farmacia(id_producto)
);

-- ============================================================
-- SERVICIO 9: PAGOS
-- ============================================================
USE clinica_pagos;

CREATE TABLE IF NOT EXISTS metodos_pago (
  id_metodo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS pagos (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  codigo_pago VARCHAR(20) UNIQUE,
  id_propietario INT NOT NULL,
  tipo_venta ENUM('FARMACIA','ACCESORIOS','CITA','SERVICIO') NOT NULL,
  id_referencia INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'PEN',
  id_metodo INT,
  estado ENUM('PENDIENTE','PROCESANDO','CONFIRMADO','FALLIDO','REEMBOLSADO') DEFAULT 'PENDIENTE',
  referencia_externa VARCHAR(100),
  motivo_fallo VARCHAR(200),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_confirmacion TIMESTAMP NULL,
  FOREIGN KEY (id_metodo) REFERENCES metodos_pago(id_metodo),
  INDEX idx_estado (estado),
  INDEX idx_referencia (tipo_venta, id_referencia)
);

CREATE TABLE IF NOT EXISTS transacciones (
  id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
  id_pago INT NOT NULL,
  accion ENUM('CREAR','CONFIRMAR','FALLAR','REEMBOLSAR') NOT NULL,
  monto DECIMAL(10,2),
  respuesta_pasarela TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pago) REFERENCES pagos(id_pago) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comprobantes (
  id_comprobante INT AUTO_INCREMENT PRIMARY KEY,
  id_pago INT NOT NULL,
  tipo ENUM('BOLETA','FACTURA','NOTA_VENTA') DEFAULT 'BOLETA',
  serie VARCHAR(10),
  numero VARCHAR(20),
  subtotal DECIMAL(10,2),
  igv DECIMAL(10,2),
  total DECIMAL(10,2),
  fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pago) REFERENCES pagos(id_pago)
);

-- ============================================================
-- SERVICIO 10: NOTIFICACIONES
-- ============================================================
USE clinica_notificaciones;

CREATE TABLE IF NOT EXISTS plantillas_notificacion (
  id_plantilla INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  tipo ENUM('CONFIRMACION_CITA','RECORDATORIO_VACUNA','COMPROBANTE_VENTA',
            'CANCELACION','BIENVENIDA','RESULTADO_LABORATORIO') NOT NULL,
  asunto VARCHAR(200),
  cuerpo TEXT,
  canal_default ENUM('EMAIL','SMS','AMBOS') DEFAULT 'EMAIL'
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  id_propietario INT NOT NULL,
  id_plantilla INT,
  tipo ENUM('CONFIRMACION_CITA','RECORDATORIO_VACUNA','COMPROBANTE_VENTA',
            'CANCELACION','BIENVENIDA','RESULTADO_LABORATORIO') NOT NULL,
  canal ENUM('EMAIL','SMS','AMBOS') DEFAULT 'EMAIL',
  destinatario VARCHAR(100) NOT NULL,
  asunto VARCHAR(200),
  mensaje TEXT,
  estado ENUM('PENDIENTE','ENVIADO','FALLIDO','LEIDO') DEFAULT 'PENDIENTE',
  intentos INT DEFAULT 0,
  error_mensaje VARCHAR(200),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_envio TIMESTAMP NULL,
  FOREIGN KEY (id_plantilla) REFERENCES plantillas_notificacion(id_plantilla),
  INDEX idx_estado (estado),
  INDEX idx_propietario (id_propietario)
);

CREATE TABLE IF NOT EXISTS recordatorios_programados (
  id_recordatorio INT AUTO_INCREMENT PRIMARY KEY,
  id_propietario INT NOT NULL,
  id_mascota INT,
  tipo ENUM('VACUNA','CONTROL','DESPARASITACION') NOT NULL,
  descripcion VARCHAR(200),
  fecha_programada DATE NOT NULL,
  estado ENUM('PENDIENTE','ENVIADO','CANCELADO') DEFAULT 'PENDIENTE',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS log_envios (
  id_log INT AUTO_INCREMENT PRIMARY KEY,
  id_notificacion INT NOT NULL,
  canal VARCHAR(20),
  respuesta_proveedor TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_notificacion) REFERENCES notificaciones(id_notificacion) ON DELETE CASCADE
);