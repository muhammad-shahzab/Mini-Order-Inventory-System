"use client"

import { useState, useEffect } from "react"
import { Container, Typography, Paper, Box, Alert, CircularProgress } from "@mui/material"
import api from "../services/api"

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers")
      setCustomers(response.data.customers || [])
    } catch (error) {
      setError("Failed to fetch customers")
    } finally {
      setLoading(false)
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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, mb: 3, animation: "fadeInUp 0.6s" }}
      >
        Customers
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, animation: "fadeIn 0.5s" }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
          animation: "fadeInUp 0.6s",
        }}
      >
        {customers.length === 0 ? (
          <Typography color="textSecondary">No customers found</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr
                    key={customer._id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                      transition: "background-color 0.3s",
                    }}
                  >
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "N/A"}</td>
                    <td>{customer.address || "N/A"}</td>
                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

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
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th,
        .table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .table th {
          background-color: #f0f0f0;
        }
        .table tr:hover {
          background-color: #e8f4ff;
        }
      `}</style>
    </Container>
  )
}

export default Customers
