import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface OrderProduct {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  _id: string;
  user_id: number;
  products: OrderProduct[];
  orderTotal: number;
  status: 'pending' | 'paid' | 'shipped';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  products: OrderProduct[];
}

export interface UpdateOrderRequest {
  products?: OrderProduct[];
  status?: 'pending' | 'paid' | 'shipped';
}

export interface OrderApiResponse {
  success: boolean;
  data: Order | Order[];
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = environment.apiBase;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Create a new order
   */
  createOrder(orderData: CreateOrderRequest): Observable<OrderApiResponse> {
    return this.http.post<OrderApiResponse>(`${this.baseUrl}/orders`, orderData);
  }

  /**
   * Get all orders
   * ADMIN users see all orders, CUSTOMER users see only their own orders
   */
  getOrders(): Observable<OrderApiResponse> {
    return this.http.get<OrderApiResponse>(`${this.baseUrl}/orders`);
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<OrderApiResponse> {
    return this.http.get<OrderApiResponse>(`${this.baseUrl}/orders/${id}`);
  }

  /**
   * Update an order
   * Only the order owner or ADMIN can update orders
   */
  updateOrder(id: string, updateData: UpdateOrderRequest): Observable<OrderApiResponse> {
    return this.http.put<OrderApiResponse>(`${this.baseUrl}/orders/${id}`, updateData);
  }

  /**
   * Delete an order
   * Only ADMIN users can delete orders
   */
  deleteOrder(id: string): Observable<OrderApiResponse> {
    return this.http.delete<OrderApiResponse>(`${this.baseUrl}/orders/${id}`);
  }

  /**
   * Calculate total from products array
   */
  calculateTotal(products: OrderProduct[]): number {
    return products.reduce((total, product) => total + product.total, 0);
  }
}

