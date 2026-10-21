
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const crearRutasProductos = require("./routes/productos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({
        mensaje: "Microservicio de ventas VetCare funcionando"
    });
});

// Verificar conexión con MySQL
app.get("/api/salud", async (req, res) => {
    try {
        const [filas] = await pool.query(
            "SELECT DATABASE() AS baseDatos"
        );

        res.json({
            servicio: "Ventas Node.js",
            estado: "conectado",
            baseDatos: filas[0].baseDatos
        });
    } catch (error) {
        console.error("Error de MySQL:", error.message);

        res.status(500).json({
            estado: "error",
            mensaje: "No se pudo conectar con MySQL"
        });
    }
});

// Registrar las rutas de productos y categorías
app.use("/api/productos", crearRutasProductos(pool));

app.listen(PORT, () => {
    console.log(
        `Servicio de ventas disponible en http://localhost:${PORT}`
    );
});

module.exports = { app, pool };
