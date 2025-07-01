// This is users model and info about user 
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const user_address = sequelize.define('User_Address',{
    id:{
        primaryKey:true,
        autoIncrement:true,
        allowNull:false,
        type:DataTypes.INTEGER
    },
    firstname:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    lastname:{
        allowNull:false,
        type:DataTypes.STRING,
    },
    
    user_email: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "users",
        key: "email",
      },
    },

    address:{
        allowNull:false,
        type:DataTypes.STRING,
        defaultValue:'India'
    },

    city:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    state:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    zip:{ 
        allowNull:false, 
        type:DataTypes.STRING,
    },

    country:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    phone:{
        allowNull:false,
        type:DataTypes.STRING
    },
},{
    tableName:"users_address"
}) ;


