"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Header from "./components/Header"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/AdminDashboard"
import CustomerDashboard from "./pages/CustomerDashboard"
import Products from "./pages/Products"
import Customers from "./pages/Customers"
import Orders from "./pages/Orders"
import Reports from "./pages/Reports"
import PrivateRoute from "./components/PrivateRoute"
import AdminOnly from "./components/AdminOnly"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} /> : <Login />}
        />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminOnly>
              <AdminDashboard />
            </AdminOnly>
          }
        />

        <Route
          path="/products"
          element={
            <AdminOnly>
              <Products />
            </AdminOnly>
          }
        />

        <Route
          path="/customers"
          element={
            <AdminOnly>
              <Customers />
            </AdminOnly>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <AdminOnly>
              <Reports />
            </AdminOnly>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  )
}

export default App
