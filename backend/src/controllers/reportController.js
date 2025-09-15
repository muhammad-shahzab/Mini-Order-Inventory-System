import Product from "../models/Product.js"
import Order from "../models/Order.js"
import Payment from "../models/Payment.js"

// Stock report (admin only)
export const getStockReport = async (req, res) => {
  try {
    const products = await Product.find({}).select("sku name stock price").sort({ stock: 1 })

    const lowStockProducts = products.filter((p) => p.stock < 5)
    const outOfStockProducts = products.filter((p) => p.stock === 0)

    res.json({
      success: true,
      report: {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        products,
        lowStockProducts,
        outOfStockProducts,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Orders report (admin only)
export const getOrdersReport = async (req, res) => {
  try {
    const { status, from, to } = req.query

    const query = {}

    if (status) {
      query.status = status
    }

    if (from || to) {
      query.createdAt = {}
      if (from) query.createdAt.$gte = new Date(from)
      if (to) query.createdAt.$lte = new Date(to)
    }

    const orders = await Order.find(query).populate("customer", "name email").sort({ createdAt: -1 })

    const summary = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "Pending").length,
      paidOrders: orders.filter((o) => o.status === "Paid").length,
      fulfilledOrders: orders.filter((o) => o.status === "Fulfilled").length,
      cancelledOrders: orders.filter((o) => o.status === "Cancelled").length,
      totalValue: orders.reduce((sum, order) => sum + order.total, 0),
    }

    res.json({
      success: true,
      report: {
        summary,
        orders,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Sales summary (admin only)
export const getSalesSummary = async (req, res) => {
  try {
    const { from, to } = req.query

    const dateQuery = {}
    if (from || to) {
      dateQuery.paidAt = {}
      if (from) dateQuery.paidAt.$gte = new Date(from)
      if (to) dateQuery.paidAt.$lte = new Date(to)
    }

    const paidOrders = await Order.find({
      status: { $in: ["Paid", "Fulfilled"] },
      ...dateQuery,
    }).populate("customer", "name email")

    const payments = await Payment.find({
      ...dateQuery,
    }).populate("order")

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalOrders = paidOrders.length

    // Product sales analysis
    const productSales = {}
    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.sku]) {
          productSales[item.sku] = {
            sku: item.sku,
            name: item.name,
            totalQty: 0,
            totalRevenue: 0,
          }
        }
        productSales[item.sku].totalQty += item.qty
        productSales[item.sku].totalRevenue += item.lineTotal
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    res.json({
      success: true,
      report: {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        topProducts,
        recentOrders: paidOrders.slice(0, 10),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
