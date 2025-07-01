import jwt from "jsonwebtoken";
import { modelList } from "../config/model-list.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../controllers/generate-token.js";
import { clearRefreshToken } from "../controllers/clear-token.js";
import { redirectRoute } from "../utils/redirect-route.js";

// here generateJWT will generate token everytime user logs in
export const generateJwt = async (res, email) => {
  const accessToken = generateAccessToken(email);
  const refreshToken = generateRefreshToken(email);
  await modelList.token.findOrCreate({
    where: { user_email: email },
    defaults: { refresh_token: refreshToken, creationTime: Date.now() },
  });

  res.cookie("token", accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
  });

  return res.redirect("/");
};

// here there are 2 tokens 1. access token that will authenticate user everytime visit page and stored in a cookie
// 2nd refresh token stored in database
// if user access token time left is less than 2min then refresh token generate new access token to prevent re login
// if user comes after access token expiration then both tokens will be deleted

export const verifyJwt = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).redirect("/sign-in");
  try {
    // authenticates user
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    const decode = jwt.decode(token);

    const timeLeft = Math.floor(
      (decode.exp - Math.floor(Date.now() / 1000)) / 60
    );

    // checking expiration time of access token
    if (timeLeft <= 2) {
      const user = await modelList.token.findByPk(decode.email);

      if (!user) {
        res.clearCookie("token");
        return res.status(401).redirect("/sign-in");
      }

      // generating new access token
      else {
        const newAccessToken = generateAccessToken(decode.email);
        res.cookie("token", newAccessToken, {
          maxAge: 15 * 60 * 1000,
          httpOnly: true,
        });
      }
    }

    req.user = decode;
    return next();
  } catch (err) {
    return res.status(401).redirect("/sign-in");
  }
};

// prevent user to re login again and again if logged in once
export const preventReAuthnticate = async (req, res, next) => {
  if (req.cookies.token) {
    return redirectRoute(res);
  }

  return next();
};

// prevent disabled users to access website
export const preventDisabledUser = async (req, res, next) => {
  const email = req.body.email;

  const disabledUser = await modelList.user.findOne({
    where: {
      email,
      status:"inactive"
    },
  });

  // delete refresh token from db if user sign in
  if (disabledUser) {
    return res.status(200).send("You are not Allowed");
  } else {
    const userLogged = await modelList.token.findByPk(email);
    userLogged ? clearRefreshToken(next, email) : next();
  }
};
