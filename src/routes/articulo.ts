import { Router } from 'express';

const routerArticulo = Router();

// Define las rutas
routerArticulo.get("/", (req, res) => {
  res.send("Lista de artículos");
});

// Exporta el router
export default routerArticulo;