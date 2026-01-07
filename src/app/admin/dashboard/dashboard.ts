import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { AdminService, DashboardStats } from '../../services/admin.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
    loading = true;
    stats: any[] = [];
    dashboardData: DashboardStats | null = null;

    constructor(
        private adminService: AdminService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.loading = true;
        
        this.adminService.getDashboardStats().subscribe({
            next: (response) => {
                try {
                    if (response && response.success && response.data) {
                        this.dashboardData = response.data;
                        this.updateStats();
                        this.updateCharts();
                    } else {
                        alert('Dashboard API returned invalid response');
                    }
                } catch (err: any) {
                    alert('Error processing dashboard data: ' + err.message);
                } finally {
                    this.loading = false;
                    
                    // Force change detection
                    setTimeout(() => {
                        this.cdr.detectChanges();
                    }, 0);
                }
            },
            error: (error) => {
                this.loading = false;
                const errorMsg = error.error?.message || error.message || 'Unknown error';
                alert('Failed to load dashboard data: ' + errorMsg);
            }
        });
    }

    updateStats() {
        if (!this.dashboardData) return;
        
        this.stats = [
            { 
                title: 'Total Users', 
                value: this.dashboardData.users.total.toString(), 
                change: `Admins: ${this.dashboardData.users.admins}`, 
                icon: 'users', 
                color: 'blue' 
            },
            { 
                title: 'Total Products', 
                value: this.dashboardData.products.total.toString(), 
                change: '', 
                icon: 'box', 
                color: 'green' 
            },
            { 
                title: 'Total Orders', 
                value: this.dashboardData.orders.total.toString(), 
                change: `Pending: ${this.dashboardData.orders.pending}`, 
                icon: 'shopping-cart', 
                color: 'purple' 
            },
            { 
                title: 'Revenue', 
                value: `$${this.dashboardData.revenue.total.toLocaleString()}`, 
                change: '', 
                icon: 'dollar-sign', 
                color: 'orange' 
            }
        ];
    }

    // Revenue Chart Configuration
    public revenueChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a202c',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    public revenueChartData: ChartData<'bar'> = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: '#667eea',
                borderRadius: 4,
                hoverBackgroundColor: '#5a67d8'
            }
        ]
    };

    // User Growth Chart Configuration
    public userChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: { tension: 0.4 }
        },
        plugins: { legend: { display: false } },
        scales: {
            y: { display: false },
            x: { display: false }
        }
    };

    public userChartData: ChartData<'line'> = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                data: [12, 19, 3, 5, 2, 3, 10],
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 4
            }
        ]
    };

    recentOrders: any[] = [];

    updateCharts() {
        if (!this.dashboardData) return;
        
        // Update revenue chart with real data
        if (this.dashboardData.revenue.byMonth && this.dashboardData.revenue.byMonth.length > 0) {
            this.revenueChartData = {
                labels: this.dashboardData.revenue.byMonth.map(item => item.month),
                datasets: [
                    {
                        data: this.dashboardData.revenue.byMonth.map(item => item.revenue),
                        backgroundColor: '#667eea',
                        borderRadius: 4,
                        hoverBackgroundColor: '#5a67d8'
                    }
                ]
            };
        }
        
        // Update user growth chart with real data
        if (this.dashboardData.userGrowth && this.dashboardData.userGrowth.length > 0) {
            this.userChartData = {
                labels: this.dashboardData.userGrowth.map(item => item.day),
                datasets: [
                    {
                        data: this.dashboardData.userGrowth.map(item => item.users),
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72, 187, 120, 0.1)',
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }
                ]
            };
        }
    }

    getRecentOrders() {
        // Return empty array if dashboardData is null or recentOrders is not an array
        if (!this.dashboardData) {
            return [];
        }
        
        if (!this.dashboardData.recentOrders) {
            return [];
        }
        
        if (!Array.isArray(this.dashboardData.recentOrders)) {
            return [];
        }
        
        return this.dashboardData.recentOrders;
    }

    formatDate(date: string): string {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString();
    }

    getOrderTotal(order: any): string {
        return `$${order.orderTotal?.toFixed(2) || '0.00'}`;
    }

    trackByOrderId(index: number, order: any): any {
        return order?._id || index;
    }
}
