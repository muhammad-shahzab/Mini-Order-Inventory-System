"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material"
import api from "../services/api"

const Reports = () => {
  const [stockReport, setStockReport] = useState(null)
  const [salesReport, setSalesReport] = useState(null)
  const [ordersReport, setOrdersReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dateFilters, setDateFilters] = useState({
    from: "",
    to: "",
    status: "",
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const [stockRes, salesRes, ordersRes] = await Promise.all([
        api.get("/reports/stock"),
        api.get("/reports/sales-summary"),
        api.get("/reports/orders"),
      ])

      setStockReport(stockRes.data.report)
      setSalesReport(salesRes.data.report)
      setOrdersReport(ordersRes.data.report)
    } catch (error) {
      setError("Failed to fetch reports")
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredOrdersReport = async () => {
    try {
      const params = new URLSearchParams()
      if (dateFilters.from) params.append("from", dateFilters.from)
      if (dateFilters.to) params.append("to", dateFilters.to)
      if (dateFilters.status) params.append("status", dateFilters.status)

      const response = await api.get(`/reports/orders?${params.toString()}`)
      setOrdersReport(response.data.report)
    } catch (error) {
      setError("Failed to fetch filtered orders report")
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
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sales Summary */}
        {salesReport && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={500}>
                Sales Summary
              </Typography>
              <Grid container spacing={3}>
                {[
                  { label: "Total Revenue", value: `$${salesReport.summary.totalRevenue.toFixed(2)}`, color: "primary" },
                  { label: "Total Orders", value: salesReport.summary.totalOrders, color: "info" },
                  { label: "Average Order Value", value: `$${salesReport.summary.averageOrderValue.toFixed(2)}`, color: "success" },
                ].map((card, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: 4,
                        transition: "transform 0.3s",
                        "&:hover": { transform: "translateY(-5px)" },
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {card.label}
                        </Typography>
                        <Typography variant="h4" color={`${card.color}.main`} fontWeight={600}>
                          {card.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {salesReport.topProducts.length > 0 && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom fontWeight={500}>
                    Top Products
                  </Typography>
                  <Box sx={{ overflowX: "auto", borderRadius: 2 }}>
                    <table className="table table-striped" style={{ minWidth: 600 }}>
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Name</th>
                          <th>Total Quantity</th>
                          <th>Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesReport.topProducts.map((product) => (
                          <tr key={product.sku}>
                            <td>{product.sku}</td>
                            <td>{product.name}</td>
                            <td>{product.totalQty}</td>
                            <td>${product.totalRevenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Stock Report */}
        {stockReport && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={500}>
                Stock Report
              </Typography>
              <Grid container spacing={3} mb={3}>
                {[
                  { label: "Total Products", value: stockReport.totalProducts },
                  { label: "Low Stock Items", value: stockReport.lowStockCount, color: "warning" },
                  { label: "Out of Stock", value: stockReport.outOfStockCount, color: "error" },
                ].map((card, index) => (
                  <Grid item xs={12} sm={3} key={index}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: 4,
                        transition: "transform 0.3s",
                        "&:hover": { transform: "translateY(-5px)" },
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {card.label}
                        </Typography>
                        <Typography variant="h4" color={card.color ? `${card.color}.main` : "textPrimary"} fontWeight={600}>
                          {card.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {stockReport.lowStockProducts.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="warning.main" fontWeight={500}>
                    Low Stock Alert
                  </Typography>
                  <Box sx={{ overflowX: "auto", borderRadius: 2 }}>
                    <table className="table table-striped" style={{ minWidth: 600 }}>
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Name</th>
                          <th>Current Stock</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockReport.lowStockProducts.map((product) => (
                          <tr key={product._id}>
                            <td>{product.sku}</td>
                            <td>{product.name}</td>
                            <td>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {product.stock}
                              </span>
                            </td>
                            <td>${product.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Orders Report */}
        {ordersReport && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={500}>
                Orders Report
              </Typography>

              {/* Filters */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <TextField
                  label="From Date"
                  type="date"
                  value={dateFilters.from}
                  onChange={(e) => setDateFilters({ ...dateFilters, from: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  label="To Date"
                  type="date"
                  value={dateFilters.to}
                  onChange={(e) => setDateFilters({ ...dateFilters, to: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ borderRadius: 2 }}
                />
                <TextField
                  select
                  value={dateFilters.status}
                  onChange={(e) => setDateFilters({ ...dateFilters, status: e.target.value })}
                  SelectProps={{ native: true }}
                  sx={{ minWidth: 140, borderRadius: 2 }}
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Cancelled">Cancelled</option>
                </TextField>
                <Button variant="contained" onClick={fetchFilteredOrdersReport} sx={{ borderRadius: 2 }}>
                  Apply Filters
                </Button>
              </Box>

              <Grid container spacing={2} mb={2}>
                {[
                  { label: "Total", value: ordersReport.summary.totalOrders },
                  { label: "Pending", value: ordersReport.summary.pendingOrders, color: "warning" },
                  { label: "Paid", value: ordersReport.summary.paidOrders, color: "info" },
                  { label: "Fulfilled", value: ordersReport.summary.fulfilledOrders, color: "success" },
                  { label: "Cancelled", value: ordersReport.summary.cancelledOrders, color: "error" },
                  { label: "Total Value", value: `$${ordersReport.summary.totalValue.toFixed(2)}` },
                ].map((card, index) => (
                  <Grid item xs={6} sm={2} key={index}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: 4,
                        transition: "transform 0.3s",
                        "&:hover": { transform: "translateY(-5px)" },
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          {card.label}
                        </Typography>
                        <Typography variant="h5" color={card.color ? `${card.color}.main` : "textPrimary"} fontWeight={600}>
                          {card.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

export default Reports
