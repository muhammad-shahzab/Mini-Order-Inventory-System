"use client"

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems =
    user?.role === "admin"
      ? [
          { label: "Dashboard", path: "/admin" },
          { label: "Products", path: "/products" },
          { label: "Customers", path: "/customers" },
          { label: "Orders", path: "/orders" },
          { label: "Reports", path: "/reports" },
        ]
      : [
          { label: "Dashboard", path: "/dashboard" },
          { label: "Orders", path: "/orders" },
        ]

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "background 0.5s",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo / App Name */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: 1,
            cursor: "pointer",
            transition: "color 0.3s",
            "&:hover": { color: "#FFD700" }, // Gold color on hover
          }}
          onClick={() => navigate("/")}
        >
          Inventory System
        </Typography>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                transition: "all 0.3s",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  transform: "scale(1.05)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}

          {/* User Info */}
          {user && (
            <Typography
              variant="body2"
              sx={{
                ml: 3,
                fontWeight: 500,
                color: "#fff",
                transition: "color 0.3s",
                "&:hover": { color: "#FFD700" },
              }}
            >
              Welcome, {user.name}
            </Typography>
          )}

          {/* Logout */}
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              ml: 2,
              textTransform: "none",
              fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.5)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderColor: "#FFD700",
              },
              transition: "all 0.3s",
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
