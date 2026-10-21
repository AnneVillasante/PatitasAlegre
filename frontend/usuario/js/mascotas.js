
const API_URL = "http://localhost:8081/api/mascotas";

const form = document.getElementById("formMascota");
const selectEspecie = document.getElementById("idEspecie");
const selectRaza = document.getElementById("idRaza");
const listaMascotas = document.getElementById("listaMascotas");
const mensaje = document.getElementById("mensaje");
const btnGuardar = document.getElementById("btnGuardar");
const connection = document.querySelector(".connection");

let mascotas = [];
let especies = [];
let razas = [];

function mostrarMensaje(texto, tipo = "info") {
    mensaje.textContent = texto;
    mensaje.className = `message ${tipo}`;
    mensaje.hidden = false;
}

function ocultarMensaje() {
    mensaje.hidden = true;
}

async function solicitar(url, opciones = {}) {
    const token = localStorage.getItem("patitasAlegreToken");
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opciones.headers || {})
        }
    });

    if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error(
            `Error HTTP ${respuesta.status}: ${
                detalle || respuesta.statusText
            }`
        );
    }

    if (respuesta.status === 204) {
        return null;
    }

    return respuesta.json();
}

function actualizarConexion(online, texto) {
    connection.classList.toggle("online", online);
    connection.classList.toggle("offline", !online);
    document.getElementById("connectionText").textContent = texto;
}

async function cargarEspecies() {
    try {
        especies = await solicitar(`${API_URL}/especies`);

        selectEspecie.replaceChildren(
            new Option("Seleccionar especie", "")
        );

        especies.forEach(especie => {
            selectEspecie.add(
                new Option(especie.nombre, especie.idEspecie)
            );
        });
    } catch (error) {
        selectEspecie.replaceChildren(
            new Option("No se pudieron cargar las especies", "")
        );
        mostrarMensaje(
            "No se pudieron cargar las especies. " + error.message,
            "error"
        );
    }
}

async function cargarRazas(idEspecie) {
    selectRaza.replaceChildren(
        new Option("Sin especificar", "")
    );
    selectRaza.disabled = true;

    if (!idEspecie) {
        return;
    }

    try {
        razas = await solicitar(
            `${API_URL}/razas/especie/${encodeURIComponent(idEspecie)}`
        );

        razas.forEach(raza => {
            selectRaza.add(
                new Option(raza.nombre, raza.idRaza)
            );
        });

        selectRaza.disabled = false;
    } catch (error) {
        mostrarMensaje(
            "No se pudieron cargar las razas. " + error.message,
            "error"
        );
    }
}

function obtenerNombreEspecie(id) {
    const especie = especies.find(
        item => Number(item.idEspecie) === Number(id)
    );
    return especie ? especie.nombre : `ID ${id ?? "—"}`;
}

function obtenerNombreRaza(id) {
    if (id === null || id === undefined || id === "") {
        return "Sin especificar";
    }

    const raza = razas.find(
        item => Number(item.idRaza) === Number(id)
    );

    return raza ? raza.nombre : `ID ${id}`;
}

function crearCelda(texto, clase = "") {
    const td = document.createElement("td");
    td.textContent = texto;
    if (clase) td.className = clase;
    return td;
}

function crearCeldaMascota(mascota) {
    const td = document.createElement("td");

    const nombre = document.createElement("span");
    nombre.className = "pet-name";
    nombre.textContent = mascota.nombre || "Sin nombre";

    const codigo = document.createElement("span");
    codigo.className = "pet-code";
    codigo.textContent = mascota.codigo || `ID ${mascota.idMascota}`;

    td.append(nombre, codigo);
    return td;
}

function crearCeldaEspecie(mascota) {
    const td = document.createElement("td");

    const especie = document.createElement("span");
    especie.className = "species-name";
    especie.textContent = obtenerNombreEspecie(mascota.idEspecie);

    const raza = document.createElement("span");
    raza.className = "breed-name";

    // Las razas se cargan por especie; se utiliza la lista actual.
    const razaEncontrada = razas.find(
        item => Number(item.idRaza) === Number(mascota.idRaza)
    );

    raza.textContent = mascota.idRaza == null
        ? "Sin especificar"
        : razaEncontrada?.nombre || `Raza ID ${mascota.idRaza}`;

    td.append(especie, raza);
    return td;
}

function dibujarTabla() {
    const busqueda = document.getElementById("buscar")
        .value.trim().toLowerCase();

    const filtro = document.getElementById("filtroEstado").value;

    const filtradas = mascotas.filter(mascota => {
        const texto = [
            mascota.nombre,
            mascota.codigo,
            mascota.numeroChip,
            mascota.idMascota
        ].filter(valor => valor != null).join(" ").toLowerCase();

        return texto.includes(busqueda)
            && (!filtro || mascota.estado === filtro);
    });

    listaMascotas.replaceChildren();

    if (filtradas.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.className = "empty-cell";
        td.textContent = mascotas.length
            ? "No hay resultados para esta búsqueda."
            : "Todavía no hay mascotas registradas.";
        tr.append(td);
        listaMascotas.append(tr);
    } else {
        filtradas.forEach(mascota => {
            const tr = document.createElement("tr");

            tr.append(
                crearCeldaMascota(mascota),
                crearCeldaEspecie(mascota),
                crearCelda(mascota.sexo || "—"),
                crearCelda(
                    mascota.pesoKg != null
                        ? `${mascota.pesoKg} kg`
                        : "—"
                )
            );

            const tdEstado = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "status-badge";

            if (mascota.estado === "INACTIVO") {
                badge.classList.add("inactive");
            } else if (mascota.estado === "FALLECIDO") {
                badge.classList.add("deceased");
            }

            badge.textContent = mascota.estado || "ACTIVO";
            tdEstado.append(badge);
            tr.append(tdEstado);

            // Columna de acciones
            const tdAcciones = document.createElement("td");

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.textContent = "Editar";
            btnEditar.className = "btn-secondary";
            btnEditar.addEventListener("click", () => {
                cargarMascotaParaEditar(mascota);
            });

            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.className = "btn-danger";
            btnEliminar.addEventListener("click", () => {
                eliminarMascota(mascota);
            });

            tdAcciones.append(btnEditar, btnEliminar);
            tr.appendChild(tdAcciones);

            listaMascotas.append(tr);
        });
    }

    document.getElementById("totalMascotas").textContent =
        mascotas.length;

    document.getElementById("totalActivas").textContent =
        mascotas.filter(m => m.estado === "ACTIVO").length;

    document.getElementById("totalOtras").textContent =
        mascotas.filter(m => m.estado !== "ACTIVO").length;

    document.getElementById("estadoLista").textContent =
        `Mostrando ${filtradas.length} de ${mascotas.length} mascotas`;
}

async function cargarMascotas() {
    const estadoLista = document.getElementById("estadoLista");
    estadoLista.textContent = "Cargando mascotas...";

    try {
        mascotas = await solicitar(API_URL);
        actualizarConexion(true, "Servicio conectado");
        dibujarTabla();
    } catch (error) {
        mascotas = [];
        dibujarTabla();
        estadoLista.textContent = "No se pudieron cargar las mascotas.";
        actualizarConexion(false, "Servicio no disponible");
        mostrarMensaje(
            "Error al consultar el microservicio: " + error.message,
            "error"
        );
    }
}

function construirDatosFormulario() {
    const idEspecie = Number(selectEspecie.value);
    const valorRaza = selectRaza.value;

    const pesoTexto = document.getElementById("pesoKg").value;
    const fechaTexto = document.getElementById("fechaNacimiento").value;

    return {
        idPropietario: Number(
            document.getElementById("idPropietario").value
        ),
        idEspecie,
        idRaza: valorRaza ? Number(valorRaza) : null,
        nombre: document.getElementById("nombre").value.trim(),
        sexo: document.getElementById("sexo").value,
        fechaNacimiento: fechaTexto || null,
        pesoKg: pesoTexto ? Number(pesoTexto) : null,
        color: document.getElementById("color").value.trim() || null,
        numeroChip:
            document.getElementById("numeroChip").value.trim() || null,
        alergias:
            document.getElementById("alergias").value.trim() || null,
        observaciones:
            document.getElementById("observaciones").value.trim() || null,
        estado: document.getElementById("estado").value
    };
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    ocultarMensaje();

    if (!form.reportValidity()) {
        return;
    }

    const datos = construirDatosFormulario();

    if (!Number.isInteger(datos.idPropietario)
        || datos.idPropietario < 1) {
        mostrarMensaje("Introduce un ID de propietario válido.", "error");
        return;
    }

    if (!Number.isInteger(datos.idEspecie) || datos.idEspecie < 1) {
        mostrarMensaje("Selecciona una especie válida.", "error");
        return;
    }

    if (datos.idRaza !== null
        && (!Number.isInteger(datos.idRaza) || datos.idRaza < 1)) {
        mostrarMensaje("Selecciona una raza válida.", "error");
        return;
    }

    if (datos.pesoKg !== null
        && (!Number.isFinite(datos.pesoKg) || datos.pesoKg <= 0
            || datos.pesoKg > 999.99)) {
        mostrarMensaje("El peso debe estar entre 0.01 y 999.99 kg.", "error");
        return;
    }

    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";

    try {
        const nuevaMascota = await solicitar(API_URL, {
            method: "POST",
            body: JSON.stringify(datos)
        });

        mostrarMensaje(
            `¡Mascota ${nuevaMascota.nombre} registrada correctamente!`,
            "success"
        );

        form.reset();
        await cargarRazas("");
        await cargarMascotas();
    } catch (error) {
        mostrarMensaje(
            "No se pudo registrar la mascota. " + error.message,
            "error"
        );
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = "<span>＋</span> Registrar mascota";
    }
});

selectEspecie.addEventListener("change", () => {
    cargarRazas(selectEspecie.value);
});

document.getElementById("buscar").addEventListener("input", dibujarTabla);
document.getElementById("filtroEstado").addEventListener("change", dibujarTabla);

document.getElementById("btnActualizar").addEventListener("click", async () => {
    await cargarMascotas();
});


let mascotaEditandoId = null;

async function cargarMascotaParaEditar(mascota) {
    mascotaEditandoId = mascota.idMascota;

    document.getElementById("nombre").value = mascota.nombre ?? "";
    document.getElementById("idPropietario").value =
        mascota.idPropietario ?? "";
    document.getElementById("sexo").value = mascota.sexo ?? "";
    document.getElementById("fechaNacimiento").value =
        mascota.fechaNacimiento ?? "";
    document.getElementById("pesoKg").value = mascota.pesoKg ?? "";
    document.getElementById("color").value = mascota.color ?? "";
    document.getElementById("numeroChip").value = mascota.numeroChip ?? "";
    document.getElementById("alergias").value = mascota.alergias ?? "";
    document.getElementById("observaciones").value =
        mascota.observaciones ?? "";
    document.getElementById("estado").value = mascota.estado ?? "ACTIVO";

    selectEspecie.value = String(mascota.idEspecie ?? "");

    await cargarRazas(mascota.idEspecie);

    selectRaza.value = mascota.idRaza == null
        ? ""
        : String(mascota.idRaza);

    btnGuardar.textContent = "Guardar cambios";

    document.getElementById("nombre").focus();

    mostrarMensaje(
        `Editando la mascota ${mascota.nombre}. Modifica los datos y guarda los cambios.`,
        "info"
    );
}

async function eliminarMascota(mascota) {
    const confirmar = confirm(
        `¿Deseas eliminar a ${mascota.nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
        await solicitar(`${API_URL}/${mascota.idMascota}`, {
            method: "DELETE"
        });

        if (mascotaEditandoId === mascota.idMascota) {
            mascotaEditandoId = null;
            form.reset();
            btnGuardar.textContent = "Registrar mascota";
        }

        mostrarMensaje(
            `La mascota ${mascota.nombre} fue eliminada correctamente.`,
            "success"
        );

        await cargarMascotas();
    } catch (error) {
        mostrarMensaje(
            "No se pudo eliminar la mascota. " + error.message,
            "error"
        );
    }
}


async function iniciarPagina() {
    await cargarEspecies();
    await cargarMascotas();
}

iniciarPagina();
