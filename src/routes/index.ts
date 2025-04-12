import { Router } from 'express';
import user from './user'; 
import supermercado from './supermercado'
import reporte from './reportes'
const router = Router();
 router.use("/users/" , user);
 router.use("/supermarket/" , supermercado)
 router.use("/reportes" , reporte)
//  router.use("/articulos" , articulo)
    

export default router;