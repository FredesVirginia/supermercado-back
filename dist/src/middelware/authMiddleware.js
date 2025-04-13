"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const types_1 = require("../types/types");
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        res.status(401).json({ message: "Acceso denegado, Token no proporcionado" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        if (!Object.values(types_1.UserRole).includes(decoded.role)) {
            res.status(401).json({ message: "Role inválido en el token" });
            return;
        }
        console.log("decored es ", decoded.supermercado_id);
        req.user = {
            id: decoded.id,
            role: decoded.role,
            supermercado_id: decoded.supermercado_id,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ message: "Token expirado" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ message: "Token inválido" });
            return;
        }
        console.error("Error en authMiddleware:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
exports.authMiddleware = authMiddleware;
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            // Enviar una respuesta directamente sin retornar un valor en el middleware
            res.status(403).json({ message: "Acceso Denegado444444444444444444444444444" });
            return; // Asegurarse de que el middleware termine aquí y no pase al siguiente
        }
        next(); // Continuar con el siguiente middleware o controlador si la validación es exitosa
    };
};
exports.roleMiddleware = roleMiddleware;
exports = {
    authMiddleware: exports.authMiddleware,
    roleMiddleware: exports.roleMiddleware,
};
