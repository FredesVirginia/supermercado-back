
import { DataTypes, Sequelize, Model, Optional } from "sequelize";


interface MarcaAttributes {
  id: string;
  name: string;
  [key: string]: any; 
}


interface MarcaCreationAttributes extends Optional<MarcaAttributes, 'id'> {}

class Marca extends Model<MarcaAttributes, MarcaCreationAttributes> 
  implements MarcaAttributes {

  public id!: string;
  public name!: string;
  

 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  
  public getNombreMayusculas(): string {
    return this.name.toUpperCase();
  }
}

const initMarca = (sequelize: Sequelize): typeof Marca => {
  Marca.init(
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
        validate: {
          notEmpty: true, 
          len: [2, 50] 
        }
      },
    },
    {
      sequelize,
      modelName: "Marca",
     
    }
  );

  return Marca;
};


export { MarcaAttributes, MarcaCreationAttributes, initMarca };
export default initMarca