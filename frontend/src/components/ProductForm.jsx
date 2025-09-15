"use client"

import { useState, useEffect } from "react"
import { Box, TextField, Button, Alert } from "@mui/material"
import api from "../services/api"

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    stock: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
      })
    }
  }, [product])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
      }

      if (product) {
        await api.put(`/products/${product._id}`, data)
      } else {
        await api.post("/products", data)
      }

      onSuccess()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        margin="normal"
        name="sku"
        label="SKU"
        value={formData.sku}
        onChange={handleChange}
        required
        disabled={!!product} // SKU cannot be changed when editing
      />

      <TextField
        fullWidth
        margin="normal"
        name="name"
        label="Product Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <TextField
        fullWidth
        margin="normal"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        multiline
        rows={3}
      />

      <TextField
        fullWidth
        margin="normal"
        name="price"
        label="Price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        required
        inputProps={{ min: 0, step: 0.01 }}
      />

      <TextField
        fullWidth
        margin="normal"
        name="stock"
        label="Stock"
        type="number"
        value={formData.stock}
        onChange={handleChange}
        required
        inputProps={{ min: 0 }}
      />

      <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Saving..." : product ? "Update" : "Create"}
        </Button>
      </Box>
    </Box>
  )
}

export default ProductForm
