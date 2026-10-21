-- ============================================================
-- PROYECTO: Clínica Veterinaria Patitas Alegres
-- ARCHIVO: DB_users.sql
-- DESCRIPCIÓN: Crea usuarios MySQL, uno por servicio
-- ORDEN DE EJECUCIÓN: 2
-- PREREQUISITO: databases.sql
-- ============================================================

-- Servicio 1: Auth
CREATE USER IF NOT EXISTS 'svc_auth'@'localhost' IDENTIFIED BY 'Auth2026!';
GRANT ALL PRIVILEGES ON clinica_auth.* TO 'svc_auth'@'localhost';

-- Servicio 2: Dashboard
CREATE USER IF NOT EXISTS 'svc_dashboard'@'localhost' IDENTIFIED BY 'Dash2026!';
GRANT ALL PRIVILEGES ON clinica_dashboard.* TO 'svc_dashboard'@'localhost';

-- Servicio 3: Propietarios
CREATE USER IF NOT EXISTS 'svc_propietarios'@'localhost' IDENTIFIED BY 'Prop2026!';
GRANT ALL PRIVILEGES ON clinica_propietarios.* TO 'svc_propietarios'@'localhost';

-- Servicio 4: Mascotas
CREATE USER IF NOT EXISTS 'svc_mascotas'@'localhost' IDENTIFIED BY 'Masc2026!';
GRANT ALL PRIVILEGES ON clinica_mascotas.* TO 'svc_mascotas'@'localhost';

-- Servicio 5: Veterinarios
CREATE USER IF NOT EXISTS 'svc_veterinarios'@'localhost' IDENTIFIED BY 'Vet2026!';
GRANT ALL PRIVILEGES ON clinica_veterinarios.* TO 'svc_veterinarios'@'localhost';

-- Servicio 6: Accesorios
CREATE USER IF NOT EXISTS 'svc_accesorios'@'localhost' IDENTIFIED BY 'Acc2026!';
GRANT ALL PRIVILEGES ON clinica_accesorios.* TO 'svc_accesorios'@'localhost';

-- Servicio 7: Citas
CREATE USER IF NOT EXISTS 'svc_citas'@'localhost' IDENTIFIED BY 'Cit2026!';
GRANT ALL PRIVILEGES ON clinica_citas.* TO 'svc_citas'@'localhost';

-- Servicio 8: Farmacia
CREATE USER IF NOT EXISTS 'svc_farmacia'@'localhost' IDENTIFIED BY 'Far2026!';
GRANT ALL PRIVILEGES ON clinica_farmacia.* TO 'svc_farmacia'@'localhost';

-- Servicio 9: Pagos
CREATE USER IF NOT EXISTS 'svc_pagos'@'localhost' IDENTIFIED BY 'Pag2026!';
GRANT ALL PRIVILEGES ON clinica_pagos.* TO 'svc_pagos'@'localhost';

-- Servicio 10: Notificaciones
CREATE USER IF NOT EXISTS 'svc_notificaciones'@'localhost' IDENTIFIED BY 'Not2026!';
GRANT ALL PRIVILEGES ON clinica_notificaciones.* TO 'svc_notificaciones'@'localhost';

FLUSH PRIVILEGES;

-- Verificación
SELECT user, host FROM mysql.user WHERE user LIKE 'svc_%';
