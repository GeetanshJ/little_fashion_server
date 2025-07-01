import { redirectRoute } from "../utils/redirect-route.js";

export const authenticateAdmin = (req,res,next) => {
    if(req.user.email === "admin@gmail.com") return next();
    else return redirectRoute(res);
}