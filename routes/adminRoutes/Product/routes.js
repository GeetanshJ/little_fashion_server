import express from "express";
import validator from "validator";
import { modelList } from "../../../config/model-list.js";
import { uploadProduct } from "../../../utils/multer.js";
import { enabledProductData } from "../../../utils/fetch-data.js";
import { verifyJwt } from "../../../midlewares/jwt.js";
import { authenticateAdmin } from "../../../midlewares/authenticate-admin.js";

const router = express.Router();
const regex = /[A-Za-z]/
const renderAdminPanel = async (res, statusCode, message) => {
  return res.status(statusCode).render("admin-panel-product", {
    productData: await enabledProductData(),
    productMessage: message,
  });
};

//  Admin Product List
router.get("/productList", verifyJwt, authenticateAdmin, async (req, res) => {
  return renderAdminPanel(res, 200, null);
});

//  Add Product
router.post(
  "/addProduct",
  verifyJwt,
  authenticateAdmin,
  uploadProduct.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, qty } = req.body;
      const file = req.file;

      if (!regex.test(name) || !regex.test(description) ||  price <= 0 || qty <= 0) {
        return renderAdminPanel(res, 401, "Invalid product data.");
      }

      await modelList.product.create({
        name,
        description,
        price,
        qty,
        image: file.filename,
      });

      return renderAdminPanel(res, 201, "Product Added");
    } catch (err) {
      console.error("Add product error:", err);
      return renderAdminPanel(res, 500, "Product Not Added");
    }
  }
);

//   Delete Product
router.get(
  "/deleteProduct/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    try {
      await modelList.product.destroy({ where: { id: req.params.id } });
      return renderAdminPanel(res, 200, "Item Deleted");
    } catch (err) {
      return renderAdminPanel(res, 500, "Item Not Deleted");
    }
  }
);

// Load Update Form
router.get(
  "/updateProduct/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    try {
      return res
        .status(200)
        .render("update-product", { item_id: req.params.id });
    } catch (err) {
      return res.status(500).render("update-product");
    }
  }
);

// Modify Product
router.post(
  "/modifyProduct/:id",
  verifyJwt,
  authenticateAdmin,
  uploadProduct.single("image"),
  async (req, res) => {
    const { name, description, price, qty } = req.body;
    const image = req?.file?.filename;
    const updateData = {};

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (price) updateData.price = price
    if (image) updateData.image = image;
    if (qty) updateData.qty = qty;


    if(Object.keys(updateData).length === 0){
        return renderAdminPanel(res, 200, "Enter value");
    }

    try {
      await modelList.product.update(updateData, {
        where: { id: req.params.id },
      });
      return renderAdminPanel(res, 200, "Item Updated");
    } catch (err) {
      console.error("Modify product error:", err);
      return renderAdminPanel(res, 500, "Item Not Updated");
    }
  }
);

//Disable Product
router.get(
  "/disableProduct/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const disabledProduct = await modelList.product.findOne({
        where: {
          id: productId,
          status: "disabled"
        }
      });
      if (disabledProduct) {
        return renderAdminPanel(res, 200, "Item is already disabled");
      }

      await modelList.product.update({
        status: "disabled",
      }, {
        where: {
          id: productId
        }
      });
      return renderAdminPanel(res, 200, "Item Disabled");
    } catch (err) {
      return renderAdminPanel(res, 500, "Item Not Disabled");
    }
  }
);

//Enable Product
router.get(
  "/enableProduct/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const enabledProduct = await modelList.product.findOne({
        where: {
          id: productId,
          status: "enabled"
        }
      });
      if (enabledProduct) {
        return renderAdminPanel(res, 200, "Item is already enabled");
      }

      await modelList.product.update({
        status: "enabled",
      }, {
        where: {
          id: productId
        }
      });
      return renderAdminPanel(res, 200, "Item Enabled");
    } catch (err) {
      return renderAdminPanel(res, 500, "Item Not Enabled");
    }
  }
);

export default router;
