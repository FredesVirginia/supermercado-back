//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
import server from './app';
import { conn } from './db';
import { setupSocket } from './socket/socket';
import { checkExpiringProducts } from './services/descuentoServices';
import cron from 'node-cron';

// // Syncing all the models at once.
// conn.sync({ force: false }).then(() => {
//   server.listen(8000, () => {
//     console.log('Escuchando en el puerto 3001 Harry'); // eslint-disable-line no-console
//   });
// });

// Configura Socket.IO
const httpServer = setupSocket(server); // Usa setupSocket

// Syncing all the models at once.
conn.sync({ force: true}).then(() => {
  httpServer.listen(8000, () => {
    console.log('Escuchando en el puerto  8000 Harry'); // eslint-disable-line no-console
  });
});

cron.schedule('25 18 * * *' , ()=>{
  console.log("Revisando productos proximos a expirar ...")
  checkExpiringProducts()
})
