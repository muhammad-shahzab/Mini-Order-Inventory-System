# Mini Order & Inventory System

A small application for a trading company to manage **products, customers, and orders** with persistent storage and reporting functionality.

---

## **Table of Contents**

1. [Problem Solved](#problem-solved)
2. [Tools & Approach](#tools--approach)
3. [Setup & Installation](#setup--installation)
4. [Seed the Database](#seed-the-database)
5. [Admin & Customer Login](#admin--customer-login)
6. [API Documentation](#api-documentation)
7. [How to Test APIs](#how-to-test-apis)
8. [Notes](#notes)

---

## **Problem Solved**

This system manages inventory, orders, and customer information for a trading company.

Key features include:

* Manage products with **unique SKUs**
* Manage customers with **unique emails**
* Place orders with **stock validation**
* Validate **payments** to exactly match total order amount
* Track **order status**: Pending → Paid → Fulfilled / Cancelled
* Generate reports: **stock, orders, sales summary**

---

## **Tools & Approach**

**Frontend:**

* React.js
* Material UI & Tailwind CSS
* React Router for page navigation

**Backend:**

* Node.js with Express.js
* MongoDB for persistent storage
* Mongoose for object modeling
* JWT for authentication

**Approach:**

* Backend exposes REST APIs for products, customers, orders, and reports
* Frontend communicates with APIs and provides forms for CRUD operations
* Validations ensure **data integrity**, including unique identifiers, stock availability, and payment correctness

**AI Tools Used:**

* ChatGPT (OpenAI) – for code generation, debugging, and API documentation
* vO (vercel) – for frontend deveopment

---

## **Setup & Installation**

### 1. Clone Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Backend Setup

```bash
cd backend
npm install
```

* Create `.env` in `backend/`:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secret_key>
PORT=5000
```

* Start backend server:

```bash
npm run dev
```

> Backend runs at `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

> Frontend runs at `http://localhost:3000`

---

## **Seed the Database**

Before testing, populate the database with default data (products, customers, admin user):

```bash
cd backend
node seedDB.js
```

> This will create initial admin, customers, and sample products.

---

## **Admin & Customer Login**

* **Admin login:**

  * Email: `admin@example.com` (from `seedDB.js`)
  * Role: `admin`
  * Can access all APIs including product, customer, order management, and reports.

* **Customer login:**

  * Email: any seeded customer email (or created via register)
  * Role: `customer`
  * Can view products, place orders, and view their own order history.

---

## **API Documentation**

### **Base URL**

```
http://localhost:5000/api
```

---

### **Authentication APIs**

#### 1. Register User

```
POST /auth/register
```

**Request Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Response**

```json
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "<user_id>",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "role": "customer"
  }
}
```

---

#### 2. Login User

```
POST /auth/login
```

**Request Body**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**

```json
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "<user_id>",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### **Customer APIs** (Protected – requires JWT token)

| Endpoint         | Method | Description                 |
| ---------------- | ------ | --------------------------- |
| `/customers`     | GET    | Get all customers           |
| `/customers/:id` | GET    | Get a single customer by ID |
| `/customers/:id` | PUT    | Update customer details     |
| `/customers/:id` | DELETE | Delete a customer           |

---

### **Product APIs** (Protected – requires JWT token)

| Endpoint        | Method | Description            |
| --------------- | ------ | ---------------------- |
| `/products`     | GET    | Get all products       |
| `/products`     | POST   | Add new product        |
| `/products/:id` | PUT    | Update product details |
| `/products/:id` | DELETE | Delete a product       |

**Add Product Example**

```json
{
  "name": "Laptop",
  "sku": "LP1001",
  "price": 1000,
  "stock": 50
}
```

---

### **Order APIs** (Protected – requires JWT token)

| Endpoint      | Method | Description         |
| ------------- | ------ | ------------------- |
| `/orders`     | GET    | Get all orders      |
| `/orders`     | POST   | Create new order    |
| `/orders/:id` | PUT    | Update order status |

**Create Order Example**

```json
{
  "customerId": "<customer_id>",
  "items": [
    { "productId": "<product_id>", "quantity": 2 }
  ],
  "payment": 2000
}
```

**Update Order Status Example**

```json
{
  "status": "Paid"
}
```

---

### **Reports APIs** (Protected – requires JWT token)

| Endpoint                 | Method | Description              |
| ------------------------ | ------ | ------------------------ |
| `/reports/stock`         | GET    | Get stock report         |
| `/reports/orders`        | GET    | Get orders report        |
| `/reports/sales-summary` | GET    | Get sales summary report |

---

## **How to Test APIs**

1. Use **Postman** or **Insomnia**.
2. Base URL: `http://localhost:5000/api`.
3. Include JWT token in headers for protected routes:

```
Authorization: Bearer <JWT_TOKEN>
```

4. You can also test via the **frontend app**, which automatically handles token storage and API requests.

---

## **Notes**

* MongoDB must be running locally or remotely.
* Products must have **unique SKUs**.
* Customers must have **unique emails**.
* Orders cannot exceed stock.
* Payment amount must match total order value.
* Order status lifecycle:

```
Pending → Paid → Fulfilled
Pending → Cancelled
```

* Admin user can access **all CRUD operations** and reports.
* Customer user can place orders and view their orders only.
* Run `seedDB.js` **before first use** to populate default data.

---

This README provides all instructions, API details, admin/customer login information, and testing guidelines for your Mini Order & Inventory System.
