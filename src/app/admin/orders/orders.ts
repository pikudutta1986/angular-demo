import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

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

    constructor(private adminService: AdminService) {}

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        this.adminService.getOrders(this.currentPage, this.pageSize, this.statusFilter || undefined)
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.orders = response.data;
                        if (response.pagination) {
                            this.totalPages = response.pagination.totalPages;
                            this.total = response.pagination.total;
                        }
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading orders:', error);
                    this.loading = false;
                }
            });
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
}

