"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils/utils");
const authMiddleware_1 = require("../middelware/authMiddleware");
const types_1 = require("../types/types");
const db_1 = require("../db");
const sequelize_1 = require("sequelize");
const routerUser = (0, express_1.Router)();
routerUser.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role, surname, phone, dni } = req.body;
    const requiredFields = ["name", "email", "password", "role", "surname", "phone", "dni"];
    if ((0, utils_1.validateRequiredStrings)(requiredFields, req.body)) {
        const existingUserDni = yield db_1.User.findOne({
            where: { dni },
        });
        if (existingUserDni) {
            return res.status(409).json({ message: "DNI existente", status: 409 });
        }
        if (!existingUserDni) {
            const existingUserEmail = yield db_1.User.findOne({
                where: { email },
            });
            if (existingUserEmail) {
                return res.status(409).json({ message: "Email existente", status: 409 });
            }
            try {
                const hasshedPassword = yield bcryptjs_1.default.hash(password, 10);
                const newUser = yield db_1.User.create({ name, surname, email, dni, password: hasshedPassword, role, phone });
                const userData = newUser.get({ plain: true });
                delete userData.password;
                return res.status(201).json({ message: "Usuario registrado correctamente", user: userData });
            }
            catch (error) {
                res.status(500).json({ message: "Error al registrar usuario", error, status: 500 });
            }
        }
    }
    res.status(404).json({ message: "Campos incompletos " });
}));
routerUser.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const existingUser = yield db_1.User.findOne({
            where: { email },
            include: [
                {
                    model: db_1.Supermercado,
                    as: "supermercados",
                    required: false, // Para que no falle si no tiene supermercado
                },
            ],
        });
        if (!existingUser)
            return res.status(400).json({ message: "Usuario no registrado" });
        //const isMatch = await bcrypt.compare(password, existingUser.get('password'));
        const isMatch = yield bcryptjs_1.default.compare(password, existingUser.password);
        if (!isMatch)
            return res.status(400).json({ message: "Contraseña incorrecta" });
        // Si es SUPER_ADMIN, generamos el token y respondemos inmediatamente
        if (existingUser.getDataValue("role") === types_1.UserRole.SUPER_ADMIN) {
            const token = jsonwebtoken_1.default.sign({ id: existingUser.getDataValue("id"), role: existingUser.getDataValue("role") }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const userData = existingUser.get({ plain: true });
            delete userData.password;
            return res.status(200).json({ message: "Inicio de sesión exitoso", token, user: userData }); // ✅ SE USA RETURN
        }
        // Si no es SUPER_ADMIN, verificamos que tenga un supermercado asignado
        const supermercado = yield db_1.Supermercado.findOne({
            where: {
                admin_id: existingUser.id,
            },
            include: [
                {
                    model: db_1.User,
                    as: "admin",
                },
            ],
        });
        if (!supermercado) {
            return res.status(400).json({ message: "El usuario no tiene un supermercado asignado" }); // ✅ SE USA RETURN
        }
        // Si el usuario tiene supermercado, generamos el token y respondemos
        const token = jsonwebtoken_1.default.sign({
            id: existingUser.getDataValue("id"),
            role: existingUser.getDataValue("role"),
            supermercado_id: supermercado.getDataValue("id"),
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const userData = existingUser.get({ plain: true });
        delete userData.password;
        return res.status(200).json({ message: "Inicio de sesión exitoso", token, user: userData }); // ✅ SE USA RETURN
    }
    catch (error) {
        console.log("Error login", error);
        return res.status(500).json({ message: "Error INICIO SESION", error }); // ✅ SE USA RETURN
    }
}));
routerUser.post("/addSupermarket", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredFields = ["name", "address", "provincia", "localidad"];
    const { admidEmail, supermercado } = req.body;
    try {
        if (admidEmail && admidEmail !== "") {
            const user = yield db_1.User.findOne({ where: { email: admidEmail } });
            if (user) {
                if ((0, utils_1.validateRequiredStrings)(supermercado, requiredFields)) {
                    const newSupermarket = yield db_1.Supermercado.create(Object.assign(Object.assign({}, supermercado), { admin_id: user.getDataValue("id") }));
                    const deleteSolicitud = yield db_1.SolicitudSupermercado.findOne({
                        where: {
                            [sequelize_1.Op.and]: [{ email: user.email }, { nameSupermercado: newSupermarket.name }, { address: newSupermarket.address }],
                        },
                    });
                    if (deleteSolicitud) {
                        yield deleteSolicitud.destroy();
                    }
                    else {
                        console.log("ÑO EXISTE", deleteSolicitud);
                    }
                    return res.status(200).json({ data: newSupermarket });
                }
                else {
                    return res.status(400).json({ message: "Todos los campos son obligatorios y no pueden estar Vacios" });
                }
            }
            return res.status(400).json({ message: "El correo no se encontro" });
        }
        else {
            return res.status(400).json({ message: "El email es obligatorio" });
        }
    }
    catch (error) {
        console.log("ERROR EN ADDSUPERMARKET", error);
        return res.status(500).json({ error });
    }
}));
routerUser.post("/solicitudes/supermercados", authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)([types_1.UserRole.SUPER_ADMIN]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredField = [
        "name",
        "surname",
        "email",
        "dni",
        "password",
        "role",
        "phone",
        "nameSupermercado",
        "localidad",
        "departamento",
        "provincia",
        "address",
        "run",
    ];
    const { name, surname, email, dni, password, role, phone, nameSupermercado, localidad, departamento, provincia, address, run, } = req.body;
    try {
        if ((0, utils_1.validateRequiredStrings)(requiredField, req.body)) {
            const existinUser = yield db_1.User.findOne({ where: { dni } });
            const existingSupermarket = yield db_1.Supermercado.findOne({
                where: {
                    [sequelize_1.Op.and]: [{ name: nameSupermercado }, { address: address }],
                },
            });
            if (!existinUser) {
                if (existingSupermarket) {
                    return res.status(409).json({
                        message: "Ya existe un supermercado con este nombre en esta direccion",
                    });
                }
                console.log("ÑO HAY");
                const hasshedPassword = yield bcryptjs_1.default.hash(password, 10);
                const newUser = yield db_1.User.create({ name, surname, email, dni, password: hasshedPassword, role, phone });
                if (!existingSupermarket) {
                    const newSupermarket = yield db_1.Supermercado.create({
                        name: nameSupermercado,
                        address,
                        localidad,
                        provincia,
                        departamento,
                        admin_id: newUser.id,
                        run,
                    });
                }
                const deleteSolicitud = yield db_1.SolicitudSupermercado.findOne({
                    where: {
                        [sequelize_1.Op.and]: [{ email }, { nameSupermercado }, { address }],
                    },
                });
                if (deleteSolicitud) {
                    yield deleteSolicitud.destroy();
                }
                return res.status(200).json({ message: "Solicitud Aprobada " });
            }
            else {
                const newSupermarket = yield db_1.Supermercado.create({
                    name: nameSupermercado,
                    address,
                    localidad,
                    provincia,
                    departamento,
                    admin_id: existinUser.id,
                    run,
                });
                const deleteSolicitud = yield db_1.SolicitudSupermercado.findOne({
                    where: {
                        [sequelize_1.Op.and]: [{ email }, { nameSupermercado }, { address }],
                    },
                });
                if (deleteSolicitud) {
                    yield deleteSolicitud.destroy();
                }
                return res.status(200).json({ message: "Solicitud Aprobada " });
            }
        }
    }
    catch (error) {
        console.log("EL ERROR ", error);
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "El DNI ya está registrado" });
        }
        res.status(500).json({ message: "Error Desconocido" });
    }
}));
exports.default = routerUser;
