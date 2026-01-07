import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, Order, OrderProduct } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currencySymbol = '$';
  selectedOrder: Order | null = null;
  showDetailsModal = false;
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load settings
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        if (Object.keys(settings).length > 0) {
          this.currencySymbol = this.settingsService.getCurrencySymbol();
        }
      });

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders() {
    this.isLoading = true;
    this.errorMessage = null;

    this.orderService.getOrders().subscribe({
      next: (response) => {
        try {
          console.log('📦 Orders API Response:', response); // Debug log
          console.log('📦 Response type:', typeof response);
          console.log('📦 Is array:', Array.isArray(response));
          console.log('📦 Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');
          
          // Handle different response formats - simplified approach like admin component
          let ordersData: Order[] = [];
          
          // Type assertion to handle different response formats
          const responseAny = response as any;
          
          if (response) {
            // Case 1: Response is directly an array
            if (Array.isArray(response)) {
              ordersData = response;
              console.log('📦 Response is array, length:', ordersData.length);
            }
            // Case 2: Response has data property (check this regardless of success flag)
            else if (response.data !== undefined && response.data !== null) {
              if (Array.isArray(response.data)) {
                ordersData = response.data;
                console.log('📦 Response.data is array, length:', ordersData.length);
              } else if (response.data && typeof response.data === 'object') {
                // Single order object
                ordersData = [response.data];
                console.log('📦 Response.data is single object');
              }
            }
            // Case 3: Response has orders property (using type assertion)
            else if (responseAny.orders && Array.isArray(responseAny.orders)) {
              ordersData = responseAny.orders;
              console.log('📦 Response.orders is array, length:', ordersData.length);
            }
            
            // Log success status if present
            if ('success' in response) {
              console.log('📦 Response.success:', response.success);
            }
          }
          
          // Validate and assign orders with new array reference to trigger change detection
          if (ordersData.length > 0) {
            // Create new array reference to trigger change detection
            this.orders = [...ordersData];
            
            // Sort by date (newest first)
            this.orders.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            
            this.errorMessage = null;
            console.log('✅ Orders loaded successfully:', this.orders.length);
            console.log('✅ Orders data:', this.orders);
            
            // Force change detection
            setTimeout(() => {
              this.cdr.detectChanges();
              console.log('🔄 Change detection triggered');
            }, 0);
          } else {
            // Check if there's an error message
            if (response && response.message) {
              this.errorMessage = response.message;
            } else if (response && response.error) {
              this.errorMessage = response.error;
            } else {
              this.errorMessage = null; // Don't show error if just no orders
            }
            this.orders = [];
            console.log('⚠️ No orders found. Error message:', this.errorMessage);
            
            // Force change detection
            this.cdr.detectChanges();
          }
        } catch (parseError: any) {
          console.error('❌ Error parsing response:', parseError);
          this.orders = [];
          this.errorMessage = 'Error processing orders data: ' + (parseError?.message || 'Unknown error');
          this.cdr.detectChanges();
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error loading orders:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        
        if (error.status === 401) {
          this.errorMessage = 'Please login to view your orders';
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.errorMessage = 'No orders found';
          this.orders = [];
        } else {
          // Try to extract error message from different possible locations
          const errorMsg = error.error?.message || 
                          error.error?.error || 
                          error.message || 
                          'An error occurred while loading orders';
          this.errorMessage = errorMsg;
          this.orders = [];
        }
        this.cdr.detectChanges();
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

  formatPrice(price: number): string {
    return this.settingsService.formatPrice(price);
  }

  viewOrderDetails(orderId: string) {
    const order = this.orders.find(o => o._id === orderId);
    if (order) {
      this.selectedOrder = order;
      this.showDetailsModal = true;
    }
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  getProductCount(order: Order): number {
    if (!order.products || !Array.isArray(order.products)) {
      return 0;
    }
    return order.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  }

  getOrderId(order: Order): string {
    if (!order._id) {
      return 'N/A';
    }
    return order._id.slice(-8).toUpperCase();
  }

  getOrderProducts(order: Order): OrderProduct[] {
    if (!order.products || !Array.isArray(order.products)) {
      return [];
    }
    return order.products;
  }

  trackByOrderId(index: number, order: Order): string {
    return order?._id || index.toString();
  }
}

