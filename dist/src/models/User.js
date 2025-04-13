"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    // Métodos personalizados
    getFullName() {
        return `${this.name} ${this.surname}`;
    }
    verifyPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementación de verificación de contraseña (usando bcrypt, etc.)
            return true; // Reemplazar con lógica real
        });
    }
}
const initUser = (sequelize) => {
    User.init({
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
            validate: {
                notEmpty: true,
                is: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
            }
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        dni: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('admin', 'super-admin', 'invited', 'client'),
            allowNull: false,
            defaultValue: 'admin',
            validate: {
                isIn: [['admin', 'super-admin', 'invited', 'client']]
            }
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [8, 128] // Mínimo 8 caracteres
            }
        },
    }, {
        sequelize,
        modelName: 'User',
        // Opciones adicionales:
    });
    return User;
};
exports.default = initUser;
