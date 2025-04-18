"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPromocion = void 0;
const sequelize_1 = require("sequelize");
class Promocion extends sequelize_1.Model {
}
const initPromocion = (sequelize) => {
    Promocion.init({
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
                len: [10, 500]
            }
        },
        fecha: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        fechaExpiracion: {
            type: sequelize_1.DataTypes.DATE,
            validate: {
                isDateAfter(value) {
                    if (value && value < new Date()) {
                        throw new Error('La fecha de expiración debe ser futura');
                    }
                }
            }
        },
        descuento: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            validate: {
                min: 0,
                max: 100
            }
        },
        imagenUrl: {
            type: sequelize_1.DataTypes.STRING,
            validate: {
                isUrl: true
            }
        }
    }, {
        sequelize,
        modelName: "Promocion",
        indexes: [
            { fields: ['fecha'] },
            { fields: ['fechaExpiracion'] }
        ]
    });
    return Promocion;
};
exports.initPromocion = initPromocion;
exports.default = initPromocion;
