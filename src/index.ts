import server from "./app";
import { conn } from "./db";
import { setupSocket } from "./socket/socket";
import { checkExpiringProducts , } from "./services/descuentoServices";
import cron from "node-cron";
import {  sendEmailPromotions2 } from "./controllers/sendEmail";

const httpServer = setupSocket(server); // Usa setupSocketi

// Syncing all the models at once.
conn.sync({ force: false }).then(() => {
  httpServer.listen(3000, '0.0.0.0', () => {
    console.log("Escuchando en el puerto  8000 Harry");
  });
});

cron.schedule("30 21 * * *", () => {
  console.log("Revisando productos proximos a expirar ...");
  checkExpiringProducts();
});


// cron.schedule("44 17 * * * " ,()=>{
//   console.log("INICIANDO ENVIO DE CORREOS");
//   sendEmailPromotions2()





// } )
