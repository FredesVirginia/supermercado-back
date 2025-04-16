"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
const socket_1 = require("./socket/socket");
const descuentoServices_1 = require("./services/descuentoServices");
const node_cron_1 = __importDefault(require("node-cron"));
const sendEmail_1 = require("./controllers/sendEmail");
const httpServer = (0, socket_1.setupSocket)(app_1.default); // Usa setupSocket
// Syncing all the models at once.
db_1.conn.sync({ force: false }).then(() => {
    httpServer.listen(3003, '0.0.0.0', () => {
        console.log("Escuchando en el puerto  8000 Harry");
    });
});
node_cron_1.default.schedule("41 10 * * *", () => {
    console.log("Revisando productos proximos a expirar ...");
    (0, descuentoServices_1.checkExpiringProducts)();
});
node_cron_1.default.schedule("21 02 * * * ", () => {
    console.log("INICIANDO ENVIO DE CORREOS");
    (0, sendEmail_1.sendEmailPromotions)();
});
