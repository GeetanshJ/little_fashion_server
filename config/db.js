import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("assignment", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  timezone:'+05:30',
  hooks: {
    beforeConnect: () => console.log("Connecting to DB"),
    afterConnect: () => console.log("Connected to DB"),
  },
  define: {
    timestamps: false,
  },
  pool: {
    min: 0,
    max: 1,
    acquire: 15000,
    idle: 10000,
  },
  logging:false
});

sequelize
  .authenticate()
  .then(() => console.log("Authentication Successful"))
  .catch(() => console.log("Authentication Failed"));
 