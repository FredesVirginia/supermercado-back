"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initReporte = void 0;
const sequelize_1 = require("sequelize");
class Reporte extends sequelize_1.Model {
    // Método para marcar como resuelto
    marcarComoResuelto() {
        return this.update({ estado: 'resuelto' });
    }
}
const initReporte = (sequelize) => {
    Reporte.init({
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
                len: [10, 2000] // Texto entre 10 y 2000 caracteres
            }
        },
        fecha: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        // Campos adicionales opcionales:
        tipo: {
            type: sequelize_1.DataTypes.ENUM('error', 'advertencia', 'informe'),
            defaultValue: 'informe'
        },
        estado: {
            type: sequelize_1.DataTypes.ENUM('pendiente', 'revisado', 'resuelto'),
            defaultValue: 'pendiente'
        }
    }, {
        sequelize,
        modelName: "Reporte",
        // Opciones adicionales:
        paranoid: true, // Para soft delete
        indexes: [
            { fields: ['fecha'] },
            { fields: ['tipo'] },
            { fields: ['estado'] }
        ],
        scopes: {
            pendientes: {
                where: { estado: 'pendiente' }
            },
            recientes: {
                order: [['fecha', 'DESC']],
                limit: 100
            }
        }
    });
    return Reporte;
};
exports.initReporte = initReporte;
exports.default = initReporte;
