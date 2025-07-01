// This is social model and info of social media links

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const social = sequelize.define('Social',{
    id:{
        primaryKey:true,
        autoIncrement:true,
        allowNull:false,
        type:DataTypes.INTEGER
    },

    name:{
        allowNull:false,
        type:DataTypes.STRING,
    },

    link:{
        allowNull:false,
        type:DataTypes.STRING,
    },
},{
    tableName:"social_media"
}) ;


