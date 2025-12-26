# API Endpoints Documentation - Angular Project

This document provides comprehensive documentation for all API endpoints used in the Angular application.

## Base URL Configuration

The API base URL is configured in the environment files:

- **Development**: `http://148.135.138.159:5000/api`
- **Production**: `http://148.135.138.159:5000/api`

The base URL is accessed via `environment.apiBase` in services.

## Service Architecture

All API calls are made through Angular services located in `src/app/services/`:
- `ProductService` - Handles product-related API calls
- `BlogService` - Handles blog-related API calls
- `AuthService` - Handles authentication API calls (currently empty)
- `CartService` - Handles cart-related API calls (currently empty)
- `OrderService` - Handles order-related API calls (currently empty)

---

# Product API Endpoints

## Service: `ProductService`
**Location**: `src/app/services/product.service.ts`

### 1. Get All Products

Retrieve all products with optional filtering, pagination, and sorting.

**Endpoint**: `GET /api/product`  
**Service Method**: `getProducts(params?)`  
**Access**: Public  
**Authentication**: Not required

#### Method Signature
```typescript
getProducts(params?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
}): Observable<ProductApiResponse>
```

#### Query Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter products by category (`Electronics`, `Fashion`, `Living`) |
| minPrice | number | Minimum price filter |
| maxPrice | number | Maximum price filter |
| page | number | Page number for pagination (starts from 1) |
| pageSize | number | Number of items per page |
| sort | string | Sort order (e.g., `price:asc`, `price:desc`) |

#### Usage Example
```typescript
// Get all products
this.productService.getProducts().subscribe(response => {
  console.log(response.data);
});

// Get products with filters
this.productService.getProducts({
  category: 'Electronics',
  minPrice: 100,
  maxPrice: 1000,
  page: 1,
  pageSize: 10,
  sort: 'price:asc'
}).subscribe(response => {
  console.log(response.data);
});
```

#### Response Type: `ProductApiResponse`
```typescript
interface ProductApiResponse {
  success: boolean;
  data: ProductDto[];
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}
```

#### Product DTO
```typescript
interface ProductDto {
  id: number;
  name: string;
  code: string;
  category: string;
  price: number;
  specification: string;
  description: string;
  images: string;  // Pipe-separated URLs: "url1 | url2 | url3"
  created_at: string;
}
```

#### Sample Response
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
    }
  ],
  "message": "Products retrieved successfully",
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

---

### 2. Get Product by ID

Retrieve a specific product by its ID.

**Endpoint**: `GET /api/product/:id`  
**Service Method**: `getProductById(id: number)`  
**Access**: Public  
**Authentication**: Not required

#### Method Signature
```typescript
getProductById(id: number): Observable<{
  success: boolean;
  data: ProductDto;
  message?: string;
  error?: string;
}>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Product ID |

#### Usage Example
```typescript
this.productService.getProductById(1).subscribe({
  next: (response) => {
    if (response.success) {
      console.log('Product:', response.data);
    }
  },
  error: (error) => {
    console.error('Error:', error);
  }
});
```

#### Sample Response (Success)
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

#### Sample Response (Error)
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

# Blog API Endpoints

## Service: `BlogService`
**Location**: `src/app/services/blog.service.ts`

### 1. Get All Blogs

Retrieve all blog posts.

**Endpoint**: `GET /api/blog`  
**Service Method**: `getBlogs()`  
**Access**: Public  
**Authentication**: Not required

#### Method Signature
```typescript
getBlogs(): Observable<BlogApiResponse>
```

#### Usage Example
```typescript
this.blogService.getBlogs().subscribe({
  next: (response) => {
    if (response.success) {
      console.log('Blogs:', response.data);
    }
  },
  error: (error) => {
    console.error('Error fetching blogs:', error);
  }
});
```

#### Response Type: `BlogApiResponse`
```typescript
interface BlogApiResponse {
  success: boolean;
  data: BlogPostDto[];
  message?: string;
}
```

#### Blog Post DTO
```typescript
interface BlogPostDto {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  tags: string[];
  category: string;
}
```

#### Sample Response
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
    }
  ],
  "message": "Blogs retrieved successfully"
}
```

---

### 2. Get Blog by ID

Retrieve a specific blog post by its MongoDB ID.

**Endpoint**: `GET /api/blog/:id`  
**Service Method**: `getBlogById(id: string)`  
**Access**: Public  
**Authentication**: Not required

#### Method Signature
```typescript
getBlogById(id: string): Observable<{
  success: boolean;
  data: BlogPostDto;
  message?: string;
}>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB document ID (`_id`) - 24-character hex string |

#### Usage Example
```typescript
const blogId = '65a1b2c3d4e5f6g7h8i9j0k1';
this.blogService.getBlogById(blogId).subscribe({
  next: (response) => {
    if (response.success) {
      console.log('Blog:', response.data);
    }
  },
  error: (error) => {
    console.error('Error fetching blog:', error);
  }
});
```

#### Sample Response (Success)
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
    "content": "Node.js is a powerful JavaScript runtime built on Chrome's V8 JavaScript engine...",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Blog retrieved successfully"
}
```

#### Sample Response (Error)
```json
{
  "error": "BLOG NOT FOUND"
}
```

---

# Authentication API Endpoints

## Service: `AuthService`
**Location**: `src/app/services/auth.service.ts`

**Status**: Service file exists but is currently empty. No endpoints are implemented yet.

**Expected Endpoints** (based on backend API):
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

---

# Cart API Endpoints

## Service: `CartService`
**Location**: `src/app/services/cart.service.ts`

**Status**: Service file exists but is currently empty. No endpoints are implemented yet.

**Expected Endpoints** (based on backend API):
- Cart operations are typically handled client-side or through order endpoints

---

# Order API Endpoints

## Service: `OrderService`
**Location**: `src/app/services/order.service.ts`

**Status**: Service file exists but is currently empty. No endpoints are implemented yet.

**Expected Endpoints** (based on backend API):
- `POST /api/orders` - Create a new order (requires authentication)
- `GET /api/orders` - Get all orders (requires authentication, filtered by user role)
- `GET /api/orders/:id` - Get order by ID (requires authentication)
- `PUT /api/orders/:id` - Update order (requires authentication)
- `DELETE /api/orders/:id` - Delete order (ADMIN only)

---

# Error Handling

All services use RxJS Observables. It's recommended to handle errors in the component:

```typescript
this.productService.getProducts().subscribe({
  next: (response) => {
    if (response.success) {
      // Handle success
    } else {
      // Handle API error response
      console.error(response.message);
    }
  },
  error: (error) => {
    // Handle HTTP error (network, 500, etc.)
    console.error('HTTP Error:', error);
  }
});
```

---

# HTTP Client Configuration

The Angular application uses `HttpClient` from `@angular/common/http`, which is provided in `app.config.ts`:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()
  ]
};
```

---

# Authentication Headers

For endpoints that require authentication, you'll need to add the JWT token to the request headers. This is typically done using an HTTP interceptor. Example:

```typescript
// HTTP Interceptor example (not currently implemented)
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next.handle(req);
}
```

---

# Notes

1. **Image URLs**: Product images are stored as pipe-separated (`|`) URLs in a single string. You'll need to split them:
   ```typescript
   const imageUrls = product.images.split(' | ');
   ```

2. **MongoDB IDs**: Blog IDs are MongoDB ObjectIds (24-character hex strings), not numeric IDs.

3. **Pagination**: The product API supports pagination, but the blog API does not currently support it in the Angular service.

4. **Error Responses**: Different endpoints may return errors in different formats:
   - Some return `{ message: "error" }`
   - Some return `{ error: "error" }`
   - Some return `{ success: false, error: "error" }`

5. **Base URL**: The base URL is configured in environment files and should be updated for different environments (development, staging, production).

---

# Quick Reference

## Currently Implemented Endpoints

| Method | Endpoint | Service | Status |
|--------|----------|---------|--------|
| GET | `/api/product` | ProductService | ✅ Implemented |
| GET | `/api/product/:id` | ProductService | ✅ Implemented |
| GET | `/api/blog` | BlogService | ✅ Implemented |
| GET | `/api/blog/:id` | BlogService | ✅ Implemented |

## Not Yet Implemented

| Method | Endpoint | Service | Status |
|--------|----------|---------|--------|
| POST | `/api/auth/register` | AuthService | ⚠️ Not implemented |
| POST | `/api/auth/login` | AuthService | ⚠️ Not implemented |
| POST | `/api/orders` | OrderService | ⚠️ Not implemented |
| GET | `/api/orders` | OrderService | ⚠️ Not implemented |
| GET | `/api/orders/:id` | OrderService | ⚠️ Not implemented |
| PUT | `/api/orders/:id` | OrderService | ⚠️ Not implemented |
| DELETE | `/api/orders/:id` | OrderService | ⚠️ Not implemented |

---

# Related Documentation

For complete backend API documentation, see `API_DOCUMENTATION.md` in the project root, which documents all available backend endpoints including authentication, products, blogs, and orders.

