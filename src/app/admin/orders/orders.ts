import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './orders.html',
    styleUrl: './orders.scss'
})
export class AdminOrdersComponent implements OnInit {
    orders: any[] = [];
    loading = false;
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;
    total = 0;
    statusFilter = '';
    errorMessage: string | null = null;

    constructor(
        private adminService: AdminService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        this.errorMessage = null;
        
        try {
            this.adminService.getOrders(this.currentPage, this.pageSize, this.statusFilter || undefined)
                .pipe(
                    timeout(30000), // 30 second timeout
                    catchError((error) => {
                        console.error('Request error:', error);
                        this.orders = [];
                        this.errorMessage = error.message || 'Request timed out or failed';
                        this.loading = false;
                        return of({ 
                            success: false, 
                            data: [], 
                            pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
                            message: error.message 
                        });
                    })
                )
                .subscribe({
                    next: (response: any) => {
                        try {
                            console.log('=== ORDERS RESPONSE DEBUG ===');
                            console.log('Full response:', response);
                            console.log('Response type:', typeof response);
                            console.log('Is array?', Array.isArray(response));
                            
                            if (response) {
                                console.log('Response keys:', Object.keys(response));
                                console.log('response.success:', response.success);
                                console.log('response.data:', response.data);
                                console.log('response.pagination:', response.pagination);
                            }
                            
                            // Direct extraction - backend returns { success: true, data: [], pagination: {} }
                            let ordersData: any[] = [];
                            
                            if (response) {
                                if (Array.isArray(response)) {
                                    // Response is directly an array (unlikely but handle it)
                                    ordersData = response;
                                    console.log('Response is direct array, length:', ordersData.length);
                                } else if (response.data && Array.isArray(response.data)) {
                                    // Standard response structure
                                    ordersData = response.data;
                                    console.log('Extracted from response.data, length:', ordersData.length);
                                } else if (response.data) {
                                    // Data exists but might not be array
                                    console.warn('response.data exists but is not an array:', typeof response.data, response.data);
                                    ordersData = [];
                                } else {
                                    console.warn('No data field in response');
                                    ordersData = [];
                                }
                            } else {
                                console.warn('Response is null or undefined');
                                ordersData = [];
                            }
                            
                            console.log('=== FINAL PROCESSED DATA ===');
                            console.log('Orders data:', ordersData);
                            console.log('Orders count:', ordersData.length);
                            
                            // Assign with new array reference to trigger change detection
                            this.orders = ordersData.length > 0 ? [...ordersData] : [];
                            
                            console.log('Component orders assigned, length:', this.orders.length);
                            
                            // Handle pagination
                            if (response && response.pagination) {
                                this.totalPages = response.pagination.totalPages || 1;
                                this.total = response.pagination.total || 0;
                                console.log('Pagination - totalPages:', this.totalPages, 'total:', this.total);
                            } else {
                                this.totalPages = 1;
                                this.total = ordersData.length;
                                console.log('No pagination, using data length:', this.total);
                            }
                            
                            this.errorMessage = null;
                            
                            // Force change detection
                            setTimeout(() => {
                                this.cdr.detectChanges();
                                console.log('Change detection triggered, orders length:', this.orders.length);
                            }, 0);
                            
                        } catch (parseError: any) {
                            console.error('Error parsing response:', parseError);
                            console.error('Parse error details:', parseError?.message, parseError?.stack);
                            this.orders = [];
                            this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                        } finally {
                            this.loading = false;
                            this.cdr.detectChanges();
                            console.log('Loading set to false, final orders length:', this.orders.length);
                        }
                    },
                    error: (error) => {
                        console.error('Error loading orders:', error);
                        console.error('Error details:', {
                            status: error.status,
                            statusText: error.statusText,
                            message: error.message,
                            error: error.error
                        });
                        this.orders = [];
                        this.errorMessage = error.error?.message || error.message || 'Failed to load orders. Please check your connection and try again.';
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                });
        } catch (err) {
            console.error('Error in loadOrders:', err);
            this.orders = [];
            this.errorMessage = 'Failed to load orders';
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    filterByStatus(status: string) {
        this.statusFilter = status;
        this.currentPage = 1;
        this.loadOrders();
    }

    updateStatus(order: any, newStatus: string) {
        if (!confirm(`Change order status to ${newStatus}?`)) {
            return;
        }

        this.loading = true;
        this.adminService.updateOrderStatus(order._id, newStatus).subscribe({
            next: (response) => {
                if (response.success) {
                    this.loadOrders();
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error updating order status:', error);
                this.loading = false;
            }
        });
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadOrders();
        }
    }

    formatDate(date: string): string {
        if (!date) return '';
        return new Date(date).toLocaleString();
    }

    getOrderTotal(order: any): string {
        return `$${order.orderTotal?.toFixed(2) || '0.00'}`;
    }

    getProductCount(order: any): number {
        return order.products?.length || 0;
    }

    trackByOrderId(index: number, order: any): any {
        return order ? order._id : index;
    }
}

