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
const pdfkit_1 = __importDefault(require("pdfkit"));
const db_1 = require("../db");
const routerReportes = (0, express_1.Router)();
routerReportes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [productosDescuento10, productosDescuento20, productosDescuento30] = yield Promise.all([
            db_1.Producto.findAll({ where: { descuento: { [sequelize_1.Op.eq]: 10 } } }),
            db_1.Producto.findAll({ where: { descuento: { [sequelize_1.Op.eq]: 20 } } }),
            db_1.Producto.findAll({ where: { descuento: { [sequelize_1.Op.eq]: 30 } } }),
        ]);
        // Si el cliente acepta PDF (por ejemplo, ?format=pdf en la URL)
        if (req.query.format === 'pdf') {
            // Crear el documento PDF
            const doc = new pdfkit_1.default();
            // Configurar headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte-descuentos.pdf');
            // Pipe el PDF a la respuesta
            doc.pipe(res);
            // Contenido del PDF
            doc.fontSize(20).text('Reporte de Productos con Descuento', { align: 'center' });
            doc.moveDown();
            // Sección 10%
            doc.fontSize(16).text('Productos con 10% de descuento:', { underline: true });
            productosDescuento10.forEach((producto, index) => {
                doc.fontSize(12)
                    .text(`${index + 1}. ${producto.codigobarras} - Precio: $${producto.precio} (Descuento: $${producto.preciodescuento})`);
            });
            doc.moveDown();
            // Sección 20%
            doc.fontSize(16).text('Productos con 20% de descuento:', { underline: true });
            productosDescuento20.forEach((producto, index) => {
                doc.fontSize(12)
                    .text(`${index + 1}. ${producto.codigobarras} - Precio: $${producto.precio} (Descuento: $${producto.preciodescuento})`);
            });
            doc.moveDown();
            // Sección 30%
            doc.fontSize(16).text('Productos con 30% de descuento:', { underline: true });
            productosDescuento30.forEach((producto, index) => {
                doc.fontSize(12)
                    .text(`${index + 1}. ${producto.codigobarras} - Precio: $${producto.precio} (Descuento: $${producto.preciodescuento})`);
            });
            // Finalizar el PDF (esto cierra el stream)
            doc.end();
            // IMPORTANTE: No enviar nada más después de doc.end()
            return;
        }
        // Si no es PDF, devolver JSON
        const productoAgrupados = [
            { cantidad: productosDescuento10.length, productos: productosDescuento10 },
            { cantidad: productosDescuento20.length, productos: productosDescuento20 },
            { cantidad: productosDescuento30.length, productos: productosDescuento30 },
        ];
        res.status(200).json(productoAgrupados);
    }
    catch (error) {
        console.error("Error al generar el reporte:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error interno en el servidor" });
        }
    }
}));
exports.default = routerReportes;
