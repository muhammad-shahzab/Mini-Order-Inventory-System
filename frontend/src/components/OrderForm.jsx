"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { Add, Remove, Delete } from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"

const OrderForm = ({ products, onSuccess, onCancel, preselectedProduct = null }) => {
  const { user } = useAuth()
  const [customer, setCustomer] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCustomer()
  }, [])

  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProduct(preselectedProduct._id)
      setQuantity(1)
    }
  }, [preselectedProduct])

  const fetchCustomer = async () => {
    try {
      const response = await api.get("/customers/me")
      setCustomer(response.data.customer)
    } catch (error) {
      console.error("Error fetching customer:", error)
      setError("Failed to fetch customer information")
    }
  }

  const addItem = () => {
    if (!selectedProduct) return
    const product = products.find((p) => p._id === selectedProduct)
    if (!product) return

    if (quantity > product.stock) {
      setError(`Cannot add more than available stock (${product.stock})`)
      return
    }

    const existingIndex = orderItems.findIndex((item) => item.sku === product.sku)
    if (existingIndex >= 0) {
      const updatedItems = [...orderItems]
      const newQty = updatedItems[existingIndex].qty + quantity
      if (newQty > product.stock) {
        setError(`Insufficient stock for ${product.name}. Max available: ${product.stock}`)
        return
      }
      updatedItems[existingIndex].qty = newQty
      updatedItems[existingIndex].lineTotal = newQty * product.price
      setOrderItems(updatedItems)
    } else {
      setOrderItems([
        ...orderItems,
        {
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty: quantity,
          lineTotal: product.price * quantity,
          maxStock: product.stock,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity(1)
    setError("")
  }

  const updateQuantity = (index, newQty) => {
    if (newQty < 1) return
    const updatedItems = [...orderItems]
    if (newQty > updatedItems[index].maxStock) {
      setError(`Cannot exceed stock of ${updatedItems[index].maxStock}`)
      return
    }
    updatedItems[index].qty = newQty
    updatedItems[index].lineTotal = updatedItems[index].price * newQty
    setOrderItems(updatedItems)
    setError("")
  }

  const removeItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index))
  const calculateTotal = () => orderItems.reduce((sum, item) => sum + item.lineTotal, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!customer) return setError("Customer information not found")
    if (orderItems.length === 0) return setError("Please add at least one item to the order")

    for (const item of orderItems) {
      if (item.qty > item.maxStock) {
        setError(`Insufficient stock for ${item.name}. Available: ${item.maxStock}`)
        return
      }
    }

    setLoading(true)
    try {
      await api.post("/orders", {
        items: orderItems.map((item) => ({ sku: item.sku, qty: item.qty })),
      })
      onSuccess()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {error}
        </Alert>
      )}

      {/* Add Item Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          },
          background: "#fff",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Add Items
        </Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Select Product</InputLabel>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              label="Select Product"
            >
              {products
                .filter((p) => p.stock > 0)
                .map((product) => (
                  <MenuItem
                    key={product._id}
                    value={product._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                    }}
                  >
                    {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            sx={{ width: 100 }}
          />

          <Button
            variant="contained"
            onClick={addItem}
            disabled={!selectedProduct}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              background: "linear-gradient(90deg, #6a11cb, #2575fc)",
              "&:hover": { background: "linear-gradient(90deg, #2575fc, #6a11cb)" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            <Add /> Add Item
          </Button>
        </Box>
      </Box>

      {/* Order Items Table */}
      {orderItems.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Line Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": { bgcolor: "rgba(37,117,252,0.05)" },
                    transition: "background 0.3s",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      SKU: {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(index, item.qty - 1)}
                        disabled={item.qty <= 1}
                        sx={{
                          bgcolor: "grey.100",
                          "&:hover": { bgcolor: "grey.200" },
                        }}
                      >
                        <Remove />
                      </IconButton>
                      <Typography>{item.qty}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(index, item.qty + 1)}
                        disabled={item.qty >= item.maxStock}
                        sx={{
                          bgcolor: "grey.100",
                          "&:hover": { bgcolor: "grey.200" },
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>${item.lineTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => removeItem(index)}
                      sx={{
                        bgcolor: "grey.100",
                        "&:hover": { bgcolor: "rgba(255,0,0,0.1)" },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            bgcolor: "grey.50",
            boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Order Total: ${calculateTotal().toFixed(2)}</Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          onClick={onCancel}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#555",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || orderItems.length === 0}
          sx={{
            background: "linear-gradient(90deg, #6a11cb, #2575fc)",
            "&:hover": { background: "linear-gradient(90deg, #2575fc, #6a11cb)" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </Button>
      </Box>
    </Box>
  )
}

export default OrderForm
