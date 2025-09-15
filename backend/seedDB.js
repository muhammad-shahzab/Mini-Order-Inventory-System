import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

// Import models
import User from "./src/models/User.js"
import Customer from "./src/models/Customer.js"
import Product from "./src/models/Product.js"
import Order from "./src/models/Order.js"
import Payment from "./src/models/Payment.js"

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected")
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

// Sample data
const users = [
  { name: "Admin", email: "admin@example.com", password: "Admin@123", role: "admin" },
  { name: "Customer1", email: "customer1@example.com", password: "Customer1@", role: "customer" },
  { name: "Customer2", email: "customer2@example.com", password: "Customer2@", role: "customer" },
  { name: "Customer3", email: "customer3@example.com", password: "Customer3@", role: "customer" },
  { name: "Customer4", email: "customer4@example.com", password: "Customer4@", role: "customer" },
  { name: "Customer5", email: "customer5@example.com", password: "Customer5@", role: "customer" },
  { name: "Customer6", email: "customer6@example.com", password: "Customer6@", role: "customer" },
  { name: "Customer7", email: "customer7@example.com", password: "Customer7@", role: "customer" },
  { name: "Customer8", email: "customer8@example.com", password: "Customer8@", role: "customer" },
  { name: "Customer9", email: "customer9@example.com", password: "Customer9@", role: "customer" },
]

const products = [
  { sku: "PROD001", name: "Wireless Mouse", description: "Ergonomic wireless mouse", price: 25.99, stock: 50 },
  { sku: "PROD002", name: "Mechanical Keyboard", description: "RGB keyboard", price: 79.99, stock: 30 },
  { sku: "PROD003", name: "Bluetooth Headphones", description: "Over-ear Bluetooth headphones", price: 120.0, stock: 20 },
  { sku: "PROD004", name: "Smart Watch", description: "Fitness smart watch", price: 150.5, stock: 15 },
  { sku: "PROD005", name: "Gaming Chair", description: "Adjustable gaming chair", price: 200.0, stock: 10 },
  { sku: "PROD006", name: "LED Desk Lamp", description: "Adjustable LED desk lamp", price: 35.75, stock: 40 },
  { sku: "PROD007", name: "External Hard Drive", description: "2TB USB 3.0", price: 89.99, stock: 25 },
  { sku: "PROD008", name: "Coffee Maker", description: "Automatic drip coffee maker", price: 65.0, stock: 18 },
  { sku: "PROD009", name: "Portable Speaker", description: "Waterproof Bluetooth speaker", price: 49.99, stock: 35 },
  { sku: "PROD010", name: "Yoga Mat", description: "Eco-friendly yoga mat", price: 20.0, stock: 60 },
]

const customers = [
  { name: "Customer1", email: "customer1@example.com", phone: "1234567890", address: "123 Street A" },
  { name: "Customer2", email: "customer2@example.com", phone: "1234567891", address: "124 Street B" },
  { name: "Customer3", email: "customer3@example.com", phone: "1234567892", address: "125 Street C" },
  { name: "Customer4", email: "customer4@example.com", phone: "1234567893", address: "126 Street D" },
  { name: "Customer5", email: "customer5@example.com", phone: "1234567894", address: "127 Street E" },
  { name: "Customer6", email: "customer6@example.com", phone: "1234567895", address: "128 Street F" },
  { name: "Customer7", email: "customer7@example.com", phone: "1234567896", address: "129 Street G" },
  { name: "Customer8", email: "customer8@example.com", phone: "1234567897", address: "130 Street H" },
  { name: "Customer9", email: "customer9@example.com", phone: "1234567898", address: "131 Street I" },
  { name: "Customer10", email: "customer10@example.com", phone: "1234567899", address: "132 Street J" },
]

// Helper to create random order items
const createOrderItems = (products) => {
  const items = []
  const numberOfItems = Math.floor(Math.random() * 3) + 1 // 1-3 items per order
  for (let i = 0; i < numberOfItems; i++) {
    const product = products[Math.floor(Math.random() * products.length)]
    const qty = Math.floor(Math.random() * 5) + 1
    items.push({
      sku: product.sku,
      name: product.name,
      price: product.price,
      qty,
      lineTotal: product.price * qty,
    })
  }
  return items
}

const seedDB = async () => {
  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany({})
    await Customer.deleteMany({})
    await Product.deleteMany({})
    await Order.deleteMany({})
    await Payment.deleteMany({})
    console.log("Cleared existing data")

    // Hash passwords for users
    for (let user of users) {
      const hashed = await bcrypt.hash(user.password, 12)
      user.password = hashed
    }

    // Insert users, customers, products
    const createdUsers = await User.insertMany(users)
    const createdCustomers = await Customer.insertMany(customers)
    const createdProducts = await Product.insertMany(products)
    console.log("Inserted users, customers, products")

    // Create orders and payments with specific statuses
    const orderStatuses = ["Paid", "Paid", "Paid", "Paid", "Paid", "Fulfilled", "Fulfilled", "Fulfilled", "Cancelled", "Cancelled"]

    for (let i = 0; i < 10; i++) {
      const customer = createdCustomers[i]
      const items = createOrderItems(createdProducts)
      const total = items.reduce((sum, item) => sum + item.lineTotal, 0)
      const status = orderStatuses[i]

      const order = await Order.create({
        customer: customer._id,
        items,
        total,
        status,
        paidAt: status === "Paid" || status === "Fulfilled" ? new Date() : null,
        fulfilledAt: status === "Fulfilled" ? new Date() : null,
        cancelledAt: status === "Cancelled" ? new Date() : null,
      })

      await Payment.create({
        order: order._id,
        amount: total,
        method: "Credit Card",
        paidAt: status === "Paid" || status === "Fulfilled" ? new Date() : null,
      })
    }

    console.log("Inserted orders and payments with statuses")
    process.exit()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

seedDB()
