"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
let io; // Variable para almacenar la instancia de Socket.IO
const setupSocket = (app) => {
    // 1. Crea un servidor HTTP usando Express
    const server = http_1.default.createServer(app);
    // 2. Inicializa Socket.IO y lo configura
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Permite conexiones desde cualquier origen (ajusta en producción)
        },
    });
    // 3. Escucha eventos de conexión y desconexión
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado:', socket.id);
        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });
    // 4. Retorna el servidor HTTP configurado
    return server;
};
exports.setupSocket = setupSocket;
