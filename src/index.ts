import server from "./app";
import { conn } from "./db";
import { setupSocket } from "./socket/socket";
import { checkExpiringProducts } from "./services/descuentoServices";
import cron from "node-cron";
import { sendEmailPromotions } from "./controllers/sendEmail";

const httpServer = setupSocket(server); // Usa setupSocket

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
