"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCategoria = void 0;
const sequelize_1 = require("sequelize");
class Categoria extends sequelize_1.Model {
    // Métodos personalizados pueden ir aquí
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
                notEmpty: true, // Validación adicional
                len: [2, 50] // Longitud entre 2 y 50 caracteres
            }
        },
    }, {
        sequelize,
        modelName: "Categoria",
        // Opciones adicionales:
        // paranoid: true, // Para soft deletes
        // indexes: [{ fields: ['name'] }] // Índices adicionales
    });
    return Categoria;
};
exports.initCategoria = initCategoria;
exports.default = initCategoria;
