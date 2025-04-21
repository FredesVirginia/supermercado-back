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
exports.getProductosConDescuento = void 0;
exports.validateRequiredStrings = validateRequiredStrings;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
function validateRequiredStrings(obj, fields) {
    for (const field of fields) {
        if (obj[field] === null || obj[field] === undefined) {
            return false;
        }
        if (typeof obj[field] === "string" && obj[field].trim() === "") {
            return false;
        }
        if (typeof obj[field] === "number" && isNaN(obj[field])) {
            return false;
        }
    }
    return true;
}
const getProductosConDescuento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [productosDescuento5Dias, productosDescuento10Dias, productosDescuento15Dias] = yield Promise.all([
            // Quita .then() y .catch() de cada consulta
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ['name'], }],
                where: { descuento: { [sequelize_1.Op.eq]: 10 } }
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ['name'], }],
                where: { descuento: { [sequelize_1.Op.eq]: 20 } }
            }),
            db_1.Producto.findAll({
                include: [{ model: db_1.Categoria, as: "categoria", attributes: ['name'], }],
                where: { descuento: { [sequelize_1.Op.eq]: 30 } }
            })
        ]);
        const productoAgrupados = [
            {
                cantidad: productosDescuento5Dias.length,
                productos: productosDescuento5Dias
            },
            {
                cantidad: productosDescuento10Dias.length,
                productos: productosDescuento10Dias
            },
            {
                cantidad: productosDescuento15Dias.length,
                productos: productosDescuento15Dias
            },
        ];
        res.status(200).json(productoAgrupados);
    }
    catch (error) {
        console.log("Error al obtener productos con descuento ", error);
        res.status(500).json({ message: "Error interno en el servidor" }); // Corregido "Erro" → "Error"
    }
});
exports.getProductosConDescuento = getProductosConDescuento;
