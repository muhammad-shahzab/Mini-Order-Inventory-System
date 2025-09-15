import express from "express"
import { register, login } from "../controllers/authController.js"
import { registerValidation, loginValidation, validateRequest } from "../utils/validators.js"

const router = express.Router()

// POST /api/auth/register
router.post("/register", registerValidation, validateRequest, register)

// POST /api/auth/login
router.post("/login", loginValidation, validateRequest, login)

export default router
