/**
 * VetCare - Sistema de Control de Acceso por Roles (RBAC)
 * Clínica Veterinaria Patitas Alegre
 * 
 * Roles disponibles:
 * 1. ADMIN (Administrador): Acceso completo a todos los módulos.
 * 2. MEDICO (Personal Médico): Expedientes médicos, pacientes, agenda clínica y vademécum.
 * 3. RECEPCIONISTA: Programación de citas, emisión de ventas (tienda/farmacia), notificaciones y clientes.
 * 4. CLIENTE (Propietario): Modo tienda en accesorios y farmacia, citas en modo historial/solicitud.
 */

const ROLES_CONFIG = {
    ADMIN: {
        id: "ADMIN",
        nombre: "Administrador",
        icono: "👑",
        descripcion: "Acceso total a la administración clínica, personal, finanzas y configuración.",
        modulos: ["dashboard", "mascotas", "citas", "historial", "propietarios", "veterinarios", "farmacia", "accesorios", "notificaciones"]
    },
    MEDICO: {
        id: "MEDICO",
        nombre: "Personal Médico",
        icono: "🩺",
        descripcion: "Atención médica veterinaria, historias clínicas, expedientes y prescripción.",
        modulos: ["dashboard", "historial", "mascotas", "citas", "farmacia"]
    },
    RECEPCIONISTA: {
        id: "RECEPCIONISTA",
        nombre: "Recepcionista",
        icono: "📋",
        descripcion: "Programación de citas, emisión de ventas, caja y envío de notificaciones.",
        modulos: ["dashboard", "citas", "accesorios", "farmacia", "notificaciones", "propietarios", "mascotas"]
    },
    CLIENTE: {
        id: "CLIENTE",
        nombre: "Cliente / Propietario",
        icono: "🐾",
        descripcion: "Autoservicio: Tienda de accesorios, farmacia libre y consulta de citas.",
        modulos: ["dashboard", "accesorios", "farmacia", "citas", "mascotas", "historial"]
    }
};

const MENU_ITEMS = [
    { id: "dashboard", href: "dashboard.html", etiqueta: "Inicio" },
    { id: "citas", href: "citas.html", etiqueta: "Citas Médicas" },
    { id: "mascotas", href: "mascotas.html", etiqueta: "Mascotas" },
    { id: "historial", href: "historial.html", etiqueta: "Historia Clínica" },
    { id: "accesorios", href: "accesorios.html", etiqueta: "Tienda" },
    { id: "farmacia", href: "farmacia.html", etiqueta: "Farmacia" },
    { id: "propietarios", href: "propietarios.html", etiqueta: "Propietarios" },
    { id: "veterinarios", href: "veterinarios.html", etiqueta: "Veterinarios" },
    { id: "notificaciones", href: "notificaciones.html", etiqueta: "Notificaciones" }
];

// Obtiene el rol activo en sesión
function obtenerRolActual() {
    return localStorage.getItem("vetcare_rol") || "ADMIN";
}

// Cambia el rol activo en sesión y recarga la interfaz
function cambiarRol(nuevoRol) {
    if (ROLES_CONFIG[nuevoRol]) {
        localStorage.setItem("vetcare_rol", nuevoRol);
        window.location.reload();
    }
}

// Verifica si el rol actual tiene permiso para ver el módulo
function tienePermiso(moduloId) {
    const rol = obtenerRolActual();
    const config = ROLES_CONFIG[rol] || ROLES_CONFIG.ADMIN;
    return config.modulos.includes(moduloId);
}

// Inyecta el widget de rol en el encabezado y filtra la barra de navegación
function inicializarRolesUI(moduloActivo) {
    const rolActual = obtenerRolActual();
    const configRol = ROLES_CONFIG[rolActual] || ROLES_CONFIG.ADMIN;

    // 1. Verificar si el usuario tiene permiso en esta página
    if (moduloActivo && moduloActivo !== "dashboard" && !tienePermiso(moduloActivo)) {
        bloquearAcceso(moduloActivo, configRol);
        return;
    }

    // 2. Personalizar selector de rol en la barra de navegación o encabezado
    configurarSelectorRol(rolActual, configRol);

    // 3. Renderizar barra de navegación según permisos del rol
    renderizarNavegacionPorRol(moduloActivo, configRol);
}

function configurarSelectorRol(rolActual, configRol) {
    // Buscar contenedor de acciones del header
    let contenedorAcciones = document.querySelector(".encabezado .acciones") || document.querySelector("header .acciones");

    if (!contenedorAcciones) {
        const header = document.querySelector(".encabezado") || document.querySelector("header");
        if (header) {
            contenedorAcciones = document.createElement("div");
            contenedorAcciones.className = "acciones";
            header.appendChild(contenedorAcciones);
        }
    }

    if (contenedorAcciones) {
        // Selector dinámico de rol para cambiar y testear roles en vivo
        const selectorContainer = document.createElement("div");
        selectorContainer.style.display = "inline-flex";
        selectorContainer.style.alignItems = "center";
        selectorContainer.style.gap = "6px";
        selectorContainer.style.background = "rgba(255, 255, 255, 0.16)";
        selectorContainer.style.padding = "5px 12px";
        selectorContainer.style.borderRadius = "8px";
        selectorContainer.style.border = "1px solid rgba(255, 255, 255, 0.25)";

        selectorContainer.innerHTML = `
            <span style="font-size: 12px; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Rol:</span>
            <select id="selectorRolGlobal" style="padding: 5px 10px; font-size: 12.5px; border-radius: 6px; border: 0; background: #ffffff; color: #193155; font-weight: 700; cursor: pointer; margin-bottom: 0;">
                <option value="ADMIN" ${rolActual === "ADMIN" ? "selected" : ""}>👑 Administrador</option>
                <option value="MEDICO" ${rolActual === "MEDICO" ? "selected" : ""}>🩺 Personal Médico</option>
                <option value="RECEPCIONISTA" ${rolActual === "RECEPCIONISTA" ? "selected" : ""}>📋 Recepcionista</option>
                <option value="CLIENTE" ${rolActual === "CLIENTE" ? "selected" : ""}>🐾 Cliente / Propietario</option>
            </select>
        `;

        contenedorAcciones.insertBefore(selectorContainer, contenedorAcciones.firstChild);

        document.getElementById("selectorRolGlobal").addEventListener("change", (e) => {
            cambiarRol(e.target.value);
        });
    }
}

function renderizarNavegacionPorRol(moduloActivo, configRol) {
    let nav = document.querySelector(".barra-navegacion");
    if (!nav) return;

    nav.innerHTML = "";

    MENU_ITEMS.forEach(item => {
        if (configRol.modulos.includes(item.id)) {
            const enlace = document.createElement("a");
            enlace.href = item.href;
            enlace.textContent = item.etiqueta;

            if (item.id === moduloActivo) {
                enlace.className = "activo";
            }

            // Etiquetas personalizadas por rol
            if (configRol.id === "CLIENTE") {
                if (item.id === "citas") enlace.textContent = "Mis Citas";
                if (item.id === "mascotas") enlace.textContent = "Mis Mascotas";
                if (item.id === "farmacia") enlace.textContent = "Farmacia";
                if (item.id === "accesorios") enlace.textContent = "Tienda";
            }

            nav.appendChild(enlace);
        }
    });
}

function bloquearAcceso(moduloActivo, configRol) {
    const main = document.querySelector("main");
    if (!main) return;

    main.innerHTML = `
        <div class="panel" style="max-width: 600px; margin: 40px auto; text-align: center; padding: 40px 30px;">
            <div style="font-size: 50px; margin-bottom: 15px;">🔒</div>
            <h2>Acceso Restringido por Rol</h2>
            <p style="color: #5b6663; font-size: 15px; margin: 15px 0 25px;">
                El módulo <strong>"${moduloActivo}"</strong> no está disponible para el perfil <strong>${configRol.nombre} (${configRol.icono})</strong>.
            </p>
            <div style="background: #f4f7f6; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 13.5px; text-align: left;">
                <strong>Módulos permitidos para tu perfil:</strong>
                <ul style="margin: 8px 0 0; padding-left: 20px; color: #246b63;">
                    ${configRol.modulos.map(m => `<li>${m}</li>`).join("")}
                </ul>
            </div>
            <a href="dashboard.html" class="btn-vetcare" style="padding: 10px 20px;">
                ← Regresar a mi Panel
            </a>
        </div>
    `;
}
