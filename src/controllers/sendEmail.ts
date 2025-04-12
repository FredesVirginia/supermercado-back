import { Op } from "sequelize";
import { Producto, User } from "../db";
import nodemailer from "nodemailer";
import { UserRole } from "../types/types";

const transporter = nodemailer.createTransport({
    service : 'Gmail',
    auth : {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    }
});

export const sendEmailPromotions = async ()=>{
    try{
        const productosConDescuento = await Producto.findAll({
            where : {
                descuento : {[Op.gt] : 0}
            },
            include : ['categoria']
        })

        //ONTENIENDO USARIOS SUPCRIPTOS

        const usuarios = await User.findAll({
            where : { role : UserRole.CLIENT}
        })
        //CREACION DE PLANTILLA
        const html = crearPlantillaEmail(productosConDescuento);

        //ENVIAR CORREOS 
        for(const usuario of usuarios){
            await transporter.sendMail({
                from: `"SuperOfertas" <${process.env.EMAIL_USER}>`, 
                to: usuario.email,
                subject: '🔥 Tus promociones semanales', 
                html
            })
        }
        console.log("CORREOS ENVIADOS A " , usuarios.length)
       
    }catch(error : any){
        console.error('Error enviando promociones:', error);
    }
}



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