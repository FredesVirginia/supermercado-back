"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHistorial = void 0;
const sequelize_1 = require("sequelize");
class Historial extends sequelize_1.Model {
    // Métodos personalizados pueden ir aquí
    getResumen() {
        return this.texto.length > 50
            ? `${this.texto.substring(0, 50)}...`
            : this.texto;
    }
}
const initHistorial = (sequelize) => {
    Historial.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        texto: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 2000] // Longitud entre 1 y 2000 caracteres
            }
        },
        fecha: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW // Fecha actual por defecto
        },
    }, {
        sequelize,
        modelName: "Historial",
        // Opciones adicionales:
        // indexes: [{ fields: ['fecha'] }] // Índice por fecha
    });
    return Historial;
};
exports.initHistorial = initHistorial;
exports.default = initHistorial;
