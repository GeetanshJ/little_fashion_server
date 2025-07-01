import express from "express";
import { modelList } from "../../config/model-list.js";
import {
  userSiteData,
  adminSiteData,
  faqData,
  socialMediaData,
  disabledProductData,
  userInfo,
} from "../../utils/fetch-data.js";
import { emailSchemaContact } from "../../controllers/email-schema-contact.js";
import jwt from "jsonwebtoken";
import { verifyJwt } from "../../midlewares/jwt.js";
import bcrypt from "bcrypt";
import { uploadUser } from "../../utils/multer.js";
import validator from "validator";
import { sequelize } from "../../config/db.js";
import { redirectRoute } from "../../utils/redirect-route.js";

const router = express.Router();
const getSiteData = async (email) => {
  return email === "admin@gmail.com" ? adminSiteData() : userSiteData();
};



//  Home Route

router.get("/", verifyJwt, async (req, res) => {
  return res.status(200).render("index", {
    siteData: await getSiteData(req.user.email),
    productData: await disabledProductData(),
    socialMediaData: await socialMediaData(),
    user: await userInfo(req.user.email),

  });
});

// FAQ Route
router.get("/faq", verifyJwt, async (req, res) => {
  return res.status(200).render("faq", {
    faqData: await faqData(),
    siteData: await getSiteData(req.user.email),
    socialMediaData: await socialMediaData(),
  });
});

// About Us Route
router.get("/about", verifyJwt, async (req, res) => {
  return res.status(200).render("about", {
    siteData: await getSiteData(req.user.email),
    socialMediaData: await socialMediaData(),
  });
});

// Log Out route
router.get(
  "/logout",

  verifyJwt,
  async (req, res) => {
    res.clearCookie("token");
    const logoutEmail = jwt.decode(req.cookies.token).email;
    await modelList.token.destroy({
      where: {
        user_email: logoutEmail,
      },
    });

    return res.status(200).redirect("sign-in");
  }
);

router.get("/profile", verifyJwt, async (req, res) => {
  const orderHistory = async () => {
    return await modelList.order.findAll({
      where: {
        user_email: req.user.email
      }, include: {
        model: modelList.order_detail,
      }
    })
  }

  const order = await orderHistory();

  return res.render("profile", {
    userData: await userInfo(req.user.email),
    orderHistory: await orderHistory(),
    siteData: await getSiteData(req.user.email),
    updateDataMessage: "",
    socialMediaData: await socialMediaData(),
  });
});

router.post(
  "/updateProfile",
  verifyJwt,
  uploadUser.single("profile"),
  async (req, res) => {
    const email = req.user.email;
    const orderHistory = async () => {
      return await modelList.order.findAll({
        where: {
          user_email: req.user.email
        }, include: {
          model: modelList.order_detail,
        }
      })
    }

    try {

      if (!req.body && !req.file) {
        return res.render("profile", {
          userData: await userInfo(req.user.email),
          orderHistory: await orderHistory(),
          siteData: await getSiteData(email),
          updateDataMessage: "Add something",
          socialMediaData: await socialMediaData(),
        });
      }

      const { firstname, lastname, address, city, state, zip, phone, password } = req.body;

      if (req.body.password) {
        if (
          !validator.isStrongPassword(req.body.password, {
            minLength: 4,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 1,
          })
        ) {

          return res.render("profile", {
            userData: await userInfo(req.user.email),
            orderHistory: await orderHistory(),
            siteData: await getSiteData(email),
            updateDataMessage: "Strong Pass",
            socialMediaData: await socialMediaData(),
          });
        }
      }

      if (phone) {
        const isMobilePhone = validator.isMobilePhone(phone, "en-IN");

        if (!isMobilePhone) {
          return res.render("profile", {
            userData: await userInfo(req.user.email),
            orderHistory: await orderHistory(),
            siteData: await getSiteData(email),
            updateDataMessage: "invalid phone",
            socialMediaData: await socialMediaData(),
          });
        }
      }
      if (zip) {
        const isZip = validator.isPostalCode(zip, "IN");

        if (!isZip) {
          return res.render("profile", {
            userData: await userInfo(req.user.email),
            orderHistory: await orderHistory(),
            siteData: await getSiteData(email),
            updateDataMessage: "invalid zip",
            socialMediaData: await socialMediaData(),
          });
        }
      }


      const updatedData = {};

      if (password) {
        updatedData.password = bcrypt.hashSync(password, 12);
      }

      if (address) {
        updatedData.address = address;
      }

      if (city) {
        updatedData.city = city;
      }

      if (state) {
        updatedData.state = state;
      }

      if (zip) {
        updatedData.zip = zip;
      }

      if (phone) {
        updatedData.phone = phone;
      }

      if (req.file) {
        updatedData.profile_img = req.file.filename;
      }

      if (firstname) {
        updatedData.firstname = firstname;
      }

      if (lastname) {
        updatedData.lastname = lastname;
      }

      if(Object.keys(updatedData).length === 0){
        return res.render("profile", {
        userData: await userInfo(req.user.email),
        orderHistory: await orderHistory(),
        siteData: await getSiteData(email),
        updateDataMessage: "enter value",
        socialMediaData: await socialMediaData(),
      });
      }

      await modelList.user.update(updatedData, {
        where: { email },
      });

      return res.render("profile", {
        userData: await userInfo(req.user.email),
        orderHistory: await orderHistory(),
        siteData: await getSiteData(email),
        updateDataMessage: "Profile updated",
        socialMediaData: await socialMediaData(),
      });
    } catch (err) {

      console.log(err);

      return res.render("profile", {
        userData: await userInfo(req.user.email),
        orderHistory: await orderHistory(),
        siteData: await getSiteData(email),
        updateDataMessage: "Profile not updated",
        socialMediaData: await socialMediaData(),
      });
    }
  }
);

// Contact Route
router.get("/contact", verifyJwt, async (req, res) => {
  return res.status(200).render("contact", {
    siteData: await getSiteData(req.user.email),
    contactMessage: null,
    socialMediaData: await socialMediaData(),
  });
});
router.post(
  "/contactData",

  verifyJwt,
  async (req, res) => {
    try {
      const result = emailSchemaContact.validate(req.body);
      if (result.error) {
        return res.status(500).render("contact", {
          siteData: await getSiteData(req.user.email),
          contactMessage: "Enter valid email",
          socialMediaData: await socialMediaData(),
        });
      }

      const { name, email, subject, message } = req.body;

      if (!req.body) {
        return res.status(500).render("contact", {
          siteData: await getSiteData(req.user.email),
          contactMessage: "Empty form ",
          socialMediaData: await socialMediaData(),
        });
      }
      await modelList.contact.create({
        name: name,
        email: email,
        subject: subject,
        message: message,
      });

      return res.status(201).render("contact", {
        siteData: await getSiteData(req.user.email),
        contactMessage: "We will contact you soon!!!",
        socialMediaData: await socialMediaData(),
      });
    } catch (err) {
      return res.status(500).render("contact", {
        siteData: await getSiteData(req.user.email),
        contactMessage: "Form not submitted",
        socialMediaData: await socialMediaData(),
      });
    }
  }
);

// Product Route
router.get("/products", verifyJwt, async (req, res) => {
  return res.status(200).render("products", {
    siteData: await getSiteData(req.user.email),
    productData: await disabledProductData(),
    socialMediaData: await socialMediaData(),
  });
});

// Product Detail Route
router.get("/product-detail/:id", verifyJwt, async (req, res) => {
  const dataFetched = await modelList.product.findByPk(req.params.id);
  return res.status(200).render("product-detail", {
    productData: await disabledProductData(),
    siteData: await getSiteData(req.user.email),
    socialMediaData: await socialMediaData(),
    item: dataFetched,
  });
});

// Route for handling cart

router.get("/cart", verifyJwt, async (req, res) => {
  const cartList = await modelList.cart.findAll({
    where: {
      user_email: req.user.email,
    },
  });

  return res.render("cart", { cartItems: cartList, cartMessage: null });
});

router.post("/addCartItem/:id", verifyJwt, async (req, res) => {
  const { name, description, price, qty, image } = req.body;
  const product_id = req.params.id;
  const cartEmail = req.user.email;

  const availableQty = (
    await modelList.product.findByPk(product_id, {
      attributes: ["qty"],
      raw: true,
    })
  ).qty;

  const requiredQty = parseInt(qty);
  const cartItem = await modelList.cart.findOne({
    where: {
      product_id,
      user_email: cartEmail,
    },
    raw: true,
  });

  if (availableQty - requiredQty >= 0) {
    await modelList.product.decrement("qty", {
      by: requiredQty,
      where: {
        id: product_id,
      },
    });

    // to check if product is already present in cart or not

    if (cartItem) {
      await modelList.cart.increment("qty", {
        by: requiredQty,
        where: {
          product_id,
        },
      });
    } else {
      await modelList.cart.create({
        name,
        description,
        price,
        qty: requiredQty,
        image,
        user_email: cartEmail,
        product_id,
      });
    }

    const cartList = await modelList.cart.findAll({
      where: {
        user_email: cartEmail,
      },
      raw: true,
    });
    return res.render("cart", {
      cartItems: cartList,
      cartMessage: `You can proceed`,
    });
  } else {
    const cartList = await modelList.cart.findAll({
      where: {
        user_email: cartEmail,
      },
      raw: true,
    });
    return res.render("cart", {
      cartItems: cartList,
      cartMessage: `You can add ${availableQty} items only`,
    });
  }
});

router.post("/deleteCartItem/:id", verifyJwt, async (req, res) => {
  try {
    const cartId = req.params.id;
    const cartEmail = req.user.email;

    const cartItem = await modelList.cart.findOne({
      where: {
        id: cartId,
        user_email: cartEmail,
      },
    });

    await modelList.product.increment("qty", {
      by: cartItem.qty,
      where: {
        id: cartItem.product_id,
      },
    });

    await modelList.cart.destroy({
      where: {
        id: cartId,
        user_email: cartEmail,
      },
    });

    const cartList = await modelList.cart.findAll({
      where: {
        user_email: cartEmail,
      },
      raw: true,
    });
    return res.render("cart", {
      cartItems: cartList,
      cartMessage: `Item deleted`,
    });
  } catch (err) {
    return res.render("cart", {
      cartItems: [],
      cartMessage: `Item already deleted`,
    });
  }
});

router.get("/orders", verifyJwt, async (req, res) => {
  try {
    const allOrders = await modelList.order.findAll({ raw: true });
    const statusOptions = modelList.order.getAttributes().status.values;
    return res.render("all-orders", { allOrders, statusOptions });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to load orders");
  }
});

router.post("/updateOrderStatus", verifyJwt, async (req, res) => {
  const { orderId, status } = req.body;

  try {
    await modelList.order.update(
      { status },
      { where: { id: orderId } }
    );
    redirectRoute(res);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Update failed");
  }
});

export default router;
