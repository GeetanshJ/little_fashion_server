// this is order model which stores order id with customer id
import { sequelize } from "../config/db.js";
import { DataTypes, NOW } from "sequelize";

export const order = sequelize.define(
  "Order",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    user_email: {
      type: DataTypes.STRING,
      references: {
        model: "users",
        key: "email",
      },
      allowNull: false,
    },

    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "shipped", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },

    firstname: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    lastname: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    state: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    zip: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    country: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    phone: {
      allowNull: false,
      type: DataTypes.STRING
    },
    transId: {
      allowNull: false,
      type: DataTypes.STRING
    }
  },
  {
    tableName: "orders",
  }
);
