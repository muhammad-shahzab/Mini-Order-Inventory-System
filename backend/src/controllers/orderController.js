import mongoose from "mongoose"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import Customer from "../models/Customer.js"
import Payment from "../models/Payment.js"

// Place order (authenticated customer)
export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid order data. Items are required.",
      });
    }

    // Find the logged-in customer
    const customer = await Customer.findOne({ email: req.user.email }).session(session);
    if (!customer) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const customerId = customer._id;

    // Validate items and check stock
    const orderItems = [];
    let total = 0;
    const stockUpdates = [];

    for (const item of items) {
      if (!item.sku || !item.qty || item.qty <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Invalid item data. SKU and positive quantity required.",
        });
      }

      const product = await Product.findOne({ sku: item.sku }).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product with SKU ${item.sku} not found`,
        });
      }

      if (product.stock < item.qty) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`,
          availableStock: product.stock,
          requestedQuantity: item.qty,
        });
      }

      const existingItem = orderItems.find((orderItem) => orderItem.sku === item.sku);
      if (existingItem) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Duplicate product ${product.name} in order. Please combine quantities.`,
        });
      }

      const lineTotal = product.price * item.qty;
      orderItems.push({
        sku: product.sku,
        name: product.name,
        price: product.price,
        qty: item.qty,
        lineTotal,
      });

      total += lineTotal;
      stockUpdates.push({ productId: product._id, qty: item.qty });
    }

    for (const update of stockUpdates) {
      const result = await Product.findByIdAndUpdate(
        update.productId,
        { $inc: { stock: -update.qty } },
        { session, new: true }
      );

      if (result.stock < 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Stock insufficient due to concurrent orders. Please try again.",
        });
      }
    }

    const order = await Order.create(
      [
        {
          customer: customerId,
          items: orderItems,
          total: Math.round(total * 100) / 100,
          status: "Pending",
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Order placement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

// Get orders (admin sees all, customers see their own)
export const getOrders = async (req, res) => {
  try {
    const query = {}

    // If customer role, only show their orders
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ email: req.user.email })
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer profile not found",
        })
      }
      query.customer = customer._id
    }

    const orders = await Order.find(query).populate("customer", "name email").sort({ createdAt: -1 })

    res.json({
      success: true,
      orders,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id).populate("customer", "name email")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check access rights
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ email: req.user.email })
      if (!customer || !order.customer._id.equals(customer._id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        })
      }
    }

    res.json({
      success: true,
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Pay order
export const payOrder = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, method } = req.body

    // Validate input
    if (!amount || !method) {
      return res.status(400).json({
        success: false,
        message: "Payment amount and method are required",
      })
    }

    const paymentAmount = Number.parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      })
    }

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check access rights
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ email: req.user.email })
      if (!customer || !order.customer.equals(customer._id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        })
      }
    }

    // Validate order status
    if (order.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be paid. Current status: ${order.status}`,
        currentStatus: order.status,
      })
    }

    // Enhanced payment amount validation - must be exact match
    const orderTotal = Math.round(order.total * 100) / 100
    const roundedPayment = Math.round(paymentAmount * 100) / 100

    if (roundedPayment !== orderTotal) {
      return res.status(400).json({
        success: false,
        message:
          roundedPayment > orderTotal
            ? "Overpayment not allowed. Payment must exactly match order total."
            : "Underpayment not allowed. Payment must exactly match order total.",
        requiredAmount: orderTotal,
        providedAmount: roundedPayment,
      })
    }

    // Validate payment method
    const validMethods = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash"]
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
        validMethods,
      })
    }

    // Create payment record
    const payment = await Payment.create({
      order: order._id,
      amount: roundedPayment,
      method,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    })

    // Update order status to Paid
    order.status = "Paid"
    order.paidAt = new Date()
    await order.save()

    res.json({
      success: true,
      message: "Payment processed successfully",
      payment: {
        id: payment._id,
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        processedAt: payment.createdAt,
      },
      order: {
        id: order._id,
        status: order.status,
        paidAt: order.paidAt,
      },
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    res.status(500).json({
      success: false,
      message: "Payment processing failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Fulfill order (admin only)
export const fulfillOrder = async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Enhanced status validation
    if (order.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: `Order must be paid before fulfillment. Current status: ${order.status}`,
        currentStatus: order.status,
        requiredStatus: "Paid",
      })
    }

    // Update order status to Fulfilled
    order.status = "Fulfilled"
    order.fulfilledAt = new Date()
    await order.save()

    res.json({
      success: true,
      message: "Order fulfilled successfully",
      order: {
        id: order._id,
        status: order.status,
        fulfilledAt: order.fulfilledAt,
      },
    })
  } catch (error) {
    console.error("Order fulfillment error:", error)
    res.status(500).json({
      success: false,
      message: "Order fulfillment failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Cancel order
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { id } = req.params

    const order = await Order.findById(id).session(session)

    if (!order) {
      await session.abortTransaction()
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check access rights
    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ email: req.user.email }).session(session)
      if (!customer || !order.customer.equals(customer._id)) {
        await session.abortTransaction()
        return res.status(403).json({
          success: false,
          message: "Access denied",
        })
      }

      // Customers can only cancel pending orders
      if (order.status !== "Pending") {
        await session.abortTransaction()
        return res.status(400).json({
          success: false,
          message: "Only pending orders can be cancelled",
        })
      }
    }

    // Restore stock quantities
    for (const item of order.items) {
      await Product.findOneAndUpdate({ sku: item.sku }, { $inc: { stock: item.qty } }, { session })
    }

    // Update order status
    order.status = "Cancelled"
    order.cancelledAt = new Date()
    await order.save({ session })

    await session.commitTransaction()

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    })
  } catch (error) {
    await session.abortTransaction()
    res.status(500).json({
      success: false,
      message: error.message,
    })
  } finally {
    session.endSession()
  }
}
