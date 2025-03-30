import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { UserRole } from "../types/types";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: { role: UserRole; supermercado_id: number };
}
export interface User extends Request {
  user?: {
    id: number;
    role: UserRole;
    supermercado_id: number;
  };
}

export const authMiddleware = (req: User, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
 
  if (!token) {
    res.status(401).json({ message: "Acceso denegado, Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET!) as {
      id: number;
      role: string;
      supermercado_id: number;
    };

    if (!Object.values(UserRole).includes(decoded.role as UserRole)) {
      res.status(401).json({ message: "Role inválido en el token" });
      return;
    }
    console.log("decored es " , decoded.supermercado_id)
    req.user = {
      id: decoded.id,
      role: decoded.role as UserRole,
      supermercado_id: decoded.supermercado_id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expirado" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Token inválido" });
      return;
    }

    console.error("Error en authMiddleware:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // Enviar una respuesta directamente sin retornar un valor en el middleware
      res.status(403).json({ message: "Acceso Denegado444444444444444444444444444" });
      return; // Asegurarse de que el middleware termine aquí y no pase al siguiente
    }

    next(); // Continuar con el siguiente middleware o controlador si la validación es exitosa
  };
};

exports = {
  authMiddleware,
  roleMiddleware,
};
