import express from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import { modelList } from "../../config/model-list.js";
import { userSiteData, socialMediaData } from "../../utils/fetch-data.js";
import {
  generateJwt,
  preventReAuthnticate,
  preventDisabledUser,
} from "../../midlewares/jwt.js";
import { redirectRoute } from "../../utils/redirect-route.js";

const router = express.Router();
// for null character validation
const regex = /[A-Za-z]/
// Helper to fetch site and social data
const renderAuthPage = async (res, view, messageKey, messageValue) => {
  res.status(200).render(view, {
    siteData: await userSiteData(),
    socialMediaData: await socialMediaData(),
    [messageKey]: messageValue,
  });
};

// GET: Sign-In Page
router.get("/sign-in", preventReAuthnticate, async (req, res) => {
  return renderAuthPage(res, "sign-in", "signInMessage", null);
});

// GET: Sign-Up Page
router.get("/sign-up", preventReAuthnticate, async (req, res) => {
  return renderAuthPage(res, "sign-up", "signUpMessage", "");
});

// POST: Sign-Up Form Submission
router.post("/signUpSubmit", async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    confirm_password,
    address,
    city,
    state,
    zip,
    country,
    phone,
  } = req.body;
  
  const user = await modelList.user.findOne({ where: { email } });

  if (user) {
    return renderAuthPage(
      res,
      "sign-up",
      "signUpMessage",
      "User Already Present"
    );
  }

  if (!validator.isEmail(email)) {
    return renderAuthPage(res, "sign-up", "signUpMessage", "Invalid Email");
  }

  if (password !== confirm_password) {
    return renderAuthPage(
      res,
      "sign-up",
      "signUpMessage",
      "Passwords do not match"
    );
  }

  const isStrong = validator.isStrongPassword(password, {
    minLength: 4,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    return renderAuthPage(
      res,
      "sign-up",
      "signUpMessage",
      "Weak password. Use symbols, numbers, etc."
    );
  }

  const isMobilePhone = validator.isMobilePhone(phone, "en-IN");

  if (!isMobilePhone) {
    return renderAuthPage(
      res,
      "sign-up",
      "signUpMessage",
      "Invalid Mobile Number."
    );
  }

  const isZip = validator.isPostalCode(zip, "IN");

  if (!isZip) {
    return renderAuthPage(
      res,
      "sign-up",
      "signUpMessage",
      "Invalid postal code"
    );
  }

    if (!regex.test(firstname) || !regex.test(lastname) || !regex.test(address) || !regex.test(city) || !regex.test(state) || !regex.test(country)) {
      return renderAuthPage(
      res,
      "sign-up",
      "signUpMessage",
      "Invalid data"
    );
  } 

  const hashedPass = bcrypt.hashSync(password, 14);

  await modelList.user.create({
    email,
    password: hashedPass,
    address,
    firstname,
    lastname,
    city,
    state,
    zip,
    country,
    phone,
  });

  await modelList.user_address.create({
    user_email: email,
    address,
    city,
    state,
    zip,
    country,
    phone,
    firstname,
    lastname,
  });

  return redirectRoute(res);
});

// POST: Sign-In Form Submission
router.post("/signInSubmit", preventDisabledUser, async (req, res) => {
  const { email, password } = req.body;

  const user = await modelList.user.findOne({ where: { email } });

  if (!user) {
    return renderAuthPage(res, "sign-in", "signInMessage", "User Not Found!!");
  }

  if(!regex.test(email) || !regex.test(password)){
    return renderAuthPage(
      res,
      "sign-in",
      "signInMessage",
      "Invalid data"
    );
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return renderAuthPage(
      res,
      "sign-in",
      "signInMessage",
      "Incorrect password"
    );
  }

  generateJwt(res, email); 
});

export default router;
