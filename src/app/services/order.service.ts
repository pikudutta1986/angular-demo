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

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentInfo {
  paymentMethod?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export interface Order {
  _id: string;
  user_id: number;
  products: OrderProduct[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  orderTotal: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  customerInfo?: CustomerInfo;
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialData {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  orderTotal: number;
}

export interface CreateOrderRequest {
  products: OrderProduct[];
  customerInfo?: CustomerInfo;
  shippingAddress?: ShippingAddress;
  paymentInfo?: PaymentInfo;
  financialData?: FinancialData;
}

export interface UpdateOrderRequest {
  products?: OrderProduct[];
  status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
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

