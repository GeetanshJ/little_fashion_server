import { modelList } from "../config/model-list.js";
import { Op } from "sequelize";

// node cron function which will delete token from db
export const deleteTokenFromDB = async() => {
  const timeOver = new Date(Date.now() - 12*60*60*1000);
    await modelList.token.destroy({
      where:{
        creationTime:{
          [Op.lt] : timeOver
        }
      }
    })
}

//  clear refresh token function when user logout and re login then new refresh token is generated
export const clearRefreshToken = async (next,email) => {
  try {
    await modelList.token.destroy({
      where: {
        user_email: email,
      },
    });
    console.log("Refresh token cleared successfully.");
    next();
  } catch (err) {
    console.log(err);
  }  
};


