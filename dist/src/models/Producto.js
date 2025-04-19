"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProducto = void 0;
const sequelize_1 = require("sequelize");
class Producto extends sequelize_1.Model {
}
const initProducto = (sequelize) => {
    Producto.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        codigobarras: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        fechavencimiento: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        descuento: {
            type: sequelize_1.DataTypes.DECIMAL,
            defaultValue: 0,
            allowNull: false,
        },
        precio: {
            type: sequelize_1.DataTypes.DECIMAL,
            allowNull: false,
        },
        preciodescuento: {
            type: sequelize_1.DataTypes.DECIMAL,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: "Producto",
    });
    return Producto;
};
exports.initProducto = initProducto;
exports.default = initProducto;
