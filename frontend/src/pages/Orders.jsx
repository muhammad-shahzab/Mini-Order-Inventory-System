"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentData, setPaymentData] = useState({ amount: "", method: "Credit Card" })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders")
      setOrders(response.data.orders || [])
    } catch (err) {
      setError("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const handlePayOrder = async () => {
    try {
      await api.post(`/orders/${selectedOrder._id}/pay`, paymentData)
      setShowPaymentDialog(false)
      setSelectedOrder(null)
      setPaymentData({ amount: "", method: "Credit Card" })
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed")
    }
  }

  const handleFulfillOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/fulfill`)
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fulfill order")
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return
    try {
      await api.post(`/orders/${orderId}/cancel`)
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order")
    }
  }

  const openPaymentDialog = (order) => {
    setSelectedOrder(order)
    setPaymentData({ amount: order.total.toString(), method: "Credit Card" })
    setShowPaymentDialog(true)
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}>
        {orders.length === 0 ? (
          <Typography color="textSecondary">No orders found</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  {user.role === "admin" && <th>Customer</th>}
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>
                    {user.role === "admin" && <td>{order.customer?.name || "N/A"}</td>}
                    <td>
                      <Box>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.name} x{item.qty}
                          </div>
                        ))}
                      </Box>
                    </td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {/* User can pay pending orders */}
                        {user.role !== "admin" && order.status === "Pending" && (
                          <Button size="small" variant="contained" onClick={() => openPaymentDialog(order)}>
                            Pay
                          </Button>
                        )}
                        {/* Admin can fulfill paid orders */}
                        {user.role === "admin" && order.status === "Paid" && (
                          <Button size="small" variant="contained" onClick={() => handleFulfillOrder(order._id)}>
                            Fulfill
                          </Button>
                        )}
                        {/* Cancel available for pending or paid orders */}
                        {(order.status === "Pending" || order.status === "Paid") && (
                          <Button size="small" color="error" onClick={() => handleCancelOrder(order._id)}>
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

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
            inputProps={{ min: 0, step: 0.01 }}
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
          <Button onClick={handlePayOrder} variant="contained">
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Orders
