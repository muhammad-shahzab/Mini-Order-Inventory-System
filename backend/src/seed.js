import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"
import Product from "./models/Product.js"
import Customer from "./models/Customer.js"

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Product.deleteMany({})
    await Customer.deleteMany({})

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin@123",
      role: "admin",
    })

    // Create sample products
    const products = await Product.create([
      {
        sku: "LAPTOP001",
        name: "Gaming Laptop",
        description: "High-performance gaming laptop with RTX graphics",
        price: 1299.99,
        stock: 10,
      },
      {
        sku: "MOUSE001",
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with RGB lighting",
        price: 49.99,
        stock: 25,
      },
      {
        sku: "KEYBOARD001",
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches",
        price: 89.99,
        stock: 15,
      },
      {
        sku: "MONITOR001",
        name: "4K Monitor",
        description: "27-inch 4K UHD monitor with HDR support",
        price: 399.99,
        stock: 8,
      },
    ])

    // Create sample customers
    const customers = await Customer.create([
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        address: "123 Main St, City, State 12345",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1987654321",
        address: "456 Oak Ave, City, State 67890",
      },
    ])

    console.log("Seed data created successfully!")
    console.log("Admin credentials:")
    console.log("Email: admin@example.com")
    console.log("Password: Admin@123")
    console.log(`Created ${products.length} products and ${customers.length} customers`)

    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
