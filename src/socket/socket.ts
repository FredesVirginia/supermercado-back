import { Server } from 'socket.io';
import http from 'http';
import { Express } from 'express';

let io: Server; // Variable para almacenar la instancia de Socket.IO

export const setupSocket = (app: Express.Application) => {
  // 1. Crea un servidor HTTP usando Express
  const server = http.createServer(app);

  // 2. Inicializa Socket.IO y lo configura
  io = new Server(server, {
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

// 5. Exporta la instancia de Socket.IO para usarla en otros módulos
export { io };