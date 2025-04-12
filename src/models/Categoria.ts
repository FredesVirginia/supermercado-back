
import { DataTypes, Sequelize, Model, Optional } from "sequelize";

// Interface para los atributos de Categoria
interface CategoriaAttributes {
  id: string;
  name: string;
  [key: string]: any; 
}

// Interface para los atributos de creación (opcional, permite omitir el id)
interface CategoriaCreationAttributes extends Optional<CategoriaAttributes, 'id'> {}

class Categoria extends Model<CategoriaAttributes, CategoriaCreationAttributes> 
  implements CategoriaAttributes {
  // Declaración explícita de las propiedades
  public id!: string;
  public name!: string;
  

  // Timestamps automáticos de Sequelize
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Métodos personalizados pueden ir aquí
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
          notEmpty: true, // Validación adicional
          len: [2, 50] // Longitud entre 2 y 50 caracteres
        }
      },
    },
    {
      sequelize,
      modelName: "Categoria",
      // Opciones adicionales:
      // paranoid: true, // Para soft deletes
      // indexes: [{ fields: ['name'] }] // Índices adicionales
    }
  );

  return Categoria;
};

// Exportación de tipos para uso externo
export { CategoriaAttributes, CategoriaCreationAttributes, initCategoria };
export default initCategoria