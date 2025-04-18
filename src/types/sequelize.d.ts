import { Model, BelongsToManyAddAssociationMixin } from 'sequelize';
import { Proveedor } from '../models/Proveedor';
import { Supermercado } from '../models/Supermercado';

declare module '../models/Proveedor' {
  interface Proveedor {
    addSupermercado: BelongsToManyAddAssociationMixin<Supermercado, string>;
    getSupermercados: BelongsToManyGetAssociationsMixin<Supermercado>;
  }
}

declare module '../models/Supermercado' {
  interface Supermercado {
    addProveedor: BelongsToManyAddAssociationMixin<Proveedor, string>;
    getProveedores: BelongsToManyGetAssociationsMixin<Proveedor>;
  }
}