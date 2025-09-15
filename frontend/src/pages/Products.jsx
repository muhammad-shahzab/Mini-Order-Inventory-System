"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Add } from "@mui/icons-material"
import api from "../services/api"
import ProductForm from "../components/ProductForm"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products")
      setProducts(response.data.products || [])
    } catch (error) {
      setError("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      await api.delete(`/products/${id}`)
      fetchProducts()
    } catch (error) {
      setError("Failed to delete product")
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, opacity: 0, animation: "fadeIn 0.6s forwards" }}>
          Products
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowForm(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
          Add Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, animation: "fadeIn 0.6s forwards" }}>{error}</Alert>}

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {products.length === 0 ? (
          <Typography color="textSecondary" sx={{ animation: "fadeIn 0.6s forwards" }}>
            No products found
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="product-row"
                  >
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.description || "N/A"}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span
                        className={`stock-badge ${product.stock === 0 ? "out" : product.stock < 5 ? "low" : "ok"}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="outlined" onClick={() => handleEdit(product)} sx={{ textTransform: "none", fontWeight: 500 }}>
                          Edit
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(product._id)} sx={{ textTransform: "none", fontWeight: 500 }}>
                          Delete
                        </Button>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

      <Dialog open={showForm} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <ProductForm product={editingProduct} onSuccess={handleFormClose} onCancel={handleFormClose} />
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .product-row {
          background: #fdfdfd;
          border-radius: 8px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.6s ease;
          opacity: 0;
          animation: fadeIn 0.5s forwards;
        }

        .product-row:nth-of-type(1) { animation-delay: 0s; }
        .product-row:nth-of-type(2) { animation-delay: 0.05s; }
        .product-row:nth-of-type(3) { animation-delay: 0.1s; }
        .product-row:nth-of-type(4) { animation-delay: 0.15s; }
        .product-row:nth-of-type(5) { animation-delay: 0.2s; }

        .product-row:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.08);
        }

        .stock-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .stock-badge.out { background: #FFE5E5; color: #D32F2F; }
        .stock-badge.low { background: #FFF4E5; color: #F57C00; }
        .stock-badge.ok { background: #E5FFEA; color: #2E7D32; }
      `}</style>
    </Container>
  )
}

export default Products
