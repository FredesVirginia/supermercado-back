import server from "./app";
import { conn } from "./db";
import { setupSocket } from "./socket/socket";
import { checkExpiringProducts } from "./services/descuentoServices";
import cron from "node-cron";
import { sendEmailPromotions } from "./controllers/sendEmail";
import {client} from "./controllers/whatsappBot"
import { sendWhatsappMessage } from "./services/whatsapServives";
import { initializeWhatsapp } from './controllers/whatsappBot';
const httpServer = setupSocket(server); // Usa setupSocket
initializeWhatsapp();
// Syncing all the models at once.
conn.sync({ force: false }).then(() => {
  httpServer.listen(3003, '0.0.0.0', () => {
    console.log("Escuchando en el puerto  8000 Harry");
  });
});

cron.schedule("21 03 * * *", () => {
  console.log("Revisando productos proximos a expirar ...");
  checkExpiringProducts();
});

cron.schedule("21 02 * * * " ,()=>{
  console.log("INICIANDO ENVIO DE CORREOS");
  sendEmailPromotions()

} )

cron.schedule('17 04 * * *', async () => {
  console.log('⌛ Ejecutando tarea programada...');

  const numero = '5492966572349'; // ✅ Formato internacional SIN espacios
  const mensaje = 'Hola peps, esto es un mensaje automático 📩';

  try {
    // Verificamos que el cliente esté conectado
    if (!client.info) {
      console.log('⚠️ Cliente de WhatsApp aún no está listo...');
      return;
    }

    await sendWhatsappMessage(numero, mensaje);
    console.log('✅ Mensaje enviado automáticamente!');
  } catch (error) {
    console.error('❌ Error al enviar el mensaje:', error);
  }
});
