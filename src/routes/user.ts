import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import { validateRequiredStrings } from "../utils/utils";
import { authMiddleware, roleMiddleware } from "../middelware/authMiddleware";
import { UserRole } from "../types/types";
import { Supermercado, User } from "../db";

const routerUser = Router();


routerUser.post("/register", async (req: any, res: any) => {
  const { name, email, password, role, surname , phone } = req.body;
  console.log("LE NNAMESA ES", req.body);

  // VERIFICACIÓN DE EXISTENCIA DE USUARIO
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "El usuario ya existe" });
  }

  try {
    const hasshedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, surname, email, password: hasshedPassword, role , phone });
    res.status(201).json({ message: "Usuario registrado correctamente", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

// routerUser.post("/login", async (req: any, res: any) => {
//   const { email, password } = req.body;
//   try {
//     const existingUser = await User.findOne({
//       where: { email },
//       include: [
//         {
//           model: Supermercado,
//           as: "supermercados",
//           required: false, // Para que no falle si no tiene supermercado
//         },
//       ],
//     });
//     if (!existingUser) return res.status(400).json({ message: "Usuario no registado" });

//     const isMatch = await bcrypt.compare(password, existingUser.password);
//     if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });
//     const supermercado = await Supermercado.findOne({
//       where: { admin_id: existingUser.id },
//     });

//     if(existingUser.role === UserRole.SUPER_ADMIN){
//       const token = jwt.sign(
//         { id: existingUser.id, role: existingUser.role,  },
//         process.env.JWT_SECRET!,
//         { expiresIn: "1h" }
//       );
  
//       const userData = existingUser.get({ plain: true });
//       delete userData.password;
//       res.status(200).json({ message: "Inicio de sesión exitoso", token, user: userData });
//     }

//     if (!supermercado) {
//       return res.status(400).json({ message: "El usuario no tiene un supermercado asignado" });
//     }
//     //GENERACION DE TOKEN
//     const token = jwt.sign(
//       { id: existingUser.id, role: existingUser.role, supermercado_id: supermercado.id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "1h" }
//     );

//     const userData = existingUser.get({ plain: true });
//     delete userData.password;
//     res.status(200).json({ message: "Inicio de sesión exitoso", token, user: userData });
//   } catch (error) {
//     console.log("Error login", error);
//     res.status(500).json({ message: "Error INICIO SESION", error });
//   }
// });

routerUser.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({
      where: { email },
      include: [
        {
          model: Supermercado,
          as: "supermercados",
          required: false, // Para que no falle si no tiene supermercado
        },
      ],
    });

    if (!existingUser) return res.status(400).json({ message: "Usuario no registrado" });

    //const isMatch = await bcrypt.compare(password, existingUser.get('password'));
    const isMatch = await bcrypt.compare(password, existingUser.getDataValue('password'));
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    // Si es SUPER_ADMIN, generamos el token y respondemos inmediatamente
    if (existingUser.getDataValue('role') === UserRole.SUPER_ADMIN) {
      const token = jwt.sign(
        { id: existingUser.getDataValue('id'), role: existingUser.getDataValue('role') },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      const userData = existingUser.get({ plain: true });
      //delete userData.password;

      return res.status(200).json({ message: "Inicio de sesión exitoso", token, user: userData }); // ✅ SE USA RETURN
    }

    // Si no es SUPER_ADMIN, verificamos que tenga un supermercado asignado
    const supermercado = await Supermercado.findOne({
      where: { 
        admin_id: existingUser.id 
      },
      include: [{
        model: User,
        as: 'admin'
      }]
    });

    if (!supermercado) {
      return res.status(400).json({ message: "El usuario no tiene un supermercado asignado" }); // ✅ SE USA RETURN
    }

    // Si el usuario tiene supermercado, generamos el token y respondemos
    const token = jwt.sign(
      { id: existingUser.getDataValue('id'), role: existingUser.getDataValue('role'), supermercado_id: supermercado.getDataValue('id') },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const userData = existingUser.get({ plain: true });
    //delete userData.password;

    return res.status(200).json({ message: "Inicio de sesión exitoso", token, user: userData }); // ✅ SE USA RETURN
  } catch (error) {
    console.log("Error login", error);
    return res.status(500).json({ message: "Error INICIO SESION", error }); // ✅ SE USA RETURN
  }
});


routerUser.post("/addSupermarket", authMiddleware, roleMiddleware([UserRole.SUPER_ADMIN]), async (req: any, res: any) => {
  const requiredFields = ["name", "address", "provincia", "localidad"];
  const { admidEmail, supermercado } = req.body;
  console.log("EL ADMINES ", admidEmail, "Y SUPERMEADO", supermercado);
  try {
    if (admidEmail && admidEmail !== "") {
      const user = await User.findOne({ where: { email: admidEmail } });
      if (user) {
        if (validateRequiredStrings(supermercado, requiredFields)) {
          const newSupermarket = await Supermercado.create({
            ...supermercado,
            admin_id: user.getDataValue('id'),
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

export default routerUser;
