"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSolicitudSupermercado = void 0;
const sequelize_1 = require("sequelize");
class SolicitudSupermercado extends sequelize_1.Model {
}
const initSolicitudSupermercado = (sequelize) => {
    SolicitudSupermercado.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        surname: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        phone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        dni: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('admin', 'super-admin', 'invited'),
            allowNull: false,
            defaultValue: 'admin',
            validate: {
                isIn: [['admin', 'super-admin', 'invited']]
            }
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: true,
                len: [8, 128]
            }
        },
        nameSupermercado: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        provincia: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        departamento: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        localidad: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: sequelize_1.DataTypes.ENUM("pendiente", "aceptada", "rechada"),
            allowNull: false,
            defaultValue: 'pendiente',
        },
        fecha_solicitud: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        run: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'SolicitudSupermercado',
    });
    return SolicitudSupermercado;
};
exports.initSolicitudSupermercado = initSolicitudSupermercado;
exports.default = initSolicitudSupermercado;
