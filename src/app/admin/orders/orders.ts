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
    selectedOrder: any = null;
    showDetailsModal = false;
    userCache: { [key: number]: any } = {};  // Cache for user data

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
                            // Direct extraction - backend returns { success: true, data: [], pagination: {} }
                            let ordersData: any[] = [];
                            
                            if (response) {
                                if (Array.isArray(response)) {
                                    // Response is directly an array (unlikely but handle it)
                                    ordersData = response;
                                } else if (response.data && Array.isArray(response.data)) {
                                    // Standard response structure
                                    ordersData = response.data;
                                } else if (response.data) {
                                    // Data exists but might not be array
                                    ordersData = [];
                                } else {
                                    ordersData = [];
                                }
                            } else {
                                ordersData = [];
                            }
                            
                            // Assign with new array reference to trigger change detection
                            this.orders = ordersData.length > 0 ? [...ordersData] : [];
                            
                            // Fetch user names for all orders
                            this.fetchUserNames();
                            
                            // Handle pagination
                            if (response && response.pagination) {
                                this.totalPages = response.pagination.totalPages || 1;
                                this.total = response.pagination.total || 0;
                            } else {
                                this.totalPages = 1;
                                this.total = ordersData.length;
                            }
                            
                            this.errorMessage = null;
                            
                            // Force change detection
                            setTimeout(() => {
                                this.cdr.detectChanges();
                            }, 0);
                            
                        } catch (parseError: any) {
                            this.orders = [];
                            this.errorMessage = 'Error processing response data: ' + (parseError?.message || 'Unknown error');
                        } finally {
                            this.loading = false;
                            this.cdr.detectChanges();
                        }
                    },
                    error: (error) => {
                        this.orders = [];
                        this.errorMessage = error.error?.message || error.message || 'Failed to load orders. Please check your connection and try again.';
                        this.loading = false;
                        this.cdr.detectChanges();
                    }
                });
        } catch (err) {
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

    // Fetch user names for all orders
    fetchUserNames() {
        const userIds = [...new Set(this.orders.map(order => order.user_id))];
        
        userIds.forEach(userId => {
            if (userId && !this.userCache[userId]) {
                this.adminService.getUserById(userId).subscribe({
                    next: (response) => {
                        if (response.success && response.data) {
                            this.userCache[userId] = response.data;
                            this.cdr.detectChanges();
                        }
                    },
                    error: (error) => {
                        // Silently fail, will show user ID
                    }
                });
            }
        });
    }

    getUserName(userId: number): string {
        return this.userCache[userId]?.name || `User #${userId}`;
    }

    getUserEmail(userId: number): string {
        return this.userCache[userId]?.email || 'N/A';
    }

    viewOrderDetails(order: any) {
        this.selectedOrder = order;
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
        this.selectedOrder = null;
    }

    getStatusClass(status: string): string {
        switch(status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'paid': return 'status-paid';
            case 'shipped': return 'status-shipped';
            default: return 'status-pending';
        }
    }
}

