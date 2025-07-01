// this is contact model where user query will be stored 

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const contact = sequelize.define(
  "Contact",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, 
  {
    tableName: "contacts",
  }
);
