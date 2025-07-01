import jwt from "jsonwebtoken";

// generating access token
export const generateAccessToken =  (email) => {
  const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_KEY, {
    algorithm: "HS256",
    expiresIn: "15m",
  });

  return accessToken;
}; 

// generating refresh token

export const generateRefreshToken =  (email) => {
  const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_KEY, {
    algorithm: "HS256",
    expiresIn: "12h",
  });

  return refreshToken;
};
