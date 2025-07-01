import { Op } from "sequelize";
import { modelList } from "../config/model-list.js";

// fetching user nav data
export const userSiteData = () => {
  return modelList.sitemap.findAll({
    limit: 5
  });
};

// fetching admin nav data
export const adminSiteData = () => {
  return modelList.sitemap.findAll();
};

// faq data
export const faqData = () => {
  return modelList.faq.findAll();
};

// all products list
export const enabledProductData = () => {
  return modelList.product.findAll({

  });
};

// product enabled by admin will be visible
export const disabledProductData = async () => {
  return modelList.product.findAll({
    where: {
      status: "enabled",
      qty: {
        [Op.gt]: 0
      }
    },
  });
};


// social icons data
export const socialMediaData = () => {
  return modelList.social.findAll();
};

// users list
export const userData = () => {
  return modelList.user.findAll({
    where: {
      email: {
        [Op.notLike]: "admin@gmail.com",
      },
    },
  });
};

export const userInfo = (email) => {
  return modelList.user.findOne({
    where: {
      email: email,
    },
  });
};
