"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSupermercado = void 0;
const sequelize_1 = require("sequelize");
class Supermercado extends sequelize_1.Model {
}
const initSupermercado = (sequelize) => {
    Supermercado.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        name: {
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
            allowNull: false,
        },
        localidad: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        run: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: "Supermercado",
    });
    return Supermercado;
};
exports.initSupermercado = initSupermercado;
exports.default = initSupermercado;
