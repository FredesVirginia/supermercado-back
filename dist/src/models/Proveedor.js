"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProveedor = void 0;
const sequelize_1 = require("sequelize");
class Proveedor extends sequelize_1.Model {
    // Método para formatear CUIT
    getCuitFormateado() {
        return this.cuit.replace(/(\d{2})(\d{8})(\d)/, '$1-$2-$3');
    }
}
const initProveedor = (sequelize) => {
    Proveedor.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        razonSocial: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        cuit: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            unique: true,
            validate: {
                is: /^\d{2}-\d{8}-\d$/,
                notEmpty: true,
            },
        },
        direccion: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            validate: {
                is: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
            },
        },
        email: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            },
        },
    }, {
        sequelize,
        modelName: 'Proveedor',
        // Opciones adicionales:
    });
    return Proveedor;
};
exports.initProveedor = initProveedor;
exports.default = initProveedor;
