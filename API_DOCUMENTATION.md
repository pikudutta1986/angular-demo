# API Documentation

This document provides comprehensive documentation for all API endpoints in the Node Express MongoDB MySQL application.

## Base URL
```
http://localhost:{PORT}
```
Replace `{PORT}` with your server port (typically defined in `.env` file).

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

To obtain a token, use the login endpoint (`POST /api/auth/login`).

## User Roles

- **ADMIN**: Full access to all endpoints
- **CUSTOMER**: Limited access (can only view/update their own orders)

## Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Error
- `404` - Not Found
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)

## Error Response Format

```json
{
  "message": "Error description here"
}
```

---

# Authentication API

## Overview
Authentication endpoints handle user registration and login. User data is stored in MySQL database. Passwords are encrypted using bcrypt, and JWT tokens are generated upon successful login.

## Endpoints

### 1. Register User

Register a new user account.

**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Database:** MySQL

#### Request Body

```json
{
  "role": "CUSTOMER",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | Yes | User role: `ADMIN` or `CUSTOMER` (default: `CUSTOMER`) |
| name | string | Yes | User's full name |
| email | string | Yes | User's email address (must be unique) |
| password | string | Yes | User's password (will be hashed) |

#### Sample Request

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "CUSTOMER",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "role": "CUSTOMER",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "message": "User registered successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Registration failed: Email already exists"
}
```

---

### 2. Login User

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Database:** MySQL

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

#### Sample Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNjE2MjM5MDIyfQ.example",
  "user": {
    "id": 1,
    "role": "CUSTOMER",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "message": "Login successful"
}
```

#### Error Response (400)

```json
{
  "message": "Invalid email or password"
}
```

---

## Authentication Notes

- The JWT token should be included in the `Authorization` header for protected endpoints:
  ```
  Authorization: Bearer <your_jwt_token>
  ```
- Tokens typically expire after a set period (check your JWT configuration).
- Passwords are hashed using bcrypt with salt rounds of 10.
- Email addresses must be unique in the system.

---

# Product API

## Overview
Product endpoints manage product data stored in MySQL database. Products can be created, retrieved, updated, and deleted. Some operations require ADMIN role.

## Endpoints

### 1. Create Product

Create a new product. Only ADMIN users can create products.

**Endpoint:** `POST /api/product`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MySQL

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "Smartphone Pro Max",
  "code": "ELE-2001",
  "category": "Electronics",
  "price": 999,
  "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB",
  "description": "High-quality smartphone with advanced features and best-in-class performance.",
  "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| code | string | Yes | Unique product code |
| category | string | Yes | Product category: `Electronics`, `Fashion`, or `Living` |
| price | number | Yes | Product price (integer) |
| specification | string | Yes | Product specifications |
| description | string | Yes | Product description |
| images | string | Yes | Product images (pipe-separated URLs) |

#### Sample Request

```bash
curl -X POST http://localhost:3000/api/product \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone Pro Max",
    "code": "ELE-2001",
    "category": "Electronics",
    "price": 999,
    "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB",
    "description": "High-quality smartphone with advanced features.",
    "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "Smartphone Pro Max",
    "code": "ELE-2001",
    "category": "Electronics",
    "price": 999,
    "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB",
    "description": "High-quality smartphone with advanced features.",
    "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400",
    "created_at": "2025-01-15 10:30:00"
  },
  "message": "Product created successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Error message here"
}
```

---

### 2. Get All Products

Retrieve all products. This endpoint is publicly accessible.

**Endpoint:** `GET /api/product`  
**Access:** Public  
**Authentication:** Not required  
**Database:** MySQL

#### Sample Request

```bash
curl -X GET http://localhost:3000/api/product
```

#### Success Response (201)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Smartphone Pro Max",
      "code": "ELE-2001",
      "category": "Electronics",
      "price": 999,
      "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB",
      "description": "High-quality smartphone with advanced features.",
      "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400",
      "created_at": "2025-01-15 10:30:00"
    },
    {
      "id": 2,
      "name": "Classic Fashion T-Shirt",
      "code": "FAS-2002",
      "category": "Fashion",
      "price": 49,
      "specification": "Material: Cotton | Gender: Unisex | Country: India",
      "description": "Comfortable and stylish t-shirt.",
      "images": "https://picsum.photos/seed/shirt1/600/400",
      "created_at": "2025-01-15 11:00:00"
    }
  ],
  "message": "Products retrieved successfully"
}
```

---

### 3. Get Product by ID

Retrieve a specific product by its ID. This endpoint is publicly accessible.

**Endpoint:** `GET /api/product/:id`  
**Access:** Public  
**Authentication:** Not required  
**Database:** MySQL

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Product ID |

#### Sample Request

```bash
curl -X GET http://localhost:3000/api/product/1
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Smartphone Pro Max",
    "code": "ELE-2001",
    "category": "Electronics",
    "price": 999,
    "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB",
    "description": "High-quality smartphone with advanced features.",
    "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400",
    "created_at": "2025-01-15 10:30:00"
  },
  "message": "Product retrieved successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Product not found"
}
```

---

### 4. Update Product

Update an existing product. Only ADMIN users can update products.

**Endpoint:** `PUT /api/product/:id`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MySQL

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Product ID to update |

#### Request Body

```json
{
  "name": "Smartphone Pro Max Updated",
  "code": "ELE-2001",
  "category": "Electronics",
  "price": 899,
  "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB | Storage: 128GB",
  "description": "Updated description with new features.",
  "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400 | https://picsum.photos/seed/phone3/600/400"
}
```

#### Sample Request

```bash
curl -X PUT http://localhost:3000/api/product/1 \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone Pro Max Updated",
    "code": "ELE-2001",
    "category": "Electronics",
    "price": 899,
    "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB | Storage: 128GB",
    "description": "Updated description with new features.",
    "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Smartphone Pro Max Updated",
    "code": "ELE-2001",
    "category": "Electronics",
    "price": 899,
    "specification": "Resolution: 1080p | Screen: 6.5 inch | RAM: 8GB | Storage: 128GB",
    "description": "Updated description with new features.",
    "images": "https://picsum.photos/seed/phone1/600/400 | https://picsum.photos/seed/phone2/600/400",
    "created_at": "2025-01-15 10:30:00"
  },
  "message": "Product updated successfully"
}
```

---

### 5. Delete Product

Delete a product by ID. Only ADMIN users can delete products.

**Endpoint:** `DELETE /api/product/:id`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MySQL

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Product ID to delete |

#### Sample Request

```bash
curl -X DELETE http://localhost:3000/api/product/1 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Product not found"
}
```

---

## Product Notes

- Product categories are restricted to: `Electronics`, `Fashion`, `Living`
- Images should be pipe-separated (`|`) URLs
- Product codes should be unique
- Prices are stored as integers
- The `created_at` timestamp is automatically set when creating a product

---

# Blog API

## Overview
Blog endpoints manage blog posts stored in MongoDB. Blogs can be created, retrieved, updated, and deleted. Some operations require ADMIN role.

## Endpoints

### 1. Create Blog

Create a new blog post. Only ADMIN users can create blogs.

**Endpoint:** `POST /api/blog`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "title": "Getting Started with Node.js",
  "slug": "getting-started-with-nodejs",
  "image_url": "https://picsum.photos/seed/blog1/800/400",
  "tags": ["nodejs", "javascript", "backend"],
  "category": "Technology",
  "content": "Node.js is a powerful JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to build scalable network applications..."
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Blog post title |
| slug | string | Yes | URL-friendly unique identifier |
| image_url | string | Yes | Main image URL for the blog post |
| tags | array | Yes | Array of tag strings |
| category | string | Yes | Blog category |
| content | string | Yes | Blog post content (can be HTML/markdown) |

#### Sample Request

```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Node.js",
    "slug": "getting-started-with-nodejs",
    "image_url": "https://picsum.photos/seed/blog1/800/400",
    "tags": ["nodejs", "javascript", "backend"],
    "category": "Technology",
    "content": "Node.js is a powerful JavaScript runtime..."
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Getting Started with Node.js",
    "slug": "getting-started-with-nodejs",
    "image_url": "https://picsum.photos/seed/blog1/800/400",
    "tags": ["nodejs", "javascript", "backend"],
    "category": "Technology",
    "content": "Node.js is a powerful JavaScript runtime...",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Blog created successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Error message here"
}
```

---

### 2. Get All Blogs

Retrieve all blog posts. This endpoint is publicly accessible. Optionally filter by category using query parameter.

**Endpoint:** `GET /api/blog`  
**Access:** Public  
**Authentication:** Not required  
**Database:** MongoDB

#### Query Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter blogs by category |

#### Sample Request

```bash
# Get all blogs
curl -X GET http://localhost:3000/api/blog

# Get blogs by category
curl -X GET "http://localhost:3000/api/blog?category=Technology"
```

#### Success Response (201)

```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Getting Started with Node.js",
      "slug": "getting-started-with-nodejs",
      "image_url": "https://picsum.photos/seed/blog1/800/400",
      "tags": ["nodejs", "javascript", "backend"],
      "category": "Technology",
      "content": "Node.js is a powerful JavaScript runtime...",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Introduction to MongoDB",
      "slug": "introduction-to-mongodb",
      "image_url": "https://picsum.photos/seed/blog2/800/400",
      "tags": ["mongodb", "database", "nosql"],
      "category": "Database",
      "content": "MongoDB is a NoSQL database...",
      "createdAt": "2025-01-15T11:00:00.000Z",
      "updatedAt": "2025-01-15T11:00:00.000Z"
    }
  ],
  "message": "Blogs retrieved successfully"
}
```

---

### 3. Get Blog by ID

Retrieve a specific blog post by its ID. This endpoint is publicly accessible.

**Endpoint:** `GET /api/blog/:id`  
**Access:** Public  
**Authentication:** Not required  
**Database:** MongoDB

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB document ID (`_id`) |

#### Sample Request

```bash
curl -X GET http://localhost:3000/api/blog/65a1b2c3d4e5f6g7h8i9j0k1
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Getting Started with Node.js",
    "slug": "getting-started-with-nodejs",
    "image_url": "https://picsum.photos/seed/blog1/800/400",
    "tags": ["nodejs", "javascript", "backend"],
    "category": "Technology",
    "content": "Node.js is a powerful JavaScript runtime...",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Blog retrieved successfully"
}
```

#### Error Response (404)

```json
{
  "error": "BLOG NOT FOUND"
}
```

---

### 4. Update Blog

Update an existing blog post. Only ADMIN users can update blogs.

**Endpoint:** `PUT /api/blog/:id`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB document ID (`_id`) |

#### Request Body

```json
{
  "title": "Getting Started with Node.js - Updated",
  "slug": "getting-started-with-nodejs",
  "image_url": "https://picsum.photos/seed/blog1-updated/800/400",
  "tags": ["nodejs", "javascript", "backend", "tutorial"],
  "category": "Technology",
  "content": "Updated content with more details about Node.js..."
}
```

#### Sample Request

```bash
curl -X PUT http://localhost:3000/api/blog/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Node.js - Updated",
    "slug": "getting-started-with-nodejs",
    "image_url": "https://picsum.photos/seed/blog1-updated/800/400",
    "tags": ["nodejs", "javascript", "backend", "tutorial"],
    "category": "Technology",
    "content": "Updated content with more details..."
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Getting Started with Node.js - Updated",
    "slug": "getting-started-with-nodejs",
    "image_url": "https://picsum.photos/seed/blog1-updated/800/400",
    "tags": ["nodejs", "javascript", "backend", "tutorial"],
    "category": "Technology",
    "content": "Updated content with more details...",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  },
  "message": "Blog updated successfully"
}
```

---

### 5. Delete All Blogs

Delete all blog posts. Only ADMIN users can delete all blogs.

**Endpoint:** `DELETE /api/blog`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
```

#### Sample Request

```bash
curl -X DELETE http://localhost:3000/api/blog \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "All blogs deleted successfully"
}
```

---

### 6. Delete Blog by ID

Delete a specific blog post by its ID. Only ADMIN users can delete blogs.

**Endpoint:** `DELETE /api/blog/:id`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB document ID (`_id`) |

#### Sample Request

```bash
curl -X DELETE http://localhost:3000/api/blog/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Blog not found"
}
```

---

## Blog Notes

- Blog slugs must be unique
- MongoDB automatically adds `createdAt` and `updatedAt` timestamps
- The `_id` field is MongoDB's ObjectId (24-character hex string)
- Tags are stored as an array of strings
- Content can include HTML or markdown formatting

---

# Order API

## Overview
Order endpoints manage order data stored in MongoDB. All order endpoints require authentication. Orders contain product information and are linked to users. ADMIN users can view all orders, while CUSTOMER users can only view and update their own orders.

## Endpoints

### 1. Create Order

Create a new order. Authentication required.

**Endpoint:** `POST /api/orders`  
**Access:** Authenticated users  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "products": [
    {
      "product_id": 1,
      "name": "Smartphone Pro Max",
      "price": 999,
      "quantity": 2,
      "total": 1998
    },
    {
      "product_id": 5,
      "name": "Classic Fashion T-Shirt",
      "price": 49,
      "quantity": 3,
      "total": 147
    }
  ]
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| products | array | Yes | Array of product objects |
| products[].product_id | number | Yes | MySQL product ID |
| products[].name | string | Yes | Product name (cached at order time) |
| products[].price | number | Yes | Product price at order time |
| products[].quantity | number | Yes | Quantity ordered |
| products[].total | number | Yes | Total for this product (price × quantity) |

**Note:** The `user_id` is automatically extracted from the JWT token, and `orderTotal` is calculated automatically.

#### Sample Request

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "product_id": 1,
        "name": "Smartphone Pro Max",
        "price": 999,
        "quantity": 2,
        "total": 1998
      },
      {
        "product_id": 5,
        "name": "Classic Fashion T-Shirt",
        "price": 49,
        "quantity": 3,
        "total": 147
      }
    ]
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "user_id": 1,
    "products": [
      {
        "product_id": 1,
        "name": "Smartphone Pro Max",
        "price": 999,
        "quantity": 2,
        "total": 1998
      },
      {
        "product_id": 5,
        "name": "Classic Fashion T-Shirt",
        "price": 49,
        "quantity": 3,
        "total": 147
      }
    ],
    "orderTotal": 2145,
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Order created successfully"
}
```

#### Error Response (400)

```json
{
  "message": "No products found to create order"
}
```

---

### 2. Get All Orders

Retrieve all orders. ADMIN users see all orders, while CUSTOMER users only see their own orders.

**Endpoint:** `GET /api/orders`  
**Access:** Authenticated users  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
```

#### Sample Request

```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (201) - ADMIN User

```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "user_id": 1,
      "products": [
        {
          "product_id": 1,
          "name": "Smartphone Pro Max",
          "price": 999,
          "quantity": 2,
          "total": 1998
        }
      ],
      "orderTotal": 1998,
      "status": "pending",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "user_id": 2,
      "products": [
        {
          "product_id": 5,
          "name": "Classic Fashion T-Shirt",
          "price": 49,
          "quantity": 1,
          "total": 49
        }
      ],
      "orderTotal": 49,
      "status": "paid",
      "createdAt": "2025-01-15T11:00:00.000Z",
      "updatedAt": "2025-01-15T11:30:00.000Z"
    }
  ],
  "message": "Orders retrieved successfully"
}
```

#### Success Response (201) - CUSTOMER User

```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "user_id": 1,
      "products": [
        {
          "product_id": 1,
          "name": "Smartphone Pro Max",
          "price": 999,
          "quantity": 2,
          "total": 1998
        }
      ],
      "orderTotal": 1998,
      "status": "pending",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "message": "Orders retrieved successfully"
}
```

---

### 3. Get Order by ID

Retrieve a specific order by its ID. Authentication required.

**Endpoint:** `GET /api/orders/:id`  
**Access:** Authenticated users  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB document ID (`_id`) |

#### Sample Request

```bash
curl -X GET http://localhost:3000/api/orders/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "user_id": 1,
    "products": [
      {
        "product_id": 1,
        "name": "Smartphone Pro Max",
        "price": 999,
        "quantity": 2,
        "total": 1998
      },
      {
        "product_id": 5,
        "name": "Classic Fashion T-Shirt",
        "price": 49,
        "quantity": 3,
        "total": 147
      }
    ],
    "orderTotal": 2145,
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Order retrieved successfully"
}
```

#### Error Response (400)

```json
{
  "error": "Order id not found."
}
```

---

### 4. Update Order

Update an existing order. Only the order owner or ADMIN can update orders.

**Endpoint:** `PUT /api/orders/:id`  
**Access:** Order owner or ADMIN  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB document ID (`_id`) |

#### Request Body

```json
{
  "products": [
    {
      "product_id": 1,
      "name": "Smartphone Pro Max",
      "price": 999,
      "quantity": 3,
      "total": 2997
    }
  ],
  "status": "paid"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| products | array | No | Updated array of product objects |
| status | string | No | Order status: `pending`, `paid`, or `shipped` |

**Note:** At least one of `products` or `status` must be provided.

#### Sample Request

```bash
curl -X PUT http://localhost:3000/api/orders/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "user_id": 1,
    "products": [
      {
        "product_id": 1,
        "name": "Smartphone Pro Max",
        "price": 999,
        "quantity": 2,
        "total": 1998
      }
    ],
    "orderTotal": 1998,
    "status": "paid",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  },
  "message": "Order updated successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Nothing to update"
}
```

or

```json
{
  "message": "Order not found"
}
```

---

### 5. Delete Order

Delete an order by ID. Only ADMIN users can delete orders.

**Endpoint:** `DELETE /api/orders/:id`  
**Access:** ADMIN only  
**Authentication:** Required (JWT token)  
**Database:** MongoDB

#### Request Headers

```
Authorization: Bearer <your_jwt_token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB document ID (`_id`) |

#### Sample Request

```bash
curl -X DELETE http://localhost:3000/api/orders/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Order not found"
}
```

---

## Order Notes

- Order status can be: `pending`, `paid`, or `shipped` (default: `pending`)
- The `user_id` is automatically extracted from the JWT token when creating orders
- Product information (name, price) is cached at order time to preserve historical data
- `orderTotal` is automatically calculated from product totals
- MongoDB automatically adds `createdAt` and `updatedAt` timestamps
- CUSTOMER users can only view and update their own orders
- ADMIN users have full access to all orders
- The `_id` field is MongoDB's ObjectId (24-character hex string)

---

# Quick Start Guide

1. **Register a new user**: `POST /api/auth/register`
2. **Login to get JWT token**: `POST /api/auth/login`
3. **Use the token in subsequent requests**: Include `Authorization: Bearer <your_jwt_token>` header

All endpoints are now documented in this single comprehensive document.
