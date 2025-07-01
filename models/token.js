// This is token model used for authentication
import { DataTypes, NOW } from "sequelize"; 
import { sequelize } from "../config/db.js";
 
export const token = sequelize.define('Token',{
    user_email:{
        type:DataTypes.STRING,
        references:{
            model:"users",
            key:'email'
        },
        allowNull: false,
        primaryKey:true
    },

    refresh_token:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    creationTime: {
        allowNull:true,
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
},{
    tableName:"tokens"
}) ; 


