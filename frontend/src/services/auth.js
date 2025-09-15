import api from "./api"

// authService handles login and registration API calls
export const authService = {
  // Login user
  login: (email, password) => {
    return api.post("/auth/login", { email, password })
  },

  // Register user with name, email, password, phone, and address
  register: ({ name, email, password, phone, address }) => {
    return api.post("/auth/register", { name, email, password, phone, address })
  },
}
