"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from "@mui/material"
import {
  Inventory,
  People,
  ShoppingCart,
  TrendingUp,
  Warning,
  CheckCircle,
} from "@mui/icons-material"
import api from "../services/api"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    revenue: 0,
    lowStock: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, customersRes, ordersRes, stockRes, salesRes] = await Promise.all([
        api.get("/products"),
        api.get("/customers"),
        api.get("/orders"),
        api.get("/reports/stock"),
        api.get("/reports/sales-summary"),
      ])

      const products = productsRes.data.products || []
      const customers = customersRes.data.customers || []
      const orders = ordersRes.data.orders || []
      const stockReport = stockRes.data.report || {}
      const salesReport = salesRes.data.report || {}

      setStats({
        products: products.length,
        customers: customers.length,
        orders: orders.length,
        revenue: salesReport.summary?.totalRevenue || 0,
        lowStock: stockReport.lowStockCount || 0,
        pendingOrders: orders.filter((o) => o.status === "Pending").length,
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color = "primary" }) => (
    <Card
      sx={{
        borderRadius: 3,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent
        sx={{
          opacity: 0,
          transform: "translateY(20px)",
          animation: "fadeInUp 0.5s forwards",
          animationDelay: "0.1s",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {typeof value === "number" && title.includes("Revenue")
                ? `$${value.toLocaleString()}`
                : value.toLocaleString()}
            </Typography>
          </Box>
          <Box color={`${color}.main`} fontSize={40}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          opacity: 0,
          transform: "translateY(20px)",
          animation: "fadeInUp 0.5s forwards",
        }}
      >
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Products" value={stats.products} icon={<Inventory fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Customers" value={stats.customers} icon={<People fontSize="large" />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Orders" value={stats.orders} icon={<ShoppingCart fontSize="large" />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Revenue" value={stats.revenue} icon={<TrendingUp fontSize="large" />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Low Stock Items" value={stats.lowStock} icon={<Warning fontSize="large" />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<CheckCircle fontSize="large" />} color="error" />
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 8px 20px rgba(0,0,0,0.1)" },
              animation: "fadeInUp 0.5s forwards",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Orders
            </Typography>
            {recentOrders.length === 0 ? (
              <Typography color="textSecondary">No orders found</Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id.slice(-8)}</td>
                        <td>{order.customer?.name || "N/A"}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Paid"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Fulfilled"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Container>
  )
}

export default AdminDashboard
