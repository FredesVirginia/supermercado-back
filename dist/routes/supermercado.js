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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middelware/authMiddleware");
const types_1 = require("../types/types");
const utils_1 = require("../utils/utils");
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const routerSupermercado = (0, express_1.Router)();
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
            console.log("PROVEEDOR ", existingProveedor);
            const product = yield db_1.Producto.create({
                marca,
                fechavencimiento,
                preciodescuento,
                precio,
                descuento: 0,
                codigobarras,
                categoria_id: existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.getDataValue("id"),
                supermercado_id: req.user.supermercado_id,
                proveedor_id: existingProveedor === null || existingProveedor === void 0 ? void 0 : existingProveedor.getDataValue("id"),
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
    try {
        if ((0, utils_1.validateRequiredStrings)(req.body, requiredField)) {
            const proveedor = yield db_1.Proveedor.create({
                name,
                razonSocial,
                cuit,
                direccion,
                phone,
                email,
            });
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
routerSupermercado.get("/category", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.ADMIN, types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allCategory = yield db_1.Categoria.findAll({
            // WHERE name = 'Juan'
            attributes: ["name"], // Seleccionar solo estos campos
        });
        res.status(200).send(allCategory);
    }
    catch (error) {
        console.log("Error Category", error);
        res.status(500).json({ message: error });
    }
}));
routerSupermercado.get("/promociones", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [productosDescuento5Dias, productosDescuento10Dias, productosDescuento15Dias] = yield Promise.all([
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }],
                where: { descuento: { [sequelize_1.Op.eq]: 10 } },
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }],
                where: { descuento: { [sequelize_1.Op.eq]: 20 } },
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ["name"] }],
                where: { descuento: { [sequelize_1.Op.eq]: 30 } },
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
        res.status(500).json({ message: "Error interno en el servidor" }); // Corregido "Erro" → "Error"
    }
}));
// routerSupermercado.get("/productos/stock", async (req: Request, res: Response) => {
//   try {
//     const conteo = await Categoria.findAll({
//       attributes: {
//         include: [[Sequelize.fn("COUNT", "productos.id"), "cantidad"]],
//       },
//       include: [
//         {
//           model: Producto,
//           as: "productos",
//           attributes: [],
//         },
//       ],
//       group: ["Categoria.id"],
//       raw: true,
//     });
//     // Formato de salida
//     const totalProductos = conteo.map((categoria: CategoriaAttributes) => ({
//       cantidad: categoria.cantidad,
//       categoria: categoria.name,
//     }));
//     const totalProductosMenorStock = totalProductos.filter((q: { cantidad: number }) => q.cantidad < 10);
//     res.json(totalProductosMenorStock);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ mensaje: "Error al obtener datos" });
//   }
// });
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
        if ((0, utils_1.validateRequiredStrings)(requiredField, req.body)) {
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
exports.default = routerSupermercado;
