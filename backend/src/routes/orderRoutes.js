import express from "express"
import {
  placeOrder,
  getOrders,
  getOrderById,
  payOrder,
  fulfillOrder,
  cancelOrder,
} from "../controllers/orderController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { adminMiddleware } from "../middlewares/adminMiddleware.js"

const router = express.Router()

// POST /api/orders - place order (authenticated)
router.post("/", authMiddleware, placeOrder)

// GET /api/orders - list orders (authenticated)
router.get("/", authMiddleware, getOrders)

// GET /api/orders/:id - order detail (authenticated)
router.get("/:id", authMiddleware, getOrderById)

// POST /api/orders/:id/pay - pay order (authenticated)
router.post("/:id/pay", authMiddleware, payOrder)

// POST /api/orders/:id/fulfill - fulfill order (admin only)
router.post("/:id/fulfill", authMiddleware, adminMiddleware, fulfillOrder)

// POST /api/orders/:id/cancel - cancel order (authenticated)
router.post("/:id/cancel", authMiddleware, cancelOrder)

export default router
