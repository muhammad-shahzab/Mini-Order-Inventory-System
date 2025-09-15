"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material"
import { Add } from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import OrderForm from "../components/OrderForm"

const CustomerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0 })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [products, setProducts] = useState([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null)

  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [paymentData, setPaymentData] = useState({ amount: "", method: "Credit Card" })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([api.get("/orders"), api.get("/products")])
      const orders = ordersRes.data.orders || []
      const productsData = productsRes.data.products || []

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "Pending").length,
        completedOrders: orders.filter((o) => o.status === "Fulfilled").length,
      })
      setRecentOrders(orders.slice(0, 5))
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const openOrderForm = (product = null) => {
    setSelectedProductForOrder(product)
    setShowOrderForm(true)
  }

  const openPaymentDialog = (order) => {
    setSelectedOrder(order)
    setPaymentData({ amount: order.total.toString(), method: "Credit Card" })
    setShowPaymentDialog(true)
  }

  const handlePayOrder = async () => {
    try {
      await api.post(`/orders/${selectedOrder._id}/pay`, paymentData)
      setShowPaymentDialog(false)
      setSelectedOrder(null)
      setPaymentData({ amount: "", method: "Credit Card" })
      fetchDashboardData()
    } catch (err) {
      console.error("Payment failed:", err)
      alert("Payment failed. Try again.")
    }
  }

  const handleFulfillOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/fulfill`)
      fetchDashboardData()
    } catch (err) {
      console.error("Fulfill failed:", err)
      alert("Failed to fulfill order.")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning"
      case "Paid":
        return "info"
      case "Fulfilled":
        return "success"
      case "Cancelled":
        return "error"
      default:
        return "default"
    }
  }

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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#333" }}>
          Customer Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openOrderForm()}
          disabled={products.length === 0}
          sx={{
            background: "linear-gradient(90deg, #6a11cb, #2575fc)",
            textTransform: "none",
            fontWeight: 600,
            color: "#fff",
            boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
            transition: "transform 0.3s, background 0.3s",
            "&:hover": {
              transform: "scale(1.05)",
              background: "linear-gradient(90deg, #2575fc, #6a11cb)",
            },
          }}
        >
          Place New Order
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {[
          { label: "Total Orders", value: stats.totalOrders, color: "#6a11cb" },
          { label: "Pending Orders", value: stats.pendingOrders, color: "#f9a825" },
          { label: "Completed Orders", value: stats.completedOrders, color: "#2e7d32" },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
            <Card
              sx={{
                background: stat.color + "22",
                borderRadius: 3,
                boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Available Products */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 6px 18px rgba(0,0,0,0.1)" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
              Available Products
            </Typography>
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card
                    onClick={() => openOrderForm(product)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": { transform: "scale(1.05)", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>Price: ${product.price.toFixed(2)}</Typography>
                      <Typography sx={{ mt: 0.5 }}>Stock: {product.stock}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 6px 18px rgba(0,0,0,0.1)" }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
              Recent Orders
            </Typography>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="thead" sx={{ bgcolor: "#f5f5f5" }}>
                <Box component="tr">
                  <Box component="th" sx={{ p: 1, textAlign: "left" }}>Order ID</Box>
                  <Box component="th" sx={{ p: 1, textAlign: "left" }}>Items</Box>
                  <Box component="th" sx={{ p: 1, textAlign: "left" }}>Total</Box>
                  <Box component="th" sx={{ p: 1, textAlign: "left" }}>Status</Box>
                  <Box component="th" sx={{ p: 1, textAlign: "left" }}>Actions</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {recentOrders.map((order) => (
                  <Box component="tr" key={order._id} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                    <Box component="td" sx={{ p: 1 }}>{order._id.slice(-8)}</Box>
                    <Box component="td" sx={{ p: 1 }}>{order.items.length} items</Box>
                    <Box component="td" sx={{ p: 1 }}>${order.total.toFixed(2)}</Box>
                    <Box component="td" sx={{ p: 1 }}>
                      <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                    </Box>
                    <Box component="td" sx={{ p: 1 }}>
                      <Box display="flex" gap={1}>
                        {user.role !== "admin" && order.status === "Pending" && (
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              background: "#1976d2",
                              color: "#fff",
                              "&:hover": { background: "#115293" },
                              transition: "all 0.3s",
                            }}
                            onClick={() => openPaymentDialog(order)}
                          >
                            Pay
                          </Button>
                        )}
                        {user.role === "admin" && order.status === "Paid" && (
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              background: "#2e7d32",
                              color: "#fff",
                              "&:hover": { background: "#1b4f1b" },
                              transition: "all 0.3s",
                            }}
                            onClick={() => handleFulfillOrder(order._id)}
                          >
                            Fulfill
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onClose={() => setShowOrderForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Place New Order</DialogTitle>
        <DialogContent>
          <OrderForm
            products={products}
            onSuccess={(newOrder) => {
              setShowOrderForm(false)
              fetchDashboardData()
              openPaymentDialog(newOrder)
            }}
            onCancel={() => setShowOrderForm(false)}
            preselectedProduct={selectedProductForOrder}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)}>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Payment Method"
            value={paymentData.method}
            onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePayOrder}>
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CustomerDashboard
