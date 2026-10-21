-- ============================================================
-- PROYECTO: Clínica Veterinaria Patitas Alegres
-- ARCHIVO: seed-data.sql
-- DESCRIPCIÓN: Datos semilla (catálogos) para probar el sistema
-- ORDEN DE EJECUCIÓN: 3
-- PREREQUISITO: database.sql
-- ============================================================

-- ============================================================
-- SERVICIO 1: AUTENTICACIÓN - Roles
-- ============================================================
USE clinica_auth;

INSERT INTO roles (nombre, descripcion) VALUES
('ADMIN','Administrador del sistema'),
('VETERINARIO','Personal médico'),
('RECEPCION','Personal de recepción'),
('CLIENTE','Propietario de mascota');

-- Usuario admin por defecto (password: admin123)
-- Hash bcrypt de "admin123"
INSERT INTO usuarios (username, email, password_hash, id_rol) VALUES
('admin', 'admin@clinica.com', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1HlCS4bZJ1iKzP8vQ7qZ4rY5sY6tY7u', 1);

-- ============================================================
-- SERVICIO 5: VETERINARIOS - Especialidades
-- ============================================================
USE clinica_veterinarios;

INSERT INTO especialidades (nombre) VALUES
('Medicina General'),
('Cirugía'),
('Dermatología'),
('Oftalmología'),
('Odontología'),
('Cardiología');

-- ============================================================
-- SERVICIO 4: MASCOTAS - Especies y Razas
-- ============================================================
USE clinica_mascotas;

INSERT INTO especies (nombre) VALUES
('Canino'),
('Felino'),
('Ave'),
('Roedor'),
('Reptil');

INSERT INTO razas (id_especie, nombre) VALUES
(1,'Labrador'),(1,'Pastor Alemán'),(1,'Poodle'),(1,'Mestizo'),
(2,'Siamés'),(2,'Persa'),(2,'Mestizo'),
(3,'Loro'),(3,'Periquito'),
(4,'Hámster'),(4,'Cobayo');

-- ============================================================
-- SERVICIO 7: CITAS - Tipos y Estados
-- ============================================================
USE clinica_citas;

INSERT INTO tipos_cita (nombre, duracion_minutos, costo_base) VALUES
('Consulta General', 30, 50.00),
('Vacunación', 15, 80.00),
('Cirugía', 120, 500.00),
('Estética', 60, 40.00),
('Control', 20, 30.00);

INSERT INTO estados_cita (nombre) VALUES
('PENDIENTE'),('CONFIRMADA'),('CANCELADA'),('ATENDIDA'),('NO_ASISTIO');

-- ============================================================
-- SERVICIO 9: PAGOS - Métodos de pago
-- ============================================================
USE clinica_pagos;

INSERT INTO metodos_pago (nombre) VALUES
('EFECTIVO'),
('TARJETA'),
('YAPE'),
('PLIN'),
('TRANSFERENCIA');

-- ============================================================
-- SERVICIO 8: FARMACIA - Categorías
-- ============================================================
USE clinica_farmacia;

INSERT INTO categorias_farmaco (nombre) VALUES
('Antibióticos'),
('Antiparasitarios'),
('Antiinflamatorios'),
('Vitaminas'),
('Vacunas');

-- ============================================================
-- SERVICIO 6: ACCESORIOS - Categorías
-- ============================================================
USE clinica_accesorios;

INSERT INTO categorias_accesorio (nombre) VALUES
('Juguetes'),
('Camas'),
('Alimentos'),
('Collares'),
('Higiene');

-- ============================================================
-- SERVICIO 10: NOTIFICACIONES - Plantillas
-- ============================================================
USE clinica_notificaciones;

INSERT INTO plantillas_notificacion (codigo, tipo, asunto, cuerpo, canal_default) VALUES
('PL-CIT-01','CONFIRMACION_CITA','Confirmación de cita',
 'Estimado {nombre}, su cita para {mascota} está confirmada para el {fecha} a las {hora}.','EMAIL'),
('PL-VAC-01','RECORDATORIO_VACUNA','Recordatorio de vacuna',
 'Estimado {nombre}, la vacuna {vacuna} de {mascota} vence el {fecha}.','AMBOS'),
('PL-COM-01','COMPROBANTE_VENTA','Comprobante de compra',
 'Gracias por su compra. Total: S/ {total}.','EMAIL'),
('PL-CAN-01','CANCELACION','Cancelación de cita',
 'Estimado {nombre}, su cita para {mascota} del {fecha} ha sido cancelada. Motivo: {motivo}.','EMAIL'),
('PL-BIE-01','BIENVENIDA','Bienvenido a la Clínica Veterinaria',
 'Estimado {nombre}, gracias por registrarse. Su mascota {mascota} ya tiene historia clínica.','EMAIL');