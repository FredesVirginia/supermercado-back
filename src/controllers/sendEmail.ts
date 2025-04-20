// import { Op } from "sequelize";
// import { Producto, User } from "../db";
// import nodemailer from "nodemailer";
// import { UserRole } from "../types/types";


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
import { Op } from "sequelize";
import { Producto, User } from "../db";
import { UserRole } from "../types/types";
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

function crearPlantillaEmail(productos: any) {
  return `
    <h1>¡Ofertas especiales para ti!</h1>
    ${productos.map((p: { marca: any; precio: any; preciodescuento: any; descuento: any; categoria: { name: any; }; }) => `
      <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
        <h3>${p.marca}</h3>
        <p>Antes: $${p.precio} → Ahora: $${p.preciodescuento}</p>
        <p>Descuento: ${p.descuento}%</p>
        <p>Categoría: ${p.categoria.name}</p>
      </div>
    `).join('')}
  `;
}

const ses = new SESClient({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const sendEmailPromotions2 = async () => {
  try {
    const productosConDescuento = await Producto.findAll({
      where: {
        descuento: { [Op.gt]: 0 },
      },
      include: ['categoria'],
    });

    const usuarios = await User.findAll({
      where: { role: UserRole.CLIENT },
    });

    const html = crearPlantillaEmail(productosConDescuento);

    const promises = usuarios.map((usuario) => {
      const params = {
        Source: process.env.EMAIL_USER!,
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

      const command = new SendEmailCommand(params);
      return ses.send(command);
    });

    await Promise.all(promises);
    console.log('Correos enviados a', usuarios.length);
  } catch (error) {
    console.error('Error enviando promociones:', error);
  }
};



 

