import { DataTypes, Sequelize, Model, Optional } from "sequelize";
import { UserRole } from "./User";

type Estado = "pendiente" | "aceptada" | "rechada";
interface SolicitudSupermercadoAttributes {
    id: string;
    name: string;
    surname: string;
    phone: string;
    email: string;
    dni:number;
    role: UserRole;
    password?: string;
    
    nameSupermercado: string;
    address: string;
    provincia: string;
    departamento?:string;
    localidad: string;
    fecha_solicitud: Date | null;
    estado: Estado;
    run : string
  }
  
  interface SolicitudSupermercadoCreationAttributes extends Optional<SolicitudSupermercadoAttributes, "id"> {}
  
  class SolicitudSupermercado
    extends Model<SolicitudSupermercadoAttributes, SolicitudSupermercadoCreationAttributes>
    implements SolicitudSupermercadoAttributes
  {
    public id!: string;
    public name!: string;
    public surname!: string;
    public phone!: string;
    public email!: string;
    public role!: UserRole;
    public password?: string;
    public dni!:number
    public nameSupermercado!: string;
    public address!: string;
    public provincia!: string;
    public localidad!: string;
    public departamento? :string;
    public fecha_solicitud!: Date | null;
    public estado!: Estado;
    public run! : string;
  
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
  
  }

  const  initSolicitudSupermercado =(sequelize: Sequelize): typeof SolicitudSupermercado=> {
    SolicitudSupermercado.init(
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
         
        },

        dni: {
          type: DataTypes.STRING,
          allowNull: false,
         
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          
          validate: {
            isEmail: true,
            notEmpty: true
          }
        },
        role: {
          type: DataTypes.ENUM('admin', 'super-admin', 'invited'),
          allowNull: false,
          defaultValue: 'admin',
          validate: {
            isIn: [['admin', 'super-admin', 'invited']]
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            notEmpty: true,
            len: [8, 128]
          }
        },
       
        nameSupermercado: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        provincia: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        departamento: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        localidad: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        estado: {
          type: DataTypes.ENUM("pendiente", "aceptada", "rechada"),
          allowNull: false,
          defaultValue: 'pendiente',
        },
        fecha_solicitud: {
          type: DataTypes.DATE,
          allowNull: true
        },
        run: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'SolicitudSupermercado',
       
      }
    );
    return SolicitudSupermercado;
  }

  export { SolicitudSupermercadoAttributes , SolicitudSupermercadoCreationAttributes , initSolicitudSupermercado }
 export default initSolicitudSupermercado