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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailPromotions = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const nodemailer_1 = __importDefault(require("nodemailer"));
const types_1 = require("../types/types");
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const sendEmailPromotions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productosConDescuento = yield db_1.Producto.findAll({
            where: {
                descuento: { [sequelize_1.Op.gt]: 0 }
            },
            include: ['categoria']
        });
        //ONTENIENDO USARIOS SUPCRIPTOS
        const usuarios = yield db_1.User.findAll({
            where: { role: types_1.UserRole.CLIENT }
        });
        //CREACION DE PLANTILLA
        const html = crearPlantillaEmail(productosConDescuento);
        //ENVIAR CORREOS 
        for (const usuario of usuarios) {
            yield transporter.sendMail({
                from: `"SuperOfertas" <${process.env.EMAIL_USER}>`,
                to: usuario.email,
                subject: '🔥 Tus promociones semanales',
                html
            });
        }
        console.log("CORREOS ENVIADOS A ", usuarios.length);
    }
    catch (error) {
        console.error('Error enviando promociones:', error);
    }
});
exports.sendEmailPromotions = sendEmailPromotions;
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
