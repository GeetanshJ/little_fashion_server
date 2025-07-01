import { user } from "../models/users.js";
import { contact } from "../models/contact.js";
import { faq } from "../models/faq.js";
import { order } from "../models/orders.js";
import { product } from "../models/products.js";
import { sitemap } from "../models/sitemap.js";
import { social } from "../models/social.js";
import { token } from "../models/token.js";
import { order_detail } from "../models/order-details.js";
import { cart } from "../models/cart.js";
import { user_address } from "../models/user-address.js";

order.hasMany(order_detail, {
  foreignKey: 'order_id', 
});

order_detail.belongsTo(order, {
  foreignKey: 'order_id', 
});

const modelList = {
  user,
  contact,
  faq,
  order,
  product,
  sitemap,
  social,
  token,
  order_detail,
  cart,
  user_address
};


export {modelList};