import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent {
    isSidebarOpen = true;
    adminName = 'Admin User';
    adminEmail = 'admin@example.com';

    menuItems = [
        { label: 'Dashboard', icon: 'grid', route: '/admin' },
        { label: 'Users', icon: 'users', route: '/admin/users' },
        { label: 'Orders', icon: 'shopping-cart', route: '/admin/orders' },
        { label: 'Products', icon: 'box', route: '/admin/products' },
        { label: 'Blogs', icon: 'file-text', route: '/admin/blogs' },
        { label: 'Settings', icon: 'settings', route: '/admin/settings' }
    ];

    constructor(private authService: AuthService, private router: Router) {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.adminName = user.name;
            this.adminEmail = user.email;
        }
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
