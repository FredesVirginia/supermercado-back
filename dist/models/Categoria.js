"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCategoria = void 0;
const sequelize_1 = require("sequelize");
class Categoria extends sequelize_1.Model {
    getNombreMayusculas() {
        return this.name.toUpperCase();
    }
}
const initCategoria = (sequelize) => {
    Categoria.init({
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
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
    }, {
        sequelize,
        modelName: "Categoria",
    });
    return Categoria;
};
exports.initCategoria = initCategoria;
exports.default = initCategoria;
