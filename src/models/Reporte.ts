
import { DataTypes, Sequelize, Model, Optional } from "sequelize";

// Interface para los atributos del Reporte
interface ReporteAttributes {
  id: string;
  texto: string;
  fecha: Date;
  tipo?: 'error' | 'advertencia' | 'informe'; // Campo opcional para tipo de reporte
  estado?: 'pendiente' | 'revisado' | 'resuelto'; // Campo opcional para estado
}

// Interface para los atributos de creación
interface ReporteCreationAttributes extends Optional<ReporteAttributes, 'id'> {}

class Reporte extends Model<ReporteAttributes, ReporteCreationAttributes> 
  implements ReporteAttributes {
  // Declaración explícita de las propiedades
  public id!: string;
  public texto!: string;
  public fecha!: Date;
  public tipo?: 'error' | 'advertencia' | 'informe';
  public estado?: 'pendiente' | 'revisado' | 'resuelto';

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para marcar como resuelto
  public marcarComoResuelto(): Promise<this> {
    return this.update({ estado: 'resuelto' });
  }
}

const initReporte = (sequelize: Sequelize): typeof Reporte => {
  Reporte.init(
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
          len: [10, 2000] // Texto entre 10 y 2000 caracteres
        }
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      // Campos adicionales opcionales:
      tipo: {
        type: DataTypes.ENUM('error', 'advertencia', 'informe'),
        defaultValue: 'informe'
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'revisado', 'resuelto'),
        defaultValue: 'pendiente'
      }
    },
    {
      sequelize,
      modelName: "Reporte",
      // Opciones adicionales:
      paranoid: true, // Para soft delete
      indexes: [
        { fields: ['fecha'] },
        { fields: ['tipo'] },
        { fields: ['estado'] }
      ],
      scopes: {
        pendientes: {
          where: { estado: 'pendiente' }
        },
        recientes: {
          order: [['fecha', 'DESC']],
          limit: 100
        }
      }
    }
  );

  return Reporte;
};

// Exportación de tipos
export { ReporteAttributes, ReporteCreationAttributes, initReporte };
export default initReporte