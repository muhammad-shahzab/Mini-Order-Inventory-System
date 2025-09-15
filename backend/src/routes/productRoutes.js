import express from "express"
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controllers/productController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { adminMiddleware } from "../middlewares/adminMiddleware.js"
import { productValidation, validateRequest } from "../utils/validators.js"

const router = express.Router()

// POST /api/products - create product (admin only)
router.post("/", authMiddleware, adminMiddleware, productValidation, validateRequest, createProduct)

// GET /api/products - list products (public)
router.get("/", getProducts)

// PUT /api/products/:id - update product (admin only)
router.put("/:id", authMiddleware, adminMiddleware, updateProduct)

// DELETE /api/products/:id - delete product (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct)

export default router
