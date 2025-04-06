
import { Op } from "sequelize";
import { Request, Response } from "express";
import { Producto } from "../db";

export function validateRequiredStrings(obj: any, fields: string[]) {
 
  for (const field of fields) {
    if (obj[field] === null || obj[field] === undefined) {
      return false;
    }

    if (typeof obj[field] === "string" && obj[field].trim() === "") {
      return false;
    }

    if (typeof obj[field] === "number" && isNaN(obj[field])) {
      return false;
    }
  }
  return true;
}

export const getProductosConDescuento = async (req: Request, res: Response) => {
  try {
    const [productosDescuento5Dias, productosDescuento10Dias, productosDescuento15Dias] = await Promise.all([
      Producto.findAll({ where: { descuento: { [Op.eq]: 10 } } }),
      Producto.findAll({ where: { descuento: { [Op.eq]: 20 } } }),
      Producto.findAll({ where: { descuento: { [Op.eq]: 30 } } }),
    ]);

    const productoAgrupados = [
      { cantidad: productosDescuento5Dias.length, productos: productosDescuento5Dias },
      { cantidad: productosDescuento10Dias.length, productos: productosDescuento10Dias },
      { cantidad: productosDescuento15Dias.length, productos: productosDescuento15Dias },
    ];

    res.status(200).json(productoAgrupados);
  } catch (error) {
    console.log("Error al obtener producsto con descuento ", error);
    res.status(500).json({ message: "Erro interno en el servidor" });
  }
};
