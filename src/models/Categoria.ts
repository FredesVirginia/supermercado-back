
import { DataTypes, Sequelize, Model, Optional } from "sequelize";


interface CategoriaAttributes {
  id: string;
  name: string;
  [key: string]: any; 
}


interface CategoriaCreationAttributes extends Optional<CategoriaAttributes, 'id'> {}

class Categoria extends Model<CategoriaAttributes, CategoriaCreationAttributes> 
  implements CategoriaAttributes {

  public id!: string;
  public name!: string;
  

 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  
  public getNombreMayusculas(): string {
    return this.name.toUpperCase();
  }
}

const initCategoria = (sequelize: Sequelize): typeof Categoria => {
  Categoria.init(
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
      modelName: "Categoria",
     
    }
  );

  return Categoria;
};


export { CategoriaAttributes, CategoriaCreationAttributes, initCategoria };
export default initCategoria