"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Paper, TextField, Button, Typography, Alert, Box } from "@mui/material"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await login(formData.email, formData.password)
      const userRole = response.data.user.role
      navigate(userRole === "admin" ? "/admin" : "/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
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
          Sign In
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
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
            autoComplete="current-password"
            value={formData.password}
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
              "&:hover": { background: "linear-gradient(90deg, #2575fc, #6a11cb)" },
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <Box textAlign="center" sx={{ mt: 3 }}>
            <Link to="/register" style={{ color: "#2575fc", fontWeight: 500, textDecoration: "none" }}>
              Don't have an account? Sign Up
            </Link>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center", border: "1px dashed #ccc" }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Demo Credentials:</strong><br/>
              Admin: admin@example.com / Admin@123<br/>
              Customer: Register a new account
            </Typography>
          </Box>
        </Box>
      </Paper>

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  )
}

export default Login
