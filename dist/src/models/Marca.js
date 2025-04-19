"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMarca = void 0;
const sequelize_1 = require("sequelize");
class Marca extends sequelize_1.Model {
    getNombreMayusculas() {
        return this.name.toUpperCase();
    }
}
const initMarca = (sequelize) => {
    Marca.init({
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
        modelName: "Marca",
    });
    return Marca;
};
exports.initMarca = initMarca;
exports.default = initMarca;
