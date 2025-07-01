// This is sitemap model and has info about nav icons like home, faq etc

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

export const sitemap = sequelize.define('SiteMap',{
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

    route:{
        type:DataTypes.STRING,
        allowNull:false 
    }
},{
    tableName:"sitemaps"
})