// this is order details model which stores info about each order like qty , price etc

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
export const order_detail = sequelize.define(
  "Orders_Detail",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    order_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "orders",
        key: "id",
      },
      allowNull: false,
    },

    name:{
        type:DataTypes.STRING,
        allowNull:false
    },

    qty:{
        type:DataTypes.INTEGER,
        allowNull:false
    },

    price:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
  },
  {
    tableName: "orders_detail",
  }
);



