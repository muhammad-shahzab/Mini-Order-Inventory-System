import express from "express";
import { createCustomer, getCustomers } from "../controllers/customerController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import Customer from "../models/Customer.js";

const router = express.Router();

// POST /api/customers - create customer (admin only)
router.post("/", authMiddleware, adminMiddleware, createCustomer);

// GET /api/customers - list customers (admin only)
router.get("/", authMiddleware, adminMiddleware, getCustomers);

// GET /api/customers/me - get logged-in customer
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.user.email });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
