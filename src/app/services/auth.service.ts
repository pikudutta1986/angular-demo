import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  role?: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface User {
  id: number;
  role: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user?: User;
  data?: User;  // Backend returns 'data' instead of 'user'
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBase;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if token exists in storage on service initialization
    this.checkTokenValidity();
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    const payload = {
      role: data.role || 'CUSTOMER',
      name: data.name,
      email: data.email,
      password: data.password
    };

    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  /**
   * Login user and store token
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
          // Handle both 'user' and 'data' response formats
          const user = response.data || response.user;
          if (user) {
            this.setUser(user);
            this.currentUserSubject.next(user);
          }
        }
      })
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/auth/reset-password`, { token, password });
  }

  /**
   * Logout user
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if we're in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Get JWT token from storage
   */
  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Set JWT token in storage
   */
  private setToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Remove JWT token from storage
   */
  private removeToken(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser()) return null;
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set user in storage
   */
  private setUser(user: User): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  /**
   * Remove user from storage
   */
  private removeUser(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('user');
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  /**
   * Check if user is customer
   */
  isCustomer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'CUSTOMER';
  }

  /**
   * Check token validity (basic check - token exists)
   */
  private checkTokenValidity(): void {
    const token = this.getToken();
    if (!token) {
      this.logout();
    }
  }
}

