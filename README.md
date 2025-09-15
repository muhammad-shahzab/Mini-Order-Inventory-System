# Mini Order & Inventory System

A complete full-stack order and inventory management system built with React, Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with admin and customer roles
- **Product Management**: CRUD operations for products with stock tracking
- **Order Processing**: Complete order lifecycle from placement to fulfillment
- **Payment Processing**: Secure payment validation and processing
- **Inventory Management**: Real-time stock tracking with automatic updates
- **Reporting**: Comprehensive reports for sales, stock, and orders
- **Role-based Access**: Different interfaces for admin and customer users

## Technology Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend
- React 18 with Vite
- Material-UI (MUI) for components
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Testing
- Jest for unit testing
- Supertest for API testing
- MongoDB Memory Server for test database

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd order-inventory-system
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Edit .env with your MongoDB URI and JWT secret
   # MONGO_URI=mongodb://localhost:27017/order-inventory
   # JWT_SECRET=your-super-secret-jwt-key-here
   # PORT=5000
   \`\`\`

3. **Frontend Setup**
   \`\`\`bash
   cd ../frontend
   npm install
   \`\`\`

4. **Seed the Database**
   \`\`\`bash
   cd ../backend
   npm run seed
   \`\`\`

5. **Start the Applications**
   
   Backend (Terminal 1):
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`
   
   Frontend (Terminal 2):
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

The backend will run on http://localhost:5000 and the frontend on http://localhost:5173.

## Default Admin Credentials

After running the seed script, you can login with:
- **Email**: admin@example.com
- **Password**: Admin@123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List all products (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Customers
- `GET /api/customers` - List customers (admin only)
- `POST /api/customers` - Create customer (admin only)

### Orders
- `POST /api/orders` - Place order (authenticated)
- `GET /api/orders` - List orders (role-based access)
- `GET /api/orders/:id` - Get order details (role-based access)
- `POST /api/orders/:id/pay` - Pay for order (authenticated)
- `POST /api/orders/:id/fulfill` - Fulfill order (admin only)
- `POST /api/orders/:id/cancel` - Cancel order (authenticated)

### Reports
- `GET /api/reports/stock` - Stock report (admin only)
- `GET /api/reports/orders` - Orders report with filters (admin only)
- `GET /api/reports/sales-summary` - Sales summary (admin only)

## Testing

Run the backend tests:
\`\`\`bash
cd backend
npm test
\`\`\`

The test suite includes:
- Order placement with stock validation
- Payment processing with amount validation
- Order lifecycle testing (place → pay → fulfill)
- Stock restoration on order cancellation

## Business Rules

1. **Stock Management**: Stock is decremented immediately when orders are placed using MongoDB transactions
2. **Payment Validation**: Payments must exactly match order totals (no over/underpayments)
3. **Order Status Flow**: Pending → Paid → Fulfilled (or Pending → Cancelled)
4. **Role-based Access**: Admins can manage all data; customers can only view their own orders
5. **Stock Restoration**: Cancelled orders automatically restore stock quantities

## Project Structure

\`\`\`
/order-inventory-system
  /backend
    /src
      /controllers     # Business logic controllers
      /models         # Mongoose data models
      /routes         # Express route definitions
      /middlewares    # Authentication & validation middleware
      /utils          # Utility functions and validators
      server.js       # Express server setup
      seed.js         # Database seeding script
    /tests            # Jest test files
    package.json
    .env.example

  /frontend
    /src
      /pages          # React page components
      /components     # Reusable React components
      /services       # API service functions
      /context        # React context providers
      main.jsx        # React app entry point
      App.jsx         # Main app component
    package.json
    vite.config.js
\`\`\`

## Example API Usage

### Register a Customer
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
\`\`\`

### Place an Order
\`\`\`bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"customerId":"CUSTOMER_ID","items":[{"sku":"LAPTOP001","qty":1}]}'
\`\`\`

### Pay for an Order
\`\`\`bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount":1299.99,"method":"Credit Card"}'
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Notes

- This project was built with AI assistance for educational and demonstration purposes
- The system uses simplified payment processing for demo purposes
- In production, implement proper payment gateway integration
- Consider adding rate limiting, request logging, and enhanced security measures
- The frontend uses localStorage for token storage (consider httpOnly cookies for production)
