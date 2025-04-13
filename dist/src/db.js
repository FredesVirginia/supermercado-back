"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudSupermercado = exports.Categoria = exports.Supermercado = exports.Proveedor = exports.Producto = exports.User = exports.models = exports.sequelize = exports.conn = void 0;
const path = require("path");
//require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
require("dotenv").config({ path: path.resolve(process.cwd(), '.env') });
const { Sequelize } = require("sequelize");
const fs = require("fs");
const { DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE } = process.env;
const User_1 = __importDefault(require("./models/User"));
const Categoria_1 = __importDefault(require("./models/Categoria"));
const Historial_1 = __importDefault(require("./models/Historial"));
const Notificacion_1 = __importDefault(require("./models/Notificacion"));
const Producto_1 = __importDefault(require("./models/Producto"));
const Promocion_1 = __importDefault(require("./models/Promocion"));
const Reporte_1 = __importDefault(require("./models/Reporte"));
const Supermercado_1 = __importDefault(require("./models/Supermercado"));
const Proveedor_1 = __importDefault(require("./models/Proveedor"));
const SolicitudesSupermercados_1 = __importDefault(require("./models/SolicitudesSupermercados"));
const isProduction = process.env.NODE_ENV === 'production';
// console.log("LA INS PRDUCO ES " , isProduction)
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}`, {
    dialect: 'postgres',
    dialectOptions: isProduction
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }
        : {},
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
exports.sequelize = sequelize;
const basename = path.basename(__filename);
const modelDefiners = [];
// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
    .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts")
    .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
});
// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => {
    if (model.default) {
        model.default(sequelize); // Para modelos exportados con `export default`
    }
    else {
        model(sequelize); // Para modelos exportados con `module.exports`
    }
});
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);
const User = (0, User_1.default)(sequelize);
exports.User = User;
const Supermercado = (0, Supermercado_1.default)(sequelize);
exports.Supermercado = Supermercado;
const Categoria = (0, Categoria_1.default)(sequelize);
exports.Categoria = Categoria;
const Historial = (0, Historial_1.default)(sequelize);
const Notificacion = (0, Notificacion_1.default)(sequelize);
const Producto = (0, Producto_1.default)(sequelize);
exports.Producto = Producto;
const Promocion = (0, Promocion_1.default)(sequelize);
const Reporte = (0, Reporte_1.default)(sequelize);
const Proveedor = (0, Proveedor_1.default)(sequelize);
exports.Proveedor = Proveedor;
const SolicitudSupermercado = (0, SolicitudesSupermercados_1.default)(sequelize);
exports.SolicitudSupermercado = SolicitudSupermercado;
const models = sequelize.models;
exports.models = models;
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
exports.conn = sequelize;
