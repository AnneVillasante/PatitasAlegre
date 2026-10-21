/**
 * ============================================================
 * VETCARE - GESTOR UNIVERSAL DE BASE DE DATOS (CRUD & LOGS)
 * Clínica Veterinaria Patitas Alegre
 * 
 * Gestiona las 32 tablas creadas en database/database.sql:
 * - 28 tablas operativas con soporte CRUD (Crear, Leer, Editar, Eliminar).
 * - 4 tablas de logs/auditoría configuradas como SOLO LECTURA:
 *    1. clinica_auth.auditoria_accesos
 *    2. clinica_citas.historial_reprogramaciones
 *    3. clinica_pagos.transacciones
 *    4. clinica_notificaciones.log_envios
 * ============================================================
 */

const DB_CATALOG = {
    schemas: [
        { id: "clinica_auth", nombre: "🔐 01. Autenticación & Seguridad", icono: "🔐" },
        { id: "clinica_dashboard", nombre: "📊 02. Dashboard & Métricas", icono: "📊" },
        { id: "clinica_propietarios", nombre: "👤 03. Gestión de Propietarios", icono: "👤" },
        { id: "clinica_mascotas", nombre: "🐾 04. Gestión de Mascotas", icono: "🐾" },
        { id: "clinica_veterinarios", nombre: "🩺 05. Personal Médico & Turnos", icono: "🩺" },
        { id: "clinica_accesorios", nombre: "🛍️ 06. Tienda de Accesorios", icono: "🛍️" },
        { id: "clinica_citas", nombre: "📅 07. Citas Médicas & Agenda", icono: "📅" },
        { id: "clinica_farmacia", nombre: "💊 08. Farmacia & Recetas", icono: "💊" },
        { id: "clinica_pagos", nombre: "💳 09. Pagos & Facturación", icono: "💳" },
        { id: "clinica_notificaciones", nombre: "🔔 10. Centro de Notificaciones", icono: "🔔" }
    ],

    tables: {
        // ============================================================
        // 1. clinica_auth
        // ============================================================
        roles: {
            schema: "clinica_auth",
            name: "roles",
            label: "Roles de Usuario",
            isLog: false,
            pk: "id_rol",
            fields: [
                { name: "id_rol", label: "ID Rol", type: "number", auto: true },
                { name: "nombre", label: "Nombre", type: "text", required: true },
                { name: "descripcion", label: "Descripción", type: "text" }
            ],
            seed: [
                { id_rol: 1, nombre: "ADMIN", descripcion: "Administrador con control total del sistema" },
                { id_rol: 2, nombre: "MEDICO", descripcion: "Médicos veterinarios con acceso clínico" },
                { id_rol: 3, nombre: "RECEPCIONISTA", descripcion: "Recepción, agenda de citas y caja" },
                { id_rol: 4, nombre: "CLIENTE", descripcion: "Propietarios de mascotas con portal de autoservicio" }
            ]
        },

        usuarios: {
            schema: "clinica_auth",
            name: "usuarios",
            label: "Usuarios del Sistema",
            isLog: false,
            pk: "id_usuario",
            fields: [
                { name: "id_usuario", label: "ID Usuario", type: "number", auto: true },
                { name: "username", label: "Usuario", type: "text", required: true },
                { name: "email", label: "Correo Electrónico", type: "email", required: true },
                { name: "password_hash", label: "Hash Contraseña", type: "text", required: true },
                { name: "id_rol", label: "ID Rol", type: "number", required: true },
                { name: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO", "BLOQUEADO"], required: true },
                { name: "intentos_fallidos", label: "Intentos Fallidos", type: "number" },
                { name: "fecha_registro", label: "Fecha Registro", type: "text", auto: true },
                { name: "ultimo_acceso", label: "Último Acceso", type: "text" }
            ],
            seed: [
                { id_usuario: 1, username: "admin", email: "admin@patitasalegre.pe", password_hash: "$2y$10$e0MYzXyjp...", id_rol: 1, estado: "ACTIVO", intentos_fallidos: 0, fecha_registro: "2026-01-10 08:30:00", ultimo_acceso: "2026-03-20 14:15:00" },
                { id_usuario: 2, username: "dra_mendoza", email: "valeria.mendoza@patitasalegre.pe", password_hash: "$2y$10$f9K1aZxc...", id_rol: 2, estado: "ACTIVO", intentos_fallidos: 0, fecha_registro: "2026-01-12 09:00:00", ultimo_acceso: "2026-03-20 12:45:00" },
                { id_usuario: 3, username: "recepcion1", email: "recepcion@patitasalegre.pe", password_hash: "$2y$10$h7Lm30pq...", id_rol: 3, estado: "ACTIVO", intentos_fallidos: 0, fecha_registro: "2026-01-15 10:00:00", ultimo_acceso: "2026-03-20 13:10:00" },
                { id_usuario: 4, username: "carlos_gomez", email: "carlos.gomez@gmail.com", password_hash: "$2y$10$u8Vw21rt...", id_rol: 4, estado: "ACTIVO", intentos_fallidos: 0, fecha_registro: "2026-02-01 11:20:00", ultimo_acceso: "2026-03-19 18:22:00" }
            ]
        },

        permisos: {
            schema: "clinica_auth",
            name: "permisos",
            label: "Permisos de Acceso",
            isLog: false,
            pk: "id_permiso",
            fields: [
                { name: "id_permiso", label: "ID Permiso", type: "number", auto: true },
                { name: "nombre", label: "Nombre", type: "text", required: true },
                { name: "descripcion", label: "Descripción", type: "text" }
            ],
            seed: [
                { id_permiso: 1, nombre: "VER_EXPEDIENTES", descripcion: "Acceso de lectura a historias clínicas" },
                { id_permiso: 2, nombre: "EDITAR_EXPEDIENTES", descripcion: "Creación y edición de diagnósticos clínicos" },
                { id_permiso: 3, nombre: "PROGRAMAR_CITAS", descripcion: "Creación y gestión de citas médicas" },
                { id_permiso: 4, nombre: "ADMINISTRAR_VENTAS", descripcion: "Emisión de comprobantes y cobros en caja" },
                { id_permiso: 5, nombre: "ADMINISTRAR_SISTEMA", descripcion: "Configuración global de microservicios" }
            ]
        },

        roles_permisos: {
            schema: "clinica_auth",
            name: "roles_permisos",
            label: "Asignación Roles-Permisos",
            isLog: false,
            pk: "id_rol",
            compositePk: ["id_rol", "id_permiso"],
            fields: [
                { name: "id_rol", label: "ID Rol", type: "number", required: true },
                { name: "id_permiso", label: "ID Permiso", type: "number", required: true }
            ],
            seed: [
                { id_rol: 1, id_permiso: 1 }, { id_rol: 1, id_permiso: 2 }, { id_rol: 1, id_permiso: 3 }, { id_rol: 1, id_permiso: 4 }, { id_rol: 1, id_permiso: 5 },
                { id_rol: 2, id_permiso: 1 }, { id_rol: 2, id_permiso: 2 }, { id_rol: 2, id_permiso: 3 },
                { id_rol: 3, id_permiso: 3 }, { id_rol: 3, id_permiso: 4 }
            ]
        },

        sesiones: {
            schema: "clinica_auth",
            name: "sesiones",
            label: "Sesiones de Usuario",
            isLog: false,
            pk: "id_sesion",
            fields: [
                { name: "id_sesion", label: "ID Sesión", type: "number", auto: true },
                { name: "id_usuario", label: "ID Usuario", type: "number", required: true },
                { name: "token", label: "Token JWT", type: "text", required: true },
                { name: "fecha_inicio", label: "Fecha Inicio", type: "text", auto: true },
                { name: "fecha_expiracion", label: "Fecha Expiración", type: "text" },
                { name: "ip", label: "Dirección IP", type: "text" },
                { name: "activa", label: "Activa", type: "select", options: ["1", "0"], required: true }
            ],
            seed: [
                { id_sesion: 1, id_usuario: 1, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.adm1...", fecha_inicio: "2026-03-20 08:00:00", fecha_expiracion: "2026-03-21 08:00:00", ip: "192.168.1.10", activa: "1" },
                { id_sesion: 2, id_usuario: 2, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.med2...", fecha_inicio: "2026-03-20 08:30:00", fecha_expiracion: "2026-03-21 08:30:00", ip: "192.168.1.15", activa: "1" }
            ]
        },

        // LOG TABLE 1
        auditoria_accesos: {
            schema: "clinica_auth",
            name: "auditoria_accesos",
            label: "Auditoría de Accesos (Log Inmutable)",
            isLog: true,
            pk: "id_auditoria",
            fields: [
                { name: "id_auditoria", label: "ID Auditoría", type: "number", auto: true },
                { name: "id_usuario", label: "ID Usuario", type: "number" },
                { name: "accion", label: "Acción", type: "text" },
                { name: "ip", label: "IP Cliente", type: "text" },
                { name: "user_agent", label: "Navegador / Dispositivo", type: "text" },
                { name: "fecha", label: "Fecha & Hora Evento", type: "text", auto: true }
            ],
            seed: [
                { id_auditoria: 1, id_usuario: 1, accion: "LOGIN", ip: "192.168.1.10", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0", fecha: "2026-03-20 08:00:01" },
                { id_auditoria: 2, id_usuario: 2, accion: "LOGIN", ip: "192.168.1.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0", fecha: "2026-03-20 08:30:12" },
                { id_auditoria: 3, id_usuario: 4, accion: "REGISTRO", ip: "200.48.12.5", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1", fecha: "2026-03-20 09:15:33" },
                { id_auditoria: 4, id_usuario: 3, accion: "LOGIN", ip: "192.168.1.20", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/122.0", fecha: "2026-03-20 09:30:00" },
                { id_auditoria: 5, id_usuario: null, accion: "FALLO_LOGIN", ip: "181.65.22.100", user_agent: "Python-urllib/3.9", fecha: "2026-03-20 10:02:18" }
            ]
        },

        // ============================================================
        // 2. clinica_dashboard
        // ============================================================
        metricas_diarias: {
            schema: "clinica_dashboard",
            name: "metricas_diarias",
            label: "Métricas Diarias de Gestión",
            isLog: false,
            pk: "id_metrica",
            fields: [
                { name: "id_metrica", label: "ID Métrica", type: "number", auto: true },
                { name: "fecha", label: "Fecha", type: "date", required: true },
                { name: "total_citas", label: "Total Citas", type: "number" },
                { name: "citas_atendidas", label: "Citas Atendidas", type: "number" },
                { name: "citas_canceladas", label: "Citas Canceladas", type: "number" },
                { name: "total_ventas_farmacia", label: "Ventas Farmacia (S/)", type: "number" },
                { name: "total_ventas_accesorios", label: "Ventas Accesorios (S/)", type: "number" },
                { name: "total_propietarios_nuevos", label: "Nuevos Propietarios", type: "number" },
                { name: "total_mascotas_nuevas", label: "Nuevas Mascotas", type: "number" }
            ],
            seed: [
                { id_metrica: 1, fecha: "2026-03-18", total_citas: 14, citas_atendidas: 12, citas_canceladas: 2, total_ventas_farmacia: 1850.50, total_ventas_accesorios: 940.00, total_propietarios_nuevos: 3, total_mascotas_nuevas: 4 },
                { id_metrica: 2, fecha: "2026-03-19", total_citas: 18, citas_atendidas: 16, citas_canceladas: 1, total_ventas_farmacia: 2320.00, total_ventas_accesorios: 1120.50, total_propietarios_nuevos: 5, total_mascotas_nuevas: 6 },
                { id_metrica: 3, fecha: "2026-03-20", total_citas: 15, citas_atendidas: 10, citas_canceladas: 0, total_ventas_farmacia: 1450.00, total_ventas_accesorios: 780.00, total_propietarios_nuevos: 2, total_mascotas_nuevas: 3 }
            ]
        },

        cache_kpis: {
            schema: "clinica_dashboard",
            name: "cache_kpis",
            label: "Caché de KPIs",
            isLog: false,
            pk: "id_kpi",
            fields: [
                { name: "id_kpi", label: "ID KPI", type: "number", auto: true },
                { name: "nombre", label: "Nombre KPI", type: "text", required: true },
                { name: "valor", label: "Valor Numérico", type: "number", required: true },
                { name: "unidad", label: "Unidad", type: "text" },
                { name: "fecha_calculo", label: "Fecha Cálculo", type: "text", auto: true }
            ],
            seed: [
                { id_kpi: 1, nombre: "TASA_SATISFACCION_CLIENTE", valor: 97.5, unidad: "%", fecha_calculo: "2026-03-20 07:00:00" },
                { id_kpi: 2, nombre: "TASA_ASISTENCIA_CITAS", valor: 91.2, unidad: "%", fecha_calculo: "2026-03-20 07:00:00" },
                { id_kpi: 3, nombre: "TICKET_PROMEDIO_ATENCION", valor: 145.80, unidad: "PEN", fecha_calculo: "2026-03-20 07:00:00" },
                { id_kpi: 4, nombre: "PACIENTES_ACTIVOS_MES", valor: 248.0, unidad: "mascotas", fecha_calculo: "2026-03-20 07:00:00" }
            ]
        },

        // ============================================================
        // 3. clinica_propietarios
        // ============================================================
        propietarios: {
            schema: "clinica_propietarios",
            name: "propietarios",
            label: "Directorio de Propietarios",
            isLog: false,
            pk: "id_propietario",
            fields: [
                { name: "id_propietario", label: "ID Propietario", type: "number", auto: true },
                { name: "codigo", label: "Código", type: "text" },
                { name: "dni", label: "DNI", type: "text", required: true },
                { name: "nombres", label: "Nombres", type: "text", required: true },
                { name: "apellidos", label: "Apellidos", type: "text", required: true },
                { name: "telefono", label: "Teléfono", type: "tel" },
                { name: "email", label: "Correo", type: "email" },
                { name: "direccion", label: "Dirección", type: "text" },
                { name: "distrito", label: "Distrito", type: "text" },
                { name: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO"], required: true }
            ],
            seed: [
                { id_propietario: 1, codigo: "PROP-001", dni: "72345678", nombres: "Carlos", apellidos: "Gómez Rivas", telefono: "987654321", email: "carlos.gomez@gmail.com", direccion: "Av. Larco 450", distrito: "Miraflores", estado: "ACTIVO" },
                { id_propietario: 2, codigo: "PROP-002", dni: "45678912", nombres: "Ana María", apellidos: "Torres Paz", telefono: "976543210", email: "ana.torres@gmail.com", direccion: "Jr. Huáscar 820", distrito: "Jesús María", estado: "ACTIVO" },
                { id_propietario: 3, codigo: "PROP-003", dni: "12345678", nombres: "Luis Alberto", apellidos: "Mendoza Vega", telefono: "965432109", email: "luis.mendoza@gmail.com", direccion: "Calle Los Cedros 123", distrito: "San Isidro", estado: "ACTIVO" },
                { id_propietario: 4, codigo: "PROP-004", dni: "87654321", nombres: "Mariana", apellidos: "Rojas Silva", telefono: "954321098", email: "mariana.rojas@gmail.com", direccion: "Av. Brasil 1450", distrito: "Pueblo Libre", estado: "ACTIVO" }
            ]
        },

        contactos_emergencia: {
            schema: "clinica_propietarios",
            name: "contactos_emergencia",
            label: "Contactos de Emergencia",
            isLog: false,
            pk: "id_contacto",
            fields: [
                { name: "id_contacto", label: "ID Contacto", type: "number", auto: true },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "nombre", label: "Nombre Completo", type: "text", required: true },
                { name: "telefono", label: "Teléfono", type: "tel", required: true },
                { name: "parentesco", label: "Parentesco", type: "text" }
            ],
            seed: [
                { id_contacto: 1, id_propietario: 1, nombre: "Elena Gómez", telefono: "987000111", parentesco: "Hermana" },
                { id_contacto: 2, id_propietario: 2, nombre: "Roberto Torres", telefono: "976111222", parentesco: "Esposo" },
                { id_contacto: 3, id_propietario: 3, nombre: "Carmen Vega", telefono: "965222333", parentesco: "Madre" }
            ]
        },

        // ============================================================
        // 4. clinica_mascotas
        // ============================================================
        especies: {
            schema: "clinica_mascotas",
            name: "especies",
            label: "Especies Animales",
            isLog: false,
            pk: "id_especie",
            fields: [
                { name: "id_especie", label: "ID Especie", type: "number", auto: true },
                { name: "nombre", label: "Nombre Especie", type: "text", required: true }
            ],
            seed: [
                { id_especie: 1, nombre: "Canino" },
                { id_especie: 2, nombre: "Felino" },
                { id_especie: 3, nombre: "Ave" },
                { id_especie: 4, nombre: "Roedor" },
                { id_especie: 5, nombre: "Reptil" }
            ]
        },

        razas: {
            schema: "clinica_mascotas",
            name: "razas",
            label: "Razas por Especie",
            isLog: false,
            pk: "id_raza",
            fields: [
                { name: "id_raza", label: "ID Raza", type: "number", auto: true },
                { name: "id_especie", label: "ID Especie", type: "number", required: true },
                { name: "nombre", label: "Nombre Raza", type: "text", required: true }
            ],
            seed: [
                { id_raza: 1, id_especie: 1, nombre: "Golden Retriever" },
                { id_raza: 2, id_especie: 1, nombre: "Pastor Alemán" },
                { id_raza: 3, id_especie: 1, nombre: "Poodle" },
                { id_raza: 4, id_especie: 1, nombre: "Mestizo Canino" },
                { id_raza: 5, id_especie: 2, nombre: "Siamés" },
                { id_raza: 6, id_especie: 2, nombre: "Persa" },
                { id_raza: 7, id_especie: 2, nombre: "Mestizo Felino" },
                { id_raza: 8, id_especie: 3, nombre: "Loro Cabeza Amarilla" },
                { id_raza: 9, id_especie: 4, nombre: "Hámster Sirio" }
            ]
        },

        mascotas: {
            schema: "clinica_mascotas",
            name: "mascotas",
            label: "Registro de Mascotas",
            isLog: false,
            pk: "id_mascota",
            fields: [
                { name: "id_mascota", label: "ID Mascota", type: "number", auto: true },
                { name: "codigo", label: "Código", type: "text" },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "id_especie", label: "ID Especie", type: "number", required: true },
                { name: "id_raza", label: "ID Raza", type: "number" },
                { name: "nombre", label: "Nombre Paciente", type: "text", required: true },
                { name: "sexo", label: "Sexo", type: "select", options: ["MACHO", "HEMBRA"], required: true },
                { name: "fecha_nacimiento", label: "Fecha Nacimiento", type: "date" },
                { name: "peso_kg", label: "Peso (kg)", type: "number" },
                { name: "color", label: "Color / Pelaje", type: "text" },
                { name: "numero_chip", label: "N° Microchip", type: "text" },
                { name: "alergias", label: "Alergias Conocidas", type: "textarea" },
                { name: "observaciones", label: "Observaciones Clínicas", type: "textarea" },
                { name: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO", "FALLECIDO"], required: true }
            ],
            seed: [
                { id_mascota: 1, codigo: "MAS-001", id_propietario: 1, id_especie: 1, id_raza: 1, nombre: "Rocky", sexo: "MACHO", fecha_nacimiento: "2022-04-10", peso_kg: 28.5, color: "Dorado", numero_chip: "985141002345671", alergias: "Pollo procesado", observaciones: "Dócil, vacunación séxtuple al día", estado: "ACTIVO" },
                { id_mascota: 2, codigo: "MAS-002", id_propietario: 2, id_especie: 2, id_raza: 5, nombre: "Luna", sexo: "HEMBRA", fecha_nacimiento: "2023-01-15", peso_kg: 4.2, color: "Crema y café", numero_chip: "985141002345672", alergias: "Ninguna", observaciones: "Esterilizada", estado: "ACTIVO" },
                { id_mascota: 3, codigo: "MAS-003", id_propietario: 3, id_especie: 1, id_raza: 3, nombre: "Max", sexo: "MACHO", fecha_nacimiento: "2021-08-20", peso_kg: 6.8, color: "Blanco", numero_chip: "985141002345673", alergias: "Picadura de pulgas", observaciones: "Requiere profilaxis dental", estado: "ACTIVO" },
                { id_mascota: 4, codigo: "MAS-004", id_propietario: 4, id_especie: 2, id_raza: 7, nombre: "Mimi", sexo: "HEMBRA", fecha_nacimiento: "2024-02-05", peso_kg: 3.1, color: "Atigrado", numero_chip: "985141002345674", alergias: "Ninguna", observaciones: "Cachorra en control de vacunas", estado: "ACTIVO" }
            ]
        },

        // ============================================================
        // 5. clinica_veterinarios
        // ============================================================
        especialidades: {
            schema: "clinica_veterinarios",
            name: "especialidades",
            label: "Especialidades Médicas",
            isLog: false,
            pk: "id_especialidad",
            fields: [
                { name: "id_especialidad", label: "ID Especialidad", type: "number", auto: true },
                { name: "nombre", label: "Nombre Especialidad", type: "text", required: true }
            ],
            seed: [
                { id_especialidad: 1, nombre: "Medicina General" },
                { id_especialidad: 2, nombre: "Cirugía de Tejidos Blandos" },
                { id_especialidad: 3, nombre: "Dermatología Veterinaria" },
                { id_especialidad: 4, nombre: "Oftalmología" },
                { id_especialidad: 5, nombre: "Odontología y Profilaxis" },
                { id_especialidad: 6, nombre: "Cardiología" }
            ]
        },

        veterinarios: {
            schema: "clinica_veterinarios",
            name: "veterinarios",
            label: "Médicos Veterinarios",
            isLog: false,
            pk: "id_veterinario",
            fields: [
                { name: "id_veterinario", label: "ID Veterinario", type: "number", auto: true },
                { name: "codigo", label: "Código", type: "text" },
                { name: "id_usuario", label: "ID Usuario", type: "number" },
                { name: "nombres", label: "Nombres", type: "text", required: true },
                { name: "apellidos", label: "Apellidos", type: "text", required: true },
                { name: "colegiatura", label: "N° Colegiatura (CMVP)", type: "text", required: true },
                { name: "id_especialidad", label: "ID Especialidad", type: "number" },
                { name: "telefono", label: "Teléfono", type: "tel" },
                { name: "email", label: "Correo", type: "email" },
                { name: "horario_inicio", label: "Hora Entrada", type: "time" },
                { name: "horario_fin", label: "Hora Salida", type: "time" },
                { name: "disponible", label: "Disponible", type: "select", options: ["1", "0"], required: true },
                { name: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO", "VACACIONES"], required: true }
            ],
            seed: [
                { id_veterinario: 1, codigo: "VET-001", id_usuario: 2, nombres: "Valeria", apellidos: "Mendoza Rojas", colegiatura: "CMVP-08421", id_especialidad: 1, telefono: "991234567", email: "valeria.mendoza@patitasalegre.pe", horario_inicio: "08:00", horario_fin: "14:00", disponible: "1", estado: "ACTIVO" },
                { id_veterinario: 2, codigo: "VET-002", id_usuario: null, nombres: "Martín", apellidos: "Salazar Castro", colegiatura: "CMVP-07519", id_especialidad: 2, telefono: "992345678", email: "martin.salazar@patitasalegre.pe", horario_inicio: "14:00", horario_fin: "20:00", disponible: "1", estado: "ACTIVO" },
                { id_veterinario: 3, codigo: "VET-003", id_usuario: null, nombres: "Claudia", apellidos: "Paredes Rivas", colegiatura: "CMVP-09134", id_especialidad: 3, telefono: "993456789", email: "claudia.paredes@patitasalegre.pe", horario_inicio: "09:00", horario_fin: "17:00", disponible: "1", estado: "ACTIVO" }
            ]
        },

        tecnicos: {
            schema: "clinica_veterinarios",
            name: "tecnicos",
            label: "Técnicos & Asistentes",
            isLog: false,
            pk: "id_tecnico",
            fields: [
                { name: "id_tecnico", label: "ID Técnico", type: "number", auto: true },
                { name: "codigo", label: "Código", type: "text" },
                { name: "nombres", label: "Nombres", type: "text", required: true },
                { name: "apellidos", label: "Apellidos", type: "text", required: true },
                { name: "area", label: "Área de Desempeño", type: "text" },
                { name: "telefono", label: "Teléfono", type: "tel" },
                { name: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO"], required: true }
            ],
            seed: [
                { id_tecnico: 1, codigo: "TEC-001", nombres: "Jorge", apellidos: "Herrera Ramos", area: "Quirófano e Instrumental", telefono: "981122334", estado: "ACTIVO" },
                { id_tecnico: 2, codigo: "TEC-002", nombres: "Sara", apellidos: "Cárdenas Vela", area: "Laboratorio y Muestras", telefono: "982233445", estado: "ACTIVO" }
            ]
        },

        horarios_atencion: {
            schema: "clinica_veterinarios",
            name: "horarios_atencion",
            label: "Horarios Semanales de Atención",
            isLog: false,
            pk: "id_horario",
            fields: [
                { name: "id_horario", label: "ID Horario", type: "number", auto: true },
                { name: "id_veterinario", label: "ID Veterinario", type: "number", required: true },
                { name: "dia_semana", label: "Día de Semana", type: "select", options: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"], required: true },
                { name: "hora_inicio", label: "Hora Inicio", type: "time", required: true },
                { name: "hora_fin", label: "Hora Fin", type: "time", required: true }
            ],
            seed: [
                { id_horario: 1, id_veterinario: 1, dia_semana: "LUNES", hora_inicio: "08:00:00", hora_fin: "14:00:00" },
                { id_horario: 2, id_veterinario: 1, dia_semana: "MIERCOLES", hora_inicio: "08:00:00", hora_fin: "14:00:00" },
                { id_horario: 3, id_veterinario: 2, dia_semana: "MARTES", hora_inicio: "14:00:00", hora_fin: "20:00:00" },
                { id_horario: 4, id_veterinario: 2, dia_semana: "JUEVES", hora_inicio: "14:00:00", hora_fin: "20:00:00" }
            ]
        },

        // ============================================================
        // 6. clinica_accesorios
        // ============================================================
        categorias_accesorio: {
            schema: "clinica_accesorios",
            name: "categorias_accesorio",
            label: "Categorías de Accesorios",
            isLog: false,
            pk: "id_categoria",
            fields: [
                { name: "id_categoria", label: "ID Categoría", type: "number", auto: true },
                { name: "nombre", label: "Nombre Categoría", type: "text", required: true }
            ],
            seed: [
                { id_categoria: 1, nombre: "Juguetes Interactivos" },
                { id_categoria: 2, nombre: "Camas y Casas" },
                { id_categoria: 3, nombre: "Alimentos Premium" },
                { id_categoria: 4, nombre: "Collares y Correas" },
                { id_categoria: 5, nombre: "Higiene y Belleza" }
            ]
        },

        productos_accesorios: {
            schema: "clinica_accesorios",
            name: "productos_accesorios",
            label: "Catálogo de Accesorios",
            isLog: false,
            pk: "id_producto",
            fields: [
                { name: "id_producto", label: "ID Producto", type: "number", auto: true },
                { name: "codigo", label: "Código", type: "text" },
                { name: "nombre", label: "Nombre Producto", type: "text", required: true },
                { name: "descripcion", label: "Descripción", type: "text" },
                { name: "id_categoria", label: "ID Categoría", type: "number" },
                { name: "precio", label: "Precio (S/)", type: "number", required: true },
                { name: "stock", label: "Stock Disponible", type: "number", required: true },
                { name: "stock_minimo", label: "Stock Mínimo", type: "number" },
                { name: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO"], required: true }
            ],
            seed: [
                { id_producto: 1, codigo: "ACC-001", nombre: "Pelota Kong Classic Grande", descripcion: "Juguete masticable de caucho ultra resistente para perros", id_categoria: 1, precio: 45.00, stock: 24, stock_minimo: 5, estado: "ACTIVO" },
                { id_producto: 2, codigo: "ACC-002", nombre: "Cama Ortopédica Memory Foam", descripcion: "Cama acolchada antiestrés para razas medianas", id_categoria: 2, precio: 120.00, stock: 12, stock_minimo: 3, estado: "ACTIVO" },
                { id_producto: 3, codigo: "ACC-003", nombre: "Arnés Antitirones Reflectante", descripcion: "Arnés ergonómico regulable para paseos seguros", id_categoria: 4, precio: 55.00, stock: 18, stock_minimo: 4, estado: "ACTIVO" },
                { id_producto: 4, codigo: "ACC-004", nombre: "Shampoo Hipoalergénico de Avena", descripcion: "Fórmula suave sin sulfatos para piel sensible 500ml", id_categoria: 5, precio: 38.00, stock: 30, stock_minimo: 6, estado: "ACTIVO" }
            ]
        },

        ventas_accesorios: {
            schema: "clinica_accesorios",
            name: "ventas_accesorios",
            label: "Ventas de Accesorios",
            isLog: false,
            pk: "id_venta",
            fields: [
                { name: "id_venta", label: "ID Venta", type: "number", auto: true },
                { name: "codigo_venta", label: "Código Venta", type: "text" },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "total", label: "Total (S/)", type: "number", required: true },
                { name: "estado", label: "Estado Venta", type: "select", options: ["PENDIENTE_PAGO", "PAGADA", "CANCELADA"], required: true },
                { name: "fecha_venta", label: "Fecha Venta", type: "text", auto: true }
            ],
            seed: [
                { id_venta: 1, codigo_venta: "VACC-001", id_propietario: 1, total: 100.00, estado: "PAGADA", fecha_venta: "2026-03-18 11:30:00" },
                { id_venta: 2, codigo_venta: "VACC-002", id_propietario: 2, total: 55.00, estado: "PAGADA", fecha_venta: "2026-03-19 16:45:00" },
                { id_venta: 3, codigo_venta: "VACC-003", id_propietario: 4, total: 120.00, estado: "PENDIENTE_PAGO", fecha_venta: "2026-03-20 10:15:00" }
            ]
        },

        detalle_venta_accesorios: {
            schema: "clinica_accesorios",
            name: "detalle_venta_accesorios",
            label: "Detalle Venta Accesorios",
            isLog: false,
            pk: "id_detalle",
            fields: [
                { name: "id_detalle", label: "ID Detalle", type: "number", auto: true },
                { name: "id_venta", label: "ID Venta", type: "number", required: true },
                { name: "id_producto", label: "ID Producto", type: "number", required: true },
                { name: "cantidad", label: "Cantidad", type: "number", required: true },
                { name: "precio_unitario", label: "Precio Unitario", type: "number", required: true },
                { name: "subtotal", label: "Subtotal", type: "number", required: true }
            ],
            seed: [
                { id_detalle: 1, id_venta: 1, id_producto: 1, cantidad: 1, precio_unitario: 45.00, subtotal: 45.00 },
                { id_detalle: 2, id_venta: 1, id_producto: 3, cantidad: 1, precio_unitario: 55.00, subtotal: 55.00 },
                { id_detalle: 3, id_venta: 2, id_producto: 3, cantidad: 1, precio_unitario: 55.00, subtotal: 55.00 },
                { id_detalle: 4, id_venta: 3, id_producto: 2, cantidad: 1, precio_unitario: 120.00, subtotal: 120.00 }
            ]
        },

        // ============================================================
        // 7. clinica_citas
        // ============================================================
        tipos_cita: {
            schema: "clinica_citas",
            name: "tipos_cita",
            label: "Tipos de Cita Médica",
            isLog: false,
            pk: "id_tipo",
            fields: [
                { name: "id_tipo", label: "ID Tipo", type: "number", auto: true },
                { name: "nombre", label: "Nombre Tipo", type: "text", required: true },
                { name: "duracion_minutos", label: "Duración (min)", type: "number" },
                { name: "costo_base", label: "Costo Base (S/)", type: "number" }
            ],
            seed: [
                { id_tipo: 1, nombre: "Consulta Médica General", duracion_minutos: 30, costo_base: 50.00 },
                { id_tipo: 2, nombre: "Vacunación y Desparasitación", duracion_minutos: 20, costo_base: 70.00 },
                { id_tipo: 3, nombre: "Cirugía Especializada", duracion_minutos: 120, costo_base: 450.00 },
                { id_tipo: 4, nombre: "Profilaxis Dental", duracion_minutos: 60, costo_base: 120.00 },
                { id_tipo: 5, nombre: "Control Post-Operatorio", duracion_minutos: 20, costo_base: 30.00 }
            ]
        },

        estados_cita: {
            schema: "clinica_citas",
            name: "estados_cita",
            label: "Estados de Cita",
            isLog: false,
            pk: "id_estado",
            fields: [
                { name: "id_estado", label: "ID Estado", type: "number", auto: true },
                { name: "nombre", label: "Nombre Estado", type: "text", required: true }
            ],
            seed: [
                { id_estado: 1, nombre: "PENDIENTE" },
                { id_estado: 2, nombre: "CONFIRMADA" },
                { id_estado: 3, nombre: "ATENDIDA" },
                { id_estado: 4, nombre: "CANCELADA" },
                { id_estado: 5, nombre: "NO_ASISTIO" }
            ]
        },

        citas: {
            schema: "clinica_citas",
            name: "citas",
            label: "Programación de Citas",
            isLog: false,
            pk: "id_cita",
            fields: [
                { name: "id_cita", label: "ID Cita", type: "number", auto: true },
                { name: "codigo_cita", label: "Código Cita", type: "text" },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "id_mascota", label: "ID Mascota", type: "number", required: true },
                { name: "id_veterinario", label: "ID Veterinario", type: "number", required: true },
                { name: "id_tipo", label: "ID Tipo Cita", type: "number" },
                { name: "fecha", label: "Fecha", type: "date", required: true },
                { name: "hora", label: "Hora", type: "time", required: true },
                { name: "motivo", label: "Motivo Consulta", type: "text" },
                { name: "observaciones", label: "Observaciones", type: "textarea" },
                { name: "estado", label: "Estado", type: "select", options: ["PENDIENTE", "CONFIRMADA", "CANCELADA", "ATENDIDA", "NO_ASISTIO"], required: true },
                { name: "motivo_cancelacion", label: "Motivo Cancelación", type: "text" }
            ],
            seed: [
                { id_cita: 1, codigo_cita: "CIT-001", id_propietario: 1, id_mascota: 1, id_veterinario: 1, id_tipo: 1, fecha: "2026-03-22", hora: "09:30:00", motivo: "Chequeo de rutina anual", observaciones: "Revisar articulación cadera", estado: "CONFIRMADA", motivo_cancelacion: null },
                { id_cita: 2, codigo_cita: "CIT-002", id_propietario: 2, id_mascota: 2, id_veterinario: 1, id_tipo: 2, fecha: "2026-03-22", hora: "11:00:00", motivo: "Vacuna triple felina", observaciones: "Verificar peso previo", estado: "CONFIRMADA", motivo_cancelacion: null },
                { id_cita: 3, codigo_cita: "CIT-003", id_propietario: 3, id_mascota: 3, id_veterinario: 3, id_tipo: 1, fecha: "2026-03-23", hora: "10:15:00", motivo: "Picazón en orejas y piel", observaciones: "Posible dermatitis", estado: "PENDIENTE", motivo_cancelacion: null },
                { id_cita: 4, codigo_cita: "CIT-004", id_propietario: 4, id_mascota: 4, id_veterinario: 2, id_tipo: 5, fecha: "2026-03-18", hora: "15:00:00", motivo: "Retiro de puntos sutura", observaciones: "Cicatrización limpia", estado: "ATENDIDA", motivo_cancelacion: null }
            ]
        },

        // LOG TABLE 2
        historial_reprogramaciones: {
            schema: "clinica_citas",
            name: "historial_reprogramaciones",
            label: "Historial de Reprogramaciones (Log Inmutable)",
            isLog: true,
            pk: "id_historial",
            fields: [
                { name: "id_historial", label: "ID Historial", type: "number", auto: true },
                { name: "id_cita", label: "ID Cita", type: "number", required: true },
                { name: "fecha_anterior", label: "Fecha Anterior", type: "date" },
                { name: "hora_anterior", label: "Hora Anterior", type: "time" },
                { name: "fecha_nueva", label: "Fecha Nueva", type: "date" },
                { name: "hora_nueva", label: "Hora Nueva", type: "time" },
                { name: "motivo", label: "Motivo Cambio", type: "text" },
                { name: "fecha_cambio", label: "Fecha Registro Cambio", type: "text", auto: true }
            ],
            seed: [
                { id_historial: 1, id_cita: 1, fecha_anterior: "2026-03-21", hora_anterior: "16:00:00", fecha_nueva: "2026-03-22", hora_nueva: "09:30:00", motivo: "Propietario solicitó turno matutino", fecha_cambio: "2026-03-19 14:20:00" },
                { id_historial: 2, id_cita: 3, fecha_anterior: "2026-03-20", hora_anterior: "11:00:00", fecha_nueva: "2026-03-23", hora_nueva: "10:15:00", motivo: "Veterinaria especialista en cirugía de urgencia", fecha_cambio: "2026-03-20 09:10:00" }
            ]
        },

        // ============================================================
        // 8. clinica_farmacia
        // ============================================================
        categorias_farmaco: {
            schema: "clinica_farmacia",
            name: "categorias_farmaco",
            label: "Categorías de Fármacos",
            isLog: false,
            pk: "id_categoria",
            fields: [
                { name: "id_categoria", label: "ID Categoría", type: "number", auto: true },
                { name: "nombre", label: "Nombre Categoría", type: "text", required: true }
            ],
            seed: [
                { id_categoria: 1, nombre: "Antibióticos y Antimicrobianos" },
                { id_categoria: 2, nombre: "Antiparasitarios Internos / Externos" },
                { id_categoria: 3, nombre: "Antiinflamatorios y Analgésicos" },
                { id_categoria: 4, nombre: "Vitaminas y Suplementos" },
                { id_categoria: 5, nombre: "Biológicos y Vacunas" }
            ]
        },

        productos_farmacia: {
            schema: "clinica_farmacia",
            name: "productos_farmacia",
            label: "Vademécum de Farmacia",
            isLog: false,
            pk: "id_producto",
            fields: [
                { name: "id_producto", label: "ID Producto", type: "number", auto: true },
                { name: "codigo", label: "Código Fármaco", type: "text" },
                { name: "nombre", label: "Nombre Comercial", type: "text", required: true },
                { name: "descripcion", label: "Principio Activo", type: "text" },
                { name: "id_categoria", label: "ID Categoría", type: "number" },
                { name: "presentacion", label: "Presentación", type: "text" },
                { name: "precio", label: "Precio (S/)", type: "number", required: true },
                { name: "stock", label: "Stock", type: "number", required: true },
                { name: "stock_minimo", label: "Stock Mínimo", type: "number" },
                { name: "requiere_receta", label: "Requiere Receta", type: "select", options: ["1", "0"], required: true },
                { name: "fecha_vencimiento", label: "Fecha Vencimiento", type: "date" },
                { name: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO"], required: true }
            ],
            seed: [
                { id_producto: 1, codigo: "FARM-001", nombre: "Bravecto 20-40 kg", descripcion: "Fluralaner masticable protección 12 semanas contra pulgas y garrapatas", id_categoria: 2, presentacion: "Caja x 1 tableta", precio: 135.00, stock: 35, stock_minimo: 8, requiere_receta: "0", fecha_vencimiento: "2027-05-30", estado: "ACTIVO" },
                { id_producto: 2, codigo: "FARM-002", nombre: "Amoxicilina + Clavulánico 250mg", descripcion: "Antibiótico de amplio espectro bacteriano", id_categoria: 1, presentacion: "Caja x 10 tabletas", precio: 45.00, stock: 50, stock_minimo: 10, requiere_receta: "1", fecha_vencimiento: "2026-11-20", estado: "ACTIVO" },
                { id_producto: 3, codigo: "FARM-003", nombre: "Meloxicam Gotas 0.5%", descripcion: "Antiinflamatorio no esteroideo para dolores articulares", id_categoria: 3, presentacion: "Frasco gotero 15ml", precio: 32.50, stock: 28, stock_minimo: 5, requiere_receta: "1", fecha_vencimiento: "2027-01-15", estado: "ACTIVO" },
                { id_producto: 4, codigo: "FARM-004", nombre: "Super Pet Omega 3 & 6", descripcion: "Suplemento nutricional dermatológico y brillo de pelaje", id_categoria: 4, presentacion: "Frasco 120ml", precio: 48.00, stock: 40, stock_minimo: 6, requiere_receta: "0", fecha_vencimiento: "2027-09-10", estado: "ACTIVO" }
            ]
        },

        recetas: {
            schema: "clinica_farmacia",
            name: "recetas",
            label: "Prescripciones Médicas",
            isLog: false,
            pk: "id_receta",
            fields: [
                { name: "id_receta", label: "ID Receta", type: "number", auto: true },
                { name: "codigo", label: "Código Receta", type: "text" },
                { name: "id_mascota", label: "ID Mascota", type: "number", required: true },
                { name: "id_veterinario", label: "ID Veterinario", type: "number", required: true },
                { name: "id_cita", label: "ID Cita", type: "number" },
                { name: "fecha_emision", label: "Fecha Emisión", type: "date", required: true },
                { name: "observaciones", label: "Indicaciones Generales", type: "textarea" },
                { name: "estado", label: "Estado Receta", type: "select", options: ["EMITIDA", "DESPACHADA", "VENCIDA"], required: true }
            ],
            seed: [
                { id_receta: 1, codigo: "REC-2026-001", id_mascota: 1, id_veterinario: 1, id_cita: 1, fecha_emision: "2026-03-18", observaciones: "Administrar con alimento húmedo por las mañanas", estado: "DESPACHADA" },
                { id_receta: 2, codigo: "REC-2026-002", id_mascota: 3, id_veterinario: 3, id_cita: 3, fecha_emision: "2026-03-20", observaciones: "Tratamiento dermatológico durante 14 días", estado: "EMITIDA" }
            ]
        },

        detalle_receta: {
            schema: "clinica_farmacia",
            name: "detalle_receta",
            label: "Detalle de Medicamentos en Receta",
            isLog: false,
            pk: "id_detalle",
            fields: [
                { name: "id_detalle", label: "ID Detalle", type: "number", auto: true },
                { name: "id_receta", label: "ID Receta", type: "number", required: true },
                { name: "id_producto", label: "ID Producto Farmacia", type: "number", required: true },
                { name: "dosis", label: "Dosis Prescrita", type: "text" },
                { name: "frecuencia", label: "Frecuencia", type: "text" },
                { name: "duracion_dias", label: "Días de Tratamiento", type: "number" },
                { name: "cantidad", label: "Cantidad a Dispensar", type: "number" }
            ],
            seed: [
                { id_detalle: 1, id_receta: 1, id_producto: 3, dosis: "5 gotas", frecuencia: "Cada 24 horas", duracion_dias: 5, cantidad: 1 },
                { id_detalle: 2, id_receta: 2, id_producto: 2, dosis: "1 tableta", frecuencia: "Cada 12 horas", duracion_dias: 7, cantidad: 14 },
                { id_detalle: 3, id_receta: 2, id_producto: 4, dosis: "3 ml", frecuencia: "Cada 24 horas", duracion_dias: 30, cantidad: 1 }
            ]
        },

        ventas_farmacia: {
            schema: "clinica_farmacia",
            name: "ventas_farmacia",
            label: "Ventas de Farmacia",
            isLog: false,
            pk: "id_venta",
            fields: [
                { name: "id_venta", label: "ID Venta", type: "number", auto: true },
                { name: "codigo_venta", label: "Código Venta", type: "text" },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "id_mascota", label: "ID Mascota", type: "number" },
                { name: "id_receta", label: "ID Receta", type: "number" },
                { name: "total", label: "Total (S/)", type: "number", required: true },
                { name: "estado", label: "Estado Venta", type: "select", options: ["PENDIENTE_PAGO", "PAGADA", "CANCELADA"], required: true },
                { name: "fecha_venta", label: "Fecha Venta", type: "text", auto: true }
            ],
            seed: [
                { id_venta: 1, codigo_venta: "VFARM-001", id_propietario: 1, id_mascota: 1, id_receta: 1, total: 32.50, estado: "PAGADA", fecha_venta: "2026-03-18 12:15:00" },
                { id_venta: 2, codigo_venta: "VFARM-002", id_propietario: 2, id_mascota: 2, id_receta: null, total: 135.00, estado: "PAGADA", fecha_venta: "2026-03-19 17:00:00" }
            ]
        },

        detalle_venta_farmacia: {
            schema: "clinica_farmacia",
            name: "detalle_venta_farmacia",
            label: "Detalle Venta Farmacia",
            isLog: false,
            pk: "id_detalle",
            fields: [
                { name: "id_detalle", label: "ID Detalle", type: "number", auto: true },
                { name: "id_venta", label: "ID Venta", type: "number", required: true },
                { name: "id_producto", label: "ID Producto", type: "number", required: true },
                { name: "cantidad", label: "Cantidad", type: "number", required: true },
                { name: "precio_unitario", label: "Precio Unitario", type: "number", required: true },
                { name: "subtotal", label: "Subtotal", type: "number", required: true }
            ],
            seed: [
                { id_detalle: 1, id_venta: 1, id_producto: 3, cantidad: 1, precio_unitario: 32.50, subtotal: 32.50 },
                { id_detalle: 2, id_venta: 2, id_producto: 1, cantidad: 1, precio_unitario: 135.00, subtotal: 135.00 }
            ]
        },

        // ============================================================
        // 9. clinica_pagos
        // ============================================================
        metodos_pago: {
            schema: "clinica_pagos",
            name: "metodos_pago",
            label: "Métodos de Pago",
            isLog: false,
            pk: "id_metodo",
            fields: [
                { name: "id_metodo", label: "ID Método", type: "number", auto: true },
                { name: "nombre", label: "Nombre Método", type: "text", required: true }
            ],
            seed: [
                { id_metodo: 1, nombre: "EFECTIVO" },
                { id_metodo: 2, nombre: "TARJETA DE CRÉDITO/DÉBITO" },
                { id_metodo: 3, nombre: "YAPE" },
                { id_metodo: 4, nombre: "PLIN" },
                { id_metodo: 5, nombre: "TRANSFERENCIA BANCARIA" }
            ]
        },

        pagos: {
            schema: "clinica_pagos",
            name: "pagos",
            label: "Gestión de Cobros & Pagos",
            isLog: false,
            pk: "id_pago",
            fields: [
                { name: "id_pago", label: "ID Pago", type: "number", auto: true },
                { name: "codigo_pago", label: "Código Pago", type: "text" },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "tipo_venta", label: "Tipo Venta", type: "select", options: ["FARMACIA", "ACCESORIOS", "CITA", "SERVICIO"], required: true },
                { name: "id_referencia", label: "ID Referencia Venta", type: "number", required: true },
                { name: "monto", label: "Monto", type: "number", required: true },
                { name: "moneda", label: "Moneda", type: "text" },
                { name: "id_metodo", label: "ID Método Pago", type: "number" },
                { name: "estado", label: "Estado Pago", type: "select", options: ["PENDIENTE", "PROCESANDO", "CONFIRMADO", "FALLIDO", "REEMBOLSADO"], required: true },
                { name: "referencia_externa", label: "Operación / Voucher", type: "text" },
                { name: "fecha_creacion", label: "Fecha Creación", type: "text", auto: true }
            ],
            seed: [
                { id_pago: 1, codigo_pago: "PAG-001", id_propietario: 1, tipo_venta: "ACCESORIOS", id_referencia: 1, monto: 100.00, moneda: "PEN", id_metodo: 3, estado: "CONFIRMADO", referencia_externa: "YAPE-OP982341", fecha_creacion: "2026-03-18 11:32:00" },
                { id_pago: 2, codigo_pago: "PAG-002", id_propietario: 1, tipo_venta: "FARMACIA", id_referencia: 1, monto: 32.50, moneda: "PEN", id_metodo: 1, estado: "CONFIRMADO", referencia_externa: "EFECTIVO-CAJA1", fecha_creacion: "2026-03-18 12:16:00" },
                { id_pago: 3, codigo_pago: "PAG-003", id_propietario: 2, tipo_venta: "FARMACIA", id_referencia: 2, monto: 135.00, moneda: "PEN", id_metodo: 2, estado: "CONFIRMADO", referencia_externa: "VISA-9943210", fecha_creacion: "2026-03-19 17:02:00" }
            ]
        },

        // LOG TABLE 3
        transacciones: {
            schema: "clinica_pagos",
            name: "transacciones",
            label: "Log de Pasarela de Pagos (Log Inmutable)",
            isLog: true,
            pk: "id_transaccion",
            fields: [
                { name: "id_transaccion", label: "ID Transacción", type: "number", auto: true },
                { name: "id_pago", label: "ID Pago", type: "number", required: true },
                { name: "accion", label: "Acción Pasarela", type: "text" },
                { name: "monto", label: "Monto Transacción", type: "number" },
                { name: "respuesta_pasarela", label: "Payload de Respuesta Gateway", type: "textarea" },
                { name: "fecha", label: "Fecha & Hora Transacción", type: "text", auto: true }
            ],
            seed: [
                { id_transaccion: 1, id_pago: 1, accion: "CONFIRMAR", monto: 100.00, respuesta_pasarela: '{"status":"SUCCESS","auth_code":"982341","gateway":"YAPE_QR","response_ms":240}', fecha: "2026-03-18 11:32:05" },
                { id_transaccion: 2, id_pago: 2, accion: "CONFIRMAR", monto: 32.50, respuesta_pasarela: '{"status":"SUCCESS","payment_mode":"CASH_TICKET","drawer_id":1}', fecha: "2026-03-18 12:16:10" },
                { id_transaccion: 3, id_pago: 3, accion: "CONFIRMAR", monto: 135.00, respuesta_pasarela: '{"status":"SUCCESS","auth_code":"876123","card_brand":"VISA","last4":"4312"}', fecha: "2026-03-19 17:02:18" }
            ]
        },

        comprobantes: {
            schema: "clinica_pagos",
            name: "comprobantes",
            label: "Comprobantes Electrónicos",
            isLog: false,
            pk: "id_comprobante",
            fields: [
                { name: "id_comprobante", label: "ID Comprobante", type: "number", auto: true },
                { name: "id_pago", label: "ID Pago", type: "number", required: true },
                { name: "tipo", label: "Tipo Comprobante", type: "select", options: ["BOLETA", "FACTURA", "NOTA_VENTA"], required: true },
                { name: "serie", label: "Serie", type: "text", required: true },
                { name: "numero", label: "Número Correlativo", type: "text", required: true },
                { name: "subtotal", label: "Subtotal (S/)", type: "number", required: true },
                { name: "igv", label: "IGV 18% (S/)", type: "number", required: true },
                { name: "total", label: "Total (S/)", type: "number", required: true },
                { name: "fecha_emision", label: "Fecha Emisión", type: "text", auto: true }
            ],
            seed: [
                { id_comprobante: 1, id_pago: 1, tipo: "BOLETA", serie: "B001", numero: "00004521", subtotal: 84.75, igv: 15.25, total: 100.00, fecha_emision: "2026-03-18 11:33:00" },
                { id_comprobante: 2, id_pago: 2, tipo: "BOLETA", serie: "B001", numero: "00004522", subtotal: 27.54, igv: 4.96, total: 32.50, fecha_emision: "2026-03-18 12:17:00" },
                { id_comprobante: 3, id_pago: 3, tipo: "BOLETA", serie: "B001", numero: "00004523", subtotal: 114.41, igv: 20.59, total: 135.00, fecha_emision: "2026-03-19 17:03:00" }
            ]
        },

        // ============================================================
        // 10. clinica_notificaciones
        // ============================================================
        plantillas_notificacion: {
            schema: "clinica_notificaciones",
            name: "plantillas_notificacion",
            label: "Plantillas de Notificación",
            isLog: false,
            pk: "id_plantilla",
            fields: [
                { name: "id_plantilla", label: "ID Plantilla", type: "number", auto: true },
                { name: "codigo", label: "Código Plantilla", type: "text", required: true },
                { name: "tipo", label: "Tipo Evento", type: "select", options: ["CONFIRMACION_CITA", "RECORDATORIO_VACUNA", "COMPROBANTE_VENTA", "CANCELACION", "BIENVENIDA", "RESULTADO_LABORATORIO"], required: true },
                { name: "asunto", label: "Asunto Correo", type: "text" },
                { name: "cuerpo", label: "Cuerpo Plantilla", type: "textarea" },
                { name: "canal_default", label: "Canal por Defecto", type: "select", options: ["EMAIL", "SMS", "AMBOS"], required: true }
            ],
            seed: [
                { id_plantilla: 1, codigo: "PL-CIT-01", tipo: "CONFIRMACION_CITA", asunto: "🐾 Cita confirmada en Clínica Patitas Alegre", cuerpo: "Estimado {nombre}, su cita para {mascota} está confirmada para el {fecha} a las {hora}.", canal_default: "EMAIL" },
                { id_plantilla: 2, codigo: "PL-VAC-01", tipo: "RECORDATORIO_VACUNA", asunto: "💉 Recordatorio de vacunación para {mascota}", cuerpo: "Estimado {nombre}, le recordamos que la vacuna de {mascota} vence el {fecha}.", canal_default: "AMBOS" },
                { id_plantilla: 3, codigo: "PL-COM-01", tipo: "COMPROBANTE_VENTA", asunto: "🧾 Su comprobante de pago en Patitas Alegre", cuerpo: "Gracias por su compra. Adjuntamos su comprobante de pago por el total de S/ {total}.", canal_default: "EMAIL" },
                { id_plantilla: 4, codigo: "PL-BIE-01", tipo: "BIENVENIDA", asunto: "¡Bienvenido a la familia Patitas Alegre!", cuerpo: "Estimado {nombre}, gracias por registrar a {mascota}. Ya cuenta con su historia clínica digital.", canal_default: "EMAIL" }
            ]
        },

        notificaciones: {
            schema: "clinica_notificaciones",
            name: "notificaciones",
            label: "Mensajes Enviados & Pendientes",
            isLog: false,
            pk: "id_notificacion",
            fields: [
                { name: "id_notificacion", label: "ID Notificación", type: "number", auto: true },
                { name: "codigo", label: "Código", type: "text" },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "id_plantilla", label: "ID Plantilla", type: "number" },
                { name: "tipo", label: "Tipo", type: "select", options: ["CONFIRMACION_CITA", "RECORDATORIO_VACUNA", "COMPROBANTE_VENTA", "CANCELACION", "BIENVENIDA", "RESULTADO_LABORATORIO"], required: true },
                { name: "canal", label: "Canal Envío", type: "select", options: ["EMAIL", "SMS", "AMBOS"], required: true },
                { name: "destinatario", label: "Destinatario", type: "text", required: true },
                { name: "asunto", label: "Asunto", type: "text" },
                { name: "mensaje", label: "Mensaje Enviado", type: "textarea" },
                { name: "estado", label: "Estado", type: "select", options: ["PENDIENTE", "ENVIADO", "FALLIDO", "LEIDO"], required: true },
                { name: "intentos", label: "Intentos", type: "number" },
                { name: "fecha_creacion", label: "Fecha Creación", type: "text", auto: true }
            ],
            seed: [
                { id_notificacion: 1, codigo: "NOTIF-001", id_propietario: 1, id_plantilla: 1, tipo: "CONFIRMACION_CITA", canal: "EMAIL", destinatario: "carlos.gomez@gmail.com", asunto: "🐾 Cita confirmada en Clínica Patitas Alegre", mensaje: "Estimado Carlos, su cita para Rocky está confirmada para el 2026-03-22 a las 09:30.", estado: "ENVIADO", intentos: 1, fecha_creacion: "2026-03-19 14:22:00" },
                { id_notificacion: 2, codigo: "NOTIF-002", id_propietario: 2, id_plantilla: 1, tipo: "CONFIRMACION_CITA", canal: "EMAIL", destinatario: "ana.torres@gmail.com", asunto: "🐾 Cita confirmada en Clínica Patitas Alegre", mensaje: "Estimada Ana María, su cita para Luna está confirmada para el 2026-03-22 a las 11:00.", estado: "ENVIADO", intentos: 1, fecha_creacion: "2026-03-19 15:00:00" },
                { id_notificacion: 3, codigo: "NOTIF-003", id_propietario: 1, id_plantilla: 3, tipo: "COMPROBANTE_VENTA", canal: "EMAIL", destinatario: "carlos.gomez@gmail.com", asunto: "🧾 Su comprobante de pago en Patitas Alegre", mensaje: "Gracias por su compra. Adjuntamos su boleta B001-00004521 por S/ 100.00.", estado: "ENVIADO", intentos: 1, fecha_creacion: "2026-03-18 11:34:00" }
            ]
        },

        recordatorios_programados: {
            schema: "clinica_notificaciones",
            name: "recordatorios_programados",
            label: "Recordatorios Programados (Cron)",
            isLog: false,
            pk: "id_recordatorio",
            fields: [
                { name: "id_recordatorio", label: "ID Recordatorio", type: "number", auto: true },
                { name: "id_propietario", label: "ID Propietario", type: "number", required: true },
                { name: "id_mascota", label: "ID Mascota", type: "number" },
                { name: "tipo", label: "Tipo Recordatorio", type: "select", options: ["VACUNA", "CONTROL", "DESPARASITACION"], required: true },
                { name: "descripcion", label: "Descripción", type: "text" },
                { name: "fecha_programada", label: "Fecha Programada", type: "date", required: true },
                { name: "estado", label: "Estado", type: "select", options: ["PENDIENTE", "ENVIADO", "CANCELADO"], required: true }
            ],
            seed: [
                { id_recordatorio: 1, id_propietario: 1, id_mascota: 1, tipo: "DESPARASITACION", descripcion: "Control trimestral de antiparasitario interno", fecha_programada: "2026-04-15", estado: "PENDIENTE" },
                { id_recordatorio: 2, id_propietario: 2, id_mascota: 2, tipo: "VACUNA", descripcion: "Refuerzo anual de rabia", fecha_programada: "2026-05-10", estado: "PENDIENTE" }
            ]
        },

        // LOG TABLE 4
        log_envios: {
            schema: "clinica_notificaciones",
            name: "log_envios",
            label: "Log de Proveedores Notificaciones (Log Inmutable)",
            isLog: true,
            pk: "id_log",
            fields: [
                { name: "id_log", label: "ID Log", type: "number", auto: true },
                { name: "id_notificacion", label: "ID Notificación", type: "number", required: true },
                { name: "canal", label: "Canal", type: "text" },
                { name: "respuesta_proveedor", label: "Respuesta Servidor / Proveedor", type: "textarea" },
                { name: "fecha", label: "Fecha & Hora Despacho", type: "text", auto: true }
            ],
            seed: [
                { id_log: 1, id_notificacion: 1, canal: "EMAIL", respuesta_proveedor: '{"status":250,"smtp_message":"2.0.0 Ok: queued as 48A9B1002A","provider":"SendGrid"}', fecha: "2026-03-19 14:22:15" },
                { id_log: 2, id_notificacion: 2, canal: "EMAIL", respuesta_proveedor: '{"status":250,"smtp_message":"2.0.0 Ok: queued as 91C1E2003B","provider":"SendGrid"}', fecha: "2026-03-19 15:00:10" },
                { id_log: 3, id_notificacion: 3, canal: "EMAIL", respuesta_proveedor: '{"status":250,"smtp_message":"2.0.0 Ok: queued as B72E31004C","provider":"SendGrid"}', fecha: "2026-03-18 11:34:20" }
            ]
        }
    }
};

/**
 * ============================================================
 * MOTOR CRUD Y GESTIÓN DE ALMACENAMIENTO LOCAL
 * ============================================================
 */
const VetcareDB = {
    getStorageKey(tableName) {
        return `vetcare_db_${tableName}`;
    },

    getTableConfig(tableName) {
        return DB_CATALOG.tables[tableName];
    },

    getAllTables() {
        return Object.values(DB_CATALOG.tables);
    },

    getTablesBySchema(schemaId) {
        return Object.values(DB_CATALOG.tables).filter(t => t.schema === schemaId);
    },

    API_BASE_URL: "http://127.0.0.1:5000/api/db",
    isLive: false,

    async fetchTableData(tableName) {
        const config = this.getTableConfig(tableName);
        if (!config) return [];

        try {
            const resp = await fetch(`${this.API_BASE_URL}/${tableName}`);
            if (resp.ok) {
                const resJson = await resp.json();
                if (resJson && resJson.ok && Array.isArray(resJson.datos)) {
                    this.isLive = true;
                    this.saveTableData(tableName, resJson.datos);
                    return resJson.datos;
                }
            }
        } catch (e) {
            // El backend no está accesible, fallback a localStorage/semilla
            this.isLive = false;
        }

        return this.getTableData(tableName);
    },

    getTableData(tableName) {
        const config = this.getTableConfig(tableName);
        if (!config) return [];
        const raw = localStorage.getItem(this.getStorageKey(tableName));
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.error("Error al parsear tabla", tableName, e);
            }
        }
        // Inicializar con datos semilla si no existen
        const seedData = JSON.parse(JSON.stringify(config.seed || []));
        localStorage.setItem(this.getStorageKey(tableName), JSON.stringify(seedData));
        return seedData;
    },

    saveTableData(tableName, data) {
        localStorage.setItem(this.getStorageKey(tableName), JSON.stringify(data));
    },

    async createRecord(tableName, record) {
        const config = this.getTableConfig(tableName);
        if (!config) throw new Error("Tabla no encontrada");

        // VALIDACIÓN ESTRICTA: Tablas de logs son de solo lectura
        if (config.isLog) {
            throw new Error(`OPERACIÓN DENEGADA: La tabla '${tableName}' es un LOG DE AUDITORÍA y no permite inserciones manuales.`);
        }

        // Si hay conexión viva, guardar en MySQL primero
        if (this.isLive) {
            try {
                const resp = await fetch(`${this.API_BASE_URL}/${tableName}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(record)
                });
                const resJson = await resp.json();
                if (resp.ok && resJson.ok) {
                    return await this.fetchTableData(tableName);
                }
            } catch (e) {
                console.warn("Fallo guardado en MySQL, guardando localmente:", e);
            }
        }

        const data = this.getTableData(tableName);
        const pk = config.pk;

        // Autoincrementar primary key numérica si aplica
        if (!record[pk]) {
            const maxId = data.reduce((max, item) => {
                const val = parseInt(item[pk], 10);
                return (!isNaN(val) && val > max) ? val : max;
            }, 0);
            record[pk] = maxId + 1;
        }

        data.push(record);
        this.saveTableData(tableName, data);
        return record;
    },

    async updateRecord(tableName, id, updatedFields) {
        const config = this.getTableConfig(tableName);
        if (!config) throw new Error("Tabla no encontrada");

        // VALIDACIÓN ESTRICTA: Tablas de logs no se pueden modificar
        if (config.isLog) {
            throw new Error(`OPERACIÓN DENEGADA: La tabla '${tableName}' es un LOG DE AUDITORÍA y es inmutable.`);
        }

        if (this.isLive) {
            try {
                const resp = await fetch(`${this.API_BASE_URL}/${tableName}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedFields)
                });
                const resJson = await resp.json();
                if (resp.ok && resJson.ok) {
                    return await this.fetchTableData(tableName);
                }
            } catch (e) {
                console.warn("Fallo actualización en MySQL, actualizando local:", e);
            }
        }

        const data = this.getTableData(tableName);
        const pk = config.pk;
        const index = data.findIndex(item => String(item[pk]) === String(id));

        if (index === -1) {
            throw new Error(`Registro con ${pk}=${id} no encontrado.`);
        }

        data[index] = { ...data[index], ...updatedFields };
        this.saveTableData(tableName, data);
        return data[index];
    },

    async deleteRecord(tableName, id) {
        const config = this.getTableConfig(tableName);
        if (!config) throw new Error("Tabla no encontrada");

        // VALIDACIÓN ESTRICTA: Tablas de logs no se pueden eliminar
        if (config.isLog) {
            throw new Error(`OPERACIÓN DENEGADA: La tabla '${tableName}' es un LOG DE AUDITORÍA y sus registros no se pueden borrar.`);
        }

        if (this.isLive) {
            try {
                const resp = await fetch(`${this.API_BASE_URL}/${tableName}/${id}`, {
                    method: "DELETE"
                });
                const resJson = await resp.json();
                if (resp.ok && resJson.ok) {
                    await this.fetchTableData(tableName);
                    return true;
                }
            } catch (e) {
                console.warn("Fallo eliminación en MySQL, eliminando local:", e);
            }
        }

        let data = this.getTableData(tableName);
        const pk = config.pk;
        const initialLength = data.length;

        data = data.filter(item => String(item[pk]) !== String(id));

        if (data.length === initialLength) {
            throw new Error(`Registro con ${pk}=${id} no encontrado.`);
        }

        this.saveTableData(tableName, data);
        return true;
    },

    resetTable(tableName) {
        const config = this.getTableConfig(tableName);
        if (!config) return;
        localStorage.removeItem(this.getStorageKey(tableName));
        return this.getTableData(tableName);
    },

    resetAll() {
        Object.keys(DB_CATALOG.tables).forEach(name => {
            localStorage.removeItem(this.getStorageKey(name));
        });
    }
};

window.DB_CATALOG = DB_CATALOG;
window.VetcareDB = VetcareDB;
