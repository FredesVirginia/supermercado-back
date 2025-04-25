"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const authMiddleware_1 = require("../middelware/authMiddleware");
const types_1 = require("../types/types");
const utils_1 = require("../utils/utils");
const descuentoServices_1 = require("../services/descuentoServices");
const node_cron_1 = __importDefault(require("node-cron"));
const cronJob_1 = require("../cron/cronJob");
const routerSupermercado = (0, express_1.Router)();
routerSupermercado.get("hoy", (res, req) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: "HOLA TOTO" });
}));
routerSupermercado.post("/add", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredFields = ["name", "address", "provincia", "departamento", "localidad"];
    const { admidEmail, supermercado } = req.body;
    try {
        if (admidEmail && admidEmail !== "") {
            const user = yield db_1.User.findOne({ where: { email: admidEmail } });
            if (user) {
                if ((0, utils_1.validateRequiredStrings)(supermercado, requiredFields)) {
                    const existingSupermarket = yield db_1.Supermercado.findOne({
                        where: {
                            [sequelize_1.Op.and]: [{ name: supermercado.name }, { address: supermercado.address }],
                        },
                    });
                    if (existingSupermarket) {
                        return res.status(409).json({
                            message: "Ya existe un supermercado con este nombre en esta direccion",
                        });
                    }
                    const newSupermarket = yield db_1.Supermercado.create(Object.assign(Object.assign({}, supermercado), { admin_id: user.getDataValue("id") }));
                    return res.status(200).json({ data: newSupermarket });
                }
                else {
                    return res.status(400).json({ message: "Todos los campos son obligatorios y no pueden estar Vacios" });
                }
            }
            return res.status(400).json({ message: "El correo no se encontro" });
        }
        else {
            return res.status(400).json({ message: "El email es obligatorio" });
        }
    }
    catch (error) {
        console.log("ERROR EN ADDSUPERMARKET", error);
        return res.status(500).json({ error });
    }
}));
routerSupermercado.post("/add/product", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredField = [
        "marca",
        "preciodescuento",
        "fechavencimiento",
        "precio",
        "codigobarras",
        "categoria",
        "nombreProveedor",
    ];
    const { marca, preciodescuento, fechavencimiento, stock, precio, codigobarras, categoria, nombreProveedor } = req.body;
    try {
        if ((0, utils_1.validateRequiredStrings)(req.body, requiredField)) {
            const existingCategory = yield db_1.Categoria.findOne({ where: { name: categoria } });
            const existingProveedor = yield db_1.Proveedor.findOne({ where: { name: nombreProveedor } });
            const existingMarca = yield db_1.Marca.findOne({ where: { name: marca } });
            const product = yield db_1.Producto.create({
                fechavencimiento,
                preciodescuento,
                precio,
                descuento: 0,
                codigobarras,
                categoria_id: existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.getDataValue("id"),
                supermercado_id: req.user.supermercado_id,
                proveedor_id: existingProveedor === null || existingProveedor === void 0 ? void 0 : existingProveedor.getDataValue("id"),
                marca_id: existingMarca === null || existingMarca === void 0 ? void 0 : existingMarca.getDataValue("id")
            });
            return res.status(200).json({ data: product });
        }
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    catch (error) {
        console.log("ERROR EN ADD PRODUCTO", error);
        return res.status(500).json({ error });
    }
}));
routerSupermercado.post("/add/proveedor", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const requiredField = ["name", "razonSocial", "cuit", "direccion", "phone", "email"];
    const { name, razonSocial, cuit, direccion, phone, email } = req.body;
    console.log("DATOOOOOOOOOOOOOOS", req.user.supermercado_id);
    try {
        if ((0, utils_1.validateRequiredStrings)(req.body, requiredField)) {
            const existingProveedor = yield db_1.Proveedor.findOne({
                where: { email }
            });
            if (existingProveedor) {
                res.status(404).json({ message: `Ya existe un proveedor con este email : ${email}` });
                return;
            }
            const proveedor = yield db_1.Proveedor.create({
                name,
                razonSocial,
                cuit,
                direccion,
                phone,
                email,
            });
            yield proveedor.addSupermercado(req.user.supermercado_id);
            return res.status(200).json({ data: proveedor });
        }
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    catch (error) {
        console.log("ERROR EN ADD PRODUCTO ", error);
        if (error.name === "SequelizeUniqueConstraintError") {
            const duplicateField = ((_c = (_b = (_a = error.parent) === null || _a === void 0 ? void 0 : _a.detail) === null || _b === void 0 ? void 0 : _b.match(/\((.*?)\)=\((.*?)\)/)) === null || _c === void 0 ? void 0 : _c[1]) || "campo único";
            console.log("ERROR ", error.parent.detail);
            return res.status(400).json({
                message: `El valor para ${duplicateField} ya existe en el sistema`,
            });
        }
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}));
routerSupermercado.post("/add/category", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryNames = req.body;
    try {
        if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
            return res.status(400).json({ message: "Se requiere una lista de categorias" });
        }
        const uniqueNames = [
            ...new Set(categoryNames.map((name) => (typeof name === "string" ? name.trim() : "")).filter((name) => name !== "")),
        ];
        const existingCategory = yield db_1.Categoria.findAll({
            where: {
                name: {
                    [sequelize_1.Op.in]: uniqueNames,
                },
            },
        });
        const existingNames = existingCategory.map((c) => c.name.toLowerCase());
        const newCategories = uniqueNames.filter((name) => !existingNames.includes(name.toLowerCase())).map((name) => ({ name }));
        let createdCategories = [];
        if (newCategories.length > 0) {
            createdCategories = yield db_1.Categoria.bulkCreate(newCategories, {
                validate: true,
                ignoreDuplicates: true,
            });
        }
        res.status(200).json({ message: "Lista de Categorias Creada" });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
routerSupermercado.post("/add/marca", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const marcaNames = req.body;
    try {
        if (!Array.isArray(marcaNames) || marcaNames.length === 0) {
            return res.status(400).json({ message: "Se requiere una lista de categorias" });
        }
        const uniqueNames = [
            ...new Set(marcaNames.map((name) => (typeof name === "string" ? name.trim() : "")).filter((name) => name !== "")),
        ];
        const existingMarca = yield db_1.Marca.findAll({
            where: {
                name: {
                    [sequelize_1.Op.in]: uniqueNames,
                },
            },
        });
        const existingNames = existingMarca.map((c) => c.name.toLowerCase());
        const newMarcas = uniqueNames.filter((name) => !existingNames.includes(name.toLowerCase())).map((name) => ({ name }));
        let createdMarcas = [];
        if (newMarcas.length > 0) {
            createdMarcas = yield db_1.Marca.bulkCreate(newMarcas, {
                validate: true,
                ignoreDuplicates: true,
            });
        }
        res.status(200).json({ message: "Lista de Marca Creada" });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
routerSupermercado.get("/category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allCategory = yield db_1.Categoria.findAll({
            attributes: ["name"],
        });
        res.status(200).send(allCategory);
    }
    catch (error) {
        console.log("Error Category", error);
        res.status(500).json({ message: error });
    }
}));
routerSupermercado.get("/marca", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allMarca = yield db_1.Marca.findAll({
            attributes: ["name"]
        });
        res.status(200).send(allMarca);
    }
    catch (error) {
        console.log("Error Marca", error);
        res.status(500).json({ message: error });
    }
}));
routerSupermercado.get("/product/category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.query;
        if (typeof category !== "string" || !category.trim()) {
            res.status(400).json({ error: "El parámetro 'category' debe ser un string válido" });
            return;
        }
        const typeCategory = yield db_1.Categoria.findOne({
            where: {
                name: category,
            },
        });
        const allProductosByCategory = yield db_1.Producto.findAll({
            include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
            where: {
                categoria_id: typeCategory === null || typeCategory === void 0 ? void 0 : typeCategory.id,
            },
            attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "proveedor.id"],
            group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
        });
        const productosAgrupados = {
            productos5dias: allProductosByCategory.filter((producto) => Number(producto.descuento) === 30),
            productos10dias: allProductosByCategory.filter((producto) => Number(producto.descuento) === 20),
            productos15dias: allProductosByCategory.filter((producto) => Number(producto.descuento) === 10),
        };
        const productosAgrupados2 = [
            { cantidad: productosAgrupados.productos5dias.length, productos: productosAgrupados.productos5dias },
            { cantidad: productosAgrupados.productos10dias.length, productos: productosAgrupados.productos10dias },
            { cantidad: productosAgrupados.productos15dias.length, productos: productosAgrupados.productos15dias },
        ];
        res.status(200).json(productosAgrupados2);
    }
    catch (error) {
        console.log("EEROE ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}));
routerSupermercado.get("/product/marca", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { marca, category } = req.query;
        if (typeof marca !== "string" || !marca.trim()) {
            res.status(400).json({ error: "El parámetro 'Marca' debe ser un string válido" });
            return;
        }
        const typeMarca = yield db_1.Marca.findOne({
            where: {
                name: marca,
            },
        });
        const whereClause = {
            marca_id: typeMarca.id
        };
        if (typeof category === "string" && category.trim()) {
            const typeCategory = yield db_1.Categoria.findOne({ where: { name: category } });
            if (typeCategory) {
                whereClause.categoria_id = typeCategory.id;
            }
        }
        const allProductosByMarca = yield db_1.Producto.findAll({
            include: [{ model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
            where: whereClause,
            attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "proveedor.id"],
            group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "marca.id", "categoria.id", "proveedor.id"],
        });
        const productosAgrupados = {
            productos5dias: allProductosByMarca.filter((producto) => Number(producto.descuento) === 30),
            productos10dias: allProductosByMarca.filter((producto) => Number(producto.descuento) === 20),
            productos15dias: allProductosByMarca.filter((producto) => Number(producto.descuento) === 10),
        };
        const productosAgrupados2 = [
            { cantidad: productosAgrupados.productos5dias.length, productos: productosAgrupados.productos5dias },
            { cantidad: productosAgrupados.productos10dias.length, productos: productosAgrupados.productos10dias },
            { cantidad: productosAgrupados.productos15dias.length, productos: productosAgrupados.productos15dias },
        ];
        res.status(200).json(productosAgrupados2);
    }
    catch (error) {
        console.log("EEROE ", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}));
routerSupermercado.get("/promociones", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [productosDescuento5Dias, productosDescuento10Dias, productosDescuento15Dias] = yield Promise.all([
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
                where: { descuento: { [sequelize_1.Op.eq]: 10 } },
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "categoria.id", "codigobarras", "marca.id", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
                where: { descuento: { [sequelize_1.Op.eq]: 20 } },
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
                where: { descuento: { [sequelize_1.Op.eq]: 30 } },
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
            }),
        ]);
        const productoAgrupados = [
            {
                cantidad: productosDescuento5Dias.length,
                productos: productosDescuento5Dias,
            },
            {
                cantidad: productosDescuento10Dias.length,
                productos: productosDescuento10Dias,
            },
            {
                cantidad: productosDescuento15Dias.length,
                productos: productosDescuento15Dias,
            },
        ];
        res.status(200).json(productoAgrupados);
    }
    catch (error) {
        console.log("Error al obtener productos con descuento ", error);
        res.status(500).json({ message: "Error interno en el servidor", error: error }); // Corregido "Erro" → "Error"
    }
}));
routerSupermercado.get("/promociones2", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [productosDescuento5Dias, productosDescuento10Dias, productosDescuento15Dias] = yield Promise.all([
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
                where: { descuento: { [sequelize_1.Op.eq]: 10 } },
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "categoria.id", "codigobarras", "marca.id", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
                where: { descuento: { [sequelize_1.Op.eq]: 20 } },
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor" }],
                where: { descuento: { [sequelize_1.Op.eq]: 30 } },
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"],
            }),
        ]);
        const productoAgrupados = [
            {
                cantidad: productosDescuento5Dias.length,
                productos: productosDescuento5Dias,
            },
            {
                cantidad: productosDescuento10Dias.length,
                productos: productosDescuento10Dias,
            },
            {
                cantidad: productosDescuento15Dias.length,
                productos: productosDescuento15Dias,
            },
        ];
        res.status(200).json(productoAgrupados);
    }
    catch (error) {
        console.log("Error al obtener productos con descuento ", error);
        res.status(500).json({ message: "Error interno en el servidor", error: error }); // Corregido "Erro" → "Error"
    }
}));
routerSupermercado.get("/productos/stock", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conteo = yield db_1.Categoria.findAll({
            attributes: [
                "id",
                "name",
                [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("productos.id")), "cantidad"],
                [sequelize_1.Sequelize.col("productos.proveedor.id"), "proveedor_id"],
                [sequelize_1.Sequelize.col("productos.proveedor.name"), "proveedor_name"],
                [sequelize_1.Sequelize.col("productos.proveedor.email"), "proveedor_email"],
                [sequelize_1.Sequelize.col("productos.proveedor.phone"), "proveedor_phone"],
            ],
            include: [
                {
                    model: db_1.Producto,
                    as: "productos",
                    attributes: [],
                    include: [
                        {
                            model: db_1.Proveedor,
                            as: "proveedor",
                            attributes: [],
                            required: true,
                        },
                    ],
                },
            ],
            group: ["Categoria.id", "productos.proveedor.id"],
            raw: true,
        });
        // Formatear resultados
        const resultado = conteo.map((item) => ({
            categoria: {
                id: item.id,
                nombre: item.name,
            },
            proveedor: {
                id: item.proveedor_id,
                nombre: item.proveedor_name,
                correo: item.proveedor_email,
                telefono: item.proveedor_phone,
            },
            cantidad: item.cantidad,
        }));
        // Filtrar productos con stock < 10
        const conStockBajo = resultado.filter((item) => item.cantidad < 10);
        res.json(conStockBajo);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ mensaje: "Error al obtener datos" });
    }
}));
routerSupermercado.get("/productos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalProductos, productosConDescuento] = yield Promise.all([
            db_1.Producto.count(),
            db_1.Producto.count({ where: { descuento: { [sequelize_1.Op.gt]: 0 } } }),
        ]);
        const newRespuestas = [
            {
                totalProductos: { valor: totalProductos },
            },
            {
                totalDescuento: { valor: productosConDescuento },
            },
        ];
        res.json(newRespuestas);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ mensaje: "Error al obtener estadísticas " });
    }
}));
routerSupermercado.put("/productos/modicar/precio", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { precio, codigoBarras } = req.body;
    try {
        const allProductos = yield db_1.Producto.findAll({
            where: { codigobarras: codigoBarras }
        });
        if (allProductos.length === 0) {
            res.status(404).json({ message: "CODIGO DE BARRAS INCORRECTO, PRODUCTO NO ENCONTRADO" });
            return;
        }
        yield Promise.all(allProductos.map((producto) => __awaiter(void 0, void 0, void 0, function* () {
            producto.precio = precio;
            yield producto.save();
        })));
        let cantidadProductosModificados = allProductos.length;
        res.status(200).json({ message: `Se modificaron ${cantidadProductosModificados} productos` });
    }
    catch (error) {
        console.log("El error fue ", error);
        res.status(500).json({ message: "Error del servidor", error: error });
    }
}));
routerSupermercado.put("/productos/modicar/proovedor", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nameProveedor, codigoBarras } = req.body;
    try {
        const allProductos = yield db_1.Producto.findAll({
            where: { codigobarras: codigoBarras }
        });
        const existingProveedor = yield db_1.Proveedor.findOne({
            where: { name: nameProveedor }
        });
        if (!existingProveedor) {
            res.status(404).json({ message: `No se encontro proveedor con este Correro ${nameProveedor}` });
            return;
        }
        if (allProductos.length === 0) {
            res.status(404).json({ message: "CODIGO DE BARRAS INCORRECTO, PRODUCTO NO ENCONTRADO" });
            return;
        }
        yield Promise.all(allProductos.map((producto) => __awaiter(void 0, void 0, void 0, function* () {
            producto.proveedor_id = existingProveedor.id;
            yield producto.save();
        })));
        let cantidadProductosModificados = allProductos.length;
        res.status(200).json({ message: `Se modificaron ${cantidadProductosModificados} productos` });
    }
    catch (error) {
        console.log("El error fue ", error);
        res.status(500).json({ message: "Error del servidor", error: error });
    }
}));
routerSupermercado.post("/solicitud", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredField = [
        "name",
        "surname",
        "email",
        "password",
        "role",
        "phone",
        "name_supermercado",
        "departamento",
        "localidad",
        "provincia",
        "address",
        "estado",
        "fecha_solicitud",
        "run",
    ];
    const { name, surname, email, password, role, dni, phone, name_supermercado, localidad, provincia, address, departamento, estado, fecha_solicitud, run, } = req.body;
    try {
        if ((0, utils_1.validateRequiredStrings)(req.body, requiredField)) {
            const newSolicitudSupermercado = yield db_1.SolicitudSupermercado.create({
                name,
                surname,
                email,
                password,
                role,
                phone,
                dni,
                nameSupermercado: name_supermercado,
                localidad,
                provincia,
                departamento: departamento,
                address,
                estado,
                fecha_solicitud,
                run,
            });
            res.status(200).json({ data: newSolicitudSupermercado });
        }
    }
    catch (error) {
        console.log("El error fue", error);
        res.status(500).json({ message: error });
    }
}));
routerSupermercado.get("/lista/solicitud/supermercados", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listSolicitudeSupermarket = yield db_1.SolicitudSupermercado.findAll();
        res.status(200).json({ data: listSolicitudeSupermarket });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
routerSupermercado.get("/proveedores", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("aquiwww");
        const supermercadoId = req.user.supermercado_id;
        if (!supermercadoId) {
            return res.status(400).json({ message: "ID de supermercado no disponible en el usuario autenticado." });
        }
        const supermercado = yield db_1.Supermercado.findByPk(supermercadoId, {
            include: {
                model: db_1.Proveedor,
                as: "proveedores",
                through: { attributes: [] },
            },
        });
        if (!supermercado) {
            return res.status(404).json({ message: "Supermercado no encontrado." });
        }
        res.status(200).json(supermercado);
    }
    catch (error) {
        console.error("Error al obtener proveedores:", error);
        res.status(500).json({ message: "Error del Servidor" });
    }
}));
routerSupermercado.put("/proveedor/:id", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, razonSocial, cuit, dirreccion, phone, email } = req.body;
    const requiredField = ["name", "razonSocial", "cuit", "direccion", "phone", "email"];
    try {
        if (!(0, utils_1.validateRequiredStrings)(req.body, requiredField)) {
            res.status(400).json({ message: "TODOS LOS CAMPOS SON OBLIGATORIOS" });
            return;
        }
        const proveedor = yield db_1.Proveedor.findByPk(id);
        if (!proveedor) {
            res.status(404).json({ message: "Proveedor no encontrado" });
            return;
        }
        yield proveedor.update({
            name,
            razonSocial,
            cuit,
            direccion: dirreccion,
            phone,
            email
        });
        res.status(200).json({ message: "Se Actualizo el proveedor", proveedor });
    }
    catch (error) {
        console.log("EL ERROR FUE", error);
        res.status(500).json({ message: "Error del servidor", error });
    }
}));
routerSupermercado.delete("/proveedor/:id", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const proveedor = yield db_1.Proveedor.findByPk(id);
        if (!proveedor) {
            res.status(404).json({ message: "No se encontro el Proveedor" });
            return;
        }
        yield proveedor.destroy();
        res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.log("EL ERROR FUE", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}));
routerSupermercado.post("/promociones/personalizadas", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { descuentos, horaCron } = req.body;
        const userId = req.user.supermercado_id;
        if (!Array.isArray(descuentos)) {
            return res.status(400).json({ message: "Formato incorrecto" });
        }
        const cronExpression = typeof horaCron === "string" && horaCron !== "" ? horaCron : "0 0 * * *";
        // Si ya hay un cron para este supermercado, detenelo
        if (cronJob_1.cronJobs[userId]) {
            cronJob_1.cronJobs[userId].stop();
            delete cronJob_1.cronJobs[userId];
        }
        // Crear nueva tarea
        const newCron = node_cron_1.default.schedule(cronExpression, () => {
            console.log(`Ejecutando descuento para supermercado ${userId}`);
            (0, descuentoServices_1.checkExpiringProductsPersonalizado)(descuentos, userId);
        });
        // Guardar la tarea en el objeto global
        cronJob_1.cronJobs[userId] = newCron;
        return res.status(200).json({
            message: "Tarea programada con éxito",
            cron: cronExpression,
            descuentos,
        });
    }
    catch (error) {
        console.error("Error en programación de tarea:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
}));
routerSupermercado.get("/promociones/dias", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dias } = req.query;
        if (dias && dias !== "0") {
            console.log("DIAS PRIMERO ES ", dias);
            const diasNumero = dias && dias !== "" ? parseInt(dias, 10) : null;
            if (diasNumero === null || isNaN(diasNumero)) {
                res.status(400).json({ message: "Parámetro 'dias' inválido" });
                return;
            }
            const productos = yield db_1.Producto.findAll({
                include: [
                    { model: db_1.Categoria, as: "categoria", attributes: ["name"] },
                    { model: db_1.Marca, as: "marca", attributes: ["name"] },
                    { model: db_1.Proveedor, as: "proveedor", attributes: ["name"] },
                ],
                where: (0, sequelize_1.where)((0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fechavencimiento')), '=', (0, sequelize_1.literal)(`CURRENT_DATE + INTERVAL '${diasNumero} days'`)),
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"]
            });
            res.status(200).json({ cantidad: productos.length, allProductos: productos });
        }
        else {
            console.log("DIAS SEGUNDO");
            const allProductos = yield db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }, { model: db_1.Marca, as: "marca", attributes: ["name"] }, { model: db_1.Proveedor, as: "proveedor", attributes: ["name"] }],
                where: { descuento: { [sequelize_1.Op.ne]: 0 } },
                attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "proveedor.id"],
                group: ["precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id", "marca.id", "proveedor.id"]
            });
            res.status(200).json({ cantidad: allProductos.length, allProductos });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error del Servidor" });
    }
}));
exports.default = routerSupermercado;
