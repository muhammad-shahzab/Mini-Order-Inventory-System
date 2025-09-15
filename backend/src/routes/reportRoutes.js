import express from "express"
import { getStockReport, getOrdersReport, getSalesSummary } from "../controllers/reportController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { adminMiddleware } from "../middlewares/adminMiddleware.js"

const router = express.Router()

// GET /api/reports/stock - stock report (admin only)
router.get("/stock", authMiddleware, adminMiddleware, getStockReport)

// GET /api/reports/orders - orders report (admin only)
router.get("/orders", authMiddleware, adminMiddleware, getOrdersReport)

// GET /api/reports/sales-summary - sales summary (admin only)
router.get("/sales-summary", authMiddleware, adminMiddleware, getSalesSummary)

export default router
