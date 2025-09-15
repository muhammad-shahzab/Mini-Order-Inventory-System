import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

// Import routes
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"

// Import middleware
import { errorHandler } from "./middlewares/errorHandler.js"

// Import User model (for seeding admin)
import User from "./models/User.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/reports", reportRoutes)

// Error handling middleware
app.use(errorHandler)

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === "test" ? process.env.TEST_MONGO_URI : process.env.MONGO_URI

    await mongoose.connect(mongoURI)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

// 🔑 Seed Admin User
const seedAdmin = async () => {
  try {
    const adminEmail = "admin@example.com"
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (!existingAdmin) {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: "Admin@123", // make sure User model hashes this
        role: "admin",
      })
      console.log("✅ Admin user created successfully")
    } else {
      console.log("⚡ Admin user already exists")
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err)
  }
}

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    seedAdmin() // <-- ensure admin exists
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
}

export default app
