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
exports.checkExpiringProducts = void 0;
const db_1 = require("../db");
const socket_1 = require("../socket/socket");
const sequelize_1 = require("sequelize");
const checkExpiringProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    let productosActualizados = 0; // Contador de productos actualizados
    // Buscar productos que no han expirado
    const productos = yield db_1.Producto.findAll({
        where: {
            fechavencimiento: { [sequelize_1.Op.gte]: today }, // Productos con fecha de vencimiento >= hoy
        },
    });
    // Iterar sobre los productos encontrados
    for (const producto of productos) {
        // Calcular los días restantes hasta la fecha de vencimiento
        const diasHastaVencimiento = Math.floor((producto.getDataValue('fechavencimiento').getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let descuento = 0;
        let precioConDescuento = producto.getDataValue('precio'); // Inicializar con el precio original
        // Asignar descuento según los días restantes
        if (diasHastaVencimiento <= 15 && diasHastaVencimiento > 10) {
            descuento = 10; // 10% de descuento
        }
        else if (diasHastaVencimiento <= 10 && diasHastaVencimiento > 5) {
            descuento = 20; // 20% de descuento
        }
        else if (diasHastaVencimiento <= 5) {
            descuento = 30; // 30% de descuento
        }
        // Si se asignó un descuento, calcular el nuevo precio y actualizar el producto
        if (descuento > 0) {
            // Calcular el precio con descuento
            precioConDescuento = producto.getDataValue('precio') * (1 - descuento / 100);
            // Redondear a 2 decimales (opcional)
            precioConDescuento = Math.round(precioConDescuento * 100) / 100;
            // Actualizar ambos campos
            producto.descuento = descuento;
            producto.preciodescuento = precioConDescuento;
            yield producto.save(); // Guardar el producto actualizado
            productosActualizados++; // Incrementar el contador
        }
    }
    // Enviar notificación solo si hay productos con descuento
    if (productosActualizados > 0) {
        socket_1.io.emit("newDiscount", {
            message: `Se aplicó descuento a ${productosActualizados} productos.`,
            count: productosActualizados
        });
    }
});
exports.checkExpiringProducts = checkExpiringProducts;
