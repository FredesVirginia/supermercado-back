import { Router , Request , Response } from "express";
import { authMiddleware, roleMiddleware } from "../middelware/authMiddleware";
import { UserRole } from "../types/types";
import { getProductosConDescuento, validateRequiredStrings } from "../utils/utils";
import { Op, Sequelize, where } from "sequelize";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Producto } from "../db";

const routerReportes = Router();



routerReportes.get("/", async (req: Request, res: Response) => {
  try {
    const [productosDescuento10, productosDescuento20, productosDescuento30] = await Promise.all([
      Producto.findAll({ where: { descuento: { [Op.eq]: 10 } } }),
      Producto.findAll({ where: { descuento: { [Op.eq]: 20 } } }),
      Producto.findAll({ where: { descuento: { [Op.eq]: 30 } } }),
    ]);

    // Si el cliente acepta PDF (por ejemplo, ?format=pdf en la URL)
    if (req.query.format === 'pdf') {
      // Crear el documento PDF
      const doc = new PDFDocument();
      
      // Configurar headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-descuentos.pdf');
      
      // Pipe el PDF a la respuesta
      doc.pipe(res);

      // Contenido del PDF
      doc.fontSize(20).text('Reporte de Productos con Descuento', { align: 'center' });
      doc.moveDown();

      // Sección 10%
      doc.fontSize(16).text('Productos con 10% de descuento:', { underline: true });
      productosDescuento10.forEach((producto: { codigobarras: any; precio: any; preciodescuento: any; }, index: number) => {
        doc.fontSize(12)
          .text(`${index + 1}. ${producto.codigobarras} - Precio: $${producto.precio} (Descuento: $${producto.preciodescuento})`);
      });

      
      doc.moveDown();

      // Sección 20%
      doc.fontSize(16).text('Productos con 20% de descuento:', { underline: true });
      productosDescuento20.forEach((producto: { codigobarras: any; precio: any; preciodescuento: any; }, index: number) => {
        doc.fontSize(12)
          .text(`${index + 1}. ${producto.codigobarras} - Precio: $${producto.precio} (Descuento: $${producto.preciodescuento})`);
      });
      doc.moveDown();

      // Sección 30%
      doc.fontSize(16).text('Productos con 30% de descuento:', { underline: true });
      productosDescuento30.forEach((producto: { codigobarras: any; precio: any; preciodescuento: any; }, index: number) => {
        doc.fontSize(12)
          .text(`${index + 1}. ${producto.codigobarras} - Precio: $${producto.precio} (Descuento: $${producto.preciodescuento})`);
      });

      // Finalizar el PDF (esto cierra el stream)
      doc.end();
      
      // IMPORTANTE: No enviar nada más después de doc.end()
      return;
    }

    // Si no es PDF, devolver JSON
    const productoAgrupados = [
      { cantidad: productosDescuento10.length, productos: productosDescuento10 },
      { cantidad: productosDescuento20.length, productos: productosDescuento20 },
      { cantidad: productosDescuento30.length, productos: productosDescuento30 },
    ];

    res.status(200).json(productoAgrupados);
    
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error interno en el servidor" });
    }
  }
});

export default routerReportes
