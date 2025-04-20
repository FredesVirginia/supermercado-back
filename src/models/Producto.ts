
import { DataTypes, Sequelize, Model, Optional } from "sequelize";

// Interface para los atributos del Producto
interface ProductoAttributes {
  id: string;
  codigobarras: string;
  fechavencimiento: Date;
  descuento: number;
  // img : string;
  precio: number;
  preciodescuento: number;
  categoria_id? : string;
  supermercado_id? : string;
  proveedor_id ? : string;
  marca_id? : string 
}

// Interface para los atributos de creación (opcional, permite omitir el id)
interface ProductoCreationAttributes extends Optional<ProductoAttributes, 'id'> {}

class Producto extends Model<ProductoAttributes, ProductoCreationAttributes> 
  implements ProductoAttributes {
  // Declaración explícita de las propiedades
  public id!: string;

  public codigobarras!: string;
  public fechavencimiento!: Date;
  public descuento!: number;
  public precio!: number;
  public preciodescuento!: number;
  // public img!: string;

  // Timestamps automáticos de Sequelize
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const initProducto = (sequelize: Sequelize): typeof Producto => {
  Producto.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
     
      codigobarras: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // img: {
      //   type: DataTypes.TEXT,
      //   allowNull: false,
      // },
      fechavencimiento: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      descuento: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
        allowNull: false,
      },
      precio: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      preciodescuento: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Producto",
     
    }
  );

  return Producto;
};

export { ProductoAttributes, ProductoCreationAttributes, initProducto };
export default initProducto;