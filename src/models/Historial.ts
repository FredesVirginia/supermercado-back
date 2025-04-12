
import { DataTypes, Sequelize, Model, Optional } from "sequelize";

// Interface para los atributos del Historial
interface HistorialAttributes {
  id: string;
  texto: string;
  fecha: Date;
}

// Interface para los atributos de creación (opcional, permite omitir el id)
interface HistorialCreationAttributes extends Optional<HistorialAttributes, 'id'> {}

class Historial extends Model<HistorialAttributes, HistorialCreationAttributes> 
  implements HistorialAttributes {
  // Declaración explícita de las propiedades
  public id!: string;
  public texto!: string;
  public fecha!: Date;

  // Timestamps automáticos de Sequelize
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Métodos personalizados pueden ir aquí
  public getResumen(): string {
    return this.texto.length > 50 
      ? `${this.texto.substring(0, 50)}...` 
      : this.texto;
  }
}

const initHistorial = (sequelize: Sequelize): typeof Historial => {
  Historial.init(
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
          len: [1, 2000] // Longitud entre 1 y 2000 caracteres
        }
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Fecha actual por defecto
      },
    },
    {
      sequelize,
      modelName: "Historial",
      // Opciones adicionales:
      // indexes: [{ fields: ['fecha'] }] // Índice por fecha
    }
  );

  return Historial;
};

// Exportación de tipos para uso externo
export { HistorialAttributes, HistorialCreationAttributes, initHistorial };
export default initHistorial