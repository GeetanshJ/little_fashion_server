import express from "express";
import { modelList } from "../../../config/model-list.js";
import { socialMediaData } from "../../../utils/fetch-data.js";
import { verifyJwt } from "../../../midlewares/jwt.js";
import { authenticateAdmin } from "../../../midlewares/authenticate-admin.js";
import validator from "validator";

const router = express.Router();
const regex = /[A-Za-z]/;

// Helper function to render the social media admin panel with an optional message
const renderSocialMediaPanel = async (res, statusCode, message) => {
  const data = await socialMediaData();
  res.status(statusCode).render("admin-panel-social-media", {
    socialMediaData: data,
    socialMediaMessage: message,
  });
};

// GET: Show the list of social media icons
router.get("/socialList", verifyJwt, authenticateAdmin, async (req, res) => {
  return renderSocialMediaPanel(res, 200, null);
});

// POST: Add a new social media icon
router.post(
  "/addSocialMedia",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    const { name, link } = req.body;
    if (!regex.test(name) || !regex.test(link)) {
    return renderSocialMediaPanel(res, 401, "Social Icon not Added");
    }
    
    await modelList.social.create({
      name,
      link,
    });

    return renderSocialMediaPanel(res, 201, "Social Icon Added");
  }
);

// GET: Delete a specific social media icon
router.get(
  "/deleteSocialMedia/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    await modelList.social.destroy({
      where: {
        id: req.params.id,
      },
    });

    return renderSocialMediaPanel(res, 200, "Item Deleted");
  }
);

// GET: Load a specific social media icon for updating
router.get(
  "/updateSocialMedia/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    return res.status(201).render("update-social", { item_id: req.params.id });
  }
);

// POST: Modify an existing social media icon
router.post(
  "/modifySocialMedia/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    const { name, link } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (link) updateData.link = link;

    if (Object.keys(updateData).length === 0 || name === ' ' || link === ' ') {
      return renderSocialMediaPanel(res, 200, "enter value");
    }

    await modelList.social.update(updateData, {
      where: {
        id: req.params.id,
      },
    });

    return renderSocialMediaPanel(res, 200, "icon updated");
  }
);

export default router;
