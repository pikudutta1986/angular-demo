import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.errorMessage = null;

    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Handle both single order and array of orders
          if (Array.isArray(response.data)) {
            this.orders = response.data;
          } else {
            this.orders = [response.data];
          }
          // Sort by date (newest first)
          this.orders.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        } else {
          this.errorMessage = response.message || 'Failed to load orders';
          this.orders = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading orders:', error);
        if (error.status === 401) {
          this.errorMessage = 'Please login to view your orders';
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.errorMessage = 'No orders found';
          this.orders = [];
        } else {
          this.errorMessage = error.error?.message || 'An error occurred while loading orders';
          this.orders = [];
        }
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'paid':
        return 'status-paid';
      case 'shipped':
        return 'status-shipped';
      default:
        return 'status-pending';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  viewOrderDetails(orderId: string) {
    // Navigate to order details if needed, or show modal
    console.log('View order details:', orderId);
  }
}

