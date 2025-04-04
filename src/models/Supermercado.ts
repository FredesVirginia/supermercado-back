
import { DataTypes, Sequelize, Model, Optional } from "sequelize";

// Interface para los atributos del Supermercado
interface SupermercadoAttributes {
  id: string;
  name: string;
  address: string;
  provincia: string;
  localidad: string;
  admin_id?: string;
}

// Interface para los atributos de creación (opcional, permite omitir el id)
interface SupermercadoCreationAttributes extends Optional<SupermercadoAttributes, 'id'> {}

class Supermercado extends Model<SupermercadoAttributes, SupermercadoCreationAttributes> 
  implements SupermercadoAttributes {
  // Declaración explícita de las propiedades
  public id!: string;
  public name!: string;
  public address!: string;
  public provincia!: string;
  public localidad!: string;

  // Timestamps automáticos de Sequelize
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const initSupermercado = (sequelize: Sequelize): typeof Supermercado => {
  Supermercado.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provincia: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      localidad: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Supermercado",
    
    }
  );

  return Supermercado;
};

export { SupermercadoAttributes, SupermercadoCreationAttributes, initSupermercado };
export default initSupermercado 