"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routerArticulo = (0, express_1.Router)();
// Define las rutas
routerArticulo.get("/", (req, res) => {
    res.send("Lista de artículos");
});
// Exporta el router
exports.default = routerArticulo;
