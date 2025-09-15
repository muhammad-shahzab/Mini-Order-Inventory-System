import Customer from "../models/Customer.js"

// Create customer (admin only)
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
    })

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all customers (admin only)
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 })

    res.json({
      success: true,
      customers,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
