import { DataTypes, Sequelize, Model, Optional } from "sequelize";

interface PromocionProgramadasAttributes {
  id: string;
  descuentos: JSON;
  hora_cron : string;
  supermercado_id? : string;

}
interface PromocionProgramadasCreationAttributes extends Optional<PromocionProgramadasAttributes, "id"> {}

class PromocionProgramadas extends Model<PromocionProgramadasAttributes , PromocionProgramadasCreationAttributes> implements PromocionProgramadasAttributes {
  public id!: string;
  public descuentos!:JSON;
  public hora_cron ! : string;

  
}

const initPromocionProgramada = (sequelize: Sequelize): typeof PromocionProgramadas => {
  PromocionProgramadas.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      descuentos: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      hora_cron: {
        type: DataTypes.STRING, // Guarda el string tipo "0 0 * * *"
        allowNull: false,
      },
    
      
     
     
    },
    {
      sequelize,
      modelName: "PromocionProgramada",
      
    }
  );

  return PromocionProgramadas;
};

export { PromocionProgramadasAttributes, initPromocionProgramada };
export default initPromocionProgramada;