import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  users: {
    total: number;
    admins: number;
    customers: number;
  };
  products: {
    total: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    shipped: number;
  };
  revenue: {
    total: number;
    byMonth: Array<{ month: string; revenue: number }>;
  };
  userGrowth: Array<{ day: string; users: number }>;
  blogs: {
    total: number;
  };
  recentOrders: any[];
  recentUsers: any[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = environment.apiBase;

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats; message: string }> {
    return this.http.get<{ success: boolean; data: DashboardStats; message: string }>(
      `${this.baseUrl}/admin/dashboard`
    ).pipe(
      timeout(30000) // 30 second timeout
    );
  }

  /**
   * Get all users with pagination
   */
  getUsers(page: number = 1, pageSize: number = 10, role?: string, search?: string): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (role) {
      params = params.set('role', role);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<User>>(`${this.baseUrl}/admin/users`, { params });
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<{ success: boolean; data: User; message: string }> {
    return this.http.get<{ success: boolean; data: User; message: string }>(
      `${this.baseUrl}/admin/users/${id}`
    );
  }

  /**
   * Update user
   */
  updateUser(id: number, userData: Partial<User> & { password?: string }): Observable<{ success: boolean; data: User; message: string }> {
    return this.http.put<{ success: boolean; data: User; message: string }>(
      `${this.baseUrl}/admin/users/${id}`,
      userData
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/admin/users/${id}`
    );
  }

  /**
   * Get all orders with pagination
   */
  getOrders(page: number = 1, pageSize: number = 10, status?: string, userId?: number): Observable<PaginatedResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    if (userId) {
      params = params.set('user_id', userId.toString());
    }

    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/admin/orders`, { params });
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: string): Observable<{ success: boolean; data: any; message: string }> {
    return this.http.put<{ success: boolean; data: any; message: string }>(
      `${this.baseUrl}/admin/orders/${orderId}/status`,
      { status }
    );
  }

  /**
   * Get all blogs with pagination
   */
  getBlogs(page: number = 1, pageSize: number = 10, category?: string, search?: string): Observable<PaginatedResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (category) {
      params = params.set('category', category);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/admin/blogs`, { params });
  }
}

