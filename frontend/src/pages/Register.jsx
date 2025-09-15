"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Container, Paper, TextField, Button, Typography, Alert, Box } from "@mui/material"
import { useAuth } from "../context/AuthContext"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",      // Added
    address: "",    // Added
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // Send all fields including phone & address
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || "N/A",
        address: formData.address || "N/A",
      })
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 6,
          maxWidth: 400,
          width: "100%",
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          animation: "fadeInUp 0.6s ease-in-out",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, animation: "fadeIn 0.5s" }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="address"
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.5,
              fontWeight: 600,
              background: "linear-gradient(90deg, #6a11cb, #2575fc)",
              "&:hover": {
                background: "linear-gradient(90deg, #2575fc, #6a11cb)",
              },
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          <Box textAlign="center" sx={{ mt: 2 }}>
            <Link to="/login" style={{ color: "#2575fc", fontWeight: 500, textDecoration: "none" }}>
              Already have an account? Sign In
            </Link>
          </Box>
        </Box>
      </Paper>

      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  )
}

export default Register
