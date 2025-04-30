import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

// Tipos para el enum de roles
export type UserRole = 'admin' | 'super-admin' | 'invited' | 'client';

// Interface para los atributos del User
interface UserAttributes {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  role: UserRole;
  password?: string;
  dni: number,
  supermercado_id? : string
}

// Interface para los atributos de creación
interface UserCreationAttributes extends Optional<UserAttributes, 'id' > {}

class User extends Model<UserAttributes, UserCreationAttributes> 
  implements UserAttributes {
  // Declaración explícita de propiedades
  public id!: string;
  public name!: string;
  public surname!: string;
  public phone!: string;
  public email!: string;
  public role!: UserRole;
  public password?: string;
  public dni! : number;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Métodos personalizados
  public getFullName(): string {
    return `${this.name} ${this.surname}`;
  }

  public async verifyPassword(password: string): Promise<boolean> {
    // Implementación de verificación de contraseña (usando bcrypt, etc.)
    return true; // Reemplazar con lógica real
  }
}

const initUser = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          is: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      dni: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
         
          notEmpty: true
        }
      },
      role: {
        type: DataTypes.ENUM('admin', 'super-admin', 'invited' , 'client'),
        allowNull: false,
        defaultValue: 'admin',
        validate: {
          isIn: [['admin', 'super-admin', 'invited' , 'client']]
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 128] // Mínimo 8 caracteres
        }
      },
     
    },
    {
      sequelize,
      modelName: 'User',
      // Opciones adicionales:
      
     
    
    }
  );


 

  return User;
};

// Exportación de tipos
export { UserAttributes, UserCreationAttributes };
export default initUser;