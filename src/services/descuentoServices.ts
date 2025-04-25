import { Producto } from "../db";
import { io } from "../socket/socket";

import { Op } from "sequelize";


// ✅ Función para normalizar una fecha al inicio del día (00:00)
const normalizarFecha = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

export const checkExpiringProductsOriginal = async () => {
  const today = new Date(); 
  let productosActualizados = 0; // Contador de productos actualizados

  // Buscar productos que no han expirado
  const productos = await Producto.findAll({
    where: {
      fechavencimiento: { [Op.gte]: today }, // Productos con fecha de vencimiento >= hoy
    },
  });

  // Iterar sobre los productos encontrados
  for (const producto of productos) {
    // Calcular los días restantes hasta la fecha de vencimiento
    const diasHastaVencimiento = Math.floor(
      (producto.getDataValue('fechavencimiento').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let descuento = 0;
    let precioConDescuento = producto.getDataValue('precio'); // Inicializar con el precio original

    // Asignar descuento según los días restantes
    if (diasHastaVencimiento <= 15 && diasHastaVencimiento > 10) {
      descuento = 10; // 10% de descuento
    } else if (diasHastaVencimiento <= 10 && diasHastaVencimiento > 5) {
      descuento = 20; // 20% de descuento
    } else if (diasHastaVencimiento <= 5) {
      descuento = 30; // 30% de descuento
    }

    // Si se asignó un descuento, calcular el nuevo precio y actualizar el producto
    if (descuento > 0) {
      // Calcular el precio con descuento
      precioConDescuento =  producto.getDataValue('precio') * (1 - descuento / 100);
      
      // Redondear a 2 decimales (opcional)
      precioConDescuento = Math.round(precioConDescuento * 100) / 100;

      // Actualizar ambos campos
      producto.descuento = descuento;
      producto.preciodescuento = precioConDescuento;
      
      await producto.save(); // Guardar el producto actualizado
      productosActualizados++; // Incrementar el contador
    }
  }

  // Enviar notificación solo si hay productos con descuento
  if (productosActualizados > 0) {
    io.emit("newDiscount", { 
      message: `Se aplicó descuento a ${productosActualizados} productos.`,
      count: productosActualizados
    });
  }
};

export const checkExpiringProducts = async () => {
  const today = new Date(); 
  let productosActualizados = 0; 

  
  const productos = await Producto.findAll({
    where: {
      fechavencimiento: { [Op.gte]: today }, // Productos con fecha de vencimiento >= hoy
    },
  });

 
  for (const producto of productos) {
    
    const diasHastaVencimiento = Math.floor(
      (producto.getDataValue('fechavencimiento').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let descuento = 0;
    let precioConDescuento = producto.getDataValue('precio'); 

    // Asignar descuento solo si quedan exactamente 15, 10 o 5 días
    if (diasHastaVencimiento === 15) {
      descuento = 10; // 10% de descuento
    } else if (diasHastaVencimiento === 10) {
      descuento = 20; // 20% de descuento
    } else if (diasHastaVencimiento === 5) {
      descuento = 30; // 30% de descuento
    }

    
    if (descuento > 0) {
     
      precioConDescuento =  producto.getDataValue('precio') * (1 - descuento / 100);
      
      // Redondear a 2 decimales (opcional)
      precioConDescuento = Math.round(precioConDescuento * 100) / 100;

      // Actualizar ambos campos
      producto.descuento = descuento;
      producto.preciodescuento = precioConDescuento;
      
      await producto.save(); 
      productosActualizados++; 
    }
  }

  // Enviar notificación solo si hay productos con descuento
  if (productosActualizados > 0) {
    io.emit("newDiscount", { 
      message: `Se aplicó descuento a ${productosActualizados} productos.`,
      count: productosActualizados
    });
  }
};

interface ReglaDescuento {
  diasAntes: number; // ej. 15
  porcentaje: number; // ej. 10
}

export const checkExpiringProductsPersonalizado = async (reglas: ReglaDescuento[] , idSupermercado : string) => {
  const today = normalizarFecha(new Date());
  let productosActualizados = 0;

  const productos = await Producto.findAll({
    where: {
      fechavencimiento: { [Op.gte]: today },
      supermercado_id: idSupermercado,
    },
  });

  for (const producto of productos) {
    const fechaVencimiento: Date = normalizarFecha(producto.getDataValue("fechavencimiento"));

    const diasHastaVencimiento = Math.floor(
      (fechaVencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log(`Producto: ${producto.id} | Días hasta vencimiento: ${diasHastaVencimiento}`);

    let descuento = 0;
    let precioConDescuento = producto.getDataValue("precio");

    for (const regla of reglas) {
      if (diasHastaVencimiento === regla.diasAntes) {
        descuento = regla.porcentaje;
        break;
      }
    }

    if (descuento > 0) {
      precioConDescuento = producto.getDataValue("precio") * (1 - descuento / 100);
      precioConDescuento = Math.round(precioConDescuento * 100) / 100;

      producto.descuento = descuento;
      producto.preciodescuento = precioConDescuento;

      await producto.save();
      productosActualizados++;
    }
  }

  if (productosActualizados > 0) {
    io.emit("newDiscountPersonalizado", {
      message: `Se aplicó descuento a ${productosActualizados} producto(s).`,
      count: productosActualizados,
    });
  } else {
    console.log("PRODUCTOS ACTUALIZADOS:", productosActualizados);
  }
};



