import express from "express";
import { modelList } from "../../../config/model-list.js";
import { userData } from "../../../utils/fetch-data.js";
import { verifyJwt } from "../../../midlewares/jwt.js";
import { redirectRoute } from "../../../utils/redirect-route.js";
import { authenticateAdmin } from "../../../midlewares/authenticate-admin.js";

const router = express.Router();

// Helper function to render the user admin panel with the user data and message
const renderUserPanel = async (res, message = null) => {
  const data = await userData(); // Fetch the user data
  return res.status(200).render("admin-panel-user", {
    userData: data,
    userMessage: message,
  });
};

// GET: Show the list of users
router.get("/userList", verifyJwt,authenticateAdmin, async (req, res) => {
    renderUserPanel(res);
  
});

// GET: Disable a user
router.get("/disableUser/:email", verifyJwt,authenticateAdmin, async (req, res) => {
    const { email } = req.params;

    try {
      const userFetched = await modelList.user.findOne({
        where:{
          status:"inactive",
          email
        }
      });

      if (userFetched) {
        return renderUserPanel(res, "User is disabled already");
      }

      await modelList.user.update({
        status:"inactive"
      },{
        where:{
          email
        }
      });

      return renderUserPanel(res, "User Disabled");
    } catch (err) {
      return renderUserPanel(res, "User not disabled");
    }
});

// GET: Enable a user
router.get("/enableUser/:email", verifyJwt, authenticateAdmin,async (req, res) => {
    const { email } = req.params;

    try {
      const userFetched = await modelList.user.findOne({
        where:{
          status:"active",
          email
        }
      });

      if (userFetched) {
        return renderUserPanel(res, "User is enabled already");
      }

      await modelList.user.update({  
        status:"active"
      },{
        where:{
          email
        }
      });
      return renderUserPanel(res, "User  enabled");
    } catch (err) {
      return renderUserPanel(res, "User not enabled");
    }
  });

export default router;
