
require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DB_USER, DB_PASSWORD, DB_HOST , DB_DATABASE } = process.env;

import initUser from "./models/User";
import initCategoria from "./models/Categoria";
import initHistorial from "./models/Historial";
import initNotificacion from "./models/Notificacion";
import initProducto from "./models/Producto";
import initPromocion from "./models/Promocion";
import initReporte from "./models/Reporte";
import initSupermercado from "./models/Supermercado";
import initProveedor from "./models/Proveedor"
import initSolicitudSupermercado from "./models/SolicitudesSupermercados"
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
const basename = path.basename(__filename);

const modelDefiners: any[] = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter((file: string) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts")
  .forEach((file: any) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => {
  if (model.default) {
    model.default(sequelize); // Para modelos exportados con `export default`
  } else {
    model(sequelize); // Para modelos exportados con `module.exports`
  }
});
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);


const User = initUser(sequelize);
const Supermercado = initSupermercado(sequelize);
const Categoria = initCategoria(sequelize);
const Historial = initHistorial(sequelize);
const Notificacion = initNotificacion(sequelize);
const Producto = initProducto(sequelize)
const Promocion = initPromocion(sequelize);
const Reporte = initReporte(sequelize);
const Proveedor = initProveedor(sequelize)
const SolicitudSupermercado = initSolicitudSupermercado(sequelize)
const models = sequelize.models; 
// 📌 Un Supermercado pertenece a un Usuario (Administrador)
Supermercado.belongsTo(User, { foreignKey: "admin_id", as: "admin" });
User.hasMany(Supermercado, { foreignKey: "admin_id", as: "supermercados" });

// 📌 Un Producto pertenece a una Categoría
Producto.belongsTo(Categoria, { foreignKey: "categoria_id", as: "categoria" });
Categoria.hasMany(Producto, { foreignKey: "categoria_id", as: "productos" });

// UN producto tiene un proveedor y un proveedor tiene muchos productos
Producto.belongsTo(Proveedor, { foreignKey: "proveedor_id", as: "proveedor" });
Proveedor.hasMany(Producto, { foreignKey: "proveedor_id", as: "productos" });


// 📌 Un Producto pertenece a un Supermercado
Producto.belongsTo(Supermercado, { foreignKey: "supermercado_id", as: "supermercado" });
Supermercado.hasMany(Producto, { foreignKey: "supermercado_id", as: "productos" });

// 📌 Un Supermercado tienes muchos proveedores y UN proveedor tiene muchos supermercados
Supermercado.belongsToMany(Proveedor, {
  through: "supermercado_proveedor", 
  foreignKey: "supermercado_id",     
  as: "proveedores"                  
});

Proveedor.belongsToMany(Supermercado, {
  through: "supermercado_proveedor", 
  foreignKey: "proveedor_id",        
  as: "supermercados"                
});

// 📌 Un Historial pertenece a un Producto
Historial.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });
Producto.hasMany(Historial, { foreignKey: "producto_id", as: "historial" });

// 📌 Una Notificación pertenece a un Supermercado
Notificacion.belongsTo(Supermercado, { foreignKey: "supermercado_id", as: "supermercado" });
Supermercado.hasMany(Notificacion, { foreignKey: "supermercado_id", as: "notificaciones" });

// 📌 Una Promoción pertenece a un Producto
Promocion.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });
Producto.hasMany(Promocion, { foreignKey: "producto_id", as: "promociones" });

// 📌 Un Reporte pertenece a un Supermercado
Reporte.belongsTo(Supermercado, { foreignKey: "supermercado_id", as: "supermercado" });
Supermercado.hasMany(Reporte, { foreignKey: "supermercado_id", as: "reportes" });

// 📌 Un Reporte puede pertenecer a un Usuario (opcional, si el admin genera el reporte)
Reporte.belongsTo(User, { foreignKey: "user_id", as: "usuario" });
User.hasMany(Reporte, { foreignKey: "user_id", as: "reportes" });


export const conn = sequelize;

// export default {
//   ...sequelize.models,
//   conn,
// };

export { sequelize, models , User , Producto , Proveedor , Supermercado , Categoria , SolicitudSupermercado};