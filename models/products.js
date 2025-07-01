// This is product table and have info about items  

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

export const product = sequelize.define('Product',{
    id:{
        primaryKey:true,
        autoIncrement:true,
        type:DataTypes.INTEGER,
        allowNull:false
    },

    name:{
        type:DataTypes.STRING,
        allowNull:false  
    },

    description:{
        type:DataTypes.STRING,
        allowNull:false  
    },

    price:{
        type:DataTypes.INTEGER,
        allowNull:false  
    },

    qty:{
        type:DataTypes.INTEGER,
        allowNull:false  
    },

    image:{
        type:DataTypes.STRING,
        allowNull:false  
    },

    status:{
        allowNull:false,
        type:DataTypes.ENUM("enabled","disabled"),
        defaultValue:"enabled"
    }
},{
    tableName:"products"
})