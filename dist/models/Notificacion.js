"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNotificacion = void 0;
const sequelize_1 = require("sequelize");
class Notificacion extends sequelize_1.Model {
}
const initNotificacion = (sequelize) => {
    Notificacion.init({
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
                len: [1, 1000]
            }
        },
        fecha: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        // Campos adicionales opcionales:
    }, {
        sequelize,
        modelName: "Notificacion",
        // Opciones adicionales:
    });
    return Notificacion;
};
exports.initNotificacion = initNotificacion;
exports.default = initNotificacion;
