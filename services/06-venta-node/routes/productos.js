
const express = require("express");

module.exports = function(pool) {
    const router = express.Router();

    // 1. Listar productos del catálogo
    router.get("/", async (req, res) => {
        try {
            const [productos] = await pool.query(`
                SELECT
                    p.id_producto AS idProducto,
                    p.codigo,
                    p.nombre,
                    p.descripcion,
                    p.id_categoria AS idCategoria,
                    c.nombre AS categoria,
                    p.precio,
                    p.stock,
                    p.stock_minimo AS stockMinimo,
                    p.estado
                FROM productos_accesorios p
                LEFT JOIN categorias_accesorio c
                    ON p.id_categoria = c.id_categoria
                ORDER BY p.id_producto DESC
            `);

            res.json(productos);
        } catch (error) {
            console.error("Error al listar productos:", error.message);
            res.status(500).json({
                mensaje: "Error al consultar los productos"
            });
        }
    });

    // 2. Listar categorías
    router.get("/categorias", async (req, res) => {
        try {
            const [categorias] = await pool.query(`
                SELECT
                    id_categoria AS idCategoria,
                    nombre
                FROM categorias_accesorio
                ORDER BY nombre
            `);

            res.json(categorias);
        } catch (error) {
            console.error("Error al listar categorías:", error.message);
            res.status(500).json({
                mensaje: "Error al consultar las categorías"
            });
        }
    });
 

    
    // 3. Registrar un producto
    router.post("/", async (req, res) => {
        try {
            const {
                codigo,
                nombre,
                descripcion,
                idCategoria,
                precio,
                stock,
                stockMinimo
            } = req.body;

            if (
                !codigo ||
                !nombre ||
                !idCategoria ||
                precio === undefined ||
                stock === undefined
            ) {
                return res.status(400).json({
                    mensaje: "Completa código, nombre, categoría, precio y stock"
                });
            }

            const [resultado] = await pool.query(
                `INSERT INTO productos_accesorios
                    (codigo, nombre, descripcion, id_categoria,
                     precio, stock, stock_minimo, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
                [
                    codigo,
                    nombre,
                    descripcion || null,
                    idCategoria,
                    precio,
                    stock,
                    stockMinimo ?? 0
                ]
            );

            res.status(201).json({
                mensaje: "Producto registrado correctamente",
                idProducto: resultado.insertId
            });
        } catch (error) {
            console.error("Error al registrar producto:", error.message);

            res.status(500).json({
                mensaje: "No se pudo registrar el producto"
            });
        }
    });

    return router;

    
};
