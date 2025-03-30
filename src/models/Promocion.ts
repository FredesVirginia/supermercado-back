import { DataTypes, Sequelize, Model, Optional } from "sequelize";

interface PromocionAttributes {
  id: string;
  texto: string;
  fecha: Date;
  fechaExpiracion?: Date;
  descuento?: number;
  imagenUrl?: string;
}

class Promocion extends Model<PromocionAttributes> implements PromocionAttributes {
  public id!: string;
  public texto!: string;
  public fecha!: Date;
  public fechaExpiracion?: Date;
  public descuento?: number;
  public imagenUrl?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const initPromocion = (sequelize: Sequelize): typeof Promocion => {
  Promocion.init(
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
          len: [10, 500]
        }
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      fechaExpiracion: {
        type: DataTypes.DATE,
        validate: {
          isDateAfter(value: Date) {
            if (value && value < new Date()) {
              throw new Error('La fecha de expiración debe ser futura');
            }
          }
        }
      },
      descuento: {
        type: DataTypes.DECIMAL(5, 2),
        validate: {
          min: 0,
          max: 100
        }
      },
      imagenUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true
        }
      }
    },
    {
      sequelize,
      modelName: "Promocion",
      indexes: [
        { fields: ['fecha'] },
        { fields: ['fechaExpiracion'] }
      ]
    }
  );

  return Promocion;
};

export { PromocionAttributes, initPromocion };
export default initPromocion;