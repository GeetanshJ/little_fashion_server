// This is users model and info about user 
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const user = sequelize.define('User',{
    id:{
        primaryKey:true,
        autoIncrement:true,
        allowNull:false,
        type:DataTypes.INTEGER
    },

    email:{
        allowNull:false,
        type:DataTypes.STRING,
        unique:true
    },

    password:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    profile_img:{
        allowNull:true,
        type:DataTypes.STRING,   
        defaultValue:'user.png' 
    },
        
    firstname:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    lastname:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    address:{
        allowNull:false,
        type:DataTypes.STRING,
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

    profile_id:{
        allowNull:true,
        type:DataTypes.STRING,
    },

    status:{
        allowNull:false,
        type:DataTypes.ENUM("active","inactive"),
        defaultValue:"active"
    }

},{
    tableName:"users"
}) ;


