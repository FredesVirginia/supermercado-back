
import { DataTypes, Sequelize, Model, Optional } from "sequelize";

// Interface para los atributos de Notificación
interface NotificacionAttributes {
  id: string;
  texto: string;
  fecha: Date;
  leido?: boolean;  // Campo opcional si luego lo añades
  tipo?: string;    // Campo opcional para tipo de notificación
}

// Interface para los atributos de creación
interface NotificacionCreationAttributes extends Optional<NotificacionAttributes, 'id'> {}

class Notificacion extends Model<NotificacionAttributes, NotificacionCreationAttributes> 
  implements NotificacionAttributes {
  // Declaración explícita de las propiedades
  public id!: string;
  public texto!: string;
  public fecha!: Date;
 
 

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para marcar como leído
 
}

const initNotificacion = (sequelize: Sequelize): typeof Notificacion => {
  Notificacion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      texto: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000]
        }
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      // Campos adicionales opcionales:
     
    },
    {
      sequelize,
      modelName: "Notificacion",
      // Opciones adicionales:
     
    }
  );

  return Notificacion;
};

// Exportación de tipos
export { NotificacionAttributes, NotificacionCreationAttributes, initNotificacion };
export default initNotificacion