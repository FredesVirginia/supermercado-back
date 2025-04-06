import { Router, Request, Response } from "express";
import { authMiddleware, roleMiddleware } from "../middelware/authMiddleware";
import { UserRole } from "../types/types";
import { getProductosConDescuento, validateRequiredStrings } from "../utils/utils";
import { Op, Sequelize, where } from "sequelize";
import { Categoria, Producto, Proveedor, Supermercado, User , SolicitudSupermercado} from "../db";
import { CategoriaAttributes } from "../models/Categoria";

const routerSupermercado = Router();

routerSupermercado.post("/add", authMiddleware, roleMiddleware([UserRole.SUPER_ADMIN]), async (req: any, res: any) => {
  const requiredFields = ["name", "address", "provincia", "departamento","localidad"];
  const { admidEmail, supermercado } = req.body;

  try {
    if (admidEmail && admidEmail !== "") {
      const user = await User.findOne({ where: { email: admidEmail } });
      if (user) {
        if (validateRequiredStrings(supermercado, requiredFields)) {
          const existingSupermarket = await Supermercado.findOne({
            where: {
              [Op.and]: [{ name: supermercado.name }, { address: supermercado.address }],
            },
          });

          if (existingSupermarket) {
            return res.status(409).json({
              message: "Ya existe un supermercado con este nombre en esta direccion",
            });
          }

          const newSupermarket = await Supermercado.create({
            ...supermercado,
            admin_id: user.getDataValue("id"),
          });

          return res.status(200).json({ data: newSupermarket });
        } else {
          return res.status(400).json({ message: "Todos los campos son obligatorios y no pueden estar Vacios" });
        }
      }
      return res.status(400).json({ message: "El correo no se encontro" });
    } else {
      return res.status(400).json({ message: "El email es obligatorio" });
    }
  } catch (error) {
    console.log("ERROR EN ADDSUPERMARKET", error);
    return res.status(500).json({ error });
  }
});

routerSupermercado.post("/add/product",authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: any, res: any) => {
    const requiredField = [ "marca",
      "preciodescuento",
      "fechavencimiento",
      "precio",
      "codigobarras",
      "categoria",
      "nombreProveedor",
    ];
    const { marca, preciodescuento, fechavencimiento, stock, precio, codigobarras, categoria, nombreProveedor } = req.body;
    try {
      if (validateRequiredStrings(req.body, requiredField)) {
        const existingCategory = await Categoria.findOne({ where: { name: categoria } });
        const existingProveedor = await Proveedor.findOne({ where: { name: nombreProveedor } });
     

        console.log("PROVEEDOR ", existingProveedor);
        const product = await Producto.create({
          marca,
          fechavencimiento,
          preciodescuento,
          precio,
          descuento: 0,
          codigobarras,
          categoria_id: existingCategory?.getDataValue("id"),
          supermercado_id: req.user.supermercado_id,
          proveedor_id: existingProveedor?.getDataValue("id"),
        });

        return res.status(200).json({ data: product });
      }
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    } catch (error) {
      console.log("ERROR EN ADD PRODUCTO", error);
      return res.status(500).json({ error });
    }
  }
);

routerSupermercado.post("/add/proveedor",authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: any, res: any) => {
    const requiredField = ["name", "razonSocial", "cuit", "direccion", "phone", "email"];
    const { name, razonSocial, cuit, direccion, phone, email } = req.body;
    try {
      if (validateRequiredStrings(req.body, requiredField)) {
        const proveedor = await Proveedor.create({
          name,
          razonSocial,
          cuit,
          direccion,
          phone,
          email,
        });
        return res.status(200).json({ data: proveedor });
      }
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    } catch (error: any) {
      console.log("ERROR EN ADD PRODUCTO ", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        const duplicateField = error.parent?.detail?.match(/\((.*?)\)=\((.*?)\)/)?.[1] || "campo único";
        console.log("ERROR ", error.parent.detail);
        return res.status(400).json({
          message: `El valor para ${duplicateField} ya existe en el sistema`,
        });
      }

      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

routerSupermercado.post("/add/category",authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: any, res: any) => {
    const categoryNames: string[] = req.body;
    try {
      if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
        return res.status(400).json({ message: "Se requiere una lista de categorias" });
      }

      const uniqueNames = [
        ...new Set(categoryNames.map((name) => (typeof name === "string" ? name.trim() : "")).filter((name) => name !== "")),
      ];

      const existingCategory = await Categoria.findAll({
        where: {
          name: {
            [Op.in]: uniqueNames,
          },
        },
      });

      const existingNames = existingCategory.map((c: { name: string }) => c.name.toLowerCase());
      const newCategories = uniqueNames.filter((name) => !existingNames.includes(name.toLowerCase())).map((name) => ({ name }));

      let createdCategories = [];
      if (newCategories.length > 0) {
        createdCategories = await Categoria.bulkCreate(newCategories, {
          validate: true,
          ignoreDuplicates: true,
        });
      }

      res.status(200).json({ message: "Lista de Categorias Creada" });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
);

routerSupermercado.get( "/category",authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: any, res: any) => {
    try {
      const allCategory = await Categoria.findAll({
        // WHERE name = 'Juan'
        attributes: ["name"], // Seleccionar solo estos campos
      });

      res.status(200).send(allCategory);
    } catch (error) {
      console.log("Error Category", error);
      res.status(500).json({ message: error });
    }
  }
);

routerSupermercado.get("/promociones", getProductosConDescuento);

routerSupermercado.get("/productos/stock", async (req: Request, res: Response) => {
  try {
    
    const conteo = await Categoria.findAll({
      attributes: {
        include: [[Sequelize.fn("COUNT", "productos.id"), "cantidad"]],
      },
      include: [
        {
          model: Producto,
          as: "productos",
          attributes: [],
        },
      ],
      group: ["Categoria.id"],
      raw: true, 
    });

    // Formato de salida
    const totalProductos = conteo.map((categoria: CategoriaAttributes) => ({
      cantidad: categoria.cantidad,
      categoria: categoria.name,
    }));

    const totalProductosMenorStock = totalProductos.filter((q: { cantidad: number }) => q.cantidad < 10);

    res.json(totalProductosMenorStock);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al obtener datos" });
  }
});

routerSupermercado.get("/productos", async (req, res) => {
  try {
   
    const [totalProductos, productosConDescuento] = await Promise.all([
      Producto.count(),
      Producto.count({ where: { descuento: { [Op.gt]: 0 } } }),
    ]);

    const newRespuestas = [
      {
        totalProductos: { valor: totalProductos },
      },
      {
        totalDescuento: { valor: productosConDescuento },
      },
    ];

    res.json(newRespuestas);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al obtener estadísticas " });
  }
});


routerSupermercado.post("/solicitud" , async (req : Request , res : Response)=>{
 
  const requiredField = ["name", "surname", "email", "password", "role", "phone" , "name_supermercado" , "departamento", "localidad" , "provincia" , "address" , "estado" , "fecha_solicitud" , "run"];
  const{name, surname, email, password, role,dni, phone , name_supermercado , localidad , provincia , address , departamento, estado , fecha_solicitud , run} = req.body;
  try{
    if(validateRequiredStrings(requiredField , req.body)){
      const newSolicitudSupermercado = await SolicitudSupermercado.create({
        name, surname, email, password, role, phone ,dni, nameSupermercado: name_supermercado , localidad , provincia , departamento : departamento, address , estado , fecha_solicitud , run
      })
      res.status(200).json({data : newSolicitudSupermercado})
    }
  }catch(error){ 
    console.log("El error fue" , error);
    res.status(500).json({message : error})
  }

  
})

routerSupermercado.get("/lista/solicitud/supermercados" , authMiddleware , roleMiddleware([UserRole.SUPER_ADMIN]) , async (req : Request , res : Response)=>{
  try{
    const listSolicitudeSupermarket = await SolicitudSupermercado.findAll();
    res.status(200).json({data : listSolicitudeSupermarket})
  }catch(error ){
    res.status(500).json({message : error})
  }
})



export default routerSupermercado;
