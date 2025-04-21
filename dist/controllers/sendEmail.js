"use strict";
// import { Op } from "sequelize";
// import { Producto, User } from "../db";
// import nodemailer from "nodemailer";
// import { UserRole } from "../types/types";
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
exports.sendEmailPromotions2 = void 0;
// function crearPlantillaEmail(productos: any) {
//     return `
//       <h1>¡Ofertas especiales para ti!</h1>
//       ${productos.map((p: { marca: any; precio: any; preciodescuento: any; descuento: any; categoria: { name: any; }; }) => `
//         <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
//           <h3>${p.marca}</h3>
//           <p>Antes: $${p.precio} → Ahora: $${p.preciodescuento}</p>
//           <p>Descuento: ${p.descuento}%</p>
//           <p>Categoría: ${p.categoria.name}</p>
//         </div>
//       `).join('')}
//     `;
//   }
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const types_1 = require("../types/types");
const client_ses_1 = require("@aws-sdk/client-ses");
function crearPlantillaEmail(productos) {
    return `
    <h1>¡Ofertas especiales para ti!</h1>
    ${productos.map((p) => `
      <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
        <h3>${p.marca}</h3>
        <p>Antes: $${p.precio} → Ahora: $${p.preciodescuento}</p>
        <p>Descuento: ${p.descuento}%</p>
        <p>Categoría: ${p.categoria.name}</p>
      </div>
    `).join('')}
  `;
}
const ses = new client_ses_1.SESClient({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const sendEmailPromotions2 = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productosConDescuento = yield db_1.Producto.findAll({
            where: {
                descuento: { [sequelize_1.Op.gt]: 0 },
            },
            include: ['categoria'],
        });
        const usuarios = yield db_1.User.findAll({
            where: { role: types_1.UserRole.CLIENT },
        });
        const html = crearPlantillaEmail(productosConDescuento);
        const promises = usuarios.map((usuario) => {
            const params = {
                Source: process.env.EMAIL_USER,
                Destination: {
                    ToAddresses: [usuario.email],
                },
                Message: {
                    Subject: {
                        Data: '🔥 Tus promociones semanales',
                    },
                    Body: {
                        Html: {
                            Data: html,
                        },
                    },
                },
            };
            const command = new client_ses_1.SendEmailCommand(params);
            return ses.send(command);
        });
        yield Promise.all(promises);
        console.log('Correos enviados a', usuarios.length);
    }
    catch (error) {
        console.error('Error enviando promociones:', error);
    }
});
exports.sendEmailPromotions2 = sendEmailPromotions2;
