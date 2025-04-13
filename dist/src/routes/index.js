"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("./user"));
const supermercado_1 = __importDefault(require("./supermercado"));
const reportes_1 = __importDefault(require("./reportes"));
const router = (0, express_1.Router)();
router.use("/users/", user_1.default);
router.use("/supermarket/", supermercado_1.default);
router.use("/reportes", reportes_1.default);
//  router.use("/articulos" , articulo)
exports.default = router;
