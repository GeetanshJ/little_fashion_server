import express from "express";
import validator from "validator";
import { verifyJwt } from "../../midlewares/jwt.js";
import { modelList } from "../../config/model-list.js";
import { createCustomerProfile } from "../../controllers/paymentMiddlewares/create-customer-profile.js";
import { getCustomerProfile } from "../../controllers/paymentMiddlewares/get-customer-profile.js";
import { createCustomerPaymentProfile } from "../../controllers/paymentMiddlewares/create-customer-profile-payment.js";
import { validateCustomerPaymentProfile } from "../../controllers/paymentMiddlewares/validate-customer-payment-profile.js";
import { chargeCustomerProfile } from "../../controllers/paymentMiddlewares/charge-card.js";
import { redirectRoute } from "../../utils/redirect-route.js";

const router = express.Router();

//Render view for creating new customer profile

const renderCreateCustomerProfile = async (res, statusCode, addressId) => {
  res.status(statusCode).render("create-user-profile", { addressId });
};

// Render view to add a new card (payment profile)

const renderAddCardPage = async (res, statusCode, addressId, profileId) => {
  res
    .status(statusCode)
    .render("new-payment-profile", { addressId, profile_id: profileId });
};

// Render checkout page with address selection

const renderAddressSelectionPage = async (res, email, statusCode, message) => {
  const addresses = await modelList.user_address.findAll({
    where: { user_email: email },
  });

  res.status(statusCode).render("address-details", {
    checkoutMessage: message,
    addressDetails: addresses,
  });
};

// GET /address — Show address page
router.get("/address", verifyJwt, async (req, res) => {
  return renderAddressSelectionPage(res, req.user.email, 200, "");
});

// GET /cards — Show user's saved cards
router.get("/cards/:id", verifyJwt, async (req, res) => {
  const addressId = req.params.id;
  const { email } = req.user;
  const user = await modelList.user.findOne({
    where: { email },
    attributes: ["profile_id"],
  });
  const profileId = user?.profile_id;

  getCustomerProfile(profileId, (response) => {
    if (response.getMessages().getResultCode() === "Ok") {
      res.render("get-all-cards", {
        cards: response.profile.paymentProfiles,
        addressId,
      });
    }
  });
});

router.get("/pay/:addressId/:profileId/:paymentId", verifyJwt, async (req, res) => {
  const customerProfileId = req.params.profileId;
  const paymentProfileId = req.params.paymentId;
  const addressIdId = req.params.addressId;

  const cartInfo = await modelList.cart.findAll({
    where: {
      user_email: req.user.email
    }
  })

  const addressInfo = await modelList.user_address.findByPk(addressIdId);

  validateCustomerPaymentProfile(customerProfileId, paymentProfileId, async (response) => {
    if (response.getMessages().getResultCode() === "Ok") {
      chargeCustomerProfile(addressInfo, cartInfo,customerProfileId,paymentProfileId, async (response) => {
        console.log("response",response.transactionResponse.transId);
        
        if (response.getMessages().getResultCode() === "Ok") {
          const order = await modelList.order.create({
            user_email:req.user.email,
            firstname: addressInfo.firstname,
            lastname: addressInfo.lastname,
            address: addressInfo.address,
            city: addressInfo.city,
            state: addressInfo.state,
            zip: addressInfo.zip,
            country: addressInfo.country,
            phone: addressInfo.phone,
            transId:response.transactionResponse.transId
          }) 

          const order_id = order.id;
          for (let i = 0; i < cartInfo.length; i++) {
            await modelList.order_detail.create({
              order_id,
              name: cartInfo[i].name,
              qty: cartInfo[i].qty,
              price: cartInfo[i].price
            })
          }

          await modelList.cart.destroy({
            where: {
              user_email: req.user.email
            }
          })
          await redirectRoute(res);
        }
        else return res.send("Error")
      })
    }
    else return res.send("Error")
  })

})

// POST /order/address — Select or submit shipping address
router.post("/order/address", verifyJwt, async (req, res) => {
  const { email } = req.user;
  const user = await modelList.user.findOne({
    where: { email },
    attributes: ["profile_id"],
  });
  const profileId = user?.profile_id;

  if (req.body.selectedAddress) {
    const addressId = req.body.selectedAddress;
    return profileId
      ? renderAddCardPage(res, 200, addressId, profileId)
      : renderCreateCustomerProfile(res, 200, addressId);
  }

  const { firstname, lastname, address, city, state, country, zip, phone } =
    req.body;

  // Validate phone and zip
  if (!validator.isMobilePhone(phone, "en-IN")) {
    return renderAddressSelectionPage(
      res,
      email,
      400,
      "Invalid Mobile Number."
    );
  }

  if (!validator.isPostalCode(zip, "IN")) {
    return renderAddressSelectionPage(res, email, 400, "Invalid Postal Code.");
  }

  const existingAddresses = await modelList.user_address.findAll({
    where: { user_email: email },
  });

  const isDuplicate = existingAddresses.find(
    (entry) =>
      entry.firstname === firstname &&
      entry.lastname === lastname &&
      entry.address === address &&
      entry.city === city &&
      entry.state === state &&
      entry.zip === zip &&
      entry.country === country &&
      entry.phone === phone
  );

  if (isDuplicate) {
    return renderAddressSelectionPage(
      res,
      email,
      201,
      "Address already present."
    );
  }

  const newAddress = await modelList.user_address.create({
    user_email: email,
    firstname,
    lastname,
    address,
    city,
    state,
    zip,
    country,
    phone,
  });

  const addressId = newAddress.id;

  return profileId
    ? renderAddCardPage(res, 200, addressId, profileId)
    : renderCreateCustomerProfile(res, 200, addressId);
});

// POST /add/customer/:id — Create Authorize.net profile
router.post("/add/customer/:id", verifyJwt, async (req, res) => {
  const { email } = req.user;
  const { cardNumber } = req.body;
  const addressId = req.params.id;

  const user = await modelList.user.findOne({ where: { email } });
  const address = await modelList.user_address.findByPk(addressId);
  const cartItems = await modelList.cart.findAll({
    where: { user_email: email },
  });

  const userInfo = {
    firstname: user.firstname,
    lastname: user.lastname,
    address: address.address,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country,
    phone: address.phone,
    email,
    cardNumber,
  };

  createCustomerProfile(userInfo, async (response) => {
    if (response.getMessages().getResultCode() === "Ok") {
      await modelList.user.update(
        { profile_id: response.getCustomerProfileId() },
        { where: { email } }
      );

      // card number in user info is used for creating profile and cardnumber in order summary is used to show to user 

      res.status(200).render("order-summary", {
        addressInfo: userInfo,
        cartItems,
        addressId,
        cardNumber: cardNumber.slice(-4),
        paymentId: response.customerPaymentProfileIdList.numericString[0],
        profileId: response.getCustomerProfileId()
      });
    } else {
      res.status(500).send("Failed to create profile.");
    }
  });
});

// POST /add/card/:id — Add card to existing Authorize.net profile
router.post("/add/card/:id", verifyJwt, async (req, res) => {
  const { email } = req.user;
  const { cardNumber } = req.body;
  const addressId = req.params.id;

  const user = await modelList.user.findOne({ where: { email } });
  const address = await modelList.user_address.findByPk(addressId);
  const cartItems = await modelList.cart.findAll({
    where: { user_email: email },
  });

  const profile = await modelList.user.findOne({
    where: { email },
    attributes: ["profile_id"],
    raw: true,
  });

  const profileId = profile?.profile_id;

  const userInfo = {
    firstname: user.firstname,
    lastname: user.lastname,
    address: address.address,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country,
    phone: address.phone,
    email,
    cardNumber,
  };

  createCustomerPaymentProfile(profileId, userInfo, (response) => {
    if (response.getMessages().getResultCode() === "Ok") {
      res.status(200).render("order-summary", {
        addressInfo: userInfo,
        cartItems,
        addressId,
        cardNumber: cardNumber.slice(-4),
        paymentId: response.getCustomerPaymentProfileId(),
        profileId: response.getCustomerProfileId()

      });
    } else {
      res.status(500).send("Failed to add card.");
    }
  });
});

// POST /order/card — Use existing saved card for checkout
router.post("/order/card/:id", verifyJwt, async (req, res) => {
  const { selectedCard, cardNumber } = req.body;

  const { email } = req.user;
  const addressId = req.params.id;
  const user = await modelList.user.findOne({
    where: { email },
    attributes: ["profile_id"],
  });
  const cartItems = await modelList.cart.findAll({
    where: { user_email: email },
  });

  const address = await modelList.user_address.findByPk(addressId);

  const userInfo = {
    firstname: address.firstname,
    lastname: address.lastname,
    address: address.address,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country,
    phone: address.phone,
    email,
    cardNumber,
  };

  res.status(200).render("order-summary", {
    addressInfo: userInfo,
    addressId,
    cartItems,
    cardNumber: userInfo.cardNumber.slice(-4),
    paymentId: selectedCard,
    profileId: user.profile_id
  });
});

export default router;
