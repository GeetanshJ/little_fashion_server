// this model is for faq 
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const faq = sequelize.define(
  "Faq",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "faqs",
  }
);

