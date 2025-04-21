import e, { Request, Response, Router } from "express";
import { Op, Sequelize } from "sequelize";
import { Categoria, Producto, Proveedor, SolicitudSupermercado, Supermercado, User , Marca } from "../db";
import { authMiddleware, roleMiddleware } from "../middelware/authMiddleware";
import { UserRole } from "../types/types";
import { validateRequiredStrings } from "../utils/utils";

const routerSupermercado = Router();

routerSupermercado.get("hoy" , async ( res : Response , req : Request)=>{
  res.status(200).json({message : "HOLA TOTO"})
})

routerSupermercado.post("/add", authMiddleware, roleMiddleware([UserRole.SUPER_ADMIN]), async (req: any, res: any) => {
  const requiredFields = ["name", "address", "provincia", "departamento", "localidad"];
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
    const requiredField = [
      "marca",
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
        const existingMarca = await Marca.findOne({where : {name:marca}})
       
        const product = await Producto.create({
         
          fechavencimiento,
          preciodescuento,
          precio,
          descuento: 0,
          codigobarras,
          categoria_id: existingCategory?.getDataValue("id"),
          supermercado_id: req.user.supermercado_id,
          proveedor_id: existingProveedor?.getDataValue("id"),
          marca_id : existingMarca?.getDataValue("id")
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
    console.log("DATOOOOOOOOOOOOOOS", req.user.supermercado_id);
    try {
      if (validateRequiredStrings(req.body, requiredField)) {
        const existingProveedor = await Proveedor.findOne({
          where:{email}
        });

        if(existingProveedor){
          res.status(404).json({message : `Ya existe un proveedor con este email : ${email}`})
          return
        }
        const proveedor = await Proveedor.create({
          name,
          razonSocial,
          cuit,
          direccion,
          phone,
          email,
        });

        await proveedor.addSupermercado(req.user.supermercado_id);

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

routerSupermercado.post("/add/category", authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
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



routerSupermercado.post("/add/marca", authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: any, res: any) => {
    const marcaNames: string[] = req.body;
    try {
      if (!Array.isArray(marcaNames) || marcaNames.length === 0) {
        return res.status(400).json({ message: "Se requiere una lista de categorias" });
      }

      const uniqueNames = [
        ...new Set(marcaNames.map((name) => (typeof name === "string" ? name.trim() : "")).filter((name) => name !== "")),
      ];

      const existingMarca = await Marca.findAll({
        where: {
          name: {
            [Op.in]: uniqueNames,
          },
        },
      });

      const existingNames = existingMarca.map((c: { name: string }) => c.name.toLowerCase());
      const newMarcas = uniqueNames.filter((name) => !existingNames.includes(name.toLowerCase())).map((name) => ({ name }));

      let createdMarcas = [];
      if (newMarcas.length > 0) {
        createdMarcas = await Marca.bulkCreate(newMarcas, {
          validate: true,
          ignoreDuplicates: true,
        });
      }

      res.status(200).json({ message: "Lista de Marca Creada" });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
);

routerSupermercado.get("/category", async (req: Request, res: Response) => {
  try {
   
    const allCategory = await Categoria.findAll({
     
      attributes: ["name"], 
    });

    res.status(200).send(allCategory);
  } catch (error) {
    console.log("Error Category", error);
    res.status(500).json({ message: error });
  }
});

routerSupermercado.get("/marca", async (req: Request, res: Response) => {
  try {
    const allMarca = await Marca.findAll({
      attributes : ["name"]
    });

    res.status(200).send(allMarca);
  } catch (error) {
    console.log("Error Marca", error);
    res.status(500).json({ message: error });
  }
});

routerSupermercado.get("/product/category", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (typeof category !== "string" || !category.trim()) {
      res.status(400).json({ error: "El parámetro 'category' debe ser un string válido" });
      return;
    }

    const typeCategory = await Categoria.findOne({
      where: {
        name: category,
      },
    });

    const allProductosByCategory = await Producto.findAll({
      include: [{ model: Categoria, as: "categoria", attributes: ["name"] } , { model: Marca, as: "marca", attributes: ["name"] } , { model: Proveedor, as: "proveedor"}],
      where: {
        categoria_id: typeCategory?.id,
      },
      attributes: [ "precio", "descuento", "preciodescuento", "fechavencimiento" ,  "codigobarras", "proveedor.id"],
      group: [ "precio", "descuento", "preciodescuento", "fechavencimiento",  "codigobarras", "categoria.id" , "marca.id" , "proveedor.id"],
    });

    const productosAgrupados = {
      productos5dias: allProductosByCategory.filter((producto) => Number(producto.descuento) === 30),
      productos10dias: allProductosByCategory.filter((producto) => Number(producto.descuento) === 20),
      productos15dias: allProductosByCategory.filter((producto) => Number(producto.descuento) === 10),
    };

    const productosAgrupados2 = [
      { cantidad: productosAgrupados.productos5dias.length, productos: productosAgrupados.productos5dias },
      { cantidad: productosAgrupados.productos10dias.length, productos: productosAgrupados.productos10dias },
      { cantidad: productosAgrupados.productos15dias.length, productos: productosAgrupados.productos15dias },
    ];

    res.status(200).json(productosAgrupados2);
  } catch (error) {
    console.log("EEROE ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

routerSupermercado.get("/product/marca", async (req: any, res: any , ) => {
  try {
    const { marca , category} = req.query;

    if (typeof marca !== "string" || !marca.trim()) {
      res.status(400).json({ error: "El parámetro 'Marca' debe ser un string válido" });
      return;
    }

    const typeMarca = await Marca.findOne({
      where: {
        name: marca,
      },
    });

   
    const whereClause: any = {
      marca_id: typeMarca!.id
    };

    
    if (typeof category === "string" && category.trim()) {
      const typeCategory = await Categoria.findOne({ where: { name: category } });

      if (typeCategory) {
        whereClause.categoria_id = typeCategory.id;
      }
    
    }

    const allProductosByMarca = await Producto.findAll({
      include: [{ model: Marca, as: "marca", attributes: ["name"] }, { model: Categoria, as: "categoria", attributes: ["name"] },  { model: Proveedor, as: "proveedor"}],
      where: whereClause,
      attributes: [ "precio", "descuento", "preciodescuento", "fechavencimiento" ,  "codigobarras", "proveedor.id"],
      group: [ "precio", "descuento", "preciodescuento", "fechavencimiento",  "codigobarras", "marca.id" , "categoria.id", "proveedor.id"],
    });

    const productosAgrupados = {
      productos5dias: allProductosByMarca.filter((producto) => Number(producto.descuento) === 30),
      productos10dias: allProductosByMarca.filter((producto) => Number(producto.descuento) === 20),
      productos15dias: allProductosByMarca.filter((producto) => Number(producto.descuento) === 10),
    };

    const productosAgrupados2 = [
      { cantidad: productosAgrupados.productos5dias.length, productos: productosAgrupados.productos5dias },
      { cantidad: productosAgrupados.productos10dias.length, productos: productosAgrupados.productos10dias },
      { cantidad: productosAgrupados.productos15dias.length, productos: productosAgrupados.productos15dias },
    ];

    res.status(200).json(productosAgrupados2);
  } catch (error) {
    console.log("EEROE ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

routerSupermercado.get("/promociones", async (req: Request, res: Response) => {
  try {
    const [productosDescuento5Dias, productosDescuento10Dias, productosDescuento15Dias] = await Promise.all([
      Producto.findAll({
        include: [{ model: Categoria, as: "categoria", attributes: ["name"] } , { model: Marca, as: "marca", attributes: ["name"] } , { model: Proveedor, as: "proveedor" }],
        where: { descuento: { [Op.eq]: 10 } },
        attributes: ["precio", "descuento", "preciodescuento", "fechavencimiento", "categoria.id", "codigobarras", "marca.id" , "proveedor.id"],
        group: [ "precio", "descuento", "preciodescuento", "fechavencimiento", "codigobarras", "categoria.id" , "marca.id" ,  "proveedor.id"],
      }),
      Producto.findAll({
        include: [{ model: Categoria, as: "categoria", attributes: ["name"] } , { model: Marca, as: "marca", attributes: ["name"] }, { model: Proveedor, as: "proveedor" }],
        where: { descuento: { [Op.eq]: 20 } },
        attributes: [ "precio", "descuento", "preciodescuento", "fechavencimiento",  "codigobarras","categoria.id" , "marca.id" ,  "proveedor.id"],
        group: ["precio", "descuento", "preciodescuento", "fechavencimiento",  "codigobarras", "categoria.id" , "marca.id" ,  "proveedor.id"],
      }),
      Producto.findAll({
        include: [{ model: Categoria, as: "categoria", attributes: ["name"] }, { model: Marca, as: "marca", attributes: ["name"] }, { model: Proveedor, as: "proveedor" }],
        where: { descuento: { [Op.eq]: 30 } },
        attributes: [ "precio", "descuento", "preciodescuento", "fechavencimiento",  "codigobarras", "categoria.id" , "marca.id" ,  "proveedor.id"],
        group: [ "precio", "descuento", "preciodescuento", "fechavencimiento",  "codigobarras", "categoria.id" , "marca.id" ,  "proveedor.id"] ,
      }),
    ]);

    const productoAgrupados = [
      {
        cantidad: productosDescuento5Dias.length,
        productos: productosDescuento5Dias,
      },
      {
        cantidad: productosDescuento10Dias.length,
        productos: productosDescuento10Dias,
      },
      {
        cantidad: productosDescuento15Dias.length,
        productos: productosDescuento15Dias,
      },
    ];

    res.status(200).json(productoAgrupados);
  } catch (error) {
    console.log("Error al obtener productos con descuento ", error);
    res.status(500).json({ message: "Error interno en el servidor" }); // Corregido "Erro" → "Error"
  }
});



routerSupermercado.get("/productos/stock", async (req: Request, res: Response) => {
  try {
    const conteo = await Categoria.findAll({
      attributes: [
        "id",
        "name",
        [Sequelize.fn("COUNT", Sequelize.col("productos.id")), "cantidad"],
        [Sequelize.col("productos.proveedor.id"), "proveedor_id"],
        [Sequelize.col("productos.proveedor.name"), "proveedor_name"],
        [Sequelize.col("productos.proveedor.email"), "proveedor_email"],
        [Sequelize.col("productos.proveedor.phone"), "proveedor_phone"],
      ],
      include: [
        {
          model: Producto,
          as: "productos",
          attributes: [],
          include: [
            {
              model: Proveedor,
              as: "proveedor",
              attributes: [],
              required: true,
            },
          ],
        },
      ],
      group: ["Categoria.id", "productos.proveedor.id"],
      raw: true,
    });

    // Formatear resultados
    const resultado = conteo.map((item: any) => ({
      categoria: {
        id: item.id,
        nombre: item.name,
      },
      proveedor: {
        id: item.proveedor_id,
        nombre: item.proveedor_name,
        correo: item.proveedor_email,
        telefono: item.proveedor_phone,
      },
      cantidad: item.cantidad,
    }));

    // Filtrar productos con stock < 10
    const conStockBajo = resultado.filter((item: any) => item.cantidad < 10);

    res.json(conStockBajo);
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

routerSupermercado.put("/productos/modicar/precio" ,authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]), async (req : Request , res : Response)=>{
  const { precio , codigoBarras } = req.body;

  try{
    const allProductos = await Producto.findAll({
      where : { codigobarras : codigoBarras}
    })

    if(allProductos.length === 0){
      res.status(404).json({message : "CODIGO DE BARRAS INCORRECTO, PRODUCTO NO ENCONTRADO"});
      return
    }

    await Promise.all(
      allProductos.map(async (producto)=>{
        producto.precio=precio;
        await producto.save()
      })
    )

    let cantidadProductosModificados =allProductos.length;
    res.status(200).json({message : `Se modificaron ${cantidadProductosModificados} productos`})
  }catch(error){
    console.log("El error fue " , error)
    res.status(500).json({message : "Error del servidor" , error : error})
  }
});

routerSupermercado.put("/productos/modicar/proovedor" ,authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]), async (req : Request , res : Response)=>{
  const { nameProveedor , codigoBarras } = req.body;

  try{
    const allProductos = await Producto.findAll({
      where : { codigobarras : codigoBarras}
    })

    const existingProveedor = await Proveedor.findOne({
      where: {name :nameProveedor}
    })

    if(!existingProveedor){
      res.status(404).json({message : `No se encontro proveedor con este Correro ${nameProveedor}`})
      return
    }

    if(allProductos.length === 0){
      res.status(404).json({message : "CODIGO DE BARRAS INCORRECTO, PRODUCTO NO ENCONTRADO"});
      return
    }

    await Promise.all(
      allProductos.map(async (producto)=>{
        (producto as any).proveedor_id = existingProveedor.id;
        await producto.save()
      })
    )

    let cantidadProductosModificados =allProductos.length;
    res.status(200).json({message : `Se modificaron ${cantidadProductosModificados} productos`})
  }catch(error){
    console.log("El error fue " , error)
    res.status(500).json({message : "Error del servidor" , error : error})
  }
});

routerSupermercado.post("/solicitud", async (req: Request, res: Response) => {
  const requiredField = [
    "name",
    "surname",
    "email",
    "password",
    "role",
    "phone",
    "name_supermercado",
    "departamento",
    "localidad",
    "provincia",
    "address",
    "estado",
    "fecha_solicitud",
    "run",
  ];
  const {
    name,
    surname,
    email,
    password,
    role,
    dni,
    phone,
    name_supermercado,
    localidad,
    provincia,
    address,
    departamento,
    estado,
    fecha_solicitud,
    run,
  } = req.body;
  try {
    if (validateRequiredStrings(requiredField, req.body)) {
      const newSolicitudSupermercado = await SolicitudSupermercado.create({
        name,
        surname,
        email,
        password,
        role,
        phone,
        dni,
        nameSupermercado: name_supermercado,
        localidad,
        provincia,
        departamento: departamento,
        address,
        estado,
        fecha_solicitud,
        run,
      });
      res.status(200).json({ data: newSolicitudSupermercado });
    }
  } catch (error) {
    console.log("El error fue", error);
    res.status(500).json({ message: error });
  }
});

routerSupermercado.get("/lista/solicitud/supermercados",authMiddleware,roleMiddleware([UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const listSolicitudeSupermarket = await SolicitudSupermercado.findAll();
      res.status(200).json({ data: listSolicitudeSupermarket });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);

routerSupermercado.get("/proveedores",authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: any, res: any) => {
    try {
      const supermercadoId = req.user.supermercado_id;

      if (!supermercadoId) {
        return res.status(400).json({ message: "ID de supermercado no disponible en el usuario autenticado." });
      }

      const supermercado = await Supermercado.findByPk(supermercadoId, {
        include: {
          model: Proveedor,
          as: "proveedores",
          through: { attributes: [] },
        },
      });

      if (!supermercado) {
        return res.status(404).json({ message: "Supermercado no encontrado." });
      }

      res.status(200).json(supermercado);
    } catch (error: any) {
      console.error("Error al obtener proveedores:", error);
      res.status(500).json({ message: "Error del Servidor" });
    }
  }
);

routerSupermercado.put("/proveedor/:id", authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, razonSocial, cuit, dirreccion, phone, email } = req.body;
    const requiredField = ["name", "razonSocial", "cuit", "direccion", "phone", "email"];

    try {
      if (!validateRequiredStrings(req.body, requiredField)) {
        res.status(400).json({ message: "TODOS LOS CAMPOS SON OBLIGATORIOS" });
        return;
      }

     const proveedor = await Proveedor.findByPk(id);
     if(!proveedor){
      res.status(404).json({message : "Proveedor no encontrado"});
      return;
     }

     await proveedor.update({
      name , 
      razonSocial,
      cuit,
       direccion : dirreccion,
      phone , 
      email

     })

      res.status(200).json({ message: "Se Actualizo el proveedor" , proveedor });
    } catch (error) {
      console.log("EL ERROR FUE", error);
      res.status(500).json({ message: "Error del servidor" , error});
    }
  }
);

routerSupermercado.delete("/proveedor/:id", authMiddleware,roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
   

    try {
      const proveedor = await Proveedor.findByPk(id);
      if(!proveedor){
        res.status(404).json({message : "No se encontro el Proveedor"});
        return
      }

     await proveedor.destroy();
      res.status(200).json({message : "OK"})
    } catch (error) {
      console.log("EL ERROR FUE", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  }
);

export default routerSupermercado;
