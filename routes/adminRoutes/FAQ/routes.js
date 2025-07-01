import express from "express";
import { modelList } from "../../../config/model-list.js";
import { faqData } from "../../../utils/fetch-data.js";
import { verifyJwt } from "../../../midlewares/jwt.js";
import { authenticateAdmin } from "../../../midlewares/authenticate-admin.js";
const router = express.Router();
// Helper function to render FAQ admin panel with optional message
const renderFaqPanel = async (res, statusCode, message) => {
  try {
    const data = await faqData();
    res.status(statusCode).render("admin-panel-faq", {
      faqData: data,
      faqMessage: message,
    });
  } catch (error) {
    res.status(500).render("admin-panel-faq", {
      faqData: [],
      faqMessage: "Failed to load FAQ data",
    });
  }
};

// GET: Show list of FAQs
router.get("/faqList", verifyJwt, authenticateAdmin, async (req, res) => {
  return renderFaqPanel(res, 200, null);
});

// POST: Add a new FAQ
router.post("/addFaq", verifyJwt, authenticateAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    await modelList.faq.create({ title, description });
    return renderFaqPanel(res, 201, "FAQ Added");
  } catch (err) {
    return renderFaqPanel(res, 500, "FAQ Not Added");
  }
});

// GET: Delete a specific FAQ
router.get("/deleteFaq/:id", verifyJwt, authenticateAdmin, async (req, res) => {
  try {
    await modelList.faq.destroy({ where: { id: req.params.id } });

    return renderFaqPanel(res, 200, "FAQ Deleted");
  } catch (err) {
    return renderFaqPanel(res, 500, "FAQ Not Deleted");
  }
});

// GET: Load a specific FAQ for updating
router.get("/updateFaq/:id", verifyJwt, authenticateAdmin, async (req, res) => {
  try {
    return res.status(201).render("update-faq", { item_id: req.params.id });
  } catch (err) {
    return res.status(404).render("update-faq");
  }
});

// POST: Update an existing FAQ
router.post(
  "/modifyFaq/:id",
  verifyJwt,
  authenticateAdmin,
  async (req, res) => {
    try {

      const { title, description } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        return renderFaqPanel(res, 200, "FAQ not changed");
      }

      await modelList.faq.update(updateData, {
        where: {
          id: req.params.id,
        },
      });

      return renderFaqPanel(res, 200, "FAQ updated");
    } catch (err) {
      return renderFaqPanel(res, 500, "FAQ not updated");
    }
  }
);

export default router;
