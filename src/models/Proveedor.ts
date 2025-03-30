import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

// Interface para los atributos del Proveedor
interface ProveedorAttributes {
  id: string;
  name: string;
  razonSocial: string;
  cuit: string;
  direccion: string;
  phone: string;
  email: string;
}

// Interface para los atributos de creación
interface ProveedorCreationAttributes extends Optional<ProveedorAttributes, 'id'> {}

class Proveedor extends Model<ProveedorAttributes, ProveedorCreationAttributes> 
  implements ProveedorAttributes {
  // Declaración explícita de las propiedades
  public id!: string;
  public name!: string;
  public razonSocial!: string;
  public cuit!: string;
  public direccion!: string;
  public phone!: string;
  public email!: string;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para formatear CUIT
  public getCuitFormateado(): string {
    return this.cuit.replace(/(\d{2})(\d{8})(\d)/, '$1-$2-$3');
  }
}

const initProveedor = (sequelize: Sequelize): typeof Proveedor => {
  Proveedor.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 100]
        }
      },
      razonSocial: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      cuit: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: {
          is: /^\d{2}-\d{8}-\d$/,
          notEmpty: true,
        },
      },
      direccion: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          is: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
        },
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        },
      },
    },
    {
      sequelize,
      modelName: 'Proveedor',
      // Opciones adicionales:
      paranoid: true, // Para soft delete
      indexes: [
        { fields: ['name'] },
        { fields: ['cuit'] },
        { fields: ['email'] }
      ]
    }
  );

  return Proveedor;
};

// Exportación de tipos
export { ProveedorAttributes, ProveedorCreationAttributes, initProveedor };
export default initProveedor